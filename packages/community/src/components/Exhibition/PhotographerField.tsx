import { useEffect, useId, useState } from 'react';
import { X } from 'lucide-react';
import { Avatar, Input } from '~/components/ui';
import { useSearchMini } from '~/hooks/queries/useUserQueries';
import { ExhibitPhotoInfo } from '~/services/ExhibitPhotoService';
import { User } from '~/services/types';

/** Waits this long after typing before searching members. */
const SEARCH_DELAY = 300;

export type Photographer = NonNullable<ExhibitPhotoInfo['photographer']>;

type PhotographerFieldProps = {
  photographer?: Photographer;
  /** The typed name, kept when no member is picked. */
  name: string;
  onChange: (next: { photographer?: Photographer; name: string }) => void;
};

/**
 * 작가: a member picked from a search, or a plain name for someone
 * without an account.
 */
export default function PhotographerField({
  photographer,
  name,
  onChange,
}: PhotographerFieldProps) {
  const inputId = useId();
  const { mutateAsync: searchUsers } = useSearchMini();
  const [results, setResults] = useState<User[]>([]);

  // Suggest members while a name is typed and none is picked.
  useEffect(() => {
    const query = name.trim();
    if (photographer || !query) {
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
  }, [name, photographer, searchUsers]);

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-label">
        작가
      </label>
      {photographer ? (
        <div className="flex h-12 items-center gap-2.5 rounded-md border border-border px-3">
          <Avatar user={photographer} size={28} />
          <span className="min-w-0 flex-1 truncate text-sm font-semibold">
            {photographer.nickname}
          </span>
          <button
            type="button"
            aria-label="작가 지우기"
            onClick={() => onChange({ photographer: undefined, name: '' })}
            className="flex size-8 items-center justify-center rounded-full text-gray-700 hover:bg-gray-100"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Input
            id={inputId}
            autoComplete="off"
            placeholder="회원 닉네임, 또는 이름"
            value={name}
            onChange={(e) => onChange({ name: e.target.value })}
          />
          {results.length > 0 && (
            <ul
              aria-label="회원 검색 결과"
              className="absolute inset-x-0 top-full z-10 mt-1 max-h-56 overflow-y-auto rounded-md border border-border bg-surface py-1 shadow-lg"
            >
              {results.map((user) => (
                <li key={user.user_uuid}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange({ photographer: user, name });
                      setResults([]);
                    }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    <Avatar user={user} size={28} />
                    <span className="truncate">{user.nickname}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <p className="text-caption text-fg-muted">
        회원을 고르면 작가 페이지로 이어져요. 회원이 아니면 이름만 적어 두세요.
      </p>
    </div>
  );
}
