/**
 * Purpose: the standby's second-read pass (Sprint 07 DoD; T22, review by exception): every campaign in review is
 *          checked once through RPC B (second-check.ts). Each check is one journal line that names the origin of the
 *          RPC that answered and whether it is the primary's own (on devnet RPC B may point anywhere, so the line says
 *          plainly when the check is not independent). A mismatch goes to the review queue and raises
 *          `second_read_mismatch`; a check that cannot be made is tried again on the next pass, and if the review
 *          window then has less than an hour left it goes to the queue as `second_read_unchecked`, once.
 * Version: 0.1.0
 * Sprint:  07 carry-over (the second read: the proof transaction and the other kinds)
 */
import type { Address } from "@solana/kit";
import { ReaderKind, type Recheck, type SolanaRpc } from "@brot/sdk/read";

import type { Alerter } from "./alert";
import type { OpenCampaign } from "./campaigns";
import { log as journal } from "./log";
import { appendReview, type ReviewEntry } from "./review-queue";
import { checkCampaign, type Check } from "./second-check";

export type SecondReadDeps = {
  /** The campaigns in review (listed through the primary's RPC; every check reads through RPC B). */
  listInReview: () => Promise<OpenCampaign[]>;
  rpcB: SolanaRpc;
  recheck: (at: Address) => Promise<Recheck>;
  answeredBy: string;
  sameProvider: boolean;
  queuePath: string;
  alerter: Alerter;
  /** Campaigns done (checked, or never checkable) and those already queued as unchecked. */
  memory: { done: Set<string>; unchecked: Set<string> };
  write?: (path: string, line: string) => Promise<void>;
  now?: () => number;
  log?: (event: string, fields: Record<string, unknown>) => void;
};

/** Less than this before the window's end, an unchecked resolution goes to a person. */
const LAST_HOUR_S = 3_600n;

export async function secondReadPass(deps: SecondReadDeps) {
  const log = deps.log ?? journal;
  const nowS = BigInt(Math.floor((deps.now ?? Date.now)() / 1_000));
  const tally = { checked: 0, mismatches: 0, unchecked: 0 };
  for (const { address, campaign } of await deps.listInReview()) {
    if (deps.memory.done.has(address)) continue;
    let check: Check;
    try {
      check = await checkCampaign(campaign.kind, address, deps);
    } catch (error) {
      check = { match: null, detail: error instanceof Error ? error.message : String(error), final: false };
    }
    const kind = ReaderKind[campaign.kind] ?? String(campaign.kind);
    const where = { answeredBy: deps.answeredBy, sameProvider: deps.sameProvider };
    log("second-read", { campaign: address, kind, match: check.match, detail: check.detail, ...where });
    const base = { at: new Date().toISOString(), campaign: address, primarySlot: null, kind, ...where };
    const postedSlot = "postedSlot" in check && check.postedSlot !== undefined ? check.postedSlot.toString() : null;
    if (check.match === null) {
      if (check.final) deps.memory.done.add(address);
      else if (campaign.reviewEndsAt - nowS < LAST_HOUR_S && !deps.memory.unchecked.has(address)) {
        deps.memory.unchecked.add(address);
        tally.unchecked++;
        const entry: ReviewEntry = { ...base, reason: "second_read_unchecked", detail: check.detail, postedSlot };
        await appendReview(deps.queuePath, entry, deps.write);
        deps.alerter.alert("second_read_unchecked", address, { readerKind: kind, detail: check.detail, ...where });
      }
      continue;
    }
    deps.memory.done.add(address);
    tally.checked++;
    if (check.match) continue;
    tally.mismatches++;
    await appendReview(
      deps.queuePath,
      { ...base, reason: "second_read_mismatch", detail: check.detail, postedSlot },
      deps.write,
    );
    deps.alerter.alert("second_read_mismatch", address, { readerKind: kind, detail: check.detail, ...where });
  }
  return tally;
}
