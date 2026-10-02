// Display formatting for base-unit amounts, prices and slot-based times. Framework-free.

const groupThousands = (digits: string) => digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

/** `amount` base units as a decimal string, e.g. 1234500000 with 6 decimals -> "1,234.5". */
export function formatUnits(amount: bigint, decimals: number, maxFraction = decimals): string {
  const negative = amount < BigInt(0);
  const abs = negative ? -amount : amount;
  const scale = BigInt(10) ** BigInt(decimals);
  const whole = abs / scale;
  let fraction = (abs % scale).toString().padStart(decimals, "0").slice(0, maxFraction);
  fraction = fraction.replace(/0+$/, "");
  return `${negative ? "-" : ""}${groupThousands(whole.toString())}${fraction ? `.${fraction}` : ""}`;
}

/** Parses a user-typed decimal ("12.5") into base units, or null if it is not a valid amount. */
export function parseUnits(text: string, decimals: number): bigint | null {
  const trimmed = text.trim().replace(/,/g, "");
  if (!/^\d*\.?\d*$/.test(trimmed) || trimmed === "" || trimmed === ".") return null;
  const [whole = "", fraction = ""] = trimmed.split(".");
  if (fraction.length > decimals) return null;
  return BigInt(whole || "0") * BigInt(10) ** BigInt(decimals) + BigInt(fraction.padEnd(decimals, "0") || "0");
}

export const formatUsdc = (base: bigint) => formatUnits(base, 6);

/** Basis points as a percentage: 1000 -> "10%", 3333 -> "33.33%". */
export const formatBps = (bps: number) => `${Number((bps / 100).toFixed(2))}%`;

export const shortAddress = (address: string, chars = 4) => `${address.slice(0, chars)}…${address.slice(-chars)}`;

/** A duration as its two largest units: "3d 4h", "2h 5m", "45s". */
export function formatDuration(ms: number): string {
  const seconds = Math.max(0, Math.round(ms / 1000));
  const units: [string, number][] = [
    ["d", 86_400],
    ["h", 3_600],
    ["m", 60],
    ["s", 1],
  ];
  const parts: string[] = [];
  let rest = seconds;
  for (const [label, size] of units) {
    if (rest >= size || (label === "s" && parts.length === 0)) {
      parts.push(`${Math.floor(rest / size)}${label}`);
      rest %= size;
    }
    if (parts.length === 2) break;
  }
  return parts.join(" ");
}

export type ClockInfo = { slot: number; epoch: number; msPerSlot: number; observedAt: number };

/** Estimated wall-clock time of `targetSlot`, from the current slot and the recent slot rate. */
export function slotTime(targetSlot: number, clock: ClockInfo) {
  const deltaMs = (targetSlot - clock.slot) * clock.msPerSlot;
  return { at: new Date(clock.observedAt + deltaMs), deltaMs };
}

/** "in 3h 12m" or "2d 1h ago", for a slot estimated against `clock`. */
export function relativeSlot(targetSlot: number, clock: ClockInfo) {
  const { deltaMs } = slotTime(targetSlot, clock);
  return deltaMs >= 0 ? `in ${formatDuration(deltaMs)}` : `${formatDuration(-deltaMs)} ago`;
}
