/**
 * Purpose: proves the folders CI publishes are what the deploy scripts read (Sprint 16): `programs/` passes
 *          verifyArtifactDir of scripts/deploy/checks.ts, the devnet deploy's own check, and `programs-mainnet/`
 *          holds exactly brot_markets.mainnet.so and brot_markets.mainnet.json, both listed in its SHA256SUMS.
 * Version: 0.1.0
 * Sprint:  16 (hardening)
 *
 * `bun scripts/ci/artifact-layout.ts <folder written by scripts/ci/assemble-artifacts.sh>`. The Program job runs it
 * on its tested binaries, laid out by the same script the publishing job uses.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { parseSha256Sums, sha256File, verifyArtifactDir } from "../deploy/checks";

export const MAINNET_FILES = ["brot_markets.mainnet.json", "brot_markets.mainnet.so"] as const;

/** The mainnet folder holds its two files and a SHA256SUMS that lists exactly them, each hashing to its line. */
export function verifyMainnetDir(dir: string): string {
  const sumsPath = join(dir, "SHA256SUMS");
  if (!existsSync(sumsPath)) throw new Error(`${dir} has no SHA256SUMS`);
  const sums = parseSha256Sums(readFileSync(sumsPath, "utf8"));
  const expected = JSON.stringify([...MAINNET_FILES]);
  if (JSON.stringify([...sums.keys()].sort()) !== expected) throw new Error(`${dir}: SHA256SUMS lists other files`);
  const present = readdirSync(dir).filter((name) => name !== "SHA256SUMS");
  if (JSON.stringify(present.sort()) !== expected) throw new Error(`${dir} holds ${present.join(", ")}`);
  for (const [name, sha] of sums) {
    if (sha256File(join(dir, name)) !== sha) throw new Error(`${dir}/${name} does not match SHA256SUMS`);
  }
  return sums.get("brot_markets.mainnet.so")!;
}

if (import.meta.main) {
  const root = process.argv[2];
  if (!root) {
    console.error("usage: bun scripts/ci/artifact-layout.ts <folder with programs/ and programs-mainnet/>");
    process.exit(2);
  }
  try {
    const devnet = verifyArtifactDir(join(root, "programs"));
    const mainnet = verifyMainnetDir(join(root, "programs-mainnet"));
    console.log(`programs/ passes scripts/deploy/checks.ts: brot_markets.so ${devnet.soSha256}`);
    console.log(`programs-mainnet/ holds exactly its two files: brot_markets.mainnet.so ${mainnet}`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
