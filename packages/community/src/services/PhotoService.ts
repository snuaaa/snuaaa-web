import { AaaService } from './index';
import { AxiosPromise } from 'axios';

import { Photo, Tag } from 'types';

export interface CreatePhotoRequest {
  board_id?: string;
  album_id?: number;
  title?: string;
  text?: string;
  file_path?: string;
  thumbnail_path?: string;
  location?: string;
  camera?: string;
  lens?: string;
  exposure_time?: string;
  focal_length?: string;
  f_stop?: string;
  iso?: string;
  date?: Date;
  tags?: string[];
}

const PhotoService = {
  retrievePhoto: function (photo_id: number): AxiosPromise<{
    photoInfo: Photo;
    likeInfo: boolean;
    boardTagInfo: Tag[];
    prevPhoto: Photo;
    nextPhoto: Photo;
    prevAlbumPhoto: Photo;
    nextAlbumPhoto: Photo;
  }> {
    return AaaService.get(`photo/${photo_id}`);
  },

  updatePhoto: function (photo_id: number, data: Photo) {
    return AaaService.patch(`photo/${photo_id}`, data);
  },

  deletePhoto: function (photo_id: number) {
    return AaaService.delete(`photo/${photo_id}`);
  },
};

export default PhotoService;
