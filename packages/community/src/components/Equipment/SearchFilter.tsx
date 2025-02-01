import {
  ChangeEvent,
  KeyboardEvent,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { EquipmentStatusOptions } from 'common/EquipmentStatusEnum';
import SelectBox from 'components/Common/SelectBox';
import { EquipmentCategoryContext } from 'contexts/EquipmentCategoryContext';
import { SearchInfo } from 'services/types';

export type LocationState = {
  page: number;
  searchInfo: SearchInfo;
};

const SearchFilter: React.FC = () => {
  const equipmentCategories = useContext(EquipmentCategoryContext);
  const history = useHistory();
  const location = useLocation<LocationState>();

  const [keyword, setKeyword] = useState(
    location.state?.searchInfo?.keyword ?? '',
  );

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

  return (
    <div>
      <div className="board-select-wrapper">
        <SelectBox
          selectName="category"
          optionList={equipmentCategories}
          onSelect={handleChange}
          selectedOption={location.state?.searchInfo.category_id ?? 0}
        />
        <SelectBox
          selectName="status"
          optionList={EquipmentStatusOptions}
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
    </div>
  );
};

export default SearchFilter;
