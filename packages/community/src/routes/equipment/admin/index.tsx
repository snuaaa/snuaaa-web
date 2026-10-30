import { createFileRoute } from '@tanstack/react-router';
import EquipmentAdmin, {
  EquipmentAdminSearch,
} from '~/components/Equipment/Admin/EquipmentAdmin';
import { EquipmentStatus } from '~/services/types';

export const Route = createFileRoute('/equipment/admin/')({
  component: EquipmentAdmin,
  validateSearch: (search: Record<string, unknown>): EquipmentAdminSearch => ({
    keyword: (search.keyword as string) || undefined,
    category_id: Number(search.category_id) || undefined,
    status: (search.status as EquipmentStatus) || undefined,
  }),
});
