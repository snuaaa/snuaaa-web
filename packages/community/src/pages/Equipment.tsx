import { useState, useEffect } from 'react';
import EquipmentMain from '~/components/Equipment/Main';
import EquipmentRent from '~/components/Equipment/Rent';
import EquipmentAdmin from '~/components/Equipment/Admin';
import { FC } from 'react';
import { Route, Switch } from 'react-router-dom';
import { EquipmentCategoryContext } from '~/contexts/EquipmentCategoryContext';
import { useAuth } from '~/contexts/auth';
import EquipmentService from '~/services/EquipmentService';
import { EquipmentCategory } from '~/services/types';

const EquipmentPage: FC = () => {
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
    <div>
      <EquipmentCategoryContext.Provider
        value={{ categories: equipmentCategories, refreshCategories: fetch }}
      >
        <Switch>
          <Route path="/equipment/rent/" component={EquipmentRent} />
          <Route path="/equipment/admin/" component={EquipmentAdmin} />
          <Route path="/equipment/" component={EquipmentMain} />
        </Switch>
      </EquipmentCategoryContext.Provider>
    </div>
  );
};

export default EquipmentPage;
