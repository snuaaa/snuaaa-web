import { lazy, Suspense, useState, useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';

import RiseSetContext from '../contexts/RiseSetContext';
import HomeService, { RiseSet } from '../services/HomeService';
import Loading from 'components/Common/Loading';
import { useAuth } from 'contexts/auth';

const AuthRoutes = lazy(() => import('./AuthRoutes'));
const PageRoutes = lazy(() => import('./PageRoutes'));

const defaultRiseSet: RiseSet = {
  aste: 0,
  astm: 0,
  lunAge: 0,
  moonrise: 0,
  moonset: 0,
  sunrise: 0,
  sunset: 0,
};

function Router() {
  const [riseSetInfo, setRiseSetInfo] = useState<RiseSet>(defaultRiseSet);
  const authContext = useAuth();

  useEffect(() => {
    if (authContext.authInfo.isLoggedIn) {
      fetch();
    }
  }, [authContext.authInfo]);

  const fetch = async () => {
    try {
      const riseSetRes = await HomeService.retrieveRiseSet();
      setRiseSetInfo(riseSetRes);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <RiseSetContext.Provider value={riseSetInfo}>
      <Suspense fallback={<Loading />}>
        <Switch>
          <Route path="/auth/" component={AuthRoutes} />
          {authContext.authInfo.isLoggedIn && (
            <Route path="/" component={PageRoutes} />
          )}
        </Switch>
      </Suspense>
    </RiseSetContext.Provider>
  );
}

export default Router;
