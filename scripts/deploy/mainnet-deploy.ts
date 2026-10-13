/**
 * Purpose: the mainnet deploy of brot-markets (deploy/mainnet/README.md, steps 4 to 9), checking the cluster first:
 *          the RPC must be mainnet-beta by its genesis hash (or, for the rehearsal, a local Surfpool fork of it). A
 *          dry run by default: it reads the binary, the program id's standing, the two Squads multisigs the founder
 *          chose (M-1, 2026-10-13) and the balances, prints every command and the multisigs' proposals, and sends
 *          nothing. `--execute` asks the operator to type the reviewed binary's SHA-256 and the program id, refuses on
 *          any difference, checks the device holds the reviewed key, then writes the buffer, hands it to the hardware
 *          upgrade authority, deploys from it, and hands the upgrade authority to the upgrade multisig's vault.
 * Version: 0.2.0 (two multisigs: `--upgrade-multisig`, locked 24 h at step 9; `--admin-multisig`, never locked)
 * Sprint:  18 (mainnet), lane L18
 *
 * It never reads a key file for the upgrade authority on mainnet (a `usb://ledger` URI only) and never initializes
 * the program itself: the multisigs do (scripts/deploy/mainnet-init.ts). `--verify-init` checks that result.
 */
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { parseArgs } from "node:util";

import { address } from "@solana/kit";

import { PROGRAM_ID } from "@brot/sdk/read";

import { writeThrowawayKeypair } from "../validator/keys";
import { readInitParams, parseTeam } from "./initialize";
import { openMainnet, originOf, parseMainnetMode } from "./mainnet-cluster";
import { printMultisigSteps, verifyInitialized, type InitPlan } from "./mainnet-init";
import * as L from "./mainnet-loader";
import { checkFunds, checkMultisigs, checkProgramId, readBinary } from "./mainnet-preflight";
import { confirmDevice, programKeypair, sessionPayer, upgradeAuthority } from "./mainnet-signers";
import { checkSolanaCli, refuseServer } from "./preflight";

const { values: o } = parseArgs({
  options: {
    cluster: { type: "string" },
    url: { type: "string" },
    so: { type: "string" },
    "upgrade-multisig": { type: "string" },
    "admin-multisig": { type: "string" },
    team: { type: "string" },
    params: { type: "string", default: "deploy/mainnet/init-params.mainnet.json" },
    "upgrade-authority": { type: "string" },
    "upgrade-authority-pubkey": { type: "string" },
    "session-payer": { type: "string" },
    "program-keypair": { type: "string" },
    resume: { type: "boolean", default: false },
    execute: { type: "boolean", default: false },
    "verify-init": { type: "boolean", default: false },
  },
});

const ROOT = resolve(import.meta.dir, "../..");
const need = (name: keyof typeof o) => {
  const value = o[name];
  if (typeof value !== "string" || value === "") throw new Error(`--${name} is required`);
  return value;
};

/** The typed answers that bind `--execute` to what was reviewed; nothing is sent before both match. */
async function typedBinding(sha256: string) {
  // Lines are read from one iterator, so piped answers are never dropped, and an input that ends early is an error
  // (readline's `question` would wait forever on a closed stream and let the process exit 0 having done nothing).
  const input = createInterface({ input: process.stdin });
  const lines = input[Symbol.asyncIterator]();
  const ask = async (question: string) => {
    process.stdout.write(question);
    const next = await lines.next();
    if (!process.stdin.isTTY) process.stdout.write("\n");
    if (next.done) throw new Error("the input ended before an answer: stopped, nothing sent");
    return String(next.value).trim();
  };
  try {
    const hash = await ask("Type the SHA-256 of the reviewed binary (from the audit and CI): ");
    if (hash.toLowerCase() !== sha256)
      throw new Error(`the binary is ${sha256}, not the typed hash: stopped, nothing sent`);
    const id = await ask("Type the mainnet program id: ");
    if (id !== PROGRAM_ID) throw new Error("the typed id is not the program's declared id: stopped, nothing sent");
  } finally {
    input.close();
  }
}

