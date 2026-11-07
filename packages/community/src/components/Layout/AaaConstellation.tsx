import type { CSSProperties } from 'react';

import { cn } from '~/lib/utils';

/*
 * The club's AAA drawn as a constellation, after the old site's login and
 * header GIFs (login_logo.gif, header.gif): the stars come out one by one,
 * then the lines join them into the three A's. Coordinates are traced from
 * the GIF's 500×500 frame.
 */

type Star = {
  x: number;
  y: number;
  /** Outer radius of a five-pointed star, or a plain dot when omitted. */
  r?: number;
  /** Dot radius when the star is a dot. */
  dot?: number;
};

const STARS: Record<string, Star> = {
  a1: { x: 121, y: 340, dot: 3.5 },
  a2: { x: 121, y: 233, dot: 3 },
  a3: { x: 135, y: 188, dot: 4 },
  a4: { x: 176, y: 220, dot: 2.5 },
  a5: { x: 193, y: 273, r: 10 },
  b1: { x: 208, y: 229, dot: 3 },
  b2: { x: 235, y: 122, r: 20 },
  b3: { x: 278, y: 242, dot: 3.5 },
  b4: { x: 275, y: 365, r: 28 },
  c1: { x: 307, y: 271, dot: 4 },
  c2: { x: 332, y: 166, r: 12 },
  c3: { x: 382, y: 267, dot: 2.5 },
  c4: { x: 389, y: 302, r: 9 },
};

/** The order the stars come out in: the two bright ones first, like the GIF. */
const STAR_ORDER = [
  'b4',
  'b2',
  'c2',
  'a3',
  'c1',
  'a5',
  'b3',
  'a1',
  'c4',
  'b1',
  'a2',
  'c3',
  'a4',
];

/** One stroke through the three A's, then their crossbars. */
const STROKE = [
  'a1',
  'a2',
  'a3',
  'a4',
  'a5',
  'b1',
  'b2',
  'b3',
  'b4',
  'c1',
  'c2',
  'c3',
  'c4',
];
const CROSSBARS: [string, string][] = [
  ['a2', 'a4'],
  ['b1', 'b3'],
  ['c1', 'c3'],
];

const STAR_STEP = 0.12; // s between stars
const LINES_AT = STAR_ORDER.length * STAR_STEP + 0.3;
const STROKE_DURATION = 2.4;
const CROSSBARS_AT = LINES_AT + STROKE_DURATION - 0.2;

function point(id: string) {
  const { x, y } = STARS[id];
  return `${x} ${y}`;
}

function starPolygon({ x, y, r = 0 }: Star) {
  const inner = r * 0.42;
  return Array.from({ length: 10 }, (_, i) => {
    const radius = i % 2 === 0 ? r : inner;
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    return `${(x + radius * Math.cos(angle)).toFixed(1)},${(y + radius * Math.sin(angle)).toFixed(1)}`;
  }).join(' ');
}

type AaaConstellationProps = {
  className?: string;
  /** Accessible name; leave out when the club name is written next to it. */
  label?: string;
};

/**
 * Draws itself once on mount and then keeps twinkling. With reduced motion it
 * shows the finished constellation without moving. Strokes use currentColor,
 * so set the color with a text-* class (관측 모드 turns it red with the rest
 * of the page).
 */
export default function AaaConstellation({
  className,
  label,
}: AaaConstellationProps) {
  return (
    <svg
      viewBox="100 100 310 290"
      className={cn('overflow-visible', className)}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        opacity={0.6}
      >
        <path
          d={`M${STROKE.map(point).join(' L')}`}
          pathLength={1}
          strokeDasharray="1 1"
          vectorEffect="non-scaling-stroke"
          className="animate-constellation-draw motion-reduce:animate-none"
          style={{
            animationDelay: `${LINES_AT}s`,
            animationDuration: `${STROKE_DURATION}s`,
          }}
        />
        {CROSSBARS.map(([from, to], i) => (
          <path
            key={from}
            d={`M${point(from)} L${point(to)}`}
            pathLength={1}
            strokeDasharray="1 1"
            vectorEffect="non-scaling-stroke"
            className="animate-constellation-draw motion-reduce:animate-none"
            style={{
              animationDelay: `${CROSSBARS_AT + i * 0.15}s`,
              animationDuration: '0.5s',
            }}
          />
        ))}
      </g>
      <g
        fill="currentColor"
        style={{ filter: 'drop-shadow(0 0 3px currentColor)' }}
      >
        {STAR_ORDER.map((id, i) => {
          const star = STARS[id];
          return (
            <g
              key={id}
              className="origin-center animate-star-in [transform-box:fill-box] motion-reduce:animate-none"
              style={{ animationDelay: `${i * STAR_STEP}s` }}
            >
              {/* Twinkles after the drawing, each star on its own beat. */}
              <g
                className="animate-twinkle motion-reduce:animate-none"
                style={
                  {
                    '--star-opacity': 1,
                    animationDelay: `${CROSSBARS_AT + 1 + ((i * 7) % 13) * 0.3}s`,
                    animationDuration: `${3 + ((i * 5) % 4)}s`,
                  } as CSSProperties
                }
              >
                {star.r ? (
                  <polygon points={starPolygon(star)} strokeLinejoin="round" />
                ) : (
                  <circle cx={star.x} cy={star.y} r={star.dot} />
                )}
              </g>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
