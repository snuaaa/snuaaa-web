import { useCallback } from 'react';

import HomeService from '~/services/HomeService';
import Loading from '~/components/Common/Loading';
import Paginator from '~/components/Common/Paginator';
import BoardName from '~/components/Board/BoardName';

import { useNavigate, useSearch } from '@tanstack/react-router';
import { useFetch } from '~/hooks/useFetch';
import CommentList from '~/components/Comment/CommentList';

const COMMENTROWNUM = 10;

function AllComments() {
  const navigate = useNavigate({ from: '/comments/all' });
  const searchParams = useSearch({ from: '/comments/all' });
  const pageIdx = searchParams.page || 1;

  const clickPage = (idx: number) => {
    navigate({
      search: (prev) => ({
        ...prev,
        page: idx,
      }),
    });
  };

  const fetchFunction = useCallback(async () => {
    return HomeService.retrieveAllComments(pageIdx);
  }, [pageIdx]);

  const { data } = useFetch({ fetch: fetchFunction });

  if (!data) {
    return <Loading />;
  }

  // TODO: data 구조 변경
  const comments = data.commentInfo;
  const commentCount = data.commentCount;

  return (
    <div className="board-wrapper postboard-wrapper">
      <BoardName board_name="전체 댓글" />
      <CommentList comments={comments} />
      {commentCount > 0 && (
        <Paginator
          pageIdx={pageIdx}
          pageNum={Math.ceil(commentCount / COMMENTROWNUM)}
          clickPage={clickPage}
        />
      )}
    </div>
  );
}

export default AllComments;
