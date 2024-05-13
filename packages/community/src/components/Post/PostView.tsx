import React, { useState } from 'react';

import ProfileMini from '../Common/ProfileMini';
import { convertFullDate } from '../../utils/convertDate';
import DownloadFile from './DownloadFile';
import ActionDrawer from '../Common/ActionDrawer';
import history from '../../common/history';
import FileIcon from '../../components/Common/FileIcon';

import Editor from '../Common/Editor';
import { Content, File } from 'services/types';
import PostService from 'services/PostService';
import ContentService from 'services/ContentService';

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
  const user = postInfo.user;

  const [likeNum, setLikeNum] = useState(postInfo.like_num);
  const [isLiked, setIsLiked] = useState(isLikedProp);

  const deletePost = async () => {
    if (!postInfo) {
      return;
    }
    const goDrop = window.confirm(
      '정말로 삭제하시겠습니까? 삭제한 게시글은 다시 복원할 수 없습니다.',
    );
    if (goDrop) {
      try {
        await PostService.deletePost(postInfo.content_id);
        history.replace(`/board/${postInfo.board_id}`);
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
      await ContentService.likeContent(postInfo.content_id);
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
        <div className="file-download-wrapper">
          {postInfo.attachedFiles.map((file: File) => {
            return (
              <div className="file-download-list" key={file.file_id}>
                <DownloadFile
                  key={file.file_id}
                  content_id={file.parent_id}
                  file_id={file.file_id}
                >
                  <FileIcon fileInfo={file} isFull={true} isDownload={true} />
                </DownloadFile>
              </div>
            );
          })}
        </div>
      );
    }
  };

  return (
    <div className="post-wrapper">
      <div className="post-title">
        <div className="post-title-back" onClick={() => history.goBack()}>
          <i className="ri-arrow-left-line cursor-pointer"> </i>
        </div>
        <h5> {postInfo.title} </h5>
        {my_id === postInfo.author_id && (
          <ActionDrawer clickEdit={onClickEdit} clickDelete={deletePost} />
        )}
      </div>
      <div className="post-info-other">
        <div className="post-author">
          <i className="ri-icons ri-pencil-fill"></i>
          {user && user.nickname}
        </div>
        <div className="post-date-created flex items-center center">
          <i className="ri-time-line"> </i>
          {convertFullDate(postInfo.createdAt)}
          {postInfo.createdAt !== postInfo.updatedAt && (
            <div className="post-date-updated">
              {convertFullDate(postInfo.updatedAt)} Updated
            </div>
          )}
        </div>
      </div>
      <div className="post-content">
        <Editor
          text={postInfo.text}
          setText={() => {
            return;
          }}
          readOnly
        />
      </div>
      {makeFileList()}
      <ProfileMini userInfo={user} />
      <div className="enif-divider"> </div>
      <div className="actions-wrapper">
        <div className="nums-wrapper">
          <div className="view-num-wrapper">
            <i className="ri-eye-fill"> </i>
            {postInfo.view_num}
          </div>
          <div className="like-num-wrapper">
            <i
              className={`${isLiked ? 'ri-heart-fill' : 'ri-heart-line'} text-2xl cursor-pointer`}
              onClick={() => likePost()}
            ></i>
            {likeNum}
          </div>
          <div className="comment-num-wrapper">
            <i className="ri-message-2-fill text-2xl"> </i>
            {postInfo.comment_num}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostView;
