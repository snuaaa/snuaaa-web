import { Content } from './types';
import { API } from './index';

export interface CreateDocuRequest {
  title: string;
  text: string;
  generation: number;
  category_id: string;
}

type UpdateDocuRequest = {
  title: string;
  text: string;
  category_id?: string;
};

const DocuService = {
  retrieveDocument: function (doc_id: number) {
    return API.get<{
      docuInfo: Content;
      likeInfo: boolean;
    }>(`document/${doc_id}`);
  },

  retrieveDocuments: function (
    pageIdx: number,
    ctg_id: string,
    generation: number,
  ) {
    return API.get<{
      docInfo: Content[];
      docCount: number;
    }>('document', {
      params: {
        page: pageIdx,
        category: ctg_id,
        generation,
      },
    });
  },

  retrieveDocumentsByGeneration: function (generation: number) {
    return API.get(`document/generation/${generation}`);
  },

  updateDocument: function (doc_id: number, data: UpdateDocuRequest) {
    return API.patch(`document/${doc_id}`, data);
  },

  deleteDocument: function (doc_id: number) {
    return API.delete(`document/${doc_id}`);
  },

  createDocument: function (board_id: string, data: CreateDocuRequest) {
    return API.post<{ content_id: number }>(`board/${board_id}/document`, data);
  },
};

export default DocuService;
