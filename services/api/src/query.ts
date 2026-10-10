/**
 * Purpose: validates the list's query string. An unknown parameter, a bad state, or a limit or offset out of range is a
 *          400 with a named code; nothing is guessed. The states "active" (open or closed) and "resolved" (in review,
 *          paid or void) group the five public states.
 * Version: 0.1.0
 * Sprint:  08 (indexer and API, hackathon MVP)
 */

export type ListQuery = { states: ReadonlySet<string> | null; limit: number; offset: number };
export class BadQuery extends Error {}

const GROUPS: Record<string, string[]> = {
  open: ["open"],
  closed: ["closed"],
  in_review: ["in_review"],
  paid: ["paid"],
  void: ["void"],
  active: ["open", "closed"],
  resolved: ["in_review", "paid", "void"],
};
const ALLOWED = new Set(["state", "limit", "offset"]);

export function parseListQuery(url: URL): ListQuery {
  for (const key of url.searchParams.keys()) {
    if (!ALLOWED.has(key)) throw new BadQuery(`unknown parameter: ${key}`);
  }
  const state = url.searchParams.get("state");
  let states: ReadonlySet<string> | null = null;
  if (state !== null) {
    const group = GROUPS[state];
    if (!group) throw new BadQuery(`state must be one of ${Object.keys(GROUPS).join(", ")}`);
    states = new Set(group);
  }
  return {
    states,
    limit: integer(url, "limit", 50, 1, 100),
    offset: integer(url, "offset", 0, 0, Number.MAX_SAFE_INTEGER),
  };
}

export function integer(url: URL, name: string, fallback: number, min: number, max: number): number {
  const raw = url.searchParams.get(name);
  if (raw === null) return fallback;
  if (!/^\d+$/.test(raw)) throw new BadQuery(`${name} must be a whole number`);
  const value = Number(raw);
  if (value < min || value > max) throw new BadQuery(`${name} must be between ${min} and ${max}`);
  return value;
}
