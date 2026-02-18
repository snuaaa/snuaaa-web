import { Link } from '@tanstack/react-router';
import { convertDate } from '~/utils/convertDate';
import ContentTypeEnum from '~/common/ContentTypeEnum';
import { Comment, Content } from '~/services/types';

type Props = {
  comments: Comment[];
};

const getLinkProps = (
  content: Content,
): {
  to: string;
  params?: Record<string, string>;
  search?: (prev: Record<string, unknown>) => Record<string, unknown>;
} => {
  switch (content.type) {
    case ContentTypeEnum.POST:
      return {
        to: '/post/$post_id',
        params: { post_id: String(content.content_id) },
      };
    case ContentTypeEnum.PHOTO:
      return {
        to: '.',
        search: (prev) => ({ ...prev, photo: content.content_id }),
      };
    case ContentTypeEnum.DOCUMENT:
      return {
        to: '/document/$doc_id',
        params: { doc_id: String(content.content_id) },
      };
    default:
      return { to: '/' };
  }
};

function CommentList({ comments }: Props) {
  return (
    <div className="my-list-wrapper">
      {comments.map((comment) => {
        const contentInfo = comment.content;
        const boardInfo = comment.content.board;
        const linkProps = getLinkProps(contentInfo);

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
