/**
 * Purpose: in-memory request limiter per visitor address, so one address cannot flood the waitlist endpoint.
 * Version: 0.2.0 · Sprint: out of band (landing page), 2026-10-05; 2026-10-10 (`sweep`: the legal review of answer 9a)
 *
 * The address lives only in this process's memory. It is never written to disk or to a log, and it is dropped once its
 * window has ended: the server calls `sweep` every few seconds, since the privacy page says the address is used for
 * about a minute. A full map also prunes before refusing a new address. One process only: a second instance would need
 * a shared store.
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
    /** Drops every address whose window has ended. */
    sweep: (now = Date.now()) => prune(now),

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
