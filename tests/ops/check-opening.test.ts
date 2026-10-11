/**
 * Purpose: scripts/team/check-opening.ts, the read-only check of an opening the founder runs on devnet (Sprint 19 DoD;
 *          I14): on campaigns the program opened in LiteSVM, a paid opening's stored charge equals the quote's formula at
 *          the stored price, split 90/10; a team key's free opening holds nothing; and a campaign whose stored charge
 *          differs from the formula is reported, never passed. Filter: `bun test tests/ -t "check an opening"`.
 * Version: 0.1.0
 * Sprint:  19 (site: open a campaign)
 */
import { describe, expect, test } from "bun:test";

import { campaignAddress, decodeCampaign } from "@brot/sdk/read";

import { checkOpening } from "../../scripts/team/check-opening";
import { openedCampaign } from "../brot/flows";
import { FREE, openingWorld } from "../brot/opening";
import { rawOf } from "../site/support";

describe("check an opening", () => {
  test("a paid opening matches the formula; a free one holds nothing; a changed charge is reported", async () => {
    const w = await openingWorld();
    const paid = await openedCampaign(w, w.creator);
    const stored = decodeCampaign(rawOf(w, await campaignAddress(paid.args.id)));
    const ok = checkOpening(stored, 9_000);
    expect(ok.ok).toBe(true);
    expect(ok.lines.filter((l) => l.endsWith("✓"))).toHaveLength(3);

    const free = await openedCampaign(w, w.team, FREE);
    expect(checkOpening(decodeCampaign(rawOf(w, await campaignAddress(free.args.id))), 9_000).ok).toBe(true);

    const off = checkOpening({ ...stored, openingPaidLamports: stored.openingPaidLamports + 1n }, 9_000);
    expect(off.ok).toBe(false);
    expect(off.lines.some((l) => l.includes("DIFFERS"))).toBe(true);
  });
});
