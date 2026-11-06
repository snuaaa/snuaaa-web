import { useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';

import {
  Badge,
  Button,
  Chip,
  ConfirmDialog,
  Pagination,
  SegmentedControl,
  Skeleton,
  Toast,
  useToast,
} from '~/components/ui';
import {
  useAllRentRecords,
  useUpdatePenaltyStatus,
} from '~/hooks/queries/useEquipmentQueries';
import { useAuth } from '~/contexts/auth';
import { cn } from '~/lib/utils';
import { PenaltyStatus, RentWithEquipment } from '~/services/types';
import {
  formatStamp,
  isLateReturn,
  PENALTY_FILTERS,
  PenaltyFilter,
  rentChip,
} from './adminUtils';
import { EQUIP_ADMIN_GRADE } from '../Rental/rentUtils';
import EquipmentAdminPage from './EquipmentAdminPage';
import ReturnPhotoButton from './ReturnPhotoButton';

export type LateFeesSearch = {
  penalty_status?: PenaltyStatus;
  /** 대여 기간, as yyyy-mm-dd. */
  date_from_start?: string;
  date_to_start?: string;
  page?: number;
};

const PAGE_SIZE = 10;

const tableColumns =
  'grid-cols-[minmax(0,1.6fr)_1fr_1.1fr_1.1fr_1.1fr_1.3fr_136px]';

const dateInputClassName =
  'h-10 min-w-0 rounded-md border border-gray-300 bg-surface px-2.5 text-sm text-fg tabular-nums';

/** What 완납 처리 / 미납으로 되돌리기 is about to do. */
type Pending = { rent: RentWithEquipment; next: PenaltyStatus } | null;

/** 장비 관리 › 연체료: every rent, with late fees marked paid or unpaid. */
export default function LateFeesAdmin() {
  const search = useSearch({ from: '/equipment/admin/fees' });
  const navigate = useNavigate({ from: '/equipment/admin/fees' });
  const page = search.page ?? 1;
  const { authInfo } = useAuth();
  const { data, isLoading, isError } = useAllRentRecords(
    {
      penaltyStatus: search.penalty_status,
      dateFromStart: search.date_from_start,
      dateToStart: search.date_to_start,
    },
    page,
    authInfo.user.grade <= EQUIP_ADMIN_GRADE,
  );
  const { mutateAsync: updatePenalty, isPending: updating } =
    useUpdatePenaltyStatus();
  const [pending, setPending] = useState<Pending>(null);
  const toast = useToast();

  const rows = data?.rows ?? [];
  const status: PenaltyFilter = search.penalty_status ?? 'all';
  const set = (patch: Partial<LateFeesSearch>) =>
    navigate({
      search: (prev) => ({ ...prev, page: undefined, ...patch }),
      replace: true,
    });
  const setStatus = (value: PenaltyFilter) =>
    set({ penalty_status: value === 'all' ? undefined : value });

  const confirm = async () => {
    if (!pending) return;
    try {
      await updatePenalty({
        rentId: pending.rent.id,
        penaltyStatus: pending.next,
      });
      toast.show(
        pending.next === PenaltyStatus.RECEIVED_PAYMENT
          ? '완납 처리했어요'
          : '미납으로 되돌렸어요',
      );
      setPending(null);
    } catch (err) {
      console.error(err);
      toast.show('바꾸지 못했어요. 잠시 후 다시 시도해 주세요.');
    }
  };

  const action = (rent: RentWithEquipment, mobile?: boolean) => {
    const penalty = rent.rentReturn?.penalty_status;
    if (penalty === PenaltyStatus.NEED_PAYMENT) {
      return (
        <Button
          size="sm"
          block={mobile}
          onClick={() =>
            setPending({ rent, next: PenaltyStatus.RECEIVED_PAYMENT })
          }
          className={mobile ? 'h-10 rounded-md' : 'h-8 px-3 text-caption'}
        >
          완납 처리
        </Button>
      );
    }
    if (penalty === PenaltyStatus.RECEIVED_PAYMENT) {
      return (
        <Button
          size="sm"
          variant="secondary"
          block={mobile}
          onClick={() => setPending({ rent, next: PenaltyStatus.NEED_PAYMENT })}
          className={cn(
            'text-gray-700',
            mobile ? 'h-10 rounded-md' : 'h-8 px-2.5 text-caption',
          )}
        >
          미납으로 되돌리기
        </Button>
      );
    }
    return null;
  };

  const chip = (rent: RentWithEquipment) => {
    const { label, tone } = rentChip(rent);
    return (
      <Badge tone={tone} className="px-2 py-0.5">
        {label}
      </Badge>
    );
  };

  const dateRange = (
    <div className="flex items-center gap-1.5 text-label font-normal text-gray-700">
      <span className="shrink-0">대여 기간</span>
      <input
        type="date"
        aria-label="대여 기간 시작"
        value={search.date_from_start ?? ''}
        max={search.date_to_start}
        onChange={(e) => set({ date_from_start: e.target.value || undefined })}
        className={dateInputClassName}
      />
      ~
      <input
        type="date"
        aria-label="대여 기간 끝"
        value={search.date_to_start ?? ''}
        min={search.date_from_start}
        onChange={(e) => set({ date_to_start: e.target.value || undefined })}
        className={dateInputClassName}
      />
    </div>
  );

  const empty = isError
    ? '기록을 불러오지 못했어요.'
    : !isLoading && rows.length === 0
      ? '조건에 맞는 기록이 없어요.'
      : null;

  const pagination = (
    <Pagination
      page={page}
      totalPages={Math.ceil((data?.count ?? 0) / PAGE_SIZE)}
      onPageChange={(next) =>
        navigate({ search: (prev) => ({ ...prev, page: next }) })
      }
    />
  );

  return (
    <EquipmentAdminPage tab="fees">
      {/* Mobile */}
      <div className="flex flex-col gap-2.5 pt-3 md:hidden">
        <div className="flex gap-1.5 overflow-x-auto px-4 [scrollbar-width:none]">
          {PENALTY_FILTERS.map(({ value, label }) => (
            <Chip
              key={value}
              aria-pressed={status === value}
              selected={status === value}
              onClick={() => setStatus(value)}
              className="px-3"
            >
              {label}
            </Chip>
          ))}
        </div>
        <div className="px-4">{dateRange}</div>
        <div className="flex flex-col gap-2 px-4 pt-1">
          {isLoading ? (
            Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-36 rounded-xl" />
            ))
          ) : empty ? (
            <p className="py-16 text-center text-label font-normal text-fg-muted">
              {empty}
            </p>
          ) : (
            rows.map((rent) => (
              <div
                key={rent.id}
                className="flex flex-col gap-2 rounded-xl bg-surface p-3.5 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[15px] font-semibold">
                    {rent.equipment.name}
                  </span>
                  {chip(rent)}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-label font-normal text-gray-700">
                    {rent.user.nickname}
                  </span>
                  <ReturnPhotoButton
                    rent={rent}
                    equipmentName={rent.equipment.name}
                  />
                </div>
                <dl className="grid grid-cols-3 gap-1.5 text-micro font-normal text-fg-muted">
                  {[
                    ['대여', formatStamp(rent.start_date)],
                    ['기한', formatStamp(rent.end_date)],
                    ['반납', formatStamp(rent.rentReturn?.return_date)],
                  ].map(([label, value], i) => (
                    <div key={label} className="flex flex-col">
                      <dt>{label}</dt>
                      <dd
                        className={cn(
                          'text-caption text-fg tabular-nums',
                          i === 2 && isLateReturn(rent) && 'text-danger',
                        )}
                      >
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
                {action(rent, true)}
              </div>
            ))
          )}
          {pagination}
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden flex-col gap-4 md:flex">
        <div className="flex flex-wrap items-center gap-3">
          <SegmentedControl
            aria-label="상태"
            value={status}
            onValueChange={setStatus}
            options={PENALTY_FILTERS}
          />
          {dateRange}
        </div>
        <div
          role="table"
          aria-label="대여 기록"
          className="overflow-hidden rounded-xl border border-border bg-surface"
        >
          <div
            role="row"
            className={cn(
              'grid h-11 items-center gap-3 bg-bg px-4 text-caption font-semibold text-fg-muted',
              tableColumns,
            )}
          >
            <span role="columnheader">장비명</span>
            <span role="columnheader">대여자</span>
            <span role="columnheader">대여 시각</span>
            <span role="columnheader">반납 기한</span>
            <span role="columnheader">반납 시각</span>
            <span role="columnheader">상태</span>
            <span />
          </div>
          {isLoading ? (
            Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="border-t border-gray-100 px-4 py-3">
                <Skeleton className="h-8 rounded-md" />
              </div>
            ))
          ) : empty ? (
            <p className="border-t border-gray-100 py-16 text-center text-label font-normal text-fg-muted">
              {empty}
            </p>
          ) : (
            rows.map((rent) => (
              <div
                key={rent.id}
                role="row"
                className={cn(
                  'grid min-h-14 items-center gap-3 border-t border-gray-100 px-4 py-2 text-sm',
                  tableColumns,
                )}
              >
                <span role="cell" className="truncate font-semibold">
                  {rent.equipment.name}
                </span>
                <span role="cell" className="truncate">
                  {rent.user.nickname}
                </span>
                {[
                  rent.start_date,
                  rent.end_date,
                  rent.rentReturn?.return_date,
                ].map((value, i) => (
                  <span
                    key={i}
                    role="cell"
                    className={cn(
                      'text-caption text-gray-700 tabular-nums',
                      i === 2 &&
                        isLateReturn(rent) &&
                        'font-semibold text-danger',
                    )}
                  >
                    {formatStamp(value)}
                  </span>
                ))}
                <span role="cell" className="flex items-center gap-1">
                  {chip(rent)}
                  <ReturnPhotoButton
                    rent={rent}
                    equipmentName={rent.equipment.name}
                  />
                </span>
                <span role="cell" className="flex justify-end">
                  {action(rent)}
                </span>
              </div>
            ))
          )}
        </div>
        {pagination}
      </div>

      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(open) => !open && setPending(null)}
        title={
          pending?.next === PenaltyStatus.RECEIVED_PAYMENT
            ? '연체료를 완납 처리할까요?'
            : '미납 상태로 되돌릴까요?'
        }
        description={
          pending &&
          `${pending.rent.user.nickname} · ${pending.rent.equipment.name} 대여 건을 ${
            pending.next === PenaltyStatus.RECEIVED_PAYMENT
              ? '완납'
              : '다시 미납'
          }으로 바꿔요.`
        }
        confirmLabel={
          pending?.next === PenaltyStatus.RECEIVED_PAYMENT
            ? '완납 처리'
            : '되돌리기'
        }
        loading={updating}
        onConfirm={confirm}
      />
      <Toast message={toast.message} />
    </EquipmentAdminPage>
  );
}
