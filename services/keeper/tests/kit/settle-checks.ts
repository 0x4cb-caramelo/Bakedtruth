/**
 * Purpose: the money checks of the keeper's settlement tests: from the state captured when the snapshot landed, the
 *          program's stored snapshot equals the SDK's (`snapshotOf`); each baker received exactly `entryOwed` plus the
 *          entry's rent; whoever opened received the creator share, the prize return and both rents; the fee recipient
 *          received what Brot keeps plus the vault's rounding dust; the vault and the campaign are closed, the fee
 *          vault is down to its rent; the keeper wallet only paid network fees; and no lamport appeared or vanished.
 * Version: 0.2.0 (Sprint 15: a sponsor's SealedFee, its rent back and its fee to the fee vault or, on a house void, back)
 * Sprint:  07 carry-over (the keeper's settlement, tested on LiteSVM)
 */
import { expect } from "bun:test";
import type { Address } from "@solana/kit";
import { feeVaultAddress, vaultAddress } from "@brot/sdk/read";

import { balance, rentFor } from "../../../../tests/brot/setup";
import { owed, type Captured, type KeeperWorld } from "./settle-world";

/** The base fee of one signature; the keeper's tests pay no priority fee (no recent fees, a zero floor). */
const BASE_FEE = 5_000n;

/** A sponsor's `SealedFee` as captured: its lamports, its bookkept fee, and whether the fee goes back (a house void). */
export type SealedHeld = { sponsor: Address; lamports: bigint; fee: bigint; toSponsor: boolean };

export async function expectPaidAsOwed(
  kw: KeeperWorld,
  at: Address,
  captured: Captured,
  keepers: Address[] = [],
  sealed: SealedHeld[] = [],
) {
  const o = owed(captured);
  const c = captured.campaign;
  expect({ mode: c.settleMode, distributable: c.distributable, fee: c.feeTotal, share: c.creatorShare }).toEqual({
    mode: o.snap.mode,
    distributable: o.snap.distributable,
    fee: o.snap.feeTotal,
    share: o.snap.creatorShare,
  });
  const before = (party: string) => captured.balances.get(party)!;
  const gain = (party: string) => balance(kw, party as Address) - before(party);
  const vault = await vaultAddress(at);
  const feeVault = await feeVaultAddress();

  // A sponsor is a baker too: its entry, and its SealedFee's rent (and its fee on a house void) come back.
  const sealedBack = (who: Address) =>
    sealed
      .filter((s) => s.sponsor === who)
      .reduce((sum, s) => sum + s.lamports - s.fee + (s.toSponsor ? s.fee : 0n), 0n);
  const feesKept = sealed.reduce((sum, s) => sum + (s.toSponsor ? 0n : s.fee), 0n);
  for (const baker of o.bakers) expect(gain(baker.baker)).toBe(baker.amount + baker.rent + sealedBack(baker.baker));

  const campaignRent = rentFor(kw, 512);
  const vaultRent = rentFor(kw, 0);
  const rents = c.rentPayer === kw.creator.address ? campaignRent + vaultRent : 0n;
  expect(gain(kw.creator.address)).toBe(o.share + o.prize + rents);

  // What the vault held beyond its rent and what it owed: the rounding remainder, swept to the fee vault at close.
  const paid = o.bakers.reduce((sum, b) => sum + b.amount, 0n) + o.share + o.prize + o.kept;
  const dust = before(vault) - vaultRent - paid;
  expect(dust >= 0n && dust <= BigInt(o.bakers.length)).toBe(true);
  const feeVaultSurplus = before(feeVault) - vaultRent;
  expect(gain(kw.feeRecipient)).toBe(feeVaultSurplus + o.kept + dust + feesKept);
  expect(balance(kw, feeVault)).toBe(vaultRent);
  expect(balance(kw, vault)).toBe(0n);
  expect(balance(kw, at)).toBe(0n);

  // Nothing appears or vanishes: what the campaign, its vault and its entries held went to the parties above.
  const held =
    before(at) +
    before(vault) +
    o.bakers.reduce((sum, b) => sum + b.rent, 0n) +
    sealed.reduce((sum, s) => sum + s.lamports, 0n);
  const out = o.bakers.reduce((sum, b) => sum + gain(b.baker), 0n) + gain(kw.creator.address) + gain(kw.feeRecipient);
  expect(out + (balance(kw, feeVault) - before(feeVault))).toBe(held);

  // Each keeper wallet only paid network fees, and received nothing.
  for (const keeper of [kw.keeper.address, ...keepers]) {
    const spent = before(keeper) - balance(kw, keeper);
    expect(spent >= 0n && spent % BASE_FEE === 0n).toBe(true);
  }
  return o;
}
