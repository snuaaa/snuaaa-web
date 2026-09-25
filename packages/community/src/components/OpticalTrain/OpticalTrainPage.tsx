import { useCallback, useMemo } from 'react';
import BoardName from '~/components/Board/BoardName';
import { useEquipmentList } from '~/hooks/queries/useEquipmentQueries';
import { Equipment } from '~/services/types';
import {
  evaluateLinearTrain,
  evaluateMountSpec,
  JoinPredicate,
  LinearTrainEvaluation,
} from './domain';
import OpticalTrainDnd from './OpticalTrainDnd';
import RailEvaluation from './RailEvaluation';
import {
  EvaluateOpticalTrain,
  getJoinKey as getRailJoinKey,
  JoinSeparations,
  PortSelection,
  RailItem,
  TrainValidation,
  useOpticalTrainState,
} from './state';
import './OpticalTrain.scss';

type ResolvedRail = {
  evaluation: LinearTrainEvaluation;
  portSelections: Record<string, PortSelection>;
  blockedPredicates?: readonly JoinPredicate[];
};

const portSelectionsFor = (
  item: RailItem,
  position: number,
  length: number,
  equipment: Equipment | undefined,
): PortSelection[] => {
  const portKeys = Object.keys(
    evaluateMountSpec(equipment?.mount_spec, item.flipped).ports,
  );
  const incomingKeys = item.incomingPortKey ? [item.incomingPortKey] : portKeys;
  const outgoingKeys = item.outgoingPortKey ? [item.outgoingPortKey] : portKeys;
  if (position === 0) {
    return outgoingKeys.map((outgoingPortKey) => ({ outgoingPortKey }));
  }

  if (position === length - 1) {
    return incomingKeys.map((incomingPortKey) => ({ incomingPortKey }));
  }

  return incomingKeys.flatMap((incomingPortKey) =>
    outgoingKeys
      .filter((outgoingPortKey) => outgoingPortKey !== incomingPortKey)
      .map((outgoingPortKey) => ({ incomingPortKey, outgoingPortKey })),
  );
};

