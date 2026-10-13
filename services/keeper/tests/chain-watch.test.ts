/**
 * Purpose: every chain-watch alert fires in a test (Sprint 07 DoD, the alert list; Sprint 16 DoD: the 80% alert,
 *          the exposure alert and the team-opening alert): `open_campaigns_high` at 80% of `max_open_campaigns` and
 *          not below; `exposure_high` above the threshold; `team_key_opening` once per campaign; `openings_per_hour_
 *          high`; `met_late_no` once; `reserved_credit_old` after seven days; `sol_usd_stale`; and `campaign_idle`
 *          for a resolvable campaign after 10 minutes and a settling one whose account has not changed for 30. Pure
 *          views and a spy alerter; the clock is injected.
 * Version: 0.1.0
 * Sprint:  07 carry-over (the alerts declared in Sprint 07, never emitted)
 */
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Outcome, PYTH_RECEIVER_ID, SOL_USD_ACCOUNT, Status, type ChainTime } from "@brot/sdk/read";

import type { AlertDetail, AlertKind, Alerter } from "../src/alert";
import type { ChainView } from "../src/chain";
import { createChainWatch } from "../src/chain-watch";
import type { AttemptResult } from "../src/resolve";
import { DEFAULT_THRESHOLDS } from "../src/watch-rules";
import { at, configWith, KEY } from "./kit/accounts";

const NOW = 1_800_000_000n;
const CHAIN: ChainTime = { slot: 1n, epoch: 1n, unixTimestamp: NOW };
/** The captured devnet SOL/USD update; its publish time is moved by the test. */
const SOL_USD = new Uint8Array(readFileSync(join(import.meta.dir, "../../../tests/fixtures/pyth-sol-usd-devnet.bin")));

function solUsdAt(publishTime: bigint) {
  const data = SOL_USD.slice();
  new DataView(data.buffer).setBigInt64(93, publishTime, true);
  return { address: SOL_USD_ACCOUNT, owner: PYTH_RECEIVER_ID, data, lamports: 1n };
}

const view = (over: Partial<ChainView> = {}): ChainView => ({
  chain: CHAIN,
  campaigns: [],
  config: configWith({ openCampaigns: 1 }, { maxOpenCampaigns: 1_000, maxPriceAge: 120 }),
  feeVault: null,
  solUsd: solUsdAt(NOW - 10n),
  metrics: new Map(),
  vaults: new Map(),
  keeperLamports: 0n,
  batches: 1,
  ...over,
});

function spy() {
  const fired: Array<{ kind: AlertKind; key: string; detail: AlertDetail }> = [];
  const alerter: Alerter = { alert: (kind, key, detail) => (fired.push({ kind, key, detail }), true) };
  let wall = 0;
  const watch = createChainWatch(alerter, DEFAULT_THRESHOLDS, undefined, () => wall);
  return { fired, watch, setWall: (ms: number) => (wall = ms), kinds: () => fired.map((f) => f.kind) };
}

