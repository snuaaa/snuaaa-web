import { FC } from 'react';
import BoardName from '../Board/BoardName';
import { useAuth } from 'contexts/auth';
import { useModal, withModal } from 'contexts/modal';
import CreateModal from './Modal/Create';
import Loading from 'components/Common/Loading';
import EquipList from './EquipList';
import EquipSearchBar from './EquipSearchBar';
import { useEquipment, withEquipment } from './contexts';

const Admin: FC = () => {
  const authContext = useAuth();

  const { data, refresh } = useEquipment();
  const { openModal } = useModal();

  if (!data) {
    return <Loading />;
  }

  const handleClickCreate = () => {
    openModal(<CreateModal onCreate={refresh} />);
  };

  return (
    <div className="board-wrapper">
      <BoardName board_id={undefined} board_name={'장비 관리'} />
      <div className="board-search-wrapper">
        <div className="text-lg font-bold">현재 보유 장비</div>
        {authContext.authInfo.user.grade <= 8 && ( // TODO: change this to equipment authority check
          //TODO: display modal
          <button className="board-btn-write" onClick={handleClickCreate}>
            <i className="ri-pencil-line enif-f-1p2x"></i>장비 추가
          </button>
        )}
      </div>
      <EquipSearchBar />
      <EquipList data={data} columns={3} type="admin" />
    </div>
  );
};

export default withModal(withEquipment(Admin));
