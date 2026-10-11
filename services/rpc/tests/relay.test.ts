/**
 * Purpose: brot-rpc's refusals and its account rule, with an in-process fake upstream (Sprint 08; X1.7): a batch, an
 *          oversized body, a method off the allowlist, a subscription, an argument or an option the trace never used —
 *          each refused before the upstream sees it; an account under an owner no reader accepts comes back with its
 *          owner and no data; ProgramData only as its first 45 bytes; the cache holding a reader's account, never
 *          the program's own (config, campaign, entry), a missing account or a signature status; the upstream's busy, failed and error answers. Filter: `bun test services/rpc`.
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points)
 */
import { describe, expect, test } from "bun:test";
import { ACCOUNT_TAG, BPF_LOADER_UPGRADEABLE_ID, PROGRAM_ID, SPL_TOKEN_PROGRAM_ID } from "@brot/sdk/read";

import { CODE } from "../src/relay";
import { account, ADDR, PROGRAM_DATA, setup } from "./kit";

const B64 = { encoding: "base64" };

describe("brot-rpc refuses what Brot's clients never send", () => {
  test("a batch, an oversized body, JSON that is not JSON-RPC, and a GET: none reaches the upstream", async () => {
    const r = setup();
    expect((await r.post([{ jsonrpc: "2.0", id: 1, method: "getBlockHeight" }])).json.error.code).toBe(CODE.invalid);
    expect(
      (await r.post(`{"jsonrpc":"2.0","id":1,"method":"getBalance","params":["${"1".repeat(9_000)}"]}`)).status,
    ).toBe(413);
    expect((await r.post("not json")).json.error.code).toBe(CODE.parse);
    expect((await r.post({ id: 1, method: "getBlockHeight" })).json.error.code).toBe(CODE.invalid);
    expect((await r.relay(new Request("http://relay.test/rpc"))).status).toBe(405);
    expect(r.calls).toEqual([]);
  });

  test("a method off the allowlist, subscriptions and getProgramAccounts included", async () => {
    const r = setup();
    for (const method of [
      "getProgramAccounts",
      "accountSubscribe",
      "requestAirdrop",
      "getRecentPrioritizationFees",
      "__proto__",
    ])
      expect(`${method}: ${(await r.call(method, [])).json.error.code}`).toBe(`${method}: ${CODE.method}`);
    expect(r.calls).toEqual([]);
  });

  test("arguments and options the trace never used", async () => {
    const r = setup();
    const refused = [
      ["getAccountInfo", [ADDR]], // no encoding: base58 would be the default
      ["getAccountInfo", [ADDR, { encoding: "jsonParsed" }]],
      ["getAccountInfo", ["not-an-address", B64]],
      ["getMultipleAccounts", [Array(101).fill(ADDR), B64]],
      ["getSignaturesForAddress", [ADDR, { limit: 5_000 }]],
      ["getSignatureStatuses", [Array(17).fill("1".repeat(88))]],
      ["getTransaction", ["1".repeat(88), { encoding: "base64" }]],
      ["simulateTransaction", ["AAAA", { encoding: "base64", accounts: { addresses: [ADDR] } }]],
      ["sendTransaction", ["AAAA"]],
      ["getBalance", [ADDR, { commitment: "max" }]],
      ["getBlockHeight", [{}, "extra"]],
    ] as const;
    for (const [method, params] of refused)
      expect(`${method}: ${(await r.call(method, [...params])).json.error.code}`).toBe(`${method}: ${CODE.params}`);
    expect(r.calls).toEqual([]);
  });
});

