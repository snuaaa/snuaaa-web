import { EquipmentRentStatus, EquipmentStatus } from 'services/types';

export const equipmentStatusOptions = [
  {
    value: EquipmentStatus.OK,
    name: '양호',
  },
  {
    value: EquipmentStatus.BROKEN,
    name: '수리 필요',
  },
  {
    value: EquipmentStatus.LOST,
    name: '분실',
  },
  {
    value: EquipmentStatus.REPAIRING,
    name: '수리 중',
  },
  {
    value: EquipmentStatus.ETC,
    name: '기타',
  },
];

export const equipmentRentStatusOptions = [
  {
    value: EquipmentRentStatus.RENTABLE,
    name: '대여 가능',
  },
  {
    value: EquipmentRentStatus.UNRENTABLE,
    name: '대여 불가',
  },
  {
    value: EquipmentRentStatus.RENTED,
    name: '대여 중',
  },
];
