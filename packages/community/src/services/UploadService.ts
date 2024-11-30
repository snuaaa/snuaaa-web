import { API } from './index';

const UploadService = {
  uploadImage: function (file: File) {
    const data = new FormData();
    data.append('image', file);

    return API.post<{
      imgPath: string;
    }>('upload/image', data);
  },
};

export default UploadService;
