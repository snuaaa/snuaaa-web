import { useCallback, useRef, useState } from 'react';

export type RailItemType = 'tube' | 'adapter' | 'terminal';

export type RailItem = {
  railItemId: string;
  equipmentId: number;
  type: RailItemType;
  flipped: boolean;
  incomingPortKey?: string;
  outgoingPortKey?: string;
  terminalPlaneKey?: string;
};

export type RailItemInput = Pick<RailItem, 'equipmentId' | 'type'>;

export type JoinSeparations = Record<string, number>;

export type TrainValidationStatus = 'empty' | 'valid' | 'unverified';

export type OpticalTrainState = {
  railItems: RailItem[];
  separationMmByJoinKey: JoinSeparations;
  validationStatus: TrainValidationStatus;
  blockedPlacementMessage?: string;
};

export type PortSelection = Pick<
  RailItem,
  'incomingPortKey' | 'outgoingPortKey' | 'terminalPlaneKey'
>;

export type TrainValidation = {
  status: 'valid' | 'unverified' | 'blocked';
  blockedPlacementMessage?: string;
  portSelections?: Record<string, PortSelection>;
};

export type EvaluateOpticalTrain = (candidate: {
  railItems: RailItem[];
  separationMmByJoinKey: JoinSeparations;
}) => TrainValidation;

export type UseOpticalTrainStateOptions = {
  evaluateTrain?: EvaluateOpticalTrain;
};

const unverifiedTrain: EvaluateOpticalTrain = () => ({ status: 'unverified' });

const initialState: OpticalTrainState = {
  railItems: [],
  separationMmByJoinKey: {},
  validationStatus: 'empty',
};

export const getJoinKey = (leftRailItemId: string, rightRailItemId: string) =>
  `${leftRailItemId}--${rightRailItemId}`;

const getActiveJoinKeys = (railItems: RailItem[]) =>
  new Set(
    railItems
      .slice(1)
      .map((item, index) =>
        getJoinKey(railItems[index].railItemId, item.railItemId),
      ),
  );

const clearOrphanedSeparations = (
  railItems: RailItem[],
  separationMmByJoinKey: JoinSeparations,
) => {
  const activeJoinKeys = getActiveJoinKeys(railItems);

  return Object.fromEntries(
    Object.entries(separationMmByJoinKey).filter(([joinKey]) =>
      activeJoinKeys.has(joinKey),
    ),
  );
};

const applyPortSelections = (
  railItems: RailItem[],
  portSelections: Record<string, PortSelection> | undefined,
) => {
  if (!portSelections) {
    return railItems;
  }

  return railItems.map((item) => {
    const selection = portSelections[item.railItemId];
    return selection ? { ...item, ...selection } : item;
  });
};

const findTerminalIndex = (railItems: RailItem[]) =>
  railItems.findIndex((item) => item.type === 'terminal');

