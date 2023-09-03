import React, { ChangeEvent, useState, useEffect, useContext, useRef } from 'react';

import CommentList from './CommentList';
import CommentService from '../../services/CommentService';
import AuthContext from '../../contexts/AuthContext';
import CommentType from '../../types/CommentType';

const TAG = 'COMMENT';

type CommentProps = {
    parent_id: number;
}

function Comment({ parent_id }: CommentProps) {

  const [comments, setComments] = useState<CommentType[]>([]);
  const [text, setText] = useState<string>('');
  const [editingCommentId, setEditingCommentId] = useState<number>(0);
  const [editingCommentText, setEditingCommentText] = useState<string>('');
  const [parentCommentId, setParentCommentId] = useState<number>(0);
  const authContext = useContext(AuthContext);
  const textareaTarget = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch();
  }, [parent_id]);


  const fetch = async () => {

    await CommentService.retrieveComments(parent_id)
      .then((res) => {
        setComments(res.data);
      })
      .catch((err: Error) => {
        console.error(err);
      });
  };

  const setEditingComment = (comment_id: number, text: string) => {
    setEditingCommentId(comment_id);
    setEditingCommentText(text);
  };

  const createComment = async () => {

    if (!text) {
      alert('내용을 입력하세요.');
    }
    else {
      const commentInfo = {
        parent_comment_id: parentCommentId ? parentCommentId : null,
        text: text
      };
      await CommentService.createComment(parent_id, commentInfo)
        .then((res: any) => {
          setText('');
          fetch();
        })
        .catch((err: Error) => {
          console.error(err);
          alert('댓글 작성 실패');
        });
    }
  };

  const updateComment = async (comment_id: number) => {

    if (!editingCommentText) {
      alert('내용을 입력하세요.');
    }
    else {
      const commentInfo = {
        text: editingCommentText
      };

      await CommentService.updateComment(comment_id, commentInfo)
        .then((res: any) => {
          setEditingCommentId(0);
          setEditingCommentText('');
          fetch();
        })
        .catch((err: Error) => {
          console.error(err);
          alert('댓글 업데이트 실패');
        });
    }
  };

  const deleteComment = async (comment_id: number) => {

    const goDrop = window.confirm('정말로 삭제하시겠습니까?');
    if (goDrop) {
      await CommentService.deleteComment(comment_id)
        .then(() => {
          fetch();
        })
        .catch((err: Error) => {
          console.error(err);
          alert('댓글 삭제 실패');
        });
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleEditingCommentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setEditingCommentText(e.target.value);
  };

  const onClickSubComment = (parent_comment_id: number) => {
    setText('');
    setParentCommentId(parent_comment_id);
  };
    
  const likeComment = async (comment_id: number) => {
    await CommentService.likeComment(comment_id)
      .then(() => {
        fetch();
      })
      .catch((err: Error) => {
        console.error(err);
      });
  };
    
  useEffect(() => {        
    if (textareaTarget.current) {
      textareaTarget.current.focus();
    }
  }, [parentCommentId]);

  return (
    <div className="comment-area-wrapper">
      <CommentList
        my_id={authContext.authInfo.user.user_id}
        comments={comments}
        text={text}
        deleteComment={deleteComment}
        updateComment={updateComment}
        commentInEdit={editingCommentId}
        setCommentInEdit={setEditingComment}
        editingContents={editingCommentText}
        parentCommentId={parentCommentId}
        createComment={createComment}
        likeComment={likeComment}
        // setParentCommentId={setParentCommentId}
        textareaTarget={textareaTarget}
        handleChange={handleChange}
        onClickSubComment={onClickSubComment}
        editingContentsChange={handleEditingCommentChange} />
      {
        parentCommentId <= 0 &&
                <div className="comment-write">
                  <textarea placeholder="댓글을 입력하세요" name="text" onChange={handleChange} value={text}></textarea>
                  <button onClick={createComment}>ENTER</button>
                </div>
      }
    </div>
  );
}

export default Comment;
