import React, { ChangeEvent } from 'react';
import { Prompt } from 'react-router';
import AttachFile from './AttachFile';
import Editor2 from '../Common/Editor2';
import CrtPostType from '../../types/CrtPostType';
import ProgressBar from '../Common/ProgressBar';

type CreatePostComponentProps = {
    postInfo: CrtPostType;
    attachedFiles: File[];
    isUploading: boolean;
    progress: number;
    uploadIdx: number;
    handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
    handleEditor: (text: string) => void;
    attachFile: (e: ChangeEvent<HTMLInputElement>) => void;
    removeAttachedFile: (index: number) => void;
    close: () => void;
    confirm: () => void;
}

function CreatePostComponent(props: CreatePostComponentProps) {

  return (
    <>
      <Prompt when={true} message="작성 중인 내용은 저장되지 않습니다. 작성을 취소하시겠습니까? 작성을 취소하시겠습니까?"></Prompt>
      <div className="writepost-wrapper">
        <div className="writepost-header">
          <i className="ri-arrow-left-line enif-pointer" onClick={props.close}></i>
          <h5>글쓰기</h5>
        </div>
        <div className="writepost-title">
          <input name="title" value={props.postInfo.title} maxLength={50} onChange={props.handleChange} placeholder="제목을 입력하세요." />
        </div>
        <div className="writepost-content">
          <Editor2 text={props.postInfo.text} setText={props.handleEditor} readOnly={false} />
        </div>
        <div className="writepost-file">
          <AttachFile files={props.attachedFiles} attachFile={props.attachFile} removeFile={props.removeAttachedFile} />
        </div>
        <div className="btn-wrapper">
          <button className="enif-btn-common enif-btn-cancel" onClick={props.close}> 취소 </button>
          <button className="enif-btn-common enif-btn-ok" disabled={props.isUploading} onClick={props.confirm}> 확인 </button>
        </div>
      </div>
      {
        props.isUploading && props.attachedFiles.length > 0 &&
                <ProgressBar
                  currentIdx={props.uploadIdx}
                  loadedPercentage={props.progress}
                  totalIdx={props.attachedFiles.length}
                />
      }
    </>
  );
}

export default CreatePostComponent;