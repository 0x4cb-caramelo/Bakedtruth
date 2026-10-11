/**
 * Purpose: the creation box's verdict on every change (Sprint 19 DoD; A-10, X0.7): the draft turned into the exact
 *          arguments the transaction will carry (`OpenArgs`, with the drawn id, the quote's `max_lamports` and the
 *          config's terms version), then the SDK's `validateOpenCampaign`, the mirror of `user_open_campaign` in the
 *          program's order, whose first refusal is shown in its place with its own message (copy-refusals.ts); then what
 *          the box stops on its own: a missing field, the 10 minutes a transaction needs to land, the site's switch, the
 *          wallet and its balance. A paid opening is priced from its amount alone, from the first screen. Each verdict
 *          names the draft it is for, so a click acts only on the verdict of what is on screen. Pure: the program
 *          decides, the box only mirrors it.
 * Version: 0.2.0 (the Sprint 19 reviews: priced from the amount, early stops, the draft each verdict is for, a refused
 *          feed named)
 * Sprint:  19 (site: open a campaign)
 */
import {
  isTeamKey,
  readPriceUpdate,
  SYSTEM_PROGRAM_ID,
  U64_MAX,
  validateOpenCampaign,
  type AccountShape,
  type FetchedAccount,
  type OpenArgs,
  type OpenCampaignCheck,
  type OpeningQuote,
} from "@brot/sdk/read";
import type { OpeningChoice } from "@brot/sdk/tx";

import { KIND_NAME } from "../campaign-page/copy";
import { earlyIssues, feedIssue, issue, missingIssue, refusalIssue, walletIssues, type Issue } from "./check-issues";
import { KIND_WORDS } from "./copy";
import { ISSUES } from "./copy-money";
import { choiceOf, DAY_SECONDS, LAND_MARGIN_SECONDS, type Draft } from "./draft";
import { STAKE_AT_LEAST_OPENS } from "./kinds";
import { debitOf, quoteNow } from "./quote";
import { FEED_CLUSTER, type BoxWorld } from "./reads";

export type { Issue } from "./check-issues";

export type BoxCheck = {
  /** The draft this verdict is for: a verdict computed for an earlier draft never reaches "Review and sign". */
  draft: Draft | null;
  issues: Issue[];
  isTeam: boolean;
  priceExponent: number | null;
  choice: OpeningChoice | null;
  args: OpenArgs | null;
  verdict: OpenCampaignCheck | null;
  quote: OpeningQuote | null;
  /** What leaves the wallet now (the payment, the rents, the network fee) and at most; `null` while not priced. */
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
  const { world, draft } = a;
  const none: BoxCheck = {
    draft,
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
  if (!world)
    return {
      ...none,
      issues: [issue("box", a.readFailed ? "block" : "wait", a.readFailed ? ISSUES.readFailed : ISSUES.reading)],
    };
  const config = world.config;
  if (!config) return { ...none, issues: [issue("box", "block", ISSUES.noConfig)] };
  const isTeam = a.wallet !== null && isTeamKey(config, a.wallet);
  const words = KIND_WORDS[draft.kind];
  const ctx = { owner: words.owner, kind: KIND_NAME[draft.kind], phrase: words.phrase };
  const priceExponent = draft.kind === "price" ? exponentOf(world, draft.feedHex) : 0;
  const issues: Issue[] = [];
  if (a.siteAllows === false) issues.push(issue("box", "block", ISSUES.site));
  // A paid opening is priced from its amount alone (the copy and adversarial reviews, M1): never "free" by default.
  const usd = isTeam ? 0n : /^\d{1,9}$/.test(draft.usd.trim()) ? BigInt(draft.usd.trim()) : null;
  const quoted =
    usd !== null && usd > 0n ? quoteNow({ config, openingUsd: usd, solUsd: world.solUsd, clock: world.clock }) : null;
  const quote = quoted?.ok ? quoted.quote : null;
  const debit = debitOf({ quote, rents: world.rents });
  const priced = isTeam || quote !== null;
  const base = {
    ...none,
    isTeam,
    priceExponent,
    quote,
    total: priced ? debit.total : null,
    maxTotal: priced ? debit.maxTotal : null,
  };
  const wallet = () => walletIssues(a.wallet, a.balance, base.maxTotal);
  const feed = world.feeds.find((f) => f.hex === draft.feedHex);
  // A feed the reader refuses before its exponent can be read (row 4) says why, never "reading the price" (M7).
  const feedRefused = draft.kind === "price" && feed !== undefined && priceExponent === null;
  if (feedRefused) issues.push(feedIssue(feed, world, ctx));
  const made = choiceOf(draft, { priceExponent, chainNow: world.clock.unixTimestamp, isTeam });
  if (!made.ok) {
    issues.push(...earlyIssues({ config, isTeam, quoted, ctx }));
    for (const slot of made.missing)
      if (!(feedRefused && slot === "target")) issues.push(missingIssue(slot, draft, priceExponent));
    return { ...base, issues: [...issues, ...wallet()] };
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
  const verdict = await validateOpenCampaign({
    signer: a.wallet ?? SYSTEM_PROGRAM_ID,
    args,
    config,
    clock: world.clock,
    metricAddress: made.choice.metricAccount ?? feed?.address ?? "",
    metric: draft.kind === "price" ? (feed?.account ?? null) : (a.accounts?.metric ?? null),
    solUsd: world.solUsd,
    campaignAccount: a.accounts?.campaign ?? null,
    vaultAccount: a.accounts?.vault ?? null,
    build: { feeds: FEED_CLUSTER, stakeAtLeastOpens: STAKE_AT_LEAST_OPENS },
    epochSchedule: world.epochSchedule,
    voteStake: null,
  });
  if (!verdict.ok) {
    const refused = refusalIssue(verdict.refusal.errorName, ctx);
    // The program reads an address with no account as the System Program's, empty: say there is none, not whose it is.
    const noAccount = refused.place === "account" && draft.kind !== "price" && a.accounts?.metric === null;
    // The price kind's account is its feed's: a refusal of it shows by the asset, where the box has a field.
    const place = draft.kind === "price" && refused.place === "account" ? "feed" : refused.place;
    issues.push(
      noAccount ? { ...refused, text: ISSUES.noAccount[0], tag: ISSUES.noAccount[1] } : { ...refused, place },
    );
  } else if (made.choice.deadlineAt - world.clock.unixTimestamp < 3n * DAY_SECONDS + LAND_MARGIN_SECONDS) {
    issues.push(issue("deadline", "refuse", ISSUES.margin));
  }
  return { ...base, choice: made.choice, args, verdict, issues: [...issues, ...wallet()] };
}

/** The issues of one place, for the slot that shows them. */
export const issuesAt = (check: BoxCheck, place: Issue["place"]) => check.issues.filter((i) => i.place === place);

/** The box can go to "Review and sign": the program's mirror accepts this very draft and nothing else stops it. */
export const readyToReview = (check: BoxCheck, draft: Draft) =>
  check.draft === draft && check.verdict?.ok === true && check.issues.length === 0;
