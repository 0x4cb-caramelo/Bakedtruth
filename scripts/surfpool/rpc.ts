/**
 * Purpose: talk to a surfnet over JSON-RPC: plain calls and Surfpool's `surfnet_*` cheatcodes, the
 *          clock, account bytes, and a transaction sent, landed and read back with its custom
 *          error code, its logs and the program's decoded events.
 * Version: 0.0.1
 * Sprint:  03 (readers and resolution): the Surfpool run of the price reader
 *
 * Transactions go out with `skipPreflight`, so a refusal lands as a failed transaction whose
 * error is read from the ledger, the way a keeper would see it, not from a simulation.
 */
import {
  appendTransactionMessageInstructions,
  blockhash,
  createTransactionMessage,
  getBase58Encoder,
  getBase64EncodedWireTransaction,
  getSignatureFromTransaction,
  pipe,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
  type Address,
  type Instruction,
  type TransactionSigner,
} from "@solana/kit";

import { MAX_TRANSACTION_VERSION } from "@brot/sdk/read";

import * as P from "../../tests/brot/program";
import { decodeEvent, type Event } from "../../tests/brot/setup";

export type Rpc = { url: string; call: <T = any>(method: string, params?: unknown[]) => Promise<T> };

/** A JSON-RPC client; an `error` in the reply is thrown with the method's name. */
export function connect(url: string): Rpc {
  let id = 0;
  const call = async <T>(method: string, params: unknown[] = []): Promise<T> => {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: ++id, method, params }),
    });
    const body = (await response.json()) as { result?: T; error?: { code: number; message: string } };
    if (body.error) throw new Error(`${method}: ${body.error.message} (${body.error.code})`);
    return body.result as T;
  };
  return { url, call };
}

export type Clock = { slot: bigint; epoch: bigint; unixTimestamp: bigint };

/** The surfnet's Clock sysvar, which is not the wall clock (knowledge-base/tecnologia/surfpool.md). */
export async function clock(rpc: Rpc): Promise<Clock> {
  const sysvar = "SysvarC1ock11111111111111111111111111111111";
  const info = await rpc.call<any>("getAccountInfo", [sysvar, { encoding: "jsonParsed" }]);
  const parsed = info.value.data.parsed.info;
  return { slot: BigInt(parsed.slot), epoch: BigInt(parsed.epoch), unixTimestamp: BigInt(parsed.unixTimestamp) };
}

export type Account = { owner: Address; lamports: bigint; executable: boolean; data: Uint8Array };

/** An account's bytes, or null. On a fork, the first read of a remote account fetches it. */
export async function account(rpc: Rpc, address: Address): Promise<Account | null> {
  const info = await rpc.call<any>("getAccountInfo", [address, { encoding: "base64", commitment: "confirmed" }]);
  const value = info.value;
  if (!value) return null;
  const data = new Uint8Array(Buffer.from(value.data[0], "base64"));
  return { owner: value.owner, lamports: BigInt(value.lamports), executable: value.executable, data };
}

/** `surfnet_setAccount`. Its `data` is hex, not base64 (a base64 string fails as "Invalid hex"). */
export async function setAccount(
  rpc: Rpc,
  address: Address,
  update: { lamports: bigint; data?: Uint8Array; owner?: Address; executable?: boolean },
) {
  const body: Record<string, unknown> = { lamports: Number(update.lamports) };
  if (update.data) body.data = Buffer.from(update.data).toString("hex");
  if (update.owner) body.owner = update.owner;
  if (update.executable !== undefined) body.executable = update.executable;
  await rpc.call("surfnet_setAccount", [address, body]);
}

export type Sent = {
  signature: string;
  ok: boolean;
  slot: bigint;
  /** The program's custom error code, when the failure carries one. */
  code: number | null;
  err: unknown;
  logs: string[];
  events: Event[];
};

const sleep = (ms: number) => new Promise((done) => setTimeout(done, ms));

/** Signs `ixs` with the signers on their metas, paid by `payer`, and waits for the ledger's answer. */
export async function send(rpc: Rpc, payer: TransactionSigner, ixs: Instruction[]): Promise<Sent> {
  const latest = await rpc.call<any>("getLatestBlockhash", [{ commitment: "confirmed" }]);
  const lifetime = {
    blockhash: blockhash(latest.value.blockhash),
    lastValidBlockHeight: BigInt(latest.value.lastValidBlockHeight),
  };
  const message = pipe(
    createTransactionMessage({ version: 0 }),
    (m) => setTransactionMessageFeePayerSigner(payer, m),
    (m) => setTransactionMessageLifetimeUsingBlockhash(lifetime, m),
    (m) => appendTransactionMessageInstructions(ixs, m),
  );
  const tx = await signTransactionMessageWithSigners(message);
  const signature = getSignatureFromTransaction(tx);
  const wire = getBase64EncodedWireTransaction(tx);
  await rpc.call("sendTransaction", [wire, { encoding: "base64", skipPreflight: true }]);
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    const statuses = await rpc.call<any>("getSignatureStatuses", [[signature], { searchTransactionHistory: true }]);
    const status = statuses.value[0];
    if (status && (status.confirmationStatus === "confirmed" || status.confirmationStatus === "finalized")) break;
    await sleep(200);
  }
  const options = {
    encoding: "json",
    commitment: "confirmed",
    maxSupportedTransactionVersion: MAX_TRANSACTION_VERSION,
  };
  let landed = await rpc.call<any>("getTransaction", [signature, options]);
  for (let retry = 0; !landed && retry < 10; retry++) {
    await sleep(200);
    landed = await rpc.call<any>("getTransaction", [signature, options]);
  }
  if (!landed) throw new Error(`transaction ${signature} never landed`);
  const err = landed.meta.err;
  return {
    signature,
    ok: err === null,
    slot: BigInt(landed.slot),
    code: customCode(err),
    err,
    logs: landed.meta.logMessages ?? [],
    events: err === null ? programEvents(landed) : [],
  };
}

/** `{ InstructionError: [index, { Custom: n }] }` gives n; any other failure gives null. */
function customCode(err: any): number | null {
  const custom = err?.InstructionError?.[1]?.Custom;
  return typeof custom === "number" ? custom : null;
}

/** The program's self-CPI events (T4): inner instructions to the program signed by its event authority. */
function programEvents(landed: any): Event[] {
  const keys: string[] = landed.transaction.message.accountKeys;
  const inner: any[] = (landed.meta.innerInstructions ?? []).flatMap((group: any) => group.instructions);
  return inner
    .filter((ix) => keys[ix.programIdIndex] === P.PROGRAM_ID && keys[ix.accounts[0]] === P.EVENT_AUTHORITY)
    .map((ix) => decodeEvent(new Uint8Array(getBase58Encoder().encode(ix.data))))
    .filter((event): event is Event => event !== null);
}
