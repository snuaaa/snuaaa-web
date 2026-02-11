import { API } from './index';
import { AxiosProgressEvent } from 'axios';

const ContentService = {
  createFile: function (
    content_id: number,
    data: FormData,
    cb: (pg: AxiosProgressEvent) => void,
  ) {
    return API.postWithProgress(`content/${content_id}/file`, data, cb);
  },

  likeContent: function (content_id: number) {
    return API.post(`content/${content_id}/like`, {});
  },
};

export default ContentService;
