/**
 * Purpose: each way an entry can fail has its own message (Sprint 11 DoD): the program's refusals are named by the
 *          SDK's error map, with the program's own message from the IDL; a landed transaction's error is read by its
 *          code; the wallet's refusal, the network and too little SOL are told apart, the last one from a real
 *          simulation of the program in LiteSVM. Filter: `bun test tests/ -t "each entry failure has its own message"`.
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry)
 */
import { afterEach, describe, expect, test } from "bun:test";
import { createSolanaRpc } from "@solana/kit";

import { BROT_ERROR_CODES, errorMessage, type BrotErrorName } from "@brot/sdk/read";

import { failureCopy } from "../../app/features/entry/copy-failures";
import {
  fromChainError,
  fromError,
  fromRefusal,
  fromSimulation,
  nothingSent,
  type FailureKey,
} from "../../app/features/entry/failures";
import { prepareEntry } from "../../app/features/entry/submit";
import { openedCampaign } from "../brot/flows";
import { openingWorld } from "../brot/opening";
import * as P from "../brot/program";
import { fundedWallet } from "../brot/setup";
import { startFakeChain, type FakeChain } from "./fake-chain";

let chain: FakeChain | null = null;
afterEach(() => chain?.close());

/** The Sprint 11 list, then the three the panel adds (the price buffer, a landed earlier entry, an expired attempt). */
const KEYS: FailureKey[] = [
  "entriesClosed",
  "outcomeKnown",
  "noFreshPrice",
  "paused",
  "belowMinimum",
  "notEnoughSol",
  "entryChanged",
  "returnBelowMinimum",
  "signatureRefused",
  "transactionFailed",
  "networkDown",
  "priceTooClose",
  "alreadyLanded",
  "notLanded",
];

describe("each entry failure has its own message", () => {
  test("every failure has its own title and its own text", () => {
    const context = {
      asset: "BTC/USD",
      maxAge: 120,
      minEntry: "0.01",
      floor: "3.0359",
      need: { amount: "1", rents: "0.002", fee: "0.00001" },
    };
    const copies = KEYS.map((key) => failureCopy(key, context));
    expect(new Set(copies.map((c) => c.title)).size).toBe(KEYS.length);
    expect(new Set(copies.map((c) => c.text)).size).toBe(KEYS.length);
    expect(failureCopy("noFreshPrice", context).text).toContain("BTC/USD");
    expect(failureCopy("belowMinimum", context).text).toContain("0.01 SOL");
  });

  test("the program's refusals of a join map to their failure, with the program's own message", () => {
    const cases: [BrotErrorName, FailureKey][] = [
      ["EntriesClosed", "entriesClosed"],
      ["CampaignNotOpen", "entriesClosed"],
      ["OutcomeKnowable", "outcomeKnown"],
      ["JoinPriceStale", "noFreshPrice"],
      ["JoinBufferRefused", "priceTooClose"],
      ["JoinWhilePaused", "paused"],
      ["BelowCampaignMinEntry", "belowMinimum"],
      ["EntryTotalMismatch", "entryChanged"],
      ["ReturnBelowMinimum", "returnBelowMinimum"],
      ["ReaderBadLayout", "transactionFailed"],
    ];
    for (const [name, key] of cases) {
      const failure = fromRefusal(name);
      expect([failure.key, failure.code, failure.programMessage]).toEqual([
        key,
        BROT_ERROR_CODES[name],
        errorMessage(BROT_ERROR_CODES[name])!,
      ]);
    }
    // On a retry that passed a saved total, a changed entry means the earlier attempt landed.
    expect(fromRefusal("EntryTotalMismatch", true).key).toBe("alreadyLanded");
  });

  test("a landed transaction's error is read by its code", () => {
    expect(fromChainError({ InstructionError: [0n, { Custom: 6067n }] })).toMatchObject({
      key: "returnBelowMinimum",
      name: "ReturnBelowMinimum",
    });
    expect(fromChainError({ InstructionError: [0, { Custom: 6063 }] }).key).toBe("entriesClosed");
    expect(fromChainError({ InstructionError: [0, { Custom: 1 }] }).key).toBe("notEnoughSol");
    expect(fromChainError("InsufficientFundsForFee").key).toBe("notEnoughSol");
    expect(fromChainError({ InstructionError: [1, { Custom: 42 }] })).toMatchObject({
      key: "transactionFailed",
      name: null,
    });
  });

  test("the wallet's refusal, the network, and anything else", () => {
    const wrapped = Object.assign(new Error("User rejected the request."), { name: "WalletSendTransactionError" });
    expect(fromError(Object.assign(new Error("x"), { code: 4001 })).key).toBe("signatureRefused");
    expect(fromError(wrapped).key).toBe("signatureRefused");
    expect(fromError({ error: { code: 4001, message: "denied" } }).key).toBe("signatureRefused");
    expect(fromError(new TypeError("Failed to fetch")).key).toBe("networkDown");
    expect(fromError(new Error("HTTP error (429): Too Many Requests")).key).toBe("networkDown");
    expect(fromError(new Error("the wallet session closed")).key).toBe("transactionFailed");
    // Only a refusal in the wallet proves nothing was sent; any other error is watched until it expires.
    expect(nothingSent(fromError(wrapped))).toBe(true);
    expect(nothingSent(fromError(new Error("timeout")))).toBe(false);
  });

  test("too little SOL, as the cluster reports it when the program's simulation runs", async () => {
    const w = await openingWorld();
    const { campaign } = await openedCampaign(w, w.creator);
    chain = startFakeChain(w);
    const poor = await fundedWallet(w, 1n);
    const prepared = await prepareEntry({
      rpc: createSolanaRpc(chain.url),
      campaign,
      baker: poor.address,
      side: "yes",
      amount: 2n * P.SOL,
    });
    if (prepared.ok || prepared.stage !== "simulation") throw new Error("expected the simulation to refuse it");
    expect(fromSimulation(prepared.simulation).key).toBe("notEnoughSol");
  });
});
