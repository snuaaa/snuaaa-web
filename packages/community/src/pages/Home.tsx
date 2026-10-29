import Loading from '~/components/Common/Loading';
import {
  EquipmentCard,
  QuickLinks,
  RecentAlbumsSection,
  RecentPhotosSection,
  RecentPostsCard,
  SoundBoxCard,
} from '~/components/Home/HomeSections';
import { TonightCard, TonightStrip } from '~/components/Home/Tonight';
import BrandMark from '~/components/Layout/BrandMark';
import { EQUIPMENT_GRADE } from '~/components/Layout/constants';
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
        <div className="flex min-h-11 items-center">
          <BrandMark />
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
            <RecentAlbumsSection albums={homeData.recentMemory} />
            <RecentPhotosSection photos={homeData.recentAstroPhoto} />
          </div>
          <div className="flex flex-col gap-5">
            <div className="hidden md:block">
              <TonightCard />
            </div>
            {canRent && <EquipmentCard />}
            <QuickLinks />
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
