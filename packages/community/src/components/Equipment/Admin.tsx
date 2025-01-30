import { useFetch } from 'hooks/useFetch';
import {
  ChangeEvent,
  KeyboardEvent,
  FC,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import BoardName from '../Board/BoardName';
import { Link, useHistory, useLocation } from 'react-router-dom';
import EquipmentService, {
  EquipmentSearchInfo,
} from 'services/EquipmentService';
import EquipmentStatusEnum from 'common/EquipmentStatusEnum';
import SelectBox from 'components/Common/SelectBox';
import { EquipmentCategoryContext } from 'contexts/EquipmentCategoryContext';
import { useAuth } from 'contexts/auth';
import Loading from 'components/Common/Loading';
import Paginator from 'components/Common/Paginator';
import EquipList from './EquipList';
import EquipmentEdit, { EditModalInfo } from './EquipmentEdit';

const stateOptions = [
  {
    id: EquipmentStatusEnum.OK,
    name: '양호',
  },
  {
    id: EquipmentStatusEnum.BROKEN,
    name: '수리 필요',
  },
  {
    id: EquipmentStatusEnum.LOST,
    name: '분실',
  },
  {
    id: EquipmentStatusEnum.REPAIRING,
    name: '수리 중',
  },
  {
    id: EquipmentStatusEnum.ETC,
    name: '기타',
  },
];

type LocationState = {
  page: number;
  searchInfo: EquipmentSearchInfo;
};

const Admin: FC = () => {
  const equipmentCategories = useContext(EquipmentCategoryContext);
  const history = useHistory();
  const location = useLocation<LocationState>();
  const authContext = useAuth();

  const [editModalInfo, setEditModalInfo] = useState<EditModalInfo>({
    isModalOpen: false,
    equipment: null,
  });

  const [keyword, setKeyword] = useState(
    location.state?.searchInfo?.keyword ?? '',
  );

  const pageIdx = location.state?.page ?? 1;

  // Should use pagination or not?
  // TODO: make page selector
  /*const clickPage = (idx: number) => {
    history.push({
      state: {
        ...location.state,
        page: idx,
      },
    });
  };*/

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
  }, []);

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

  const setIsModalOpen = (val: boolean) => {
    setEditModalInfo({
      ...editModalInfo,
      isModalOpen: val,
    });
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
            optionList={stateOptions}
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
          <button
            className="board-btn-write"
            onClick={() =>
              setEditModalInfo({
                isModalOpen: true,
                equipment: null,
              })
            }
          >
            <i className="ri-pencil-line enif-f-1p2x"></i>장비 추가
          </button>
        )}
      </div>
      <EquipList
        editModalInfo={editModalInfo}
        setEditModalInfo={setEditModalInfo}
        searchInfo={location.state?.searchInfo ?? undefined}
        isAdmin={true}
      />
      {/*equipCount > 0 && (
        <Paginator
          pageIdx={pageIdx}
          pageNum={Math.ceil(equipCount / PAGEEQUIPNUM)}
          clickPage={clickPage}
        />
      )*/}
      {editModalInfo.isModalOpen && (
        <EquipmentEdit
          editModalInfo={editModalInfo}
          onFinishEdit={() => setIsModalOpen(false)}
          onCancel={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Admin;
