import { AaaService } from './index';
import { AxiosPromise } from 'axios';
import ContentType from '../types/ContentType';
import AlbumType from '../types/AlbumType';
import PhotoType from '../types/PhotoType';

const PhotoBoardService = {

  retrieveAlbumsInPhotoBoard: function (board_id: string, pageIdx: number, ctg_id?: string): AxiosPromise<{
        albumInfo: AlbumType[],
        albumCount: number
    }> {
    if (!ctg_id) {
      return AaaService.get(`photoboard/${board_id}/albums?page=${pageIdx ? pageIdx : 1}`);
    }
    else {
      return AaaService.get(`photoboard/${board_id}/albums?category=${ctg_id}&page=${pageIdx ? pageIdx : 1}`);
    }
  },

  createAlbum: function (board_id: string, data: any) {
    return AaaService.post(`photoboard/${board_id}/album`, data);
  },

  retrievePhotosInPhotoBoard: function (board_id: string, pageIdx: number, tags?: string[]): AxiosPromise<{
        photoInfo: PhotoType[],
        photoCount: number
    }> {
    if(tags && tags.length > 0) {
      let tagUrl = '';
      tags.forEach((tag: string) => {
        if (!tagUrl) {
          tagUrl += `tags[]=${tag}`;
        }
        else {
          tagUrl += `&tags[]=${tag}`;
        }
      });
      return AaaService.get(`photoboard/${board_id}/photos?${tagUrl}&page=${pageIdx}`);            
    }
    else {
      return AaaService.get(`photoboard/${board_id}/photos?page=${pageIdx}`);
    }
  },

  createPhotosInPhotoBoard: function (board_id: string, data: any) {
    return AaaService.post(`photoboard/${board_id}/photos`, data);
  },
};

export default PhotoBoardService;
