import { createFileRoute } from '@tanstack/react-router';
import EquipmentRent from '~/components/Equipment/Rent';
import {
  RENT_SORTS,
  RentFilter,
  RentSort,
} from '~/components/Equipment/Rental/rentUtils';
import { EquipmentStatus } from '~/services/types';

export const Route = createFileRoute('/equipment/rent')({
  component: EquipmentRent,
  validateSearch: (search: Record<string, unknown>): RentFilter => ({
    // The router parses `?keyword=123` as a number.
    keyword:
      typeof search.keyword === 'string' || typeof search.keyword === 'number'
        ? String(search.keyword) || undefined
        : undefined,
    category_id: Number(search.category_id) || undefined,
    status: Object.values(EquipmentStatus).includes(
      search.status as EquipmentStatus,
    )
      ? (search.status as EquipmentStatus)
      : undefined,
    available:
      search.available === true || search.available === 'true' || undefined,
    sort: RENT_SORTS.some(({ value }) => value === search.sort)
      ? (search.sort as RentSort)
      : undefined,
  }),
});
