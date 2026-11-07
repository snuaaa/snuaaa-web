import { Flashlight } from 'lucide-react';
import { useObservationMode } from '~/hooks/useObservationMode';
import { cn } from '~/lib/utils';

/**
 * 관측 모드 switch for the navy header: a flashlight, like the red torch
 * observers carry, that fills in while the red-light theme is on. Not a
 * moon, which reads as a dark-theme switch.
 */
export default function ObservationToggle({
  className,
}: {
  className?: string;
}) {
  const { on, toggle } = useObservationMode();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label="관측 모드"
      title={on ? '관측 모드 끄기' : '관측 모드 켜기'}
      className={cn(
        'flex size-11 shrink-0 items-center justify-center rounded-full text-fg-on-brand-muted transition-colors hover:text-fg-on-brand motion-reduce:transition-none',
        on && 'bg-surface-brand-raised text-fg-on-brand',
        className,
      )}
    >
      <Flashlight className={cn('size-5', on && 'fill-current')} aria-hidden />
    </button>
  );
}
