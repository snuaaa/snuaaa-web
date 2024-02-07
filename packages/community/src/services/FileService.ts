import { API } from './index';

const FileService = {
  deleteFile: function (file_id: number) {
    return API.delete(`file/${file_id}`);
  },
};

export default FileService;
