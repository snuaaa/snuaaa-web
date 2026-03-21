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
    <div className="flex items-start gap-4 p-5 bg-gray-50 rounded-2xl border border-black/4 shadow-sm relative">
      <div className="flex-1">
        <textarea
          placeholder="댓글을 남겨보세요."
          name="text"
          onChange={handleChange}
          className="w-full min-h-[80px] p-4 pr-20 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-aqua-400 focus:border-aqua-400 outline-none resize-none transition-all shadow-sm"
          value={text}
        ></textarea>
        <button
          onClick={createComment}
          className="absolute right-8 bottom-8 px-4 py-2 bg-aqua-400 text-white text-sm font-bold rounded-lg hover:bg-aqua-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          disabled={!text.trim()}
        >
          등록
        </button>
      </div>
    </div>
  );
};
