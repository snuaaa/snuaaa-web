import { Album, Photo } from './types';
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

  /**
   * @deprecated Use Photoservice.retrievePhotoList instead
   */
  retrievePhotosInPhotoBoard: function (
    board_id: string,
    pageIdx: number,
    tags?: string[],
  ) {
    if (tags && tags.length > 0) {
      let tagUrl = '';
      tags.forEach((tag: string) => {
        if (!tagUrl) {
          tagUrl += `tags[]=${tag}`;
        } else {
          tagUrl += `&tags[]=${tag}`;
        }
      });
      return API.get<{
        photoInfo: Photo[];
        photoCount: number;
      }>(`photoboard/${board_id}/photos?${tagUrl}&page=${pageIdx}`);
    } else {
      return API.get<{
        photoInfo: Photo[];
        photoCount: number;
      }>(`photoboard/${board_id}/photos?page=${pageIdx}`);
    }
  },

  /**
   * @deprecated
   */
  createPhotosInPhotoBoard: function (board_id: string, data: FormData) {
    return API.post(`photoboard/${board_id}/photos`, data);
  },
};

export default PhotoBoardService;
