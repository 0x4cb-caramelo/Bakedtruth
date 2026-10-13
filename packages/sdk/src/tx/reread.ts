/**
 * Purpose: `reread_campaign`, stage 1 of a contest (TP 3.4.7), built by the Codama client: any wallet, at the top
 *          level only, runs the campaign's reading again. The same reading pays out with the stored result; a
 *          different one, or a reader that refuses now, opens stage 2 (48 hours for the admin).
 * Version: 0.1.0
 * Sprint:  14 (lane L14B)
 *
 * The proof slot is the resolution's: a price campaign's YES proof (any fully verified account of the feed), the
 * metric account when the caller offers none, as `buildResolveCampaign` does. After the deadline's 60 s the program
 * reads only the sponsored account, and the other kinds never read the slot. It never writes a new result.
 */
import { type Address, type Instruction } from "@solana/kit";

import { getRereadCampaignInstruction } from "../idl/generated/instructions";
import { configAddress } from "../read/pdas";

/** `reread_campaign`: the campaign (contested, stage 1), its locked metric account and, for a price YES, a proof. */
export async function buildRereadCampaign(a: {
  campaign: Address;
  metricAccount: Address;
  proofAccount?: Address;
}): Promise<Instruction> {
  return getRereadCampaignInstruction({
    campaign: a.campaign,
    config: await configAddress(),
    metricAccount: a.metricAccount,
    proofAccount: a.proofAccount ?? a.metricAccount,
  });
}
