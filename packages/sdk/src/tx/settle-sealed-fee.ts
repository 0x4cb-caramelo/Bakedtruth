/**
 * Purpose: `settle_sealed_fee` (Sprint 15), built by the Codama client with every program address derived
 *          here: once the campaign is finalized, a sponsor's held fee goes back to the sponsor on a void the house
 *          caused, or else to the fee vault, and its `SealedFee` closes with the rent back to the sponsor.
 * Version: 0.1.0
 * Sprint:  15 (lane L15)
 *
 * Any wallet may send it; the program chooses the amount and every destination (the stored sponsor, the fee
 * vault), so the only input is whose fee, on which campaign.
 */
import type { Address, Instruction } from "@solana/kit";

import { getSettleSealedFeeInstruction } from "../idl/generated/instructions";
import { feeVaultAddress, sealedFeeAddress } from "../read/pdas";

/** `settle_sealed_fee` for `sponsor`'s `SealedFee` on `campaign`. */
export async function buildSettleSealedFee(a: { campaign: Address; sponsor: Address }): Promise<Instruction> {
  return getSettleSealedFeeInstruction({
    sealedFee: await sealedFeeAddress(a.campaign, a.sponsor),
    campaign: a.campaign,
    sponsor: a.sponsor,
    feeVault: await feeVaultAddress(),
  });
}
