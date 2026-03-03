import Loading from '~/components/Common/Loading';
import AllPostList from '~/components/Post/AllPostList';
import Paginator from '~/components/Common/Paginator';
import BoardName from '~/components/Board/BoardName';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useAllPosts } from '~/hooks/queries/useHomeQueries';

const POSTROWNUM = 10;

function AllPosts() {
  const navigate = useNavigate({ from: '/posts/all' });
  const searchParams = useSearch({ from: '/posts/all' });
  const pageIdx = searchParams.page || 1;

  const clickPage = (idx: number) => {
    navigate({
      search: (prev) => ({
        ...prev,
        page: idx,
      }),
    });
  };

  const { data } = useAllPosts(pageIdx);

  if (!data) {
    return <Loading />;
  }

  const posts = data.postInfo;
  const postCount = data.postCount;

  return (
    <div className="board-wrapper postboard-wrapper">
      <BoardName board_name="전체 게시글" />
      <AllPostList posts={posts} />
      {postCount > 0 && (
        <Paginator
          pageIdx={pageIdx}
          pageNum={Math.ceil(postCount / POSTROWNUM)}
          clickPage={clickPage}
        />
      )}
    </div>
  );
}

export default AllPosts;
