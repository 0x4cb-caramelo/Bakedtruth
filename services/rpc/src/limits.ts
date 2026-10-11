/**
 * Purpose: brot-rpc's limits (TP §3.5; Sprint 08), all in memory, none written to a disk or a log: whose request it is
 *          (Cloudflare's `cf-connecting-ip`, an IPv6 address by its /64, since one host holds a whole /64, and by its
 *          /48 for a second, wider bucket), a weighted token bucket per client, the daily credit budget the relay may
 *          spend upstream (counted per UTC day, a tenth kept for the signing path), and
 *          a short cache of answers. A sweep every ten seconds drops a bucket idle for 50 s or full again, and expired
 *          answers, so a visitor's IP stays in memory about a minute after its last call (the legal review, R1). Pure but
 *          for the clock it is given.
 * Version: 0.2.0 (the Sprint 08 legal review, R1: the timed sweep; the security review, M3: the /48, the reserve)
 * Sprint:  08 (indexer, API, relay and points)
 */

/** An IPv6 address's /48, the size one customer can hold, for a second bucket (the security review, M3); null for IPv4. */
export function areaKey(ip: string | null | undefined): string | null {
  const key = clientKey(ip);
  return key.endsWith("::/64") ? `${key.split(":").slice(0, 3).join(":")}::/48` : null;
}

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

export type Limiter = { take(key: string, weight: number): boolean; size(): number; sweep(): void };
/** A bucket idle this long is dropped by the sweep, whatever it holds: an IP stays about a minute after its last call. */
export const IDLE_MS = 50_000;

/** `ratePerSecond` credits earned per second, at most `burst` held; an idle client's bucket is dropped once full. */
export function createLimiter(o: { ratePerSecond: number; burst: number; now: () => number }): Limiter {
  const buckets = new Map<string, { tokens: number; at: number }>();
  let calls = 0;
  const prune = (now: number) => {
    for (const [key, b] of buckets)
      if (now - b.at >= IDLE_MS || b.tokens + ((now - b.at) / 1_000) * o.ratePerSecond >= o.burst) buckets.delete(key);
  };
  return {
    size: () => buckets.size,
    /** Run every 10 s by main.ts (the legal review, R1), as the landing's limiter is. */
    sweep: () => prune(o.now()),
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

export type Budget = { spend(weight: number, signing?: boolean): boolean; left(): number };
/** The share of the day's budget kept for the signing path (send, simulate, statuses, heights, blockhashes): reads
 * alone can never spend it, so a flood of reads still leaves bakers able to sign and the guard able to watch (M3). */
export const SIGNING_RESERVE = 0.1;

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
    spend(weight, signing = false) {
      roll();
      const ceiling = signing ? o.daily : o.daily * (1 - SIGNING_RESERVE);
      if (spent + weight > ceiling) return false;
      spent += weight;
      return true;
    },
  };
}

export type Cache = {
  get(key: string): unknown;
  set(key: string, value: unknown, ms: number): void;
  size(): number;
  sweep(): void;
};

export function createCache(now: () => number, max = 10_000): Cache {
  const entries = new Map<string, { value: unknown; until: number }>();
  return {
    size: () => entries.size,
    sweep() {
      for (const [k, e] of entries) if (e.until <= now()) entries.delete(k);
    },
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
