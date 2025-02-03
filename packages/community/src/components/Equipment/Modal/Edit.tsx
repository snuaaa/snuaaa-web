import { FC, useState } from 'react';
import EquipmentForm from '../Form';
import EquipmentService, {
  EquipmentUploadRequest,
} from 'services/EquipmentService';
import { Equipment } from 'services/types';
import { useModal } from 'contexts/modal';

type Props = {
  editingEquipment: Equipment;
  onEdit: () => void;
};

const EditModal: FC<Props> = ({ editingEquipment, onEdit }) => {
  const [equipment, setEquipment] = useState<EquipmentUploadRequest>({
    ...editingEquipment,
  });

  const { closeModal } = useModal();

  const handleSubmit = async () => {
    // TODO: Implement Edit Equipment
    closeModal();
    onEdit();
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
      onCancel={closeModal}
    />
  );
};

export default EditModal;
