/**
 * Purpose: a LiteSVM world for the program's tests: the binary loaded, the clock set next to the
 *          captured Pyth prices, the upgrade authority recorded, funded wallets, and one `send`
 *          that returns the custom error code and the decoded events.
 * Version: 0.0.3
 * Sprint:  02 (pot core on Pinocchio); Sprint 03 lets a test set a price's posted slot; Sprint 05
 *          decodes the events through the SDK (tests/brot/sent-events.ts)
 */
import { readFileSync } from "node:fs";

import {
  appendTransactionMessageInstructions,
  createClient,
  createTransactionMessage,
  generateKeyPairSigner,
  getAddressEncoder,
  getCompiledTransactionMessageDecoder,
  getSignatureFromTransaction,
  lamports,
  pipe,
  setTransactionMessageFeePayerSigner,
  signTransactionMessageWithSigners,
  type Address,
  type Instruction,
  type KeyPairSigner,
} from "@solana/kit";
import { litesvm, isFailedTransaction } from "@solana/kit-plugin-litesvm";
import { generatedSigner } from "@solana/kit-plugin-signer";

import { BrotError, type BrotErrorName } from "./errors";
import * as P from "./program";
import { sentEvents, type Event } from "./sent-events";

/** Unix time the captured SOL/USD and BTC/USD devnet accounts were published (fixture index). */
export const FIXTURE_PUBLISH_TIME = 1_791_216_173n;
/** The clock every world starts at: 7 s after the fixtures' publish time, so they are fresh. */
export const START_TIME = FIXTURE_PUBLISH_TIME + 7n;

const makeClient = async () => createClient().use(generatedSigner()).use(litesvm());
export type Client = Awaited<ReturnType<typeof makeClient>>;
export type World = { client: Client; upgradeAuthority: KeyPairSigner };

export async function createWorld(): Promise<World> {
  const client = await makeClient();
  client.svm.addProgramFromFile(P.PROGRAM_ID, P.PROGRAM_SO);
  client.svm.warpToSlot(1n);
  setTime(client, START_TIME);
  client.svm.airdrop(client.payer.address, lamports(1_000n * P.SOL));
  const upgradeAuthority = await fundedWallet({ client });
  setUpgradeAuthority(client, await P.programDataPda(), upgradeAuthority.address);
  setPriceAccount(client, P.SOL_USD_ACCOUNT, "pyth-sol-usd-devnet");
  setPriceAccount(client, P.BTC_USD_ACCOUNT, "pyth-btc-usd-devnet");
  return { client, upgradeAuthority };
}

/** Moves the cluster clock's Unix time, keeping the slot. */
export function setTime(client: Client, unixTimestamp: bigint) {
  const clock = client.svm.getClock();
  clock.unixTimestamp = unixTimestamp;
  client.svm.setClock(clock);
}
export const now = (client: Client) => client.svm.getClock().unixTimestamp;

/** A fresh wallet holding `sol` SOL. */
export async function fundedWallet(w: { client: Client }, sol = 100n): Promise<KeyPairSigner> {
  const signer = await generateKeyPairSigner();
  w.client.svm.airdrop(signer.address, lamports(sol * P.SOL));
  return signer;
}

/** A loader-v3 ProgramData account naming `authority` (null: an immutable program), last deployed at `slot`. */
export function setUpgradeAuthority(client: Client, programData: Address, authority: Address | null, slot = 0n) {
  const data = new Uint8Array(45);
  new DataView(data.buffer).setUint32(0, 3, true); // UpgradeableLoaderState::ProgramData
  new DataView(data.buffer).setBigUint64(4, slot, true);
  if (authority) {
    data[12] = 1;
    data.set(getAddressEncoder().encode(authority), 13);
  }
  client.svm.setAccount({
    address: programData,
    data,
    executable: false,
    lamports: lamports(P.SOL),
    programAddress: P.LOADER_V3_ID,
    space: 45n,
  });
}

/** Byte offsets of the `PriceUpdateV2` fields the program reads. */
export const PRICE_OFFSETS = {
  verification: 40,
  feedId: 41,
  price: 73,
  conf: 81,
  exponent: 89,
  publishTime: 93,
  postedSlot: 125,
};

/**
 * Writes a captured Pyth account at `address`, publish time moved to `START_TIME − 5` unless given,
 * with any field changed in memory (the fixture file itself is never edited).
 */
