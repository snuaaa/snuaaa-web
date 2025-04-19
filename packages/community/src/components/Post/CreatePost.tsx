import { useState, ChangeEvent, FC } from 'react';
import PostService, { CreatePostRequest } from '../../services/PostService';
import ContentService from '../../services/ContentService';
import { Prompt } from 'react-router-dom';
import Editor from '~/components/Common/Editor';
import AttachFile from './AttachFile';
import ProgressBar from '~/components/Common/ProgressBar';

const MAX_SIZE = 20 * 1024 * 1024;

type Props = {
  board_id: string;
  onCreate: () => void;
  onClose: () => void;
};

const CreatePost: FC<Props> = (props) => {
  let currentSize = 0;
  const [postInfo, setPostInfo] = useState<CreatePostRequest>({
    title: '',
    text: '',
  });
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadIdx, setUploadIdx] = useState<number>(0);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPostInfo({
      ...postInfo,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditor = (value: string) => {
    setPostInfo({
      ...postInfo,
      text: value,
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

  const uploadProgress = (e: ProgressEvent) => {
    const totalLength = e.lengthComputable && e.total;
    if (totalLength) {
      setProgress(Math.round((e.loaded / totalLength) * 100));
    }
  };

  const createPost = async () => {
    const { board_id, onCreate } = props;

    if (!postInfo.title) {
      alert('제목을 입력해 주세요.');
    } else {
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
            await ContentService.createFile(
              res.data.content_id,
              fileFormData,
              uploadProgress,
            );
            setUploadIdx(uploadIdx + 1);
          }
        }
        setIsUploading(false);
        onCreate();
      } catch (err) {
        console.error(err);
        setIsUploading(false);
        alert('게시글 저장에 실패했습니다.');
      }
    }
  };

  return (
    <>
      <Prompt
        when={true}
        message="작성 중인 내용은 저장되지 않습니다. 작성을 취소하시겠습니까? 작성을 취소하시겠습니까?"
      ></Prompt>
      <div className="writepost-wrapper">
        <div className="writepost-header">
          <i
            className="ri-arrow-left-line cursor-pointer"
            onClick={props.onClose}
          ></i>
          <h5>글쓰기</h5>
        </div>
        <div className="writepost-title">
          <input
            name="title"
            value={postInfo.title}
            maxLength={50}
            onChange={handleChange}
            placeholder="제목을 입력하세요."
          />
        </div>
        <div className="writepost-content">
          <Editor
            text={postInfo.text}
            setText={handleEditor}
            readOnly={false}
          />
        </div>
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
            onClick={props.onClose}
          >
            취소
          </button>
          <button
            className="enif-btn-common enif-btn-ok"
            disabled={isUploading}
            onClick={createPost}
          >
            확인
          </button>
        </div>
      </div>
      {isUploading && attachedFiles.length > 0 && (
        <ProgressBar
          currentIdx={uploadIdx}
          loadedPercentage={progress}
          totalIdx={attachedFiles.length}
        />
      )}
    </>
  );
};

export default CreatePost;
