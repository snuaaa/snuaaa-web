import { FC } from 'react';
import EquipSearchBar from './EquipSearchBar';
import EquipList from './EquipList';
import Loading from 'components/Common/Loading';
import { withModal } from 'contexts/modal';
import BoardName from 'components/Board/BoardName';
import EquipCart from './EquipCart';
import { Link } from 'react-router-dom';
import { useEquipment, withEquipment } from './contexts';

const Rent: FC = () => {
  const { data } = useEquipment();

  if (!data) {
    return <Loading />;
  }

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
          <EquipList data={data} columns={2} type="rent" />
        </span>
        <span className="w-1/3 overflow-y-auto h-screen">
          <EquipCart />
        </span>
      </div>
    </div>
  );
};

export default withModal(withEquipment(Rent));
