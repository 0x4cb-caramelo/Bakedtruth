/**
 * Purpose: the creation box's verdict on every change (Sprint 19 DoD; A-10, X0.7): the draft turned into the exact
 *          arguments the transaction will carry (`OpenArgs`, with the drawn id, the quote's `max_lamports` and the
 *          config's terms version), then the SDK's `validateOpenCampaign`, the mirror of `user_open_campaign` in the
 *          program's order, whose first refusal is shown in its slot with its own message (copy-refusals.ts); then what
 *          the box stops on its own: a missing slot, the 10 minutes a transaction needs to land, the site's switch,
 *          the wallet and its balance. Pure: the program decides, the box only mirrors it.
 * Version: 0.1.0
 * Sprint:  19 (site: open a campaign)
 */
import {
  isTeamKey,
  readPriceUpdate,
  rowOf,
  SYSTEM_PROGRAM_ID,
  U64_MAX,
  validateOpenCampaign,
  type AccountShape,
  type BrotErrorName,
  type FetchedAccount,
  type OpenArgs,
  type OpenCampaignCheck,
  type OpeningQuote,
} from "@brot/sdk/read";
import type { OpeningChoice } from "@brot/sdk/tx";

import { ISSUES, MONEY } from "./copy";
import { refusalCopy, type RefusalPlace } from "./copy-refusals";
import { choiceOf, DAY_SECONDS, type Draft, type Slot } from "./draft";
import { STAKE_AT_LEAST_OPENS, templateOf } from "./kinds";
import { debitOf, quoteNow } from "./quote";
import { FEED_CLUSTER, type BoxWorld } from "./reads";
import { sol4 } from "../entry/amount";
import { KIND_NAME } from "../campaign-page/copy";

/** The program's three-day floor, plus the ten minutes a transaction may take to land (spec 3.12). */
export const LAND_MARGIN_SECONDS = 600n;

export type Issue = {
  place: RefusalPlace | "wallet";
  level: "need" | "wait" | "refuse" | "block";
  text: string;
  tag: string;
  refusal?: BrotErrorName;
  row?: number | null;
};

export type BoxCheck = {
  issues: Issue[];
  isTeam: boolean;
  priceExponent: number | null;
  choice: OpeningChoice | null;
  args: OpenArgs | null;
  verdict: OpenCampaignCheck | null;
  quote: OpeningQuote | null;
  /** What leaves the wallet now (the payment, the rents, the network fee) and at most. */
  total: bigint | null;
  maxTotal: bigint | null;
};

export type BoxInputs = {
  draft: Draft;
  world: BoxWorld | null;
  /** The draft's own accounts: its metric account, and the campaign's address and vault for `id`. */
  accounts: { metric: FetchedAccount | null; campaign: AccountShape; vault: AccountShape } | null;
  readFailed: boolean;
  id: bigint;
  wallet: string | null;
  balance: bigint | null;
  /** The site's own switch (the read API's health, K-11); `null` while unknown. */
  siteAllows: boolean | null;
};

const issue = (place: Issue["place"], level: Issue["level"], [text, tag]: readonly [string, string]): Issue => ({
  place,
  level,
  text,
  tag,
});

const NEEDS: Record<Slot, readonly [string, string]> = {
  kind: ISSUES.reading,
  feed: ISSUES.feed,
  account: ISSUES.account,
  target: ISSUES.target,
  epoch: ISSUES.epoch,
  deadline: ISSUES.deadline,
  usd: ISSUES.usd,
};

const exponentOf = (world: BoxWorld, feedHex: string | null): number | null => {
  const feed = world.feeds.find((f) => f.hex === feedHex);
  if (!feed?.account) return null;
  try {
    return readPriceUpdate(feed.account.owner, feed.account.data, feed.hex).exponent;
  } catch {
    return null;
  }
};

