import { useState, useEffect } from 'react';
import SoundBox from 'components/Home/SoundBox';
import Loading from 'components/Common/Loading';
import NewPosts from 'components/Home/NewPosts';
import NewComments from 'components/Home/NewComments';
import NewPhotos from 'components/Home/NewPhotos';
import NewExhibitions from 'components/Home/NewExhibitions';
import RiseSetMobile from 'components/Home/RiseSetMobile';
import ExtLinkMobile from 'components/Home/ExtLinkMobile';
import HomeService, { SoundBoxResponse } from 'services/HomeService';
import { Album, Comment, Content, Exhibition, Photo } from 'services/types';
import NewAlbums from 'components/Home/NewAlbums';
import ExhibitionService from 'services/ExhibitionService';

type HomeInfo = {
  soundBoxData?: SoundBoxResponse;
  recentPosts?: Content[];
  recentComments?: Comment[];
  recentMemory?: Album[];
  recentAstrophoto?: Photo[];
  recentExhibitions?: Exhibition[];
};

function Home() {
  const [homeData, setHomeData] = useState<HomeInfo>();

  useEffect(() => {
    fetch();
  }, []);

  const fetch = async () => {
    await Promise.all([
      HomeService.retrieveSoundBox(),
      HomeService.retrieveRecentPosts(),
      HomeService.retrieveRecentComments(),
      HomeService.retrieveRecentMemory(),
      HomeService.retrieveRecentAstroPhoto(),
      ExhibitionService.retrieveExhibitionsInBoard('brd'),
      // HomeService.retrieveRiseSet()
    ])
      .then((res) => {
        setHomeData({
          soundBoxData: res[0],
          recentPosts: res[1],
          recentComments: res[2],
          recentMemory: res[3],
          recentAstrophoto: res[4],
          recentExhibitions: res[5],
        });
      })
      .catch((err) => {
        console.error(err);
      });
  };

  if (!homeData) {
    return <Loading />;
  }

  return (
    <div className="home-wrapper">
      {homeData.soundBoxData && (
        <SoundBox soundBoxInfo={homeData.soundBoxData} />
      )}
      <div className="home-row-mobile">
        <RiseSetMobile />
        <ExtLinkMobile />
      </div>
      <div className="home-row">
        {homeData.recentPosts && <NewPosts posts={homeData.recentPosts} />}
        {homeData.recentComments && (
          <NewComments comments={homeData.recentComments} />
        )}
      </div>
      <div className="home-row">
        {homeData.recentAstrophoto && (
          <NewPhotos
            title="New 별사진"
            board_id="brd32"
            photos={homeData.recentAstrophoto}
          />
        )}
        {homeData.recentMemory && (
          <NewAlbums
            title="New 추억만들기"
            board_id="brd31"
            albums={homeData.recentMemory}
          />
        )}
      </div>
      <div className="home-row">
        {homeData.recentExhibitions && (
          <NewExhibitions
            board_id="brd41"
            exhibitions={homeData.recentExhibitions}
          />
        )}
      </div>
    </div>
  );
}

export default Home;
