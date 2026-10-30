import { useEffect, useState, type ReactNode } from 'react';
import { isAxiosError } from 'axios';
import { Camera } from 'lucide-react';

import { Button, Field, Input, Textarea } from '~/components/ui';
import { cn } from '~/lib/utils';
import AuthService from '~/services/AuthService';
import { gradeAssigner } from '~/utils/gradeAssigner';
import {
  AAA_NO_PATTERN,
  EMAIL_PATTERN,
  GRADE_DOTS,
  GRADE_GUIDE,
  ID_PATTERN,
  MOBILE_PATTERN,
  NAME_PATTERN,
  PASSWORD_PATTERN,
  SCHOOL_NO_PATTERN,
} from './signupRules';

export type AccountValues = {
  id: string;
  password: string;
  passwordCf: string;
};
export type InfoValues = {
  username: string;
  email: string;
  mobile: string;
  schoolNum: string;
  major: string;
  aaaNum: string;
  introduction: string;
  profile?: File;
};

/** The step's body, then its button: pinned to the bottom on mobile. */
function StepBody({
  title,
  children,
  footer,
}: {
  title: ReactNode;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <>
      <div className="flex flex-1 flex-col gap-[18px] px-5 pt-1 pb-8 md:gap-4 md:p-0 md:pb-5">
        <h1 className="text-[22px] leading-snug font-bold tracking-[-0.4px] md:text-title">
          {title}
        </h1>
        {children}
      </div>
      <div className="sticky bottom-0 border-t border-gray-100 bg-surface px-4 pt-3 pb-[max(1.75rem,env(safe-area-inset-bottom))] md:static md:border-0 md:p-0">
        {footer}
      </div>
    </>
  );
}

const ctaClassName = 'h-[52px] rounded-lg text-base font-bold';

function Numbered({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <span className="flex size-[26px] shrink-0 items-center justify-center rounded-md bg-info-soft text-label text-navy-700">
        {n}
      </span>
      <div className="flex flex-col gap-1">
        <p className="text-[15px] font-bold">{title}</p>
        <p className="text-label leading-relaxed font-normal text-gray-700">
          {children}
        </p>
      </div>
    </div>
  );
}

export function GradeDot({
  grade,
  className,
}: {
  grade: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'size-[18px] shrink-0 rounded-full',
        GRADE_DOTS[grade],
        className,
      )}
      aria-hidden
    />
  );
}

/** 1 / 3: 가입 안내. */
export function GuideStep({ onNext }: { onNext: () => void }) {
  return (
    <StepBody
      title={
        <>
          AAA에 오신 걸
          <br className="md:hidden" /> 환영해요
        </>
      }
      footer={
        <Button block onClick={onNext} className={ctaClassName}>
          확인했어요
        </Button>
      }
    >
      <p className="-mt-2 text-sm leading-relaxed text-gray-700">
        회원들의 개인정보 보호와 원활한 활동을 위해 가입 전에 꼭 읽어 주세요.
      </p>
      <Numbered n={1} title="실명으로 가입해 주세요">
        실명이 아니면 탈퇴 처리될 수 있어요.
      </Numbered>
      <Numbered n={2} title="등급에 따라 쓸 수 있는 기능이 달라요">
        가입번호 양식이 맞으면 해왕성(8등급), 없으면 명왕성(9등급)으로 가입돼요.
        가입번호는 양식만 확인해요.
      </Numbered>
      <ul className="ml-[38px] flex flex-col rounded-lg bg-bg px-3.5 py-1.5">
        {GRADE_GUIDE.map(({ grade, name, role }) => (
          <li key={grade} className="flex items-center gap-2.5 py-[5px]">
            <GradeDot grade={grade} />
            <span className="w-16 shrink-0 text-label">
              {grade} {name}
            </span>
            <span className="text-caption text-gray-700">{role}</span>
          </li>
        ))}
      </ul>
      <Numbered n={3} title="학번 · 학과 · 전화번호는 꼭 입력해 주세요">
        신원 확인에 쓰여요. 입력하지 않으면 9등급으로 조정돼요.
      </Numbered>
      <p className="rounded-lg border border-border px-3.5 py-3 text-label leading-relaxed font-normal text-gray-700">
        회원인데 가입번호 양식을 모르거나 등급 조정이 필요하면{' '}
        <a href="mailto:snuaaa@gmail.com" className="text-navy-700 underline">
          snuaaa@gmail.com
        </a>
        으로 문의해 주세요.
      </p>
    </StepBody>
  );
}

