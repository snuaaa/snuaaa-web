import React from 'react';
import Comment from '../Comment/Comment';
import ProfileMini from '../Common/ProfileMini';
import DownloadFile from '../Post/DownloadFile';
import { convertFullDate } from '../../utils/convertDate';
import { breakLine } from '../../utils/breakLine';
import ActionDrawer from '../Common/ActionDrawer';

import FileIcon from '../../components/Common/FileIcon';
import ContentType from '../../types/ContentType';
import { useHistory } from 'react-router';

type DocuComponentProps = {
    docData: ContentType;
    my_id: number;
    isLiked: boolean;
    likeDoc: () => Promise<void>;
    deleteDoc: () => Promise<void>;
    setEditState: () => void;
}

const DocuComponent = ({ docData, my_id, setEditState, deleteDoc, likeDoc, isLiked }: DocuComponentProps) => {

  const history = useHistory();
  const contentInfo = docData;
  const userInfo = docData.user;
  const filesInfo = docData.attachedFiles;

  const makeFileList = () => {
    if (filesInfo && filesInfo.length > 0) {
      return filesInfo.map((file) => {
        return (
          <div className="file-download-list" key={file.file_id}>
            <DownloadFile key={file.file_id} content_id={file.parent_id} file_id={file.file_id}>
              <FileIcon fileInfo={file} isFull={true} isDownload={true} />
            </DownloadFile>
          </div>
        );
      });
    }
    else {
      return;
    }
  };

  return (
    <div className="post-wrapper">
      <div className="post-title">
        <div className="post-title-back" onClick={() => history.goBack()}>
          <i className="ri-arrow-left-line enif-pointer" ></i>
        </div>
        <h5>{contentInfo.title}</h5>
        {
          (my_id === userInfo.user_id) &&
                    <ActionDrawer
                      clickEdit={setEditState}
                      clickDelete={deleteDoc} />
        }
      </div>
      <div className="post-info-other">
        <div className="post-author">
          {userInfo.nickname}
        </div>
        <div className="post-date">
          {convertFullDate(contentInfo.createdAt)}
        </div>
      </div>
      <div className="post-content">
        <div className="doc-text-wrp">
          {breakLine(contentInfo.text)}
        </div>
      </div>
      <div className="file-download-wrapper">
        {makeFileList()}
      </div>
      <ProfileMini userInfo={userInfo} />
      <div className="enif-divider"></div>
      <div className="actions-wrapper" >
        <div className="nums-wrapper" >
          <div className="view-num-wrapper" >
            <i className="ri-eye-fill" > </i>
            {contentInfo.view_num}
          </div>
          < div className="like-num-wrapper" >
            <i className={`${isLiked ? 'ri-heart-fill' : 'ri-heart-line'} enif-f-1p5x enif-pointer`} onClick={() => likeDoc()}>
            </i>
            {contentInfo.like_num}
          </div>
          < div className="comment-num-wrapper" >
            <i className="ri-message-2-fill enif-f-1p5x" > </i>
            {contentInfo.comment_num}
          </div>
        </div>
      </div>
      <Comment parent_id={contentInfo.content_id} />
    </div>
  );
};

export default DocuComponent;
