import { ChangeEvent, FC, useState } from 'react';
import { useCreateComment } from '~/hooks/queries/useCommentQueries';

type Props = {
  contentId: number;
};

export const CreateComment: FC<Props> = ({ contentId }) => {
  const [text, setText] = useState<string>('');
  const { mutateAsync: mutateCreateComment } = useCreateComment();

  const createComment = async () => {
    if (!text) {
      alert('내용을 입력하세요.');
    } else {
      const commentInfo = {
        parent_comment_id: 0,
        text: text,
      };
      try {
        await mutateCreateComment({ parentId: contentId, data: commentInfo });
        setText('');
      } catch (err) {
        console.error(err);
        alert('댓글 작성 실패');
      }
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  return (
    <div className="comment-write">
      <textarea
        placeholder="댓글을 입력하세요"
        name="text"
        onChange={handleChange}
        className="w-4/5 h-full resize-none rounded-2xl p-1.5 text-sm"
        value={text}
      ></textarea>
      <button onClick={createComment}>ENTER</button>
    </div>
  );
};
