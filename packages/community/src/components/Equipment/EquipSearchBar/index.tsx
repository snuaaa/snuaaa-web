import { ChangeEvent, FC, useContext, useEffect, useState } from 'react';
import { EquipmentRentStatus, EquipmentStatus } from 'services/types';
import { useHistory, useLocation } from 'react-router';
import { EquipmentCategoryContext } from 'contexts/EquipmentCategoryContext';
import SearchString from './SearchString';
import SearchSelect from './SearchSelect';
import { equipmentRentStatusOptions, equipmentStatusOptions } from '../common';

export enum SortBy {
  NAME = 'name', // 장비명
  CREATEDAT = 'createdAt', // 등록일자
  category = 'category_id', // 분류
}

const sortByOptions = [
  { value: SortBy.NAME, name: '정렬 기준: 장비명' },
  { value: SortBy.CREATEDAT, name: '정렬 기준: 등록일자' },
  { value: SortBy.category, name: '정렬 기준: 분류' },
];

enum SortOrder {
  ASC = 'ASC', // 오름차순
  DESC = 'DESC', // 내림차순
}

const sortOrderOptions = [
  { value: SortOrder.ASC, name: '오름차순' },
  { value: SortOrder.DESC, name: '내림차순' },
];

export type EquipSearchLocationState = {
  category_id: number;
  keyword: string;
  maker: string;
  status: EquipmentStatus | '';
  rent_status: EquipmentRentStatus | '';
  sort_by: SortBy;
  sort_order: SortOrder;
};

const EquipSearchBar: FC = () => {
  const history = useHistory();
  const location = useLocation<EquipSearchLocationState>();
  const equipmentCategories = useContext(EquipmentCategoryContext);

  const [searchStrings, setSearchStrings] = useState({
    keyword: location.state?.keyword ?? '',
    maker: location.state?.maker ?? '',
  });

  useEffect(() => {
    if (!location.state) {
      history.replace({
        state: {
          category_id: 0,
          keyword: '',
          maker: '',
          status: '',
          rent_status: '',
          sort_by: SortBy.CREATEDAT,
          sort_order: SortOrder.DESC,
        },
      });
    }
  }, []);

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    if (e.target.name === 'category') {
      history.push({
        state: {
          ...location.state,
          category_id: +e.target.value,
        },
      });
    }
    if (e.target.name === 'status') {
      history.push({
        state: {
          ...location.state,
          status: e.target.value,
        },
      });
    }
    if (e.target.name === 'rent_status') {
      history.push({
        state: {
          ...location.state,
          rent_status: e.target.value,
        },
      });
    }
    if (e.target.name === 'sort_by') {
      history.push({
        state: {
          ...location.state,
          sort_by: e.target.value as SortBy,
        },
      });
    }
    if (e.target.name === 'sort_order') {
      history.push({
        state: {
          ...location.state,
          sort_order: e.target.value as SortOrder,
        },
      });
    }
  };

  const handleTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === 'keyword') {
      setSearchStrings((prev) => ({ ...prev, keyword: e.target.value }));
    }
    if (e.target.name === 'maker') {
      setSearchStrings((prev) => ({ ...prev, maker: e.target.value }));
    }
  };

  const handleSearch = () => {
    history.push({
      state: {
        ...location.state,
        keyword: searchStrings.keyword,
        maker: searchStrings.maker,
      },
    });
  };

  return (
    <div className="mx-2">
      <div className="mr-2 mb-2 mt-2 text-base">검색</div>
      <div className="flex w-full">
        <SearchSelect
          name="category"
          options={
            equipmentCategories?.categories.map((option) => ({
              value: option.id,
              name: option.name,
            })) ?? []
          }
          onChange={handleSelectChange}
          value={location.state?.category_id ?? 0}
          ALLOption="분류"
        />

        <SearchSelect
          name="status"
          options={equipmentStatusOptions}
          onChange={handleSelectChange}
          value={location.state?.status ?? ''}
          ALLOption="상태"
        />
        <SearchSelect
          name="rent_status"
          options={equipmentRentStatusOptions}
          onChange={handleSelectChange}
          value={location.state?.rent_status ?? ''}
          ALLOption="대여 상태"
        />

        <SearchString
          name="keyword"
          placeholder="장비명"
          value={searchStrings.keyword}
          onChange={handleTextChange}
          onEnter={handleSearch}
        />
        <SearchString
          name="maker"
          placeholder="제조사"
          value={searchStrings.maker}
          onChange={handleTextChange}
          onEnter={handleSearch}
        />

        <button
          className="border border-gray-300 bg-white p-2 text-gray-950"
          onClick={handleSearch}
        >
          <i className="ri-search-line"></i>
        </button>
      </div>
      <div className="mr-2 mb-2 mt-2 text-base">필터</div>
      <div className="flex w-full">
        <SearchSelect
          name="sort_by"
          options={sortByOptions}
          onChange={handleSelectChange}
          value={location.state?.sort_by ?? SortBy.CREATEDAT}
        />
        <SearchSelect
          name="sort_order"
          options={sortOrderOptions}
          onChange={handleSelectChange}
          value={location.state?.sort_order ?? SortOrder.DESC}
        />
      </div>
    </div>
  );
};

export default EquipSearchBar;
