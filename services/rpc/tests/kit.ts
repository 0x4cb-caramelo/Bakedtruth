/**
 * Purpose: what the relay's tests share (Sprint 08): settings as the defaults give them with a fake upstream URL, a
 *          relay wired to an in-process fake upstream that records every call that reaches it and answers per method,
 *          a POST helper with Cloudflare's headers, account answers with a given owner and first byte, and wire
 *          transactions built with the kit's raw builders (the relay's tests may not import the SDK's `tx` half).
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points)
 */
import {
  address,
  appendTransactionMessageInstructions,
  blockhash,
  compileTransaction,
  createNoopSigner,
  createTransactionMessage,
  getBase64Decoder,
  getBase64EncodedWireTransaction,
  pipe,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  type Instruction,
} from "@solana/kit";

import { loadRelayConfig, type RelayConfig } from "../src/config";
import { createBudget, createCache, createLimiter } from "../src/limits";
import { createRelay } from "../src/relay";

export const PROGRAM_DATA = "8Vy9jyzijx41ntzQHniZFUBA4jFvuwueFtNXUtGvUYGK";
export const ADDR = "So11111111111111111111111111111111111111112";

export type Call = { id: unknown; method: string; params: unknown[] };
export type Answer = (call: Call) => { status?: number; text?: string; result?: unknown; error?: unknown };

export function setup(o: { answer?: Answer; env?: Record<string, string>; clock?: { now: number } } = {}) {
  const config: RelayConfig = loadRelayConfig({ RELAY_UPSTREAM_URL: "https://upstream.example.test", ...o.env });
  const clock = o.clock ?? { now: 1_800_000_000_000 };
  const now = () => clock.now;
  const calls: Call[] = [];
  const answer: Answer = o.answer ?? (() => ({ result: { context: { slot: 1 }, value: 1 } }));
  const relay = createRelay({
    config,
    programData: PROGRAM_DATA,
    upstream: async (body) => {
      const call = JSON.parse(body) as Call;
      calls.push(call);
      const a = answer(call);
      if (a.text !== undefined) return { status: a.status ?? 200, text: a.text };
      const payload = a.error !== undefined ? { error: a.error } : { result: a.result };
      return { status: a.status ?? 200, text: JSON.stringify({ jsonrpc: "2.0", id: call.id, ...payload }) };
    },
    limiter: createLimiter({ ratePerSecond: config.ratePerSecond, burst: config.burst, now }),
    budget: createBudget({ daily: config.dailyBudget, now }),
    cache: createCache(now),
  });
  const post = async (body: unknown, headers: Record<string, string> = {}) => {
    const text = typeof body === "string" ? body : JSON.stringify(body);
    const response = await relay(
      new Request("http://relay.test/rpc", {
        method: "POST",
        body: text,
        headers: { "content-type": "application/json", ...headers },
      }),
    );
    return { status: response.status, json: (await response.json()) as any };
  };
  const call = (method: string, params: unknown[], headers?: Record<string, string>) =>
    post({ jsonrpc: "2.0", id: 1, method, params }, headers);
  return { relay, calls, post, call, clock, config };
}

/** An account answer owned by `owner`, whose data starts with `tag`. */
export const account = (owner: string, tag = 0) => ({
  owner,
  lamports: 1_000_000,
  executable: false,
  rentEpoch: 0,
  space: 4,
  data: [getBase64Decoder().decode(Uint8Array.of(tag, 1, 2, 3)), "base64"],
});

/** A wire transaction of these instructions, fee payer `payer`, with a fixed blockhash; unsigned. */
export function wire(instructions: Instruction[], payer = ADDR): string {
  const message = pipe(
    createTransactionMessage({ version: 0 }),
    (m) => setTransactionMessageFeePayerSigner(createNoopSigner(address(payer)), m),
    (m) =>
      setTransactionMessageLifetimeUsingBlockhash(
        { blockhash: blockhash("11111111111111111111111111111111"), lastValidBlockHeight: 0n },
        m,
      ),
    (m) => appendTransactionMessageInstructions(instructions, m),
  );
  return getBase64EncodedWireTransaction(compileTransaction(message));
}

/** An instruction of `program` whose data starts with `first`. */
export const ix = (program: string, first: number): Instruction => ({
  programAddress: address(program),
  accounts: [],
  data: Uint8Array.of(first, 0, 0, 0),
});
