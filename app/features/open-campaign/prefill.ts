/**
 * Purpose: the creation box's prefill (proposal §3.8; TP §3.6 "Links"): `/abrir` accepts a template id and slot values
 *          in the URL — `t` (or `template`), `kind`, `feed` (a symbol such as BTC/USD, or the feed id in hex), `dir`,
 *          `target`, `days` (3 to 90) or `deadline` (Unix seconds), `epoch`, `account` and `usd` — each checked against
 *          its slot's own form, anything else dropped. A prefilled box is labelled as such and never signs anything: a
 *          link only fills the draft, and "Review and sign" waits for the creator's click.
 * Version: 0.1.0
 * Sprint:  19 (site: open a campaign)
 */
import { isAddress } from "@solana/kit";
import { feedsOf } from "@brot/sdk/read";

import type { KindName } from "../campaign-page/proof";
import { EMPTY_DRAFT, type Draft } from "./draft";
import { templateById } from "./kinds";
import { FEED_CLUSTER } from "./reads";

export type Query = Record<string, string | string[] | undefined>;
export type Prefilled = { draft: Draft; fromLink: boolean };

/** The parameters a link may carry; any one of them present makes the box say it came from a link. */
export const PREFILL_KEYS = [
  "t",
  "template",
  "kind",
  "feed",
  "dir",
  "target",
  "days",
  "deadline",
  "epoch",
  "account",
  "usd",
];

const KINDS: readonly KindName[] = ["price", "burn", "lock", "pool", "stake"];
const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)?.trim();

/** A listed feed by its symbol ("BTC/USD", "btc") or its hex id, or `null`. */
export function feedFromLink(text: string | undefined): string | null {
  if (!text) return null;
  const wanted = text.toLowerCase().replace(/^0x/, "");
  const found = feedsOf(FEED_CLUSTER).find(([hex, symbol]) => {
    const name = symbol.replace(/^Crypto\./, "").toLowerCase();
    return hex === wanted || name === wanted || name.split("/")[0] === wanted;
  });
  return found ? found[0] : null;
}

export function prefillOf(query: Query): Prefilled {
  const fromLink = PREFILL_KEYS.some((key) => one(query[key]) !== undefined && one(query[key]) !== "");
  const template = templateById(one(query.t) ?? one(query.template));
  const kindParam = one(query.kind) as KindName | undefined;
  const kind = template?.kind ?? (kindParam && KINDS.includes(kindParam) ? kindParam : EMPTY_DRAFT.kind);
  const draft: Draft = { ...EMPTY_DRAFT, kind };
  if (kind === "price") draft.feedHex = feedFromLink(one(query.feed));
  const dir = one(query.dir);
  if (dir === "above" || dir === "below") draft.direction = dir;
  const target = one(query.target);
  if (target && /^[\d.,_]{1,48}$/.test(target)) draft.target = target;
  const days = one(query.days);
  const deadline = one(query.deadline);
  if (days && /^\d{1,2}$/.test(days) && Number(days) >= 3 && Number(days) <= 90)
    draft.deadline = { days: Number(days) };
  else if (deadline && /^\d{9,12}$/.test(deadline)) draft.deadline = { at: BigInt(deadline) };
  const epoch = one(query.epoch);
  if (epoch && /^\d{1,19}$/.test(epoch)) draft.epoch = epoch;
  const account = one(query.account);
  if (kind !== "price" && account && isAddress(account)) draft.account = account;
  const usd = one(query.usd);
  if (usd && /^\d{1,9}$/.test(usd)) draft.usd = usd;
  return { draft, fromLink };
}
