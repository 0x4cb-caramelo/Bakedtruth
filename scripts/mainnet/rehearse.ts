/**
 * Purpose: the mainnet runbook (deploy/mainnet/README.md) rehearsed end to end on a Surfpool fork of mainnet-beta,
 *          with the `mainnet` feature binary and throwaway keys, never touching mainnet itself: a 2-of-3 Squads v4
 *          multisig made on the fork's real Squads program; the deploy script's guards; the deploy from a buffer by
 *          the stand-in hardware wallet and the upgrade authority handed to the vault; the initialization and the team
 *          in one multisig proposal; the 24-hour time lock set; a paid opening at the real SOL/USD price; a team
 *          opening on a real mint with 0.01 SOL entries; the pause, and the resume through the time-locked multisig;
 *          an upgrade through it; the deadline, NO, the six-hour window, the payouts and the sweep to the vault; the
 *          deployed bytes equal to the build; and option B, `admin` handed in two steps to a multisig without a lock.
 *          Exits 0 only if every step behaves as the runbook expects.
 * Version: 0.1.0
 * Sprint:  18 (mainnet), lane L18
 *
 *   cargo build-sbf --manifest-path programs/brot-markets/Cargo.toml --features mainnet --sbf-out-dir <dir> -- --locked
 *   MAINNET_REHEARSAL_KEYS=<private folder> bun run scripts/mainnet/rehearse.ts --so <dir>/brot_markets.so
 *
 * The keys folder must sit outside every Git work tree (the scripts refuse a key file inside one). The fork fetches
 * mainnet accounts through Surfpool's datasource (mainnet's public RPC unless SURFPOOL_DATASOURCE_RPC_URL is set).
 */
import { join } from "node:path";
import { parseArgs } from "node:util";

import { address } from "@solana/kit";

import { PROGRAM_ID, Side } from "@brot/sdk/read";

import { check } from "../devnet";
import { readInitParams } from "../deploy/initialize";
import { openMainnet } from "../deploy/mainnet-cluster";
import { initAndTeamInstructions, verifyInitialized } from "../deploy/mainnet-init";
import * as L from "../deploy/mainnet-loader";
import { readBinary } from "../deploy/mainnet-preflight";
import { readMultisig } from "../deploy/mainnet-squads";
import { joinAtEstimate } from "../validator/cycle-open";
import { writeThrowawayKeypair } from "../validator/keys";
import { forkSession, keysFolder, makeActors } from "./actors";
import { joinBoth, MIN_ENTRY, openTeamCampaign, resolveAndSettle } from "./cycle";
import { deployAtDeclaredId, deployWithCli } from "./deploy";
import { entryChecks, pureChecks } from "./entry-checks";
import { fund, startFork } from "./fork";
import { adminToUnlockedMultisig, pauseAndRefuse, resumeThrough } from "./incident";
import { createMultisig, execute, propose } from "./multisig";
import { paidOpening } from "./paid";
import { upgradeThroughMultisig } from "./upgrade";

/** 24 hours, the shortest public wait of the founder's decision (BP P4 §4.1: 24 to 48 hours). */
const LOCK = Number(process.env.MAINNET_REHEARSAL_LOCK ?? 86_400);
const MINT = address(process.env.MAINNET_REHEARSAL_MINT ?? "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm");
const PAID_MINT = address(process.env.MAINNET_REHEARSAL_PAID_MINT ?? "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263");
const PARAMS = "deploy/mainnet/init-params.mainnet.json";
let stepNumber = 0;
const step = (label: string) => console.log(`\n[${++stepNumber}] ${label}`);

const { values: o } = parseArgs({ options: { so: { type: "string" } } });

