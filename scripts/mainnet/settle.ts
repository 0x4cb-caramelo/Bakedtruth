/**
 * Purpose: a resolved campaign of the first mainnet cycle settled on the fork (runbook step 12), every lamport checked
 *          against the SDK: `finalize_campaign` refused a minute before the six-hour window ends and taken after it,
 *          the snapshot, each entry's payout, Brot's fee (with the opening fee of a paid opening), the prize returned
 *          to whoever opened, the creator's 1% of a paid opening, the close, and the fees swept to the admin
 *          multisig's vault, the fee recipient the founder chose (M-1, 2026-10-13).
 * Version: 0.1.0
 * Sprint:  18 (mainnet), lane L18
 */
import type { Address, KeyPairSigner } from "@solana/kit";

import { decodeCampaign, decodeEntry, entryAddress, entryOwed, feeVaultAddress, snapshotOf } from "@brot/sdk/read";
import * as B from "@brot/sdk/tx";

import { check, sol, type Session } from "../devnet";
import { account, balance, expectOk, expectRefusal, rentFor, send } from "../validator/rpc";
import { travelTo } from "./fork";

const campaignOf = async (s: Session, c: Address) => decodeCampaign((await account(s.rpc, c))!);

/** What `address` gained across `act` (the act sent by the session's payer, so fees never blur a payout). */
async function gain(s: Session, address: Address, label: string, act: () => Promise<Parameters<typeof send>[2]>) {
  const before = await balance(s.rpc, address);
  expectOk(await send(s.rpc, s.payer, await act()), label);
  return (await balance(s.rpc, address)) - before;
}

/** Finalize after the window, then every payout of a NO campaign, its close, and the sweep to `recipient`. */
export async function settleCampaign(s: Session, campaign: Address, bakers: KeyPairSigner[], recipient: Address) {
  const ends = (await campaignOf(s, campaign)).reviewEndsAt;
  await travelTo(s.rpc, ends - 60n);
  const early = await send(s.rpc, s.payer, [await B.buildFinalizeCampaign({ campaign })]);
  expectRefusal(early, "ReviewNotEnded", "finalize");
  check(true, "finalize a minute before the window ends: refused (ReviewNotEnded)");
  await travelTo(s.rpc, ends);
  expectOk(await send(s.rpc, s.payer, [await B.buildFinalizeCampaign({ campaign })]), "finalize_campaign");
  const c = await campaignOf(s, campaign);
  const snap = snapshotOf(c, { kind: "No" });
  const same = c.distributable === snap.distributable && c.feeTotal === snap.feeTotal;
  check(same, `snapshot = SDK: distributable ${sol(c.distributable)}, fee ${sol(c.feeTotal)}`);
  for (const baker of bakers) {
    const held = (await account(s.rpc, await entryAddress(campaign, baker.address)))!;
    const owed = entryOwed(c, decodeEntry(held)).amount;
    const got = await gain(s, baker.address, "settle_entry", async () => [
      await B.buildSettleEntry({ campaign, baker: baker.address }),
    ]);
    check(got === owed + held.lamports, `${baker.address} received ${sol(owed)} + its Entry's rent (SDK entryOwed)`);
  }
  const feeVault = await feeVaultAddress();
  const kept = await gain(s, feeVault, "collect_fee", async () => [await B.buildCollectFee({ campaign })]);
  const oneSided = (await campaignOf(s, campaign)).oneSidedFees;
  check(kept === snap.brotKeeps + oneSided, `Brot keeps ${sol(kept)} = SDK (the fee, the opening fee)`);
  const opener = c.creator;
  if (!(await campaignOf(s, campaign)).prizeSettled) {
    const back = await gain(s, opener, "settle_prize", async () => [
      await B.buildSettlePrize({ campaign, recipient: opener }),
    ]);
    check(back === snap.toOpener, `settle_prize returns ${sol(back)} to the opener (in a split the prize is paid out)`);
  }
  if (!(await campaignOf(s, campaign)).creatorShareSettled) {
    const share = await gain(s, opener, "settle_creator_share", async () => [
      await B.buildSettleCreatorShare({ campaign, creator: opener }),
    ]);
    check(share === snap.creatorShare && share > 0n, `the creator's 1%: ${sol(share)} = SDK`);
  }
  const rents = (await balance(s.rpc, campaign)) + (await rentFor(s.rpc, 0));
  const back = await gain(s, c.rentPayer, "close_campaign", async () => [
    await B.buildCloseCampaign({ campaign, rentPayer: c.rentPayer }),
  ]);
  check(back === rents && !(await account(s.rpc, campaign)), `closed: ${sol(back)} of rents back to whoever opened`);
  const above = (await balance(s.rpc, feeVault)) - (await rentFor(s.rpc, 0));
  const swept = await gain(s, recipient, "sweep_fees", async () => [
    await B.buildSweepFees({ feeRecipient: recipient }),
  ]);
  check(swept === above && swept > 0n, `sweep_fees sent ${sol(swept)} to the admin multisig's vault (fee recipient)`);
}
