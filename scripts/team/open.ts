/**
 * Purpose: `user_open_campaign` with your own TEAM key, free (`opening_usd` 0): for the team or a launch partner,
 *          with no prize and no creator share (P-3; TP §3.4.10). Outside the valve on open campaigns (founder
 *          answer 4). The campaign comes from flags or a JSON file; the program checks every rule (A-10).
 * Version: 0.1.0
 * Sprint:  05 (SDK and the devnet cycle), lane OPS
 *
 * The id is drawn once and printed BEFORE anything is sent: a retry must pass the same `--id`, so a repeat fails
 * on the existing account instead of opening twice (T17, A-9). Every team-key opening raises an alert (TP §3.5).
 *
 *   bun run scripts/team/open.ts --kind SupplyAtMost --metric <mint> --target 990000 --deadline +4d --cluster devnet
 *   bun run scripts/team/open.ts --kind PriceTouch --feed BTC/USD --direction above --target <price> --deadline +7d
 *   bun run scripts/team/open.ts --json campaign.json --cluster devnet [--yes]
 */
import { readFileSync } from "node:fs";

import { address, type Address } from "@solana/kit";

import { Direction, ReaderKind, campaignAddress, feedsOf } from "@brot/sdk/read";
import { buildOpenCampaign, randomCampaignId } from "@brot/sdk/tx";

import { clock } from "../validator/rpc";
import { act, contextFromCli, requireRole, runCli, type TeamContext } from "./common";

/** A campaign as the team writes it: names, not enum numbers; the deadline absolute or `+<n>d`/`+<n>h`. */
export type TeamCampaign = {
  kind: keyof typeof ReaderKind;
  target: string;
  deadline: string;
  metric?: string;
  feed?: string;
  direction?: "above" | "below";
  epoch?: string;
  id?: string;
};

/** A feed by hex id or by its Pyth symbol (`BTC/USD` or `Crypto.BTC/USD`) on the target cluster's list. */
export function feedHex(feed: string, cluster: "mainnet" | "devnet"): string {
  if (/^(0x)?[0-9a-fA-F]{64}$/.test(feed)) return feed.replace(/^0x/, "").toLowerCase();
  const found = feedsOf(cluster).find(([, symbol]) => symbol === feed || symbol === `Crypto.${feed}`);
  if (!found) throw new Error(`${feed} is not on the ${cluster} feed list`);
  return found[0];
}

/** `+<n>d`, `+<n>h`, Unix seconds or an ISO date, against the cluster's clock. */
export function deadlineOf(text: string, now: bigint): bigint {
  const relative = /^\+(\d+)([dh])$/.exec(text);
  if (relative) return now + BigInt(relative[1]) * (relative[2] === "d" ? 86_400n : 3_600n);
  if (/^\d+$/.test(text)) return BigInt(text);
  const ms = Date.parse(text);
  if (Number.isNaN(ms)) throw new Error(`deadline ${text}: use +<n>d, +<n>h, Unix seconds or an ISO date`);
  return BigInt(Math.floor(ms / 1000));
}

export async function openTeamCampaign(ctx: TeamContext, spec: TeamCampaign, cluster: "mainnet" | "devnet" = "devnet") {
  const config = await requireRole(ctx, "team");
  const kind = ReaderKind[spec.kind];
  if (kind === undefined) throw new Error(`unknown kind ${spec.kind}`);
  const isPrice = kind === ReaderKind.PriceTouch;
  const id = spec.id ? BigInt(spec.id) : randomCampaignId();
  const args = {
    id,
    kind,
    direction: spec.direction === "below" ? Direction.Below : Direction.Above,
    feedId: isPrice ? feedHex(spec.feed ?? "", cluster) : undefined,
    target: BigInt(spec.target),
    deadlineAt: deadlineOf(spec.deadline, (await clock(ctx.rpc)).unixTimestamp),
    openingUsd: 0n,
    maxLamports: 0n,
    epoch: spec.epoch ? BigInt(spec.epoch) : 0n,
    expectedParamsVersion: config.paramsVersion,
  };
  const metricAccount: Address | undefined = spec.metric ? address(spec.metric) : undefined;
  console.log(`campaign id ${id} (save it: a retry must pass --id ${id}); address ${await campaignAddress(id)}`);
  const ix = await buildOpenCampaign({ creator: ctx.signer, args, metricAccount });
  return { id, ...(await act(ctx, "user_open_campaign (team, free)", [ix])) };
}

if (import.meta.main) {
  runCli(async () => {
    const flags = Object.fromEntries(
      ["json", "kind", "target", "deadline", "metric", "feed", "direction", "epoch", "id"].map((f) => [
        f,
        { type: "string" as const },
      ]),
    );
    const { ctx, values } = await contextFromCli(flags);
    const spec = values.json ? JSON.parse(readFileSync(String(values.json), "utf8")) : values;
    await openTeamCampaign(ctx, spec as TeamCampaign);
  });
}