describe("the chain watch", () => {
  test("open_campaigns at 80% of max_open_campaigns fires, and 79.9% does not", () => {
    const s = spy();
    s.watch.observe(
      view({ config: configWith({ openCampaigns: 799 }, { maxOpenCampaigns: 1_000, maxPriceAge: 120 }) }),
      [],
      false,
    );
    expect(s.kinds()).toEqual([]);
    s.watch.observe(
      view({ config: configWith({ openCampaigns: 800 }, { maxOpenCampaigns: 1_000, maxPriceAge: 120 }) }),
      [],
      false,
    );
    expect(s.fired).toEqual([
      {
        kind: "open_campaigns_high",
        key: "config",
        detail: { openCampaigns: 800, maxOpenCampaigns: 1_000, usageBps: 8_000 },
      },
    ]);
  });

  test("the SOL held in the vaults above the threshold fires exposure_high", () => {
    const s = spy();
    const vaults = new Map([
      [KEY(1), 60_000_000_000n],
      [KEY(2), 40_000_000_000n],
    ]);
    s.watch.observe(view({ vaults }), [], false);
    expect(s.kinds()).toEqual([]); // exactly the threshold: not above it
    s.watch.observe(view({ vaults: new Map([...vaults, [KEY(3), 1n]]) }), [], false);
    expect(s.fired[0]).toMatchObject({ kind: "exposure_high", detail: { lamports: 100_000_000_001, campaigns: 0 } });
  });

  test("an opening by a team key fires once; an old one does not; too many openings in an hour fires", () => {
    const s = spy();
    const team = at(1, { creatorIsTeam: true, opensAt: NOW - 30n, creator: KEY(9) });
    const old = at(2, { creatorIsTeam: true, opensAt: NOW - 7_200n });
    s.watch.observe(view({ campaigns: [team, old] }), [], false);
    s.watch.observe(view({ campaigns: [team, old] }), [], false);
    expect(s.fired).toEqual([
      { kind: "team_key_opening", key: KEY(1), detail: { creator: KEY(9), openingUsd: 0, opensAt: Number(NOW - 30n) } },
    ]);
    const burst = Array.from({ length: 21 }, (_, i) => at(3 + (i % 25), { opensAt: NOW - 60n }));
    s.watch.observe(view({ campaigns: burst }), [], false);
    expect(s.fired.at(-1)).toMatchObject({ kind: "openings_per_hour_high", detail: { openings: 21, max: 20 } });
  });

  test("a NO recorded with met_late fires once; a reserved share older than seven days fires", () => {
    const s = spy();
    const late = at(1, { status: Status.InReview, outcome: Outcome.No, metLate: true, reviewEndsAt: NOW + 60n });
    const reserve = at(2, {
      status: Status.Settled,
      creatorShareReserved: 5n,
      resolvedAt: NOW - 8n * 86_400n,
      creator: KEY(9),
    });
    s.watch.observe(view({ campaigns: [late, reserve] }), [], false);
    s.watch.observe(view({ campaigns: [late] }), [], false);
    expect(s.kinds()).toEqual(["met_late_no", "reserved_credit_old"]);
  });

  test("SOL/USD older than max_price_age, or missing, fires sol_usd_stale", () => {
    const s = spy();
    s.watch.observe(view({ solUsd: solUsdAt(NOW - 120n) }), [], false);
    expect(s.kinds()).toEqual([]);
    s.watch.observe(view({ solUsd: solUsdAt(NOW - 121n) }), [], false);
    s.watch.observe(view({ solUsd: null }), [], false);
    expect(s.fired.map((f) => [f.kind, f.detail.ageSeconds ?? f.detail.reason])).toEqual([
      ["sol_usd_stale", 121],
      ["sol_usd_stale", "account missing"],
    ]);
  });

  test("campaign_idle: resolvable for more than 10 minutes, or settling with no change for more than 30", () => {
    const s = spy();
    const resolvable: AttemptResult[] = [{ attempt: "wouldResolve", campaign: KEY(1), detail: null, resolvable: true }];
    s.setWall(0);
    s.watch.observe(view(), resolvable, false);
    s.setWall(10 * 60_000);
    s.watch.observe(view(), resolvable, false);
    expect(s.kinds()).toEqual([]);
    s.setWall(10 * 60_000 + 1);
    s.watch.observe(view(), resolvable, false);
    expect(s.fired[0]).toMatchObject({ kind: "campaign_idle", key: KEY(1), detail: { phase: "resolvable" } });

    const t = spy();
    const settling = at(2, { status: Status.Settling, entriesOpen: 2, eventSeq: 7n });
    t.watch.observe(view({ campaigns: [settling] }), [], false);
    t.setWall(29 * 60_000);
    t.watch.observe(view({ campaigns: [at(2, { status: Status.Settling, entriesOpen: 1, eventSeq: 8n })] }), [], false);
    t.setWall(59 * 60_000);
    t.watch.observe(view({ campaigns: [at(2, { status: Status.Settling, entriesOpen: 1, eventSeq: 8n })] }), [], false);
    expect(t.kinds()).toEqual([]); // it moved at minute 29: the count started again
    t.setWall(59 * 60_000 + 1);
    t.watch.observe(view({ campaigns: [at(2, { status: Status.Settling, entriesOpen: 1, eventSeq: 8n })] }), [], true);
    expect(t.fired[0]).toMatchObject({
      kind: "campaign_idle",
      detail: { phase: "settling", status: "Settling", keeperSettles: true },
    });
  });
});
