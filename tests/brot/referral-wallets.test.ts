/**
 * Purpose: two wallets and a link (Sprint 14 DoD): wallet A cannot create, change or remove B's link. A signing its
 *          own link with B's address in the link slot is refused, before and after B links; A cannot sign as B, even
 *          after paying B's whole rent in advance; B cannot link twice. And no instruction of the program changes or closes a link: B's link put in every
 *          writable slot of every instruction's valid baseline (the slot matrix's), the joins `tally_late_joins`
 *          closes included, is refused each time and stays byte for byte, lamport for lamport, where it was.
 *          Filter: `bun test tests/ -t "link referrer two wallets"`.
 * Version: 0.1.0
 * Sprint:  14 (referral), lane L14A. Needs the SBF build.
 */
import { describe, expect, test } from "bun:test";
import { AccountRole } from "@solana/kit";

import { referralLinkAddress } from "@brot/sdk/read";

import { place } from "./checks-support";
import * as I from "./instructions";
import * as P from "./program";
import { link, linkIx, linkWorld, readLink, snapshot } from "./referral-support";
import { BASELINES } from "./slot-matrix-fixtures";
import { expectError, expectOk, fundedWallet, rentFor, send } from "./setup";

describe("link referrer two wallets", () => {
  test("link: wallet A cannot create, change or remove wallet B's link", async () => {
    const { w, referee: b, referrer } = await linkWorld();
    const a = await fundedWallet(w);
    const linkB = await referralLinkAddress(b.address);
    const asA = async () => I.withSlot(await linkIx(a, referrer.address), 1, { address: linkB });

    // Create: A signs its own link with B's address in the link slot; the program derives the link from A.
    expectError(await send(w, [await asA()]), "PdaMismatch");
    // A names B as the referee without B's signature.
    const asB = I.withSlot(await linkIx(b, a.address), 0, { role: AccountRole.WRITABLE });
    expectError(await send(w, [asB]), "MissingSignature");
    expect(snapshot(w, linkB).owner).toBeNull();
    // Even when A pays B's whole rent in advance, so the link needs nothing from B: B's signature is still required.
    place(w, linkB, { owner: P.SYSTEM_PROGRAM_ID, lamports: rentFor(w, 96) });
    expectError(await send(w, [asB]), "MissingSignature");
    expect(snapshot(w, linkB)).toMatchObject({ owner: P.SYSTEM_PROGRAM_ID, data: [] });

    // B links; then A can neither overwrite it nor make B link again, and B itself cannot change it.
    expectOk(await link(w, b, referrer.address));
    const kept = snapshot(w, linkB);
    expectError(await send(w, [await asA()]), "PdaMismatch");
    expectError(await send(w, [asB]), "MissingSignature");
    expectError(await link(w, b, a.address), "AlreadyInitialized");
    // A's own link lives at A's own address and leaves B's alone.
    expectOk(await link(w, a, referrer.address));
    expect((await readLink(w, a.address)).link.referee).toBe(a.address);
    expect(snapshot(w, linkB)).toEqual(kept);
    expect((await readLink(w, b.address)).link).toMatchObject({ referee: b.address, referrer: referrer.address });
  });

  test("link: no instruction changes or closes a link, in any writable slot", async () => {
    const tried: string[] = [];
    const accepted: string[] = [];
    for (const [name, baseline] of Object.entries(BASELINES)) {
      const { w, ix } = await baseline();
      const [b, referrer] = [await fundedWallet(w), await fundedWallet(w)];
      expectOk(await link(w, b, referrer.address));
      const linkB = await referralLinkAddress(b.address);
      const kept = snapshot(w, linkB);
      const writable = (ix.accounts ?? []).flatMap((a, i) =>
        a.role === AccountRole.WRITABLE || a.role === AccountRole.WRITABLE_SIGNER ? [i] : [],
      );
      for (const i of writable) {
        const sent = await send(w, [I.withSlot(ix, i, { address: linkB, role: AccountRole.WRITABLE })]);
        tried.push(`${name}#${i}`);
        if (sent.ok) accepted.push(`${name}#${i}`);
        expect(`${name}#${i} ${JSON.stringify(snapshot(w, linkB), bigints)}`).toBe(
          `${name}#${i} ${JSON.stringify(kept, bigints)}`,
        );
      }
    }
    expect(accepted).toEqual([]);
    // Every instruction of the IDL was tried (each has a baseline with at least one writable slot).
    expect(new Set(tried.map((t) => t.split("#")[0])).size).toBe(Object.keys(BASELINES).length);
  }, 600_000);
});

const bigints = (_: string, v: unknown) => (typeof v === "bigint" ? `${v}n` : v);
