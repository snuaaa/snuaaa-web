import type { CSSProperties } from 'react';
import { cn } from '~/lib/utils';
import type { Sky } from './skyColors';

/** Fixed, hand-scattered stars, in percent of the sky's box. */
const STARS: [x: number, y: number, size: number, brightness: number][] = [
  [3, 21, 2, 0.8],
  [9, 9, 1, 0.5],
  [17, 36, 1.5, 0.7],
  [23, 17, 1, 0.4],
  [30, 48, 2, 0.9],
  [36, 7, 1, 0.5],
  [42, 29, 1, 0.4],
  [48, 14, 1.5, 0.6],
  [55, 43, 1, 0.3],
  [61, 21, 1, 0.4],
  [67, 7, 1, 0.3],
  [73, 33, 1, 0.5],
  [80, 17, 2.5, 0.9],
  [86, 45, 1, 0.3],
  [92, 12, 1, 0.3],
  [97, 29, 1, 0.25],
  [6, 60, 1.5, 0.3],
  [12, 79, 1, 0.25],
  [20, 67, 1, 0.3],
  [27, 86, 1, 0.3],
  [34, 71, 1, 0.4],
  [40, 90, 1.5, 0.5],
  [46, 62, 1, 0.4],
  [52, 81, 1, 0.3],
  [59, 57, 1, 0.6],
  [65, 88, 1, 0.3],
  [71, 69, 1, 0.5],
  [77, 83, 2, 0.5],
  [84, 64, 1, 0.3],
  [90, 79, 1, 0.4],
  [96, 60, 1.5, 0.5],
  [16, 5, 1, 0.6],
  [50, 2, 1, 0.5],
  [78, 4, 1, 0.4],
  [2, 43, 1, 0.4],
  [99, 48, 1, 0.3],
  [38, 57, 1, 0.3],
  [67, 52, 1, 0.35],
  [11, 33, 1, 0.45],
  [94, 90, 1, 0.3],
];

/**
 * Stars and the low glow behind a sky-filled element. The parent sets the
 * gradient (`skyStyle`) and must be `relative isolate`.
 */
export function SkyBackdrop({
  sky,
  className,
}: {
  sky?: Sky;
  className?: string;
}) {
  if (!sky) return null;
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0 -z-10 overflow-hidden',
        className,
      )}
    >
      {sky.starOpacity > 0.01 &&
        STARS.map(([x, y, size, brightness], i) => (
          <span
            key={i}
            className="absolute animate-twinkle rounded-full bg-white motion-reduce:animate-none"
            style={
              {
                left: `${x}%`,
                top: `${y}%`,
                width: size,
                height: size,
                '--star-opacity': (brightness * sky.starOpacity).toFixed(2),
                opacity: 'var(--star-opacity)',
                animationDuration: `${3 + (i % 5)}s`,
                animationDelay: `${-(i % 7) * 0.6}s`,
              } as CSSProperties
            }
          />
        ))}
      <div
        className="absolute inset-x-[-10%] -bottom-40 h-80 blur-[40px]"
        style={{ background: sky.glow }}
      />
    </div>
  );
}

/**
 * Today's sun path for the 오늘 밤 card: a dashed arc over the horizon, with
 * the sun on it while it is up.
 */
export function SunArc({ sky }: { sky: Sky }) {
  const t = sky.sunProgress;
  // The arc is the quadratic curve M0,40 Q50,-24 100,40 in a 100x40 box.
  const y =
    t === undefined
      ? 0
      : (1 - t) ** 2 * 40 + 2 * (1 - t) * t * -24 + t ** 2 * 40;
  return (
    <div aria-hidden className="relative h-10">
      <svg
        viewBox="0 0 100 40"
        preserveAspectRatio="none"
        className="absolute inset-0 size-full overflow-visible"
      >
        <path
          d="M0 40 Q50 -24 100 40"
          fill="none"
          stroke="rgb(255 255 255 / 0.35)"
          strokeDasharray="3 4"
          vectorEffect="non-scaling-stroke"
        />
        <line
          x1="0"
          y1="40"
          x2="100"
          y2="40"
          stroke="rgb(255 255 255 / 0.3)"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {t !== undefined && (
        <span
          className="absolute -mt-1.5 -ml-1.5 size-3 rounded-full bg-star-100 shadow-[0_0_16px_var(--color-star-100)]"
          style={{ left: `${t * 100}%`, top: `${(y / 40) * 100}%` }}
        />
      )}
    </div>
  );
}
