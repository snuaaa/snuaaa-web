import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { Badge, Button, Pagination, Sheet } from '~/components/ui';
import { rentRecordQueryOptions } from '~/hooks/queries/useEquipmentQueries';
import { cn } from '~/lib/utils';
import { Equipment } from '~/services/types';
import { formatStamp, isLateReturn, rentChip } from './adminUtils';
import ReturnPhotoButton from './ReturnPhotoButton';

const PAGE_SIZE = 10;

type RentRecordsSheetProps = {
  equipment: Equipment | null;
  onClose: () => void;
};

/** 대여 기록 of one item, newest first. */
export default function RentRecordsSheet({
  equipment,
  onClose,
}: RentRecordsSheetProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useQuery({
    ...rentRecordQueryOptions(equipment?.id ?? 0, page),
    enabled: equipment !== null,
  });
  const rows = data?.rows ?? [];

  useEffect(() => setPage(1), [equipment?.id]);

  return (
    <Sheet
      open={equipment !== null}
      onOpenChange={(open) => !open && onClose()}
      title="대여 기록"
      description={equipment?.name}
      className="md:max-w-[720px]"
      footer={
        <Button
          variant="secondary"
          block
          onClick={onClose}
          size="lg"
          className="md:hidden"
        >
          닫기
        </Button>
      }
    >
      <div className="flex flex-col gap-3 pb-2 md:-mx-6 md:pb-4">
        {isLoading ? (
          <p className="py-12 text-center text-label font-normal text-fg-muted">
            불러오는 중…
          </p>
        ) : isError ? (
          <p className="py-12 text-center text-label font-normal text-fg-muted">
            기록을 불러오지 못했어요.
          </p>
        ) : rows.length === 0 ? (
          <p className="py-12 text-center text-label font-normal text-fg-muted">
            아직 빌린 사람이 없어요.
          </p>
        ) : (
          <div role="table" aria-label="대여 기록" className="text-sm">
            <div
              role="row"
              className="hidden h-10 grid-cols-[1.2fr_1fr_1fr_1fr_1.3fr] items-center gap-3 bg-bg px-6 text-caption font-semibold text-fg-muted md:grid"
            >
              <span role="columnheader">대여자</span>
              <span role="columnheader">대여 시각</span>
              <span role="columnheader">반납 기한</span>
              <span role="columnheader">반납 시각</span>
              <span role="columnheader">상태</span>
            </div>
            {rows.map((rent) => {
              const chip = rentChip(rent);
              const late = isLateReturn(rent);
              return (
                <div
                  key={rent.id}
                  role="row"
                  className="grid grid-cols-3 gap-x-3 gap-y-1.5 border-b border-gray-100 px-1 py-3 last:border-b-0 md:min-h-12 md:grid-cols-[1.2fr_1fr_1fr_1fr_1.3fr] md:items-center md:border-t md:border-b-0 md:px-6 md:py-1.5"
                >
                  <span
                    role="cell"
                    className="col-span-2 truncate font-semibold md:col-span-1 md:font-normal"
                  >
                    {rent.user.nickname}
                  </span>
                  <span
                    role="cell"
                    className="flex items-center justify-end gap-1 md:order-last md:justify-start"
                  >
                    <Badge tone={chip.tone} className="px-2 py-0.5">
                      {chip.label}
                    </Badge>
                    <ReturnPhotoButton
                      rent={rent}
                      equipmentName={equipment?.name}
                    />
                  </span>
                  {[
                    ['대여', formatStamp(rent.start_date)],
                    ['기한', formatStamp(rent.end_date)],
                    ['반납', formatStamp(rent.rentReturn?.return_date)],
                  ].map(([label, value], i) => (
                    <span
                      key={label}
                      role="cell"
                      className="flex flex-col text-micro text-fg-muted md:text-caption"
                    >
                      <span className="md:sr-only">{label}</span>
                      <span
                        className={cn(
                          'text-caption tabular-nums text-fg md:text-gray-700',
                          i === 2 && late && 'font-semibold text-danger',
                        )}
                      >
                        {value}
                      </span>
                    </span>
                  ))}
                </div>
              );
            })}
          </div>
        )}
        <Pagination
          page={page}
          totalPages={Math.ceil((data?.count ?? 0) / PAGE_SIZE)}
          onPageChange={setPage}
        />
      </div>
    </Sheet>
  );
}
