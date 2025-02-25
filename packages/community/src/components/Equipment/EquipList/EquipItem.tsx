import { FC, PropsWithChildren, useContext } from 'react';
import { Equipment, EquipmentStatus } from 'services/types';
import Image from '../../Common/AaaImage';
import { EquipmentCategoryContext } from 'contexts/EquipmentCategoryContext';

const equipmentStatusColorMap: Record<EquipmentStatus, string> = {
  [EquipmentStatus.OK]: 'text-green-600',
  [EquipmentStatus.BROKEN]: 'text-red-600',
  [EquipmentStatus.REPAIRING]: 'text-yellow-600',
  [EquipmentStatus.LOST]: 'text-gray-500',
  [EquipmentStatus.ETC]: 'text-gray-500',
};

const equipmentStatusTextMap: Record<EquipmentStatus, string> = {
  [EquipmentStatus.OK]: '양호',
  [EquipmentStatus.BROKEN]: '수리 필요',
  [EquipmentStatus.REPAIRING]: '수리 중',
  [EquipmentStatus.LOST]: '분실',
  [EquipmentStatus.ETC]: '기타',
};

type Props = {
  equip: Equipment;
};

const EquipItem: FC<PropsWithChildren<Props>> = ({ equip, children }) => {
  const { categories } = useContext(EquipmentCategoryContext);
  return (
    <div className="w-1/3 h-72 flex flex-col" key={equip.id}>
      <div className="relative flex-grow border-2 border-gray-250 mx-2 my-2 px-3">
        <div className="text-base font-bold mt-2 mr-3">{equip.name}</div>
        <div className="equip-picture">
          <Image imgSrc={equip.img_path} />
        </div>
        <div className="h-100 my-2">
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
        {children}
      </div>
    </div>
  );
};

export default EquipItem;
