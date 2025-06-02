import { createContext } from 'react';

export type DrawerContext = {
  isOpen: boolean;
  onClose: () => void;
};

export const drawerContext = createContext<DrawerContext | null>(null);
