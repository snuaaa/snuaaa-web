import { useMemo } from 'react';
import {
  useEquipmentCategories,
  useEquipmentList,
} from '~/hooks/queries/useEquipmentQueries';
import SearchSelect from '~/components/Equipment/EquipSearchBar/SearchSelect';
import { evaluateMountSpec } from './domain/mountSpec';
import { Equipment, EquipmentCategory } from '~/services/types';
import EquipmentCutawayPreview from './EquipmentCutawayPreview';

export const opticalTrainCategoryNames = {
  refractorTube: '경통(굴절)',
  reflectorTube: '경통(반사)',
  adapter: '어댑터',
  camera: '카메라',
  eyepiece: '아이피스',
} as const;

type OpticalTrainCategoryName =
  (typeof opticalTrainCategoryNames)[keyof typeof opticalTrainCategoryNames];

export type CatalogItemType = 'tube' | 'adapter' | 'terminal';

export type CatalogItem = {
  equipment: Equipment;
  categoryName: OpticalTrainCategoryName;
  type: CatalogItemType;
  mountSpecStatus: 'verified' | 'unverified';
};

export const getCategoryNameById = (categories: EquipmentCategory[]) =>
  new Map(
    categories
      .filter(
        (
          category,
        ): category is EquipmentCategory & { name: OpticalTrainCategoryName } =>
          Object.values(opticalTrainCategoryNames).includes(
            category.name as OpticalTrainCategoryName,
          ),
      )
      .map((category) => [category.id, category.name]),
  );

export const getCatalogItemType = (
  categoryName: OpticalTrainCategoryName,
): CatalogItemType => {
  if (
    categoryName === opticalTrainCategoryNames.refractorTube ||
    categoryName === opticalTrainCategoryNames.reflectorTube
  ) {
    return 'tube';
  }

  return categoryName === opticalTrainCategoryNames.adapter
    ? 'adapter'
    : 'terminal';
};

export const getCatalogItems = (
  equipment: Equipment[],
  categoryNameById: Map<number, OpticalTrainCategoryName>,
) =>
  equipment.flatMap((item) => {
    const categoryName = categoryNameById.get(item.category_id);
    if (!categoryName) {
      return [];
    }

    return {
      equipment: item,
      categoryName,
      type: getCatalogItemType(categoryName),
      mountSpecStatus: evaluateMountSpec(item.mount_spec).status,
    };
  });

export type TubeSelectorProps = {
  selectedTubeId?: number;
  selectTube: (equipmentId: number) => void;
};

const TubeSelector = ({ selectedTubeId, selectTube }: TubeSelectorProps) => {
  const categoriesQuery = useEquipmentCategories();
  const equipmentQuery = useEquipmentList();
  const categoryNameById = useMemo(
    () => getCategoryNameById(categoriesQuery.data ?? []),
    [categoriesQuery.data],
  );

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
        조립 장비를 불러오는 중입니다.
      </p>
    );
  }

  if (equipmentQuery.isError) {
    return (
      <div className="optical-train__error border-l-4 px-2 py-2" role="alert">
        <p className="mb-2 text-sm">조립 장비를 불러오지 못했습니다.</p>
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

  const tubes = getCatalogItems(
    equipmentQuery.data?.equipInfo ?? [],
    categoryNameById,
  ).filter((item) => item.type === 'tube');
  const selectedTube = tubes.find(
    (item) => item.equipment.id === selectedTubeId,
  );

  return (
    <div className="space-y-4 px-2">
      {tubes.length === 0 ? (
        <p className="optical-train__status-message py-2 text-sm">
          선택 가능한 시작 장비가 없습니다.
        </p>
      ) : (
        <label className="block text-base">
          <span className="mb-2 block">조립 시작 장비</span>
          <SearchSelect
            name="tube"
            options={tubes.map((item) => ({
              value: item.equipment.id,
              name: `${item.equipment.name} · ${item.categoryName} · ${item.mountSpecStatus === 'verified' ? '사양 있음' : '사양 정보 없음'}`,
            }))}
            value={selectedTubeId ?? 0}
            defaultOption="장비 선택"
            onChange={(event) => {
              const equipmentId = Number(event.target.value);
              if (equipmentId) {
                selectTube(equipmentId);
              }
            }}
          />
        </label>
      )}
      <p className="optical-train__status-message text-sm" role="status">
        선택된 시작 장비: {selectedTube?.equipment.name ?? '없음'}
      </p>
      {selectedTube && (
        <EquipmentCutawayPreview
          mountSpec={selectedTube.equipment.mount_spec}
          type="tube"
        />
      )}
    </div>
  );
};

export default TubeSelector;
