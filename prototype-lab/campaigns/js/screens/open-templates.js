/**
 * Purpose: what the creation box knows before it reads anything: the five sentence templates (spec 1.5, P1 §4.2), the
 *          pinned Pyth feeds and the reviewed account names (A-11) with example readings and check results, the search
 *          behind "What should the chain answer?", the sentence a template writes from the slots (D-j: no free text),
 *          the devnet epoch estimate, and the opening quote at the Pyth SOL/USD price: the 90/10 split, the most the
 *          opener pays (`max_lamports`), the rent and the network fee (TP §3.4.10, §3.4.16).
 * Version: 0.1.0 · Sprint -1 (design system), 2026-10-08. "Demo…" addresses are invented; SOL/USD and BTC/USD are the
 *          real sponsored accounts. Sprint 19 reads all of it through /rpc and /api/v1/names.
 */
import { SOL_USD } from "../data/index.js";
import { DAY, HOUR, NOW, rel, short, sol, usd, utc } from "../format.js";
import { opening } from "../model.js";
import { state } from "../state.js";

export const RENT = 3_901_440; // Campaign (512 B) and its vault, devnet, measured in Sprint 02
export const NET_FEE = 5_000; // one signature
export const MAX_AGE_S = 120; // max_price_age and campaign_max_age on devnet (spec 1.6)
export const MARGIN_BPS = 100; // the most you'll pay: the quote + 1% (T25; Sprint 19 records the margin)
export const ID = "8231904417"; // the drawn id, fixed so the confirmed state links a page that exists
export const PROGRAM = "6G2d7Cv66MR1NayPabh5aL6ZThTx15WPxL3NU4N24uVN";
export const FAUCET = "https://faucet.solana.com";
/** 3 days plus 10 minutes, so the transaction still lands inside the rule (spec 3.12); 90 days at most. */
export const MIN_SPAN = 3 * DAY + 10 * 60_000;
export const MAX_SPAN = 90 * DAY;

/** Devnet epochs last about 28 h (432,000 slots of ~235 ms); in the prototype epoch 1168 began 13 h before now. */
const EPOCH = { n: 1168, at: NOW - 13 * HOUR, ms: 432_000 * 235 };
export const EPOCH_NOW = EPOCH.n;
export const epochStart = (e) => EPOCH.at + (e - EPOCH.n) * EPOCH.ms;
export const epochBefore = (ts) => EPOCH.n + Math.floor((ts - EPOCH.at - 1) / EPOCH.ms);

/** One template per kind. `open`: the program opens it now, later (Sprint 03), or after a YES checked on devnet. */
export const TEMPLATES = {
  price: { id: "price-touch", open: "now", what: "Asset", owner: "Pyth price account", program: "the Pyth receiver",
    words: "price touch reach hit fall drop above below usd dollar sol solana btc bitcoin pyth feed oracle" },
  burn: { id: "supply-burn", open: "later", what: "Token mint", owner: "SPL token mint", program: "the classic SPL Token program",
    words: "supply burn burned burning token mint fall drop circulating" },
  lock: { id: "meteora-lock", open: "later", what: "DAMM v2 pool", owner: "Meteora DAMM v2 pool", program: "Meteora DAMM v2",
    words: "lock locked liquidity lp meteora damm pool forever permanent" },
  pool: { id: "stake-pool", open: "later", what: "Stake pool", owner: "SPL stake pool", program: "the SPL Stake Pool program", epoch: true,
    words: "stake pool staking lst tvl size deposit epoch hold" },
  stake: { id: "validator-stake", open: "devnet", what: "Vote account", owner: "vote account", program: "the Vote program", epoch: true,
    words: "validator vote stake staked delegate delegation epoch active" },
};
export const OPENS = { now: "Opens now", later: "Opens later", devnet: "Opens after a test YES on devnet" };

/** Review switch ?feedstate= forces a row-4 refusal on one feed (stale, wide, zero, unverified). */
export const force = { feed: null, state: null };
const FEED_STATES = { stale: [6047, "Not fresh"], wide: [6048, "Too uncertain"], zero: [6049, "No valid price"], unverified: [6003, "Not verified"] };

