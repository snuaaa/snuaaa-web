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
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between border-b border-black/4 pb-4">
        <h3 className="text-[16px] font-bold text-primary-900 flex items-center gap-2">
          <i className="ri-message-3-line text-aqua-400"></i>
          댓글 <span className="text-aqua-400">{comments?.length || 0}</span>
        </h3>
      </div>

      {comments && comments.length > 0 && (
        <div className="flex flex-col gap-2 mb-8">
          {comments.map((comment) => (
            <Comment
              key={comment.comment_id}
              parent_id={parent_id}
              comment={comment}
            />
          ))}
        </div>
      )}

      <div className="mt-8">
        <CreateComment contentId={parent_id} />
      </div>
    </div>
  );
};

export default CommentSection;
