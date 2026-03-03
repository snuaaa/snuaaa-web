import { FC, useState } from 'react';
import EquipmentForm from '../Form';
import { CreateEquipmentRequest } from '~/services/EquipmentService';
import { EquipmentStatus } from '~/services/types';
import { useModal } from '~/contexts/modal';
import {
  useEquipmentCategories,
  useCreateEquipment,
} from '~/hooks/queries/useEquipmentQueries';

type Props = {
  onCreate: () => void;
};

const CreateModal: FC<Props> = ({ onCreate }) => {
  const { data: categories = [] } = useEquipmentCategories();
  const [equipment, setEquipment] = useState<CreateEquipmentRequest>({
    name: '',
    nickname: '',
    category_id: categories[0]?.id ?? 0,
    status: EquipmentStatus.OK,
    location: '',
    maker: '',
    description: '',
    img_path: '',
  });

  const { closeModal } = useModal();
  const { mutateAsync: mutateCreateEquipment } = useCreateEquipment();

  const handleSubmit = async () => {
    await mutateCreateEquipment(equipment);
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
