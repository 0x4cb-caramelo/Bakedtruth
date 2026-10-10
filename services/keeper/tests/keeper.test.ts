/**
 * Purpose: the keeper's unit tests: its settings and their refusals, the send-or-skip rule, the signer's input
 *          check, the campaign listing (a non-campaign account is skipped), and the health route. No cluster.
 * Version: 0.1.0
 * Sprint:  06 (server and primary keeper), MVP happy path
 */
import { describe, expect, test } from "bun:test";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import type { SolanaRpc } from "@brot/sdk/read";

import { loadConfig } from "../src/config";
import { listOpenCampaigns } from "../src/campaigns";
import { startHealth, type KeeperState } from "../src/health";
import { decide } from "../src/resolve";
import { loadKeeperSigner } from "../src/signer";

const ENV = { KEEPER_RPC_URL: "https://rpc.example.test/?api-key=secret-value", KEEPER_KEYPAIR: "/etc/k.json" };

describe("loadConfig", () => {
  test("defaults: devnet, 60 s cycle, loopback health on 4210, no dry run", () => {
    const config = loadConfig(ENV);
    expect(config).toEqual({
      rpcUrl: ENV.KEEPER_RPC_URL,
      keypairPath: "/etc/k.json",
      cluster: "devnet",
      cycleMs: 60_000,
      dryRun: false,
      healthHost: "127.0.0.1",
      healthPort: 4210,
    });
  });

  test("a missing RPC URL is named, and the error never echoes a value", () => {
    expect(() => loadConfig({ KEEPER_KEYPAIR: "/etc/k.json" })).toThrow("KEEPER_RPC_URL is not set");
    try {
      loadConfig({ KEEPER_RPC_URL: "not a url secret-value", KEEPER_KEYPAIR: "/etc/k.json" });
      throw new Error("expected a refusal");
    } catch (error) {
      expect((error as Error).message).toBe("KEEPER_RPC_URL is not a URL");
    }
  });

  test("refuses a non-loopback health address, an unknown cluster and a bad cycle", () => {
    expect(() => loadConfig({ ...ENV, KEEPER_HEALTH_HOST: "0.0.0.0" })).toThrow("loopback");
    expect(() => loadConfig({ ...ENV, KEEPER_CLUSTER: "mainnet" })).toThrow("devnet or local");
    expect(() => loadConfig({ ...ENV, KEEPER_CYCLE_MS: "0" })).toThrow("KEEPER_CYCLE_MS");
  });

  test("KEEPER_DRY_RUN=1 turns the dry run on, and nothing else does", () => {
    expect(loadConfig({ ...ENV, KEEPER_DRY_RUN: "1" }).dryRun).toBe(true);
    expect(loadConfig({ ...ENV, KEEPER_DRY_RUN: "yes" }).dryRun).toBe(false);
  });
});

describe("decide (the send-or-skip rule)", () => {
  test("sends only a simulation the program accepts, outside a dry run", () => {
    expect(decide({ ok: true, errorName: null }, false)).toEqual({ next: "send" });
    expect(decide({ ok: true, errorName: null }, true)).toEqual({
      next: "record",
      attempt: "wouldResolve",
      detail: null,
    });
  });

  test("NotResolvableYet is a normal 'not yet'; another named refusal is recorded by name", () => {
    expect(decide({ ok: false, errorName: "NotResolvableYet" }, false)).toEqual({
      next: "record",
      attempt: "notYet",
      detail: null,
    });
    expect(decide({ ok: false, errorName: "CampaignNotOpen" }, false)).toEqual({
      next: "record",
      attempt: "refused",
      detail: "CampaignNotOpen",
    });
  });

  test("a simulation with no program error is a failure, and nothing is sent", () => {
    expect(decide({ ok: false, errorName: null }, false).next).toBe("record");
    expect(decide({ ok: false, errorName: null }, false)).toMatchObject({ attempt: "failed" });
  });
});

describe("loadKeeperSigner", () => {
  test("refuses a file that is not a 64-byte JSON array", async () => {
    const path = join(await mkdtemp(join(tmpdir(), "keeper-")), "bad.json");
    await writeFile(path, JSON.stringify([1, 2, 3]));
    await expect(loadKeeperSigner(path)).rejects.toThrow("64-byte JSON array");
  });
});

describe("listOpenCampaigns", () => {
  test("skips an account that is not a campaign of the program, and returns none", async () => {
    const junk = { pubkey: "11111111111111111111111111111111", account: { owner: "x", data: ["AAAA", "base64"] } };
    const rpc = { getProgramAccounts: () => ({ send: async () => [junk] }) } as unknown as SolanaRpc;
    expect(await listOpenCampaigns(rpc)).toEqual([]);
  });
});

describe("startHealth", () => {
  test("answers /healthz with the state and 404 elsewhere, on the loopback address", async () => {
    const state: KeeperState = { cluster: "devnet", startedAt: "t0", cycles: 3, last: null, lastError: null };
    const server = startHealth("127.0.0.1", 0, () => state);
    try {
      const ok = await fetch(`http://127.0.0.1:${server.port}/healthz`);
      expect(ok.status).toBe(200);
      expect(await ok.json()).toEqual(state);
      expect((await fetch(`http://127.0.0.1:${server.port}/other`)).status).toBe(404);
    } finally {
      server.stop(true);
    }
  });
});
