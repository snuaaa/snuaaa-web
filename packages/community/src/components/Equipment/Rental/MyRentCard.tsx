import { Button } from '~/components/ui';
import { cn } from '~/lib/utils';
import { MyRent } from '~/services/types';
import EquipmentThumb from './EquipmentThumb';
import { dueToneClassName, formatDue, timeLeft } from './rentUtils';

type MyRentCardProps = {
  rent: MyRent;
  onReturn: () => void;
  /** The smaller card above the desktop catalogue. */
  compact?: boolean;
};

/** One borrowed item: time left, and 반납. Overdue ones turn red. */
export default function MyRentCard({
  rent,
  onReturn,
  compact,
}: MyRentCardProps) {
  const left = timeLeft(rent.end_date);

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border-[1.5px] border-transparent bg-surface shadow-sm',
        compact ? 'p-3' : 'p-3.5',
        left.tone === 'late' && 'border-danger',
      )}
    >
      <EquipmentThumb
        src={rent.equipment.img_path}
        className={compact ? 'size-[52px]' : 'size-16 rounded-lg'}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div
          className={cn(
            'truncate font-semibold',
            compact ? 'text-sm' : 'text-[15px]',
          )}
        >
          {rent.equipment.name}
        </div>
        {!compact && (
          <div className="text-caption text-fg-muted">
            {formatDue(rent.end_date)}까지
          </div>
        )}
        <span
          className={cn(
            'self-start rounded-full px-2 py-0.5 text-caption font-bold',
            compact && 'text-micro',
            dueToneClassName[left.tone],
          )}
        >
          {left.label}
        </span>
      </div>
      <Button
        size="sm"
        variant={
          left.tone === 'late'
            ? 'danger'
            : left.tone === 'soon'
              ? 'primary'
              : 'secondary'
        }
        onClick={onReturn}
        className={compact ? 'h-9 px-3' : 'h-10 px-3.5 text-sm'}
      >
        반납
      </Button>
    </div>
  );
}
