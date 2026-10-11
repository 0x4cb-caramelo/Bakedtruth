/**
 * Purpose: the campaign search the top bar types into and the home grid filters by (the UI overhaul: the prototype's
 *          search lives in the top bar, `.search`), held in memory for this tab only: never sent, stored or put in the
 *          URL. A tiny external store, so both components read it through useSyncExternalStore.
 * Version: 0.1.0
 * Sprint:  09 (site shell); 10 (campaign list)
 */

let query = "";
const listeners = new Set<() => void>();

export const getQuery = (): string => query;

/** The server renders no query. */
export const serverQuery = (): string => "";

export function setQuery(next: string): void {
  if (next === query) return;
  query = next;
  for (const listener of listeners) listener();
}

export function subscribeQuery(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
