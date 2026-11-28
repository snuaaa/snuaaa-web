import { css, cx, keyframes } from '@emotion/css';
import { useCallback, useEffect, useRef, useState } from 'react';
import Page from '~/components/page';
import usePage from '~/hooks/usePage';
import { PageName } from '~/constants';
import historyData from './historyData';

// A timeline of year bubbles along a dotted path. Drag (or swipe, or scroll sideways) to travel
// through the years, with inertia; the focused year glows and its events show below. A scrubber at
// the bottom jumps across the decades. The bubbles are placed by hand each frame (see `layout`), so
// dragging doesn't re-render React; only the focused year is React state.

const GOLD = '#FFD45F';
const FOUNDED = 1980;
const YEAR_FONT = "'SchoolSafetyStarrySky', Cafe24Ssurround, sans-serif";

type Year = {
  year: number;
  major: boolean;
  tag: string;
  details: { date: string; name: string }[];
};

const ordinal = (n: number) => {
  const tens = n % 100;
  if (tens >= 11 && tens <= 13) return `${n}TH`;
  return `${n}${['TH', 'ST', 'ND', 'RD'][n % 10] ?? 'TH'}`;
};

// A short line above the events: the founding, a round anniversary, or the year's photo exhibition.
const tagOf = (year: number, details: Year['details']) => {
  if (year === FOUNDED) return 'FOUNDED · 창립';
  if ((year - FOUNDED) % 10 === 0)
    return `${ordinal(year - FOUNDED)} ANNIVERSARY`;
  const exhibition = details
    .map((detail) => /(\d+)회 천체 ?사진전/.exec(detail.name))
    .find(Boolean);
  return exhibition ? `${ordinal(Number(exhibition[1]))} EXHIBITION` : '';
};

// Newest first, as in historyData.
const YEARS: Year[] = historyData.map(({ year, details }, i) => ({
  year,
  // The founding, every tenth year and the latest year are gold.
  major: i === 0 || year === FOUNDED || (year - FOUNDED) % 10 === 0,
  tag: tagOf(year, details),
  details,
}));
const COUNT = YEARS.length;
const DECADES = YEARS.map((y, i) => ({ year: y.year, i })).filter(
  ({ year }) => year % 10 === 0,
);

// Size variation, so the row of bubbles doesn't look mechanical.
const SIZE_RHYTHM = [1, 0.75, 0.92, 0.65, 1.08, 0.8, 0.95, 0.7, 0.88, 0.72];
// Sparkles around the focused bubble: angle (degrees), distance (in radii), size (px), delay (s).
const SPARKLES = [
  [-55, 0.95, 16, 0],
  [25, 1.05, 11, 0.7],
  [140, 0.92, 14, 1.3],
  [215, 1, 10, 0.3],
  [-125, 1.1, 12, 1],
];
// Bubbles further than this from the focus are hidden.
const VISIBLE_RANGE = 7;

const clampPos = (v: number) => Math.max(0, Math.min(COUNT - 1, v));

const glow = keyframes({
  '0%, 100%': { boxShadow: '0 0 10px 1px rgba(255,255,255,.25)' },
  '50%': { boxShadow: '0 0 42px 12px rgba(255,255,255,.8)' },
});
const glowGold = keyframes({
  '0%, 100%': { boxShadow: '0 0 10px 1px rgba(255,212,95,.3)' },
  '50%': { boxShadow: '0 0 44px 14px rgba(255,230,120,.9)' },
});
const twinkle = keyframes({
  '0%, 100%': { transform: 'scale(.25) rotate(0)', opacity: 0.15 },
  '50%': { transform: 'scale(1) rotate(25deg)', opacity: 1 },
});
const lightIn = keyframes({
  from: { opacity: 0, filter: 'blur(2px)' },
  to: { opacity: 1, filter: 'blur(0)' },
});

const STAR_SHAPE =
  'polygon(50% 0,56% 44%,100% 50%,56% 56%,50% 100%,44% 56%,0 50%,44% 44%)';
const reduceMotion = '@media (prefers-reduced-motion: reduce)';

