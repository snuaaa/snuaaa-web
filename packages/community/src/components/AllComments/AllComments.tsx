import React, { useState, useEffect } from 'react';

import HomeService from '../../services/HomeService';
import Loading from '../Common/Loading';
import MyCommentList from '../MyPage/MyCommentList';
import Paginator from '../Common/Paginator';
import BoardName from '../Board/BoardName';
import BoardStateEnum from '../../common/BoardStateEnum';
import CommentType from '../../types/CommentType';
import { useLocation, useHistory } from 'react-router';


const TAG = 'ALLCOMMENTS';
const COMMENTROWNUM = 10;


type LocationState = {
    page: number
}

function AllComments() {

  const [comments, setComments] = useState<CommentType[]>([]);
  const [commentCount, setCommentCount] = useState<number>(0);
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
    await HomeService.retrieveAllComments(pageIdx)
      .then((res) => {
        setComments(res.data.commentInfo);
        setCommentCount(res.data.commentCount);
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
                <BoardName board_name="전체 댓글" />
                {
                  boardState === BoardStateEnum.READY &&
                                    <>
                                      <MyCommentList comments={comments} />
                                      {
                                        commentCount > 0 &&
                                            <Paginator
                                              pageIdx={pageIdx}
                                              pageNum={Math.ceil(commentCount / COMMENTROWNUM)}
                                              clickPage={clickPage} />
                                      }
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

export default AllComments;
