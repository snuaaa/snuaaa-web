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

const PAGEEQUIPNUM = 10;
const stateOptions = [
  {
    id: EquipmentStatusEnum.ALL,
    name: '전체',
  },
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

  const [searchInfo, setSearchInfo] = useState<EquipmentSearchInfo>({
    category_id: equipmentCategories?.[0]?.id ?? 0, // TODO: does it update when equipmentCategories changes?
    status: EquipmentStatusEnum.ALL,
    keyword: '',
  });

  const pageIdx = location.state?.page ?? 1;

  const fetchFunction = useCallback(async () => {
    const searchInfo = location.state && location.state.searchInfo;

    return searchInfo
      ? EquipmentService.searchList(searchInfo, pageIdx)
      : EquipmentService.retrieveList(pageIdx);
  }, [location.state, pageIdx]);

  const { data } = useFetch({ fetch: fetchFunction });

  const equipCount = data?.equipCount ?? 0;
  const equipments = data?.equipInfo ?? [];

  useEffect(() => {
    if (location.state && location.state.searchInfo) {
      setSearchInfo(location.state.searchInfo);
    }
  }, [location.state]);

  // TODO: make page selector
  const clickPage = (idx: number) => {
    history.push({
      state: {
        ...location.state,
        page: idx,
      },
    });
  };

  const handleSearchOption = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchInfo({
      ...searchInfo,
      category_id: +e.target.value,
      status: e.target.value,
    });
    history.push({
      state: {
        ...location.state,
        page: 1,
        searchInfo: searchInfo,
      },
    });
  };

  const search = async () => {
    if (!searchInfo || !searchInfo.keyword || searchInfo.keyword.length < 2) {
      alert('2글자 이상 입력해주세요.');
    } else {
      history.push({
        state: {
          ...location.state,
          page: 1,
          searchInfo: searchInfo,
        },
      });
    }
  };

  const handleSearchKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      search();
    }
  };

  const handleSearchKeyword = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchInfo({
      ...searchInfo,
      keyword: e.target.value,
    });
  };

  if (!data) {
    return <Loading />;
  }

  return (
    <div className="board-wrapper">
      <BoardName board_id={undefined} board_name={'장비 관리'} />
      <div className="board-search-wrapper">
        <div className="board-select-wrapper">
          <SelectBox
            selectName="category"
            optionList={equipmentCategories}
            onSelect={handleSearchOption}
            selectedOption={searchInfo.category_id}
          />
          <SelectBox
            selectName="status"
            optionList={stateOptions}
            onSelect={handleSearchOption}
            selectedOption={searchInfo.status}
          />
        </div>
        <div className="board-search-input">
          <input
            type="text"
            onChange={handleSearchKeyword}
            value={searchInfo.keyword}
            onKeyDown={handleSearchKeyDown}
          />
          <button className="board-search-btn" onClick={search}>
            <i className="ri-search-line text-base"></i>
          </button>
        </div>
        {authContext.authInfo.user.grade <= 8 && ( // TODO: change this to equipment authority check
          //TODO: display modal
          <Link to="/equipment/">
            <button className="board-btn-write">
              <i className="ri-file-add-line enif-f-1p2x"></i>장비 추가
            </button>
          </Link>
        )}
      </div>
      <EquipList equipments={equipments} />
      {equipCount > 0 && (
        <Paginator
          pageIdx={pageIdx}
          pageNum={Math.ceil(equipCount / PAGEEQUIPNUM)}
          clickPage={clickPage}
        />
      )}
    </div>
  );
};

export default Admin;
