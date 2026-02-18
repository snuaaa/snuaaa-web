import { FC } from 'react';

import { Comment } from './Comment';
import { CreateComment } from './CreateComment';
import { useComments, commentKeys } from '~/hooks/queries/useCommentQueries';
import { useQueryClient } from '@tanstack/react-query';

type Props = {
  parent_id: number;
};

const CommentSection: FC<Props> = ({ parent_id }) => {
  const { data: comments } = useComments(parent_id);
  const queryClient = useQueryClient();

  const refresh = () => {
    queryClient.invalidateQueries({
      queryKey: commentKeys.byParent(parent_id),
    });
  };

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
              onUpdate={refresh}
            />
          ))}
        </div>
      )}
      <CreateComment contentId={parent_id} onCreate={refresh} />
    </div>
  );
};

export default CommentSection;
