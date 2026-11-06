import { useState, type FormEvent, type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { Camera, ChevronRight, Loader2 } from 'lucide-react';

import { canManageUsers } from '~/components/Layout/constants';
import {
  Avatar,
  Button,
  Field,
  Input,
  Textarea,
  Toast,
  useToast,
} from '~/components/ui';
import { useAuth } from '~/contexts/auth';
import {
  useMyUserInfo,
  useUpdateMyUserInfo,
} from '~/hooks/queries/useUserQueries';
import { cn } from '~/lib/utils';
import { User } from '~/services/types';
import UploadService from '~/services/UploadService';
import { UpdateUserInfoRequest } from '~/services/UserService';
import AccountLayout from './AccountLayout';

const FORM_ID = 'profile-form';

type Values = Required<Omit<UpdateUserInfoRequest, 'profile_path'>>;

const initialValues = (user: User): Values => ({
  username: user.username ?? '',
  email: user.email ?? '',
  mobile: user.mobile ?? '',
  aaa_no: user.aaa_no ?? '',
  col_no: user.col_no ?? '',
  major: user.major ?? '',
  introduction: user.introduction ?? '',
  profile_url: user.profile_url ?? '',
});

// The same rules as 회원가입.
function validate(values: Values) {
  return {
    username: /^[가-힣]{2,6}$|^[A-Za-z ]{2,20}$/.test(values.username)
      ? undefined
      : '한글 2~6자나 영문 2~20자로 입력해 주세요.',
    email:
      /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)*$/.test(
        values.email,
      )
        ? undefined
        : '이메일 형식에 맞게 입력해 주세요.',
    mobile: /^[0-9]{1,8}-[0-9]{1,8}-[0-9]{1,8}$/.test(values.mobile)
      ? undefined
      : '010-0000-0000처럼 입력해 주세요.',
    aaa_no:
      values.aaa_no &&
      !/^[0-9]{2}[Aa]{3}-[0-9]{1,3}|[Aa]{3}[0-9]{2}-[0-9]{1,3}$/.test(
        values.aaa_no,
      )
        ? '00AAA-000처럼 입력해 주세요. 동아리 회원이 아니면 비워 두세요.'
        : undefined,
    col_no:
      values.col_no && !/^[0-9]{2}$/.test(values.col_no)
        ? '숫자 2자리로 입력해 주세요. (예: 26)'
        : undefined,
  };
}

