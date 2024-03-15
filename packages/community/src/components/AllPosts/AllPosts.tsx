import { useCallback } from 'react';

import HomeService from '../../services/HomeService';
import Loading from '../Common/Loading';
import AllPostList from '../Post/AllPostList';
import Paginator from '../Common/Paginator';
import BoardName from '../Board/BoardName';

import { useHistory, useLocation } from 'react-router';
import { useFetch } from 'hooks/useFetch';

const POSTROWNUM = 10;

type LocationState = {
  page: number;
};

function AllPosts() {
  const history = useHistory();
  const location = useLocation<LocationState>();
  const pageIdx =
    location.state && location.state.page ? location.state.page : 1;

  const clickPage = (idx: number) => {
    history.push({
      state: {
        page: idx,
      },
    });
  };

  const fetchFunction = useCallback(() => {
    return HomeService.retrieveAllPosts(pageIdx);
  }, [pageIdx]);

  const { data } = useFetch({ fetch: fetchFunction });

  if (!data) {
    return <Loading />;
  }

  const posts = data.data.postInfo;
  const postCount = data.data.postCount;

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
