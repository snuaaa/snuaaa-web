import { Link } from 'react-router-dom';
import { convertDate } from '../../utils/convertDate';
import ContentTypeEnum from '../../common/ContentTypeEnum';
import { Content } from 'services/types';

const NewPosts = ({ posts }: { posts: Content[] }) => {
  const makePostList = () => {
    return posts.map(
      ({
        content_id,
        type,
        title,
        comment_num,
        createdAt,
        board: { board_id, board_name },
      }) => {
        return (
          <div
            className="px-3 py-[12.5px] flex max-w-full border-t border-solid border-gray-200 last:border-b gap-1"
            key={content_id}
          >
            <div className="shrink-0 w-1/5 grow-0 text-[#A3A3A3]">
              <Link to={`/board/${board_id}`}>{board_name}</Link>
            </div>
            <div className="w-[45%] pr-1">
              <Link
                to={
                  type === ContentTypeEnum.POST
                    ? `/post/${content_id}`
                    : type === ContentTypeEnum.DOCUMENT
                      ? `/document/${content_id}`
                      : '/'
                }
              >
                <h5 className="truncate">{`${title} `}</h5>
              </Link>
            </div>
            <p>{`[${comment_num}]`}</p>
            <div className="ml-auto text-[#A3A3A3]">
              {convertDate(createdAt)}
            </div>
          </div>
        );
      },
    );
  };

  return (
    <div className="w-full md:w-1/2 p-2 md:p-[5px]">
      <Link to={'/posts/all'}>
        <h4 className="text-xl font-bold text-[#7193C4] py-2 px-1">
          New Posts
        </h4>
      </Link>
      {makePostList()}
    </div>
  );
};

export default NewPosts;