async function main() {
  console.log(checkSolanaCli());
  refuseServer();
  const mode = parseMainnetMode(o.cluster);
  const url = need("url");
  const { rpc } = await openMainnet(url, mode);
  const team = parseTeam(need("team"));
  if (team.length < 1 || team.length > 5) throw new Error("--team takes one to five public keys");
  const params = readInitParams(o.params!);
  const multisigs = await checkMultisigs(rpc, address(need("upgrade-multisig")), address(need("admin-multisig")));
  const { upgrade, admin } = multisigs;
  const plan: InitPlan = { upgradeVault: upgrade.vault, adminVault: admin.vault, team, params };
  if (o["verify-init"]) {
    await verifyInitialized(rpc, plan, PROGRAM_ID);
    const locked = upgrade.state.timeLock > 0;
    console.log(`  the upgrade multisig's lock: ${upgrade.state.timeLock} s${locked ? "" : " (step 9 still to do)"}`);
    return console.log("step 7 verified: initialized by the two multisigs as planned");
  }
  const binary = readBinary(o.so);
  console.log(`binary ${binary.path}: ${binary.length} bytes, sha256 ${binary.sha256}`);
  await checkProgramId(rpc, o.resume);
  const authority = await upgradeAuthority(mode, o["upgrade-authority"], o["upgrade-authority-pubkey"], ROOT);
  const payer = await sessionPayer(o["session-payer"], ROOT);
  const vault = upgrade.vault;
  await checkFunds(rpc, { payer: payer.address, vault, elfLength: binary.length, deploying: !o.resume });
  console.log(`plan on ${mode} (${originOf(url)}), upgrade authority ${authority.address} (${authority.kind}):`);
  console.log("  4. write the buffer (session payer), hand it to the upgrade authority, check its bytes");
  console.log("  5. deploy from the buffer (loader v3), check the program's bytes and authority");
  console.log(`  6. hand the upgrade authority to the upgrade multisig's vault ${vault}, check it`);
  await printMultisigSteps(upgrade.multisig, admin.multisig, plan);
  if (!o.execute) {
    return console.log(
      "\ndry run: nothing was sent. To run it: the same command with --execute --program-keypair <backup>",
    );
  }
  await typedBinding(binary.sha256);
  const program = o.resume ? null : await programKeypair(o["program-keypair"], ROOT);
  confirmDevice(authority);
  const common = { payer: payer.uri, url };
  const want = { sha256: binary.sha256, length: binary.length };
  if (program) {
    const bufferKeypair = join(mkdtempSync(join(tmpdir(), "brot-mainnet-buffer-")), "buffer.json");
    const buffer = (await writeThrowawayKeypair(bufferKeypair)).address;
    L.runStep(L.writeBufferStep({ ...common, so: binary.path, bufferKeypair }), url);
    L.runStep(L.setBufferAuthorityStep({ ...common, buffer, newAuthority: authority.address }), url);
    await L.checkBuffer(rpc, buffer, { ...want, authority: authority.address });
    const deploy = { ...common, buffer, programKeypair: program.uri, upgradeAuthority: authority.uri };
    L.runStep(L.deployFromBufferStep(deploy), url);
    await L.checkProgram(rpc, PROGRAM_ID, { ...want, authority: authority.address });
  }
  const current = (await L.readProgram(rpc, PROGRAM_ID)).authority;
  if (current === authority.address) {
    const handover = { ...common, program: PROGRAM_ID, upgradeAuthority: authority.uri, newAuthority: vault };
    L.runStep(L.setUpgradeAuthorityStep(handover), url);
  } else if (current !== vault) {
    throw new Error(
      `the upgrade authority is ${current}: neither the device's nor the vault's; stop (README, "Abort points")`,
    );
  }
  await L.checkProgram(rpc, PROGRAM_ID, { ...want, authority: vault });
  console.log("\nsteps 4 to 6 done. Step 7: each multisig proposes, approves and executes its message above (7a, then");
  console.log("7b); then run this command with --verify-init instead of --execute; step 8; step 9, the lock.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
