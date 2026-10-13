/**
 * Purpose: the mainnet deploy script's guards, rehearsed: its pure refusals (a cluster that is not mainnet-beta, a
 *          fork passed off as mainnet, a loopback RPC for a real run, a key file or an unreviewed device as the
 *          mainnet upgrade authority, a pair of multisigs other than the founder's), then
 *          scripts/deploy/mainnet-deploy.ts itself run against the fork: refused as `--cluster mainnet` and with one
 *          multisig named twice, a dry run that prints the plan and sends nothing, and `--execute` stopped before
 *          sending on a mistyped binary hash and on a program keypair that is not the declared id.
 * Version: 0.2.0 (two multisigs, M-1)
 * Sprint:  18 (mainnet), lane L18
 *
 * The real run's sending steps are not run from the script here: the declared id's keypair is not on this machine.
 * They run through the same builders in scripts/mainnet/deploy.ts.
 */
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

import { PROGRAM_ID } from "@brot/sdk/read";

import { GENESIS } from "../validator/clusters";
import { mainnetProblem, MAINNET_GENESIS } from "../deploy/mainnet-cluster";
import { pairProblem } from "../deploy/mainnet-preflight";
import { isHardwareUri, upgradeAuthority } from "../deploy/mainnet-signers";
import { UPGRADE_TIME_LOCK_SECONDS, type MultisigState } from "../deploy/mainnet-squads";

const ROOT = resolve(import.meta.dir, "../..");
const facts = (genesisHash: string, surfnet: string | null) => ({ genesisHash, surfnet, core: "test" });

function expectText(got: string | null | undefined, part: string, label: string) {
  if (!got?.includes(part)) throw new Error(`${label}: expected "${part}", got ${JSON.stringify(got)}`);
  const line = got.split("\n").find((l) => l.includes(part)) ?? got;
  console.log(`  refused as expected (${label}): ${line.trim()}`);
}

const refusal = (attempt: Promise<unknown>) =>
  attempt.then(
    () => null,
    (error: Error) => error.message,
  );

/** The cluster and signer rules, without a cluster. */
export async function pureChecks() {
  const real = "https://mainnet.example.org";
  expectText(mainnetProblem("mainnet", real, facts(GENESIS.devnet, null)), "not mainnet-beta", "devnet's genesis");
  expectText(mainnetProblem("mainnet", real, facts(MAINNET_GENESIS, "1.5.0")), "Surfpool fork", "a fork as mainnet");
  expectText(mainnetProblem("mainnet", "http://127.0.0.1:8899", facts(MAINNET_GENESIS, null)), "loopback", "loopback");
  expectText(mainnetProblem("mainnet-fork", real, facts(MAINNET_GENESIS, null)), "local Surfpool", "remote rehearsal");
  if (mainnetProblem("mainnet", real, facts(MAINNET_GENESIS, null)) !== null) throw new Error("mainnet itself refused");
  const pubkey = "11111111111111111111111111111111";
  const file = refusal(upgradeAuthority("mainnet", "/home/x/upgrade.json", pubkey, ROOT));
  expectText(await file, "hardware wallet", "a key file as the mainnet upgrade authority");
  const unreviewed = refusal(upgradeAuthority("mainnet", "usb://ledger?key=0", undefined, ROOT));
  expectText(await unreviewed, "--upgrade-authority-pubkey", "a device without its reviewed key");
  expectText(
    await refusal(upgradeAuthority("mainnet-fork", "usb://ledger", undefined, ROOT)),
    "throwaway",
    "a device on a fork",
  );
  const uris = ["usb://ledger", "usb://ledger?key=1", "usb://ledger?key=0/1"];
  if (!uris.every(isHardwareUri) || isHardwareUri("usb://ledger?key=0;rm") || isHardwareUri("/tmp/usb://ledger")) {
    throw new Error("the hardware URI rule accepts or refuses the wrong strings");
  }
  console.log("  hardware URIs: usb://ledger[?key=N[/M]] accepted; anything else refused");
  const members = ["11111111111111111111111111111111", PROGRAM_ID, MAINNET_GENESIS].map((key) => ({ key, mask: 7 }));
  const one = { configAuthority: pubkey, threshold: 2, timeLock: 0, transactionIndex: 0n, staleTransactionIndex: 0n };
  const ms = (timeLock: number, keys = members) => ({ ...one, timeLock, members: keys }) as unknown as MultisigState;
  const locked = ms(UPGRADE_TIME_LOCK_SECONDS);
  if (pairProblem(ms(0), ms(0)) !== null || pairProblem(locked, ms(0)) !== null) throw new Error("the pair refused");
  expectText(pairProblem(ms(0), ms(0, members.slice(1))), "same three members", "multisigs of other members");
  expectText(pairProblem(locked, ms(3_600)), "must have none", "an admin multisig with a lock");
  expectText(pairProblem(ms(3_600), ms(0)), "0 until step 9", "an upgrade lock other than 24 h");
}

/** Runs the deploy script with `args`, answering its prompts with `stdin`. */
function runDeploy(args: string[], stdin = "") {
  const ran = spawnSync(process.execPath, ["run", "scripts/deploy/mainnet-deploy.ts", ...args], {
    cwd: ROOT,
    input: stdin,
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  });
  return { status: ran.status, out: `${ran.stdout ?? ""}${ran.stderr ?? ""}` };
}

export type EntryArgs = { url: string; so: string; sha256: string; team: string; payer: string };
type Multisigs = { upgradeMultisig: string; adminMultisig: string };

/** The script against the fork, before anything is deployed at the declared id. */
export function entryChecks(a: EntryArgs & Multisigs & { hardware: string; throwawayProgram: string }) {
  const keys = ["--team", a.team, "--session-payer", a.payer, "--upgrade-authority", a.hardware];
  const twice = ["--upgrade-multisig", a.upgradeMultisig, "--admin-multisig", a.upgradeMultisig];
  const doubled = runDeploy(["--cluster", "mainnet-fork", "--url", a.url, "--so", a.so, ...twice, ...keys]);
  expectText(doubled.status === 0 ? "ran" : doubled.out, "named twice", "one multisig named twice");
  const pair = ["--upgrade-multisig", a.upgradeMultisig, "--admin-multisig", a.adminMultisig];
  const base = ["--url", a.url, "--so", a.so, ...pair, ...keys];
  const asMainnet = runDeploy(["--cluster", "mainnet", ...base]);
  if (asMainnet.status === 0) throw new Error("--cluster mainnet ran against a fork");
  expectText(asMainnet.out, "Surfpool fork", "the fork as --cluster mainnet");
  const dry = runDeploy(["--cluster", "mainnet-fork", ...base]);
  if (dry.status !== 0) throw new Error(`the dry run failed:\n${dry.out}`);
  for (const line of dry.out
    .split("\n")
    .filter((l) => /^(cluster|binary|program|upgrade multisig|admin multisig|plan|dry run)|needs/.test(l.trim()))) {
    console.log(`  | ${line.trim()}`);
  }
  const execute = [...base, "--cluster", "mainnet-fork", "--execute", "--program-keypair", a.throwawayProgram];
  const typo = runDeploy(execute, `${"0".repeat(64)}\n`);
  if (typo.status === 0) throw new Error("a mistyped hash did not stop --execute");
  expectText(typo.out, "not the typed hash", "--execute with a mistyped binary hash");
  const wrongId = runDeploy(execute, `${a.sha256}\n${PROGRAM_ID}\n`);
  if (wrongId.status === 0) throw new Error("a throwaway program keypair passed --execute");
  expectText(wrongId.out, "but the program declares", "--execute with a program keypair not at the declared id");
}