type IdCheck = 'idle' | 'checking' | 'ok' | 'taken' | 'failed';

/** 2 / 3: 아이디 and 비밀번호. */
export function AccountStep({
  values,
  onChange,
  onNext,
}: {
  values: AccountValues;
  onChange: (values: AccountValues) => void;
  onNext: () => void;
}) {
  // Each result belongs to the id it checked, so a late answer for an
  // earlier id never counts for the one typed now.
  const [check, setCheck] = useState<{ id: string; status: IdCheck }>({
    id: '',
    status: 'idle',
  });
  const idCheck = check.id === values.id ? check.status : 'idle';
  const [touched, setTouched] = useState<
    Partial<Record<keyof AccountValues, boolean>>
  >({});
  const [submitted, setSubmitted] = useState(false);

  const idValid = ID_PATTERN.test(values.id);
  const passwordValid = PASSWORD_PATTERN.test(values.password);
  const confirmValid = values.passwordCf === values.password && passwordValid;

  const checkId = async () => {
    if (!idValid) return false;
    const { id } = values;
    setCheck({ id, status: 'checking' });
    try {
      await AuthService.duplicateCheck({ check_id: id });
      setCheck({ id, status: 'ok' });
      return true;
    } catch (err) {
      // 409 means taken; anything else (network, 500) is worth a retry.
      const taken = isAxiosError(err) && err.response?.status === 409;
      setCheck({ id, status: taken ? 'taken' : 'failed' });
      return false;
    }
  };

  const next = async () => {
    setSubmitted(true);
    if (!idValid || !passwordValid || !confirmValid) return;
    if (idCheck === 'ok' || (await checkId())) onNext();
  };

  const show = (key: keyof AccountValues) => submitted || touched[key];
  const idError = !show('id')
    ? undefined
    : !values.id
      ? '아이디를 입력해 주세요'
      : !idValid
        ? '영문, 숫자 4~12자로 입력해 주세요'
        : idCheck === 'taken'
          ? '이미 쓰고 있는 아이디예요'
          : idCheck === 'failed'
            ? '아이디를 확인하지 못했어요. 다시 시도해 주세요'
            : undefined;

  return (
    <StepBody
      title="로그인에 쓸 계정을 만들어요"
      footer={
        <Button
          block
          onClick={next}
          loading={idCheck === 'checking'}
          className={ctaClassName}
        >
          다음
        </Button>
      }
    >
      <Field
        label="아이디"
        required
        error={idError}
        hint={
          idCheck === 'ok' ? (
            <span className="text-success">사용할 수 있는 아이디예요</span>
          ) : (
            '영문, 숫자 4~12자'
          )
        }
      >
        <Input
          autoComplete="username"
          autoCapitalize="none"
          value={values.id}
          onChange={(e) => onChange({ ...values, id: e.target.value.trim() })}
          onBlur={() => {
            setTouched((prev) => ({ ...prev, id: true }));
            if (idValid && idCheck === 'idle') checkId();
          }}
          className={cn(idCheck === 'ok' && 'border-success')}
        />
      </Field>
      <Field
        label="비밀번호"
        required
        hint="8~20자, 영문과 숫자를 섞어 주세요"
        error={
          show('password') && !passwordValid
            ? '8~20자, 영문과 숫자를 섞어 주세요'
            : undefined
        }
      >
        <Input
          type="password"
          autoComplete="new-password"
          value={values.password}
          onChange={(e) => onChange({ ...values, password: e.target.value })}
          onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
        />
      </Field>
      <Field
        label="비밀번호 확인"
        required
        error={
          show('passwordCf') && values.passwordCf !== values.password
            ? '비밀번호가 일치하지 않아요'
            : undefined
        }
      >
        <Input
          type="password"
          autoComplete="new-password"
          value={values.passwordCf}
          onChange={(e) => onChange({ ...values, passwordCf: e.target.value })}
          onBlur={() => setTouched((prev) => ({ ...prev, passwordCf: true }))}
        />
      </Field>
    </StepBody>
  );
}

