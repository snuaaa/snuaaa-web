import { AaaService } from './index';
import { AxiosPromise } from 'axios';
import ContentType from '../types/ContentType';
import FileType from '../types/FileType';

const PostService = {

  retrievePost: function (post_id: number): AxiosPromise<{
        postInfo: ContentType,
        likeInfo: boolean,
        fileInfo: FileType[]
    }> {
    return AaaService.get(`post/${post_id}`);
  },

  updatePost: function (post_id: number, data: any) {
    return AaaService.patch(`post/${post_id}`, data);
  },

  deletePost: function (post_id: number) {
    return AaaService.delete(`post/${post_id}`);
  },

  createPost: function (board_id: string, data: any) {
    return AaaService.post(`board/${board_id}/post`, data);
  }
};

export default PostService;
