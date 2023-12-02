import { AaaService } from './index';
import { AxiosPromise } from 'axios';
import CommentType from '../types/CommentType';
import ContentType from '../types/ContentType';
import RiseSetType from '../types/RiseSetType';

const HomeService = {

  retrieveSoundBox: function() {
    return AaaService.get('home/soundbox');
  },

  retrieveRecentPosts: function() {
    return AaaService.get('home/posts');
  },

  retrieveAllPosts: function(pageIdx: number): AxiosPromise<{
        postInfo: ContentType[],
        postCount: number
    }> {
    return AaaService.get(`home/posts/all?page=${pageIdx}`);
  },

  retrieveRecentComments: function() {
    return AaaService.get('home/comments');
  },

  retrieveAllComments: function(pageIdx: number): AxiosPromise<{
        commentInfo: CommentType[],
        commentCount: number
    }> {
    return AaaService.get(`home/comments/all?page=${pageIdx}`);
  },

  retrieveRecentMemory: function() {
    return AaaService.get('home/memory');
  },

  retrieveRecentAstroPhoto: function() {
    return AaaService.get('home/astrophoto');
  },

  retrieveRiseSet: function(): AxiosPromise<RiseSetType> {
    return AaaService.get('home/riseset');
  }
};

export default HomeService;
