// Token names from Metaplex metadata, so markets on real tokens read "$BONK" instead of an address.
// Framework-free.

import { PublicKey, type Connection } from "@solana/web3.js";
import { Buffer } from "buffer";

export const TOKEN_METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

export type TokenName = { name: string; symbol: string };

const metadataPda = (mint: PublicKey) =>
  PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    TOKEN_METADATA_PROGRAM_ID,
  )[0];

/** Metadata layout: key u8 | update authority | mint | name (u32 len + bytes) | symbol (u32 len + bytes). */
function parseName(data: Uint8Array): TokenName | null {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const text = (at: number) => {
    if (at + 4 > data.length) return null;
    const len = view.getUint32(at, true);
    if (at + 4 + len > data.length || len > 64) return null;
    return { value: new TextDecoder().decode(data.subarray(at + 4, at + 4 + len)).replace(/\0+$/, "").trim(), end: at + 4 + len };
  };
  const name = text(65);
  const symbol = name && text(name.end);
  if (!name || !symbol) return null;
  return { name: name.value, symbol: symbol.value };
}

/** Names for each mint that has Metaplex metadata (one batched call). Keyed by mint address. */
export async function fetchTokenNames(connection: Connection, mints: PublicKey[]): Promise<Map<string, TokenName>> {
  const unique = [...new Map(mints.map((m) => [m.toBase58(), m])).values()];
  const names = new Map<string, TokenName>();
  for (let i = 0; i < unique.length; i += 100) {
    const batch = unique.slice(i, i + 100);
    const infos = await connection.getMultipleAccountsInfo(batch.map(metadataPda));
    infos.forEach((info, j) => {
      if (!info || !info.owner.equals(TOKEN_METADATA_PROGRAM_ID)) return;
      const parsed = parseName(info.data);
      if (parsed && (parsed.symbol || parsed.name)) names.set(batch[j]!.toBase58(), parsed);
    });
  }
  return names;
}
