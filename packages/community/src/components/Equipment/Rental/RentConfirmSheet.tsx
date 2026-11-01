import { useState } from 'react';
import { Check } from 'lucide-react';

import { Button, Sheet } from '~/components/ui';
import { useRentEquipments } from '~/hooks/queries/useEquipmentQueries';
import { Equipment } from '~/services/types';
import EquipmentThumb from './EquipmentThumb';
import { dueIfRentedNow, formatDue } from './rentUtils';

type Result = { rented: number; failed: Equipment[]; due: Date };

type RentConfirmSheetProps = {
  open: boolean;
  items: Equipment[];
  onClose: () => void;
  /** Called once the API answers, with the items that went through. */
  onRented: (rentedIds: number[]) => void;
  /** 빌린 장비 보기 */
  onDone: () => void;
};

/** 장비 N개를 빌릴까요? with the due time large, then 대여가 완료됐어요. */
export default function RentConfirmSheet({
  open,
  items,
  onClose,
  onRented,
  onDone,
}: RentConfirmSheetProps) {
  const { mutateAsync: rent, isPending } = useRentEquipments();
  const [result, setResult] = useState<Result | null>(null);
  const [failed, setFailed] = useState(false);
  const due = result?.due ?? dueIfRentedNow();

  const submit = async () => {
    setFailed(false);
    try {
      const { data } = await rent({ equipmentIds: items.map((e) => e.id) });
      setResult({
        rented: data.successEquipmentIds.length,
        failed: items.filter((e) => data.failedEquipmentIds.includes(e.id)),
        due: dueIfRentedNow(),
      });
      onRented(data.successEquipmentIds);
    } catch (err) {
      console.error(err);
      setFailed(true);
    }
  };

  const close = () => {
    setResult(null);
    setFailed(false);
    onClose();
  };

  if (result) {
    const none = result.rented === 0;
    return (
      <Sheet
        open={open}
        onOpenChange={(next) => !next && close()}
        title={none ? '빌리지 못했어요' : '대여가 완료됐어요'}
        hideTitle
        footer={
          <Button
            block
            onClick={() => {
              close();
              onDone();
            }}
            size="lg"
            className="md:h-11"
          >
            {none ? '확인' : '빌린 장비 보기'}
          </Button>
        }
      >
        <div className="flex flex-col items-center gap-2.5 pt-4 pb-2 text-center">
          {!none && (
            <span className="flex size-16 items-center justify-center rounded-full bg-success-soft text-success">
              <Check className="size-[30px]" strokeWidth={2.4} />
            </span>
          )}
          <p className="text-[19px] font-bold">
            {none ? '빌리지 못했어요' : '대여가 완료됐어요'}
          </p>
          {!none && (
            <p className="text-sm leading-relaxed text-gray-700">
              {formatDue(result.due)}까지 반납해 주세요.
              <br />
              맑은 하늘 되세요!
            </p>
          )}
          {result.failed.length > 0 && (
            <p className="rounded-md bg-warning-soft px-3.5 py-2.5 text-label font-normal text-warning">
              {result.failed.map((e) => e.name).join(', ')}은(는) 빌리지
              못했어요. 다른 회원이 먼저 빌렸거나 지금은 빌릴 수 없어요.
            </p>
          )}
        </div>
      </Sheet>
    );
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => !next && close()}
      title={`장비 ${items.length}개를 빌릴까요?`}
      hideTitle
      footer={
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={close}
            size="lg"
            className="md:h-11"
          >
            취소
          </Button>
          <Button
            onClick={submit}
            loading={isPending}
            size="lg"
            className="flex-1 md:h-11"
          >
            빌리기
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-3 pb-2">
        <p className="px-1 text-[19px] font-bold">
          장비 {items.length}개를 빌릴까요?
        </p>
        <ul className="px-1">
          {items.map((equip) => (
            <li
              key={equip.id}
              className="flex items-center gap-3 border-b border-gray-100 py-2.5 last:border-b-0"
            >
              <EquipmentThumb src={equip.img_path} className="size-11" />
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate text-[15px] font-semibold">
                  {equip.name}
                </span>
                {equip.location && (
                  <span className="text-caption text-fg-muted">
                    {equip.location}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-1 rounded-lg bg-accent-soft px-4 py-3.5">
          <span className="text-caption font-semibold text-star-800">
            반납 기한
          </span>
          <span className="text-xl font-bold tracking-[-0.3px]">
            {formatDue(due)}까지
          </span>
          <span className="text-caption text-gray-700">
            지금부터 48시간 · 늦으면 연체료가 생겨요
          </span>
        </div>
        {failed && (
          <p role="alert" className="text-label font-normal text-danger">
            빌리지 못했어요. 잠시 후 다시 시도해 주세요.
          </p>
        )}
      </div>
    </Sheet>
  );
}
