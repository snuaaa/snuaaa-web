import { useParams, useSearch } from '@tanstack/react-router';
import PasswordForm from '~/components/User/Edit/PasswordForm';
import ProfileForm from '~/components/User/Edit/ProfileForm';
import UserView from '~/components/User/View';

function MyPage() {
  const { view } = useParams({ from: '/mypage/$view' });
  const { tab, page } = useSearch({ from: '/mypage/$view' });

  if (view === 'profile') return <ProfileForm />;
  if (view === 'password') return <PasswordForm />;
  return <UserView isMyInfo tab={tab ?? 'posts'} page={page ?? 1} />;
}

export default MyPage;
