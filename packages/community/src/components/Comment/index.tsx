import { FC } from 'react';

import { Comment } from './Comment';
import { CreateComment } from './CreateComment';
import { useComments } from '~/hooks/queries/useCommentQueries';

type Props = {
  parent_id: number;
};

const CommentSection: FC<Props> = ({ parent_id }) => {
  const { data: comments } = useComments(parent_id);

  // TODO: Add Loading UI
  return (
    <div className="comment-area-wrapper">
      {comments && (
        <div className="comment-list-wrapper">
          {comments.map((comment) => (
            <Comment
              key={comment.comment_id}
              parent_id={parent_id}
              comment={comment}
            />
          ))}
        </div>
      )}
      <CreateComment contentId={parent_id} />
    </div>
  );
};

export default CommentSection;
