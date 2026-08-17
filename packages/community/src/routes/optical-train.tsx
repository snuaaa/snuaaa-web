import { createFileRoute } from '@tanstack/react-router';
import OpticalTrainPage from '../components/OpticalTrain/OpticalTrainPage';

export const Route = createFileRoute('/optical-train')({
  component: OpticalTrainPage,
});
