import { useContext } from 'react';
import { drawerContext } from './context';

export const useDrawer = () => {
  const context = useContext(drawerContext);
  if (!context) {
    throw new Error('useDrawer must be used within a DrawerProvider');
  }
  return context;
};
