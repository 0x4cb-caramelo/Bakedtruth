/**
 * Purpose: the read API's leaderboard against the program in LiteSVM behind the recording RPC (Sprint 13 DoD: the
 *          leaderboard shows the points of `/api/v1/leaderboard`): whole campaign cycles through the SDK's builders,
 *          the program's history read by services/api/src/history.ts, and the route's answer. A result in its review
 *          window scores nothing; once the window has passed it is final; a settling campaign scores; a closed one
 *          still scores from its events. A refresh reads only the new transactions.
 *          Filter: `bun test tests/ -t "leaderboard from the program's events"`.
 * Version: 0.1.0
 * Sprint:  13 (site: ranking, notices and copy)
 */
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { createSolanaRpc, type Address, type KeyPairSigner } from "@solana/kit";

import { decodeCampaign, PROGRAM_ID, publicState, readChainTime, Side } from "@brot/sdk/read";

import { createHistory, type History } from "../../services/api/src/history";
import { createHandler } from "../../services/api/src/routes";
import type { Snapshot } from "../../services/api/src/snapshot";
import type { Store } from "../../services/api/src/store";
import { openingWorld, type OpeningWorld } from "../brot/opening";
import * as P from "../brot/program";
import { setPriceAccount } from "../brot/setup";
import { runCycle, SOL } from "../site/cycle-run";
import { startFakeChain, type FakeChain } from "../site/fake-chain";
import { rawOf } from "../site/support";

let w: OpeningWorld;
let chain: FakeChain;
let history: History;
const campaigns: Address[] = [];
let first: KeyPairSigner[] = [];
let second: KeyPairSigner[] = [];

beforeAll(async () => {
  w = await openingWorld();
  chain = startFakeChain(w);
  history = createHistory(createSolanaRpc(chain.url), { perRefresh: 1_000 });
});
afterAll(() => chain.close());

/** A later cycle opens a paid campaign after the clock moved: both price accounts are written fresh again. */
function freshPrices() {
  const publishTime = w.client.svm.getClock().unixTimestamp - 5n;
  setPriceAccount(w.client, P.SOL_USD_ACCOUNT, "pyth-sol-usd-devnet", { publishTime });
  setPriceAccount(w.client, P.BTC_USD_ACCOUNT, "pyth-btc-usd-devnet", { publishTime });
}

/** The API's snapshot of the campaigns that still have an account, read the way the API reads them. */
async function snapshot(): Promise<Snapshot> {
  const time = await readChainTime(createSolanaRpc(chain.url));
  const rows = campaigns
    .filter((at) => w.client.svm.getAccount(at).exists)
    .map((address) => {
      const campaign = decodeCampaign(rawOf(w, address));
      return { address, campaign, view: publicState(campaign, time) };
    });
  return { takenAt: "test", asOfSlot: time.slot, chain: time, rows } as Snapshot;
}

async function board(query = "") {
  const snap = await snapshot();
  const store: Store = { current: () => snap, lastError: () => null, refresh: async () => {} };
  const handle = createHandler(store, { corsOrigin: "*", cluster: "local", history });
  const response = await handle(new Request(`http://api.test/api/v1/leaderboard${query}`));
  return { status: response.status, body: (await response.json()) as any };
}

const points = (body: any, wallet: string) => body.rows.find((r: any) => r.wallet === wallet)?.points ?? 0;

describe("leaderboard from the program's events", () => {
  test("before the first history read the route says it is starting", async () => {
    expect((await board()).status).toBe(503);
  });

  test("a NO still in its review window scores nothing; its bakers have entered", async () => {
    const cycle = await runCycle(
      w,
      (b) => [
        { who: b[0], side: Side.Yes, amount: SOL },
        { who: b[1], side: Side.No, amount: SOL },
      ],
      { how: "no", stopAt: "review", chain },
    );
    campaigns.push(cycle.campaign);
    first = cycle.bakers;
    await history.refresh();
    const { status, body } = await board();
    expect(status).toBe(200);
    expect(body.complete).toBe(true);
    expect(body.total).toBe(0);
    expect(body.rows).toEqual([]);
  });

  test("settling scores the side that won; the earlier window has passed, so its result is final too", async () => {
    freshPrices();
    const listed = async () => createSolanaRpc(chain.url).getSignaturesForAddress(PROGRAM_ID).send();
    const known = (await listed()).length;
    const cycle = await runCycle(
      w,
      (b) => [
        { who: b[0], side: Side.Yes, amount: SOL },
        { who: b[1], side: Side.No, amount: SOL },
        { who: b[2], side: Side.No, amount: SOL / 50n },
        { who: b[2], side: Side.Yes, amount: SOL / 100n },
      ],
      { how: "no", stopAt: "settling", chain },
    );
    campaigns.push(cycle.campaign);
    second = cycle.bakers;
    const all = await listed();
    const fresh = all.slice(0, all.length - known).filter((s) => s.err === null).length;
    const before = chain.methods.filter((m) => m === "getTransaction").length;
    await history.refresh();
    // Exactly this cycle's landed transactions are read: never the first cycle's again.
    expect(chain.methods.filter((m) => m === "getTransaction").length - before).toBe(fresh);
    expect(fresh).toBeGreaterThan(5);
    const { body } = await board();
    expect(points(body, first[1].address)).toBe(1); // the first campaign's window ended while this one ran
    expect(points(body, first[0].address)).toBe(0);
    expect(points(body, second[1].address)).toBe(1);
    expect(points(body, second[2].address)).toBe(1); // both sides: Q7 read literally
    expect(points(body, second[0].address)).toBe(0);
    expect(body.rows.every((r: any) => r.points > 0)).toBe(true);
    expect(Object.keys(body.rows[0]).sort()).toEqual(["entered", "points", "rank", "wallet"]); // no success rate
  });

  test("a campaign closed after its payouts still scores, from its events alone", async () => {
    freshPrices();
    const cycle = await runCycle(
      w,
      (b) => [
        { who: b[1], side: Side.No, amount: SOL },
        { who: b[0], side: Side.Yes, amount: SOL },
      ],
      {
        how: "no",
        stopAt: "closed",
        chain,
        bakers: second,
      },
    );
    campaigns.push(cycle.campaign);
    expect(w.client.svm.getAccount(cycle.campaign).exists).toBe(false);
    await history.refresh();
    const { body } = await board("?limit=1");
    expect(body.rows).toEqual([{ rank: 1, wallet: second[1].address, points: 2, entered: 2 }]);
    expect(body.total).toBe(3);
    const signatures = await createSolanaRpc(chain.url).getSignaturesForAddress(PROGRAM_ID).send();
    expect(signatures.length).toBeGreaterThan(10);
  });

  test("an unknown parameter is a 400, never a guess; the route takes no wallet", async () => {
    expect((await board("?sort=points")).status).toBe(400);
    expect((await board(`?wallet=${second[1].address}`)).status).toBe(400);
    expect((await board("?limit=0")).status).toBe(400);
  });
});
