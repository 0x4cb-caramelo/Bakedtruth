/**
 * Purpose: the second half of the smoke cycle (Sprint 05, X0.2): resolve a burn campaign YES, tally each baker's
 *          joins, end the window with a team confirmation, then settle every entry, the creator share, the fee and
 *          the prize, close and sweep, each lamport checked against the SDK's math (`snapshot`, `entryPayout`).
 * Version: 0.1.1 (the team confirmation emits CampaignFinalized after ResultConfirmed, PR #44)
 * Sprint:  05 (SDK and the devnet cycle), lane OPS
 *
 * The amounts the program moves are recomputed by the SDK from the stored campaign, never read back from the
 * movement itself, so a disagreement between the program and its TypeScript mirror fails the run.
 */
import { type Address, type KeyPairSigner } from "@solana/kit";

import {
  Outcome,
  SettleMode,
  Side,
  decodeCampaign,
  decodeEntry,
  entryAddress,
  entryPayout,
  feeVaultAddress,
  snapshot,
  vaultAddress,
} from "@brot/sdk/read";
import {
  buildCloseCampaign,
  buildCollectFee,
  buildResolveCampaign,
  buildSettleCreatorShare,
  buildSettleEntry,
  buildSettlePrize,
  buildSweepFees,
  buildTallyLateJoins,
  buildTeamConfirmResult,
} from "@brot/sdk/tx";

import { check, sol, type Session } from "../devnet";
import { account, balance, expectOk, rentFor, send } from "./rpc";

const names = (sent: { events: { name: string }[] }) => sent.events.map((e) => e.name).join(",");
const readCampaign = async (s: Session, campaign: Address) => decodeCampaign((await account(s.rpc, campaign))!);

/** Runs `act` and returns how much `address` gained (or lost, negative) across it. */
async function gain(s: Session, address: Address, act: () => Promise<unknown>): Promise<bigint> {
  const before = await balance(s.rpc, address);
  await act();
  return (await balance(s.rpc, address)) - before;
}

/** Resolve (YES on the burned supply), tally every baker's joins, and the team's confirmation. */
export async function resolveAndConfirm(s: Session, campaign: Address, metric: Address, bakers: KeyPairSigner[]) {
  const resolved = expectOk(
    await send(s.rpc, s.payer, [buildResolveCampaign({ campaign, metricAccount: metric })]),
    "resolve",
  );
  const outcome = (resolved.events[0]?.data as { outcome?: number }).outcome;
  check(
    names(resolved) === "CampaignResolved" && outcome === Outcome.Yes,
    "resolve_campaign records YES from the mint",
  );
  for (const baker of bakers) {
    const entry = decodeEntry((await account(s.rpc, await entryAddress(campaign, baker.address)))!);
    const ix = await buildTallyLateJoins({
      campaign,
      baker: baker.address,
      from: entry.joinsTallied,
      to: entry.joinCount,
    });
    check(names(expectOk(await send(s.rpc, s.payer, [ix]), "tally")) === "LateTallied", `tallied ${baker.address}`);
  }
  const confirmed = expectOk(
    await send(s.rpc, s.payer, [await buildTeamConfirmResult({ teamMember: s.team, campaign })]),
    "confirm",
  );
  // TP 3.4.3 and 3.4.14: ResultConfirmed, then CampaignFinalized with the next seq (the program since PR #44).
  const status = (await readCampaign(s, campaign)).status;
  const [own, finalized] = confirmed.events.map((e) => (e.data as { seq: bigint }).seq);
  check(
    names(confirmed) === "ResultConfirmed,CampaignFinalized" && finalized === own! + 1n && status >= 3,
    `team_confirm_result finalizes at once and emits the snapshot (${names(confirmed)})`,
  );
}

