import {
  ChangeEvent,
  KeyboardEvent,
  FC,
  useContext,
  useEffect,
  useState,
} from 'react';
import BoardName from '../Board/BoardName';
import { useHistory, useLocation } from 'react-router-dom';
import { EquipmentSearchInfo } from 'services/EquipmentService';
import SelectBox from 'components/Common/SelectBox';
import { EquipmentCategoryContext } from 'contexts/EquipmentCategoryContext';
import { useAuth } from 'contexts/auth';
import EquipList from './EquipList';
// import EquipmentEdit from './EquipmentEdit';
import { equipmentStatusOptions } from './common';
import { Equipment } from 'services/types';
import { useModal, withModal } from 'contexts/modal';
import EditModal from './Modal/Edit';
import CreateModal from './Modal/Create';

type LocationState = {
  page: number;
  searchInfo: EquipmentSearchInfo;
};

const Admin: FC = () => {
  const equipmentCategories = useContext(EquipmentCategoryContext);
  const history = useHistory();
  const location = useLocation<LocationState>();
  const authContext = useAuth();

  const [refreshFlag, setRefreshFlag] = useState<boolean>(false);

  const [keyword, setKeyword] = useState(
    location.state?.searchInfo?.keyword ?? '',
  );

  const { openModal } = useModal();

  useEffect(() => {
    if (!location.state) {
      history.replace({
        state: {
          page: 1,
          searchInfo: {
            category_id: 0,
            status: '',
            keyword: '',
          },
        },
      });
    }
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === 'category') {
      history.push({
        state: {
          ...location.state,
          page: 1,
          searchInfo: {
            ...location.state.searchInfo,
            category_id: +e.target.value,
          },
        },
      });
    }
    if (e.target.name === 'status') {
      history.push({
        state: {
          ...location.state,
          page: 1,
          searchInfo: {
            ...location.state.searchInfo,
            status: e.target.value,
          },
        },
      });
    }
  };

  const search = async () => {
    history.push({
      state: {
        ...location.state,
        searchInfo: {
          ...location.state.searchInfo,
          keyword: keyword,
        },
      },
    });
  };

  const handleSearchKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      search();
    }
  };

  const handleSearchKeyword = (e: ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
  };

  const handleClickEquipmentEdit = (equipment: Equipment) => {
    openModal(<EditModal editingEquipment={equipment} />);
  };

  const handleClickCreate = () => {
    openModal(<CreateModal />);
  };

  return (
    <div className="board-wrapper">
      <BoardName board_id={undefined} board_name={'장비 관리'} />
      <div className="board-search-wrapper">
        <div className="text-lg font-bold">현재 보유 장비</div>
        <div className="board-select-wrapper">
          <SelectBox
            selectName="category"
            optionList={equipmentCategories}
            onSelect={handleChange}
            selectedOption={location.state?.searchInfo.category_id ?? 0}
          />
          <SelectBox
            selectName="status"
            optionList={equipmentStatusOptions}
            onSelect={handleChange}
            selectedOption={location.state?.searchInfo.status ?? ''}
          />
        </div>
        {/* TODO: change CSS style
          1) create new equip-search-input
          2) use tailwind css
        */}
        <div className="board-search-input">
          <input
            type="text"
            className="w-10"
            onChange={handleSearchKeyword}
            value={keyword}
            onKeyDown={handleSearchKeyDown}
          />
          <button className="board-search-btn" onClick={search}>
            <i className="ri-search-line text-base"></i>
          </button>
        </div>
        {authContext.authInfo.user.grade <= 8 && ( // TODO: change this to equipment authority check
          //TODO: display modal
          <button className="board-btn-write" onClick={handleClickCreate}>
            <i className="ri-pencil-line enif-f-1p2x"></i>장비 추가
          </button>
        )}
      </div>
      <EquipList
        onClickEquipmentEdit={handleClickEquipmentEdit}
        searchInfo={location.state?.searchInfo ?? undefined}
        isAdmin={true}
        refreshFlag={refreshFlag}
      />
    </div>
  );
};

export default withModal(Admin);
