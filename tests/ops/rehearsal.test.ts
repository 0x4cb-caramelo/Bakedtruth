/**
 * Purpose: the devnet rehearsal's two scripts run against the program in LiteSVM behind the recording RPC before the
 *          founder runs them on devnet (Sprint 12): `open-paid` opens a paid campaign from a non-team wallet at the
 *          SDK's quote, refuses a team key, and without --yes sends nothing; `settle-steps` takes a resolved campaign
 *          through tally, finalize (not before the window ends), entries, share, prize, fee and close, each step
 *          saying when it is not due, and every baker receives what the SDK said it was owed.
 *          Filter: `bun test tests/ -t "rehearsal scripts"`.
 * Version: 0.1.0
 * Sprint:  12 (site: my entries and campaign states)
 */
import { afterEach, describe, expect, test } from "bun:test";

import { decodeCampaign, decodeEntry, entryAddress, entryOwed, Side, Status } from "@brot/sdk/read";

import { openPaid } from "../../scripts/rehearsal/open-paid";
import { runStep } from "../../scripts/rehearsal/settle-steps";
import { connect } from "../../scripts/validator/rpc";
import { openingWorld } from "../brot/opening";
import * as P from "../brot/program";
import { balance, fundedWallet, setTime } from "../brot/setup";
import { runCycle, SOL, type Cycle } from "../site/cycle-run";
import { startFakeChain, type FakeChain } from "../site/fake-chain";
import { rawOf } from "../site/support";

let chain: FakeChain | null = null;
let run: Cycle | null = null;
afterEach(() => (chain?.close(), run?.chain.close()));

describe("rehearsal scripts", () => {
  test("a paid opening from a non-team wallet, previewed first; a team key is refused", async () => {
    const w = await openingWorld();
    chain = startFakeChain(w);
    const rpc = connect(chain.url);
    const spec = {
      kind: "PriceTouch",
      feed: "BTC/USD",
      direction: "above",
      target: "9400000000000",
      deadline: "+7d",
    } as const;
    const dry = await openPaid({ rpc, signer: w.creator, yes: false }, spec);
    expect(dry.sent).toBeNull();
    expect(w.client.svm.getAccount(dry.campaign).exists).toBe(false);
    const opened = await openPaid({ rpc, signer: w.creator, yes: true }, spec);
    const c = decodeCampaign(rawOf(w, opened.campaign));
    expect(c.creatorIsTeam).toBe(false);
    expect(c.prizeLamports).toBeGreaterThan(0n);
    expect(c.creatorShareBps).toBe(100);
    await expect(openPaid({ rpc, signer: w.team, yes: true }, spec)).rejects.toThrow("is a team key");
  });

  test("one campaign settled step by step: each step when due, each baker paid what the SDK said", async () => {
    const w = await openingWorld();
    run = await runCycle(
      w,
      ([ana, bruno, carla]) => [
        { who: ana, side: Side.Yes, amount: SOL / 2n },
        { who: bruno, side: Side.No, amount: SOL / 4n },
        { who: carla, side: Side.No, amount: SOL / 5n },
      ],
      { how: "no", stopAt: "review" },
    );
    const payer = await fundedWallet(w);
    const ctx = { rpc: connect(run.chain.url), signer: payer, yes: true };
    const { campaign } = run;
    expect(await runStep(ctx, campaign, "status")).toBeNull();
    expect(await runStep(ctx, campaign, "entries")).toBeNull(); // not due in review
    expect((await runStep(ctx, campaign, "tally"))?.sent?.ok).toBe(true);
    expect(await runStep(ctx, campaign, "tally")).toBeNull(); // every join tallied
    expect(await runStep(ctx, campaign, "finalize")).toBeNull(); // the window has not ended
    setTime(w.client, decodeCampaign(rawOf(w, campaign)).reviewEndsAt + 1n);
    expect((await runStep(ctx, campaign, "finalize"))?.sent?.ok).toBe(true);
    const settling = decodeCampaign(rawOf(w, campaign));
    const owed = new Map<string, bigint>();
    for (const b of run.bakers) {
      const entry = decodeEntry(rawOf(w, await entryAddress(campaign, b.address)));
      owed.set(b.address, entryOwed(settling, entry).amount + balance(w, await entryAddress(campaign, b.address)));
    }
    const before = new Map(run.bakers.map((b) => [b.address, balance(w, b.address)]));
    for (const step of ["entries", "share", "prize", "fee"])
      expect((await runStep(ctx, campaign, step))?.sent?.ok).toBe(true);
    for (const b of run.bakers) expect(balance(w, b.address) - before.get(b.address)!).toBe(owed.get(b.address)!);
    expect(decodeCampaign(rawOf(w, campaign)).status).toBe(Status.Settled);
    expect((await runStep(ctx, campaign, "close"))?.sent?.ok).toBe(true);
    expect(w.client.svm.getAccount(campaign).exists).toBe(false);
    expect(balance(w, payer.address)).toBeLessThan(100n * P.SOL);
  });
});
