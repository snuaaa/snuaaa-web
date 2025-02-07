import { FC, useContext, useState } from 'react';
import EquipmentForm from '../Form';
import EquipmentService, {
  CreateEquipmentRequest,
} from 'services/EquipmentService';
import { EquipmentStatus } from 'services/types';
import { useModal } from 'contexts/modal';
import { EquipmentCategoryContext } from 'contexts/EquipmentCategoryContext';

type Props = {
  onCreate: () => void;
};

const CreateModal: FC<Props> = ({ onCreate }) => {
  const { categories } = useContext(EquipmentCategoryContext);
  const [equipment, setEquipment] = useState<CreateEquipmentRequest>({
    name: '',
    nickname: '',
    category_id: categories[0].id,
    status: EquipmentStatus.OK,
    location: '',
    maker: '',
    description: '',
    img_path: '',
  });

  const { closeModal } = useModal();

  const handleSubmit = async () => {
    await EquipmentService.createEquipment(equipment);
    closeModal();
    onCreate();
  };

  const handleChangeInput = (
    key: keyof CreateEquipmentRequest,
    value: CreateEquipmentRequest[keyof CreateEquipmentRequest],
  ) => {
    setEquipment((prev) => ({ ...prev, [key]: value }));
  };

  const handleChangeSelect = (
    key: keyof CreateEquipmentRequest,
    value: CreateEquipmentRequest[keyof CreateEquipmentRequest],
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
