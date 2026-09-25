import { ReactNode, useCallback, useMemo, useState } from 'react';
import EquipSearchBar from '~/components/Equipment/EquipSearchBar';
import {
  EquipSearchLocationState,
  SortBy,
  SortOrder,
} from '~/components/Equipment/common';
import {
  useEquipmentCategories,
  useEquipmentList,
} from '~/hooks/queries/useEquipmentQueries';
import { Equipment } from '~/services/types';
import {
  CatalogItem,
  CatalogItemType,
  getCatalogItems,
  getCategoryNameById,
} from './TubeSelector';
import { catalogEligibilityFor } from './catalogEligibility';
import { RailItem } from './state';

export type UnifiedEquipmentSearchProps = {
  railItems: readonly RailItem[];
  separationMmByJoinKey: Readonly<Record<string, number>>;
  equipmentById: ReadonlyMap<number, Equipment>;
  selectTube: (equipmentId: number) => void;
  insert: (item: {
    equipmentId: number;
    type: Exclude<CatalogItemType, 'tube'>;
  }) => void;
  renderResult: (
    item: CatalogItem,
    action: () => void,
    disabled: boolean,
    disabledReason?: string,
  ) => ReactNode;
};

const initialSearch: EquipSearchLocationState = {
  category_id: 0,
  keyword: '',
  maker: '',
  status: '',
  rent_status: '',
  sort_by: SortBy.CREATED_AT,
  sort_order: SortOrder.DESC,
};

const includesIgnoreCase = (value: string, query: string) =>
  value.toLowerCase().includes(query.toLowerCase());

const sortEquipment = (
  first: CatalogItem,
  second: CatalogItem,
  sortBy: SortBy,
  sortOrder: SortOrder,
) => {
  const order = sortOrder === SortOrder.ASC ? 1 : -1;
  const firstValue =
    sortBy === SortBy.CATEGORY
      ? first.categoryName
      : first.equipment[sortBy as keyof Pick<Equipment, 'name' | 'createdAt'>];
  const secondValue =
    sortBy === SortBy.CATEGORY
      ? second.categoryName
      : second.equipment[sortBy as keyof Pick<Equipment, 'name' | 'createdAt'>];

  return firstValue.localeCompare(secondValue) * order;
};

const UnifiedEquipmentSearch = ({
  railItems,
  separationMmByJoinKey,
  equipmentById,
  selectTube,
  insert,
  renderResult,
}: UnifiedEquipmentSearchProps) => {
  const [search, setSearch] = useState<EquipSearchLocationState>(initialSearch);
  const categoriesQuery = useEquipmentCategories();
  const equipmentQuery = useEquipmentList();
  const categoryNameById = useMemo(
    () => getCategoryNameById(categoriesQuery.data ?? []),
    [categoriesQuery.data],
  );
  const updateSearch = useCallback(
    (
      updater: (previous: EquipSearchLocationState) => EquipSearchLocationState,
    ) => {
      setSearch(updater);
    },
    [],
  );
  const catalogItems = useMemo(
    () =>
      getCatalogItems(equipmentQuery.data?.equipInfo ?? [], categoryNameById),
    [categoryNameById, equipmentQuery.data?.equipInfo],
  );
  const eligibilityByEquipmentId = useMemo(
    () =>
      catalogEligibilityFor(
        catalogItems.map((item) => ({
          equipmentId: item.equipment.id,
          type: item.type,
          mountSpec: item.equipment.mount_spec,
        })),
        railItems,
        equipmentById,
      ),
    [catalogItems, equipmentById, railItems],
  );

  const results = useMemo(() => {
    const keyword = search.keyword?.trim() ?? '';
    const maker = search.maker?.trim() ?? '';

    return catalogItems
      .filter((item) => {
        const equipment = item.equipment;

        return (
          (!search.category_id ||
            equipment.category_id === search.category_id) &&
          (!search.status || equipment.status === search.status) &&
          (!search.rent_status ||
            equipment.rent_status === search.rent_status) &&
          (!keyword ||
            includesIgnoreCase(equipment.name, keyword) ||
            includesIgnoreCase(equipment.nickname, keyword)) &&
          (!maker || includesIgnoreCase(equipment.maker, maker))
        );
      })
      .sort((first, second) =>
        sortEquipment(
          first,
          second,
          search.sort_by ?? SortBy.CREATED_AT,
          search.sort_order ?? SortOrder.DESC,
        ),
      );
  }, [catalogItems, search]);

  if (categoriesQuery.isLoading) {
    return (
      <p
        className="optical-train__status-message px-2 py-2 text-sm"
        role="status"
      >
        장비 분류를 불러오는 중입니다.
      </p>
    );
  }

  if (categoriesQuery.isError) {
    return (
      <div className="optical-train__error border-l-4 px-2 py-2" role="alert">
        <p className="mb-2 text-sm">장비 분류를 불러오지 못했습니다.</p>
        <button
          className="optical-train__retry-button px-2 py-2 text-sm"
          type="button"
          onClick={() => categoriesQuery.refetch()}
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (equipmentQuery.isLoading) {
    return (
      <p
        className="optical-train__status-message px-2 py-2 text-sm"
        role="status"
      >
        광학 조립 장비를 불러오는 중입니다.
      </p>
    );
  }

  if (equipmentQuery.isError) {
    return (
      <div className="optical-train__error border-l-4 px-2 py-2" role="alert">
        <p className="mb-2 text-sm">광학 조립 장비를 불러오지 못했습니다.</p>
        <button
          className="optical-train__retry-button px-2 py-2 text-sm"
          type="button"
          onClick={() => equipmentQuery.refetch()}
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div
      className="w-full"
      role="region"
      aria-labelledby="unified-equipment-search-title"
    >
      <h3 id="unified-equipment-search-title" className="sr-only">
        광학 조립 장비 검색
      </h3>
      <EquipSearchBar search={search} onSearchChange={updateSearch} />
      <p
        className="optical-train__status-message mb-2 px-2 text-sm"
        role="status"
        aria-live="polite"
      >
        검색 결과 {results.length}개
      </p>
      {results.length === 0 ? (
        <p
          className="optical-train__status-message px-2 py-2 text-sm"
          role="status"
        >
          검색 조건에 맞는 광학 조립 장비가 없습니다.
        </p>
      ) : (
        <ul
          className="optical-train__catalog-results grid grid-cols-1 gap-4 px-2 sm:grid-cols-2"
          aria-label="광학 조립 장비 검색 결과"
        >
          {results.map((item) => {
            const eligibility = eligibilityByEquipmentId.get(item.equipment.id);
            const disabled = !eligibility?.enabled;
            const action = () => {
              if (item.type === 'tube') {
                selectTube(item.equipment.id);
                return;
              }

              insert({ equipmentId: item.equipment.id, type: item.type });
            };

            return (
              <li key={item.equipment.id} className="min-w-0">
                {renderResult(
                  item,
                  action,
                  disabled,
                  eligibility?.disabledReason,
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default UnifiedEquipmentSearch;