/** Every payout of a finalized YES campaign, each checked against the SDK; then close and sweep. */
export async function settleAndCheck(s: Session, campaign: Address, creator: KeyPairSigner, bakers: KeyPairSigner[]) {
  const c = await readCampaign(s, campaign);
  const snap = snapshot({
    verdict: { kind: "Yes" },
    yesTotal: c.poolYes - c.lateYes,
    noTotal: c.poolNo - c.lateNo,
    lateYes: c.lateYes,
    lateNo: c.lateNo,
    prize: c.prizeLamports,
    openingFee: c.openingFeeLamports,
    feeBps: c.feeBps,
    oneSidedFeeBps: c.oneSidedFeeBps,
    creatorShareBps: c.creatorShareBps,
    creatorIsTeam: c.creatorIsTeam,
  });
  check(
    c.settleMode === snap.mode && c.distributable === snap.distributable,
    `snapshot ${SettleMode[snap.mode]}: distributable ${sol(snap.distributable)} = SDK`,
  );
  check(
    c.feeTotal === snap.feeTotal && c.creatorShare === snap.creatorShare,
    `fee ${sol(snap.feeTotal)}, creator share ${sol(snap.creatorShare)} = SDK`,
  );
  const rule = {
    mode: c.settleMode,
    winning: Side.Yes,
    winningTotal: c.winningTotal,
    distributable: c.distributable,
    oneSidedFeeBps: c.oneSidedFeeBps,
  };
  for (const baker of bakers) {
    const entryKey = await entryAddress(campaign, baker.address);
    const held = (await account(s.rpc, entryKey))!;
    const e = decodeEntry(held);
    const paid = entryPayout(
      rule,
      { yes: e.amountYes, no: e.amountNo, lateYes: e.lateYes, lateNo: e.lateNo },
      e.isFirst,
    );
    const got = await gain(s, baker.address, async () =>
      expectOk(
        await send(s.rpc, s.payer, [await buildSettleEntry({ campaign, baker: baker.address })]),
        "settle_entry",
      ),
    );
    check(
      got === paid.amount + held.lamports,
      `${baker.address} paid ${sol(paid.amount)} + its Entry's rent back (SDK entryPayout)`,
    );
  }
  const share = await gain(s, creator.address, async () =>
    expectOk(
      await send(s.rpc, s.payer, [await buildSettleCreatorShare({ campaign, creator: creator.address })]),
      "share",
    ),
  );
  check(share === snap.creatorShare, `creator share ${sol(share)} = SDK`);
  const feeVault = await feeVaultAddress();
  const kept = await gain(s, feeVault, async () =>
    expectOk(await send(s.rpc, s.payer, [await buildCollectFee({ campaign })]), "collect_fee"),
  );
  check(
    kept === snap.brotKeeps + (await readCampaign(s, campaign)).oneSidedFees,
    `Brot keeps ${sol(kept)} = SDK (fee − share's part + opening fee)`,
  );
  const prize = await gain(s, creator.address, async () =>
    expectOk(
      await send(s.rpc, s.payer, [await buildSettlePrize({ campaign, recipient: creator.address })]),
      "settle_prize",
    ),
  );
  check(prize === snap.toOpener, `settle_prize moves ${sol(prize)} (the prize is inside distributable in a split)`);
  const vault = await vaultAddress(campaign);
  const [campaignLamports, vaultLamports, vaultRent] = [
    await balance(s.rpc, campaign),
    await balance(s.rpc, vault),
    await rentFor(s.rpc, 0),
  ];
  const feeBefore = await balance(s.rpc, feeVault);
  const back = await gain(s, creator.address, async () =>
    expectOk(await send(s.rpc, s.payer, [await buildCloseCampaign({ campaign, rentPayer: creator.address })]), "close"),
  );
  const dust = (await balance(s.rpc, feeVault)) - feeBefore;
  check(back === campaignLamports + vaultRent, `close returns both rents ${sol(back)} to the creator`);
  check(dust === vaultLamports - vaultRent, `the vault's last ${dust} lamports (dust) go to the fee vault (I6)`);
  check(!(await account(s.rpc, campaign)) && !(await account(s.rpc, vault)), "the campaign and its vault are closed");
  const recipient = (await s.config()).feeRecipient;
  const above = (await balance(s.rpc, feeVault)) - vaultRent;
  const swept = await gain(s, recipient, async () =>
    expectOk(await send(s.rpc, s.payer, [await buildSweepFees({ feeRecipient: recipient })]), "sweep_fees"),
  );
  check(
    swept === above && (await balance(s.rpc, feeVault)) === vaultRent,
    `sweep_fees sends ${sol(swept)} to the fee recipient`,
  );
}
