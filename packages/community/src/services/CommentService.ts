/* eslint-disable @typescript-eslint/no-explicit-any */
import { AaaService } from './index';
import { AxiosPromise } from 'axios';
import { Comment } from 'types';

const CommentService = {
  retrieveComments: function (parent_id: number): AxiosPromise<Comment[]> {
    return AaaService.get(`content/${parent_id}/comments`);
  },

  createComment: function (parent_id: number, data: any) {
    return AaaService.post(`content/${parent_id}/comment`, data);
  },

  updateComment: function (comment_id: number, data: any) {
    return AaaService.patch(`comment/${comment_id}`, data);
  },

  deleteComment(comment_id: number) {
    return AaaService.delete(`comment/${comment_id}`);
  },

  likeComment(comment_id: number) {
    return AaaService.post(`comment/${comment_id}/like`, {});
  },
};

export default CommentService;
