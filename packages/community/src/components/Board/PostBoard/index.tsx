import BoardName from '~/components/Board/BoardName';
import { Board } from '~/services/types';
import CreatePost from './Create';
import ListPost from './List';
import { useRouter, useSearch, useNavigate } from '@tanstack/react-router';

type PostBoardProps = {
  boardInfo: Board;
};

function PostBoard({ boardInfo }: PostBoardProps) {
  const search = useSearch({ from: '/board/$board_id' });
  const status = search.status;
  const router = useRouter();
  const navigate = useNavigate({ from: '/board/$board_id' });

  return (
    <div className="board-wrapper postboard-wrapper">
      <BoardName
        board_id={boardInfo.board_id}
        board_name={boardInfo.board_name}
      />
      <div className="board-desc">{boardInfo.board_desc}</div>
      {status !== 'create' ? (
        <ListPost
          boardInfo={boardInfo}
          onClickCreate={() => {
            navigate({
              search: (prev) => ({ ...prev, status: 'create' }),
            });
          }}
        />
      ) : (
        <CreatePost
          board_id={boardInfo.board_id}
          onClose={() => router.history.back()}
          onCreate={() => {
            navigate({
              search: (prev) => ({ ...prev, status: undefined }),
              replace: true,
            });
          }}
        />
      )}
    </div>
  );
}

export default PostBoard;
