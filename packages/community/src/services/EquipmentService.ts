import { API } from './index';

import { Equipment } from './types';

export type RetrieveEquipmentListResponse = Equipment[];

export type RentEquipmentRequest = {
  equipmentIds: number[];
};

const EquipmentService = {
  retrieveList: function () {
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
