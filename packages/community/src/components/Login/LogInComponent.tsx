import React, { ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import InputText from '../Common/InputText';
import Footer from '../Footer';
import logo from '~/assets/img/login_logo.gif';

type Props = {
  autoLogin: boolean;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  userLogIn: () => void;
  guestLogIn: () => void;
  openFindPopUp: () => void;
  checkAuto: (e: ChangeEvent<HTMLInputElement>) => void;
};

const LogInComponent: React.FC<Props> = ({
  autoLogin,
  handleChange,
  userLogIn,
  guestLogIn,
  openFindPopUp,
  checkAuto,
}: Props) => {
  return (
    <div className="login-wrapper">
      <div className="logo-wrapper">
        <img src={logo} alt="logo" />
      </div>
      <div className="inputs-wrapper">
        <div className="auto-checker">
          <input
            type="checkbox"
            id="toggle"
            onChange={checkAuto}
            checked={autoLogin}
          />
          <label htmlFor="toggle" className="toggle-switch" />
          <p className="auto-checker-text">자동 로그인</p>
        </div>
        <div className="flex mt-4 justify-between gap-6">
          <div className="grow">
            <InputText
              className="text-sm h-10 block w-full mb-4 pl-1 rounded-md"
              name="id"
              handleChange={handleChange}
              placeholder=" ID"
              isRequired={true}
            />
            <input
              type="password"
              className="text-sm h-10 block w-full mb-4 pl-1 rounded-md"
              placeholder=" PASSWORD"
              name="password"
              onChange={handleChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') userLogIn();
              }}
              required
            />
          </div>
          <button
            className="w-32 mb-4 tracking-wider text-white bg-[#57adb6] border-none rounded-md text-lg transition duration-1000"
            onClick={userLogIn}
          >
            로그인
          </button>
        </div>
        <div>
          <button className="btn-guest" onClick={guestLogIn}>
            Guest
          </button>
        </div>
        <div className="menu-txt-wrapper">
          <Link to="/auth/signup">
            <p className="menu-txt-signup">회원가입</p>
          </Link>
          <p className="menu-txt-find" onClick={openFindPopUp}>
            아이디 | 비밀번호 찾기
          </p>
        </div>
      </div>
      <Footer></Footer>
    </div>
  );
};

export default LogInComponent;
