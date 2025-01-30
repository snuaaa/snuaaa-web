import { useFetch } from 'hooks/useFetch';
import { FC, useCallback } from 'react';
import EquipmentService from 'services/EquipmentService';

const Rent: FC = () => {
  const fetchFunction = useCallback(() => {
    return EquipmentService.retrieveList();
  }, []);

  const { data, refresh } = useFetch({ fetch: fetchFunction });

  return <div>rent</div>;
};

export default Rent;
