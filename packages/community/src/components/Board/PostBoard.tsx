import React, { ChangeEvent, KeyboardEvent, useState, useEffect } from 'react';

import Loading from '../../components/Common/Loading';
import PostList from '../../components/Post/PostList';
import Paginator from '../../components/Common/Paginator';
import CreatePost from './CreatePost';
import BoardStateEnum from '../../common/BoardStateEnum';
import BoardName from '../../components/Board/BoardName';
import SearchTypeEnum from '../../common/SearchTypeEnum';
import BoardService from '../../services/BoardService';
import SelectBox from '../../components/Common/SelectBox';
import BoardType from '../../types/BoardType';
import ContentType from '../../types/ContentType';
import AuthContext from '../../contexts/AuthContext';
import { useLocation, useHistory } from 'react-router';

const POSTROWNUM = 10;
const searchOptions = [{
  id: SearchTypeEnum.ALL,
  name: '제목+내용'
}, {
  id: SearchTypeEnum.TITLE,
  name: '제목'
}, {
  id: SearchTypeEnum.TEXT,
  name: '내용'
}, {
  id: SearchTypeEnum.USER,
  name: '글쓴이'
}];

type PostBoardProps = {
    boardInfo: BoardType;
}

type LocationState = {
    page: number,
    searchInfo: {
        type: string,
        keyword: string
    }
}

function PostBoard({ boardInfo }: PostBoardProps) {

  const location = useLocation<LocationState>();
  const history = useHistory();
  const [boardState, setBoardState] = useState<number>(BoardStateEnum.LOADING);
  const [posts, setPosts] = useState<ContentType[]>([]);
  const [postCount, setPostCount] = useState<number>(0);
  const [searchInfo, setSearchInfo] = useState<{ type: string, keyword: string }>({
    type: SearchTypeEnum.ALL,
    keyword: ''
  });

  useEffect(() => {
    fetch();
  }, [location]);

  useEffect(() => {
    if (location.state && location.state.searchInfo) {
      setSearchInfo(location.state.searchInfo);
    }
  }, []);

  const clickPage = (idx: number) => {
    history.push({
      state: {
        ...location.state,
        page: idx
      }
    });
  };

  const fetch = async () => {

    const searchInfo = location.state && location.state.searchInfo;
    let pageIdx = location.state && location.state.page;

    if (!pageIdx) {
      pageIdx = 1;
    }
    try {
      setBoardState(BoardStateEnum.LOADING);
      let res;
      if (searchInfo && searchInfo.keyword) {
        res = await BoardService.searchPostsInBoard(boardInfo.board_id, searchInfo.type, searchInfo.keyword, pageIdx);
      }
      else {
        res = await BoardService.retrievePostsInBoard(boardInfo.board_id, pageIdx);
      }
      setPosts(res.data.postInfo);
      setPostCount(res.data.postCount);
      setBoardState(BoardStateEnum.READY);
    }
    catch (err) {
      console.error(err);
    }
  };

  const handleSearchOption = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchInfo({
      ...searchInfo,
      type: e.target.value
    });
  };

  const search = async () => {
    if (!searchInfo || !searchInfo.keyword || searchInfo.keyword.length < 2) {
      alert('2글자 이상 입력해주세요.');
    }
    else {
      history.push({
        state: {
          ...location.state,
          page: 1,
          searchInfo: searchInfo
        }
      });
    }
  };

  const handleSearchKeyDown = (e: KeyboardEvent) => {
    if (e.keyCode === 13) {
      search();
    }
  };

  const handleSearchKeyword = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchInfo({
      ...searchInfo,
      keyword: e.target.value
    });
  };

  const makeCategoryList = () => {
    if (boardInfo.categories && boardInfo.categories.length > 0) {
      return (
        <select>
          {boardInfo.categories.map((cate) => (<option key={cate.category_id}>{cate.category_name}</option>))}
        </select>
      );
    }
  };

  const pageIdx = location.state && location.state.page ? location.state.page : 1;

  return (
    <AuthContext.Consumer>
      {
        authContext => (() => {
          if (boardState === BoardStateEnum.LOADING) {
            return <Loading />;
          }
          else if (boardState === BoardStateEnum.READY || boardState === BoardStateEnum.WRITING) {
            return (
              <div className="board-wrapper postboard-wrapper">
                <BoardName board_id={boardInfo.board_id} board_name={boardInfo.board_name} />
                <div className="board-desc">
                  {boardInfo.board_desc}
                </div>
                {
                  boardState === BoardStateEnum.READY &&
                                    <>
                                      {makeCategoryList()}
                                      <div className="board-search-wrapper">
                                        <div className="board-select-wrapper ">
                                          <SelectBox
                                            selectName={'searchOption'}
                                            optionList={searchOptions}
                                            onSelect={handleSearchOption}
                                            selectedOption={searchInfo.type} />
                                        </div>
                                        <div className="board-search-input">
                                          <input type="text" onChange={handleSearchKeyword} value={searchInfo.keyword} onKeyDown={handleSearchKeyDown} />
                                          <button className="board-search-btn" onClick={search}>
                                            <i className="ri-search-line enif-f-1x"></i>
                                          </button>
                                        </div>
                                        <div className="board-btn-write-wrapper">
                                          {
                                            authContext.authInfo.user.grade <= boardInfo.lv_write &&
                                                    <button className="board-btn-write" onClick={() => setBoardState(BoardStateEnum.WRITING)}>
                                                      <i className="ri-pencil-line enif-f-1p2x"></i>글쓰기
                                                    </button>
                                          }
                                        </div>
                                      </div>

                                      <PostList posts={posts} />
                                      {postCount > 0 && <Paginator pageIdx={pageIdx} pageNum={Math.ceil(postCount / POSTROWNUM)} clickPage={clickPage} />}

                                    </>
                }
                {
                  boardState === BoardStateEnum.WRITING &&
                                    <CreatePost
                                      board_id={boardInfo.board_id}
                                      close={() => setBoardState(BoardStateEnum.READY)}
                                      fetch={fetch} />
                }
              </div>
            );
          }
          else return (
            <div>ERROR PAGE</div>
          );
        })()
      }

    </AuthContext.Consumer>
  );
}

export default PostBoard;
