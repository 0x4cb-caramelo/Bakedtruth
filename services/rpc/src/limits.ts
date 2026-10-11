/**
 * Purpose: brot-rpc's limits (TP §3.5; Sprint 08), all in memory, none written to a disk or a log: whose request it is
 *          (Cloudflare's `cf-connecting-ip`, an IPv6 address by its /64, since one host holds a whole /64), a weighted
 *          token bucket per client, the daily credit budget the relay may spend upstream (counted per UTC day), and
 *          a short cache of answers. Idle buckets and expired answers are dropped, so the maps stay small. Pure but for
 *          the clock it is given.
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points)
 */

/** A client's key: an IPv4 address as it is, an IPv6 one cut to its first 64 bits; "direct" with no header. */
export function clientKey(ip: string | null | undefined): string {
  const text = ip?.trim().toLowerCase();
  if (!text) return "direct";
  const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/.exec(text);
  if (mapped) return mapped[1];
  if (!text.includes(":")) return text;
  const bare = text.split("%")[0];
  const [head, tail = ""] = bare.split("::");
  const left = head ? head.split(":") : [];
  const right = bare.includes("::") ? (tail ? tail.split(":") : []) : [];
  const groups = bare.includes("::")
    ? [...left, ...Array(Math.max(0, 8 - left.length - right.length)).fill("0"), ...right]
    : left;
  return `${groups
    .slice(0, 4)
    .map((g) => (g || "0").replace(/^0+(?=.)/, ""))
    .join(":")}::/64`;
}

export type Limiter = { take(key: string, weight: number): boolean; size(): number };

/** `ratePerSecond` credits earned per second, at most `burst` held; an idle client's bucket is dropped once full. */
export function createLimiter(o: { ratePerSecond: number; burst: number; now: () => number }): Limiter {
  const buckets = new Map<string, { tokens: number; at: number }>();
  let calls = 0;
  const prune = (now: number) => {
    for (const [key, b] of buckets)
      if (b.tokens + ((now - b.at) / 1_000) * o.ratePerSecond >= o.burst) buckets.delete(key);
  };
  return {
    size: () => buckets.size,
    take(key, weight) {
      const now = o.now();
      if (++calls % 1_000 === 0) prune(now);
      const b = buckets.get(key) ?? { tokens: o.burst, at: now };
      const tokens = Math.min(o.burst, b.tokens + ((now - b.at) / 1_000) * o.ratePerSecond);
      if (tokens < weight) {
        buckets.set(key, { tokens, at: now });
        return false;
      }
      buckets.set(key, { tokens: tokens - weight, at: now });
      return true;
    },
  };
}

export type Budget = { spend(weight: number): boolean; left(): number };

/** At most `daily` credits per UTC day, every client together; the count starts again at midnight UTC. */
export function createBudget(o: { daily: number; now: () => number }): Budget {
  let day = -1;
  let spent = 0;
  const roll = () => {
    const today = Math.floor(o.now() / 86_400_000);
    if (today !== day) {
      day = today;
      spent = 0;
    }
  };
  return {
    left: () => (roll(), Math.max(0, o.daily - spent)),
    spend(weight) {
      roll();
      if (spent + weight > o.daily) return false;
      spent += weight;
      return true;
    },
  };
}

export type Cache = { get(key: string): unknown; set(key: string, value: unknown, ms: number): void; size(): number };

export function createCache(now: () => number, max = 10_000): Cache {
  const entries = new Map<string, { value: unknown; until: number }>();
  return {
    size: () => entries.size,
    get(key) {
      const hit = entries.get(key);
      if (!hit) return undefined;
      if (hit.until <= now()) {
        entries.delete(key);
        return undefined;
      }
      return hit.value;
    },
    set(key, value, ms) {
      if (entries.size >= max)
        for (const [k, e] of entries) if (e.until <= now() || entries.size >= max) entries.delete(k);
      entries.set(key, { value, until: now() + ms });
    },
  };
}
