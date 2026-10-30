import { Check, Plus } from 'lucide-react';

import { Button } from '~/components/ui';
import { cn } from '~/lib/utils';
import { Equipment, EquipmentRentStatus } from '~/services/types';
import EquipmentThumb from './EquipmentThumb';
import { formatDue, rentStatusChip } from './rentUtils';

type EquipmentCardProps = {
  equipment: Equipment;
  categoryName?: string;
  inCart: boolean;
  /** False once the rent limit is reached; items already in the cart stay. */
  canAdd: boolean;
  onToggle: () => void;
  onOpen: () => void;
  desktop?: boolean;
};

/** One catalogue item. Rentable ones get a 담기 toggle. */
export default function EquipmentCard({
  equipment,
  categoryName,
  inCart,
  canAdd,
  onToggle,
  onOpen,
  desktop,
}: EquipmentCardProps) {
  const rentable = equipment.rent_status === EquipmentRentStatus.RENTABLE;
  const chip = rentStatusChip[equipment.rent_status];
  const meta = [desktop && categoryName, equipment.maker, equipment.location]
    .filter(Boolean)
    .join(' · ');

  const info = (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <div className="flex items-center gap-1.5">
        {!desktop && categoryName && (
          <span className="rounded-[6px] bg-gray-100 px-1.5 py-0.5 text-micro text-gray-700">
            {categoryName}
          </span>
        )}
        <span
          className={cn('rounded-full px-2 py-0.5 text-micro', chip.className)}
        >
          {chip.label}
        </span>
      </div>
      <div className="truncate text-[15px] font-semibold">{equipment.name}</div>
      {meta && (
        <div className="truncate text-caption text-fg-muted">{meta}</div>
      )}
      {equipment.rent_status === EquipmentRentStatus.RENTED &&
        equipment.end_date && (
          <div className="truncate text-caption text-warning">
            {equipment.renter?.nickname
              ? `${equipment.renter.nickname}님이 `
              : ''}
            {formatDue(equipment.end_date)}까지 사용 중
          </div>
        )}
    </div>
  );

  if (desktop) {
    return (
      <div
        className={cn(
          'flex gap-3 rounded-xl border p-3',
          inCart ? 'border-[1.5px] border-primary' : 'border-border',
        )}
      >
        <EquipmentThumb src={equipment.img_path} className="size-22" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {info}
          <div className="mt-auto flex gap-1.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={onOpen}
              className="h-8 rounded-[8px] border-border px-2.5 text-caption font-normal text-gray-700"
            >
              자세히
            </Button>
            {rentable && (
              <Button
                size="sm"
                variant={inCart ? 'primary' : 'secondary'}
                aria-pressed={inCart}
                disabled={!inCart && !canAdd}
                onClick={onToggle}
                className={cn(
                  'h-8 rounded-[8px] px-3 text-caption',
                  !inCart && 'border-primary text-primary',
                )}
              >
                {inCart ? '담김' : '담기'}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex gap-3 rounded-xl border-[1.5px] bg-surface p-3 shadow-sm',
        inCart ? 'border-primary' : 'border-transparent',
      )}
    >
      <button
        type="button"
        aria-label={`${equipment.name} 정보`}
        onClick={onOpen}
        className={cn('shrink-0', !rentable && 'opacity-70')}
      >
        <EquipmentThumb
          src={equipment.img_path}
          className="size-21 rounded-lg"
        />
      </button>
      <button
        type="button"
        onClick={onOpen}
        className={cn(
          'flex min-w-0 flex-1 text-left',
          !rentable && 'opacity-70',
        )}
      >
        {info}
      </button>
      {rentable && (
        <button
          type="button"
          aria-pressed={inCart}
          aria-label={inCart ? '담기 취소' : '담기'}
          disabled={!inCart && !canAdd}
          onClick={onToggle}
          className={cn(
            'flex size-11 shrink-0 items-center justify-center self-center rounded-full border transition-colors disabled:opacity-40',
            inCart
              ? 'border-primary bg-primary text-accent'
              : 'border-gray-300 bg-surface text-fg',
          )}
        >
          {inCart ? (
            <Check className="size-[18px]" strokeWidth={2.6} />
          ) : (
            <Plus className="size-[18px]" strokeWidth={2.4} />
          )}
        </button>
      )}
    </div>
  );
}
