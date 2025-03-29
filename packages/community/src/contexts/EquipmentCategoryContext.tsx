import React from 'react';
import { EquipmentCategory } from '~/services/types';

const EquipmentCategoryContext = React.createContext<{
  categories: EquipmentCategory[];
  refreshCategories: () => void;
  // eslint-disable-next-line @typescript-eslint/no-empty-function
}>({ categories: [], refreshCategories: () => {} });

export { EquipmentCategoryContext };
