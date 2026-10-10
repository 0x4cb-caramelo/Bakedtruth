/**
 * Purpose: the pure checks of the devnet deploy (scripts/deploy/checks.ts), each refusal with its own case:
 *          SHA256SUMS parsing, the artifact folder against its sums, the program keypair's location and
 *          address, and the deploy command held to `solana program deploy` on loader v3. No cluster, no build.
 * Version: 0.1.0
 * Sprint:  05 (SDK and the devnet cycle), lane OPS
 */
import { describe, expect, test } from "bun:test";
import { appendFileSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  assertLoaderV3Deploy,
  checkKeypairLocation,
  checkProgramAddress,
  deployArgv,
  parseSha256Sums,
  sha256File,
  verifyArtifactDir,
} from "../../scripts/deploy/checks";

const HASH = "a".repeat(64);
const DECLARED = "6G2d7Cv66MR1NayPabh5aL6ZThTx15WPxL3NU4N24uVN";

function artifact(files: Record<string, string>, sums?: string) {
  const dir = mkdtempSync(join(tmpdir(), "brot-artifact-test-"));
  for (const [name, content] of Object.entries(files)) writeFileSync(join(dir, name), content);
  const lines = Object.keys(files).map((name) => `${sha256File(join(dir, name))}  ${name}`);
  writeFileSync(join(dir, "SHA256SUMS"), sums ?? `${lines.join("\n")}\n`);
  return dir;
}

describe("deploy checks refuse what the procedure forbids", () => {
  test("SHA256SUMS: text and binary modes parse; malformed, duplicate and path lines are refused", () => {
    expect([...parseSha256Sums(`${HASH}  a.so\n${HASH} *b.json\n`)]).toEqual([
      ["a.so", HASH],
      ["b.json", HASH],
    ]);
    expect(() => parseSha256Sums("not a sum")).toThrow("malformed");
    expect(() => parseSha256Sums(`${HASH}  a.so\n${HASH}  a.so`)).toThrow("twice");
    expect(() => parseSha256Sums(`${HASH}  ../x.so`)).toThrow("path");
    expect(() => parseSha256Sums(`${HASH.slice(1)}  a.so`)).toThrow("malformed");
  });

  test("the artifact folder: exactly the two files, each matching its sum", () => {
    const good = { "brot_markets.so": "elf", "brot_markets.json": "{}" };
    expect(verifyArtifactDir(artifact(good)).soSha256).toBe(sha256File(join(artifact(good), "brot_markets.so")));
    const changed = artifact(good);
    appendFileSync(join(changed, "brot_markets.so"), "!");
    expect(() => verifyArtifactDir(changed)).toThrow("SHA256SUMS says");
    expect(() => verifyArtifactDir(artifact({ "brot_markets.so": "elf" }))).toThrow("expected");
    const extra = artifact(good);
    writeFileSync(join(extra, "evil.so"), "x");
    expect(() => verifyArtifactDir(extra)).toThrow("holds");
    const noSums = mkdtempSync(join(tmpdir(), "brot-artifact-test-"));
    expect(() => verifyArtifactDir(noSums)).toThrow("no SHA256SUMS");
  });

  test("the program keypair comes from outside the repository, never target/deploy, and is the declared id", () => {
    const root = mkdtempSync(join(tmpdir(), "brot-repo-test-"));
    mkdirSync(join(root, "target", "deploy"), { recursive: true });
    mkdirSync(join(root, "keys"));
    mkdirSync(join(root, "..keys"));
    const outside = mkdtempSync(join(tmpdir(), "brot-backup-test-"));
    const files = ["target/deploy/k.json", "keys/k.json", "..keys/k.json"].map((f) => join(root, f));
    for (const path of [...files, join(outside, "k.json")]) writeFileSync(path, "[]", { mode: 0o600 });
    expect(() => checkKeypairLocation(join(root, "target/deploy/k.json"), root)).toThrow("target/deploy");
    expect(() => checkKeypairLocation(join(root, "keys/k.json"), root)).toThrow("inside the repository");
    // A folder named `..keys` is inside the repository, though its relative path starts with two dots.
    expect(() => checkKeypairLocation(join(root, "..keys/k.json"), root)).toThrow("inside the repository");
    expect(() => checkKeypairLocation(join(outside, "missing.json"), root)).toThrow("does not exist");
    expect(checkKeypairLocation(join(outside, "k.json"), root)).toContain("brot-backup-test-");
    // The upgrade authority, the fee payer and the admin are held to the same rule, named in the refusal.
    expect(() => checkKeypairLocation(join(root, "keys/k.json"), root, "upgrade authority")).toThrow(
      "refusing the upgrade authority inside the repository",
    );
    expect(() => checkProgramAddress("4JH2yMHRiwYzedAYbhpxeBTGS8EgrDPXpFaB4yXSAZ7q", DECLARED)).toThrow("refusing");
    expect(() => checkProgramAddress(DECLARED, DECLARED)).not.toThrow();
  });

  test("the deploy command: loader v3, every key and the RPC explicit, never --final or program-v4", () => {
    const argv = deployArgv(
      { so: "p.so", programKeypair: "id.json", upgradeAuthority: "ua.json", feePayer: "fp.json" },
      "u",
    );
    expect(argv.slice(0, 4)).toEqual(["solana", "program", "deploy", "p.so"]);
    for (const flag of ["--program-id", "--upgrade-authority", "--fee-payer", "--keypair", "--url"]) {
      expect(argv).toContain(flag);
    }
    expect(() => assertLoaderV3Deploy([...argv, "--final"])).toThrow("--final");
    expect(() => assertLoaderV3Deploy(["solana", "program-v4", "deploy", "p.so"])).toThrow("loader v3");
    expect(() => assertLoaderV3Deploy(argv.filter((a) => a !== "--url"))).toThrow("--url");
  });
});
