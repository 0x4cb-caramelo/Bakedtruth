/**
 * Purpose: what the mainnet scripts need of Squads v4, the multisig that holds the upgrade authority, `admin` and
 *          `fee_recipient` (Sprint 18): its program id, its PDAs (multisig, vault, transaction, proposal, program
 *          config), the `Multisig` account decoded (threshold, time lock, members), and a vault transaction's message
 *          compiled to the bytes Squads stores and the Squads CLI takes (`vault-transaction-create
 *          --transaction-message`). Written by hand from Squads' published IDL and source, with no new dependency.
 * Version: 0.1.0
 * Sprint:  18 (mainnet), lane L18
 *
 * Sources (read 2026-10-13): github.com/Squads-Protocol/v4 at `main`: sdk/multisig/idl/squads_multisig_program.json
 * (version 2.1.0, program SQDS4ep65T869zMMBKyuUq6aD6EgTu8psMjkvj52pCf), programs/squads_multisig_program/src/
 * state/seeds.rs and instructions/vault_transaction_create.rs (`TransactionMessage`: u8 counts, `SmallVec<u8, _>`
 * keys and instructions, `SmallVec<u16, u8>` data). The rehearsal (scripts/mainnet/) runs these bytes through the
 * Squads program on a mainnet fork.
 */
import { createHash } from "node:crypto";

import {
  address,
  getAddressDecoder,
  getAddressEncoder,
  getProgramDerivedAddress,
  getU64Encoder,
  isSignerRole,
  isWritableRole,
  type Address,
  type Instruction,
} from "@solana/kit";

import { account, type Rpc } from "../validator/rpc";

export const SQUADS_V4 = address("SQDS4ep65T869zMMBKyuUq6aD6EgTu8psMjkvj52pCf");

const key = (a: Address) => getAddressEncoder().encode(a);
const index = (n: bigint) => getU64Encoder().encode(n);
type Seeds = Parameters<typeof getProgramDerivedAddress>[0]["seeds"];
const pda = async (seeds: Seeds) => (await getProgramDerivedAddress({ programAddress: SQUADS_V4, seeds }))[0];

export const multisigAddress = (createKey: Address) => pda(["multisig", "multisig", key(createKey)]);
export const vaultAddress = (multisig: Address, vault = 0) =>
  pda(["multisig", key(multisig), "vault", Uint8Array.of(vault)]);
export const transactionAddress = (multisig: Address, i: bigint) =>
  pda(["multisig", key(multisig), "transaction", index(i)]);
export const proposalAddress = (multisig: Address, i: bigint) =>
  pda(["multisig", key(multisig), "transaction", index(i), "proposal"]);
export const programConfigAddress = () => pda(["multisig", "program_config"]);

/** Anchor's 8-byte discriminator: the first bytes of sha256 of `<namespace>:<name>`. */
export const discriminator = (namespace: "global" | "account", name: string) =>
  Uint8Array.from(createHash("sha256").update(`${namespace}:${name}`).digest().subarray(0, 8));

export type MultisigState = {
  configAuthority: Address;
  threshold: number;
  timeLock: number;
  transactionIndex: bigint;
  staleTransactionIndex: bigint;
  members: { key: Address; mask: number }[];
};

/** The `Multisig` account: owner Squads v4 and its discriminator checked before a field is read. */
export async function readMultisig(rpc: Rpc, multisig: Address): Promise<MultisigState> {
  const found = await account(rpc, multisig);
  if (!found || found.owner !== SQUADS_V4) throw new Error(`${multisig} is not a Squads v4 account`);
  const d = found.data;
  if (!discriminator("account", "Multisig").every((b, i) => d[i] === b)) throw new Error(`${multisig}: not a Multisig`);
  const view = new DataView(d.buffer, d.byteOffset);
  const at = d[94] === 1 ? 127 : 95; // after `rent_collector: Option<Pubkey>`: then `bump`, then the members
  const count = view.getUint32(at + 1, true);
  const members = Array.from({ length: count }, (_, i) => ({
    key: getAddressDecoder().decode(d.subarray(at + 5 + 33 * i, at + 37 + 33 * i)),
    mask: d[at + 37 + 33 * i],
  }));
  return {
    configAuthority: getAddressDecoder().decode(d.subarray(40, 72)),
    threshold: view.getUint16(72, true),
    timeLock: view.getUint32(74, true),
    transactionIndex: view.getBigUint64(78, true),
    staleTransactionIndex: view.getBigUint64(86, true),
    members,
  };
}

export type MessageKey = { address: Address; signer: boolean; writable: boolean };

/**
 * A vault transaction's message: the vault first (it pays and signs, through the Squads program), then the other
 * signers, the writable accounts and the read-only ones, as Squads' `TransactionMessage` orders them.
 */
export function compileVaultMessage(vault: Address, ixs: Instruction[]): { bytes: Uint8Array; keys: MessageKey[] } {
  const seen = new Map<Address, MessageKey>([[vault, { address: vault, signer: true, writable: true }]]);
  const note = (a: Address, signer: boolean, writable: boolean) => {
    const was = seen.get(a) ?? { address: a, signer: false, writable: false };
    seen.set(a, { address: a, signer: was.signer || signer, writable: was.writable || writable });
  };
  for (const ix of ixs) {
    note(ix.programAddress, false, false);
    for (const meta of ix.accounts ?? []) note(meta.address, isSignerRole(meta.role), isWritableRole(meta.role));
  }
  const all = [...seen.values()];
  const group = (signer: boolean, writable: boolean) =>
    all.filter((k) => k.signer === signer && k.writable === writable && k.address !== vault);
  const keys = [seen.get(vault)!, ...group(true, true), ...group(true, false), ...group(false, true)];
  keys.push(...group(false, false));
  const position = new Map(keys.map((k, i) => [k.address, i]));
  if (keys.length > 255 || ixs.length > 255) throw new Error("a vault message holds at most 255 keys and instructions");
  const out: number[] = [keys.filter((k) => k.signer).length, keys.filter((k) => k.signer && k.writable).length];
  out.push(keys.filter((k) => !k.signer && k.writable).length, keys.length);
  for (const k of keys) out.push(...key(k.address));
  out.push(ixs.length);
  for (const ix of ixs) {
    const data = ix.data ?? new Uint8Array();
    if (data.length > 0xffff) throw new Error("an instruction's data is at most 65,535 bytes in a vault message");
    out.push(position.get(ix.programAddress)!, ix.accounts?.length ?? 0);
    out.push(...(ix.accounts ?? []).map((meta) => position.get(meta.address)!));
    out.push(data.length & 0xff, data.length >> 8, ...data);
  }
  out.push(0); // no address lookup tables
  return { bytes: Uint8Array.from(out), keys };
}
