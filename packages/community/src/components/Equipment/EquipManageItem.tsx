import { EquipmentCategoryContext } from 'contexts/EquipmentCategoryContext';
import React, { memo, useContext, useState } from 'react';
import { Equipment } from 'services/types';
import Image from '../../components/Common/AaaImage';
import { EquipmentStatusEnum } from 'common/EquipmentStatusEnum';
import EquipmentRentEnum from 'common/EquipmentRentEnum';
import { convertDateMMDD } from 'utils/convertDate';
import EquipmentEdit, { EditModalInfo } from './EquipmentEdit';

const EquipManageItem: React.FC<{
  equip: Equipment;
  onFinish: () => void;
  onCancel: () => void;
  check: () => boolean;
}> = ({ equip, onFinish, onCancel, check }) => {
  const equipmentCategories = useContext(EquipmentCategoryContext);
  const equipmentStatus = EquipmentStatusEnum.fromValue(equip.status);
  const equipmentRent = EquipmentRentEnum.fromValue(equip.rent_status);

  const [editModalInfo, setEditModalInfo] = useState<EditModalInfo>({
    isModalOpen: false,
    equipment: undefined,
  });

  const handleEdit = () => {
    setEditModalInfo({
      isModalOpen: true,
      equipment: equip,
    });
  };

  const verifyEdit = (commit: boolean) => {
    setEditModalInfo({
      isModalOpen: false,
      equipment: undefined,
    });
    if (commit) onFinish();
    else onCancel();
  };

  return (
    <div className="w-1/3 h-72 flex flex-col" key={equip.id}>
      <div className="relative flex-grow border-2 border-gray-250 mx-2 my-2 px-3">
        <div className="z-1 absolute top-0 right-0">
          <button className="" onClick={handleEdit}>
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
        <div
          className={
            'w-xs text-white text-center font-bold py-2 mx-2 my-4 ' +
            equipmentRent?.toColor2()
          }
        >
          {equipmentRent?.toString2(
            equip.renter?.nickname + ' ~' + convertDateMMDD(equip.end_date),
          )}
        </div>
      </div>
      {editModalInfo.isModalOpen && check() && (
        <EquipmentEdit
          editModalInfo={editModalInfo}
          onFinishEdit={() => verifyEdit(true)}
          onCancel={() => verifyEdit(false)}
        />
      )}
    </div>
  );
};

export default memo(EquipManageItem);
