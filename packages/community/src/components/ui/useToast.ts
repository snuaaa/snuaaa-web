import { useCallback, useEffect, useRef, useState } from 'react';

/** Shows a short message, e.g. 링크를 복사했어요, for `duration` ms. */
export function useToast(duration = 2000) {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timer.current), []);

  const show = useCallback(
    (next: string) => {
      clearTimeout(timer.current);
      setMessage(next);
      timer.current = setTimeout(() => setMessage(null), duration);
    },
    [duration],
  );

  return { message, show };
}
