/**
 * Purpose: the rows of "my entries" (Sprint 12 DoD), as pure values: one per campaign the wallet entered or opened,
 *          with its sides and amounts, its public state (the SDK's, against chain time), what the entry returns (an
 *          estimate while it can move, the exact amount once final), what it received (from the wallet's settlement
 *          events only), and, for the campaign's creator, the 1% and any prize or opening fee returned. The same
 *          rules as the campaign page (campaign-page/states.ts), so both screens say the same thing.
 * Version: 0.1.0
 * Sprint:  12 (site: my entries and campaign states)
 */
import { bytesToHex, Direction, ReaderKind, type DecodedEvent } from "@brot/sdk/read";

import { sentenceOf } from "../campaigns/sentence";
import { stateChip, type ChipState } from "../campaign-page/format";
import { openerViewOf, pageStateOf, yourPayoutOf, type OpenerView, type YourPayout } from "../campaign-page/states";
import type { CampaignRead, MyEntriesData } from "./load";
import { NOTHING, putBy, receivedBy, type Put, type Received } from "./received";

export type Row = {
  campaign: string;
  /** The u64 id for the campaign page's link; `null` when the account is closed and no opening event was read. */
  id: string | null;
  title: string;
  /** The chip, or `closedAccount` once the program closed the campaign after every payout. */
  state: ChipState | "closedAccount";
  sides: Put;
  payout: YourPayout;
  received: Received;
  /** The creator's 1% and the opener's returns; `null` unless this wallet opened the campaign and it is final. */
  opener: OpenerView | null;
  isCreator: boolean;
  /** Something is still owed to this wallet here (a payout waiting, a reserve to receive). */
  pending: boolean;
};

export type Summary = { rows: Row[]; received: bigint; waiting: bigint };

type Opened = Extract<DecodedEvent, { name: "CampaignOpened" }>;

function titleOf(read: CampaignRead, opened: Opened | undefined): string {
  const src = read.campaign ?? opened?.data;
  if (!src) return `Campaign ${read.address.slice(0, 4)}…${read.address.slice(-4)}`;
  return sentenceOf({
    kind: ReaderKind[src.kind],
    direction: Direction[src.direction],
    feedIdHex: bytesToHex(src.feedId),
    target: src.target.toString(),
    priceExponent: src.priceExponent,
    metricAccount: src.metricAccount,
  });
}

function rowOf(read: CampaignRead, wallet: string, events: DecodedEvent[], chainTime: MyEntriesData["chain"]): Row {
  const received = receivedBy(wallet, events).byCampaign.get(read.address) ?? NOTHING;
  const put = putBy(wallet, events).get(read.address);
  const opened = events.find((e): e is Opened => e.name === "CampaignOpened" && e.data.campaign === read.address);
  const entry = read.entry && read.entry.amountYes + read.entry.amountNo > 0n ? read.entry : null;
  const sides = entry ? { yes: entry.amountYes, no: entry.amountNo } : (put ?? { yes: 0n, no: 0n });
  const c = read.campaign;
  const isCreator = (c?.creator ?? opened?.data.creator) === wallet;
  const base = { campaign: read.address, title: titleOf(read, opened), sides, received, isCreator };
  if (!c || !read.view) {
    const payout: YourPayout = received.entrySettled
      ? { kind: "received", amount: received.asBaker }
      : put
        ? { kind: "settledUnread" }
        : { kind: "none" };
    return {
      ...base,
      id: opened ? opened.data.id.toString() : null,
      state: "closedAccount",
      payout,
      opener: null,
      pending: false,
    };
  }
  const state = pageStateOf(c, read.view, chainTime);
  const payout = yourPayoutOf({
    campaign: c,
    state,
    mine: entry,
    settled: received.entrySettled ? received.asBaker : null,
    entered: put !== undefined,
  });
  const opener = isCreator ? openerViewOf(c) : null;
  const ownerOwed =
    opener !== null &&
    (opener.share.status === "due" ||
      opener.share.status === "reserved" ||
      (!opener.prizeSent && opener.prizeBack > 0n));
  return {
    ...base,
    id: c.id.toString(),
    state: stateChip(read.view),
    payout,
    opener,
    pending: payout.kind === "owed" || ownerOwed,
  };
}

/** The wallet's rows, newest activity first, with the totals received and waiting. */
export function myEntries(wallet: string, data: MyEntriesData, events: DecodedEvent[]): Summary {
  const involved = new Set(events.map((e) => (e.data as { campaign?: string }).campaign).filter(Boolean) as string[]);
  const rows = data.campaigns
    .filter((r) => r.entry || involved.has(r.address) || r.campaign?.creator === wallet)
    .map((r) => rowOf(r, wallet, events, data.chain));
  const order = (r: Row) =>
    r.pending
      ? 0
      : r.state === "open" || r.state === "closed" || r.state === "in_review" || r.state === "contested"
        ? 1
        : 2;
  rows.sort((a, b) => order(a) - order(b));
  const waiting = rows.reduce((sum, r) => sum + (r.payout.kind === "owed" ? r.payout.amount : 0n), 0n);
  return { rows, received: receivedBy(wallet, events).total, waiting };
}
