import React from 'react';
import Image from '../Common/AaaImage.tsx';
import InputField from '../Common/InputField';
import imgDefaultProfile from 'assets/img/common/profile.png';

const ProfileComponent = ({ profilePath, userInfo, handleChange, uploadProfileImg, updateInfo, deleteUser, isProfileImgChanged, valid }) => {

  let idInfo, usernameInfo,
    emailInfo, mobileInfo, aaaNumInfo, colNumInfo,
    nicknameInfo, majorInfo, introInfo = null;

  userInfo.forEach(info => {
    if (info.label === 'id') {
      idInfo = info;
    }
    else if (info.label === 'username') {
      usernameInfo = info;
    }
    else if (info.label === 'email') {
      emailInfo = info;
    }
    else if (info.label === 'mobile') {
      mobileInfo = info;
    }
    else if (info.label === 'aaa_no') {
      aaaNumInfo = info;
    }
    else if (info.label === 'col_no') {
      colNumInfo = info;
    }
    else if (info.label === 'major') {
      majorInfo = info;
    }
    else if (info.label === 'introduction') {
      introInfo = info;
    }
    else if (info.label === 'nickname') {
      nicknameInfo = info;
    }
    else {
      return new Error('userInfo Error..');
    }
  });

  return (
    <>

      <div className="profile-wrapper">
        <div className="profile-img-wrapper">
          <Image imgSrc={profilePath} defaultImgSrc={imgDefaultProfile} local={isProfileImgChanged} />
          <label htmlFor="profileImg">
            <div className="edit-profile-img">
              <i className="ri-camera-line"></i>
            </div>
          </label>
          <input type="file" id="profileImg" accept="image/*" onChange={uploadProfileImg} />
        </div>
        <h5 className="profile-nickname">{nicknameInfo.value}</h5>
        <InputField label="ID*" name="id" value={idInfo.value} disabled={true} valid={idInfo.valid} />
        <InputField label="이름*" name="username" value={usernameInfo.value} required={true} valid={usernameInfo.valid}
          handleChange={handleChange} invalidMessage="2-10자의 한글 혹은 영문" />
        <InputField label="E-mail*" name="email" value={emailInfo.value} handleChange={handleChange} maxLength={30} valid={emailInfo.valid}
          invalidMessage="이메일 형식에 맞게 입력해주세요" />
        <InputField label="Mobile*" name="mobile" value={mobileInfo.value} valid={mobileInfo.valid}
          handleChange={handleChange} invalidMessage="전화번호 형식에 맞게 입력해주세요(xxx-xxxx-xxxx)" />
        <InputField label="동아리번호" name="aaa_no" value={aaaNumInfo.value} valid={aaaNumInfo.valid}
          handleChange={handleChange} invalidMessage="가입번호 형식에 맞게 입력해주세요. 동아리 회원이 아닌 경우, 입력하지 않으셔도 됩니다." />
        <InputField label="학번" name="col_no" value={colNumInfo.value} valid={colNumInfo.valid}
          handleChange={handleChange} invalidMessage="숫자 2자리를 입력해 주세요(ex. 19)" />
        <InputField label="전공" name="major" value={majorInfo.value} valid={majorInfo.valid} handleChange={handleChange} />

        <div className="enif-input-field">
          <label htmlFor="introduction">자기소개</label>
          <textarea name="introduction" value={introInfo.value} onChange={(e) => handleChange(e)} />
        </div>
        <div className="btn-wrapper">
          <button className="btn-withdraw" onClick={() => deleteUser()}>탈퇴하기</button>
          <button className="btn-save" disabled={!valid} onClick={() => updateInfo()}>저장</button>
        </div>
      </div>
    </>
  );
};

export default ProfileComponent;