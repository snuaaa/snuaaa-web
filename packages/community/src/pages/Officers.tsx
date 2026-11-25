import { useState } from 'react';
import { ArrowRightLeft, Plus, Search } from 'lucide-react';
import HandOverSheet from '~/components/Officers/HandOverSheet';
import OfficerEditor from '~/components/Officers/OfficerEditor';
import OfficerMatchSummary from '~/components/Officers/OfficerMatchSummary';
import OfficerTimeline from '~/components/Officers/OfficerTimeline';
import { findMatches } from '~/components/Officers/officerUtils';
import {
  canHandOver,
  canSaveOfficers,
  isOfficersManager,
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

const TITLE = '역대 임원진';
const DESCRIPTION = '회장단과 임원진을 기수별로 모아 봐요.';

type Editing = { generation?: OfficerGeneration } | null;

function TimelineSkeleton() {
  return (
    <ul aria-hidden className="flex flex-col">
      {Array.from({ length: 8 }, (_, index) => (
        <li
          key={index}
          className="grid grid-cols-[2.75rem_2.5rem_minmax(0,1fr)] gap-x-1.5 py-3"
        >
          <Skeleton className="mt-1 ml-auto h-4 w-8 bg-fg-on-brand/10" />
          <span />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-20 bg-fg-on-brand/10" />
            <Skeleton className="h-4 w-4/5 bg-fg-on-brand/10" />
          </div>
        </li>
      ))}
    </ul>
  );
}

/**
 * 역대 임원진 as a night sky: one star per 기수 down a timeline. Tapping a
 * name searches for it, and the 기수 that person served in are joined into
 * a constellation.
 */
export default function Officers() {
  const { user } = useAuth().authInfo;
  const { data: generations = [], isLoading, isError, refetch } = useOfficers();
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<Editing>(null);
  const [handingOver, setHandingOver] = useState(false);
  const toast = useToast();

  const latest = generations[0];
  const canSave = (generation: number) =>
    canSaveOfficers(user, generation, latest);
  const editor = (generation: OfficerGeneration) =>
    canSave(generation.generation)
      ? () => setEditing({ generation })
      : undefined;
  const matches = findMatches(generations, query);

  // 운영진 may add any 기수 by hand; a new term starts with 회기 넘기기.
  const actions = (
    <>
      {canHandOver(user, latest) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setHandingOver(true)}
          disabled={isLoading}
          className="text-fg-on-brand hover:bg-fg-on-brand/10"
        >
          <ArrowRightLeft aria-hidden />
          회기 넘기기
        </Button>
      )}
      {isOfficersManager(user.grade) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setEditing({})}
          disabled={isLoading}
          className="hidden text-fg-on-brand hover:bg-fg-on-brand/10 md:inline-flex"
        >
          <Plus aria-hidden />
          기수 추가
        </Button>
      )}
    </>
  );

  const search = (
    <div className="relative">
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-fg-on-brand-muted"
        aria-hidden
      />
      <Input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="이름이나 직책으로 찾기"
        aria-label="이름이나 직책으로 찾기"
        className="border-fg-on-brand/15 bg-surface-brand-raised pl-9 text-fg-on-brand placeholder:text-fg-on-brand-muted focus:border-accent focus:shadow-none"
      />
    </div>
  );

  const summary = (
    <OfficerMatchSummary
      generations={generations}
      query={query}
      matches={matches}
      onClear={() => setQuery('')}
    />
  );

  let body;
  if (isError) {
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
      <div className="flex flex-col md:grid md:grid-cols-[minmax(0,1fr)_18rem] md:items-start md:gap-10">
        {/* Search and summary stay in view while the timeline scrolls. */}
        <div className="sticky top-[calc(52px+env(safe-area-inset-top))] z-10 flex flex-col gap-3 bg-surface-brand px-4 pt-1 pb-3 md:top-22 md:order-2 md:px-0 md:pt-0">
          {search}
          {!isLoading && summary}
        </div>
        <div className="px-3 md:order-1 md:px-0">
          {isLoading ? (
            <TimelineSkeleton />
          ) : (
            <OfficerTimeline
              generations={generations}
              query={query}
              matches={matches}
              onSelectName={setQuery}
              editor={editor}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:mx-auto md:w-full md:max-w-page md:px-6 md:py-6">
      <div className="flex min-h-dvh flex-col bg-surface-brand pb-10 text-fg-on-brand md:min-h-0 md:gap-6 md:rounded-xl md:p-8">
        <div className="sticky top-0 z-20 bg-surface-brand md:hidden">
          <div className="flex h-[52px] items-center justify-between pt-safe-0 pr-3 pl-1">
            <BackButton />
            <h1 className="text-[15px] font-semibold">{TITLE}</h1>
            <div className="flex min-w-11 justify-end">{actions}</div>
          </div>
        </div>
        <div className="hidden items-end justify-between gap-4 md:flex">
          <div className="flex flex-col gap-1">
            <h1 className="text-display">{TITLE}</h1>
            <p className="text-label font-normal text-fg-on-brand-muted">
              {DESCRIPTION}
            </p>
          </div>
          <div className="flex gap-1">{actions}</div>
        </div>
        {body}
      </div>
      <OfficerEditor
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
        generation={editing?.generation}
        generations={generations}
        onDone={toast.show}
      />
      <HandOverSheet
        open={handingOver}
        onOpenChange={setHandingOver}
        latest={latest}
        onDone={toast.show}
      />
      <Toast message={toast.message} />
    </div>
  );
}
