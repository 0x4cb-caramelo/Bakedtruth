/**
 * Purpose: the two halves of the fact readers' parity check (Sprint 03): one account's bytes put
 *          before pred-provable (`create_market`, then `resolve`, the deadline in slots) and before
 *          brot-markets (`user_open_campaign` by a team key, then `resolve_campaign`, the deadline
 *          in Unix time), every answer reduced to a verdict both programs share.
 * Version: 0.0.3
 * Sprint:  03 (readers and resolution), lane A. Leaves with pred-provable and `tests/helpers.ts`.
 */
import { BN } from "@anchor-lang/core";
import { type Address, type KeyPairSigner } from "@solana/kit";

import { BrotError, type BrotErrorName } from "../brot/errors";
import { newId, readCampaign } from "../brot/flows";
import * as I from "../brot/instructions";
import { openingWorld, type OpeningWorld } from "../brot/opening";
import * as P from "../brot/program";
import { DAMM_OFFSETS, fixtureBytes, setRawAccount } from "../brot/readers";
import { now, send, setTime } from "../brot/setup";
import * as H from "../helpers";

export type Reader = "SupplyAtMost" | "DammV2LockedAtLeast";
/** An account as both programs are shown it. */
export type Account = { address: Address; owner: Address; data: Uint8Array };
/** The account at opening, the target in its own units, and the same account with the fact met. */
export type Case = { reader: Reader; fixture: string; label: string; account: Account; target: bigint; met: Account };

/** What happens after an opening both programs accept, in this order (TP section 3.4.6). */
export const STEPS = [
  "before the deadline, as opened",
  "before the deadline, cut by one byte",
  "before the deadline, fact met",
  "after the deadline, as opened",
  "after the deadline, fact met",
  "after the deadline, cut by one byte",
];

/** Both programs' refusals by name, in classes they share: the account, the authority, the target. */
const CLASSES: Record<string, string> = {
  // pred-provable (Anchor error names, programs/pred-provable/src/error.rs)
  InvalidMetricAccount: "refused: account",
  MetricAlreadyMet: "refused: already met",
  InvalidThreshold: "refused: threshold",
  // brot-markets (programs/brot-markets/src/error.rs)
  ReaderWrongOwner: "refused: account",
  ReaderBadLayout: "refused: account",
  TargetAlreadyTouched: "refused: already met",
  TargetTooClose: "refused: too close",
  TargetUnreachable: "refused: unreachable",
  MathOverflow: "refused: overflow",
  // both
  MintAuthorityLive: "refused: authority",
  NotResolvableYet: "not yet",
};
const verdict = (error: string) => CLASSES[error] ?? `refused: ${error}`;

/** `account` with other bytes (built from a copy of its own) or another owner. */
export function changed(account: Account, change: { owner?: Address; data?: (copy: Uint8Array) => Uint8Array }) {
  const data = change.data ? change.data(account.data.slice()) : account.data.slice();
  return { ...account, owner: change.owner ?? account.owner, data };
}

/** pred-provable's `DammV2LockedAtLeast { shift }` and u64 threshold for `goal` (`damm_goal`). */
function thresholdAndShift(goal: bigint) {
  let shift = 0;
  while (goal >> BigInt(shift) >= 1n << 64n) shift++;
  if ((goal >> BigInt(shift)) << BigInt(shift) !== goal) throw new Error(`${goal} is no u64 shifted left`);
  return { threshold: goal >> BigInt(shift), shift };
}

/** The account a step shows: as opened, with the fact met, or cut by one byte. */
function stepAccount(c: Case, step: number): Account {
  if (step === 1 || step === 5) return changed(c.account, { data: (d) => d.slice(0, -1) });
  return step === 2 || step === 4 ? c.met : c.account;
}

// --- pred-provable --------------------------------------------------------------------------------

/** The frozen tests' schedule (tests/pred-provable.test.ts): cutoff at slot 100, deadline at 200. */
const [CUTOFF, DEADLINE] = [100n, 200n];
const bn = (value: bigint | number) => new BN(value.toString());
const anchorError = (failure: unknown) => /Error Code: (\w+)/.exec(String(failure))?.[1] ?? String(failure);