export async function checkBox(a: BoxInputs): Promise<BoxCheck> {
  const none: BoxCheck = {
    issues: [],
    isTeam: false,
    priceExponent: null,
    choice: null,
    args: null,
    verdict: null,
    quote: null,
    total: null,
    maxTotal: null,
  };
  const { world, draft } = a;
  if (!world)
    return {
      ...none,
      issues: [issue("box", a.readFailed ? "block" : "wait", a.readFailed ? ISSUES.readFailed : ISSUES.reading)],
    };
  const config = world.config;
  if (!config) return { ...none, issues: [issue("box", "block", ISSUES.noConfig)] };
  const isTeam = a.wallet !== null && isTeamKey(config, a.wallet);
  const priceExponent = draft.kind === "price" ? exponentOf(world, draft.feedHex) : 0;
  const issues: Issue[] = [];
  if (a.siteAllows === false) issues.push(issue("box", "block", ISSUES.site));
  const made = choiceOf(draft, { priceExponent, chainNow: world.clock.unixTimestamp, isTeam });
  const quoted =
    !isTeam && made.ok && made.choice.openingUsd > 0n
      ? quoteNow({ config, openingUsd: made.choice.openingUsd, solUsd: world.solUsd, clock: world.clock })
      : null;
  const quote = quoted?.ok ? quoted.quote : null;
  const debit = debitOf({ quote, rents: world.rents });
  const base = { ...none, isTeam, priceExponent, quote, total: debit.total, maxTotal: debit.maxTotal };
  if (!made.ok) {
    for (const slot of made.missing) {
      const typed =
        slot === "target" && draft.target.trim() !== "" && (draft.kind !== "price" || priceExponent !== null);
      issues.push(issue(slot, "need", typed ? ISSUES.targetFormat : NEEDS[slot]));
    }
    return { ...base, issues: [...issues, ...walletIssues(a, debit.total)] };
  }
  if (draft.kind !== "price" && a.accounts === null) issues.push(issue("account", "wait", ISSUES.accountWait));
  const args: OpenArgs = {
    id: a.id,
    kind: made.choice.kind,
    direction: made.choice.direction ?? 0,
    feedId: made.choice.feedId as Uint8Array,
    target: made.choice.target,
    deadlineAt: made.choice.deadlineAt,
    openingUsd: made.choice.openingUsd,
    maxLamports: quote?.maxLamports ?? (quoted && !quoted.ok ? U64_MAX : 0n),
    epoch: made.choice.epoch ?? 0n,
    expectedParamsVersion: config.paramsVersion,
  };
  const metricAddress = made.choice.metricAccount ?? world.feeds.find((f) => f.hex === draft.feedHex)?.address ?? "";
  const metric =
    draft.kind === "price"
      ? (world.feeds.find((f) => f.hex === draft.feedHex)?.account ?? null)
      : (a.accounts?.metric ?? null);
  const verdict = await validateOpenCampaign({
    signer: a.wallet ?? SYSTEM_PROGRAM_ID,
    args,
    config,
    clock: world.clock,
    metricAddress,
    metric,
    solUsd: world.solUsd,
    campaignAccount: a.accounts?.campaign ?? null,
    vaultAccount: a.accounts?.vault ?? null,
    build: { feeds: FEED_CLUSTER, stakeAtLeastOpens: STAKE_AT_LEAST_OPENS },
    epochSchedule: world.epochSchedule,
    voteStake: null,
  });
  if (!verdict.ok) {
    const name = verdict.refusal.errorName;
    const copy = refusalCopy(name);
    const t = templateOf(draft.kind);
    const text = copy.text({ owner: t.owner, kind: KIND_NAME[draft.kind] });
    issues.push({ place: copy.place, level: "refuse", text, tag: copy.tag, refusal: name, row: rowOf(name) });
  } else if (made.choice.deadlineAt - world.clock.unixTimestamp < 3n * DAY_SECONDS + LAND_MARGIN_SECONDS) {
    issues.push(issue("deadline", "refuse", ISSUES.margin));
  }
  return { ...base, choice: made.choice, args, verdict, issues: [...issues, ...walletIssues(a, debit.total)] };
}

function walletIssues(a: BoxInputs, total: bigint): Issue[] {
  if (a.wallet === null) return [issue("wallet", "need", ISSUES.connect)];
  if (a.balance !== null && a.balance < total) {
    return [issue("wallet", "block", [MONEY.balanceShort(sol4(total, "up"), sol4(a.balance)), ISSUES.balance[1]])];
  }
  return [];
}

/** The issues of one place, for the slot that shows them. */
export const issuesAt = (check: BoxCheck, place: Issue["place"]) => check.issues.filter((i) => i.place === place);

/** The box can go to "Review and sign": the program's mirror accepts and nothing else stops it. */
export const readyToReview = (check: BoxCheck) => check.verdict?.ok === true && check.issues.length === 0;