/** 3 / 3: 회원 정보, then 가입하기. */
export function InfoStep({
  values,
  onChange,
  onSubmit,
  submitting,
  error,
}: {
  values: InfoValues;
  onChange: (values: InfoValues) => void;
  onSubmit: () => void;
  submitting: boolean;
  error: string | null;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [preview, setPreview] = useState<string>();

  useEffect(() => {
    if (!values.profile) return setPreview(undefined);
    const url = URL.createObjectURL(values.profile);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [values.profile]);

  const set = (patch: Partial<InfoValues>) => onChange({ ...values, ...patch });
  const errors = {
    username: !values.username
      ? '이름을 입력해 주세요'
      : !NAME_PATTERN.test(values.username)
        ? '한글 2~6자 또는 영문 2~20자로 입력해 주세요'
        : undefined,
    email: !values.email
      ? '이메일을 입력해 주세요'
      : !EMAIL_PATTERN.test(values.email)
        ? '이메일 형식이 맞지 않아요'
        : undefined,
    mobile: !values.mobile
      ? '휴대폰 번호를 입력해 주세요'
      : !MOBILE_PATTERN.test(values.mobile)
        ? '010-0000-0000 형식으로 입력해 주세요'
        : undefined,
    schoolNum:
      values.schoolNum && !SCHOOL_NO_PATTERN.test(values.schoolNum)
        ? '두 자리 숫자로 입력해 주세요 (예: 24)'
        : undefined,
  };
  const shown = (key: keyof typeof errors) =>
    submitted ? errors[key] : undefined;
  const aaaValid = AAA_NO_PATTERN.test(values.aaaNum);

  const submit = () => {
    setSubmitted(true);
    if (Object.values(errors).some(Boolean)) return;
    onSubmit();
  };

  return (
    <StepBody
      title="회원 정보를 알려 주세요"
      footer={
        <>
          {error && (
            <p
              role="alert"
              className="mb-2.5 text-label font-normal text-danger"
            >
              {error}
            </p>
          )}
          <Button
            block
            onClick={submit}
            loading={submitting}
            className={ctaClassName}
          >
            가입하기
          </Button>
        </>
      }
    >
      <Field
        label="이름"
        required
        hint="실명, 한글 2~6자 또는 영문 2~20자"
        error={shown('username')}
      >
        <Input
          autoComplete="name"
          value={values.username}
          onChange={(e) => set({ username: e.target.value })}
        />
      </Field>
      <Field
        label="이메일"
        required
        hint="아이디·비밀번호를 찾을 때 쓰여요"
        error={shown('email')}
      >
        <Input
          type="email"
          autoComplete="email"
          placeholder="example@snu.ac.kr"
          value={values.email}
          onChange={(e) => set({ email: e.target.value.trim() })}
        />
      </Field>
      <Field label="휴대폰" required error={shown('mobile')}>
        <Input
          type="tel"
          autoComplete="tel"
          placeholder="010-0000-0000"
          value={values.mobile}
          onChange={(e) => set({ mobile: e.target.value.trim() })}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="학번" error={shown('schoolNum')}>
          <Input
            inputMode="numeric"
            placeholder="예: 24"
            value={values.schoolNum}
            onChange={(e) => set({ schoolNum: e.target.value.trim() })}
          />
        </Field>
        <Field label="학과">
          <Input
            placeholder="예: 물리천문학부"
            value={values.major}
            onChange={(e) => set({ major: e.target.value })}
          />
        </Field>
      </div>
      <div className="flex flex-col gap-2 rounded-lg bg-bg p-3.5">
        <Field label="동아리 가입번호">
          <Input
            placeholder="동아리 회원만 입력 (예: 24AAA-12)"
            value={values.aaaNum}
            onChange={(e) => set({ aaaNum: e.target.value.trim() })}
          />
        </Field>
        {[8, 9].map((grade) => {
          const active = values.aaaNum ? (aaaValid ? 8 : 9) === grade : false;
          return (
            <p
              key={grade}
              className={cn(
                'flex items-center gap-2 text-caption leading-normal',
                active ? 'font-semibold text-fg' : 'text-gray-700',
              )}
            >
              <GradeDot grade={grade} className="size-3.5" />
              {grade === 8
                ? '양식이 맞으면 해왕성(8등급)으로 가입돼요'
                : values.aaaNum
                  ? '양식이 맞지 않으면 명왕성(9등급)으로 가입돼요'
                  : '비워 두면 명왕성(9등급)으로 가입돼요'}
            </p>
          );
        })}
      </div>
      <div className="h-px bg-gray-100" />
      <p className="text-label text-fg-muted">
        선택 입력 · 나중에 프로필에서 바꿀 수 있어요
      </p>
      <div className="flex items-center gap-3.5">
        <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-gray-400">
          {preview ? (
            <img
              src={preview}
              alt="고른 프로필 사진"
              className="size-full object-cover"
            />
          ) : (
            <Camera className="size-6" strokeWidth={1.8} aria-hidden />
          )}
        </span>
        <label
          htmlFor="signup-profile"
          className="flex h-10 cursor-pointer items-center rounded-md border border-gray-300 px-3.5 text-sm font-semibold hover:bg-gray-50"
        >
          {preview ? '다른 사진 고르기' : '프로필 사진 선택'}
        </label>
        <input
          id="signup-profile"
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) set({ profile: file });
            e.target.value = '';
          }}
        />
      </div>
      <Field label="자기소개">
        <Textarea
          rows={3}
          placeholder="관심 있는 천체, 관측 경험 등"
          value={values.introduction}
          onChange={(e) => set({ introduction: e.target.value })}
        />
      </Field>
    </StepBody>
  );
}

