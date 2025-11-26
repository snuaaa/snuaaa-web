import { useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { convertDate } from '~/utils/convertDate';
import Pagination from '~/components/Common/Pagination';
import { useFetch } from '~/hooks/useFetch';
import useQueryString from '~/hooks/useQueryString';
import PostService from '~/services/PostService';

type Props = {
  userUuid: string;
};

const PAGE_SIZE = 10;

const PostList = ({ userUuid }: Props) => {
  const location = useLocation();

  const queryString = useQueryString();
  const page = Number(queryString.get('page') ?? 1);

  const fetchFunction = useCallback(() => {
    return PostService.retrievePostList({
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
              <Link to={`/post/${contentInfo.content_id}`}>
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
        routeGenerator={(page) => {
          const nextSearchParam = new URLSearchParams(queryString);
          nextSearchParam.set('page', page.toString());
          return `${location.pathname}?${nextSearchParam.toString()}`;
        }}
      />
    </div>
  );
};

export default PostList;
