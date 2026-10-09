/**
 * Purpose: what `resolve_campaign` refuses, each with its exact error and nothing written: a call
 *          forwarded by another program (`checks::top_level`, `bun test tests/ -t "resolve refuses a
 *          cpi"`, rerun per mutant by scripts/checks-mutation.mjs), a campaign not `Open` (a second
 *          resolve included), another account in the metric slot, a stored kind no reader has, a
 *          campaign under another owner, at a look-alike address, or with another tag, layout
 *          version or length, a read-only campaign slot, any argument, wrong event slots, four slots.
 * Version: 0.0.1
 * Sprint:  03 (readers and resolution), lane D. Needs the SBF build with the readers of lanes A to C.
 */
import { describe, expect, test } from "bun:test";
import { AccountRole, type Address, type Instruction } from "@solana/kit";

import { readCampaign } from "./flows";
import * as I from "./instructions";
import * as P from "./program";
import { mintBytes, setRawAccount } from "./readers";
import {
  anyAddress,
  campaignOn,
  expectRefused,
  resolve,
  resolveIx,
  resolveWorld,
  snapshot,
  supplyCampaign,
  type Injected,
} from "./resolve-support";
import { accountData, expectOk, send, type World } from "./setup";

/** A world with an `Open` supply campaign whose mint is below its target: resolvable as YES. */
async function resolvable() {
  const w = await resolveWorld();
  return { w, c: await supplyCampaign(w, 900_000n, 1_000_000n) };
}

/** `ix` forwarded by the test-only CPI proxy, loaded at a fresh address: accounts `[program, ...]`,
 * each with the flags it has here, and the same data (tests/programs/cpi-proxy). */
async function forwarded(w: World, ix: Instruction): Promise<Instruction> {
  const proxy = await anyAddress();
  w.client.svm.addProgramFromFile(proxy, P.CPI_PROXY_SO);
  const target = { address: P.PROGRAM_ID, role: AccountRole.READONLY };
  return { programAddress: proxy, accounts: [target, ...(ix.accounts ?? [])], data: ix.data };
}

/** Writes the campaign again under `owner` (the program's by default) with `data` (its own). */
function rewrite(w: World, c: Injected, change: { owner?: Address; data?: Uint8Array }) {
  const data = change.data ?? new Uint8Array(accountData(w, c.campaign));
  setRawAccount(w.client, c.campaign, data, change.owner ?? P.PROGRAM_ID);
}

describe("resolve refuses a cpi", () => {
  test("top_level: a resolve forwarded by another program", async () => {
    // The same instruction, accounts and data: refused through the CPI proxy, recorded at the top level.
    const { w, c } = await resolvable();
    const ix = resolveIx(c);
    await expectRefused(w, c, await forwarded(w, ix), "ResolveNotTopLevel");
    expectOk(await send(w, [ix]));
    expect(readCampaign(w, c.campaign).status).toBe(P.Status.InReview);
  });
});

describe("resolve refuses", () => {
  test("CampaignNotOpen: a campaign already in review", async () => {
    const w = await resolveWorld();
    const mint = await anyAddress();
    setRawAccount(w.client, mint, mintBytes({ supply: 900_000n, mintAuthority: null }), P.SPL_TOKEN_PROGRAM_ID);
    const c = await campaignOn(w, P.ReaderKind.SupplyAtMost, mint, 1_000_000n, { status: P.Status.InReview });
    await expectRefused(w, c, resolveIx(c), "CampaignNotOpen");
  });

  test("CampaignNotOpen: a second resolve of the same campaign", async () => {
    const { w, c } = await resolvable();
    expectOk(await resolve(w, c));
    await expectRefused(w, c, resolveIx(c), "CampaignNotOpen");
  });

  test("MetricAccountMismatch: another account in the metric slot", async () => {
    const { w, c } = await resolvable();
    const other = await supplyCampaign(w, 900_000n, 1_000_000n);
    await expectRefused(w, c, I.withSlot(resolveIx(c), 1, { address: other.metric }), "MetricAccountMismatch");
  });

  test("UnknownReaderKind: a stored kind no reader has", async () => {
    const { w, c } = await resolvable();
    const unknown = await campaignOn(w, 5, c.metric, 1_000_000n);
    await expectRefused(w, unknown, resolveIx(unknown), "UnknownReaderKind");
  });

  test("WrongOwner: the campaign's bytes under another owner", async () => {
    const { w, c } = await resolvable();
    rewrite(w, c, { owner: await anyAddress() });
    await expectRefused(w, c, resolveIx(c), "WrongOwner");
  });

  test("PdaMismatch: the campaign's bytes at a look-alike address", async () => {
    const { w, c } = await resolvable();
    const lookAlike = { ...c, campaign: await anyAddress() };
    setRawAccount(w.client, lookAlike.campaign, new Uint8Array(accountData(w, c.campaign)), P.PROGRAM_ID);
    await expectRefused(w, lookAlike, resolveIx(lookAlike), "PdaMismatch");
  });

  test("WrongTag, WrongLayoutVersion, WrongLength: another tag, layout version or length", async () => {
    const { w, c } = await resolvable();
    const bytes = new Uint8Array(accountData(w, c.campaign));
    const changed = (index: number, value: number) => bytes.map((byte, i) => (i === index ? value : byte));
    rewrite(w, c, { data: changed(0, P.AccountTag.Entry) });
    await expectRefused(w, c, resolveIx(c), "WrongTag");
    rewrite(w, c, { data: changed(1, 2) });
    await expectRefused(w, c, resolveIx(c), "WrongLayoutVersion");
    rewrite(w, c, { data: bytes.slice(0, bytes.length - 1) });
    await expectRefused(w, c, resolveIx(c), "WrongLength");
  });

  test("NotWritable: a read-only campaign slot", async () => {
    const { w, c } = await resolvable();
    await expectRefused(w, c, I.withSlot(resolveIx(c), 0, { role: AccountRole.READONLY }), "NotWritable");
  });

  test("BadInstructionData: any argument", async () => {
    const { w, c } = await resolvable();
    const ix = I.withData(resolveIx(c), Uint8Array.of(P.IX.RESOLVE_CAMPAIGN, 0));
    await expectRefused(w, c, ix, "BadInstructionData");
  });

  test("WrongEventAuthority, WrongProgramAccount: wrong event slots", async () => {
    const { w, c } = await resolvable();
    const ix = resolveIx(c);
    await expectRefused(w, c, I.withSlot(ix, 3, { address: await anyAddress() }), "WrongEventAuthority");
    await expectRefused(w, c, I.withSlot(ix, 4, { address: await anyAddress() }), "WrongProgramAccount");
  });

  test("NotEnoughAccountKeys: four slots", async () => {
    const { w, c } = await resolvable();
    const ix = resolveIx(c);
    const short: Instruction = { ...ix, accounts: ix.accounts?.slice(0, 4) };
    const before = snapshot(w, c);
    const sent = await send(w, [short]);
    expect(sent.ok ? "succeeded" : sent.error).toContain("NotEnoughAccountKeys");
    expect(snapshot(w, c)).toEqual(before);
  });
});
