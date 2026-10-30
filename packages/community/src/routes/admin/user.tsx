import { createFileRoute } from '@tanstack/react-router';
import UserManagement, {
  SortOrder,
  UserManagementSearch,
  UserSort,
} from '../../pages/UserManagement';

const SORTS: UserSort[] = [
  'id',
  'nickname',
  'aaa_no',
  'grade',
  'created_at',
  'login_at',
];
const ORDERS: SortOrder[] = ['ASC', 'DESC'];

export const Route = createFileRoute('/admin/user')({
  validateSearch: (search: Record<string, unknown>): UserManagementSearch => ({
    page: Number(search.page) > 1 ? Number(search.page) : undefined,
    // The API puts sort straight into ORDER BY, so pass known columns only.
    sort: SORTS.find((sort) => sort === search.sort),
    order: ORDERS.find((order) => order === search.order),
  }),
  component: UserManagement,
});
