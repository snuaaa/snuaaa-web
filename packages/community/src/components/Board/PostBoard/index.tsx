import { useState, useEffect, useCallback } from 'react';

import Loading from '~/components/Common/Loading';
import BoardName from '~/components/Board/BoardName';
import { Board } from '~/services/types';
import PostService from '~/services/PostService';
import { useFetch } from '~/hooks/useFetch';
import CreatePost from './Create';
import useQueryString from '~/hooks/useQueryString';
import ListPost from './List';

const PAGE_SIZE = 10;

type PostBoardProps = {
  boardInfo: Board;
};

function PostBoard({ boardInfo }: PostBoardProps) {
  const queryString = useQueryString();
  const page = Number(queryString.get('page') ?? 1);

  const [isCreating, setIsCreating] = useState(false);

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
        <ListPost
          boardInfo={boardInfo}
          onClickCreate={() => setIsCreating(true)}
          rows={data.rows}
          count={data.count}
        />
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
