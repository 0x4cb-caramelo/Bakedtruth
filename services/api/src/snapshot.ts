/**
 * Purpose: one read of the chain: every campaign account of the program, decoded by the SDK (a wrong owner, tag or
 *          version is skipped), with its public state computed from the chain's own clock; since Sprint 08's third
 *          part, whether the program halted entries (`GlobalConfig.operating_level`) and the slot of its last deploy
 *          (ProgramData), each read on its own: a failure leaves it unknown (null) and never fails the snapshot.
 *          Keeps no state; the store holds the last snapshot.
 * Version: 0.2.0 (the operating level and the deploy slot, for /api/v1/health)
 * Sprint:  08 (indexer and API, hackathon MVP; the third part)
 *
 * Not in this slice: the "Closed because the outcome is knowable" state, which needs the metric account for each
 * campaign. Campaigns show Open until their entries close by time or epoch.
 */
import {
  ACCOUNT_LEN,
  configAddress,
  decodeCampaign,
  decodeGlobalConfig,
  fetchRaw,
  OperatingLevel,
  PROGRAM_ID,
  publicState,
  readChainTime,
  readProgramDeploy,
  type Campaign,
  type PublicView,
  type SolanaRpc,
} from "@brot/sdk/read";
import { getBase64Encoder, type Address } from "@solana/kit";
import type { ChainTime } from "@brot/sdk/read";

export type Row = { address: Address; campaign: Campaign; view: PublicView };
export type Snapshot = {
  takenAt: string;
  asOfSlot: bigint;
  chain: ChainTime;
  rows: Row[];
  /** The program halted entries (operating level not Normal); null or absent when its config was not read. */
  entriesHalted?: boolean | null;
  /** The slot of the program's last deploy (ProgramData); null or absent when it was not read. */
  deploySlot?: bigint | null;
};

/** Whether the program halted entries, from its GlobalConfig (owner, length and tag checked); null if unread. */
export async function readEntriesHalted(rpc: SolanaRpc): Promise<boolean | null> {
  try {
    const raw = await fetchRaw(rpc, await configAddress());
    return raw ? decodeGlobalConfig(raw).operatingLevel !== OperatingLevel.Normal : null;
  } catch {
    return null;
  }
}

/** The program's last deploy slot, from ProgramData's first 45 bytes; null if unread (a non-upgradeable test chain). */
export async function readDeploySlot(rpc: SolanaRpc): Promise<bigint | null> {
  try {
    return (await readProgramDeploy(rpc)).slot;
  } catch {
    return null;
  }
}

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
  const [entriesHalted, deploySlot] = await Promise.all([readEntriesHalted(rpc), readDeploySlot(rpc)]);
  return { takenAt: new Date().toISOString(), asOfSlot: chain.slot, chain, rows, entriesHalted, deploySlot };
}
