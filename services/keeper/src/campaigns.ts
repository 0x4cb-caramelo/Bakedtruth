/**
 * Purpose: the keeper's view of the chain: every campaign account of the program that is open right now. One
 *          `getProgramAccounts` filtered by the campaign's size; each account is decoded by the SDK's loader, which
 *          refuses a wrong owner, tag or version (those are skipped, never trusted), and kept only while Open.
 * Version: 0.1.0
 * Sprint:  06 (server and primary keeper), MVP happy path
 *
 * MVP scope: one call per cycle, no batching by 100 yet (Sprint 06's batched reads come later).
 */
import { ACCOUNT_LEN, PROGRAM_ID, Status, decodeCampaign, type Campaign, type SolanaRpc } from "@brot/sdk/read";
import { getBase64Encoder, type Address } from "@solana/kit";

export type OpenCampaign = { address: Address; campaign: Campaign };

export async function listOpenCampaigns(rpc: SolanaRpc): Promise<OpenCampaign[]> {
  const accounts = await rpc
    .getProgramAccounts(PROGRAM_ID, {
      encoding: "base64",
      filters: [{ dataSize: BigInt(ACCOUNT_LEN.campaign) }],
    })
    .send();
  const open: OpenCampaign[] = [];
  for (const { pubkey, account } of accounts) {
    const data = new Uint8Array(getBase64Encoder().encode(account.data[0]));
    let campaign: Campaign;
    try {
      campaign = decodeCampaign({ owner: account.owner, data });
    } catch {
      continue; // not a campaign of this program (wrong owner, tag or version): skipped, never read further
    }
    if (campaign.status === Status.Open) open.push({ address: pubkey, campaign });
  }
  return open;
}
