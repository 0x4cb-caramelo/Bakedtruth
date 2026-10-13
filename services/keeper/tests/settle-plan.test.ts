/**
 * Purpose: the settlement planner's rules, pure (Sprint 06 DoD: finalize, settle in batches, the daily retry of a
 *          reserved credit, and "never send to a destination the program did not fix"): what each status plans, the
 *          YES price cut-off that holds the tally until the window ends, the joins chunked per tally, the steps the
 *          program would refuse never planned, every destination a stored field (and the built instruction's account
 *          slot the same one), the sweep's minimum and the daily clock. No cluster.
 * Version: 0.1.0
 * Sprint:  07 carry-over (Sprint 06 DoD: the keeper's settlement)
 */
import { describe, expect, test } from "bun:test";
import { AccountRole } from "@solana/kit";
import { Outcome, ReaderKind, SettleMode, Status } from "@brot/sdk/read";

import { DailyClock } from "../src/backoff";
import { buildStep } from "../src/settle";
import { JOINS_PER_TALLY, pendingOf, planCampaign, planSweep, type Step } from "../src/settle-plan";
import { at, entryAt, KEY } from "./kit/accounts";

const NOW = 1_800_000_000n;
const CREATOR = KEY(1);
const RENT_PAYER = KEY(2);
const BAKER = KEY(3);
const OTHER = KEY(4);
const kinds = (steps: Step[]) => steps.map((step) => step.kind);

describe("planCampaign", () => {
  const review = (over = {}) =>
    at(10, { status: Status.InReview, reviewEndsAt: NOW + 60n, entriesUntallied: 1, entriesOpen: 1, ...over });

  test("a YES price result is left alone in its window (its cut-off may move); any other is tallied at once", () => {
    const entries = [entryAt(KEY(10), BAKER, { joinCount: 2 })];
    const yesPrice = review({ kind: ReaderKind.PriceTouch, outcome: Outcome.Yes });
    expect(planCampaign(yesPrice, entries, NOW, false)).toEqual([]);
    expect(kinds(planCampaign(yesPrice, entries, NOW + 60n, false))).toEqual(["tally"]);
    for (const other of [
      review({ kind: ReaderKind.PriceTouch, outcome: Outcome.No }),
      review({ kind: ReaderKind.SupplyAtMost, outcome: Outcome.Yes }),
    ]) {
      expect(planCampaign(other, entries, NOW, false)).toEqual([
        { kind: "tally", campaign: KEY(10), baker: BAKER, from: 0, to: 2 },
      ]);
    }
  });

  test("joins are tallied from joins_tallied, in chunks; finalize waits for every tally and the window's end", () => {
    const entries = [entryAt(KEY(10), BAKER, { joinCount: 45, joinsTallied: 3 })];
    const steps = planCampaign(review({ outcome: Outcome.No }), entries, NOW, false);
    expect(steps.map((s) => (s.kind === "tally" ? [s.from, s.to] : null))).toEqual([
      [3, 3 + JOINS_PER_TALLY],
      [3 + JOINS_PER_TALLY, 3 + 2 * JOINS_PER_TALLY],
      [43, 45],
    ]);
    const tallied = review({ outcome: Outcome.No, entriesUntallied: 0 });
    expect(planCampaign(tallied, [], NOW, false)).toEqual([]);
    expect(planCampaign(tallied, [], NOW + 60n, false)).toEqual([{ kind: "finalize", campaign: KEY(10) }]);
  });

  test("Settling: every entry to its stored baker, the share and the prize to the stored creator; no fee yet", () => {
    const c = at(11, {
      status: Status.Settling,
      settleMode: SettleMode.Split,
      creator: CREATOR,
      rentPayer: RENT_PAYER,
      creatorShare: 5n,
      entriesOpen: 2,
    });
    const entries = [
      entryAt(KEY(11), BAKER, { joinCount: 1, joinsTallied: 1 }),
      entryAt(KEY(11), OTHER, { joinCount: 1, joinsTallied: 1 }),
    ];
    expect(planCampaign(c, entries, NOW, false)).toEqual([
      { kind: "settleEntry", campaign: KEY(11), baker: BAKER },
      { kind: "settleEntry", campaign: KEY(11), baker: OTHER },
      { kind: "creatorShare", campaign: KEY(11), creator: CREATOR, claim: false },
      { kind: "settlePrize", campaign: KEY(11), recipient: CREATOR },
    ]);
  });

  test("Settled: the fee, then the close to the stored rent payer once every flag is set; nothing the program refuses", () => {
    const flags = { feeCollected: true, prizeSettled: true, creatorShareSettled: true };
    const settled = (over = {}) =>
      at(12, {
        status: Status.Settled,
        creator: CREATOR,
        rentPayer: RENT_PAYER,
        settleMode: SettleMode.OneSided,
        ...over,
      });
    expect(kinds(planCampaign(settled({ creatorShareSettled: true }), null, NOW, false))).toEqual([
      "settlePrize",
      "collectFee",
    ]);
    expect(planCampaign(settled(flags), null, NOW, false)).toEqual([
      { kind: "close", campaign: KEY(12), rentPayer: RENT_PAYER },
    ]);
    // A reserve held for a creator who is not the rent payer blocks the close (`ReserveNotClaimable`).
    expect(planCampaign(settled({ ...flags, creatorShareReserved: 9n }), null, NOW, false)).toEqual([]);
    // No share is planned when none is owed: a team opening, or a pot that did not split.
    const team = at(13, {
      status: Status.Settled,
      settleMode: SettleMode.Split,
      creatorIsTeam: true,
      creatorShare: 5n,
    });
    expect(kinds(planCampaign(team, null, NOW, false))).not.toContain("creatorShare");
    // Open and Contested are not the settlement's.
    expect(planCampaign(at(14, { status: Status.Open }), null, NOW, false)).toEqual([]);
    expect(planCampaign(at(15, { status: Status.Contested }), null, NOW, false)).toEqual([]);
  });

  test("a reserved share is claimed again only when the daily clock says so", () => {
    const reserved = at(16, {
      status: Status.Settled,
      creator: CREATOR,
      rentPayer: RENT_PAYER,
      creatorShareSettled: true,
      creatorShareReserved: 7n,
      feeCollected: true,
      prizeSettled: true,
    });
    expect(planCampaign(reserved, null, NOW, false)).toEqual([]);
    expect(planCampaign(reserved, null, NOW, true)).toEqual([
      { kind: "creatorShare", campaign: KEY(16), creator: CREATOR, claim: true },
    ]);
    const clock = new DailyClock(1_000);
    expect(clock.due("claim", 0)).toBe(false); // the first sighting starts the day
    expect(clock.due("claim", 999)).toBe(false);
    expect(clock.due("claim", 1_000)).toBe(true);
    clock.mark("claim", 1_000);
    expect(clock.due("claim", 1_500)).toBe(false);
  });
});

