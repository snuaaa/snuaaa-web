import { FC, useState } from 'react';
import EquipmentForm from '../Form';
import EquipmentService, {
  EquipmentUploadRequest,
} from 'services/EquipmentService';
import { EquipmentStatus } from 'services/types';
import { useModal } from 'contexts/modal';

const CreateModal: FC = () => {
  const [equipment, setEquipment] = useState<EquipmentUploadRequest>({
    name: '',
    category_id: 0,
    status: EquipmentStatus.OK,
    location: '',
    maker: '',
    description: '',
    img_path: '',
  });

  const { closeModal } = useModal();

  const handleSubmit = async () => {
    await EquipmentService.uploadEquipment(equipment);
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
      title="새 장비 등록"
      submitText="장비 등록하기"
      equipment={equipment}
      onChangeInput={handleChangeInput}
      onChangeSelect={handleChangeSelect}
      onSubmit={handleSubmit}
      onCancel={closeModal}
    />
  );
};

export default CreateModal;
