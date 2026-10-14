/**
 * Purpose: the slot matrix's baselines for the Sprint 14 instructions on the surfnet, mirroring
 *          tests/brot/slot-matrix-fixtures-14-15.ts: a referee linking its referrer (two fresh funded wallets); a price
 *          campaign contested at stage 1 whose metric account is a random address, so the re-read reads nothing and
 *          escalates; and one at stage 2 (a YES with its proof's publish time, the deadline an hour away) the admin
 *          confirms. Each case of the matrix is then sent against its baseline by negative-run.ts.
 * Version: 0.1.0
 * Sprint:  14 (lane INV14). Sprint 15's sealed entry and its fee settlement get theirs when they land.
 */
import { injectCampaign } from "../../tests/brot/campaigns";
import * as IL from "../../tests/brot/instructions-14-15";
import * as P from "../../tests/brot/program";

import { funded, type Build, type Env } from "./negative-baselines";
import { base } from "./negative-world";
import { clock } from "./rpc";

/** A price campaign a day past its deadline, resolved YES, written `Contested` at `stage`, an hour left on its clock. */
async function contested(env: Env, stage: number) {
  const t = (await clock(env.rpc)).unixTimestamp;
  const c = await base(env.rpc, {
    opensAt: t - 4n * P.DAY,
    entriesCloseAt: t - 2n * P.DAY,
    deadlineAt: t - P.DAY,
    status: P.Status.Contested,
    extra: {
      outcome: P.Outcome.Yes,
      publish_time: t - 2n * P.DAY,
      contest_stage: stage,
      contest_ends_at: t + P.HOUR,
    },
  });
  const { campaign } = await injectCampaign(env.sw.w.client, c);
  await env.sw.flush();
  return { campaign, metric: c.metric };
}

export const BASELINES_14: [string, Build][] = [
  [
    "UserLinkReferrer",
    async (env) => {
      const [referee, referrer] = [await funded(env.rpc), await funded(env.rpc)];
      return { ix: await IL.userLinkReferrerIx(referee, referrer.address) };
    },
  ],
  [
    "RereadCampaign",
    async (env) => {
      const { campaign, metric } = await contested(env, 1);
      return { ix: IL.rereadCampaignIx(campaign, await P.configPda(), metric) };
    },
  ],
  [
    "AdminDecideContest",
    async (env) => {
      const { campaign } = await contested(env, 2);
      const args = { decision: P.ContestDecision.Confirm, voidReason: P.VoidReason.None, noteHash: new Uint8Array(32) };
      return { ix: IL.adminDecideContestIx(env.admin, await P.configPda(), campaign, args) };
    },
  ],
];
