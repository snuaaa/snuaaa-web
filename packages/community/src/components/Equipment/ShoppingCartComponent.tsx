import React, { useCallback } from 'react';
import { useFetch } from 'hooks/useFetch';
import { useShopping } from '../../contexts/ShoppingContext';
import ShoppingItem from './ShoppingItem';
import EquipmentService from 'services/EquipmentService';

const ShoppingCartComponent: React.FC = () => {
  const { cart, removeItem, clearCart, submit } = useShopping();

  const fetchFunction = useCallback(
    async () => {
      //const searchInfo = location.state && location.state.searchInfo;
      //
      //return searchInfo
      //  ? EquipmentService.searchList(searchInfo, pageIdx)
      //  : EquipmentService.retrieveList(pageIdx);
      // Disable paging for now
      return EquipmentService.retrieveList(1);
    },
    [
      /*location.state, pageIdx*/
    ],
  );

  const { data, refresh } = useFetch({ fetch: fetchFunction });
  const equips = data?.equipInfo ?? [];

  const onRent = () => {
    submit(
      () => {
        clearCart();
        alert('대여 신청이 완료되었습니다.');
      },
      (numbers) => {
        alert(`${numbers.join(', ')}번 장비는 이미 대여 중입니다.`);
      },
    );
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-row justify-between">
        <div className="text-lg font-bold">장바구니</div>
        <button className="text-sm font-bold" onClick={onRent}>
          대여하기
        </button>
      </div>
      <div className="flex flex-col">
        {cart.length === 0 ? (
          <div className="text-center">장바구니가 비었습니다.</div>
        ) : (
          equips
            .filter((equip) => cart.includes(equip.id))
            .map((equip) => (
              <ShoppingItem
                key={equip.id}
                equipment={equip}
                cancel={() => removeItem(equip.id)}
              />
            ))
        )}
      </div>
    </div>
  );
};

export default ShoppingCartComponent;
