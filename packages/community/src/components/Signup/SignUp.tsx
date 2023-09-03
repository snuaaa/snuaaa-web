import React, { useState, ChangeEvent } from 'react';
// import history from '../common/history';
import SignUpComponent from './SignUpComponent';
import SignUpSuccess from './SignUpSuccess';
import SignUpFailure from './SignUpFailure';
import Loading from '../Common/Loading';
import AuthService from '../../services/AuthService';
import SignUpInputType from '../../types/SignUpInputType';
import { useHistory } from 'react-router';

const TAG = 'SINGUP';

const defaultFormat: SignUpInputType = {
  id: {
    value: '',
    valid: undefined,
    isRequired: true,
    regExp: '^[A-Za-z0-9]{4,12}$'
  },
  password: {
    value: '',
    valid: undefined,
    isRequired: true,
    regExp: '^(?=.*[A-Za-z])(?=.*[0-9])[A-Za-z0-9^()@$!%*#?&]{8,20}$'
  },
  passwordCf: {
    value: '',
    valid: undefined,
    isRequired: true,
    regExp: '^(?=.*[A-Za-z])(?=.*[0-9])[A-Za-z0-9^()@$!%*#?&]{8,20}$'
  },
  username: {
    value: '',
    valid: undefined,
    isRequired: true,
    regExp: '^[가-힣]{2,6}$|^[A-Za-z ]{2,20}$'
  },
  email: {
    value: '',
    valid: undefined,
    isRequired: true,
    regExp: '^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)*$'
  },
  mobile: {
    value: '',
    valid: undefined,
    isRequired: true,
    regExp: '^[0-9]{1,8}-[0-9]{1,8}-[0-9]{1,8}$'
  },
  aaaNum: {
    value: '',
    valid: undefined,
    isRequired: false,
    regExp: '^[0-9]{2}[Aa]{3}-[0-9]{1,3}|[Aa]{3}[0-9]{2}-[0-9]{1,3}$'
  },
  schoolNum: {
    value: '',
    valid: undefined,
    isRequired: false,
    regExp: '^[0-9]{2}$'
  },
  major: {
    value: '',
    valid: undefined,
    isRequired: false
  },
  introduction: {
    value: '',
    valid: undefined,
    isRequired: false
  }
};

function SignUp() {

  const [userInfo, setUserInfo] = useState<SignUpInputType>(defaultFormat);
  const [signUpState, setSignUpState] = useState('READY');
  const [profile, setProfile] = useState<File>();
  const [dupId, setDupId] = useState<boolean>(false);
  const [isTermAgree, setIsTermAgree] = useState(false);

  const uploadFile = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setProfile(event.target.files[0]);
    }
    else {
      setProfile(undefined);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.target.name === 'password') {
      const re = userInfo[e.target.name].regExp;
      let valid;
      if (re) {
        valid = (new RegExp(re)).test(e.target.value);
      }
      if (userInfo.passwordCf.value === e.target.value) {
        setUserInfo({
          ...userInfo,
          password: {
            ...userInfo.password,
            value: e.target.value,
            valid: valid
          },
          passwordCf: {
            ...userInfo.passwordCf,
            valid: true
          }
        });
      }
      else {
        setUserInfo({
          ...userInfo,
          password: {
            ...userInfo.password,
            value: e.target.value,
            valid: valid
          },
          passwordCf: {
            ...userInfo.passwordCf,
            valid: false
          }
        });
      }
    }
    else if (e.target.name === 'passwordCf') {
      if (userInfo.password.value === e.target.value) {
        setUserInfo({
          ...userInfo,
          passwordCf: {
            ...userInfo.passwordCf,
            value: e.target.value,
            valid: true
          }
        });
      }
      else {
        setUserInfo({
          ...userInfo,
          passwordCf: {
            ...userInfo.passwordCf,
            value: e.target.value,
            valid: false
          }
        });
      }
    }
    else if (e.target.name === 'id' ||
            e.target.name === 'username' ||
            e.target.name === 'email' ||
            e.target.name === 'mobile' ||
            e.target.name === 'aaaNum' ||
            e.target.name === 'schoolNum' ||
            e.target.name === 'major' ||
            e.target.name === 'introduction') {
      const re = userInfo[e.target.name].regExp;
      if (re) {
        const valid = (new RegExp(re)).test(e.target.value);
        setUserInfo({
          ...userInfo,
          [e.target.name]: {
            ...userInfo[e.target.name],
            value: e.target.value,
            valid: valid
          }
        });
      }
      else {
        setUserInfo({
          ...userInfo,
          [e.target.name]: {
            ...userInfo[e.target.name],
            value: e.target.value,
          }
        });
      }
    }
    else {
      console.error('invalid name');
    }
  };

  const checkDupId = () => {

    AuthService.duplicateCheck({ check_id: userInfo.id.value })
      .then((res: any) => {
        // Available ID
        setDupId(false);
      })
      .catch((res: any) => {
        // Existing ID
        setUserInfo({
          ...userInfo,
          id: {
            ...userInfo.id,
            valid: false
          }
        });
        setDupId(true);
      });
  };


  const submit = async () => {

    setSignUpState('LOADING');

    const data = new FormData();
    for (const [key, value] of Object.entries(userInfo)) {
      data.append(key, value.value);
    }

    if (profile) {
      data.append('profile', profile);
    }

    await AuthService.signUp(data)
      .then(() => {
        setSignUpState('SUCCESS');
      })
      .catch((err: Error) => {
        console.error(err);
        setSignUpState('FAILURE');
      });
  };

  const checkValid = () => {
    let valid = true;

    for (const [key, value] of Object.entries(userInfo)) {
      if(value.isRequired) {
        valid = valid && value.valid;
      }
    }
    valid = valid && isTermAgree;
    return valid;
  };

  return (
    <>
      <SignUpComponent
        userInfo={userInfo}
        isTermAgree={isTermAgree}
        setIsAgree={() => setIsTermAgree(true)}
        validAll={checkValid()}
        dupId={dupId}
        handleChange={handleChange}
        checkDupId={checkDupId}
        submit={submit}
        uploadFile={uploadFile}
        profile={profile}
      />
      {signUpState === 'LOADING' && <Loading />}
      {signUpState === 'SUCCESS' && <SignUpSuccess />}
      {signUpState === 'FAILURE' && <SignUpFailure />}
    </>
  );
}

export default SignUp;