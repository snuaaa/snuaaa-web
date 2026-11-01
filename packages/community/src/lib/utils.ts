import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';
import { SERVER_URL } from '~/constants/env';

const isSafeArea = (value: string) => /^safe-\d+(\.\d+)?$/.test(value);

// Teach tailwind-merge the custom utilities in index.css: the type scale,
// so `text-label` is treated as a font size and does not knock out `text-fg`
// (a color), and the layout values (`max-w-page`, `pb-tab-bar`,
// `pt-safe-2`), so they override and get overridden like the built-ins.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      container: ['page'],
      spacing: ['tab-bar'],
    },
    classGroups: {
      pt: [{ pt: [isSafeArea] }],
      pb: [{ pb: [isSafeArea] }],
      'font-size': [
        {
          text: [
            'display',
            'title',
            'heading',
            'body',
            'label',
            'caption',
            'micro',
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Resolves an uploaded file path the same way `AaaImage` does. */
export function resolveImageUrl(path?: string | null) {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  return `${SERVER_URL}static${path}`;
}
