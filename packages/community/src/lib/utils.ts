import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';
import { SERVER_URL } from '~/constants/env';

// Teach tailwind-merge the custom type scale in index.css, so `text-label`
// is treated as a font size and does not knock out `text-fg` (a color).
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
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
