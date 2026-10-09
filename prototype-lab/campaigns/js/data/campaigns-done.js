/**
 * Purpose: the campaigns past their entries in the prototype's mock data: one in its six-hour review, one contested,
 *          paid YES, paid NO, a one-sided pot refunded, two voids with different causes (the 10% follows the cause,
 *          P-4) and one open campaign the team unlisted after a report. Same fields as campaigns.js.
 * Version: 0.1.0 · Sprint -1 (design system), 2026-10-08.
 */
import { DAY, HOUR, NOW } from "../format.js";
import { base, closeAt, S } from "./campaigns.js";

const ended = (opensAgo, deadlineAgo) => {
  const opensAt = NOW - opensAgo;
  const deadlineAt = NOW - deadlineAgo;
  return { opensAt, deadlineAt, entriesCloseAt: closeAt(opensAt, deadlineAt) };
};

export const DONE = [
  base({
    id: "4419928305", kind: "price", asset: "SOL/USD", field: "SOL/USD price", unit: "$", target: 100, direction: "below",
    sentence: "Does SOL fall to $100 by Oct 8, 2026?", account: "7AviUf9nL62mcxNbQGKm4nKDQnPjswo6c5MX4D57HmyE",
    accountName: "Pyth SOL/USD, sponsored feed", live: { value: 119.21844516, at: NOW - 5_000, slot: 418_220_311 },
    creator: "DemoCreatr4Tq8mWv2Kx9Ln5Ys3Hb7Pc1Rd6Zf", status: "review", outcome: "no", ...ended(12 * DAY, 3 * HOUR),
    observed: { value: 112.41, label: "Lowest SOL/USD read while open", slot: 418_172_004, at: NOW - 2 * HOUR - 48 * 60_000 },
    reviewEndsAt: NOW + 3 * HOUR + 12 * 60_000, poolYes: S(5.5), poolNo: S(16.25), bakers: 33, rank: 2,
  }),
  base({
    id: "2276510493", kind: "burn", asset: "CRMB", field: "CRMB supply", unit: "CRMB", target: 900_000_000, direction: "below",
    sentence: "Does CRMB supply fall to 900,000,000 by Oct 8, 2026?", account: "DemoCrmbMint3Fh7Jk2Lq9Mz5Nr8Pt1Vw4Xy6",
    accountName: null, live: { value: 812_400_000, at: NOW - 30_000, slot: 418_220_200 }, creatorJoined: "yes",
    creator: "DemoCrmbTeam9Lk2Mn5Pq8Rs1Tu4Vw7Xy3Za6", status: "contested", outcome: "yes", ...ended(16 * DAY, 7 * HOUR),
    observed: { value: 868_000_000, label: "CRMB supply read at the deadline", slot: 418_160_877, at: NOW - 6.8 * HOUR },
    contestStage: 1, contestEndsAt: NOW + 40 * 60_000, reviewEndsAt: NOW - 50 * 60_000, poolYes: S(8.8), poolNo: S(8.1), bakers: 28, rank: 7,
  }),
  base({
    id: "6650183342", kind: "price", asset: "BTC/USD", field: "BTC/USD price", unit: "$", target: 90_000,
    sentence: "Does BTC touch $90,000 by Oct 1, 2026?", account: "APgzQGGdv2qCgBkX6aHVkrGePtBVDDg68GiqaM7rmtf5",
    accountName: "Pyth BTC/USD, sponsored feed", live: { value: 85_212.34, at: NOW - 4_000, slot: 418_220_314 },
    creator: "DemoBaker7Yx3mQ9vKf2Lw8Rt5Hn4Jc6Pz1Sd9QpK", status: "paid", outcome: "yes", ...ended(30 * DAY, 7 * DAY),
    observed: { value: 90_412.07, label: "BTC/USD read when it touched", slot: 417_402_118, at: NOW - 9 * DAY }, poolYes: S(22.5), poolNo: S(15.3), bakers: 64, rank: 9,
  }),
  base({
    id: "8813370026", kind: "pool", asset: "Yeast stake pool", field: "SOL staked in the pool", unit: "SOL", target: 400_000,
    sentence: "Does Yeast stake pool start epoch 1165 with 400,000 SOL or more?", account: "DemoYeastPool4Kj7Lm1Np8Qr3St6Uv9Wx2Yz",
    accountName: "Yeast stake pool (SPL)", live: { value: 431_880, at: NOW - 60_000, slot: 418_219_990 },
    creator: "DemoPoolOps1Ab4Cd7Ef2Gh5Jk8Lm3Np6Qr9", status: "paid", outcome: "no", ...ended(21 * DAY, 3 * DAY),
    observed: { value: 391_220, label: "Pool size read at the deadline", slot: 417_812_430, at: NOW - 3 * DAY + 20 * 60_000 }, poolYes: S(3.4), poolNo: S(6.9), bakers: 17, rank: 10,
  }),
  base({
    id: "1187634450", kind: "price", asset: "ETH/USD", field: "ETH/USD price", unit: "$", target: 5_000,
    sentence: "Does ETH touch $5,000 by Oct 3, 2026?", account: "DemoEthFeed9Xc2Vb7Nm4Kq8Lp3Rt6Ws1Yz5Hd",
    accountName: "Pyth ETH/USD, sponsored feed", live: { value: 3_184.5, at: NOW - 6_000, slot: 418_220_309 },
    creator: "DemoOpener8Kp3Lm6Nq2Rs5Tv9Wx1Yz4Ab7Cd", status: "paid", outcome: "no", settleMode: "onesided", ...ended(14 * DAY, 5 * DAY),
    observed: { value: 4_410.8, label: "Highest ETH/USD read while open", slot: 417_640_002, at: NOW - 5 * DAY }, poolYes: S(2.6), poolNo: 0, bakers: 4, rank: 11,
  }),
  base({
    id: "5039917762", kind: "lock", asset: "LOAF–SOL LP", field: "Locked LP in the Meteora pool", unit: "LP", target: 1_000_000,
    sentence: "Does the LOAF–SOL pool on Meteora reach 1,000,000 of liquidity locked for good by Oct 6, 2026?", account: "DemoLoafPool8Mn2Pq5Rs9Tu3Vw6Xy1Za4Bc",
    accountName: "Meteora DAMM v2 · LOAF–SOL", live: null, creator: "DemoLoafTeam3Gh6Jk9Lm2Np5Qr8St1Uv4Wx",
    status: "void", outcome: "void", voidReason: "unreadable", ...ended(20 * DAY, 2 * DAY), poolYes: S(5.1), poolNo: S(3.3), bakers: 15, rank: 12,
    voidNote: "The pool's account was closed by its owner on Oct 5, so the program could not read it at the deadline. Every entry goes back in full and the prize returns to whoever opened. The 10% opening fee is kept: the cause was outside Brot.",
  }),
  base({
    id: "7302281195", kind: "price", asset: "SOL/USD", field: "SOL/USD price", unit: "$", target: 140,
    sentence: "Does SOL touch $140 by Oct 4, 2026?", account: "7AviUf9nL62mcxNbQGKm4nKDQnPjswo6c5MX4D57HmyE",
    accountName: "Pyth SOL/USD, sponsored feed", live: { value: 119.21844516, at: NOW - 5_000, slot: 418_220_311 }, creator: "DemoCreatr4Tq8mWv2Kx9Ln5Ys3Hb7Pc1Rd6Zf",
    status: "void", outcome: "void", voidReason: "team-house", ...ended(10 * DAY, 4 * DAY), poolYes: S(4.4), poolNo: S(6.0), bakers: 21, rank: 13,
    voidNote: "Our reading service submitted a price older than the campaign allows. The team voided the result inside the six-hour window. The failure was ours: every entry goes back in full, the prize returns to whoever opened, and the 10% opening fee is refunded too.",
  }),
  base({
    id: "3069918824", kind: "stake", asset: "Rye Validator", field: "Active stake on the validator", unit: "SOL", target: 900_000,
    sentence: "Does validator Rye Validator enter epoch 1166 with 900,000 SOL or more staked?", account: "DemoRyeVote2Cd5Ef8Gh1Jk4Lm7Np3Qr6St9",
    accountName: "Rye Validator vote account", live: { value: 958_310, at: NOW - 400_000, slot: 418_219_500 },
    creator: "DemoBaker7Yx3mQ9vKf2Lw8Rt5Hn4Jc6Pz1Sd9QpK", status: "paid", outcome: "yes", ...ended(9 * DAY, 2 * DAY),
    observed: { value: 931_004, label: "Active stake read at the deadline", slot: 417_905_331, at: NOW - 1.9 * DAY }, poolYes: 30_000_000, poolNo: 20_000_000, bakers: 2, rank: 14,
  }),
  base({
    id: "9931045570", kind: "burn", asset: "DOUGH", field: "DOUGH supply", unit: "DOUGH", target: 1_000, direction: "below",
    sentence: "Does DOUGH supply fall to 1,000 by Nov 1, 2026?", account: "DemoDoughMint5Ab8Cd1Ef4Gh7Jk2Lm6Np9",
    accountName: null, live: { value: 1_000_000_000, at: NOW - 90_000, slot: 418_219_800 }, creatorJoined: "yes", listed: false,
    creator: "DemoDoughDev2Qr5St8Uv1Wx4Yz7Ab3Cd6Ef", opensAt: NOW - 1 * DAY, deadlineAt: NOW + 24 * DAY, entriesCloseAt: closeAt(NOW - DAY, NOW + 24 * DAY),
    poolYes: S(0.3), poolNo: S(0.05), bakers: 2, rank: null, unlistedNote: "Unlisted after a report: the creator can burn this token at will.",
  }),
];
