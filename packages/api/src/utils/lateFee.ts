import PenaltyStatusEnum from '../enums/penaltyStatusEnum';

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const DAILY_LATE_FEE = 1000;

// 24시간 미만의 일부 연체도 1일로 계산한다.
export function calculateLateDays(
  endDate: Date | string,
  returnDate: Date | string,
) {
  const overdueMs = Math.max(
    0,
    new Date(returnDate).getTime() - new Date(endDate).getTime(),
  );
  return Math.ceil(overdueMs / DAY_IN_MS);
}

export function calculateOutstandingLateFee(
  lateDays: number,
  penaltyStatus: PenaltyStatusEnum,
) {
  // 완납된 기록은 연체일을 보존하되 현재 미납액만 0원으로 표시한다.
  return penaltyStatus === PenaltyStatusEnum.NEED_PAYMENT
    ? lateDays * DAILY_LATE_FEE
    : 0;
}
