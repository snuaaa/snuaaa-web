import {
  ChangeEvent,
  KeyboardEvent,
  FC,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import BoardName from '../Board/BoardName';
import { useHistory, useLocation } from 'react-router-dom';
import EquipmentService, {
  EquipmentSearchInfo,
} from 'services/EquipmentService';
import SelectBox from 'components/Common/SelectBox';
import { EquipmentCategoryContext } from 'contexts/EquipmentCategoryContext';
import { useAuth } from 'contexts/auth';
import EquipList from './EquipList';
import { equipmentStatusOptions } from './common';
import { Equipment } from 'services/types';
import { useModal, withModal } from 'contexts/modal';
import EditModal from './Modal/Edit';
import CreateModal from './Modal/Create';
import { useFetch } from 'hooks/useFetch';
import Loading from 'components/Common/Loading';

const LIMIT_UNIT = 12;

type LocationState = {
  page: number;
  searchInfo: EquipmentSearchInfo;
};

const Admin: FC = () => {
  const equipmentCategories = useContext(EquipmentCategoryContext);
  const history = useHistory();
  const location = useLocation<LocationState>();
  const authContext = useAuth();

  const [keyword, setKeyword] = useState(
    location.state?.searchInfo?.keyword ?? '',
  );

  const fetchFunction = useCallback(async () => {
    return EquipmentService.retrieveList(1);
  }, []);

  const [limit, setLimit] = useState<number>(LIMIT_UNIT);

  const { data, refresh } = useFetch({ fetch: fetchFunction });

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
    setLimit(LIMIT_UNIT);
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
    openModal(<EditModal editingEquipment={equipment} onEdit={refresh} />);
  };

  const handleClickCreate = () => {
    openModal(<CreateModal onCreate={refresh} />);
  };

  const searchInfo = location.state?.searchInfo;

  // TODO: Server side filtering
  const filteredEquipments = useMemo(
    () =>
      data?.equipInfo
        .filter((equip) => {
          if (
            searchInfo &&
            searchInfo.category_id !== 0 &&
            equip.category_id !== searchInfo.category_id
          )
            return false;
          if (
            searchInfo &&
            searchInfo.status !== '' &&
            equip.status !== searchInfo.status
          )
            return false;
          if (
            searchInfo &&
            searchInfo.keyword !== '' &&
            !equip.name.toLowerCase().includes(searchInfo.keyword.toLowerCase())
          )
            return false;
          return true;
        })
        .slice(0, limit) ?? [],
    [data?.equipInfo, limit, searchInfo],
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
        equipmentList={filteredEquipments}
        onClickEquipmentEdit={handleClickEquipmentEdit}
        onNext={increaseLimit}
        canMoveNext={data.equipInfo.length > limit}
      />
    </div>
  );
};

export default withModal(Admin);
