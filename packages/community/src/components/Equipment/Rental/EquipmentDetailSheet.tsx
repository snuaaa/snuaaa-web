import { Button, Sheet } from '~/components/ui';
import { cn } from '~/lib/utils';
import {
  Equipment,
  EquipmentRentStatus,
  EquipmentStatus,
} from '~/services/types';
import { equipmentStatusTextMap } from '../common';
import EquipmentThumb from './EquipmentThumb';
import { formatDue, rentStatusChip } from './rentUtils';

type EquipmentDetailSheetProps = {
  equipment: Equipment | null;
  categoryName?: string;
  inCart: boolean;
  canAdd: boolean;
  onToggle: () => void;
  onClose: () => void;
};

/** 장비 정보: photo, condition, place and description, with 담기. */
export default function EquipmentDetailSheet({
  equipment,
  categoryName,
  inCart,
  canAdd,
  onToggle,
  onClose,
}: EquipmentDetailSheetProps) {
  const rentable = equipment?.rent_status === EquipmentRentStatus.RENTABLE;
  const chip = equipment && rentStatusChip[equipment.rent_status];

  const cta = inCart
    ? '담기 취소'
    : rentable
      ? canAdd
        ? '담기'
        : '더 담을 수 없어요'
      : equipment?.rent_status === EquipmentRentStatus.RENTED
        ? '대여 중이에요'
        : '지금은 빌릴 수 없어요';

  const rows = equipment
    ? [
        {
          label: '상태',
          value: equipmentStatusTextMap[equipment.status],
          className: cn(
            'font-semibold',
            equipment.status === EquipmentStatus.OK
              ? 'text-success'
              : 'text-danger',
          ),
        },
        { label: '위치', value: equipment.location },
        { label: '제조사', value: equipment.maker },
        {
          label: '반납 기한',
          value:
            equipment.rent_status === EquipmentRentStatus.RENTED &&
            equipment.end_date
              ? `${formatDue(equipment.end_date)} · 다른 회원이 빌렸어요`
              : '빌린 시각부터 48시간',
        },
      ].filter((row) => row.value)
    : [];

  return (
    <Sheet
      open={equipment !== null}
      onOpenChange={(open) => !open && onClose()}
      title={equipment?.name ?? '장비 정보'}
      hideTitle
      className="md:max-w-lg"
      footer={
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={onClose}
            className="h-[52px] rounded-lg px-5 text-[15px] md:h-11"
          >
            닫기
          </Button>
          <Button
            variant={inCart ? 'ghost' : 'primary'}
            disabled={!inCart && (!rentable || !canAdd)}
            onClick={onToggle}
            className={cn(
              'h-[52px] flex-1 rounded-lg text-base font-bold md:h-11',
              inCart && 'bg-info-soft text-primary',
            )}
          >
            {cta}
          </Button>
        </div>
      }
    >
      {equipment && (
        <div className="flex flex-col gap-4 pb-2">
          <EquipmentThumb
            src={equipment.img_path}
            className="h-55 w-full rounded-xl"
          />
          <div className="flex flex-col gap-2 px-1">
            <div className="flex gap-1.5">
              {chip && (
                <span
                  className={cn(
                    'rounded-full px-2.5 py-0.5 text-caption font-semibold',
                    chip.className,
                  )}
                >
                  {chip.label}
                </span>
              )}
              {categoryName && (
                <span className="rounded-full bg-bg px-2.5 py-0.5 text-caption font-semibold text-gray-700">
                  {categoryName}
                </span>
              )}
            </div>
            <h2 className="text-title">{equipment.name}</h2>
            {equipment.nickname && (
              <p className="text-label font-normal text-fg-muted">
                별명 {equipment.nickname}
              </p>
            )}
          </div>
          <dl className="grid grid-cols-[72px_minmax(0,1fr)] px-1 text-sm">
            {rows.map((row) => (
              <div key={row.label} className="contents">
                <dt className="border-b border-gray-100 py-2.5 text-fg-muted">
                  {row.label}
                </dt>
                <dd
                  className={cn(
                    'border-b border-gray-100 py-2.5',
                    row.className,
                  )}
                >
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
          {equipment.description && (
            <div className="flex flex-col gap-1.5 px-1">
              <h3 className="text-label font-bold">설명</h3>
              <p className="text-sm leading-relaxed whitespace-pre-line text-gray-700">
                {equipment.description}
              </p>
            </div>
          )}
        </div>
      )}
    </Sheet>
  );
}
