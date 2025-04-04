import { FC, useState } from 'react';
import EquipmentForm from '../Form';
import EquipmentService, {
  UpdateEquipmentRequest,
} from '~/services/EquipmentService';
import { Equipment } from '~/services/types';
import { useModal } from '~/contexts/modal';

type Props = {
  editingEquipment: Equipment;
  onEdit: () => void;
};

const EditModal: FC<Props> = ({ editingEquipment, onEdit }) => {
  const [equipment, setEquipment] = useState<UpdateEquipmentRequest>({
    ...editingEquipment,
  });

  const { closeModal } = useModal();

  const handleSubmit = async () => {
    // TODO: Implement Edit Equipment
    await EquipmentService.updateEquipment(equipment);
    closeModal();
    onEdit();
  };

  const handleDelete = async () => {
    const goDrop = window.confirm('정말로 삭제하시겠습니까?');
    if (!goDrop) return;
    await EquipmentService.deleteEquipment(equipment.id);
    closeModal();
    onEdit();
  };

  const handleChangeInput = (
    key: keyof UpdateEquipmentRequest,
    value: UpdateEquipmentRequest[keyof UpdateEquipmentRequest],
  ) => {
    setEquipment((prev) => ({ ...prev, [key]: value }));
  };

  const handleChangeSelect = (
    key: keyof UpdateEquipmentRequest,
    value: UpdateEquipmentRequest[keyof UpdateEquipmentRequest],
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
      onDelete={handleDelete}
      onCancel={closeModal}
    />
  );
};

export default EditModal;
