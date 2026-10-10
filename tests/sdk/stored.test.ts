/**
 * Purpose: the SDK's reading of a stored campaign (packages/sdk/src/read/math/stored.ts) against the program's own
 *          payouts in LiteSVM, on whole cycles: what each entry is owed, as estimated in review and as stored after
 *          finalize, equals its `EntrySettled`; the prize and the opening fee return to whoever opened as the void's
 *          cause says (and a pot with no entry keeps the opening fee even on a house failure); the creator share's
 *          status follows `settle_creator_share`.
 *          Filter: `bun test tests/ -t "what a stored campaign owes"`.
 * Version: 0.1.0
 * Sprint:  12 (site: my entries and campaign states)
 */
import { afterEach, describe, expect, test } from "bun:test";
import { createSolanaRpc, type Address } from "@solana/kit";

import {
  creatorShareStatus,
  decodeCampaign,
  decodeEntry,
  entryAddress,
  entryIfFinalized,
  entryOwed,
  prizeReturnOf,
  Side,
  storedVerdict,
} from "@brot/sdk/read";
import { buildSettleCreatorShare, buildSettleEntry, buildSettlePrize } from "@brot/sdk/tx";

import { readWalletHistory } from "../../app/features/my-entries/history";
import { receivedBy } from "../../app/features/my-entries/received";
import { openingWorld, type OpeningWorld } from "../brot/opening";
import { landVia } from "../site/cycle";
import { runCycle, SOL, type Cycle } from "../site/cycle-run";
import { rawOf } from "../site/support";

let run: Cycle | null = null;
afterEach(() => run?.chain.close());

const campaignOf = (w: OpeningWorld, at: Address) => decodeCampaign(rawOf(w, at));
const entryOf = async (w: OpeningWorld, at: Address, baker: Address) =>
  decodeEntry(rawOf(w, await entryAddress(at, baker)));

describe("what a stored campaign owes", () => {
  test("each entry's payout, estimated in review and stored after finalize, is what the program pays", async () => {
    const w = await openingWorld();
    const review = await runCycle(
      w,
      ([ana, bruno, carla]) => [
        { who: ana, side: Side.Yes, amount: SOL / 2n },
        { who: bruno, side: Side.No, amount: (3n * SOL) / 10n },
        { who: carla, side: Side.No, amount: SOL / 5n },
      ],
      { how: "no", stopAt: "review" },
    );
    run = review;
    const inReview = campaignOf(w, review.campaign);
    const verdict = storedVerdict(inReview)!;
    expect(verdict).toEqual({ kind: "No" });
    const estimated = new Map<string, bigint>();
    for (const b of review.bakers) {
      estimated.set(
        b.address,
        entryIfFinalized(inReview, await entryOf(w, review.campaign, b.address), verdict).amount,
      );
    }
    review.chain.close();
    // The same cycle again, to the settling stage: the stored snapshot, then each payout.
    const w2 = await openingWorld();
    run = await runCycle(
      w2,
      ([ana, bruno, carla]) => [
        { who: ana, side: Side.Yes, amount: SOL / 2n },
        { who: bruno, side: Side.No, amount: (3n * SOL) / 10n },
        { who: carla, side: Side.No, amount: SOL / 5n },
      ],
      { how: "no", stopAt: "settling" },
    );
    const settling = campaignOf(w2, run.campaign);
    expect(creatorShareStatus(settling)).toEqual({ status: "due", amount: settling.creatorShare });
    expect(prizeReturnOf(settling)).toEqual({ prize: 0n, openingFee: 0n });
    const rpc = createSolanaRpc(run.chain.url);
    for (const [i, b] of run.bakers.entries()) {
      const owed = entryOwed(settling, await entryOf(w2, run.campaign, b.address)).amount;
      expect(owed).toBe(estimated.get(review.bakers[i].address)!);
      await landVia(run.chain, run.keeper, [await buildSettleEntry({ campaign: run.campaign, baker: b.address })]);
      const got = receivedBy(b.address, (await readWalletHistory(rpc, b.address)).events);
      expect(got.total).toBe(owed);
      expect(run.delta(b.address)).toBe(owed + run.deposit(b.address));
    }
    await landVia(run.chain, run.keeper, [
      await buildSettleCreatorShare({ campaign: run.campaign, creator: w2.creator.address }),
    ]);
    expect(run.delta(w2.creator.address)).toBe(settling.creatorShare);
    expect(creatorShareStatus(campaignOf(w2, run.campaign))).toEqual({ status: "paid", amount: settling.creatorShare });
  });

  for (const [name, teamVoid, entries, refunded] of [
    ["a house failure refunds the opening fee", "TeamHouseFailure", true, true],
    ["an outside cause keeps it", "TeamOutsideCause", true, false],
    ["a pot with no entry keeps it even on a house failure", "TeamHouseFailure", false, false],
  ] as const) {
    test(`on a void the prize returns to whoever opened; ${name}`, async () => {
      const w = await openingWorld();
      run = await runCycle(
        w,
        ([ana, bruno]) =>
          entries
            ? [
                { who: ana, side: Side.Yes, amount: SOL / 2n },
                { who: bruno, side: Side.No, amount: SOL / 4n },
              ]
            : [],
        {
          how: "stale",
          teamVoid,
          stopAt: "settling",
        },
      );
      const c = campaignOf(w, run.campaign);
      const back = prizeReturnOf(c);
      expect(back).toEqual({ prize: c.prizeLamports, openingFee: refunded ? c.openingFeeLamports : 0n });
      expect(creatorShareStatus(c)).toEqual({ status: "none" });
      for (const bet of run.placed) {
        expect(entryOwed(c, await entryOf(w, run.campaign, bet.who.address)).amount).toBe(bet.amount);
      }
      await landVia(run.chain, run.keeper, [
        await buildSettlePrize({ campaign: run.campaign, recipient: w.creator.address }),
      ]);
      expect(run.delta(w.creator.address)).toBe(back.prize + back.openingFee);
    });
  }
});
