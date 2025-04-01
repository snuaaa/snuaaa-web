import { useState, ChangeEvent } from 'react';
import SignUpComponent from '~/components/Signup/SignUpComponent';
import SignUpSuccess from '~/components/Signup/SignUpSuccess';
import SignUpFailure from '~/components/Signup/SignUpFailure';
import Loading from '~/components/Common/Loading';
import AuthService, { SingUpRequest } from '~/services/AuthService';
import SignUpInputType from '~/types/SignUpInputType';

const defaultFormat: SignUpInputType = {
  id: {
    value: '',
    valid: undefined,
    isRequired: true,
    regExp: '^[A-Za-z0-9]{4,12}$',
  },
  password: {
    value: '',
    valid: undefined,
    isRequired: true,
    regExp: '^(?=.*[A-Za-z])(?=.*[0-9])[A-Za-z0-9^()@$!%*#?&]{8,20}$',
  },
  passwordCf: {
    value: '',
    valid: undefined,
    isRequired: true,
    regExp: '^(?=.*[A-Za-z])(?=.*[0-9])[A-Za-z0-9^()@$!%*#?&]{8,20}$',
  },
  username: {
    value: '',
    valid: undefined,
    isRequired: true,
    regExp: '^[가-힣]{2,6}$|^[A-Za-z ]{2,20}$',
  },
  email: {
    value: '',
    valid: undefined,
    isRequired: true,
    regExp:
      '^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)*$',
  },
  mobile: {
    value: '',
    valid: undefined,
    isRequired: true,
    regExp: '^[0-9]{1,8}-[0-9]{1,8}-[0-9]{1,8}$',
  },
  aaaNum: {
    value: '',
    valid: undefined,
    isRequired: false,
    regExp: '^[0-9]{2}[Aa]{3}-[0-9]{1,3}|[Aa]{3}[0-9]{2}-[0-9]{1,3}$',
  },
  schoolNum: {
    value: '',
    valid: undefined,
    isRequired: false,
    regExp: '^[0-9]{2}$',
  },
  major: {
    value: '',
    valid: undefined,
    isRequired: false,
  },
  introduction: {
    value: '',
    valid: undefined,
    isRequired: false,
  },
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
    } else {
      setProfile(undefined);
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (e.target.name === 'password') {
      const re = userInfo[e.target.name].regExp;
      let valid;
      if (re) {
        valid = new RegExp(re).test(e.target.value);
      }
      if (userInfo.passwordCf.value === e.target.value) {
        setUserInfo({
          ...userInfo,
          password: {
            ...userInfo.password,
            value: e.target.value,
            valid: valid,
          },
          passwordCf: {
            ...userInfo.passwordCf,
            valid: true,
          },
        });
      } else {
        setUserInfo({
          ...userInfo,
          password: {
            ...userInfo.password,
            value: e.target.value,
            valid: valid,
          },
          passwordCf: {
            ...userInfo.passwordCf,
            valid: false,
          },
        });
      }
    } else if (e.target.name === 'passwordCf') {
      if (userInfo.password.value === e.target.value) {
        setUserInfo({
          ...userInfo,
          passwordCf: {
            ...userInfo.passwordCf,
            value: e.target.value,
            valid: true,
          },
        });
      } else {
        setUserInfo({
          ...userInfo,
          passwordCf: {
            ...userInfo.passwordCf,
            value: e.target.value,
            valid: false,
          },
        });
      }
    } else if (
      e.target.name === 'id' ||
      e.target.name === 'username' ||
      e.target.name === 'email' ||
      e.target.name === 'mobile' ||
      e.target.name === 'aaaNum' ||
      e.target.name === 'schoolNum' ||
      e.target.name === 'major' ||
      e.target.name === 'introduction'
    ) {
      const re = userInfo[e.target.name].regExp;
      if (re) {
        const valid = new RegExp(re).test(e.target.value);
        setUserInfo({
          ...userInfo,
          [e.target.name]: {
            ...userInfo[e.target.name],
            value: e.target.value,
            valid: valid,
          },
        });
      } else {
        setUserInfo({
          ...userInfo,
          [e.target.name]: {
            ...userInfo[e.target.name],
            value: e.target.value,
          },
        });
      }
    } else {
      console.error('invalid name');
    }
  };

  const checkDupId = async () => {
    try {
      await AuthService.duplicateCheck({ check_id: userInfo.id.value });
      // Available ID
      setDupId(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      // Existing ID
      setUserInfo({
        ...userInfo,
        id: {
          ...userInfo.id,
          valid: false,
        },
      });
      setDupId(true);
    }
  };

  const submit = async () => {
    setSignUpState('LOADING');

    const data = {} as SingUpRequest;
    for (const [key, value] of Object.entries(userInfo)) {
      data[key as keyof SingUpRequest] = value.value;
    }

    if (profile) {
      data.profile = profile;
    }

    try {
      await AuthService.signUp(data);
      setSignUpState('SUCCESS');
    } catch (err) {
      console.error(err);
      setSignUpState('FAILURE');
    }
  };

  const checkValid = () => {
    let valid = true;

    for (const [, value] of Object.entries(userInfo)) {
      if (value.isRequired) {
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
