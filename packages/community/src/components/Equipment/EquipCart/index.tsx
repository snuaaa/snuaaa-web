import { FC } from 'react';
import CartItem from './CartItem';
import { useEquipment } from '../contexts';

const EquipCart: FC = () => {
  const { cart, rentAllEquipment, removeFromCart } = useEquipment();

  const handleClickRentAll = () => {
    window.confirm(`총 ${cart.length}개의 장비를 대여하시겠습니까?`) &&
      rentAllEquipment();
  };

  return (
    <div className="text-center px-2">
      <h3 className="font-bold text-base text-center text-cyan-600 pt-6 pb-2">
        여러 장비 대여하기
      </h3>
      <div className="text-xs text-center text-gray-800 pt-2 pb-6">
        여러 장비들을 한 번에
        <br /> 대여하려면 + 를 클릭하세요.
      </div>
      <div className="flex flex-wrap">
        {cart.map((equip) => (
          <CartItem
            key={equip.id}
            equip={equip}
            columns={2}
            onClickCancel={() => removeFromCart(equip)}
          />
        ))}
      </div>
      <button
        className={
          'w-full text-base text-center text-white font-bold py-2 my-2 ' +
          (cart.length === 0 ? 'bg-gray-200' : 'bg-cyan-600')
        }
        onClick={handleClickRentAll}
      >
        일괄 대여 하기
      </button>
    </div>
  );
};
export default EquipCart;
