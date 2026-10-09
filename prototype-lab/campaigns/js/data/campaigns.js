/**
 * Purpose: the open and closing campaigns of the prototype's mock data, in the program's own fields (Sprint 02's
 *          `Campaign`): every kind, a paid opening with its prize, a free partner campaign, one closing within the
 *          hour, a one-sided pot, an empty new one and one closed waiting for its deadline. Names and addresses are
 *          invented and look it ("Demo…"); the price kind uses real Pyth feeds because that is the kind's point.
 * Version: 0.1.0 · Sprint -1 (design system), 2026-10-08. The rest of the states are in campaigns-done.js.
 */
import { DAY, HOUR, LAMPORTS, NOW } from "../format.js";
import { opening } from "../model.js";

export const S = (x) => Math.round(x * LAMPORTS);
/** SOL/USD at the captured devnet reading (Sprint 02 fixture), exponent −8: US$119.22. */
export const SOL_USD = { price: 11_921_844_516, expo: -8, at: NOW - 5_000, conf: 655_484 };
const PAID = opening(500, SOL_USD.price, SOL_USD.expo);

/** Fields every campaign shares; each entry below overrides what makes it different. */
export const base = (o) => ({
  feeBps: 1000, oneSidedFeeBps: 100, creatorShareBps: 100, creatorIsTeam: false, partner: null, listed: true,
  openingUsd: 500, openingPaid: PAID.paid, prize: PAID.prize, openingFee: PAID.fee, direction: "above",
  status: "open", outcome: null, observed: null, voidReason: null, voidNote: null, reviewEndsAt: null, creatorJoined: null,
  templateVersion: 1, ...o,
});
/** Entries close at 5% of the duration, clamped to 24 hours and 7 days (P1 §3.6). */
export const closeAt = (opens, deadline) => deadline - Math.min(7 * DAY, Math.max(24 * HOUR, (deadline - opens) * 0.05));
const span = (opensAgo, deadlineIn) => {
  const opensAt = NOW - opensAgo;
  const deadlineAt = NOW + deadlineIn;
  return { opensAt, deadlineAt, entriesCloseAt: closeAt(opensAt, deadlineAt) };
};

