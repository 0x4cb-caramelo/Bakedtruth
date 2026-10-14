/**
 * Purpose: what "my entries" says a wallet received equals the program's settlement events for that wallet, and the
 *          SOL that actually reached it (Sprint 12 DoD), on whole cycles run through the program in LiteSVM behind
 *          the recording RPC: a paid campaign resolved NO with a Split (winners, a loser, the creator's 1%), a
 *          one-sided pot (refunds less 1% but the first, the prize back), and a stale-feed void (every entry back in
 *          full, the prize back, the opening fee kept). The history is read the way the page reads it.
 *          Filter: `bun test tests/ -t "received on screen matches settlement events"`.
 * Version: 0.1.0
 * Sprint:  12 (site: my entries and campaign states)
 */
import { afterEach, describe, expect, test } from "bun:test";
import { createSolanaRpc, type KeyPairSigner } from "@solana/kit";

import {
  decodeCampaign,
  decodeTransactionEvents,
  Side,
  type RpcTransaction,
  MAX_TRANSACTION_VERSION,
} from "@brot/sdk/read";
import { buildCloseCampaign } from "@brot/sdk/tx";

import { sharesPaidAtClose } from "../../app/features/my-entries/close-share";
import { readWalletHistory } from "../../app/features/my-entries/history";
import { putBy, receivedBy, totalOf } from "../../app/features/my-entries/received";
import { openingWorld, type OpeningWorld } from "../brot/opening";
import { landVia } from "./cycle";
import { runCycle, SOL, type Bet, type Cycle } from "./cycle-run";
import type { FakeChain } from "./fake-chain";
import { rawOf } from "./support";

let run: Cycle | null = null;
afterEach(() => run?.chain.close());

/** A whole cycle, every payout sent and the campaign closed. */
async function cycle(w: OpeningWorld, how: "no" | "stale", bets: (bakers: KeyPairSigner[]) => Bet[]) {
  run = await runCycle(w, bets, { how, stopAt: "closed" });
  return run;
}

/** Every event of the recorded transactions, decoded once: the oracle the page's history must agree with. */
async function allEvents(c: FakeChain, addresses: string[]) {
  const rpc = createSolanaRpc(c.url);
  const seen = new Set<string>();
  const events = [];
  for (const at of addresses) {
    for (const s of await rpc.getSignaturesForAddress(at as never).send()) {
      if (seen.has(s.signature)) continue;
      seen.add(s.signature);
      const tx = await rpc
        .getTransaction(s.signature, { encoding: "json", maxSupportedTransactionVersion: MAX_TRANSACTION_VERSION })
        .send();
      events.push(...decodeTransactionEvents(tx as unknown as RpcTransaction));
    }
  }
  return events;
}

const sumOf = (events: Awaited<ReturnType<typeof allEvents>>, wallet: string) =>
  events.reduce(
    (sum, e) =>
      sum +
      (e.name === "EntrySettled" && e.data.baker === wallet ? e.data.amount : 0n) +
      (e.name === "CreatorShareSettled" && e.data.creator === wallet ? e.data.amount : 0n) +
      (e.name === "PrizeSettled" && e.data.recipient === wallet
        ? e.data.prizeReturned + e.data.openingFeeReturned
        : 0n),
    0n,
  );

