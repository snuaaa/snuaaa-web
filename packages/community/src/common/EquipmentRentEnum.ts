const EquipmentRentEnum = Object.freeze({
  RENTABLE: {
    value: 'RENTABLE',
    toString: (option: string) => '바로 대여',
    toString2: (option: string) => '대여 가능',
    toColor: () => 'text-cyan-600 border border-cyan-600',
    toColor2: () => 'bg-cyan-500',
    isAccessible: true,
  },
  RENTED: {
    value: 'RENTED',
    toString: (option: string) => option,
    toString2: (option: string) => option,
    toColor: () => 'text-black bg-gray-200',
    toColor2: () => 'bg-red-400',
    isAccessible: false,
  },
  UNRENTABLE: {
    value: 'UNRENTABLE',
    toString: (option: string) => '대여 불가',
    toString2: (option: string) => '대여 불가',
    toColor: () => 'text-black bg-gray-200',
    toColor2: () => 'bg-yellow-400',
    isAccessible: false,
  },

  fromValue: (value: string) => {
    switch (value) {
      case 'RENTABLE':
        return EquipmentRentEnum.RENTABLE;
      case 'RENTED':
        return EquipmentRentEnum.RENTED;
      case 'UNRENTABLE':
        return EquipmentRentEnum.UNRENTABLE;
      default:
        return null;
    }
  },
});

export default EquipmentRentEnum;