const styles = {
  main: css({
    color: '#FFFFFF',
    height: '100%',
    width: 'min(64rem, calc(100% - 20rem))',
    padding: '3rem 0 5rem 0',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    '@media screen and (max-width: 800px)': {
      width: 'calc(100% - 2rem)',
      padding: '4.5rem 0 4.5rem 0',
    },
  }),
  title: css({
    fontFamily: '"Snowburst One", cursive',
    fontSize: '2.5rem',
    fontWeight: 'normal',
    margin: '0 0 1rem',
    textAlign: 'center',
    '@media screen and (max-width: 800px)': {
      fontSize: '2rem',
    },
    '@media screen and (max-height: 700px)': {
      fontSize: '1.7rem',
      margin: 0,
    },
  }),
  stage: css({
    position: 'relative',
    flex: '0 0 auto',
    height: 'clamp(13rem, 38vh, 21rem)',
    cursor: 'grab',
    touchAction: 'none',
    '&:active': { cursor: 'grabbing' },
    // The far years fade out towards the edges instead of running into the page's side navigation.
    maskImage:
      'linear-gradient(to right, transparent, #000 12%, #000 88%, transparent)',
  }),
  path: css({
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    overflow: 'visible',
    pointerEvents: 'none',
    path: {
      fill: 'none',
      stroke: 'rgba(255,255,255,.55)',
      strokeWidth: 2.4,
      strokeDasharray: '0.1 8',
      strokeLinecap: 'round',
    },
  }),
  bubble: css({
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 0,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: YEAR_FONT,
    fontWeight: 700,
    color: '#FFFFFF',
    background: 'rgba(255,255,255,.16)',
    border: '1.5px solid rgba(255,255,255,.5)',
    willChange: 'transform, opacity',
    // Hidden until the first layout, so the prerendered page doesn't show them piled in a corner.
    visibility: 'hidden',
  }),
  placed: css({ visibility: 'visible' }),
  major: css({
    background: GOLD,
    borderColor: GOLD,
  }),
  focus: css({
    animation: `${glow} 2.8s ease-in-out infinite`,
    [reduceMotion]: { animation: 'none' },
  }),
  focusPlain: css({
    background: 'rgba(255,255,255,.38)',
    borderColor: 'rgba(255,255,255,.95)',
    backdropFilter: 'blur(16px)',
  }),
  focusMajor: css({
    animationName: glowGold,
  }),
  sparkle: css({
    position: 'absolute',
    left: 0,
    top: 0,
    pointerEvents: 'none',
    zIndex: 200,
    opacity: 0,
    i: {
      display: 'block',
      width: '100%',
      height: '100%',
      background: '#FFFFFF',
      clipPath: STAR_SHAPE,
      animation: `${twinkle} 2s ease-in-out infinite`,
      [reduceMotion]: { animation: 'none', transform: 'scale(.7)' },
    },
    '&:nth-of-type(3n) i': { background: GOLD },
  }),
  // Tall enough for the busiest year (five events), so the scrubber below doesn't jump.
  info: css({
    flex: '0 1 11rem',
    minHeight: 0,
    padding: '0.5rem 0.5rem 1rem',
    overflow: 'hidden',
  }),
  infoInner: css({
    animation: `${lightIn} .35s ease`,
    [reduceMotion]: { animation: 'none' },
  }),
  year: css({
    fontFamily: YEAR_FONT,
    fontSize: '2.3rem',
    fontWeight: 700,
    lineHeight: 1,
    margin: 0,
  }),
  tag: css({
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,.72)',
    margin: '0.3rem 0 0.5rem',
    letterSpacing: '0.1em',
  }),
  events: css({
    margin: 0,
    padding: 0,
    listStyle: 'none',
  }),
  event: css({
    display: 'flex',
    gap: '0.9rem',
    padding: '0.25rem 0',
    fontSize: '0.9rem',
    lineHeight: 1.4,
  }),
  date: css({
    color: 'rgba(255,255,255,.72)',
    minWidth: '6rem',
    flexShrink: 0,
    fontVariantNumeric: 'tabular-nums',
  }),
  scrub: css({
    position: 'relative',
    height: '2.5rem',
    margin: '0 0.5rem',
    touchAction: 'none',
    cursor: 'pointer',
  }),
  tick: css({
    position: 'absolute',
    top: 10,
    width: 2,
    height: 2,
    marginLeft: -1,
    borderRadius: '50%',
    background: 'rgba(255,255,255,.75)',
  }),
  decadeTick: css({
    top: 6,
    width: 10,
    height: 10,
    marginLeft: -5,
    borderRadius: 0,
    background: '#FFFFFF',
    clipPath: STAR_SHAPE,
  }),
  decadeLabel: css({
    position: 'absolute',
    top: 22,
    fontSize: '0.7rem',
    color: 'rgba(255,255,255,.72)',
    transform: 'translateX(-50%)',
    padding: 0,
    background: 'none',
  }),
  thumb: css({
    position: 'absolute',
    top: 0,
    width: 22,
    height: 22,
    marginLeft: -11,
    background: '#FFFFFF',
    clipPath: STAR_SHAPE,
    pointerEvents: 'none',
  }),
  hint: css({
    textAlign: 'center',
    fontSize: '0.7rem',
    color: 'rgba(255,255,255,.72)',
    margin: '0.5rem 0 0',
  }),
  // The full history for screen readers and crawlers; the timeline shows one year at a time.
  srOnly: css({
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0,0,0,0)',
    whiteSpace: 'nowrap',
    border: 0,
  }),
};

