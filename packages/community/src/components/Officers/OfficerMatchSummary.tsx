import { X } from 'lucide-react';
import { cn } from '~/lib/utils';
import type { OfficerGeneration } from '~/services/types';
import { generationRowId, type OfficerMatch } from './officerUtils';

type OfficerMatchSummaryProps = {
  generations: OfficerGeneration[];
  query: string;
  matches: OfficerMatch[];
  onClear: () => void;
  className?: string;
};

const HINT = '이름을 누르면 그 사람이 지나온 기수를 별자리로 이어 줘요.';

function scrollToGeneration(generation: number) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.getElementById(generationRowId(generation))?.scrollIntoView({
    block: 'center',
    behavior: reduce ? 'auto' : 'smooth',
  });
}

/**
 * What the search found, one "92대 · 회장" per 기수, each scrolling to its
 * row; before a search, the range of the record and a hint.
 */
export default function OfficerMatchSummary({
  generations,
  query,
  matches,
  onClear,
  className,
}: OfficerMatchSummaryProps) {
  const text = query.trim();
  const newest = generations[0]?.generation;
  const oldest = generations[generations.length - 1]?.generation;

  return (
    <div
      role="region"
      aria-label="찾은 기록"
      aria-live="polite"
      className={cn('flex flex-col gap-3', className)}
    >
      {!text ? (
        <>
          <p className="hidden text-label font-normal text-fg-on-brand-muted md:block">
            {oldest}대부터 {newest}대까지 {generations.length}개 기수
          </p>
          <p className="text-caption text-fg-on-brand-muted md:text-label md:font-normal">
            {HINT}
          </p>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3">
            <p className="min-w-0 truncate text-label font-normal text-fg-on-brand-muted">
              <span className="font-semibold text-fg-on-brand">{text}</span>
              {matches.length > 0
                ? ` · ${matches.length}개 기수에서 찾았어요`
                : ' · 찾는 임원이 없어요'}
            </p>
            <button
              type="button"
              onClick={onClear}
              className="-my-2 flex min-h-11 shrink-0 items-center gap-1 text-label text-fg-on-brand-muted hover:text-fg-on-brand"
            >
              <X className="size-4" aria-hidden />
              지우기
            </button>
          </div>
          {matches.length > 0 && (
            // A swipeable row on mobile, a list on desktop.
            <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-col md:gap-0 md:overflow-visible md:px-0 md:pb-0">
              {matches.map((match) => (
                <li key={match.generation} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => scrollToGeneration(match.generation)}
                    className="flex min-h-9 items-center gap-2 rounded-full border border-fg-on-brand/15 px-3 text-label whitespace-nowrap text-fg-on-brand hover:bg-fg-on-brand/10 md:min-h-10 md:w-full md:rounded-md md:border-0 md:px-2"
                  >
                    <span
                      className="size-1.5 shrink-0 rounded-full bg-accent"
                      aria-hidden
                    />
                    <span className="tabular-nums">{match.generation}대</span>
                    {match.roles.length > 0 && (
                      <span className="font-normal text-fg-on-brand-muted">
                        {match.roles.join(', ')}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
