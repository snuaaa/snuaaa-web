import { Check } from 'lucide-react';
import { cn } from '~/lib/utils';

/** A dark pill above the tab bar (bottom center on desktop). */
export function Toast({ message }: { message: string | null }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'pointer-events-none fixed inset-x-0 bottom-[calc(var(--tab-bar-height,0px)+env(safe-area-inset-bottom)+5rem)] z-50 flex justify-center px-4 transition-opacity md:bottom-8',
        message ? 'opacity-100' : 'opacity-0',
      )}
    >
      {message && (
        <span className="flex h-11 items-center gap-2 rounded-full bg-gray-900 px-[18px] text-sm text-white shadow-md">
          <Check className="size-4 text-accent" strokeWidth={2.4} aria-hidden />
          {message}
        </span>
      )}
    </div>
  );
}
