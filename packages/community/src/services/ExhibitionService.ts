import { AaaService } from './index';

const ExhibitionService = {
  retrieveExhibition: function (exhibition_id: number) {
    return AaaService.get(`exhibition/${exhibition_id}`);
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateExhibition: function (exhibition_id: number, data: any) {
    return AaaService.patch(`exhibition/${exhibition_id}`, data);
  },

  deleteExhibition: function (exhibition_id: number) {
    return AaaService.delete(`exhibition/${exhibition_id}`);
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createExhibitPhoto: function (exhibition_id: number, data: any) {
    return AaaService.post(`exhibition/${exhibition_id}/exhibitPhoto`, data);
  },

  retrieveExhibitPhotosinExhibition: function (exhibition_id: number) {
    return AaaService.get(`exhibition/${exhibition_id}/exhibitPhotos`);
  },
};

export default ExhibitionService;
