import React from 'react';
import { EquipmentCategory } from 'services/types';

type EquipmentCategories = EquipmentCategory[];

const EquipmentCategoryContext =
  React.createContext<EquipmentCategories | null>(null);

export { EquipmentCategoryContext };
export type { EquipmentCategories };
