/**
 * Purpose: builders for every instruction of the program, with the accounts in the frozen order of
 *          programs/brot-markets/src/instructions/mod.rs, and helpers that tamper with one slot or
 *          the data for the negative tests.
 * Version: 0.0.1
 * Sprint:  02 (pot core on Pinocchio); frozen at the sprint's opening with the program's contract
 */
import { AccountRole, type Address, type Instruction, type TransactionSigner } from "@solana/kit";

import { encode } from "./layouts";
import * as P from "./program";
import * as S from "./structs";

type Meta = { address: Address; role: AccountRole; signer?: TransactionSigner };
const ro = (address: Address): Meta => ({ address, role: AccountRole.READONLY });
const rw = (address: Address): Meta => ({ address, role: AccountRole.WRITABLE });
const signer = (s: TransactionSigner, writable = false): Meta => ({
  address: s.address,
  role: writable ? AccountRole.WRITABLE_SIGNER : AccountRole.READONLY_SIGNER,
  signer: s,
});
const eventSlots = (): Meta[] => [ro(P.EVENT_AUTHORITY), ro(P.PROGRAM_ID)];
const data = (discriminator: number, args: Uint8Array = new Uint8Array()) => Uint8Array.of(discriminator, ...args);
const ix = (accounts: Meta[], bytes: Uint8Array): Instruction => ({
  programAddress: P.PROGRAM_ID,
  accounts,
  data: bytes,
});

/** The creation parameters of a fresh config, as the founder decided them (D-b, P-5, ...). */
export type CreationParams = Record<string, unknown>;

export async function initializeConfigIx(a: {
  authority: TransactionSigner;
  admin: Address;
  feeRecipient: Address;
  params: CreationParams;
}) {
  const args = encode(S.INITIALIZE_CONFIG_ARGS, { admin: a.admin, fee_recipient: a.feeRecipient, params: a.params });
  const accounts = [signer(a.authority, true), rw(await P.configPda()), rw(await P.feeVaultPda())];
  accounts.push(ro(await P.programDataPda()), ro(P.SYSTEM_PROGRAM_ID), ...eventSlots());
  return ix(accounts, data(P.IX.ADMIN_INITIALIZE_CONFIG, args));
}

/** The four-slot shape of the admin and team instructions: signer, config, the event slots. */
async function configIx(who: TransactionSigner, discriminator: number, args?: Uint8Array) {
  return ix([signer(who), rw(await P.configPda()), ...eventSlots()], data(discriminator, args));
}

export const setTeamIx = (admin: TransactionSigner, team: Address[], teamLen = team.length) =>
  configIx(admin, P.IX.ADMIN_SET_TEAM, encode(S.SET_TEAM_ARGS, { team_len: teamLen, team }));
export const setCreationParamsIx = (admin: TransactionSigner, params: CreationParams) =>
  configIx(admin, P.IX.ADMIN_SET_CREATION_PARAMS, encode(S.CREATION_PARAMS, params));
export const setFeeRecipientIx = (admin: TransactionSigner, feeRecipient: Address) =>
  configIx(admin, P.IX.ADMIN_SET_FEE_RECIPIENT, encode(S.SET_FEE_RECIPIENT_ARGS, { fee_recipient: feeRecipient }));
export const transferAdminIx = (admin: TransactionSigner, newAdmin: Address) =>
  configIx(admin, P.IX.ADMIN_TRANSFER_ADMIN, encode(S.TRANSFER_ADMIN_ARGS, { new_admin: newAdmin }));
export const acceptAdminIx = (newAdmin: TransactionSigner) => configIx(newAdmin, P.IX.ADMIN_ACCEPT_ADMIN);
export const pauseEntriesIx = (teamMember: TransactionSigner) => configIx(teamMember, P.IX.TEAM_PAUSE_ENTRIES);
export const resumeEntriesIx = (admin: TransactionSigner) => configIx(admin, P.IX.ADMIN_RESUME_ENTRIES);

export type OpenArgs = {
  id: bigint;
  kind?: number;
  direction?: number;
  feedId: Uint8Array;
  target: bigint;
  deadlineAt: bigint;
  openingUsd: bigint;
  maxLamports: bigint;
};

/** `user_open_campaign`. The metric and SOL/USD slots default to the sponsored accounts. */
export async function openCampaignIx(
  creator: TransactionSigner,
  a: OpenArgs,
  slots: { metric?: Address; solUsd?: Address } = {},
) {
  const campaign = await P.campaignPda(a.id);
  const args = encode(S.OPEN_CAMPAIGN_ARGS, {
    id: a.id,
    kind: a.kind ?? P.ReaderKind.PriceTouch,
    direction: a.direction ?? P.Direction.Above,
    feed_id: a.feedId,
    target: a.target,
    deadline_at: a.deadlineAt,
    opening_usd: a.openingUsd,
    max_lamports: a.maxLamports,
  });
  const accounts = [signer(creator, true), rw(await P.configPda()), rw(campaign), rw(await P.vaultPda(campaign))];
  accounts.push(ro(slots.metric ?? (await P.sponsoredPriceAccount(a.feedId))), ro(slots.solUsd ?? P.SOL_USD_ACCOUNT));
  accounts.push(ro(P.SYSTEM_PROGRAM_ID), ...eventSlots());
  return ix(accounts, data(P.IX.USER_OPEN_CAMPAIGN, args));
}

export type JoinArgs = { side: number; amount: bigint; minReturnBps?: number; expectedEntryTotal?: bigint };

/** `user_join_campaign`. `metric` is the campaign's `metric_account`. */
export async function joinCampaignIx(baker: TransactionSigner, campaign: Address, metric: Address, a: JoinArgs) {
  const args = encode(S.JOIN_CAMPAIGN_ARGS, {
    side: a.side,
    amount: a.amount,
    min_return_bps: a.minReturnBps ?? 0,
    expected_entry_total: a.expectedEntryTotal ?? 0n,
  });
  const accounts = [signer(baker, true), ro(await P.configPda()), rw(campaign), rw(await P.vaultPda(campaign))];
  accounts.push(rw(await P.entryPda(campaign, baker.address)), ro(metric), ro(P.SYSTEM_PROGRAM_ID), ...eventSlots());
  return ix(accounts, data(P.IX.USER_JOIN_CAMPAIGN, args));
}

// --- Tampering, for the negative tests ------------------------------------------------------------

const isSigner = (role: AccountRole) => role === AccountRole.READONLY_SIGNER || role === AccountRole.WRITABLE_SIGNER;

/**
 * The same instruction with slot `index` replaced: another address, another role, or both. A slot
 * whose new role does not sign loses its signer; a signing slot given another address without a
 * `signer` stops signing (pass `signer` to keep it signing under the new address).
 */
export function withSlot(instruction: Instruction, index: number, slot: Partial<Meta>): Instruction {
  const accounts = [...(instruction.accounts ?? [])] as Meta[];
  const old = accounts[index];
  const next = { ...old, ...slot } as Meta;
  if (slot.address !== undefined && slot.address !== old.address && slot.signer === undefined) {
    delete next.signer;
    if (slot.role === undefined && isSigner(next.role)) {
      next.role = next.role === AccountRole.WRITABLE_SIGNER ? AccountRole.WRITABLE : AccountRole.READONLY;
    }
  }
  if (!isSigner(next.role)) delete next.signer;
  accounts[index] = next;
  return { ...instruction, accounts };
}

/** The same instruction with other data (for wrong lengths and unknown discriminators). */
export const withData = (instruction: Instruction, bytes: Uint8Array): Instruction => ({ ...instruction, data: bytes });
