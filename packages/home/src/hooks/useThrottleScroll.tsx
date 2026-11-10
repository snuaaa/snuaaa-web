import { useEffect, useRef } from 'react';

const TIMEOUT = 0.7 * 1000;
const THRESHOLD = 50;

const useThrottleScroll = (up: () => void, down: () => void) => {
  const canCallback = useRef<boolean>(true);
  const touchInit = useRef<number>(0);

  useEffect(() => {
    const wheelCallback = (ev: WheelEvent) => {
      if (
        canCallback.current &&
        (ev.deltaY > THRESHOLD || ev.deltaY < -THRESHOLD)
      ) {
        if (ev.deltaY > THRESHOLD) {
          down();
        } else if (ev.deltaY < -THRESHOLD) {
          up();
        }
        canCallback.current = false;
        window.setTimeout(() => {
          canCallback.current = true;
        }, TIMEOUT);
      }
    };

    const touchStart = (ev: TouchEvent) => {
      touchInit.current = ev.touches[0].clientY;
    };

    const touchMove = (ev: TouchEvent) => {
      const deltaY = touchInit.current - ev.touches[0].clientY;
      if (canCallback.current && (deltaY > THRESHOLD || deltaY < -THRESHOLD)) {
        if (deltaY > THRESHOLD) {
          down();
        } else if (deltaY < -THRESHOLD) {
          up();
        }
        canCallback.current = false;
        touchInit.current = ev.touches[0].clientY;
        window.setTimeout(() => {
          canCallback.current = true;
        }, TIMEOUT);
      }
    };

    document.addEventListener('wheel', wheelCallback);
    document.addEventListener('touchstart', touchStart);
    document.addEventListener('touchmove', touchMove);
    return () => {
      document.removeEventListener('wheel', wheelCallback);
      document.removeEventListener('touchstart', touchStart);
      document.removeEventListener('touchmove', touchMove);
    };
  }, [up, down]);
};

export default useThrottleScroll;
