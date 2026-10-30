import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';

import AdminPage, { AdminTab, AdminTabs } from '~/components/Admin/AdminPage';
import { CountBadge } from '~/components/ui';
import { useAuth } from '~/contexts/auth';
import {
  allRentRecordsQueryOptions,
  useEquipmentList,
} from '~/hooks/queries/useEquipmentQueries';
import { PenaltyStatus } from '~/services/types';
import { EQUIP_ADMIN_GRADE } from '../Rental/rentUtils';

type EquipmentAdminPageProps = {
  tab: 'equipment' | 'fees';
  mobileAction?: ReactNode;
  children: ReactNode;
};

/** 장비 관리 with its 장비 and 연체료 tabs. */
export default function EquipmentAdminPage({
  tab,
  mobileAction,
  children,
}: EquipmentAdminPageProps) {
  const { authInfo } = useAuth();
  const allowed = authInfo.user.grade <= EQUIP_ADMIN_GRADE;
  const { data: equipments } = useEquipmentList();
  const { data: unpaid } = useQuery({
    ...allRentRecordsQueryOptions(
      { penaltyStatus: PenaltyStatus.NEED_PAYMENT },
      1,
    ),
    enabled: allowed,
  });
  const unpaidCount = unpaid?.count ?? 0;

  return (
    <AdminPage
      title="장비 관리"
      allowed={allowed}
      breadcrumb={
        <Link
          to="/equipment"
          className="w-fit text-label font-normal text-fg-muted hover:text-fg"
        >
          ‹ 장비 대여
        </Link>
      }
      mobileAction={mobileAction}
      tabs={
        <AdminTabs label="장비 관리">
          <AdminTab to="/equipment/admin" active={tab === 'equipment'}>
            장비
            {equipments && (
              <span className="hidden text-label font-normal text-fg-muted md:inline">
                {equipments.equipInfo.length}
              </span>
            )}
          </AdminTab>
          <AdminTab to="/equipment/admin/fees" active={tab === 'fees'}>
            연체료
            <CountBadge
              count={unpaidCount}
              aria-label={`미납 ${unpaidCount}건`}
            />
          </AdminTab>
        </AdminTabs>
      }
    >
      {children}
    </AdminPage>
  );
}
