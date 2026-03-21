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
};

export const Comment: FC<Props> = ({ comment, parent_id }) => {
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
      } catch (err) {
        console.error(err);
        alert('댓글 삭제 실패');
      }
    }
  };

  const likeComment = async (comment_id: number) => {
    await mutateLikeComment(comment_id);
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
        <div
          key={comment.comment_id}
          className="flex gap-3 py-4 pl-12 pr-4 border-t border-black/4 hover:bg-gray-50/50 transition-colors"
        >
          <div className="shrink-0 mt-1">
            <UserActionDrawer
              userInfo={comment.user}
              className="w-8 h-8 rounded-full overflow-hidden shadow-sm"
            >
              <Image
                className="w-full h-full object-cover"
                imgSrc={comment.user.profile_path}
                defaultImgSrc={defaultProfile}
              />
            </UserActionDrawer>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1.5 text-sm">
              <h5 className="font-bold text-primary-900">
                {comment.user.nickname}
              </h5>
              <span className="text-xs text-gray-400">
                {convertDynamicTime(comment.createdAt)}
              </span>
              {myId === comment.author_id && (
                <div className="flex items-center gap-1 ml-auto">
                  <button
                    className="p-1.5 rounded transition-colors text-gray-400 hover:text-aqua-400 hover:bg-black/5"
                    onClick={() =>
                      setEditingComment(comment.comment_id, comment.text)
                    }
                    title="수정"
                  >
                    <i className="ri-edit-2-line text-sm"></i>
                  </button>
                  <button
                    className="p-1.5 rounded transition-colors text-gray-400 hover:text-red-500 hover:bg-black/5"
                    onClick={() => deleteComment(comment.comment_id)}
                    title="삭제"
                  >
                    <i className="ri-delete-bin-line text-sm"></i>
                  </button>
                </div>
              )}
            </div>

            <div className="text-sm text-gray-800 leading-relaxed wrap-break-word">
              {comment.comment_id === editingCommentId ? (
                <div className="flex flex-col gap-2 mt-2">
                  <textarea
                    className="w-full min-h-[80px] p-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-aqua-400 focus:border-aqua-400 outline-none resize-y transition-all"
                    value={editingCommentText}
                    onChange={handleEditingCommentChange}
                  ></textarea>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingCommentId(0)}
                      className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      취소
                    </button>
                    <button
                      onClick={() => updateComment(comment.comment_id)}
                      className="px-3 py-1.5 text-xs font-medium bg-aqua-400 text-white rounded-md hover:bg-aqua-500 transition-colors shadow-sm"
                    >
                      저장
                    </button>
                  </div>
                </div>
              ) : (
                <p>{breakLine(comment.text)}</p>
              )}
            </div>

            <div className="flex items-center gap-4 mt-3">
              <button
                className={`flex items-center gap-1.5 text-[13px] font-medium transition-colors group ${checkLike(comment.likeUsers) ? 'text-pink-500' : 'text-gray-400 hover:text-pink-500'}`}
                onClick={() => likeComment(comment.comment_id)}
              >
                <i
                  className={`${checkLike(comment.likeUsers) ? 'ri-heart-fill text-pink-500' : 'ri-heart-line group-hover:text-pink-500'} text-sm transition-colors`}
                ></i>
                <span>
                  {comment.likeUsers.length > 0
                    ? comment.likeUsers.length
                    : '좋아요'}
                </span>
              </button>

              <button
                className="text-[13px] font-medium text-gray-400 hover:text-aqua-400 transition-colors"
                onClick={() =>
                  onClickSubComment(
                    parentCommentId === comment.comment_id
                      ? 0
                      : comment.comment_id,
                  )
                }
              >
                {parentCommentId === comment.comment_id
                  ? '답글 취소'
                  : '답글 달기'}
              </button>
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <>
      <div className="flex gap-4 py-5 px-4 rounded-xl hover:bg-gray-50/50 transition-colors">
        <div className="shrink-0 mt-1">
          <UserActionDrawer
            userInfo={user}
            className="w-10 h-10 rounded-full overflow-hidden shadow-sm"
          >
            <Image
              className="w-full h-full object-cover"
              imgSrc={user.profile_path}
              defaultImgSrc={defaultProfile}
            />
          </UserActionDrawer>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h5 className="text-[15px] font-bold text-primary-900">
              {user.nickname}
            </h5>
            <span className="text-[13px] text-gray-400">
              {convertDynamicTime(comment.createdAt)}
            </span>
            {myId === comment.author_id && (
              <div className="flex items-center gap-1.5 ml-auto">
                <button
                  className="p-1.5 hover:bg-black/5 rounded transition-colors text-gray-400 hover:text-aqua-400"
                  onClick={() =>
                    setEditingComment(comment.comment_id, comment.text)
                  }
                  title="수정"
                >
                  <i className="ri-edit-2-line text-[15px]"></i>
                </button>
                <button
                  className="p-1.5 hover:bg-black/5 rounded transition-colors text-gray-400 hover:text-red-500"
                  onClick={() => deleteComment(comment.comment_id)}
                  title="삭제"
                >
                  <i className="ri-delete-bin-line text-[15px]"></i>
                </button>
              </div>
            )}
          </div>

          <div className="text-[14.5px] text-gray-800 leading-relaxed wrap-break-word">
            {comment.comment_id === editingCommentId ? (
              <div className="flex flex-col gap-2 mt-2">
                <textarea
                  className="w-full min-h-[80px] p-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-aqua-400 focus:border-aqua-400 outline-none resize-y transition-all shadow-sm"
                  value={editingCommentText}
                  onChange={handleEditingCommentChange}
                ></textarea>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setEditingCommentId(0)}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={() => updateComment(comment.comment_id)}
                    className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-aqua-400 to-blue-400 hover:opacity-90 text-white rounded-lg shadow-md transition-all"
                  >
                    저장
                  </button>
                </div>
              </div>
            ) : (
              <p>{breakLine(comment.text)}</p>
            )}
          </div>

          <div className="flex items-center gap-5 mt-4">
            <button
              className={`flex items-center gap-1.5 text-[13px] font-medium transition-colors group ${checkLike(comment.likeUsers) ? 'text-pink-500' : 'text-gray-400 hover:text-pink-500'}`}
              onClick={() => likeComment(comment.comment_id)}
            >
              <i
                className={`${checkLike(comment.likeUsers) ? 'ri-heart-fill text-pink-500' : 'ri-heart-line group-hover:text-pink-500'} text-[16px] transition-colors`}
              ></i>
              <span>
                {comment.likeUsers.length > 0
                  ? comment.likeUsers.length
                  : '좋아요'}
              </span>
            </button>

            <button
              className="text-[13px] font-medium text-gray-400 hover:text-aqua-400 transition-colors"
              onClick={() =>
                onClickSubComment(
                  parentCommentId === comment.comment_id
                    ? 0
                    : comment.comment_id,
                )
              }
            >
              {parentCommentId === comment.comment_id
                ? '답글 취소'
                : '답글 달기'}
            </button>
          </div>
        </div>
      </div>
      {makeSubCommentList(comment.children)}

      {parentCommentId === comment.comment_id && (
        <div className="mt-4 ml-12 mb-6 flex items-start gap-3">
          <i className="ri-corner-down-right-line text-gray-400 mt-2"></i>
          <div className="flex-1 relative">
            <textarea
              ref={textareaTarget}
              placeholder="답글을 입력하세요..."
              name="text"
              value={text}
              className="w-full min-h-[50px] p-3.5 pr-16 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-aqua-400 focus:border-aqua-400 outline-none resize-none transition-all shadow-sm"
              onChange={handleChange}
            ></textarea>
            <button
              onClick={createComment}
              className="absolute right-2 bottom-2 p-1.5 bg-aqua-400 text-white rounded-lg hover:bg-aqua-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={!text.trim()}
            >
              <i className="ri-send-plane-fill text-sm"></i>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
