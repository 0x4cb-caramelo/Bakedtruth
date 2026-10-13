/**
 * Purpose: what the contest's LiteSVM tests share (Sprint 14, lane L14B): a world with the founder's config, the
 *          admin, one team key and a stranger; a `SupplyAtMost` campaign on a synthetic mint, resolved NO after its
 *          deadline, written in review or contested at a stage; the mint's supply moved (a different reading); the
 *          contest's calls through the SDK's builders; a refusal that must leave the campaign and its vault as they
 *          were; and the vault funded with a prize and an opening fee for the payouts.
 * Version: 0.1.1 (the opening and the escalation by their byte, the second review's S1)
 * Sprint:  14 (lane L14B). Needs target/deploy/brot_markets.so.
 */
import { lamports, type Address, type KeyPairSigner } from "@solana/kit";

import { ContestStage } from "@brot/sdk/read";
import { buildAdminDecideContest, buildRereadCampaign, buildTeamOpenContest } from "@brot/sdk/tx";

import { injectEntry } from "./campaigns";
import { initConfig, setTeam } from "./flows";
import * as IL from "./instructions-14-15";
import * as P from "./program";
import { mintBytes, setRawAccount } from "./readers";
import { anyAddress, at, campaignOn, DEADLINE, resolveWorld, type Injected } from "./resolve-support";
import { balance, fundedWallet, send, type World } from "./setup";

export const HOUR = 3_600n;
/** Stage 1's 24 hours (the founder's answer to D2) and stage 2's 48 (constants.rs). */
export const STAGE1_SECONDS = 24n * HOUR;
export const STAGE2_SECONDS = 48n * HOUR;
/** The mint stays above its target: after the deadline the reading is NO, not met late. */
export const SUPPLY = 2_000_000n;
export const TARGET = 1_000_000n;
/** Resolved an hour after the deadline; the clock starts an hour later, inside the six-hour window. */
export const RESOLVED_AT = DEADLINE + HOUR;
export const REVIEW_ENDS = RESOLVED_AT + 6n * HOUR;
export const NOW = RESOLVED_AT + HOUR;
export const SEQ = 4n;
export const NOTE = new Uint8Array(32).fill(7);

export type ContestWorld = {
  w: World;
  admin: KeyPairSigner;
  team: KeyPairSigner;
  outsider: KeyPairSigner;
  config: Address;
};

/** A world with the founder's config, one team key and a stranger, its clock at `NOW`. */
export async function contestWorld(): Promise<ContestWorld> {
  const w = await resolveWorld();
  const { admin } = await initConfig(w);
  const [team] = await setTeam(w, admin, 1);
  const outsider = await fundedWallet(w);
  at(w, NOW);
  return { w, admin, team, outsider, config: await P.configPda() };
}

/** Writes the mint at `mint` with `supply`, both authorities revoked. */
export const setSupply = (w: World, mint: Address, supply: bigint) =>
  setRawAccount(w.client, mint, mintBytes({ supply, mintAuthority: null }), P.SPL_TOKEN_PROGRAM_ID);

/**
 * A `SupplyAtMost` campaign resolved NO (the supply observed) at `RESOLVED_AT`, 2 SOL on YES and 1 SOL on NO in two
 * tallied entries, in review; then `extra` (any `CAMPAIGN` field). `contest` writes it `Contested` at that stage.
 */
export async function reviewed(cw: ContestWorld, extra: Record<string, unknown> = {}): Promise<Injected> {
  const mint = await anyAddress();
  setSupply(cw.w, mint, SUPPLY);
  return campaignOn(cw.w, P.ReaderKind.SupplyAtMost, mint, TARGET, {
    status: P.Status.InReview,
    extra: {
      outcome: P.Outcome.No,
      observed_value: SUPPLY,
      resolved_at: RESOLVED_AT,
      review_ends_at: REVIEW_ENDS,
      entries_open: 2,
      event_seq: SEQ,
      ...extra,
    },
  });
}

/** The campaign of `reviewed`, `Contested` at `stage` until `endsAt`. */
export const contested = (cw: ContestWorld, stage: number, endsAt: bigint, extra: Record<string, unknown> = {}) =>
  reviewed(cw, { status: P.Status.Contested, contest_stage: stage, contest_ends_at: endsAt, ...extra });

/** Two bakers' entries in `c` as the joins and tallies left them: 2 SOL on YES (the first), 1 SOL on NO. */
export async function entries(cw: ContestWorld, c: Injected) {
  const [yes, no] = [await fundedWallet(cw.w, 1n), await fundedWallet(cw.w, 1n)];
  await injectEntry(cw.w.client, { campaign: c.campaign, baker: yes.address, amountYes: 2n * P.SOL, isFirst: true });
  await injectEntry(cw.w.client, { campaign: c.campaign, baker: no.address, amountNo: P.SOL });
  return { yes, no };
}

/** Adds `extra` lamports to the vault, held for the prize and the opening fee (bookkept by the campaign). */
export function fundVault(w: World, vault: Address, extra: bigint) {
  w.client.svm.setAccount({
    address: vault,
    data: new Uint8Array(0),
    executable: false,
    lamports: lamports(balance(w, vault) + extra),
    programAddress: P.PROGRAM_ID,
    space: 0n,
  });
}

/** An account at `at` no reader can read: the System Program's, with no data. */
export function makeUnreadable(w: World, at: Address) {
  w.client.svm.setAccount({
    address: at,
    data: new Uint8Array(0),
    executable: false,
    lamports: lamports(P.SOL),
    programAddress: P.SYSTEM_PROGRAM_ID,
    space: 0n,
  });
}

/** The contest's calls, built by the SDK (`@brot/sdk/tx`) as a client builds them: the opening is byte 1. */
export const openContest = async (cw: ContestWorld, c: Injected, signer = cw.team) =>
  send(cw.w, [await buildTeamOpenContest({ teamMember: signer, campaign: c.campaign, stage: ContestStage.Stage1 })]);
/** The team's escalation (D2), byte 2: a contest still at stage 1 goes to the admin. */
export const escalate = async (cw: ContestWorld, c: Injected, signer = cw.team) =>
  send(cw.w, [await buildTeamOpenContest({ teamMember: signer, campaign: c.campaign, stage: ContestStage.Stage2 })]);

export const rereadIx = (c: Injected, proofAccount?: Address) =>
  buildRereadCampaign({ campaign: c.campaign, metricAccount: c.metric, proofAccount });
export const reread = async (cw: ContestWorld, c: Injected, proofAccount?: Address) =>
  send(cw.w, [await rereadIx(c, proofAccount)]);

export const decide = async (cw: ContestWorld, c: Injected, decision: number, voidReason = 0, signer = cw.admin) =>
  send(cw.w, [
    await buildAdminDecideContest({ admin: signer, campaign: c.campaign, decision, voidReason, noteHash: NOTE }),
  ]);

/** A decision with any argument bytes, built by the kit's raw builder: the SDK's refuses the pairs the program does. */
export const decideRaw = (cw: ContestWorld, c: Injected, decision: number, voidReason: number) =>
  IL.adminDecideContestIx(cw.admin, cw.config, c.campaign, { decision, voidReason, noteHash: NOTE });
