import {
  AstroTime,
  Body,
  MoonPhase,
  Observer,
  SearchAltitude,
  SearchMoonPhase,
  SearchRiseSet,
} from 'astronomy-engine';

// 서울 (KASI 일월출몰 API의 '서울' 지역 기준 좌표)
const SEOUL = new Observer(37.5665, 126.978, 0);
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const SYNODIC_MONTH = 29.530588;
const ASTRONOMICAL_TWILIGHT_ALTITUDE = -18;

export interface RiseSetInfo {
  sunrise?: number;
  sunset?: number;
  moonrise?: number;
  moonset?: number;
  astm?: number;
  aste?: number;
  lunAge: number;
}

/** KST 기준 HHmm 형식의 숫자 (기존 공공 API 응답 형식과 동일) */
function toKstHHmm(time: AstroTime | null, dayStart: Date): number | undefined {
  if (!time) {
    return undefined;
  }
  const minutes = Math.round(
    (time.date.getTime() - dayStart.getTime()) / 60000,
  );
  if (minutes < 0 || minutes >= 24 * 60) {
    return undefined;
  }
  return Math.floor(minutes / 60) * 100 + (minutes % 60);
}

function getKstDayStart(date: Date): Date {
  const kst = new Date(date.getTime() + KST_OFFSET_MS);
  return new Date(
    Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate()) -
      KST_OFFSET_MS,
  );
}

function calcLunAge(noon: Date): number {
  // 직전 삭(new moon)으로부터 경과한 일수
  const elongation = MoonPhase(noon);
  const newMoon = SearchMoonPhase(0, noon, -(elongation / 360) * 30 - 2);
  const age = newMoon
    ? (noon.getTime() - newMoon.date.getTime()) / DAY_MS
    : (elongation / 360) * SYNODIC_MONTH;
  return Math.round(age * 10) / 10;
}

const cache = new Map<number, RiseSetInfo>();

/** 서울 기준 오늘(KST)의 일출/일몰, 월출/월몰, 천문박명, 월령을 계산한다. */
export function calcRiseSet(date: Date = new Date()): RiseSetInfo {
  const dayStart = getKstDayStart(date);
  const key = dayStart.getTime();
  const cached = cache.get(key);
  if (cached) {
    return cached;
  }

  const t = (value: AstroTime | null) => toKstHHmm(value, dayStart);
  const info: RiseSetInfo = {
    sunrise: t(SearchRiseSet(Body.Sun, SEOUL, +1, dayStart, 1)),
    sunset: t(SearchRiseSet(Body.Sun, SEOUL, -1, dayStart, 1)),
    moonrise: t(SearchRiseSet(Body.Moon, SEOUL, +1, dayStart, 1)),
    moonset: t(SearchRiseSet(Body.Moon, SEOUL, -1, dayStart, 1)),
    astm: t(
      SearchAltitude(
        Body.Sun,
        SEOUL,
        +1,
        dayStart,
        1,
        ASTRONOMICAL_TWILIGHT_ALTITUDE,
      ),
    ),
    aste: t(
      SearchAltitude(
        Body.Sun,
        SEOUL,
        -1,
        dayStart,
        1,
        ASTRONOMICAL_TWILIGHT_ALTITUDE,
      ),
    ),
    lunAge: calcLunAge(new Date(key + DAY_MS / 2)),
  };

  cache.clear();
  cache.set(key, info);
  return info;
}
