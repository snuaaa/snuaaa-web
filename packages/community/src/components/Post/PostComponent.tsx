import React from 'react';

import ProfileMini from '../Common/ProfileMini';
import { convertFullDate } from '../../utils/convertDate';
import DownloadFile from './DownloadFile';
import ActionDrawer from '../Common/ActionDrawer';
import history from '../../common/history';
import FileIcon from '../../components/Common/FileIcon';
import ContentType from '../../types/ContentType';
import FileType from '../../types/FileType';
import Editor2 from '../Common/Editor2';

type PostComponentProps = {
    content: ContentType,
    my_id: number,
    isLiked: boolean,
    likePost: () => void;
    editPost: () => void;
    deletePost: () => void;
}

const PostComponent: React.FC<PostComponentProps> = (
  { content, my_id, isLiked, likePost, editPost, deletePost }
) => {

  const user = content.user;

  const makeFileList = () => {
    if (content.attachedFiles && content.attachedFiles.length > 0) {
      return (
        <div className="file-download-wrapper" >
          {content.attachedFiles.map((file: FileType) => {
            return (
              <div className="file-download-list" key={file.file_id} >
                <DownloadFile key={file.file_id} content_id={file.parent_id} file_id={file.file_id} >
                  <FileIcon fileInfo={file} isFull={true} isDownload={true} />
                </DownloadFile>
              </div>
            );
          }
          )}
        </div>
      );
    }
  };

  return (
    <div className="post-wrapper" >
      <div className="post-title" >
        <div className="post-title-back" onClick={() => history.goBack()}>
          <i className="ri-arrow-left-line enif-pointer" > </i>
        </div>
        < h5 > {content.title} </h5>
        {
          (my_id === content.author_id) &&
                    <ActionDrawer
                      clickEdit={editPost}
                      clickDelete={deletePost}
                    />
        }
      </div>
      <div className="post-info-other" >
        <div className="post-author" >
          <i className="ri-icons ri-pencil-fill"></i>
          {user && user.nickname}
        </div>
        <div className="post-date-created enif-flex-center" >
          <i className="ri-time-line" > </i>
          {convertFullDate(content.createdAt)}
          {
            (content.createdAt !== content.updatedAt) &&
                        <div className="post-date-updated" >
                          {convertFullDate(content.updatedAt)} Updated
                        </div>
          }
        </div>
      </div>
      <div className="post-content">
        <Editor2 text={content.text} setText={() => { return; }} readOnly />
      </div>
      {makeFileList()}
      <ProfileMini userInfo={user} />
      <div className="enif-divider" > </div>
      <div className="actions-wrapper" >
        <div className="nums-wrapper" >
          <div className="view-num-wrapper" >
            <i className="ri-eye-fill" > </i>
            {content.view_num}
          </div>
          < div className="like-num-wrapper" >
            <i className={`${isLiked ? 'ri-heart-fill' : 'ri-heart-line'} enif-f-1p5x enif-pointer`} onClick={() => likePost()}>
            </i>
            {content.like_num}
          </div>
          < div className="comment-num-wrapper" >
            <i className="ri-message-2-fill enif-f-1p5x" > </i>
            {content.comment_num}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostComponent;
