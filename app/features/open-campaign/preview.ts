/**
 * Purpose: what the creation box's preview shows, as pure values (Sprint 19; proposal Appendix B): the sentence and
 *          its gaps (template v1), then the preview's facts, all from the draft and the arguments `checkBox` built for
 *          the transaction, never from what was typed into the search: the value now and "if resolved now", the rule in
 *          the campaign page's words, the money, the creator notice and the list card (preview-parts.ts) as it will
 *          look with no entry yet. A curve is named by its token's ticker, as every page names it.
 * Version: 0.2.2 (the curve's name; 0.2.1, a curve's target is its threshold; 0.2.0, the Sprint 19 reviews)
 * Sprint:  19 (site: open a campaign); the sixth kind's site
 */
import { Direction, entriesCloseAt, formatUtc, ReaderKind } from "@brot/sdk/read";

import { sentenceOf, sentenceParts, type SentenceInput } from "../campaigns/sentence";
import type { Card } from "../campaigns/model";
import { ruleText } from "../campaign-page/copy";
import { valueText } from "../campaign-page/format";
import { curveTarget, ifResolvedNow, type AccountState } from "./account-check";
import type { BoxCheck } from "./check";
import { PREVIEW } from "./copy";
import { MONEY } from "./copy-money";
import { accountOf, parseTarget, resolveDeadline, type Draft } from "./draft";
import { creatorCanPush, templateOf } from "./kinds";
import type { KnownName } from "./names";
import { accountShown, cardOf, pct, priceReading, usd, withUnit } from "./preview-parts";
import type { PriceReading, SlotRead } from "./preview-parts";
import { exactSol, usdSplit } from "./quote";
import type { BoxWorld } from "./reads";

export type { FeedOption, SlotRead } from "./preview-parts";

export type PreviewFacts = {
  sentence: string;
  complete: boolean;
  /** The value read now and the target, as the page writes them; and what a read now would record. */
  now: { name: string; value: string | null; target: string | null; below: boolean; ifNow: "YES" | "NO" | null };
  rule: string;
  account: { address: string; label: string } | null;
  deadlineAt: bigint | null;
  entriesClose: bigint | null;
  creatorNotice: boolean;
  /** Who else can move the number, said to a paying creator next to the creator notice (the adversarial review, M6). */
  othersCanPush: string | null;
  card: Card | null;
  money: string[];
  /** A team key's free opening: no prize, no creator share, nothing but the rent comes back. */
  team: boolean;
  /** Read at the start of a named epoch: a read now decides nothing. */
  epochKind: boolean;
};

type Inputs = {
  draft: Draft;
  check: BoxCheck | null;
  world: BoxWorld | null;
  slot: SlotRead;
  names: readonly KnownName[];
  wallet: string | null;
  /** A curve's name once the box has read its token (curve-names.tsx); "Token (…7Dny)" until then. */
  curveName?: string | null;
};

/** The sentence's fields from the draft, with `null` for each field not filled in yet. */
export function sentenceInput(a: Inputs): SentenceInput {
  const { draft, world } = a;
  const t = templateOf(draft.kind);
  const exponent = draft.kind === "price" ? (a.check?.priceExponent ?? null) : 0;
  const raw = draft.kind === "curve" ? curveTarget(a.slot) : parseTarget(t.unit, draft.target, exponent);
  const feed = world?.feeds.find((f) => f.hex === draft.feedHex);
  return {
    kind: ReaderKind[t.readerKind],
    direction: draft.kind === "price" && draft.direction === "below" ? "Below" : "Above",
    feedIdHex: draft.kind === "price" ? draft.feedHex : null,
    target: raw === null ? null : raw.toString(),
    priceExponent: exponent,
    metricAccount: draft.kind === "price" ? (feed?.address ?? null) : accountOf(draft),
    epoch: t.epoch ? draft.epoch.trim() || null : undefined,
    accountName: draft.kind === "curve" ? (a.curveName ?? null) : undefined,
  };
}

export const partsOf = (a: Inputs) => sentenceParts(sentenceInput(a));

function valueNow(a: Inputs): { value: bigint | null; text: string | null; price: PriceReading | null } {
  const price = a.draft.kind === "price" ? priceReading(a.world, a.draft.feedHex) : null;
  if (a.draft.kind === "price")
    return { value: price?.price ?? null, text: price ? usd(price.price, price.exponent) : null, price };
  const state: AccountState | null = a.slot.status === "read" ? a.slot.state : null;
  const value = state?.state === "ok" ? state.value : null;
  return {
    value,
    text: value === null ? null : withUnit(a.draft.kind, valueText(a.draft.kind, value, 0)),
    price: null,
  };
}

