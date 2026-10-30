import { useState, type FormEvent } from 'react';
import { Mail } from 'lucide-react';

import { Button, Field, Input, SegmentedControl, Sheet } from '~/components/ui';
import { useFindId, useFindPassword } from '~/hooks/queries/useUserQueries';

type Mode = 'id' | 'pw';

type FindAccountSheetProps = {
  open: boolean;
  onClose: () => void;
};

const empty = { id: '', name: '', email: '' };

/** 아이디 찾기 / 비밀번호 찾기: the API mails the id or a temporary password. */
export default function FindAccountSheet({
  open,
  onClose,
}: FindAccountSheetProps) {
  const [mode, setMode] = useState<Mode>('id');
  const [form, setForm] = useState(empty);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { mutateAsync: findId, isPending: findingId } = useFindId();
  const { mutateAsync: findPassword, isPending: findingPassword } =
    useFindPassword();
  const isPw = mode === 'pw';

  const close = () => {
    setForm(empty);
    setSent(false);
    setError(null);
    onClose();
  };

  const submit = async (e?: FormEvent) => {
    e?.preventDefault();
    const name = form.name.trim();
    const email = form.email.trim();
    if (!name || !email || (isPw && !form.id.trim())) {
      setError('모든 칸을 입력해 주세요');
      return;
    }
    setError(null);
    try {
      if (isPw) await findPassword({ id: form.id.trim(), name, email });
      else await findId({ name, email });
      setSent(true);
    } catch (err) {
      console.error(err);
      setError(
        isPw
          ? '입력한 정보와 맞는 계정이 없어요'
          : '입력한 정보와 맞는 아이디가 없어요',
      );
    }
  };

  const set = (key: keyof typeof empty) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => !next && close()}
      title="계정 찾기"
      footer={
        sent ? (
          <Button
            block
            onClick={close}
            className="h-[52px] rounded-lg text-base font-bold"
          >
            로그인하러 가기
          </Button>
        ) : (
          <Button
            block
            onClick={() => submit()}
            loading={findingId || findingPassword}
            className="h-[52px] rounded-lg text-base font-bold"
          >
            {isPw ? '임시 비밀번호 받기' : '아이디 받기'}
          </Button>
        )
      }
    >
      {sent ? (
        <div className="flex flex-col items-center gap-2.5 py-6 text-center">
          <span className="flex size-15 items-center justify-center rounded-full bg-info-soft text-navy-700">
            <Mail className="size-[26px]" strokeWidth={1.8} />
          </span>
          <p className="text-heading">메일을 보냈어요</p>
          <p className="text-sm leading-relaxed text-gray-700">
            {isPw ? (
              <>
                가입한 이메일로 임시 비밀번호를 보냈어요.
                <br />
                로그인한 뒤 비밀번호를 바꿔 주세요.
              </>
            ) : (
              '가입한 이메일로 아이디를 보냈어요.'
            )}
          </p>
        </div>
      ) : (
        <form
          onSubmit={submit}
          noValidate
          className="flex flex-col gap-3.5 pb-2 md:px-2"
        >
          <SegmentedControl
            aria-label="찾을 항목"
            value={mode}
            onValueChange={(next) => {
              setMode(next);
              setError(null);
            }}
            options={[
              { value: 'id', label: '아이디 찾기' },
              { value: 'pw', label: '비밀번호 찾기' },
            ]}
            className="w-full [&>*]:flex-1"
          />
          <p className="text-label leading-normal font-normal text-gray-700">
            정보가 맞으면 {isPw ? '임시 비밀번호를' : '아이디를'} 이메일로 보내
            드려요.
          </p>
          {isPw && (
            <Field label="아이디">
              <Input
                autoComplete="username"
                autoCapitalize="none"
                value={form.id}
                onChange={(e) => set('id')(e.target.value)}
              />
            </Field>
          )}
          <Field label="이름">
            <Input
              autoComplete="name"
              value={form.name}
              onChange={(e) => set('name')(e.target.value)}
            />
          </Field>
          <Field label="가입한 이메일">
            <Input
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => set('email')(e.target.value)}
            />
          </Field>
          {error && (
            <p role="alert" className="text-label font-normal text-danger">
              {error}
            </p>
          )}
          {/* Enter submits from any field. */}
          <button type="submit" hidden />
        </form>
      )}
    </Sheet>
  );
}
