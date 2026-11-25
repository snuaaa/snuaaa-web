import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Avatar, Button, Field, Input, Sheet } from '~/components/ui';
import { useHandOver } from '~/hooks/queries/useOfficerQueries';
import { useSearchMini } from '~/hooks/queries/useUserQueries';
import type { OfficerGeneration, User } from '~/services/types';

/** Waits this long after typing before searching members. */
const SEARCH_DELAY = 300;

type HandOverSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The newest 기수, the one that ends. */
  latest?: OfficerGeneration;
  onDone: (message: string) => void;
};

/**
 * 회기 넘기기: pick the next 회장 from the members. 현 회장 becomes 화성,
 * the new 회장 becomes 목성, and the next 기수 starts.
 */
export default function HandOverSheet(props: HandOverSheetProps) {
  // Remount on every open so the search starts empty.
  return props.open ? <HandOverForm {...props} /> : null;
}

function HandOverForm({
  open,
  onOpenChange,
  latest,
  onDone,
}: HandOverSheetProps) {
  const [name, setName] = useState('');
  const [picked, setPicked] = useState<User>();
  const [results, setResults] = useState<User[]>([]);
  const { mutateAsync: searchUsers } = useSearchMini();
  const handOver = useHandOver();
  const next = (latest?.generation ?? 0) + 1;

  useEffect(() => {
    const query = name.trim();
    if (picked || !query) {
      setResults([]);
      return;
    }
    let active = true;
    const timer = setTimeout(async () => {
      try {
        const res = await searchUsers(query);
        if (active) setResults(res.userList);
      } catch (err) {
        console.error(err);
      }
    }, SEARCH_DELAY);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [name, picked, searchUsers]);

  const submit = () => {
    if (!picked) return;
    handOver.mutate(picked.user_uuid, {
      onSuccess: () => {
        onOpenChange(false);
        onDone(`${next}대를 시작했어요`);
      },
    });
  };

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="회기 넘기기"
      description={`${latest ? `${latest.generation}대를 마치고 ` : ''}${next}대를 시작해요.`}
      footer={
        <div className="flex w-full flex-col gap-2">
          {handOver.isError && (
            <p className="text-caption text-danger">
              넘기지 못했어요. 잠시 후 다시 시도해 주세요.
            </p>
          )}
          <Button
            block
            onClick={submit}
            disabled={!picked || handOver.isPending}
          >
            {next}대로 넘기기
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {picked ? (
          <div className="flex flex-col gap-1.5">
            <span className="text-label">새 회장</span>
            <div className="flex h-12 items-center gap-2.5 rounded-md border border-border px-3">
              <Avatar user={picked} size={28} />
              <span className="min-w-0 flex-1 truncate text-body font-semibold">
                {picked.username}
                <span className="ml-1.5 font-normal text-fg-muted">
                  {picked.nickname}
                </span>
              </span>
              <button
                type="button"
                aria-label="새 회장 다시 고르기"
                onClick={() => setPicked(undefined)}
                className="flex size-8 items-center justify-center rounded-full text-gray-700 hover:bg-gray-100"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        ) : (
          <Field label="새 회장" hint="이름으로 회원을 찾아 골라 주세요.">
            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-500"
                aria-hidden
              />
              <Input
                autoComplete="off"
                placeholder="이름"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="pl-9"
              />
            </div>
          </Field>
        )}
        {!picked && results.length > 0 && (
          <ul aria-label="회원 검색 결과" className="-mt-2 flex flex-col">
            {results.map((user) => (
              <li key={user.user_uuid}>
                <button
                  type="button"
                  onClick={() => setPicked(user)}
                  className="flex min-h-12 w-full items-center gap-2.5 rounded-md px-2 text-left hover:bg-gray-50"
                >
                  <Avatar user={user} size={28} />
                  <span className="truncate text-body">{user.username}</span>
                  <span className="truncate text-label font-normal text-fg-muted">
                    {user.nickname}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <ul className="flex list-disc flex-col gap-1 rounded-md bg-surface-sunken py-3 pr-3 pl-7 text-label font-normal text-fg-muted">
          <li>
            {latest ? `${latest.president} 님(현 회장)` : '현 회장'}은 화성(전
            회장)이 돼요.
          </li>
          <li>
            {picked?.username ? `${picked.username} 님` : '새 회장'}은 목성(현
            회장)이 되고, {next}대 임원진을 채울 수 있어요.
          </li>
          <li>지금 임원(토성)은 모두 천왕성이 돼요.</li>
        </ul>
      </div>
    </Sheet>
  );
}
