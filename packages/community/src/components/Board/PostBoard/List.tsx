import { ChangeEvent, KeyboardEvent, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import Pagination from '~/components/Common/Pagination';
import SelectBox from '~/components/Common/SelectBox';
import PostList from '~/components/Post/PostList';
import { useAuth } from '~/contexts/auth';
import { usePostList } from '~/hooks/queries/usePostQueries';
import useQueryString from '~/hooks/useQueryString';
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
  const location = useLocation();
  const history = useHistory();
  const queryString = useQueryString();
  const page = Number(queryString.get('page') ?? 1);

  const { data, isLoading } = usePostList({
    board_id: boardInfo.board_id,
    search_type: queryString.get('type') || undefined,
    search_keyword: queryString.get('keyword') || undefined,
    offset: (page - 1) * PAGE_SIZE,
    limit: PAGE_SIZE,
  });

  const [searchKeyword, setSearchKeyword] = useState(
    queryString.get('search_keyword') || '',
  );
  const [searchType, setSearchType] = useState(
    queryString.get('search_type') || '',
  );

  const authContext = useAuth();

  const handleSearchOption = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchType(e.target.value);
  };

  const search = () => {
    if (!searchType) {
      const nextSearchParam = new URLSearchParams();
      history.push({ search: nextSearchParam.toString() });
      return;
    }
    if (searchKeyword.trim().length < 2) {
      alert('2글자 이상 입력해주세요.');
      return;
    }
    const nextSearchParam = new URLSearchParams(queryString);
    nextSearchParam.set('keyword', searchKeyword.trim());
    nextSearchParam.set('type', searchType);
    nextSearchParam.set('page', '1');
    history.push({ search: nextSearchParam.toString() });
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
      {boardInfo.categories && boardInfo.categories.length > 0 && (
        <select>
          {boardInfo.categories.map((cate) => (
            <option key={cate.category_id}>{cate.category_name}</option>
          ))}
        </select>
      )}
      <div className="board-search-wrapper">
        <div className="board-select-wrapper ">
          <SelectBox
            selectName={'searchOption'}
            optionList={searchOptions}
            onSelect={handleSearchOption}
            selectedOption={searchType}
          />
        </div>
        <div className="board-search-input">
          <input
            type="text"
            onChange={handleSearchKeyword}
            value={searchKeyword}
            onKeyDown={handleSearchKeyDown}
          />
          <button className="board-search-btn" onClick={search}>
            <i className="ri-search-line text-base"></i>
          </button>
        </div>
        <div className="board-btn-write-wrapper">
          {authContext.authInfo.user.grade <= boardInfo.lv_write && (
            <button className="board-btn-write" onClick={onClickCreate}>
              <i className="ri-pencil-line enif-f-1p2x"></i>글쓰기
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
            routeGenerator={(page) => {
              const nextSearchParam = new URLSearchParams(queryString);
              nextSearchParam.set('page', page.toString());
              return `${location.pathname}?${nextSearchParam.toString()}`;
            }}
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
