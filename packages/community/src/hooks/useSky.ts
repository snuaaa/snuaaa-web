import { useEffect, useState } from 'react';
import { skyAt, type Sky } from '~/components/Home/skyColors';
import { useRiseSet } from '~/hooks/queries/useHomeQueries';
import { useObservationMode } from '~/hooks/useObservationMode';

/** The current time, ticking once a minute (the sky moves slowly). */
function useMinuteClock(enabled: boolean) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    if (!enabled) return;
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 60 * 1000);
    return () => window.clearInterval(id);
  }, [enabled]);
  return now;
}

/**
 * Today's sky for the home header (하늘 헤더), or undefined to keep the plain
 * navy: while the rise/set times load, and in 관측 모드, whose red-light
 * filter would turn the sky's colors into bright red.
 */
export function useSky({ enabled = true } = {}): Sky | undefined {
  const { data: riseSet } = useRiseSet({ enabled });
  const { on: observing } = useObservationMode();
  const now = useMinuteClock(enabled);
  if (!enabled || !riseSet || observing) return undefined;
  return skyAt(riseSet, now);
}
