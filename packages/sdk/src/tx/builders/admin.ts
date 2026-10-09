/**
 * Purpose: the admin and team-configuration instructions, built by the Codama client from the Shank
 *          IDL with every program address derived here: initialisation, the team keys, the creation
 *          parameters, the fee recipient, the two-step admin change, the pause and its end.
 * Version: 0.1.0
 * Sprint:  05 (SDK); T9: the Codama client is the SDK's builder layer
 *
 * Who may sign each one is the program's rule (TP 3.4.3, 3.4.9); a builder only fills the slots in
 * the order of programs/brot-markets/src/instructions/interface.rs.
 */
import { address, type Address, type Instruction, type TransactionSigner } from "@solana/kit";

import {
  getAdminAcceptAdminInstruction,
  getAdminInitializeConfigInstruction,
  getAdminResumeEntriesInstruction,
  getAdminSetCreationParamsInstruction,
  getAdminSetFeeRecipientInstruction,
  getAdminSetTeamInstruction,
  getAdminTransferAdminInstruction,
  getTeamPauseEntriesInstruction,
} from "../../idl/generated/instructions";
import type { CreationParamsArgs } from "../../idl/generated/types";
import { configAddress, feeVaultAddress, programDataAddress } from "../../read/pdas";

export type { CreationParamsArgs } from "../../idl/generated/types";

/** The all-zero address, which fills the unused team slots (`GlobalConfig.team` past `team_len`). */
export const ZERO_ADDRESS = address("11111111111111111111111111111111");
/** Most team keys the config holds, one per person (Q12). */
export const MAX_TEAM = 5;

/** `admin_initialize_config`: signed by the program's upgrade authority, in the deploy's session. */
export async function buildInitializeConfig(a: {
  authority: TransactionSigner;
  admin: Address;
  feeRecipient: Address;
  params: CreationParamsArgs;
}): Promise<Instruction> {
  return getAdminInitializeConfigInstruction({
    authority: a.authority,
    config: await configAddress(),
    feeVault: await feeVaultAddress(),
    programData: await programDataAddress(),
    admin: a.admin,
    feeRecipient: a.feeRecipient,
    params: a.params,
  });
}

/** `admin_set_team`: up to five keys, the rest of the slots zero. */
export async function buildSetTeam(a: { admin: TransactionSigner; team: readonly Address[] }): Promise<Instruction> {
  if (a.team.length > MAX_TEAM) throw new RangeError(`at most ${MAX_TEAM} team keys`);
  const team = [...a.team, ...Array<Address>(MAX_TEAM - a.team.length).fill(ZERO_ADDRESS)];
  return getAdminSetTeamInstruction({ admin: a.admin, config: await configAddress(), teamLen: a.team.length, team });
}

/** `admin_set_creation_params`: future campaigns only; raises `params_version` by one. */
export async function buildSetCreationParams(a: {
  admin: TransactionSigner;
  params: CreationParamsArgs;
}): Promise<Instruction> {
  return getAdminSetCreationParamsInstruction({
    admin: a.admin,
    config: await configAddress(),
    creationParams: a.params,
  });
}

/** `admin_set_fee_recipient`: where `sweep_fees` sends the fee vault. */
export async function buildSetFeeRecipient(a: { admin: TransactionSigner; feeRecipient: Address }) {
  return getAdminSetFeeRecipientInstruction({
    admin: a.admin,
    config: await configAddress(),
    feeRecipient: a.feeRecipient,
  });
}

/** `admin_transfer_admin`: names the pending admin; the zero address cancels. */
export async function buildTransferAdmin(a: { admin: TransactionSigner; newAdmin: Address }): Promise<Instruction> {
  return getAdminTransferAdminInstruction({ admin: a.admin, config: await configAddress(), newAdmin: a.newAdmin });
}

/** `admin_accept_admin`: the pending admin accepts. */
export async function buildAcceptAdmin(a: { newAdmin: TransactionSigner }): Promise<Instruction> {
  return getAdminAcceptAdminInstruction({ newAdmin: a.newAdmin, config: await configAddress() });
}

/** `team_pause_entries`: a team key stops joins and openings, never payouts. */
export async function buildPauseEntries(a: { teamMember: TransactionSigner }): Promise<Instruction> {
  return getTeamPauseEntriesInstruction({ teamMember: a.teamMember, config: await configAddress() });
}

/** `admin_resume_entries`: the admin ends the pause. */
export async function buildResumeEntries(a: { admin: TransactionSigner }): Promise<Instruction> {
  return getAdminResumeEntriesInstruction({ admin: a.admin, config: await configAddress() });
}
