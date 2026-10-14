/**
 * Purpose: the chain watch's rules, as pure functions of one cycle's view (TP §3.5, "Observability and alerting";
 *          Sprint 07 DoD, the alert list; Sprint 16 DoD, the exposure and team-opening alerts): `open_campaigns`
 *          at 80% of `max_open_campaigns` or more; the SOL held in every campaign's vault above a threshold (no cap
 *          bounds a bug); each opening by a team key (a leaked team key opens for free); openings per hour above a
 *          threshold; a NO recorded with `met_late` in its review window; a reserved creator share older than seven
 *          days; Pyth's SOL/USD sponsored account older than `max_price_age` (paid openings are refused then); since
 *          Sprint 14, a contest opened (at stage 1, and again at stage 2) and a stage 2 with less than six hours left
 *          before it lapses with no decision. Each finding names its alert kind; `once` findings fire once per
 *          campaign (per stage) per process.
 * Version: 0.2.0 (Sprint 14: the contest's alerts)
 * Sprint:  07 carry-over (alerts declared, not emitted, in Sprint 07); 14 (lane L14K)
 */
import {
  ContestStage,
  Outcome,
  SOL_USD_FEED_HEX,
  Status,
  readPriceUpdate,
  type FetchedAccount,
  type GlobalConfig,
} from "@brot/sdk/read";

import type { AlertDetail, AlertKind } from "./alert";
import type { OpenCampaign } from "./campaigns";

export type Finding = { kind: AlertKind; key: string; detail: AlertDetail; once?: boolean };

export type WatchThresholds = {
  /** `open_campaigns` at or above this share of `max_open_campaigns`, in basis points (8,000: 80%). */
  openCampaignsAlertBps: number;
  /** The SOL in every campaign's vault, in lamports, above which the exposure alert fires. */
  exposureAlertLamports: bigint;
  /** Openings in the last hour above which an alert fires. */
  openingsPerHourMax: number;
  /** How far back a team opening is still news (a restart re-reads only this far). */
  teamOpeningLookbackSeconds: bigint;
  /** A reserved creator share older than this, counted from the resolution, alerts. */
  reservedAlertSeconds: bigint;
};

export const DEFAULT_THRESHOLDS: WatchThresholds = {
  openCampaignsAlertBps: 8_000,
  exposureAlertLamports: 100_000_000_000n,
  openingsPerHourMax: 20,
  teamOpeningLookbackSeconds: 3_600n,
  reservedAlertSeconds: 7n * 86_400n,
};

const HOUR = 3_600n;

/** The config's paid-opening count against its ceiling (the program counts paid openings only, founder answer 4). */
export function openCampaignsUsage(config: GlobalConfig | null) {
  if (!config) return null;
  const max = config.params.maxOpenCampaigns;
  const usageBps = max === 0 ? 0 : Math.floor((config.openCampaigns * 10_000) / max);
  return { openCampaigns: config.openCampaigns, maxOpenCampaigns: max, usageBps };
}

export function openCampaignsHigh(config: GlobalConfig | null, t: WatchThresholds): Finding | null {
  const usage = openCampaignsUsage(config);
  if (!usage || usage.maxOpenCampaigns === 0 || usage.usageBps < t.openCampaignsAlertBps) return null;
  return { kind: "open_campaigns_high", key: "config", detail: usage };
}

/** The SOL held in every vault (all statuses: a campaign holds money until it is closed). */
export const exposureOf = (vaults: ReadonlyMap<string, bigint>): bigint =>
  [...vaults.values()].reduce((sum, lamports) => sum + lamports, 0n);

export function exposureHigh(total: bigint, campaigns: number, t: WatchThresholds): Finding | null {
  if (total <= t.exposureAlertLamports) return null;
  const detail = { lamports: Number(total), threshold: Number(t.exposureAlertLamports), campaigns };
  return { kind: "exposure_high", key: "vaults", detail };
}

export function teamOpenings(campaigns: readonly OpenCampaign[], now: bigint, t: WatchThresholds): Finding[] {
  return campaigns
    .filter(({ campaign: c }) => c.creatorIsTeam && now - c.opensAt <= t.teamOpeningLookbackSeconds)
    .map(({ address, campaign: c }) => ({
      kind: "team_key_opening" as const,
      key: address,
      once: true,
      detail: { creator: c.creator, openingUsd: Number(c.openingUsd), opensAt: Number(c.opensAt) },
    }));
}

