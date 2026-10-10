/**
 * Purpose: what binds a deploy to what was reviewed (Sprint 05 deploy review, F1). The CI run built the commit
 *          the operator names (`--expect-commit`); this checkout contains that commit, with the program, its build
 *          inputs and its IDL unchanged since it, and no uncommitted change to a tracked file, so the SDK encoding
 *          the initialization speaks the binary's interface; the artifact's IDL is byte for byte the checkout's;
 *          and `--execute` names the binary's SHA-256 the dry run printed (`--expect-sha256`).
 * Version: 0.1.0
 * Sprint:  05 (SDK and the devnet cycle), lane OPS
 *
 * The checkout may be newer than the run's commit (the deploy scripts can be newer than the program), never
 * different in what makes the binary: a deploy after Sprint 04's merge alone carries the program Sprint 05 tested.
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * What defines the binary and its interface: none of it may differ between the run's commit and the checkout.
 * The program's tests (programs/brot-markets/tests) and the test-only cpi-proxy are not in the binary.
 */
export const PROGRAM_PATHS = [
  "programs/brot-markets/src",
  "programs/brot-markets/Cargo.toml",
  "Cargo.lock",
  "Cargo.toml",
  "rust-toolchain.toml",
  ".cargo",
  "packages/sdk/src/idl/brot_markets.json",
];

const git = (root: string, args: string[]) => spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });

/** `expected` names the run's `headSha`: at least 12 hex characters, a prefix of it. */
export function checkExpectedCommit(expected: string | undefined, headSha: string): void {
  if (!expected || !/^[0-9a-f]{12,40}$/.test(expected)) {
    throw new Error(
      `--expect-commit takes the reviewed commit (at least 12 hex characters); this run built ${headSha}`,
    );
  }
  if (!headSha.startsWith(expected)) throw new Error(`the run built ${headSha}, not ${expected}: refusing`);
}

/** This checkout holds `headSha`, the program unchanged since it, and no uncommitted change to a tracked file. */
export function checkCheckout(root: string, headSha: string): void {
  if (git(root, ["cat-file", "-e", `${headSha}^{commit}`]).status !== 0) {
    throw new Error(`${headSha} is not in this checkout: git fetch origin main first`);
  }
  if (git(root, ["merge-base", "--is-ancestor", headSha, "HEAD"]).status !== 0) {
    throw new Error(`this checkout does not contain ${headSha}: check out main at or after it`);
  }
  const changed = git(root, ["diff", "--name-only", headSha, "HEAD", "--", ...PROGRAM_PATHS]).stdout.trim();
  if (changed) throw new Error(`the program changed since ${headSha.slice(0, 12)}: ${changed.split("\n").join(", ")}`);
  const dirty = git(root, ["status", "--porcelain", "--untracked-files=no"]).stdout.trim();
  if (dirty)
    throw new Error(`uncommitted changes to ${dirty.split("\n").length} tracked file(s): commit or stash them`);
}

/** The artifact's IDL is byte for byte the checkout's: the SDK encodes what the binary decodes. */
export function checkIdl(root: string, artifactIdl: string): void {
  const local = readFileSync(join(root, "packages/sdk/src/idl/brot_markets.json"));
  if (!local.equals(readFileSync(artifactIdl))) {
    throw new Error("the artifact's IDL differs from this checkout's: the SDK would encode another interface");
  }
}

/** `--execute` names the binary's SHA-256, the one the dry run printed. */
export function checkExpectedSha(expected: string | undefined, soSha256: string): void {
  if (!expected) throw new Error(`--execute needs --expect-sha256 ${soSha256}, the binary the dry run showed`);
  if (expected.toLowerCase() !== soSha256) throw new Error(`the artifact's binary is ${soSha256}, not ${expected}`);
}
