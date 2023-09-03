import React, { useState, ChangeEvent } from 'react';
import UserService from '../../services/UserService';
import InputField from '../Common/InputField';

type InputFormat = {
    value: string;
    valid?: boolean | null;
    regExp?: string;
}

const defaultPwFormat: InputFormat = {
  value: '',
  valid: null,
  regExp: '^(?=.*[A-Za-z])(?=.*[0-9])[A-Za-z0-9^()@$!%*#?&]{8,20}$'
};

const defaultNPwFormat: InputFormat = {
  value: '',
  valid: null,
  regExp: '^(?=.*[A-Za-z])(?=.*[0-9])[A-Za-z0-9^()@$!%*#?&]{8,20}$'
};

const defaultNPwCfFormat: InputFormat = {
  value: '',
  valid: null
};


function EditPassword() {

  // const [userInfo, setUserInfo] = useState<InputFormat[]>(defaultUserFormat);
  const [pwInfo, setPwInfo] = useState<InputFormat>(defaultPwFormat);
  const [nPwInfo, setNPwInfo] = useState<InputFormat>(defaultNPwFormat);
  const [nPwCfInfo, setNPwCfInfo] = useState<InputFormat>(defaultNPwCfFormat);


  const checkReg = (info: InputFormat, value: string) => {
    if (info.regExp) {
      const re = new RegExp(info.regExp);
      const valid = value ? re.test(value) : null;
      return valid;
    }
  };

  const handlePw = (e: ChangeEvent<HTMLInputElement>) => {
    setPwInfo({
      ...pwInfo,
      value: e.target.value,
      valid: checkReg(pwInfo, e.target.value),
    });
  };

  const handleNPw = (e: ChangeEvent<HTMLInputElement>) => {

    const valid = checkReg(nPwInfo, e.target.value);
    const corr = e.target.value === nPwCfInfo.value;

    setNPwInfo({
      ...nPwInfo,
      value: e.target.value,
      valid: valid
    });
    setNPwCfInfo({
      ...nPwCfInfo,
      valid: corr
    });
  };

  const handleNPwCf = (e: ChangeEvent<HTMLInputElement>) => {

    const corr = nPwInfo.value === e.target.value;

    setNPwCfInfo({
      ...nPwCfInfo,
      value: e.target.value,
      valid: corr
    });
  };

  const checkValid = () => {
    return pwInfo.valid && nPwInfo.valid && nPwCfInfo.valid;

  };

  const submit = async () => {

    const data = {
      password: pwInfo.value,
      newPassword: nPwInfo.value,
      newPasswordCf: nPwCfInfo.value
    };

    await UserService.updatePassword(data)
      .then(() => {
        alert('비밀번호가 변경되었습니다.');
        window.location.reload();
      })
      .catch((err: any) => {
        if (err.response && err.response.data) {
          if (err.response.data.code === 1011) {
            alert('현재 비밀번호가 일치하지 않습니다.');
          }
          else if (err.response.data.code === 1012) {
            alert('새 비밀번호를 입력해주세요.');
          }
          else if (err.response.data.code === 1013) {
            alert('비밀번호 확인이 일치하지 않습니다.');
          }
          else if (err.response.data.code === 1014) {
            alert('비밀번호 양식이 일치하지 않습니다.');
          }
          else {
            alert('비밀번호 변경 실패.');
          }
        }
        else {
          alert('비밀번호 변경 실패.');
        }
        console.error(err);
      });

  };

  return (
    <div className="profile-wrapper">
      <InputField
        label="기존 비밀번호"
        type="password"
        name="pw"
        value={pwInfo.value}
        valid={pwInfo.valid}
        required={true}
        handleChange={handlePw}
        invalidMessage="8-20자리의 영문/숫자/특수문자"
      />
      <InputField
        label="새 비밀번호"
        name="nPw"
        type="password"
        value={nPwInfo.value}
        valid={nPwInfo.valid}
        required={true}
        handleChange={handleNPw}
        invalidMessage="8-20자리의 영문/숫자/특수문자" />
      <InputField
        label="새 비밀번호 확인"
        name="nPwCf"
        type="password"
        value={nPwCfInfo.value}
        valid={nPwCfInfo.valid}
        required={true}
        handleChange={handleNPwCf}
        invalidMessage="새 비밀번호와 일치하지 않습니다." />

      <div className="btn-wrapper">
        <button className="btn-save" disabled={!checkValid()} onClick={submit}>저장</button>
      </div>
    </div>

  );

}


export default EditPassword;
