/**
 * Purpose: the Sprint 02 accounts (layout version 1) and this sprint's reserve changes. The reserve took the
 *          `epoch` and `min_entry_lamports` of the campaign (16 of its 64 reserved bytes, the reserve now 48)
 *          and `join_count` of the Entry (4 of 16, the reserve now 12). Both accounts keep their size and their
 *          first bytes, so a version 1 account reads the same, with the new fields zero. The pure checks run
 *          now; the program check needs the binary (integration).
 * Version: 0.0.1
 * Sprint:  04 (contract freeze, lane E)
 */
import { describe, expect, test } from "bun:test";
import { getAddressEncoder, getProgramDerivedAddress, lamports, type Address } from "@solana/kit";

import { BTC_PRICE, initConfig, join, newId } from "./flows";
import { setBtc } from "./invariant-harness";
import { decode, encode, layoutSize, offsetOf, type Layout } from "./layouts";
import * as P from "./program";
import { balance, createWorld, expectOk, fundedWallet, now, rentFor, type World } from "./setup";
import { CAMPAIGN, ENTRY } from "./structs";

/** Sprint 02's Campaign: this layout with `epoch` and `min_entry_lamports` out of the reserve (64 bytes). */
export const CAMPAIGN_V1: Layout = [
  ...CAMPAIGN.filter(([name]) => name !== "epoch" && name !== "min_entry_lamports" && name !== "_reserved"),
  ["_reserved", { bytes: 64 }],
];
/** Sprint 02's Entry: `join_count` out of the 16 reserved bytes. */
export const ENTRY_V1: Layout = [
  ...ENTRY.filter(([name]) => name !== "join_count" && name !== "_reserved"),
  ["_reserved", { bytes: 16 }],
];

const SOL = P.SOL;
const text = (s: string) => new TextEncoder().encode(s);
const key = (a: Address) => getAddressEncoder().encode(a);

/** Every field of a version 1 campaign with a value, the reserve zero. */
function v1Values(): Record<string, unknown> {
  return {
    tag: P.AccountTag.Campaign,
    version: 1,
    bump: 254,
    vault_bump: 253,
    kind: P.ReaderKind.PriceTouch,
    direction: P.Direction.Above,
    status: P.Status.Open,
    outcome: P.Outcome.Unresolved,
    id: 7n,
    creator: P.PROGRAM_ID,
    rent_payer: P.PROGRAM_ID,
    template_version: 1,
    creator_share_bps: 100,
    fee_bps: 1_000,
    one_sided_fee_bps: 100,
    feed_id: P.BTC_USD_FEED_ID,
    metric_account: P.BTC_USD_ACCOUNT,
    target: 9_000_000_000_000n,
    price_exponent: -8,
    max_age: 120,
    opens_at: 1_791_216_000n,
    entries_close_at: 1_791_300_000n,
    deadline_at: 1_791_500_000n,
    pool_yes: 4n * SOL,
    pool_no: 1n * SOL,
    first_baker: P.SYSTEM_PROGRAM_ID,
    entries_open: 3,
    paid_out_total: 0n,
  };
}

