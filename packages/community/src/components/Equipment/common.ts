import { EquipmentStatus } from '~/services/types';

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

export const equipmentStatusTextMap: Record<EquipmentStatus, string> = {
  [EquipmentStatus.OK]: '양호',
  [EquipmentStatus.BROKEN]: '수리 필요',
  [EquipmentStatus.REPAIRING]: '수리 중',
  [EquipmentStatus.LOST]: '분실',
  [EquipmentStatus.ETC]: '기타',
};
