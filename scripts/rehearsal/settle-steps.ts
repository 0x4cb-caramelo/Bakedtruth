/**
 * Purpose: the devnet rehearsal's settlement of one campaign, one step at a time (Sprint 12: the five-campaign
 *          rehearsal; until the keeper settles, every payout on devnet is sent by hand). Each step reads the campaign
 *          first, says when it is not due, then simulates and sends only with --yes (scripts/team/common.ts `act`):
 *          status, resolve, tally, finalize, entries, share, prize, fee, close, sweep. The bakers are found in the
 *          campaign's own history (its `EntryAdded` events), so no account scan is needed. Every instruction is
 *          permissionless: the payer chooses nothing, and each payout goes where the program stored it. Since Sprint
 *          16 (the review's F1) the history is read at MAX_TRANSACTION_VERSION, and a transaction the node cannot
 *          return in it (-32015) is named on stderr while the others go on: safe, since the program refuses confirm and
 *          finalize until every join is tallied (`NotTallied`), so a baker this list misses can delay an act, never
 *          change a result or a payout.
 * Version: 0.2.0 (Sprint 16: every transaction version; an unreadable one named, never a stop)
 * Sprint:  12 (site: my entries and campaign states); 16
 */
import { address, type Address } from "@solana/kit";

import {
  CLOCK_SYSVAR_ID,
  configAddress,
  decodeCampaign,
  decodeEntry,
  decodeGlobalConfig,
  decodeTransactionEvents,
  entryAddress,
  entryOwed,
  formatSol,
  formatUtc,
  isUnsupportedVersion,
  MAX_TRANSACTION_VERSION,
  Outcome,
  SettleMode,
  Status,
  VoidReason,
  type RpcTransaction,
} from "@brot/sdk/read";
import * as B from "@brot/sdk/tx";

import { act, type TeamContext } from "../team/common";
import { account, type Rpc } from "../validator/rpc";

export const STEPS = ["status", "resolve", "tally", "finalize", "entries", "share", "prize", "fee", "close", "sweep"];
export type Step = (typeof STEPS)[number];
/** Settle entries in batches this size (Sprint 05's batch fit twelve in one transaction). */
const BATCH = 10;
/** Every transaction version the cluster serves (the review's F1). */
const READ = { encoding: "json", commitment: "confirmed", maxSupportedTransactionVersion: MAX_TRANSACTION_VERSION };

/** Every baker that ever joined `campaign`, from the `EntryAdded` events of its history (oldest pages included). */
export async function bakersOf(rpc: Rpc, campaign: Address): Promise<Address[]> {
  const bakers = new Set<string>();
  const unreadable: string[] = [];
  let before: string | undefined;
  for (let page = 0; page < 10; page++) {
    const sigs = await rpc.call<any[]>("getSignaturesForAddress", [campaign, { limit: 1_000, before }]);
    for (const s of sigs) {
      if (s.err !== null) continue;
      const tx = await rpc.call<any>("getTransaction", [s.signature, READ]).catch((error: unknown) => {
        if (!isUnsupportedVersion(error)) throw error;
        unreadable.push(s.signature);
        return null;
      });
      if (!tx) continue;
      for (const e of decodeTransactionEvents(tx as RpcTransaction)) {
        if (e.name === "EntryAdded" && e.data.campaign === campaign) bakers.add(e.data.baker);
      }
    }
    if (sigs.length < 1_000) break;
    before = sigs[sigs.length - 1].signature;
  }
  // Named, never silent: the program still refuses confirm and finalize until every join is tallied (NotTallied).
  if (unreadable.length > 0) console.error(`bakersOf ${campaign}: unreadable (-32015), bakers unknown: ${unreadable}`);
  return [...bakers].map((b) => address(b));
}

async function campaignOf(rpc: Rpc, campaign: Address) {
  const found = await account(rpc, campaign);
  if (!found) throw new Error(`no campaign account at ${campaign}: closed, or the address is wrong`);
  return decodeCampaign(found);
}

async function entriesOf(rpc: Rpc, campaign: Address) {
  const out = [];
  for (const baker of await bakersOf(rpc, campaign)) {
    const raw = await account(rpc, await entryAddress(campaign, baker));
    out.push({ baker, entry: raw && raw.data.length > 0 ? decodeEntry(raw) : null });
  }
  return out;
}

/** The Clock sysvar from its bytes (slot, epoch, Unix time), the time the program reads (A-7). */
export async function chainClock(rpc: Rpc) {
  const raw = await account(rpc, CLOCK_SYSVAR_ID);
  if (!raw) throw new Error("the Clock sysvar is missing");
  const view = new DataView(raw.data.buffer, raw.data.byteOffset, raw.data.byteLength);
  return {
    slot: view.getBigUint64(0, true),
    epoch: view.getBigUint64(16, true),
    unixTimestamp: view.getBigInt64(32, true),
  };
}

const due = (why: string) => (console.log(`not due: ${why}`), null);

