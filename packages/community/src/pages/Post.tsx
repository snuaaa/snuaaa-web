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
    <div className="flex-1 flex flex-col min-h-screen bg-primary-50">
      {/* ── Section 1: Dark Header for BoardName ── */}
      <div className="bg-gradient-to-b from-primary-900 via-primary-800 to-primary-700">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-6 md:py-8 text-white drop-shadow-md">
          {postInfo && (
            <BoardName
              board_id={postInfo.board.board_id}
              board_name={postInfo.board.board_name}
            />
          )}
        </div>
      </div>

      {/* ── Section 2: Light Content Area ── */}
      <div className="flex-1 w-full max-w-[1200px] mx-auto px-4 md:px-8 py-8 md:py-12">
        {isEditing ? (
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
            <EditPost
              postInfo={postInfo}
              onCancel={() => setIsEditing(false)}
              onUpdate={() => {
                setIsEditing(false);
              }}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
              <PostView
                postInfo={postInfo}
                my_id={authContext.authInfo.user.user_id}
                isLiked={likeInfo ?? false}
                onClickEdit={() => setIsEditing(true)}
              />
            </div>
            {authContext.authInfo.user.grade < 10 && (
              <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
                <Comment parent_id={postInfo.content_id} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Post;
