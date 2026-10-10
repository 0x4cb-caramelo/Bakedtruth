/**
 * Purpose: one read of the chain: every campaign account of the program, decoded by the SDK (a wrong owner, tag or
 *          version is skipped), with its public state computed from the chain's own clock. Keeps no state; the store
 *          holds the last snapshot.
 * Version: 0.1.0
 * Sprint:  08 (indexer and API, hackathon MVP)
 *
 * Not in this slice: the "Closed because the outcome is knowable" state, which needs the metric account for each
 * campaign. Campaigns show Open until their entries close by time or epoch.
 */
import {
  ACCOUNT_LEN,
  PROGRAM_ID,
  decodeCampaign,
  publicState,
  readChainTime,
  type Campaign,
  type PublicView,
  type SolanaRpc,
} from "@brot/sdk/read";
import { getBase64Encoder, type Address } from "@solana/kit";
import type { ChainTime } from "@brot/sdk/read";

export type Row = { address: Address; campaign: Campaign; view: PublicView };
export type Snapshot = { takenAt: string; asOfSlot: bigint; chain: ChainTime; rows: Row[] };

export async function takeSnapshot(rpc: SolanaRpc): Promise<Snapshot> {
  const chain = await readChainTime(rpc);
  const accounts = await rpc
    .getProgramAccounts(PROGRAM_ID, { encoding: "base64", filters: [{ dataSize: BigInt(ACCOUNT_LEN.campaign) }] })
    .send();
  const rows: Row[] = [];
  for (const { pubkey, account } of accounts) {
    const data = new Uint8Array(getBase64Encoder().encode(account.data[0]));
    let campaign: Campaign;
    try {
      campaign = decodeCampaign({ owner: account.owner, data });
    } catch {
      continue; // not a campaign of this program: skipped, never read further
    }
    rows.push({ address: pubkey, campaign, view: publicState(campaign, chain) });
  }
  rows.sort((a, b) => (a.campaign.id < b.campaign.id ? -1 : a.campaign.id > b.campaign.id ? 1 : 0));
  return { takenAt: new Date().toISOString(), asOfSlot: chain.slot, chain, rows };
}
