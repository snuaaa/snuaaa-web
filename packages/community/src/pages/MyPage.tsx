import EditMyInfo from '~/components/User/Edit';
import UserView from '~/components/User/View';
import { useParams, useSearch } from '@tanstack/react-router';

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
    </div>
  );
}

export default MyPage;
