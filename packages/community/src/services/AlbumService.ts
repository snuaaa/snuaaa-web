import { AaaService } from './index';
import { AxiosPromise } from 'axios';
import CrtPhotoType from '../types/CrtPhotoType';
import AlbumType from '../types/AlbumType';
import CategoryType from '../types/CategoryType';
import TagType from '../types/TagType';
import ContentType from '../types/ContentType';

const AlbumService = {

  createPhotosInAlbum: function (
    album_id: number,
    data: FormData,
    cb: (pg: ProgressEvent) => void): AxiosPromise<void> {
    return AaaService.postWithProgress(`album/${album_id}/photos`, data, cb);
  },

  retrieveAlbum: function (album_id: number): AxiosPromise<{
        albumInfo: AlbumType,
        categoryInfo: CategoryType[],
        tagInfo: TagType[]
    }> {
    return AaaService.get(`album/${album_id}`);
  },

  updateAlbum: function (album_id: number, data: ContentType) {
    return AaaService.patch(`album/${album_id}`, data);
  },

  updateAlbumThumbnail: function (album_id: number, data: any) {
    return AaaService.patch(`album/${album_id}/thumbnail`, data);
  },

  deleteAlbum: function (album_id: number) {
    return AaaService.delete(`album/${album_id}`);
  },

  retrievePhotosInAlbum: function (album_id: number) {
    return AaaService.get(`album/${album_id}/photos`);
  }
};

export default AlbumService;
