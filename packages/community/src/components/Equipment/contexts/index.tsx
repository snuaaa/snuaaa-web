import { useFetch } from 'hooks/useFetch';
import React, {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useContext } from 'react';
import EquipmentService, {
  RetrieveEquipmentListResponse,
} from 'services/EquipmentService';
import { Equipment } from 'services/types';

type EquipmentContextState = {
  data?: RetrieveEquipmentListResponse;
  cart: Equipment[];
  refresh: () => Promise<void>;
  addToCart: (equipment: Equipment) => void;
  removeFromCart: (equipment: Equipment) => void;
  rentSingleEquipment: (equipment: Equipment) => Promise<void>;
  rentAllEquipment: () => Promise<void>;
};

const EquipmentContext = React.createContext<EquipmentContextState | null>(
  null,
);

export const EquipmentProvider = ({ children }: PropsWithChildren) => {
  const fetchFunction = useCallback(() => {
    return EquipmentService.retrieveList(1);
  }, []);

  const { data, refresh } = useFetch({
    fetch: fetchFunction,
  });
  const [cart, setCart] = useState<Equipment[]>([]);

  const addToCart = useCallback((equipment: Equipment) => {
    setCart((cart) => [...cart, equipment]);
  }, []);

  const removeFromCart = useCallback((equipment: Equipment) => {
    setCart((cart) =>
      cart.filter((equip: Equipment) => equip.id !== equipment.id),
    );
  }, []);

  const rentSingleEquipment = useCallback(
    async (equipment: Equipment) => {
      await EquipmentService.rentEquipments({
        equipmentIds: [equipment.id],
      });
      removeFromCart(equipment);
      await refresh();
    },
    [refresh, removeFromCart],
  );

  const rentAllEquipment = useCallback(async () => {
    await EquipmentService.rentEquipments({
      equipmentIds: cart.map((equip) => equip.id),
    });
    setCart([]);
    await refresh();
  }, [cart, refresh]);

  const equipmentContextValue: EquipmentContextState = useMemo(
    () => ({
      data,
      cart,
      refresh,
      addToCart,
      removeFromCart,
      rentSingleEquipment,
      rentAllEquipment,
    }),
    [
      addToCart,
      cart,
      data,
      refresh,
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

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height,
  };
}

export default function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions(),
  );

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowDimensions;
}
