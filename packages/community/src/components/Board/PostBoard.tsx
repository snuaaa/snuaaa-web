import {
  ChangeEvent,
  KeyboardEvent,
  useState,
  useEffect,
  useCallback,
} from 'react';

import Loading from '../../components/Common/Loading';
import PostList from '../../components/Post/PostList';
import BoardName from '../../components/Board/BoardName';
import SelectBox from '../../components/Common/SelectBox';

import { useLocation, useHistory } from 'react-router';
import { Board } from '~/services/types';
import PostService from '~/services/PostService';
import { useFetch } from '~/hooks/useFetch';
import CreatePost from '~/components/Post/CreatePost';
import { useAuth } from '~/contexts/auth';
import useQueryString from '~/hooks/useQueryString';
import Pagination from '../Common/Pagination';

const PAGE_SIZE = 10;

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

type PostBoardProps = {
  boardInfo: Board;
};

function PostBoard({ boardInfo }: PostBoardProps) {
  const location = useLocation();
  const history = useHistory();

  const queryString = useQueryString();
  const page = Number(queryString.get('page') ?? 1);

  const [isCreating, setIsCreating] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState(
    queryString.get('search_keyword') || '',
  );
  const [searchType, setSearchType] = useState(
    queryString.get('search_type') || '',
  );

  const authContext = useAuth();

  const fetchFunction = useCallback(async () => {
    return PostService.retrievePostList({
      board_id: boardInfo.board_id,
      search_type: queryString.get('type') || undefined,
      search_keyword: queryString.get('keyword') || undefined,
      offset: (page - 1) * PAGE_SIZE,
      limit: PAGE_SIZE,
    });
  }, [boardInfo.board_id, page, queryString]);

  const { data, refresh } = useFetch({ fetch: fetchFunction });

  // TODO: 게시글 작성시 route 변경하여 불필요한 useEffect 제거
  useEffect(() => {
    setIsCreating(false);
  }, [boardInfo.board_id]);

  const handleSearchOption = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchType(e.target.value);
  };

  const search = async () => {
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

  const makeCategoryList = () => {
    if (boardInfo.categories && boardInfo.categories.length > 0) {
      return (
        <select>
          {boardInfo.categories.map((cate) => (
            <option key={cate.category_id}>{cate.category_name}</option>
          ))}
        </select>
      );
    }
  };

  if (!data) {
    return <Loading />;
  }

  return (
    <div className="board-wrapper postboard-wrapper">
      <BoardName
        board_id={boardInfo.board_id}
        board_name={boardInfo.board_name}
      />
      <div className="board-desc">{boardInfo.board_desc}</div>
      {!isCreating ? (
        <>
          {makeCategoryList()}
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
                <button
                  className="board-btn-write"
                  onClick={() => setIsCreating(true)}
                >
                  <i className="ri-pencil-line enif-f-1p2x"></i>글쓰기
                </button>
              )}
            </div>
          </div>

          <PostList posts={data.rows} />
          {data.count > 0 && (
            <Pagination
              currentPage={page}
              totalPageCount={Math.ceil(data.count / PAGE_SIZE)}
              routeGenerator={(page) => {
                const nextSearchParam = new URLSearchParams(queryString);
                nextSearchParam.set('page', page.toString());
                return `${location.pathname}?${nextSearchParam.toString()}`;
              }}
            />
          )}
        </>
      ) : (
        <CreatePost
          board_id={boardInfo.board_id}
          onClose={() => setIsCreating(false)}
          onCreate={async () => {
            await refresh();
            setIsCreating(false);
          }}
        />
      )}
    </div>
  );
}

export default PostBoard;
