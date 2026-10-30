import { X } from 'lucide-react';

import { Button } from '~/components/ui';
import EquipmentThumb from './EquipmentThumb';
import { dueIfRentedNow, formatDue } from './rentUtils';
import { RentCart } from './useRentCart';

type CartPanelProps = {
  cart: RentCart;
  onRent: () => void;
};

/** Mobile: a bar above the tab bar. */
export function CartBar({ cart, onRent }: CartPanelProps) {
  const count = cart.cart.length;
  return (
    <div className="fixed inset-x-0 bottom-[calc(var(--tab-bar-height)+env(safe-area-inset-bottom))] z-30 flex flex-col gap-2.5 border-t border-border bg-surface px-4 pt-3 pb-3 shadow-[0_-8px_28px_rgba(11,26,58,0.10)]">
      <div className="flex items-center justify-between text-label font-normal">
        <span>
          <b className="text-[15px] font-bold">{count}개</b> 담음{' '}
          <span className="text-fg-muted">· 남은 한도 {cart.remaining}개</span>
        </span>
        {count > 0 && (
          <span className="text-fg-muted">
            반납 기한 {formatDue(dueIfRentedNow())}
          </span>
        )}
      </div>
      <Button
        block
        disabled={count === 0}
        onClick={onRent}
        className="h-[52px] rounded-lg text-base font-bold"
      >
        {count > 0 ? `${count}개 빌리기` : '빌릴 장비를 담아 주세요'}
      </Button>
    </div>
  );
}

/** Desktop: the sticky card beside the catalogue. */
export function CartCard({ cart, onRent }: CartPanelProps) {
  const count = cart.cart.length;
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-surface p-[18px] shadow-md">
      <div className="flex items-baseline justify-between">
        <h2 className="text-heading">담은 장비 {count}개</h2>
        <span className="text-caption text-fg-muted">
          남은 한도 {cart.remaining}개
        </span>
      </div>
      {count === 0 ? (
        <p className="py-3 text-label font-normal text-fg-muted">
          빌릴 장비의 담기를 눌러 주세요.
        </p>
      ) : (
        <ul>
          {cart.cart.map((equip) => (
            <li
              key={equip.id}
              className="flex items-center gap-2.5 border-b border-gray-100 py-2 last:border-b-0"
            >
              <EquipmentThumb
                src={equip.img_path}
                className="size-10 rounded-[8px]"
              />
              <span className="min-w-0 flex-1 truncate text-sm">
                {equip.name}
              </span>
              <button
                type="button"
                aria-label={`${equip.name} 빼기`}
                onClick={() => cart.toggle(equip)}
                className="flex size-8 items-center justify-center rounded-md text-fg-muted hover:bg-gray-100"
              >
                <X className="size-3.5" strokeWidth={2.4} />
              </button>
            </li>
          ))}
        </ul>
      )}
      {count > 0 && (
        <div className="flex flex-col gap-0.5 rounded-md bg-accent-soft p-3">
          <span className="text-caption font-semibold text-star-800">
            반납 기한
          </span>
          <span className="text-base font-bold">
            {formatDue(dueIfRentedNow())}까지
          </span>
        </div>
      )}
      <Button
        disabled={count === 0}
        onClick={onRent}
        className="h-12 rounded-lg text-[15px] font-bold"
      >
        {count > 0 ? `${count}개 빌리기` : '빌릴 장비를 담아 주세요'}
      </Button>
    </div>
  );
}
