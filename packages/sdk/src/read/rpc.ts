/**
 * Purpose: the reads the SDK makes through any Solana RPC (Kit's `createSolanaRpc`, no paid key, A-5):
 *          an account's owner and bytes, several at once, the cluster's clock from the Clock sysvar
 *          (chain time, never the device's: A-7), the epoch schedule, and the rent-exempt minimum.
 * Version: 0.1.0
 * Sprint:  05 (SDK)
 *
 * Read-only: nothing here signs or sends. The Clock sysvar is decoded here (40 bytes: slot, epoch start,
 * epoch, leader schedule epoch, Unix time) because Kit's root does not re-export its sysvar helpers.
 */
import { address, createSolanaRpc, getBase64Encoder, type Address } from "@solana/kit";

import { CLOCK_SYSVAR_ID, EPOCH_SCHEDULE_SYSVAR_ID } from "./constants";
import { Cursor } from "./chain/cursor";
import { epochScheduleFromBytes, type EpochSchedule } from "./chain/epoch";
import type { FetchedAccount } from "./quote";

/** Kit's RPC client, as `createSolanaRpc` returns it. */
export type SolanaRpc = ReturnType<typeof createSolanaRpc>;

/** The cluster's clock, as the program's `Clock::get()` sees it. */
export type ChainTime = { slot: bigint; epoch: bigint; unixTimestamp: bigint };

/** A client for `rpcUrl` (any provider: the point of `recheck` is that it need not be ours). */
export const rpcFor = (rpcUrl: string): SolanaRpc => createSolanaRpc(rpcUrl);

const base64Bytes = (data: readonly [string, string] | string) =>
  new Uint8Array(getBase64Encoder().encode(Array.isArray(data) ? data[0] : (data as string)));

/** One account's owner and bytes, or `null` when it does not exist. */
export async function fetchRaw(rpc: SolanaRpc, at: Address | string): Promise<FetchedAccount | null> {
  const { value } = await rpc.getAccountInfo(address(at), { encoding: "base64", commitment: "confirmed" }).send();
  return value ? { address: at, owner: value.owner, data: base64Bytes(value.data) } : null;
}

/** Several accounts in one call, in order; `null` for each that does not exist. */
export async function fetchRawMany(rpc: SolanaRpc, at: readonly (Address | string)[]) {
  const { value } = await rpc
    .getMultipleAccounts(
      at.map((a) => address(a)),
      { encoding: "base64", commitment: "confirmed" },
    )
    .send();
  return value.map((account, i) =>
    account ? { address: at[i], owner: account.owner, data: base64Bytes(account.data) } : null,
  ) as (FetchedAccount | null)[];
}

/** The Clock sysvar's slot, epoch and Unix time: the time every public state is computed against. */
export async function readChainTime(rpc: SolanaRpc): Promise<ChainTime> {
  const clock = await fetchRaw(rpc, CLOCK_SYSVAR_ID);
  if (!clock) throw new Error("the Clock sysvar is missing");
  const c = new Cursor(clock.data);
  const slot = c.u64();
  c.skip(8); // epoch_start_timestamp
  const epoch = c.u64();
  c.skip(8); // leader_schedule_epoch
  return { slot, epoch, unixTimestamp: c.i64() };
}

/** The EpochSchedule sysvar, which the epoch kinds' opening rule reads. */
export async function readEpochSchedule(rpc: SolanaRpc): Promise<EpochSchedule> {
  const schedule = await fetchRaw(rpc, EPOCH_SCHEDULE_SYSVAR_ID);
  if (!schedule) throw new Error("the EpochSchedule sysvar is missing");
  return epochScheduleFromBytes(schedule.data);
}

/** The rent-exempt minimum of an account of `size` bytes on this cluster (devnet: 5,080 lamports a byte). */
export async function rentExemptMinimum(rpc: SolanaRpc, size: number): Promise<bigint> {
  return BigInt(await rpc.getMinimumBalanceForRentExemption(BigInt(size)).send());
}
