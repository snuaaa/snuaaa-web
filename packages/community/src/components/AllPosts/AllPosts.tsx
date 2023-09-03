import React, { useState, useEffect } from 'react';
import { Location } from 'history';

import HomeService from '../../services/HomeService';
import Loading from '../Common/Loading';
import AllPostList from '../Post/AllPostList';
import Paginator from '../Common/Paginator';
import BoardName from '../Board/BoardName';
import BoardStateEnum from '../../common/BoardStateEnum';
import ContentType from '../../types/ContentType';
import { useHistory, useLocation } from 'react-router';


const TAG = 'ALLPOST';
const POSTROWNUM = 10;

type LocationState = {
    page: number
}

function AllPosts() {

  const [posts, setPosts] = useState<ContentType[]>([]);
  const [postCount, setPostCount] = useState<number>(0);
  const [boardState, setBoardState] = useState<number>(BoardStateEnum.LOADING);
  const history = useHistory();
  const location = useLocation<LocationState>();
  const pageIdx = (location.state && location.state.page) ? location.state.page : 1;

  useEffect(() => {
    fetch();
  }, [location]);


  const clickPage = (idx: number) => {
    history.push({
      state: {
        page: idx
      }
    });
  };

  const fetch = async () => {

    setBoardState(BoardStateEnum.LOADING);
    await HomeService.retrieveAllPosts(pageIdx)
      .then((res) => {
        setPosts(res.data.postInfo);
        setPostCount(res.data.postCount);
        setBoardState(BoardStateEnum.READY);
      })
      .catch((err: Error) => {
        console.error(err);
      });
  };


  return (
    <>
      {
        (() => {
          if (boardState === BoardStateEnum.LOADING) {
            return <Loading />;
          }
          else if (boardState === BoardStateEnum.READY || boardState === BoardStateEnum.WRITING) {
            return (
              <div className="board-wrapper postboard-wrapper">
                <BoardName board_name="전체 게시글" />
                {
                  boardState === BoardStateEnum.READY &&
                                    <>
                                      <AllPostList posts={posts} />
                                      {postCount > 0 && <Paginator pageIdx={pageIdx} pageNum={Math.ceil(postCount / POSTROWNUM)} clickPage={clickPage} />}
                                    </>
                }
              </div>
            );
          }
          else return (
            <div>ERROR PAGE</div>
          );
        })()
      }
    </>
  );
}


export default AllPosts;