export function setPriceAccount(
  client: Client,
  address: Address,
  fixture: string,
  change: {
    price?: bigint;
    conf?: bigint;
    exponent?: number;
    publishTime?: bigint;
    verification?: number;
    owner?: Address;
    postedSlot?: bigint;
    feedId?: Uint8Array;
  } = {},
) {
  const data = new Uint8Array(readFileSync(`tests/fixtures/${fixture}.bin`));
  const view = new DataView(data.buffer);
  view.setBigInt64(PRICE_OFFSETS.publishTime, change.publishTime ?? START_TIME - 5n, true);
  if (change.price !== undefined) view.setBigInt64(PRICE_OFFSETS.price, change.price, true);
  if (change.conf !== undefined) view.setBigUint64(PRICE_OFFSETS.conf, change.conf, true);
  if (change.exponent !== undefined) view.setInt32(PRICE_OFFSETS.exponent, change.exponent, true);
  if (change.verification !== undefined) data[PRICE_OFFSETS.verification] = change.verification;
  if (change.postedSlot !== undefined) view.setBigUint64(PRICE_OFFSETS.postedSlot, change.postedSlot, true);
  if (change.feedId !== undefined) data.set(change.feedId, PRICE_OFFSETS.feedId);
  const programAddress = change.owner ?? P.PYTH_RECEIVER_ID;
  client.svm.setAccount({ address, data, executable: false, lamports: lamports(P.SOL), programAddress, space: 134n });
  return data;
}

export { decodeEvent, type Event } from "./sent-events";
export type Sent =
  | { ok: true; logs: string[]; events: Event[]; computeUnits: bigint }
  | { ok: false; logs: string[]; code: number | null; error: string };

/** Sends `ixs` paid by the world's payer; signers ride on the instructions' account metas. */
export async function send(w: { client: Client }, ixs: Instruction[]): Promise<Sent> {
  const message = pipe(
    createTransactionMessage({ version: 0 }),
    (m) => setTransactionMessageFeePayerSigner(w.client.payer, m),
    (m) => w.client.svm.setTransactionMessageLifetimeUsingLatestBlockhash(m),
    (m) => appendTransactionMessageInstructions(ixs, m),
  );
  const tx = await signTransactionMessageWithSigners(message);
  const keys = getCompiledTransactionMessageDecoder().decode(tx.messageBytes).staticAccounts;
  const result = w.client.svm.sendTransaction(tx);
  w.client.svm.expireBlockhash(); // identical follow-ups are not duplicates
  if (isFailedTransaction(result)) {
    const error = String((result.err() as { toString(): string }).toString());
    const logs = (result as unknown as { meta(): { logs(): string[] } }).meta().logs();
    return { ok: false, logs, code: customCode(result.err()), error };
  }
  // Sprint 05: the events are the SDK's, decoded as an indexer decodes them (tests/brot/sent-events.ts).
  const events = sentEvents(getSignatureFromTransaction(tx), keys, result.innerInstructions());
  return { ok: true, logs: result.logs(), events, computeUnits: result.computeUnitsConsumed() };
}

function customCode(err: unknown): number | null {
  const inner = (err as { err?: () => unknown })?.err?.();
  if (inner && typeof (inner as { code?: unknown }).code === "number") return (inner as { code: number }).code;
  const match = /code: (\d+)/.exec(String(err));
  return match ? Number(match[1]) : null;
}

/** Throws with the logs unless the transaction succeeded. */
export function expectOk(sent: Sent): Extract<Sent, { ok: true }> {
  if (!sent.ok) throw new Error(`expected success, got ${sent.error}\n${sent.logs.join("\n")}`);
  return sent;
}

/** Throws unless the transaction failed with the program's error `name`. */
export function expectError(sent: Sent, name: BrotErrorName) {
  if (sent.ok) throw new Error(`expected ${name}, but the transaction succeeded`);
  if (sent.code !== BrotError[name]) {
    throw new Error(`expected ${name} (${BrotError[name]}), got ${sent.error}\n${sent.logs.join("\n")}`);
  }
}

export const balance = (w: { client: Client }, address: Address) => {
  const account = w.client.svm.getAccount(address);
  return account.exists ? BigInt(account.lamports) : 0n;
};
export const accountData = (w: { client: Client }, address: Address) => {
  const account = w.client.svm.getAccount(address);
  if (!account.exists) throw new Error(`account ${address} does not exist`);
  return account.data;
};
export const rentFor = (w: { client: Client }, size: number) =>
  w.client.svm.minimumBalanceForRentExemption(BigInt(size));
