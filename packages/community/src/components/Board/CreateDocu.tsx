import React, { useState, ChangeEvent, useEffect } from 'react';
import DocuService from '../../services/DocuService';
import CrtDocuType from '../../types/CrtDocuType';
import CreateDocuComponent from '../../components/Document/CreateDocuComponent';
import BoardType from '../../types/BoardType';
import ContentService from '../../services/ContentService';
import useBlockBackgroundScroll from '../../hooks/useBlockBackgroundScroll';

const TAG = 'CREATEDOCU';
const MAX_SIZE = 20 * 1024 * 1024;

type CreateDocuProps = {
    fetch: () => void;
    boardInfo: BoardType;
    close: () => void;
}

function CreateDocu(props: CreateDocuProps) {

  const today = new Date();
  let currentGen = 2 * (today.getFullYear() - 1980);
  if (today.getMonth() > 5) currentGen++;
  let currentSize = 0;

  const [docuInfo, setDocuInfo] = useState<CrtDocuType>({
    category_id: '',
    generation: currentGen,
    text: '',
    title: ''
  });
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadIdx, setUploadIdx] = useState<number>(0);

  useBlockBackgroundScroll();
    
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setDocuInfo({
      ...docuInfo,
      [e.target.name]: e.target.value
    });
  };

  const attachFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      if (e.target.files.length + attachedFiles.length > 5) {
        alert('파일은 최대 5개까지만 첨부해주세요.');
        e.target.value = '';
      }
      else if (e.target.files) {
        let tmpSize = currentSize;
        for (let i = 0; i < e.target.files.length; i++) {
          tmpSize += e.target.files[i].size;
        }
        if (tmpSize > MAX_SIZE) {
          alert('한 번에 20MB 이상의 파일은 업로드 할 수 없습니다.');
        }
        else {
          currentSize = tmpSize;
          const newFiles: File[] = [];
          for (let i = 0; i < e.target.files.length; i++) {
            const tmpFile = e.target.files.item(i);
            tmpFile && newFiles.push(tmpFile);
          }
          if (newFiles && newFiles.length > 0) {
            setAttachedFiles(attachedFiles.concat(...newFiles));
          }
        }
      }
    }
  };

  const removeAttachedFile = (index: number) => {
    setAttachedFiles(
      attachedFiles.filter((file, i) => {
        return index !== i;
      })
    );
  };

  const uploadProgress = (e: ProgressEvent) => {
    const totalLength = e.lengthComputable && e.total;
    if (totalLength) {
      setProgress(Math.round(e.loaded / totalLength * 100));
    }
  };

  const createDocu = async () => {
    const { boardInfo, fetch } = props;

    if (!docuInfo.title) {
      alert('제목을 입력해주세요');
    }
    else if (!docuInfo.category_id) {
      alert('카테고리를 선택해주세요');
    }
    else if (attachedFiles.length === 0) {
      alert('파일을 첨부해주세요');
    }
    else {
      // const formData = new FormData();
      // formData.append('generation', docuInfo.generation.toString());
      // formData.append('category_id', docuInfo.category_id);
      // formData.append('title', docuInfo.title);
      // formData.append('text', docuInfo.title);
      setIsUploading(true);
      try {
        const res = await DocuService.createDocument(boardInfo.board_id, docuInfo);
        if (attachedFiles.length > 0) {
          for (let i = 0, max = attachedFiles.length; i < max; i++) {
            const fileFormData = new FormData();
            fileFormData.append('attachedFile', attachedFiles[i]);
            await ContentService.createFile(res.data.content_id, fileFormData, uploadProgress);
            setUploadIdx(uploadIdx + 1);
          }
        }
        setIsUploading(false);
        fetch();
      }
      catch (err) {
        console.error(err);
      }
    }
  };


  return (
    <CreateDocuComponent
      docuInfo={docuInfo}
      boardInfo={props.boardInfo}
      attachedFiles={attachedFiles}
      isUploading={isUploading}
      progress={progress}
      uploadIdx={uploadIdx}
      handleChange={handleChange}
      attachFile={attachFile}
      removeAttachedFile={removeAttachedFile}
      confirm={createDocu}
      close={props.close}
    />
  );
}

export default CreateDocu;
