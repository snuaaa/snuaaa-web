import {
  ChangeEvent,
  KeyboardEvent,
  useState,
  useEffect,
  useCallback,
} from 'react';

import Loading from '../../components/Common/Loading';
import PostList from '../../components/Post/PostList';
import Paginator from '../../components/Common/Paginator';
import BoardName from '../../components/Board/BoardName';
import SearchTypeEnum from '../../common/SearchTypeEnum';
import SelectBox from '../../components/Common/SelectBox';

import { useLocation, useHistory } from 'react-router';
import { Board } from 'services/types';
import PostService from 'services/PostService';
import { useFetch } from 'hooks/useFetch';
import CreatePost from 'components/Post/CreatePost';
import { useAuth } from 'contexts/auth';

const POSTROWNUM = 10;
const searchOptions = [
  {
    id: SearchTypeEnum.ALL,
    name: '제목+내용',
  },
  {
    id: SearchTypeEnum.TITLE,
    name: '제목',
  },
  {
    id: SearchTypeEnum.TEXT,
    name: '내용',
  },
  {
    id: SearchTypeEnum.USER,
    name: '글쓴이',
  },
];

type PostBoardProps = {
  boardInfo: Board;
};

type LocationState = {
  page: number;
  searchInfo: {
    type: string;
    keyword: string;
  };
};

function PostBoard({ boardInfo }: PostBoardProps) {
  const location = useLocation<LocationState>();
  const history = useHistory();
  const [searchInfo, setSearchInfo] = useState<{
    type: string;
    keyword: string;
  }>({
    type: SearchTypeEnum.ALL,
    keyword: '',
  });

  const [isCreating, setIsCreating] = useState(false);

  const pageIdx = location.state?.page ?? 1;

  const authContext = useAuth();

  const fetchFunction = useCallback(async () => {
    const searchInfo = location.state && location.state.searchInfo;

    return searchInfo && searchInfo.keyword
      ? PostService.searchPostsInBoard(
          boardInfo.board_id,
          searchInfo.type,
          searchInfo.keyword,
          pageIdx,
        )
      : PostService.retrievePostsInBoard(boardInfo.board_id, pageIdx);
  }, [boardInfo.board_id, location.state, pageIdx]);

  const { data, refresh } = useFetch({ fetch: fetchFunction });

  useEffect(() => {
    if (location.state && location.state.searchInfo) {
      setSearchInfo(location.state.searchInfo);
    }
  }, [location.state]);

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
      type: e.target.value,
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
                selectedOption={searchInfo.type}
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

          <PostList posts={data.postInfo} />
          {data.postCount > 0 && (
            <Paginator
              pageIdx={pageIdx}
              pageNum={Math.ceil(data.postCount / POSTROWNUM)}
              clickPage={clickPage}
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
