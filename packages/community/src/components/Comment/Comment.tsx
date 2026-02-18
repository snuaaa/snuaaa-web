import { ChangeEvent, FC, useState, useRef, useEffect } from 'react';
import Image from '../Common/AaaImage';
import { breakLine } from '../../utils/breakLine';
import { convertDynamicTime } from '../../utils/convertDate';
import defaultProfile from '~/assets/img/common/profile.png';
import UserActionDrawer from '../../components/Common/UserActionDrawer';
import { Comment as CommentType } from '~/services/types';
import { User } from '~/services/types';
import { useAuth } from '~/contexts/auth';
import {
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
  useLikeComment,
} from '~/hooks/queries/useCommentQueries';

type Props = {
  comment: CommentType;
  parent_id: number;
  onUpdate: () => void;
};

export const Comment: FC<Props> = ({ comment, parent_id, onUpdate }) => {
  const authContext = useAuth();

  const myId = authContext.authInfo.user.user_id;

  const [text, setText] = useState<string>('');
  const [editingCommentId, setEditingCommentId] = useState<number>(0);
  const [editingCommentText, setEditingCommentText] = useState<string>('');
  const [parentCommentId, setParentCommentId] = useState<number>(0);
  const textareaTarget = useRef<HTMLTextAreaElement>(null);

  const { mutateAsync: mutateCreateComment } = useCreateComment();
  const { mutateAsync: mutateUpdateComment } = useUpdateComment();
  const { mutateAsync: mutateDeleteComment } = useDeleteComment();
  const { mutateAsync: mutateLikeComment } = useLikeComment();

  const checkLike = (users: User[]) => {
    return users
      .map((user) => user.user_id)
      .includes(authContext.authInfo.user.user_id);
  };

  const deleteComment = async (comment_id: number) => {
    const goDrop = window.confirm('정말로 삭제하시겠습니까?');
    if (goDrop) {
      try {
        await mutateDeleteComment(comment_id);
        onUpdate();
      } catch (err) {
        console.error(err);
        alert('댓글 삭제 실패');
      }
    }
  };

  const likeComment = async (comment_id: number) => {
    await mutateLikeComment(comment_id);
    onUpdate();
  };

  const user = comment.user;

  const setEditingComment = (comment_id: number, text: string) => {
    setEditingCommentId(comment_id);
    setEditingCommentText(text);
  };

  const createComment = async () => {
    if (!text) {
      alert('내용을 입력하세요.');
    } else {
      const commentInfo = {
        parent_comment_id: parentCommentId,
        text: text,
      };
      try {
        await mutateCreateComment({ parentId: parent_id, data: commentInfo });
        setText('');
        onUpdate();
      } catch (err) {
        console.error(err);
        alert('댓글 작성 실패');
      }
    }
  };

  const updateComment = async (comment_id: number) => {
    if (!editingCommentText) {
      alert('내용을 입력하세요.');
      return;
    }

    const commentInfo = {
      text: editingCommentText,
    };

    try {
      await mutateUpdateComment({ commentId: comment_id, data: commentInfo });
      setEditingCommentId(0);
      setEditingCommentText('');
      onUpdate();
    } catch (err) {
      console.error(err);
      alert('댓글 업데이트 실패');
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleEditingCommentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setEditingCommentText(e.target.value);
  };

  const onClickSubComment = (parent_comment_id: number) => {
    setText('');
    setParentCommentId(parent_comment_id);
  };

  useEffect(() => {
    if (textareaTarget.current) {
      textareaTarget.current.focus();
    }
  }, [parentCommentId]);

  const makeSubCommentList = (comments: CommentType[]) => {
    return comments.map((comment) => {
      return (
        <div key={comment.comment_id} className="comment-wrapper sub">
          <UserActionDrawer userInfo={comment.user} className="profile">
            <Image
              className="comment-profile-img"
              imgSrc={comment.user.profile_path}
              defaultImgSrc={defaultProfile}
            />
          </UserActionDrawer>
          <div className="com-cont-wrp">
            <div className="com-cont-top">
              <h5>{comment.user.nickname}</h5>
              {myId === comment.author_id && (
                <div className="actions-wrapper">
                  <div className="edit-wrapper">
                    <i
                      className="ri-edit-2-line cursor-pointer action-icons"
                      onClick={() =>
                        setEditingComment(comment.comment_id, comment.text)
                      }
                    ></i>
                  </div>
                  <div className="delete-wrapper">
                    <i
                      className="ri-delete-bin-line cursor-pointer action-icons"
                      onClick={() => deleteComment(comment.comment_id)}
                    ></i>
                  </div>
                </div>
              )}
              <p className="com-date">
                {convertDynamicTime(comment.createdAt)}
              </p>
            </div>
            <div className="com-cont-mid">
              {comment.comment_id === editingCommentId ? (
                <>
                  <textarea
                    value={editingCommentText}
                    onChange={handleEditingCommentChange}
                  ></textarea>
                  <button onClick={() => updateComment(comment.comment_id)}>
                    ENTER
                  </button>
                </>
              ) : (
                <p>{breakLine(comment.text)}</p>
              )}
            </div>
            <div className="com-cont-bot">
              <div
                className={`cmt-like-wrp ${checkLike(comment.likeUsers) ? 'color-pink' : 'color-gray1'} `}
              >
                <i
                  className={`ri-heart-${checkLike(comment.likeUsers) ? 'fill' : 'line'}`}
                  onClick={() => likeComment(comment.comment_id)}
                ></i>
                <p>{comment.likeUsers.length}</p>
              </div>
              {parentCommentId === comment.parent_comment_id ? (
                <p
                  className="cursor-pointer"
                  onClick={() => onClickSubComment(0)}
                >
                  답글 달기 취소
                </p>
              ) : (
                <p
                  className="cursor-pointer"
                  onClick={() => onClickSubComment(comment.parent_comment_id)}
                >
                  답글 달기
                </p>
              )}
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <>
      <div className="comment-wrapper">
        <UserActionDrawer userInfo={user} className="profile">
          <Image
            className="comment-profile-img"
            imgSrc={user.profile_path}
            defaultImgSrc={defaultProfile}
          />
        </UserActionDrawer>
        <div className="com-cont-wrp">
          <div className="com-cont-top">
            <h5>{user.nickname}</h5>
            {myId === comment.author_id && (
              <div className="actions-wrapper">
                <div className="edit-wrapper">
                  <i
                    className="ri-edit-2-line cursor-pointer action-icons"
                    onClick={() =>
                      setEditingComment(comment.comment_id, comment.text)
                    }
                  ></i>
                </div>
                <div className="delete-wrapper">
                  <i
                    className="ri-delete-bin-line cursor-pointer action-icons"
                    onClick={() => deleteComment(comment.comment_id)}
                  ></i>
                </div>
              </div>
            )}
            <p className="com-date">{convertDynamicTime(comment.createdAt)}</p>
          </div>
          <div className="com-cont-mid">
            {comment.comment_id === editingCommentId ? (
              <>
                <textarea
                  value={editingCommentText}
                  onChange={handleEditingCommentChange}
                ></textarea>
                <button onClick={() => updateComment(comment.comment_id)}>
                  ENTER
                </button>
              </>
            ) : (
              <p>{breakLine(comment.text)}</p>
            )}
          </div>
          <div className="com-cont-bot">
            <div
              className={`cmt-like-wrp ${checkLike(comment.likeUsers) ? 'color-pink' : 'color-gray1'} `}
            >
              <i
                className={`ri-heart-${checkLike(comment.likeUsers) ? 'fill' : 'line'}`}
                onClick={() => likeComment(comment.comment_id)}
              ></i>
              <p>{comment.likeUsers.length}</p>
            </div>
            {parentCommentId === comment.comment_id ? (
              <p
                className="cursor-pointer"
                onClick={() => onClickSubComment(0)}
              >
                답글 달기 취소
              </p>
            ) : (
              <p
                className="cursor-pointer"
                onClick={() => onClickSubComment(comment.comment_id)}
              >
                답글 달기
              </p>
            )}
          </div>
        </div>
      </div>
      {makeSubCommentList(comment.children)}
      {parentCommentId === comment.comment_id && (
        <div className="comment-write sub">
          <textarea
            ref={textareaTarget}
            placeholder="댓글을 입력하세요"
            name="text"
            value={text}
            className="w-4/5 h-full resize-none rounded-2xl p-1.5 text-sm"
            onChange={handleChange}
          ></textarea>
          <button onClick={createComment}>ENTER</button>
        </div>
      )}
    </>
  );
};