/** pred-provable's `create_market` for case `c`, as opening `id` of `sponsor`; returns its PDA. */
async function openOriginal(client: H.TestClient, sponsor: KeyPairSigner, c: Case, id: bigint) {
  const pda = H.marketPda(sponsor.address, id);
  const [mints, pk] = [H.outcomeMints(pda), H.pk];
  const pool = c.reader === "DammV2LockedAtLeast" ? thresholdAndShift(c.target) : undefined;
  const kind = pool ? { dammV2LockedAtLeast: { shift: pool.shift } } : { supplyAtMost: {} };
  // The burn kind's target is the mint itself; the pool kind's is one of the pool's two mints.
  const target = pool ? H.readKey(fixtureBytes(c.fixture), DAMM_OFFSETS.tokenBMint) : c.account.address;
  const args = { marketId: bn(id), kind: kind as never, metricThreshold: bn(pool?.threshold ?? c.target) };
  const schedule = {
    cutoffSlot: bn(CUTOFF),
    deadlineSlot: bn(DEADLINE),
    yesPriceBps: 1_000,
    sponsorBudget: bn(2n * H.USDC),
  };
  const ix = await H.program.methods
    .createMarket({ ...args, ...schedule })
    .accountsStrict({
      sponsor: pk(sponsor.address),
      market: pk(pda),
      yesMint: pk(mints.yes),
      noMint: pk(mints.no),
      usdcMint: pk(H.USDC_MINT),
      vault: pk(H.vaultPda(pda)),
      sponsorUsdcAccount: pk(H.usdcAta(sponsor.address)),
      target: pk(target),
      metricAccount: pk(c.account.address),
      tokenProgram: pk(H.TOKEN_PROGRAM_ID),
      systemProgram: pk(H.SYSTEM_PROGRAM_ID),
    })
    .instruction();
  await H.send(client, [ix], [sponsor]);
  return pda;
}

async function resolveOriginal(client: H.TestClient, pda: Address, metric: Address) {
  const ix = await H.program.methods.resolve().accountsStrict({ market: H.pk(pda), metricAccount: H.pk(metric) });
  try {
    await H.send(client, [await ix.instruction()]);
  } catch (failure) {
    return verdict(anchorError(failure));
  }
  const outcome = H.fetchMarket(client, pda).outcome as object;
  return "Yes" in outcome ? "YES" : "No" in outcome ? "NO" : JSON.stringify(outcome);
}

/** pred-provable's answers: the opening, then (when `steps`) each of `STEPS` on an opening of its own. */
export async function runOriginal(c: Case, steps: boolean): Promise<string[]> {
  const client = await H.createTestClient();
  const sponsor = await H.fundedSigner(client, 10n);
  const put = (a: Account) => H.setAccountData(client, a.address, a.owner, a.data);
  put(c.account);
  const opened: Address[] = [];
  for (const id of steps ? [1n, 2n, 3n, 4n] : [1n]) {
    try {
      opened.push(await openOriginal(client, sponsor, c, id));
    } catch (failure) {
      return [verdict(anchorError(failure))];
    }
  }
  const answers = ["accepted"];
  for (let step = 0; steps && step < STEPS.length; step++) {
    // Past the cutoff and before the deadline, as the frozen tests resolve; then past the deadline.
    if (step % 3 === 0) client.svm.warpToSlot(step === 0 ? 150n : DEADLINE + 1n);
    put(stepAccount(c, step));
    answers.push(await resolveOriginal(client, opened[Math.max(0, step - 2)]!, c.account.address));
  }
  return answers;
}

// --- brot-markets ---------------------------------------------------------------------------------

const errorName = (code: number | null) =>
  Object.keys(BrotError).find((name) => BrotError[name as BrotErrorName] === code) ?? `code ${code}`;

async function resolvePorted(w: OpeningWorld, campaign: Address, metric: Address) {
  const sent = await send(w, [I.resolveCampaignIx(campaign, metric)]);
  if (!sent.ok) return verdict(errorName(sent.code));
  const { outcome, met_late, void_reason } = readCampaign(w, campaign);
  if (outcome === P.Outcome.Yes) return "YES";
  if (outcome === P.Outcome.No) return met_late ? "NO, met late" : "NO";
  const unreadable = outcome === P.Outcome.Void && void_reason === P.VoidReason.UnreadableAccount;
  return unreadable ? "void: unreadable account" : `outcome ${outcome}, void reason ${void_reason}`;
}

/** brot-markets' answers: the opening by a team key, then (when `steps`) each of `STEPS`. */
export async function runPorted(c: Case, steps: boolean): Promise<string[]> {
  const w = await openingWorld();
  const put = (a: Account) => setRawAccount(w.client, a.address, a.data, a.owner);
  put(c.account);
  const [kind, deadlineAt, feedId] = [P.ReaderKind[c.reader], now(w.client) + 7n * P.DAY, new Uint8Array(32)];
  const campaigns: Address[] = [];
  for (let i = 0; i < (steps ? 4 : 1); i++) {
    const [id, target] = [newId(), c.target];
    const args = { id, kind, direction: 0, feedId, target, deadlineAt, openingUsd: 0n, maxLamports: 0n, epoch: 0n };
    const sent = await send(w, [await I.openCampaignIx(w.team, args, { metric: c.account.address })]);
    if (!sent.ok) return [verdict(errorName(sent.code))];
    campaigns.push(await P.campaignPda(id));
  }
  const answers = ["accepted"];
  for (let step = 0; steps && step < STEPS.length; step++) {
    if (step === 3) setTime(w.client, deadlineAt + 1n);
    put(stepAccount(c, step));
    answers.push(await resolvePorted(w, campaigns[Math.max(0, step - 2)]!, c.account.address));
  }
  return answers;
}
