import React, { ChangeEvent } from 'react';
import InputField from '../Common/InputField';
import SignUpInputType from '../../types/SignUpInputType';

const printProfile = function (profile?: File) {
  if (profile) {
    if (profile.name.length > 10) {
      return profile.name.substring(0, 10) + '...';
    }
    else {
      return profile.name;
    }
  }
  else {
    return '선택된 파일 없음';
  }
};

type SignUpComponentProps = {
    userInfo: SignUpInputType;
    isTermAgree: boolean;
    validAll: boolean;
    dupId: boolean;
    checkDupId: () => void;
    setIsAgree: () => void;
    handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    submit: () => void;
    profile?: File;
    uploadFile: (e: ChangeEvent<HTMLInputElement>) => void;
}

const SignUpComponent = ({ userInfo, isTermAgree, validAll, dupId, checkDupId,
  setIsAgree, handleChange,
  submit, profile, uploadFile }: SignUpComponentProps) => {


  return (
    <div className="sign-up-wrapper">
      <h2>JOIN</h2>

      {
        !isTermAgree ?
          <>
            <div className="div-agreement">
              <h3>가입안내</h3>
              <p>안녕하세요? 서울대학교 아마추어 천문회 - AAA - 의 홈페이지에 오신것을 환영합니다!
                <br /><br />
                                지금 가입하려고 하는 사이트는 AAA 회원들이 온라인활동을 하는 공간으로,
                                회원들의 개인정보 보호와 원활한 커뮤니티 활동을 위하여 몇가지 지켜주셔야 할 사항들이 있습니다.
                <br /><br />
                                귀찮으시더라도 아래 주의사항을 잘 읽어주시고 가입하여 주시기 바랍니다.
                <br /><br /><br />
                                1. 본 사이트는 실명제입니다.
                <br /><br />
                                따라서 실명으로 가입하지 않으시는 회원님은 강제 탈퇴조치 될 수 있으니, 주의하시기 바랍니다.
                <br /><br /><br />
                                2. 본 사이트는 회원등급제를 실시합니다.
                <br /><br />
                                회원들의 개인정보를 보호하고 자유로운 커뮤니티 활동을 보장하기 위하여
                                소정의 자격요건을 만족하시지 못하는 분들은 몇몇 기능을 사용하실 수 없습니다.
                <br /><br /><br />
                                ☆ 회원등급별 권한
                <br /><br />
                                1(태양): 홈페이지 관리자 계정
                <br />
                                3(지구): 홈페이지 운영진. 모든 기능 이용 가능
                <br />
                                4(화성): 전 회장
                <br />
                                5(목성): 현 회장.
                <br />
                                6(토성): AAA임원진. 회원명단 확인, 공지게시판 작성 가능.
                <br />
                                7(천왕성): AAA정회원 / OB회원. 일지게시판 작성 가능
                <br />
                                8(해왕성): AAA신입생. 대부분의 기능 이용 가능
                <br />
                                9(명왕성): 비회원. 동아리원들의 커뮤니티를 위한 부분을 제외하고 이용 가능.
                <br /><br />
                                AAA 회원임을 확인하기 위하여 가입번호를 인증 수단으로 사용합니다.
                                가입번호는 정확한 번호를 체크하는 것이 아니라 양식만 확인합니다.
                                정확한 양식으로 제출시 8등급으로 가입처리가 됩니다.
                <br /><br />
                                다만, AAA의 회원은 아니나 AAA와 관련이 있는 분인 경우에는,
                                9등급 회원으로 가입하여 손님방 게시판을 사용하실 수 있습니다.
                <br /><br />
                                그리고, AAA 회원이지만 가입번호 양식을 모르시는 분들 역시,
                                가입 후에 손님방 게시판에 문의글을 올려 주시면 확인 후 등급을 조절해드리겠습니다.
                <br /><br />
                                3. 회원 가입 시에는 학번과 학과, 전화번호를 필히 입력하여 주십시오.
                                신원 확인을 위한 것이니 필히 입력해주시기 바랍니다.
                                미입력시에는 9등급으로 강제 조정됩니다.
                <br /><br />
                                AAA 홈페이지에서 즐거운 시간 보내십시오. 감사합니다.
                <br />
                                문의사항이 있을 시에는 snuaaa@gmail.com 으로 메일 보내주십시오.
              </p>
            </div>
            <div className="signup-input-wrapper">
              {/* <p className="enif-text-right">위의 가입안내문에 동의합니다. */}
              {/* <input className="checkbox-signup" name="isAgree" onChange={handleCheckBox} type="checkBox" /></p> */}
              <button className="enif-btn-common-rec signup-btn" onClick={setIsAgree}>가입안내문에 동의</button>
            </div>
          </>
          :
          <div className="signup-input-wrapper">

            <InputField label="아이디*" name="id" handleChange={handleChange} handleBlur={checkDupId} required={true} valid={userInfo.id.valid} value={userInfo.id.value}
              invalidMessage={dupId ? '이미 사용중인 ID입니다' : '4-12자리의 영문 혹은 숫자'} />
            <InputField label="비밀번호*" type="password" name="password" handleChange={handleChange} required={true} valid={userInfo.password.valid} value={userInfo.password.value}
              invalidMessage="8-20자리의 영문/숫자/특수문자" />
            <InputField label="비밀번호확인*" type="password" name="passwordCf" handleChange={handleChange} required={true} valid={userInfo.passwordCf.valid} value={userInfo.passwordCf.value}
              invalidMessage="비밀번호가 일치하지 않습니다." />
            <InputField label="이름*" name="username" handleChange={handleChange} required={true} valid={userInfo.username.valid} value={userInfo.username.value}
              invalidMessage="2-6자의 한글 / 2-20 Alphabets" />
            <InputField label="E-mail*" type="email" name="email" handleChange={handleChange} valid={userInfo.email.valid} required={true} value={userInfo.email.value}
              maxLength={30} invalidMessage="이메일 형식에 맞게 입력해주세요" />
            <InputField label="Mobile*" name="mobile" handleChange={handleChange} required={true} valid={userInfo.mobile.valid} value={userInfo.mobile.value}
              invalidMessage="전화번호 형식에 맞게 입력해주세요(000-0000-0000)" />
            <InputField label="동아리 가입번호" name="aaaNum" handleChange={handleChange} valid={userInfo.aaaNum.valid} value={userInfo.aaaNum.value}
              invalidMessage="가입번호 형식에 맞게 입력해주세요. 동아리 회원이 아닌 경우, 입력하지 않으셔도 됩니다." />
            <InputField label="학번" name="schoolNum" handleChange={handleChange} valid={userInfo.schoolNum.valid} value={userInfo.schoolNum.value}
              invalidMessage="두자리 숫자로 입력해주세요 ex) 10 " />
            <InputField label="학과" name="major" handleChange={handleChange} value={userInfo.major.value} />

            <div className="enif-input-field profile-signup">
              <label htmlFor="profile">
                <span>Profile</span>
                <span>{printProfile(profile)}</span>
                <div className="btn-profile">파일선택</div>
              </label>
              <input
                type="file"
                id="profile"
                name="profile"
                accept="image/*"
                onChange={(e) => uploadFile(e)}
              />
            </div>
            <div className="enif-input-field">
              <label>자기소개</label>
              <textarea name="introduction" onChange={handleChange} />
            </div>
            <button disabled={!validAll} className="enif-btn-common-rec signup-btn" onClick={submit}>회원가입</button>
          </div>
      }
    </div>
  );
};

export default SignUpComponent;
