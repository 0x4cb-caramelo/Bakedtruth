/**
 * Purpose: the two epoch kinds through the program in LiteSVM, on the captured JitoSOL pool and
 *          mainnet vote account: the stake pool opening at its edges, resolution with the clock
 *          and the pool's snapshot edited in memory, the vote account's owner and layout refusals,
 *          and the join lock at the measured epoch's start.
 * Version: 0.0.3
 * Sprint:  03 (readers and resolution), lane B. Needs the SBF build: runs from the integration on.
 */
import { describe, expect, test } from "bun:test";
import { address, type Address } from "@solana/kit";

import { injectCampaign } from "./campaigns";
import type { BrotErrorName } from "./errors";
import { DEFAULT_PARAMS, initConfig, join, newId, readCampaign, setTeam } from "./flows";
import * as I from "./instructions";
import * as P from "./program";
import { FIXTURES, STAKE_POOL_OFFSETS as AT, fixtureBytes, setClock, setFixture } from "./readers";
import { setMainnetEpochSchedule as mainnetSchedule, setRawAccount } from "./readers";
import { createWorld, expectError, expectOk, fundedWallet, now, send, type World } from "./setup";

const [JITO, VOTE] = ["stakepool-jitosol", "vote-mainnet-top"];
const [pool, vote] = [address(FIXTURES[JITO]!.address), address(FIXTURES[VOTE]!.address)];
/** The epoch of the pool's last update when captured: the clock's epoch at opening. */
const UPDATED = 1_047n;
const E = UPDATED + 1n;
const view = new DataView(fixtureBytes(JITO).buffer);
const [total, snapshot] = [
  view.getBigUint64(AT.totalLamports, true),
  view.getBigUint64(AT.lastEpochTotalLamports, true),
];
const HIGH = total > snapshot ? total : snapshot;
/** 2% above the higher total: past the 1% minimum distance, so the opening accepts it. */
const GOAL = HIGH + HIGH / 50n;
const { Yes, No, Void } = P.Outcome;
const { None, MissedWindow, UnreadableAccount } = P.VoidReason;

/** The clock 100,000 slots into `epoch` on mainnet's schedule, at `unixTimestamp` if given. */
const clockAt = (w: World, epoch: bigint, unixTimestamp?: bigint) =>
  setClock(w.client, { epoch, slot: epoch * 432_000n + 100_000n, unixTimestamp });

type PoolState = { epoch?: bigint; snapshot?: bigint; owner?: Address; edit?: (data: Uint8Array) => void };
/** The JitoSOL pool, after its first update of `epoch` keeping `snapshot`, under `owner`. */
function writePool(w: World, s: PoolState = {}) {
  setFixture(w.client, JITO, {
    owner: s.owner,
    mutate: (data, v) => {
      if (s.epoch !== undefined) v.setBigUint64(AT.lastUpdateEpoch, s.epoch, true);
      if (s.snapshot !== undefined) v.setBigUint64(AT.lastEpochTotalLamports, s.snapshot, true);
      s.edit?.(data);
    },
  });
}

/** An open campaign of `kind` on `metric` measuring E, as a 7-day opening at UPDATED writes it. */
async function campaignOn(w: World, kind: number, metric: Address, target: bigint) {
  const t = now(w.client);
  const times = { opensAt: t, entriesCloseAt: t + 5n * P.DAY, deadlineAt: t + 7n * P.DAY };
  const creator = w.client.payer.address;
  return (await injectCampaign(w.client, { id: newId(), kind, metric, target, creator, ...times, epoch: E })).campaign;
}

/** resolve_campaign at `epoch` (and `unix`), then the outcome, void reason and observed value. */
async function resolveAt(w: World, campaign: Address, metric: Address, epoch: bigint, unix?: bigint) {
  clockAt(w, epoch, unix);
  const sent = await send(w, [I.resolveCampaignIx(campaign, metric)]);
  if (!sent.ok) return sent;
  const c = readCampaign(w, campaign);
  const event = sent.events.find((e) => e.name === "CampaignResolved")?.data;
  expect([c.status, event?.read_account, event?.observed_value]).toEqual([P.Status.InReview, metric, c.observed_value]);
  return [c.outcome, c.void_reason, c.observed_value];
}

