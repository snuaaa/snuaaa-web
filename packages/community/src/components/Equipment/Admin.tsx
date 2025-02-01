import { FC, useState } from 'react';
import BoardName from '../Board/BoardName';
import { useAuth } from 'contexts/auth';
import EquipList from './EquipList';
import EquipmentEdit from './EquipmentEdit';

const Admin: FC = () => {
  const authContext = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Should use pagination or not? : NO!!!!

  return (
    <div className="board-wrapper">
      <BoardName board_id={undefined} board_name={'장비 관리'} />
      <div className="board-search-wrapper">
        <div className="text-lg font-bold">현재 보유 장비</div>
        {authContext.authInfo.user.grade <= 8 && ( // TODO: change this to equipment authority check
          //TODO: display modal
          <button
            className="board-btn-write"
            onClick={() => setIsModalOpen(true)}
          >
            <i className="ri-pencil-line enif-f-1p2x"></i>장비 추가
          </button>
        )}
      </div>
      <EquipList isAdmin={true} />
      {isModalOpen && (
        <EquipmentEdit
          editModalInfo={{
            isModalOpen: false,
            equipment: undefined,
          }}
          onFinishEdit={() => {
            setIsModalOpen(false);
            window.location.reload();
          }}
          onCancel={() => {
            setIsModalOpen(false);
          }}
        />
      )}
      {/*equipCount > 0 && (
        <Paginator
          pageIdx={pageIdx}
          pageNum={Math.ceil(equipCount / PAGEEQUIPNUM)}
          clickPage={clickPage}
        />
      )*/}
    </div>
  );
};

export default Admin;
