/**
 * Purpose: the rows of "My entries" through a whole cycle, read the way the page reads them (the chain behind the
 *          recording RPC, the wallet's history): while settling, each entry is waiting for its exact payout and the
 *          creator's 1% is due; after every payout and the close, each row says what was received, from the events
 *          alone, and the campaign shows as closed; a campaign the wallet never touched is not a row.
 *          Filter: `bun test tests/ -t "my entries rows"`.
 * Version: 0.1.0
 * Sprint:  12 (site: my entries and campaign states)
 */
import { afterEach, describe, expect, test } from "bun:test";
import { createSolanaRpc } from "@solana/kit";

import { campaignAddress, decodeCampaign, decodeEntry, entryAddress, entryOwed, Side } from "@brot/sdk/read";
import { buildSettleEntry } from "@brot/sdk/tx";

import { campaignClosed } from "../../app/features/campaign-page/load";
import { readEntrySettlement, readWalletHistory } from "../../app/features/my-entries/history";
import { loadMyEntries } from "../../app/features/my-entries/load";
import { myEntries } from "../../app/features/my-entries/model";
import { openingWorld } from "../brot/opening";
import { injectCampaign } from "../brot/campaigns";
import { newId } from "../brot/flows";
import * as P from "../brot/program";
import { fundedWallet, now } from "../brot/setup";
import { landVia, settleVia, transferIx } from "./cycle";
import { runCycle, SOL, type Cycle } from "./cycle-run";
import { rawOf } from "./support";

let run: Cycle | null = null;
afterEach(() => run?.chain.close());

describe("my entries rows", () => {
  test("waiting for an exact payout, then received from the events once the campaign is closed", async () => {
    const w = await openingWorld();
    run = await runCycle(
      w,
      ([ana, bruno, carla]) => [
        { who: ana, side: Side.Yes, amount: SOL / 2n },
        { who: bruno, side: Side.No, amount: (3n * SOL) / 10n },
        { who: carla, side: Side.No, amount: SOL / 5n },
      ],
      { how: "no", stopAt: "settling" },
    );
    const { chain, campaign, keeper, bakers } = run;
    const rpc = createSolanaRpc(chain.url);
    // An unrelated campaign in the list, as the read API lists every campaign.
    const t = now(w.client);
    const other = (
      await injectCampaign(w.client, {
        id: newId(),
        kind: P.ReaderKind.SupplyAtMost,
        metric: keeper.address,
        target: 1n,
        creator: keeper.address,
        opensAt: t - P.DAY,
        entriesCloseAt: t + P.DAY,
        deadlineAt: t + 2n * P.DAY,
      })
    ).campaign;
    const view = async (wallet: string) => {
      const history = await readWalletHistory(rpc, wallet);
      return myEntries(wallet, await loadMyEntries(rpc, wallet, [campaign, other]), history.events);
    };

    const c = decodeCampaign(rawOf(w, campaign));
    for (const b of bakers) {
      const owed = entryOwed(c, decodeEntry(rawOf(w, await entryAddress(campaign, b.address)))).amount;
      const summary = await view(b.address);
      expect(summary.rows.map((r) => r.campaign)).toEqual([campaign]);
      expect(summary.rows[0]).toMatchObject({ state: "paid", payout: { kind: "owed", amount: owed }, pending: true });
      expect(summary.waiting).toBe(owed);
      expect(summary.received).toBe(0n);
    }
    const asCreator = await view(w.creator.address);
    expect(asCreator.rows[0]).toMatchObject({
      isCreator: true,
      opener: { share: { status: "due", amount: c.creatorShare } },
    });
    expect(asCreator.rows[0].title).toStartWith("BTC/USD reaches");

    const settled = await settleVia(
      w,
      chain,
      keeper,
      campaign,
      bakers.map((b) => b.address),
    );
    await landVia(chain, keeper, [await settled.close()]);
    let total = 0n;
    for (const b of bakers) {
      const summary = await view(b.address);
      const row = summary.rows[0];
      expect(row.state).toBe("closedAccount");
      expect(row.payout.kind).toBe("received");
      expect(summary.waiting).toBe(0n);
      expect(summary.received).toBe(row.received.asBaker);
      total += summary.received;
    }
    expect(total).toBeGreaterThan(0n);
    const after = await view(w.creator.address);
    expect(after.rows[0]).toMatchObject({ state: "closedAccount", id: run.id.toString() });
    expect(after.received).toBe(c.creatorShare);
  });

  test("a refresh after a burst of transactions pages back until it meets what was read (security review M2)", async () => {
    const w = await openingWorld();
    run = await runCycle(
      w,
      ([ana, bruno]) => [
        { who: ana, side: Side.Yes, amount: SOL / 2n },
        { who: bruno, side: Side.No, amount: SOL / 4n },
      ],
      { how: "no", stopAt: "settling" },
    );
    const { chain, campaign, keeper } = run;
    const [ana] = run.bakers;
    const rpc = createSolanaRpc(chain.url);
    const first = await readWalletHistory(rpc, ana.address, undefined, { limit: 5 });
    expect(first.before).toBeNull(); // the join and the tally: the whole history
    await landVia(chain, keeper, [await buildSettleEntry({ campaign, baker: ana.address })]);
    for (let n = 1n; n <= 12n; n++) await landVia(chain, keeper, [transferIx(keeper, ana.address, n)]);
    const refreshed = await readWalletHistory(rpc, ana.address, first, { limit: 5, newest: true });
    expect(refreshed.events.some((e) => e.name === "EntrySettled")).toBe(true);
    expect(refreshed.before).toBeNull();
    // Past the bound, the coverage says where it ends instead of claiming the whole history.
    const small = await readWalletHistory(rpc, ana.address, undefined, { limit: 1 });
    for (let n = 13n; n <= 25n; n++) await landVia(chain, keeper, [transferIx(keeper, ana.address, n)]);
    const cut = await readWalletHistory(rpc, ana.address, small, { limit: 1, newest: true });
    expect(cut.before).not.toBeNull();
    expect(cut.before).not.toBe(small.before);
  });

  test("a stranger's transfer to an address proves no entry and no closed campaign (security review L1)", async () => {
    const w = await openingWorld();
    run = await runCycle(w, ([ana]) => [{ who: ana, side: Side.Yes, amount: SOL / 2n }], {
      how: "no",
      stopAt: "review",
    });
    const { chain, campaign, keeper } = run;
    const rpc = createSolanaRpc(chain.url);
    const stranger = await fundedWallet(w);
    await landVia(chain, keeper, [transferIx(keeper, await entryAddress(campaign, stranger.address), 1_000_000n)]);
    expect(await readEntrySettlement(rpc, campaign, stranger.address)).toEqual({ event: null, touched: false });
    expect((await readEntrySettlement(rpc, campaign, run.bakers[0].address)).touched).toBe(true);
    const never = newId();
    await landVia(chain, keeper, [transferIx(keeper, await campaignAddress(never), 2_000_000n)]);
    expect(await campaignClosed(rpc, never)).toBe(false);
  });
});
