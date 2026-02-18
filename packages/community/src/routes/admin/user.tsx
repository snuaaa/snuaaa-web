import { createFileRoute } from '@tanstack/react-router';
import UserManagement from '../../pages/UserManagement';

type UserManagementSearch = {
  page?: number;
  sort?: string;
  order?: string;
};

export const Route = createFileRoute('/admin/user')({
  validateSearch: (search: Record<string, unknown>): UserManagementSearch => {
    return {
      page: Number(search.page) || 1,
      sort: (search.sort as string) || undefined,
      order: (search.order as string) || undefined,
    };
  },
  component: UserManagement,
});
