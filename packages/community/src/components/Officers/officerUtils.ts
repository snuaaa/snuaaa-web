import type { OfficerGeneration } from '~/services/types';

const normalize = (value: string) => value.replace(/\s+/g, '').toLowerCase();

/** Whether `text` contains the search `query`, ignoring spaces and case. */
export function matches(text: string, query: string) {
  const needle = normalize(query);
  return needle.length > 0 && normalize(text).includes(needle);
}

/** "김민성, 김민주" → ['김민성', '김민주']; also splits on · and /. */
export function parseNames(value: string) {
  return value
    .split(/[,，·/]/)
    .map((name) => name.trim())
    .filter(Boolean);
}

export type OfficerMatch = { generation: number; roles: string[] };

/** Where `query` shows up in each 기수: "회장", or the matching 직책. */
export function findMatches(
  generations: OfficerGeneration[],
  query: string,
): OfficerMatch[] {
  if (!normalize(query)) return [];
  return generations.flatMap(({ generation, president, roles }) => {
    const found = [
      ...(matches(president, query) ? ['회장'] : []),
      ...roles
        .filter(
          (role) =>
            matches(role.role, query) ||
            role.names.some((name) => matches(name, query)),
        )
        .map((role) => role.role),
    ];
    if (found.length === 0 && !matches(`${generation}대`, query)) return [];
    return [{ generation, roles: found }];
  });
}

/** The row id a summary item scrolls to. */
export const generationRowId = (generation: number) =>
  `officers-generation-${generation}`;
