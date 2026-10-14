/**
 * Purpose: the late-join tally a team act needs first (TP §3.4.3, amendment 2026-10-09): every entry of a campaign in
 *          review whose joins are not all tallied, as `tally_late_joins` instructions. A confirm, a void and a contest
 *          are refused with `NotTallied` while one is left, so each of those scripts sends the tallies first: in front
 *          of the act, in the same transaction (up to `TALLY_BATCH`), the rest before it in their own transactions.
 *          Any wallet may tally; the program chooses everything. The bakers come from the campaign's own history
 *          (`bakersOf`, scripts/rehearsal/settle-steps.ts), so no account scan is needed.
 * Version: 0.1.0
 * Sprint:  14 (the two-stage dispute; lane INV14)
 */
import { type Address, type Instruction } from "@solana/kit";

import { Status, decodeCampaign, decodeEntry, entryAddress } from "@brot/sdk/read";
import { buildTallyLateJoins } from "@brot/sdk/tx";

import { bakersOf } from "../rehearsal/settle-steps";
import { account, type Rpc } from "../validator/rpc";
import { act, type TeamContext } from "./common";

/** At most this many tallies ride in front of an act in one transaction; any more are sent before it. */
export const TALLY_BATCH = 4;

/** The tallies `campaign` still needs: none unless it is in review with an entry not wholly tallied. */
export async function pendingTallies(rpc: Rpc, campaign: Address): Promise<Instruction[]> {
  const found = await account(rpc, campaign);
  if (!found) return [];
  const c = decodeCampaign(found);
  if (c.status !== Status.InReview || c.entriesUntallied === 0) return [];
  const ixs: Instruction[] = [];
  for (const baker of await bakersOf(rpc, campaign)) {
    const raw = await account(rpc, await entryAddress(campaign, baker));
    if (!raw || raw.data.length === 0) continue;
    const entry = decodeEntry(raw);
    if (entry.joinsTallied >= entry.joinCount) continue;
    ixs.push(await buildTallyLateJoins({ campaign, baker, from: entry.joinsTallied, to: entry.joinCount }));
  }
  return ixs;
}

/**
 * The tallies that ride in front of an act (at most `TALLY_BATCH`), after the ones that do not fit are simulated, and
 * sent with --yes, on their own. Without --yes and with more than `TALLY_BATCH` tallies, the act's simulation cannot
 * see the earlier batches and says `NotTallied`: send them first.
 */
export async function frontTallies(ctx: TeamContext, campaign: Address): Promise<Instruction[]> {
  const tallies = await pendingTallies(ctx.rpc, campaign);
  if (tallies.length === 0) return [];
  const count = `${tallies.length} ${tallies.length === 1 ? "entry" : "entries"}`;
  console.log(`${count} to tally first: the act is refused with NotTallied until each is tallied`);
  const before = tallies.slice(0, Math.max(0, tallies.length - TALLY_BATCH));
  for (let i = 0; i < before.length; i += TALLY_BATCH) {
    const batch = before.slice(i, i + TALLY_BATCH);
    await act(ctx, `tally_late_joins x${batch.length}`, batch);
  }
  if (before.length > 0 && !ctx.yes) console.log("the next simulation cannot see the tallies above: add --yes");
  return tallies.slice(before.length);
}

/** `ixs` (one team act) after the tallies it needs, the last of them in its own transaction. */
export async function actAfterTallies(ctx: TeamContext, campaign: Address, label: string, ixs: Instruction[]) {
  const front = await frontTallies(ctx, campaign);
  return act(ctx, front.length > 0 ? `tally_late_joins x${front.length} + ${label}` : label, [...front, ...ixs]);
}
