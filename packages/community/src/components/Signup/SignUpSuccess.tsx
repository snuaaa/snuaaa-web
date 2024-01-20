import React from 'react';
import { Link } from 'react-router-dom';

const SignUpSuccess: React.FC = () => (
  <div className="popup-wrapper">
    <div className="popup-box">
      <div className="popup-star">★</div>
      <div className="popup-contents">
        <p>서울대학교 아마추어 천문회 AAA</p>
        <p>가입을 환영합니다!</p>
      </div>
      <div className="popup-confirm">
        <Link to="/auth/login">
          <button>LOGIN</button>
        </Link>
      </div>
    </div>
  </div>
);

export default SignUpSuccess;