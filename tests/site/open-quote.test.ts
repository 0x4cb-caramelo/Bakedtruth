/**
 * Purpose: the creation box's quote against the program's own charge (Sprint 19 DoD; I14; TP §3.4.16): the box reads
 *          Pyth's SOL/USD account through the site's RPC and quotes `ceil(opening_usd × 10^(9 − e) ÷ (price − conf))`
 *          with the 90/10 split and `max_lamports` 1% above; the opening prepared and signed through the box's own path
 *          (prepareOpening, handToWallet) stores exactly that payment, split as prize plus opening fee, and moves
 *          exactly the payment and the two rents out of the creator's wallet. A team key's opening moves only the rents.
 *          Then the plan's reference example at US$109.27, as the box writes it.
 *          Filter: `bun test tests/ -t "opening quote matches the program charge"`.
 * Version: 0.1.0
 * Sprint:  19 (site: open a campaign)
 */
import { afterEach, describe, expect, test } from "bun:test";
import { createSolanaRpc, type KeyPairSigner } from "@solana/kit";

import { bytesToHex, decodeCampaign, openingPaidLamports, splitOpening } from "@brot/sdk/read";

import { checkBox } from "../../app/features/open-campaign/check";
import { EMPTY_DRAFT, type Draft } from "../../app/features/open-campaign/draft";
import { exactSol, MARGIN_BPS, quoteNow } from "../../app/features/open-campaign/quote";
import { readCampaignAt, readDraftAccounts, readWorld } from "../../app/features/open-campaign/reads";
import { idFor } from "../../app/features/open-campaign/retry-guard";
import { handToWallet, prepareOpening } from "../../app/features/open-campaign/submit";
import { BTC_PRICE, newId, SOL_CHARGED } from "../brot/flows";
import { openingWorld, rents, type OpeningWorld } from "../brot/opening";
import * as P from "../brot/program";
import { balance } from "../brot/setup";
import { ready } from "../sdk/prepared";
import { startFakeChain, type FakeChain } from "./fake-chain";
import { memoryStore, napThen, testWallet } from "./support";

let chain: FakeChain | null = null;
afterEach(() => chain?.close());

const DRAFT: Draft = {
  ...EMPTY_DRAFT,
  feedHex: bytesToHex(P.BTC_USD_FEED_ID),
  target: (Number((BTC_PRICE * 11n) / 10n) / 1e8).toFixed(2),
  deadline: { days: 7 },
};

/** Opens `draft` through the box's path for `signer`: check, prepare with the guard's id, hand to the wallet. */
async function openThroughBox(w: OpeningWorld, signer: KeyPairSigner, draft: Draft) {
  chain = startFakeChain(w);
  const rpc = createSolanaRpc(chain.url);
  const store = memoryStore();
  const record = idFor(store, signer.address, newId);
  const id = BigInt(record.id);
  const [world, accounts] = await Promise.all([readWorld(rpc), readDraftAccounts(rpc, id, null)]);
  const check = await checkBox({
    draft,
    world,
    accounts,
    readFailed: false,
    id,
    wallet: signer.address,
    balance: null,
    siteAllows: true,
  });
  if (!check.choice || check.verdict?.ok !== true) throw new Error(check.issues.map((i) => i.text).join(" | "));
  const prepared = ready(await prepareOpening({ rpc, creator: signer.address, choice: check.choice, id }));
  const before = balance(w, signer.address);
  const outcome = await handToWallet({
    rpc,
    ready: prepared,
    record,
    send: testWallet(signer, chain.url),
    store,
    watch: { sleep: napThen(() => {}) },
  });
  const raw = await readCampaignAt(rpc, id);
  if (!raw) throw new Error("the campaign did not open");
  return { check, prepared, outcome, campaign: decodeCampaign(raw), spent: before - balance(w, signer.address) };
}

describe("opening quote matches the program charge", () => {
  test("a paid opening: the box's quote is what the program stores and moves (I14)", async () => {
    const w = await openingWorld();
    const { check, prepared, outcome, campaign, spent } = await openThroughBox(w, w.creator, DRAFT);
    const quote = check.quote;
    if (!quote) throw new Error("no quote");
    expect(outcome.kind).toBe("opened");
    // The formula at the price minus its confidence band, as the program reads it.
    expect(quote.price).toBe(SOL_CHARGED);
    expect(quote.paid).toBe(openingPaidLamports(500n, SOL_CHARGED, -8));
    expect(quote.maxLamports).toBe(quote.paid + (quote.paid * BigInt(MARGIN_BPS) + 9_999n) / 10_000n);
    expect(prepared.check.payment.paid).toBe(quote.paid);
    expect(prepared.maxLamports).toBe(quote.maxLamports);
    // What the program stored: the payment, split 90/10, at the price the box read.
    expect(campaign.openingPaidLamports).toBe(quote.paid);
    expect(campaign.prizeLamports + campaign.openingFeeLamports).toBe(quote.paid);
    expect(campaign.prizeLamports).toBe(splitOpening(quote.paid, 9_000).prize);
    expect(campaign.openingPrice).toBe(SOL_CHARGED);
    expect(openingPaidLamports(campaign.openingUsd, campaign.openingPrice, campaign.openingPriceExponent)).toBe(
      campaign.openingPaidLamports,
    );
    // What left the wallet: the payment, the two rents and the network fee the summary bounded.
    const r = rents(w);
    expect(spent).toBe(quote.paid + r.campaign + r.vault + 5_000n);
    expect(check.total).toBe(quote.paid + r.campaign + r.vault + 5_000n);
  });

  test("a team key's opening is free: no payment, no prize, no creator share", async () => {
    const w = await openingWorld();
    const { check, campaign, spent } = await openThroughBox(w, w.team, { ...DRAFT, usd: "" });
    expect(check.isTeam).toBe(true);
    expect(check.quote).toBeNull();
    expect([campaign.openingPaidLamports, campaign.prizeLamports, campaign.creatorShareBps]).toEqual([0n, 0n, 0]);
    const r = rents(w);
    expect(spent).toBe(r.campaign + r.vault + 5_000n);
  });

  test("the reference example at US$109.27, as the box writes it", async () => {
    const w = await openingWorld();
    chain = startFakeChain(w);
    const world = await readWorld(createSolanaRpc(chain.url));
    const config = world.config;
    if (!config) throw new Error("no config");
    // The plan's display example: p = 10,927,000,000 at e = −8, no band.
    const paid = openingPaidLamports(500n, 10_927_000_000n, -8);
    const { prize, fee } = splitOpening(paid, config.params.openingPrizeBps);
    expect([paid, prize, fee]).toEqual([4_575_821_360n, 4_118_239_224n, 457_582_136n]);
    expect([exactSol(paid), exactSol(prize), exactSol(fee)]).toEqual(["4.57582136", "4.118239224", "0.457582136"]);
    // And the box's quote on the captured account is the same formula at its own price.
    const now = quoteNow({ config, openingUsd: 500n, solUsd: world.solUsd, clock: world.clock });
    expect(now.ok && now.quote.paid).toBe(openingPaidLamports(500n, SOL_CHARGED, -8));
  });
});
