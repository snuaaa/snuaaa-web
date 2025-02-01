import { Equipment, SearchInfo } from 'services/types';
import React, { useContext } from 'react';
import { EquipmentCategoryContext } from 'contexts/EquipmentCategoryContext';
import { useShopping } from 'contexts/ShoppingContext';
import EquipRentItem from './EquipRentItem';
import EquipmentService, {
  RentEquipmentRequest,
} from 'services/EquipmentService';

const RentModelProvider: React.FC<{
  equips: Equipment[];
  searchInfo: SearchInfo | undefined;
  limit: number;
  confirm: () => void;
}> = ({ equips, searchInfo, limit, confirm }) => {
  const equipmentCategories = useContext(EquipmentCategoryContext);
  const { cart, addItem, removeItem } = useShopping();

  const immediateRent = (equipId: number) => {
    const datarequest: RentEquipmentRequest = {
      equipmentIds: [equipId],
    };
    EquipmentService.rentEquipment(datarequest)
      .then((res) => {
        if (res.data.successIds.includes(equipId)) {
          confirm();
        } else {
          alert('대여에 실패했습니다.');
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

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
            <EquipRentItem
              equip={equip}
              key={equip.id}
              addItem={() => addItem(equip.id)}
              removeItem={() => removeItem(equip.id)}
              immdeiateRent={() => immediateRent(equip.id)}
              selected={cart.includes(equip.id)}
            />
          );
        }
        return null;
      });
  }
  return null;
};

export default RentModelProvider;
