import React, { PropsWithChildren, useContext } from 'react';

import { RetrieveEquipmentListResponse } from '~/services/EquipmentService';
import { useEquipmentList } from '~/hooks/queries/useEquipmentQueries';

// Only the admin page uses this now; 장비 빌리기 keeps its cart in
// Rental/useRentCart.
type EquipmentContextState = {
  data?: RetrieveEquipmentListResponse;
};

const EquipmentContext = React.createContext<EquipmentContextState | null>(
  null,
);

export const EquipmentProvider = ({ children }: PropsWithChildren) => {
  const { data } = useEquipmentList();

  return (
    <EquipmentContext.Provider value={{ data }}>
      {children}
    </EquipmentContext.Provider>
  );
};

export const useEquipment = () => {
  const context = useContext(EquipmentContext);

  if (!context) {
    throw new Error('useEquipment must be used within a EquipmentProvider');
  }

  return context;
};

export const withEquipment = <T extends NonNullable<unknown>>(
  Component: React.FC<T>,
) => {
  return (props: T) => {
    return (
      <EquipmentProvider>
        <Component {...props} />
      </EquipmentProvider>
    );
  };
};
