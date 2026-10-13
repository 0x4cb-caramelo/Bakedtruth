/**
 * Purpose: a token's symbol through the SDK's readers, on real mainnet bytes (tests/fixtures): the Metaplex metadata
 *          PDA of WIF and USDC derived to the captured addresses and their symbols ("$WIF", "USDC"), PYUSD's from the
 *          TokenMetadata extension in its own Token-2022 mint, a DBC pool's base mint, the choice between the two
 *          places, and the refusals in the readers' order: the owner, then the layout, then metadata of another mint;
 *          then the ticker a screen may print: cleaned, short, plain ASCII, no reserved one (the A-11 exception).
 *          Filter: `bun test tests/ -t "a token's symbol"`.
 * Version: 0.1.0
 * Sprint:  the sixth kind's site, after 05 (a graduation campaign names its curve by its token's ticker)
 */
import { describe, expect, test } from "bun:test";

import {
  isRefusal,
  readCurveBaseMint,
  readMetadataSymbol,
  readToken2022Symbol,
  SPL_TOKEN_PROGRAM_ID,
  tickerOf,
  TOKEN_2022_PROGRAM_ID,
  tokenMetadataAddress,
  tokenSymbolOf,
  type FetchedAccount,
} from "@brot/sdk/read";

import { FIXTURES, fixtureBytes } from "../brot/readers";

const WIF = "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm";
const USDC = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const PYUSD = FIXTURES["mint-pyusd"].address;

const fetched = (name: string, data = fixtureBytes(name)): FetchedAccount => ({
  address: FIXTURES[name].address,
  owner: FIXTURES[name].owner,
  data,
});
const ascii = (value: string) => Uint8Array.from(value, (c) => c.charCodeAt(0));
const text = (bytes: Uint8Array | null) => (bytes === null ? null : String.fromCharCode(...bytes));
/** What a read refuses with, or "read" when it reads. */
function outcome(read: () => unknown): string {
  try {
    read();
    return "read";
  } catch (error) {
    if (isRefusal(error)) return error.errorName;
    throw error;
  }
}

