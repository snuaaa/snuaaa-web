import Pagination from '~/components/Common/Pagination';
import CommentList from '~/components/Comment/CommentList';
import { useCommentList } from '~/hooks/queries/useCommentQueries';

type Props = {
  userUuid: string;
  page: number;
};

const PAGE_SIZE = 10;

function UserCommentList({ userUuid, page }: Props) {
  const { data } = useCommentList({
    user_uuid: userUuid,
    offset: (page - 1) * PAGE_SIZE,
    limit: PAGE_SIZE,
  });

  if (!data) {
    return <div>Loading...</div>;
  }

  if (data.count === 0) {
    return <div className="no-data">등록한 댓글이 없습니다.</div>;
  }

  return (
    <div>
      <CommentList comments={data.rows} />

      <Pagination
        currentPage={page}
        totalPageCount={Math.ceil(data.count / PAGE_SIZE)}
      />
    </div>
  );
}

export default UserCommentList;
