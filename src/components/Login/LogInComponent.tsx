import React, { ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import InputText from '../Common/InputText';
import Footer from '../Footer';
import logo from 'assets/img/login_logo.gif';

type Props = {
  autoLogin: boolean,
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void,
  userLogIn: () => void,
  guestLogIn: () => void,
  openFindPopUp: () => void,
  checkAuto: (e: ChangeEvent<HTMLInputElement>) => void,
}

const LogInComponent: React.FC<Props> = ({ autoLogin, handleChange, userLogIn, guestLogIn, openFindPopUp, checkAuto }: Props) => {
  return (
    <div className="login-wrapper">
      <div className="logo-wrapper">
        <img src={logo} alt="logo" />
      </div>
      <div className="inputs-wrapper">
        <div className="auto-checker">
          <input type="checkbox" id="toggle" onChange={checkAuto} checked={autoLogin} />
          <label htmlFor="toggle" className="toggle-switch" />
          <p className="auto-checker-text">자동 로그인</p>
        </div>
        <div className="login-inputs-wrapper">
          <div className="login-inputs">
            <InputText
              className="login-input"
              name="id"
              handleChange={handleChange}
              placeholder=" ID"
              isRequired={true}
            />
            <input type="password" className="login-input" placeholder=" PASSWORD"
              name="password"
              onChange={handleChange}
              onKeyDown={(e) => { if (e.keyCode === 13) userLogIn(); }}
              required />
          </div>
          <button className="login-btn" onClick={userLogIn}>로그인</button>
        </div>
        <div>
          <button className="btn-guest" onClick={guestLogIn}>Guest</button>
        </div>
        <div className="menu-txt-wrapper">
          <Link to="/auth/signup">
            <p className="menu-txt-signup">회원가입</p>
          </Link>
          <p className="menu-txt-find" onClick={openFindPopUp}>아이디 | 비밀번호 찾기</p>
        </div>
      </div>
      <Footer></Footer>
    </div>
  );
};

export default LogInComponent;