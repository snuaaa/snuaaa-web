import { Album, Category, Content, Photo, Tag } from './types';
import { API } from './index';

export interface UpdateAlbumThumbnailRequest {
  tn_photo_id: Photo['content_id'];
}

type RetrieveAlbumResponse = {
  albumInfo: Album;
  categoryInfo: Category[];
  tagInfo: Tag[];
};

const AlbumService = {
  retrieveAlbum: function (album_id: number) {
    return API.get<RetrieveAlbumResponse>(`album/${album_id}`);
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
    return API.get<Photo[]>(`album/${album_id}/photos`);
  },
};

export default AlbumService;
