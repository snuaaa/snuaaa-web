import { Content, File } from './types';
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

/** A row of the document list: the Document row with its Content. */
export type DocumentListItem = {
  content_id: number;
  generation: number;
  content: Pick<Content, 'content_id' | 'title' | 'text' | 'user'> & {
    category?: { category_name: string };
    attachedFiles?: File[];
  };
};

export type RetrieveDocumentParams = {
  page?: number;
  category?: string; // categoryId
  generation?: number;
};

const DocuService = {
  retrieveDocument: function (doc_id: number) {
    return API.get<{
      docuInfo: Content;
      likeInfo: boolean;
    }>(`document/${doc_id}`);
  },

  retrieveDocuments: function (params: RetrieveDocumentParams) {
    return API.get<{
      docInfo: DocumentListItem[];
      docCount: number;
    }>('document', {
      params,
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
