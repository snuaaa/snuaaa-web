import React, {
  PropsWithChildren,
  useCallback,
  useMemo,
  useState,
} from 'react';

import { useContext } from 'react';
import { RetrieveEquipmentListResponse } from '~/services/EquipmentService';
import { Equipment } from '~/services/types';
import {
  useEquipmentList,
  useRentEquipments,
} from '~/hooks/queries/useEquipmentQueries';

type EquipmentContextState = {
  data?: RetrieveEquipmentListResponse;
  cart: Equipment[];
  addToCart: (equipment: Equipment) => void;
  removeFromCart: (equipment: Equipment) => void;
  rentSingleEquipment: (equipment: Equipment) => Promise<void>;
  rentAllEquipment: () => Promise<void>;
};

const EquipmentContext = React.createContext<EquipmentContextState | null>(
  null,
);

export const EquipmentProvider = ({ children }: PropsWithChildren) => {
  const { data } = useEquipmentList();
  const [cart, setCart] = useState<Equipment[]>([]);

  const addToCart = useCallback((equipment: Equipment) => {
    setCart((cart) => [...cart, equipment]);
  }, []);

  const removeFromCart = useCallback((equipment: Equipment) => {
    setCart((cart) =>
      cart.filter((equip: Equipment) => equip.id !== equipment.id),
    );
  }, []);

  const { mutateAsync: mutateRentEquipments } = useRentEquipments();

  const rentSingleEquipment = useCallback(
    async (equipment: Equipment) => {
      try {
        await mutateRentEquipments({
          equipmentIds: [equipment.id],
        });
      } catch (e) {
        alert('대여 권한이 없습니다!');
        console.error(e);
      }
      removeFromCart(equipment);
    },
    [removeFromCart, mutateRentEquipments],
  );

  const rentAllEquipment = useCallback(async () => {
    try {
      await mutateRentEquipments({
        equipmentIds: cart.map((equip) => equip.id),
      });
    } catch (e) {
      alert('대여 권한이 없습니다!');
      console.error(e);
    }
    setCart([]);
  }, [cart, mutateRentEquipments]);

  const equipmentContextValue: EquipmentContextState = useMemo(
    () => ({
      data,
      cart,
      addToCart,
      removeFromCart,
      rentSingleEquipment,
      rentAllEquipment,
    }),
    [
      addToCart,
      cart,
      data,
      removeFromCart,
      rentAllEquipment,
      rentSingleEquipment,
    ],
  );

  return (
    <EquipmentContext.Provider value={equipmentContextValue}>
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
