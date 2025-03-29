import { EquipmentRentStatus, EquipmentStatus } from '~/services/types';

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

export const equipmentStatusColorMap: Record<EquipmentStatus, string> = {
  [EquipmentStatus.OK]: 'text-green-600',
  [EquipmentStatus.BROKEN]: 'text-red-600',
  [EquipmentStatus.REPAIRING]: 'text-yellow-600',
  [EquipmentStatus.LOST]: 'text-gray-500',
  [EquipmentStatus.ETC]: 'text-gray-500',
};

export const equipmentStatusTextMap: Record<EquipmentStatus, string> = {
  [EquipmentStatus.OK]: '양호',
  [EquipmentStatus.BROKEN]: '수리 필요',
  [EquipmentStatus.REPAIRING]: '수리 중',
  [EquipmentStatus.LOST]: '분실',
  [EquipmentStatus.ETC]: '기타',
};

export const equipmentRentColorMap: Record<EquipmentRentStatus, string> = {
  [EquipmentRentStatus.RENTABLE]: 'text-cyan-500',
  [EquipmentRentStatus.UNRENTABLE]: 'text-yellow-400',
  [EquipmentRentStatus.RENTED]: 'text-red-400',
};
