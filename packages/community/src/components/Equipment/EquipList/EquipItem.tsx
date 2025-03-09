import { FC, useContext } from 'react';
import { Equipment, EquipmentRentStatus } from 'services/types';
import Image from '../../Common/AaaImage';
import { EquipmentCategoryContext } from 'contexts/EquipmentCategoryContext';
import { convertDateMMDD } from 'utils/convertDate';
import { useEquipment } from '../contexts';
import EditModal from '../Modal/Edit';
import { useModal } from 'contexts/modal';
import RentRecords from '../Modal/RentRecords';
import EquipDescription from '../Modal/EquipDescription';
import {
  equipmentRentColorMap,
  equipmentStatusColorMap,
  equipmentStatusTextMap,
} from '../common';
import { useViewportSize } from 'contexts/viewportSize';

const mapEquipmentRentStatText = (equip: Equipment) => {
  return equip.rent_status === EquipmentRentStatus.RENTABLE
    ? '대여 가능'
    : equip.rent_status === EquipmentRentStatus.UNRENTABLE
      ? '대여 불가'
      : `${equip.renter?.nickname} ~ ${convertDateMMDD(equip.end_date)}`;
};

const mapEquipmentRentButtonText = (equip: Equipment) => {
  return equip.rent_status === EquipmentRentStatus.RENTABLE
    ? '바로 대여'
    : equip.rent_status === EquipmentRentStatus.UNRENTABLE
      ? '대여 불가'
      : `${equip.renter?.nickname} ~ ${convertDateMMDD(equip.end_date)}`;
};

type Props = {
  equip: Equipment;
  type: 'rent' | 'admin';
};

const EquipItem: FC<Props> = ({ equip, type }) => {
  const { categories } = useContext(EquipmentCategoryContext);

  const { width } = useViewportSize();

  const { refresh, rentSingleEquipment, cart, addToCart, removeFromCart } =
    useEquipment();
  const { openModal } = useModal();

  const handleClickEquipmentEdit = (equipment: Equipment) => {
    openModal(<EditModal editingEquipment={equipment} onEdit={refresh} />);
  };

  const handleClickEquipmentRent = (equipment: Equipment) => {
    window.confirm('이 장비를 대여하시겠습니까?') &&
      rentSingleEquipment(equipment);
  };

  const handleClickEquipmentCart = (equipment: Equipment) => {
    if (cart.find((equip: Equipment) => equip.id === equipment.id)) {
      removeFromCart(equipment);
    } else {
      addToCart(equipment);
    }
  };

  const basicInfo = (
    <>
      <div className="mt-4 mb-2">
        <div className="font-bold mr-3 inline-block">분류</div>
        <div className="inline-block">
          {
            categories.find((category) => category.id === equip.category_id)
              ?.name
          }
        </div>
      </div>
      <div className="my-2">
        <div className="font-bold mr-3 inline-block">상태</div>
        <div
          className={`inline-block ${equipmentStatusColorMap[equip.status]}`}
        >
          {equipmentStatusTextMap[equip.status]}
        </div>
      </div>
      <div className="my-2">
        <div className="font-bold mr-3 inline-block">위치</div>
        <div className="inline-block">{equip.location}</div>
      </div>
    </>
  );

  const buttons =
    type === 'admin' ? (
      <>
        <div className="z-1 absolute top-0 right-0 bg-gray-200 px-1 text-gray-500">
          <button
            onClick={() => handleClickEquipmentEdit(equip)}
            className="mr-1"
          >
            <i className="ri-edit-2-fill text-xl"></i>
          </button>
          <button onClick={() => openModal(<RentRecords id={equip.id} />)}>
            <i className="ri-file-list-2-line text-xl"></i>
          </button>
        </div>
        <div
          className={`w-xs text-white text-center font-bold py-2 my-4 ${equipmentRentColorMap[equip.rent_status]}`}
        >
          {mapEquipmentRentStatText(equip)}
        </div>
      </>
    ) : (
      <>
        <div className="z-1 absolute top-0 right-0 bg-gray-200 px-1 text-gray-500">
          <button
            onClick={() => openModal(<EquipDescription equipment={equip} />)}
          >
            <i className="ri-information-line text-xl"></i>
          </button>
        </div>
        <div className="flex">
          <div className="w-4/5 pr-2">
            <button
              onClick={() => handleClickEquipmentRent(equip)}
              disabled={equip.rent_status !== EquipmentRentStatus.RENTABLE}
              className={
                'text-center font-bold py-2 my-4 w-full float-left ' +
                (equip.rent_status === EquipmentRentStatus.RENTABLE
                  ? 'text-cyan-600 border border-cyan-600'
                  : 'text-black bg-gray-200')
              }
            >
              {mapEquipmentRentButtonText(equip)}
            </button>
          </div>
          <div className="w-1/5">
            <button
              onClick={() => handleClickEquipmentCart(equip)}
              disabled={equip.rent_status !== EquipmentRentStatus.RENTABLE}
              className={
                'text-center w-full font-bold py-2 my-4 float-right ' +
                (equip.rent_status === EquipmentRentStatus.RENTABLE
                  ? cart?.find((eq: Equipment) => eq.id === equip.id)
                    ? 'text-white bg-cyan-600 border border-cyan-600'
                    : 'text-cyan-600 border border-cyan-600'
                  : 'text-black bg-gray-200')
              }
            >
              {equip.rent_status === EquipmentRentStatus.RENTABLE
                ? cart?.find((eq: Equipment) => eq.id === equip.id)
                  ? 'X'
                  : '+'
                : '-'}
            </button>
          </div>
        </div>
      </>
    );

  return (
    <div className="flex flex-col" key={equip.id}>
      <div className="relative flex-grow border-2 border-gray-250 mx-2 my-2 px-3">
        {width < 500 ? (
          <>
            <div className="w-2/5 inline-block align-middle">
              <div className="my-2">
                <Image imgSrc={equip.img_path} className="h-24 mx-auto" />
              </div>
            </div>
            <div className="w-3/5 inline-block pl-4 align-middle">
              <div className="text-base font-bold mt-2 mr-3">{equip.name}</div>
              {basicInfo}
              {buttons}
            </div>
          </>
        ) : (
          <>
            <div className={`text-base font-bold mt-2 mr-3`}>{equip.name}</div>
            <div className="my-2">
              <Image imgSrc={equip.img_path} className="h-24 mx-auto" />
            </div>
            {basicInfo}
            {buttons}
          </>
        )}
      </div>
    </div>
  );
};

export default EquipItem;