const resolveRail = (
  railItems: RailItem[],
  separationMmByJoinKey: JoinSeparations,
  equipmentById: ReadonlyMap<number, Equipment>,
): ResolvedRail => {
  if (railItems.length === 1 && railItems[0].type === 'tube') {
    const evaluation = evaluateLinearTrain([
      {
        id: railItems[0].railItemId,
        mountSpec: equipmentById.get(railItems[0].equipmentId)?.mount_spec,
        flipped: railItems[0].flipped,
      },
    ]);
    return { evaluation, portSelections: {} };
  }

  const selectionSets = railItems.map((item, index) =>
    portSelectionsFor(
      item,
      index,
      railItems.length,
      equipmentById.get(item.equipmentId),
    ),
  );
  const candidateSelections: Record<string, PortSelection>[] = [];

  const collectSelections = (
    index: number,
    selections: Record<string, PortSelection>,
  ) => {
    if (index === railItems.length) {
      candidateSelections.push(selections);
      return;
    }

    selectionSets[index].forEach((selection) =>
      collectSelections(index + 1, {
        ...selections,
        [railItems[index].railItemId]: selection,
      }),
    );
  };

  collectSelections(0, {});
  const withTerminalPlane = (portSelections: Record<string, PortSelection>) => {
    const terminal = railItems[railItems.length - 1];
    const terminalEquipment =
      terminal && equipmentById.get(terminal.equipmentId);
    const terminalPlaneKey =
      terminal?.terminalPlaneKey ??
      Object.keys(
        evaluateMountSpec(terminalEquipment?.mount_spec, terminal?.flipped)
          .planes,
      )[0];

    if (!terminal || terminal.type !== 'terminal' || !terminalPlaneKey) {
      return portSelections;
    }

    return {
      ...portSelections,
      [terminal.railItemId]: {
        ...portSelections[terminal.railItemId],
        terminalPlaneKey,
      },
    };
  };
  const evaluateSelections = (
    portSelections: Record<string, PortSelection>,
  ) => {
    const evaluation = evaluateLinearTrain(
      railItems.map((item) => ({
        id: item.railItemId,
        mountSpec: equipmentById.get(item.equipmentId)?.mount_spec,
        flipped: item.flipped,
        ...portSelections[item.railItemId],
      })),
      Object.fromEntries(
        railItems
          .slice(1)
          .map((item, index) => [
            `${railItems[index].railItemId}:${item.railItemId}`,
            separationMmByJoinKey[
              getRailJoinKey(railItems[index].railItemId, item.railItemId)
            ],
          ]),
      ),
    );
    return { evaluation, portSelections };
  };
  const evaluatedCandidates = (
    candidateSelections.length > 0 ? candidateSelections : [{}]
  ).map((portSelections) =>
    evaluateSelections(withTerminalPlane(portSelections)),
  );
  const compatibleCandidates = evaluatedCandidates.filter(
    ({ evaluation }) => evaluation.status === 'compatible',
  );
  const currentSelections = Object.fromEntries(
    railItems.map((item) => [
      item.railItemId,
      {
        incomingPortKey: item.incomingPortKey,
        outgoingPortKey: item.outgoingPortKey,
        terminalPlaneKey: item.terminalPlaneKey,
      },
    ]),
  );

  if (compatibleCandidates.length === 1) {
    return compatibleCandidates[0];
  }

  if (compatibleCandidates.length > 1) {
    return {
      evaluation: evaluateSelections(withTerminalPlane(currentSelections))
        .evaluation,
      portSelections: {},
    };
  }

  if (
    evaluatedCandidates.some(
      ({ evaluation }) => evaluation.status === 'unverified',
    )
  ) {
    return {
      evaluation: evaluateSelections(withTerminalPlane(currentSelections))
        .evaluation,
      portSelections: {},
    };
  }

  return {
    evaluation: evaluateSelections(withTerminalPlane(currentSelections))
      .evaluation,
    portSelections: {},
    blockedPredicates: Array.from(
      new Set(
        evaluatedCandidates.flatMap(({ evaluation }) =>
          evaluation.joins.flatMap((join) => join.failedPredicates),
        ),
      ),
    ),
  };
};

const validationFor = (resolvedRail: ResolvedRail): TrainValidation => {
  if (resolvedRail.blockedPredicates) {
    const failedPredicates =
      resolvedRail.blockedPredicates?.join(', ') ?? 'unknown';
    return {
      status: 'blocked',
      blockedPlacementMessage: `결합 불가: ${failedPredicates}.`,
    };
  }

  return {
    status:
      resolvedRail.evaluation.status === 'compatible' ? 'valid' : 'unverified',
    portSelections: resolvedRail.portSelections,
  };
};

const OpticalTrainPage = () => {
  const equipmentQuery = useEquipmentList();
  const equipmentById = useMemo(
    () =>
      new Map(
        (equipmentQuery.data?.equipInfo ?? []).map((item) => [item.id, item]),
      ),
    [equipmentQuery.data],
  );
  const evaluateTrain = useCallback<EvaluateOpticalTrain>(
    (candidate) =>
      validationFor(
        resolveRail(
          candidate.railItems,
          candidate.separationMmByJoinKey,
          equipmentById,
        ),
      ),
    [equipmentById],
  );
  const train = useOpticalTrainState({ evaluateTrain });
  const evaluation = useMemo(
    () =>
      resolveRail(train.railItems, train.separationMmByJoinKey, equipmentById)
        .evaluation,
    [equipmentById, train.railItems, train.separationMmByJoinKey],
  );

  return (
    <div className="board-wrapper">
      <BoardName board_id={undefined} board_name="광학계 조립기" />
      <main className="optical-train" aria-label="광학계 조립기">
        <OpticalTrainDnd
          train={{ ...train, equipmentById }}
          evaluation={evaluation}
        />
        <RailEvaluation evaluation={evaluation} />
      </main>
    </div>
  );
};

export default OpticalTrainPage;