describe("destinations", () => {
  test("each built instruction's destination slot is the stored field, never the keeper's choice", async () => {
    const campaign = KEY(20);
    const steps: Step[] = [
      { kind: "settleEntry", campaign, baker: BAKER },
      { kind: "creatorShare", campaign, creator: CREATOR, claim: false },
      { kind: "settlePrize", campaign, recipient: CREATOR },
      { kind: "close", campaign, rentPayer: RENT_PAYER },
      { kind: "sweep", feeRecipient: OTHER },
    ];
    const slot = { settleEntry: 3, creatorShare: 2, settlePrize: 2, close: 2, sweep: 2 } as const;
    const want = { settleEntry: BAKER, creatorShare: CREATOR, settlePrize: CREATOR, close: RENT_PAYER, sweep: OTHER };
    for (const step of steps) {
      const { ix, kind } = await buildStep(step);
      const metas = ix.accounts ?? [];
      expect(metas[slot[kind as keyof typeof slot]]?.address).toBe(want[kind as keyof typeof want]);
      // No signer among the accounts: the keeper signs only as the fee payer.
      expect(metas.some((m) => m.role === AccountRole.WRITABLE_SIGNER || m.role === AccountRole.READONLY_SIGNER)).toBe(
        false,
      );
    }
  });
});

describe("planSweep and pendingOf", () => {
  test("the sweep waits for a surplus above the rent of at least the minimum", () => {
    expect(planSweep(null, 10n, 0n, OTHER)).toBeNull();
    expect(planSweep(10n, 10n, 0n, OTHER)).toBeNull();
    expect(planSweep(15n, 10n, 10n, OTHER)).toBeNull();
    expect(planSweep(20n, 10n, 10n, OTHER)).toEqual({ kind: "sweep", feeRecipient: OTHER });
  });

  test("pending work is counted from the campaigns alone", () => {
    const pending = pendingOf(
      [
        at(1, { status: Status.InReview, reviewEndsAt: NOW - 1n, entriesUntallied: 2, outcome: Outcome.No }),
        at(2, { status: Status.Settling, entriesOpen: 3, settleMode: SettleMode.Split, creatorShare: 1n }),
        at(3, { status: Status.Settled, creatorShareReserved: 4n, prizeSettled: true, feeCollected: true }),
      ],
      NOW,
    );
    expect(pending).toEqual({
      tally: 2,
      finalize: 1,
      entries: 3,
      creatorShare: 1,
      fee: 1,
      prize: 1,
      close: 1,
      reserved: 1,
    });
  });
});
