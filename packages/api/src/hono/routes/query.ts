import { z } from 'zod';

/**
 * A query parameter read like Express's `Number(value) || fallback`: a
 * positive whole number, or `fallback` for anything else (missing, empty,
 * zero, negative or not a number). Values past a Postgres `integer` are
 * capped, so the query can't fail on them.
 */
export function pageNumber(fallback: number) {
  return z
    .string()
    .optional()
    .transform((value) => {
      const number = Math.floor(Number(value));
      return number > 0 ? Math.min(number, 2_147_483_647) : fallback;
    });
}
