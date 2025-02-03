import { FC, useState } from 'react';
import EquipmentForm from '../Form';
import EquipmentService, {
  EquipmentUploadRequest,
} from 'services/EquipmentService';
import { Equipment } from 'services/types';

type Props = {
  editingEquipment: Equipment;
  onCancel: () => void;
};

const CreateModal: FC<Props> = ({ editingEquipment, onCancel }) => {
  const [equipment, setEquipment] = useState<EquipmentUploadRequest>({
    ...editingEquipment,
  });

  const handleSubmit = async () => {
    // TODO: Implement Edit Equipment
  };

  const handleChangeInput = (
    key: keyof EquipmentUploadRequest,
    value: EquipmentUploadRequest[keyof EquipmentUploadRequest],
  ) => {
    setEquipment((prev) => ({ ...prev, [key]: value }));
  };

  const handleChangeSelect = (
    key: keyof EquipmentUploadRequest,
    value: EquipmentUploadRequest[keyof EquipmentUploadRequest],
  ) => {
    setEquipment((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <EquipmentForm
      title="장비 정보 수정"
      submitText="수정 완료"
      equipment={equipment}
      onChangeInput={handleChangeInput}
      onChangeSelect={handleChangeSelect}
      onSubmit={handleSubmit}
      onCancel={onCancel}
    />
  );
};

export default CreateModal;
