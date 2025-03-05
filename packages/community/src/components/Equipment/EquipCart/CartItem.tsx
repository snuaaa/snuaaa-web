import { FC, PropsWithChildren, useContext } from 'react';
import { Equipment, EquipmentStatus } from 'services/types';
import Image from '../../Common/AaaImage';
import { EquipmentCategoryContext } from 'contexts/EquipmentCategoryContext';

type Props = {
  equip: Equipment;
  onClickCancel: () => void;
  columns: number;
};

const CartItem: FC<Props> = ({ equip, onClickCancel, columns }) => {
  const { categories } = useContext(EquipmentCategoryContext);
  return (
    <div
      className={
        (columns === 1 ? 'w-full' : 'w-1/' + columns.toString()) + ' h-24 flex'
      }
      key={equip.id}
    >
      <div className="relative flex-grow border-2 border-gray-250 mx-1 my-1">
        <div className="equip-picture">
          <Image
            imgSrc={equip.img_path}
            className="max-h-16 object-contain max-w-full mx-auto"
          />
        </div>
        <div className="text-xs font-bold my-1">{equip.name}</div>
        <div className="z-1 absolute top-0 right-0 bg-cyan-600 text-white text-xs font-bold px-1">
          <button onClick={onClickCancel}>
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
