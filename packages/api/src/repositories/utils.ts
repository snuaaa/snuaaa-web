/**
 * The id as a number, or null when it isn't a positive integer that fits a
 * Postgres `integer`. Querying with anything else would make Postgres throw
 * (a 500), so callers treat null as "not found".
 */
export function parseId(id: unknown): number | null {
  const text = String(id);
  if (!/^\d+$/.test(text)) {
    return null;
  }
  const value = Number(text);
  return value > 0 && value <= 2_147_483_647 ? value : null;
}
