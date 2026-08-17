import { API } from './index';

export type UploadResourceType = 'profile' | 'photo' | 'equipment' | 'editor';

const UploadService = {
  uploadImage: function (
    file: File,
    resourceType: UploadResourceType,
    withThumbnail?: boolean,
  ) {
    const data = new FormData();
    data.append('image', file);

    return API.post<{
      imgUrl: string;
      thumbnailUrl?: string;
    }>('upload/image', data, {
      params: { type: resourceType, thumbnail: withThumbnail },
    });
  },
};

export default UploadService;
