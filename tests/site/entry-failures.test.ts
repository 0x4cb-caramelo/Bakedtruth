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
import { programOf } from "../../app/features/entry/landed";
import { prepareEntry } from "../../app/features/entry/submit";
import { openedCampaign } from "../brot/flows";
import { openingWorld } from "../brot/opening";
import * as P from "../brot/program";
import { fundedWallet } from "../brot/setup";
import { startFakeChain, type FakeChain } from "./fake-chain";

let chain: FakeChain | null = null;
afterEach(() => chain?.close());

/** The Sprint 11 list, then what the panel adds (the price buffer, a landed earlier entry, an expired attempt, a watch
 * that stopped, another wallet) and A-8's two (tests/site/upgrade-pause.test.ts). */
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
  "stillChecking",
  "walletChanged",
  "programUpgraded",
  "versionUnknown",
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

  test("a landed transaction's error is named only when the program's own instruction failed", () => {
    const brot = P.PROGRAM_ID;
    expect(fromChainError({ InstructionError: [0n, { Custom: 6067n }] }, false, brot)).toMatchObject({
      key: "returnBelowMinimum",
      name: "ReturnBelowMinimum",
    });
    expect(fromChainError({ InstructionError: [0, { Custom: 6063 }] }, false, brot).key).toBe("entriesClosed");
    expect(fromChainError({ InstructionError: [0, { Custom: 1 }] }, false, brot).key).toBe("notEnoughSol");
    expect(fromChainError("InsufficientFundsForFee").key).toBe("notEnoughSol");
    // A wallet's own instruction (Lighthouse, say) failing with a code in the same range is not the program's refusal.
    const other = "L2TExMFKdjpN9kozasaurPirfHy9P8sbXoAN1qA3S95";
    expect(fromChainError({ InstructionError: [1, { Custom: 6066 }] }, true, other)).toMatchObject({
      key: "transactionFailed",
      name: null,
    });
    expect(fromChainError({ InstructionError: [0, { Custom: 6066 }] }, true, null).key).toBe("transactionFailed");
    // The failing instruction's program comes from the landed transaction itself.
    const tx = {
      transaction: {
        message: { accountKeys: [other, brot], instructions: [{ programIdIndex: 1 }, { programIdIndex: 0 }] },
      },
    };
    expect(programOf(tx, { InstructionError: [0, { Custom: 6067 }] })).toBe(brot);
    expect(programOf(tx, { InstructionError: [1n, { Custom: 6067 }] })).toBe(other);
    expect(programOf(tx, "BlockhashNotFound")).toBeNull();
  });

  test("the wallet's refusal, the network, and anything else", () => {
    const wrapped = Object.assign(new Error("User rejected the request."), { name: "WalletSendTransactionError" });
    expect(fromError(Object.assign(new Error("x"), { code: 4001 })).key).toBe("signatureRefused");
    expect(fromError(wrapped).key).toBe("signatureRefused");
    expect(fromError({ error: { code: 4001, message: "denied" } }).key).toBe("signatureRefused");
    expect(fromError(new TypeError("Failed to fetch")).key).toBe("networkDown");
    expect(fromError(new Error("HTTP error (429): Too Many Requests")).key).toBe("networkDown");
    expect(fromError(new Error("the wallet session closed")).key).toBe("transactionFailed");
    // Only a refusal in the wallet, or a preflight that refused to send, proves nothing was sent.
    expect(nothingSent(fromError(wrapped))).toBe(true);
    expect(nothingSent(fromError(new Error("timeout")))).toBe(false);
    expect(nothingSent(fromError(new Error("the request was cancelled because the tab closed")))).toBe(false);
    const preflight = new Error(
      "Transaction simulation failed: Error processing Instruction 0: custom program error: 0x17b3",
    );
    expect(fromError(preflight)).toMatchObject({ key: "returnBelowMinimum", notSent: true });
    const elsewhere = new Error(
      "Transaction simulation failed: Error processing Instruction 1: custom program error: 0x17b3",
    );
    expect(fromError(elsewhere)).toMatchObject({ key: "transactionFailed", notSent: true });
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
