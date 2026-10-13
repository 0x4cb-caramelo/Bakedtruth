/**
 * Purpose: the keeper's view of the program's own accounts: every campaign (one `getProgramAccounts` filtered by the
 *          campaign's size), by status when asked, and a campaign's entries (filtered by the entry's size and by the
 *          campaign's address at the entry's offset 4). Each account is decoded by the SDK's loader, which refuses a
 *          wrong owner, size, tag or version: those are skipped, never trusted. An entry whose stored campaign is not
 *          the one asked for is skipped too.
 * Version: 0.3.0 (Sprint 07 carry-over: one listing for every status, and the entries of a campaign)
 * Sprint:  07 (standby keeper and watchdog)
 */
import {
  ACCOUNT_LEN,
  PROGRAM_ID,
  Status,
  decodeCampaign,
  decodeEntry,
  type Campaign,
  type Entry,
  type SolanaRpc,
} from "@brot/sdk/read";
import { getBase64Encoder, type Address, type Base58EncodedBytes } from "@solana/kit";

export type OpenCampaign = { address: Address; campaign: Campaign };
export type EntryAt = { address: Address; entry: Entry; lamports: bigint };

/** The offset of `Entry.campaign`: tag, version, bump and `is_first` come first (state/entry.rs). */
const ENTRY_CAMPAIGN_OFFSET = 4n;

const bytesOf = (data: readonly [string, string] | string) =>
  new Uint8Array(getBase64Encoder().encode(Array.isArray(data) ? data[0] : (data as string)));

/** Every campaign account of the program, decoded; anything else of that size is skipped. */
export async function listAllCampaigns(rpc: SolanaRpc): Promise<OpenCampaign[]> {
  const accounts = await rpc
    .getProgramAccounts(PROGRAM_ID, {
      encoding: "base64",
      filters: [{ dataSize: BigInt(ACCOUNT_LEN.campaign) }],
    })
    .send();
  const found: OpenCampaign[] = [];
  for (const { pubkey, account } of accounts) {
    let campaign: Campaign;
    try {
      campaign = decodeCampaign({ owner: account.owner, data: bytesOf(account.data) });
    } catch {
      continue; // not a campaign of this program (wrong owner, tag or version): skipped, never read further
    }
    found.push({ address: pubkey, campaign });
  }
  return found;
}

export async function listCampaignsWithStatus(rpc: SolanaRpc, status: Status): Promise<OpenCampaign[]> {
  return (await listAllCampaigns(rpc)).filter((item) => item.campaign.status === status);
}

export const listOpenCampaigns = (rpc: SolanaRpc) => listCampaignsWithStatus(rpc, Status.Open);

/** The entries of `campaign` that still exist (a settled entry is closed), in no particular order. */
export async function listEntries(rpc: SolanaRpc, campaign: Address): Promise<EntryAt[]> {
  const accounts = await rpc
    .getProgramAccounts(PROGRAM_ID, {
      encoding: "base64",
      filters: [
        { dataSize: BigInt(ACCOUNT_LEN.entry) },
        {
          memcmp: {
            offset: ENTRY_CAMPAIGN_OFFSET,
            bytes: campaign as unknown as Base58EncodedBytes,
            encoding: "base58",
          },
        },
      ],
    })
    .send();
  const found: EntryAt[] = [];
  for (const { pubkey, account } of accounts) {
    let entry: Entry;
    try {
      entry = decodeEntry({ owner: account.owner, data: bytesOf(account.data) });
    } catch {
      continue;
    }
    if (entry.campaign !== campaign) continue; // the filter is the RPC's word; the stored field is the program's
    found.push({ address: pubkey, entry, lamports: BigInt(account.lamports) });
  }
  return found;
}
