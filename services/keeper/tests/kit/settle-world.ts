/**
 * Purpose: what the keeper's settlement tests share: a LiteSVM world with the founder's config, a team key, a creator,
 *          a funded keeper wallet and the in-process RPC; the keeper's cycle context (settlement on, no wait between
 *          retries, sends confirmed at once); bakers joining a campaign; a price touch; the state captured the moment
 *          the snapshot lands (from the settlement log); and what the SDK's math says each party is owed from it.
 * Version: 0.1.0
 * Sprint:  07 carry-over (the keeper's settlement, tested on LiteSVM)
 */
import { type Address, type KeyPairSigner } from "@solana/kit";
import {
  decodeCampaign,
  decodeEntry,
  entryAddress,
  entryOwed,
  feeVaultAddress,
  prizeReturnOf,
  creatorShareStatus,
  snapshotOf,
  storedVerdict,
  vaultAddress,
  type Campaign,
} from "@brot/sdk/read";

import { BTC_PRICE, DEFAULT_PARAMS, initConfig, join, setTeam } from "../../../../tests/brot/flows";
import * as P from "../../../../tests/brot/program";
import {
  balance,
  createWorld,
  expectOk,
  fundedWallet,
  now,
  setPriceAccount,
  type World,
} from "../../../../tests/brot/setup";
import { Backoff, DailyClock } from "../../src/backoff";
import type { CycleContext } from "../../src/cycle";
import { chainRpc, type ChainRpc } from "./litesvm-rpc";

export type KeeperWorld = World & {
  admin: KeyPairSigner;
  team: KeyPairSigner;
  creator: KeyPairSigner;
  feeRecipient: Address;
  keeper: KeyPairSigner;
  chain: ChainRpc;
};

/** The world; `params` (snake_case, over the founder's defaults) when a test needs other creation parameters. */
export async function keeperWorld(params: Record<string, unknown> = {}): Promise<KeeperWorld> {
  const w = await createWorld();
  const { admin, feeRecipient } = await initConfig(w, { ...DEFAULT_PARAMS, ...params });
  const [team] = await setTeam(w, admin, 1);
  const creator = await fundedWallet(w);
  const keeper = await fundedWallet(w, 10n);
  return { ...w, admin, team: team!, creator, feeRecipient: feeRecipient.address, keeper, chain: chainRpc(w) };
}

export type Log = (event: string, fields: Record<string, unknown>) => void;

/** The keeper's context: settlement on, every retry allowed at once, sends confirmed without waiting. */
export function keeperContext(kw: KeeperWorld, opts: { keeper?: KeyPairSigner; chain?: ChainRpc; log?: Log } = {}) {
  const chain = opts.chain ?? kw.chain;
  const context: CycleContext = {
    landing: {
      rpc: chain.rpc,
      payer: opts.keeper ?? kw.keeper,
      fees: { floor: 0n, ceiling: 1_000_000n, maxLamports: 1_000_000n },
      batchMax: 10,
      timing: { rebroadcastMs: 0, maxWaitMs: 5_000 },
    },
    settle: {
      enabled: true,
      backoff: new Backoff(0, 0),
      claims: new DailyClock(),
      sweepMinLamports: 0n,
      log: opts.log ?? (() => {}),
    },
    watch: null,
    pyth: null,
  };
  return context;
}

/** One baker per `[side, lamports]`, each joining `campaign` in order. */
export async function bake(w: World, campaign: Address, joins: Array<[number, bigint]>): Promise<KeyPairSigner[]> {
  const bakers: KeyPairSigner[] = [];
  for (const [side, amount] of joins) {
    const baker = await fundedWallet(w, 20n);
    expectOk(await join(w, baker, campaign, { side, amount, expectedEntryTotal: 0n }));
    bakers.push(baker);
  }
  return bakers;
}

/**
 * The default campaign's target (110% of the captured BTC/USD price) crossed by 1%, published 5 s before the clock,
 * which first moves 30 s on: a YES proof must be published at or after the opening (`ProofOutsideWindow`).
 */
export function touchBtc(w: World) {
  setClockTo(w, now(w.client) + 30n);
  const touch = (BTC_PRICE * 11n * 101n) / (10n * 100n);
  const slot = w.client.svm.getClock().slot;
  setPriceAccount(w.client, P.BTC_USD_ACCOUNT, "pyth-btc-usd-devnet", {
    price: touch,
    conf: 0n,
    publishTime: now(w.client) - 5n,
    postedSlot: slot,
  });
}

/** Moves the clock to `unixTimestamp`, keeping the slot. */
export function setClockTo(w: World, unixTimestamp: bigint) {
  const clock = w.client.svm.getClock();
  clock.unixTimestamp = unixTimestamp;
  w.client.svm.setClock(clock);
}

export const readCampaignOf = (w: World, at: Address): Campaign => {
  const account = w.client.svm.getAccount(at);
  if (!account.exists) throw new Error(`no campaign at ${at}`);
  return decodeCampaign({ owner: account.programAddress, data: account.data });
};

export type Captured = {
  campaign: Campaign;
  entries: { baker: Address; entry: ReturnType<typeof decodeEntry>; lamports: bigint }[];
  balances: Map<string, bigint>;
};

/**
 * A synchronous capture of the campaign, its entries and `parties`' balances (with the campaign's, its vault's and
 * the fee vault's), every address derived beforehand: called from the settlement log, it must read the world before
 * the keeper's next round moves anything.
 */
export async function capturer(w: World, at: Address, bakers: readonly Address[], parties: readonly Address[]) {
  const entryAt = await Promise.all(bakers.map((baker) => entryAddress(at, baker)));
  const watched = [...bakers, ...parties, at, await vaultAddress(at), await feeVaultAddress()];
  return (): Captured => {
    const entries = bakers.map((baker, i) => {
      const account = w.client.svm.getAccount(entryAt[i]!);
      if (!account.exists) throw new Error(`no entry for ${baker}`);
      const entry = decodeEntry({ owner: account.programAddress, data: account.data });
      return { baker, entry, lamports: BigInt(account.lamports) };
    });
    const balances = new Map(watched.map((party) => [party as string, balance(w, party as Address)]));
    return { campaign: readCampaignOf(w, at), entries, balances };
  };
}

/** A settlement log that captures the world the moment `finalize` lands for `at` (the snapshot just stored). */
export async function captureOnFinalize(
  w: World,
  at: Address,
  bakers: readonly Address[],
  parties: readonly Address[],
) {
  const take = await capturer(w, at, bakers, parties);
  let captured: Captured | null = null;
  const log: Log = (event, fields) => {
    if (event === "settle-landed" && fields.step === `finalize:${at}` && !captured) captured = take();
  };
  return { log, captured: () => captured };
}

/** What the SDK's math says each party is owed from the stored snapshot (`c` finalized). */
export function owed(captured: Captured) {
  const c = captured.campaign;
  const verdict = storedVerdict(c);
  if (!verdict) throw new Error("the campaign has no verdict");
  const snap = snapshotOf(c, verdict);
  const bakers = captured.entries.map((e) => ({
    baker: e.baker,
    entry: e.entry,
    rent: e.lamports,
    ...entryOwed(c, e.entry),
  }));
  const share = creatorShareStatus(c);
  const prize = prizeReturnOf(c);
  const oneSided = bakers.reduce((sum, b) => sum + b.oneSidedFee, 0n);
  return {
    snap,
    bakers,
    share: share.status === "due" || share.status === "paid" ? share.amount : 0n,
    prize: prize.prize + prize.openingFee,
    kept: snap.brotKeeps + oneSided,
  };
}
