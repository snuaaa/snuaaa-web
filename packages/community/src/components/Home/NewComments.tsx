import React from 'react';
import { Link } from '@tanstack/react-router';
import { convertDate } from '../../utils/convertDate';

import { Comment } from '~/services/types';
import ContentTypeEnum from '../../common/ContentTypeEnum';

type NewCommentsProps = {
  comments: Comment[];
};

function NewComments({ comments }: NewCommentsProps) {
  const makeCommentList = () => {
    return comments.map((comment) => {
      const contentInfo = comment.content;
      const boardInfo = comment.content.board;

      let linkTo: string;
      let linkParams: Record<string, string> = {};
      let linkSearch: Record<string, unknown> | undefined;
      if (contentInfo.type === ContentTypeEnum.POST) {
        linkTo = '/post/$post_id';
        linkParams = { post_id: String(comment.parent_id) };
      } else if (contentInfo.type === ContentTypeEnum.PHOTO) {
        linkTo = '.';
        linkSearch = { photo: comment.parent_id };
      } else if (contentInfo.type === ContentTypeEnum.DOCUMENT) {
        linkTo = '/document/$doc_id';
        linkParams = { doc_id: String(comment.parent_id) };
      } else {
        linkTo = '/';
      }

      return (
        <div className="new-comment-list" key={comment.comment_id}>
          <div className="new-comment-boardname">
            <Link
              to="/board/$board_id"
              params={{ board_id: boardInfo.board_id }}
            >
              {boardInfo.board_name}
            </Link>
          </div>
          <div className="new-comment-contents">
            <Link
              to={linkTo as '/'}
              params={linkParams}
              search={
                linkSearch ? (prev) => ({ ...prev, ...linkSearch }) : undefined
              }
            >
              <div className="new-comment-contents-top">
                <p className="new-comment-contents-title">
                  {contentInfo.title ? contentInfo.title : '제목없음'}
                </p>
              </div>
              <div className="new-comment-contents-bot">
                <p className="new-comment-comment">{comment.text}</p>
                <div className="new-comment-date">
                  {convertDate(comment.createdAt)}
                </div>
              </div>
            </Link>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="w-full md:w-1/2 p-2 md:p-[5px]">
      <Link to={'/comments/all'}>
        <h4 className="text-xl font-bold text-[#7193C4] py-2 px-1">
          New Comments
        </h4>
      </Link>
      {makeCommentList()}
    </div>
  );
}

export default NewComments;
