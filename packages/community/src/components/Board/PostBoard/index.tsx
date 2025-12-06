import BoardName from '~/components/Board/BoardName';
import { Board } from '~/services/types';
import CreatePost from './Create';
import ListPost from './List';
import useQueryString from '~/hooks/useQueryString';
import { useHistory, useLocation } from 'react-router-dom';

type PostBoardProps = {
  boardInfo: Board;
};

function PostBoard({ boardInfo }: PostBoardProps) {
  const queryString = useQueryString();
  const status = queryString.get('status');
  const history = useHistory();
  const location = useLocation();

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
            const searchParams = new URLSearchParams([['status', 'create']]);
            history.push(`?${searchParams.toString()}`);
          }}
        />
      ) : (
        <CreatePost
          board_id={boardInfo.board_id}
          onClose={() => history.goBack()}
          onCreate={() => {
            history.replace(location.pathname);
          }}
        />
      )}
    </div>
  );
}

export default PostBoard;
