import type { CSSProperties } from 'react';
import type { RiseSet } from '~/services/HomeService';

/**
 * 하늘 헤더: the home header's sky, worked out from today's rise/set times
 * (`/api/home/riseset`, Seoul, KST `HHmm` numbers).
 *
 * The sky is pinned to four looks (낮, 해 질 녘, 박명, 밤) at fixed moments of
 * the day and blended in between, so it changes a little every minute
 * instead of jumping between phases.
 */

type Rgba = [number, number, number, number];

interface SkyLook {
  /** Gradient stops from the top of the header down, at 0%, 60%, 100%. */
  stops: [Rgba, Rgba, Rgba];
  /** Soft light rising from the bottom edge (sunlight, or the nebula at night). */
  glow: Rgba;
  /** 0 hides the stars, 1 shows them at full brightness. */
  stars: number;
}

const hex = (value: string, alpha = 1): Rgba => [
  parseInt(value.slice(1, 3), 16),
  parseInt(value.slice(3, 5), 16),
  parseInt(value.slice(5, 7), 16),
  alpha,
];

// The day stops are a shade deeper than the canvas so white text keeps its
// contrast on the bright end of the gradient.
const LOOKS = {
  day: {
    stops: [hex('#23407a'), hex('#2e56a8'), hex('#4a78c8')],
    glow: [255, 244, 209, 0.3],
    stars: 0,
  },
  dusk: {
    stops: [hex('#16284f'), hex('#5a3f7a'), hex('#c4704c')],
    glow: [245, 197, 66, 0.4],
    stars: 0.25,
  },
  twilight: {
    stops: [hex('#0b1a3a'), hex('#23305f'), hex('#4a3f7a')],
    glow: [116, 169, 255, 0.22],
    stars: 0.6,
  },
  night: {
    stops: [hex('#07112a'), hex('#0b1a3a'), hex('#16284f')],
    glow: [110, 84, 190, 0.26],
    stars: 1,
  },
} satisfies Record<string, SkyLook>;

/** How long the sky glows around sunrise and sunset, in minutes. */
const GOLDEN_MINUTES = 60;
const DAY_MINUTES = 24 * 60;
const KST_OFFSET_MINUTES = 9 * 60;

const toMinutes = (hhmm?: number) =>
  hhmm === undefined ? undefined : Math.floor(hhmm / 100) * 60 + (hhmm % 100);

/** Minutes since midnight in Seoul, whatever the device's time zone. */
export function kstMinutes(date: Date) {
  const minutes = Math.floor(date.getTime() / 60000) + KST_OFFSET_MINUTES;
  return ((minutes % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES;
}

const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const mixRgba = (a: Rgba, b: Rgba, t: number): Rgba =>
  [0, 1, 2, 3].map((i) => mix(a[i], b[i], t)) as Rgba;
const mixLook = (a: SkyLook, b: SkyLook, t: number): SkyLook => ({
  stops: [0, 1, 2].map((i) =>
    mixRgba(a.stops[i], b.stops[i], t),
  ) as SkyLook['stops'],
  glow: mixRgba(a.glow, b.glow, t),
  stars: mix(a.stars, b.stars, t),
});

const css = ([r, g, b, a]: Rgba) =>
  `rgb(${Math.round(r)} ${Math.round(g)} ${Math.round(b)} / ${a.toFixed(3)})`;

export interface Sky {
  /** Background for the sky band, header area included. */
  background: string;
  /** Solid color of the gradient's top, for the header once it scrolls. */
  top: string;
  glow: string;
  starOpacity: number;
  /** One-line description of the sky right now, for the 오늘 밤 card. */
  label: string;
  /**
   * The sun's place along today's arc, 0 at sunrise and 1 at sunset;
   * undefined while it is below the horizon.
   */
  sunProgress?: number;
}

function describe(now: number, t: Required<Times>) {
  if (now < t.astm || now >= t.aste) return '관측하기 좋은 시간';
  if (now < t.sunrise) return '새벽 박명';
  if (now < t.sunrise + GOLDEN_MINUTES) return '해 뜨는 중';
  if (now < t.sunset - GOLDEN_MINUTES) return '해 떠 있음';
  if (now < t.sunset) return `일몰 ${t.sunset - now}분 전`;
  return '천문박명 중';
}

interface Times {
  sunrise?: number;
  sunset?: number;
  astm?: number;
  aste?: number;
}

/** The sky at `date`, or undefined when today's times are missing. */
export function skyAt(riseSet: RiseSet, date: Date): Sky | undefined {
  const times: Times = {
    sunrise: toMinutes(riseSet.sunrise),
    sunset: toMinutes(riseSet.sunset),
    astm: toMinutes(riseSet.astm),
    aste: toMinutes(riseSet.aste),
  };
  const { sunrise, sunset, astm, aste } = times;
  if (
    sunrise === undefined ||
    sunset === undefined ||
    astm === undefined ||
    aste === undefined ||
    !(astm < sunrise && sunrise < sunset && sunset < aste)
  ) {
    return undefined;
  }

  // Each look holds at its moment; the sky blends between neighbors.
  const keys: [number, SkyLook][] = [
    [astm, LOOKS.night],
    [(astm + sunrise) / 2, LOOKS.twilight],
    [sunrise, LOOKS.dusk],
    [Math.min(sunrise + GOLDEN_MINUTES, (sunrise + sunset) / 2), LOOKS.day],
    [Math.max(sunset - GOLDEN_MINUTES, (sunrise + sunset) / 2), LOOKS.day],
    [sunset, LOOKS.dusk],
    [(sunset + aste) / 2, LOOKS.twilight],
    [aste, LOOKS.night],
  ];

  const now = kstMinutes(date);
  let look: SkyLook = LOOKS.night;
  for (let i = 0; i < keys.length - 1; i += 1) {
    const [from, a] = keys[i];
    const [to, b] = keys[i + 1];
    if (now >= from && now < to) {
      look = to > from ? mixLook(a, b, (now - from) / (to - from)) : a;
      break;
    }
  }

  const [s0, s1, s2] = look.stops.map(css);
  return {
    background: `linear-gradient(180deg, ${s0} 0%, ${s1} 60%, ${s2} 100%)`,
    top: s0,
    glow: `radial-gradient(closest-side, ${css(look.glow)}, transparent)`,
    starOpacity: look.stars,
    label: describe(now, times as Required<Times>),
    sunProgress:
      now >= sunrise && now <= sunset
        ? (now - sunrise) / (sunset - sunrise)
        : undefined,
  };
}

/**
 * Navy tokens re-pointed inside the sky, so the cards and buttons drawn on
 * the brand surface become dark glass the sky shows through.
 */
export const SKY_TOKENS = {
  '--color-surface-brand': 'rgb(7 17 42 / 0.28)',
  '--color-surface-brand-raised': 'rgb(7 17 42 / 0.34)',
  '--color-navy-700': 'rgb(7 17 42 / 0.5)',
} as CSSProperties;

/** Inline style for an element that the sky fills. */
export function skyStyle(sky?: Sky): CSSProperties | undefined {
  return sky && { ...SKY_TOKENS, background: sky.background };
}
