/**
 * Purpose: the demo wallet's history for "My entries" and the ranking: its entries on each side, what it received
 *          as a baker, as a creator (the 1%) and as whoever opened (the prize back, the 10% on a house-failure void),
 *          one credit held because it would leave an empty wallet below the rent minimum, and the devnet points table.
 * Version: 0.1.0 · Sprint -1 (design system), 2026-10-08. All amounts in lamports; addresses are invented.
 */
import { DAY, HOUR, NOW } from "../format.js";
import { S } from "./campaigns.js";

/** One row per campaign the wallet joined. `received` is null until the campaign is settled. */
export const ENTRIES = [
  { id: "8231904417", yes: S(1.5), no: 0, first: false, at: NOW - 4 * DAY },
  { id: "7710042256", yes: S(2), no: 0, first: false, at: NOW - 3 * DAY + 600_000 },
  { id: "5521098834", yes: 0, no: S(0.5), first: false, at: NOW - 1 * DAY },
  { id: "4419928305", yes: 0, no: S(2), first: false, at: NOW - 9 * DAY },
  { id: "9087411203", yes: S(0.75), no: 0, first: false, at: NOW - 6 * DAY },
  { id: "2276510493", yes: 0, no: S(1.1), first: false, at: NOW - 10 * DAY },
  { id: "6650183342", yes: S(1), no: 0, first: false, at: NOW - 25 * DAY, received: 1_762_959_275, receivedAt: NOW - 6 * DAY },
  { id: "8813370026", yes: S(0.25), no: 0, first: false, at: NOW - 15 * DAY, received: 0, receivedAt: NOW - 2.9 * DAY },
  { id: "1187634450", yes: S(1.2), no: 0, first: true, at: NOW - 13 * DAY, received: S(1.2), receivedAt: NOW - 4.8 * DAY },
  { id: "5039917762", yes: S(0.4), no: S(0.1), first: false, at: NOW - 12 * DAY, received: S(0.5), receivedAt: NOW - 1.8 * DAY },
];

/** Money that reached the wallet for a role other than baker. */
export const RECEIPTS = [
  { id: "6650183342", role: "creator", what: "Creator's 1% of the entries", amount: 378_000_000, at: NOW - 6 * DAY },
  { id: "7710042256", role: "opener", what: "Paid to open: US$500 at $119.22", amount: -4_193_981_891, at: NOW - 3 * DAY },
];

/** A credit the program holds for the wallet (Q2): paying it would leave an empty wallet below the rent minimum. */
export const RESERVED = [
  { id: "3069918824", role: "creator", what: "Creator's 1% of the entries", amount: 500_000, minimum: 650_240, at: NOW - 1.5 * DAY },
];

/** Devnet points: 1 per campaign entered on the right side (Q7 (a), TP §3.5); never raw volume, which would pay washing. */
export const RANKING = [
  { address: "DemoTopBkr1Ab2Cd3Ef4Gh5Jk6Lm7Np8Qr9St", points: 31, correct: 31, entries: 44 },
  { address: "DemoSharp9Zy8Xw7Vu6Ts5Rq4Pn3Ml2Kj1Hg", points: 27, correct: 27, entries: 35 },
  { address: "DemoCrust4Mn7Pq1Rs8Tu2Vw5Xy9Za3Bc6De", points: 22, correct: 22, entries: 41 },
  { address: "DemoRoll5Gh8Jk2Lm6Np9Qr3St7Uv1Wx4Yz", points: 10, correct: 10, entries: 19 },
  { address: "DemoBaker7Yx3mQ9vKf2Lw8Rt5Hn4Jc6Pz1Sd9QpK", points: 9, correct: 9, entries: 14, me: true },
  { address: "DemoLoaf3Ab6Cd9Ef2Gh5Jk8Lm1Np4Qr7St", points: 8, correct: 8, entries: 12 },
  { address: "DemoRye8Uv2Wx5Yz9Ab3Cd6Ef1Gh4Jk7Lm", points: 7, correct: 7, entries: 16 },
  { address: "DemoBun6Np9Qr2St5Uv8Wx1Yz4Ab7Cd3Ef", points: 6, correct: 6, entries: 9 },
];

/** When the ranking was last computed by the indexer (Sprint 08). */
export const RANKING_AT = NOW - 2 * HOUR;
