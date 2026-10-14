/**
 * Purpose: the contest exit the keeper takes (Sprint 14; TP §3.4.7, the founder's answer to D2): the stage-1
 *          re-read. It never sends a team's or the admin's act (`team_open_contest`, `admin_decide_contest`). Only a
 *          keeper with RPC B configured (the standby's independent read) re-reads, and it simulates `reread_campaign`
 *          through RPC B first. A matching re-read before stage 1's deadline is refused by design
 *          (`RereadBeforeTimelock`): logged as expected, never as a failure, and simulated again only from that
 *          deadline (the SDK view's `contestTimelockEndsAt`). A matching one after it pays (the snapshot runs) and is
 *          sent; a different reading sends the contest to the admin (stage 2), is sent at once, and alerts the team.
 *          Sends take the landing path: behind KEEPER_SETTLE (off: the simulation and the alert only) and the dry run.
 *          A lapsed contest is the settlement plan's (`finalize_campaign`).
 * Version: 0.1.0
 * Sprint:  14 (lane L14K: the keeper learns the contest's exits)
 */
import type { TransactionSigner } from "@solana/kit";
import { ContestStage, Status, publicState, type SolanaRpc } from "@brot/sdk/read";
import { buildRereadCampaign, simulate } from "@brot/sdk/tx";

import type { Alerter } from "./alert";
import type { ChainView } from "./chain";
import { landItems, type LandingContext } from "./landing";
import { log as journal } from "./log";
import { buildMessage } from "./send";

export type ContestDeps = {
  rpcB: SolanaRpc;
  alerter: Alerter;
  /** Per campaign, the chain time a matching re-read waits for (stage 1's deadline), learnt from its refusal. */
  waits: Map<string, bigint>;
  log?: (event: string, fields: Record<string, unknown>) => void;
};

export type ContestReport = { simulated: number; waiting: number; differs: number; sent: number; refused: number };

/** The stage-1 re-reads of one cycle; `send` is KEEPER_SETTLE (off: simulate and alert, send nothing). */
export async function contestTask(
  deps: ContestDeps,
  landing: LandingContext,
  view: ChainView,
  send: boolean,
): Promise<ContestReport> {
  const log = deps.log ?? journal;
  const report: ContestReport = { simulated: 0, waiting: 0, differs: 0, sent: 0, refused: 0 };
  const now = view.chain.unixTimestamp;
  for (const { address, campaign: c } of view.campaigns) {
    if (c.status !== Status.Contested || c.contestStage !== ContestStage.Stage1) continue;
    const contest = publicState(c, view.chain);
    if (contest.contestLapsed) continue; // the settlement plan finalizes it
    const waitUntil = deps.waits.get(address);
    if (waitUntil !== undefined && now < waitUntil) {
      report.waiting++;
      continue;
    }
    const ix = await buildRereadCampaign({ campaign: address, metricAccount: c.metricAccount });
    const sim = await simulate(deps.rpcB, await buildMessage(deps.rpcB, landing.payer as TransactionSigner, [ix]));
    report.simulated++;
    if (!sim.ok) {
      if (sim.errorName === "RereadBeforeTimelock") {
        const until = contest.contestTimelockEndsAt ?? c.contestEndsAt;
        deps.waits.set(address, until);
        report.waiting++;
        log("reread-waiting", {
          campaign: address,
          detail: "the same reading: it pays from stage 1's deadline",
          until: Number(until),
        });
      } else {
        report.refused++;
        log("reread-refused", { campaign: address, detail: sim.errorName ?? "simulation failed" });
      }
      continue;
    }
    deps.waits.delete(address);
    const reread = sim.events.find((event) => event.name === "CampaignReread");
    const same = reread?.name === "CampaignReread" && reread.data.same;
    if (!same) {
      report.differs++;
      deps.alerter.alert("contest_reread_differs", address, { stage: 1, contestEndsAt: Number(c.contestEndsAt) });
    }
    if (!send) {
      log("reread-not-sent", { campaign: address, same, detail: "KEEPER_SETTLE is off" });
      continue;
    }
    const [result] = await landItems(landing, [{ key: `reread:${address}`, kind: "reread", ix }]);
    if (result?.outcome === "landed") report.sent++;
    if (result?.outcome === "refused" || result?.outcome === "failed") report.refused++;
    log(`reread-${result?.outcome ?? "none"}`, { campaign: address, same, detail: result?.detail ?? null });
  }
  return report;
}
