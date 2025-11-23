import EditMyInfo from '~/components/User/Edit';
import UserView from '~/components/User/View';
import { useParams } from 'react-router-dom';

function MyPage() {
  const { view = 'info' } = useParams<{ view: 'info' | 'profile' }>();

  return (
    <div className="my-page-wrapper">
      {
        {
          info: <UserView isMyInfo />,
          profile: <EditMyInfo />,
        }[view]
      }
    </div>
  );
}

export default MyPage;
