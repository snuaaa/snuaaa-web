import { ChangeEvent, FC, useState } from 'react';
import CommentService from '~/services/CommentService';

type Props = {
  contentId: number;
  onCreate: () => void;
};

export const CreateComment: FC<Props> = ({ contentId, onCreate }) => {
  const [text, setText] = useState<string>('');

  const createComment = async () => {
    if (!text) {
      alert('내용을 입력하세요.');
    } else {
      const commentInfo = {
        parent_comment_id: 0,
        text: text,
      };
      try {
        await CommentService.createComment(contentId, commentInfo);
        setText('');
        onCreate();
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
