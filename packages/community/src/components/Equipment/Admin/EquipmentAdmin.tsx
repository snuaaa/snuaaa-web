import { useMemo, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import {
  History,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';

import Skeleton from '~/components/Common/Skeleton';
import {
  Badge,
  Button,
  ConfirmDialog,
  Fab,
  Sheet,
  SheetAction,
  Toast,
  useToast,
} from '~/components/ui';
import {
  useDeleteEquipment,
  useEquipmentCategories,
  useEquipmentList,
} from '~/hooks/queries/useEquipmentQueries';
import { cn } from '~/lib/utils';
import {
  Equipment,
  EquipmentRentStatus,
  EquipmentStatus,
} from '~/services/types';
import { equipmentStatusOptions, equipmentStatusTextMap } from '../common';
import EquipmentThumb from '../Rental/EquipmentThumb';
import { filterEquipments, rentStatusChip } from '../Rental/rentUtils';
import { equipmentStatusTone } from './adminUtils';
import CategoriesSheet from './CategoriesSheet';
import EquipmentAdminPage from './EquipmentAdminPage';
import EquipmentFormSheet, { EquipmentFormTarget } from './EquipmentFormSheet';
import RentRecordsSheet from './RentRecordsSheet';

export type EquipmentAdminSearch = {
  keyword?: string;
  category_id?: number;
  status?: EquipmentStatus;
};

const rentTextClassName: Record<EquipmentRentStatus, string> = {
  [EquipmentRentStatus.RENTABLE]: 'text-success',
  [EquipmentRentStatus.RENTED]: 'text-warning',
  [EquipmentRentStatus.UNRENTABLE]: 'text-gray-500',
};

const filterClassName =
  'h-10 rounded-md border border-gray-300 bg-surface px-2.5 text-sm text-fg';

const tableColumns = 'grid-cols-[44px_minmax(0,2.2fr)_1fr_1fr_1fr_1.3fr_136px]';

/** 장비 관리 › 장비: every item, with 등록, 수정, 삭제 and 대여 기록. */
export default function EquipmentAdmin() {
  const search = useSearch({ from: '/equipment/admin/' });
  const navigate = useNavigate({ from: '/equipment/admin/' });
  const { data, isLoading, isError } = useEquipmentList();
  const { data: categories = [] } = useEquipmentCategories();
  const { mutateAsync: remove, isPending: removing } = useDeleteEquipment();
  const toast = useToast();

  const [form, setForm] = useState<EquipmentFormTarget>(null);
  const [records, setRecords] = useState<Equipment | null>(null);
  const [menu, setMenu] = useState<Equipment | null>(null);
  const [deleting, setDeleting] = useState<Equipment | null>(null);
  const [editingCategories, setEditingCategories] = useState(false);

  const items = useMemo(
    () => filterEquipments(data?.equipInfo ?? [], search),
    [data, search],
  );
  const categoryName = (equip: Equipment) =>
    categories.find((category) => category.id === equip.category_id)?.name;
  const set = (patch: Partial<EquipmentAdminSearch>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await remove(deleting.id);
      toast.show(`${deleting.name}을(를) 삭제했어요`);
      setDeleting(null);
    } catch (err) {
      console.error(err);
      toast.show('삭제하지 못했어요. 잠시 후 다시 시도해 주세요.');
    }
  };

  const filters = (
    <>
      <label className="flex h-10 min-w-0 shrink-0 items-center gap-2 rounded-md border border-gray-300 bg-surface px-3 text-fg-muted md:min-w-48 md:flex-1">
        <Search className="size-4 shrink-0" aria-hidden />
        <span className="sr-only">장비 검색</span>
        <input
          type="search"
          value={search.keyword ?? ''}
          onChange={(e) => set({ keyword: e.target.value || undefined })}
          placeholder="장비명, 별명, 제조사로 검색"
          className="min-w-0 flex-1 bg-transparent text-base text-fg outline-none placeholder:text-gray-400 md:text-sm"
        />
      </label>
      <div className="flex gap-2">
        <label className="flex-1 md:flex-none">
          <span className="sr-only">분류</span>
          <select
            value={search.category_id ?? ''}
            onChange={(e) =>
              set({ category_id: Number(e.target.value) || undefined })
            }
            className={cn(filterClassName, 'w-full')}
          >
            <option value="">분류 전체</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex-1 md:flex-none">
          <span className="sr-only">상태</span>
          <select
            value={search.status ?? ''}
            onChange={(e) =>
              set({
                status: (e.target.value as EquipmentStatus) || undefined,
              })
            }
            className={cn(filterClassName, 'w-full')}
          >
            <option value="">상태 전체</option>
            {equipmentStatusOptions.map(({ value, name }) => (
              <option key={value} value={value}>
                {name}
              </option>
            ))}
          </select>
        </label>
      </div>
    </>
  );

  const statusBadge = (equip: Equipment) => (
    <Badge tone={equipmentStatusTone[equip.status]} className="px-2 py-0.5">
      {equipmentStatusTextMap[equip.status]}
    </Badge>
  );

  const empty = isError
    ? '장비 목록을 불러오지 못했어요.'
    : items.length === 0 && !isLoading
      ? data?.equipInfo.length
        ? '조건에 맞는 장비가 없어요.'
        : '아직 등록한 장비가 없어요.'
      : null;

  return (
    <EquipmentAdminPage
      tab="equipment"
      mobileAction={
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setEditingCategories(true)}
          className="px-2.5"
        >
          분류
        </Button>
      }
    >
      {/* Mobile */}
      <div className="flex flex-col gap-3 px-4 pt-3 md:hidden">
        {filters}
        {isLoading ? (
          Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))
        ) : empty ? (
          <p className="py-16 text-center text-label font-normal text-fg-muted">
            {empty}
          </p>
        ) : (
          <ul className="flex flex-col gap-2 pb-20">
            {items.map((equip) => (
              <li
                key={equip.id}
                className="flex items-center gap-3 rounded-xl bg-surface p-3 shadow-sm"
              >
                <EquipmentThumb
                  src={equip.img_path}
                  className="size-14 rounded-lg"
                />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="truncate text-[15px] font-semibold">
                    {equip.name}
                  </span>
                  <span className="truncate text-caption text-fg-muted">
                    {[categoryName(equip), equip.location]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                  <span className="flex items-center gap-1.5">
                    {statusBadge(equip)}
                    <span
                      className={cn(
                        'text-caption font-semibold',
                        rentTextClassName[equip.rent_status],
                      )}
                    >
                      {rentStatusChip[equip.rent_status].label}
                    </span>
                  </span>
                </div>
                <button
                  type="button"
                  aria-label={`${equip.name} 메뉴`}
                  onClick={() => setMenu(equip)}
                  className="flex size-10 shrink-0 items-center justify-center rounded-full text-gray-700 hover:bg-gray-100"
                >
                  <MoreHorizontal className="size-5" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <Fab icon={<Plus />} onClick={() => setForm({})}>
          새 장비
        </Fab>
      </div>

      {/* Desktop */}
      <div className="hidden flex-col gap-4 md:flex">
        <div className="flex items-center gap-2">
          {filters}
          <Button
            variant="secondary"
            onClick={() => setEditingCategories(true)}
            className="h-10"
          >
            분류 편집
          </Button>
          <Button onClick={() => setForm({})} className="h-10">
            <Plus />새 장비
          </Button>
        </div>
        <div
          role="table"
          aria-label="장비 목록"
          className="overflow-hidden rounded-xl border border-border bg-surface"
        >
          <div
            role="row"
            className={cn(
              'grid h-11 items-center gap-3 bg-bg px-4 text-caption font-semibold text-fg-muted',
              tableColumns,
            )}
          >
            <span />
            <span role="columnheader">장비명</span>
            <span role="columnheader">분류</span>
            <span role="columnheader">상태</span>
            <span role="columnheader">대여</span>
            <span role="columnheader">위치</span>
            <span />
          </div>
          {isLoading ? (
            Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="border-t border-gray-100 px-4 py-3">
                <Skeleton className="h-10 rounded-md" />
              </div>
            ))
          ) : empty ? (
            <p className="border-t border-gray-100 py-16 text-center text-label font-normal text-fg-muted">
              {empty}
            </p>
          ) : (
            items.map((equip) => (
              <div
                key={equip.id}
                role="row"
                className={cn(
                  'grid min-h-16 items-center gap-3 border-t border-gray-100 px-4 py-2.5 text-sm',
                  tableColumns,
                )}
              >
                <EquipmentThumb src={equip.img_path} className="size-11" />
                <span role="cell" className="flex min-w-0 flex-col">
                  <span className="truncate font-semibold">{equip.name}</span>
                  <span className="truncate text-caption text-fg-muted">
                    {[equip.nickname, equip.maker].filter(Boolean).join(' · ')}
                  </span>
                </span>
                <span role="cell" className="truncate text-gray-700">
                  {categoryName(equip)}
                </span>
                <span role="cell">{statusBadge(equip)}</span>
                <span
                  role="cell"
                  className={cn(
                    'text-label',
                    rentTextClassName[equip.rent_status],
                  )}
                >
                  {rentStatusChip[equip.rent_status].label}
                </span>
                <span
                  role="cell"
                  className="truncate text-label font-normal text-gray-700"
                >
                  {equip.location}
                </span>
                <span role="cell" className="flex justify-end gap-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setRecords(equip)}
                    className="h-8 px-2.5 text-caption font-semibold"
                  >
                    기록
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setForm({ equipment: equip })}
                    className="h-8 px-2.5 text-caption font-semibold"
                  >
                    수정
                  </Button>
                  <button
                    type="button"
                    aria-label={`${equip.name} 삭제`}
                    onClick={() => setDeleting(equip)}
                    className="flex size-8 items-center justify-center rounded-md text-danger hover:bg-danger-soft"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <Sheet
        open={menu !== null}
        onOpenChange={(open) => !open && setMenu(null)}
        title={menu?.name ?? '장비 메뉴'}
      >
        <div className="flex flex-col pb-2">
          <SheetAction
            icon={<History />}
            onClick={() => {
              setRecords(menu);
              setMenu(null);
            }}
          >
            대여 기록
          </SheetAction>
          <SheetAction
            icon={<Pencil />}
            onClick={() => {
              if (menu) setForm({ equipment: menu });
              setMenu(null);
            }}
          >
            정보 수정
          </SheetAction>
          <SheetAction
            icon={<Trash2 />}
            tone="danger"
            onClick={() => {
              setDeleting(menu);
              setMenu(null);
            }}
          >
            삭제
          </SheetAction>
        </div>
      </Sheet>
      <EquipmentFormSheet
        target={form}
        onClose={() => setForm(null)}
        onSaved={(message) => {
          setForm(null);
          toast.show(message);
        }}
      />
      <RentRecordsSheet equipment={records} onClose={() => setRecords(null)} />
      <CategoriesSheet
        open={editingCategories}
        onClose={() => setEditingCategories(false)}
      />
      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`${deleting?.name ?? '장비'}을(를) 삭제할까요?`}
        description="삭제한 장비는 되돌릴 수 없어요."
        confirmLabel="삭제"
        tone="danger"
        loading={removing}
        onConfirm={confirmDelete}
      />
      <Toast message={toast.message} />
    </EquipmentAdminPage>
  );
}
