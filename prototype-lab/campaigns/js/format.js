/**
 * Purpose: how the site writes numbers and times: SOL amounts from lamports, the US$ display value, percentages,
 *          short addresses, a moment in UTC and in the visitor's time, relative times and the review countdown.
 *          The prototype runs on a fixed clock, NOW, so every state looks the same on every visit.
 * Version: 0.1.0 · Sprint -1 (design system), 2026-10-08. Sprint 05's SDK owns these rules in the real site.
 */
export const LAMPORTS = 1_000_000_000;
/** The prototype's "now": 2026-10-08 21:00 UTC. Real screens use chain time (TP §3.6, A-7). */
export const NOW = Date.UTC(2026, 9, 8, 21, 0, 0);
export const HOUR = 3_600_000;
export const DAY = 24 * HOUR;

/**
 * Lamports as SOL: up to 4 decimals, trailing zeros trimmed, commas for thousands (spec 1.3). `exact` writes all 9,
 * for summaries and receipts. What a wallet pays rounds up and what it receives rounds down (`round`).
 */
export function sol(lamports, { unit = true, sign = false, exact = false, round = "near" } = {}) {
  const dp = exact ? 9 : 4;
  const step = 10 ** (9 - dp);
  const r = round === "up" ? Math.ceil(lamports / step) : round === "down" ? Math.floor(lamports / step) : Math.round(lamports / step);
  const v = (r * step) / LAMPORTS;
  const text = v.toLocaleString("en-US", { minimumFractionDigits: exact ? 9 : 0, maximumFractionDigits: dp });
  return `${sign && v > 0 ? "+" : ""}${text}${unit ? " SOL" : ""}`;
}

/** A display-only US$ value, with "≈" (spec 1.3): never the price a transaction uses. */
export const usdApprox = (n) => `≈ US$${n.toLocaleString("en-US", { minimumFractionDigits: n < 1000 ? 2 : 0, maximumFractionDigits: n < 1000 ? 2 : 0 })}`;

/** A US$ display value. Never used to move money: the program charges in lamports at the Pyth price. */
export const usd = (n, dp = n >= 100 ? 0 : 2) =>
  "$" + n.toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp });

/** Lamports shown in US$ at a given SOL/USD price. */
export const lamportsUsd = (lamports, price) => usd((lamports / LAMPORTS) * price);

export const pct = (x, dp = 0) => `${(x * 100).toFixed(dp)}%`;

/** A price or metric value with its unit: "$119.22", "1.25M SOL", "41,200,000 tokens". */
export function value(v, unit = "") {
  if (unit === "$") return usd(v, v >= 1000 ? 0 : 2);
  const big = Math.abs(v) >= 1e6 ? `${(v / 1e6).toLocaleString("en-US", { maximumFractionDigits: 2 })}M` : v.toLocaleString("en-US", { maximumFractionDigits: 2 });
  return unit ? `${big} ${unit}` : big;
}

/** "Demo…QpK3": the first four and last four characters; the full address goes in a title or a copy button. */
export const short = (address) => (address.length > 10 ? `${address.slice(0, 4)}…${address.slice(-4)}` : address);

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const pad = (n) => String(n).padStart(2, "0");

/** "Oct 15, 2026 · 18:00 UTC". */
export function utc(ts) {
  const d = new Date(ts);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()} · ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC`;
}

/** The same moment in the visitor's own time zone, e.g. "Oct 15, 15:00 your time". */
export function local(ts) {
  const d = new Date(ts);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${pad(d.getHours())}:${pad(d.getMinutes())} your time`;
}

/** A span of time as the spec writes it: "2d 17h", "5h 12m", "42m 10s" (seconds only under an hour). */
export function dur(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const [d, h, m] = [Math.floor(s / 86400), Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60)];
  if (d) return h ? `${d}d ${h}h` : `${d}d`;
  if (h) return m ? `${h}h ${m}m` : `${h}h`;
  return s % 60 ? `${m}m ${s % 60}s` : `${m}m`;
}

/** "in 2d 17h", "in 42m 10s", "5h 12m ago", "just now". */
export function rel(ts, now = NOW) {
  const ms = ts - now;
  if (Math.abs(ms) < 60000) return "just now";
  return ms > 0 ? `in ${dur(ms)}` : `${dur(-ms)} ago`;
}

/** The time left on a clock (the review window, a contest stage): "3h 12m", never negative. */
export const countdown = (ts, now = NOW) => dur(ts - now);

/** A whole number with commas: slots, supplies, ids. */
export const int = (n) => Math.round(n).toLocaleString("en-US");

/** Escapes text for templates: everything shown comes from mock data, but the habit carries to the real site. */
export const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
