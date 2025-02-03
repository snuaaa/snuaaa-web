import { EquipmentStatus } from 'services/types';

export const equipmentStatusOptions = [
  {
    id: EquipmentStatus.OK,
    name: '양호',
  },
  {
    id: EquipmentStatus.BROKEN,
    name: '수리 필요',
  },
  {
    id: EquipmentStatus.LOST,
    name: '분실',
  },
  {
    id: EquipmentStatus.REPAIRING,
    name: '수리 중',
  },
  {
    id: EquipmentStatus.ETC,
    name: '기타',
  },
];
