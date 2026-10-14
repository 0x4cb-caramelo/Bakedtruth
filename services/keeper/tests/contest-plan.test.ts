/**
 * Purpose: what Sprints 14 and 15 add to the keeper's plan and watch, pure: every open sealed fee settled to its stored
 *          sponsor once the campaign is finalized, and the close planned only when the campaign counts none open (a
 *          close is never tried against `SealedFeesOpen`); a contest finalized only once the SDK's view says it lapsed
 *          (stage 2's deadline, or 48 hours after an unread stage 1's); the alerts of a contest opened (once per
 *          stage), of a stage 2 near its deadline, and of a sealed fee still open a cycle later; and the keeper's
 *          source never building a team's or the admin's contest act. No cluster.
 * Version: 0.1.0
 * Sprint:  14 and 15 (lane L14K)
 */
import { describe, expect, test } from "bun:test";
import type { Address } from "@solana/kit";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ContestStage, SettleMode, Status, type ChainTime, type SealedFee } from "@brot/sdk/read";

import type { AlertKind, Alerter } from "../src/alert";
import type { SealedFeeAt } from "../src/campaigns";
import type { ChainView } from "../src/chain";
import { createChainWatch } from "../src/chain-watch";
import { contestLapsed, planCampaign, stepKey } from "../src/settle-plan";
import { DEFAULT_THRESHOLDS } from "../src/watch-rules";
import { at, configWith, KEY } from "./kit/accounts";

const NOW = 1_800_000_000n;
const HOUR = 3_600n;
const SPONSOR = KEY(5);
const OTHER = KEY(6);
const sealedAt = (campaign: Address, sponsor: Address): SealedFeeAt => {
  const fee = { tag: 6, version: 1, bump: 255, campaign, sponsor, feeLamports: 1n, entryLamports: 9n, usdTotal: 500n };
  return { address: KEY(29), fee: { ...fee, sealedCount: 1, reserved: new Uint8Array(17) } as SealedFee };
};

describe("sealed fees in the plan", () => {
  const settled = (over = {}) =>
    at(10, {
      status: Status.Settled,
      settleMode: SettleMode.OneSided,
      feeCollected: true,
      prizeSettled: true,
      creatorShareSettled: true,
      rentPayer: KEY(2),
      ...over,
    });

  test("each open sealed fee is settled to its stored sponsor; the close waits until none is counted open", () => {
    const fees = [sealedAt(KEY(10), SPONSOR), sealedAt(KEY(10), OTHER)];
    const steps = planCampaign(settled({ sealedFeesOpen: 2 }), null, NOW, false, fees);
    expect(steps).toEqual([
      { kind: "sealedFee", campaign: KEY(10), sponsor: SPONSOR },
      { kind: "sealedFee", campaign: KEY(10), sponsor: OTHER },
    ]);
    expect(steps.map(stepKey)).toEqual([`sealedFee:${KEY(10)}:${SPONSOR}`, `sealedFee:${KEY(10)}:${OTHER}`]);
    // Counted open but not listed (an RPC behind): no fee step, and still no close.
    expect(planCampaign(settled({ sealedFeesOpen: 1 }), null, NOW, false, null)).toEqual([]);
    expect(planCampaign(settled(), null, NOW, false, null)).toEqual([
      { kind: "close", campaign: KEY(10), rentPayer: KEY(2) },
    ]);
  });
});

