import Loading from '~/components/Common/Loading';
import { useMyUserInfo } from '~/hooks/queries/useUserQueries';
import ProfileForm from './ProfileForm';

function EditProfile() {
  const { data: myUserData, isLoading } = useMyUserInfo();

  if (isLoading) {
    return <Loading />;
  }

  if (!myUserData) {
    return <div>유저 정보를 불러오지 못했습니다.</div>;
  }

  return <ProfileForm user={myUserData.userInfo} />;
}

export default EditProfile;
