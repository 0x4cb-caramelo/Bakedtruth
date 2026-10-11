/**
 * Purpose: what the creation box says before the program's mirror has the whole draft (the Sprint 19 reviews): the
 *          stops the box can name early (the pause, a full valve, a stale SOL/USD price for a paid opening, each with
 *          the program's own message), the message of a field still missing or not readable (by the kind's unit), a
 *          listed feed the price reader refuses before its exponent is known, and the wallet's (not connected, or
 *          holding less than the most the opening can take).
 * Version: 0.1.0
 * Sprint:  19 (site: open a campaign)
 */
import { OperatingLevel, rowOf, type BrotErrorName, type GlobalConfig } from "@brot/sdk/read";

import { sol4 } from "../entry/amount";
import { feedState } from "./account-check";
import { SLOTS } from "./copy";
import { ISSUES, MONEY, TARGET_FORMAT } from "./copy-money";
import { refusalCopy, type RefusalContext, type RefusalPlace } from "./copy-refusals";
import type { Draft, Slot } from "./draft";
import { templateOf } from "./kinds";
import type { QuoteResult } from "./quote";
import type { BoxWorld } from "./reads";

export type Issue = {
  place: RefusalPlace | "wallet";
  level: "need" | "wait" | "refuse" | "block";
  text: string;
  tag: string;
  refusal?: BrotErrorName;
  row?: number | null;
};

export const issue = (place: Issue["place"], level: Issue["level"], [text, tag]: readonly [string, string]): Issue => ({
  place,
  level,
  text,
  tag,
});

/** The program's refusal as an issue in its own place, with its own words. */
export const refusalIssue = (name: BrotErrorName, ctx: RefusalContext, level: Issue["level"] = "refuse"): Issue => {
  const copy = refusalCopy(name);
  return { place: copy.place, level, text: copy.text(ctx), tag: copy.tag, refusal: name, row: rowOf(name) };
};

const NEEDS: Record<Slot, readonly [string, string]> = {
  kind: ISSUES.reading,
  feed: ISSUES.feed,
  account: ISSUES.account,
  target: ISSUES.target,
  epoch: ISSUES.epoch,
  deadline: ISSUES.deadline,
  usd: ISSUES.usd,
};

/** A field the draft still lacks: empty, typed but unreadable in the kind's unit, or waiting for the feed's exponent. */
export function missingIssue(slot: Slot, draft: Draft, priceExponent: number | null): Issue {
  if (slot !== "target" || draft.target.trim() === "") return issue(slot, "need", NEEDS[slot]);
  if (draft.kind === "price" && draft.feedHex !== null && priceExponent === null)
    return issue("target", "wait", ISSUES.feedWait);
  return issue("target", "need", TARGET_FORMAT[templateOf(draft.kind).unit]);
}

/**
 * Before the draft is whole, the stops that do not depend on it (L7): the pause; for a paid opening the full valve and
 * a SOL/USD price the program would refuse. The mirror names the same ones, in order, once every field is filled in.
 */
export function earlyIssues(a: {
  config: GlobalConfig;
  isTeam: boolean;
  quoted: QuoteResult | null;
  ctx: RefusalContext;
}): Issue[] {
  const out: Issue[] = [];
  if (a.config.operatingLevel === OperatingLevel.EntriesHalted)
    out.push(refusalIssue("OpenWhilePaused", a.ctx, "block"));
  if (!a.isTeam && a.config.openCampaigns >= a.config.params.maxOpenCampaigns)
    out.push(refusalIssue("TooManyOpenCampaigns", a.ctx, "block"));
  if (!a.isTeam && a.quoted && !a.quoted.ok && refusalCopy(a.quoted.refusal).place === "box")
    out.push(refusalIssue(a.quoted.refusal, a.ctx, "block"));
  return out;
}

/** A listed feed whose account the price reader refuses (or that has none), at the asset field, in the program's words. */
export function feedIssue(feed: BoxWorld["feeds"][number], world: BoxWorld, ctx: RefusalContext): Issue {
  const state = feedState(feed.account, feed.hex, world.clock, world.config?.params.campaignMaxAge ?? 0);
  if (state.ok) return issue("target", "wait", ISSUES.feedWait);
  if (state.problem === "missing") return issue("feed", "block", [ISSUES.noAccount[0], SLOTS.noAccount]);
  return { ...refusalIssue(state.problem, ctx), place: "feed" };
}

/** The wallet: connected, and holding at least the most this opening can take from it (`maxTotal`) when known. */
export function walletIssues(wallet: string | null, balance: bigint | null, maxTotal: bigint | null): Issue[] {
  if (wallet === null) return [issue("wallet", "need", ISSUES.connect)];
  if (balance !== null && maxTotal !== null && balance < maxTotal) {
    const text = MONEY.balanceShort(sol4(maxTotal, "up"), sol4(balance));
    return [issue("wallet", "block", [text, ISSUES.balance[1]])];
  }
  return [];
}
