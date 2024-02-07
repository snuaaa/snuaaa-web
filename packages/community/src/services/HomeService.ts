import { API } from './index';
import { AxiosPromise } from 'axios';

import { Content, Comment } from 'types';

export interface RiseSet {
  lunAge: number;
  sunrise: number;
  sunset: number;
  moonrise: number;
  moonset: number;
  astm: number;
  aste: number;
}

export type SoundBoxResponse = Pick<Content, 'content_id' | 'title' | 'text'>;

const HomeService = {
  retrieveSoundBox: function (): AxiosPromise<SoundBoxResponse> {
    return API.get('home/soundbox');
  },

  retrieveRecentPosts: function () {
    return API.get('home/posts');
  },

  retrieveAllPosts: function (pageIdx: number): AxiosPromise<{
    postInfo: Content[];
    postCount: number;
  }> {
    return API.get(`home/posts/all?page=${pageIdx}`);
  },

  retrieveRecentComments: function () {
    return API.get('home/comments');
  },

  retrieveAllComments: function (pageIdx: number): AxiosPromise<{
    commentInfo: Comment[];
    commentCount: number;
  }> {
    return API.get(`home/comments/all?page=${pageIdx}`);
  },

  retrieveRecentMemory: function () {
    return API.get('home/memory');
  },

  retrieveRecentAstroPhoto: function () {
    return API.get('home/astrophoto');
  },

  retrieveRiseSet: function (): AxiosPromise<RiseSet> {
    return API.get('home/riseset');
  },
};

export default HomeService;
