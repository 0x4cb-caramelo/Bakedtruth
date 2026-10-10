/**
 * Purpose: the real settle batch on a cluster (Sprint 05 DoD, "the real settle batch with self-CPI events and its
 *          compute cost", T3, C7): a free team burn campaign, twelve bakers (YES and NO), YES from the burned mint,
 *          the joins tallied, the team's confirmation, then ONE transaction of twelve `settle_entry` instructions,
 *          each baker's gain checked against the SDK's `entryPayout`, its compute units and wire size printed; then
 *          the fee, the prize flag, the close and the sweep.
 * Version: 0.1.0
 * Sprint:  05 (SDK and the devnet cycle)
 *
 *   bun run scripts/devnet-settle-batch.ts                      # a local offline surfnet (default)
 *   bun run scripts/devnet-settle-batch.ts -- --cluster devnet  # devnet: DEVNET_WALLET pays, TEAM_KEYPAIR opens
 *
 * On devnet the bakers are wallets derived from DEVNET_WALLET (`batch-baker-<n>`), so a rerun reuses them. Each needs
 * the 0.01 SOL entry plus the Entry's and the Join's rents (about 0.0024 SOL), which settlement pays back.
 */
import { type Address, type KeyPairSigner } from "@solana/kit";

import {
  ReaderKind,
  Side,
  campaignAddress,
  decodeCampaign,
  decodeEntry,
  entryAddress,
  entryPayout,
} from "@brot/sdk/read";
import {
  buildCloseCampaign,
  buildCollectFee,
  buildOpenCampaign,
  buildSettleEntry,
  buildSettlePrize,
  buildSweepFees,
  randomCampaignId,
} from "@brot/sdk/tx";

import { check, openSession, SOL, sol, step, type Session } from "./devnet";
import { burnMint, joinAtEstimate } from "./validator/cycle-open";
import { resolveAndConfirm } from "./validator/cycle-settle";
import { account, balance, clock, expectOk, send } from "./validator/rpc";
import { burnIx } from "./validator/spl-token";

const BAKERS = 12;
/** The minimum entry (P-5), the cheapest stake that still makes a real pot. */
const ENTRY = 10_000_000n;
const SUPPLY = 1_000_000n;
/** At the minimum distance below the supply (1%), as in the smoke. */
const TARGET = 990_000n;
const DAY = 86_400n;

/** A free campaign opened by the team key (P-3): no prize, no creator share; the team key pays the two rents. */
async function openTeamBurnCampaign(s: Session, mint: Address): Promise<Address> {
  const config = await s.config();
  const now = (await clock(s.rpc)).unixTimestamp;
  const args = {
    id: randomCampaignId(),
    kind: ReaderKind.SupplyAtMost,
    target: TARGET,
    deadlineAt: now + 3n * DAY + 3_600n,
    openingUsd: 0n,
    maxLamports: 0n,
    expectedParamsVersion: config.paramsVersion,
  };
  const sent = expectOk(
    await send(s.rpc, s.team, [await buildOpenCampaign({ creator: s.team, args, metricAccount: mint })]),
    "open",
  );
  const campaign = await campaignAddress(args.id);
  check(sent.events[0]?.name === "CampaignOpened", `team campaign ${args.id} at ${campaign}`);
  return campaign;
}

