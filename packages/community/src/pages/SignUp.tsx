import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';

import AuthLayout, { StepHeader } from '~/components/Auth/AuthLayout';
import {
  AccountStep,
  DoneStep,
  GuideStep,
  InfoStep,
  type AccountValues,
  type InfoValues,
} from '~/components/Auth/SignupSteps';
import { gradeFor, nicknameFor } from '~/components/Auth/signupRules';
import { useAuth } from '~/contexts/auth';
import AuthService from '~/services/AuthService';

type Step = 'guide' | 'account' | 'info' | 'done';
const STEPS: Step[] = ['guide', 'account', 'info'];

const emptyAccount: AccountValues = { id: '', password: '', passwordCf: '' };
const emptyInfo: InfoValues = {
  username: '',
  email: '',
  mobile: '',
  schoolNum: '',
  major: '',
  aaaNum: '',
  introduction: '',
};

/** 가입 안내 → 계정 → 회원 정보 → 가입 완료. */
function SignUp() {
  const navigate = useNavigate();
  const { authLogin } = useAuth();
  const [step, setStep] = useState<Step>('guide');
  const [account, setAccount] = useState(emptyAccount);
  const [info, setInfo] = useState(emptyInfo);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  const back = () => {
    const index = STEPS.indexOf(step);
    if (index <= 0) navigate({ to: '/auth/login' });
    else setStep(STEPS[index - 1]);
  };

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    const aaaNum = info.aaaNum.trim();
    try {
      await AuthService.signUp({
        ...account,
        ...info,
        username: info.username.trim(),
        email: info.email.trim(),
        aaaNum,
      });
    } catch (err) {
      console.error(err);
      setError('가입하지 못했어요. 입력한 내용을 확인하고 다시 시도해 주세요.');
      setSubmitting(false);
      return;
    }
    // Sign the new member in, so 시작하기 goes straight to the site. If
    // that fails, the done screen sends them to the login page instead.
    try {
      const { data } = await AuthService.logIn({
        id: account.id,
        password: account.password,
        autoLogin: false,
      });
      // Stay on the done screen; the login page would redirect on its own.
      authLogin(data.token, data.autoLogin, data.userInfo);
      setLoggedIn(true);
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
    setStep('done');
  };

  if (step === 'done') {
    const aaaNum = info.aaaNum.trim();
    return (
      <AuthLayout mobile="night">
        <DoneStep
          nickname={nicknameFor(info.username.trim(), aaaNum)}
          grade={gradeFor(aaaNum)}
          loggedIn={loggedIn}
          onStart={() =>
            navigate({ to: loggedIn ? '/' : '/auth/login', replace: true })
          }
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout mobile="plain">
      <StepHeader
        step={STEPS.indexOf(step) + 1}
        total={STEPS.length}
        onBack={back}
      />
      {step === 'guide' && <GuideStep onNext={() => setStep('account')} />}
      {step === 'account' && (
        <AccountStep
          values={account}
          onChange={setAccount}
          onNext={() => setStep('info')}
        />
      )}
      {step === 'info' && (
        <InfoStep
          values={info}
          onChange={setInfo}
          onSubmit={submit}
          submitting={submitting}
          error={error}
        />
      )}
    </AuthLayout>
  );
}

export default SignUp;
