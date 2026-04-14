import React, { useState } from 'react';
import { useRouter, useNavigate } from '@tanstack/react-router';

import ProfileMini from '../Common/ProfileMini';
import { convertFullDate } from '../../utils/convertDate';
import DownloadFile from './DownloadFile';
import ActionDrawer from '../Common/ActionDrawer';
import FileIcon from '../../components/Common/FileIcon';

import Editor from '../Common/Editor';
import { Content, File } from '~/services/types';
import { useDeletePost } from '~/hooks/queries/usePostQueries';
import { useLikeContent } from '~/hooks/queries/useContentQueries';

type PostComponentProps = {
  postInfo: Content;
  my_id: number;
  isLiked: boolean;
  onClickEdit: () => void;
};

const PostView: React.FC<PostComponentProps> = ({
  postInfo,
  my_id,
  isLiked: isLikedProp,
  onClickEdit,
}) => {
  const router = useRouter();
  const navigate = useNavigate();
  const user = postInfo.user;

  const [likeNum, setLikeNum] = useState(postInfo.like_num);
  const [isLiked, setIsLiked] = useState(isLikedProp);

  const { mutateAsync: mutateDeletePost } = useDeletePost();
  const { mutateAsync: mutateLikeContent } = useLikeContent();

  const deletePost = async () => {
    if (!postInfo) {
      return;
    }
    const goDrop = window.confirm(
      '정말로 삭제하시겠습니까? 삭제한 게시글은 다시 복원할 수 없습니다.',
    );
    if (goDrop) {
      try {
        await mutateDeletePost(postInfo.content_id);
        navigate({ to: `/board/${postInfo.board_id}`, replace: true });
      } catch (err) {
        console.error(err);
        alert('삭제 실패');
      }
    }
  };

  const likePost = async () => {
    if (!postInfo) {
      return;
    }
    try {
      await mutateLikeContent(postInfo.content_id);
      setLikeNum((prevLikeNum) =>
        isLiked ? prevLikeNum - 1 : prevLikeNum + 1,
      );
      setIsLiked((prevIsLiked) => !prevIsLiked);
    } catch (err) {
      console.error(err);
    }
  };

  const makeFileList = () => {
    if (postInfo.attachedFiles && postInfo.attachedFiles.length > 0) {
      return (
        <div className="mt-8 pt-6 border-t border-black/4">
          <h3 className="text-[13px] font-bold text-aqua-400 mb-3 flex items-center gap-2">
            <i className="ri-attachment-line"></i>첨부파일
          </h3>
          <div className="flex flex-col gap-2">
            {postInfo.attachedFiles.map((file: File) => {
              return (
                <div key={file.file_id} className="inline-flex">
                  <DownloadFile
                    content_id={file.parent_id}
                    file_id={file.file_id}
                  >
                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-primary-100/15 border border-black/4 rounded-xl transition-colors cursor-pointer group">
                      <FileIcon
                        fileInfo={file}
                        isFull={true}
                        isDownload={true}
                      />
                    </div>
                  </DownloadFile>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="w-full">
      {/* ── Header Area ── */}
      <div className="relative pb-6 border-b border-black/4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.history.back()}
            className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/5 transition-colors"
          >
            <i className="ri-arrow-left-line text-xl text-primary-900"></i>
          </button>
          <h1 className="flex-1 text-2xl font-bold text-primary-900 wrap-break-word">
            {postInfo.title}
          </h1>
          {my_id === postInfo.author_id && (
            <div className="flex-shrink-0 ml-auto">
              <ActionDrawer clickEdit={onClickEdit} clickDelete={deletePost} />
            </div>
          )}
        </div>

        {/* Info Bar */}
        <div className="flex flex-wrap items-center gap-y-2 gap-x-6 mt-4 px-2 text-[14px] text-gray-400">
          <div className="flex items-center gap-2">
            <i className="ri-user-line text-[16px] text-aqua-400"></i>
            <span className="font-semibold text-primary-900">
              {user && user.nickname}
            </span>
          </div>
          <div className="flex items-center gap-2 relative group">
            <i className="ri-time-line text-[16px] text-aqua-400"></i>
            <span>{convertFullDate(postInfo.createdAt)}</span>
            {postInfo.createdAt !== postInfo.updatedAt && (
              <div className="hidden group-hover:block absolute left-0 top-full mt-1 px-3 py-1.5 bg-primary-900 text-white text-xs rounded shadow-lg whitespace-nowrap z-10 transition-opacity">
                {convertFullDate(postInfo.updatedAt)} Updated
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-1.5" title="조회수">
              <i className="ri-eye-line text-[17px]"></i>
              <span>{postInfo.view_num}</span>
            </div>
            <button
              onClick={() => likePost()}
              className="flex items-center gap-1.5 group cursor-pointer hover:text-pink-500 transition-colors"
              title="좋아요"
            >
              <i
                className={`${isLiked ? 'ri-heart-fill text-pink-500' : 'ri-heart-line group-hover:text-pink-500'} text-[17px] transition-colors`}
              ></i>
              <span
                className={`${isLiked ? 'text-pink-500 font-medium' : ''} transition-colors`}
              >
                {likeNum}
              </span>
            </button>
            <div className="flex items-center gap-1.5" title="댓글">
              <i className="ri-message-2-line text-[17px]"></i>
              <span>{postInfo.comment_num}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content Area ── */}
      <div className="py-8 min-h-[300px]">
        <Editor
          text={postInfo.text}
          setText={() => {
            return;
          }}
          readOnly
        />
      </div>

      {makeFileList()}

      {/* ── Footer Profile ── */}
      <div className="mt-8 pt-8 border-t border-black/4">
        <ProfileMini userInfo={user} />
      </div>
    </div>
  );
};

export default PostView;
