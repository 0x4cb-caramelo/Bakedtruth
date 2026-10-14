/**
 * Purpose: talk to a cluster over JSON-RPC for the ops scripts: the cluster guard (a non-local URL is refused
 *          unless the caller names the cluster on purpose; the genesis hash is printed before anything is
 *          sent), account bytes and the Clock, and a transaction sent, landed and read back with its custom
 *          error code, its logs and the program's events decoded by the SDK (decoder rules of TP 3.4.14).
 * Version: 0.1.4 (Sprint 16, the review's F1: a JSON-RPC error keeps its code, so a caller can tell -32015; the
 *          read-back asks for MAX_TRANSACTION_VERSION; 0.1.3, a transaction not confirmed in the wait may still land)
 * Sprint:  05 (SDK and the devnet cycle), lane OPS; 16
 *
 * Transactions go out with `skipPreflight`, so a refusal lands as a failed transaction whose error is read
 * from the ledger, the way a keeper sees it. The caller signs; this file never reads a key.
 */
import {
  appendTransactionMessageInstructions,
  blockhash,
  createTransactionMessage,
  getBase64EncodedWireTransaction,
  getSignatureFromTransaction,
  getTransactionEncoder,
  pipe,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
  type Instruction,
  type TransactionSigner,
} from "@solana/kit";

import {
  customErrorCode,
  decodeTransactionEvents,
  errorName,
  MAX_TRANSACTION_VERSION,
  type DecodedEvent,
  type RpcTransaction,
} from "@brot/sdk/read";

export type Rpc = { url: string; call: <T = any>(method: string, params?: unknown[]) => Promise<T> };

const LOCAL_HOSTS = new Set(["127.0.0.1", "localhost", "[::1]", "::1"]);

/** True when `url` points at this machine (a local validator or surfnet). */
export function isLocalUrl(url: string): boolean {
  return LOCAL_HOSTS.has(new URL(url).hostname);
}

/**
 * A JSON-RPC client for `url`. A URL that is not local is refused unless `allowRemote` names why (the
 * cluster flag the operator typed), so no script reaches devnet or mainnet by default.
 */
export function connect(url: string, allowRemote: string | null = null): Rpc {
  if (!isLocalUrl(url) && !allowRemote) throw new Error(`refusing non-local RPC ${new URL(url).host}: pass --cluster`);
  let id = 0;
  const call = async <T>(method: string, params: unknown[] = []): Promise<T> => {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: ++id, method, params }),
    });
    const body = (await response.json()) as { result?: T; error?: { code: number; message: string } };
    if (body.error)
      throw Object.assign(new Error(`${method}: ${body.error.message} (${body.error.code})`), {
        code: body.error.code,
      });
    return body.result as T;
  };
  return { url, call };
}

/** The cluster's genesis hash and version, printed so the operator sees which cluster a run will write to. */
export async function describeCluster(rpc: Rpc): Promise<{ genesisHash: string; version: string }> {
  const genesisHash = await rpc.call<string>("getGenesisHash");
  const version = await rpc.call<Record<string, unknown>>("getVersion");
  const shown = String(version["solana-core"] ?? version["surfnet-version"] ?? "unknown");
  // Only the origin: a path or a query can carry a provider's API key (Sprint 05 deploy review, F9).
  console.log(`cluster: ${new URL(rpc.url).origin}  genesis ${genesisHash}  version ${shown}`);
  return { genesisHash, version: shown };
}

export type Account = { address: string; owner: string; lamports: bigint; executable: boolean; data: Uint8Array };

/** An account's bytes, or null when it does not exist. */
export async function account(rpc: Rpc, address: string): Promise<Account | null> {
  const info = await rpc.call<any>("getAccountInfo", [address, { encoding: "base64", commitment: "confirmed" }]);
  const value = info.value;
  if (!value) return null;
  const data = Uint8Array.from(atob(value.data[0]), (c) => c.charCodeAt(0));
  return { address, owner: value.owner, lamports: BigInt(value.lamports), executable: value.executable, data };
}

export const balance = async (rpc: Rpc, address: string): Promise<bigint> =>
  (await account(rpc, address))?.lamports ?? 0n;

