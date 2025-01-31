import { EquipmentCategoryContext } from 'contexts/EquipmentCategoryContext';
import React, { useContext, useState } from 'react';
import { Equipment } from 'services/types';
import EquipManageItem from './EquipManageItem';
import { is } from 'immutable';

export type SearchInfo = {
  category_id: number;
  status: string;
  keyword: string;
};

const ItemModelProvider: React.FC<{
  equips: Equipment[];
  searchInfo: SearchInfo | undefined;
  limit: number;
  confirm: () => void;
}> = ({ equips, searchInfo, limit, confirm }) => {
  const equipmentCategories = useContext(EquipmentCategoryContext);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (equips.length > 0 && equipmentCategories) {
    return equips
      .filter((equip) => {
        if (
          searchInfo &&
          searchInfo.category_id !== 0 &&
          equip.category_id !== searchInfo.category_id
        )
          return false;
        if (
          searchInfo &&
          searchInfo.status !== '' &&
          equip.status !== searchInfo.status
        )
          return false;
        if (
          searchInfo &&
          searchInfo.keyword !== '' &&
          !equip.name.toLowerCase().includes(searchInfo.keyword.toLowerCase())
        )
          return false;
        return true;
      })
      .map((equip, index) => {
        if (index < limit) {
          return (
            <EquipManageItem
              equip={equip}
              key={equip.id}
              onFinish={() => {
                confirm();
                setIsModalOpen(false);
              }}
              onCancel={() => {
                setIsModalOpen(false);
              }}
              check={() => !isModalOpen}
            />
          );
        }
        return null;
      });
  }
  return null;
};

export default ItemModelProvider;
