import { Content, File } from './types';
import { API } from './index';
import { AxiosPromise } from 'axios';

export interface CreatePostRequest {
  title: string;
  text: string;
}

const PostService = {
  retrievePostsInBoard: function (board_id: string, pageIdx: number) {
    return API.get(`board/${board_id}/posts?page=${pageIdx}`);
  },

  searchPostsInBoard: function (
    board_id: string,
    searchType: string,
    keyword: string,
    pageIdx: number,
  ) {
    return API.get(
      `board/${board_id}/posts/search?type=${searchType}&keyword=${keyword}&page=${pageIdx}`,
    );
  },

  retrievePost: function (post_id: number): AxiosPromise<{
    postInfo: Content;
    likeInfo: boolean;
    fileInfo: File[];
  }> {
    return API.get(`post/${post_id}`);
  },

  updatePost: function (post_id: number, data: CreatePostRequest) {
    return API.patch(`post/${post_id}`, data);
  },

  deletePost: function (post_id: number) {
    return API.delete(`post/${post_id}`);
  },

  createPost: function (board_id: string, data: CreatePostRequest) {
    return API.post(`board/${board_id}/post`, data);
  },
};

export default PostService;
