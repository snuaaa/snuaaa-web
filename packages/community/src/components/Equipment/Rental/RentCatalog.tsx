import { useMemo, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';

import Skeleton from '~/components/Common/Skeleton';
import {
  useEquipmentCategories,
  useEquipmentList,
} from '~/hooks/queries/useEquipmentQueries';
import { cn } from '~/lib/utils';
import { Equipment, EquipmentStatus } from '~/services/types';
import { equipmentStatusOptions } from '../common';
import EquipmentCard from './EquipmentCard';
import EquipmentDetailSheet from './EquipmentDetailSheet';
import {
  filterEquipments,
  RENT_SORTS,
  RentFilter,
  RentSort,
} from './rentUtils';
import { RentCart } from './useRentCart';

type RentCatalogProps = {
  filter: RentFilter;
  onFilterChange: (next: RentFilter) => void;
  cart: RentCart;
  desktop?: boolean;
  /** The mobile header's back button. */
  backButton?: React.ReactNode;
};

const chipClassName = (on: boolean) =>
  cn(
    'flex h-[34px] shrink-0 items-center rounded-full border px-3 text-label transition-colors',
    on
      ? 'border-primary bg-primary text-white'
      : 'border-border bg-surface font-medium text-gray-700',
  );

const selectClassName =
  'h-10 rounded-md border border-border bg-surface px-2.5 text-sm text-fg';

function SearchBox({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}) {
  return (
    <label
      className={cn(
        'flex items-center gap-2 rounded-md bg-surface-sunken px-3 text-fg-muted',
        className,
      )}
    >
      <Search className="size-[18px] shrink-0" strokeWidth={1.8} aria-hidden />
      <span className="sr-only">장비 검색</span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-base text-fg outline-none placeholder:text-gray-500 md:text-sm"
      />
    </label>
  );
}

/** Search, filters and the equipment cards, with the 장비 정보 sheet. */
export default function RentCatalog({
  filter,
  onFilterChange,
  cart,
  desktop,
  backButton,
}: RentCatalogProps) {
  const { data, isLoading, isError } = useEquipmentList();
  const { data: categories = [] } = useEquipmentCategories();
  const [opened, setOpened] = useState<Equipment | null>(null);

  const items = useMemo(
    () => filterEquipments(data?.equipInfo ?? [], filter),
    [data, filter],
  );
  const categoryName = (equip: Equipment) =>
    categories.find((category) => category.id === equip.category_id)?.name;
  const set = (patch: Partial<RentFilter>) =>
    onFilterChange({ ...filter, ...patch });

  const list = isLoading ? (
    <div className={cn('grid gap-2.5', desktop && 'grid-cols-2 gap-3')}>
      {Array.from({ length: 4 }, (_, i) => (
        <Skeleton key={i} className="h-27 rounded-xl" />
      ))}
    </div>
  ) : isError ? (
    <p className="py-16 text-center text-label font-normal text-fg-muted">
      장비 목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
    </p>
  ) : items.length === 0 ? (
    <p className="py-16 text-center text-label font-normal text-fg-muted">
      조건에 맞는 장비가 없어요.
    </p>
  ) : (
    <ul className={cn('grid gap-2.5', desktop && 'grid-cols-2 gap-3')}>
      {items.map((equip) => (
        <li key={equip.id}>
          <EquipmentCard
            equipment={equip}
            categoryName={categoryName(equip)}
            inCart={cart.has(equip)}
            canAdd={cart.remaining > 0}
            onToggle={() => cart.toggle(equip)}
            onOpen={() => setOpened(equip)}
            desktop={desktop}
          />
        </li>
      ))}
    </ul>
  );

  const sortSelect = (
    <label
      className={cn('relative flex items-center', !desktop && 'text-caption')}
    >
      <span className="sr-only">정렬</span>
      <select
        value={filter.sort ?? 'latest'}
        onChange={(e) =>
          set({
            sort:
              e.target.value === 'latest'
                ? undefined
                : (e.target.value as RentSort),
          })
        }
        className={
          desktop
            ? selectClassName
            : 'appearance-none bg-transparent pr-4 text-gray-700'
        }
      >
        {RENT_SORTS.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      {!desktop && (
        <ChevronDown
          className="pointer-events-none absolute right-0 size-3 text-gray-700"
          strokeWidth={2.4}
          aria-hidden
        />
      )}
    </label>
  );

  const sheet = (
    <EquipmentDetailSheet
      equipment={opened}
      categoryName={opened ? categoryName(opened) : undefined}
      inCart={opened ? cart.has(opened) : false}
      canAdd={cart.remaining > 0}
      onToggle={() => opened && cart.toggle(opened)}
      onClose={() => setOpened(null)}
    />
  );

  if (desktop) {
    return (
      <div className="flex flex-col rounded-xl bg-surface shadow-sm">
        <div className="flex flex-wrap items-center gap-2.5 border-b border-gray-100 px-[18px] py-3.5">
          <SearchBox
            value={filter.keyword ?? ''}
            onChange={(keyword) => set({ keyword: keyword || undefined })}
            placeholder="장비명, 제조사"
            className="h-10 min-w-40 flex-1"
          />
          <label>
            <span className="sr-only">분류</span>
            <select
              value={filter.category_id ?? ''}
              onChange={(e) =>
                set({ category_id: Number(e.target.value) || undefined })
              }
              className={selectClassName}
            >
              <option value="">분류 전체</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">상태</span>
            <select
              value={filter.status ?? ''}
              onChange={(e) =>
                set({
                  status: (e.target.value as EquipmentStatus) || undefined,
                })
              }
              className={selectClassName}
            >
              <option value="">상태 전체</option>
              {equipmentStatusOptions.map(({ value, name }) => (
                <option key={value} value={value}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex h-10 items-center gap-1.5 text-sm">
            <input
              type="checkbox"
              checked={filter.available ?? false}
              onChange={(e) =>
                set({ available: e.target.checked || undefined })
              }
              className="size-4 accent-primary"
            />
            대여 가능만
          </label>
          {sortSelect}
        </div>
        <div className="px-[18px] py-4">{list}</div>
        {sheet}
      </div>
    );
  }

  return (
    <>
      <div className="sticky top-0 z-20 flex flex-col gap-2.5 border-b border-gray-100 bg-surface pt-[max(0.5rem,env(safe-area-inset-top))] pr-4 pb-3 pl-1">
        <div className="flex items-center gap-1">
          {backButton}
          <SearchBox
            value={filter.keyword ?? ''}
            onChange={(keyword) => set({ keyword: keyword || undefined })}
            placeholder="장비명, 제조사 검색"
            className="h-11 flex-1"
          />
        </div>
        <div className="-mr-4 flex gap-2 overflow-x-auto pr-4 pl-3 [scrollbar-width:none]">
          <button
            type="button"
            aria-pressed={filter.available ?? false}
            onClick={() =>
              set({ available: filter.available ? undefined : true })
            }
            className={cn(
              'flex h-[34px] shrink-0 items-center rounded-full border px-3 text-label',
              filter.available
                ? 'border-success bg-success-soft text-success'
                : 'border-border bg-surface text-gray-700',
            )}
          >
            대여 가능만
          </button>
          <span className="my-1 w-px shrink-0 bg-border" aria-hidden />
          <button
            type="button"
            aria-pressed={!filter.category_id}
            onClick={() => set({ category_id: undefined })}
            className={chipClassName(!filter.category_id)}
          >
            전체
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              aria-pressed={filter.category_id === category.id}
              onClick={() => set({ category_id: category.id })}
              className={chipClassName(filter.category_id === category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between px-4 pt-2.5 pb-1 text-caption text-fg-muted">
        <span>장비 {items.length}개</span>
        {sortSelect}
      </div>
      <div className="px-4 pt-1.5">{list}</div>
      {sheet}
    </>
  );
}
