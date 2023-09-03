import React from 'react';
import { useParams } from 'react-router';
import UserInfo from '../MyPage/UserInfo';

const TAG = 'USERPAGE';

function UserPage() {
  const params = useParams<{ uuid: string }>();

  return (
    <div className="my-page-wrapper">
      <UserInfo user_uuid={params.uuid} isMyinfo={false} />
    </div>
  );
}

export default UserPage;
