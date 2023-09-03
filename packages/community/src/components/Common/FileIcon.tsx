import React from 'react';
import FileType from '../../types/FileType';

type FileIconProps = {
    fileInfo: FileType;
    isFull: boolean;
    isDownload: boolean;
    isDeleted?: boolean;
}

const FileIcon = ({ fileInfo, isFull, isDownload, isDeleted }: FileIconProps) => {

  let fileTypeClass = '';

  switch (fileInfo.file_type) {
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
    <>
      <i className={`fas ${fileTypeClass} ${isDeleted ? 'deleted ' : ''}font-20 file-icon`}></i>
      {
        isFull &&
                <>
                  <div className="file-download-name">{fileInfo.original_name}</div>
                    &nbsp;
                  {
                    isDownload &&
                        <>
                          <i className="ri-download-2-line enif-f-1p2x"></i>{fileInfo.download_count}
                        </>
                  }
                </>
      }
    </>
  );
};

export default FileIcon;