/** The pinned feed list (spec 1.7 #9): the two feeds Pyth keeps fresh on devnet. SOL/USD goes stale with ?stale=1. */
export const FEEDS = [
  { name: "SOL/USD", asset: "SOL", account: "7AviUf9nL62mcxNbQGKm4nKDQnPjswo6c5MX4D57HmyE", price: SOL_USD.price / 1e8,
    conf: SOL_USD.conf / 1e8, id: "ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d",
    get at() { return state.stalePrice ? NOW - 140_000 : SOL_USD.at; } },
  { name: "BTC/USD", asset: "BTC", account: "APgzQGGdv2qCgBkX6aHVkrGePtBVDDg68GiqaM7rmtf5", price: 85_212.34, conf: 31.2,
    id: "e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43", at: NOW - 4_000 },
];
export const feed = (name) => FEEDS.find((f) => f.name === name);
export const freshFeed = () => FEEDS.find((f) => !feedProblem(f))?.name ?? FEEDS[0].name;

/** Why a feed can't back a campaign now (TP §3.4.10 row 4), or null. */
export function feedProblem(f) {
  const forced = force.feed === f.name && FEED_STATES[force.state];
  if (forced) return { code: forced[0], tag: forced[1] };
  if ((NOW - f.at) / 1000 > MAX_AGE_S) return { code: 6047, tag: "Not fresh" };
  return f.conf / f.price > 0.005 ? { code: 6048, tag: "Too uncertain" } : null;
}

/** The reviewed names (content/account-names.json in Sprint 19) and example accounts for every picker state. */
const A = (address, name, label, value, check = "ok") => ({ address, name, label, value, check });
export const ACCOUNTS = {
  burn: [A("DemoCrmbMint3Fh7Jk2Lq9Mz5Nr8Pt1Vw4Xy6", "CRMB", "$CRMB", 812_400_000), A("DemoMint8Qx2Wv5Lp9Kd3Rt7Ys1Hb4Nc6Zf", null, null, 41_200_000),
    A("DemoT22Mint5Gh8Jk2Lm6Np9Qr3St7Uv1Wx", 0, 0, 0, "owner"), A("DemoTokAcct4Ab7Cd1Ef4Gh8Jk2Lm5Np9Qr", 0, 0, 0, "layout"),
    A("DemoMintAuth6Rs9Tu2Vw5Xy8Za1Bc4De7Fg", 0, 0, 0, "rule")],
  lock: [A("DemoMeteoraPool6Gh3Jk8Lm2Np5Qr9St1Uv", "CRMB–SOL pool", "CRMB–SOL", 1_240_000), A("DemoDammPool2Xy5Za8Bc1De4Fg7Hj3Km6Ln", null, null, 310_000),
    A("DemoDlmmPair7Rs2Tu5Vw8Xy1Za4Bc7De3Fg", 0, 0, 0, "owner"), A("DemoDammCfg3Hj6Km9Ln2Pq5Rs8Tu1Vw4Xy", 0, 0, 0, "layout")],
  pool: [A("DemoYeastPool4Kj7Lm1Np8Qr3St6Uv9Wx2Yz", "Yeast stake pool", "the Yeast stake pool", 431_880),
    A("DemoStakePool7Ab2Cd5Ef8Gh1Jk4Lm7Np3", null, null, 52_300), A("DemoOtherPool5Mn8Pq2Rs6Tu9Vw3Xy7Za1", 0, 0, 0, "owner"),
    A("DemoValList4Bc7De1Fg4Hj8Km2Ln5Pq9Rs", 0, 0, 0, "layout")],
  stake: [A("DemoRyeVote2Cd5Ef8Gh1Jk4Lm7Np3Qr6St9", "Rye Validator", "Rye Validator", 958_310), A("DemoVote9Mn2Pq5Rs8Tu1Vw4Xy7Za3Bc6De", null, null, 120_400),
    A("DemoIdentity6Ef9Gh3Jk7Lm1Np4Qr8St2Uv", 0, 0, 0, "owner"), A("DemoVoteOld2Uv5Wx8Yz3Ab6Cd9Ef1Gh4Jk", 0, 0, 0, "layout")],
};
/** Base58-looking text of an address's length; the real box decodes it to 32 bytes. */
export const looksLikeAddress = (s) => /^[1-9A-Za-z]{32,44}$/.test(s);
/** What the relay answers for an address: a known example, or no account at all (spec: "not found"). */
export const lookup = (kind, address) => ACCOUNTS[kind]?.find((a) => a.address === address) ?? A(address, 0, 0, 0, "missing");
export const accepted = (d) => (d.kind !== "price" && d.res?.check === "ok" ? d.res : null);
export const unitOf = (d) => ({ price: "$", burn: accepted(d)?.name ?? "tokens", lock: "", pool: "SOL", stake: "SOL" })[d.kind];

