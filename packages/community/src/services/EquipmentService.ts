import { EquipmentCategories } from 'contexts/EquipmentCategoryContext';
import { API } from './index';

import { Equipment } from './types';

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

const EquipmentService = {
  retrieveCategoryList: function () {
    return API.get<EquipmentCategories>('equipment/categories');
  },

  searchList: function (searchInfo: EquipmentSearchInfo, pageIdx: number) {
    return API.get<RetrieveEquipmentListResponse>('equipment/search');
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
