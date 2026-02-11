import { ChangeEvent, FC, useRef, useState } from 'react';
import { AxiosProgressEvent } from 'axios';
import Editor from '../Common/Editor';

import AttachFile from './AttachFile';

import FileIcon from '../Common/FileIcon';
import { Content, File as FileType } from '~/services/types';
import ContentService from '~/services/ContentService';
import FileService from '~/services/FileService';
import ProgressBar from '~/components/Common/ProgressBar';
import { useUpdatePost } from '~/hooks/queries/usePostQueries';

type Props = {
  postInfo: Content;
  onCancel: () => void;
  onUpdate: () => void;
};

const MAX_SIZE = 20 * 1024 * 1024;

const EditPost: FC<Props> = ({ postInfo, onCancel, onUpdate }) => {
  const [removedFiles, setRemovedFiles] = useState<number[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<number>(0);

  const [editingPostData, setEditingPostData] = useState<Content>(postInfo);

  const currentSize = useRef(0);

  const { mutateAsync: mutateUpdatePost, isPending: isPendingUpdate } =
    useUpdatePost();

  const handleEditing = (e: ChangeEvent<HTMLInputElement>) => {
    if (editingPostData) {
      setEditingPostData({
        ...editingPostData,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleEditingText = (value: string) => {
    if (editingPostData) {
      setEditingPostData({
        ...editingPostData,
        text: value,
      });
    }
  };

  const removeFile = (file_id: number) => {
    setRemovedFiles(removedFiles.concat(file_id));
  };

  const uploadProgress = (e: AxiosProgressEvent) => {
    if (e.total) {
      setProgress(Math.round((e.loaded / e.total) * 100));
    }
  };

  const updatePost = async () => {
    if (!editingPostData) return;
    const post_id = Number(postInfo.content_id);
    try {
      await mutateUpdatePost({ post_id, data: editingPostData });
      if (attachedFiles.length > 0) {
        for (let i = 0; i < attachedFiles.length; i++) {
          const formData = new FormData();
          formData.append('attachedFile', attachedFiles[i]);
          await ContentService.createFile(post_id, formData, uploadProgress);
        }
      }
      if (removedFiles.length > 0) {
        for (let i = 0; i < removedFiles.length; i++) {
          await FileService.deleteFile(removedFiles[i]);
        }
      }
      onUpdate();
    } catch (err) {
      console.error(err);
      alert('업데이트 오류');
    }
  };

  const attachFile = (e: ChangeEvent<HTMLInputElement>) => {
    // const { attachedFiles } = this.state;
    if (e.target.files && postInfo) {
      if (
        e.target.files.length +
          attachFile.length +
          (postInfo.attachedFiles ? postInfo.attachedFiles.length : 0) >
        5
      ) {
        alert('파일은 최대 5개까지만 첨부해주세요.');
        e.target.value = '';
      } else if (e.target.files) {
        let tmpSize = currentSize.current;
        for (let i = 0; i < e.target.files.length; i++) {
          tmpSize += e.target.files[i].size;
        }
        if (tmpSize > MAX_SIZE) {
          alert('한 번에 20MB 이상의 파일은 업로드 할 수 없습니다.');
        } else {
          currentSize.current += tmpSize;
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

  const cancelRemoveFile = (file_id: number) => {
    setRemovedFiles(removedFiles.filter((file) => file !== file_id));
  };

  const makeFileList = () => {
    if (
      editingPostData.attachedFiles &&
      editingPostData.attachedFiles.length > 0
    ) {
      return (
        <div className="file-download-wrapper">
          {editingPostData.attachedFiles.map((file: FileType) => {
            const isDeleted = removedFiles.includes(file.file_id);

            return (
              <div key={file.file_id}>
                <div
                  className={`file-attached-list ${isDeleted ? 'deleted' : ''}`}
                >
                  <FileIcon fileInfo={file} isFull={true} isDownload={false} />
                </div>
                {removedFiles.includes(file.file_id) ? (
                  <i
                    className="ri-delete-bin-2-line"
                    onClick={() => cancelRemoveFile(file.file_id)}
                  >
                    취소
                  </i>
                ) : (
                  <i
                    className="ri-delete-bin-line"
                    onClick={() => removeFile(file.file_id)}
                  ></i>
                )}
              </div>
            );
          })}
        </div>
      );
    }
  };

  return (
    <>
      <div className="writepost-wrapper">
        <div className="writepost-header">
          <i
            className="ri-arrow-left-line cursor-pointer"
            onClick={onCancel}
          ></i>
          <h5>글수정</h5>
        </div>
        <div className="writepost-title">
          <input
            name="title"
            value={editingPostData.title}
            onChange={handleEditing}
            placeholder="제목"
          />
        </div>
        <div className="writepost-content">
          <Editor
            text={editingPostData.text}
            setText={handleEditingText}
            readOnly={false}
          />
        </div>
        {editingPostData.attachedFiles && makeFileList()}
        <div className="writepost-file">
          <AttachFile
            files={attachedFiles}
            attachFile={attachFile}
            removeFile={removeAttachedFile}
          />
        </div>
        <div className="btn-wrapper">
          <button
            className="enif-btn-common enif-btn-cancel"
            onClick={onCancel}
          >
            취소
          </button>
          <button
            className="enif-btn-common enif-btn-ok"
            disabled={isPendingUpdate}
            onClick={updatePost}
          >
            확인
          </button>
        </div>
      </div>
      {isPendingUpdate && (
        <ProgressBar
          loadedPercentage={progress}
          currentIdx={0}
          totalIdx={attachedFiles.length}
        />
      )}
    </>
  );
};

export default EditPost;
