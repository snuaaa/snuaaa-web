import React, { ChangeEvent } from 'react';
import Editor2 from '../Common/Editor2';
import ContentType from '../../types/ContentType';
import AttachFile from './AttachFile';
import FileType from '../../types/FileType';
import FileIcon from '../Common/FileIcon';

type EditPostProps = {
    postInfo: ContentType;
    isBtnDisabled: boolean;
    handleEditting: (e: ChangeEvent<HTMLInputElement>) => void;
    handleEdittingText: (text: string) => void;
    attachedFiles: File[];
    attachFile: (e: ChangeEvent<HTMLInputElement>) => void;
    removeAttachedFile: (index: number) => void;
    removedFiles: number[];
    removeFile: (file_id: number) => void;
    cancelRemoveFile: (file_id: number) => void;
    cancel: () => void;
    confirm: () => void;
}


function EditPost(props: EditPostProps) {

  const makeFileList = () => {
    if (props.postInfo.attachedFiles && props.postInfo.attachedFiles.length > 0) {
      return (
        <div className="file-download-wrapper" >
          {props.postInfo.attachedFiles.map((file: FileType) => {
            const isDeleted = props.removedFiles.includes(file.file_id);

            return (
              <div key={file.file_id}>
                <div className={`file-attached-list ${isDeleted ? 'deleted' : ''}`}>
                  <FileIcon fileInfo={file} isFull={true} isDownload={false} />
                </div>
                {
                  props.removedFiles.includes(file.file_id) ?
                    <i className="ri-delete-bin-2-line" onClick={() => props.cancelRemoveFile(file.file_id)}>취소</i>
                    :
                    <i className="ri-delete-bin-line" onClick={() => props.removeFile(file.file_id)}></i>
                }
              </div>
            );
          }
          )}
        </div>
      );
    }
  };

  return (
    <div className="writepost-wrapper">
      <div className="writepost-header">
        <i className="ri-arrow-left-line enif-pointer" onClick={props.cancel}></i>
        <h5>글수정</h5>
      </div>
      <div className="writepost-title">
        <input name="title" value={props.postInfo.title} onChange={props.handleEditting} placeholder="제목" />
      </div>
      <div className="writepost-content">
        {/* <Editor text={props.postInfo.text} editText={props.handleEdittingText} /> */}
        <Editor2 text={props.postInfo.text} setText={props.handleEdittingText} readOnly={false} />

      </div>
      {props.postInfo.attachedFiles && makeFileList()}
      <div className="writepost-file">
        <AttachFile
          files={props.attachedFiles}
          attachFile={props.attachFile}
          removeFile={props.removeAttachedFile} />
      </div>
      <div className="btn-wrapper">
        <button className="enif-btn-common enif-btn-cancel" onClick={props.cancel}> 취소 </button>
        <button className="enif-btn-common enif-btn-ok" disabled={props.isBtnDisabled} onClick={props.confirm} > 확인 </button>
      </div>
    </div>
  );
}

export default EditPost;
