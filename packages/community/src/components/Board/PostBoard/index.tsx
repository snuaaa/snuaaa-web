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

  if (status !== 'create') {
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
      onClose={() => router.history.back()}
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