/** 가입을 환영해요: the new member's grade, then into the site. */
export function DoneStep({
  nickname,
  grade,
  loggedIn,
  onStart,
}: {
  nickname: string;
  grade: number;
  loggedIn: boolean;
  onStart: () => void;
}) {
  const gradeName = `${gradeAssigner(grade)}(${grade}등급)`;
  return (
    <div className="flex flex-1 flex-col px-4 pb-[max(1.75rem,env(safe-area-inset-bottom))] text-fg-on-brand md:p-0 md:text-fg">
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-3 text-center md:py-8">
        <span className={cn('rounded-full p-1', GRADE_DOTS[grade])} aria-hidden>
          <span className="flex size-24 items-center justify-center rounded-full border-4 border-navy-950 bg-navy-800 text-[34px] font-bold text-white md:border-surface">
            {nickname.replace(/^[0-9]+/, '').slice(0, 1)}
          </span>
        </span>
        <h1 className="text-title">가입을 환영해요!</h1>
        <p className="text-[15px] leading-relaxed text-navy-200 md:text-gray-700">
          {nickname}님, 반가워요.
          <br />
          {gradeName}으로 가입됐어요.
        </p>
        <span className="flex h-[30px] items-center gap-2 rounded-full bg-navy-800 pr-3 pl-2 text-label md:bg-gray-100">
          <GradeDot grade={grade} className="size-3.5" />
          {gradeAssigner(grade)} {grade}
        </span>
      </div>
      <Button
        block
        variant="accent"
        onClick={onStart}
        className={cn(
          ctaClassName,
          'md:bg-primary md:text-white md:hover:bg-primary-hover',
        )}
      >
        {loggedIn ? '시작하기' : '로그인하러 가기'}
      </Button>
    </div>
  );
}
