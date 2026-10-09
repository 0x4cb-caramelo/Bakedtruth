/**
 * Purpose: A-10 / X0.7, SDK half, for rows 7, 8 and 10: each case tests/brot/open-campaign-refuses-payment.test.ts
 *          and open-campaign-retry.test.ts feed to the program is fed to `validateOpenCampaign` too: who
 *          pays and how much, the signed `max_lamports`, the SOL/USD account under row 7's own codes,
 *          fresh by time and slot and tight, the valve, and a retried id. Same error, or both accept.
 * Version: 0.1.0
 * Sprint:  05 (SDK)
 */
import { describe, test } from "bun:test";
import { lamports } from "@solana/kit";

import { DEFAULT_PARAMS, openingLamports, readConfig, SOL_CHARGED, SOL_PRICE } from "../brot/flows";
import * as I from "../brot/instructions";
import { openingWorld, STALE, type OpeningWorld } from "../brot/opening";
import * as P from "../brot/program";
import { fixtureBytes, setClock, setRawAccount } from "../brot/readers";
import { expectOk, send, setPriceAccount } from "../brot/setup";
import { expectParity } from "./open-parity";

const solUsd = (w: OpeningWorld, change: Parameters<typeof setPriceAccount>[3]) =>
  setPriceAccount(w.client, P.SOL_USD_ACCOUNT, "pyth-sol-usd-devnet", change);

describe("sdk refuses at least what the program refuses", () => {
  test("row 7: no payment from a wallet, below the fee from a wallet or a team key, above max_lamports", async () => {
    const w = await openingWorld();
    await expectParity(w, w.creator, "OpeningUsdBelowFee", { openingUsd: 0n });
    await expectParity(w, w.creator, "OpeningUsdBelowFee", { openingUsd: 499n });
    await expectParity(w, w.team, "OpeningUsdBelowFee", { openingUsd: 1n });
    const price = openingLamports(500n, SOL_CHARGED);
    await expectParity(w, w.creator, "OpeningAboveMaxLamports", { maxLamports: price - 1n });
    await expectParity(w, w.creator, "OpeningAboveMaxLamports", { maxLamports: 0n });
    await expectParity(w, w.creator, "accepted", { maxLamports: price });
    await expectParity(w, w.team, "accepted", { openingUsd: 750n, maxLamports: 2n * price });
  });

  test("row 7: a SOL/USD slot that is not the sponsored account, and the old receiver's account", async () => {
    const w = await openingWorld();
    await expectParity(w, w.creator, "SolUsdAccountMismatch", {}, { solUsd: P.BTC_USD_ACCOUNT });
    await expectParity(w, w.creator, "SolUsdAccountMismatch", {}, { solUsd: P.SYSTEM_PROGRAM_ID });
    setPriceAccount(w.client, P.SOL_USD_ACCOUNT, "pyth-sol-usd-devnet-legacy", { owner: P.PYTH_LEGACY_RECEIVER_ID });
    await expectParity(w, w.creator, "SolUsdWrongOwner");
  });

  test("row 7: resized, partially verified and BTC/USD bytes at the SOL/USD address", async () => {
    const w = await openingWorld();
    const bytes = fixtureBytes("pyth-sol-usd-devnet");
    for (const resized of [bytes.slice(0, -1), Uint8Array.of(...bytes, 0)]) {
      setRawAccount(w.client, P.SOL_USD_ACCOUNT, resized, P.PYTH_RECEIVER_ID);
      await expectParity(w, w.creator, "SolUsdBadLayout");
    }
    solUsd(w, { verification: 0 });
    await expectParity(w, w.creator, "SolUsdNotFullyVerified");
    setPriceAccount(w.client, P.SOL_USD_ACCOUNT, "pyth-btc-usd-devnet");
    await expectParity(w, w.creator, "SolUsdWrongFeed");
    solUsd(w, {});
    await expectParity(w, w.creator, "accepted");
  });

  test("row 7: the slot bound, a stale, a non-positive and a wide SOL/USD price, an unsupported exponent", async () => {
    const w = await openingWorld();
    const slot = 10_000n;
    setClock(w.client, { slot });
    setPriceAccount(w.client, P.BTC_USD_ACCOUNT, "pyth-btc-usd-devnet", { postedSlot: slot });
    solUsd(w, { postedSlot: slot - 1_201n });
    await expectParity(w, w.creator, "SolUsdStale");
    solUsd(w, { postedSlot: slot - 1_200n });
    await expectParity(w, w.creator, "accepted");
    solUsd(w, { publishTime: STALE });
    await expectParity(w, w.creator, "SolUsdStale");
    solUsd(w, { price: 0n });
    await expectParity(w, w.creator, "SolUsdPriceNonPositive");
    solUsd(w, { conf: SOL_PRICE / 200n + 1n });
    await expectParity(w, w.creator, "SolUsdConfidenceTooWide");
    solUsd(w, { exponent: -100 });
    await expectParity(w, w.creator, "PriceExponentOutOfRange");
    solUsd(w, { exponent: 1 });
    await expectParity(w, w.creator, "PriceExponentOutOfRange");
  });

  test("row 8: max_open_campaigns reached, for a wallet and a team key that pays; a free team opening is outside", async () => {
    const w = await openingWorld();
    expectOk(await send(w, [await I.setCreationParamsIx(w.admin, { ...DEFAULT_PARAMS, max_open_campaigns: 1 })]));
    const expectedParamsVersion = (await readConfig(w)).params_version as number;
    await expectParity(w, w.creator, "accepted", { expectedParamsVersion });
    await expectParity(w, w.creator, "TooManyOpenCampaigns", { expectedParamsVersion });
    await expectParity(w, w.team, "TooManyOpenCampaigns", { expectedParamsVersion });
    await expectParity(w, w.team, "accepted", { openingUsd: 0n, maxLamports: 0n, expectedParamsVersion });
  });

  test("row 10: a retried id is refused; an address funded in advance still opens", async () => {
    const w = await openingWorld();
    const first = await expectParity(w, w.creator, "accepted");
    await expectParity(w, w.creator, "AlreadyInitialized", { id: first.args.id });
    const id = 9_999_001n;
    w.client.svm.airdrop(await P.campaignPda(id), lamports(1_000_000n));
    w.client.svm.airdrop(await P.vaultPda(await P.campaignPda(id)), lamports(1_000_000n));
    await expectParity(w, w.creator, "accepted", { id });
  });
});
