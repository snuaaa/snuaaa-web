import React, { useState, ChangeEvent } from 'react';
import CreatePostComponent from '../../components/Post/CreatePostComponent';
import PostService from '../../services/PostService';
import CrtPostType from '../../types/CrtPostType';
import ContentService from '../../services/ContentService';

const TAG = 'CREATEPOST';
const MAX_SIZE = 20 * 1024 * 1024;

type CreatePostProps = {
    board_id: string;
    fetch: () => void;
    close: () => void;
}

function CreatePost(props: CreatePostProps) {
  let currentSize = 0;
  const [postInfo, setPostInfo] = useState<CrtPostType>({ title: '', text: '' });
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadIdx, setUploadIdx] = useState<number>(0);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPostInfo({
      ...postInfo,
      [e.target.name]: e.target.value
    });
  };

  const handleEditor = (value: string) => {
    setPostInfo({
      ...postInfo,
      text: value
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

  const createPost = async () => {
    const { board_id, fetch, close } = props;

    if (!postInfo.title) {
      alert('제목을 입력해 주세요.');
    }
    else {
      const formData = new FormData();
      formData.append('title', postInfo.title);
      formData.append('text', postInfo.text);
      setIsUploading(true);
      try {
        const res = await PostService.createPost(board_id, postInfo);
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
        close();
      }
      catch (err) {
        console.error(err);
        setIsUploading(false);
        alert('게시글 저장에 실패했습니다.');
      }
    }
  };


  return (
    <CreatePostComponent
      postInfo={postInfo}
      attachedFiles={attachedFiles}
      isUploading={isUploading}
      progress={progress}
      uploadIdx={uploadIdx}
      handleChange={handleChange}
      handleEditor={handleEditor}
      close={props.close}
      confirm={createPost}
      attachFile={attachFile}
      removeAttachedFile={removeAttachedFile}
    />
  );
}

export default CreatePost;
