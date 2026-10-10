/**
 * Purpose: what the site's tests share: the world's accounts read the way the page reads them (owner and bytes), the
 *          inputs of the entry panel's estimate, a key-value store in memory (and one that refuses everything), and a
 *          stand-in for the wallet adapter's `sendTransaction` that signs the exact message bytes it is handed with the
 *          baker's key and submits them, or misbehaves the ways a wallet can (no answer, a refusal, a dropped send).
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry)
 */
import { createSolanaRpc, getBase64Decoder, signBytes, type Address, type KeyPairSigner } from "@solana/kit";
import type { VersionedTransaction } from "@solana/web3.js";

import { configAddress, decodeCampaign, decodeGlobalConfig, type ChainTime, type FetchedAccount } from "@brot/sdk/read";

import type { JoinInputs } from "../../app/features/entry/estimate";
import type { KeyValueStore } from "../../app/features/entry/retry-guard";
import type { SendToWallet } from "../../app/features/entry/submit";
import type { World } from "../brot/setup";

/** An account of the world as an RPC returns it: owner and bytes. */
export function rawOf(w: World, at: Address): FetchedAccount {
  const account = w.client.svm.getAccount(at);
  if (!account.exists) throw new Error(`no account at ${at}`);
  return { address: at, owner: account.programAddress, data: new Uint8Array(account.data) };
}

export function chainOf(w: World): ChainTime {
  const clock = w.client.svm.getClock();
  return { slot: clock.slot, epoch: clock.epoch, unixTimestamp: clock.unixTimestamp };
}

/** The estimate's inputs for `campaign`, read from the world, with no wallet entry. */
export async function inputsOf(w: World, campaign: Address): Promise<JoinInputs> {
  const c = decodeCampaign(rawOf(w, campaign));
  return {
    campaign: c,
    config: decodeGlobalConfig(rawOf(w, await configAddress())),
    entry: null,
    metric: rawOf(w, c.metricAccount),
    chain: chainOf(w),
  };
}

export function memoryStore(): KeyValueStore & { map: Map<string, string> } {
  const map = new Map<string, string>();
  return {
    map,
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => void map.set(key, value),
    removeItem: (key) => void map.delete(key),
  };
}

/** A store whose every call throws, as a browser with storage blocked. */
export const refusingStore = (): KeyValueStore => ({
  getItem: () => {
    throw new Error("storage blocked");
  },
  setItem: () => {
    throw new Error("storage blocked");
  },
  removeItem: () => {
    throw new Error("storage blocked");
  },
});

/** "answer": signs, sends, returns the signature. "no-answer": signs and sends, then throws (a frozen tab).
 * "refuse": the person says no (code 4001). "drop": throws without sending. */
export type WalletMode = "answer" | "no-answer" | "refuse" | "drop";

export function testWallet(
  baker: KeyPairSigner,
  rpcUrl: string,
  mode: WalletMode = "answer",
): SendToWallet & { sent: VersionedTransaction[] } {
  const rpc = createSolanaRpc(rpcUrl);
  const sent: VersionedTransaction[] = [];
  const send = async (tx: VersionedTransaction): Promise<string> => {
    if (mode === "refuse") throw Object.assign(new Error("User rejected the request."), { code: 4001 });
    if (mode === "drop") throw new Error("the wallet session timed out");
    const signature = await signBytes(baker.keyPair.privateKey, tx.message.serialize());
    tx.signatures[0] = new Uint8Array(signature);
    sent.push(tx);
    const wire = getBase64Decoder().decode(tx.serialize());
    const landed = await rpc.sendTransaction(wire as never, { encoding: "base64" }).send();
    if (mode === "no-answer") throw new Error("the wallet session closed before it answered");
    return landed;
  };
  return Object.assign(send, { sent });
}

/** A sleep that does not wait, and moves the world on with `onNap` (a block height, a clock). */
export const napThen = (onNap: () => void) => async () => onNap();
