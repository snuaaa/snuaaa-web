import { EquipmentStatus } from 'services/types';

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
