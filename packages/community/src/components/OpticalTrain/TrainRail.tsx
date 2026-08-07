import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  SortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChangeEvent } from 'react';
import { Equipment } from '~/services/types';
import {
  evaluateMountSpec,
  evaluatePortJoin,
  LinearTrainEvaluation,
} from './domain';
import RailSchematic from './RailSchematic';
import { getJoinKey, RailItem } from './state';

export type OpticalTrainRailState = {
  railItems: RailItem[];
  separationMmByJoinKey: Record<string, number>;
  validationStatus: 'empty' | 'valid' | 'unverified';
  blockedPlacementMessage?: string;
  hasTube: boolean;
  equipmentById?: ReadonlyMap<number, Equipment>;
  selectTube: (equipmentId: number) => void;
  insert: (
    item: { equipmentId: number; type: 'adapter' | 'terminal' },
    insertIndex?: number,
  ) => void;
  reorder: (railItemId: string, destinationIndex: number) => void;
  flip: (railItemId: string) => void;
  choosePorts: (
    railItemId: string,
    selection: { incomingPortKey?: string; outgoingPortKey?: string },
  ) => void;
  setSeparation: (joinKey: string, separationMm: number) => void;
  removeNonTube: (railItemId: string) => void;
};

type TrainRailProps = {
  train: OpticalTrainRailState;
  evaluation: LinearTrainEvaluation;
  sortingStrategy: SortingStrategy;
};

const itemTypeLabel = {
  tube: '시작 장비',
  adapter: '연결 장비',
  terminal: '연결 장비',
} as const;

const portLabel = (key: string) => key;

const SlipSeparation = ({
  left,
  right,
  train,
}: {
  left: RailItem;
  right: RailItem;
  train: OpticalTrainRailState;
}) => {
  const leftEquipment = train.equipmentById?.get(left.equipmentId);
  const rightEquipment = train.equipmentById?.get(right.equipmentId);
  const leftPort = evaluateMountSpec(leftEquipment?.mount_spec, left.flipped)
    .ports[left.outgoingPortKey ?? ''];
  const rightPort = evaluateMountSpec(rightEquipment?.mount_spec, right.flipped)
    .ports[right.incomingPortKey ?? ''];
  const joinKey = getJoinKey(left.railItemId, right.railItemId);
  const separationMm = train.separationMmByJoinKey[joinKey] ?? 0;
  const evaluation = evaluatePortJoin(leftPort, rightPort, separationMm);
  const isSlipJoin =
    evaluation.status === 'compatible' &&
    leftPort?.kind === 'slip' &&
    (leftPort.std === '1.25in' || leftPort.std === '2in');

  if (!isSlipJoin) {
    return null;
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    if (Number.isFinite(value)) {
      train.setSeparation(joinKey, value);
    }
  };

  return (
    <label className="optical-train__rail-label flex shrink-0 flex-col gap-1 border-y px-2 py-2 text-xs">
      <span>{leftPort.std} 슬립 분리 거리 (mm)</span>
      <input
        type="number"
        min="0"
        step="0.1"
        value={separationMm}
        onChange={handleChange}
        className="optical-train__control w-24 px-2 py-1"
      />
    </label>
  );
};

