import { API } from './index';

import {
  Equipment,
  EquipmentCategory,
  ListResponse,
  MyRent,
  PenaltyStatus,
  Rent,
  RentWithEquipment,
} from './types';

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
  | 'nickname'
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

  searchList: function () {
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

  retrieveList: function () {
    return API.get<RetrieveEquipmentListResponse>('equipment/');
  },

  retrieveMyRentList: function () {
    return API.get<MyRent[]>('equipment/rent/me');
  },

  retrieveRentRecord: function (equipmentId: number, pageIdx: number) {
    return API.get<RentRecordResponse>(
      `equipment/${equipmentId}/rents?page=${pageIdx}`,
    );
  },

  rentEquipments: function (data: RentEquipmentRequest) {
    return API.post<Equipment>(`equipment/rent/`, data);
  },

  returnEquipment: function (rentId: number, photo_path: string) {
    return API.post(`equipment/rent/${rentId}/return`, { photo_path });
  },

  retrieveAllRentRecords: function (params: {
    penaltyStatus?: PenaltyStatus;
    dateFromStart?: string;
    dateToStart?: string;
    dateFromReturn?: string;
    dateToReturn?: string;
    page: number;
  }) {
    return API.get<ListResponse<RentWithEquipment>>(`equipment/rent/records`, {
      params: {
        page: params.page,
        penalty_status: params.penaltyStatus,
        date_from_start: params.dateFromStart,
        date_to_start: params.dateToStart,
        date_from_return: params.dateFromReturn,
        date_to_return: params.dateToReturn,
      },
    });
  },

  updatePenaltyStatus: function (rentId: number, penaltyStatus: PenaltyStatus) {
    return API.patch(`equipment/rent/${rentId}/penalty`, {
      penalty_status: penaltyStatus,
    });
  },
};

export default EquipmentService;
