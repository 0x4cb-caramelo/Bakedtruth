/**
 * Purpose: in-memory request limiter per visitor address, so one address cannot flood the waitlist endpoint.
 * Version: 0.1.0 · Sprint: out of band (landing page), 2026-10-05
 *
 * The address lives only in this process's memory and is dropped when its window ends. It is never written to disk
 * or to a log. One process only: a second instance would need a shared store.
 */

/** Fixed window: at most `limit` calls per `windowMs` for each key. `maxKeys` bounds the memory used. */
export function createRateLimiter({ limit = 5, windowMs = 60_000, maxKeys = 20_000 } = {}) {
  const windows = new Map();

  function prune(now) {
    for (const [key, entry] of windows) {
      if (now - entry.start >= windowMs) windows.delete(key);
    }
  }

  return {
    size: () => windows.size,

    allow(key, now = Date.now()) {
      const entry = windows.get(key);
      if (!entry || now - entry.start >= windowMs) {
        if (windows.size >= maxKeys) prune(now);
        // Still full after pruning means a flood from many addresses: refuse new ones until windows expire.
        if (windows.size >= maxKeys && !windows.has(key)) return false;
        windows.set(key, { start: now, hits: 1 });
        return true;
      }
      entry.hits += 1;
      return entry.hits <= limit;
    },
  };
}
