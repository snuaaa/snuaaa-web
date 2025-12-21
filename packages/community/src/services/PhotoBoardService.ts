import { Album } from './types';
import { API } from './index';

export interface CreateAlbumRequest {
  title: string;
  text: string;
  category_id?: string;
  is_private: boolean;
}

const PhotoBoardService = {
  retrieveAlbumsInPhotoBoard: function (
    board_id: string,
    pageIdx: number,
    ctg_id?: string,
  ) {
    if (!ctg_id) {
      return API.get<{
        albumInfo: Album[];
        albumCount: number;
      }>(`photoboard/${board_id}/albums?page=${pageIdx ? pageIdx : 1}`);
    } else {
      return API.get<{
        albumInfo: Album[];
        albumCount: number;
      }>(
        `photoboard/${board_id}/albums?category=${ctg_id}&page=${pageIdx ? pageIdx : 1}`,
      );
    }
  },

  createAlbum: function (board_id: string, data: CreateAlbumRequest) {
    return API.post(`photoboard/${board_id}/album`, data);
  },
};

export default PhotoBoardService;
