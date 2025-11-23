import { Content, File, ListResponse } from './types';
import { API } from './index';

export interface CreatePostRequest {
  title: string;
  text: string;
}

type RetrievePostListResponse = {
  postCount: number;
  postInfo: Content[];
};

type RetrievePostResponse = {
  postInfo: Content;
  likeInfo: boolean;
  fileInfo?: File[];
};

type RetrievePostListParams = {
  offset?: number;
  limit?: number;
  board_id?: string;
  user_uuid?: string;
};

const PostService = {
  retrievePostsInBoard: function (board_id: string, pageIdx: number) {
    return API.get<RetrievePostListResponse>(
      `board/${board_id}/posts?page=${pageIdx}`,
    );
  },

  searchPostsInBoard: function (
    board_id: string,
    searchType: string,
    keyword: string,
    pageIdx: number,
  ) {
    return API.get<RetrievePostListResponse>(
      `board/${board_id}/posts/search?type=${searchType}&keyword=${keyword}&page=${pageIdx}`,
    );
  },

  retrievePostList: (params: RetrievePostListParams) => {
    return API.get<ListResponse<Content>>(`post/list`, {
      params,
    });
  },

  retrievePost: function (post_id: number) {
    return API.get<RetrievePostResponse>(`post/${post_id}`);
  },

  updatePost: function (post_id: number, data: CreatePostRequest) {
    return API.patch(`post/${post_id}`, data);
  },

  deletePost: function (post_id: number) {
    return API.delete(`post/${post_id}`);
  },

  createPost: function (board_id: string, data: CreatePostRequest) {
    return API.post<{ content_id: number }>(`board/${board_id}/post`, data);
  },
};

export default PostService;
