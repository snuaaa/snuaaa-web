import { ReactNode, useMemo } from 'react';
import {
  useEquipmentCategories,
  useEquipmentList,
} from '~/hooks/queries/useEquipmentQueries';
import {
  CatalogItem,
  CatalogItemType,
  getCatalogItems,
  getCategoryNameById,
} from './TubeSelector';

export type EquipmentPaletteProps = {
  hasTube: boolean;
  insert: (item: {
    equipmentId: number;
    type: Exclude<CatalogItemType, 'tube'>;
  }) => void;
  renderCatalogItem?: (item: CatalogItem, add: () => void) => ReactNode;
};

const EquipmentPalette = ({
  hasTube,
  insert,
  renderCatalogItem,
}: EquipmentPaletteProps) => {
  const categoriesQuery = useEquipmentCategories();
  const equipmentQuery = useEquipmentList();
  const categoryNameById = useMemo(
    () => getCategoryNameById(categoriesQuery.data ?? []),
    [categoriesQuery.data],
  );

  if (categoriesQuery.isLoading) {
    return <p role="status">장비 분류를 불러오는 중입니다.</p>;
  }

  if (categoriesQuery.isError) {
    return (
      <div role="alert">
        <p>장비 분류를 불러오지 못했습니다.</p>
        <button type="button" onClick={() => categoriesQuery.refetch()}>
          다시 시도
        </button>
      </div>
    );
  }

  if (equipmentQuery.isLoading) {
    return <p role="status">구성품 목록을 불러오는 중입니다.</p>;
  }

  if (equipmentQuery.isError) {
    return (
      <div role="alert">
        <p>구성품 목록을 불러오지 못했습니다.</p>
        <button type="button" onClick={() => equipmentQuery.refetch()}>
          다시 시도
        </button>
      </div>
    );
  }

  const catalogItems = getCatalogItems(
    equipmentQuery.data?.equipInfo ?? [],
    categoryNameById,
  ).filter(
    (item): item is CatalogItem & { type: Exclude<CatalogItemType, 'tube'> } =>
      item.type !== 'tube',
  );

  if (!hasTube) {
    return <p>조립을 시작할 장비를 먼저 추가하세요.</p>;
  }

  return (
    <div className="space-y-4" aria-label="구성품 목록">
      {(['adapter', 'terminal'] as const).map((type) => {
        const items = catalogItems.filter((item) => item.type === type);
        const title = '연결 장비';

        return (
          <section key={type} aria-labelledby={`equipment-palette-${type}`}>
            <h4 id={`equipment-palette-${type}`} className="mb-2 font-bold">
              {title}
            </h4>
            {items.length === 0 ? (
              <p>등록된 {title} 장비가 없습니다.</p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2">
                {items.map((item) => {
                  const add = () =>
                    insert({
                      equipmentId: item.equipment.id,
                      type: item.type,
                    });

                  return (
                    <li key={item.equipment.id}>
                      {renderCatalogItem ? (
                        renderCatalogItem(item, add)
                      ) : (
                        <button
                          type="button"
                          onClick={add}
                          className="w-full border border-gray-300 bg-white p-3 text-left text-gray-950 transition hover:border-[#49A1AF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#49A1AF]"
                        >
                          <span className="block font-bold">
                            {item.equipment.name}
                          </span>
                          <span className="mt-1 block text-sm text-gray-600">
                            {item.categoryName} ·{' '}
                            {item.mountSpecStatus === 'verified'
                              ? '사양 있음'
                              : '사양 정보 없음'}
                          </span>
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
};

export default EquipmentPalette;
