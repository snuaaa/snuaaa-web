import EditMyInfo from '~/components/User/Edit';
import UserView from '~/components/User/View';
import { useParams } from '@tanstack/react-router';

function MyPage() {
  const { view } = useParams({ from: '/mypage/$view' });

  return (
    <div className="my-page-wrapper">
      {
        {
          info: <UserView isMyInfo />,
          profile: <EditMyInfo />,
        }[view as 'info' | 'profile']
      }
    </div>
  );
}

export default MyPage;
