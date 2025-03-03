import { useFetch } from 'hooks/useFetch';
import { FC, useCallback, useState } from 'react';
import EquipmentService from 'services/EquipmentService';
import EquipSearchBar from './EquipSearchBar';
import EquipList from './EquipList';
import Loading from 'components/Common/Loading';
import { withModal } from 'contexts/modal';
import BoardName from 'components/Board/BoardName';
import { Equipment } from 'services/types';
import EquipCart from './EquipCart';
import { Link } from 'react-router-dom';

const Rent: FC = () => {
  const fetchFunction = useCallback(() => {
    return EquipmentService.retrieveList(1);
  }, []);

  const { data, refresh } = useFetch({ fetch: fetchFunction });
  const [cart, setCart] = useState<Equipment[]>([]);

  if (!data) {
    return <Loading />;
  }

  const handleClickEquipmentRent = (equipment: Equipment) => {
    window.confirm('이 장비를 대여하시겠습니까?') &&
      EquipmentService.rentEquipments({ equipmentIds: [equipment.id] }).then(
        () => {
          refresh();
          setCart(cart.filter((equip: Equipment) => equip.id !== equipment.id));
        },
      );
  };

  const handleClickEquipmentCart = (equipment: Equipment) => {
    if (cart.find((equip: Equipment) => equip.id === equipment.id)) {
      setCart(cart.filter((equip: Equipment) => equip.id !== equipment.id));
    } else {
      setCart([...cart, equipment]);
    }
  };

  const handleClickRentAll = () => {
    window.confirm(`총 ${cart.length}개의 장비를 대여하시겠습니까?`) &&
      EquipmentService.rentEquipments({
        equipmentIds: cart.map((equip) => equip.id),
      }).then(() => {
        refresh();
        setCart([]);
      });
  };

  return (
    <div className="board-wrapper">
      <BoardName board_name={'장비 대여'} />
      <Link
        className="text-gray-400 text-md font-bold mb-4 w-fit"
        to="/equipment/"
      >
        &lt; BACK
      </Link>
      <EquipSearchBar />
      <div className="w-full flex">
        <span className="w-2/3 overflow-y-auto h-screen">
          <EquipList
            onClickEquipmentRent={handleClickEquipmentRent}
            onClickEquipmentCart={handleClickEquipmentCart}
            data={data}
            columns={2}
            cart={cart}
          />
        </span>
        <span className="w-1/3 overflow-y-auto h-screen">
          <EquipCart
            equipments={cart}
            onClickCancel={handleClickEquipmentCart}
            onClickRentAll={handleClickRentAll}
          />
        </span>
      </div>
    </div>
  );
};

export default withModal(Rent);
