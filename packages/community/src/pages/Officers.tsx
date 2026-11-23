import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import CurrentGenerationCard from '~/components/Officers/CurrentGenerationCard';
import GenerationRow from '~/components/Officers/GenerationRow';
import OfficerEditor from '~/components/Officers/OfficerEditor';
import { filterGenerations } from '~/components/Officers/officerUtils';
import {
  OFFICERS_READ_GRADE,
  canSaveOfficers,
} from '~/components/Layout/constants';
import {
  BackButton,
  Button,
  EmptyState,
  Input,
  Skeleton,
  Toast,
  useToast,
} from '~/components/ui';
import useAuth from '~/hooks/useAuth';
import { useOfficers } from '~/hooks/queries/useOfficerQueries';
import type { OfficerGeneration } from '~/services/types';

const TITLE = '임원진';
const DESCRIPTION = '역대 회장단과 임원진을 기수별로 모아 봐요.';

type Editing = { generation?: OfficerGeneration } | null;

function ListSkeleton() {
  return (
    <ul aria-hidden>
      {Array.from({ length: 8 }, (_, index) => (
        <li
          key={index}
          className="flex min-h-13 items-center gap-3 border-b border-gray-100 px-4 md:px-5"
        >
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-4 w-28" />
        </li>
      ))}
    </ul>
  );
}

export default function Officers() {
  const { grade } = useAuth().authInfo.user;
  const canRead = grade <= OFFICERS_READ_GRADE;
  const {
    data: generations = [],
    isLoading,
    isError,
    refetch,
  } = useOfficers(canRead);
  const [query, setQuery] = useState('');
  const [openGenerations, setOpenGenerations] = useState<Set<number>>(
    () => new Set(),
  );
  const [editing, setEditing] = useState<Editing>(null);
  const toast = useToast();

  const searching = query.trim().length > 0;
  const [current, ...past] = generations;
  const latest = current?.generation ?? null;
  const canSave = (generation: number) =>
    canSaveOfficers(grade, generation, latest);
  const editor = (generation: OfficerGeneration) =>
    canSave(generation.generation)
      ? () => setEditing({ generation })
      : undefined;
  const results = filterGenerations(searching ? generations : past, query);

  const toggle = (generation: number) =>
    setOpenGenerations((opened) => {
      const next = new Set(opened);
      if (next.has(generation)) next.delete(generation);
      else next.add(generation);
      return next;
    });

  // 현 회장 can add only the next 기수, 운영진 any.
  const addButton = canSave((latest ?? 0) + 1) && (
    <Button
      variant="secondary"
      size="sm"
      onClick={() => setEditing({})}
      disabled={isLoading}
    >
      <Plus aria-hidden />
      기수 추가
    </Button>
  );

  let body;
  if (!canRead) {
    body = (
      <EmptyState
        title="회원만 볼 수 있어요"
        description="해왕성(8등급) 이상이면 볼 수 있어요."
      />
    );
  } else if (isError) {
    body = (
      <EmptyState
        title="임원진을 불러오지 못했어요"
        description="잠시 후 다시 시도해 주세요."
        action={
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            다시 시도
          </Button>
        }
      />
    );
  } else if (!isLoading && generations.length === 0) {
    body = <EmptyState title="아직 임원진 기록이 없어요" />;
  } else {
    body = (
      <div className="flex flex-col gap-4 md:grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:items-start md:gap-6">
        <div className="px-4 md:sticky md:top-22 md:px-0">
          {isLoading || !current ? (
            <Skeleton className="h-72 rounded-xl" />
          ) : (
            <CurrentGenerationCard
              generation={current}
              onEdit={editor(current)}
            />
          )}
        </div>
        {/* Not <section>: legacy SCSS styles bare section elements. */}
        <div
          role="region"
          aria-label="역대 임원진"
          className="flex flex-col bg-surface md:rounded-lg md:shadow-sm"
        >
          <div className="flex flex-col gap-3 border-b border-gray-100 px-4 pt-4 pb-3 md:px-5">
            <h2 className="text-heading">역대 임원진</h2>
            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-500"
                aria-hidden
              />
              <Input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="이름이나 직책으로 찾기"
                aria-label="이름이나 직책으로 찾기"
                className="pl-9"
              />
            </div>
          </div>
          {isLoading ? (
            <ListSkeleton />
          ) : results.length === 0 ? (
            <EmptyState
              title={
                searching ? '찾는 임원이 없어요' : '이전 기수 기록이 없어요'
              }
              description={
                searching ? '이름이나 직책을 다시 확인해 주세요.' : undefined
              }
            />
          ) : (
            <ul>
              {results.map((generation) => (
                <GenerationRow
                  key={generation.generation}
                  generation={generation}
                  // Search results open, so the matching role shows.
                  open={searching || openGenerations.has(generation.generation)}
                  onToggle={() => toggle(generation.generation)}
                  query={query}
                  onEdit={editor(generation)}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col pb-10 md:mx-auto md:w-full md:max-w-page md:gap-6 md:px-6 md:py-6">
      <div className="sticky top-0 z-20 mb-4 bg-surface md:hidden">
        <div className="flex h-[52px] items-center justify-between border-b border-gray-100 pt-safe-0 pr-3 pl-1">
          <BackButton />
          <h1 className="text-[15px] font-semibold">{TITLE}</h1>
          <div className="flex min-w-11 justify-end">{addButton}</div>
        </div>
      </div>
      <div className="hidden items-end justify-between gap-4 md:flex">
        <div className="flex flex-col gap-1">
          <h1 className="text-display">{TITLE}</h1>
          <p className="text-label font-normal text-fg-muted">{DESCRIPTION}</p>
        </div>
        {addButton}
      </div>
      {body}
      <OfficerEditor
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
        generation={editing?.generation}
        generations={generations}
        onDone={toast.show}
      />
      <Toast message={toast.message} />
    </div>
  );
}
