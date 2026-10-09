/**
 * Purpose: the randomized test's opening and joining operations: a paid opening (the 10% fee and the prize), a
 *          team opening (free), a join on either side, the pause, each with its expected refusal and changes.
 * Version: 0.0.1
 * Sprint:  04 (contract freeze, lane E)
 */
import { type Address } from "@solana/kit";

import { BTC_PRICE, openingLamports } from "./flows";
import { FREE, split } from "./opening";
import { DAY, entriesCloseFor, newCampaign, sumOf, type Join, type ModelCampaign } from "./invariant-model";
import * as I from "./instructions";
import { clock, type Harness, type Plan, refreshBase, refreshSol, OPENING_PRICE } from "./invariant-harness";
import type { BrotErrorName } from "./errors";

export type JoinOp = { k: "join"; c: number; baker: number; side: 0 | 1; amount: bigint };
import * as P from "./program";

export const OPEN_USD = 500n;
export const TARGET = (BTC_PRICE * 11n) / 10n;

/** Campaigns the valve counts: paid, opened and not yet snapshotted (I7). */
export const countOpen = (h: Harness) => h.camps.filter((c) => c.counted && !c.snapshot && !c.closed).length;

export async function planOpenPaid(h: Harness, creatorIndex: number, days: number): Promise<Plan> {
  const creator = h.creators[creatorIndex];
  const id = h.nextId;
  const t = clock(h);
  const deadline = t + BigInt(days) * DAY;
  const { prize, fee, paid } = split(openingLamports(OPEN_USD, OPENING_PRICE, -8));
  refreshBase(h.w);
  refreshSol(h.w);
  const campaign = await P.campaignPda(id);
  const vault = await P.vaultPda(campaign);
  const ix = await I.openCampaignIx(creator, {
    id,
    feedId: P.BTC_USD_FEED_ID,
    target: TARGET,
    deadlineAt: deadline,
    openingUsd: OPEN_USD,
    maxLamports: 10n * P.SOL,
  });
  const error: BrotErrorName | undefined = h.paused
    ? "OpenWhilePaused"
    : countOpen(h) >= h.max
      ? "TooManyOpenCampaigns"
      : undefined;
  return {
    ixs: [ix],
    error,
    deltas: new Map<string, bigint>([
      [creator.address, -(paid + h.rent.campaign + h.rent.vault)],
      [campaign, h.rent.campaign],
      [vault, h.rent.vault + paid],
    ]),
    apply: () => {
      const c = newCampaign({
        label: `c${id}`,
        team: false,
        creator: creator.address,
        prize,
        openingFee: fee,
        deadline,
        opensAt: t,
        entriesCloseAt: entriesCloseFor(t, deadline),
      });
      record(h, c, campaign, vault);
    },
  };
}

/** Team openings are free and outside the valve (TP section 3.4.10). */
export async function planOpenTeam(h: Harness, memberIndex: number): Promise<Plan> {
  const member = h.team[memberIndex];
  const id = h.nextId;
  const t = clock(h);
  const deadline = t + 7n * DAY;
  refreshBase(h.w);
  const campaign = await P.campaignPda(id);
  const vault = await P.vaultPda(campaign);
  const ix = await I.openCampaignIx(member, {
    id,
    feedId: P.BTC_USD_FEED_ID,
    target: TARGET,
    deadlineAt: deadline,
    ...FREE,
  });
  return {
    ixs: [ix],
    error: h.paused ? "OpenWhilePaused" : undefined,
    deltas: new Map<string, bigint>([
      [member.address, -(h.rent.campaign + h.rent.vault)],
      [campaign, h.rent.campaign],
      [vault, h.rent.vault],
    ]),
    apply: () => {
      const c = newCampaign({
        label: `t${id}`,
        team: true,
        creator: member.address,
        prize: 0n,
        openingFee: 0n,
        deadline,
        opensAt: t,
        entriesCloseAt: entriesCloseFor(t, deadline),
      });
      record(h, c, campaign, vault);
    },
  };
}

/** Adds an opened campaign to the model and its addresses to the harness; the id moves on. */
function record(h: Harness, c: ModelCampaign, campaign: Address, vault: Address) {
  h.camps.push(c);
  h.addrs.push({ campaign, vault });
  h.nextId++;
}

export async function planJoin(h: Harness, op: JoinOp): Promise<Plan> {
  const c = h.camps[op.c];
  const baker = h.bakers[op.baker];
  const { campaign, vault } = h.addrs[op.c];
  const t = clock(h);
  const mine = sumOf(c.joins.filter((j) => j.baker === baker.address));
  const first = !c.joins.some((j) => j.baker === baker.address);
  refreshBase(h.w);
  // The order of the program's refusals (join_campaign.rs): not open, then closed, then the pause.
  const error: BrotErrorName | undefined =
    c.phase !== "Open"
      ? "CampaignNotOpen"
      : t >= c.entriesCloseAt
        ? "EntriesClosed"
        : h.paused
          ? "JoinWhilePaused"
          : undefined;
  const ix = await I.joinCampaignIx(baker, campaign, P.BTC_USD_ACCOUNT, {
    side: op.side,
    amount: op.amount,
    expectedEntryTotal: mine,
  });
  return {
    ixs: [ix],
    error,
    deltas: new Map<string, bigint>([
      [vault, op.amount],
      [baker.address, -(op.amount + (first ? h.rent.entry : 0n))],
    ]),
    apply: () => {
      const join: Join = { baker: baker.address, side: op.side, amount: op.amount, at: t };
      c.joins.push(join);
    },
  };
}

export async function planPause(h: Harness, pause: boolean): Promise<Plan> {
  const ix = pause ? await I.pauseEntriesIx(h.team[0]) : await I.resumeEntriesIx(h.admin);
  const error = pause ? (h.paused ? "AlreadyPaused" : undefined) : h.paused ? undefined : "NotPaused";
  return {
    ixs: [ix],
    error,
    deltas: new Map(),
    apply: () => {
      h.paused = pause;
    },
  };
}
