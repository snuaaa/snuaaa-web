import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/equipment')({
  component: EquipmentLayout,
});

function EquipmentLayout() {
  return <Outlet />;
}