type Expected = [number, number, bigint] | BrotErrorName;
async function expectResolution(found: Awaited<ReturnType<typeof resolveAt>>, expected: Expected) {
  if (typeof expected !== "string") return expect(found).toEqual(expected);
  if (Array.isArray(found)) throw new Error(`expected ${expected}, recorded ${found.join(", ")}`);
  expectError(found, expected);
}

describe("readers match fixtures: StakePoolTvlAtLeast resolves the JitoSOL snapshot of the measured epoch", () => {
  const late = 7n * P.DAY + 1n;
  const cases: [string, bigint, PoolState | undefined, Expected, bigint?][] = [
    ["YES: the snapshot of E at the goal", E, { epoch: E, snapshot: GOAL }, [Yes, None, GOAL]],
    ["NO: one lamport short", E, { epoch: E, snapshot: GOAL - 1n }, [No, None, GOAL - 1n]],
    ["YES read late, after E and the deadline", E + 1n, { epoch: E, snapshot: GOAL }, [Yes, None, GOAL], late],
    ["MissedWindow: overwritten by E + 1", E + 1n, { epoch: E + 1n, snapshot: 2n * GOAL }, [Void, MissedWindow, 0n]],
    ["MissedWindow: E ended with no update", E + 1n, undefined, [Void, MissedWindow, 0n]],
    ["MissedWindow: the deadline passed before E", UPDATED, undefined, [Void, MissedWindow, 0n], late],
    [
      "UnreadableAccount: after E, another owner",
      E + 1n,
      { owner: P.SPL_TOKEN_PROGRAM_ID },
      [Void, UnreadableAccount, 0n],
    ],
    ["not yet before E", UPDATED, undefined, "NotResolvableYet"],
    ["not yet in E before the pool's first update", E, undefined, "NotResolvableYet"],
    ["refused in E: another owner", E, { owner: P.SPL_TOKEN_PROGRAM_ID }, "ReaderWrongOwner"],
    ["refused in E: a validator list", E, { edit: (d) => (d[0] = 2) }, "ReaderBadLayout"],
  ];
  for (const [name, epoch, state, expected, after] of cases) {
    test(name, async () => {
      const w = await createWorld();
      const campaign = await campaignOn(w, P.ReaderKind.StakePoolTvlAtLeast, pool, GOAL);
      writePool(w, state);
      const unix = after === undefined ? undefined : now(w.client) + after;
      await expectResolution(await resolveAt(w, campaign, pool, epoch, unix), expected);
    });
  }
});

describe("readers match fixtures: StakeAtLeast reads the captured vote account", () => {
  /** The vote account written as captured, or replaced by `data` under `owner`. */
  async function voteWorld(data?: Uint8Array, owner: Address = P.VOTE_PROGRAM_ID) {
    const w = await createWorld();
    setFixture(w.client, VOTE);
    if (data) setRawAccount(w.client, vote, data, owner);
    return { w, campaign: await campaignOn(w, P.ReaderKind.StakeAtLeast, vote, P.SOL) };
  }
  test("in E, LiteSVM's zero stake reads NO, observed 0; after E the window is missed", async () => {
    const { w, campaign } = await voteWorld();
    await expectResolution(await resolveAt(w, campaign, vote, UPDATED), "NotResolvableYet");
    await expectResolution(await resolveAt(w, campaign, vote, E), [No, None, 0n]);
    const missed = await voteWorld();
    await expectResolution(await resolveAt(missed.w, missed.campaign, vote, E + 1n), [Void, MissedWindow, 0n]);
  });
  test("in E, another owner, a zeroed account and a stretched one are refused; late, unreadable voids", async () => {
    const captured = fixtureBytes(VOTE);
    const stretched = new Uint8Array(captured.length + 1);
    stretched.set(captured);
    const refusals: [Uint8Array, Address, BrotErrorName][] = [
      [captured, P.SYSTEM_PROGRAM_ID, "ReaderWrongOwner"],
      [new Uint8Array(captured.length), P.VOTE_PROGRAM_ID, "ReaderBadLayout"],
      [stretched, P.VOTE_PROGRAM_ID, "ReaderBadLayout"],
    ];
    for (const [data, owner, error] of refusals) {
      const { w, campaign } = await voteWorld(data, owner);
      await expectResolution(await resolveAt(w, campaign, vote, E), error);
    }
    const { w, campaign } = await voteWorld(captured, P.SYSTEM_PROGRAM_ID);
    const late = now(w.client) + 7n * P.DAY + 1n;
    await expectResolution(await resolveAt(w, campaign, vote, E, late), [Void, UnreadableAccount, 0n]);
  });
});

