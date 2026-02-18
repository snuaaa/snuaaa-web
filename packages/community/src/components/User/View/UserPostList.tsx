import { Link } from '@tanstack/react-router';
import { convertDate } from '~/utils/convertDate';
import Pagination from '~/components/Common/Pagination';
import { usePostList } from '~/hooks/queries/usePostQueries';

type Props = {
  userUuid: string;
  page: number;
};

const PAGE_SIZE = 10;

const PostList = ({ userUuid, page }: Props) => {
  const { data } = usePostList({
    user_uuid: userUuid,
    offset: (page - 1) * PAGE_SIZE,
    limit: PAGE_SIZE,
  });

  if (!data) {
    return <div>Loading...</div>;
  }

  if (data.count === 0) {
    return <div className="no-data">등록한 게시글이 없습니다.</div>;
  }

  return (
    <div className="my-list-wrapper">
      {data.rows.map((post) => {
        const contentInfo = post;
        const boardInfo = post.board;
        return (
          <div className="my-post-wrapper" key={contentInfo.content_id}>
            <div className="my-post-boardname">{boardInfo.board_name}</div>
            <div className="my-post-title">
              <Link
                to="/post/$post_id"
                params={{ post_id: String(contentInfo.content_id) }}
              >
                <h5>{contentInfo.title}</h5>
              </Link>
            </div>
            <div className="my-post-date">
              {convertDate(contentInfo.createdAt)}
            </div>
          </div>
        );
      })}

      <Pagination
        currentPage={page}
        totalPageCount={Math.ceil(data.count / PAGE_SIZE)}
      />
    </div>
  );
};

export default PostList;
