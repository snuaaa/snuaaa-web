import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Sheet } from '~/components/ui';
import { useRiseSet } from '~/hooks/queries/useHomeQueries';
import { cn } from '~/lib/utils';
import { convertDateWithDay, convertTime } from '~/utils/convertDate';
import MoonPhase from './MoonPhase';
import { SunArc } from './Sky';
import type { Sky } from './skyColors';

function useTonightRows() {
  const { data: riseSet } = useRiseSet();
  return {
    lunAge: riseSet?.lunAge,
    rows: [
      ['일출', riseSet?.sunrise],
      ['일몰', riseSet?.sunset],
      ['월출', riseSet?.moonrise],
      ['월몰', riseSet?.moonset],
      ['천문박명 끝', riseSet?.aste],
      ['천문박명 시작', riseSet?.astm],
    ].map(([label, time]) => ({
      label: label as string,
      time: convertTime(time) as string,
    })),
    summary: [
      ['일몰', riseSet?.sunset],
      ['박명', riseSet?.aste],
      ['월몰', riseSet?.moonset],
    ].map(([label, time]) => `${label} ${convertTime(time)}`),
  };
}

function TonightDetails() {
  const { lunAge, rows } = useTonightRows();
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <MoonPhase lunAge={lunAge} size={64} shadeClassName="fill-navy-100" />
        <div className="flex flex-col gap-0.5">
          <span className="text-body font-semibold">월령 {lunAge ?? '-'}</span>
          <span className="text-caption text-fg-muted">
            {convertDateWithDay(new Date())} · 서울 기준
          </span>
        </div>
      </div>
      <RiseSetGrid rows={rows} className="grid-cols-2" />
    </div>
  );
}

function RiseSetGrid({
  rows,
  brand = false,
  className,
}: {
  rows: { label: string; time: string }[];
  brand?: boolean;
  className?: string;
}) {
  return (
    <dl className={cn('grid gap-2', className)}>
      {rows.map(({ label, time }) => (
        <div
          key={label}
          className={cn(
            'flex rounded-md px-3',
            brand
              ? 'flex-col gap-0.5 bg-surface-brand py-2'
              : 'items-center justify-between bg-surface-sunken py-2.5',
          )}
        >
          <dt
            className={cn(
              'text-caption',
              brand ? 'text-fg-on-brand-muted' : 'text-fg-muted',
            )}
          >
            {label}
          </dt>
          <dd
            className={cn(
              'font-semibold tabular-nums',
              brand ? 'text-body' : 'text-sm',
            )}
          >
            {time}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Mobile home header row; opens the full rise/set table in a sheet. */
export function TonightStrip() {
  const [open, setOpen] = useState(false);
  const { lunAge, summary } = useTonightRows();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex min-h-11 w-full items-center gap-2.5 rounded-md bg-surface-brand-raised px-3 text-left text-fg-on-brand"
      >
        <MoonPhase
          lunAge={lunAge}
          size={20}
          shadeClassName="fill-navy-700"
          className="pointer-events-none"
        />
        <span className="shrink-0 text-label tabular-nums">
          {lunAge === undefined ? '월령 -' : `월령 ${Math.round(lunAge)}일`}
        </span>
        <span className="flex flex-1 flex-wrap gap-x-2.5 text-label font-normal text-navy-200 tabular-nums">
          {summary.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </span>
        <ChevronRight className="size-4 shrink-0 text-navy-300" aria-hidden />
      </button>
      <Sheet open={open} onOpenChange={setOpen} title="오늘 밤">
        <div className="px-1 pb-2">
          <TonightDetails />
        </div>
      </Sheet>
    </>
  );
}

/**
 * Desktop home band card: the moon beside the rise/set table. Under the
 * 하늘 헤더 it also tells what the sky is doing and where the sun is.
 */
export function TonightCard({ sky }: { sky?: Sky }) {
  const { lunAge, rows } = useTonightRows();
  return (
    <div className="flex items-center gap-5 rounded-lg bg-surface-brand-raised px-5 py-[18px] text-fg-on-brand">
      <div className="flex w-24 shrink-0 flex-col items-center gap-2">
        <MoonPhase lunAge={lunAge} size={80} />
        <span className="text-caption text-navy-200 tabular-nums">
          월령 {lunAge ?? '-'}
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-baseline gap-2">
          <h2 className="text-body font-bold">오늘 밤</h2>
          <span className="text-caption text-fg-on-brand-muted">
            {convertDateWithDay(new Date())} · 서울 기준
          </span>
          {sky && (
            <span className="ml-auto shrink-0 text-caption text-navy-200">
              {sky.label}
            </span>
          )}
        </div>
        {sky && <SunArc sky={sky} />}
        <RiseSetGrid rows={rows} brand className="grid-cols-3" />
      </div>
    </div>
  );
}
