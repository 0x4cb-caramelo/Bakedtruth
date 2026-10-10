/**
 * Purpose: the deploy's preflight and bindings (Sprint 05 deploy review, F1, F4, F6, F7, F8, F9, F11), each
 *          refusal with its own case: a key file in any Git work tree or readable by others; a file that is not a
 *          keypair named, never quoted; the run bound to the reviewed commit and the binary to its printed hash;
 *          a checkout that lacks the commit, changed the program since, or holds uncommitted changes; each
 *          standing of the program id, its ProgramData and the config; the cluster names; the server guard; a
 *          URL printed as its origin. No cluster and no network: git runs on temporary repositories.
 * Version: 0.1.0
 * Sprint:  05 (SDK and the devnet cycle), lane OPS
 */
import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { checkCheckout, checkExpectedCommit, checkExpectedSha } from "../../scripts/deploy/binding";
import { parseCluster, refuseServer, shownUrl, standingProblem, type Standings } from "../../scripts/deploy/preflight";
import { checkKeyFile, readKeypairBytes } from "../../scripts/validator/keys";

// A marker standing for a secret pasted into a key file by mistake: it must never be printed back.
const SECRET = `never-print-me-${"q".repeat(40)}`;
const git = (dir: string, ...args: string[]) => spawnSync("git", ["-C", dir, ...args], { encoding: "utf8" });

function repo() {
  const dir = mkdtempSync(join(tmpdir(), "brot-git-test-"));
  git(dir, "init", "-q");
  for (const [k, v] of [
    ["user.email", "t@t"],
    ["user.name", "t"],
    ["commit.gpgsign", "false"],
  ])
    git(dir, "config", k, v);
  mkdirSync(join(dir, "programs/brot-markets/src"), { recursive: true });
  mkdirSync(join(dir, "programs/brot-markets/tests"));
  writeFileSync(join(dir, "programs/brot-markets/src/lib.rs"), "fn main() {}\n");
  writeFileSync(join(dir, "README.md"), "x\n");
  git(dir, "add", "-A");
  git(dir, "commit", "-qm", "program");
  return { dir, head: () => git(dir, "rev-parse", "HEAD").stdout.trim() };
}

describe("the deploy's preflight and bindings", () => {
  test("a key file: in no Git work tree, readable only by its owner, never quoted when it does not parse", () => {
    const { dir } = repo();
    writeFileSync(join(dir, "k.json"), "[]", { mode: 0o600 });
    expect(() => checkKeyFile(join(dir, "k.json"), "admin")).toThrow("inside a Git work tree");
    const outside = mkdtempSync(join(tmpdir(), "brot-key-test-"));
    writeFileSync(join(outside, "open.json"), "[]", { mode: 0o644 });
    expect(() => checkKeyFile(join(outside, "open.json"), "fee payer")).toThrow("chmod 600");
    writeFileSync(join(outside, "secret.json"), SECRET, { mode: 0o600 });
    const refusal = (() => {
      try {
        readKeypairBytes(join(outside, "secret.json"));
      } catch (error) {
        return (error as Error).message;
      }
    })();
    expect(refusal).toContain("is not a Solana CLI keypair file");
    expect(refusal).not.toContain(SECRET.slice(0, 12));
  });

  test("the run is the reviewed commit, the binary the hash the dry run printed", () => {
    const sha = "0123456789abcdef0123456789abcdef01234567";
    expect(() => checkExpectedCommit(undefined, sha)).toThrow("--expect-commit");
    expect(() => checkExpectedCommit("0123456", sha)).toThrow("at least 12");
    expect(() => checkExpectedCommit("fedcba987654", sha)).toThrow("not fedcba987654");
    expect(() => checkExpectedCommit("0123456789ab", sha)).not.toThrow();
    expect(() => checkExpectedSha(undefined, "ab".repeat(32))).toThrow("--expect-sha256");
    expect(() => checkExpectedSha("cd".repeat(32), "ab".repeat(32))).toThrow("not");
    expect(() => checkExpectedSha("AB".repeat(32), "ab".repeat(32))).not.toThrow();
  });

  test("the checkout holds the run's commit, the program unchanged since it, nothing uncommitted", () => {
    const r = repo();
    const built = r.head();
    expect(() => checkCheckout(r.dir, "f".repeat(40))).toThrow("is not in this checkout");
    writeFileSync(join(r.dir, "README.md"), "newer scripts\n");
    git(r.dir, "commit", "-qam", "scripts");
    expect(() => checkCheckout(r.dir, built)).not.toThrow();
    writeFileSync(join(r.dir, "README.md"), "dirty\n");
    expect(() => checkCheckout(r.dir, built)).toThrow("uncommitted");
    git(r.dir, "checkout", "-q", "README.md");
    // A change to the program's tests leaves the binary as it was; a change to its source does not.
    writeFileSync(join(r.dir, "programs/brot-markets/tests/t.rs"), "#[test] fn t() {}\n");
    git(r.dir, "add", "-A");
    git(r.dir, "commit", "-qm", "a test");
    expect(() => checkCheckout(r.dir, built)).not.toThrow();
    writeFileSync(join(r.dir, "programs/brot-markets/src/lib.rs"), "fn main() { changed }\n");
    git(r.dir, "commit", "-qam", "program change");
    expect(() => checkCheckout(r.dir, built)).toThrow("the program changed since");
    git(r.dir, "checkout", "-q", built);
    expect(() => checkCheckout(r.dir, r.head())).not.toThrow();
  });

  test("each standing of the program id, its ProgramData and the config", () => {
    const at = (program: Standings["program"], programData: Standings["programData"], config: Standings["config"]) =>
      ({ program, programData, config }) as Standings;
    expect(standingProblem(at("absent", "absent", "absent"), false)).toBeNull();
    expect(standingProblem(at("absent", "absent", "funded"), false)).toBeNull();
    expect(standingProblem(at("absent", "funded", "absent"), false)).toContain("can never be deployed");
    expect(standingProblem(at("funded", "absent", "absent"), false)).toContain("move the lamports out");
    expect(standingProblem(at("program", "other", "absent"), false)).toContain("--resume");
    expect(standingProblem(at("program", "other", "ours"), true)).toBeNull();
    expect(standingProblem(at("absent", "absent", "absent"), true)).toContain("nothing to resume");
    expect(standingProblem(at("program", "other", "other"), true)).toContain("not this program's");
    expect(standingProblem(at("absent", "absent", "ours"), false)).toContain("not deployed");
  });

  test("the cluster is local or devnet, the server is refused, a URL prints as its origin", () => {
    expect(parseCluster("devnet")).toBe("devnet");
    for (const name of ["mainnet", "testnet", "foo", undefined])
      expect(() => parseCluster(name)).toThrow("local or devnet");
    const server = mkdtempSync(join(tmpdir(), "brot-srv-test-"));
    expect(() => refuseServer([server])).toThrow("server");
    expect(() => refuseServer([join(server, "absent")])).not.toThrow();
    expect(shownUrl("https://rpc.example/v1/?api-key=SECRET")).toBe("https://rpc.example");
  });
});
