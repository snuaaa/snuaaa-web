import React from 'react';
import { Link } from 'react-router-dom';
import { convertDate } from '../../utils/convertDate';
import ContentType from '../../types/ContentType';

const MyPostList = ({ posts }: { posts: ContentType[] }) => {

  const makePostList = () => {

    if (posts && posts.length > 0) {
      return posts.map(post => {
        const contentInfo = post;
        const boardInfo = post.board;
        return (
          <div className="my-post-wrapper" key={contentInfo.content_id}>
            {
              boardInfo &&
                            <div className="my-post-boardname">{boardInfo.board_name}</div>
            }
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
      });
    }
  };

  return (
    <div className="my-list-wrapper">
      {/* <h4>등록한 게시글</h4> */}
      {makePostList()}
    </div>
  );
};

export default MyPostList;