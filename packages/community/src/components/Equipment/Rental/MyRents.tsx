import { useState } from 'react';

import Skeleton from '~/components/Common/Skeleton';
import { Toast, useToast } from '~/components/ui';
import { cn } from '~/lib/utils';
import { MyRent } from '~/services/types';
import MyRentCard from './MyRentCard';
import ReturnSheet from './ReturnSheet';

type MyRentsProps = {
  rents?: MyRent[];
  isLoading: boolean;
  /** Two columns of small cards above the desktop catalogue. */
  compact?: boolean;
};

/** 빌린 장비, overdue first, each with its 반납 sheet. */
export default function MyRents({ rents, isLoading, compact }: MyRentsProps) {
  const [returning, setReturning] = useState<MyRent | null>(null);
  const toast = useToast();

  const sorted = [...(rents ?? [])].sort((a, b) =>
    a.end_date.localeCompare(b.end_date),
  );

  return (
    <>
      {isLoading ? (
        <div className={cn('grid gap-2.5', compact && 'grid-cols-2')}>
          <Skeleton className={cn('rounded-xl', compact ? 'h-19' : 'h-23')} />
        </div>
      ) : sorted.length === 0 ? (
        !compact && (
          <div className="flex flex-col items-center gap-1.5 rounded-xl bg-surface px-4 py-7 text-center">
            <p className="text-[15px] font-semibold">빌린 장비가 없어요</p>
            <p className="text-label font-normal text-fg-muted">
              관측 전에 필요한 장비를 빌려 보세요
            </p>
          </div>
        )
      ) : (
        <ul className={cn('grid gap-2.5', compact && 'grid-cols-2')}>
          {sorted.map((rent) => (
            <li key={rent.id}>
              <MyRentCard
                rent={rent}
                compact={compact}
                onReturn={() => setReturning(rent)}
              />
            </li>
          ))}
        </ul>
      )}
      <ReturnSheet
        rent={returning}
        onClose={() => setReturning(null)}
        onReturned={() => {
          setReturning(null);
          toast.show('반납했어요');
        }}
      />
      <Toast message={toast.message} />
    </>
  );
}
