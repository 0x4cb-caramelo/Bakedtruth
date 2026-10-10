/**
 * Purpose: the pure checks of the devnet deploy (TP §10, §12; Sprint 05 DoD "Deploy from CI's artifact"):
 *          the artifact's SHA256SUMS parsed and every file checked against it, the program keypair taken
 *          only from outside the repository (never target/deploy/) and only when its address is the
 *          program's declared id, and the deploy command held to the upgradeable loader v3.
 * Version: 0.1.1 (the deploy re-signs unconfirmed buffer writes for 50 rounds, with a small priority fee)
 * Sprint:  05 (SDK and the devnet cycle), lane OPS
 *
 * Why the address check: the program derives its event authority from its declared id (`crate::ID`), so a
 * binary deployed at any other address fails every instruction at its event. Why loader v3: the program's
 * `admin_initialize_config` reads the upgrade authority from the loader-v3 ProgramData account; a loader-v4
 * or `--final` deploy can never be initialised. tests/ops/deploy-checks.test.ts tests each refusal.
 */
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, realpathSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";

import { checkKeyFile } from "../validator/keys";

/** The files CI's `programs-<sha>` artifact holds besides SHA256SUMS (.github/workflows/ci.yml). */
export const ARTIFACT_FILES = ["brot_markets.so", "brot_markets.json"] as const;

/** `sha256sum` output: one `<64 hex>  <name>` per line (`*name` in binary mode). Refuses anything else. */
export function parseSha256Sums(text: string): Map<string, string> {
  const sums = new Map<string, string>();
  for (const line of text.split("\n").filter((l) => l.trim() !== "")) {
    const match = /^([0-9a-f]{64}) [ *](.+)$/.exec(line);
    if (!match) throw new Error(`SHA256SUMS: malformed line ${JSON.stringify(line)}`);
    const name = match[2];
    if (name.includes("/") || name.includes("\\") || name === "." || name === "..") {
      throw new Error(`SHA256SUMS: refusing a path, not a file name: ${name}`);
    }
    if (sums.has(name)) throw new Error(`SHA256SUMS: ${name} listed twice`);
    sums.set(name, match[1]);
  }
  return sums;
}

export const sha256File = (path: string) => createHash("sha256").update(readFileSync(path)).digest("hex");

/**
 * The artifact folder is exactly what CI published: SHA256SUMS lists the two expected files and nothing else,
 * the folder holds nothing it does not list, and every file hashes to its line. Returns the binary's hash.
 */
export function verifyArtifactDir(dir: string): { soPath: string; idlPath: string; soSha256: string } {
  const sumsPath = resolve(dir, "SHA256SUMS");
  if (!existsSync(sumsPath)) throw new Error(`${dir} has no SHA256SUMS`);
  const sums = parseSha256Sums(readFileSync(sumsPath, "utf8"));
  const listed = [...sums.keys()].sort();
  if (JSON.stringify(listed) !== JSON.stringify([...ARTIFACT_FILES].sort())) {
    throw new Error(`SHA256SUMS lists ${listed.join(", ")}; expected ${ARTIFACT_FILES.join(", ")}`);
  }
  const present = readdirSync(dir)
    .filter((f) => f !== "SHA256SUMS")
    .sort();
  if (JSON.stringify(present) !== JSON.stringify(listed)) {
    throw new Error(`the artifact holds ${present.join(", ")}; SHA256SUMS lists ${listed.join(", ")}`);
  }
  for (const [name, expected] of sums) {
    const actual = sha256File(resolve(dir, name));
    if (actual !== expected) throw new Error(`${name}: sha256 ${actual}, SHA256SUMS says ${expected}`);
  }
  const soPath = resolve(dir, "brot_markets.so");
  return { soPath, idlPath: resolve(dir, "brot_markets.json"), soSha256: sums.get("brot_markets.so")! };
}

