import React, { useState, useEffect, ChangeEvent, useContext } from 'react';
import { Redirect, match } from 'react-router';

import ContentStateEnum from '../../common/ContentStateEnum';
import Comment from '../Comment/Comment';
import Loading from '../Common/Loading';
import PostComponent from './PostComponent';
import EditPost from './EditPost';
import history from '../../common/history';
import BoardName from '../Board/BoardName';
import PostService from '../../services/PostService';
import ContentService from '../../services/ContentService';
import ContentType from '../../types/ContentType';
import AuthContext from '../../contexts/AuthContext';
import ProgressBar from '../Common/ProgressBar';
import FileService from '../../services/FileService';

const TAG = 'POST';
const MAX_SIZE = 20 * 1024 * 1024;

type PostProps = {
    match: match<{ post_id: string }>
}

function Post(props: PostProps) {

  const [likeInfo, setLikeInfo] = useState<boolean>(false);
  const [postInfo, setPostInfo] = useState<ContentType>();
  const [postState, setPostState] = useState<number>(ContentStateEnum.LOADING);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [editingPostData, setEditingPostData] = useState<ContentType>();
  const [removedFiles, setRemovedFiles] = useState<number[]>([]);
  const authContext = useContext(AuthContext);
  let currentSize = 0;

  useEffect(() => {
    fetch();
  }, []);

  const fetch = async () => {
    const post_id = Number(props.match.params.post_id);

    setPostState(ContentStateEnum.LOADING);
    await PostService.retrievePost(post_id)
      .then((res) => {
        setPostInfo(res.data.postInfo);
        setEditingPostData(res.data.postInfo);
        setLikeInfo(res.data.likeInfo);
        setPostState(ContentStateEnum.READY);
      })
      .catch((err: any) => {
        console.error(err);
        if (err.response && err.response.data && err.response.data.code === 4001) {
          alert('권한이 없습니다.');
          history.goBack();
        }
        else {
          setPostState(ContentStateEnum.ERROR);
          alert('해당 게시물이 존재하지 않습니다.');
          history.goBack();
        }
      });
  };

  const updatePost = async () => {
    const post_id = Number(props.match.params.post_id);
    setPostState(ContentStateEnum.CREATING);
    try {
      await PostService.updatePost(post_id, editingPostData);
      if (attachedFiles.length > 0) {
        for (let i = 0; i < attachedFiles.length; i++) {
          const formData = new FormData();
          formData.append('attachedFile', attachedFiles[i]);
          await ContentService.createFile(post_id, formData, uploadProgress);
        }
      }
      if (removedFiles.length > 0) {
        for(let i = 0; i < removedFiles.length; i++) {
          await FileService.deleteFile(removedFiles[i]);
        }
      }
      fetch();

    }
    catch (err) {
      console.error(err);
      setPostState(ContentStateEnum.EDITTING);
      alert('업데이트 오류');

    }
  };

  const deletePost = async () => {
    const post_id = Number(props.match.params.post_id);
    const goDrop = window.confirm('정말로 삭제하시겠습니까? 삭제한 게시글은 다시 복원할 수 없습니다.');
    if (goDrop) {
      await PostService.deletePost(post_id)
        .then(() => {
          setPostState(ContentStateEnum.DELETED);
        })
        .catch((err: Error) => {
          console.error(err);
          alert('삭제 실패');
        });
    }
  };

  const likePost = async () => {
    const post_id = Number(props.match.params.post_id);

    await ContentService.likeContent(post_id)
      .then(() => {
        if (postInfo) {
          if (likeInfo) {
            setPostInfo({
              ...postInfo,
              like_num: postInfo.like_num - 1
            });
          }
          else {
            setPostInfo({
              ...postInfo,
              like_num: postInfo.like_num + 1
            });
          }
          setLikeInfo(!likeInfo);
        }
      })
      .catch((err: Error) => {
        console.error(err);
      });
  };

  const handleEditting = (e: ChangeEvent<HTMLInputElement>) => {

    if (editingPostData) {
      setEditingPostData({
        ...editingPostData,
        [e.target.name]: e.target.value
      });
    }
  };

  const handleEdittingText = (value: string) => {

    if (editingPostData) {
      setEditingPostData({
        ...editingPostData,
        text: value
      });
    }
  };

  const attachFile = (e: ChangeEvent<HTMLInputElement>) => {
    // const { attachedFiles } = this.state;
    if (e.target.files && postInfo) {
      if (e.target.files.length + attachFile.length + (postInfo.attachedFiles ? postInfo.attachedFiles.length : 0) > 5) {
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
        postInfo &&
                <BoardName
                  board_id={postInfo.board.board_id}
                  board_name={postInfo.board.board_name}
                />
      }
      {
        (() => {
          if (!postInfo || postState === ContentStateEnum.LOADING) {
            return <Loading />;
          }
          else if (postState === ContentStateEnum.READY) {
            return (
              <>
                <PostComponent
                  content={postInfo}
                  my_id={authContext.authInfo.user.user_id}
                  isLiked={likeInfo}
                  likePost={likePost}
                  editPost={() => setPostState(ContentStateEnum.EDITTING)}
                  deletePost={deletePost} />
                {
                  (authContext.authInfo.user.grade < 10) &&
                                    <Comment parent_id={postInfo.content_id} />
                }
              </>

            );
          }
          else if ((postState === ContentStateEnum.EDITTING || postState === ContentStateEnum.CREATING) && editingPostData)
            return (
              <>
                <EditPost
                  postInfo={editingPostData}
                  isBtnDisabled={postState === ContentStateEnum.CREATING}
                  handleEditting={handleEditting}
                  handleEdittingText={handleEdittingText}
                  attachedFiles={attachedFiles}
                  attachFile={attachFile}
                  removeAttachedFile={removeAttachedFile}
                  removedFiles={removedFiles}
                  removeFile={removeFile}
                  cancelRemoveFile={cancelRemoveFile}
                  cancel={() => setPostState(ContentStateEnum.READY)}
                  confirm={updatePost}
                />
                {
                  postState === ContentStateEnum.CREATING &&
                                    <ProgressBar
                                      loadedPercentage={progress}
                                      currentIdx={0}
                                      totalIdx={attachedFiles.length}
                                    />
                }
              </>
            );
          else if (postState === ContentStateEnum.DELETED)
            return (
              <Redirect to={`/board/${postInfo.board_id}`} />
            );
          else {
            return (
              <div>ERROR PAGE</div>
            );
          }
        })()
      }
    </>
  );
}

export default Post;