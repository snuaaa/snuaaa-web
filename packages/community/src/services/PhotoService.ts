import { AaaService } from './index';
import { AxiosPromise } from 'axios';
import ContentType from '../types/ContentType';
import TagType from '../types/TagType';
import PhotoType from '../types/PhotoType';

const PhotoService = {

  retrievePhoto: function (photo_id: number): AxiosPromise<{
        photoInfo: PhotoType,
        likeInfo: boolean,
        boardTagInfo: TagType[],
        prevPhoto: PhotoType,
        nextPhoto: PhotoType,
        prevAlbumPhoto: PhotoType,
        nextAlbumPhoto: PhotoType
    }> {
    return AaaService.get(`photo/${photo_id}`);
  },

  updatePhoto: function (photo_id: number, data: PhotoType) {
    return AaaService.patch(`photo/${photo_id}`, data);
  },

  deletePhoto: function (photo_id: number) {
    return AaaService.delete(`photo/${photo_id}`);
  }
};

export default PhotoService;
