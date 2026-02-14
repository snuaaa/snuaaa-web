import { Link, useRouter, HistoryState } from '@tanstack/react-router';
import { convertDate } from '~/utils/convertDate';
import ContentTypeEnum from '~/common/ContentTypeEnum';
import { Comment, Content } from '~/services/types';

type Props = {
  comments: Comment[];
};

const getLinkProps = (
  content: Content,
  router: ReturnType<typeof useRouter>,
): { to: string; params?: Record<string, string>; state?: HistoryState } => {
  if (content.type === ContentTypeEnum.POST) {
    return {
      to: '/post/$post_id',
      params: { post_id: String(content.content_id) },
    };
  }
  if (content.type === ContentTypeEnum.PHOTO) {
    return {
      to: '/photo/$photo_id',
      params: { photo_id: String(content.content_id) },
      state: {
        modal: true,
        backgroundLocation: router.state.location,
      },
    };
  }
  if (content.type === ContentTypeEnum.DOCUMENT) {
    return {
      to: '/document/$doc_id',
      params: { doc_id: String(content.content_id) },
    };
  }
  return { to: '/' };
};

function CommentList({ comments }: Props) {
  const router = useRouter();

  return (
    <div className="my-list-wrapper">
      {comments.map((comment) => {
        const contentInfo = comment.content;
        const boardInfo = comment.content.board;
        const linkProps = getLinkProps(contentInfo, router);

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
              to={linkProps.to as '/'}
              params={linkProps.params}
              state={linkProps.state}
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
