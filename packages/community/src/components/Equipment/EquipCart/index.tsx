import { FC } from 'react';
import { Equipment } from 'services/types';
import CartItem from './CartItem';

type Props = {
  equipments: Equipment[];
  onClickCancel: (equip: Equipment) => void;
  onClickRentAll: () => void;
};

const EquipCart: FC<Props> = ({
  equipments,
  onClickCancel,
  onClickRentAll,
}) => {
  return (
    <div className="text-center px-2">
      <h3 className="font-bold text-base text-center text-cyan-600 pt-6 pb-2">
        여러 장비 대여 하기
      </h3>
      <div className="text-xs text-center text-gray-800 pt-2 pb-6">
        여러 장비들을 한 번에
        <br /> 대여하려면 + 를 클릭하세요.
      </div>
      <div className="flex flex-wrap">
        {equipments.map((equip) => (
          <CartItem
            key={equip.id}
            equip={equip}
            columns={2}
            onClickCancel={() => onClickCancel(equip)}
          />
        ))}
      </div>
      <button
        className={
          'w-full text-base text-center text-white font-bold py-2 my-2 ' +
          (equipments.length === 0 ? 'bg-gray-200' : 'bg-cyan-600')
        }
        onClick={onClickRentAll}
      >
        일괄 대여 하기
      </button>
    </div>
  );
};
export default EquipCart;
