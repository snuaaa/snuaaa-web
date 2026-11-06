import { useEffect } from 'react';

/** Below this, a visual viewport gap is browser chrome, not a keyboard. */
const MIN_KEYBOARD_HEIGHT = 80;

function isTextEntry(el: Element | null): boolean {
  if (!el) return false;
  if (el instanceof HTMLTextAreaElement) return !el.readOnly;
  if (el instanceof HTMLInputElement) {
    return (
      !el.readOnly &&
      ![
        'button',
        'checkbox',
        'color',
        'file',
        'hidden',
        'image',
        'radio',
        'range',
        'reset',
        'submit',
      ].includes(el.type)
    );
  }
  return el instanceof HTMLElement && el.isContentEditable;
}

/**
 * Tracks the on-screen keyboard and exposes it to CSS on <html>:
 *
 * - `--keyboard-inset`: how much of the layout viewport's bottom the keyboard
 *   covers. iOS Safari (and Android Chrome's default `resizes-visual`) keep
 *   the layout viewport full height under the keyboard, so `bottom: 0` fixed
 *   and sticky elements end up behind it. `bottom: var(--keyboard-inset)`
 *   puts them on top of it instead.
 * - `data-keyboard-open`: set while a text field has focus on a touch screen,
 *   for the `keyboard-open:` variant (index.css). Fixed bottom chrome such as
 *   the tab bar hides with it so it can't sit over the field being typed in.
 *
 * Mount once, at the root.
 */
export default function useVirtualKeyboard() {
  useEffect(() => {
    const root = document.documentElement;
    const vv = window.visualViewport;
    const coarse = window.matchMedia('(pointer: coarse)');
    let frame = 0;

    const update = () => {
      frame = 0;
      const covered = vv
        ? Math.round(window.innerHeight - vv.height - vv.offsetTop)
        : 0;
      const inset = covered >= MIN_KEYBOARD_HEIGHT ? covered : 0;
      const open =
        isTextEntry(document.activeElement) && (coarse.matches || inset > 0);

      root.style.setProperty('--keyboard-inset', `${inset}px`);
      root.toggleAttribute('data-keyboard-open', open);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    vv?.addEventListener('resize', schedule);
    vv?.addEventListener('scroll', schedule);
    window.addEventListener('resize', schedule);
    // Batched to a frame: focusout fires before the next field takes focus,
    // so moving between fields doesn't flash the tab bar.
    document.addEventListener('focusin', schedule);
    document.addEventListener('focusout', schedule);
    return () => {
      cancelAnimationFrame(frame);
      vv?.removeEventListener('resize', schedule);
      vv?.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      document.removeEventListener('focusin', schedule);
      document.removeEventListener('focusout', schedule);
      root.style.removeProperty('--keyboard-inset');
      root.removeAttribute('data-keyboard-open');
    };
  }, []);
}
