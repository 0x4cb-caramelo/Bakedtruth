/**
 * Purpose: the re-check panel's commands fetch the bytes the program's readers read (BR-23): on real captured accounts,
 *          the byte range each command asks for decodes to the same value the SDK's reader takes from the whole
 *          account. The commands carry only public data: the account, the campaign and the RPC URL given.
 *          Filter: `bun test tests/ -t "the re-check commands"`.
 * Version: 0.1.0
 * Sprint:  11 (site: campaign page and entry)
 */
import { describe, expect, test } from "bun:test";

import {
  DAMM_V2_PROGRAM_ID,
  PYTH_RECEIVER_ID,
  readLockedLiquidity,
  readMint,
  readPriceUpdate,
  SPL_TOKEN_PROGRAM_ID,
} from "@brot/sdk/read";

import { recheckCommands, SLICE } from "../../app/features/campaign-page/recheck-commands";
import { FIXTURES, fixtureBytes } from "../brot/readers";

const BTC_USD_FEED_HEX = "e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43";

const sliceOf = (bytes: Uint8Array, kind: "price" | "burn" | "lock") => {
  const [offset, length] = SLICE[kind]!;
  return new DataView(bytes.buffer, bytes.byteOffset + offset, length);
};

describe("the re-check commands", () => {
  test("each command's byte range holds the value the SDK's reader reads", () => {
    const price = fixtureBytes("pyth-btc-usd-devnet");
    expect(sliceOf(price, "price").getBigInt64(0, true)).toBe(
      readPriceUpdate(PYTH_RECEIVER_ID, price, BTC_USD_FEED_HEX).price,
    );
    const mint = fixtureBytes("mint-bonk");
    expect(sliceOf(mint, "burn").getBigUint64(36, true)).toBe(readMint(SPL_TOKEN_PROGRAM_ID, mint).supply);
    const pool = fixtureBytes("damm-ft8fd9");
    const view = sliceOf(pool, "lock");
    const locked = view.getBigUint64(0, true) + (view.getBigUint64(8, true) << 64n);
    expect(locked).toBe(readLockedLiquidity(DAMM_V2_PROGRAM_ID, pool));
    expect(locked > 0n).toBe(true);
  });

  test("the commands name the account, its byte range and the RPC, and nothing else", () => {
    const account = FIXTURES["pyth-btc-usd-devnet"].address;
    const [curl, cli, sdk] = recheckCommands({
      kind: "price",
      account,
      campaign: "FmDoXD1qx2ZfLr71WjrHHxFhLqDRkA6s24je1YfCj1Ho",
      rpcUrl: "https://api.devnet.solana.com",
      cluster: "devnet",
    });
    expect(curl.text).toContain(`"getAccountInfo","params":["${account}"`);
    expect(curl.text).toContain(`"dataSlice":{"offset":73,"length":28}`);
    expect(cli.text).toBe(`solana account ${account} --url devnet --output json`);
    expect(sdk.text).toContain(
      `await recheck("FmDoXD1qx2ZfLr71WjrHHxFhLqDRkA6s24je1YfCj1Ho", "https://api.devnet.solana.com")`,
    );
    const pool = recheckCommands({
      kind: "pool",
      account,
      campaign: "c",
      rpcUrl: "http://127.0.0.1:8899",
      cluster: "local",
    });
    expect(pool[0].text).not.toContain("dataSlice");
    expect(pool[1].text).toContain("--url http://127.0.0.1:8899");
    const stake = recheckCommands({
      kind: "stake",
      account,
      campaign: "c",
      rpcUrl: "http://127.0.0.1:8899",
      cluster: "local",
    });
    expect(stake[0].text).toContain(`"getVoteAccounts","params":[{"votePubkey":"${account}"`);
  });
});
