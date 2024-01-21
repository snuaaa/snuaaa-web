import { AaaService } from './index';

const FileService = {
  deleteFile: function (file_id: number) {
    return AaaService.delete(`file/${file_id}`);
  },
};

export default FileService;
