import { Album } from './types';
import { API } from './index';

export interface CreateAlbumRequest {
  title: string;
  text: string;
  category_id?: string;
  is_private: boolean;
}

export type AlbumSearchParams = {
  search_type?: string;
  search_keyword?: string;
};

const PhotoBoardService = {
  retrieveAlbumsInPhotoBoard: function (
    board_id: string,
    pageIdx: number,
    ctg_id?: string,
    search?: AlbumSearchParams,
  ) {
    return API.get<{
      albumInfo: Album[];
      albumCount: number;
    }>(`photoboard/${board_id}/albums`, {
      params: {
        page: pageIdx || 1,
        ...(ctg_id && { category: ctg_id }),
        ...(search?.search_keyword && search),
      },
    });
  },

  createAlbum: function (board_id: string, data: CreateAlbumRequest) {
    return API.post(`photoboard/${board_id}/album`, data);
  },
};

export default PhotoBoardService;
