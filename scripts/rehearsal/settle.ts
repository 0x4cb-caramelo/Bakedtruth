/**
 * Purpose: `bun run scripts/rehearsal/settle.ts <campaign> <step>`: one settlement step of one campaign on a cluster
 *          (Sprint 12's devnet rehearsal; settle-steps.ts). The payer is DEVNET_WALLET; every step simulates first and
 *          sends only with --yes. Run `status` first, and after each step.
 * Version: 0.1.0
 * Sprint:  12 (site: my entries and campaign states)
 *
 *   bun run scripts/rehearsal/settle.ts <campaign address> status --cluster devnet
 *   bun run scripts/rehearsal/settle.ts <campaign address> tally --cluster devnet --yes
 *   steps, in order: resolve (only if the keeper is down), tally, finalize (after the 6-hour window; or the team's
 *   scripts/team/confirm.ts inside it), entries, share, prize, fee, close, sweep
 */
import { parseArgs } from "node:util";

import { address } from "@solana/kit";

import { runCli } from "../team/common";
import { clusterArgs, openCluster } from "../validator/clusters";
import { keypairFromEnv } from "../validator/keys";
import { runStep, STEPS } from "./settle-steps";

const DEFAULT_WALLET = "~/.config/solana/pred-provable-devnet.json";

if (import.meta.main) {
  runCli(async () => {
    const { values, positionals } = parseArgs({
      allowPositionals: true,
      options: { url: { type: "string" }, cluster: { type: "string" }, yes: { type: "boolean" } },
    });
    const [campaign, step] = positionals;
    if (!campaign || !step || !STEPS.includes(step)) {
      throw new Error(`usage: settle.ts <campaign> <${STEPS.join("|")}> --cluster devnet [--yes]`);
    }
    const { url, cluster } = clusterArgs();
    const rpc = await openCluster(url, cluster);
    const signer = await keypairFromEnv("DEVNET_WALLET", DEFAULT_WALLET);
    console.log(`paying as ${signer.address} (DEVNET_WALLET) on ${cluster}`);
    await runStep({ rpc, signer, yes: values.yes === true }, address(campaign), step);
  });
}
