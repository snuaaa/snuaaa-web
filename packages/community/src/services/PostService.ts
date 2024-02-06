/* eslint-disable @typescript-eslint/no-explicit-any */
import { Content, File } from 'types';
import { AaaService } from './index';
import { AxiosPromise } from 'axios';

export interface CreatePostRequest {
  title: string;
  text: string;
}

const PostService = {
  retrievePost: function (post_id: number): AxiosPromise<{
    postInfo: Content;
    likeInfo: boolean;
    fileInfo: File[];
  }> {
    return AaaService.get(`post/${post_id}`);
  },

  updatePost: function (post_id: number, data: CreatePostRequest) {
    return AaaService.patch(`post/${post_id}`, data);
  },

  deletePost: function (post_id: number) {
    return AaaService.delete(`post/${post_id}`);
  },

  createPost: function (board_id: string, data: CreatePostRequest) {
    return AaaService.post(`board/${board_id}/post`, data);
  },
};

export default PostService;
