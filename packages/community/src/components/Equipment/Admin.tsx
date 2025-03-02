import { FC, useCallback } from 'react';
import BoardName from '../Board/BoardName';
import EquipmentService from 'services/EquipmentService';
import { useAuth } from 'contexts/auth';
import { Equipment } from 'services/types';
import { useModal, withModal } from 'contexts/modal';
import EditModal from './Modal/Edit';
import CreateModal from './Modal/Create';
import { useFetch } from 'hooks/useFetch';
import Loading from 'components/Common/Loading';
import EditCategoriesModal from './Modal/EditCategories';
import EquipSearchBar, {
  EquipSearchLocationState,
  SortBy,
} from './EquipSearchBar';
import EquipList from './EquipList';
import EquipSearchBar from './EquipSearchBar';

const Admin: FC = () => {
  const authContext = useAuth();

  const fetchFunction = useCallback(async () => {
    return EquipmentService.retrieveList(1);
  }, []);

  const { data, refresh } = useFetch({ fetch: fetchFunction });

  const { openModal } = useModal();

  const handleClickEquipmentEdit = (equipment: Equipment) => {
    openModal(<EditModal editingEquipment={equipment} onEdit={refresh} />);
  };

  const handleClickCreate = () => {
    openModal(<CreateModal onCreate={refresh} />);
  };

  const sortCompareFunction = (
    equipA: Equipment,
    equipB: Equipment,
    sortBy: SortBy,
    sortOrder: 'ASC' | 'DESC',
  ) => {
    const order = sortOrder === 'ASC' ? 1 : -1;
    if (sortBy === SortBy.CATEGORY) {
      return (equipA.category_id - equipB.category_id) * order;
    }
    return equipA[sortBy].localeCompare(equipB[sortBy]) * order;
  };

  const filteredEquipments = useMemo(
    () =>
      (location.state
        ? data?.equipInfo
            .filter((equip) => {
              if (
                location.state.category_id &&
                location.state.category_id !== 0 &&
                equip.category_id !== location.state?.category_id
              )
                return false;
              if (
                location.state.status !== '' &&
                equip.status !== location.state.status
              )
                return false;
              if (
                location.state.rent_status !== '' &&
                equip.rent_status !== location.state.rent_status
              )
                return false;
              if (
                location.state.keyword !== '' &&
                !equip.name
                  .toLowerCase()
                  .includes(location.state.keyword.toLowerCase()) &&
                !equip.nickname
                  .toLowerCase()
                  .includes(location.state.keyword.toLowerCase())
              )
                return false;
              if (
                location.state.maker !== '' &&
                !equip.maker
                  .toLowerCase()
                  .includes(location.state.maker.toLowerCase())
              )
                return false;
              return true;
            })
            ?.sort((a, b) =>
              sortCompareFunction(
                a,
                b,
                location.state.sort_by,
                location.state.sort_order,
              ),
            )
        : data?.equipInfo
      )?.slice(0, limit) ?? [],
    [data?.equipInfo, limit, location.state],
  );

  const increaseLimit = () => {
    setLimit((prevLimit) => prevLimit + LIMIT_UNIT);
  };

  if (!data) {
    return <Loading />;
  }

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
      <EquipList
        data={data}
        onClickEquipmentEdit={handleClickEquipmentEdit}
        columns={3}
      />
    </div>
  );
};

export default withModal(Admin);
