import { useState, ChangeEvent, useEffect } from 'react';
import { AxiosProgressEvent } from 'axios';
import { CreatePostRequest } from '~/services/PostService';
import ContentService from '~/services/ContentService';
import Editor from '~/components/Common/Editor';
import AttachFile from '~/components/Post/AttachFile';
import ProgressBar from '~/components/Common/ProgressBar';
import { useCreatePost } from '~/hooks/queries/usePostQueries';

const MAX_SIZE = 20 * 1024 * 1024;
const BASE_STORAGE_KEY = 'CREATE_POST_DRAFT';

type Props = {
  board_id: string;
  onCreate: () => void;
  onClose: () => void;
};

const CreatePost = ({ board_id, onCreate, onClose }: Props) => {
  let currentSize = 0;
  const STORAGE_KEY = `${BASE_STORAGE_KEY}_${board_id}`;

  const [postInfo, setPostInfo] = useState<CreatePostRequest>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed;
      } catch (e) {
        console.error('Failed to load draft', e);
      }
    }
    return {
      title: '',
      text: '',
    };
  });
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadIdx, setUploadIdx] = useState<number>(0);

  const { mutate: mutateCreatePost } = useCreatePost();

  useEffect(() => {
    if (postInfo.title || postInfo.text) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(postInfo));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [STORAGE_KEY, postInfo]);

  const handleChangeTitle = (e: ChangeEvent<HTMLInputElement>) => {
    setPostInfo((prevPostInfo) => {
      return {
        ...prevPostInfo,
        [e.target.name]: e.target.value,
      };
    });
  };

  const handleEditor = (value: string) => {
    setPostInfo((prevPostInfo) => {
      return {
        ...prevPostInfo,
        text: value,
      };
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

  const createPost = async () => {
    if (!postInfo.title) {
      alert('제목을 입력해 주세요.');
    } else {
      const formData = new FormData();
      formData.append('title', postInfo.title);
      formData.append('text', postInfo.text);
      setIsUploading(true);
      try {
        mutateCreatePost(
          { board_id, data: postInfo },
          {
            onSuccess: async (res) => {
              // TODO: 파일먼저 업로드하게 변경
              if (attachedFiles.length > 0) {
                for (let i = 0, max = attachedFiles.length; i < max; i++) {
                  const fileFormData = new FormData();
                  fileFormData.append('attachedFile', attachedFiles[i]);
                  await ContentService.createFile(
                    res.data.content_id,
                    fileFormData,
                    uploadProgress,
                  );
                  setUploadIdx((uploadIdx) => uploadIdx + 1);
                }
              }
              localStorage.removeItem(STORAGE_KEY);
              setIsUploading(false);
              onCreate();
            },
          },
        );
      } catch (err) {
        console.error(err);
        setIsUploading(false);
        alert('게시글 저장에 실패했습니다.');
      }
    }
  };

  const handleClose = () => {
    if (
      window.confirm(
        '작성 중인 내용과 저장된 임시 내용이 모두 삭제됩니다. 계속하시겠습니까?',
      )
    ) {
      localStorage.removeItem(STORAGE_KEY);
      onClose();
    }
  };

  return (
    <>
      <div className="writepost-wrapper">
        <div className="writepost-header">
          <i
            className="ri-arrow-left-line cursor-pointer"
            onClick={handleClose}
          ></i>
          <h5>글쓰기</h5>
        </div>
        <div className="writepost-title">
          <input
            name="title"
            value={postInfo.title}
            maxLength={50}
            onChange={handleChangeTitle}
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
            onClick={handleClose}
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
