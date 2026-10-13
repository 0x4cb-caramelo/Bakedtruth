/**
 * Purpose: the paid opening rehearsed on the fork with mainnet's real SOL/USD sponsored account (the founder's open
 *          question whether the first mainnet cycle includes one): a wallet outside the team opens a `SupplyAtMost`
 *          campaign on a real mint and pays US$500 at the Pyth price under init-params.mainnet.json's freshness and
 *          confidence bounds; the charge and its 90/10 split are checked against the SDK's quote. The price's age and
 *          confidence at that moment are printed, as evidence for the `maxPriceAge` and `maxPriceConfBps` proposals.
 * Version: 0.1.0
 * Sprint:  18 (mainnet), lane L18
 *
 * The account is fetched from mainnet by the fork on its first read, here, so its age is mainnet's own plus the
 * seconds the fork's clock runs behind or ahead. One reading is a sample of one, not a measurement of the cadence.
 */
import type { Address, KeyPairSigner } from "@solana/kit";

import { ReaderKind, SOL_USD_ACCOUNT, campaignAddress, decodeCampaign, openingQuote } from "@brot/sdk/read";
import { buildOpenCampaign, randomCampaignId } from "@brot/sdk/tx";

import { check, sol, type Session } from "../devnet";
import { account, clock, expectOk, send } from "../validator/rpc";

const DAY = 86_400n;

/** Price, confidence, exponent and publish time at their PriceUpdateV2 offsets (tests/brot/setup.ts PRICE_OFFSETS). */
function priceFields(data: Uint8Array) {
  const view = new DataView(data.buffer, data.byteOffset);
  return {
    price: view.getBigInt64(73, true),
    conf: view.getBigUint64(81, true),
    exponent: view.getInt32(89, true),
    publishTime: view.getBigInt64(93, true),
  };
}

export async function paidOpening(s: Session, creator: KeyPairSigner, mint: Address) {
  const config = await s.config();
  const solUsd = (await account(s.rpc, SOL_USD_ACCOUNT))!;
  const now = await clock(s.rpc);
  const p = priceFields(solUsd.data);
  const confBps = (p.conf * 10_000n) / p.price;
  console.log(`  SOL/USD ${SOL_USD_ACCOUNT}: ${p.price}e${p.exponent}, conf ${p.conf} (${confBps} bps)`);
  console.log(
    `    published ${p.publishTime}, the fork's clock ${now.unixTimestamp}: ${now.unixTimestamp - p.publishTime} s old`,
  );
  console.log(
    `    bounds: maxPriceAge ${config.params.maxPriceAge} s, maxPriceConfBps ${config.params.maxPriceConfBps}`,
  );
  const quote = openingQuote({ params: config.params, openingUsd: config.params.openingFeeUsd, solUsd, clock: now });
  const data = (await account(s.rpc, mint))!.data;
  const supply = new DataView(data.buffer, data.byteOffset).getBigUint64(36, true);
  const args = {
    id: randomCampaignId(),
    kind: ReaderKind.SupplyAtMost,
    target: (supply * 98n) / 100n,
    deadlineAt: now.unixTimestamp + 3n * DAY + 3_600n,
    openingUsd: config.params.openingFeeUsd,
    maxLamports: quote.maxLamports,
    expectedParamsVersion: config.paramsVersion,
  };
  expectOk(
    await send(s.rpc, creator, [await buildOpenCampaign({ creator, args, metricAccount: mint })]),
    "paid opening",
  );
  const stored = decodeCampaign((await account(s.rpc, await campaignAddress(args.id)))!);
  check(
    stored.openingPaidLamports === quote.paid,
    `US$${args.openingUsd} charged ${sol(quote.paid)} = the SDK's quote`,
  );
  check(stored.prizeLamports === quote.prize && stored.openingFeeLamports === quote.fee, "split 90/10 = the SDK's");
  check(
    !stored.creatorIsTeam && stored.creatorShareBps === config.params.creatorShareBps,
    "a paid opening keeps the 1%",
  );
}
