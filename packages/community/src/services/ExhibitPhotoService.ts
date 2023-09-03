import { AaaService } from './index';
import { AxiosPromise } from 'axios';
import ExhibitPhotoType from '../types/ExhibitPhotoType';

const ExhibitPhotoService = {

  retrieveExhibitPhoto: function (exhibitPhoto_id: number): AxiosPromise<{
        exhibitPhotoInfo: ExhibitPhotoType,
        exhibitPhotosInfo: ExhibitPhotoType[],
        likeInfo: boolean,
    }> {
    return AaaService.get(`exhibitPhoto/${exhibitPhoto_id}`);
  },

  updateExhibitPhoto: function (exhibitPhoto_id: number, data: any) {
    return AaaService.patch(`exhibitPhoto/${exhibitPhoto_id}`, data);
  },

  deleteExhibitPhoto: function (exhibitPhoto_id: number) {
    return AaaService.delete(`exhibitPhoto/${exhibitPhoto_id}`);
  }
};

export default ExhibitPhotoService;
