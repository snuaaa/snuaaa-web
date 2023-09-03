import React from 'react';
import { Link } from 'react-router-dom';
import DownloadFile from '../Post/DownloadFile';

const DocuList = ({ documents }) => {

  const makeDocuList = () => {
    let docuList = documents.map(doc => {
      let contentInfo = doc.content;
      let categoryInfo = doc.content.category;
      let attachedFileInfo = doc.content.attachedFiles;
      return (
        <div className="doculist-body" key={contentInfo.content_id}>
          <div className="docu-generation">{doc.generation}</div>
          <div className="docu-category">{categoryInfo && categoryInfo.category_name}</div>
          <div className="docu-memo">
            <Link to={`/document/${contentInfo.content_id}`}>{contentInfo.title}</Link>
          </div>
          <div className="docu-download">{makeFileList(attachedFileInfo)}</div>
        </div>
      );
    });
    return docuList;
  };

  const makeFileList = (files) => {

    if (files && files.length > 0) {
      return (
        <>
          {
            files.map((file) => {
              let fileTypeClass = '';

              switch (file.file_type) {
              case 'IMG':
                fileTypeClass = 'ri-image-line color-img';
                break;
              case 'DOC':
                fileTypeClass = 'ri-file-word-line color-doc';
                break;
              case 'XLS':
                fileTypeClass = 'ri-file-excel-line color-xls';
                break;
              case 'PDF':
                fileTypeClass = 'ri-file-pdf-line color-pdf';
                break;
              case 'ZIP':
                fileTypeClass = 'ri-file-zip-fill color-zip';
                break;
              case 'HWP':
                fileTypeClass = 'ri-file-hwp-line color-hwp';
                break;
              default:
                fileTypeClass = 'ri-file-3-line';
                break;
              }

              return (
                <DownloadFile key={file.file_id} content_id={file.parent_id} file_id={file.file_id}>
                  {/* <FileIcon fileInfo={file} /> */}
                  <i className={`${fileTypeClass} font-20 file-icon`}>
                    <div className="file-name">{file.original_name}</div>
                  </i>
                </DownloadFile>
              );
            })
          }
        </>
      );
    }
  };

  return (
    <div className="doculist-wrapper">
      <div className="doculist-head">
        <div className="docu-generation">회기</div>
        <div className="docu-category">항목</div>
        <div className="docu-memo">제목</div>
        <div className="docu-download">다운로드</div>
        {/* <div className="docu-comments">댓글</div> */}
      </div>
      {makeDocuList()}
    </div>
  );
};

export default DocuList;