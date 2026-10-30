import { Link } from '@tanstack/react-router';
import { convertDate } from '~/utils/convertDate';
import { Comment } from '~/services/types';
import { commentLink } from './commentLink';

type Props = {
  comments: Comment[];
};

function CommentList({ comments }: Props) {
  return (
    <div className="my-list-wrapper">
      {comments.map((comment) => {
        const contentInfo = comment.content;
        const boardInfo = comment.content.board;
        const linkProps = commentLink(contentInfo);

        return (
          <div className="my-cmt-wrapper" key={comment.comment_id}>
            <div className="my-cmt-boardname">
              <Link
                to="/board/$board_id"
                params={{ board_id: boardInfo.board_id }}
              >
                {boardInfo.board_name}
              </Link>
            </div>

            <Link
              to={linkProps.to}
              params={linkProps.params}
              search={linkProps.search}
              className="my-cmt-contents-link"
            >
              <div className="my-cmt-contents">
                <p className="my-cmt-title">{contentInfo.title}</p>
                <p className="my-cmt-cmt">{comment.text}</p>
              </div>
            </Link>
            <div className="my-cmt-date">
              <p>{convertDate(comment.createdAt)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default CommentList;
