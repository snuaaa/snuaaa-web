import { createFileRoute } from '@tanstack/react-router';
import LateFeesAdmin, {
  LateFeesSearch,
} from '~/components/Equipment/Admin/LateFeesAdmin';
import { PenaltyStatus } from '~/services/types';

export const Route = createFileRoute('/equipment/admin/fees')({
  component: LateFeesAdmin,
  validateSearch: (search: Record<string, unknown>): LateFeesSearch => ({
    penalty_status: (search.penalty_status as PenaltyStatus) || undefined,
    date_from_start: (search.date_from_start as string) || undefined,
    date_to_start: (search.date_to_start as string) || undefined,
    page: Number(search.page) > 1 ? Number(search.page) : undefined,
  }),
});
