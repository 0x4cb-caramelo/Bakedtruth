/**
 * Purpose: both sides of the epoch kinds' parity test on the same bytes and clocks: pred-provable
 *          (create_market, resolve) and brot-markets (a free team opening, resolve_campaign on an
 *          injected campaign), each answer reduced to one class so the two can be compared.
 * Version: 0.0.3
 * Sprint:  03 (readers and resolution), lane B. The pred-provable side leaves with that program.
 */
import { BN } from "@anchor-lang/core";
import { type Address } from "@solana/kit";

import { injectCampaign } from "../brot/campaigns";
import { BrotError, type BrotErrorName } from "../brot/errors";
import { initConfig, newId, readCampaign, setTeam } from "../brot/flows";
import * as I from "../brot/instructions";
import * as P from "../brot/program";
import { STAKE_POOL_OFFSETS as AT, setClock, setMainnetEpochSchedule, setRawAccount } from "../brot/readers";
import { createWorld, now, send, type Sent, type World } from "../brot/setup";
import * as H from "../helpers";

/** The epoch of the captured pools' last update: the clock's epoch at every opening here. */
export const UPDATED = 1_047n;
export const E = UPDATED + 1n;

/** A captured account, `edit` applied to a copy of its bytes, under `owner` if given. */
export type Bytes = { name: H.FixtureName; owner?: Address; edit?: (data: Uint8Array) => void };
/** What one program is asked: an opening on `bytes` at clock epoch `clock`, then, if `later` is
 * given, a resolution at `later.epoch` with the account rewritten to `later.bytes`. */
export type Case = {
  epoch: bigint;
  target: bigint;
  bytes: Bytes;
  clock?: bigint;
  later?: { epoch: bigint; bytes?: Bytes };
};

export const fixtureAddress = (name: H.FixtureName) => H.loadFixture(name).address;

/** A captured pool's mint and its two totals, the higher first. */
export function facts(name: H.FixtureName) {
  const { data } = H.loadFixture(name);
  const total = H.readU64(data, AT.totalLamports);
  const snapshot = H.readU64(data, AT.lastEpochTotalLamports);
  const [high, low] = total > snapshot ? [total, snapshot] : [snapshot, total];
  return { mint: H.readKey(data, AT.poolMint), high, low };
}

/** The pool's first update of `epoch`, keeping `value` as the total it held before. */
export const update = (epoch: bigint, value: bigint) => (data: Uint8Array) => {
  H.writeU64(data, AT.lastUpdateEpoch, epoch);
  H.writeU64(data, AT.lastEpochTotalLamports, value);
};

function bytesOf(b: Bytes) {
  const { address: at, owner, data } = H.loadFixture(b.name);
  b.edit?.(data);
  return { at, owner: b.owner ?? owner, data };
}

// --- The class of an answer: what both programs must agree on --------------------------------

const PRED_CLASS: Record<string, string> = {
  NotResolvableYet: "not yet",
  InvalidEpoch: "refused: epoch",
  MetricAlreadyMet: "refused: target",
  InvalidMetricAccount: "refused: account",
};
const BROT_CLASS: Partial<Record<BrotErrorName, string>> = {
  NotResolvableYet: "not yet",
  EpochAlreadyStarted: "refused: epoch",
  EpochAfterDeadline: "refused: epoch",
  TargetAlreadyTouched: "refused: target",
  TargetTooClose: "refused: target",
  TargetUnreachable: "refused: target",
  ReaderWrongOwner: "refused: account",
  ReaderBadLayout: "refused: account",
  StakePoolNotUpdating: "refused: account",
  ReaderKindNotOpen: "refused: kind not open",
};
const VOID_REASON = Object.fromEntries(Object.entries(P.VoidReason).map(([name, n]) => [n, name]));

/** "accepted", or the class of pred-provable's Anchor error (its name is in the logs). */
async function predClass(run: () => Promise<unknown>) {
  try {
    await run();
    return "accepted";
  } catch (error) {
    const name = /Error Code: (\w+)/.exec(String(error))?.[1] ?? String(error).slice(0, 80);
    return PRED_CLASS[name] ?? `error: ${name}`;
  }
}

/** "accepted", or the class of brot-markets' custom error. */
function brotClass(sent: Sent) {
  if (sent.ok) return "accepted";
  const name = Object.entries(BrotError).find(([, code]) => code === sent.code)?.[0] as BrotErrorName | undefined;
  return (name && BROT_CLASS[name]) ?? `error: ${name ?? sent.error}`;
}

// --- pred-provable, as tests/pred-provable.test.ts drives it ----------------------------------

