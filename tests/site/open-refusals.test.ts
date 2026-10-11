/**
 * Purpose: A-10 and X0.7, the creation box's half (Sprint 19 DoD): every refusal of TP §3.4.10 rows 1 to 10 has its own
 *          message in the box's copy; then each refused case the box can be led into is built through the box itself (a
 *          draft, read through the site's RPC, checked by `checkBox` and the SDK's `validateOpenCampaign`), and the very
 *          arguments it would sign are sent straight to the program in LiteSVM, past the site, which refuses them with
 *          the same error. Two cases the box cannot stop by itself (the terms changed, the price moved past
 *          `max_lamports`) are refused by the program and then by the SDK on its re-read.
 *          Filter: `bun test tests/ -t "validateOpenCampaign refuses what the program refuses"`.
 * Version: 0.1.0
 * Sprint:  19 (site: open a campaign)
 */
import { afterEach, describe, expect, test } from "bun:test";

import { BROT_ERROR_CODES, rowOf, type BrotErrorName, type OpenArgs } from "@brot/sdk/read";

import { checkBox } from "../../app/features/open-campaign/check";
import { REFUSALS, refusalCopy } from "../../app/features/open-campaign/copy-refusals";
import { DEFAULT_PARAMS, openedCampaign, SOL_PRICE } from "../brot/flows";
import * as I from "../brot/instructions";
import { openingWorld } from "../brot/opening";
import * as P from "../brot/program";
import { expectError, expectOk, send, setPriceAccount } from "../brot/setup";
import {
  boxThenProgram,
  CASES,
  closeChains,
  expectBoxRefusal,
  PRICE_DRAFT,
  sdkNow,
  supplyOf,
  usdc,
} from "./open-cases";

afterEach(closeChains);

describe("validateOpenCampaign refuses what the program refuses", () => {
  test("every refusal of rows 1 to 10 has its own message in the box's copy", () => {
    const named = (Object.keys(BROT_ERROR_CODES) as BrotErrorName[]).filter((name) => rowOf(name) !== null);
    expect(named.length).toBeGreaterThanOrEqual(35);
    expect(named.filter((name) => REFUSALS[name] === undefined)).toEqual([]);
  });

  for (const c of CASES) {
    test(`${c.name}: the box shows ${c.error}, and the program refuses the same arguments`, async () => {
      const w = await openingWorld();
      await c.setup?.(w);
      const { check, program } = await boxThenProgram(w, c.team ? w.team : w.creator, { ...PRICE_DRAFT, ...c.draft });
      expectBoxRefusal(check, c.error);
      expectError(await program(), c.error);
    });
  }

  test("row 2: a mint whose authority is live", async () => {
    const w = await openingWorld();
    const draft = {
      ...PRICE_DRAFT,
      kind: "burn" as const,
      account: usdc(w),
      target: String(supplyOf("mint-usdc") / 2n),
    };
    const { check, program } = await boxThenProgram(w, w.team, draft);
    expectBoxRefusal(check, "MintAuthorityLive");
    expectError(await program(), "MintAuthorityLive");
  });

  test("row 10: an id already open is refused; the box's guard reuses ids, the program refuses a repeat", async () => {
    const w = await openingWorld();
    const { args } = await openedCampaign(w, w.creator);
    const { check, program } = await boxThenProgram(w, w.creator, PRICE_DRAFT, args.id);
    expectBoxRefusal(check, "AlreadyInitialized");
    expectError(await program(), "AlreadyInitialized");
  });

  test("row 8: terms changed after the preview, and row 7: the price moved past max_lamports", async () => {
    const w = await openingWorld();
    const terms = await boxThenProgram(w, w.creator, PRICE_DRAFT);
    const args = terms.check.args as OpenArgs;
    expect(terms.check.verdict?.ok).toBe(true);
    expectOk(await send(w, [await I.setCreationParamsIx(w.admin, { ...DEFAULT_PARAMS, creator_share_bps: 40 })]));
    expectError(await terms.program(), "CreationParamsChanged");
    const changed = await sdkNow(terms.rpc, w.creator, args);
    expect(changed.ok ? null : changed.refusal.errorName).toBe("CreationParamsChanged");
    expect(refusalCopy("CreationParamsChanged").place).toBe("after");

    const moved = await boxThenProgram(w, w.creator, PRICE_DRAFT);
    expect(moved.check.verdict?.ok).toBe(true);
    // SOL/USD 2% lower: the same US$500 needs about 2% more lamports, past the quote's 1% margin.
    setPriceAccount(w.client, P.SOL_USD_ACCOUNT, "pyth-sol-usd-devnet", { price: (SOL_PRICE * 98n) / 100n });
    expectError(await moved.program(), "OpeningAboveMaxLamports");
    const late = await sdkNow(moved.rpc, w.creator, moved.check.args as OpenArgs);
    expect(late.ok ? null : late.refusal.errorName).toBe("OpeningAboveMaxLamports");
    expect(refusalCopy("OpeningAboveMaxLamports").place).toBe("after");
  });
});
