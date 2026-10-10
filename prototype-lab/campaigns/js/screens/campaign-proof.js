/**
 * Purpose: the campaign page's proof block and re-check panel. The proof: the value read now against the target, the
 *          distance (price, burn) or a bar (targets that only grow), "If read now", the account read with its reviewed
 *          name or short address (A-11) and the owner program the reader checks, the last read, both moments in UTC
 *          and local time, how it resolves, and on price campaigns the confidence and the 120 s age limit; after a
 *          reading, the value the program recorded. The re-check panel (BR-23, P1 §4.4, spec 3.7) shows the raw field
 *          and a command that fetches the same bytes through any RPC, at the reader's real offsets.
 * Version: 0.1.0 · Sprint -1 (design system), 2026-10-08. Offsets from programs/brot-markets/src/readers/price_touch.rs
 *          and RESOLVERS.md. Sprint 05's SDK exposes recheck(campaign, rpcUrl); Sprint 11 draws the panel.
 */
import { SOL_USD } from "../data/index.js";
import { esc, local, NOW, pct, rel, short, usd, utc, value } from "../format.js";
import { voidReason } from "../ui/card.js";
import { hashQuery } from "../ui/entry.js";
import { icon } from "../ui/icons.js";
import { notice } from "../ui/notices.js";
import { liveVsTarget } from "../ui/parts.js";

const RPC = "https://api.devnet.solana.com";
export const int = (n) => Math.round(n).toLocaleString("en-US");
const explorer = (a) => `https://explorer.solana.com/address/${a}?cluster=devnet`;
/** An address as "Demo…QpK3" linked to the explorer, the whole address on hover. */
export const addr = (a) =>
  `<a class="cp-addr mono" href="${explorer(a)}" target="_blank" rel="noopener" title="${a}" data-explorer>${short(a)}${icon("arrow-up-right", 12)}</a>`;
/** A target or value in full digits, as the page and the re-check panel write them (spec 1.3). */
export const full = (v, unit) => (unit === "$" ? value(v, "$") : `${int(v)} ${unit}`);
export const met = (c, v) => (c.direction === "below" ? v <= c.target : v >= c.target);
export const copyBtn = (text, what) =>
  `<button type="button" class="icon-btn cp-copy" data-copy="${esc(text)}" data-what="${what}" aria-label="Copy the ${what}">${icon("copy", 14)}</button>`;

/** Per kind: owner the reader checks, its id, the field, the bytes to fetch and how to read them (TP §3.4.8). */
const READ = {
  price: ["Pyth receiver", "rec2HHDDnjLfj4kE7VyEtFA1HPGQLK33259532cRyHp", "price · i64 at byte 73", [73, 28], "Bytes 0–7 price (i64, little-endian) · 8–15 confidence · 16–19 exponent · 20–27 publish time."],
  burn: ["SPL Token", "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA", "supply · u64 at byte 36", [0, 44], "Bytes 0–3 mint authority tag (0 = revoked, so supply can't grow) · 36–43 supply (u64, little-endian, in base units)."],
  lock: ["Meteora DAMM v2", "cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG", "permanent_lock_liquidity · u128 at byte 552", [552, 16], "Bytes 0–15 the liquidity locked for good (u128, little-endian). It only grows."],
  pool: ["SPL Stake Pool", "SPoo1Ku8WFXoNDMHPsrGSTSG1Y47rzgn41SLUNakuHy", "last_epoch_total_lamports · u64 at byte 427", [427, 8], "Bytes 0–7 the pool's lamports at its last epoch start (u64, little-endian; byte 427 when no option is set)."],
  stake: ["Vote program", "Vote111111111111111111111111111111111111111", "activated stake of the vote account", null, "activatedStake is the vote account's stake this epoch, in lamports; the program reads the same through sol_get_epoch_stake."],
};

/** The feed's confidence band: the mock uses the SOL/USD fixture's width for every feed. */
const conf = (c) => {
  const x = c.live.value * (SOL_USD.conf / SOL_USD.price);
  return usd(x, x < 1 ? 4 : 2);
};
const feedStale = (c) => c.kind === "price" && hashQuery().get("feed") === "stale";
const before = (c) => c.status === "open" || c.status === "closed";

function gap(c) {
  if (!c.live) return `<p class="cp-gap is-off">${icon("alert", 14)}The account can't be read now.</p>`;
  const v = c.live.value;
  if (met(c, v)) return `<p class="cp-gap is-met">${icon("check", 14)}At the target now.</p>`;
  const rate = (c.target - v) / v;
  const text = `${value(Math.abs(c.target - v), c.unit)} to go · ${rate > 0 ? "+" : "−"}${pct(Math.abs(rate), 1)}`;
  if (c.kind === "price" || c.direction === "below") return `<p class="cp-gap">${text}</p>`;
  const share = Math.min(1, v / c.target);
  return `<div class="cp-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(share * 100)}" aria-valuetext="${pct(share)} of the target">
      <span style="width:${(share * 100).toFixed(1)}%"></span></div><p class="cp-gap">${text}</p>`;
}

function recorded(c) {
  const o = c.observed;
  if (o) return `<div class="cp-recorded"><small>Recorded by the program</small><b class="num">${value(o.value, c.unit)}</b><span>${esc(o.label)} · slot ${int(o.slot)} · ${utc(o.at)}</span></div>`;
  return c.status === "void" ? `<p class="cp-recorded is-void">${icon("x", 15)}No value recorded: ${voidReason(c).toLowerCase()}.</p>` : "";
}

