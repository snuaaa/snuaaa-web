import React, { ChangeEvent } from 'react';
import ContentType from '../../types/ContentType';
import FileIcon from '../Common/FileIcon';
import FileType from '../../types/FileType';
import AttachFile from '../Post/AttachFile';


type EditDocuProps = {
    editingDocData: ContentType;
    // isBtnDisabled: boolean;
    handleEditting: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    attachedFiles: File[];
    attachFile: (e: ChangeEvent<HTMLInputElement>) => void;
    removeAttachedFile: (index: number) => void;
    removedFiles: number[];
    removeFile: (file_id: number) => void;
    cancelRemoveFile: (file_id: number) => void;
    cancel: () => void;
    confirm: () => void;
}


function EditDocu({ editingDocData, handleEditting, attachedFiles, attachFile, removeAttachedFile,
  removedFiles, removeFile, cancelRemoveFile, cancel, confirm }: EditDocuProps) {

  const makeFileList = () => {
    if (editingDocData.attachedFiles && editingDocData.attachedFiles.length > 0) {
      return (
        <div className="file-download-wrapper" >
          {editingDocData.attachedFiles.map((file: FileType) => {
            const isDeleted = removedFiles.includes(file.file_id);
            return (
              <div key={file.file_id}>
                <div className={`file-attached-list ${isDeleted ? 'deleted' : ''}`}>
                  <FileIcon fileInfo={file} isFull={true} isDownload={false} />
                </div>
                {
                  removedFiles.includes(file.file_id) ?
                    <i className="ri-delete-bin-2-line" onClick={() => cancelRemoveFile(file.file_id)}>취소</i>
                    :
                    <i className="ri-delete-bin-line" onClick={() => removeFile(file.file_id)}></i>
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
        <i className="ri-arrow-left-line enif-pointer" onClick={cancel}></i>
        <h5>글수정</h5>
      </div>
      <div className="writepost-title">
        <input name="title" value={editingDocData.title} onChange={(e) => handleEditting(e)} placeholder="제목" />
      </div>
      <div className="writepost-content">
        {/* <ReactQuill className="writepost-quill" value={editingPostData.text} onChange={handleEdittingText} modules={modules} formats={formats} /> */}
        <textarea name="text" value={editingDocData.text} onChange={(e) => handleEditting(e)} placeholder="내용을 입력하세요" />
      </div>
      {editingDocData.attachedFiles && makeFileList()}
      <div className="writepost-file">
        <AttachFile
          files={attachedFiles}
          attachFile={attachFile}
          removeFile={removeAttachedFile} />
      </div>
      <div className="btn-wrapper">
        <button className="enif-btn-common enif-btn-cancel" onClick={cancel}> 취소 </button>
        <button className="enif-btn-common enif-btn-ok" onClick={confirm} > 확인 </button>
      </div>
    </div>
  );
}

export default EditDocu;