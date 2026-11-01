import { useState } from 'react';
import { Link } from '@tanstack/react-router';

import { useMyRentList } from '~/hooks/queries/useEquipmentQueries';
import { CartCard } from './CartPanel';
import MyRents from './MyRents';
import RentCatalog from './RentCatalog';
import RentConfirmSheet from './RentConfirmSheet';
import RentRules from './RentRules';
import { RentFilter } from './rentUtils';
import useRentCart from './useRentCart';

type DesktopRentalProps = {
  filter: RentFilter;
  onFilterChange: (next: RentFilter) => void;
  isAdmin: boolean;
};

/** Desktop puts 빌린 장비, the catalogue and the cart on one page. */
export default function DesktopRental({
  filter,
  onFilterChange,
  isAdmin,
}: DesktopRentalProps) {
  const { data: rents, isLoading } = useMyRentList();
  const cart = useRentCart();
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="mx-auto grid w-full max-w-page grid-cols-[minmax(0,1fr)_320px] items-start gap-6 px-6 py-7">
      <div className="flex flex-col gap-[18px]">
        <div className="flex items-end justify-between">
          <h1 className="text-display">장비 대여</h1>
          {isAdmin && (
            <Link
              to="/equipment/admin"
              className="text-label font-normal text-gray-700 hover:text-fg"
            >
              장비 관리 ›
            </Link>
          )}
        </div>
        <MyRents rents={rents} isLoading={isLoading} compact />
        <RentCatalog
          filter={filter}
          onFilterChange={onFilterChange}
          cart={cart}
          desktop
        />
      </div>
      <aside className="sticky top-7 flex flex-col gap-3">
        <CartCard cart={cart} onRent={() => setConfirming(true)} />
        <RentRules compact />
      </aside>
      <RentConfirmSheet
        open={confirming}
        items={cart.cart}
        onClose={() => setConfirming(false)}
        onRented={cart.remove}
        onDone={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      />
    </div>
  );
}
