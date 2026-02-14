import { createFileRoute } from '@tanstack/react-router';
import EquipmentMain from '~/components/Equipment/Main';

export const Route = createFileRoute('/equipment/')({
  component: EquipmentMain,
});
