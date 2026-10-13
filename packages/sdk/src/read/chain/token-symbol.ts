/**
 * Purpose: a token's symbol (its ticker) as the token's own metadata stores it, for the screens only: the program
 *          reads no metadata, so no rule depends on it. Two places hold one: the Metaplex Token Metadata account of a
 *          mint (the PDA `["metadata", program, mint]`, key 4, `MetadataV1`), and the TokenMetadata extension (type 19)
 *          a Token-2022 mint carries in itself, as Meteora DBC writes it. Each is read owner first, then the layout,
 *          through the bounds-checked Cursor, and must name the mint it is read for. The symbol comes back as raw
 *          bytes, the NUL padding Metaplex writes dropped: it is the token creator's own text, so `tickerOf` says what
 *          of it a screen may print (the A-11 exception in TP §3.4.10), the same for the site and the app, and the
 *          site never shows it alone (app/features/campaigns/curve-name.ts).
 * Version: 0.1.0
 * Sprint:  the sixth kind's site, after 05 (a graduation campaign names its curve by its token's ticker)
 */
import { address, getAddressEncoder, getProgramDerivedAddress, type Address } from "@solana/kit";

import { bytesEqual } from "../bytes";
import { isRefusal, refuse } from "../errors";
import { TOKEN_2022_PROGRAM_ID } from "../constants";
import type { FetchedAccount } from "../quote";
import { Cursor } from "./cursor";

/** Metaplex Token Metadata, the same on both clusters (not upgradeable: RESOLVERS.md). */
export const TOKEN_METADATA_PROGRAM_ID = address("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
/** `Key::MetadataV1`, the first byte of a Metaplex metadata account. */
const METADATA_V1 = 4;
/** A Token-2022 mint: the classic 82 bytes, padding to 165, the account type at 165 (1, a mint), then its TLV entries. */
const ACCOUNT_TYPE_AT = 165;
const ACCOUNT_TYPE_MINT = 1;
/** `ExtensionType::Uninitialized` (the rest is unused space) and `ExtensionType::TokenMetadata`. */
const EXTENSION_UNINITIALIZED = 0;
const EXTENSION_TOKEN_METADATA = 19;

const keyOf = (mint: Address | string) => getAddressEncoder().encode(address(mint));

/** The Metaplex metadata account of `mint`: `["metadata", program, mint]` under Token Metadata. */
export async function tokenMetadataAddress(mint: Address | string): Promise<Address> {
  const [pda] = await getProgramDerivedAddress({
    programAddress: TOKEN_METADATA_PROGRAM_ID,
    seeds: ["metadata", getAddressEncoder().encode(TOKEN_METADATA_PROGRAM_ID), keyOf(mint)],
  });
  return pda;
}

/** A Borsh string's bytes (a u32 length, then the bytes), with the NUL padding at its end dropped. */
function borshBytes(c: Cursor): Uint8Array {
  const bytes = c.take(c.u32());
  let end = bytes.length;
  while (end > 0 && bytes[end - 1] === 0) end -= 1;
  return bytes.slice(0, end);
}

/** The symbol after the update authority, the mint (checked to be `mint`) and the name, as both layouts order them. */
function symbolAfterMint(c: Cursor, mint: Address | string): Uint8Array {
  c.skip(32); // the update authority
  if (!bytesEqual(c.take(32), keyOf(mint))) refuse("ReaderBadLayout");
  borshBytes(c); // the name
  return borshBytes(c);
}

/** The symbol a Metaplex metadata account stores for `mint`. */
export function readMetadataSymbol(owner: string, data: Uint8Array, mint: Address | string): Uint8Array {
  if (owner !== TOKEN_METADATA_PROGRAM_ID) refuse("ReaderWrongOwner");
  const c = new Cursor(data);
  if (c.u8() !== METADATA_V1) refuse("ReaderBadLayout");
  return symbolAfterMint(c, mint);
}

/** The symbol a Token-2022 mint stores in its own TokenMetadata extension; `null` when it carries none. */
export function readToken2022Symbol(owner: string, data: Uint8Array, mint: Address | string): Uint8Array | null {
  if (owner !== TOKEN_2022_PROGRAM_ID) refuse("ReaderWrongOwner");
  if (data.length <= ACCOUNT_TYPE_AT) return null; // the classic 82 bytes: no extension at all
  const c = new Cursor(data);
  c.skip(ACCOUNT_TYPE_AT);
  if (c.u8() !== ACCOUNT_TYPE_MINT) refuse("ReaderBadLayout");
  while (c.position + 4 <= data.length) {
    const type = c.u16();
    const value = c.take(c.u16());
    if (type === EXTENSION_UNINITIALIZED) return null;
    if (type === EXTENSION_TOKEN_METADATA) return symbolAfterMint(new Cursor(value), mint);
  }
  return null;
}

/** Tickers a new token may not borrow on a screen, whatever their case: the quote assets, the dollar tokens, Brot's. */
export const RESERVED_TICKERS: readonly string[] = ["SOL", "WSOL", "USDC", "USDT", "BROT"];
/** Metaplex keeps a symbol to 10 bytes; Token-2022 does not, and a longer one is not printed. */
export const MAX_TICKER = 10;

/**
 * The ticker a screen may print, from a symbol's raw bytes, or `null`. The control characters go, then the spaces
 * around it and one leading "$"; what is left must be 1 to `MAX_TICKER` ASCII letters and digits and no reserved
 * ticker. A byte past ASCII (an emoji, a look-alike letter, a direction mark) shows nothing, never a half-cleaned text.
 */
export function tickerOf(raw: Uint8Array | null | undefined): string | null {
  if (!raw || raw.some((byte) => byte >= 0x80)) return null;
  const printable = raw.filter((byte) => byte >= 0x20 && byte !== 0x7f);
  const text = String.fromCharCode(...printable)
    .trim()
    .replace(/^\$/, "");
  if (text.length > MAX_TICKER || !/^[A-Za-z0-9]+$/.test(text)) return null;
  return RESERVED_TICKERS.includes(text.toUpperCase()) ? null : text;
}

/**
 * The symbol of `mint`: from its own TokenMetadata extension when it is a Token-2022 mint that carries one, else from
 * its Metaplex metadata account; `null` when neither exists or reads as one.
 */
export function tokenSymbolOf(
  mint: Address | string,
  accounts: { mint: FetchedAccount | null; metadata: FetchedAccount | null },
): Uint8Array | null {
  try {
    if (accounts.mint?.owner === TOKEN_2022_PROGRAM_ID) {
      const own = readToken2022Symbol(accounts.mint.owner, accounts.mint.data, mint);
      if (own !== null) return own;
    }
    return accounts.metadata ? readMetadataSymbol(accounts.metadata.owner, accounts.metadata.data, mint) : null;
  } catch (error) {
    if (isRefusal(error)) return null;
    throw error;
  }
}
