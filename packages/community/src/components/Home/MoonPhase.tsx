import { cn } from '~/lib/utils';

const SYNODIC_MONTH = 29.53;

/**
 * SVG path of the lit part of a moon of radius `r` centered at (`c`, `c`),
 * as seen from the northern hemisphere (waxing lights the right side).
 */
function litPath(lunAge: number, c: number, r: number) {
  const phase =
    (((lunAge % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH) /
    SYNODIC_MONTH;
  const rx = Math.abs(Math.cos(phase * 2 * Math.PI)) * r;
  const waxing = phase < 0.5;
  const crescent = phase < 0.25 || phase > 0.75;
  const limbSweep = waxing ? 1 : 0;
  const terminatorSweep = waxing === crescent ? 0 : 1;
  return [
    `M ${c} ${c - r}`,
    `A ${r} ${r} 0 0 ${limbSweep} ${c} ${c + r}`,
    `A ${rx.toFixed(2)} ${r} 0 0 ${terminatorSweep} ${c} ${c - r}`,
    'Z',
  ].join(' ');
}

/**
 * The moon's shape for a given moon age, drawn from the age itself.
 * It keeps the old home page's yellow moon (formerly `_moon.scss`).
 */
export default function MoonPhase({
  lunAge,
  size,
  className,
  shadeClassName = 'fill-navy-700',
}: {
  lunAge?: number;
  size: number;
  className?: string;
  /** Fill of the unlit part. */
  shadeClassName?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      className={cn('shrink-0', className)}
      role="img"
      aria-label={lunAge === undefined ? '달' : `월령 ${lunAge}일의 달`}
    >
      <circle cx="40" cy="40" r="38" className={shadeClassName} />
      {lunAge !== undefined && (
        <path d={litPath(lunAge, 40, 38)} className="fill-accent" />
      )}
    </svg>
  );
}
