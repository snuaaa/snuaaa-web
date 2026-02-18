import { useParams, useSearch } from '@tanstack/react-router';
import UserView from '~/components/User/View';

function UserPage() {
  const params = useParams({ from: '/userpage/$uuid' });
  const { tab, page } = useSearch({ from: '/userpage/$uuid' });

  return (
    <div className="my-page-wrapper">
      <UserView
        userUuid={params.uuid}
        isMyInfo={false}
        tab={tab ?? 'posts'}
        page={page ?? 1}
      />
    </div>
  );
}

export default UserPage;
