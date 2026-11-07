import Loading from '~/components/Common/Loading';
import {
  RecentAlbumsSection,
  RecentPhotosSection,
  RecentPostsCard,
  SoundBoxCard,
} from '~/components/Home/HomeSections';
import { SkyBackdrop, SkyConstellation } from '~/components/Home/Sky';
import { skyStyle } from '~/components/Home/skyColors';
import { TonightCard, TonightStrip } from '~/components/Home/Tonight';
import BrandMark from '~/components/Layout/BrandMark';
import ObservationToggle from '~/components/Layout/ObservationToggle';
import { useHomeData } from '~/hooks/queries/useHomeQueries';
import { useSky } from '~/hooks/useSky';

function Home() {
  const { data: homeData } = useHomeData();
  const sky = useSky();

  return (
    <div className="flex flex-col text-fg">
      <header
        className="relative isolate flex flex-col gap-3 overflow-hidden bg-surface-brand px-4 pt-safe-3 pb-4 md:hidden"
        style={skyStyle(sky)}
      >
        <SkyBackdrop sky={sky} />
        {/* Between the club name and the 관측 모드 toggle */}
        <SkyConstellation
          sky={sky}
          className="top-[calc(env(safe-area-inset-top)+4px)] right-16 h-14"
        />
        <div className="flex min-h-11 items-center justify-between gap-3">
          <BrandMark />
          {/* 동아리 소개 is in the footer, so this corner holds 관측 모드. */}
          <ObservationToggle className="-mr-2.5" />
        </div>
        <TonightStrip />
      </header>

      {/* Desktop band: 소리통 beside tonight's sky. It runs up under the top
          nav, which is see-through over it, so both share one sky. */}
      <div
        className="relative isolate hidden overflow-hidden bg-surface-brand md:-mt-16 md:block md:pt-16"
        style={skyStyle(sky)}
      >
        <SkyBackdrop sky={sky} />
        {/* In the top nav's empty stretch, left of 관측 모드 and the avatar */}
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto hidden h-16 max-w-page lg:block">
          <SkyConstellation sky={sky} className="top-1.5 right-44 h-[52px]" />
        </div>
        <div className="mx-auto grid max-w-page grid-cols-2 items-stretch lg:grid-cols-[minmax(0,1fr)_520px] gap-5 px-6 pt-6 pb-7">
          <SoundBoxCard soundBox={homeData?.soundBoxData} brand />
          <TonightCard sky={sky} />
        </div>
      </div>

      {!homeData ? (
        <Loading />
      ) : (
        <div className="mx-auto flex w-full max-w-page flex-col gap-5 px-4 py-5 md:gap-7 md:px-6 md:py-7">
          <div className="md:hidden">
            <SoundBoxCard soundBox={homeData.soundBoxData} />
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
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