/** The value read now, for "If read now" and the target's distance; null until there is something to read. */
export function reading(d) {
  if (d.kind === "price") {
    const f = feed(d.feed);
    return f ? { value: f.price, conf: f.conf, at: f.at, name: f.name } : null;
  }
  const a = accepted(d);
  return a ? { value: a.value, conf: 0, at: NOW - 30_000, name: a.name ?? short(a.address) } : null;
}
/** True when the target is already met (row 3): for a price, the price ± its confidence reaches it. */
export function met(d, r) {
  if (d.kind === "price") return d.dir === "below" ? d.target >= r.value - r.conf : d.target <= r.value + r.conf;
  return d.kind === "burn" ? r.value <= d.target : r.value >= d.target;
}
/** A round target a fair way off the value now, so a fresh draft is never decided at birth. */
const AWAY = { burn: 0.92, lock: 1.6, pool: 1.15, stake: 1.05 };
export const suggest = (d, r) => (r ? Number((r.value * (d.kind === "price" ? (d.dir === "below" ? 0.85 : 1.25) : AWAY[d.kind])).toPrecision(2)) : null);

/** Entries close at deadline − clamp(5% of the duration, 24 h, 7 d); on epoch kinds, no later than the epoch's start. */
export function closesAt(d) {
  const at = d.deadline - Math.min(7 * DAY, Math.max(DAY, (d.deadline - NOW) * 0.05));
  return TEMPLATES[d.kind].epoch && d.epoch ? Math.min(at, epochStart(d.epoch)) : at;
}

export const whole = (n) => n.toLocaleString("en-US", { maximumFractionDigits: 2 });
/** "$150" or "$150.50": the target as the sentence writes it. */
export const dollars = (n) => usd(n, Number.isInteger(n) ? 0 : 2);
const F = (fill, gap) => (fill ? { fill } : { gap });
/** The sentence as parts: text, filled slots and gaps (spec 1.5's English templates). */
export function sentence(d) {
  const a = accepted(d);
  const t = d.target > 0 && whole(d.target);
  const date = F(Number.isFinite(d.deadline) && utc(d.deadline).split(" · ")[0], "date");
  const name = (gap, pre = "") => F(a && (a.label || `${pre}${short(a.address)}`), gap);
  const epoch = F(d.epoch && String(d.epoch), "epoch");
  if (d.kind === "price") {
    const f = feed(d.feed);
    return ["Does ", F(f?.asset, "asset"), d.dir === "below" ? " fall to " : " touch ", F(d.target > 0 && dollars(d.target), "price"), " by ", date, "?"];
  }
  if (d.kind === "burn") return ["Does ", name("token"), " supply fall to ", F(t, "number"), " by ", date, "?"];
  if (d.kind === "lock") return ["Does the ", name("name"), " pool on Meteora reach ", F(t, "number"), " of liquidity locked for good by ", date, "?"];
  if (d.kind === "pool") return ["Does ", name("stake pool", "stake pool "), " start epoch ", epoch, " with ", F(t, "number"), " SOL or more?"];
  return ["Does ", name("validator", "validator "), " enter epoch ", epoch, " with ", F(t, "number"), " SOL or more staked?"];
}
export const plain = (parts, gap = (g) => `{${g}}`) => parts.map((p) => (typeof p === "string" ? p : p.fill ?? gap(p.gap))).join("");
export const complete = (parts) => parts.every((p) => typeof p === "string" || p.fill);

