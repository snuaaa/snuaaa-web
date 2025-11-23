import { Link, useHistory } from 'react-router-dom';
import { convertDate } from '~/utils/convertDate';

import { LocationDescriptorObject } from 'history';
import ContentTypeEnum from '~/common/ContentTypeEnum';
import { Comment, Content } from '~/services/types';

type Props = {
  comments: Comment[];
};

const getLinkTo = (
  content: Content,
  history: ReturnType<typeof useHistory>,
): string | LocationDescriptorObject => {
  if (content.type === ContentTypeEnum.POST) {
    return `/post/${content.content_id}`;
  }
  if (content.type === ContentTypeEnum.PHOTO) {
    return {
      pathname: `/photo/${content.content_id}`,
      state: {
        modal: true,
        backgroundLocation: history.location,
      },
    };
  }
  if (content.type === ContentTypeEnum.DOCUMENT) {
    return `/document/${content.content_id}`;
  }
  return '/';
};

function CommentList({ comments }: Props) {
  const history = useHistory();

  return (
    <div className="my-list-wrapper">
      {comments.map((comment) => {
        const contentInfo = comment.content;
        const boardInfo = comment.content.board;
        const linkTo = getLinkTo(contentInfo, history);

        return (
          <div className="my-cmt-wrapper" key={comment.comment_id}>
            <div className="my-cmt-boardname">
              <Link to={`/board/${boardInfo.board_id}`}>
                {boardInfo.board_name}
              </Link>
            </div>

            <Link to={linkTo} className="my-cmt-contents-link">
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