export type Clock = { slot: bigint; epoch: bigint; unixTimestamp: bigint };

/** The cluster's Clock sysvar: the time the program reads, never the machine's clock (A-7). */
export async function clock(rpc: Rpc): Promise<Clock> {
  const sysvar = "SysvarC1ock11111111111111111111111111111111";
  const info = await rpc.call<any>("getAccountInfo", [sysvar, { encoding: "jsonParsed", commitment: "confirmed" }]);
  const parsed = info.value.data.parsed.info;
  return { slot: BigInt(parsed.slot), epoch: BigInt(parsed.epoch), unixTimestamp: BigInt(parsed.unixTimestamp) };
}

/** `getMinimumBalanceForRentExemption`: rent is read from the cluster, never a constant (Sprint 04, decision 6). */
export const rentFor = async (rpc: Rpc, size: number): Promise<bigint> =>
  BigInt(await rpc.call<number>("getMinimumBalanceForRentExemption", [size]));

export type Sent = {
  signature: string;
  ok: boolean;
  slot: bigint;
  /** The program's custom error code and its name, when the failure carries one. */
  code: number | null;
  error: string | null;
  err: unknown;
  logs: string[];
  fee: bigint;
  events: DecodedEvent[];
  computeUnits: bigint;
  /** The signed transaction's size on the wire, against the 1,232-byte limit. */
  wireBytes: number;
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
  await rpc.call("sendTransaction", [getBase64EncodedWireTransaction(tx), { encoding: "base64", skipPreflight: true }]);
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    const statuses = await rpc.call<any>("getSignatureStatuses", [[signature], { searchTransactionHistory: true }]);
    const status = statuses.value[0];
    if (status && (status.confirmationStatus === "confirmed" || status.confirmationStatus === "finalized")) break;
    await sleep(250);
  }
  const options = {
    encoding: "json",
    commitment: "confirmed",
    maxSupportedTransactionVersion: MAX_TRANSACTION_VERSION,
  };
  let landed = await rpc.call<any>("getTransaction", [signature, options]);
  for (let retry = 0; !landed && retry < 20; retry++) {
    await sleep(250);
    landed = await rpc.call<any>("getTransaction", [signature, options]);
  }
  if (!landed) {
    // Not confirmed within the wait does not mean it never lands: until its blockhash expires it still may. Check
    // this signature (getSignatureStatuses) before any retry, or a retry can do the act twice.
    throw new Error(
      `transaction ${signature} not confirmed within the wait; it may still land: check this signature before any retry`,
    );
  }
  const err = landed.meta.err;
  const code = customErrorCode(err);
  return {
    signature,
    ok: err === null,
    slot: BigInt(landed.slot),
    code,
    error: code === null ? (err === null ? null : JSON.stringify(err)) : (errorName(code) ?? `custom ${code}`),
    err,
    logs: landed.meta.logMessages ?? [],
    fee: BigInt(landed.meta.fee ?? 0),
    events: decodeTransactionEvents(landed as RpcTransaction),
    computeUnits: BigInt(landed.meta.computeUnitsConsumed ?? 0),
    wireBytes: getTransactionEncoder().encode(tx).length,
  };
}

/** Throws with the logs unless `sent` succeeded; returns it for chaining. */
export function expectOk(sent: Sent, label: string): Sent {
  if (!sent.ok) throw new Error(`${label} failed: ${sent.error}\n${sent.logs.join("\n")}`);
  return sent;
}

/** Throws unless `sent` failed with the program error `name`. */
export function expectRefusal(sent: Sent, name: string, label: string): Sent {
  if (sent.ok) throw new Error(`${label}: expected ${name}, but it succeeded`);
  if (sent.error !== name) throw new Error(`${label}: expected ${name}, got ${sent.error}\n${sent.logs.join("\n")}`);
  return sent;
}

/** Airdrops on a local cluster and waits for the balance. */
export async function airdrop(rpc: Rpc, address: string, lamports: bigint): Promise<void> {
  const before = await balance(rpc, address);
  await rpc.call("requestAirdrop", [address, Number(lamports)]);
  for (let i = 0; i < 80 && (await balance(rpc, address)) < before + lamports; i++) await sleep(250);
}