describe("layout version 1 (Sprint 02 accounts)", () => {
  test("the reserve growth keeps the size of the campaign and of the entry", () => {
    expect(layoutSize(CAMPAIGN_V1)).toBe(512);
    expect(layoutSize(CAMPAIGN)).toBe(512);
    expect(layoutSize(ENTRY_V1)).toBe(100);
    expect(layoutSize(ENTRY)).toBe(100);
  });

  test("the reserve growth keeps the first bytes: everything before the new fields is where it was", () => {
    const values = v1Values();
    const epochAt = offsetOf(CAMPAIGN, "epoch");
    expect(epochAt).toBe(offsetOf(CAMPAIGN_V1, "_reserved"));
    const old = encode(CAMPAIGN_V1, { ...values, _reserved: new Uint8Array(64).fill(0xab) });
    const grown = encode(CAMPAIGN, { ...values, epoch: 0n, min_entry_lamports: 0n, _reserved: new Uint8Array(48) });
    expect(Buffer.from(grown.subarray(0, epochAt)).equals(Buffer.from(old.subarray(0, epochAt)))).toBe(true);
    // A version 1 account reads back under the new layout with the new fields at zero.
    const read = decode(CAMPAIGN, old);
    const filled = BigInt(`0x${"ab".repeat(8)}`);
    expect(read.epoch).toBe(filled);
    expect(read.min_entry_lamports).toBe(filled);
    expect(read.pool_yes).toBe(4n * SOL);
  });

  test("the reserve growth keeps the first bytes of the entry; a version 1 entry has join_count zero", () => {
    const old = encode(ENTRY_V1, {
      tag: P.AccountTag.Entry,
      version: 1,
      bump: 255,
      campaign: P.PROGRAM_ID,
      baker: P.PROGRAM_ID,
      amount_yes: SOL,
    });
    const grown = encode(ENTRY, {
      tag: P.AccountTag.Entry,
      version: 1,
      bump: 255,
      campaign: P.PROGRAM_ID,
      baker: P.PROGRAM_ID,
      amount_yes: SOL,
    });
    expect(offsetOf(ENTRY, "join_count")).toBe(offsetOf(ENTRY_V1, "_reserved"));
    expect(Buffer.from(grown).equals(Buffer.from(old))).toBe(true);
    expect(decode(ENTRY, old).join_count).toBe(0);
  });

  test("a version 1 campaign reads its minimum entry as zero (the program must not treat that as a minimum)", () => {
    expect(decode(CAMPAIGN, encode(CAMPAIGN_V1, v1Values())).min_entry_lamports).toBe(0n);
  });

  test("the new binary loads a Sprint 02 campaign and its entry, and takes a join on each", async () => {
    const w = await createWorld();
    await initConfig(w);
    const creator = await fundedWallet(w);
    const [baker, newcomer] = [await fundedWallet(w), await fundedWallet(w)];
    const t = now(w.client);
    const id = newId();
    const { campaign, vault, bump, vaultBump } = await v1Accounts(id);
    const data = encode(CAMPAIGN_V1, {
      ...v1Values(),
      tag: P.AccountTag.Campaign,
      version: 1,
      bump,
      vault_bump: vaultBump,
      id,
      creator: creator.address,
      rent_payer: creator.address,
      target: (BTC_PRICE * 11n) / 10n,
      opens_at: t - P.DAY,
      entries_close_at: t + P.DAY,
      deadline_at: t + 3n * P.DAY,
      pool_yes: SOL,
      pool_no: 0n,
      entries_open: 1,
      first_baker: baker.address,
    });
    setAccount(w, campaign, data, rentFor(w, data.length), P.PROGRAM_ID);
    setAccount(w, vault, new Uint8Array(0), rentFor(w, 0) + SOL, P.PROGRAM_ID);
    const entry = await P.entryPda(campaign, baker.address);
    const entryData = encode(ENTRY_V1, {
      tag: P.AccountTag.Entry,
      version: 1,
      bump: (
        await getProgramDerivedAddress({
          programAddress: P.PROGRAM_ID,
          seeds: [text("entry"), key(campaign), key(baker.address)],
        })
      )[1],
      campaign,
      baker: baker.address,
      amount_yes: SOL,
    });
    setAccount(w, entry, entryData, rentFor(w, entryData.length), P.PROGRAM_ID);
    setBtc(w, BTC_PRICE, now(w.client) - 5n);

    expectOk(await join(w, baker, campaign, { side: P.Side.Yes, amount: SOL / 10n, expectedEntryTotal: SOL }));
    expect(decode(ENTRY, dataOf(w, entry)).amount_yes).toBe(SOL + SOL / 10n);
    expectOk(await join(w, newcomer, campaign, { side: P.Side.No, amount: SOL / 10n }));
    expect(balance(w, vault)).toBeGreaterThan(SOL);
  });
});

/** The PDAs of a version 1 campaign with its bumps (the bumps are stored; the program checks them). */
async function v1Accounts(id: bigint) {
  const [campaign, bump] = await getProgramDerivedAddress({
    programAddress: P.PROGRAM_ID,
    seeds: [text("campaign"), P.u64le(id)],
  });
  const [vault, vaultBump] = await getProgramDerivedAddress({
    programAddress: P.PROGRAM_ID,
    seeds: [text("vault"), key(campaign)],
  });
  return { campaign, vault, bump, vaultBump };
}

function setAccount(w: World, address: Address, data: Uint8Array, lamportsAmount: bigint, owner: Address) {
  w.client.svm.setAccount({
    address,
    data,
    executable: false,
    lamports: lamports(lamportsAmount),
    programAddress: owner,
    space: BigInt(data.length),
  });
}

function dataOf(w: World, address: Address): Uint8Array {
  const account = w.client.svm.getAccount(address);
  if (!account.exists) throw new Error(`no account ${address}`);
  return account.data;
}
