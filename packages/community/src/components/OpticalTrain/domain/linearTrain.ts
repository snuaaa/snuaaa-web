import { evaluateMountSpec } from './mountSpec';
import {
  EvaluatedJoin,
  EvaluatedPlane,
  EvaluatedTrainItem,
  GeometryStatus,
  JoinPredicate,
  LinearTrainEvaluation,
  LinearTrainItem,
  MountPort,
  PortJoinEvaluation,
  PortPairEvaluation,
  ReachabilityStatus,
  TrainStatus,
} from './types';

function isSupportedSexPair(
  leftSex: string,
  rightSex: string,
): boolean | undefined {
  const left = leftSex.toLowerCase();
  const right = rightSex.toLowerCase();
  const supported = ['m', 'f'];

  if (!supported.includes(left) || !supported.includes(right)) {
    return undefined;
  }

  return (left === 'm') !== (right === 'm');
}

function isFiniteNonnegative(value: number): boolean {
  return Number.isFinite(value) && value >= 0;
}

export function evaluatePortJoin(
  leftPort: MountPort | undefined,
  rightPort: MountPort | undefined,
  separation_mm = 0,
): PortJoinEvaluation {
  if (!leftPort || !rightPort) {
    return {
      status: 'unverified',
      failedPredicates: [],
      leftPort,
      rightPort,
    };
  }

  const failedPredicates: JoinPredicate[] = [];
  let isUnverified = false;
  let joinKind: 'thread' | 'slip' | undefined;

  if (!leftPort.kind || !rightPort.kind) {
    isUnverified = true;
  } else if (leftPort.kind !== rightPort.kind) {
    failedPredicates.push('kind');
  } else if (leftPort.kind === 'thread' || leftPort.kind === 'slip') {
    joinKind = leftPort.kind;
  } else {
    failedPredicates.push('kind');
  }

  if (!leftPort.std || !rightPort.std) {
    isUnverified = true;
  } else if (leftPort.std !== rightPort.std) {
    failedPredicates.push('std');
  } else if (
    joinKind === 'slip' &&
    leftPort.std !== '1.25in' &&
    leftPort.std !== '2in'
  ) {
    failedPredicates.push('std');
  }

  if (!leftPort.sex || !rightPort.sex) {
    isUnverified = true;
  } else {
    const sexPair = isSupportedSexPair(leftPort.sex, rightPort.sex);
    if (sexPair === undefined) {
      isUnverified = true;
    } else if (!sexPair) {
      failedPredicates.push('sex');
    }
  }

  if (!leftPort.facing || !rightPort.facing) {
    isUnverified = true;
  } else if (leftPort.facing !== '+' || rightPort.facing !== '-') {
    failedPredicates.push('facing');
  }

  if (joinKind === 'slip' && !isFiniteNonnegative(separation_mm)) {
    failedPredicates.push('separation');
  }

  if (failedPredicates.length > 0) {
    return {
      status: 'incompatible',
      failedPredicates,
      leftPort,
      rightPort,
      separation_mm: joinKind === 'slip' ? separation_mm : undefined,
    };
  }

  if (isUnverified || !joinKind) {
    return {
      status: 'unverified',
      failedPredicates,
      leftPort,
      rightPort,
      separation_mm: joinKind === 'slip' ? separation_mm : undefined,
    };
  }

  return {
    status: 'compatible',
    failedPredicates,
    leftPort,
    rightPort,
    separation_mm: joinKind === 'slip' ? separation_mm : undefined,
  };
}

export function findPortPairs(
  leftMountSpec: unknown,
  rightMountSpec: unknown,
  leftFlipped = false,
  rightFlipped = false,
  separation_mm = 0,
): readonly PortPairEvaluation[] {
  const left = evaluateMountSpec(leftMountSpec, leftFlipped);
  const right = evaluateMountSpec(rightMountSpec, rightFlipped);

  return Object.entries(left.ports).flatMap(([leftPortKey, leftPort]) =>
    Object.entries(right.ports).map(([rightPortKey, rightPort]) => ({
      ...evaluatePortJoin(leftPort, rightPort, separation_mm),
      leftPortKey,
      rightPortKey,
    })),
  );
}

export function getJoinKey(leftItemId: string, rightItemId: string): string {
  return `${leftItemId}:${rightItemId}`;
}

