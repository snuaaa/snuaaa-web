/* eslint-disable @typescript-eslint/no-explicit-any */
import { Board, Exhibition } from 'types';
import { AaaService } from './index';
import { AxiosPromise } from 'axios';

const BoardService = {
  retrieveBoards: function (): AxiosPromise<Board[]> {
    return AaaService.get('board');
  },

  retrieveBoardInfo: function (board_id: string): AxiosPromise<{
    boardInfo: Board;
  }> {
    return AaaService.get(`board/${board_id}`);
  },

  retrievePostsInBoard: function (board_id: string, pageIdx: number) {
    return AaaService.get(`board/${board_id}/posts?page=${pageIdx}`);
  },

  searchPostsInBoard: function (
    board_id: string,
    searchType: string,
    keyword: string,
    pageIdx: number,
  ) {
    return AaaService.get(
      `board/${board_id}/posts/search?type=${searchType}&keyword=${keyword}&page=${pageIdx}`,
    );
  },

  retrieveExhibitionsInBoard: function (
    board_id: string,
  ): AxiosPromise<Exhibition[]> {
    return AaaService.get(`board/${board_id}/exhibitions`);
  },

  createExhibition: function (board_id: string, data: any) {
    return AaaService.post(`board/${board_id}/exhibition`, data);
  },

  createPost: function (board_id: string, data: any) {
    return AaaService.post(`board/${board_id}/post`, data);
  },
};

export default BoardService;
