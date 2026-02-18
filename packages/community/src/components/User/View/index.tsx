import UserProfile from './UserProfile';
import UserPostList from './UserPostList';
import UserPhotoList from './UserPhotoList';
import UserCommentList from './UserCommentList';
import Tab from './Tab';
import { useUserInfo } from '~/hooks/queries/useUserQueries';

type View = 'posts' | 'photos' | 'comments';

type Props = {
  userUuid?: string;
  isMyInfo: boolean;
  tab: View;
  page: number;
};

function UserView({ userUuid, isMyInfo, tab, page }: Props) {
  const { data } = useUserInfo(userUuid ?? '');

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
                    userUuid={userUuid ?? data.userInfo.user_uuid}
                    page={page}
                  />
                ),
                photos: (
                  <UserPhotoList
                    userUuid={userUuid ?? data.userInfo.user_uuid}
                    page={page}
                  />
                ),
                comments: (
                  <UserCommentList
                    userUuid={userUuid ?? data.userInfo.user_uuid}
                    page={page}
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
