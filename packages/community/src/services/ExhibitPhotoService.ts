import { Board, ExhibitPhoto, User } from './types';
import { API } from './index';

export interface ExhibitPhotoInfo {
  title: string;
  text: string;
  order: number;
  photographer?: Pick<User, 'nickname' | 'profile_path' | 'user_uuid'>;
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

export type UpdateExhibitPhotoRequest = CreateExhibitPhotoRequest['photoInfo'];

const ExhibitPhotoService = {
  createExhibitPhoto: function (
    exhibition_id: number,
    data: CreateExhibitPhotoRequest,
  ) {
    const formData = new FormData();
    formData.append('board_id', data.board_id);
    formData.append('photoInfo', JSON.stringify(data.photoInfo));
    formData.append('exhibition_no', data.exhibition_no.toString());
    formData.append('exhibitPhoto', data.exhibitPhoto);

    return API.post(`exhibition/${exhibition_id}/exhibitPhoto`, formData);
  },

  retrieveExhibitPhotosinExhibition: function (exhibition_id: number) {
    return API.get<{ exhibitPhotosInfo: ExhibitPhoto[] }>(
      `exhibition/${exhibition_id}/exhibitPhotos`,
    );
  },

  retrieveExhibitPhoto: function (exhibitPhoto_id: number) {
    return API.get<{
      exhibitPhotoInfo: ExhibitPhoto;
      exhibitPhotosInfo: ExhibitPhoto[];
      likeInfo: boolean;
    }>(`exhibitPhoto/${exhibitPhoto_id}`);
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
