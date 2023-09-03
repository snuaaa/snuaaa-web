import { AaaService } from './index';
import { AxiosPromise } from 'axios';
import ContentType from '../types/ContentType';

const DocuService = {

  retrieveDocument: function (doc_id: number): AxiosPromise<{
        docuInfo: ContentType,
        likeInfo: boolean
    }> {
    return AaaService.get(`document/${doc_id}`);
  },

  retrieveDocuments: function (pageIdx: number, ctg_id: string, generation: number): AxiosPromise<{
        docInfo: ContentType[],
        docCount: number
    }> {
    let categoryUrl = '';
    let genUrl = '';
    ctg_id && (categoryUrl = `&category=${ctg_id}`);
    generation && (genUrl = `&generation=${generation}`);
    return AaaService.get(`document?page=${pageIdx}${categoryUrl}${genUrl}`);
  },

  retrieveDocumentsByGeneration: function (generation: number) {
    return AaaService.get(`document/generation/${generation}`);
  },

  updateDocument: function (doc_id: number, data: any) {
    return AaaService.patch(`document/${doc_id}`, data);
  },

  deleteDocument: function (doc_id: number) {
    return AaaService.delete(`document/${doc_id}`);
  },

  createDocument: function (board_id: string, data: any) {
    return AaaService.post(`board/${board_id}/document`, data);
  }
};

export default DocuService;
