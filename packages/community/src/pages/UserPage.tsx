import { useParams, useSearch } from '@tanstack/react-router';
import UserView from '~/components/User/View';

function UserPage() {
  const params = useParams({ from: '/userpage/$uuid' });
  const { tab, page } = useSearch({ from: '/userpage/$uuid' });

  return (
    <UserView
      userUuid={params.uuid}
      isMyInfo={false}
      tab={tab ?? 'posts'}
      page={page ?? 1}
    />
  );
}

export default UserPage;