describe("readers match fixtures: a StakePoolTvlAtLeast opening on the JitoSOL bytes", () => {
  /** A free team opening measuring `epoch`, with the clock at `clock` and the pool as `state`. */
  async function open(o: { target?: bigint; epoch?: bigint; clock?: bigint; state?: PoolState; bytes?: Uint8Array }) {
    const w = await createWorld();
    const [team] = await setTeam(w, (await initConfig(w)).admin, 1);
    mainnetSchedule(w.client);
    clockAt(w, o.clock ?? UPDATED);
    writePool(w, o.state);
    if (o.bytes) setRawAccount(w.client, pool, o.bytes, P.STAKE_POOL_PROGRAM_ID);
    const args = { id: newId(), kind: P.ReaderKind.StakePoolTvlAtLeast, feedId: new Uint8Array(32) };
    const terms = { target: o.target ?? GOAL, epoch: o.epoch ?? E, deadlineAt: now(w.client) + 7n * P.DAY };
    const ix = await I.openCampaignIx(team!, { ...args, ...terms, openingUsd: 0n, maxLamports: 0n }, { metric: pool });
    return { w, sent: await send(w, [ix]), campaign: await P.campaignPda(args.id) };
  }
  test("opens one minimum distance (1%, rounded up) above the higher total, and refuses nearer", async () => {
    const nearest = HIGH + (HIGH + 99n) / 100n;
    const opened = await open({ target: nearest });
    expectOk(opened.sent);
    expect(readCampaign(opened.w, opened.campaign)).toMatchObject({ kind: 3, metric_account: pool, epoch: E });
    expectError((await open({ target: nearest - 1n })).sent, "TargetTooClose");
    expectError((await open({ target: HIGH })).sent, "TargetAlreadyTouched");
    expectError((await open({ target: 0n })).sent, "TargetUnreachable");
  });
  test("refuses a started epoch, one that may start after the deadline, and a stopped pool", async () => {
    expectError((await open({ epoch: UPDATED })).sent, "EpochAlreadyStarted");
    expectError((await open({ epoch: UPDATED + 4n })).sent, "EpochAfterDeadline");
    expectError((await open({ clock: UPDATED + 2n, epoch: UPDATED + 3n })).sent, "StakePoolNotUpdating");
    expectOk((await open({ clock: UPDATED + 1n, epoch: UPDATED + 2n })).sent);
  });
  test("refuses another owner's bytes, a validator list and a truncated pool", async () => {
    expectError((await open({ state: { owner: P.SPL_TOKEN_PROGRAM_ID } })).sent, "ReaderWrongOwner");
    expectError((await open({ state: { edit: (d) => (d[0] = 2) } })).sent, "ReaderBadLayout");
    expectError((await open({ bytes: fixtureBytes(JITO).slice(0, 434) })).sent, "ReaderBadLayout");
  });
});

describe("readers match fixtures: the epoch kinds' join lock is the measured epoch's start", () => {
  test("a baker joins before E; once E starts, before any update, the next is refused", async () => {
    const w = await createWorld();
    await initConfig(w);
    writePool(w);
    clockAt(w, UPDATED);
    const campaign = await campaignOn(w, P.ReaderKind.StakePoolTvlAtLeast, pool, GOAL);
    const entry = { side: P.Side.Yes, amount: DEFAULT_PARAMS.min_entry_lamports };
    expectOk(await join(w, await fundedWallet(w), campaign, entry));
    clockAt(w, E);
    expectError(await join(w, await fundedWallet(w), campaign, entry), "OutcomeKnowable");
  });
});