async function main() {
  const binary = readBinary(o.so ?? process.env.MAINNET_REHEARSAL_SO);
  const dir = keysFolder();
  const fork = await startFork();
  try {
    console.log(`surfpool ${fork.version} (sha256 ${fork.binarySha256})`);
    console.log(`binary ${binary.length} bytes, sha256 ${binary.sha256}; time lock ${LOCK} s`);
    const { rpc } = await openMainnet(fork.rpc.url, "mainnet-fork");
    const a = await makeActors(rpc, dir);
    const s = forkSession(rpc, a, fork.stop);

    step("the 2-of-3 Squads v4 multisig, made on the fork's real Squads program, with no time lock for the session");
    const ms = await createMultisig(rpc, a.members, 0);
    await fund(rpc, ms.vault, 50_000_000n);
    check((await readMultisig(rpc, ms.multisig)).timeLock === 0, "no time lock until the session's last act");

    step("the deploy script's guards, then its dry run and --execute refusals against the fork");
    await pureChecks();
    const throwawayProgram = join(dir, "not-the-declared-id.json");
    await writeThrowawayKeypair(throwawayProgram);
    const team = a.team.map((t) => t.address);
    const entry = { url: rpc.url, so: binary.path, sha256: binary.sha256, multisig: ms.multisig, team: team.join() };
    entryChecks({ ...entry, payer: a.keys.payer.path, hardware: a.keys.hardware.path, throwawayProgram });

    step("deploy from a buffer with the Solana CLI at a throwaway id, then the upgrade authority to the vault");
    await deployWithCli(rpc, a.keys, binary, ms.vault);

    step(`deploy at the declared id ${PROGRAM_ID} by the loader, then the upgrade authority to the vault`);
    await deployAtDeclaredId(rpc, a.keys, binary, ms.vault);

    step("initialize and set the team: one vault transaction, two approvals, executed through Squads");
    const plan = { vault: ms.vault, feeRecipient: ms.vault, team, params: readInitParams(PARAMS) };
    const init = await initAndTeamInstructions(plan);
    await execute(rpc, ms, await propose(rpc, ms, { vault: init }, "initialize and set the team"));
    await verifyInitialized(rpc, plan, PROGRAM_ID);

    step(`the time lock set to ${LOCK} s: the session's last act`);
    await execute(rpc, ms, await propose(rpc, ms, { timeLock: LOCK }, `set the time lock to ${LOCK} s`));
    check((await readMultisig(rpc, ms.multisig)).timeLock === LOCK, `the multisig's time lock is ${LOCK} s`);

    step("a paid opening at mainnet's real SOL/USD account (US$500 at the Pyth price), outside the team");
    await paidOpening(s, a.opener, PAID_MINT);

    step(`the first cycle: a team opening on a real mint (${MINT}), YES and NO at the minimum entry`);
    const { campaign } = await openTeamCampaign(s, MINT);
    await joinBoth(s, campaign, MINT, a.bakers[0], a.bakers[1]);

    step("the pause by one team key at once; the resume by the multisig, after the time lock");
    await pauseAndRefuse(s, a.team[1], a.bakers[2], campaign, MINT);
    await resumeThrough(s, ms, LOCK);
    await joinAtEstimate(s, a.bakers[2], campaign, MINT, Side.Yes, MIN_ENTRY);

    step("an upgrade through the multisig, refused until the time lock has run");
    await upgradeThroughMultisig(rpc, a.keys, binary, ms, LOCK);

    step("the deadline passes; NO; the six-hour window; payouts, Brot's fee, close and sweep to the vault");
    await resolveAndSettle(s, campaign, MINT, a.bakers, ms.vault);

    step("the deployed bytes, the authority and the config, read back once more");
    await L.checkProgram(rpc, PROGRAM_ID, { ...binary, authority: ms.vault });
    await verifyInitialized(rpc, plan, PROGRAM_ID);

    step("option B: admin in two steps to a second multisig of the same members, without a time lock");
    const fast = await adminToUnlockedMultisig(s, ms, LOCK);
    await verifyInitialized(rpc, { ...plan, admin: fast.vault }, PROGRAM_ID);
    const second = (await openTeamCampaign(s, MINT)).campaign;
    await pauseAndRefuse(s, a.team[2], a.bakers[0], second, MINT);
    await resumeThrough(s, fast, 0);
    await joinAtEstimate(s, a.bakers[0], second, MINT, Side.No, MIN_ENTRY);
    check((await L.readProgram(rpc, PROGRAM_ID)).authority === ms.vault, "the upgrade authority stays time-locked");
    console.log("\nrehearsal: every step behaved as the runbook expects");
  } finally {
    fork.stop();
  }
}

main().catch((error) => {
  console.error(`\nrehearsal FAILED: ${error instanceof Error ? error.message : error}`);
  process.exit(1);
});
