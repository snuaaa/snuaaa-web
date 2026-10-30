import { useState } from 'react';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { ChevronLeft } from 'lucide-react';

import { useAuth } from '~/contexts/auth';
import { ViewportSize, useViewportSize } from '~/contexts/viewportSize';
import { CartBar } from './Rental/CartPanel';
import DesktopRental from './Rental/DesktopRental';
import RentCatalog from './Rental/RentCatalog';
import RentConfirmSheet from './Rental/RentConfirmSheet';
import { EQUIP_ADMIN_GRADE, RentFilter } from './Rental/rentUtils';
import useRentCart from './Rental/useRentCart';

/** 장비 빌리기: pick items into the cart, then rent them together. */
export default function EquipmentRent() {
  const viewport = useViewportSize();
  const { authInfo } = useAuth();
  const filter = useSearch({ from: '/equipment/rent' });
  const navigate = useNavigate({ from: '/equipment/rent' });
  const cart = useRentCart();
  const [confirming, setConfirming] = useState(false);

  const setFilter = (next: RentFilter) =>
    navigate({ search: next, replace: true });

  if (viewport === ViewportSize.Desktop) {
    return (
      <DesktopRental
        filter={filter}
        onFilterChange={setFilter}
        isAdmin={authInfo.user.grade <= EQUIP_ADMIN_GRADE}
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col pb-36">
      <RentCatalog
        filter={filter}
        onFilterChange={setFilter}
        cart={cart}
        backButton={
          <Link
            to="/equipment"
            aria-label="뒤로"
            className="flex size-11 shrink-0 items-center justify-center"
          >
            <ChevronLeft className="size-[22px]" />
          </Link>
        }
      />
      <CartBar cart={cart} onRent={() => setConfirming(true)} />
      <RentConfirmSheet
        open={confirming}
        items={cart.cart}
        onClose={() => setConfirming(false)}
        onRented={cart.remove}
        onDone={() => navigate({ to: '/equipment' })}
      />
    </div>
  );
}