export const OPEN = [
  base({
    id: "8231904417", kind: "price", asset: "SOL/USD", field: "SOL/USD price", unit: "$", target: 150,
    sentence: "Does SOL touch $150 by Oct 31, 2026?", account: "7AviUf9nL62mcxNbQGKm4nKDQnPjswo6c5MX4D57HmyE",
    accountName: "Pyth SOL/USD, sponsored feed", live: { value: 119.21844516, at: NOW - 5_000, slot: 418_220_311 },
    creator: "DemoCreatr4Tq8mWv2Kx9Ln5Ys3Hb7Pc1Rd6Zf", ...span(5 * DAY, 23 * DAY), poolYes: S(12.4), poolNo: S(18.1), bakers: 41, rank: 1,
  }),
  base({
    id: "1093327781", kind: "price", asset: "BTC/USD", field: "BTC/USD price", unit: "$", target: 100_000,
    sentence: "Does BTC touch $100,000 by Nov 30, 2026?", account: "APgzQGGdv2qCgBkX6aHVkrGePtBVDDg68GiqaM7rmtf5",
    accountName: "Pyth BTC/USD, sponsored feed", live: { value: 85_212.34, at: NOW - 4_000, slot: 418_220_314 },
    creator: "DemoTeamKey2Lw8Rt5Hn4Jc6Pz1Sd9QpK3mQ9vKf", creatorIsTeam: true, creatorShareBps: 0, openingUsd: 0, openingPaid: 0, prize: 0, openingFee: 0,
    partner: { name: "Crumb Labs", url: "https://example.com", highlightUntil: NOW + 50 * HOUR }, ...span(22 * HOUR, 53 * DAY), poolYes: S(6.2), poolNo: S(4.9), bakers: 19, rank: 0,
  }),
  base({
    id: "5521098834", kind: "price", asset: "ETH/USD", field: "ETH/USD price", unit: "$", target: 3_000, direction: "below",
    sentence: "Does ETH fall to $3,000 by Oct 9, 2026?", account: "DemoEthFeed9Xc2Vb7Nm4Kq8Lp3Rt6Ws1Yz5Hd",
    accountName: "Pyth ETH/USD, sponsored feed", live: { value: 3_184.5, at: NOW - 6_000, slot: 418_220_309 },
    creator: "DemoOpener8Kp3Lm6Nq2Rs5Tv9Wx1Yz4Ab7Cd", ...span(2.5 * DAY, 24 * HOUR + 50 * 60_000),
    poolYes: S(3.1), poolNo: S(7.75), bakers: 23, rank: 3,
  }),
  base({
    id: "7710042256", kind: "burn", asset: "CRMB", field: "CRMB supply", unit: "CRMB", target: 750_000_000, direction: "below",
    sentence: "Does CRMB supply fall to 750,000,000 by Dec 1, 2026?", account: "DemoCrmbMint3Fh7Jk2Lq9Mz5Nr8Pt1Vw4Xy6",
    accountName: null, live: { value: 812_400_000, at: NOW - 30_000, slot: 418_220_200 }, creatorJoined: "yes",
    creator: "DemoBaker7Yx3mQ9vKf2Lw8Rt5Hn4Jc6Pz1Sd9QpK", ...span(3 * DAY, 54 * DAY), poolYes: S(9.6), poolNo: S(2.05), bakers: 12, rank: 4,
  }),
  base({
    id: "3348810927", kind: "lock", asset: "CRMB–SOL LP", field: "Locked LP in the Meteora pool", unit: "LP", target: 2_000_000,
    sentence: "Does the CRMB–SOL pool on Meteora reach 2,000,000 of liquidity locked for good by Nov 14, 2026?", account: "DemoMeteoraPool6Gh3Jk8Lm2Np5Qr9St1Uv",
    accountName: "Meteora DAMM v2 · CRMB–SOL", live: { value: 1_240_000, at: NOW - 40_000, slot: 418_220_180 }, creatorJoined: "no",
    creator: "DemoLpTeam5Rt2Ws8Xy4Za9Bc3De7Fg1Hj6Km", ...span(1 * DAY, 37 * DAY), poolYes: S(4.0), poolNo: 0, bakers: 3, rank: 6,
  }),
  base({
    id: "6402937718", kind: "pool", asset: "Yeast stake pool", field: "SOL staked in the pool", unit: "SOL", target: 500_000,
    sentence: "Does Yeast stake pool start epoch 1239 with 500,000 SOL or more?", account: "DemoYeastPool4Kj7Lm1Np8Qr3St6Uv9Wx2Yz",
    accountName: "Yeast stake pool (SPL)", live: { value: 431_880, at: NOW - 60_000, slot: 418_219_990 },
    creator: "DemoPoolOps1Ab4Cd7Ef2Gh5Jk8Lm3Np6Qr9", ...span(2 * HOUR, 84 * DAY), poolYes: 0, poolNo: 0, bakers: 0, rank: 8,
  }),
  base({
    id: "9087411203", kind: "stake", asset: "Rye Validator", field: "Active stake on the validator", unit: "SOL", target: 1_000_000,
    sentence: "Does validator Rye Validator enter epoch 1169 with 1,000,000 SOL or more staked?", account: "DemoRyeVote2Cd5Ef8Gh1Jk4Lm7Np3Qr6St9",
    accountName: "Rye Validator vote account", live: { value: 958_310, at: NOW - 400 * 1000, slot: 418_219_500 }, creatorJoined: "yes",
    creator: "DemoRyeOps6Xy9Za3Bc7De1Fg4Hj8Km2Ln5Pq", status: "closed", ...span(18 * DAY, 16 * HOUR),
    poolYes: S(14.2), poolNo: S(11.6), bakers: 37, rank: 5,
  }),
];
