import { UserX } from 'lucide-react';

import Skeleton from '~/components/Common/Skeleton';
import { useUserInfo } from '~/hooks/queries/useUserQueries';
import ActivityList, { type ActivityTab } from './ActivityList';
import ProfileCard, { BackButton } from './ProfileCard';

type Props = {
  /** Leave out for 마이페이지. */
  userUuid?: string;
  isMyInfo: boolean;
  tab: ActivityTab;
  page: number;
};

function ProfileSkeleton() {
  return (
    <div
      aria-hidden
      className="flex flex-col gap-4 bg-surface-brand px-4 pt-16 pb-6 md:rounded-xl md:px-6 md:pt-7"
    >
      <div className="flex items-center gap-4 md:flex-col">
        <Skeleton className="size-20 rounded-full bg-navy-800 md:size-26" />
        <div className="flex flex-col gap-2 md:items-center">
          <Skeleton className="h-6 w-28 bg-navy-800" />
          <Skeleton className="h-4 w-20 bg-navy-800" />
        </div>
      </div>
    </div>
  );
}

function UnavailableUser({ deleted }: { deleted: boolean }) {
  return (
    <div className="flex flex-1 flex-col bg-surface md:rounded-xl md:shadow-sm">
      <div className="px-1 pt-[max(0.5rem,env(safe-area-inset-top))] md:hidden">
        <BackButton />
      </div>
      <div className="flex flex-col items-center gap-2.5 px-4 pt-24 pb-28 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
          <UserX className="size-7" aria-hidden />
        </span>
        <h1 className="text-heading">
          {deleted ? '탈퇴한 회원이에요' : '회원 정보를 불러오지 못했어요'}
        </h1>
        <p className="text-label font-normal text-fg-muted">
          {deleted
            ? '남긴 글과 댓글은 그대로 보여요.'
            : '잠시 후 다시 시도해 주세요.'}
        </p>
      </div>
    </div>
  );
}

/** 마이페이지 and 유저페이지: the profile, then the member's posts, photos and comments. */
function UserView({ userUuid, isMyInfo, tab, page }: Props) {
  const { data, isLoading, isError } = useUserInfo(userUuid ?? '');
  const user = data?.userInfo;

  return (
    <div className="mx-auto flex w-full max-w-[1080px] flex-1 flex-col md:grid md:grid-cols-[300px_minmax(0,1fr)] md:items-start md:gap-7 md:px-6 md:py-8">
      {isLoading ? (
        <ProfileSkeleton />
      ) : !user ? (
        // A deleted member comes back as `userInfo: null`.
        <div className="contents md:col-span-2 md:flex md:flex-col">
          <UnavailableUser deleted={!isError} />
        </div>
      ) : (
        <>
          <ProfileCard user={user} isMine={isMyInfo} />
          <ActivityList
            userUuid={userUuid ?? user.user_uuid}
            otherNickname={isMyInfo ? undefined : user.nickname}
            tab={tab}
            page={page}
          />
        </>
      )}
    </div>
  );
}

export default UserView;
