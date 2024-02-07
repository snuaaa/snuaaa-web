import { Album, Category, Content, Photo, Tag } from 'types';
import { API } from './index';
import { AxiosPromise } from 'axios';

export interface UpdateAlbumThumbnailRequest {
  tn_photo_id: Photo['content_id'];
}

const AlbumService = {
  createPhotosInAlbum: function (
    album_id: number,
    data: FormData,
    cb: (pg: ProgressEvent) => void,
  ): AxiosPromise<void> {
    return API.postWithProgress(`album/${album_id}/photos`, data, cb);
  },

  retrieveAlbum: function (album_id: number): AxiosPromise<{
    albumInfo: Album;
    categoryInfo: Category[];
    tagInfo: Tag[];
  }> {
    return API.get(`album/${album_id}`);
  },

  updateAlbum: function (album_id: number, data: Content) {
    return API.patch(`album/${album_id}`, data);
  },

  updateAlbumThumbnail: function (
    album_id: number,
    data: UpdateAlbumThumbnailRequest,
  ) {
    return API.patch(`album/${album_id}/thumbnail`, data);
  },

  deleteAlbum: function (album_id: number) {
    return API.delete(`album/${album_id}`);
  },

  retrievePhotosInAlbum: function (album_id: number) {
    return API.get(`album/${album_id}/photos`);
  },
};

export default AlbumService;
