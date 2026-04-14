import { ChangeEvent, KeyboardEvent, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import Pagination from '~/components/Common/Pagination';
import SelectBox from '~/components/Common/SelectBox';
import PostList from '~/components/Post/PostList';
import { useAuth } from '~/contexts/auth';
import { usePostList } from '~/hooks/queries/usePostQueries';
import { Board } from '~/services/types';
import Skeleton from '~/components/Common/Skeleton';

const searchOptions = [
  {
    id: 'all',
    name: '제목+내용',
  },
  {
    id: 'title',
    name: '제목',
  },
  {
    id: 'text',
    name: '내용',
  },
  {
    id: 'user',
    name: '글쓴이',
  },
];

const PAGE_SIZE = 10;

type Props = {
  boardInfo: Board;
  onClickCreate: () => void;
};

const ListPost = ({ boardInfo, onClickCreate }: Props) => {
  const navigate = useNavigate({ from: '/board/$board_id' });
  const searchParams = useSearch({ from: '/board/$board_id' });
  const page = Number(searchParams.page ?? 1);

  const { data, isLoading } = usePostList({
    board_id: boardInfo.board_id,
    search_type: searchParams.type || undefined,
    search_keyword: searchParams.keyword || undefined,
    offset: (page - 1) * PAGE_SIZE,
    limit: PAGE_SIZE,
  });

  const [searchKeyword, setSearchKeyword] = useState(
    searchParams.keyword || '',
  );
  const [searchType, setSearchType] = useState(searchParams.type || '');

  const authContext = useAuth();

  const handleSearchOption = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchType(e.target.value);
  };

  const search = () => {
    if (!searchType) {
      navigate({
        search: (prev) => {
          const { type: _type, keyword: _keyword, page: _page, ...rest } = prev;
          return rest;
        },
      });
      return;
    }
    if (searchKeyword.trim().length < 2) {
      alert('2글자 이상 입력해주세요.');
      return;
    }
    navigate({
      search: (prev) => ({
        ...prev,
        keyword: searchKeyword.trim(),
        type: searchType,
        page: 1,
      }),
    });
  };

  const handleSearchKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      search();
    }
  };

  const handleSearchKeyword = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);
  };

  if (!data && !isLoading) {
    // Handle error case where data is undefined after loading is complete
    return <div>게시글을 불러오는데 실패했습니다.</div>;
  }

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        {/* Left: Search filter */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {boardInfo.categories && boardInfo.categories.length > 0 && (
            <div className="shrink-0">
              <select className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-[14px] font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-aqua-400 shadow-sm hover:border-aqua-400 transition-colors">
                {boardInfo.categories.map((cate) => (
                  <option key={cate.category_id}>{cate.category_name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="w-24 md:w-28 shrink-0">
            <SelectBox
              selectName={'searchOption'}
              optionList={searchOptions}
              onSelect={handleSearchOption}
              selectedOption={searchType}
            />
          </div>

          <div className="flex items-center min-w-[200px] flex-1 max-w-sm bg-white border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-aqua-400 focus-within:border-aqua-400 transition-all shadow-sm">
            <input
              type="text"
              className="w-full px-4 py-2 bg-transparent outline-none text-[14px] placeholder:text-gray-400"
              placeholder="검색어 입력"
              onChange={handleSearchKeyword}
              value={searchKeyword}
              onKeyDown={handleSearchKeyDown}
            />
            <button
              className="px-4 py-2.5 bg-aqua-400 text-white hover:bg-aqua-500 transition-colors"
              onClick={search}
            >
              <i className="ri-search-line font-medium"></i>
            </button>
          </div>
        </div>
        {/* Right: Write Button */}
        <div className="shrink-0 self-end md:self-auto">
          {authContext.authInfo.user.grade <= boardInfo.lv_write && (
            <button
              className="flex items-center gap-2 px-6 py-2.5 bg-linear-to-r from-aqua-400 to-blue-400 text-white text-[15px] font-bold rounded-xl hover:-translate-y-0.5 hover:opacity-90 transition-all shadow-md whitespace-nowrap"
              onClick={onClickCreate}
            >
              <i className="ri-pencil-line"></i> 글쓰기
            </button>
          )}
        </div>
      </div>

      {isLoading || !data ? (
        <div className="mt-4">
          {Array.from({ length: PAGE_SIZE }).map((_, index) => (
            <PostSkeletonItem key={index} />
          ))}
        </div>
      ) : (
        <>
          <PostList posts={data.rows} />
          <Pagination
            currentPage={page}
            totalPageCount={Math.ceil(data.count / PAGE_SIZE)}
          />
        </>
      )}
    </>
  );
};

const PostSkeletonItem = () => (
  <div className="flex items-center justify-between space-x-4 p-4 border-b border-gray-200">
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-15" />
  </div>
);

export default ListPost;
