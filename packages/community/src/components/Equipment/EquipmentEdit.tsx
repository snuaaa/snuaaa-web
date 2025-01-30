import { useAuth } from 'contexts/auth';
import { useCallback } from 'react';
import { useHistory, useParams } from 'react-router';
import EquipmentService from 'services/EquipmentService';
import { Equipment } from 'services/types';

export type EditModalInfo = {
  isModalOpen: boolean;
  equipment: Equipment | null;
};

type Props = {
  editModalInfo: EditModalInfo;
  onFinishEdit: () => void;
  onCancel: () => void;
};

// Modal to create or edit equipment
const EquipmentEdit: React.FC<Props> = ({
  editModalInfo,
  onFinishEdit,
  onCancel,
}) => {
  const { equipment_id: equipmentId } = useParams<{ equipment_id: string }>();
  const history = useHistory();

  return (
    <div>
      <h1>Equipment Edit</h1>
    </div>
  );
};

export default EquipmentEdit;
