import React from 'react';
import EditMyInfo from './EditMyInfo';
import UserInfo from './UserInfo';
import { useParams } from 'react-router';

const TAG = 'MYPAGE';

function MyPage() {

  const params = useParams<{index: string}>();

  const renderComponent = function() {
    if (params.index === 'profile') return (<EditMyInfo />);
    else if (params.index === 'info') return (<UserInfo isMyinfo={true} />);
    else return <UserInfo isMyinfo={true} />;
  };

  console.log('[%s] render..', TAG);
  return (
    <div className="my-page-wrapper">
      {renderComponent()}
    </div>
  );
}

export default MyPage;
