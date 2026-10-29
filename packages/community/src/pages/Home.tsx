import { ExternalLink } from 'lucide-react';
import Loading from '~/components/Common/Loading';
import {
  RecentAlbumsSection,
  RecentPhotosSection,
  RecentPostsCard,
  SoundBoxCard,
} from '~/components/Home/HomeSections';
import { TonightCard, TonightStrip } from '~/components/Home/Tonight';
import BrandMark from '~/components/Layout/BrandMark';
import { CLUB_INTRO_URL } from '~/components/Layout/constants';
import { useHomeData } from '~/hooks/queries/useHomeQueries';

function Home() {
  const { data: homeData } = useHomeData();

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

      {/* Desktop band under the top nav: 소리통 beside tonight's sky. */}
      <div className="hidden border-t border-navy-800 bg-surface-brand md:block">
        <div className="mx-auto grid max-w-[1080px] grid-cols-2 items-stretch lg:grid-cols-[minmax(0,1fr)_520px] gap-5 px-6 pt-6 pb-7">
          <SoundBoxCard soundBox={homeData?.soundBoxData} brand />
          <TonightCard />
        </div>
      </div>

      {!homeData ? (
        <Loading />
      ) : (
        <div className="mx-auto flex w-full max-w-[1080px] flex-col gap-5 px-4 py-5 md:gap-7 md:px-6 md:py-7">
          <div className="md:hidden">
            <SoundBoxCard soundBox={homeData.soundBoxData} />
          </div>
          <div className="grid gap-5 md:grid-cols-2 md:gap-6">
            <RecentPostsCard posts={homeData.recentPosts} />
            <RecentPhotosSection photos={homeData.recentAstroPhoto} />
          </div>
          <RecentAlbumsSection albums={homeData.recentMemory} />
        </div>
      )}
    </div>
  );
}

export default Home;
