/**
 * Purpose: the text of a resolution post (BR-33; TP §3.6 "The share card"; Sprint 13 DoD), written from
 *          scripts/team/resolution-post.template.txt for a person to post on X by hand: no X API, no key, nothing sent.
 *          It reads the campaign by its id through the SDK (the sentence, the result the program recorded, the value
 *          read and the target, the review window or a void's public reason) and prints the post and its length. It
 *          refuses a campaign whose result has not been read, and it promises no payout and no time.
 * Version: 0.2.0 (the Sprint 13 reviews: a price NO and a target met late say why; the devnet line before the link; one
 *          link; the length as X counts it)
 * Sprint:  13 (site: ranking, notices and copy)
 *
 * Usage: bun run scripts/team/resolution-post.ts --campaign <id> [--site https://<the site>] --cluster devnet
 *        [--url ...]
 * Read-only: it signs nothing. `--site` adds the campaign page's link; without it the post links the explorer only.
 */
import { readFileSync } from "node:fs";
import { parseArgs } from "node:util";

import {
  bytesToHex,
  campaignAddress,
  decodeCampaign,
  Direction,
  fetchRaw,
  formatUtc,
  Outcome,
  publicState,
  readChainTime,
  ReaderKind,
  rpcFor,
  type Campaign,
  type ChainTime,
  type SolanaRpc,
  VoidReason,
} from "@brot/sdk/read";

import { valueText } from "../../app/features/campaign-page/format";
import { kindOf } from "../../app/features/campaign-page/proof";
import { sentenceOf } from "../../app/features/campaigns/sentence";
import { clusterArgs, openCluster } from "../validator/clusters";
import { runCli } from "./common";

export const TEMPLATE_PATH = "scripts/team/resolution-post.template.txt";
/** X's limit for a post from an account without a subscription. */
export const POST_LIMIT = 280;
/** X counts every link as this many characters, whatever its length. */
const LINK = 23;

/** A post's length as X counts it: each link as 23 characters. */
export const xLength = (post: string): number => post.replace(/https?:\/\/\S+/g, "x".repeat(LINK)).length;

/** Each void's public reason, short enough for a post (the campaign page has the full text, `VOID_REASON`). */
export const POST_REASON: Record<VoidReason, string> = {
  [VoidReason.None]: "No reason recorded.",
  [VoidReason.MissedWindow]: "Brot's service missed the reading.",
  [VoidReason.UnreadableAccount]: "The account could no longer be read.",
  [VoidReason.StaleFeed]: "The price feed stopped updating before the deadline.",
  [VoidReason.TeamHouseFailure]: "The team recorded the cause as Brot's.",
  [VoidReason.TeamOutsideCause]: "The team recorded the cause as outside Brot.",
};

export type PostOptions = { cluster: "devnet" | "local"; site?: string };

/** The post for a campaign whose result was read, from the template; lines left empty are dropped. */
export function resolutionPost(campaign: Campaign, address: string, chain: ChainTime, options: PostOptions): string {
  if (campaign.outcome === Outcome.Unresolved) throw new Error("nothing to post yet: the result has not been read");
  const view = publicState(campaign, chain);
  const kind = kindOf(campaign.kind);
  const sentence = sentenceOf({
    kind: ReaderKind[campaign.kind],
    direction: Direction[campaign.direction],
    feedIdHex: bytesToHex(campaign.feedId),
    target: campaign.target.toString(),
    priceExponent: campaign.priceExponent,
    metricAccount: campaign.metricAccount,
    epoch: campaign.epoch.toString(),
  });
  const voided = campaign.outcome === Outcome.Void;
  const value = (v: bigint) => valueText(kind, v, campaign.priceExponent);
  const read = voided
    ? `${POST_REASON[campaign.voidReason as VoidReason]} Entries come back in full.`
    : campaign.outcome === Outcome.No && kind === "price"
      ? "No YES proof was recorded before the deadline."
      : campaign.metLate
        ? `Value read: ${value(campaign.observedValue)}. Target: ${value(campaign.target)}, met only after the deadline, which counts as NO.`
        : `Value read: ${value(campaign.observedValue)}. Target: ${value(campaign.target)}.`;
  const explorer = `https://explorer.solana.com/address/${address}${options.cluster === "devnet" ? "?cluster=devnet" : ""}`;
  const fields: Record<string, string> = {
    id: campaign.id.toString(),
    sentence,
    result: voided ? "voided" : campaign.outcome === Outcome.Yes ? "YES" : "NO",
    read,
    status: view.contested
      ? "Contested: the payout is paused while the result is checked again."
      : view.state === "InReview" && !view.windowEnded
        ? `Review ends ${formatUtc(campaign.reviewEndsAt)}.`
        : "The result is final.",
    // One link: the campaign's page when a site is given (it has the re-check panel), else the account on the explorer.
    link: options.site ? `${options.site.replace(/\/+$/, "")}/c/${campaign.id}` : `Check it: ${explorer}`,
  };
  const template = readFileSync(TEMPLATE_PATH, "utf8");
  return template
    .split("\n")
    .map((line) => line.replace(/\{\{(\w+)\}\}/g, (_, key: string) => fields[key] ?? "").trimEnd())
    .filter((line) => line.length > 0)
    .join("\n");
}

/** The campaign at `id`, read through `rpc`, with the chain's time. */
export async function readForPost(rpc: SolanaRpc, id: bigint) {
  const address = await campaignAddress(id);
  const raw = await fetchRaw(rpc, address);
  if (!raw) throw new Error(`no campaign ${id} on this cluster (it may be closed after its payouts)`);
  return { campaign: decodeCampaign(raw), address: address as string, chain: await readChainTime(rpc) };
}

async function main() {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    strict: false,
    options: { campaign: { type: "string" }, site: { type: "string" } },
  });
  const id = values.campaign as string | undefined;
  if (!id || !/^\d{1,20}$/.test(id)) throw new Error("--campaign <id>: the campaign's number");
  const site = values.site as string | undefined;
  if (site && !/^https:\/\/[^\s/]+/.test(site)) throw new Error("--site must be an https:// address");
  const { url, cluster } = clusterArgs();
  const ops = await openCluster(url, cluster);
  const read = await readForPost(rpcFor(ops.url), BigInt(id));
  const post = resolutionPost(read.campaign, read.address, read.chain, { cluster, site });
  console.log(`\n${post}\n`);
  const length = xLength(post);
  console.log(`${length} characters as X counts them${length > POST_LIMIT ? `: over ${POST_LIMIT}, shorten it` : ""}.`);
  console.log("Nothing was posted: copy the text above and post it yourself.");
}

if (import.meta.main) runCli(main);
