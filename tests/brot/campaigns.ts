/**
 * Purpose: a `Campaign` of any kind and its vault written straight into the world, so the tests of
 *          resolution and of the join lock do not depend on the opening's rules for that kind.
 * Version: 0.0.4
 * Sprint:  03 (readers and resolution); 04 adds `injectEntry` and the reviewed and settling helpers
 */
import { getAddressEncoder, getProgramDerivedAddress, lamports, type Address } from "@solana/kit";

import { encode, layoutSize } from "./layouts";
import * as P from "./program";
import type { Client } from "./setup";
import { CAMPAIGN, ENTRY } from "./structs";

const text = (s: string) => new TextEncoder().encode(s);

/** The fields a test sets; every other field of `CAMPAIGN` is zero unless `extra` names it. */
export type InjectedCampaign = {
  id: bigint;
  kind: number;
  metric: Address;
  target: bigint;
  creator: Address;
  opensAt: bigint;
  entriesCloseAt: bigint;
  deadlineAt: bigint;
  direction?: number;
  feedId?: Uint8Array;
  priceExponent?: number;
  maxAge?: number;
  epoch?: bigint;
  status?: number;
  poolYes?: bigint;
  poolNo?: bigint;
  /** Any other `CAMPAIGN` field by its snake_case name. */
  extra?: Record<string, unknown>;
};

/**
 * Writes the campaign at `["campaign", id]` with its canonical bump, `Open` unless `status` says
 * otherwise, the fees and share of a paid opening, and a data-less vault holding its rent plus the
 * two pools. Returns both addresses.
 */
export async function injectCampaign(client: Pick<Client, "svm">, c: InjectedCampaign) {
  const [campaign, bump] = await getProgramDerivedAddress({
    programAddress: P.PROGRAM_ID,
    seeds: [text("campaign"), P.u64le(c.id)],
  });
  const [vault, vaultBump] = await getProgramDerivedAddress({
    programAddress: P.PROGRAM_ID,
    seeds: [text("vault"), getAddressEncoder().encode(campaign)],
  });
  const data = encode(CAMPAIGN, {
    tag: P.AccountTag.Campaign,
    version: 1,
    bump,
    vault_bump: vaultBump,
    kind: c.kind,
    direction: c.direction ?? P.Direction.Above,
    status: c.status ?? P.Status.Open,
    outcome: P.Outcome.Unresolved,
    id: c.id,
    creator: c.creator,
    rent_payer: c.creator,
    template_version: 1,
    creator_share_bps: 100,
    fee_bps: 1_000,
    one_sided_fee_bps: 100,
    feed_id: c.feedId ?? new Uint8Array(32),
    metric_account: c.metric,
    target: c.target,
    price_exponent: c.priceExponent ?? 0,
    max_age: c.maxAge ?? 0,
    opens_at: c.opensAt,
    entries_close_at: c.entriesCloseAt,
    deadline_at: c.deadlineAt,
    pool_yes: c.poolYes ?? 0n,
    pool_no: c.poolNo ?? 0n,
    epoch: c.epoch ?? 0n,
    min_entry_lamports: 0n,
    ...c.extra,
  });
  const write = (at: Address, bytes: Uint8Array, extraLamports = 0n) =>
    client.svm.setAccount({
      address: at,
      data: bytes,
      executable: false,
      lamports: lamports(client.svm.minimumBalanceForRentExemption(BigInt(bytes.length)) + extraLamports),
      programAddress: P.PROGRAM_ID,
      space: BigInt(bytes.length),
    });
  write(campaign, data);
  write(vault, new Uint8Array(0), (c.poolYes ?? 0n) + (c.poolNo ?? 0n));
  if (data.length !== layoutSize(CAMPAIGN)) throw new Error("campaign layout size");
  return { campaign, vault };
}

/** A campaign in `InReview` with its outcome, as `resolve_campaign` leaves it (the window still open). */
export const injectReviewed = (
  client: Pick<Client, "svm">,
  c: InjectedCampaign,
  outcome: number,
  reviewEndsAt: bigint,
) =>
  injectCampaign(client, {
    ...c,
    status: P.Status.InReview,
    extra: { outcome, review_ends_at: reviewEndsAt, ...c.extra },
  });

/** A campaign in `Settling` with its snapshot, as `finalize_campaign` leaves it (the fields the program sets). */
export const injectSettling = (
  client: Pick<Client, "svm">,
  c: InjectedCampaign,
  outcome: number,
  snapshot: Partial<
    Record<
      | "winning_total"
      | "losing_total"
      | "distributable"
      | "fee_total"
      | "creator_share"
      | "creator_share_from_fee"
      | "prize_lamports",
      bigint
    >
  >,
) =>
  injectCampaign(client, {
    ...c,
    status: P.Status.Settling,
    extra: { outcome, ...snapshot, ...c.extra },
  });

/**
 * A baker's `Entry` at its canonical PDA `["entry", campaign, baker]`, with its two side totals.
 * Its `_reserved` bytes stay zero until the join's storage is decided (Sprint 04, question 7).
 */
export async function injectEntry(
  client: Pick<Client, "svm">,
  e: {
    campaign: Address;
    baker: Address;
    amountYes?: bigint;
    amountNo?: bigint;
    isFirst?: boolean;
    joinCount?: number;
  },
) {
  const [entry, bump] = await getProgramDerivedAddress({
    programAddress: P.PROGRAM_ID,
    seeds: [text("entry"), getAddressEncoder().encode(e.campaign), getAddressEncoder().encode(e.baker)],
  });
  const data = encode(ENTRY, {
    tag: P.AccountTag.Entry,
    version: 1,
    bump,
    is_first: e.isFirst ?? false,
    campaign: e.campaign,
    baker: e.baker,
    amount_yes: e.amountYes ?? 0n,
    amount_no: e.amountNo ?? 0n,
    join_count: e.joinCount ?? 0,
    _reserved: new Uint8Array(12),
  });
  client.svm.setAccount({
    address: entry,
    data,
    executable: false,
    lamports: lamports(client.svm.minimumBalanceForRentExemption(BigInt(data.length))),
    programAddress: P.PROGRAM_ID,
    space: BigInt(data.length),
  });
  return entry;
}
