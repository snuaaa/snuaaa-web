import { useParams } from '@tanstack/react-router';
import UserView from '~/components/User/View';

function UserPage() {
  const params = useParams({ from: '/userpage/$uuid' });

  return (
    <div className="my-page-wrapper">
      <UserView userUuid={params.uuid} isMyInfo={false} />
    </div>
  );
}

export default UserPage;
