import { createFileRoute } from '@tanstack/react-router';
import LateFees from '~/components/Equipment/LateFees';
import { PenaltyStatus } from '~/services/types';

export type FeeSearchState = {
  penalty_status?: PenaltyStatus;
  date_from_start?: string;
  date_to_start?: string;
  date_from_return?: string;
  date_to_return?: string;
  page?: number;
};

export const Route = createFileRoute('/equipment/admin/fees')({
  component: LateFees,
  validateSearch: (search: Record<string, unknown>): FeeSearchState => {
    return {
      penalty_status: (search.penalty_status as PenaltyStatus) || undefined,
      date_from_start: (search.date_from_start as string) || undefined,
      date_to_start: (search.date_to_start as string) || undefined,
      date_from_return: (search.date_from_return as string) || undefined,
      date_to_return: (search.date_to_return as string) || undefined,
      page: Number(search.page) || 1,
    };
  },
});
