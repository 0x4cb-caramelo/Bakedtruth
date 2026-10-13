/**
 * Purpose: a contested price YES re-read inside its proof window, on the binary (Sprint 14 red-team review, fix F4):
 *          a proof the caller offers and the reader refuses (a wallet, another feed, a stale price, a price that does
 *          not touch) refuses the re-read with the reader's own error and writes nothing, so no junk can force stage
 *          2; with no proof offered the reader cannot decide now, and the contest goes to stage 2; a fresh touching
 *          proof at the stored price pays, at another price it escalates. Filter: `bun test tests/ -t "contest proof"`.
 * Version: 0.1.0
 * Sprint:  14 (lane L14B, review fixes). Needs target/deploy/brot_markets.so.
 */
import { describe, expect, test } from "bun:test";
import type { Address } from "@solana/kit";

import * as C from "./contest-support";
import { BTC_PRICE, readCampaign } from "./flows";
import { proofAccount } from "./price-support";
import * as P from "./program";
import type { BrotErrorName } from "./errors";
import {
  at,
  campaignOn,
  clockSlot,
  DEADLINE,
  expectRefused,
  PRICE_MAX_AGE,
  PRICE_TARGET,
  snapshot,
} from "./resolve-support";
import { expectOk, fundedWallet, send } from "./setup";

/** The re-read happens an hour before the deadline: the proof window is open, so only the proof slot is read. */
const T = DEADLINE - C.HOUR;
/** The stored YES: a touch 30 s before the contest, the price 1% past the target. */
const STORED = (PRICE_TARGET * 101n) / 100n;

/** A world at `T` and a price YES contested at stage 1 until `T + HOUR`. */
async function contestedYes() {
  const cw = await C.contestWorld();
  at(cw.w, T);
  const c = await campaignOn(cw.w, P.ReaderKind.PriceTouch, P.BTC_USD_ACCOUNT, PRICE_TARGET, {
    feedId: P.BTC_USD_FEED_ID,
    priceExponent: -8,
    maxAge: Number(PRICE_MAX_AGE),
    status: P.Status.Contested,
    extra: {
      outcome: P.Outcome.Yes,
      observed_value: STORED,
      publish_time: T - 30n,
      contest_stage: 1,
      contest_ends_at: T + C.HOUR,
      event_seq: C.SEQ,
      entries_open: 2,
    },
  });
  return { cw, c };
}

/** A BTC/USD update at a fresh address, posted in the current slot, published `age` seconds before `T`. */
const proof = (cw: C.ContestWorld, price: bigint, age: bigint) =>
  proofAccount(cw.w, { price, conf: 0n, publishTime: T - age, postedSlot: clockSlot(cw.w) });

describe("contest proof", () => {
  test("contest proof: an offered proof the reader refuses refuses the re-read with the reader's error", async () => {
    const { cw, c } = await contestedYes();
    const refusals: [Address, BrotErrorName][] = [
      [(await fundedWallet(cw.w)).address, "ReaderWrongOwner"], // a wallet, not a price account
      [c.vault, "ReaderWrongOwner"], // the campaign's vault, owned by this program
      [P.SOL_USD_ACCOUNT, "PriceWrongFeed"], // a real update of another feed
      [await proof(cw, STORED, 600n), "ProofStale"], // a touch, ten minutes old
      [await proof(cw, BTC_PRICE, 5n), "ProofDoesNotTouch"], // fresh, below the target
    ];
    for (const [offered, error] of refusals) {
      await expectRefused(cw.w, c, await C.rereadIx(c, offered), error);
    }
    // The campaign itself as the proof: the program holds its data, the reader's borrow fails, and the re-read is
    // refused by the runtime's error: it never escalates.
    const before = snapshot(cw.w, c);
    expect((await send(cw.w, [await C.rereadIx(c, c.campaign)])).ok).toBe(false);
    expect(snapshot(cw.w, c)).toEqual(before);
    expect(readCampaign(cw.w, c.campaign)).toMatchObject({ status: P.Status.Contested, contest_stage: 1 });
  });

  test("contest proof: with no proof offered the reader cannot decide now, and the contest goes to stage 2", async () => {
    const { cw, c } = await contestedYes();
    const sent = expectOk(await C.reread(cw, c));
    expect(sent.events[0].data).toMatchObject({ same: false, outcome: P.Outcome.Unresolved, contest_stage: 2 });
    expect(readCampaign(cw.w, c.campaign).contest_ends_at).toBe(T + C.STAGE2_SECONDS);
  });

  test("contest proof: a fresh touch at the stored price pays, at another price it escalates", async () => {
    const same = await contestedYes();
    expectOk(await C.reread(same.cw, same.c, await proof(same.cw, STORED, 5n)));
    expect(readCampaign(same.cw.w, same.c.campaign).status).toBe(P.Status.Settling);
    const moved = await contestedYes();
    const sent = expectOk(await C.reread(moved.cw, moved.c, await proof(moved.cw, STORED + 1n, 5n)));
    expect(sent.events[0].data).toMatchObject({ same: false, outcome: P.Outcome.Yes, observed_value: STORED + 1n });
    expect(readCampaign(moved.cw.w, moved.c.campaign).contest_stage).toBe(2);
  });
});
