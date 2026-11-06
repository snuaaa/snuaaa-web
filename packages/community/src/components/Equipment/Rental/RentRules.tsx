import { RENT_LIMIT } from './rentUtils';

const RULES = [
  '사용 당일에 신청하는 게 원칙이에요',
  '대여 시각부터 48시간 안에 반납해야 해요',
  `한 사람당 최대 ${RENT_LIMIT}개까지 빌릴 수 있어요`,
];

/** 대여 규칙: numbered on mobile, a short list beside the desktop cart. */
export default function RentRules({ compact }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex flex-col gap-2 rounded-xl bg-surface px-[18px] py-4 text-label leading-normal font-normal text-gray-700">
        <b className="font-bold text-fg">대여 규칙</b>
        {RULES.map((rule) => (
          <span key={rule}>· {rule}</span>
        ))}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-surface p-4">
      <h2 className="text-sm font-bold">대여 규칙</h2>
      <ol className="flex flex-col gap-2.5">
        {RULES.map((rule, i) => (
          <li
            key={rule}
            className="flex items-start gap-2.5 text-sm leading-normal"
          >
            <span className="flex size-6 shrink-0 items-center justify-center rounded-[8px] bg-info-soft text-caption font-bold text-navy-700">
              {i + 1}
            </span>
            {rule}
          </li>
        ))}
      </ol>
    </div>
  );
}
