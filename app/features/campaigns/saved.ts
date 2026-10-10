/**
 * Purpose: the "Saved" list of campaigns, kept in this browser's localStorage (Sprint 10: a per-viewer convenience, never
 *          state anyone else needs). Every read and write is guarded: storage can be blocked or throw, and then the list is
 *          simply empty for the page. Read through useSyncExternalStore, so no effect sets state.
 * Version: 0.1.0
 * Sprint:  10 (site: campaign list)
 */
const KEY = "brot-saved";
const EMPTY: ReadonlySet<string> = new Set();
let cached: ReadonlySet<string> | null = null;
const listeners = new Set<() => void>();

function read(): ReadonlySet<string> {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    return new Set(Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : []);
  } catch {
    return EMPTY;
  }
}

export function getSaved(): ReadonlySet<string> {
  if (typeof window === "undefined") return EMPTY;
  cached ??= read();
  return cached;
}

export function subscribeSaved(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function toggleSaved(address: string): void {
  const next = new Set(getSaved());
  if (next.has(address)) next.delete(address);
  else next.add(address);
  cached = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify([...next]));
  } catch {
    // Storage is blocked: the choice lasts for this page only.
  }
  listeners.forEach((notify) => notify());
}
