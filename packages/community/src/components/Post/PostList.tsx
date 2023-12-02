import React from 'react';
import { Link } from 'react-router-dom';
import { convertDate } from '../../utils/convertDate';
import ContentType from '../../types/ContentType';

function PostList({ posts }: { posts: ContentType[] }) {

  const makePostList = () => {

    const postList = posts.map(post => {
      const content = post;
      const user = post.user;

      return (
        <div className="post-list" key={content.content_id}>
          <div className="post-list-unit-left">
            <div className="post-list-unit-title">
              <Link to={`/post/${content.content_id}`}>
                <h5>{content.title}</h5>
              </Link>
            </div>
            <div className="post-list-unit-left-bot">
              <div className="post-list-unit post-list-unit-2">
                {user && user.nickname}
              </div>
              <div className="post-list-unit post-list-unit-2">
                {convertDate(content.createdAt)}
              </div>
            </div>
          </div>

          <div className="post-list-unit post-list-unit-3">
            <span className="color-pink icon-wrapper">
              <i className="ri-heart-fill"></i>
              {content.like_num}
            </span>
          </div>
          <div className="post-list-unit post-list-unit-3">
            <span className="color-gray1 icon-wrapper">
              <i className="ri-message-2-fill"></i>
              {content.comment_num}
            </span>
          </div>
        </div>
      );
    });
    return postList;
  };

  return (
    <>
      <div className="post-list-wrapper">
        <div className="post-list-header">
          <div className="post-list-header-unit post-list-header-1">제목</div>
          <div className="post-list-header-unit post-list-header-2">작성자</div>
          <div className="post-list-header-unit post-list-header-2">작성일</div>
          <div className="post-list-header-unit post-list-header-3">추천</div>
          <div className="post-list-header-unit post-list-header-3">댓글</div>
        </div>
        {makePostList()}
      </div>

    </>
  );
}

export default PostList;