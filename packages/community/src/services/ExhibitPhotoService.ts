import { ExhibitPhoto, User } from 'types';
import { AaaService } from './index';
import { AxiosPromise } from 'axios';

export interface CreateExhibitPhotoRequest {
  title: string;
  text: string;
  order: number;
  photographer: User;
  photographer_alt: string;
  date?: Date;
  location?: string;
  camera?: string;
  lens?: string;
  focal_length?: string;
  f_stop?: string;
  exposure_time?: string;
  iso?: string;
}

const ExhibitPhotoService = {
  retrieveExhibitPhoto: function (exhibitPhoto_id: number): AxiosPromise<{
    exhibitPhotoInfo: ExhibitPhoto;
    exhibitPhotosInfo: ExhibitPhoto[];
    likeInfo: boolean;
  }> {
    return AaaService.get(`exhibitPhoto/${exhibitPhoto_id}`);
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateExhibitPhoto: function (exhibitPhoto_id: number, data: any) {
    return AaaService.patch(`exhibitPhoto/${exhibitPhoto_id}`, data);
  },

  deleteExhibitPhoto: function (exhibitPhoto_id: number) {
    return AaaService.delete(`exhibitPhoto/${exhibitPhoto_id}`);
  },
};

export default ExhibitPhotoService;
