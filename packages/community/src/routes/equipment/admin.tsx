import { createFileRoute } from '@tanstack/react-router';
import EquipmentAdmin from '~/components/Equipment/Admin';
import { EquipmentRentStatus, EquipmentStatus } from '~/services/types';

export type EquipSearchLocationState = {
  category_id?: number; // Make properties optional as search params can be undefined
  keyword?: string;
  maker?: string;
  status?: EquipmentStatus | '';
  rent_status?: EquipmentRentStatus | '';
  sort_by?: SortBy;
  sort_order?: SortOrder;
};

export enum SortOrder {
  ASC = 'ASC', // 오름차순
  DESC = 'DESC', // 내림차순
}

export enum SortBy {
  NAME = 'name', // 장비명
  CREATED_AT = 'createdAt', // 등록일자
  CATEGORY = 'category_id', // 분류
}

export const Route = createFileRoute('/equipment/admin')({
  component: EquipmentAdmin,
  validateSearch: (
    search: Record<string, unknown>,
  ): EquipSearchLocationState => {
    return {
      category_id: Number(search.category_id) || undefined,
      keyword: (search.keyword as string) || undefined,
      maker: (search.maker as string) || undefined,
      status: (search.status as EquipmentStatus) || undefined,
      rent_status: (search.rent_status as EquipmentRentStatus) || undefined,
      sort_by: (search.sort_by as SortBy) || undefined,
      sort_order: (search.sort_order as SortOrder) || undefined,
    };
  },
});
