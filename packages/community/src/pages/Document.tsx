import { useState, ChangeEvent } from 'react';
import { AxiosProgressEvent } from 'axios';
import { Navigate, useParams } from '@tanstack/react-router';

import ContentStateEnum from '~/common/ContentStateEnum';
import Loading from '~/components/Common/Loading';
import DocuComponent from '~/components/Document/DocuComponent';
import EditDocu from '~/components/Document/EditDocu';

import { Content } from '~/services/types';
import { useAuth } from '~/contexts/auth';
import {
  useDocument,
  useUpdateDocument,
  useDeleteDocument,
  docuKeys,
} from '~/hooks/queries/useDocuQueries';
import {
  useLikeContent,
  useCreateFile,
  useDeleteFile,
} from '~/hooks/queries/useContentQueries';
import { useQueryClient } from '@tanstack/react-query';

const MAX_SIZE = 20 * 1024 * 1024;

function DocumentPage() {
  const { doc_id } = useParams({ from: '/document/$doc_id' });
  const docIdNum = Number(doc_id);
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useDocument(docIdNum);

  const [docState, setDocState] = useState<number>(ContentStateEnum.READY);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [, setProgress] = useState<number>(0);
  const [removedFiles, setRemovedFiles] = useState<number[]>([]);
  const [editingDocData, setEditingDocData] = useState<Content>();
  const authContext = useAuth();
  let currentSize = 0;

  const updateDocMutation = useUpdateDocument();
  const deleteDocMutation = useDeleteDocument();
  const likeContentMutation = useLikeContent();
  const createFileMutation = useCreateFile();
  const deleteFileMutation = useDeleteFile();

  const docuInfo = data?.docuInfo;
  const likeInfo = data?.likeInfo ?? false;

  const handleEditting = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (
      editingDocData &&
      (e.target.name === 'title' || e.target.name === 'text')
    ) {
      setEditingDocData({
        ...editingDocData,
        [e.target.name]: e.target.value,
      });
    }
  };

  const updateDoc = async () => {
    try {
      if (editingDocData) {
        await updateDocMutation.mutateAsync({
          doc_id: docIdNum,
          data: editingDocData,
        });
      }
      if (attachedFiles.length > 0) {
        for (let i = 0; i < attachedFiles.length; i++) {
          const formData = new FormData();
          formData.append('attachedFile', attachedFiles[i]);
          await createFileMutation.mutateAsync({
            content_id: docIdNum,
            formData,
            onUploadProgress: uploadProgress,
          });
        }
      }
      if (removedFiles.length > 0) {
        for (let i = 0; i < removedFiles.length; i++) {
          await deleteFileMutation.mutateAsync(removedFiles[i]);
        }
      }
      queryClient.invalidateQueries({ queryKey: docuKeys.detail(docIdNum) });
      setDocState(ContentStateEnum.READY);
      setAttachedFiles([]);
      setRemovedFiles([]);
    } catch (err) {
      console.error(err);
      alert('업데이트 오류');
    }
  };

  const deleteDoc = async () => {
    const goDrop = window.confirm(
      '정말로 삭제하시겠습니까? 삭제한 게시글은 다시 복원할 수 없습니다.',
    );
    if (goDrop) {
      try {
        await deleteDocMutation.mutateAsync(docIdNum);
        setDocState(ContentStateEnum.DELETED);
      } catch (err) {
        console.error(err);
        alert('삭제 실패');
      }
    }
  };

  const likeDoc = async () => {
    try {
      await likeContentMutation.mutateAsync(docIdNum);
    } catch (err) {
      console.error(err);
    }
  };

  const attachFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && docuInfo) {
      if (
        e.target.files.length +
          attachFile.length +
          (docuInfo.attachedFiles ? docuInfo.attachedFiles.length : 0) >
        5
      ) {
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
      attachedFiles.filter((_, i) => {
        return index !== i;
      }),
    );
  };

  const removeFile = (file_id: number) => {
    setRemovedFiles(removedFiles.concat(file_id));
  };

  const cancelRemoveFile = (file_id: number) => {
    setRemovedFiles(removedFiles.filter((file) => file !== file_id));
  };

  const uploadProgress = (e: AxiosProgressEvent) => {
    if (e.total) {
      setProgress(Math.round((e.loaded / e.total) * 100));
    }
  };

  const startEditing = () => {
    setEditingDocData(docuInfo);
    setDocState(ContentStateEnum.EDITTING);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (isError || !docuInfo) {
    return <div>ERROR</div>;
  }

  if (docState === ContentStateEnum.DELETED) {
    return (
      <Navigate
        to="/board/$board_id"
        params={{ board_id: docuInfo.board_id }}
      />
    );
  }

  if (docState === ContentStateEnum.EDITTING && editingDocData) {
    return (
      <EditDocu
        editingDocData={editingDocData}
        handleEditting={handleEditting}
        attachedFiles={attachedFiles}
        attachFile={attachFile}
        removeAttachedFile={removeAttachedFile}
        removedFiles={removedFiles}
        removeFile={removeFile}
        cancelRemoveFile={cancelRemoveFile}
        cancel={() => setDocState(ContentStateEnum.READY)}
        confirm={() => updateDoc()}
      />
    );
  }

  return (
    <DocuComponent
      docData={docuInfo}
      my_id={authContext.authInfo.user.user_id}
      isLiked={likeInfo}
      likeDoc={likeDoc}
      deleteDoc={deleteDoc}
      setEditState={startEditing}
    />
  );
}

export default DocumentPage;
