import React, { lazy, Suspense, useState, useEffect, useContext } from 'react';
import { Route, Switch } from 'react-router-dom';

import BoardType from '../types/BoardType';
import BoardService from '../services/BoardService';
import BoardContext from '../contexts/BoardContext';
import RiseSetContext from '../contexts/RiseSetContext';
import AuthContext from '../contexts/AuthContext';
import RiseSetType from '../types/RiseSetType';
import HomeService from '../services/HomeService';

const AuthRoutes = lazy(() => import('./AuthRoutes'));
const PageRoutes = lazy(() => import('./PageRoutes'));

const defaultRiseSet: RiseSetType = {
  aste: 0,
  astm: 0,
  lunAge: 0,
  moonrise: 0,
  moonset: 0,
  sunrise: 0,
  sunset: 0
};

function Section() {

  const [boardsInfo, setBoardsInfo] = useState<BoardType[]>([]);
  const [riseSetInfo, setRiseSetInfo] = useState<RiseSetType>(defaultRiseSet);
  const authContext = useContext(AuthContext);

  useEffect(() => {
    if (authContext.authInfo.isLoggedIn) {
      fetch();
    }
  }, [authContext.authInfo]);

  const fetch = async () => {
    try {
      const boardRes = await BoardService.retrieveBoards();
      setBoardsInfo(boardRes.data);
      const riseSetRes = await HomeService.retrieveRiseSet();
      setRiseSetInfo(riseSetRes.data);
    }
    catch (err) {
      console.error(err);
    }
  };
  return (
    <>
      <BoardContext.Provider value={{ boardsInfo: boardsInfo, setBoardsInfo: setBoardsInfo }}>
        <RiseSetContext.Provider value={riseSetInfo}>
          <Suspense fallback={<div>Loading pages...</div>}>
            <Switch>
              <Route path="/auth/" component={AuthRoutes} />
              <Route path="/" component={PageRoutes} />
            </Switch>
          </Suspense>
        </RiseSetContext.Provider>
      </BoardContext.Provider>
    </>
  );
}

export default Section;
