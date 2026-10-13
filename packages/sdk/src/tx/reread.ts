/**
 * Purpose: `reread_campaign`, stage 1 of a contest (TP 3.4.7), built by the Codama client: any wallet, at the top
 *          level only, runs the campaign's reading again. The same reading pays out with the stored result, but only
 *          from stage 1's deadline on, 24 hours after the contest opened (`RereadBeforeTimelock` before it: the
 *          founder's answer to D2); a different one, or a reader that cannot decide now, opens stage 2 at once (48
 *          hours for the admin, counted from stage 1's deadline at the latest).
 * Version: 0.1.2 (D2: a matching re-read's 24-hour wait; review fix F9: no proof offered unless the caller passes one)
 * Sprint:  14 (lane L14B)
 *
 * The proof slot is the resolution's. Unless the caller passes a proof, it holds the program's own address, which
 * the program reads as "no proof offered" (`reread_campaign.rs`): a price campaign inside its proof window then reads
 * as not decidable now, and escalates. A proof passed is read only there, and a proof the reader refuses refuses the
 * re-read with the reader's error (review fix F4). After the deadline's 60 s the program reads only the sponsored
 * account, and the other kinds never read the slot. It never writes a new result.
 */
import { type Address, type Instruction } from "@solana/kit";

import { getRereadCampaignInstruction } from "../idl/generated/instructions";
import { PROGRAM_ID } from "../read/constants";
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
    proofAccount: a.proofAccount ?? PROGRAM_ID,
  });
}