const SortableRailItem = ({
  item,
  equipment,
  train,
  index,
  totalItems,
}: {
  item: RailItem;
  equipment: Equipment | undefined;
  train: OpticalTrainRailState;
  index: number;
  totalItems: number;
}) => {
  const isFixed = item.type === 'tube' || item.type === 'terminal';
  const {
    attributes,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.railItemId, disabled: isFixed });
  const ports = evaluateMountSpec(equipment?.mount_spec, item.flipped).ports;
  const portKeys = Object.keys(ports);
  const canChooseIncomingPort = index > 0 && portKeys.length > 1;
  const canChooseOutgoingPort = index < totalItems - 1 && portKeys.length > 1;
  const showPortSelectors = canChooseIncomingPort || canChooseOutgoingPort;

  const chooseIncomingPort = (incomingPortKey: string) => {
    train.choosePorts(item.railItemId, {
      incomingPortKey: incomingPortKey || undefined,
      outgoingPortKey: item.outgoingPortKey,
    });
  };

  const chooseOutgoingPort = (outgoingPortKey: string) => {
    train.choosePorts(item.railItemId, {
      incomingPortKey: item.incomingPortKey,
      outgoingPortKey: outgoingPortKey || undefined,
    });
  };

  return (
    <article
      ref={setNodeRef}
      className="optical-train__rail-card w-56 shrink-0 p-3 shadow-sm"
      style={{
        opacity: isDragging ? 0.35 : undefined,
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="optical-train__rail-label block text-xs font-bold tracking-wide">
            {itemTypeLabel[item.type]}
          </span>
          <strong className="block">
            {equipment?.name ?? `장비 #${item.equipmentId}`}
          </strong>
        </div>
        {!isFixed && (
          <button
            type="button"
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            className="optical-train__control px-2 py-1 text-xs"
            aria-label={`${equipment?.name ?? '구성품'} 순서 변경`}
          >
            이동
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => train.flip(item.railItemId)}
          className="optical-train__control optical-train__rail-flip px-2 py-1 text-xs font-bold transition"
        >
          180° 뒤집기{item.flipped ? ' (적용됨)' : ''}
        </button>
        {item.type !== 'tube' && (
          <button
            type="button"
            onClick={() => train.removeNonTube(item.railItemId)}
            className="optical-train__control optical-train__rail-destructive px-2 py-1 text-xs font-bold"
          >
            제거
          </button>
        )}
      </div>

      {showPortSelectors && (
        <fieldset className="optical-train__rail-port-selection mt-3 grid gap-2 border-t pt-3 text-xs">
          <legend className="optical-train__rail-label font-bold">
            결합 포트 선택
          </legend>
          {canChooseIncomingPort && (
            <label className="grid gap-1">
              <span>입력</span>
              <select
                value={item.incomingPortKey ?? ''}
                onChange={(event) => chooseIncomingPort(event.target.value)}
                className="optical-train__control px-2 py-1"
              >
                <option value="">선택 안 함</option>
                {portKeys.map((key) => (
                  <option
                    key={key}
                    value={key}
                    disabled={key === item.outgoingPortKey}
                  >
                    {portLabel(key)}
                  </option>
                ))}
              </select>
            </label>
          )}
          {canChooseOutgoingPort && (
            <label className="grid gap-1">
              <span>출력</span>
              <select
                value={item.outgoingPortKey ?? ''}
                onChange={(event) => chooseOutgoingPort(event.target.value)}
                className="optical-train__control px-2 py-1"
              >
                <option value="">선택 안 함</option>
                {portKeys.map((key) => (
                  <option
                    key={key}
                    value={key}
                    disabled={key === item.incomingPortKey}
                  >
                    {portLabel(key)}
                  </option>
                ))}
              </select>
            </label>
          )}
        </fieldset>
      )}
    </article>
  );
};

const TrainRail = ({ train, evaluation, sortingStrategy }: TrainRailProps) => {
  const { setNodeRef, isOver } = useDroppable({ id: 'rail-drop-zone' });
  const hasTerminal = train.railItems.some((item) => item.type === 'terminal');
  const statusLabel = !hasTerminal
    ? '미완성'
    : train.validationStatus === 'valid'
      ? '결합 가능'
      : '확인 필요';

  return (
    <div role="region" className="mt-6" aria-labelledby="rail-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 id="rail-title" className="mb-2 text-base font-bold">
          3. 광학계 레일
        </h3>
        <span
          className={`optical-train__status-badge optical-train__status-badge--${hasTerminal && train.validationStatus === 'valid' ? 'compatible' : 'unverified'} px-2 py-1 text-sm font-bold`}
        >
          {statusLabel}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`optical-train__drop-zone mt-4 border border-dashed p-3 ${isOver ? 'optical-train__drop-zone--active' : ''}`}
      >
        {train.railItems.length === 0 ? (
          <p className="optical-train__rail-empty py-12 text-center text-sm">
            장비를 이 도면으로 끌어 놓으세요.
          </p>
        ) : (
          <RailSchematic evaluation={evaluation} railItems={train.railItems} />
        )}
      </div>
      {train.railItems.length > 0 && (
        <div className="mt-3 overflow-x-auto" aria-label="광학계 구성 제어">
          <div className="flex min-w-max items-stretch gap-3 pb-1">
            <SortableContext
              items={train.railItems.map((item) => item.railItemId)}
              strategy={sortingStrategy}
            >
              {train.railItems.map((item, index) => (
                <div key={item.railItemId} className="flex items-stretch gap-3">
                  {index > 0 && (
                    <SlipSeparation
                      left={train.railItems[index - 1]}
                      right={item}
                      train={train}
                    />
                  )}
                  <SortableRailItem
                    item={item}
                    equipment={train.equipmentById?.get(item.equipmentId)}
                    train={train}
                    index={index}
                    totalItems={train.railItems.length}
                  />
                </div>
              ))}
            </SortableContext>
          </div>
        </div>
      )}
      {!hasTerminal && train.railItems.length > 0 && (
        <p className="optical-train__status-message mt-3 text-sm" role="status">
          연결할 장비를 추가하세요.
        </p>
      )}
    </div>
  );
};

export default TrainRail;
