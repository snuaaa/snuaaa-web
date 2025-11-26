import { useState, useEffect } from 'react';

import BoardName from '~/components/Board/BoardName';
import { Board } from '~/services/types';
import CreatePost from './Create';
import ListPost from './List';

type PostBoardProps = {
  boardInfo: Board;
};

function PostBoard({ boardInfo }: PostBoardProps) {
  const [isCreating, setIsCreating] = useState(false);

  // TODO: 게시글 작성시 route 변경하여 불필요한 useEffect 제거
  useEffect(() => {
    setIsCreating(false);
  }, [boardInfo.board_id]);

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
        />
      ) : (
        <CreatePost
          board_id={boardInfo.board_id}
          onClose={() => setIsCreating(false)}
          onCreate={() => {
            setIsCreating(false);
          }}
        />
      )}
    </div>
  );
}

export default PostBoard;