/** One transaction of `settle_entry` for every baker; each gain is the SDK's payout plus the Entry's rent. */
async function settleBatch(s: Session, campaign: Address, bakers: KeyPairSigner[]) {
  const c = decodeCampaign((await account(s.rpc, campaign))!);
  const rule = {
    mode: c.settleMode,
    winning: Side.Yes,
    winningTotal: c.winningTotal,
    distributable: c.distributable,
    oneSidedFeeBps: c.oneSidedFeeBps,
  };
  const expected: bigint[] = [];
  const ixs = [];
  for (const baker of bakers) {
    const held = (await account(s.rpc, await entryAddress(campaign, baker.address)))!;
    const e = decodeEntry(held);
    const amounts = { yes: e.amountYes, no: e.amountNo, lateYes: e.lateYes, lateNo: e.lateNo };
    expected.push(entryPayout(rule, amounts, e.isFirst).amount + held.lamports);
    ixs.push(await buildSettleEntry({ campaign, baker: baker.address }));
  }
  const before = await Promise.all(bakers.map((b) => balance(s.rpc, b.address)));
  const sent = expectOk(await send(s.rpc, s.payer, ixs), "the settle batch");
  const after = await Promise.all(bakers.map((b) => balance(s.rpc, b.address)));
  const settled = sent.events.filter((e) => e.name === "EntrySettled").length;
  check(settled === bakers.length, `${settled} EntrySettled events in one transaction, each by self-CPI`);
  const right = bakers.filter((_, i) => after[i]! - before[i]! === expected[i]).length;
  check(right === bakers.length, `${right} of ${bakers.length} bakers paid the SDK's entryPayout + the Entry's rent`);
  const perEntry = sent.computeUnits / BigInt(bakers.length);
  console.log(
    `  batch: ${bakers.length} settle_entry, ${sent.computeUnits} CU (${perEntry} per entry), ${sent.wireBytes} of 1232 bytes, ${sent.signature}`,
  );
  return sent;
}

async function main() {
  const s = await openSession(import.meta.path);
  try {
    step(`the team key and ${BAKERS} bakers (${s.cluster})`);
    await s.fund(s.team.address, SOL / 50n);
    const bakers: KeyPairSigner[] = [];
    for (let i = 0; i < BAKERS; i++) bakers.push(await s.wallet(`batch-baker-${i}`));
    for (const baker of bakers) await s.fund(baker.address, 15_000_000n);
    const config = await s.config();
    check(!bakers.some((b) => config.team.includes(b.address)), "no baker is a team key");

    step("a free team burn campaign on a fresh mint");
    const { mint, holding } = await burnMint(s, s.team, SUPPLY);
    const campaign = await openTeamBurnCampaign(s, mint);

    step(`${BAKERS} bakers join, YES and NO in turn, each at its SDK estimate`);
    for (const [i, baker] of bakers.entries()) {
      await joinAtEstimate(s, baker, campaign, mint, i % 2 === 0 ? Side.Yes : Side.No, ENTRY);
    }

    step("the supply burned to the target; YES; the joins tallied; the team confirms");
    expectOk(await send(s.rpc, s.payer, [burnIx(holding, mint, s.team, SUPPLY - TARGET)]), "burn");
    await resolveAndConfirm(s, campaign, mint, bakers);

    step(`one transaction of ${BAKERS} settle_entry instructions`);
    const sent = await settleBatch(s, campaign, bakers);

    step("the fee, the prize flag, the close and the sweep");
    expectOk(await send(s.rpc, s.payer, [await buildCollectFee({ campaign })]), "collect_fee");
    expectOk(await send(s.rpc, s.payer, [await buildSettlePrize({ campaign, recipient: s.team.address })]), "prize");
    const close = await buildCloseCampaign({ campaign, rentPayer: s.team.address });
    expectOk(await send(s.rpc, s.payer, [close]), "close");
    check(!(await account(s.rpc, campaign)), "the campaign is closed, its rents back to the team key");
    const recipient = (await s.config()).feeRecipient;
    expectOk(await send(s.rpc, s.payer, [await buildSweepFees({ feeRecipient: recipient })]), "sweep_fees");
    check(true, `the fees swept to ${recipient}`);
    console.log(`\nsettle batch on ${s.cluster}: ${BAKERS} entries, ${sent.computeUnits} CU, ${sent.wireBytes} bytes`);
    console.log(`payer left with ${sol(await balance(s.rpc, s.payer.address))}`);
  } finally {
    s.stop();
  }
}

main().catch((error) => {
  console.error(`\nsettle batch FAILED: ${error instanceof Error ? error.message : error}`);
  process.exit(1);
});
