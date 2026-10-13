/**
 * Purpose: every program-derived address a client needs: the config, the fee vault, a campaign and
 *          its vault, an entry, a join, a referral link, a sealed fee, the event authority, the program's
 *          ProgramData, and a Pyth feed's sponsored account. Seeds as programs/brot-markets/src/constants.rs
 *          writes them.
 * Version: 0.1.1
 * Sprint:  05 (SDK); the seeds are Sprint 02's, the join's Sprint 04's; the referral link's and the sealed
 *          fee's from the scaffold of Sprints 14–15 (2026-10-13)
 *
 * The IDL carries no seeds (Shank), so they are written here once; tests/sdk/contract-source.test.ts checks
 * them against constants.rs, and tests/sdk/builders.test.ts compares every derived slot with the test kit's.
 */
import {
  getAddressEncoder,
  getProgramDerivedAddress,
  getU16Encoder,
  getU32Encoder,
  getU64Encoder,
  type Address,
  type ProgramDerivedAddress,
} from "@solana/kit";

import { hexToBytes } from "./bytes";
import { BPF_LOADER_UPGRADEABLE_ID, PROGRAM_ID, PYTH_PUSH_ORACLE_ID, PYTH_SHARD, SEEDS } from "./constants";

const key = (value: Address) => getAddressEncoder().encode(value);

/** A PDA of the program (or of `programAddress`) with its bump. */
const derive = (seeds: Parameters<typeof getProgramDerivedAddress>[0]["seeds"], programAddress = PROGRAM_ID) =>
  getProgramDerivedAddress({ programAddress, seeds });

/** `["config"]`. */
export const findConfigPda = (): Promise<ProgramDerivedAddress> => derive([SEEDS.config]);
/** `["fee_vault"]`: data-less, the fees Brot keeps until `sweep_fees`. */
export const findFeeVaultPda = (): Promise<ProgramDerivedAddress> => derive([SEEDS.feeVault]);
/** `["campaign", id as u64 LE]`: the client draws `id` at random and saves it before signing (T17). */
export const findCampaignPda = (id: bigint): Promise<ProgramDerivedAddress> =>
  derive([SEEDS.campaign, getU64Encoder().encode(id)]);
/** `["vault", campaign]`: data-less, the campaign's lamports. */
export const findVaultPda = (campaign: Address): Promise<ProgramDerivedAddress> => derive([SEEDS.vault, key(campaign)]);
/** `["entry", campaign, baker]`: one baker's entry, both sides. */
export const findEntryPda = (campaign: Address, baker: Address): Promise<ProgramDerivedAddress> =>
  derive([SEEDS.entry, key(campaign), key(baker)]);
/** `["join", campaign, baker, index as u32 LE]`: one account per join (Sprint 04). */
export const findJoinPda = (campaign: Address, baker: Address, index: number): Promise<ProgramDerivedAddress> =>
  derive([SEEDS.join, key(campaign), key(baker), getU32Encoder().encode(index)]);
/** `["referral", referee]`: who referred a wallet, signed once by the referee (Sprint 14). */
export const findReferralLinkPda = (referee: Address): Promise<ProgramDerivedAddress> =>
  derive([SEEDS.referral, key(referee)]);
/** `["sealed", campaign, sponsor]`: the fee a sponsor's sealed entries hold in a campaign (Sprint 15). */
export const findSealedFeePda = (campaign: Address, sponsor: Address): Promise<ProgramDerivedAddress> =>
  derive([SEEDS.sealedFee, key(campaign), key(sponsor)]);
/** `["__event_authority"]`, also the constant `EVENT_AUTHORITY` (bump 254). */
export const findEventAuthorityPda = (): Promise<ProgramDerivedAddress> => derive([SEEDS.eventAuthority]);
/** The program's ProgramData account under the upgradeable loader, which `admin_initialize_config` reads. */
export const findProgramDataPda = (): Promise<ProgramDerivedAddress> =>
  derive([key(PROGRAM_ID)], BPF_LOADER_UPGRADEABLE_ID);
/** A feed's sponsored push-oracle account: `[shard 0 as u16 LE, feed_id]` under the push oracle. */
export const findSponsoredPriceAccount = (feedId: Uint8Array | string): Promise<ProgramDerivedAddress> =>
  derive(
    [getU16Encoder().encode(PYTH_SHARD), typeof feedId === "string" ? hexToBytes(feedId) : feedId],
    PYTH_PUSH_ORACLE_ID,
  );

/** The address alone of each PDA above, for callers that do not need the bump. */
export const configAddress = async () => (await findConfigPda())[0];
export const feeVaultAddress = async () => (await findFeeVaultPda())[0];
export const campaignAddress = async (id: bigint) => (await findCampaignPda(id))[0];
export const vaultAddress = async (campaign: Address) => (await findVaultPda(campaign))[0];
export const entryAddress = async (campaign: Address, baker: Address) => (await findEntryPda(campaign, baker))[0];
export const joinAddress = async (campaign: Address, baker: Address, index: number) =>
  (await findJoinPda(campaign, baker, index))[0];
export const referralLinkAddress = async (referee: Address) => (await findReferralLinkPda(referee))[0];
export const sealedFeeAddress = async (campaign: Address, sponsor: Address) =>
  (await findSealedFeePda(campaign, sponsor))[0];
export const programDataAddress = async () => (await findProgramDataPda())[0];
export const sponsoredPriceAddress = async (feedId: Uint8Array | string) =>
  (await findSponsoredPriceAccount(feedId))[0];
