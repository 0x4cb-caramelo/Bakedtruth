/**
 * Purpose: the dispute's worst case on the binary (Sprint 14, lane L14B; BP v0.0.4 part 1 section 4.5; TP 3.4.7): a
 *          paid price campaign with two entries resolves NO at t0; a team key contests in the window's last second;
 *          the re-read at the end of stage 1 reads a newer price (a different reading) and opens stage 2; nobody
 *          decides; the lapse finalizes with the stored result, and the winner is paid at t0 + 55 h at the latest,
 *          while one second earlier both the lapse and the payout are refused. Every event of the campaign's life,
 *          decoded through the SDK, carries the next `seq`. Filter: `bun test tests/ -t "contest worst case"`.
 * Version: 0.1.0
 * Sprint:  14 (lane L14B). Needs target/deploy/brot_markets.so.
 */
import { describe, expect, test } from "bun:test";

import { buildFinalizeCampaign, buildSettleEntry, buildTallyLateJoins } from "@brot/sdk/tx";

import * as C from "./contest-support";
import { BTC_PRICE, initConfig, join, openedCampaign, readCampaign, setTeam } from "./flows";
import * as P from "./program";
import { resolveWith } from "./price-support";
import {
  balance,
  createWorld,
  expectError,
  expectOk,
  fundedWallet,
  now,
  send,
  setPriceAccount,
  setTime,
  type Event,
  type World,
} from "./setup";

const REVIEW = 6n * C.HOUR;
const FIFTY_FIVE_HOURS = 55n * C.HOUR;

/** The sponsored BTC/USD account at `price`, published at `publishTime`, posted in the current slot. */
function btc(w: World, price: bigint, publishTime: bigint) {
  const postedSlot = w.client.svm.getClock().slot;
  setPriceAccount(w.client, P.BTC_USD_ACCOUNT, "pyth-btc-usd-devnet", { price, conf: 0n, publishTime, postedSlot });
}

describe("contest worst case", () => {
  test("contest worst case is 55 hours: resolution to payout, and refused one second earlier", async () => {
    const w = await createWorld();
    const { admin } = await initConfig(w);
    const [team] = await setTeam(w, admin, 1);
    const [creator, ana, bruno] = [await fundedWallet(w), await fundedWallet(w), await fundedWallet(w)];
    const events: Event[] = [];
    const record = (sent: Awaited<ReturnType<typeof send>>) => events.push(...expectOk(sent).events);

    const opened = await openedCampaign(w, creator);
    record(opened.sent);
    const { campaign } = opened;
    btc(w, BTC_PRICE, now(w.client) - 5n);
    record(await join(w, ana, campaign, { side: P.Side.Yes, amount: 2n * P.SOL }));
    record(await join(w, bruno, campaign, { side: P.Side.No, amount: P.SOL }));

    // t0: after the deadline's proof window the sponsored account decides; its last update, ten seconds before the
    // deadline, is below the target: NO.
    const deadline = readCampaign(w, campaign).deadline_at as bigint;
    const t0 = deadline + P.PROOF_DELAY_SECONDS + 1n;
    setTime(w.client, t0);
    btc(w, BTC_PRICE, deadline - 10n);
    record(await resolveWith(w, campaign));
    for (const baker of [ana, bruno]) {
      record(await send(w, [await buildTallyLateJoins({ campaign, baker: baker.address, from: 0, to: 1 })]));
    }

    // The contest in the window's last second; the re-read at the end of stage 1, after a newer update.
    setTime(w.client, t0 + REVIEW - 1n);
    const c = { campaign, vault: opened.vault, metric: P.BTC_USD_ACCOUNT };
    const cw = { w, admin, team, outsider: creator, config: await P.configPda() };
    record(await C.openContest(cw, c));
    const rereadAt = t0 + REVIEW - 1n + C.STAGE1_SECONDS;
    setTime(w.client, rereadAt);
    btc(w, BTC_PRICE + 1n, rereadAt - 5n);
    record(await C.reread(cw, c));
    const stage2Ends = rereadAt + C.STAGE2_SECONDS;
    expect(readCampaign(w, campaign)).toMatchObject({ status: P.Status.Contested, contest_ends_at: stage2Ends });

    // Nobody decides. One second before the lapse nothing pays; at the lapse the stored NO stands and Bruno is paid.
    const finalize = await buildFinalizeCampaign({ campaign });
    const settleBruno = await buildSettleEntry({ campaign, baker: bruno.address });
    setTime(w.client, stage2Ends - 1n);
    expectError(await send(w, [finalize]), "ContestNotLapsed");
    expectError(await send(w, [settleBruno]), "NotFinalized");
    setTime(w.client, stage2Ends);
    record(await send(w, [finalize]));
    expect(readCampaign(w, campaign)).toMatchObject({ status: P.Status.Settling, outcome: P.Outcome.No });
    const before = balance(w, bruno.address);
    record(await send(w, [settleBruno]));
    expect(balance(w, bruno.address) - before).toBeGreaterThan(P.SOL); // his entry back and a share of the losers'

    const paidAt = now(w.client);
    expect(paidAt - t0).toBe(FIFTY_FIVE_HOURS - 1n);
    expect(paidAt <= t0 + FIFTY_FIVE_HOURS).toBe(true);
    // Every event of the campaign's life, from its opening to the payout, takes the next number.
    const mine = events.filter((e) => e.data.campaign === campaign);
    expect(mine.map((e) => e.data.seq)).toEqual(mine.map((_, i) => BigInt(i)));
    expect(mine.map((e) => e.name)).toEqual([
      "CampaignOpened",
      "EntryAdded",
      "EntryAdded",
      "CampaignResolved",
      "LateTallied",
      "LateTallied",
      "ContestOpened",
      "CampaignReread",
      "CampaignFinalized",
      "EntrySettled",
    ]);
  });
});
