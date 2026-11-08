import { useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '~/lib/utils';

/**
 * A dark pill above the tab bar (bottom center on desktop). It comes in with
 * a brief starlight ring and softens out, keeping the last message on screen
 * until it has faded.
 */
export function Toast({ message }: { message: string | null }) {
  const [shown, setShown] = useState(message);
  if (message !== null && message !== shown) setShown(message);
  const visible = message !== null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--tab-bar-height,0px)+env(safe-area-inset-bottom)+5rem)] z-50 flex justify-center px-4 md:bottom-8"
    >
      {shown !== null && (
        <span
          aria-hidden={!visible}
          className={cn(
            'flex h-11 items-center gap-2 rounded-full bg-gray-900 px-[18px] text-sm text-white shadow-md',
            visible
              ? 'animate-toast-in motion-reduce:animate-none'
              : 'animate-light-out motion-reduce:hidden',
          )}
        >
          <Check className="size-4 text-accent" strokeWidth={2.4} aria-hidden />
          {shown}
        </span>
      )}
    </div>
  );
}
