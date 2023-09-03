import React, { lazy } from 'react';
import { Route, RouteProps, Switch, useLocation } from 'react-router-dom';
import Header from '../containers/Header';
import Footer from '../components/Footer';
import SideBar from '../components/Home/SideBar';
import RiseSet from '../components/Home/RiseSet';
import TopUpButton from '../components/Common/TopUpButton';

// Don't load lazy. scroll is reset when initial loading.
import Photo from '../components/Photo/Photo';
import ExhibitPhoto from '../components/ExhibitPhoto/ExhibitPhoto';
import { Location } from 'history';

const Home = lazy(() => import('../components/Home/Home'));
const About = lazy(() => import('../components/About/About'));
const Board = lazy(() => import('../components/Board/Board'));
const Post = lazy(() => import('../components/Post/Post'));
const Album = lazy(() => import('../components/Album/Album'));
const Docu = lazy(() => import('../components/Document/Document'));
const Exhibition = lazy(() => import('../components/Exhibition/Exhibition'));

const MyPage = lazy(() => import('../components/MyPage/MyPage'));
const UserPage = lazy(() => import('../components/UserPage/UserPage'));
const AllPosts = lazy(() => import('../components/AllPosts/AllPosts'));
const AllComments = lazy(() => import('../components/AllComments/AllComments'));
const MightyCalculator = lazy(() => import('../components/MightyCalculator/MightyCalculator'));
const MgtUser = lazy(() => import('../components/MgtUser/MgtUser'));


type LocationState = {
    background: Location,
    modal: boolean,
    backgroundLocation: Location
}

function PageRoutes() {

  const location = useLocation<LocationState>();

  let background: Location = location.state && location.state.background
    ? location.state.background
    : { pathname: '/', search: '', key: '', hash: '', state: '' };
  let isModal = false;

  if ((location.state && location.state.modal)
        || location.pathname.includes('/photo/')
        || location.pathname.includes('/exhibitPhoto/')) {
    background = location.state && location.state.backgroundLocation
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
            <Route path="/mgt/user" component={MgtUser} />
            <Route component={Home} />
          </Switch>
          {
            isModal &&
                        <Switch>
                          <Route path="/photo/:photo_id" component={Photo} />
                          <Route path="/exhibitPhoto/:exhibitPhoto_id" component={ExhibitPhoto} />
                        </Switch>
          }
        </section>
      </div>
      <TopUpButton />
      <Footer />

    </>
  );
}

export default PageRoutes;
