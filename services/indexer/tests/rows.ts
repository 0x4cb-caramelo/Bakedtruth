/**
 * Purpose: hand-built rows for the indexer's no-cluster tests (Sprint 08, slice 3): a campaign opening with defaults a
 *          test overrides by name (a price campaign opened by a paid creator at `T0`), its entries, its settlements and
 *          its events, written straight into a file, so the ranking, the KPIs and the partner report are tested on
 *          exact inputs. Addresses are real base58 (31 bytes of zero, then one), signatures 64 bytes.
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points)
 */
import { getBase58Decoder } from "@solana/kit";

import type { CampaignRow } from "../src/campaign-row";
import type { Store } from "../src/db/store";

/** A valid address for a small number (2 to 9, then letters). */
export const AT = (n: number | string) => `${"1".repeat(31)}${n}`;
/** A valid signature for a short name. */
export const SIGN = (name: string) =>
  getBase58Decoder().decode(new Uint8Array(64).map((_, i) => name.charCodeAt(i % name.length)));
export const T0 = 1_800_000_000;
export const DAY = 86_400;
export const LAMPORTS = 1_000_000_000n;

const insert = (store: Store, table: string, row: Record<string, string | number | null>) => {
  const columns = Object.keys(row);
  store.db
    .query(`INSERT INTO ${table} (${columns.join(", ")}) VALUES (${columns.map((c) => `$${c}`).join(", ")})`)
    .run(row as never);
};

/** One opening; `pool_yes`/`pool_no` follow the entries added with `addEntry` unless set. */
export function addCampaign(store: Store, over: Partial<CampaignRow> & { address: string }): CampaignRow {
  const row: CampaignRow = {
    opening: 1,
    id: "1",
    kind: "PriceTouch",
    direction: "Above",
    feed_id: "ef".repeat(32),
    metric_account: AT(9),
    target: "100",
    epoch: "0",
    creator: AT("C"),
    creator_is_team: 0,
    creator_share_bps: 100,
    template_version: 1,
    fee_bps: 1_000,
    one_sided_fee_bps: 100,
    opening_usd: "500",
    opening_paid_lamports: "5000000000",
    opening_price: "10000000000",
    opening_price_exponent: -8,
    prize_lamports: "4500000000",
    opening_fee_lamports: "500000000",
    status: "Open",
    outcome: "Unresolved",
    void_reason: null,
    settle_mode: null,
    pool_yes: "0",
    pool_no: "0",
    entries_open: 0,
    opens_at: T0,
    entries_close_at: T0 + 10 * DAY,
    deadline_at: T0 + 11 * DAY,
    review_ends_at: null,
    closed: 0,
    last_seq: 0,
    updated_slot: 1,
    listed: null,
    rank: null,
    ...over,
  };
  insert(store, "campaigns", row);
  return row;
}

let entrySlot = 100;
/** One entry of `baker` on `side`; the campaign's pools grow by `amount`. */
export function addEntry(
  store: Store,
  campaign: CampaignRow,
  baker: string,
  side: "Yes" | "No",
  amount: bigint,
  more: { is_creator?: number; block_time?: number | null; slot?: number } = {},
): void {
  entrySlot += 1;
  const slot = more.slot ?? entrySlot;
  const yes = BigInt(campaign.pool_yes) + (side === "Yes" ? amount : 0n);
  const no = BigInt(campaign.pool_no) + (side === "No" ? amount : 0n);
  campaign.pool_yes = yes.toString();
  campaign.pool_no = no.toString();
  const seq = ++campaign.last_seq;
  insert(store, "entries", {
    signature: SIGN(`${campaign.address}${seq}${campaign.opening}`),
    ...{ ix_index: 0, inner_index: 0, campaign: campaign.address, opening: campaign.opening, seq, baker, side },
    ...{ amount: amount.toString(), is_first: 0, is_creator: more.is_creator ?? 0 },
    ...{ pool_yes_after: campaign.pool_yes, pool_no_after: campaign.pool_no, slot },
    block_time: more.block_time === undefined ? T0 + slot : more.block_time,
  });
  store.db.run("UPDATE campaigns SET pool_yes = ?, pool_no = ?, last_seq = ? WHERE address = ? AND opening = ?", [
    campaign.pool_yes,
    campaign.pool_no,
    seq,
    campaign.address,
    campaign.opening,
  ]);
}

/** One event row of `name` on the campaign (its data and bytes are not read by the code under test). */
export function addEvent(store: Store, campaign: CampaignRow, name: string, slot = 900): void {
  const seq = ++campaign.last_seq;
  insert(store, "events", {
    signature: SIGN(`${name}${campaign.address}${seq}`),
    ...{ ix_index: 0, inner_index: 0, slot, ord: slot, block_time: T0 + slot, name },
    ...{ campaign: campaign.address, opening: campaign.opening, seq, data: "{}", raw: "x" },
  });
}
