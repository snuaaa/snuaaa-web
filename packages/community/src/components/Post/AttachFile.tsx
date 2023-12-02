import React, { ChangeEvent } from 'react';

type AttachFileProps = {
    files: File[];
    attachFile: (e: ChangeEvent<HTMLInputElement>) => void;
    removeFile: (index: number) => void;
}

function AttachFile(props: AttachFileProps) {

  const makeFileList = (files: File[]) => {
    if (files && files.length > 0) {
      return files.map((file, index) => {
        return (
          <li key={index}>
            <p>{file.name}</p>
            <i className="ri-close-circle-line ri-icons enif-pointer" onClick={() => props.removeFile(index)}></i>
          </li>);
      });
    }
  };

  const acceptFileList = `
        '.jpg', '.jpeg', '.png',
        '.docx', '.doc',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.xlsx', '.xls',
        '.pptx', '.ppt',
        '.pdf',
        '.hwp',
        '.zip', '.txt'
    `;


  return (
    <div className="attach-file-wrapper">
      <div className="file-list">
        {
          props.files && props.files.length > 0 &&
                    <ul>
                      {makeFileList(props.files)}
                    </ul>
        }
        <p className="guide-message">파일은 최대 5개, 개당 20MB까지 첨부 가능합니다.</p>
      </div>
      <label htmlFor="attach_file" >
        <div className="attach-btn-wrapper">
          <i className="ri-upload-2-fill enif-pointer"></i>&nbsp;
                    파일첨부
        </div>
      </label>
      <input
        type="file" multiple
        id="attach_file"
        accept={acceptFileList}
        onChange={props.attachFile} />
    </div>
  );
}

export default AttachFile;