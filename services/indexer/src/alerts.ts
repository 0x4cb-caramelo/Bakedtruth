/**
 * Purpose: the alerts the indexer feeds (TP §3.5 "Observability and alerting", the "Open creation" row; Sprint 08 DoD):
 *          an entry by the creator's own wallet on a campaign whose result its creator can control (a burn, a lock, a
 *          stake or a curve's graduation: the SDK's `creatorCanControl`, every kind but a price), while that result is
 *          not final (open, in review or contested). Written to the journal as Sprint 07's keeper writes its alerts
 *          (services/keeper/src/alert.ts, the same line): `{ ts, event: "alert", kind, key, transports, ...detail }`,
 *          de-duplicated per (kind, key) for 15 minutes, a detail key that looks like a secret, or that would overwrite
 *          one of the line's own fields (the reader kind goes as `reader`), refused. The runbook
 *          is services/indexer/README.md, "Alerts". The CoinGecko-Pyth gap the DoD named is gone with 2b.
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points)
 *
 * Only entries the indexer writes after it starts are judged: those already in the file are marked seen at start, so a
 * restart repeats no alert; a first start over the whole history alerts only for campaigns whose result is not final.
 */
import { creatorCanControl, ReaderKind } from "@brot/sdk/read";

import type { Store } from "./db/store";

export type AlertKind = "creator_own_entry";
export type AlertDetail = Record<string, string | number | boolean | null>;
export type Alerter = { alert(kind: AlertKind, key: string, detail: AlertDetail): boolean };

/** The channels an alert reaches: the journal, until the email provider is decided (D4), as the keeper's. */
export const TRANSPORTS: readonly string[] = ["journal"];
const DEDUPE_MS = 15 * 60_000;
const SECRET_LIKE = /secret|token|password|keypair|private|api.?key|url|query/i;
/** The line's own fields: a detail never overwrites them. */
const OWN = new Set(["ts", "event", "kind", "key", "transports"]);

export function createAlerter(
  o: { now?: () => number; emit?: (line: string) => void; dedupeMs?: number } = {},
): Alerter {
  const [now, emit, dedupeMs] = [
    o.now ?? Date.now,
    o.emit ?? ((line: string) => console.log(line)),
    o.dedupeMs ?? DEDUPE_MS,
  ];
  const last = new Map<string, number>();
  return {
    alert(kind, key, detail) {
      for (const name of Object.keys(detail)) {
        if (SECRET_LIKE.test(name)) throw new Error(`alert detail "${name}" looks like a secret and is refused`);
        if (OWN.has(name)) throw new Error(`alert detail "${name}" would overwrite the line's own field`);
      }
      const at = now();
      const previous = last.get(`${kind}|${key}`);
      if (previous !== undefined && at - previous < dedupeMs) return false;
      last.set(`${kind}|${key}`, at);
      emit(
        JSON.stringify({
          ts: new Date(at).toISOString(),
          event: "alert",
          kind,
          key,
          transports: TRANSPORTS.join(","),
          ...detail,
        }),
      );
      return true;
    },
  };
}

type CreatorEntry = {
  signature: string;
  ix_index: number;
  inner_index: number;
  campaign: string;
  opening: number;
  side: string;
  amount: string;
  id: string;
  kind: string;
  status: string;
  closed: number;
};

const NOT_FINAL = new Set(["Open", "InReview", "Contested"]);
const keyOf = (e: CreatorEntry) => `${e.signature}:${e.ix_index}:${e.inner_index}`;

/** Watches the creator-flagged entries; `check` alerts on each new one that matters and returns how many it raised. */
export function creatorEntryWatch(store: Store, alerter: Alerter) {
  const query = store.db.query(
    `SELECT e.signature, e.ix_index, e.inner_index, e.campaign, e.opening, e.side, e.amount, c.id, c.kind, c.status,
       c.closed FROM entries e JOIN campaigns c ON c.address = e.campaign AND c.opening = e.opening
     WHERE e.is_creator = 1`,
  );
  const seen = new Set((query.all() as CreatorEntry[]).map(keyOf));
  return {
    check(): number {
      let raised = 0;
      for (const e of query.all() as CreatorEntry[]) {
        if (seen.has(keyOf(e))) continue;
        seen.add(keyOf(e));
        const kind = ReaderKind[e.kind as keyof typeof ReaderKind];
        if (kind === undefined || !creatorCanControl(kind) || e.closed === 1 || !NOT_FINAL.has(e.status)) continue;
        const detail = { campaign: e.campaign, opening: e.opening, id: e.id, reader: e.kind, side: e.side };
        if (alerter.alert("creator_own_entry", keyOf(e), { ...detail, lamports: e.amount, signature: e.signature }))
          raised += 1;
      }
      return raised;
    },
  };
}
