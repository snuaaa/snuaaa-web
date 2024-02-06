import { Album, Category, Content, Tag } from 'types';
import { AaaService } from './index';
import { AxiosPromise } from 'axios';

const AlbumService = {
  createPhotosInAlbum: function (
    album_id: number,
    data: FormData,
    cb: (pg: ProgressEvent) => void,
  ): AxiosPromise<void> {
    return AaaService.postWithProgress(`album/${album_id}/photos`, data, cb);
  },

  retrieveAlbum: function (album_id: number): AxiosPromise<{
    albumInfo: Album;
    categoryInfo: Category[];
    tagInfo: Tag[];
  }> {
    return AaaService.get(`album/${album_id}`);
  },

  updateAlbum: function (album_id: number, data: Content) {
    return AaaService.patch(`album/${album_id}`, data);
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateAlbumThumbnail: function (album_id: number, data: any) {
    return AaaService.patch(`album/${album_id}/thumbnail`, data);
  },

  deleteAlbum: function (album_id: number) {
    return AaaService.delete(`album/${album_id}`);
  },

  retrievePhotosInAlbum: function (album_id: number) {
    return AaaService.get(`album/${album_id}/photos`);
  },
};

export default AlbumService;
