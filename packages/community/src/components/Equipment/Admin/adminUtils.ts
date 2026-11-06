import { EquipmentStatus, PenaltyStatus, Rent } from '~/services/types';

type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const pad = (n: number) => String(n).padStart(2, '0');

/** 09.21 14:30, with the year in front when it isn't this year. */
export function formatStamp(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  const day = `${pad(date.getMonth() + 1)}.${pad(date.getDate())}`;
  const year =
    date.getFullYear() === new Date().getFullYear()
      ? ''
      : `${date.getFullYear()}.`;
  return `${year}${day} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export const equipmentStatusTone: Record<EquipmentStatus, Tone> = {
  [EquipmentStatus.OK]: 'success',
  [EquipmentStatus.BROKEN]: 'danger',
  [EquipmentStatus.REPAIRING]: 'warning',
  [EquipmentStatus.LOST]: 'neutral',
  [EquipmentStatus.ETC]: 'neutral',
};

export type PenaltyFilter = PenaltyStatus | 'all';

export const PENALTY_FILTERS: { value: PenaltyFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: PenaltyStatus.NEED_PAYMENT, label: '미납' },
  { value: PenaltyStatus.RECEIVED_PAYMENT, label: '완납' },
  { value: PenaltyStatus.NO_PENALTY, label: '정상 반납' },
];

const penaltyChip: Record<PenaltyStatus, { label: string; tone: Tone }> = {
  [PenaltyStatus.NEED_PAYMENT]: { label: '지연 반납 · 미납', tone: 'danger' },
  [PenaltyStatus.RECEIVED_PAYMENT]: {
    label: '지연 반납 · 완납',
    tone: 'neutral',
  },
  [PenaltyStatus.NO_PENALTY]: { label: '정상 반납', tone: 'success' },
};

/** 대여 중 until it comes back, then how it came back. */
export function rentChip(rent: Rent) {
  return rent.rentReturn
    ? penaltyChip[rent.rentReturn.penalty_status]
    : { label: '대여 중', tone: 'warning' as const };
}

/** Late returns show their return time in red. */
export const isLateReturn = (rent: Rent) =>
  Boolean(
    rent.rentReturn &&
    rent.rentReturn.penalty_status !== PenaltyStatus.NO_PENALTY,
  );
