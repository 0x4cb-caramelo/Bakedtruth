/**
 * Purpose: the mainnet runbook (deploy/mainnet/README.md) rehearsed end to end on a Surfpool fork of mainnet-beta,
 *          with the `mainnet` feature binary and throwaway keys, never touching mainnet itself, on the path the founder
 *          chose on 2026-10-13 (M-1 to M-4): two 2-of-3 Squads v4 multisigs of the same members, made on the fork's
 *          real Squads program; the deploy script's guards; the deploy from a buffer by the stand-in for Ronaldo's
 *          hardware wallet and the upgrade authority handed to the upgrade multisig; the initialization, the team and
 *          `admin` in two steps to the admin multisig; the upgrade multisig locked 24 h; the first cycle with a paid
 *          opening at the real SOL/USD price beside a team opening, 0.01 SOL entries on both; the pause, and the
 *          resume at once by the admin multisig; an upgrade refused until the lock has run; NO after the deadline, the
 *          six-hour window, every payout and the sweep to the admin multisig; the deployed bytes equal to the build.
 *          Exits 0 only if every step behaves as the runbook expects.
 * Version: 0.2.0 (the founder's path: two multisigs, 24 h, a paid opening in the first cycle)
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
import { acceptInstructions, initInstructions, verifyInitialized } from "../deploy/mainnet-init";
import * as L from "../deploy/mainnet-loader";
import { readBinary } from "../deploy/mainnet-preflight";
import { readMultisig, UPGRADE_TIME_LOCK_SECONDS as LOCK } from "../deploy/mainnet-squads";
import { joinAtEstimate } from "../validator/cycle-open";
import { writeThrowawayKeypair } from "../validator/keys";
import { forkSession, keysFolder, makeActors } from "./actors";
import { joinBoth, MIN_ENTRY, openTeamCampaign, resolveNo } from "./cycle";
import { deployAtDeclaredId, deployWithCli } from "./deploy";
import { entryChecks, pureChecks } from "./entry-checks";
import { fund, startFork } from "./fork";
import { pauseAndRefuse, resumeThrough } from "./incident";
import { createMultisig, execute, propose } from "./multisig";
import { paidOpening } from "./paid";
import { settleCampaign } from "./settle";
import { upgradeThroughMultisig } from "./upgrade";

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
    console.log(`binary ${binary.length} bytes, sha256 ${binary.sha256}; upgrade lock ${LOCK} s`);
    const { rpc } = await openMainnet(fork.rpc.url, "mainnet-fork");
    const a = await makeActors(rpc, dir);
    const s = forkSession(rpc, a, fork.stop);

    step("two 2-of-3 Squads v4 multisigs of the same members (upgrade, admin), unlocked for the session");
    const upgrade = await createMultisig(rpc, a.members, 0);
    const admin = await createMultisig(rpc, a.members, 0);
    await fund(rpc, upgrade.vault, 50_000_000n);

    step("the deploy script's guards, then its dry run and --execute refusals against the fork");
    await pureChecks();
    const throwawayProgram = join(dir, "not-the-declared-id.json");
    await writeThrowawayKeypair(throwawayProgram);
    const team = a.team.map((t) => t.address);
    const pair = { upgradeMultisig: upgrade.multisig, adminMultisig: admin.multisig };
    const entry = { url: rpc.url, so: binary.path, sha256: binary.sha256, team: team.join(), ...pair };
    entryChecks({ ...entry, payer: a.keys.payer.path, hardware: a.keys.hardware.path, throwawayProgram });

    step("deploy from a buffer with the Solana CLI at a throwaway id, then the upgrade authority to the upgrade vault");
    await deployWithCli(rpc, a.keys, binary, upgrade.vault);

    step(`deploy at the declared id ${PROGRAM_ID} by the loader, then the upgrade authority to the upgrade vault`);
    await deployAtDeclaredId(rpc, a.keys, binary, upgrade.vault);

    step("7a, the upgrade multisig initializes, sets the team and names the admin vault; 7b, the admin vault accepts");
    const plan = { upgradeVault: upgrade.vault, adminVault: admin.vault, team, params: readInitParams(PARAMS) };
    await execute(rpc, upgrade, await propose(rpc, upgrade, { vault: await initInstructions(plan) }, "7a"));
    check((await s.config()).pendingAdmin === admin.vault, "7a: initialized with its team, the admin vault pending");
    await execute(rpc, admin, await propose(rpc, admin, { vault: await acceptInstructions(plan) }, "7b"));
    await verifyInitialized(rpc, plan, PROGRAM_ID);

    step(`9, the upgrade multisig locked ${LOCK} s, the session's last act; the admin multisig never locked`);
    await execute(rpc, upgrade, await propose(rpc, upgrade, { timeLock: LOCK }, `set the time lock to ${LOCK} s`));
    const locks = [
      (await readMultisig(rpc, upgrade.multisig)).timeLock,
      (await readMultisig(rpc, admin.multisig)).timeLock,
    ];
    check(locks[0] === LOCK && locks[1] === 0, `locks: upgrade ${locks[0]} s, admin ${locks[1]} s`);

    step("the first cycle: a paid opening at mainnet's real SOL/USD (US$500) and a team opening, YES and NO on both");
    const paid = await paidOpening(s, a.opener, PAID_MINT);
    const free = (await openTeamCampaign(s, MINT)).campaign;
    await joinBoth(s, paid, PAID_MINT, a.bakers[0], a.bakers[1]);
    await joinBoth(s, free, MINT, a.bakers[0], a.bakers[1]);

    step("the pause by one team key at once; the resume by the admin multisig in the same minute");
    await pauseAndRefuse(s, a.team[1], a.bakers[2], free, MINT);
    await resumeThrough(s, admin);
    await joinAtEstimate(s, a.bakers[2], free, MINT, Side.Yes, MIN_ENTRY);

    step("an upgrade through the upgrade multisig, refused until its 24 h lock has run");
    await upgradeThroughMultisig(rpc, a.keys, binary, upgrade, LOCK);

    step("the paid campaign: NO after the deadline, the six-hour window, payouts, the 1%, fees to the admin vault");
    await resolveNo(s, paid, PAID_MINT, a.bakers.slice(0, 2));
    await settleCampaign(s, paid, a.bakers.slice(0, 2), admin.vault);

    step("the team campaign: the same, its three bakers, no prize and no creator share");
    await resolveNo(s, free, MINT, a.bakers);
    await settleCampaign(s, free, a.bakers, admin.vault);

    step("the deployed bytes, the authorities and the config, read back once more");
    await L.checkProgram(rpc, PROGRAM_ID, { ...binary, authority: upgrade.vault });
    await verifyInitialized(rpc, plan, PROGRAM_ID);
    console.log("\nrehearsal: every step behaved as the runbook expects");
  } finally {
    fork.stop();
  }
}

main().catch((error) => {
  console.error(`\nrehearsal FAILED: ${error instanceof Error ? error.message : error}`);
  process.exit(1);
});