/** pred-provable's answer: create_market at `clock` (default UPDATED), then resolve at `later`. */
export async function original(kind: "pool" | "stake", c: Case, target: Address) {
  const client = await H.createTestClient();
  const write = (b: Bytes) => {
    const { at, owner, data } = bytesOf(b);
    H.setAccountData(client, at, owner, data);
    return at;
  };
  H.setEpoch(client, c.clock ?? UPDATED);
  const metric = write(c.bytes);
  const sponsor = await H.fundedSigner(client);
  // The frozen program's own account and mints (its API keeps its old names).
  const frozen = H.marketPda(sponsor.address, 1n);
  const mints = H.outcomeMints(frozen);
  const epoch = new BN(c.epoch.toString());
  const created = await predClass(async () => {
    const args = {
      marketId: new BN(1),
      kind: (kind === "pool" ? { stakePoolTvlAtLeast: { epoch } } : { stakeAtLeast: { epoch } }) as never,
      metricThreshold: new BN(c.target.toString()),
      cutoffSlot: new BN(100),
      deadlineSlot: new BN(200),
      yesPriceBps: 1_000,
      sponsorBudget: new BN((2n * H.USDC).toString()),
    };
    const ix = await H.program.methods
      .createMarket(args)
      .accountsStrict({
        sponsor: H.pk(sponsor.address),
        market: H.pk(frozen),
        yesMint: H.pk(mints.yes),
        noMint: H.pk(mints.no),
        usdcMint: H.pk(H.USDC_MINT),
        vault: H.pk(H.vaultPda(frozen)),
        sponsorUsdcAccount: H.pk(H.ata(sponsor.address, H.USDC_MINT)),
        target: H.pk(target),
        metricAccount: H.pk(metric),
        tokenProgram: H.pk(H.TOKEN_PROGRAM_ID),
        systemProgram: H.pk(H.SYSTEM_PROGRAM_ID),
      })
      .instruction();
    await H.send(client, [ix], [sponsor]);
  });
  if (!c.later || created !== "accepted") return created;
  H.setEpoch(client, c.later.epoch);
  if (c.later.bytes) write(c.later.bytes);
  const resolved = await predClass(async () => {
    const accounts = { market: H.pk(frozen), metricAccount: H.pk(metric) };
    await H.send(client, [await H.program.methods.resolve().accountsStrict(accounts).instruction()]);
  });
  if (resolved !== "accepted") return resolved;
  return Object.keys(H.fetchMarket(client, frozen).outcome)[0]!.toUpperCase();
}

// --- brot-markets ------------------------------------------------------------------------------

/** The clock 100,000 slots into `epoch` on mainnet's schedule (432,000 slots, no warmup). */
const clockAt = (w: World, epoch: bigint) => setClock(w.client, { epoch, slot: epoch * 432_000n + 100_000n });

function write(w: World, b: Bytes) {
  const { at, owner, data } = bytesOf(b);
  setRawAccount(w.client, at, data, owner);
  return at;
}

/** brot-markets' answer: a free team opening at `clock` (default UPDATED) with a 7-day deadline,
 * or, with `later`, a campaign injected as that opening would write it, then resolve_campaign. */
export async function ported(kind: number, c: Case) {
  const w = await createWorld();
  const team = c.later ? undefined : (await setTeam(w, (await initConfig(w)).admin, 1))[0]!;
  setMainnetEpochSchedule(w.client);
  clockAt(w, c.clock ?? UPDATED);
  const metric = write(w, c.bytes);
  const [t, id] = [now(w.client), newId()];
  if (!c.later) {
    const args = { id, kind, feedId: new Uint8Array(32), target: c.target, epoch: c.epoch };
    const open = { ...args, deadlineAt: t + 7n * P.DAY, openingUsd: 0n, maxLamports: 0n };
    return brotClass(await send(w, [await I.openCampaignIx(team!, open, { metric })]));
  }
  const creator = w.client.payer.address;
  const times = { opensAt: t, entriesCloseAt: t + 5n * P.DAY, deadlineAt: t + 7n * P.DAY };
  const { campaign } = await injectCampaign(w.client, {
    id,
    kind,
    metric,
    target: c.target,
    creator,
    ...times,
    epoch: c.epoch,
  });
  clockAt(w, c.later.epoch);
  if (c.later.bytes) write(w, c.later.bytes);
  const sent = await send(w, [I.resolveCampaignIx(campaign, metric)]);
  if (!sent.ok) return brotClass(sent);
  const resolved = readCampaign(w, campaign);
  if (resolved.outcome === P.Outcome.Yes) return "YES";
  if (resolved.outcome === P.Outcome.No) return "NO";
  return `VOID(${VOID_REASON[resolved.void_reason]})`;
}
