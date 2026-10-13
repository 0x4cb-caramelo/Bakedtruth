/**
 * Purpose: the mainnet deploy's pure guards, without a cluster (Sprint 18, lane L18): the cluster rule (mainnet-beta by
 *          genesis hash, a Surfpool fork told apart), the upgrade authority on hardware only, the multisig shape the
 *          runbook asks for, and the Squads vault message's layout (the vault first, the counts, the compact vectors).
 * Version: 0.1.0
 * Sprint:  18 (mainnet)
 */
import { describe, expect, test } from "bun:test";

import { address, createNoopSigner } from "@solana/kit";

import { buildSetTeam } from "@brot/sdk/tx";

import { mainnetProblem, MAINNET_GENESIS } from "../../scripts/deploy/mainnet-cluster";
import { multisigProblem } from "../../scripts/deploy/mainnet-preflight";
import { isHardwareUri, upgradeAuthority } from "../../scripts/deploy/mainnet-signers";
import { compileVaultMessage } from "../../scripts/deploy/mainnet-squads";
import { GENESIS } from "../../scripts/validator/clusters";

const facts = (genesisHash: string, surfnet: string | null) => ({ genesisHash, surfnet, core: "test" });
const REMOTE = "https://mainnet.example.org";
const KEY = address("11111111111111111111111111111111");
const MEMBER = address("SQDS4ep65T869zMMBKyuUq6aD6EgTu8psMjkvj52pCf");

describe("mainnet deploy guards", () => {
  test("only mainnet-beta itself for a real run, only a local fork for a rehearsal", () => {
    expect(mainnetProblem("mainnet", REMOTE, facts(MAINNET_GENESIS, null))).toBeNull();
    expect(mainnetProblem("mainnet", REMOTE, facts(GENESIS.devnet, null))).toContain("not mainnet-beta");
    expect(mainnetProblem("mainnet", REMOTE, facts(MAINNET_GENESIS, "1.6.0"))).toContain("Surfpool fork");
    expect(mainnetProblem("mainnet", "http://127.0.0.1:8899", facts(MAINNET_GENESIS, null))).toContain("loopback");
    expect(mainnetProblem("mainnet-fork", "http://127.0.0.1:4235", facts(MAINNET_GENESIS, "1.6.0"))).toBeNull();
    expect(mainnetProblem("mainnet-fork", REMOTE, facts(MAINNET_GENESIS, "1.6.0"))).toContain("local Surfpool");
    expect(mainnetProblem("mainnet-fork", "http://127.0.0.1:4235", facts(MAINNET_GENESIS, null))).toContain("surfnet");
    expect(MAINNET_GENESIS).toBe(GENESIS.mainnet);
  });

  test("the mainnet upgrade authority is a hardware URI with its reviewed key, never a file", async () => {
    for (const uri of ["usb://ledger", "usb://ledger?key=0", "usb://ledger?key=0/1"])
      expect(isHardwareUri(uri)).toBe(true);
    for (const bad of ["/home/x/upgrade.json", "usb://ledger?key=0;rm", "prompt://", "usb://trezor"]) {
      expect(isHardwareUri(bad)).toBe(false);
    }
    await expect(upgradeAuthority("mainnet", "/home/x/upgrade.json", KEY, ".")).rejects.toThrow("hardware wallet");
    await expect(upgradeAuthority("mainnet", "usb://ledger?key=0", undefined, ".")).rejects.toThrow("pubkey");
    await expect(upgradeAuthority("mainnet-fork", "usb://ledger", undefined, ".")).rejects.toThrow("throwaway");
    expect((await upgradeAuthority("mainnet", "usb://ledger?key=0", KEY, ".")).kind).toBe("hardware");
  });

  test("the multisig is 2 of 3, every permission, autonomous", () => {
    const members = [0, 1, 2].map(() => ({ key: MEMBER, mask: 7 }));
    const good = {
      configAuthority: KEY,
      threshold: 2,
      timeLock: 0,
      transactionIndex: 0n,
      staleTransactionIndex: 0n,
      members,
    };
    expect(multisigProblem(good)).toBeNull();
    expect(multisigProblem({ ...good, threshold: 1 })).toContain("not 2 of 3");
    expect(multisigProblem({ ...good, members: members.slice(0, 2) })).toContain("not 2 of 3");
    expect(multisigProblem({ ...good, members: [{ key: MEMBER, mask: 3 }, ...members.slice(1)] })).toContain(
      "permission",
    );
    expect(multisigProblem({ ...good, configAuthority: MEMBER })).toContain("config authority");
  });

  test("a vault message puts the vault first as the writable signer and encodes compact vectors", async () => {
    const vault = address("4L2v1qyNeXzrDmU4o4kVC4E5Bp1WFqMdahup252CSMAJ");
    const ix = await buildSetTeam({ admin: createNoopSigner(vault), team: [MEMBER] });
    const { bytes, keys } = compileVaultMessage(vault, [ix]);
    expect(keys[0]).toEqual({ address: vault, signer: true, writable: true });
    expect(keys.at(-1)!.writable).toBe(false);
    expect([bytes[0], bytes[1], bytes[2], bytes[3]]).toEqual([1, 1, 1, keys.length]);
    const afterKeys = 4 + 32 * keys.length;
    expect(bytes[afterKeys]).toBe(1); // one instruction
    expect(bytes[afterKeys + 2]).toBe(ix.accounts!.length);
    expect(bytes.at(-1)).toBe(0); // no address lookup table
  });
});
