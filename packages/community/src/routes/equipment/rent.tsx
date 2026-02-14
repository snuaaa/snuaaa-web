import { createFileRoute } from '@tanstack/react-router';
import EquipmentRent from '~/components/Equipment/Rent';

export const Route = createFileRoute('/equipment/rent')({
  component: EquipmentRent,
});
