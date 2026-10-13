/**
 * Purpose: the referral commands (scripts/referral/; Sprint 14, lane L14R) on real files, no cluster: a dry run
 *          writes nothing; prepare writes the ledger, the signing file (executable, never overwritten) and its
 *          summary; record prints each landed transfer with its signature and cancels on request; report prints
 *          wallets and amounts; the snapshot copies the ledger into a new file that opens as a ledger; the flags and
 *          the RPC's environment; and a failing RPC call ends the process with its error's name, never its URL.
 *          Filter: `bun test services/indexer -t referral`.
 * Version: 0.1.0
 * Sprint:  14 (referral, lane L14R)
 */
import { describe, expect, test } from "bun:test";
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { opsOf, parseFlags, rpcFromEnv } from "../../../scripts/referral/common";
import { prepareCommand } from "../../../scripts/referral/prepare";
import { recordCommand } from "../../../scripts/referral/record";
import { reportCommand } from "../../../scripts/referral/report";
import { snapshotLedger } from "../../../scripts/referral/snapshot";
import { openLedger } from "../src/referral/ledger";
import { wallet } from "./referral-chain";
import { earnings, OPS, OpsWallet, routineRpc } from "./referral-ops";

const [F, F2] = [wallet(2), wallet(6)];
const ROOT = join(import.meta.dir, "../../..");

async function filesWithEarnings() {
  const dir = mkdtempSync(join(tmpdir(), "brot-referral-commands-"));
  const at = (name: string) => join(dir, name);
  (await earnings(at("indexer.sqlite"))).indexer.close();
  return { at, base: ["--indexer", at("indexer.sqlite"), "--ledger", at("ledger.sqlite"), "--ops", OPS], dir };
}

describe("referral commands", () => {
  test("prepare, record and report on files; a dry run writes nothing; the snapshot opens as a ledger", async () => {
    const { at, base, dir } = await filesWithEarnings();
    try {
      const ops = new OpsWallet();
      const rpc = () => routineRpc(ops);
      const dry = await prepareCommand([...base, "--dry-run", "--new-ledger"], {}, rpc);
      expect(dry).toContain("(dry run: nothing written)");
      expect(existsSync(at("ledger.sqlite"))).toBe(false);
      await expect(prepareCommand([...base, "--out", at("out")], {}, rpc)).rejects.toThrow("--new-ledger starts one");
      const out = await prepareCommand([...base, "--out", at("out"), "--new-ledger"], {}, rpc);
      await expect(prepareCommand([...base, "--out", at("out"), "--new-ledger"], {}, rpc)).rejects.toThrow(
        "the ledger exists",
      );
      expect(out).toContain(`Written: ${at("out/referral-batch-1.txt")}, ${at("out/referral-batch-1.sh")}`);
      const script = readFileSync(at("out/referral-batch-1.sh"), "utf8");
      expect(script).toStartWith("#!/usr/bin/env bash\n");
      expect(script).toEndWith(`send 1 ${F} 0.040000000\nsend 2 ${F2} 0.000700000\n`);
      expect(statSync(at("out/referral-batch-1.sh")).mode & 0o777).toBe(0o750);
      const signature = ops.pay(F, 40_000_000n, 1, 1);
      const ledgerArgs = ["--ledger", at("ledger.sqlite"), "--ops", OPS];
      const recorded = await recordCommand([...ledgerArgs, "--cancel", "1"], {}, rpc);
      expect(recorded).toContain(`  batch 1 #1  ${F}  0.040000000 SOL  ${signature}\n`);
      expect(recorded).toContain("Cancelled 1 transfer(s) of batch 1: owed again.\nBatch 1: 1 cancelled, 1 landed.\n");
      const report = await reportCommand(["--ledger", at("ledger.sqlite"), "--batch", "1"]);
      expect(report).toBe(
        [
          "Brot Markets: referral payouts, in SOL",
          "",
          "Paid",
          `${F} 0.040000000`,
          "",
          "Pending",
          `${F2} 0.000700000`,
          "",
        ].join("\n"),
      );
      expect(snapshotLedger(at("ledger.sqlite"), at("copy.sqlite"))).toBeGreaterThan(0);
      expect(() => snapshotLedger(at("ledger.sqlite"), at("copy.sqlite"))).toThrow("this one exists");
      const copy = openLedger(at("copy.sqlite"), { readonly: true });
      expect(copy.db.query("SELECT status FROM referral_payouts ORDER BY idx").all()).toEqual([
        { status: "landed" },
        { status: "cancelled" },
      ]);
      copy.close();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("the flags and the RPC's environment: a file wins, anything else is refused, no URL in a message", () => {
    expect(parseFlags(["--a", "1", "--b"], ["a"], ["b"])).toEqual({ a: "1", b: true });
    expect(() => parseFlags(["--a"], ["a"], [])).toThrow("incomplete argument: --a");
    expect(() => parseFlags(["stray"], ["a"], [])).toThrow("unknown or incomplete argument: stray");
    expect(() => opsOf({ ops: "not-an-address" })).toThrow("--ops is not an address");
    const secret = "https://rpc.example/?api-key=SECRET";
    expect(rpcFromEnv({ REFERRAL_RPC_URL_FILE: "/cred", REFERRAL_RPC_URL: "x" }, () => secret)).toBeDefined();
    expect(rpcFromEnv({ INDEXER_RPC_URL: secret })).toBeDefined();
    for (const env of [{}, { REFERRAL_RPC_URL: "ftp://rpc.example/?api-key=SECRET" }]) {
      const refused = (() => {
        try {
          rpcFromEnv(env);
        } catch (caught) {
          return caught as Error;
        }
      })();
      expect(refused?.name).toBe("UsageError");
      expect(refused?.message).not.toContain("SECRET");
    }
  });

  test("a failing RPC call ends the command with its error's name, exit status 1, and never its URL", async () => {
    const { base, dir } = await filesWithEarnings();
    try {
      const url = "http://127.0.0.1:9/?api-key=SECRET"; // nothing listens on port 9
      const run = Bun.spawnSync(["bun", "scripts/referral/prepare.ts", ...base, "--dry-run", "--new-ledger"], {
        cwd: ROOT,
        env: { ...process.env, REFERRAL_RPC_URL: url },
      });
      const stderr = run.stderr.toString();
      expect(run.exitCode).toBe(1);
      expect(stderr).toStartWith("failed: ");
      expect(`${stderr}${run.stdout.toString()}`).not.toContain("SECRET");
      const usage = Bun.spawnSync(["bun", "scripts/referral/record.ts", "--nope"], { cwd: ROOT });
      expect([usage.exitCode, usage.stderr.toString()]).toEqual([
        1,
        "UsageError: unknown or incomplete argument: --nope\n",
      ]);
      const report = ["bun", "scripts/referral/report.ts", "--ledger", "/no/such/ledger", "--batch", "1"];
      const missing = Bun.spawnSync(report, { cwd: ROOT });
      expect([missing.exitCode, missing.stderr.toString()]).toEqual([
        1,
        "UsageError: --ledger: no such file: /no/such/ledger\n",
      ]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
