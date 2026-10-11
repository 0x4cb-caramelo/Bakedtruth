/**
 * Purpose: three promises of the creation box, each tested on its own (the Sprint 19 coordinator review, S-2 and S-3):
 *          "Check before you sign" writes its sentence, account and target from the prepared choice alone, in the
 *          kind's unit, and the button acts only on a verdict computed for the draft on screen (A-3; the adversarial
 *          review, H1); the browser's opening records are deleted a day after they were saved, whatever their state,
 *          and nothing else is (the privacy page's rule); and while the account in a slot is still being read, the box
 *          waits instead of flashing a refusal. Filter: `bun test tests/ -t "the creation box keeps its promises"`.
 * Version: 0.1.0
 * Sprint:  19 (site: open a campaign)
 */
import { afterEach, describe, expect, test } from "bun:test";
import { address, createSolanaRpc } from "@solana/kit";

import { bytesToHex, Direction, ReaderKind } from "@brot/sdk/read";

import { checkBox, readyToReview, type BoxCheck } from "../../app/features/open-campaign/check";
import { EMPTY_DRAFT } from "../../app/features/open-campaign/draft";
import { readWorld } from "../../app/features/open-campaign/reads";
import { openingKey, pruneSettledOpenings } from "../../app/features/open-campaign/retry-guard";
import { exactDecimal, reviewFacts } from "../../app/features/open-campaign/review-facts";
import { KEEP_SETTLED_MS } from "../../app/features/entry/retry-guard";
import { openingWorld } from "../brot/opening";
import * as P from "../brot/program";
import { startFakeChain, type FakeChain } from "./fake-chain";

const MINT = address("So11111111111111111111111111111111111111112");
let chain: FakeChain | null = null;
afterEach(() => chain?.close());

describe("the creation box keeps its promises", () => {
  test("the review sheet's facts come from the prepared choice alone, in the kind's unit", () => {
    const base = { deadlineAt: 0n, openingUsd: 500n };
    const price = reviewFacts({
      choice: {
        ...base,
        kind: ReaderKind.PriceTouch,
        feedId: bytesToHex(P.BTC_USD_FEED_ID),
        target: 9_373_357_000_000n,
      },
      priceExponent: -8,
      metric: P.BTC_USD_ACCOUNT,
      names: [],
    });
    expect([price.sentence, price.target, price.account.label]).toEqual([
      "BTC/USD reaches 93,733.57",
      "US$93,733.57",
      "Pyth's BTC/USD price account",
    ]);
    const burn = reviewFacts({
      choice: { ...base, kind: ReaderKind.SupplyAtMost, metricAccount: MINT, target: 900_000n },
      priceExponent: 0,
      metric: MINT,
      names: [{ address: MINT, kind: "burn", name: "Wrapped SOL" }],
    });
    expect([burn.sentence, burn.target, burn.account.label]).toEqual([
      "So11…1112 supply falls to 900,000 raw units",
      "900,000 raw units",
      "Wrapped SOL, owned by the classic SPL Token program",
    ]);
    const pool = reviewFacts({
      choice: {
        ...base,
        kind: ReaderKind.StakePoolTvlAtLeast,
        metricAccount: MINT,
        target: 431_880_500_000_000n,
        epoch: 812n,
      },
      priceExponent: 0,
      metric: MINT,
      names: [],
    });
    expect([pool.sentence, pool.target]).toEqual([
      "Stake pool So11…1112 holds at least 431,880.5 SOL at the start of epoch 812",
      "431,880.5 SOL",
    ]);
    expect([exactDecimal(12_345_678n, -8), exactDecimal(1_000_000_000n, -9)]).toEqual(["0.12345678", "1"]);
    expect(Direction.Above).toBe(0);
  });

  test("the button acts only on a verdict computed for the draft on screen", () => {
    const draft = { ...EMPTY_DRAFT, target: "100" };
    const check = { draft, issues: [], verdict: { ok: true } } as unknown as BoxCheck;
    expect(readyToReview(check, draft)).toBe(true);
    expect(readyToReview(check, { ...draft })).toBe(false); // the same fields, typed again: a new draft
    expect(readyToReview({ ...check, issues: [{ place: "wallet" }] } as unknown as BoxCheck, draft)).toBe(false);
  });

  test("an opening record goes a day after it was saved, whatever its state; nothing else is touched", () => {
    const map = new Map<string, string>();
    const local = {
      get length() {
        return map.size;
      },
      key: (i: number) => [...map.keys()][i] ?? null,
      getItem: (k: string) => map.get(k) ?? null,
      setItem: (k: string, v: string) => void map.set(k, v),
      removeItem: (k: string) => void map.delete(k),
    };
    const day = KEEP_SETTLED_MS;
    const at = (wallet: string, state: string, savedAt: number) =>
      local.setItem(openingKey(wallet), JSON.stringify({ v: 1, creator: wallet, state, savedAt }));
    at("old-handed", "handed", 0);
    at("old-expired", "expired", 0);
    at("fresh-handed", "handed", 2 * day - 1_000);
    local.setItem(openingKey("unreadable"), "{not json");
    local.setItem("brot-pending:another-guard", "kept");
    local.setItem("another-site-key", "kept");
    pruneSettledOpenings(local, 2 * day);
    expect([...map.keys()].sort()).toEqual(
      ["another-site-key", "brot-pending:another-guard", openingKey("fresh-handed")].sort(),
    );
  });

  test("while the slot's account is read, the box waits instead of flashing a refusal", async () => {
    const w = await openingWorld();
    chain = startFakeChain(w);
    const world = await readWorld(createSolanaRpc(chain.url));
    const draft = { ...EMPTY_DRAFT, kind: "burn" as const, account: MINT, target: "1000", deadline: { days: 7 } };
    const inputs = { draft, world, readFailed: false, id: 1n, wallet: w.team.address, balance: null, siteAllows: true };
    const reading = await checkBox({ ...inputs, accounts: null });
    expect(reading.verdict).toBeNull();
    expect(reading.issues.map((i) => [i.place, i.level, i.refusal ?? null])).toEqual([["account", "wait", null]]);
  });
});
