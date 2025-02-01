import { EquipmentCategoryContext } from 'contexts/EquipmentCategoryContext';
import React, { useContext } from 'react';
import { Equipment } from 'services/types';
import Image from '../../components/Common/AaaImage';
import { EquipmentStatusEnum } from 'common/EquipmentStatusEnum';
import EquipmentRentEnum from 'common/EquipmentRentEnum';
import { convertDateMMDD } from 'utils/convertDate';

const EquipRentItem: React.FC<{
  equip: Equipment;
  addItem: () => void;
  removeItem: () => void;
  immdeiateRent: () => void;
  selected: boolean;
}> = ({ equip, addItem, removeItem, immdeiateRent, selected }) => {
  const equipmentCategories = useContext(EquipmentCategoryContext);
  const equipmentStatus = EquipmentStatusEnum.fromValue(equip.status);
  const equipmentRent = EquipmentRentEnum.fromValue(equip.rent_status);

  const addOrRemoveItem = () => {
    if (!selected && equipmentRent?.isAccessible) {
      addItem();
    } else if (selected) {
      removeItem();
    }
  };

  const AddButton = () => {
    return (
      <button
        className={
          'text-center w-1/5 font-bold py-2 mr-2 my-4 float-right ' +
          (equipmentRent?.isAccessible
            ? selected
              ? 'text-cyan-600 border border-cyan-600'
              : 'text-black bg-gray-200'
            : 'text-black bg-gray-200')
        }
        onClick={addOrRemoveItem}
      >
        {equipmentRent?.isAccessible ? (selected ? 'X' : '+') : '-'}
      </button>
    );
  };

  const rent = () => {
    if (equipmentRent?.isAccessible && !selected) {
      immdeiateRent();
    } else if (selected) {
      removeItem();
      immdeiateRent();
    } else {
      alert('대여할 수 없는 장비입니다.');
    }
  };

  return (
    <div className="w-1/2 h-72 flex flex-col" key={equip.id}>
      <div
        className={
          'relative flex-grow mx-2 my-2 px-3' +
          (selected ? ' border-2 border-cyan-600' : ' border-2 border-gray-250')
        }
      >
        <div className="z-1 absolute top-0 right-0">
          <button className="">
            <i className="ri-pencil-line text-2xl"></i>
          </button>
        </div>
        <div className="text-base font-bold mt-2 mr-3">{equip.name}</div>
        <div className="equip-picture">
          <Image imgSrc={equip.img_path} />
        </div>
        <div className="h-100 my-2">
          <div className="font-bold mr-3 inline-block">분류</div>
          <div className="inline-block">
            {
              equipmentCategories?.find(
                (category) => category.id === equip.category_id,
              )?.name
            }
          </div>
        </div>
        <div className="my-2">
          <div className="font-bold mr-3 inline-block">상태</div>
          <div className={'inline-block ' + equipmentStatus?.toColor()}>
            {equipmentStatus?.toString()}
          </div>
        </div>
        <div className="my-2">
          <div className="font-bold mr-3 inline-block">위치</div>
          <div className="inline-block">{equip.location}</div>
        </div>
        <div className="equip-rent-wrapper">
          <button
            className={
              'w-3/5 text-center font-bold py-2 ml-2 my-4 float-left ' +
              equipmentRent?.toColor
            }
            onClick={rent}
          >
            {equipmentRent?.toString(
              equip.renter?.nickname + ' ~' + convertDateMMDD(equip.end_date),
            )}
          </button>
          <AddButton />
        </div>
      </div>
    </div>
  );
};

export default EquipRentItem;
