import { useParams } from 'react-router';
import UserView from '~/components/User/View';

function UserPage() {
  const params = useParams<{ uuid: string }>();

  return (
    <div className="my-page-wrapper">
      <UserView userUuid={params.uuid} isMyInfo={false} />
    </div>
  );
}

export default UserPage;
