import { API } from './index';

import { Content, Photo, Tag } from './types';

export type CreatePhotoInfo = Pick<Content, 'title' | 'text'> &
  Pick<
    Photo['photo'],
    | 'location'
    | 'camera'
    | 'lens'
    | 'exposure_time'
    | 'focal_length'
    | 'f_stop'
    | 'iso'
    | 'date'
    | 'img_url'
    | 'thumbnail_url'
  > & {
    tags: Tag['tag_id'][];
  };

export interface CreatePhotoRequest {
  board_id: string;
  album_id?: number;
  list: CreatePhotoInfo[];
}

export type UpdatePhotoRequest = Pick<Content, 'title' | 'text'> & {
  tags: Tag['tag_id'][];
} & {
  photo: Pick<
    Photo['photo'],
    | 'date'
    | 'camera'
    | 'lens'
    | 'focal_length'
    | 'f_stop'
    | 'exposure_time'
    | 'iso'
    | 'location'
  >;
};

const PhotoService = {
  retrievePhoto: function (photo_id: number) {
    return API.get<{
      photoInfo: Photo;
      likeInfo: boolean;
      boardTagInfo: Tag[];
      prevPhoto: Photo;
      nextPhoto: Photo;
      prevAlbumPhoto: Photo;
      nextAlbumPhoto: Photo;
    }>(`photo/${photo_id}`);
  },

  updatePhoto: function (photo_id: number, data: UpdatePhotoRequest) {
    return API.patch(`photo/${photo_id}`, data);
  },

  deletePhoto: function (photo_id: number) {
    return API.delete(`photo/${photo_id}`);
  },

  createPhoto: function (data: CreatePhotoRequest) {
    return API.post('photo', data);
  },
};

export default PhotoService;
