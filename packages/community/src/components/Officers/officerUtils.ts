import type { OfficerGeneration, OfficerRole } from '~/services/types';

export const PRESIDENT = '회장';

/** 회장 and the rest, so the 회장 can be shown on its own. */
export function splitPresident(roles: OfficerRole[]) {
  const president = roles.find((role) => role.role === PRESIDENT);
  return {
    president: president?.names ?? [],
    others: roles.filter((role) => role !== president),
  };
}

const normalize = (value: string) => value.replace(/\s+/g, '').toLowerCase();

/** Whether `text` contains the search `query`, ignoring spaces and case. */
export function matches(text: string, query: string) {
  const needle = normalize(query);
  return needle.length > 0 && normalize(text).includes(needle);
}

/** The 기수 that have a role or name matching `query`. */
export function filterGenerations(
  generations: OfficerGeneration[],
  query: string,
) {
  if (!normalize(query)) return generations;
  return generations.filter(
    (generation) =>
      matches(`${generation.generation}대`, query) ||
      generation.roles.some(
        (role) =>
          matches(role.role, query) ||
          role.names.some((name) => matches(name, query)),
      ),
  );
}

/** "김민성, 김민주" → ['김민성', '김민주']; also splits on · and /. */
export function parseNames(value: string) {
  return value
    .split(/[,，·/]/)
    .map((name) => name.trim())
    .filter(Boolean);
}
