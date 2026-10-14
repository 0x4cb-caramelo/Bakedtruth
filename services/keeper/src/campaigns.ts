/**
 * Purpose: the keeper's view of the program's own accounts: every campaign (one `getProgramAccounts` filtered by the
 *          campaign's size), by status when asked, and a campaign's entries (filtered by the entry's size and by the
 *          campaign's address at the entry's offset 4). Each account is decoded by the SDK's loader, which refuses a
 *          wrong owner, size, tag or version: those are skipped, never trusted. An entry whose stored campaign is not
 *          the one asked for is skipped too. Since Sprint 15, a campaign's sponsors' `SealedFee`s the same way (the
 *          campaign at the account's offset 3), so a close never waits on a fee nobody listed.
 * Version: 0.4.0 (Sprint 14/15 keeper lane: the sealed fees of a campaign)
 * Sprint:  07 (standby keeper and watchdog); 15
 */
import {
  ACCOUNT_LEN,
  PROGRAM_ID,
  Status,
  decodeCampaign,
  decodeEntry,
  decodeSealedFee,
  type Campaign,
  type Entry,
  type SealedFee,
  type SolanaRpc,
} from "@brot/sdk/read";
import { getBase64Encoder, type Address, type Base58EncodedBytes } from "@solana/kit";

export type OpenCampaign = { address: Address; campaign: Campaign };
export type EntryAt = { address: Address; entry: Entry; lamports: bigint };
export type SealedFeeAt = { address: Address; fee: SealedFee };

/** The offset of `Entry.campaign`: tag, version, bump and `is_first` come first (state/entry.rs). */
const ENTRY_CAMPAIGN_OFFSET = 4n;
/** The offset of `SealedFee.campaign`: tag, version and bump come first (state/sealed_fee.rs). */
const SEALED_FEE_CAMPAIGN_OFFSET = 3n;

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

type Raw = { pubkey: Address; account: { owner: Address; data: readonly [string, string] | string; lamports: bigint } };

/** The program's accounts of `size` bytes whose 32 bytes at `offset` are `campaign`'s address. */
async function byCampaign(rpc: SolanaRpc, campaign: Address, size: number, offset: bigint): Promise<Raw[]> {
  const bytes = campaign as unknown as Base58EncodedBytes;
  const filters = [{ dataSize: BigInt(size) }, { memcmp: { offset, bytes, encoding: "base58" as const } }];
  return (await rpc.getProgramAccounts(PROGRAM_ID, { encoding: "base64", filters }).send()) as unknown as Raw[];
}

/** `decode(raw)`, or `null` when the program's loader would refuse the account. */
function decoded<T>(raw: Raw, decode: (account: { owner: Address; data: Uint8Array }) => T): T | null {
  try {
    return decode({ owner: raw.account.owner, data: bytesOf(raw.account.data) });
  } catch {
    return null;
  }
}

/** The entries of `campaign` that still exist (a settled entry is closed), in no particular order. */
export async function listEntries(rpc: SolanaRpc, campaign: Address): Promise<EntryAt[]> {
  const found: EntryAt[] = [];
  for (const raw of await byCampaign(rpc, campaign, ACCOUNT_LEN.entry, ENTRY_CAMPAIGN_OFFSET)) {
    const entry = decoded(raw, decodeEntry);
    // The filter is the RPC's word; the stored field is the program's.
    if (entry && entry.campaign === campaign) {
      found.push({ address: raw.pubkey, entry, lamports: BigInt(raw.account.lamports) });
    }
  }
  return found;
}

/** The sponsors' `SealedFee`s of `campaign` still open (`settle_sealed_fee` closes each), in no particular order. */
export async function listSealedFees(rpc: SolanaRpc, campaign: Address): Promise<SealedFeeAt[]> {
  const found: SealedFeeAt[] = [];
  for (const raw of await byCampaign(rpc, campaign, ACCOUNT_LEN.sealedFee, SEALED_FEE_CAMPAIGN_OFFSET)) {
    const fee = decoded(raw, decodeSealedFee);
    if (fee && fee.campaign === campaign) found.push({ address: raw.pubkey, fee });
  }
  return found;
}