export function openingsPerHour(campaigns: readonly OpenCampaign[], now: bigint, t: WatchThresholds): Finding | null {
  const openings = campaigns.filter(({ campaign: c }) => now - c.opensAt < HOUR).length;
  if (openings <= t.openingsPerHourMax) return null;
  return { kind: "openings_per_hour_high", key: "hour", detail: { openings, max: t.openingsPerHourMax } };
}

export function metLateNo(campaigns: readonly OpenCampaign[]): Finding[] {
  return campaigns
    .filter(({ campaign: c }) => c.status === Status.InReview && c.outcome === Outcome.No && c.metLate)
    .map(({ address, campaign: c }) => ({
      kind: "met_late_no" as const,
      key: address,
      once: true,
      detail: { reviewEndsAt: Number(c.reviewEndsAt), observedValue: c.observedValue.toString() },
    }));
}

/** Age counted from the resolution: the campaign stores no reserve time, so this can fire up to the window early. */
export function reservedCreditsOld(campaigns: readonly OpenCampaign[], now: bigint, t: WatchThresholds): Finding[] {
  return campaigns
    .filter(({ campaign: c }) => c.creatorShareReserved > 0n && now - c.resolvedAt > t.reservedAlertSeconds)
    .map(({ address, campaign: c }) => ({
      kind: "reserved_credit_old" as const,
      key: address,
      detail: { creator: c.creator, lamports: Number(c.creatorShareReserved), resolvedAt: Number(c.resolvedAt) },
    }));
}

/** SOL/USD older than `max_price_age`, or unreadable: a paid opening is refused (`SolUsdStale` and kin). */
export function solUsdStale(account: FetchedAccount | null, config: GlobalConfig | null, now: bigint): Finding | null {
  if (!config) return null;
  const maxPriceAge = config.params.maxPriceAge;
  if (!account) return { kind: "sol_usd_stale", key: "sol-usd", detail: { reason: "account missing", maxPriceAge } };
  try {
    const reading = readPriceUpdate(account.owner, account.data, SOL_USD_FEED_HEX);
    const ageSeconds = Number(now - reading.publishTime);
    return ageSeconds > maxPriceAge
      ? { kind: "sol_usd_stale", key: "sol-usd", detail: { ageSeconds, maxPriceAge } }
      : null;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    return { kind: "sol_usd_stale", key: "sol-usd", detail: { reason, maxPriceAge } };
  }
}

/** A stage 2 this close to its deadline with no decision lapses soon: the stored result will stand. */
const STAGE2_WARNING_SECONDS = 6n * HOUR;

/** Each contest opened, once per stage: stage 1 (a team key opened it) and stage 2 (escalated, or a re-read differed). */
export function contestsOpened(campaigns: readonly OpenCampaign[]): Finding[] {
  return campaigns
    .filter(({ campaign: c }) => c.status === Status.Contested && c.contestStage !== ContestStage.None)
    .map(({ address, campaign: c }) => ({
      kind: "contest_opened" as const,
      key: `${address}:${c.contestStage}`,
      once: true,
      detail: { campaign: address, stage: c.contestStage, contestEndsAt: Number(c.contestEndsAt) },
    }));
}

/** A stage-2 contest with less than six hours before its deadline and no decision yet (the admin's to take). */
export function stage2Ending(campaigns: readonly OpenCampaign[], now: bigint): Finding[] {
  return campaigns
    .filter(
      ({ campaign: c }) =>
        c.status === Status.Contested &&
        c.contestStage === ContestStage.Stage2 &&
        c.contestEndsAt > now &&
        c.contestEndsAt - now < STAGE2_WARNING_SECONDS,
    )
    .map(({ address, campaign: c }) => ({
      kind: "contest_stage2_ending" as const,
      key: address,
      once: true,
      detail: { contestEndsAt: Number(c.contestEndsAt), minutesLeft: Number((c.contestEndsAt - now) / 60n) },
    }));
}
