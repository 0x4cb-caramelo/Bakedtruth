/**
 * Purpose: what the creation box's preview shows, as pure values (Sprint 19; proposal Appendix B): the sentence and
 *          its gaps (template v1), then the preview's facts, all from the draft and the arguments `checkBox` built for
 *          the transaction, never from what was typed into the search: the value now and "if resolved now", the rule in
 *          the campaign page's words, the money, the creator notice and the list card (preview-parts.ts) as it will
 *          look with no entry yet.
 * Version: 0.1.0
 * Sprint:  19 (site: open a campaign)
 */
import { Direction, entriesCloseAt, formatUtc, ReaderKind, shortAddress } from "@brot/sdk/read";

import { sentenceOf, sentenceParts, type SentenceInput } from "../campaigns/sentence";
import type { Card } from "../campaigns/model";
import { ruleText } from "../campaign-page/copy";
import { valueText } from "../campaign-page/format";
import { feedState, ifResolvedNow, type AccountState } from "./account-check";
import type { BoxCheck } from "./check";
import { MONEY, PREVIEW } from "./copy";
import { accountOf, parseTarget, resolveDeadline, type Draft } from "./draft";
import { creatorCanPush, templateOf } from "./kinds";
import type { KnownName } from "./names";
import { cardOf, pct, usd, type SlotRead } from "./preview-parts";
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
  card: Card | null;
  money: string[];
};

type Inputs = {
  draft: Draft;
  check: BoxCheck | null;
  world: BoxWorld | null;
  slot: SlotRead;
  names: readonly KnownName[];
  wallet: string | null;
};

/** The sentence's fields from the draft, with `null` for each slot not filled yet. */
export function sentenceInput(a: Inputs): SentenceInput {
  const { draft, world } = a;
  const t = templateOf(draft.kind);
  const exponent = draft.kind === "price" ? (a.check?.priceExponent ?? null) : 0;
  const raw = parseTarget(t.unit, draft.target, exponent);
  const feed = world?.feeds.find((f) => f.hex === draft.feedHex);
  return {
    kind: ReaderKind[t.readerKind],
    direction: draft.kind === "price" && draft.direction === "below" ? "Below" : "Above",
    feedIdHex: draft.kind === "price" ? draft.feedHex : null,
    target: raw === null ? null : raw.toString(),
    priceExponent: exponent,
    metricAccount: draft.kind === "price" ? (feed?.address ?? null) : accountOf(draft),
  };
}

export const partsOf = (a: Inputs) => sentenceParts(sentenceInput(a));

function valueNow(a: Inputs): { value: bigint | null; text: string | null; price: ReturnType<typeof readingOf> } {
  const price = readingOf(a);
  if (a.draft.kind === "price")
    return { value: price?.price ?? null, text: price ? usd(price.price, price.exponent) : null, price };
  const state: AccountState | null = a.slot.status === "read" ? a.slot.state : null;
  const value = state?.state === "ok" ? state.value : null;
  return { value, text: value === null ? null : valueText(a.draft.kind, value, 0), price: null };
}

function readingOf(a: Inputs) {
  if (a.draft.kind !== "price" || !a.world?.config) return null;
  const feed = a.world.feeds.find((f) => f.hex === a.draft.feedHex);
  const state = feed ? feedState(feed.account, feed.hex, a.world.clock, a.world.config.params.campaignMaxAge) : null;
  return state?.ok ? state.reading : null;
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
  const name =
    draft.kind === "price"
      ? (feed?.symbol ?? PREVIEW.theAsset)
      : input.metricAccount
        ? shortAddress(input.metricAccount)
        : PREVIEW.theAccount;
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
          draft.kind === "price"
            ? PREVIEW.priceAccount(feed?.symbol ?? "")
            : PREVIEW.accountOf(named ?? null, t.owner.replace(/^the /, "")),
      }
    : null;
  const config = world?.config;
  const q = check?.quote ?? null;
  const split = q && config ? usdSplit(q.openingUsd, config.params.openingPrizeBps) : null;
  const team = check?.isTeam ?? false;
  const money = [
    team || !q || !split ? MONEY.free : PREVIEW.opening(exactSol(q.paid), split.total, split.prize, split.fee),
    ...(q && !team ? [PREVIEW.most(exactSol(q.maxLamports))] : []),
    MONEY.onEntries(pct(config?.params.feeBps ?? 1_000), team ? null : pct(config?.params.creatorShareBps ?? 100)),
  ];
  const args = check?.args ?? null;
  const card: Card | null = args
    ? cardOf({
        args,
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
      target: targetText,
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
      name:
        draft.kind === "price"
          ? (feed?.symbol ?? PREVIEW.gaps.asset)
          : (named ?? shortAddress(input.metricAccount ?? "…")),
      target: targetText ?? PREVIEW.gaps.target,
      below,
      deadline: deadlineAt === null ? PREVIEW.gaps.deadline : formatUtc(deadlineAt),
      epoch: draft.epoch || PREVIEW.gaps.epoch,
    }),
    account,
    deadlineAt,
    entriesClose,
    creatorNotice: creatorCanPush(draft.kind),
    card,
    money,
  };
}
