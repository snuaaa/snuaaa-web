import Loading from '~/components/Common/Loading';
import SoundBox from '~/components/Home/SoundBox';
import NewPosts from '~/components/Home/NewPosts';
import NewComments from '~/components/Home/NewComments';
import NewPhotos from '~/components/Home/NewPhotos';
import NewExhibitions from '~/components/Home/NewExhibitions';
import NewAlbums from '~/components/Home/NewAlbums';
import AstroInfo from '~/components/Home/AstroInfo';
import QuickLinks from '~/components/Home/QuickLinks';
import { useHomeData } from '~/hooks/queries/useHomeQueries';

function Home() {
  const { data: homeData } = useHomeData();

  if (!homeData) {
    return <Loading />;
  }

  return (
    <div className="flex-1">
      {/* ── Section 1: Dark — Notice + Astro Info ── */}
      <div className="bg-gradient-to-b from-primary-900 via-primary-800 to-primary-700">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <SoundBox soundBoxInfo={homeData.soundBoxData} />
            </div>
            <div className="flex flex-col gap-4">
              <AstroInfo />
              <QuickLinks />
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 2: Light — New Posts + New Comments ── */}
      <div className="bg-primary-50">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <NewPosts posts={homeData.recentPosts} />
            <NewComments comments={homeData.recentComments} />
          </div>
        </div>
      </div>

      {/* ── Section 3: Dark — Star Photos ── */}
      <div className="bg-gradient-to-b from-primary-800 to-primary-700">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 md:py-12">
          <NewPhotos
            title="New 별사진"
            board_id="brd32"
            photos={homeData.recentAstroPhoto}
          />
        </div>
      </div>

      {/* ── Section 4: Light — Albums ── */}
      <div className="bg-primary-50">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 md:py-12">
          <NewAlbums
            title="New 추억만들기"
            board_id="brd31"
            albums={homeData.recentMemory}
          />
        </div>
      </div>

      {/* ── Section 5: Dark — Exhibitions ── */}
      <div className="bg-gradient-to-b from-primary-700 to-primary-900">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 md:py-12">
          <NewExhibitions
            board_id="brd41"
            exhibitions={homeData.recentExhibitions}
          />
        </div>
      </div>
    </div>
  );
}

export default Home;
