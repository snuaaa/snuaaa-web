import React from 'react';
import { Link } from 'react-router-dom';
import { convertDate } from '../../utils/convertDate';
import ContentType from '../../types/ContentType';
import ContentTypeEnum from '../../common/ContentTypeEnum';

const NewPosts = ({ posts }: { posts: ContentType[] }) => {

  const makePostList = () => {
    return posts.map(post => {
      const content = post;
      const boardInfo = post.board;
      return (
        <div className="new-post-list" key={content.content_id}>
          <div className="new-post-boardname">
            {
              boardInfo &&
                            <Link to={`/board/${boardInfo.board_id}`}>
                              {boardInfo.board_name}
                            </Link>
            }
          </div>
          <div className="new-post-title">
            <Link to={
              content.type === ContentTypeEnum.POST ? `/post/${content.content_id}`
                : content.type === ContentTypeEnum.DOCUMENT ? `/document/${content.content_id}`
                  : '/'}>
              <h5>{`${content.title} `}</h5>
            </Link>
          </div>
          <p>{`[${content.comment_num}]`}</p>
          <div className="new-post-date">{convertDate(content.createdAt)}</div>
        </div>
      );
    });
  };

  return (
    <div className="new-posts-wrapper">
      <Link to={'/posts/all'}>
        <h4>New Posts</h4>
      </Link>
      {makePostList()}
    </div>
  );
};

export default NewPosts;
