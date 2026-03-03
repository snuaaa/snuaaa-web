import { Link } from '@tanstack/react-router';
import { convertDate } from '../../utils/convertDate';
import ContentTypeEnum from '../../common/ContentTypeEnum';
import { Content } from '~/services/types';

const NewPosts = ({ posts }: { posts: Content[] }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
      <Link
        to={'/posts/all'}
        className="flex items-center gap-2 px-6 pt-5 pb-3 text-[#000E2C] font-extrabold text-lg tracking-tight no-underline"
      >
        <i className="ri-article-line text-xl text-[#49A0AE]"></i>
        <span>New Posts</span>
        <div className="flex-1 h-0.5 ml-3 bg-gradient-to-r from-[#49A0AE] to-[#74B9FF] rounded-full opacity-30"></div>
      </Link>
      <div>
        {posts.map(
          ({
            content_id,
            type,
            title,
            comment_num,
            createdAt,
            board: { board_id, board_name },
          }) => (
            <div
              key={content_id}
              className="group relative flex items-center gap-2 px-6 py-3 border-b border-black/[0.04] last:border-b-0 hover:bg-[#CDD9EA]/15 transition-colors duration-200"
            >
              {/* Accent bar */}
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#49A0AE] rounded-r-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              <div className="shrink-0 w-[18%] text-xs text-[#A3A3A3] font-medium truncate">
                <Link to="/board/$board_id" params={{ board_id }}>
                  {board_name}
                </Link>
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  to={
                    type === ContentTypeEnum.POST
                      ? '/post/$post_id'
                      : type === ContentTypeEnum.DOCUMENT
                        ? '/document/$doc_id'
                        : '/'
                  }
                  params={
                    type === ContentTypeEnum.POST
                      ? { post_id: String(content_id) }
                      : type === ContentTypeEnum.DOCUMENT
                        ? { doc_id: String(content_id) }
                        : {}
                  }
                >
                  <h5 className="text-[13px] font-semibold text-[#000E2C] truncate">
                    {title}
                  </h5>
                </Link>
              </div>
              <span className="shrink-0 text-[11px] text-[#49A0AE] font-bold">
                [{comment_num}]
              </span>
              <span className="shrink-0 text-[11px] text-[#C9C9C9] ml-auto">
                {convertDate(createdAt)}
              </span>
            </div>
          ),
        )}
      </div>
    </div>
  );
};

export default NewPosts;
