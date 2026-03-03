import { Link } from '@tanstack/react-router';
import { convertDate } from '../../utils/convertDate';
import { Comment } from '~/services/types';
import ContentTypeEnum from '../../common/ContentTypeEnum';

type NewCommentsProps = {
  comments: Comment[];
};

function NewComments({ comments }: NewCommentsProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
      <Link
        to={'/comments/all'}
        className="flex items-center gap-2 px-6 pt-5 pb-3 text-[#000E2C] font-extrabold text-lg tracking-tight no-underline"
      >
        <i className="ri-chat-3-line text-xl text-[#74B9FF]"></i>
        <span>New Comments</span>
        <div className="flex-1 h-0.5 ml-3 bg-gradient-to-r from-[#74B9FF] to-[#49A0AE] rounded-full opacity-30"></div>
      </Link>
      <div>
        {comments.map((comment) => {
          const contentInfo = comment.content;
          const boardInfo = comment.content.board;

          let linkTo: string;
          let linkParams: Record<string, string> = {};
          let linkSearch: Record<string, unknown> | undefined;
          if (contentInfo.type === ContentTypeEnum.POST) {
            linkTo = '/post/$post_id';
            linkParams = { post_id: String(comment.parent_id) };
          } else if (contentInfo.type === ContentTypeEnum.PHOTO) {
            linkTo = '.';
            linkSearch = { photo: comment.parent_id };
          } else if (contentInfo.type === ContentTypeEnum.DOCUMENT) {
            linkTo = '/document/$doc_id';
            linkParams = { doc_id: String(comment.parent_id) };
          } else {
            linkTo = '/';
          }

          return (
            <div
              key={comment.comment_id}
              className="group relative flex px-6 py-3 border-b border-black/[0.04] last:border-b-0 hover:bg-[#CDD9EA]/15 transition-colors duration-200"
            >
              {/* Accent bar */}
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#74B9FF] rounded-r-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              <div className="shrink-0 w-[22%] text-xs font-medium">
                <Link
                  to="/board/$board_id"
                  params={{ board_id: boardInfo.board_id }}
                  className="text-[#A3A3A3]"
                >
                  {boardInfo.board_name}
                </Link>
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  to={linkTo as '/'}
                  params={linkParams}
                  search={
                    linkSearch
                      ? (prev) => ({ ...prev, ...linkSearch })
                      : undefined
                  }
                >
                  <p className="text-[13px] font-semibold text-[#000E2C] truncate">
                    {contentInfo.title ? contentInfo.title : '제목없음'}
                  </p>
                  <div className="flex items-center mt-1 gap-2">
                    <p className="flex-1 min-w-0 text-xs text-[#A3A3A3] italic truncate">
                      {comment.text}
                    </p>
                    <span className="shrink-0 text-[11px] text-[#C9C9C9]">
                      {convertDate(comment.createdAt)}
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default NewComments;
