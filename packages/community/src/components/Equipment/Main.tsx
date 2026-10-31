import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ChevronRight, Telescope } from 'lucide-react';

import { useAuth } from '~/contexts/auth';
import { ViewportSize, useViewportSize } from '~/contexts/viewportSize';
import { useMyRentList } from '~/hooks/queries/useEquipmentQueries';
import DesktopRental from './Rental/DesktopRental';
import MyRents from './Rental/MyRents';
import RentRules from './Rental/RentRules';
import { EQUIP_ADMIN_GRADE, RENT_LIMIT, RentFilter } from './Rental/rentUtils';

/** 장비 탭: what I've borrowed, then 장비 빌리기 and the rules. */
function MobileHome({ isAdmin }: { isAdmin: boolean }) {
  const { data: rents, isLoading } = useMyRentList();

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col gap-3.5 bg-surface-brand pt-[max(0.5rem,env(safe-area-inset-top))] pr-2 pb-5 pl-5 text-fg-on-brand">
        <div className="flex min-h-11 items-center justify-between">
          <h1 className="text-title">장비 대여</h1>
          {isAdmin && (
            <Link
              to="/equipment/admin"
              className="flex h-9 items-center gap-1 rounded-full bg-surface-brand-raised px-3 text-label"
            >
              장비 관리
              <ChevronRight className="size-3.5" aria-hidden />
            </Link>
          )}
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-[32px] font-bold tracking-[-0.5px]">
            {rents?.length ?? 0}
          </span>
          <span className="text-sm text-fg-on-brand-muted">
            / {RENT_LIMIT}개 대여 중
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-2.5">
          <h2 className="px-0.5 text-heading">빌린 장비</h2>
          <MyRents rents={rents} isLoading={isLoading} />
        </div>
        <Link
          to="/equipment/rent"
          className="flex h-14 items-center justify-center gap-2 rounded-lg bg-accent text-base font-bold text-navy-900"
        >
          <Telescope className="size-5" aria-hidden />
          장비 빌리기
        </Link>
        <RentRules />
      </div>
    </div>
  );
}

export default function EquipmentMain() {
  const viewport = useViewportSize();
  const { authInfo } = useAuth();
  const isAdmin = authInfo.user.grade <= EQUIP_ADMIN_GRADE;
  // Desktop shows the catalogue here too; its filters stay in this page.
  const [filter, setFilter] = useState<RentFilter>({});

  return viewport === ViewportSize.Desktop ? (
    <DesktopRental
      filter={filter}
      onFilterChange={setFilter}
      isAdmin={isAdmin}
    />
  ) : (
    <MobileHome isAdmin={isAdmin} />
  );
}
