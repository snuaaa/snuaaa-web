import { useState, type FormEvent } from 'react';
import axios from 'axios';

import { Button, Field, Input, Toast, useToast } from '~/components/ui';
import { useUpdatePassword } from '~/hooks/queries/useUserQueries';
import AccountLayout from './AccountLayout';

// The same rule as 회원가입.
const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*[0-9])[A-Za-z0-9^()@$!%*#?&]{8,20}$/;
const PASSWORD_HINT = '영문과 숫자를 섞어 8~20자';

type Key = 'password' | 'newPassword' | 'newPasswordCf';
type Errors = Partial<Record<Key, string>>;

const empty = { password: '', newPassword: '', newPasswordCf: '' };

function validate(values: typeof empty): Errors {
  return {
    password: values.password ? undefined : '현재 비밀번호를 입력해 주세요.',
    newPassword: PASSWORD_RULE.test(values.newPassword)
      ? undefined
      : `${PASSWORD_HINT}로 입력해 주세요.`,
    newPasswordCf:
      values.newPasswordCf === values.newPassword
        ? undefined
        : '새 비밀번호와 같지 않아요.',
  };
}

/** The API's legacy codes for a refused change. */
const SERVER_ERRORS: Record<number, Errors> = {
  1011: { password: '현재 비밀번호가 맞지 않아요.' },
  1012: { newPassword: '새 비밀번호를 입력해 주세요.' },
  1013: { newPasswordCf: '새 비밀번호와 같지 않아요.' },
  1014: { newPassword: `${PASSWORD_HINT}로 입력해 주세요.` },
};

/** 비밀번호 변경. */
export default function PasswordForm() {
  const { mutateAsync: updatePassword, isPending } = useUpdatePassword();
  const toast = useToast();

  const [values, setValues] = useState(empty);
  const [touched, setTouched] = useState(false);
  const [serverErrors, setServerErrors] = useState<Errors>({});
  const [failed, setFailed] = useState(false);

  const errors = validate(values);
  const valid = Object.values(errors).every((error) => !error);
  const errorOf = (key: Key) =>
    serverErrors[key] ?? (touched ? errors[key] : undefined);

  const change = (key: Key) => (value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setServerErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    setFailed(false);
    if (!valid || isPending) return;
    try {
      await updatePassword(values);
      setValues(empty);
      setTouched(false);
      toast.show('비밀번호를 바꿨어요');
    } catch (err) {
      console.error(err);
      const code = axios.isAxiosError(err) ? err.response?.data?.code : null;
      if (code && SERVER_ERRORS[code]) setServerErrors(SERVER_ERRORS[code]);
      else setFailed(true);
    }
  };

  const fields: {
    key: Key;
    label: string;
    autoComplete: string;
    hint?: string;
  }[] = [
    {
      key: 'password',
      label: '현재 비밀번호',
      autoComplete: 'current-password',
    },
    {
      key: 'newPassword',
      label: '새 비밀번호',
      autoComplete: 'new-password',
      hint: PASSWORD_HINT,
    },
    {
      key: 'newPasswordCf',
      label: '새 비밀번호 확인',
      autoComplete: 'new-password',
    },
  ];

  return (
    <AccountLayout view="password">
      <form
        noValidate
        onSubmit={submit}
        className="flex flex-1 flex-col gap-[18px] bg-surface px-4 py-6 md:max-w-[420px] md:p-0"
      >
        {fields.map(({ key, label, autoComplete, hint }) => (
          <Field key={key} label={label} hint={hint} error={errorOf(key)}>
            <Input
              type="password"
              value={values[key]}
              autoComplete={autoComplete}
              className="h-12 md:h-[46px]"
              onChange={(e) => change(key)(e.target.value)}
            />
          </Field>
        ))}
        {failed && (
          <p role="alert" className="text-label font-normal text-danger">
            비밀번호를 바꾸지 못했어요. 잠시 후 다시 시도해 주세요.
          </p>
        )}
        <div className="flex-1 md:hidden" />
        <Button
          type="submit"
          loading={isPending}
          disabled={touched && !valid}
          className="h-[52px] rounded-lg text-base font-bold md:mt-1.5 md:h-11 md:self-start md:rounded-md md:px-5 md:text-[15px] md:font-semibold"
        >
          비밀번호 바꾸기
        </Button>
      </form>
      <Toast message={toast.message} />
    </AccountLayout>
  );
}