describe("a token's symbol", () => {
  test("the metadata PDA of a mint is the captured account, and its symbol drops Metaplex's padding", async () => {
    expect<string>(await tokenMetadataAddress(WIF)).toBe(FIXTURES["metadata-wif"].address);
    expect<string>(await tokenMetadataAddress(USDC)).toBe(FIXTURES["metadata-usdc"].address);
    const wif = fetched("metadata-wif");
    expect(text(readMetadataSymbol(wif.owner, wif.data, WIF))).toBe("$WIF");
    const usdc = fetched("metadata-usdc");
    expect(text(readMetadataSymbol(usdc.owner, usdc.data, USDC))).toBe("USDC");
  });

  test("a Token-2022 mint's own TokenMetadata extension; a classic mint has none to give", () => {
    const pyusd = fetched("mint-pyusd");
    expect(text(readToken2022Symbol(pyusd.owner, pyusd.data, PYUSD))).toBe("PYUSD");
    expect(readToken2022Symbol(TOKEN_2022_PROGRAM_ID, fixtureBytes("mint-wif"), WIF)).toBeNull();
  });

  test("the owner first, then the layout, then the mint the metadata names", () => {
    const wif = fetched("metadata-wif");
    expect(outcome(() => readMetadataSymbol(SPL_TOKEN_PROGRAM_ID, wif.data, WIF))).toBe("ReaderWrongOwner");
    expect(outcome(() => readMetadataSymbol(wif.owner, wif.data.slice(0, 80), WIF))).toBe("ReaderBadLayout");
    const edition = wif.data.slice();
    edition[0] = 6; // MasterEditionV2, not metadata
    expect(outcome(() => readMetadataSymbol(wif.owner, edition, WIF))).toBe("ReaderBadLayout");
    expect(outcome(() => readMetadataSymbol(wif.owner, wif.data, USDC))).toBe("ReaderBadLayout");
    const pyusd = fetched("mint-pyusd");
    expect(outcome(() => readToken2022Symbol(SPL_TOKEN_PROGRAM_ID, pyusd.data, PYUSD))).toBe("ReaderWrongOwner");
    expect(outcome(() => readToken2022Symbol(pyusd.owner, pyusd.data, WIF))).toBe("ReaderBadLayout");
    const account = pyusd.data.slice();
    account[165] = 2; // a token account's type, not a mint's
    expect(outcome(() => readToken2022Symbol(pyusd.owner, account, PYUSD))).toBe("ReaderBadLayout");
    const cut = pyusd.data.slice(0, pyusd.data.length - 40);
    expect(outcome(() => readToken2022Symbol(pyusd.owner, cut, PYUSD))).toBe("ReaderBadLayout");
  });

  test("the symbol of a mint: its own extension first, else its Metaplex metadata, else none", () => {
    const pyusd = fetched("mint-pyusd");
    expect(text(tokenSymbolOf(PYUSD, { mint: pyusd, metadata: null }))).toBe("PYUSD");
    const mint = fetched("mint-wif");
    const metadata = fetched("metadata-wif");
    expect(text(tokenSymbolOf(WIF, { mint, metadata }))).toBe("$WIF");
    expect(tokenSymbolOf(WIF, { mint, metadata: null })).toBeNull();
    // Metadata of another mint, or bytes no reader accepts, name nothing rather than throw.
    expect(tokenSymbolOf(USDC, { mint, metadata })).toBeNull();
    expect(tokenSymbolOf(WIF, { mint, metadata: { ...metadata, owner: SPL_TOKEN_PROGRAM_ID } })).toBeNull();
  });

  test("a ticker is cleaned, then shown only as 1 to 10 ASCII letters and digits that claim no reserved ticker", () => {
    expect(tickerOf(ascii("TEST\0\0\0\0\0\0"))).toBe("TEST");
    expect(tickerOf(ascii("$WIF"))).toBe("WIF");
    expect(tickerOf(ascii("\u0007Fart\u0001coin\u007f"))).toBe("Fartcoin");
    expect(tickerOf(ascii("  BONK  "))).toBe("BONK");
    for (const reserved of ["SOL", "wsol", "USDC", "usdt", "Brot", "$BROT"])
      expect(tickerOf(ascii(reserved))).toBeNull();
    expect(tickerOf(ascii("ABCDEFGHIJK"))).toBeNull(); // 11 characters
    expect(tickerOf(ascii("TWO WORDS"))).toBeNull();
    expect(tickerOf(ascii("A.B"))).toBeNull();
    expect(tickerOf(ascii("$"))).toBeNull();
    expect(tickerOf(new Uint8Array())).toBeNull();
    expect(tickerOf(null)).toBeNull();
    // Past ASCII: an emoji, a Cyrillic look-alike of "SOL", a right-to-left mark. Never shown, never half-cleaned.
    expect(tickerOf(new TextEncoder().encode("PEPE🐸"))).toBeNull();
    expect(tickerOf(new TextEncoder().encode(`${String.fromCharCode(0x0405)}OL`))).toBeNull();
    expect(tickerOf(new TextEncoder().encode(`${String.fromCharCode(0x202e)}XYZ`))).toBeNull();
  });

  test("a DBC pool's base mint, after the pool reader's own refusals", () => {
    const pool = fetched("dbc-pool-stage0");
    expect<string>(readCurveBaseMint(pool.owner, pool.data)).toBe("6PW26Tqsuc6qeNK6Cp7mWj1KuM1X7NUCG97x6MJHBAGS");
    expect(outcome(() => readCurveBaseMint(SPL_TOKEN_PROGRAM_ID, pool.data))).toBe("ReaderWrongOwner");
    const hook = fetched("dbc-hook-pool");
    expect(outcome(() => readCurveBaseMint(hook.owner, hook.data))).toBe("CurveHasTransferHook");
  });
});
