/**
 * Purpose: a read-only check of an opening (Sprint 19 DoD: "the `Campaign` account shows `opening_paid_lamports`
 *          equal to the quote's formula at the price read, split as `prize_lamports + opening_fee_lamports`", I14). It
 *          reads the campaign by its id through the SDK and recomputes, from what the account stored, the charge
 *          `ceil(opening_usd × 10^(9 − e) ÷ p)` at the price the program read (Pyth's SOL/USD price minus its
 *          confidence band) and the 90/10 split, and prints each value next to the stored one. It signs nothing.
 * Version: 0.1.0
 * Sprint:  19 (site: open a campaign)
 *
 * Usage: bun run scripts/team/check-opening.ts --campaign <id> --cluster devnet [--url ...]
 * Exits with 1 when a stored value differs from the formula.
 */
import { parseArgs } from "node:util";

import {
  campaignAddress,
  configAddress,
  decodeCampaign,
  decodeGlobalConfig,
  fetchRaw,
  formatScaled,
  formatSol,
  formatUtc,
  openingPaidLamports,
  rpcFor,
  splitOpening,
  type Campaign,
} from "@brot/sdk/read";

import { clusterArgs, openCluster } from "../validator/clusters";
import { runCli } from "./common";

export type OpeningCheck = { ok: boolean; lines: string[] };

/** The stored opening against the formula at the stored price, with the config's prize split. */
export function checkOpening(c: Campaign, prizeBps: number): OpeningCheck {
  const lines = [
    `campaign ${c.id}, opened by ${c.creator}${c.creatorIsTeam ? " (a team key)" : ""}, template v${c.templateVersion}`,
    `opening_usd ${c.openingUsd}; price read ${formatScaled(c.openingPrice, c.openingPriceExponent)} (published ${formatUtc(c.openingPricePublishTime)})`,
  ];
  if (c.openingUsd === 0n) {
    const free = c.openingPaidLamports === 0n && c.prizeLamports === 0n && c.openingFeeLamports === 0n;
    lines.push(`a free opening: paid ${c.openingPaidLamports}, prize ${c.prizeLamports}, fee ${c.openingFeeLamports}`);
    return { ok: free, lines };
  }
  const formula = openingPaidLamports(c.openingUsd, c.openingPrice, c.openingPriceExponent);
  const split = splitOpening(c.openingPaidLamports, prizeBps);
  const row = (name: string, stored: bigint, expected: bigint) =>
    `${name}: stored ${stored} (${formatSol(stored)} SOL), formula ${expected} ${stored === expected ? "✓" : "✗ DIFFERS"}`;
  lines.push(
    row("opening_paid_lamports", c.openingPaidLamports, formula),
    row("prize_lamports", c.prizeLamports, split.prize),
    row("opening_fee_lamports", c.openingFeeLamports, split.fee),
  );
  const ok =
    c.openingPaidLamports === formula &&
    c.prizeLamports === split.prize &&
    c.openingFeeLamports === split.fee &&
    c.prizeLamports + c.openingFeeLamports === c.openingPaidLamports;
  return { ok, lines };
}

async function main() {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    strict: false,
    options: { campaign: { type: "string" } },
  });
  const id = values.campaign as string | undefined;
  if (!id || !/^\d{1,20}$/.test(id)) throw new Error("--campaign <id>: the campaign's number");
  const { url, cluster } = clusterArgs();
  const rpc = rpcFor((await openCluster(url, cluster)).url);
  const raw = await fetchRaw(rpc, await campaignAddress(BigInt(id)));
  if (!raw) throw new Error(`no campaign ${id} on this cluster (it may be closed after its payouts)`);
  const config = await fetchRaw(rpc, await configAddress());
  if (!config) throw new Error("no config on this cluster: the program is not initialized");
  const check = checkOpening(decodeCampaign(raw), decodeGlobalConfig(config).params.openingPrizeBps);
  console.log(check.lines.join("\n"));
  console.log(check.ok ? "The opening matches the formula." : "The opening does NOT match the formula.");
  if (!check.ok) process.exitCode = 1;
}

if (import.meta.main) runCli(main);