describe("received on screen matches settlement events", () => {
  test("a Split: the winners' payouts, the loser's zero and the creator's 1%, as the events and the balances say", async () => {
    const w = await openingWorld();
    const run = await cycle(w, "no", ([ana, bruno, carla]) => [
      { who: ana, side: Side.Yes, amount: SOL / 2n },
      { who: bruno, side: Side.No, amount: (3n * SOL) / 10n },
      { who: carla, side: Side.No, amount: SOL / 5n },
      { who: carla, side: Side.No, amount: SOL / 10n },
    ]);
    const rpc = createSolanaRpc(run.chain.url);
    const oracle = await allEvents(run.chain, [run.campaign]);
    for (const baker of run.bakers) {
      const history = await readWalletHistory(rpc, baker.address);
      const mine = receivedBy(baker.address, history.events);
      const onCampaign = mine.byCampaign.get(run.campaign)!;
      expect(mine.total).toBe(sumOf(oracle, baker.address));
      // The SOL that reached the wallet: the payout, plus the deposit the Entry held (its rent and its joins').
      expect(run.delta(baker.address)).toBe(onCampaign.asBaker + run.deposit(baker.address));
      expect(onCampaign.entrySettled).toBe(true);
    }
    const ana = receivedBy(run.bakers[0].address, (await readWalletHistory(rpc, run.bakers[0].address)).events);
    expect(ana.total).toBe(0n);
    const carla = await readWalletHistory(rpc, run.bakers[2].address);
    expect(putBy(run.bakers[2].address, carla.events).get(run.campaign)).toEqual({ yes: 0n, no: (3n * SOL) / 10n });
    const creator = receivedBy(w.creator.address, (await readWalletHistory(rpc, w.creator.address)).events);
    const share = creator.byCampaign.get(run.campaign)!;
    expect(share.asCreator).toBeGreaterThan(0n);
    expect(share.prize + share.openingFee).toBe(0n);
    expect(creator.total).toBe(sumOf(oracle, w.creator.address));
    expect(run.delta(w.creator.address)).toBeGreaterThanOrEqual(share.asCreator);
  });

  test("a one-sided pot: refunds less 1% but the first baker's, the prize back to whoever opened", async () => {
    const w = await openingWorld();
    const run = await cycle(w, "no", ([ana, bruno]) => [
      { who: ana, side: Side.Yes, amount: SOL / 2n },
      { who: bruno, side: Side.Yes, amount: SOL / 4n },
    ]);
    const rpc = createSolanaRpc(run.chain.url);
    const [ana, bruno] = run.bakers;
    const got = async (who: KeyPairSigner) =>
      receivedBy(who.address, (await readWalletHistory(rpc, who.address)).events).byCampaign.get(run.campaign)!;
    expect((await got(ana)).asBaker).toBe(SOL / 2n);
    expect((await got(bruno)).asBaker).toBe(SOL / 4n - SOL / 4n / 100n);
    const opener = await got(w.creator);
    expect(opener.prize).toBeGreaterThan(0n);
    expect(opener.openingFee).toBe(0n);
    expect(opener.asCreator).toBe(0n);
    expect(totalOf(opener)).toBe(sumOf(await allEvents(run.chain, [run.campaign]), w.creator.address));
  });

  test("a stale-feed void: every entry back in full, the prize back, the opening fee kept", async () => {
    const w = await openingWorld();
    const run = await cycle(w, "stale", ([ana, bruno]) => [
      { who: ana, side: Side.Yes, amount: SOL / 2n },
      { who: bruno, side: Side.No, amount: SOL / 4n },
    ]);
    const rpc = createSolanaRpc(run.chain.url);
    for (const bet of run.placed) {
      const mine = receivedBy(bet.who.address, (await readWalletHistory(rpc, bet.who.address)).events);
      expect(mine.byCampaign.get(run.campaign)!.asBaker).toBe(bet.amount);
    }
    const opener = receivedBy(w.creator.address, (await readWalletHistory(rpc, w.creator.address)).events);
    const back = opener.byCampaign.get(run.campaign)!;
    expect(back.prize).toBeGreaterThan(0n);
    expect(back.openingFee).toBe(0n);
  });

  test("a history read in small pages finds the same events as one read", async () => {
    const w = await openingWorld();
    const run = await cycle(w, "no", ([ana, bruno]) => [
      { who: ana, side: Side.Yes, amount: SOL / 2n },
      { who: bruno, side: Side.No, amount: SOL / 4n },
    ]);
    const rpc = createSolanaRpc(run.chain.url);
    const whole = await readWalletHistory(rpc, w.creator.address);
    let paged = await readWalletHistory(rpc, w.creator.address, undefined, { limit: 1 });
    while (paged.before) paged = await readWalletHistory(rpc, w.creator.address, paged, { limit: 1 });
    expect(paged.events.map((e) => e.name)).toEqual(whole.events.map((e) => e.name));
    expect(receivedBy(w.creator.address, paged.events).total).toBe(receivedBy(w.creator.address, whole.events).total);
  });

  test("a reserved creator share paid by the campaign's close counts as received (security review M1)", async () => {
    const w = await openingWorld();
    run = await runCycle(
      w,
      ([ana, bruno]) => [
        { who: ana, side: Side.Yes, amount: 10_000_000n },
        { who: bruno, side: Side.No, amount: 10_000_000n },
      ],
      { how: "no", stopAt: "closed", emptyCreator: true },
    );
    const rpc = createSolanaRpc(run.chain.url);
    const reserved = decodeCampaign(rawOf(w, run.campaign)).creatorShareReserved;
    expect(reserved).toBeGreaterThan(0n);
    const close = await buildCloseCampaign({ campaign: run.campaign, rentPayer: w.creator.address });
    const sig = await landVia(run.chain, run.keeper, [close]);
    const tx = await rpc
      .getTransaction(sig as never, { encoding: "json", maxSupportedTransactionVersion: MAX_TRANSACTION_VERSION })
      .send();
    const closed = decodeTransactionEvents(tx as unknown as RpcTransaction).find((e) => e.name === "CampaignClosed")!;
    const history = await readWalletHistory(rpc, w.creator.address);
    const atClose = await sharesPaidAtClose(rpc, w.creator.address, history.events);
    expect(atClose.get(run.campaign)).toBe(reserved);
    const got = receivedBy(w.creator.address, history.events, atClose);
    expect(got.byCampaign.get(run.campaign)).toMatchObject({ asCreator: reserved, shareAtClose: true });
    // The SOL that reached the creator: the reserve and the rents the event names.
    const rents = closed.name === "CampaignClosed" ? closed.data.rentReturned : 0n;
    expect(run.delta(w.creator.address)).toBe(reserved + rents);
  });
});
