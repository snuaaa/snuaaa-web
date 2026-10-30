import { createFileRoute } from '@tanstack/react-router';
import UserManagement, {
  SortOrder,
  UserManagementSearch,
  UserSort,
} from '../../pages/UserManagement';

export const Route = createFileRoute('/admin/user')({
  validateSearch: (search: Record<string, unknown>): UserManagementSearch => ({
    page: Number(search.page) > 1 ? Number(search.page) : undefined,
    sort: (search.sort as UserSort) || undefined,
    order: (search.order as SortOrder) || undefined,
  }),
  component: UserManagement,
});
