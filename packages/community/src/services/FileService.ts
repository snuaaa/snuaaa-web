import { AaaService } from './index';
import { AxiosPromise } from 'axios';

const FileService = {

  deleteFile: function (file_id: number) {
    return AaaService.delete(`file/${file_id}`);
  }
};

export default FileService;
