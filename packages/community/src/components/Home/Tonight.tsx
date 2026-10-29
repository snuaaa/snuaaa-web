import { useState } from 'react';
import { ChevronRight, Moon } from 'lucide-react';
import { Sheet } from '~/components/ui';
import { useRiseSet } from '~/hooks/queries/useHomeQueries';
import { convertDateWithDay, convertTime } from '~/utils/convertDate';

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
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between text-caption text-fg-muted">
        <span>{convertDateWithDay(new Date())} · 서울 기준</span>
        <span>월령 {lunAge ?? '-'}</span>
      </div>
      <dl className="grid grid-cols-2 gap-2">
        {rows.map(({ label, time }) => (
          <div
            key={label}
            className="flex items-center justify-between rounded-md bg-surface-sunken px-3 py-2.5"
          >
            <dt className="text-caption text-fg-muted">{label}</dt>
            <dd className="text-sm font-semibold tabular-nums">{time}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** Mobile home header row; opens the full rise/set table in a sheet. */
export function TonightStrip() {
  const [open, setOpen] = useState(false);
  const { summary } = useTonightRows();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex min-h-11 w-full items-center gap-2.5 rounded-md bg-surface-brand-raised px-3 text-left text-fg-on-brand"
      >
        <Moon className="size-[18px] shrink-0 text-accent" aria-hidden />
        <span className="text-label">오늘 밤</span>
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

/** Desktop home side card with the same table, always open. */
export function TonightCard() {
  return (
    <div className="flex flex-col gap-4 rounded-lg bg-surface p-5 shadow-sm">
      <h2 className="flex items-center gap-2 text-heading">
        <Moon className="size-5 text-star-600" aria-hidden />
        오늘 밤
      </h2>
      <TonightDetails />
    </div>
  );
}
