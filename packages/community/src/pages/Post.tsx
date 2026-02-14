import { useState, FC, useEffect } from 'react';
import { useParams, useRouter } from '@tanstack/react-router';

import Comment from '~/components/Comment';
import Loading from '~/components/Common/Loading';
import PostView from '~/components/Post/PostView';
import EditPost from '~/components/Post/EditPost';
// import history from '~/common/history'; // removed
import BoardName from '~/components/Board/BoardName';

import { useAuth } from '~/contexts/auth';
import { usePost } from '~/hooks/queries/usePostQueries';

const Post: FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const authContext = useAuth();
  const { post_id: postId } = useParams({ from: '/post/$post_id' });
  const router = useRouter();

  const { data, isError } = usePost(Number(postId));

  const { postInfo, likeInfo } = data ?? {};

  useEffect(() => {
    if (isError) {
      router.history.back();
    }
  }, [isError, router]);

  if (!postInfo) {
    return <Loading />;
  }

  return (
    <>
      {postInfo && (
        <BoardName
          board_id={postInfo.board.board_id}
          board_name={postInfo.board.board_name}
        />
      )}
      {isEditing ? (
        <EditPost
          postInfo={postInfo}
          onCancel={() => setIsEditing(false)}
          onUpdate={() => {
            setIsEditing(false);
          }}
        />
      ) : (
        <>
          <PostView
            postInfo={postInfo}
            my_id={authContext.authInfo.user.user_id}
            isLiked={likeInfo ?? false}
            onClickEdit={() => setIsEditing(true)}
          />
          {authContext.authInfo.user.grade < 10 && (
            <Comment parent_id={postInfo.content_id} />
          )}
        </>
      )}
    </>
  );
};

export default Post;
