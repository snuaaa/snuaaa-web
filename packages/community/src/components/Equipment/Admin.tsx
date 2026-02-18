import BoardName from '../Board/BoardName';
import { useAuth } from '~/contexts/auth';
import { useModal, withModal } from '~/contexts/modal';
import CreateModal from './Modal/Create';
import Loading from '~/components/Common/Loading';
import EquipList from './EquipList';
import EquipSearchBar from './EquipSearchBar';
import { useEquipment, withEquipment } from './contexts';
import EditCategoriesModal from './Modal/EditCategories';
import { ViewportSize, useViewportSize } from '~/contexts/viewportSize';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { EquipSearchLocationState } from './common';
import { useCallback } from 'react';

const Admin = () => {
  const authContext = useAuth();

  const { data, refresh } = useEquipment();
  const { openModal } = useModal();

  const viewportSize = useViewportSize();

  const search = useSearch({ from: '/equipment/admin' });
  const navigate = useNavigate({ from: '/equipment/admin' });

  const handleSearchChange = useCallback(
    (updater: (prev: EquipSearchLocationState) => EquipSearchLocationState) => {
      navigate({
        search: updater,
        replace: true,
      });
    },
    [navigate],
  );

  if (!data) {
    return <Loading />;
  }

  const handleClickEditCategory = () => {
    openModal(<EditCategoriesModal />);
  };

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
          <>
            <button
              className="bg-[#A3A3A3] text-white ml-auto flex justify-center items-center text-base px-2 py-1 font-bold"
              onClick={handleClickEditCategory}
            >
              <i className="ri-edit-box-line mr-1"></i> 장비 분류 수정
            </button>
            <button
              className="bg-[#A3A3A3] text-white ml-2 flex justify-center items-center text-base px-2 py-1 font-bold"
              onClick={handleClickCreate}
            >
              <i className="ri-menu-add-line mr-1"></i> 장비 추가
            </button>
          </>
        )}
      </div>
      <EquipSearchBar search={search} onSearchChange={handleSearchChange} />
      <EquipList
        data={data}
        columns={viewportSize === ViewportSize.Mobile ? 1 : 3}
        type="admin"
        search={search}
      />
    </div>
  );
};

export default withModal(withEquipment(Admin));
