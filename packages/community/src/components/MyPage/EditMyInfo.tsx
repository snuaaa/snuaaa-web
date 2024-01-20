import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import EditPassword from './EditPassword';
import EditProfile from './EditProfile';

function EditMyInfo() {

  const [isSelectInfo, setIsSelectInfo] = useState<boolean>(true);

  return (
    <div>
      <div className="my-title-wrapper">
        <Link to={'/mypage/info'}>
          <i className="ri-arrow-left-line enif-f-1p5x"></i>
        </Link>
        <h3>프로필 수정</h3>
      </div>

      <div className="my-select-edit-wrapper">
        <button className={`my-select-edit-btn ${isSelectInfo ? 'selected' : ''}`} onClick={() => setIsSelectInfo(true)}>개인정보</button>
        <button className={`my-select-edit-btn ${isSelectInfo ? '' : 'selected'}`} onClick={() => setIsSelectInfo(false)}>비밀번호</button>
      </div>
      {
        isSelectInfo ?
          <EditProfile />
          :
          <EditPassword />
      }
    </div>
  );
}

export default EditMyInfo;
