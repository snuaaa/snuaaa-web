import { ChangeEvent, FC, useContext, useEffect, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { EquipmentCategoryContext } from '~/contexts/EquipmentCategoryContext';
import SearchString from './SearchString';
import SearchSelect from './SearchSelect';
import { equipmentRentStatusOptions, equipmentStatusOptions } from '../common';
import { ViewportSize, useViewportSize } from '~/contexts/viewportSize';
import { SortBy, SortOrder } from '~/routes/equipment/admin';

const sortByOptions = [
  { value: SortBy.NAME, name: '정렬 기준: 장비명' },
  { value: SortBy.CREATED_AT, name: '정렬 기준: 등록일자' },
  { value: SortBy.CATEGORY, name: '정렬 기준: 분류' },
];

const sortOrderOptions = [
  { value: SortOrder.ASC, name: '오름차순' },
  { value: SortOrder.DESC, name: '내림차순' },
];

const EquipSearchBar: FC = () => {
  const search = useSearch({ from: '/equipment/admin' });
  const navigate = useNavigate({ from: '/equipment/admin' });
  const equipmentCategories = useContext(EquipmentCategoryContext);

  const [searchStrings, setSearchStrings] = useState({
    keyword: search.keyword ?? '',
    maker: search.maker ?? '',
  });

  const viewportSize = useViewportSize();

  useEffect(() => {
    if (!search.sort_by) {
      // Check if initialization is needed
      navigate({
        search: (prev) => ({
          ...prev,
          category_id: 0,
          keyword: '',
          maker: '',
          status: '',
          rent_status: '',
          sort_by: SortBy.CREATED_AT,
          sort_order: SortOrder.DESC,
        }),
        replace: true,
      });
    }
  }, [navigate, search]);

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    navigate({
      search: (prev) => ({
        ...prev,
        [name === 'category' ? 'category_id' : name]:
          name === 'category' ? +value : value,
      }),
    });
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
    navigate({
      search: (prev) => ({
        ...prev,
        keyword: searchStrings.keyword,
        maker: searchStrings.maker,
      }),
    });
  };

  return (
    <div className="mx-2 mb-4">
      <div className="mr-2 mb-2 mt-2 text-base">검색</div>
      <div className="flex w-full flex-wrap sm:flex-nowrap">
        <SearchSelect
          name="category"
          options={
            equipmentCategories?.categories.map((option) => ({
              value: option.id,
              name: option.name,
            })) ?? []
          }
          onChange={handleSelectChange}
          value={search.category_id ?? 0}
          defaultOption="분류"
        />

        <SearchSelect
          name="status"
          options={equipmentStatusOptions}
          onChange={handleSelectChange}
          value={search.status ?? ''}
          defaultOption="상태"
        />
        <SearchSelect
          name="rent_status"
          options={equipmentRentStatusOptions}
          onChange={handleSelectChange}
          value={search.rent_status ?? ''}
          defaultOption="대여 상태"
        />

        {viewportSize === ViewportSize.Mobile && (
          <div className="basis-full h-0"></div>
        )}

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
          value={search.sort_by ?? SortBy.CREATED_AT}
        />
        <SearchSelect
          name="sort_order"
          options={sortOrderOptions}
          onChange={handleSelectChange}
          value={search.sort_order ?? SortOrder.DESC}
        />
      </div>
    </div>
  );
};

export default EquipSearchBar;
