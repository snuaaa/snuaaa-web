const EquipmentStatusEnum = Object.freeze({
  OK: {
    value: 'O',
    toString: () => '양호',
    toColor: () => 'text-green-600',
  },
  BROKEN: {
    value: 'B',
    toString: () => '수리 필요',
    toColor: () => 'text-red-600',
  },
  LOST: {
    value: 'L',
    toString: () => '분실',
    toColor: () => 'text-gray-500',
  },
  REPAIRING: {
    value: 'R',
    toString: () => '수리 중',
    toColor: () => 'text-yellow-600',
  },
  ETC: {
    value: 'E',
    toString: () => '기타',
    toColor: () => 'text-gray-500',
  },

  fromValue: (value: string) => {
    switch (value) {
      case 'O':
        return EquipmentStatusEnum.OK;
      case 'B':
        return EquipmentStatusEnum.BROKEN;
      case 'L':
        return EquipmentStatusEnum.LOST;
      case 'R':
        return EquipmentStatusEnum.REPAIRING;
      case 'E':
        return EquipmentStatusEnum.ETC;
      default:
        return null;
    }
  },
});

const EquipmentStatusOptions = Object.freeze([
  {
    id: EquipmentStatusEnum.OK.value,
    name: '양호',
  },
  {
    id: EquipmentStatusEnum.BROKEN.value,
    name: '수리 필요',
  },
  {
    id: EquipmentStatusEnum.LOST.value,
    name: '분실',
  },
  {
    id: EquipmentStatusEnum.REPAIRING.value,
    name: '수리 중',
  },
  {
    id: EquipmentStatusEnum.ETC.value,
    name: '기타',
  },
]);

export { EquipmentStatusEnum, EquipmentStatusOptions };
