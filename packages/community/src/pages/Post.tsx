import { useState, useCallback, FC } from 'react';
import { useParams } from 'react-router';

import Comment from 'components/Comment';
import Loading from 'components/Common/Loading';
import PostView from 'components/Post/PostView';
import EditPost from 'components/Post/EditPost';
import history from 'common/history';
import BoardName from 'components/Board/BoardName';
import PostService from 'services/PostService';

import axios from 'axios';
import { useFetch } from 'hooks/useFetch';
import { useAuth } from 'contexts/auth';

const Post: FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const authContext = useAuth();
  const { post_id: postId } = useParams<{ post_id: string }>();

  const fetchFunction = useCallback(async () => {
    const post_id = Number(postId);

    try {
      const data = await PostService.retrievePost(post_id);
      return data;
    } catch (err: unknown) {
      if (
        axios.isAxiosError(err) &&
        err.response &&
        err.response.data &&
        err.response.data.code === 4001
      ) {
        alert('권한이 없습니다.');
        history.goBack();
      } else {
        alert('해당 게시물이 존재하지 않습니다.');
        history.goBack();
      }
    }
  }, [postId]);

  const { data, refresh } = useFetch({
    fetch: fetchFunction,
  });

  const { postInfo, likeInfo } = data ?? {};

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
            refresh();
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
