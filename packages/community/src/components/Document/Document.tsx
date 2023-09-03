import React, { useState, useEffect, ChangeEvent, useContext } from 'react';
import { Redirect, useRouteMatch } from 'react-router';

import ContentStateEnum from '../../common/ContentStateEnum';
import Loading from '../Common/Loading';
import DocuComponent from './DocuComponent';
import EditDocu from './EditDocu';
import ContentService from '../../services/ContentService';
import DocuService from '../../services/DocuService';
import ContentType from '../../types/ContentType';
import AuthContext from '../../contexts/AuthContext';
import FileService from '../../services/FileService';

const TAG = 'DOCU';
const MAX_SIZE = 20 * 1024 * 1024;

function Docu() {

  const match = useRouteMatch<{ doc_id: string }>();
  const [docuInfo, setDocuInfo] = useState<ContentType>();
  const [likeInfo, setLikeInfo] = useState<boolean>(false);
  const [docState, setDocState] = useState<number>(ContentStateEnum.LOADING);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [removedFiles, setRemovedFiles] = useState<number[]>([]);
  const [editingDocData, setEditingDocData] = useState<ContentType>();
  const authContext = useContext(AuthContext);
  let currentSize = 0;

  useEffect(() => {
    fetch();
  }, []);

  const fetch = async () => {
    const doc_id = Number(match.params.doc_id);
    await DocuService.retrieveDocument(doc_id)
      .then((res) => {
        setDocuInfo(res.data.docuInfo);
        setLikeInfo(res.data.likeInfo);
        setDocState(ContentStateEnum.READY);
        setEditingDocData(res.data.docuInfo);
      })
      .catch((err) => {
        console.error(err);
        setDocState(ContentStateEnum.ERROR);
      });
  };
  const handleEditting = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (editingDocData && (e.target.name === 'title' || e.target.name === 'text')) {
      setEditingDocData({
        ...editingDocData,
        [e.target.name]: e.target.value
      });
    }
  };

  const updateDoc = async () => {
    const doc_id = Number(match.params.doc_id);

    try {
      await DocuService.updateDocument(doc_id, editingDocData);
      if (attachedFiles.length > 0) {
        for (let i = 0; i < attachedFiles.length; i++) {
          const formData = new FormData();
          formData.append('attachedFile', attachedFiles[i]);
          await ContentService.createFile(doc_id, formData, uploadProgress);
        }
      }
      if (removedFiles.length > 0) {
        for (let i = 0; i < removedFiles.length; i++) {
          await FileService.deleteFile(removedFiles[i]);
        }
      }
      fetch();
    }
    catch (err) {
      console.error(err);
      alert('업데이트 오류');
    }
  };

  const deleteDoc = async () => {
    const doc_id = Number(match.params.doc_id);
    const goDrop = window.confirm('정말로 삭제하시겠습니까? 삭제한 게시글은 다시 복원할 수 없습니다.');
    if (goDrop) {
      await DocuService.deleteDocument(doc_id)
        .then(() => {
          setDocState(ContentStateEnum.DELETED);
        })
        .catch((err: Error) => {
          console.error(err);
          alert('삭제 실패');
        });
    }
  };

  const likeDoc = async () => {
    const doc_id = Number(match.params.doc_id);
    await ContentService.likeContent(doc_id)
      .then(() => {
        if (docuInfo) {
          if (likeInfo) {
            setDocuInfo({
              ...docuInfo,
              like_num: docuInfo.like_num - 1
            });
          }
          else {
            setDocuInfo({
              ...docuInfo,
              like_num: docuInfo.like_num + 1
            });
          }
        }
        setLikeInfo(!likeInfo);
      })
      .catch((err: Error) => {
        console.error(err);
      });
  };

  const attachFile = (e: ChangeEvent<HTMLInputElement>) => {
    // const { attachedFiles } = this.state;
    if (e.target.files && docuInfo) {
      if (e.target.files.length + attachFile.length + (docuInfo.attachedFiles ? docuInfo.attachedFiles.length : 0) > 5) {
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

  const removeFile = (file_id: number) => {
    setRemovedFiles(removedFiles.concat(file_id));
  };

  const cancelRemoveFile = (file_id: number) => {
    setRemovedFiles(removedFiles.filter((file) => file !== file_id));
  };

  const uploadProgress = (e: ProgressEvent) => {
    const totalLength = e.lengthComputable && e.total;
    if (totalLength) {
      setProgress(Math.round(e.loaded / totalLength * 100));
    }
  };

  return (
    <>
      {
        (() => {
          if (docState === ContentStateEnum.LOADING) {
            return <Loading />;
          }
          else if (docState === ContentStateEnum.READY && docuInfo) {
            return (
              <DocuComponent
                docData={docuInfo}
                my_id={authContext.authInfo.user.user_id}
                isLiked={likeInfo}
                likeDoc={likeDoc}
                deleteDoc={deleteDoc}
                setEditState={() => setDocState(ContentStateEnum.EDITTING)}
              />
            );
          }
          else if (docState === ContentStateEnum.EDITTING && editingDocData) {
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
          else if (docState === ContentStateEnum.DELETED && docuInfo)
            return (
              <Redirect to={`/board/${docuInfo.board_id}`} />
            );
          else {
            return <div>ERROR</div>;
          }
        })()
      }
    </>
  );

}

export default Docu;
