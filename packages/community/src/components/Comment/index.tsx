import { useCallback, FC } from 'react';

import { Comment } from './Comment';
import CommentService from '../../services/CommentService';
import { useFetch } from '~/hooks/useFetch';
import { CreateComment } from './CreateComment';

type Props = {
  parent_id: number;
};

const CommentSection: FC<Props> = ({ parent_id }) => {
  const fetchFunction = useCallback(
    () => CommentService.retrieveComments(parent_id),
    [parent_id],
  );

  const { data: comments, refresh } = useFetch({ fetch: fetchFunction });

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
