/**
 * Purpose: the first mainnet cycle of the runbook (step 12) rehearsed on the fork with the `mainnet` binary: a team
 *          key opens a free `SupplyAtMost` campaign on a real mainnet mint (its supply and revoked authority as
 *          mainnet holds them), two bakers join YES and NO with the minimum entry (0.01 SOL), the deadline passes
 *          with the supply untouched, `resolve_campaign` records NO, the six-hour window is enforced, and the
 *          payouts, Brot's fee, the close and the sweep to the multisig vault are each checked against the SDK.
 * Version: 0.1.0
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
  entryOwed,
  feeVaultAddress,
  snapshotOf,
} from "@brot/sdk/read";
import * as B from "@brot/sdk/tx";

import { check, sol, type Session } from "../devnet";
import { joinAtEstimate } from "../validator/cycle-open";
import { account, balance, clock, expectOk, expectRefusal, send } from "../validator/rpc";
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

/** After the deadline: NO recorded, the window enforced, the joins tallied, the snapshot, every payout and the sweep. */
export async function resolveAndSettle(
  s: Session,
  campaign: Address,
  mint: Address,
  bakers: KeyPairSigner[],
  recipient: Address,
) {
  const c0 = await campaignOf(s, campaign);
  await travelTo(s.rpc, c0.deadlineAt + 1n);
  const resolved = expectOk(
    await send(s.rpc, s.payer, [B.buildResolveCampaign({ campaign, metricAccount: mint })]),
    "resolve",
  );
  const c1 = await campaignOf(s, campaign);
  check(
    c1.outcome === Outcome.No && c1.status === Status.InReview,
    `${names(resolved)}: NO, the supply above the target`,
  );
  check(c1.reviewEndsAt - c1.resolvedAt === 21_600n, "the review window is six hours (the mainnet build's constant)");
  for (const baker of bakers) {
    const e = decodeEntry((await account(s.rpc, await entryAddress(campaign, baker.address)))!);
    const ix = await B.buildTallyLateJoins({ campaign, baker: baker.address, from: e.joinsTallied, to: e.joinCount });
    expectOk(await send(s.rpc, s.payer, [ix]), "tally_late_joins");
  }
  await travelTo(s.rpc, c1.reviewEndsAt - 60n);
  expectRefusal(
    await send(s.rpc, s.payer, [await B.buildFinalizeCampaign({ campaign })]),
    "ReviewNotEnded",
    "finalize",
  );
  check(true, "finalize a minute before the window ends: refused (ReviewNotEnded)");
  await travelTo(s.rpc, c1.reviewEndsAt);
  expectOk(await send(s.rpc, s.payer, [await B.buildFinalizeCampaign({ campaign })]), "finalize_campaign");
  const c = await campaignOf(s, campaign);
  const snap = snapshotOf(c, { kind: "No" });
  check(
    c.distributable === snap.distributable && c.feeTotal === snap.feeTotal,
    `snapshot = SDK: distributable ${sol(c.distributable)}, fee ${sol(c.feeTotal)}`,
  );
  for (const baker of bakers) {
    const key = await entryAddress(campaign, baker.address);
    const held = (await account(s.rpc, key))!;
    const owed = entryOwed(c, decodeEntry(held)).amount;
    const before = await balance(s.rpc, baker.address);
    expectOk(
      await send(s.rpc, s.payer, [await B.buildSettleEntry({ campaign, baker: baker.address })]),
      "settle_entry",
    );
    const got = (await balance(s.rpc, baker.address)) - before;
    check(got === owed + held.lamports, `${baker.address} received ${sol(owed)} + its Entry's rent (SDK entryOwed)`);
  }
  expectOk(await send(s.rpc, s.payer, [await B.buildCollectFee({ campaign })]), "collect_fee");
  const flags = await campaignOf(s, campaign);
  if (!flags.prizeSettled)
    expectOk(
      await send(s.rpc, s.payer, [await B.buildSettlePrize({ campaign, recipient: flags.creator })]),
      "settle_prize",
    );
  if (!flags.creatorShareSettled) throw new Error("a team opening's creator share should need no settlement");
  expectOk(
    await send(s.rpc, s.payer, [await B.buildCloseCampaign({ campaign, rentPayer: flags.rentPayer })]),
    "close_campaign",
  );
  check(!(await account(s.rpc, campaign)), "the campaign and its vault are closed, rents back to the team key");
  const feeVault = await feeVaultAddress();
  const before = await balance(s.rpc, recipient);
  expectOk(await send(s.rpc, s.payer, [await B.buildSweepFees({ feeRecipient: recipient })]), "sweep_fees");
  const swept = (await balance(s.rpc, recipient)) - before;
  check(swept >= snap.feeTotal, `sweep_fees sent ${sol(swept)} from the fee vault ${feeVault} to the multisig vault`);
}
