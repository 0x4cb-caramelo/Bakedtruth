/**
 * Purpose: A-8's back-off. When Brot's program is no longer the deploy this site was built for, the page does not sign:
 *          it waits, then reloads to fetch a site built for the new deploy. The wait grows with each reload this tab
 *          already made for it (5 s, 30 s, 2 min, then 10 min), since a site is built again some time after the
 *          program's upgrade; a deploy check that passes starts the count over. The count lives in sessionStorage
 *          (this tab only); where it cannot be kept, the page waits the longest.
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry; A-8 by the founder's answer of 2026-10-10)
 */

/** Seconds before the first reload, then each next one, then every later one. */
export const RELOAD_DELAYS_S = [5, 30, 120, 600] as const;

const KEY = "brot-a8-reloads";
const LONGEST = RELOAD_DELAYS_S[RELOAD_DELAYS_S.length - 1];

export type ReloadCount = Pick<Storage, "getItem" | "setItem" | "removeItem">;

/** This tab's sessionStorage, or `null` where the browser refuses it (a private window, blocked site data). */
export function sessionCount(): ReloadCount | null {
  try {
    return typeof window === "undefined" ? null : window.sessionStorage;
  } catch {
    return null;
  }
}

/** The reloads this tab made for A-8 since a check last passed; `null` when the count cannot be read. */
function made(store: ReloadCount | null): number | null {
  if (!store) return null;
  try {
    const text = store.getItem(KEY);
    if (text === null) return 0;
    return /^\d{1,4}$/.test(text) ? Number(text) : null;
  } catch {
    return null;
  }
}

/** Seconds to wait before the next reload. */
export function reloadDelay(store: ReloadCount | null): number {
  const count = made(store);
  return count === null ? LONGEST : (RELOAD_DELAYS_S[count] ?? LONGEST);
}

/** Counts one more reload for A-8 (best effort: a count that cannot be kept means the longest wait next time). */
export function countReload(store: ReloadCount | null): void {
  try {
    store?.setItem(KEY, String(Math.min((made(store) ?? RELOAD_DELAYS_S.length) + 1, 9999)));
  } catch {
    // Storage refused: the next page cannot read the count, so it waits the longest.
  }
}

/** A deploy check passed: the next mismatch waits the shortest again. */
export function deployConfirmed(store: ReloadCount | null = sessionCount()): void {
  try {
    store?.removeItem(KEY);
  } catch {
    // Nothing to reset where storage is refused.
  }
}

/** Reloads the page for A-8, counting the reload first. */
export function reloadForUpgrade(store: ReloadCount | null = sessionCount()): void {
  countReload(store);
  window.location.reload();
}
