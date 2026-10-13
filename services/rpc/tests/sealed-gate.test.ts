/**
 * Purpose: the country gate covers the sealed entry (Sprint 15; K-11): `sponsor_join_campaign` puts a sponsor's money
 *          into a campaign as a join does, so a transaction that carries it is gated as a join, refused from a listed
 *          country to sendTransaction and to simulateTransaction alike; `settle_sealed_fee`, a payout, never is.
 *          Filter: `bun test services/rpc -t "the country gate covers the sealed entry"`.
 * Version: 0.1.0
 * Sprint:  15 (lane L15)
 */
import { describe, expect, test } from "bun:test";
import { COMPUTE_BUDGET_PROGRAM_ID, INSTRUCTION_DISCRIMINATOR as D, PROGRAM_ID } from "@brot/sdk/read";

import { REFUSED } from "../src/relay";
import { checkTransaction } from "../src/transaction";
import { ix, setup, wire } from "./kit";

const SEND = { encoding: "base64" };
/** `settle_sealed_fee`'s discriminator (instructions/mod.rs `ix::SETTLE_SEALED_FEE`). */
const SETTLE_SEALED_FEE = 26;

describe("the country gate covers the sealed entry", () => {
  test("a sealed entry is gated as a join, from a listed country only; settling its fee is not", async () => {
    expect(D.sponsorJoinCampaign).toBe(25);
    const sealed = wire([ix(COMPUTE_BUDGET_PROGRAM_ID, 2), ix(PROGRAM_ID, D.sponsorJoinCampaign)]);
    const settle = wire([ix(PROGRAM_ID, SETTLE_SEALED_FEE)]);
    expect(checkTransaction(sealed)).toEqual({ ok: true, joinsOrOpens: true });
    expect(checkTransaction(settle)).toEqual({ ok: true, joinsOrOpens: false });

    const listed = setup({ env: { GEO_BLOCK_COUNTRIES: "xx" }, answer: () => ({ result: "sig" }) });
    const from = (method: string, tx: string, country: string) =>
      listed.call(method, [tx, SEND], { "cf-ipcountry": country });
    expect((await from("sendTransaction", sealed, "XX")).json.error.code).toBe(REFUSED.country);
    expect((await from("simulateTransaction", sealed, "XX")).json.error.code).toBe(REFUSED.country);
    expect((await from("sendTransaction", sealed, "BR")).json.result).toBe("sig");
    expect((await from("sendTransaction", settle, "XX")).json.result).toBe("sig");
  });
});
