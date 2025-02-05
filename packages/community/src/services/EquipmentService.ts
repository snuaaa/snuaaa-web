import { EquipmentCategories } from 'contexts/EquipmentCategoryContext';
import { API } from './index';

import { Equipment, EquipmentCategory, EquipmentStatus, Rent } from './types';

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

export type RentRecordResponse = {
  count: number;
  rows: Rent[];
};

export type UpdateEquipmentRequest = CreateEquipmentRequest &
  Pick<Equipment, 'id'>;

const EquipmentService = {
  retrieveCategoryList: function () {
    return API.get<EquipmentCategories>('equipment/category');
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

  retrieveRentRecord: function (equipmentId: number, pageIdx: number) {
    return API.get<RentRecordResponse>(
      `equipment/${equipmentId}/rents?page=${pageIdx}`,
    );
  },

  rentEquipment: function (data: RentEquipmentRequest) {
    return API.post<Equipment>(`equipment/rent/`, data);
  },
};

export default EquipmentService;
