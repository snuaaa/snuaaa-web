import EquipmentMain from 'components/Equipment/Main';
import EquipmentRent from 'components/Equipment/Rent';
import { FC } from 'react';
import { Route, Switch } from 'react-router-dom';

const EquipmentPage: FC = () => {
  return (
    <div>
      <h2>장비 대여</h2>
      <Switch>
        <Route path="/equipment/rent/" component={EquipmentRent} />
        <Route path="/equipment/" component={EquipmentMain} />
      </Switch>
    </div>
  );
};

export default EquipmentPage;
