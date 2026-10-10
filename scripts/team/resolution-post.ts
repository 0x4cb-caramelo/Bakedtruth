/**
 * Purpose: the text of a resolution post (BR-33; TP §3.6 "The share card"; Sprint 13 DoD), written from
 *          scripts/team/resolution-post.template.txt for a person to post on X by hand: no X API, no key, nothing sent.
 *          It reads the campaign by its id through the SDK (the sentence, the result the program recorded, the value
 *          read and the target, the review window or a void's public reason) and prints the post and its length. It
 *          refuses a campaign whose result has not been read, and it promises no payout and no time.
 * Version: 0.1.0
 * Sprint:  13 (site: ranking, notices and copy)
 *
 * Usage: bun run scripts/team/resolution-post.ts --campaign <id> [--site https://<the site>] --cluster devnet [--url ...]
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
} from "@brot/sdk/read";

import { VOID_REASON } from "../../app/features/campaign-page/copy-states";
import { valueText } from "../../app/features/campaign-page/format";
import { KIND_OF } from "../../app/features/campaign-page/proof";
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

/** The first sentence of a void's public reason: the post keeps it short; the campaign page has the rest. */
const firstSentence = (text: string) => text.split(/(?<=\.) /)[0];

export type PostOptions = { cluster: "devnet" | "local"; site?: string };

/** The post for a campaign whose result was read, from the template; lines left empty are dropped. */
export function resolutionPost(campaign: Campaign, address: string, chain: ChainTime, options: PostOptions): string {
  if (campaign.outcome === Outcome.Unresolved) throw new Error("nothing to post yet: the result has not been read");
  const view = publicState(campaign, chain);
  const kind = KIND_OF[campaign.kind];
  const sentence = sentenceOf({
    kind: ReaderKind[campaign.kind],
    direction: Direction[campaign.direction],
    feedIdHex: bytesToHex(campaign.feedId),
    target: campaign.target.toString(),
    priceExponent: campaign.priceExponent,
    metricAccount: campaign.metricAccount,
  });
  const voided = campaign.outcome === Outcome.Void;
  const value = (v: bigint) => valueText(kind, v, campaign.priceExponent);
  const fields: Record<string, string> = {
    id: campaign.id.toString(),
    sentence,
    result: voided ? "voided" : campaign.outcome === Outcome.Yes ? "YES" : "NO",
    read: voided
      ? `${firstSentence(VOID_REASON[campaign.voidReason])} Every entry is refunded in full.`
      : `Value read: ${value(campaign.observedValue)}. Target: ${value(campaign.target)}.`,
    status: view.contested
      ? "Contested: the payout is paused while the result is checked again."
      : view.state === "InReview" && !view.windowEnded
        ? `Final after the 6-hour review, at ${formatUtc(campaign.reviewEndsAt)}.`
        : "The result is final.",
    explorer: `https://explorer.solana.com/address/${address}${options.cluster === "devnet" ? "?cluster=devnet" : ""}`,
    page: options.site ? `${options.site.replace(/\/+$/, "")}/c/${campaign.id}` : "",
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
  console.log(
    `${post.length} characters${post.length > POST_LIMIT ? `: over X's ${POST_LIMIT}, shorten it by hand` : ""}.`,
  );
  console.log("Nothing was posted: copy the text above and post it yourself.");
}

if (import.meta.main) runCli(main);
