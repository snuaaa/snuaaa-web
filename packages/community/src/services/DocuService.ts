/* eslint-disable @typescript-eslint/no-explicit-any */
import { Content } from 'types';
import { API } from './index';
import { AxiosPromise } from 'axios';

export interface CreateDocuRequest {
  title: string;
  text: string;
  generation: number;
  category_id: string;
}

const DocuService = {
  retrieveDocument: function (doc_id: number): AxiosPromise<{
    docuInfo: Content;
    likeInfo: boolean;
  }> {
    return API.get(`document/${doc_id}`);
  },

  retrieveDocuments: function (
    pageIdx: number,
    ctg_id: string,
    generation: number,
  ): AxiosPromise<{
    docInfo: Content[];
    docCount: number;
  }> {
    let categoryUrl = '';
    let genUrl = '';
    ctg_id && (categoryUrl = `&category=${ctg_id}`);
    generation && (genUrl = `&generation=${generation}`);
    return API.get(`document?page=${pageIdx}${categoryUrl}${genUrl}`);
  },

  retrieveDocumentsByGeneration: function (generation: number) {
    return API.get(`document/generation/${generation}`);
  },

  updateDocument: function (doc_id: number, data: any) {
    return API.patch(`document/${doc_id}`, data);
  },

  deleteDocument: function (doc_id: number) {
    return API.delete(`document/${doc_id}`);
  },

  createDocument: function (board_id: string, data: CreateDocuRequest) {
    return API.post(`board/${board_id}/document`, data);
  },
};

export default DocuService;
