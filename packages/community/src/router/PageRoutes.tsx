import { lazy } from 'react';
import { Route, Switch, useLocation } from 'react-router-dom';

import Header from 'components/Header';
import Footer from '../components/Footer';
import SideBar from '../components/Home/SideBar';
import RiseSet from '../components/Home/RiseSet';
import TopUpButton from '../components/Common/TopUpButton';

// Don't load lazy. scroll is reset when initial loading.
import PhotoPage from 'pages/Photo';
import ExhibitPhoto from 'pages/ExhibitPhoto';
import { Location } from 'history';

const Home = lazy(() => import('pages/Home'));
const About = lazy(() => import('pages/About'));
const Board = lazy(() => import('pages/Board'));
const Post = lazy(() => import('pages/Post'));
const Album = lazy(() => import('pages/Album'));
const Docu = lazy(() => import('pages/Document'));
const Exhibition = lazy(() => import('pages/Exhibition'));

const MyPage = lazy(() => import('pages/MyPage'));
const UserPage = lazy(() => import('pages/UserPage'));
const AllPosts = lazy(() => import('pages/AllPosts'));
const AllComments = lazy(() => import('pages/AllComments'));
const MightyCalculator = lazy(() => import('pages/MightyCalculator'));
const UserManagement = lazy(() => import('pages/UserManagement'));

type LocationState = {
  background: Location;
  modal: boolean;
  backgroundLocation: Location;
};

function PageRoutes() {
  const location = useLocation<LocationState>();

  let background: Location =
    location.state && location.state.background
      ? location.state.background
      : { pathname: '/', search: '', key: '', hash: '', state: '' };
  let isModal = false;

  if (
    (location.state && location.state.modal) ||
    location.pathname.includes('/photo/') ||
    location.pathname.includes('/exhibitPhoto/')
  ) {
    background =
      location.state && location.state.backgroundLocation
        ? location.state.backgroundLocation
        : { pathname: '/', search: '', key: '', hash: '', state: '' };
    isModal = true;
  }

  return (
    <>
      <Header />
      <div className="section-wrapper">
        <section>
          <div className="side-left">
            <RiseSet />
          </div>
          <SideBar />
          <Switch location={isModal ? background : location}>
            <Route exact path="/" component={Home} />
            <Route exact path="/about" component={About} />
            <Route path="/about/:aaa" component={About} />
            <Route path="/board/:board_id" component={Board} />
            <Route path="/post/:post_id" component={Post} />
            <Route path="/album/:album_id" component={Album} />
            <Route path="/document/:doc_id" component={Docu} />
            <Route path="/exhibition/:exhibition_id" component={Exhibition} />
            <Route path="/mypage/:index" component={MyPage} />
            <Route path="/userpage/:uuid" component={UserPage} />
            <Route path="/posts/all" component={AllPosts} />
            <Route path="/comments/all" component={AllComments} />
            <Route path="/mightyCalculator" component={MightyCalculator} />
            <Route path="/mgt/user" component={UserManagement} />
            <Route component={Home} />
          </Switch>
          {isModal && (
            <Switch>
              <Route path="/photo/:photo_id" component={PhotoPage} />
              <Route
                path="/exhibitPhoto/:exhibitPhoto_id"
                component={ExhibitPhoto}
              />
            </Switch>
          )}
        </section>
      </div>
      <TopUpButton />
      <Footer />
    </>
  );
}

export default PageRoutes;