export function previewFacts(a: Inputs): PreviewFacts {
  const { draft, check, world } = a;
  const input = sentenceInput(a);
  const t = templateOf(draft.kind);
  const below = draft.kind === "burn" || input.direction === "Below";
  const now = valueNow(a);
  const raw = input.target === null ? null : BigInt(input.target);
  const targetText =
    raw === null
      ? null
      : draft.kind === "price"
        ? input.priceExponent === null
          ? null
          : usd(raw, input.priceExponent)
        : valueText(draft.kind, raw, 0);
  const feed = world?.feeds.find((f) => f.hex === draft.feedHex);
  const shown = accountShown(draft.kind, input);
  const name = draft.kind === "price" ? (feed?.symbol ?? PREVIEW.theAsset) : (shown ?? PREVIEW.theAccount);
  const shownTarget = targetText === null ? null : withUnit(draft.kind, targetText);
  const deadlineAt = resolveDeadline(draft.deadline, world?.clock.unixTimestamp ?? null);
  let entriesClose: bigint | null = check?.verdict?.ok ? check.verdict.entriesCloseAt : null;
  if (entriesClose === null && deadlineAt !== null && world) {
    try {
      entriesClose = entriesCloseAt(world.clock.unixTimestamp, deadlineAt);
    } catch {
      entriesClose = null;
    }
  }
  const named = a.names.find((n) => n.address === input.metricAccount)?.name;
  const account = input.metricAccount
    ? {
        address: input.metricAccount,
        label:
          draft.kind === "price" ? PREVIEW.priceAccount(feed?.symbol ?? "") : PREVIEW.accountOf(named ?? null, t.owner),
      }
    : null;
  const config = world?.config;
  const q = check?.quote ?? null;
  const split = q && config ? usdSplit(q.openingUsd, config.params.openingPrizeBps) : null;
  const team = check?.isTeam ?? false;
  // Free only for a team key; a paid opening shows its quote, or "not priced yet" (the reviews, M1).
  const opening = team
    ? MONEY.free
    : q && split
      ? PREVIEW.opening(exactSol(q.paid), split.total, split.prize, split.fee)
      : MONEY.notPriced;
  const money = [
    opening,
    ...(q && !team ? [PREVIEW.most(exactSol(q.maxLamports))] : []),
    MONEY.onEntries(pct(config?.params.feeBps ?? 1_000), team ? null : pct(config?.params.creatorShareBps ?? 100)),
  ];
  const args = check?.args ?? null;
  const card: Card | null = args
    ? cardOf({
        args,
        input,
        kind: input.kind,
        title: sentenceOf(input),
        asset: feed?.symbol ?? null,
        creator: a.wallet,
        team,
        prize: q?.prize ?? 0n,
        opensAt: world?.clock.unixTimestamp ?? null,
        entriesClose,
      })
    : null;
  return {
    sentence: sentenceOf(input),
    complete: check?.verdict?.ok === true,
    now: {
      name,
      value: now.text,
      target: shownTarget,
      below,
      ifNow: ifResolvedNow({
        kind: draft.kind,
        target: raw,
        direction: input.direction === "Below" ? Direction.Below : Direction.Above,
        price: now.price,
        value: now.value,
      }),
    },
    rule: ruleText({
      kind: draft.kind,
      // A curve's own name already holds a reviewed one; the other kinds put a reviewed name before the address.
      name:
        draft.kind === "price"
          ? (feed?.symbol ?? PREVIEW.gaps.asset)
          : ((draft.kind === "curve" ? shown : (named ?? shown)) ?? PREVIEW.gaps.account),
      target: targetText ?? PREVIEW.gaps.target,
      below,
      deadline: deadlineAt === null ? PREVIEW.gaps.deadline : formatUtc(deadlineAt),
      epoch: draft.epoch || PREVIEW.gaps.epoch,
    }),
    account,
    deadlineAt,
    entriesClose,
    creatorNotice: creatorCanPush(draft.kind),
    othersCanPush: draft.kind === "price" || team ? null : PREVIEW.othersCanPush[draft.kind],
    card,
    money,
    team,
    epochKind: t.epoch,
  };
}
