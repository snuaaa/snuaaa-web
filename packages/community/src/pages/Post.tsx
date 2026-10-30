import { useState, FC } from 'react';
import {
  Link,
  useCanGoBack,
  useNavigate,
  useParams,
  useRouter,
} from '@tanstack/react-router';

import Loading from '~/components/Common/Loading';
import EditPost from '~/components/Post/EditPost';
import PostDetail from '~/components/Post/PostDetail';
import { Button } from '~/components/ui';

import { usePost } from '~/hooks/queries/usePostQueries';

const Post: FC = () => {
  const { post_id: postId } = useParams({ from: '/post/$post_id' });
  // Tied to the post, so moving to another post (e.g. back) leaves edit mode.
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const isEditing = editingPostId === postId;
  const router = useRouter();
  const navigate = useNavigate();
  const canGoBack = useCanGoBack();

  const { data, isError } = usePost(Number(postId));
  const { postInfo, likeInfo } = data ?? {};

  // A post that is deleted or on a board this member can't read.
  if (isError || (data && !postInfo)) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-1.5 px-4 py-24 text-center">
        <p className="text-heading">글을 찾을 수 없어요</p>
        <p className="text-label font-normal text-fg-muted">
          삭제되었거나 볼 수 없는 글이에요.
        </p>
        <Button asChild variant="secondary" size="sm" className="mt-4">
          <Link to="/">홈으로</Link>
        </Button>
      </div>
    );
  }

  if (!postInfo) {
    return <Loading />;
  }

  if (isEditing) {
    return (
      <EditPost
        postInfo={postInfo}
        onCancel={() => setEditingPostId(null)}
        onUpdate={() => setEditingPostId(null)}
      />
    );
  }

  return (
    <PostDetail
      // Remount when moving between posts so like state starts fresh.
      key={postInfo.content_id}
      post={postInfo}
      isLiked={likeInfo ?? false}
      onEdit={() => setEditingPostId(postId)}
      onBack={() => {
        if (canGoBack) {
          router.history.back();
        } else {
          navigate({
            to: '/board/$board_id',
            params: { board_id: postInfo.board.board_id },
          });
        }
      }}
    />
  );
};

export default Post;
