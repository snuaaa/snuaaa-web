import { Board, ExhibitPhoto, User } from './types';
import { API } from './index';
import { AxiosPromise } from 'axios';

export interface ExhibitPhotoInfo {
  title: string;
  text: string;
  order: number;
  photographer?: User;
  photographer_alt?: string;
  date?: Date;
  location?: string;
  camera?: string;
  lens?: string;
  focal_length?: string;
  f_stop?: string;
  exposure_time?: string;
  iso?: string;
}

export interface CreateExhibitPhotoRequest {
  board_id: Board['board_id'];
  photoInfo: ExhibitPhotoInfo;
  exhibition_no: number;
  exhibitPhoto: File;
}

export type UpdateExhibitPhotoRequest = ExhibitPhotoInfo;

const ExhibitPhotoService = {
  createExhibitPhoto: function (
    exhibition_id: number,
    data: CreateExhibitPhotoRequest,
  ) {
    const photosForm = new FormData();
    photosForm.append('board_id', data.board_id);
    photosForm.append('photoInfo', JSON.stringify(data.photoInfo));
    photosForm.append('exhibition_no', data.exhibition_no.toString());
    photosForm.append('exhibitPhoto', data.exhibitPhoto);

    return API.post(`exhibition/${exhibition_id}/exhibitPhoto`, data);
  },

  retrieveExhibitPhotosinExhibition: function (exhibition_id: number) {
    return API.get(`exhibition/${exhibition_id}/exhibitPhotos`);
  },

  retrieveExhibitPhoto: function (exhibitPhoto_id: number): AxiosPromise<{
    exhibitPhotoInfo: ExhibitPhoto;
    exhibitPhotosInfo: ExhibitPhoto[];
    likeInfo: boolean;
  }> {
    return API.get(`exhibitPhoto/${exhibitPhoto_id}`);
  },

  updateExhibitPhoto: function (
    exhibitPhoto_id: number,
    data: UpdateExhibitPhotoRequest,
  ) {
    return API.patch(`exhibitPhoto/${exhibitPhoto_id}`, data);
  },

  deleteExhibitPhoto: function (exhibitPhoto_id: number) {
    return API.delete(`exhibitPhoto/${exhibitPhoto_id}`);
  },
};

export default ExhibitPhotoService;