function coordinatePort(
  origin_mm: number | undefined,
  port: MountPort | undefined,
): number | undefined {
  if (origin_mm === undefined || port?.z_mm === undefined) {
    return undefined;
  }
  return origin_mm + port.z_mm;
}

function deriveTrainStatus(joins: readonly EvaluatedJoin[]): TrainStatus {
  if (joins.length === 0) {
    return 'incomplete';
  }
  if (joins.some((join) => join.status === 'incompatible')) {
    return 'incompatible';
  }
  if (joins.some((join) => join.status === 'unverified')) {
    return 'unverified';
  }
  return 'compatible';
}

function deriveReachability(
  focus: LinearTrainEvaluation['focus'],
  terminal: LinearTrainEvaluation['terminal'],
): ReachabilityStatus {
  if (!focus || !terminal) {
    return 'unknown';
  }
  return terminal.z_mm >= focus.min_mm && terminal.z_mm <= focus.max_mm
    ? 'reachable'
    : 'out_of_range';
}

export function evaluateLinearTrain(
  items: readonly LinearTrainItem[],
  separationByJoin: Readonly<Record<string, number | undefined>> = {},
): LinearTrainEvaluation {
  const evaluatedItems: EvaluatedTrainItem[] = items.map((item) => {
    const mountSpec = evaluateMountSpec(item.mountSpec, item.flipped);
    return {
      id: item.id,
      mountSpec,
      ports: mountSpec.ports,
      planes: mountSpec.planes,
      focus: mountSpec.focus,
    };
  });

  const firstItem = evaluatedItems[0];
  const firstInput = items[0];
  const firstOutput = firstItem?.ports[firstInput?.outgoingPortKey ?? ''];
  if (firstItem && firstOutput?.z_mm !== undefined) {
    firstItem.origin_mm = -firstOutput.z_mm;
  }

  const joins: EvaluatedJoin[] = [];
  for (let index = 0; index < evaluatedItems.length - 1; index += 1) {
    const leftItem = evaluatedItems[index];
    const rightItem = evaluatedItems[index + 1];
    const leftInput = items[index];
    const rightInput = items[index + 1];
    const key = getJoinKey(leftItem.id, rightItem.id);
    const separation_mm = separationByJoin[key] ?? 0;
    const leftPort = leftItem.ports[leftInput.outgoingPortKey ?? ''];
    const rightPort = rightItem.ports[rightInput.incomingPortKey ?? ''];
    const evaluation = evaluatePortJoin(leftPort, rightPort, separation_mm);
    const leftDatum_mm = coordinatePort(leftItem.origin_mm, leftPort);
    const gap_mm = evaluation.separation_mm ?? 0;

    if (
      evaluation.status === 'compatible' &&
      leftDatum_mm !== undefined &&
      rightPort?.z_mm !== undefined
    ) {
      rightItem.origin_mm = leftDatum_mm + gap_mm - rightPort.z_mm;
    }

    joins.push({
      ...evaluation,
      key,
      leftItemId: leftItem.id,
      rightItemId: rightItem.id,
      leftPortKey: leftInput.outgoingPortKey,
      rightPortKey: rightInput.incomingPortKey,
      leftDatum_mm,
      rightDatum_mm: coordinatePort(rightItem.origin_mm, rightPort),
    });
  }

  const focus =
    firstItem?.focus && firstItem.origin_mm !== undefined
      ? {
          min_mm: firstItem.origin_mm + firstItem.focus.min_mm,
          max_mm: firstItem.origin_mm + firstItem.focus.max_mm,
        }
      : undefined;
  const lastItem = evaluatedItems[evaluatedItems.length - 1];
  const lastInput = items[items.length - 1];
  const terminalPlane = lastItem?.planes[lastInput?.terminalPlaneKey ?? ''];
  const terminal: EvaluatedPlane | undefined =
    terminalPlane && lastItem.origin_mm !== undefined
      ? { ...terminalPlane, z_mm: lastItem.origin_mm + terminalPlane.z_mm }
      : undefined;
  const terminalReachability = deriveReachability(focus, terminal);
  const geometryStatus: GeometryStatus =
    focus && terminal ? 'known' : 'unknown';

  return {
    status: deriveTrainStatus(joins),
    geometryStatus,
    items: evaluatedItems,
    joins,
    focus,
    terminal,
    terminalReachability,
  };
}
