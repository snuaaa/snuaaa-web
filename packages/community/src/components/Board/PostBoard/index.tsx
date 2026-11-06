import { Board } from '~/services/types';
import CreatePost from './Create';
import ListPost from './List';
import { useSearch, useNavigate } from '@tanstack/react-router';
import { useAuth } from '~/contexts/auth';
import { canWrite } from '../boardUtils';
import useLeaveWriteScreen from '../useLeaveWriteScreen';

type PostBoardProps = {
  boardInfo: Board;
};

function PostBoard({ boardInfo }: PostBoardProps) {
  const search = useSearch({ from: '/board/$board_id' });
  const status = search.status;
  const navigate = useNavigate({ from: '/board/$board_id' });
  const leaveCreate = useLeaveWriteScreen();
  const {
    authInfo: {
      user: { grade },
    },
  } = useAuth();

  // The URL can be opened without write access; the list shows instead.
  if (status !== 'create' || !canWrite(boardInfo, grade)) {
    return (
      <ListPost
        boardInfo={boardInfo}
        onClickCreate={() => {
          navigate({
            search: (prev) => ({ ...prev, status: 'create' }),
          });
        }}
      />
    );
  }

  return (
    <CreatePost
      board={boardInfo}
      onClose={leaveCreate}
      onCreate={(contentId, failedFiles) => {
        // Replace the write screen, so back from the new post is the list.
        navigate({
          to: '/post/$post_id',
          params: { post_id: String(contentId) },
          replace: true,
          state: (prev) => ({ ...prev, failedAttachments: failedFiles }),
        });
      }}
    />
  );
}

export default PostBoard;
