import React, { useState, ChangeEvent } from 'react';
import { AxiosProgressEvent } from 'axios';
import { CreateDocuRequest } from '../../services/DocuService';
import CreateDocuComponent from '../../components/Document/CreateDocuComponent';

import useBlockBackgroundScroll from '../../hooks/useBlockBackgroundScroll';
import { Board } from '~/services/types';
import { useCreateDocument } from '~/hooks/queries/useDocuQueries';
import { useCreateFile } from '~/hooks/queries/useContentQueries';

const MAX_SIZE = 20 * 1024 * 1024;

type CreateDocuProps = {
  fetch: () => void;
  boardInfo: Board;
  onClose: () => void;
};

function CreateDocu(props: CreateDocuProps) {
  const today = new Date();
  let currentGen = 2 * (today.getFullYear() - 1980);
  if (today.getMonth() > 5) currentGen++;
  let currentSize = 0;

  const [docuInfo, setDocuInfo] = useState<CreateDocuRequest>({
    category_id: '',
    generation: currentGen,
    text: '',
    title: '',
  });
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadIdx, setUploadIdx] = useState<number>(0);

  useBlockBackgroundScroll();

  const { mutateAsync: mutateCreateDocument } = useCreateDocument();
  const { mutateAsync: mutateCreateFile } = useCreateFile();

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setDocuInfo({
      ...docuInfo,
      [e.target.name]: e.target.value,
    });
  };

  const attachFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      if (e.target.files.length + attachedFiles.length > 5) {
        alert('파일은 최대 5개까지만 첨부해주세요.');
        e.target.value = '';
      } else if (e.target.files) {
        let tmpSize = currentSize;
        for (let i = 0; i < e.target.files.length; i++) {
          tmpSize += e.target.files[i].size;
        }
        if (tmpSize > MAX_SIZE) {
          alert('한 번에 20MB 이상의 파일은 업로드 할 수 없습니다.');
        } else {
          currentSize = tmpSize;
          const newFiles: File[] = [];
          for (let i = 0; i < e.target.files.length; i++) {
            const tmpFile = e.target.files.item(i);
            if (tmpFile) {
              newFiles.push(tmpFile);
            }
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
      }),
    );
  };

  const uploadProgress = (e: AxiosProgressEvent) => {
    if (e.total) {
      setProgress(Math.round((e.loaded / e.total) * 100));
    }
  };

  const createDocu = async () => {
    const { boardInfo, fetch } = props;

    if (!docuInfo.title) {
      alert('제목을 입력해주세요');
    } else if (!docuInfo.category_id) {
      alert('카테고리를 선택해주세요');
    } else if (attachedFiles.length === 0) {
      alert('파일을 첨부해주세요');
    } else {
      setIsUploading(true);
      try {
        const res = await mutateCreateDocument({
          board_id: boardInfo.board_id,
          data: docuInfo,
        });
        if (attachedFiles.length > 0) {
          for (let i = 0, max = attachedFiles.length; i < max; i++) {
            const fileFormData = new FormData();
            fileFormData.append('attachedFile', attachedFiles[i]);
            await mutateCreateFile({
              content_id: res.data.content_id,
              formData: fileFormData,
              onUploadProgress: uploadProgress,
            });
            setUploadIdx(uploadIdx + 1);
          }
        }
        setIsUploading(false);
        fetch();
        props.onClose();
      } catch (err) {
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
      close={props.onClose}
    />
  );
}

export default CreateDocu;
