import { FC } from 'react';
import { Equipment } from '~/services/types';
import { useEquipment } from '../../contexts';
import EditModal from '../../Modal/Edit';
import { useModal } from '~/contexts/modal';
import RentRecords from '../../Modal/RentRecords';

type Props = {
  equipment: Equipment;
};

const ManagementButton: FC<Props> = ({ equipment }) => {
  const { refresh } = useEquipment();
  const { openModal } = useModal();

  const handleClickEquipmentEdit = (equipment: Equipment) => {
    openModal(<EditModal editingEquipment={equipment} onEdit={refresh} />);
  };

  return (
    <>
      <div className="flex gap-1 ">
        <button
          onClick={() => handleClickEquipmentEdit(equipment)}
          className="bg-gray-400 p-2 text-white flex-auto"
        >
          수정
        </button>
        <button
          onClick={() => openModal(<RentRecords id={equipment.id} />)}
          className="bg-gray-400 p-2 text-white flex-auto"
        >
          대여 기록
        </button>
      </div>
    </>
  );
};

export default ManagementButton;
