import { useCallback, useSyncExternalStore } from 'react';

/** Also read by the inline script in index.html, before first paint. */
const STORAGE_KEY = 'aaa:observationMode';
const THEME_COLOR = { on: '#000000', off: '#010f2d' };

const listeners = new Set<() => void>();

const isOn = () => document.documentElement.dataset.observation === 'on';

function apply(on: boolean) {
  const root = document.documentElement;
  if (on) root.dataset.observation = 'on';
  else delete root.dataset.observation;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', on ? THEME_COLOR.on : THEME_COLOR.off);
  try {
    if (on) window.localStorage.setItem(STORAGE_KEY, 'on');
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Private mode or blocked storage: the mode lasts until reload.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Keep other tabs in step.
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) apply(event.newValue === 'on');
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

if (typeof document !== 'undefined' && isOn()) {
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', THEME_COLOR.on);
}

/** 관측 모드: the red-light night theme (index.css), remembered per device. */
export function useObservationMode() {
  const on = useSyncExternalStore(subscribe, isOn, () => false);
  const toggle = useCallback(() => apply(!isOn()), []);
  return { on, toggle };
}
