import { Link, useParams, useSearch } from '@tanstack/react-router';
import EditMyInfo from '~/components/User/Edit';
import UserView from '~/components/User/View';
import { canManageUsers } from '~/components/Layout/constants';
import { Button } from '~/components/ui';
import { useAuth } from '~/contexts/auth';

/**
 * Mobile has no profile menu in the header, so logout and 회원 관리 sit here
 * until the profile edit screen gets them (redesign PR 7).
 */
function MobileAccountActions() {
  const { authInfo, authLogout } = useAuth();
  return (
    <div className="flex gap-2 px-4 py-6 md:hidden">
      {canManageUsers(authInfo.user.grade) && (
        <Button asChild variant="secondary" className="flex-1">
          <Link to="/admin/user">회원 관리</Link>
        </Button>
      )}
      <Button
        variant="secondary"
        className="flex-1"
        onClick={() => authLogout?.()}
      >
        로그아웃
      </Button>
    </div>
  );
}

function MyPage() {
  const { view } = useParams({ from: '/mypage/$view' });
  const { tab, page } = useSearch({ from: '/mypage/$view' });

  return (
    <div className="my-page-wrapper">
      {
        {
          info: <UserView isMyInfo tab={tab ?? 'posts'} page={page ?? 1} />,
          profile: <EditMyInfo />,
        }[view as 'info' | 'profile']
      }
      {view === 'info' && <MobileAccountActions />}
    </div>
  );
}

export default MyPage;