function Section({
  title,
  className,
  children,
}: {
  title?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 bg-surface p-4 md:grid md:grid-cols-2 md:gap-x-5 md:gap-y-4 md:p-0',
        className,
      )}
    >
      {title && (
        <div className="text-label font-bold text-fg-muted md:col-span-2">
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

const rowClassName =
  'flex h-14 items-center justify-between border-b border-gray-100 px-4 text-[15px] last:border-b-0';

function Form({ user }: { user: User }) {
  const { authInfo, authLogout } = useAuth();
  const { mutateAsync: updateUser, isPending: saving } = useUpdateMyUserInfo();
  const toast = useToast();

  const [values, setValues] = useState(() => initialValues(user));
  const [touched, setTouched] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const errors = validate(values);
  const valid = Object.values(errors).every((error) => !error);
  const error = (key: keyof typeof errors) =>
    touched ? errors[key] : undefined;

  const set = (key: keyof Values) => (value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const uploadPhoto = async (file: File) => {
    setUploadError(false);
    setUploading(true);
    try {
      const { data } = await UploadService.uploadImage(file, 'profile', true);
      set('profile_url')(data.imgUrl);
    } catch (err) {
      console.error(err);
      setUploadError(true);
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!valid || saving || uploading) return;
    setSaveError(false);
    try {
      // profile_path goes back as it was, so it isn't cleared.
      await updateUser({ ...values, profile_path: user.profile_path });
      toast.show('프로필을 저장했어요');
    } catch (err) {
      console.error(err);
      setSaveError(true);
    }
  };

  const saveButton = (
    <Button
      type="submit"
      form={FORM_ID}
      size="sm"
      loading={saving}
      disabled={uploading || (touched && !valid)}
      className="md:h-10 md:px-[18px] md:text-sm"
    >
      저장
    </Button>
  );

  const preview = {
    ...user,
    profile_url: values.profile_url || user.profile_url,
  };

  return (
    <AccountLayout view="profile" action={saveButton}>
      <form
        id={FORM_ID}
        noValidate
        onSubmit={submit}
        className="flex flex-col gap-2 md:gap-6"
      >
        {saveError && (
          <p
            role="alert"
            className="mx-4 mt-2 rounded-md bg-danger-soft px-3.5 py-2.5 text-label font-normal text-danger md:mx-0 md:mt-0"
          >
            저장하지 못했어요. 잠시 후 다시 시도해 주세요.
          </p>
        )}

        <div className="flex flex-col items-center gap-2.5 bg-surface px-4 py-6 md:flex-row md:gap-5 md:border-b md:border-gray-100 md:p-0 md:pb-6">
          <div className="relative">
            <Avatar user={preview} size={80} showGrade className="size-24" />
            {uploading && (
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-navy-950/50 text-white">
                <Loader2
                  className="size-6 animate-spin"
                  aria-label="올리는 중"
                />
              </span>
            )}
            <label
              htmlFor="profile-photo"
              aria-label="프로필 사진 바꾸기"
              className="absolute -right-0.5 -bottom-0.5 flex size-9 cursor-pointer items-center justify-center rounded-full border-[3px] border-white bg-primary text-white md:hidden"
            >
              <Camera className="size-4" />
            </label>
          </div>
          <div className="flex flex-col items-center gap-1.5 md:items-start">
            <div className="text-lg font-bold">{user.nickname}</div>
            <div className="text-caption text-fg-muted">
              닉네임은 동아리번호와 이름으로 정해져요
            </div>
            <label
              htmlFor="profile-photo"
              className="mt-1 hidden h-9 cursor-pointer items-center rounded-md border border-gray-300 px-3.5 text-label hover:bg-gray-50 md:flex"
            >
              사진 바꾸기
            </label>
            {uploadError && (
              <p className="text-caption text-danger">
                사진을 올리지 못했어요. 다시 골라 주세요.
              </p>
            )}
          </div>
          <input
            id="profile-photo"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadPhoto(file);
              e.target.value = '';
            }}
          />
        </div>

        <Section title="기본 정보">
          <Field label="아이디">
            <Input value={user.id ?? ''} disabled />
          </Field>
          <Field label="이름" required error={error('username')}>
            <Input
              value={values.username}
              autoComplete="name"
              onChange={(e) => set('username')(e.target.value)}
            />
          </Field>
          <Field label="이메일" required error={error('email')}>
            <Input
              type="email"
              value={values.email}
              maxLength={30}
              autoComplete="email"
              onChange={(e) => set('email')(e.target.value)}
            />
          </Field>
          <Field label="휴대폰" required error={error('mobile')}>
            <Input
              type="tel"
              value={values.mobile}
              autoComplete="tel"
              placeholder="010-0000-0000"
              onChange={(e) => set('mobile')(e.target.value)}
            />
          </Field>
        </Section>

        <Section title="동아리 정보">
          <div className="grid grid-cols-2 gap-3 md:contents">
            <Field label="동아리번호" error={error('aaa_no')}>
              <Input
                value={values.aaa_no}
                placeholder="00AAA-000"
                onChange={(e) => set('aaa_no')(e.target.value)}
              />
            </Field>
            <Field label="학번" error={error('col_no')}>
              <Input
                value={values.col_no}
                inputMode="numeric"
                maxLength={2}
                placeholder="26"
                onChange={(e) => set('col_no')(e.target.value)}
              />
            </Field>
          </div>
          <Field label="전공">
            <Input
              value={values.major}
              onChange={(e) => set('major')(e.target.value)}
            />
          </Field>
          <Field label="자기소개" className="md:col-span-2">
            <Textarea
              value={values.introduction}
              rows={4}
              className="resize-none md:min-h-30"
              onChange={(e) => set('introduction')(e.target.value)}
            />
          </Field>
        </Section>
      </form>

      {/* Desktop keeps these in the header's 내 메뉴 and the side menu. */}
      <div className="mt-2 flex flex-col bg-surface md:hidden">
        <Link
          to="/mypage/$view"
          params={{ view: 'password' }}
          className={rowClassName}
        >
          비밀번호 변경
          <ChevronRight className="size-4 text-fg-muted" aria-hidden />
        </Link>
        {canManageUsers(authInfo.user.grade) && (
          <Link to="/admin/user" className={rowClassName}>
            회원 관리
            <ChevronRight className="size-4 text-fg-muted" aria-hidden />
          </Link>
        )}
        <button
          type="button"
          onClick={() => authLogout()}
          className={cn(rowClassName, 'text-left')}
        >
          로그아웃
        </button>
      </div>

      <Toast message={toast.message} />
    </AccountLayout>
  );
}

/** 프로필 수정. */
export default function ProfileForm() {
  const { data, isLoading } = useMyUserInfo();

  if (isLoading) {
    return (
      <AccountLayout view="profile">
        <div className="flex justify-center py-24">
          <Loader2
            className="size-6 animate-spin text-fg-muted"
            aria-label="불러오는 중"
          />
        </div>
      </AccountLayout>
    );
  }

  if (!data?.userInfo) {
    return (
      <AccountLayout view="profile">
        <p className="px-4 py-24 text-center text-label font-normal text-fg-muted">
          회원 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
        </p>
      </AccountLayout>
    );
  }

  return <Form user={data.userInfo} />;
}