describe("brot-rpc's account rule and cache", () => {
  test("an account under an owner no reader accepts comes back with its owner and no data; a reader's comes whole", async () => {
    const owners: Record<string, string> = {
      a: "Fore1gnProgram11111111111111111111111111111",
      b: SPL_TOKEN_PROGRAM_ID,
    };
    const r = setup({
      answer: (c) => ({
        result: {
          context: { slot: 1 },
          value: (c.params[0] as string[]).map((_, i) => account(Object.values(owners)[i])),
        },
      }),
    });
    const { json } = await r.call("getMultipleAccounts", [[ADDR, ADDR], B64]);
    expect(json.result.value[0]).toMatchObject({ owner: owners.a, data: ["", "base64"], space: 4 });
    expect(json.result.value[1]).toEqual(account(SPL_TOKEN_PROGRAM_ID));
  });

  test("ProgramData only as its first 45 bytes, owned by the upgradeable loader, and never cached", async () => {
    const r = setup({
      answer: () => ({ result: { context: { slot: 1 }, value: account(BPF_LOADER_UPGRADEABLE_ID, 3) } }),
    });
    expect((await r.call("getAccountInfo", [PROGRAM_DATA, B64])).json.error.code).toBe(CODE.params);
    const slice = { encoding: "base64", dataSlice: { offset: 0, length: 45 } };
    expect((await r.call("getAccountInfo", [PROGRAM_DATA, slice])).json.result.value).toEqual(
      account(BPF_LOADER_UPGRADEABLE_ID, 3),
    );
    await r.call("getAccountInfo", [PROGRAM_DATA, slice]);
    expect(r.calls.length).toBe(2);
    expect(
      (await r.call("getAccountInfo", [PROGRAM_DATA, { ...slice, dataSlice: { offset: 0, length: 46 } }])).json.error
        .code,
    ).toBe(CODE.params);
  });

  test("the cache holds a reader's account for a moment, never the program's own, a missing one or a status", async () => {
    const CAMPAIGN = "Campaign11111111111111111111111111111111111";
    const ENTRY = "Entry111111111111111111111111111111111111111";
    const values: Record<string, unknown> = {
      [ADDR]: account(SPL_TOKEN_PROGRAM_ID),
      [CAMPAIGN]: account(PROGRAM_ID, ACCOUNT_TAG.campaign),
      [ENTRY]: account(PROGRAM_ID, ACCOUNT_TAG.entry),
    };
    const r = setup({
      answer: (c) =>
        c.method === "getSignatureStatuses"
          ? { result: { context: { slot: 1 }, value: [null] } }
          : { result: { context: { slot: 1 }, value: values[c.params[0] as string] ?? null } },
    });
    const twice = async (method: string, params: unknown[]) => {
      const before = r.calls.length;
      await r.call(method, params);
      await r.call(method, params);
      return r.calls.length - before;
    };
    expect(await twice("getAccountInfo", [ADDR, B64])).toBe(1);
    // A page acts on the program's own accounts: the smoke through the relay saw a cached config keep a pause.
    expect(await twice("getAccountInfo", [CAMPAIGN, B64])).toBe(2);
    expect(await twice("getAccountInfo", [ENTRY, B64])).toBe(2);
    expect(await twice("getAccountInfo", [SPL_TOKEN_PROGRAM_ID, B64])).toBe(2); // missing
    expect(await twice("getMultipleAccounts", [[ADDR, CAMPAIGN], B64])).toBe(2);
    expect(await twice("getSignatureStatuses", [["1".repeat(88)]])).toBe(2);
    r.clock.now += 2_000;
    expect(await twice("getAccountInfo", [ADDR, B64])).toBe(1);
  });

  test("the upstream busy, down or answering an error: no detail of the upstream passes, its JSON-RPC error does", async () => {
    let mode = "busy";
    const r = setup({
      answer: () =>
        mode === "busy"
          ? { status: 429, text: "Too Many Requests at https://secret-key.example.test" }
          : mode === "html"
            ? { status: 500, text: "<html>" }
            : { error: { code: -32009, message: "Slot was skipped" } },
    });
    const busy = await r.call("getBlockHeight", []);
    expect([busy.status, busy.json.error.code, JSON.stringify(busy.json).includes("secret")]).toEqual([
      503,
      CODE.upstream,
      false,
    ]);
    mode = "html";
    expect((await r.call("getBlockHeight", [])).status).toBe(502);
    mode = "error";
    expect((await r.call("getBlockHeight", [])).json.error).toEqual({ code: -32009, message: "Slot was skipped" });
  });
});
