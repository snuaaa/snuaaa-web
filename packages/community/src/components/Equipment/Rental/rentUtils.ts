import {
  Equipment,
  EquipmentRentStatus,
  EquipmentStatus,
} from '~/services/types';

/** Grade that may open 장비 관리 (lower is more privileged). */
export const EQUIP_ADMIN_GRADE = 6;

/** Most items one member may have out at once. */
export const RENT_LIMIT = 8;
const RENT_HOURS = 48;
/** Under this, the time left turns yellow. */
const SOON_HOURS = 6;

const HOUR = 60 * 60 * 1000;
const WEEKDAYS = '일월화수목금토';
const pad = (n: number) => String(n).padStart(2, '0');

/** 9.29 (화) 14:30 */
export function formatDue(value: string | Date) {
  const date = new Date(value);
  return `${date.getMonth() + 1}.${date.getDate()} (${WEEKDAYS[date.getDay()]}) ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** When items rented now are due: the API gives 48 hours. */
export const dueIfRentedNow = () => new Date(Date.now() + RENT_HOURS * HOUR);

function formatSpan(ms: number) {
  const hours = Math.floor(ms / HOUR);
  if (hours >= 24) {
    const rest = hours % 24;
    return `${Math.floor(hours / 24)}일${rest ? ` ${rest}시간` : ''}`;
  }
  if (hours > 0) return `${hours}시간`;
  return `${Math.max(1, Math.floor(ms / (60 * 1000)))}분`;
}

export type DueTone = 'ok' | 'soon' | 'late';

/** 1일 3시간 남음 / 2시간 남음 / 11시간 초과 */
export function timeLeft(endDate: string): { label: string; tone: DueTone } {
  const diff = new Date(endDate).getTime() - Date.now();
  if (diff < 0) return { label: `${formatSpan(-diff)} 초과`, tone: 'late' };
  return {
    label: `${formatSpan(diff)} 남음`,
    tone: diff < SOON_HOURS * HOUR ? 'soon' : 'ok',
  };
}

export const dueToneClassName: Record<DueTone, string> = {
  ok: 'bg-info-soft text-navy-700',
  soon: 'bg-warning-soft text-warning',
  late: 'bg-danger-soft text-danger',
};

export const rentStatusChip: Record<
  EquipmentRentStatus,
  { label: string; className: string }
> = {
  [EquipmentRentStatus.RENTABLE]: {
    label: '대여 가능',
    className: 'bg-success-soft text-success',
  },
  [EquipmentRentStatus.RENTED]: {
    label: '대여 중',
    className: 'bg-warning-soft text-warning',
  },
  [EquipmentRentStatus.UNRENTABLE]: {
    label: '대여 불가',
    className: 'bg-gray-100 text-gray-700',
  },
};

export type RentSort = 'latest' | 'name' | 'category';

export const RENT_SORTS: { value: RentSort; label: string }[] = [
  { value: 'latest', label: '등록일 최신순' },
  { value: 'name', label: '장비명순' },
  { value: 'category', label: '분류순' },
];

export type RentFilter = {
  keyword?: string;
  category_id?: number;
  status?: EquipmentStatus;
  available?: boolean;
  sort?: RentSort;
};

/** The catalogue after the search box, the chips and the sort. */
export function filterEquipments(list: Equipment[], filter: RentFilter) {
  const keyword = filter.keyword?.trim().toLowerCase();
  const filtered = list.filter(
    (equip) =>
      (!filter.category_id || equip.category_id === filter.category_id) &&
      (!filter.status || equip.status === filter.status) &&
      (!filter.available ||
        equip.rent_status === EquipmentRentStatus.RENTABLE) &&
      (!keyword ||
        [equip.name, equip.nickname, equip.maker].some((text) =>
          text?.toLowerCase().includes(keyword),
        )),
  );
  const sort = filter.sort ?? 'latest';
  return filtered.sort((a, b) =>
    sort === 'name'
      ? a.name.localeCompare(b.name, 'ko')
      : sort === 'category'
        ? a.category_id - b.category_id || a.name.localeCompare(b.name, 'ko')
        : b.createdAt.localeCompare(a.createdAt),
  );
}
