const EquipmentStatusEnum = Object.freeze({
  OK: 'O',
  BROKEN: 'B',
  LOST: 'L',
  REPAIRING: 'R',
  ETC: 'E',
});

const EquipmentStatusOptions = Object.freeze([
  {
    id: EquipmentStatusEnum.OK,
    name: '양호',
  },
  {
    id: EquipmentStatusEnum.BROKEN,
    name: '수리 필요',
  },
  {
    id: EquipmentStatusEnum.LOST,
    name: '분실',
  },
  {
    id: EquipmentStatusEnum.REPAIRING,
    name: '수리 중',
  },
  {
    id: EquipmentStatusEnum.ETC,
    name: '기타',
  },
]);

export { EquipmentStatusEnum, EquipmentStatusOptions };
