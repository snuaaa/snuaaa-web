import React, { ChangeEvent, useState, useContext, useEffect } from 'react';

import LogInComponent from './LogInComponent';
import Loading from '../Common/Loading';
import PopUp from '../Common/PopUp';
import FullScreenPortal from '../../containers/FullScreenPortal';
import FindIdPw from './FindIdPw';
import AuthService from '../../services/AuthService';
import AuthContext from '../../contexts/AuthContext';
import { useHistory, Redirect, useLocation } from 'react-router';

type LocationState = {
  accessLocation: string;
};

function LogIn() {
  const [loginInfo, setLoginInfo] = useState({
    id: '',
    password: '',
    autoLogin: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [popUp, setPopUp] = useState(false);
  const [errPopUp, setErrPopUp] = useState(false);
  const [findPopUp, setFindPopUp] = useState(false);
  const history = useHistory();
  const location = useLocation<LocationState>();
  const authContext = useContext(AuthContext);
  const popUpTitle = '자동 로그인 기능을 사용하시겠습니까?';
  const popUpText = `자동 로그인 사용시 다음 접속부터는 로그인을 하실 필요가 없습니다.\n
            단, 게임방, 학교 등 공공장소에서 이용 시 개인정보가 유출될 수 있으니 주의해주세요.`;
  const errText = '로그인에 실패하였습니다.\n아이디나 비밀번호를 확인해주세요.';

  useEffect(() => {
    if (!errPopUp) return;
    const timer = setTimeout(() => {
      setErrPopUp(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [errPopUp]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLoginInfo({
      ...loginInfo,
      [e.target.name]: e.target.value,
    });
  };

  const checkAuto = (e: ChangeEvent<HTMLInputElement>) => {
    setPopUp(e.target.checked);
    setLoginInfo({
      ...loginInfo,
      autoLogin: e.target.checked,
    });
  };

  // const makeErrPopUp = () => {
  //     setErrPopUp(true);
  //     setTimeout(() => {
  //         setErrPopUp(false)
  //     }, 1500)
  // }

  const setAutoLogin = (isAuto: boolean) => {
    setLoginInfo({
      ...loginInfo,
      autoLogin: isAuto,
    });
  };

  const userLogIn = async () => {
    setIsLoading(true);

    await AuthService.logIn(loginInfo)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((res: any) => {
        const { token, userInfo, autoLogin } = res.data;
        setIsLoading(false);
        authContext.authLogin(token, autoLogin, userInfo);
        if (location.state && location.state.accessLocation) {
          history.push(location.state.accessLocation);
        } else {
          history.push('/');
        }
      })
      .catch((err: ErrorEvent) => {
        console.error(err);
        setIsLoading(false);
        setErrPopUp(true);
        // makeErrPopUp()
      });
  };

  const guestLogIn = async () => {
    setIsLoading(true);

    await AuthService.guestLogIn()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((res: any) => {
        setIsLoading(false);
        const { token, userInfo, autoLogin } = res.data;
        authContext.authLogin(token, autoLogin, userInfo);
      })
      .catch((err: ErrorEvent) => {
        console.error(err);
        setIsLoading(false);
        setErrPopUp(true);
        // makeErrPopUp()
      });
  };

  return (
    <>
      {isLoading && <Loading />}
      {authContext.authInfo.isLoggedIn && <Redirect to="/" />}
      {findPopUp && <FindIdPw cancel={() => setFindPopUp(false)} />}
      {errPopUp && <PopUp title={''} contents={errText} isAction={false} />}
      {popUp && (
        <PopUp
          title={popUpTitle}
          contents={popUpText}
          isAction={true}
          cancel={() => {
            setPopUp(false);
            setAutoLogin(false);
          }}
          confirm={() => {
            setPopUp(false);
          }}
        />
      )}
      <FullScreenPortal>
        <LogInComponent
          autoLogin={loginInfo.autoLogin}
          handleChange={handleChange}
          userLogIn={userLogIn}
          guestLogIn={guestLogIn}
          openFindPopUp={() => setFindPopUp(true)}
          checkAuto={checkAuto}
        />
      </FullScreenPortal>
    </>
  );
}

export default LogIn;