const History: React.FC = () => {
  const { page } = usePage();
  const active = page === PageName.HISTORY;
  const [current, setCurrent] = useState(0);
  const [placed, setPlaced] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const scrubRef = useRef<HTMLDivElement>(null);
  const bubbleRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const sparkleRefs = useRef<(HTMLDivElement | null)[]>([]);

  const pos = useRef(0);
  const frame = useRef(0);
  // True once a drag has moved, so the click that ends it doesn't also select a bubble.
  const moved = useRef(false);
  const reducedMotion = useRef(false);

  const layout = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const W = stage.clientWidth;
    const H = stage.clientHeight;
    const cx = W / 2;
    const cy = H / 2 - 10;
    // Smaller bubbles on small stages.
    const scale = Math.min(1, H / 340);
    const p = pos.current;
    const points: [number, number][] = [];

    YEARS.forEach((y, i) => {
      const dx = i - p;
      const ad = Math.abs(dx);
      const base = y.major ? 1.45 : 1;
      let size =
        76 *
        scale *
        SIZE_RHYTHM[i % SIZE_RHYTHM.length] *
        base *
        (0.25 + 0.75 * Math.exp(-ad * 1.1)) *
        (ad < 1 ? 1 + 0.9 * (1 - ad) : 1);
      const f = Math.max(0, 1 - ad * 2);
      size = size * (1 - f) + 156 * scale * f;
      const x = cx + Math.sign(dx) * ad ** 0.7 * W * 0.24;
      const yPos =
        cy +
        Math.sin(i * 1.1) * 58 * scale * Math.min(1, 0.5 + ad * 0.4) +
        Math.sin(i * 0.5) * 14 * scale;
      points.push([x, yPos]);

      const el = bubbleRefs.current[i];
      if (!el) return;
      if (ad > VISIBLE_RANGE) {
        el.style.display = 'none';
        return;
      }
      el.style.display = '';
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.fontSize = size < 32 ? '0' : `${Math.max(9, size * 0.29)}px`;
      el.style.borderWidth = size < 32 ? '1px' : '1.5px';
      el.style.transform = `translate(${x - size / 2}px, ${yPos - size / 2}px)`;
      el.style.opacity = (0.35 + 0.65 * Math.exp(-ad * 0.8)).toFixed(2);
      el.style.zIndex = `${100 - Math.round(ad * 10)}`;
      const focused = ad < 0.5;
      el.classList.toggle(styles.focus, focused);
      el.classList.toggle(styles.focusPlain, focused && !y.major);
      el.classList.toggle(styles.focusMajor, focused && y.major);
    });

    // The dotted path through the visible bubbles, as smooth quadratic curves between midpoints.
    const lo = Math.max(0, Math.floor(p - VISIBLE_RANGE));
    const hi = Math.min(COUNT - 1, Math.ceil(p + VISIBLE_RANGE));
    const q = points.slice(lo, hi + 1);
    let d = `M${q[0]}`;
    for (let i = 1; i < q.length; i += 1) {
      const mid = [(q[i - 1][0] + q[i][0]) / 2, (q[i - 1][1] + q[i][1]) / 2];
      d += ` Q${q[i - 1]} ${mid}`;
    }
    pathRef.current?.setAttribute('d', `${d} T${q[q.length - 1]}`);

    const n = Math.round(p);
    const off = Math.abs(p - n);
    const focusSize = parseFloat(bubbleRefs.current[n]?.style.width || '0');
    SPARKLES.forEach(([angle, dist, size], k) => {
      const el = sparkleRefs.current[k];
      if (!el) return;
      const a = (angle * Math.PI) / 180;
      const r = (focusSize / 2) * dist + 9;
      el.style.transform = `translate(${points[n][0] + Math.cos(a) * r - size / 2}px, ${
        points[n][1] + Math.sin(a) * r - size / 2
      }px)`;
      el.style.opacity = Math.max(0, 1 - off * 2.4).toFixed(2);
    });

    if (thumbRef.current) {
      thumbRef.current.style.left = `${(p / (COUNT - 1)) * 100}%`;
    }
    setCurrent(n);
  }, []);

  // Glide to bubble i.
  const go = useCallback(
    (i: number) => {
      const target = clampPos(i);
      cancelAnimationFrame(frame.current);
      if (reducedMotion.current) {
        pos.current = target;
        layout();
        return;
      }
      const tick = () => {
        pos.current += (target - pos.current) * 0.14;
        if (Math.abs(target - pos.current) < 0.002) pos.current = target;
        layout();
        if (pos.current !== target) frame.current = requestAnimationFrame(tick);
      };
      tick();
    },
    [layout],
  );

  useEffect(() => {
    reducedMotion.current = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    layout();
    setPlaced(true);
    const stage = stageRef.current;
    if (!stage) return undefined;
    const observer = new ResizeObserver(() => layout());
    observer.observe(stage);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame.current);
    };
  }, [layout]);

  // Dragging the stage, with inertia when let go. Dragging right goes back in time.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
    let dragging = false;
    let lastX = 0;
    let lastT = 0;
    let velocity = 0;

    const down = (ev: PointerEvent) => {
      dragging = true;
      moved.current = false;
      velocity = 0;
      lastX = ev.clientX;
      lastT = performance.now();
      cancelAnimationFrame(frame.current);
    };
    const move = (ev: PointerEvent) => {
      if (!dragging) return;
      const now = performance.now();
      const dp = (ev.clientX - lastX) / (stage.clientWidth * 0.11);
      if (Math.abs(ev.clientX - lastX) > 1) moved.current = true;
      velocity = 0.6 * ((dp / Math.max(1, now - lastT)) * 16) + 0.4 * velocity;
      pos.current = clampPos(pos.current + dp);
      lastX = ev.clientX;
      lastT = now;
      layout();
    };
    const up = () => {
      if (!dragging) return;
      dragging = false;
      if (performance.now() - lastT > 80 || reducedMotion.current) velocity = 0;
      const coast = () => {
        pos.current = clampPos(pos.current + velocity);
        velocity *= 0.93;
        if (pos.current <= 0 || pos.current >= COUNT - 1) velocity = 0;
        layout();
        if (Math.abs(velocity) > 0.012) {
          frame.current = requestAnimationFrame(coast);
        } else {
          go(Math.round(pos.current));
        }
      };
      coast();
      window.setTimeout(() => {
        moved.current = false;
      }, 50);
    };

    // Sideways scrolling (trackpads, shift+wheel) moves through the years; vertical scrolling is
    // left to the page, which uses it to change pages.
    let wheelSettle = 0;
    const wheel = (ev: WheelEvent) => {
      if (Math.abs(ev.deltaX) <= Math.abs(ev.deltaY)) return;
      ev.stopPropagation();
      ev.preventDefault();
      cancelAnimationFrame(frame.current);
      pos.current = clampPos(pos.current + ev.deltaX / 120);
      layout();
      window.clearTimeout(wheelSettle);
      wheelSettle = window.setTimeout(() => go(Math.round(pos.current)), 120);
    };

    // A sideways swipe must not also change the page (useThrottleScroll listens on the document).
    let touchX = 0;
    let touchY = 0;
    const touchStart = (ev: TouchEvent) => {
      touchX = ev.touches[0].clientX;
      touchY = ev.touches[0].clientY;
    };
    const touchMove = (ev: TouchEvent) => {
      const dx = Math.abs(ev.touches[0].clientX - touchX);
      const dy = Math.abs(ev.touches[0].clientY - touchY);
      if (dx > dy) ev.stopPropagation();
    };

    stage.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    stage.addEventListener('wheel', wheel, { passive: false });
    stage.addEventListener('touchstart', touchStart);
    stage.addEventListener('touchmove', touchMove);
    return () => {
      stage.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      stage.removeEventListener('wheel', wheel);
      stage.removeEventListener('touchstart', touchStart);
      stage.removeEventListener('touchmove', touchMove);
      window.clearTimeout(wheelSettle);
    };
  }, [go, layout]);

  // The scrubber: drag along it to sweep through the years.
  useEffect(() => {
    const track = scrubRef.current;
    if (!track) return undefined;
    let scrubbing = false;
    const seek = (ev: PointerEvent) => {
      const rect = track.getBoundingClientRect();
      pos.current = clampPos(
        ((ev.clientX - rect.left) / rect.width) * (COUNT - 1),
      );
      layout();
    };
    const down = (ev: PointerEvent) => {
      scrubbing = true;
      cancelAnimationFrame(frame.current);
      track.setPointerCapture(ev.pointerId);
      seek(ev);
    };
    const move = (ev: PointerEvent) => {
      if (scrubbing) seek(ev);
    };
    const up = () => {
      if (!scrubbing) return;
      scrubbing = false;
      go(Math.round(pos.current));
    };
    const stopTouch = (ev: TouchEvent) => ev.stopPropagation();
    track.addEventListener('pointerdown', down);
    track.addEventListener('pointermove', move);
    track.addEventListener('pointerup', up);
    track.addEventListener('pointercancel', up);
    track.addEventListener('touchmove', stopTouch);
    return () => {
      track.removeEventListener('pointerdown', down);
      track.removeEventListener('pointermove', move);
      track.removeEventListener('pointerup', up);
      track.removeEventListener('pointercancel', up);
      track.removeEventListener('touchmove', stopTouch);
    };
  }, [go, layout]);

  // Left and right arrows step through the years while this page is showing (up and down change pages).
  useEffect(() => {
    if (!active) return undefined;
    const key = (ev: KeyboardEvent) => {
      if (ev.key === 'ArrowRight') go(Math.round(pos.current) + 1);
      else if (ev.key === 'ArrowLeft') go(Math.round(pos.current) - 1);
    };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [active, go]);

  const year = YEARS[current];

  return (
    <Page>
      <div className={styles.main}>
        <h2 className={styles.title}>Our History</h2>
        <div ref={stageRef} className={styles.stage} aria-hidden="true">
          <svg className={styles.path}>
            <path ref={pathRef} />
          </svg>
          {YEARS.map((y, i) => (
            <button
              key={y.year}
              type="button"
              tabIndex={-1}
              ref={(el) => {
                bubbleRefs.current[i] = el;
              }}
              className={cx(
                styles.bubble,
                y.major && styles.major,
                placed && styles.placed,
              )}
              onClick={() => {
                if (!moved.current) go(i);
              }}
            >
              {y.year}
            </button>
          ))}
          {SPARKLES.map(([, , size, delay], k) => (
            <div
              key={k}
              ref={(el) => {
                sparkleRefs.current[k] = el;
              }}
              className={styles.sparkle}
              style={{ width: size, height: size }}
            >
              <i style={{ animationDelay: `${delay}s` }} />
            </div>
          ))}
        </div>
        <div className={styles.info} aria-live="polite">
          <div key={year.year} className={styles.infoInner}>
            <h3 className={styles.year}>{year.year}</h3>
            {year.tag && <p className={styles.tag}>{year.tag}</p>}
            <ul className={styles.events}>
              {year.details.map((detail) => (
                <li key={detail.date + detail.name} className={styles.event}>
                  <span className={styles.date}>{detail.date}</span>
                  <span>{detail.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div ref={scrubRef} className={styles.scrub} aria-hidden="true">
          {YEARS.map((y, i) => (
            <div
              key={y.year}
              className={cx(
                styles.tick,
                y.year % 10 === 0 && styles.decadeTick,
              )}
              style={{ left: `${(i / (COUNT - 1)) * 100}%` }}
            />
          ))}
          {DECADES.map(({ year: decade, i }) => (
            <span
              key={decade}
              className={styles.decadeLabel}
              style={{ left: `${(i / (COUNT - 1)) * 100}%` }}
            >
              {decade}
            </span>
          ))}
          <div ref={thumbRef} className={styles.thumb} />
        </div>
        <p className={styles.hint} aria-hidden="true">
          오른쪽으로 밀어서 과거로 →
        </p>
        <ol className={styles.srOnly}>
          {YEARS.map((y) => (
            <li key={y.year}>
              {y.year}
              {y.tag && ` (${y.tag})`}:{' '}
              {y.details.map((d) => `${d.date} ${d.name}`).join(', ')}
            </li>
          ))}
        </ol>
      </div>
    </Page>
  );
};

export default History;
