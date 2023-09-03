
import React, { useState, ChangeEvent } from 'react';
import CrtDocuType from '../../types/CrtDocuType';
import AttachFile from '../Post/AttachFile';
import BoardType from '../../types/BoardType';
import ProgressBar from '../Common/ProgressBar';

type CreateDocuComponentProps = {
    docuInfo: CrtDocuType;
    boardInfo: BoardType;
    attachedFiles: File[];
    isUploading: boolean;
    progress: number;
    uploadIdx: number;
    handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    attachFile: (e: ChangeEvent<HTMLInputElement>) => void;
    removeAttachedFile: (index: number) => void;
    confirm: () => void;
    close: () => void;
}

function CreateDocuComponent(props: CreateDocuComponentProps) {


  // const makeAttachedFileList = (files: File[]) => {
  //     const fileList = files.map((file, index) => {
  //         return (
  //             <div className="file-list" key={index}>
  //                 <p>{file.name}</p>
  //                 <i className="ri-close-circle-line ri-icons enif-pointer" onClick={() => props.removeAttachedFile(index)}></i>
  //             </div>
  //         )
  //     });
  //     return fileList;
  // }

  const makeCategoryList = () => {
    const categoryList = props.boardInfo.categories.map((category) => {
      return (
        <div className="category-unit" key={category.category_id}>
          <input type="radio" id={category.category_id} name="category_id" value={category.category_id}
            onChange={props.handleChange} />
          <label htmlFor={category.category_id}>{category.category_name}</label>
        </div>
      );
    });
    return categoryList;
  };

  return (
    <>
      <div className="enif-popup">
        <div className="enif-popup-content crt-docu-wrapper">
          <h3>파일 업로드</h3>
          <div className="docu-option-generation">
            <label className="input-label">회기</label>
            <input type="number" name="generation" onChange={props.handleChange} value={props.docuInfo.generation} />
          </div>
          <div className="docu-category-list-wrapper">
            <label className="input-label">카테고리</label>
            <div className="docu-category-unit-wrapper">
              {makeCategoryList()}
            </div>
          </div>
          <div className="docu-title-wrapper">
            <label className="input-label" htmlFor="crtDocTitle">제목</label>
            <input type="text" className="docu-title" id="crtDocTitle" name="title" placeholder="제목" onChange={props.handleChange} />
          </div>
          <div className="docu-desc-wrapper">
            <label className="input-label" htmlFor="crtDocDesc">본문</label>
            <textarea className="docu-desc" id="crtDocDesc" name="text" placeholder="본문" onChange={props.handleChange} />
          </div>
          <div className="docu-files-wrapper">
            <label className="input-label">
              <i className="ri-attachment-line enif-f-1p2x"></i>
            </label>
            <AttachFile files={props.attachedFiles} attachFile={props.attachFile} removeFile={props.removeAttachedFile} />
          </div>
          <div>
            <button className="enif-btn-common enif-btn-ok" disabled={props.isUploading} onClick={props.confirm}>OK</button>
            <button className="enif-btn-common enif-btn-cancel" onClick={props.close}>CANCEL</button>
          </div>
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

export default CreateDocuComponent;