export function useOpticalTrainState({
  evaluateTrain = unverifiedTrain,
}: UseOpticalTrainStateOptions = {}) {
  const [state, setState] = useState<OpticalTrainState>(initialState);
  const nextRailItemId = useRef(1);

  const commitCandidate = useCallback(
    (previous: OpticalTrainState, candidate: OpticalTrainState) => {
      if (candidate.railItems.length === 0) {
        return initialState;
      }

      const separationMmByJoinKey = clearOrphanedSeparations(
        candidate.railItems,
        candidate.separationMmByJoinKey,
      );
      const evaluation = evaluateTrain({
        railItems: candidate.railItems,
        separationMmByJoinKey,
      });

      if (evaluation.status === 'blocked') {
        return {
          ...previous,
          blockedPlacementMessage:
            evaluation.blockedPlacementMessage ??
            '이 구성은 연결할 수 없습니다.',
        };
      }

      return {
        railItems: applyPortSelections(
          candidate.railItems,
          evaluation.portSelections,
        ),
        separationMmByJoinKey,
        validationStatus: evaluation.status,
      };
    },
    [evaluateTrain],
  );

  const replaceTube = useCallback(
    (equipmentId: number) => {
      const railItem: RailItem = {
        railItemId: `rail-item-${nextRailItemId.current++}`,
        equipmentId,
        type: 'tube',
        flipped: false,
      };

      setState((previous) =>
        commitCandidate(previous, {
          railItems: [railItem],
          separationMmByJoinKey: {},
          validationStatus: 'unverified',
        }),
      );
    },
    [commitCandidate],
  );

  const insert = useCallback(
    (item: RailItemInput, insertIndex?: number) => {
      setState((previous) => {
        if (previous.railItems.length === 0) {
          return {
            ...previous,
            blockedPlacementMessage: '먼저 경통을 선택해 주세요.',
          };
        }

        const railItem: RailItem = {
          railItemId: `rail-item-${nextRailItemId.current++}`,
          equipmentId: item.equipmentId,
          type: item.type,
          flipped: false,
        };
        const withoutTerminal = previous.railItems.filter(
          (existingItem) => existingItem.type !== 'terminal',
        );

        if (item.type === 'terminal') {
          return commitCandidate(previous, {
            railItems: [...withoutTerminal, railItem],
            separationMmByJoinKey: previous.separationMmByJoinKey,
            validationStatus: previous.validationStatus,
          });
        }

        if (item.type !== 'adapter') {
          return previous;
        }

        const terminalIndex = findTerminalIndex(previous.railItems);
        const maximumInsertIndex =
          terminalIndex === -1 ? previous.railItems.length : terminalIndex;
        const targetIndex = Math.min(
          Math.max(insertIndex ?? maximumInsertIndex, 1),
          maximumInsertIndex,
        );
        const railItems = [...previous.railItems];
        railItems.splice(targetIndex, 0, railItem);

        return commitCandidate(previous, {
          railItems,
          separationMmByJoinKey: previous.separationMmByJoinKey,
          validationStatus: previous.validationStatus,
        });
      });
    },
    [commitCandidate],
  );

  const reorder = useCallback(
    (railItemId: string, destinationIndex: number) => {
      setState((previous) => {
        const sourceIndex = previous.railItems.findIndex(
          (item) => item.railItemId === railItemId,
        );
        const item = previous.railItems[sourceIndex];

        if (sourceIndex <= 0 || !item) {
          return previous;
        }

        const terminalIndex = findTerminalIndex(previous.railItems);
        if (item.type === 'terminal') {
          return previous;
        }

        const maximumDestinationIndex =
          terminalIndex === -1
            ? previous.railItems.length - 1
            : terminalIndex - 1;
        const targetIndex = Math.min(
          Math.max(destinationIndex, 1),
          maximumDestinationIndex,
        );
        const railItems = previous.railItems.filter(
          (existingItem) => existingItem.railItemId !== railItemId,
        );
        railItems.splice(targetIndex, 0, item);

        return commitCandidate(previous, {
          railItems,
          separationMmByJoinKey: previous.separationMmByJoinKey,
          validationStatus: previous.validationStatus,
        });
      });
    },
    [commitCandidate],
  );

  const flip = useCallback(
    (railItemId: string) => {
      setState((previous) => {
        const railItems = previous.railItems.map((item) =>
          item.railItemId === railItemId
            ? { ...item, flipped: !item.flipped }
            : item,
        );

        return commitCandidate(previous, {
          railItems,
          separationMmByJoinKey: previous.separationMmByJoinKey,
          validationStatus: previous.validationStatus,
        });
      });
    },
    [commitCandidate],
  );

  const choosePorts = useCallback(
    (railItemId: string, selection: PortSelection) => {
      setState((previous) => {
        const item = previous.railItems.find(
          (railItem) => railItem.railItemId === railItemId,
        );
        if (!item) {
          return previous;
        }

        const nextSelection = { ...item, ...selection };
        if (
          nextSelection.incomingPortKey &&
          nextSelection.outgoingPortKey &&
          nextSelection.incomingPortKey === nextSelection.outgoingPortKey
        ) {
          return {
            ...previous,
            blockedPlacementMessage:
              '서로 다른 입력 및 출력 포트를 선택해 주세요.',
          };
        }

        return commitCandidate(previous, {
          railItems: previous.railItems.map((railItem) =>
            railItem.railItemId === railItemId
              ? { ...railItem, ...selection }
              : railItem,
          ),
          separationMmByJoinKey: previous.separationMmByJoinKey,
          validationStatus: previous.validationStatus,
        });
      });
    },
    [commitCandidate],
  );

  const setSeparation = useCallback(
    (joinKey: string, separationMm: number) => {
      setState((previous) => {
        if (
          !getActiveJoinKeys(previous.railItems).has(joinKey) ||
          !Number.isFinite(separationMm) ||
          separationMm < 0
        ) {
          return {
            ...previous,
            blockedPlacementMessage: '분리 거리는 0 이상의 숫자여야 합니다.',
          };
        }

        return commitCandidate(previous, {
          railItems: previous.railItems,
          separationMmByJoinKey: {
            ...previous.separationMmByJoinKey,
            [joinKey]: separationMm,
          },
          validationStatus: previous.validationStatus,
        });
      });
    },
    [commitCandidate],
  );

  const removeNonTube = useCallback(
    (railItemId: string) => {
      setState((previous) => {
        const item = previous.railItems.find(
          (railItem) => railItem.railItemId === railItemId,
        );
        if (!item || item.type === 'tube') {
          return previous;
        }

        return commitCandidate(previous, {
          railItems: previous.railItems.filter(
            (railItem) => railItem.railItemId !== railItemId,
          ),
          separationMmByJoinKey: previous.separationMmByJoinKey,
          validationStatus: previous.validationStatus,
        });
      });
    },
    [commitCandidate],
  );

  return {
    ...state,
    hasTube: state.railItems.length > 0,
    replaceTube,
    selectTube: replaceTube,
    insert,
    reorder,
    flip,
    choosePorts,
    setSeparation,
    removeNonTube,
  };
}
