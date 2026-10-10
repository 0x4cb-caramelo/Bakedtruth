/**
 * Purpose: a PAID opening by a wallet outside the team (Sprint 12's devnet rehearsal: the creator's 1% and a prize that
 *          returns exist only on a paid, non-team opening; scripts/team/open.ts opens free). The key is
 *          CREATOR_KEYPAIR; a team key is refused (it would open with no creator share, P-3). The charge is previewed
 *          at the live SOL/USD account (the SDK's `openingQuote`, `max_lamports` 1% above it) with both rents and the
 *          fee; the id is printed before anything is sent; the program checks every rule (A-10). Simulates first,
 *          sends only with --yes.
 * Version: 0.1.0
 * Sprint:  12 (site: my entries and campaign states)
 *
 *   CREATOR_KEYPAIR=~/k.json bun run scripts/rehearsal/open-paid.ts --kind SupplyAtMost --metric <mint> \
 *     --target 990000 --deadline +74h --cluster devnet [--usd 500] [--id <retry>] [--yes]
 * A retry passes the printed --id, so a repeat fails on the existing account instead of charging twice (T17, A-9).
 */
import { parseArgs } from "node:util";

import { address, type Address } from "@solana/kit";

import {
  ACCOUNT_LEN,
  campaignAddress,
  configAddress,
  decodeCampaign,
  decodeGlobalConfig,
  Direction,
  formatSol,
  isTeamKey,
  openingDebit,
  openingQuote,
  ReaderKind,
  SOL_USD_ACCOUNT,
} from "@brot/sdk/read";
import { buildOpenCampaign, randomCampaignId } from "@brot/sdk/tx";

import { act, runCli, type TeamContext } from "../team/common";
import { deadlineOf, feedHex, type TeamCampaign } from "../team/open";
import { clusterArgs, openCluster } from "../validator/clusters";
import { keypairFromEnv } from "../validator/keys";
import { account, balance, rentFor } from "../validator/rpc";
import { chainClock } from "./settle-steps";

export type PaidCampaign = TeamCampaign & { usd?: string };

export async function openPaid(ctx: TeamContext, spec: PaidCampaign, cluster: "mainnet" | "devnet" = "devnet") {
  const found = await account(ctx.rpc, await configAddress());
  if (!found) throw new Error("no config on this cluster: the program is not initialized");
  const config = decodeGlobalConfig(found);
  if (isTeamKey(config, ctx.signer.address)) {
    throw new Error(
      `${ctx.signer.address} is a team key: its opening is free and has no creator share; use another wallet`,
    );
  }
  const openingUsd = BigInt(spec.usd ?? "500");
  if (openingUsd < config.params.openingFeeUsd)
    throw new Error(`the opening is at least US$${config.params.openingFeeUsd}`);
  const kind = ReaderKind[spec.kind];
  if (kind === undefined) throw new Error(`unknown kind ${spec.kind}`);
  const isPrice = kind === ReaderKind.PriceTouch;
  const now = await chainClock(ctx.rpc);
  const solUsd = await account(ctx.rpc, SOL_USD_ACCOUNT);
  if (!solUsd) throw new Error("the SOL/USD price account is missing");
  const quote = openingQuote({ params: config.params, openingUsd, solUsd, clock: now });
  const debit = openingDebit({
    payment: quote.paid,
    maxPayment: quote.maxLamports,
    campaignRent: await rentFor(ctx.rpc, ACCOUNT_LEN.campaign),
    vaultRent: await rentFor(ctx.rpc, 0),
    networkFee: 5_000n,
  });
  console.log(
    `US$${openingUsd} at SOL/USD ${quote.price}e${quote.exponent}: ${formatSol(quote.paid)} SOL into the vault`,
  );
  console.log(
    `  prize ${formatSol(quote.prize)}, opening fee ${formatSol(quote.fee)}; max ${formatSol(quote.maxLamports)}`,
  );
  console.log(`  with both rents and the fee: ${formatSol(debit.total)} SOL now, at most ${formatSol(debit.maxTotal)}`);
  const held = await balance(ctx.rpc, ctx.signer.address);
  if (held < debit.maxTotal)
    throw new Error(`the wallet holds ${formatSol(held)} SOL, less than ${formatSol(debit.maxTotal)}`);
  const id = spec.id ? BigInt(spec.id) : randomCampaignId();
  const campaign = await campaignAddress(id);
  console.log(`campaign id ${id} (save it: a retry must pass --id ${id}); address ${campaign}`);
  const args = {
    id,
    kind,
    direction: spec.direction === "below" ? Direction.Below : Direction.Above,
    feedId: isPrice ? feedHex(spec.feed ?? "", cluster) : undefined,
    target: BigInt(spec.target),
    deadlineAt: deadlineOf(spec.deadline, now.unixTimestamp),
    openingUsd,
    maxLamports: quote.maxLamports,
    epoch: spec.epoch ? BigInt(spec.epoch) : 0n,
    expectedParamsVersion: config.paramsVersion,
  };
  const metricAccount: Address | undefined = spec.metric ? address(spec.metric) : undefined;
  const ix = await buildOpenCampaign({ creator: ctx.signer, args, metricAccount });
  const done = await act(ctx, "user_open_campaign (paid)", [ix]);
  if (done.sent) {
    const stored = decodeCampaign((await account(ctx.rpc, campaign))!);
    console.log(
      `opened: prize ${formatSol(stored.prizeLamports)}, opening fee ${formatSol(stored.openingFeeLamports)} SOL`,
    );
  }
  return { id, campaign, ...done };
}

if (import.meta.main) {
  runCli(async () => {
    const names = ["kind", "target", "deadline", "metric", "feed", "direction", "epoch", "id", "usd", "url", "cluster"];
    const options = Object.fromEntries(names.map((n) => [n, { type: "string" as const }]));
    const { values } = parseArgs({ options: { ...options, yes: { type: "boolean" } } });
    const { url, cluster } = clusterArgs();
    const rpc = await openCluster(url, cluster);
    const signer = await keypairFromEnv("CREATOR_KEYPAIR");
    console.log(`opening as ${signer.address} (CREATOR_KEYPAIR) on ${cluster}`);
    await openPaid({ rpc, signer, yes: values.yes === true }, values as unknown as PaidCampaign);
  });
}
