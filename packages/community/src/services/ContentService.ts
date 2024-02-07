import { API } from './index';
import { AxiosPromise } from 'axios';

const ContentService = {
  createFile: function (
    content_id: number,
    data: FormData,
    cb: (pg: ProgressEvent) => void,
  ): AxiosPromise<void> {
    return API.postWithProgress(`content/${content_id}/file`, data, cb);
  },

  likeContent: function (content_id: number) {
    return API.post(`content/${content_id}/like`, {});
  },
};

export default ContentService;
