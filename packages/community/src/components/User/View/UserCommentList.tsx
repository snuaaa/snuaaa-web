import useQueryString from '~/hooks/useQueryString';
import { useCallback } from 'react';
import { useFetch } from '~/hooks/useFetch';
import Pagination from '~/components/Common/Pagination';
import CommentService from '~/services/CommentService';
import CommentList from '~/components/Comment/CommentList';

type Props = {
  userUuid: string;
};

const PAGE_SIZE = 10;

function UserCommentList({ userUuid }: Props) {
  const queryString = useQueryString();
  const page = Number(queryString.get('page') ?? 1);

  const fetchFunction = useCallback(() => {
    return CommentService.retrieveCommentList({
      user_uuid: userUuid,
      offset: (page - 1) * PAGE_SIZE,
      limit: PAGE_SIZE,
    });
  }, [userUuid, page]);

  const { data } = useFetch({
    fetch: fetchFunction,
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
        searchGenerator={(page) => ({
          ...Object.fromEntries(queryString.entries()),
          page,
        })}
      />
    </div>
  );
}

export default UserCommentList;
