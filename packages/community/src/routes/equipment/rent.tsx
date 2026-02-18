import { createFileRoute } from '@tanstack/react-router';
import EquipmentRent from '~/components/Equipment/Rent';
import {
  EquipSearchLocationState,
  SortBy,
  SortOrder,
} from '~/components/Equipment/common';
import { EquipmentRentStatus, EquipmentStatus } from '~/services/types';

export const Route = createFileRoute('/equipment/rent')({
  component: EquipmentRent,
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
