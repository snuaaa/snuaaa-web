import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useDraggable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import {
  KeyboardEvent,
  MouseEvent,
  PointerEvent,
  useRef,
  useState,
} from 'react';
import EquipmentCutawayPreview from './EquipmentCutawayPreview';
import TrainRail, { OpticalTrainRailState } from './TrainRail';
import type { CatalogItem } from './TubeSelector';
import UnifiedEquipmentSearch from './UnifiedEquipmentSearch';
import type { LinearTrainEvaluation } from './domain';

type DraggableCatalogCardProps = {
  item: CatalogItem;
  add: () => void;
  disabled: boolean;
};

type ActiveDrag = {
  id: string;
  name: string;
};

const DraggableCatalogCard = ({
  item,
  add,
  disabled,
}: DraggableCatalogCardProps) => {
  const draggableId = `catalog-${item.type}-${item.equipment.id}`;
  const dragged = useRef(false);
  const pointerStart = useRef<{ x: number; y: number }>();
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: draggableId,
      data: {
        kind: 'catalog',
        equipmentId: item.equipment.id,
        type: item.type,
        name: item.equipment.name,
      },
      disabled,
    });
  const activate = () => {
    if (!disabled) {
      add();
    }
  };
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (dragged.current) {
      event.preventDefault();
      dragged.current = false;
      return;
    }

    activate();
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      activate();
    }
  };
  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    dragged.current = false;
    pointerStart.current = { x: event.clientX, y: event.clientY };
    listeners?.onPointerDown?.(event);
  };
  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const start = pointerStart.current;
    if (
      start &&
      Math.hypot(event.clientX - start.x, event.clientY - start.y) >= 8
    ) {
      dragged.current = true;
    }
  };

  return (
    <button
      type="button"
      ref={setNodeRef}
      {...(!disabled ? attributes : {})}
      {...(!disabled
        ? {
            ...listeners,
            onPointerDown: handlePointerDown,
            onPointerMove: handlePointerMove,
          }
        : {})}
      aria-disabled={disabled || undefined}
      aria-label={
        disabled ? `${item.equipment.name}, 사용할 수 없음` : undefined
      }
      disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="optical-train__catalog-result flex w-full items-center justify-between gap-4 px-3 py-2 text-left transition-colors disabled:cursor-not-allowed"
      style={{
        opacity: isDragging ? 0.45 : undefined,
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
      }}
    >
      <div className="optical-train__catalog-result-content grid min-w-0 gap-1">
        <div>
          <strong className="block wrap-break-word text-sm font-bold">
            {item.equipment.name}
          </strong>
          <span className="optical-train__catalog-category mt-1 block text-sm">
            {item.categoryName}
          </span>
        </div>
        <EquipmentCutawayPreview
          mountSpec={item.equipment.mount_spec}
          type={item.type}
          compact
        />
      </div>
    </button>
  );
};

export type OpticalTrainDndProps = {
  train: OpticalTrainRailState;
  evaluation: LinearTrainEvaluation;
};

const OpticalTrainDnd = ({ train, evaluation }: OpticalTrainDndProps) => {
  const [activeDrag, setActiveDrag] = useState<ActiveDrag>();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const placementMessage = train.blockedPlacementMessage;

  const handleDragStart = ({ active }: DragStartEvent) => {
    const data = active.data.current;
    const railItem = train.railItems.find(
      (item) => item.railItemId === active.id,
    );
    setActiveDrag({
      id: String(active.id),
      name: data?.name ?? railItem?.equipmentId.toString() ?? '구성품',
    });
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveDrag(undefined);
    if (!over) {
      return;
    }

    const catalogItem = active.data.current;
    if (catalogItem?.kind === 'catalog') {
      if (catalogItem.type === 'tube') {
        train.selectTube(catalogItem.equipmentId as number);
        return;
      }

      const overIndex = train.railItems.findIndex(
        (item) => item.railItemId === over.id,
      );
      train.insert(
        {
          equipmentId: catalogItem.equipmentId as number,
          type: catalogItem.type as 'adapter' | 'terminal',
        },
        overIndex === -1 ? undefined : overIndex,
      );
      return;
    }

    const sourceIndex = train.railItems.findIndex(
      (item) => item.railItemId === active.id,
    );
    const overIndex = train.railItems.findIndex(
      (item) => item.railItemId === over.id,
    );
    if (sourceIndex === -1 || sourceIndex === overIndex) {
      return;
    }

    const reorderedItems = arrayMove(
      train.railItems,
      sourceIndex,
      overIndex === -1 ? train.railItems.length - 1 : overIndex,
    );
    train.reorder(
      String(active.id),
      reorderedItems.findIndex((item) => item.railItemId === active.id),
    );
  };

  return (
    <DndContext
      accessibility={{
        screenReaderInstructions: {
          draggable:
            '스페이스바로 구성품을 선택하고 화살표 키로 옮긴 뒤 스페이스바로 놓습니다. Escape 키로 취소합니다.',
        },
      }}
      collisionDetection={closestCenter}
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragCancel={() => setActiveDrag(undefined)}
      onDragEnd={handleDragEnd}
    >
      <div
        role="region"
        className="optical-train__catalog mb-6 px-2 py-4"
        aria-labelledby="equipment-search-title"
      >
        <h3 id="equipment-search-title" className="mb-2 text-base font-bold">
          광학 조립 장비 검색
        </h3>
        <UnifiedEquipmentSearch
          railItems={train.railItems}
          separationMmByJoinKey={train.separationMmByJoinKey}
          equipmentById={train.equipmentById ?? new Map()}
          selectTube={train.selectTube}
          insert={train.insert}
          renderResult={(item, action, disabled) => (
            <DraggableCatalogCard
              item={item}
              add={action}
              disabled={disabled}
            />
          )}
        />
      </div>

      <TrainRail
        train={train}
        evaluation={evaluation}
        sortingStrategy={horizontalListSortingStrategy}
      />

      {placementMessage && (
        <p
          className="optical-train__placement-alert mt-4 border-l-4 px-3 py-2 text-sm"
          role="alert"
        >
          {placementMessage}
        </p>
      )}

      <DragOverlay dropAnimation={null}>
        {activeDrag ? (
          <div className="optical-train__rail-card px-4 py-3 font-bold shadow-lg">
            {activeDrag.name}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default OpticalTrainDnd;
