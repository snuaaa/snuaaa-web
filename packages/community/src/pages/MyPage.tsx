import EditMyInfo from '~/components/MyPage/EditMyInfo';
import UserInfo from '~/components/MyPage/UserInfo';
import { useParams } from 'react-router';

function MyPage() {
  const params = useParams<{ index: string }>();

  const renderComponent = function () {
    if (params.index === 'profile') return <EditMyInfo />;
    else if (params.index === 'info') return <UserInfo isMyinfo={true} />;
    else return <UserInfo isMyinfo={true} />;
  };

  return <div className="my-page-wrapper">{renderComponent()}</div>;
}

export default MyPage;
