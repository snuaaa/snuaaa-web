import { FC, useContext } from 'react';
import { Equipment, EquipmentRentStatus } from '~/services/types';
import { EquipmentCategoryContext } from '~/contexts/EquipmentCategoryContext';
import {
  equipmentRentColorMap,
  equipmentStatusColorMap,
  equipmentStatusTextMap,
} from '../../common';
import { convertDateMMDD } from '~/utils/convertDate';

type Props = {
  equipment: Equipment;
};

const mapEquipmentRentStatText = (equipment: Equipment) => {
  return equipment.rent_status === EquipmentRentStatus.RENTABLE
    ? '대여 가능'
    : equipment.rent_status === EquipmentRentStatus.UNRENTABLE
      ? '대여 불가'
      : `${equipment.renter?.nickname} ~ ${convertDateMMDD(equipment.end_date)}`;
};

const BasicInfo: FC<Props> = ({ equipment }) => {
  const { categories } = useContext(EquipmentCategoryContext);

  return (
    <>
      <div className="mt-2">
        <div className="font-bold mr-3 inline-block">분류</div>
        <div className="inline-block">
          {
            categories.find((category) => category.id === equipment.category_id)
              ?.name
          }
        </div>
      </div>
      <div className="my-2">
        <div className="font-bold mr-3 inline-block">상태</div>
        <div
          className={`inline-block ${equipmentStatusColorMap[equipment.status]}`}
        >
          {equipmentStatusTextMap[equipment.status]}
        </div>
      </div>
      <div className="my-2">
        <div className="font-bold mr-3 inline-block">위치</div>
        <div className="inline-block">{equipment.location}</div>
      </div>
      <div className="my-2">
        <div className="font-bold mr-3 inline-block">대여</div>
        <div
          className={`inline-block ${equipmentRentColorMap[equipment.rent_status]}`}
        >
          {mapEquipmentRentStatText(equipment)}
        </div>
      </div>
    </>
  );
};

export default BasicInfo;