describe("a contest in the plan", () => {
  const contested = (stage: ContestStage, endsAt: bigint) =>
    at(11, { status: Status.Contested, contestStage: stage, contestEndsAt: endsAt });

  test("finalized only once lapsed: stage 2 at its deadline, an unread stage 1 48 hours after its own", () => {
    expect(planCampaign(contested(ContestStage.Stage2, NOW + 1n), null, NOW, false)).toEqual([]);
    expect(planCampaign(contested(ContestStage.Stage2, NOW), null, NOW, false)).toEqual([
      { kind: "finalize", campaign: KEY(11) },
    ]);
    const stage1 = contested(ContestStage.Stage1, NOW - 47n * HOUR);
    expect(contestLapsed(stage1.campaign, NOW)).toBe(false);
    expect(contestLapsed(stage1.campaign, NOW + HOUR)).toBe(true);
    expect(planCampaign(stage1, null, NOW + HOUR, false)).toEqual([{ kind: "finalize", campaign: KEY(11) }]);
  });
});

const CHAIN: ChainTime = { slot: 1n, epoch: 1n, unixTimestamp: NOW };
const view = (campaigns: ChainView["campaigns"]): ChainView => ({
  chain: CHAIN,
  campaigns,
  config: configWith({ openCampaigns: 1 }, { maxOpenCampaigns: 1_000, maxPriceAge: 120 }),
  feeVault: null,
  solUsd: null,
  metrics: new Map(),
  vaults: new Map(),
  keeperLamports: 0n,
  batches: 1,
});

function spy() {
  const fired: Array<[AlertKind, string]> = [];
  const alerter: Alerter = { alert: (kind, key) => (fired.push([kind, key]), true) };
  return { fired, watch: createChainWatch(alerter, DEFAULT_THRESHOLDS) };
}

describe("the contest's and the sealed fee's alerts", () => {
  test("a contest opened fires once per stage; a stage 2 with under six hours left fires once", () => {
    const s = spy();
    const stage1 = at(12, {
      status: Status.Contested,
      contestStage: ContestStage.Stage1,
      contestEndsAt: NOW + 20n * HOUR,
    });
    s.watch.observe(view([stage1]), [], true);
    s.watch.observe(view([stage1]), [], true);
    const stage2 = at(12, {
      status: Status.Contested,
      contestStage: ContestStage.Stage2,
      contestEndsAt: NOW + 7n * HOUR,
    });
    s.watch.observe(view([stage2]), [], true);
    const ending = at(12, {
      status: Status.Contested,
      contestStage: ContestStage.Stage2,
      contestEndsAt: NOW + 5n * HOUR,
    });
    s.watch.observe(view([ending]), [], true);
    s.watch.observe(view([ending]), [], true);
    expect(s.fired.filter(([kind]) => kind.startsWith("contest"))).toEqual([
      ["contest_opened", `${KEY(12)}:1`],
      ["contest_opened", `${KEY(12)}:2`],
      ["contest_stage2_ending", KEY(12)],
    ]);
  });

  test("a sealed fee still open on a finalized campaign a cycle later fires; a settled one does not", () => {
    const s = spy();
    const open = at(13, { status: Status.Settling, entriesOpen: 1, sealedFeesOpen: 1 });
    s.watch.observe(view([open]), [], true);
    expect(s.fired.filter(([kind]) => kind === "sealed_fee_open")).toEqual([]);
    s.watch.observe(view([open]), [], true);
    expect(s.fired.filter(([kind]) => kind === "sealed_fee_open")).toEqual([["sealed_fee_open", KEY(13)]]);
    const t = spy();
    t.watch.observe(view([open]), [], true);
    t.watch.observe(view([at(13, { status: Status.Settling, entriesOpen: 1 })]), [], true);
    t.watch.observe(view([open]), [], true);
    expect(t.fired.filter(([kind]) => kind === "sealed_fee_open")).toEqual([]); // the count starts again
  });
});

describe("the keeper never acts for the team or the admin", () => {
  test("no source file builds team_open_contest or admin_decide_contest", () => {
    const dir = join(import.meta.dir, "../src");
    for (const file of readdirSync(dir)) {
      const text = readFileSync(join(dir, file), "utf8");
      expect(text).not.toMatch(/buildTeamOpenContest|buildAdminDecideContest|TeamOpenContest|AdminDecideContest/);
    }
  });
});
