/**
 * Purpose: the SDK's referral link (Sprint 14) against the program: `decodeReferralLink` refuses what the program's
 *          loader refuses, in its order (owner, size, tag, layout version), a `Join` of the same 96 bytes included;
 *          the size and tag it checks are state/referral.rs's and state/mod.rs's; `checkReferrer` refuses what the
 *          program's rule refuses, with its code; and `buildUserLinkReferrer` signs as the referee and derives the
 *          link from it, byte for byte as the test kit's builder. Needs no binary.
 *          Filter: `bun test tests/ -t "sdk referral link"`.
 * Version: 0.1.0
 * Sprint:  14 (referral), lane L14A
 */
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { AccountRole, generateKeyPairSigner, getAddressEncoder, type Address } from "@solana/kit";

import * as R from "@brot/sdk/read";
import * as T from "@brot/sdk/tx";

import * as IL from "../brot/instructions-14-15";
import { encode } from "../brot/layouts";
import * as P from "../brot/program";
import { REFERRAL_LINK } from "../brot/structs-14-15";

const source = (file: string) => readFileSync(`programs/brot-markets/src/${file}`, "utf8");

/** A link's bytes as the program writes them, with `over` changing any field. */
function linkBytes(referee: Address, referrer: Address, over: Record<string, unknown> = {}) {
  const fields = { tag: 4, version: 1, bump: 254, referee, referrer, linked_at: 1_791_216_180n, linked_slot: 9n };
  return encode(REFERRAL_LINK, { ...fields, _reserved: new Uint8Array(13), ...over });
}

/** The problem `decodeReferralLink` names for `account`, or "decoded". */
function refused(account: R.RawAccount): string {
  try {
    R.decodeReferralLink(account);
    return "decoded";
  } catch (error) {
    if (!(error instanceof R.AccountRefused)) throw error;
    expect(error.expected).toBe("referralLink");
    return error.problem;
  }
}

describe("sdk referral link", () => {
  test("decodeReferralLink reads the program's link and refuses what its loader refuses, in its order", async () => {
    const [referee, referrer] = [(await generateKeyPairSigner()).address, (await generateKeyPairSigner()).address];
    const data = linkBytes(referee, referrer);
    const link = R.decodeReferralLink({ owner: R.PROGRAM_ID, data });
    expect(link).toMatchObject({ tag: 4, version: 1, bump: 254, referee, referrer });
    expect([link.linkedAt, link.linkedSlot]).toEqual([1_791_216_180n, 9n]);
    const ok = { owner: R.PROGRAM_ID, data };
    expect(refused({ ...ok, owner: R.SYSTEM_PROGRAM_ID })).toBe("WrongOwner");
    expect(refused({ ...ok, data: data.slice(0, -1) })).toBe("WrongLength");
    expect(refused({ ...ok, data: Uint8Array.of(...data, 0) })).toBe("WrongLength");
    // A Join is 96 bytes too: only its tag tells it apart, as in the program.
    expect(refused({ ...ok, data: linkBytes(referee, referrer, { tag: R.ACCOUNT_TAG.join }) })).toBe("WrongTag");
    expect(refused({ ...ok, data: new Uint8Array(96) })).toBe("WrongTag");
    expect(refused({ ...ok, data: linkBytes(referee, referrer, { version: 2 }) })).toBe("WrongLayoutVersion");
    // The order: the owner before the size, the size before the tag, the tag before the version.
    expect(refused({ owner: R.SYSTEM_PROGRAM_ID, data: data.slice(1) })).toBe("WrongOwner");
    expect(refused({ ...ok, data: Uint8Array.of(9, 9, ...data.slice(3)) })).toBe("WrongLength");
    expect(refused({ ...ok, data: linkBytes(referee, referrer, { tag: 3, version: 2 }) })).toBe("WrongTag");
  });

  test("the size and the tag the SDK checks are the program's", () => {
    expect(source("state/referral.rs")).toContain(`zero_copy!(ReferralLink = ${R.ACCOUNT_LEN.referralLink});`);
    expect(source("state/mod.rs")).toMatch(new RegExp(`\\bReferralLink = ${R.ACCOUNT_TAG.referralLink},`));
    expect(R.getReferralLinkDecoder().fixedSize).toBe(R.ACCOUNT_LEN.referralLink);
  });

  test("checkReferrer refuses the zero address and the referee itself, as the program does", async () => {
    const [referee, other] = [(await generateKeyPairSigner()).address, (await generateKeyPairSigner()).address];
    for (const referrer of [R.SYSTEM_PROGRAM_ID, referee]) {
      const check = R.checkReferrer(referee, referrer);
      if (check.ok) throw new Error(`${referrer} was accepted`);
      expect([check.refusal.errorName, check.refusal.code]).toEqual(["InvalidReferrer", 6153]);
      expect(check.refusal.message).toContain("zero address or the referee itself");
    }
    // Hygiene only: any other wallet passes, a second wallet of the same person included.
    expect(R.checkReferrer(referee, other)).toEqual({ ok: true });
  });

  test("buildUserLinkReferrer: the referee signs and pays, the link is derived from it, as the kit builds it", async () => {
    const [referee, referrer] = [await generateKeyPairSigner(), (await generateKeyPairSigner()).address];
    const ix = await T.buildUserLinkReferrer({ referee, referrer });
    const link = await R.referralLinkAddress(referee.address);
    expect(link).toBe(await P.referralLinkPda(referee.address));
    expect(ix.programAddress).toBe(R.PROGRAM_ID);
    expect(Array.from(ix.data ?? [])).toEqual([22, ...getAddressEncoder().encode(referrer)]);
    expect((ix.accounts ?? []).map((a) => [a.address, a.role])).toEqual([
      [referee.address, AccountRole.WRITABLE_SIGNER],
      [link, AccountRole.WRITABLE],
      [R.SYSTEM_PROGRAM_ID, AccountRole.READONLY],
      [R.EVENT_AUTHORITY, AccountRole.READONLY],
      [R.PROGRAM_ID, AccountRole.READONLY],
    ]);
    const kit = await IL.userLinkReferrerIx(referee, referrer);
    expect(Array.from(ix.data ?? [])).toEqual(Array.from(kit.data ?? []));
    expect((ix.accounts ?? []).map((a) => [a.address, a.role])).toEqual(
      (kit.accounts ?? []).map((a) => [a.address, a.role]),
    );
  });
});
