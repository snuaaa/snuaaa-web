import { ChangeEvent, useState, useEffect } from 'react';

import { useNavigate, useSearch, Navigate } from '@tanstack/react-router';
import LogInComponent from '~/components/Login/LogInComponent';
import Loading from '~/components/Common/Loading';
import PopUp from '~/components/Common/PopUp';
import FullScreenPortal from '~/components/Common/FullScreenPortal';
import FindIdPw from '~/components/Login/FindIdPw';
import AuthService from '~/services/AuthService';
import { useAuth } from '~/contexts/auth';

const popUpTitle = '자동 로그인 기능을 사용하시겠습니까?';
const popUpText = `자동 로그인 사용시 다음 접속부터는 로그인을 하실 필요가 없습니다.\n
          단, 게임방, 학교 등 공공장소에서 이용 시 개인정보가 유출될 수 있으니 주의해주세요.`;
const errText = '로그인에 실패하였습니다.\n아이디나 비밀번호를 확인해주세요.';

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
  const navigate = useNavigate();
  const search = useSearch({ from: '/auth/login' });
  const authContext = useAuth();

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

    try {
      const res = await AuthService.logIn(loginInfo);
      const { token, userInfo, autoLogin } = res.data;
      setIsLoading(false);
      authContext.authLogin(token, autoLogin, userInfo);
      if (search.redirect) {
        navigate({ to: search.redirect });
      } else {
        navigate({ to: '/' });
      }
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      setErrPopUp(true);
      // makeErrPopUp()
    }
  };

  const guestLogIn = async () => {
    setIsLoading(true);

    try {
      const res = await AuthService.guestLogIn();
      setIsLoading(false);
      const { token, userInfo, autoLogin } = res;
      authContext.authLogin(token, autoLogin, userInfo);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      setErrPopUp(true);
      // makeErrPopUp()
    }
  };

  if (authContext.authInfo.isLoggedIn) {
    return <Navigate to="/" />;
  }

  return (
    <>
      {isLoading && <Loading />}
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
