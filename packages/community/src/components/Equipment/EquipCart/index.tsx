import { FC } from 'react';
import CartItem from './CartItem';
import { useEquipment } from '../contexts';

type Props = {
  columns: number;
};

const EquipCart: FC<Props> = ({ columns }) => {
  const { cart, rentAllEquipment, removeFromCart } = useEquipment();

  const handleClickRentAll = () => {
    const isConfirmed = window.confirm(`총 ${cart.length}개의 장비를 대여하시겠습니까?`);
    if (isConfirmed) {
      rentAllEquipment();      
    }
  };

  return (
    <div className="text-center px-2">
      <h3 className="font-bold text-base text-center text-cyan-600 pt-6 pb-2">
        여러 장비 대여하기
      </h3>
      {cart.length === 0 && (
        <div className="text-xs text-center text-gray-800 pt-2 pb-6">
          여러 장비들을 한 번에
          <br /> 대여하려면 + 를 클릭하세요.
        </div>
      )}
      <div className="flex flex-wrap">
        {cart.map((equip) => (
          <CartItem
            key={equip.id}
            equip={equip}
            columns={columns}
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
        disabled={cart.length === 0}
      >
        일괄 대여 하기
      </button>
    </div>
  );
};
export default EquipCart;
