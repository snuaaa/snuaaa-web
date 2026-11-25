import { z } from 'zod';

/** The most rows one page of a list may ask for. The web asks for 24 at most. */
export const MAXIMUM_PAGE_SIZE = 100;

/**
 * A query parameter read like Express's `Number(value) || fallback`: a
 * positive whole number, or `fallback` for anything else (missing, empty,
 * zero, negative or not a number). Values above `maximum` (by default a
 * Postgres `integer`, so the query can't fail on them) are capped.
 */
export function pageNumber(fallback: number, maximum = 2_147_483_647) {
  return z
    .string()
    .optional()
    .transform((value) => {
      const number = Math.floor(Number(value));
      return number > 0 ? Math.min(number, maximum) : fallback;
    });
}

/** A page size (`limit`): `fallback` when missing, at most `MAXIMUM_PAGE_SIZE`. */
export function pageSize(fallback: number) {
  return pageNumber(fallback, MAXIMUM_PAGE_SIZE);
}
