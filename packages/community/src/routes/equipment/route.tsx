import { createFileRoute, Outlet } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { EquipmentCategoryContext } from '~/contexts/EquipmentCategoryContext';
import { useAuth } from '~/contexts/auth';
import EquipmentService from '~/services/EquipmentService';
import { EquipmentCategory } from '~/services/types';

export const Route = createFileRoute('/equipment')({
  component: EquipmentLayout,
});

function EquipmentLayout() {
  const [equipmentCategories, setEquipmentCategories] = useState<
    EquipmentCategory[]
  >([]);
  const authContext = useAuth();

  useEffect(() => {
    if (authContext.authInfo.isLoggedIn) {
      fetch();
    }
  }, [authContext.authInfo]);

  const fetch = async () => {
    try {
      const categoryRes = await EquipmentService.retrieveCategoryList();
      setEquipmentCategories(categoryRes);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <EquipmentCategoryContext.Provider
      value={{ categories: equipmentCategories, refreshCategories: fetch }}
    >
      <Outlet />
    </EquipmentCategoryContext.Provider>
  );
}
