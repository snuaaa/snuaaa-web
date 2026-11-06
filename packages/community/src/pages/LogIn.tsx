import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { isAxiosError } from 'axios';

import AuthLayout, { ClubLogo } from '~/components/Auth/AuthLayout';
import FindAccountSheet from '~/components/Auth/FindAccountSheet';
import { Button } from '~/components/ui';
import { useAuth } from '~/contexts/auth';
import { cn } from '~/lib/utils';
import AuthService from '~/services/AuthService';

// Dark fields on the mobile sky, regular fields in the desktop card.
const inputClassName =
  'h-[52px] w-full rounded-lg border border-navy-700 bg-navy-900 px-4 text-base text-white outline-none placeholder:text-navy-300 focus:border-navy-300 md:h-12 md:rounded-md md:border-gray-300 md:bg-surface md:text-fg md:placeholder:text-gray-400 md:focus:border-navy-700 md:focus:shadow-[0_0_0_3px_var(--color-navy-200)]';
const labelClassName = 'sr-only md:not-sr-only md:text-label md:text-fg';

function LogIn() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/auth/login' });
  const { authInfo, authLogin } = useAuth();
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [autoLogin, setAutoLogin] = useState(true);
  const [pending, setPending] = useState<'user' | 'guest' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [finding, setFinding] = useState(false);

  // Move on once the login has landed in the auth context. Navigating
  // right after authLogin would see the logged-out state and bounce back.
  useEffect(() => {
    if (!authInfo.isLoggedIn) return;
    navigate({ to: search.redirect || '/', replace: true });
  }, [authInfo.isLoggedIn, navigate, search.redirect]);

  const logIn = async (e: FormEvent) => {
    e.preventDefault();
    if (!id || !password) {
      setError('아이디와 비밀번호를 입력해 주세요');
      return;
    }
    setPending('user');
    setError(null);
    try {
      const { data } = await AuthService.logIn({ id, password, autoLogin });
      authLogin(data.token, data.autoLogin, data.userInfo);
    } catch (err) {
      console.error(err);
      // 401 is a wrong id or password; anything else is worth a retry.
      setError(
        isAxiosError(err) && err.response?.status === 401
          ? '아이디 또는 비밀번호가 맞지 않아요'
          : '로그인하지 못했어요. 잠시 후 다시 시도해 주세요.',
      );
      setPending(null);
    }
  };

  const guestLogIn = async () => {
    setPending('guest');
    setError(null);
    try {
      const { token, autoLogin, userInfo } = await AuthService.guestLogIn();
      authLogin(token, autoLogin, userInfo);
    } catch (err) {
      console.error(err);
      setError('게스트로 들어가지 못했어요. 잠시 후 다시 시도해 주세요.');
      setPending(null);
    }
  };

  return (
    <AuthLayout mobile="night">
      <div className="flex flex-1 flex-col px-6 pb-8 md:p-0">
        <div className="flex flex-col items-center gap-3.5 pt-[min(120px,14dvh)] text-center text-fg-on-brand md:hidden">
          <ClubLogo className="size-16 rounded-[18px]" />
          <div className="flex flex-col gap-1.5">
            <h1 className="text-[22px] font-bold tracking-[-0.4px]">
              서울대학교 아마추어 천문회
            </h1>
            <p className="text-sm text-fg-on-brand-muted">
              오늘 밤도 맑은 하늘을
            </p>
          </div>
        </div>
        <h1 className="mb-5 hidden text-title md:block">로그인</h1>

        <form
          onSubmit={logIn}
          noValidate
          className="mt-11 flex flex-col gap-3 md:mt-0 md:gap-3.5"
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="login-id" className={labelClassName}>
              아이디
            </label>
            <input
              id="login-id"
              autoComplete="username"
              autoCapitalize="none"
              placeholder="아이디"
              value={id}
              onChange={(e) => setId(e.target.value)}
              aria-invalid={Boolean(error) || undefined}
              className={cn(inputClassName, 'md:placeholder:text-transparent')}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="login-password" className={labelClassName}>
              비밀번호
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={Boolean(error) || undefined}
              aria-describedby={error ? 'login-error' : undefined}
              className={cn(inputClassName, 'md:placeholder:text-transparent')}
            />
          </div>
          {error && (
            <p
              id="login-error"
              role="alert"
              className="px-1 text-label font-normal text-danger-soft md:text-danger"
            >
              {error}
            </p>
          )}
          <div className="flex min-h-9 items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-navy-200 md:text-fg">
              <input
                type="checkbox"
                checked={autoLogin}
                onChange={(e) => setAutoLogin(e.target.checked)}
                className="size-[18px] accent-accent md:size-4 md:accent-primary"
              />
              로그인 상태 유지
            </label>
            <button
              type="button"
              onClick={() => setFinding(true)}
              className="hidden text-label font-normal text-gray-700 hover:text-fg md:block"
            >
              아이디 · 비밀번호 찾기
            </button>
          </div>
          <Button
            type="submit"
            variant="accent"
            loading={pending === 'user'}
            disabled={pending !== null}
            size="lg"
            className="md:bg-primary md:text-white md:hover:bg-primary-hover"
          >
            로그인
          </Button>
          <Button
            variant="secondary"
            onClick={guestLogIn}
            loading={pending === 'guest'}
            disabled={pending !== null}
            className="h-12 rounded-lg border-info bg-transparent text-[15px] text-white hover:bg-navy-900 md:border-gray-300 md:bg-surface md:text-fg md:hover:bg-gray-50"
          >
            게스트로 둘러보기
          </Button>
        </form>

        <div className="mt-5 flex items-center justify-center gap-3.5 text-sm md:hidden">
          <Link
            to="/auth/signup"
            className="flex min-h-11 items-center font-semibold text-white"
          >
            회원가입
          </Link>
          <span className="h-3 w-px bg-info" aria-hidden />
          <button
            type="button"
            onClick={() => setFinding(true)}
            className="flex min-h-11 items-center text-fg-on-brand-muted"
          >
            아이디 · 비밀번호 찾기
          </button>
        </div>
        <p className="mt-5 hidden justify-center gap-1.5 text-sm text-gray-700 md:flex">
          아직 회원이 아니신가요?
          <Link to="/auth/signup" className="font-bold text-navy-700">
            회원가입
          </Link>
        </p>
      </div>
      <FindAccountSheet open={finding} onClose={() => setFinding(false)} />
    </AuthLayout>
  );
}

export default LogIn;
