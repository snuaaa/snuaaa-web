import { FC } from 'react';
import { Equipment, EquipmentRentStatus } from '~/services/types';
import { convertDateMMDD } from '~/utils/convertDate';
import { useEquipment } from '../../contexts';
import { useModal } from '~/contexts/modal';
import EquipDescription from '../../Modal/EquipDescription';

const mapEquipmentRentButtonText = (equip: Equipment) => {
  return equip.rent_status === EquipmentRentStatus.RENTABLE
    ? '바로 대여'
    : equip.rent_status === EquipmentRentStatus.UNRENTABLE
      ? '대여 불가'
      : `${equip.renter?.nickname} ~ ${convertDateMMDD(equip.end_date)}`;
};

type Props = {
  equipment: Equipment;
};

const RentButton: FC<Props> = ({ equipment }) => {
  const { rentSingleEquipment, cart, addToCart, removeFromCart } =
    useEquipment();
  const { openModal } = useModal();

  const handleClickEquipmentRent = (equipment: Equipment) => {
    const isConfirmed = window.confirm('이 장비를 대여하시겠습니까?')
    if (isConfirmed) {
      rentSingleEquipment(equipment);
    }
  };

  const handleClickEquipmentCart = (equipment: Equipment) => {
    if (cart.find((equip: Equipment) => equip.id === equipment.id)) {
      removeFromCart(equipment);
    } else {
      addToCart(equipment);
    }
  };

  return (
    <>
      <div className="z-1 absolute top-0 right-0 bg-gray-200 px-1 text-gray-500">
        <button
          onClick={() => openModal(<EquipDescription equipment={equipment} />)}
        >
          <i className="ri-information-line text-xl"></i>
        </button>
      </div>
      <div className="flex py-2 gap-2">
        <button
          onClick={() => handleClickEquipmentRent(equipment)}
          disabled={equipment.rent_status !== EquipmentRentStatus.RENTABLE}
          className={
            'text-center font-bold py-2 grow ' +
            (equipment.rent_status === EquipmentRentStatus.RENTABLE
              ? 'text-cyan-600 border border-cyan-600'
              : 'text-black bg-gray-200')
          }
        >
          {mapEquipmentRentButtonText(equipment)}
        </button>
        <button
          onClick={() => handleClickEquipmentCart(equipment)}
          disabled={equipment.rent_status !== EquipmentRentStatus.RENTABLE}
          className={
            'text-center font-bold p-2 ' +
            (equipment.rent_status === EquipmentRentStatus.RENTABLE
              ? cart?.find((eq: Equipment) => eq.id === equipment.id)
                ? 'text-white bg-cyan-600 border border-cyan-600'
                : 'text-cyan-600 border border-cyan-600'
              : 'text-black bg-gray-200')
          }
        >
          {equipment.rent_status === EquipmentRentStatus.RENTABLE
            ? cart?.find((eq: Equipment) => eq.id === equipment.id)
              ? 'X'
              : '+'
            : '-'}
        </button>
      </div>
    </>
  );
};

export default RentButton;
