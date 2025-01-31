import { EquipmentCategoryContext } from 'contexts/EquipmentCategoryContext';
import React, { useContext } from 'react';
import { Equipment } from 'services/types';
import Image from '../../components/Common/AaaImage';
import { EquipmentStatusEnum } from 'common/EquipmentStatusEnum';
import EquipmentRentEnum from 'common/EquipmentRentEnum';
import { convertDateMMDD } from 'utils/convertDate';

const EquipRentItem: React.FC<{ equip: Equipment }> = ({ equip }) => {
  const equipmentCategories = useContext(EquipmentCategoryContext);
  const equipmentStatus = EquipmentStatusEnum.fromValue(equip.status);
  const equipmentRent = EquipmentRentEnum.fromValue(equip.rent_status);

  return (
    <div className="w-1/3 h-72 flex flex-col" key={equip.id}>
      <div className="relative flex-grow border-2 border-gray-250 mx-2 my-2 px-3">
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
          <div
            className={
              'w-3/5 text-center font-bold py-2 ml-2 my-4 float-left ' +
              equipmentRent?.toColor
            }
          >
            {equipmentRent?.toString(
              equip.renter?.nickname + ' ~' + convertDateMMDD(equip.end_date),
            )}
          </div>
          <div
            className={
              'text-center w-1/5 font-bold py-2 mr-2 my-4 float-right ' +
              (equipmentRent?.isAccessible
                ? 'text-cyan-600 border border-cyan-600'
                : 'text-black bg-gray-200')
            }
          >
            {equipmentRent?.isAccessible ? '+' : '-'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipRentItem;
