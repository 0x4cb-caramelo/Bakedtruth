/**
 * Purpose: one operation of the randomized test run against the program: planned, sent, its refusal or its balance
 *          changes checked, the model moved on, then its events: exactly the ones the plan names, and for each
 *          campaign as many as the model's event count moved, numbered on from the campaign's last `seq` (X0.4). An
 *          operation that must touch nothing else (a referral link) also finds every other account of the world as it
 *          was: config, fee vault, campaigns, vaults, entries and joins.
 * Version: 0.1.0
 * Sprint:  14 (lane INV14; runOp moved here from invariant-ops.ts)
 */
import { type Address } from "@solana/kit";

import { readConfig } from "./flows";
import { entryOf, type Harness, type Plan } from "./invariant-harness";
import { bakersOf } from "./invariant-model";
import { planOp, type Op } from "./invariant-ops";
import * as P from "./program";
import { balance, expectError, expectOk, send, type Event } from "./setup";

/** Runs one operation: sends it, checks the refusal or the balance changes and events, then moves the model on. */
export async function runOp(h: Harness, op: Op): Promise<void> {
  const plan = await planOp(h, op);
  const addrs = [...plan.deltas.keys()] as Address[];
  const before = addrs.map((a) => balance(h.w, a));
  if (plan.ixs.length === 0) {
    plan.apply();
    h.trace.push(`${plan.label ?? op.k} ok`);
    return;
  }
  const paused = h.paused;
  const seqs = h.camps.map((c) => c.seq);
  const world = plan.still && !plan.error ? await worldState(h) : null;
  const exit = plan.error === undefined ? await exitBefore(h, plan) : null;
  const sent = await send(h.w, plan.ixs);
  const label = plan.error ? op.k : (plan.label ?? op.k);
  if (plan.error) {
    expectError(sent, plan.error);
    addrs.forEach((a, i) => {
      if (balance(h.w, a) !== before[i]) throw new Error(`${op.k}: ${a} moved on a refused ${plan.error}`);
    });
  } else {
    const ok = expectOk(sent);
    addrs.forEach((a, i) => {
      const moved = balance(h.w, a) - before[i];
      const want = plan.deltas.get(a) ?? 0n;
      if (moved !== want) throw new Error(`${op.k}: ${a} moved ${moved}, the model expects ${want}`);
    });
    plan.apply();
    checkEvents(h, label, ok.events, seqs, plan.events);
    plan.verify?.(ok.events);
    if (exit) await checkExit(h, label, exit);
    if (world) compareWorld(label, world, await worldState(h), new Set(addrs));
    if (paused) h.pausedOk.set(label, (h.pausedOk.get(label) ?? 0) + 1);
  }
  plan.after?.();
  h.trace.push(`${label} ${plan.error ?? "ok"}`);
}

type Exit = { index: number; counted: boolean; open: number };

/** Before an exit: whether the campaign counts toward the valve (paid, not yet snapshotted), and the open count. */
async function exitBefore(h: Harness, plan: Plan): Promise<Exit | null> {
  if (plan.exit === undefined) return null;
  const c = h.camps[plan.exit];
  return { index: plan.exit, counted: c.counted && !c.snapshot, open: Number((await readConfig(h.w)).open_campaigns) };
}

/**
 * I7 at each exit (red-team review F2): the snapshot lowers `open_campaigns` by exactly one for a paid campaign and
 * leaves it for a free (team) one, whichever exit took it; recorded by exit, paid or free, with entries or none.
 */
async function checkExit(h: Harness, label: string, exit: Exit) {
  const c = h.camps[exit.index];
  // A paid opening counts until its one snapshot; a free (team) one never counts.
  if (exit.counted === c.team) throw new Error(`I7: ${c.label} (${c.team ? "free" : "paid"}) counted ${exit.counted}`);
  const open = Number((await readConfig(h.w)).open_campaigns);
  const want = exit.open - (exit.counted ? 1 : 0);
  if (open !== want) throw new Error(`I7: ${label} of ${c.label} left open_campaigns at ${open}, wanted ${want}`);
  const key = `${label} ${c.team ? "free" : "paid"} ${bakersOf(c).length > 0 ? "entries" : "no-entry"}`;
  h.exits.set(key, (h.exits.get(key) ?? 0) + 1);
}

/**
 * X0.4: the operation emitted exactly `names` (when the plan names them), and for each campaign as many events as
 * the model's count moved, numbered from the count before the operation, contiguous. A new campaign starts at 0.
 */
function checkEvents(h: Harness, label: string, events: Event[], seqs: bigint[], names?: string[]) {
  const got = events.map((e) => e.name);
  if (names && got.join() !== names.join()) throw new Error(`${label}: events ${got}, the model expects ${names}`);
  const byCampaign = new Map<string, bigint[]>();
  for (const e of events) {
    const campaign = e.data.campaign;
    if (typeof campaign !== "string") continue;
    if (typeof e.data.seq !== "bigint") throw new Error(`X0.4: ${label}: ${e.name} carries no seq`);
    byCampaign.set(campaign, [...(byCampaign.get(campaign) ?? []), e.data.seq]);
  }
  const known = new Set(h.addrs.map((a) => a.campaign as string));
  for (const campaign of byCampaign.keys()) {
    if (!known.has(campaign)) throw new Error(`X0.4: ${label} emitted an event for an unknown campaign ${campaign}`);
  }
  h.camps.forEach((c, i) => {
    const from = i < seqs.length ? seqs[i] : 0n;
    const numbers = byCampaign.get(h.addrs[i].campaign) ?? [];
    if (BigInt(numbers.length) !== c.seq - from) {
      throw new Error(`X0.4: ${label} emitted ${numbers.length} events for ${c.label}, the model ${c.seq - from}`);
    }
    numbers.forEach((seq, k) => {
      if (seq !== from + BigInt(k))
        throw new Error(`X0.4: ${c.label} took seq ${seq}, the next is ${from + BigInt(k)}`);
    });
  });
}

/** Every account of the world the run knows, as `lamports:owner:bytes`, by address. */
async function worldState(h: Harness): Promise<Map<string, string>> {
  const addresses: string[] = [await P.configPda(), h.feeVault];
  for (let i = 0; i < h.camps.length; i++) {
    const { campaign, vault } = h.addrs[i];
    addresses.push(campaign, vault);
    for (const baker of bakersOf(h.camps[i])) addresses.push(await entryOf(h, campaign, baker));
    for (const join of h.camps[i].joins) if (join.address) addresses.push(join.address);
  }
  const state = new Map<string, string>();
  for (const address of addresses) {
    const a = h.w.client.svm.getAccount(address as Address);
    state.set(address, a.exists ? `${a.lamports}:${a.programAddress}:${Buffer.from(a.data).toString("hex")}` : "none");
  }
  return state;
}

/** Throws when an account outside the operation's own (`own`) changed. */
function compareWorld(label: string, before: Map<string, string>, after: Map<string, string>, own: Set<string>) {
  for (const [address, state] of before) {
    if (!own.has(address) && after.get(address) !== state) throw new Error(`${label}: ${address} changed`);
  }
}
