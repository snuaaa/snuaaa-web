import React from 'react';
import { Equipment } from 'services/types';

type EquipListProps = {
  equipments: Equipment[];
};

const EquipList: React.FC<EquipListProps> = ({ equipments }) => {
  return (
    <div>
      <h1>Equipment List</h1>
      <ul>{/* Add your equipment items here */}</ul>
    </div>
  );
};

export default EquipList;
