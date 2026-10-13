/**
 * Purpose: the first mainnet cycle of the runbook (step 12) rehearsed on the fork with the `mainnet` binary: a team
 *          key opens a free `SupplyAtMost` campaign on a real mainnet mint (its supply and revoked authority as
 *          mainnet holds them), bakers join YES and NO with the minimum entry (0.01 SOL), the deadline passes with
 *          the supply untouched, and `resolve_campaign` records NO with the six-hour window; the paid opening beside
 *          it is in paid.ts, and both campaigns' settlement in settle.ts.
 * Version: 0.2.0 (the first cycle has a paid opening too, M-4; settlement moved to settle.ts)
 * Sprint:  18 (mainnet), lane L18
 *
 * Nothing touches the mint: the fork only moves its clock past the deadline and then past the window, which the
 * real cycle waits out (three days and six hours at least).
 */
import type { Address, KeyPairSigner } from "@solana/kit";

import {
  ReaderKind,
  Outcome,
  Side,
  Status,
  campaignAddress,
  decodeCampaign,
  decodeEntry,
  entryAddress,
} from "@brot/sdk/read";
import * as B from "@brot/sdk/tx";

import { check, sol, type Session } from "../devnet";
import { joinAtEstimate } from "../validator/cycle-open";
import { account, clock, expectOk, send } from "../validator/rpc";
import { travelTo } from "./fork";

const DAY = 86_400n;
export const MIN_ENTRY = 10_000_000n; // 0.01 SOL, init-params.mainnet.json's minEntryLamports
const names = (sent: { events: { name: string }[] }) => sent.events.map((e) => e.name).join(",");
const campaignOf = async (s: Session, c: Address) => decodeCampaign((await account(s.rpc, c))!);

/** A team key's free opening: does `mint`'s supply fall 2% by a deadline three days and an hour away? */
export async function openTeamCampaign(s: Session, mint: Address) {
  const data = (await account(s.rpc, mint))!.data;
  const supply = new DataView(data.buffer, data.byteOffset).getBigUint64(36, true);
  const target = (supply * 98n) / 100n;
  const deadlineAt = (await clock(s.rpc)).unixTimestamp + 3n * DAY + 3_600n;
  const config = await s.config();
  const args = { id: B.randomCampaignId(), kind: ReaderKind.SupplyAtMost, target, deadlineAt, openingUsd: 0n };
  const open = { ...args, maxLamports: 0n, expectedParamsVersion: config.paramsVersion };
  const sent = expectOk(
    await send(s.rpc, s.team, [await B.buildOpenCampaign({ creator: s.team, args: open, metricAccount: mint })]),
    "open",
  );
  const address = await campaignAddress(args.id);
  const stored = await campaignOf(s, address);
  check(names(sent) === "CampaignOpened" && stored.creatorIsTeam, `team opening of ${address}: free, CampaignOpened`);
  console.log(`  ${mint}: supply ${supply}, target ${target} by ${new Date(Number(deadlineAt) * 1000).toISOString()}`);
  return { campaign: address, target, deadlineAt };
}

/** Two bakers join, YES and NO, with the minimum entry, each at the SDK's estimate. */
export async function joinBoth(s: Session, campaign: Address, mint: Address, yes: KeyPairSigner, no: KeyPairSigner) {
  await joinAtEstimate(s, yes, campaign, mint, Side.Yes, MIN_ENTRY);
  await joinAtEstimate(s, no, campaign, mint, Side.No, MIN_ENTRY);
}

/** After the deadline (the clock moved past it): NO recorded from the untouched supply, the window, the joins tallied. */
export async function resolveNo(s: Session, campaign: Address, mint: Address, bakers: KeyPairSigner[]) {
  await travelTo(s.rpc, (await campaignOf(s, campaign)).deadlineAt + 1n);
  const resolve = B.buildResolveCampaign({ campaign, metricAccount: mint });
  const resolved = expectOk(await send(s.rpc, s.payer, [resolve]), "resolve");
  const c = await campaignOf(s, campaign);
  const recorded = c.outcome === Outcome.No && c.status === Status.InReview;
  check(recorded, `${names(resolved)} on ${campaign}: NO, the supply above the target`);
  check(c.reviewEndsAt - c.resolvedAt === 21_600n, "the review window is six hours (the mainnet build's constant)");
  for (const baker of bakers) {
    const e = decodeEntry((await account(s.rpc, await entryAddress(campaign, baker.address)))!);
    const ix = await B.buildTallyLateJoins({ campaign, baker: baker.address, from: e.joinsTallied, to: e.joinCount });
    expectOk(await send(s.rpc, s.payer, [ix]), "tally_late_joins");
  }
}