/** Runs `step` on `campaign` with the payer in `ctx`. Returns what `act` returned, or `null` when not due. */
export async function runStep(ctx: TeamContext, campaign: Address, step: Step) {
  const c = await campaignOf(ctx.rpc, campaign);
  const now = (await chainClock(ctx.rpc)).unixTimestamp;
  const finalized = c.status === Status.Settling || c.status === Status.Settled;
  switch (step) {
    case "status": {
      console.log(`${campaign}: ${Status[c.status]}, outcome ${Outcome[c.outcome]}, void ${VoidReason[c.voidReason]}`);
      console.log(
        `  mode ${SettleMode[c.settleMode]}; review ends ${formatUtc(c.reviewEndsAt)} (now ${formatUtc(now)})`,
      );
      console.log(`  prize ${formatSol(c.prizeLamports)}, opening fee ${formatSol(c.openingFeeLamports)} SOL`);
      console.log(`  creator share ${formatSol(c.creatorShare)} (reserved ${formatSol(c.creatorShareReserved)})`);
      console.log(`  flags: share ${c.creatorShareSettled}, fee ${c.feeCollected}, prize ${c.prizeSettled}`);
      for (const { baker, entry } of await entriesOf(ctx.rpc, campaign)) {
        if (!entry) console.log(`  ${baker}: settled (entry closed)`);
        else {
          const owed = finalized ? `, owed ${formatSol(entryOwed(c, entry).amount)}` : "";
          const joins = `joins ${entry.joinsTallied}/${entry.joinCount} tallied`;
          console.log(`  ${baker}: YES ${formatSol(entry.amountYes)} NO ${formatSol(entry.amountNo)}, ${joins}${owed}`);
        }
      }
      return null;
    }
    case "resolve":
      if (c.status !== Status.Open) return due("the campaign is not open");
      return act(ctx, "resolve_campaign", [B.buildResolveCampaign({ campaign, metricAccount: c.metricAccount })]);
    case "tally": {
      if (c.status !== Status.InReview) return due("joins are tallied in review only");
      const ixs = [];
      for (const { baker, entry } of await entriesOf(ctx.rpc, campaign)) {
        if (entry && entry.joinsTallied < entry.joinCount) {
          ixs.push(await B.buildTallyLateJoins({ campaign, baker, from: entry.joinsTallied, to: entry.joinCount }));
        }
      }
      if (ixs.length === 0) return due("every join is tallied");
      return act(ctx, `tally_late_joins x${ixs.length}`, ixs);
    }
    case "finalize":
      if (c.status !== Status.InReview) return due("finalize runs once, from review");
      if (now < c.reviewEndsAt) return due(`the window ends ${formatUtc(c.reviewEndsAt)}`);
      return act(ctx, "finalize_campaign", [await B.buildFinalizeCampaign({ campaign })]);
    case "entries": {
      if (c.status !== Status.Settling) return due("entries are paid while settling");
      const open = (await entriesOf(ctx.rpc, campaign)).filter((e) => e.entry);
      if (open.length === 0) return due("every entry is paid");
      let last = null;
      for (let i = 0; i < open.length; i += BATCH) {
        const slice = open.slice(i, i + BATCH);
        for (const { baker, entry } of slice) console.log(`  ${baker}: ${formatSol(entryOwed(c, entry!).amount)} SOL`);
        const ixs = await Promise.all(slice.map(({ baker }) => B.buildSettleEntry({ campaign, baker })));
        last = await act(ctx, `settle_entry x${ixs.length}`, ixs);
      }
      return last;
    }
    case "share": {
      if (!finalized) return due("not finalized");
      if (c.creatorIsTeam || c.settleMode !== SettleMode.Split || c.creatorShare === 0n) return due("no creator share");
      if (c.creatorShareSettled && c.creatorShareReserved === 0n) return due("the share is paid");
      const done = await act(ctx, "settle_creator_share", [
        await B.buildSettleCreatorShare({ campaign, creator: c.creator }),
      ]);
      const after = await campaignOf(ctx.rpc, campaign);
      if (done.sent && after.creatorShareReserved > 0n) {
        console.log(`reserved ${formatSol(after.creatorShareReserved)} SOL: the creator's wallet was below rent`);
      }
      return done;
    }
    case "prize":
      if (!finalized) return due("not finalized");
      if (c.prizeSettled) return due("the prize step ran");
      return act(ctx, "settle_prize", [await B.buildSettlePrize({ campaign, recipient: c.creator })]);
    case "fee":
      if (!finalized) return due("not finalized");
      if (c.feeCollected) return due("the fee is collected");
      return act(ctx, "collect_fee", [await B.buildCollectFee({ campaign })]);
    case "close":
      if (c.status !== Status.Settled) return due("close runs once every entry is paid");
      console.log("after the close the campaign page shows it as closed; its history stays on-chain");
      if (c.creatorShareReserved > 0n) {
        console.log(
          `warning: the close pays the reserved creator share (${formatSol(c.creatorShareReserved)} SOL) with the rents`,
        );
      }
      return act(ctx, "close_campaign", [await B.buildCloseCampaign({ campaign, rentPayer: c.rentPayer })]);
    case "sweep": {
      const config = decodeGlobalConfig((await account(ctx.rpc, await configAddress()))!);
      return act(ctx, "sweep_fees", [await B.buildSweepFees({ feeRecipient: config.feeRecipient })]);
    }
    default:
      throw new Error(`no step ${step}: use one of ${STEPS.join(", ")}`);
  }
}
