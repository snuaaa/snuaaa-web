import { useCallback } from 'react';
import UserProfile from './UserProfile';
import UserPostList from './UserPostList';
import UserPhotoList from './UserPhotoList';
import UserCommentList from './UserCommentList';
import Tab from './Tab';
import UserService from '~/services/UserService';
import { useFetch } from '~/hooks/useFetch';
import useQueryString from '~/hooks/useQueryString';

type Props = {
  userUuid?: string;
  isMyInfo: boolean;
};

type View = 'posts' | 'photos' | 'comments';

function UserView({ userUuid, isMyInfo }: Props) {
  const queryString = useQueryString();
  const tab = (queryString.get('tab') ?? 'posts') as View;

  const fetchFunction = useCallback(async () => {
    return UserService.retrieveUserInfo(userUuid);
  }, [userUuid]);

  const { data } = useFetch({
    fetch: fetchFunction,
  });

  return (
    <>
      <div className="my-wrapper">
        <div className="my-title-wrapper">
          <h3>{isMyInfo ? 'My' : 'User'} Page</h3>
        </div>
        {data && (
          <>
            <UserProfile userInfo={data.userInfo} isCanEdit={isMyInfo} />
            <Tab
              selected={tab}
              routes={{
                posts: isMyInfo
                  ? '/mypage/info?tab=posts'
                  : `/userpage/${userUuid}?tab=posts`,
                photos: isMyInfo
                  ? '/mypage/info?tab=photos'
                  : `/userpage/${userUuid}?tab=photos`,
                comments: isMyInfo
                  ? '/mypage/info?tab=comments'
                  : `/userpage/${userUuid}?tab=comments`,
              }}
            />
            {
              {
                posts: (
                  <UserPostList
                    userUuid={userUuid ?? data.userInfo.user_uuid} // myInfo일 때는 userUuid가 없으므로 api에서 가져옴
                    isMyInfo={isMyInfo}
                  />
                ),
                photos: (
                  <UserPhotoList
                    userUuid={userUuid ?? data.userInfo.user_uuid}
                    isMyInfo={isMyInfo}
                  />
                ),
                comments: (
                  <UserCommentList
                    userUuid={userUuid ?? data.userInfo.user_uuid}
                    isMyInfo={isMyInfo}
                  />
                ),
              }[tab]
            }
          </>
        )}
      </div>
    </>
  );
}

export default UserView;