/** The program id the artifact's IDL declares (Shank writes it from `declare_id!`). */
export function idlAddress(idlPath: string): string {
  const idl = JSON.parse(readFileSync(idlPath, "utf8")) as { metadata?: { address?: string } };
  if (!idl.metadata?.address) throw new Error(`${idlPath} has no metadata.address`);
  return idl.metadata.address;
}

/** True when `child` is `parent` or inside it; `<parent>/..keys` is inside, `<parent>/../keys` is not. */
export function within(parent: string, child: string): boolean {
  const rel = relative(parent, child);
  return !(rel === ".." || rel.startsWith(`..${sep}`) || isAbsolute(rel));
}

/**
 * A key file must be an existing file outside the repository working tree, so it is never committed. The
 * program keypair, besides, comes from its backup, never the throwaway `target/deploy/brot_markets-keypair.json`
 * cargo-build-sbf writes. `label` names the key in the refusal (the upgrade authority, the fee payer, the admin).
 * Then the checks every key file gets (scripts/validator/keys.ts): in no Git work tree, readable only by its owner.
 */
export function checkKeypairLocation(path: string, repoRoot: string, label = "program keypair"): string {
  if (!existsSync(path)) throw new Error(`${label} ${path} does not exist`);
  const real = realpathSync(path);
  const root = realpathSync(repoRoot);
  if (real.split(sep).join("/").includes("/target/deploy/")) {
    throw new Error(`refusing the ${label} under target/deploy/ (${real}): use the backup`);
  }
  if (within(root, real))
    throw new Error(`refusing the ${label} inside the repository (${real}): keep keys outside it`);
  return checkKeyFile(real, label);
}

/** The keypair's address must be the declared id; any other id breaks every instruction at its event. */
export function checkProgramAddress(keypairAddress: string, declaredId: string): void {
  if (keypairAddress !== declaredId) {
    throw new Error(`the program keypair is ${keypairAddress}, but the program declares ${declaredId}: refusing`);
  }
}

export type DeployPaths = { so: string; programKeypair: string; upgradeAuthority: string; feePayer: string };

/**
 * Rounds of re-signing the buffer writes still unconfirmed when a blockhash expires (the CLI's default is 5), and
 * a small priority fee in micro-lamports per compute unit. The first devnet deploy (2026-10-09) died with "Data
 * writes to account failed: Max retries exceeded" on the public RPC after the default 5 rounds.
 */
export const DEPLOY_SIGN_ATTEMPTS = "50";
export const DEPLOY_CU_PRICE = "10000";

/** `solana program deploy` with the upgradeable loader (v3), every key and the RPC named explicitly. */
export function deployArgv(paths: DeployPaths, url: string): string[] {
  const argv = ["solana", "program", "deploy", paths.so, "--program-id", paths.programKeypair];
  argv.push("--upgrade-authority", paths.upgradeAuthority, "--fee-payer", paths.feePayer, "--keypair", paths.feePayer);
  argv.push("--url", url, "--commitment", "confirmed", "--use-rpc");
  argv.push("--max-sign-attempts", DEPLOY_SIGN_ATTEMPTS, "--with-compute-unit-price", DEPLOY_CU_PRICE);
  assertLoaderV3Deploy(argv);
  return argv;
}

/** Refuses any deploy command that is not a plain loader-v3 `solana program deploy` with an explicit RPC. */
export function assertLoaderV3Deploy(argv: string[]): void {
  if (argv.slice(0, 3).join(" ") !== "solana program deploy")
    throw new Error("only `solana program deploy` (loader v3)");
  if (argv.some((a) => a === "program-v4" || a.startsWith("--loader") || a === "--final")) {
    throw new Error("refusing loader v4 and --final: admin_initialize_config needs a loader-v3 upgrade authority");
  }
  for (const flag of ["--url", "--program-id", "--upgrade-authority", "--fee-payer", "--keypair"]) {
    if (!argv.includes(flag)) throw new Error(`the deploy command must pass ${flag} explicitly`);
  }
}
