import React from 'react';
import { EquipmentCategory } from '~/services/types';

const EquipmentCategoryContext = React.createContext<{
  categories: EquipmentCategory[];
  refreshCategories: () => void;
   
}>({ categories: [], refreshCategories: () => {} });

export { EquipmentCategoryContext };