export function proof(c) {
  const live = c.live;
  const [owner, ownerId] = READ[c.kind];
  const ifNow = before(c) && live && met(c, live.value) ? "yes" : "no";
  const rows = [
    ["Account read", `${c.accountName ? esc(c.accountName) : '<span class="dim">No reviewed name</span>'} ${addr(c.account)}`],
    ["Owner checked", `${owner} <span class="mono dim" title="${ownerId}">${short(ownerId)}</span>`],
    live && ["Last read", `slot ${int(live.slot)} · ${rel(live.at)}`],
    c.kind === "price" && live && ["Price", `± ${conf(c)} confidence · published ${rel(live.at)}<small>Entries need a price under 120 s old</small>`],
    [c.entriesCloseAt > NOW ? "Entries close" : "Entries closed", `${utc(c.entriesCloseAt)}<small>${local(c.entriesCloseAt)}</small>`],
    [c.deadlineAt > NOW ? "Deadline" : "Deadline passed", `${utc(c.deadlineAt)}<small>${local(c.deadlineAt)}</small>`],
    ["Resolution", "Read by Brot's scheduled service; no resolve button.<small>No human picks the winner.</small>"],
  ].filter(Boolean);
  return `<section class="panel cp-proof" data-block="proof" data-perch="proof" data-perch-x="0.88" data-perch-size="1.1" data-perch-pose="point" data-perch-say="It's a read. Not a vote." aria-labelledby="cp-proof-h">
    <h2 class="panel-head" id="cp-proof-h">${icon("eye", 18)}On-chain proof${live ? `<span class="hint">Read ${rel(live.at)}</span>` : ""}</h2>
    ${recorded(c)}${liveVsTarget(c)}${before(c) ? gap(c) : ""}
    ${before(c) && live ? `<p class="cp-ifnow">If read now: <span class="chip ${ifNow}">${ifNow.toUpperCase()}</span><span>${ifNow === "yes" ? "the target is met" : "the target isn't met"}</span></p>` : ""}
    ${feedStale(c) ? notice("warn", `<b>No fresh ${esc(c.asset)} price in the last 120 s.</b> Entries wait for the next update.`) : ""}
    <dl class="rows cp-rows">${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>
  </section>`;
}

function raw(c, v) {
  if (c.kind === "price") {
    const n = c.asset === "SOL/USD" ? SOL_USD.price : Math.round(v * 1e8);
    return `${int(n)} × 10⁻⁸ = ${value(n / 1e8, "$")}`;
  }
  return c.kind === "pool" || c.kind === "stake" ? `${int(v * 1e9)} lamports = ${full(v, "SOL")}` : full(v, c.unit);
}

/** The re-check panel, collapsed by default (spec 3.7); `open` unfolds it. */
export function recheck(c, { open = false } = {}) {
  const [owner, ownerId, field, slice, decode] = READ[c.kind];
  const v = c.live?.value;
  // One request, laid out on several lines; it pastes into a shell as is (JSON allows the line breaks).
  const body = slice
    ? `{"jsonrpc":"2.0","id":1,"method":"getAccountInfo","params":[\n    "${c.account}",\n    {"encoding":"base64","commitment":"finalized","dataSlice":{"offset":${slice[0]},"length":${slice[1]}}}]}`
    : `{"jsonrpc":"2.0","id":1,"method":"getVoteAccounts","params":[\n    {"votePubkey":"${c.account}","commitment":"finalized"}]}`;
  const cmds = [
    ["curl", `curl -s ${RPC} \\\n  -H 'Content-Type: application/json' \\\n  -d '${body}'`],
    ["Solana CLI", slice ? `solana account ${c.account} --url devnet --output json` : "solana validators --url devnet --output json"],
    ["SDK", `import { recheck } from "@brot/sdk";\nawait recheck(campaign, "${RPC}");`],
  ];
  const rows = [
    ["Account", `<span class="mono cp-full">${c.account}</span>${copyBtn(c.account, "address")}`],
    ["Owner program", `${owner} <span class="mono dim" title="${ownerId}">${short(ownerId)}</span>`],
    ["Field", field],
    v != null && ["Value", raw(c, v)],
    c.live && ["Read at slot", `${int(c.live.slot)} · ${rel(c.live.at)}`],
    c.kind === "price" && c.live && ["Exponent · confidence", `−8 · ± ${conf(c)}`],
    c.observed && ["Value read at resolution", `${full(c.observed.value, c.unit)} at slot ${int(c.observed.slot)}`],
  ].filter(Boolean);
  return `<details class="panel cp-recheck" data-block="recheck"${open ? " open" : ""}>
    <summary><span class="cp-sum-title">${icon("terminal", 18)}Re-check it yourself</span><span class="hint">Same account, same answer.</span>${icon("chevron-down", 16)}</summary>
    <dl class="rows cp-rows">${rows.map(([k, x]) => `<div><dt>${k}</dt><dd>${x}</dd></div>`).join("")}</dl>
    <div class="seg cp-tabs" role="group" aria-label="Command">${cmds.map(([k], i) => `<button type="button" data-tab="${i}" aria-pressed="${i === 0}">${k}</button>`).join("")}</div>
    ${cmds.map(([k, cmd], i) => `<div class="cp-code" data-pane="${i}"${i ? " hidden" : ""}><pre tabindex="0" aria-label="${k} command"><code>${esc(cmd)}</code></pre>
      <button type="button" class="btn small" data-copy="${esc(cmd)}" data-what="command">${icon("copy", 14)}Copy</button></div>`).join("")}
    <p class="t-small">${decode}</p>
    <p class="t-caption">Any RPC works. The public devnet endpoint is rate-limited.</p>
  </details>`;
}
