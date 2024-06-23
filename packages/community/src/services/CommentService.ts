import { API } from './index';
import { Comment } from './types';

export interface CreateCommentRequest {
  parent_comment_id?: number;
  text: string;
}

export type UpdateCommentRequest = Pick<CreateCommentRequest, 'text'>;

const CommentService = {
  retrieveComments: function (parent_id: number) {
    return API.get<Comment[]>(`content/${parent_id}/comments`);
  },

  createComment: function (parent_id: number, data: CreateCommentRequest) {
    return API.post(`content/${parent_id}/comment`, data);
  },

  updateComment: function (comment_id: number, data: UpdateCommentRequest) {
    return API.patch(`comment/${comment_id}`, data);
  },

  deleteComment(comment_id: number) {
    return API.delete(`comment/${comment_id}`);
  },

  likeComment(comment_id: number) {
    return API.post(`comment/${comment_id}/like`, {});
  },
};

export default CommentService;
