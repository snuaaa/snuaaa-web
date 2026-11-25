import { useLayoutEffect, useRef, useState } from 'react';
import { Pencil } from 'lucide-react';
import { Button } from '~/components/ui';
import { cn } from '~/lib/utils';
import type { OfficerGeneration } from '~/services/types';
import Highlight from './Highlight';
import { generationRowId, type OfficerMatch } from './officerUtils';

type Point = { x: number; y: number };

/** Each star sits a little left or right in its lane, so the line between
 *  them zigzags like a constellation; fixed per 기수, so it never jumps. */
const starOffset = (generation: number) => ((generation * 7) % 5) * 5;

const toPath = (points: Point[]) =>
  points.map(({ x, y }, index) => `${index ? 'L' : 'M'}${x} ${y}`).join(' ');

type OfficerTimelineProps = {
  generations: OfficerGeneration[];
  /** Search text; rows without it dim and the matches are joined. */
  query: string;
  matches: OfficerMatch[];
  onSelectName: (name: string) => void;
  /** The edit action for a 기수, when the signed-in user may edit it. */
  editor: (generation: OfficerGeneration) => (() => void) | undefined;
};

/**
 * Every 기수 as a star on one vertical line, newest first. With a search,
 * the 기수 it matches light up and are joined into their own constellation.
 */
export default function OfficerTimeline({
  generations,
  query,
  matches,
  onSelectName,
  editor,
}: OfficerTimelineProps) {
  const listRef = useRef<HTMLOListElement>(null);
  const stars = useRef(new Map<number, HTMLSpanElement>());
  const [points, setPoints] = useState(new Map<number, Point>());
  const searching = query.trim().length > 0;
  const matched = new Map(matches.map((match) => [match.generation, match]));
  const latest = generations[0]?.generation;

  // Star centers, measured, since the rows wrap to different heights.
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = () => {
      const box = list.getBoundingClientRect();
      const next = new Map<number, Point>();
      stars.current.forEach((star, generation) => {
        const rect = star.getBoundingClientRect();
        next.set(generation, {
          x: rect.left + rect.width / 2 - box.left,
          y: rect.top + rect.height / 2 - box.top,
        });
      });
      setPoints(next);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, [generations]);

  const pointsOf = (list: number[]) =>
    list.flatMap((generation) => points.get(generation) ?? []);
  const allPath = toPath(pointsOf(generations.map((g) => g.generation)));
  const matchedPoints = pointsOf(matches.map((match) => match.generation));

  return (
    <ol ref={listRef} aria-label="기수 타임라인" className="relative">
      <svg
        className="pointer-events-none absolute inset-0 size-full overflow-visible"
        aria-hidden
      >
        <path
          d={allPath}
          fill="none"
          strokeWidth={1}
          className="stroke-fg-on-brand/15"
        />
        {matchedPoints.length > 1 && (
          <path
            // Redrawn for every new search.
            key={query}
            d={toPath(matchedPoints)}
            fill="none"
            strokeWidth={1.5}
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray="1"
            className="animate-constellation-draw stroke-accent motion-reduce:animate-none"
          />
        )}
      </svg>
      {generations.map((generation) => {
        const match = matched.get(generation.generation);
        const lit = searching && Boolean(match);
        const isLatest = generation.generation === latest;
        const asPresident = match?.roles.includes('회장');
        const onEdit = editor(generation);
        return (
          <li
            key={generation.generation}
            id={generationRowId(generation.generation)}
            className={cn(
              'relative grid scroll-mt-40 grid-cols-[2.75rem_2.5rem_minmax(0,1fr)_auto] items-start gap-x-1.5 py-3 transition-opacity duration-(--duration-base) ease-night motion-reduce:transition-none md:scroll-mt-24',
              searching && !lit && 'opacity-35',
            )}
          >
            <span
              className={cn(
                'pt-1 text-right text-label tabular-nums',
                isLatest || lit ? 'text-fg-on-brand' : 'text-fg-on-brand-muted',
              )}
            >
              {generation.generation}대
            </span>
            <span className="relative h-8" aria-hidden>
              <span
                ref={(star) => {
                  if (star) stars.current.set(generation.generation, star);
                  else stars.current.delete(generation.generation);
                }}
                style={{ left: 10 + starOffset(generation.generation) }}
                className={cn(
                  'absolute top-1/2 -translate-1/2 rounded-full transition-[width,height,background-color,box-shadow] duration-(--duration-base) ease-night motion-reduce:transition-none',
                  lit
                    ? cn(
                        'bg-accent shadow-[0_0_12px_2px_var(--color-accent)]',
                        asPresident ? 'size-3' : 'size-2',
                      )
                    : isLatest && !searching
                      ? 'size-3 bg-accent shadow-[0_0_14px_3px_var(--color-accent)]'
                      : 'size-1.5 bg-fg-on-brand/70',
                )}
              />
            </span>
            <div className="flex min-w-0 flex-col gap-1.5">
              <p className="flex flex-wrap items-baseline gap-x-2">
                <NameButton
                  name={generation.president}
                  query={query}
                  onSelect={onSelectName}
                  className="text-heading"
                />
                <span className="text-label font-normal text-fg-on-brand-muted">
                  회장
                </span>
                {isLatest && (
                  <span className="text-caption font-semibold text-accent">
                    지금
                  </span>
                )}
              </p>
              {generation.roles.length > 0 && (
                <p className="flex flex-wrap gap-x-3.5 gap-y-1 text-label font-normal">
                  {generation.roles.map((role, index) => (
                    <span
                      key={`${role.role}-${index}`}
                      className="inline-flex flex-wrap items-baseline gap-x-1.5"
                    >
                      <span className="text-fg-on-brand-muted">
                        <Highlight text={role.role} query={query} />
                      </span>
                      {role.names.map((name, nameIndex) => (
                        <NameButton
                          key={`${name}-${nameIndex}`}
                          name={name}
                          query={query}
                          onSelect={onSelectName}
                        />
                      ))}
                    </span>
                  ))}
                </p>
              )}
            </div>
            {onEdit ? (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onEdit}
                aria-label={`${generation.generation}대 수정`}
                className="-mt-0.5 text-fg-on-brand-muted hover:bg-fg-on-brand/10 hover:text-fg-on-brand"
              >
                <Pencil aria-hidden />
              </Button>
            ) : (
              <span />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function NameButton({
  name,
  query,
  onSelect,
  className,
}: {
  name: string;
  query: string;
  onSelect: (name: string) => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(name)}
      className={cn(
        'rounded-sm text-fg-on-brand decoration-accent decoration-2 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        className,
      )}
    >
      <Highlight text={name} query={query} />
    </button>
  );
}