/** The search behind the combobox: known names first, then templates; outside the grammar, the three nearest. */
export function search(q) {
  const s = q.trim().toLowerCase();
  const all = () => Object.keys(TEMPLATES).map((kind) => ({ kind }));
  if (!s) return { items: all() };
  const num = Number((s.match(/\d[\d,]*(\.\d+)?/)?.[0] ?? "").replace(/,/g, "")) || null;
  const words = s.split(/[^a-z0-9]+/).filter((w) => w.length > 1 && !/^\d/.test(w));
  const hit = (keys) => words.some((w) => keys.some((k) => k.startsWith(w) || (w.length > 3 && w.startsWith(k))));
  const items = [];
  for (const f of FEEDS) if (hit([f.asset.toLowerCase(), f.name.toLowerCase(), f.asset === "BTC" ? "bitcoin" : "solana"])) items.push({ kind: "price", feed: f.name, target: num });
  for (const [kind, list] of Object.entries(ACCOUNTS))
    for (const a of list) if (a.name && (hit(a.name.toLowerCase().split(/[^a-z0-9]+/)) || a.address === q.trim())) items.push({ kind, account: a.address });
  for (const kind of Object.keys(TEMPLATES))
    if (hit(TEMPLATES[kind].words.split(" ")) && !items.some((it) => it.kind === kind && it.feed)) items.push({ kind, target: kind === "price" ? num : null });
  if (items.length) return { items };
  if (s.length < 3) return { items: all() };
  const grams = (x) => new Set([...x].map((_, i) => x.slice(i, i + 3)).filter((g) => g.length === 3));
  const g = grams(s);
  const score = (k) => [...grams(TEMPLATES[k].words)].filter((x) => g.has(x)).length;
  return { outside: true, items: all().sort((a, b) => score(b.kind) - score(a.kind)).slice(0, 3) };
}

/** The opening quote: US$ at the Pyth SOL/USD price, the 90/10 split, the most you'll pay and the whole debit. */
export function quote(dollarsToPay) {
  const o = opening(dollarsToPay, SOL_USD.price, SOL_USD.expo);
  const max = o.paid + Math.ceil((o.paid * MARGIN_BPS) / 10_000);
  return { ...o, max, total: o.paid + RENT + NET_FEE, most: max + RENT + NET_FEE };
}
/** "5 s ago" under a minute, then format.js's relative time. */
export const age = (ts) => (NOW - ts < 60_000 ? `${Math.round((NOW - ts) / 1000)} s ago` : rel(ts));
/** Spec 1.3: "US$500 = 4.5758 SOL at Pyth SOL/USD $109.27 (read 15:29:04 UTC, 41 s ago)". */
export const chargeLine = (u, q) =>
  `US$${u.toLocaleString("en-US")} = ${sol(q.paid, { round: "up" })} at Pyth SOL/USD ${usd(SOL_USD.price / 1e8, 2)} (read ${new Date(FEEDS[0].at).toISOString().slice(11, 19)} UTC, ${age(FEEDS[0].at)})`;
/** Exact SOL with the trailing zeros trimmed: "0.00390144 SOL". */
export const exact = (lamports) => sol(lamports, { exact: true }).replace(/\.?0+ SOL$/, " SOL");
/** What a wallet pays: rounded up, or exact under 0.01 SOL (a team key's rent), so it never reads 0.004. */
export const pays = (lamports) => (lamports < 10_000_000 ? exact(lamports) : sol(lamports, { round: "up" }));
export const explorer = (address) => `https://explorer.solana.com/address/${address}?cluster=devnet`;

/** The draft as the shared card's campaign: exactly what the transaction would create, before any entry. */
export function asCampaign(d, team) {
  const r = reading(d);
  const a = accepted(d);
  return {
    id: ID, kind: d.kind, asset: d.kind === "price" ? d.feed : a?.name || short(a?.address ?? ""), unit: unitOf(d), target: d.target,
    direction: d.kind === "burn" || (d.kind === "price" && d.dir === "below") ? "below" : "above", sentence: plain(sentence(d)),
    live: r && { value: r.value, at: r.at }, opensAt: NOW, deadlineAt: d.deadline, entriesCloseAt: closesAt(d), poolYes: 0, poolNo: 0,
    prize: !team || d.prize ? quote(d.usd).prize : 0, feeBps: 1000, oneSidedFeeBps: 100, creatorShareBps: team ? 0 : 100,
    creatorIsTeam: team, partner: null, status: "open", outcome: null, bakers: 0, listed: true,
  };
}
