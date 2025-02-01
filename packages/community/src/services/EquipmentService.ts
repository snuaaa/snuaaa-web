import { EquipmentCategories } from 'contexts/EquipmentCategoryContext';
import { API } from './index';
import { SearchInfo } from './types';
import { Equipment } from './types';

export type RetrieveEquipmentListResponse = {
  equipCount: number;
  equipInfo: Equipment[];
};

export type RentEquipmentRequest = {
  equipmentIds: number[];
};

export type EquipmentUploadRequest = {
  id?: number;
  category_id: number;
  name: string;
  description: string;
  location: string;
  maker: string;
  status: string;
  img_path: string;
};

export type RentResponse = {
  successIds: number[];
  failureIds: number[];
};

const EquipmentService = {
  retrieveCategoryList: function () {
    return API.get<EquipmentCategories>('equipment/category');
  },

  searchList: function (searchInfo: SearchInfo, pageIdx: number) {
    return API.get<RetrieveEquipmentListResponse>('equipment/search');
  },

  uploadEquipment: function (data: EquipmentUploadRequest) {
    return API.post<Equipment>('equipment/', data);
  },

  deleteEquipment: function (id: number) {
    return API.delete(`equipment/${id}`);
  },

  retrieveList: function (pageIdx: number) {
    return API.get<RetrieveEquipmentListResponse>('equipment/');
  },

  retrieveMyRentList: function () {
    return API.get<Equipment[]>('equipment/rent/me');
  },

  rentEquipment: function (data: RentEquipmentRequest) {
    return API.post<RentResponse>(`equipment/rent/`, data);
  },
};

export default EquipmentService;
