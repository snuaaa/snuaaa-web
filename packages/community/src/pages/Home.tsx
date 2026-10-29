import { ExternalLink } from 'lucide-react';
import Loading from '~/components/Common/Loading';
import {
  EquipmentCard,
  RecentAlbumsSection,
  RecentPhotosSection,
  RecentPostsCard,
  SoundBoxCard,
} from '~/components/Home/HomeSections';
import { TonightCard, TonightStrip } from '~/components/Home/Tonight';
import BrandMark from '~/components/Layout/BrandMark';
import { CLUB_INTRO_URL, EQUIPMENT_GRADE } from '~/components/Layout/constants';
import { useAuth } from '~/contexts/auth';
import { useHomeData } from '~/hooks/queries/useHomeQueries';

function Home() {
  const { data: homeData } = useHomeData();
  const {
    authInfo: {
      user: { grade },
    },
  } = useAuth();
  const canRent = grade <= EQUIPMENT_GRADE;

  return (
    <div className="flex flex-col text-fg">
      <header className="flex flex-col gap-3 bg-surface-brand px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-4 md:hidden">
        <div className="flex min-h-11 items-center justify-between gap-3">
          <BrandMark />
          <a
            href={CLUB_INTRO_URL}
            target="_blank"
            rel="noreferrer"
            className="flex h-11 shrink-0 items-center gap-1 text-label font-normal text-fg-on-brand-muted hover:text-fg-on-brand"
          >
            동아리 소개
            <ExternalLink className="size-3.5" aria-label="새 탭에서 열림" />
          </a>
        </div>
        <TonightStrip />
      </header>

      {!homeData ? (
        <Loading />
      ) : (
        <div className="mx-auto grid w-full max-w-[1080px] gap-5 px-4 py-5 md:grid-cols-[minmax(0,1fr)_340px] md:gap-8 md:px-6 md:py-9">
          <div className="flex flex-col gap-5">
            <SoundBoxCard soundBox={homeData.soundBoxData} />
            <RecentPostsCard posts={homeData.recentPosts} />
            <RecentPhotosSection photos={homeData.recentAstroPhoto} />
            <RecentAlbumsSection albums={homeData.recentMemory} />
          </div>
          <div className="flex flex-col gap-5">
            <div className="hidden md:block">
              <TonightCard />
            </div>
            {canRent && <EquipmentCard />}
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
