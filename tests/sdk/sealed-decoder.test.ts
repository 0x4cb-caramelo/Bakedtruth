/**
 * Purpose: the SDK's `SealedFee` decoder (Sprint 15) refuses what the program's loader refuses, in its order (owner,
 *          length, tag, layout version), and decodes every field of the kit's own layout; its size and tag are the
 *          program's. Needs no binary.
 *          Filter: `bun test tests/ -t "the SealedFee decoder"`.
 * Version: 0.1.0
 * Sprint:  15 (lane L15)
 */
import { describe, expect, test } from "bun:test";
import { generateKeyPairSigner } from "@solana/kit";

import * as R from "@brot/sdk/read";

import { encode, layoutSize } from "../brot/layouts";
import { SEALED_FEE } from "../brot/structs-14-15";

describe("the SealedFee decoder", () => {
  test("decodes the kit's layout and refuses what the loader refuses, in its order", async () => {
    const [campaign, sponsor] = [(await generateKeyPairSigner()).address, (await generateKeyPairSigner()).address];
    expect([R.ACCOUNT_LEN.sealedFee as number, R.ACCOUNT_TAG.sealedFee as number]).toEqual([layoutSize(SEALED_FEE), 6]);
    const data = encode(SEALED_FEE, {
      tag: 6,
      version: 1,
      bump: 251,
      campaign,
      sponsor,
      fee_lamports: 419_337_741n,
      entry_lamports: 3_774_039_668n,
      usd_total: 1_000n,
      sealed_count: 2,
      _reserved: new Uint8Array(17),
    });
    const ok = { owner: R.PROGRAM_ID, data };
    expect(R.decodeSealedFee(ok)).toMatchObject({
      tag: 6,
      version: 1,
      bump: 251,
      campaign,
      sponsor,
      feeLamports: 419_337_741n,
      entryLamports: 3_774_039_668n,
      usdTotal: 1_000n,
      sealedCount: 2,
    });
    const refused = (account: R.RawAccount) => {
      try {
        R.decodeSealedFee(account);
        return "decoded";
      } catch (error) {
        return (error as R.AccountRefused).problem;
      }
    };
    expect(refused({ ...ok, owner: R.SYSTEM_PROGRAM_ID })).toBe("WrongOwner");
    // The owner first: a foreign account of any size is WrongOwner.
    expect(refused({ owner: R.SYSTEM_PROGRAM_ID, data: data.slice(1) })).toBe("WrongOwner");
    expect(refused({ ...ok, data: data.slice(0, -1) })).toBe("WrongLength");
    expect(refused({ ...ok, data: Uint8Array.of(...data, 0) })).toBe("WrongLength");
    expect(refused({ ...ok, data: Uint8Array.of(R.ACCOUNT_TAG.entry, ...data.slice(1)) })).toBe("WrongTag");
    // The tag before the version: a zeroed account is WrongTag.
    expect(refused({ ...ok, data: new Uint8Array(data.length) })).toBe("WrongTag");
    expect(refused({ ...ok, data: Uint8Array.of(6, 2, ...data.slice(2)) })).toBe("WrongLayoutVersion");
  });
});
