import { useState } from 'react';
import { useMyRentList } from '~/hooks/queries/useEquipmentQueries';
import { Equipment } from '~/services/types';
import { RENT_LIMIT } from './rentUtils';

/** The items picked to rent together, kept under the per-member limit. */
export default function useRentCart() {
  const { data: myRents } = useMyRentList();
  const [cart, setCart] = useState<Equipment[]>([]);

  const renting = myRents?.length ?? 0;
  const remaining = Math.max(0, RENT_LIMIT - renting - cart.length);
  const has = (equip: Equipment) => cart.some((item) => item.id === equip.id);

  const toggle = (equip: Equipment) => {
    if (has(equip)) {
      setCart((prev) => prev.filter((item) => item.id !== equip.id));
    } else if (remaining > 0) {
      setCart((prev) => [...prev, equip]);
    }
  };

  return {
    cart,
    has,
    toggle,
    remaining,
    clear: () => setCart([]),
  };
}

export type RentCart = ReturnType<typeof useRentCart>;
