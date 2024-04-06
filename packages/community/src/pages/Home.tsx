import { useCallback } from 'react';
import SoundBox from 'components/Home/SoundBox';
import Loading from 'components/Common/Loading';
import NewPosts from 'components/Home/NewPosts';
import NewComments from 'components/Home/NewComments';
import NewPhotos from 'components/Home/NewPhotos';
import NewExhibitions from 'components/Home/NewExhibitions';
import RiseSetMobile from 'components/Home/RiseSetMobile';
import ExtLinkMobile from 'components/Home/ExtLinkMobile';
import HomeService from 'services/HomeService';
import NewAlbums from 'components/Home/NewAlbums';
import ExhibitionService from 'services/ExhibitionService';
import { useFetch } from 'hooks/useFetch';

function Home() {
  const fetchFunction = useCallback(async () => {
    const res = await Promise.all([
      HomeService.retrieveSoundBox(),
      HomeService.retrieveRecentPosts(),
      HomeService.retrieveRecentComments(),
      HomeService.retrieveRecentMemory(),
      HomeService.retrieveRecentAstroPhoto(),
      ExhibitionService.retrieveExhibitionsInBoard('brd'),
    ]);

    return {
      soundBoxData: res[0],
      recentPosts: res[1],
      recentComments: res[2],
      recentMemory: res[3],
      recentAstroPhoto: res[4],
      recentExhibitions: res[5],
    };
  }, []);

  const { data: homeData } = useFetch({ fetch: fetchFunction });

  if (!homeData) {
    return <Loading />;
  }

  return (
    <div className="home-wrapper">
      <SoundBox soundBoxInfo={homeData.soundBoxData} />
      <div className="home-row-mobile">
        <RiseSetMobile />
        <ExtLinkMobile />
      </div>
      <div className="home-row">
        <NewPosts posts={homeData.recentPosts} />
        <NewComments comments={homeData.recentComments} />
      </div>
      <div className="home-row">
        <NewPhotos
          title="New 별사진"
          board_id="brd32"
          photos={homeData.recentAstroPhoto}
        />
        <NewAlbums
          title="New 추억만들기"
          board_id="brd31"
          albums={homeData.recentMemory}
        />
      </div>
      <div className="home-row">
        <NewExhibitions
          board_id="brd41"
          exhibitions={homeData.recentExhibitions}
        />
      </div>
    </div>
  );
}

export default Home;
