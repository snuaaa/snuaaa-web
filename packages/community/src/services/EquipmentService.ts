import { API } from './index';

import { Equipment, EquipmentCategory, EquipmentStatus } from './types';

export type RetrieveEquipmentListResponse = {
  equipCount: number;
  equipInfo: Equipment[];
};

export type RentEquipmentRequest = {
  equipmentIds: number[];
};

export type EquipmentSearchInfo = {
  category_id: number;
  status: string;
  keyword: string;
};

export type CreateEquipmentRequest = Pick<
  Equipment,
  | 'category_id'
  | 'name'
  | 'description'
  | 'location'
  | 'maker'
  | 'status'
  | 'img_path'
>;

export type UpdateEquipmentRequest = CreateEquipmentRequest &
  Pick<Equipment, 'id'>;

const EquipmentService = {
  retrieveCategoryList: function () {
    return API.get<EquipmentCategory[]>('equipment/category');
  },

  createCategory: function (name: string) {
    return API.post<EquipmentCategory>('equipment/category', { name });
  },

  updateCategory: function (id: number, name: string) {
    return API.patch<EquipmentCategory>(`equipment/category`, { id, name });
  },

  deleteCategory: function (id: number) {
    return API.delete(`equipment/category/${id}`);
  },

  searchList: function (searchInfo: EquipmentSearchInfo, pageIdx: number) {
    return API.get<RetrieveEquipmentListResponse>('equipment/search');
  },

  createEquipment: function (data: CreateEquipmentRequest) {
    return API.post<Equipment>('equipment/', data);
  },

  updateEquipment: function (data: UpdateEquipmentRequest) {
    return API.patch<Equipment>('equipment/', data);
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
    return API.post<Equipment>(`equipment/rent/`, data);
  },
};

export default EquipmentService;
