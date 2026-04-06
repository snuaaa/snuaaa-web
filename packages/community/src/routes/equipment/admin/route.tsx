import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/equipment/admin')({
  component: AdminLayout,
});

function AdminLayout() {
  return <Outlet />;
}
