import { API } from './index';

import { Content, Comment, Album, Photo } from './types';

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

type RecentPostResponse = Content[];

type AllPostsResponse = {
  postInfo: Content[];
  postCount: number;
};

type RecentCommentsResponse = Comment[];

type AllCommentsResponse = {
  commentInfo: Comment[];
  commentCount: number;
};

type RecentMemoryResponse = Album[];

type RecentAstroPhotoResponse = Photo[];

const HomeService = {
  retrieveSoundBox: function () {
    return API.get<SoundBoxResponse>('home/soundbox');
  },

  retrieveRecentPosts: function () {
    return API.get<RecentPostResponse>('home/posts');
  },

  retrieveAllPosts: function (pageIdx: number) {
    return API.get<AllPostsResponse>(`home/posts/all?page=${pageIdx}`);
  },

  retrieveRecentComments: function () {
    return API.get<RecentCommentsResponse>('home/comments');
  },

  retrieveAllComments: function (pageIdx: number) {
    return API.get<AllCommentsResponse>(`home/comments/all?page=${pageIdx}`);
  },

  retrieveRecentMemory: function () {
    return API.get<RecentMemoryResponse>('home/memory');
  },

  retrieveRecentAstroPhoto: function () {
    return API.get<RecentAstroPhotoResponse>('home/astrophoto');
  },

  retrieveRiseSet: function () {
    return API.get<RiseSet>('home/riseset');
  },
};

export default HomeService;
