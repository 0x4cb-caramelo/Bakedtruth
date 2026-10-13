/**
 * Purpose: the Squads v4 instructions the rehearsal sends on the mainnet fork, encoded by hand (Anchor discriminators
 *          and Borsh arguments) from Squads' published IDL, so no npm package is added: create a 2-of-3 multisig,
 *          create a vault transaction or a time-lock change, propose it, approve it, and execute it. On mainnet the
 *          signers do the same through the Squads app or `squads-multisig-cli` with their hardware wallets.
 * Version: 0.1.0
 * Sprint:  18 (mainnet), lane L18
 *
 * Source: github.com/Squads-Protocol/v4 `main`, sdk/multisig/idl/squads_multisig_program.json (2.1.0) and
 * instructions/vault_transaction_execute.rs (remaining accounts: the message's keys in order, the vault never a signer
 * there, since Squads signs for it). Anchor passes an absent optional account as the program's own id.
 */
import { AccountRole, getAddressEncoder, type Address, type Instruction, type TransactionSigner } from "@solana/kit";

import { SYSTEM_PROGRAM_ID } from "@brot/sdk/read";

import * as S from "../deploy/mainnet-squads";

const PERMISSIONS_ALL = 7; // Initiate | Vote | Execute
const u16 = (n: number) => [n & 0xff, n >> 8];
const u32 = (n: number) => [n & 0xff, (n >> 8) & 0xff, (n >> 16) & 0xff, n >>> 24];
const u64 = (n: bigint) => Array.from({ length: 8 }, (_, i) => Number((n >> BigInt(8 * i)) & 0xffn));
const key = (a: Address) => Array.from(getAddressEncoder().encode(a));
const none = [0];

const ro = (address: Address) => ({ address, role: AccountRole.READONLY });
const rw = (address: Address) => ({ address, role: AccountRole.WRITABLE });
const signer = (s: TransactionSigner, writable = false) => ({
  address: s.address,
  role: writable ? AccountRole.WRITABLE_SIGNER : AccountRole.READONLY_SIGNER,
  signer: s,
});
const ix = (name: string, accounts: Instruction["accounts"], args: number[]): Instruction => ({
  programAddress: S.SQUADS_V4,
  accounts,
  data: Uint8Array.from([...S.discriminator("global", name), ...args]),
});

/** `multisig_create_v2`: autonomous (no config authority), every member with every permission, no rent collector. */
export async function multisigCreate(a: {
  createKey: TransactionSigner;
  creator: TransactionSigner;
  treasury: Address;
  members: Address[];
  threshold: number;
  timeLock: number;
}) {
  const multisig = await S.multisigAddress(a.createKey.address);
  const members = a.members.flatMap((m) => [...key(m), PERMISSIONS_ALL]);
  const args = [
    ...none,
    ...u16(a.threshold),
    ...u32(a.members.length),
    ...members,
    ...u32(a.timeLock),
    ...none,
    ...none,
  ];
  const accounts = [ro(await S.programConfigAddress()), rw(a.treasury), rw(multisig)];
  accounts.push(signer(a.createKey), signer(a.creator, true), ro(SYSTEM_PROGRAM_ID));
  return { multisig, instruction: ix("multisig_create_v2", accounts, args) };
}

/** `vault_transaction_create` at index `i` (the multisig's `transaction_index` + 1), for vault 0. */
export async function vaultTransactionCreate(
  multisig: Address,
  i: bigint,
  creator: TransactionSigner,
  message: Uint8Array,
) {
  const args = [0, 0, ...u32(message.length), ...message, ...none]; // vault 0, no ephemeral signers, no memo
  const accounts = [rw(multisig), rw(await S.transactionAddress(multisig, i)), signer(creator)];
  return ix("vault_transaction_create", [...accounts, signer(creator, true), ro(SYSTEM_PROGRAM_ID)], args);
}

/** `config_transaction_create` with one action, `SetTimeLock` (variant 3), at index `i`. */
export async function setTimeLockCreate(multisig: Address, i: bigint, creator: TransactionSigner, seconds: number) {
  const args = [...u32(1), 3, ...u32(seconds), ...none];
  const accounts = [rw(multisig), rw(await S.transactionAddress(multisig, i)), signer(creator)];
  return ix("config_transaction_create", [...accounts, signer(creator, true), ro(SYSTEM_PROGRAM_ID)], args);
}

/** `proposal_create` for transaction `i`, active at once (not a draft). */
export async function proposalCreate(multisig: Address, i: bigint, creator: TransactionSigner) {
  const accounts = [ro(multisig), rw(await S.proposalAddress(multisig, i)), signer(creator)];
  return ix("proposal_create", [...accounts, signer(creator, true), ro(SYSTEM_PROGRAM_ID)], [...u64(i), 0]);
}

/** `proposal_approve` by one member. */
export async function proposalApprove(multisig: Address, i: bigint, member: TransactionSigner) {
  return ix("proposal_approve", [ro(multisig), signer(member, true), rw(await S.proposalAddress(multisig, i))], none);
}

/** `vault_transaction_execute`: the message's keys follow, in order, writable as the message says, none signing. */
export async function vaultTransactionExecute(
  multisig: Address,
  i: bigint,
  member: TransactionSigner,
  keys: S.MessageKey[],
) {
  const fixed = [ro(multisig), rw(await S.proposalAddress(multisig, i)), ro(await S.transactionAddress(multisig, i))];
  const rest = keys.map((k) => (k.writable ? rw(k.address) : ro(k.address)));
  return ix("vault_transaction_execute", [...fixed, signer(member), ...rest], []);
}

/** `config_transaction_execute`; no rent payer or System Program needed for a time-lock change. */
export async function configTransactionExecute(multisig: Address, i: bigint, member: TransactionSigner) {
  const accounts = [rw(multisig), signer(member), rw(await S.proposalAddress(multisig, i))];
  accounts.push(ro(await S.transactionAddress(multisig, i)), ro(S.SQUADS_V4), ro(S.SQUADS_V4));
  return ix("config_transaction_execute", accounts, []);
}

/** The Squads error a refused instruction carries, by name, for the codes the rehearsal expects. */
export const SQUADS_ERRORS: Record<number, string> = {
  6004: "Unauthorized",
  6005: "NotAMember",
  6007: "StaleProposal",
  6008: "InvalidProposalStatus",
  6021: "TimeLockNotReleased",
};
