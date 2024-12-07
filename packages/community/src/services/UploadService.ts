import { API } from './index';

const UploadService = {
  uploadImage: function (file: File, withThumbnail?: boolean) {
    const data = new FormData();
    data.append('image', file);

    return API.post<{
      imgUrl: string;
      thumbnailUrl?: string;
    }>('upload/image', data, { params: { thumbnail: withThumbnail } });
  },
};

export default UploadService;
