/**
 * Purpose: the contest's part of the team rehearsal (Sprint 14; TP §3.4.7), on the local offline surfnet of
 *          rehearse.ts: a team key contests a YES in review, and the same command run again is refused
 *          (`ContestAlreadyOpen`: the second review's S1); a re-read of the same reading is refused during stage 1's
 *          24 hours (`RereadBeforeTimelock`) and pays once the cluster's clock is past them (D2); a contest whose
 *          reading moved (more tokens burned after the YES) goes to stage 2, where a team key cannot decide and the
 *          admin confirms; another a team key sends to stage 2 itself (`--escalate`, byte 2, once only), and the admin
 *          voids it, with its record, whose SHA-256 is the note hash on-chain; and `--escalate` on a result in review
 *          opens and escalates in one transaction (the runbook's "reader in doubt").
 * Version: 0.3.0 (the act in its byte, S1; the founder's answer to D2: stage 1's wait and the team's escalation)
 * Sprint:  14 (the two-stage dispute; lane INV14; lane L14B, D2 and S1)
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

import { type Address, type KeyPairSigner } from "@solana/kit";

import { ContestStage, Outcome, Status, bytesToHex, decodeCampaign } from "@brot/sdk/read";
import { buildResolveCampaign } from "@brot/sdk/tx";

import { check } from "../devnet";
import { account, clock, expectOk, send, type Rpc } from "../validator/rpc";
import { burnIx } from "../validator/spl-token";
import type { TeamContext } from "./common";
import { contest } from "./contest";
import { decide } from "./decide";
import { reread } from "./reread";

export type Burn = { campaign: Address; mint: Address; holding: Address };
type Roles = { ctxOf: (signer: KeyPairSigner) => TeamContext; team: KeyPairSigner; admin: KeyPairSigner };

const names = (sent: { events: { name: string }[] } | null | undefined) => sent?.events.map((e) => e.name).join();

/** Burns `amount` of the campaign's tokens, held by `holder`. */
const burn = async (rpc: Rpc, holder: KeyPairSigner, c: Burn, amount: bigint) =>
  void expectOk(await send(rpc, holder, [burnIx(c.holding, c.mint, holder, amount)]), "burn");

/** A burn campaign resolved YES (the supply under its target): in review. */
async function resolved(rpc: Rpc, holder: KeyPairSigner, c: Burn) {
  await burn(rpc, holder, c, 10_000n);
  expectOk(await send(rpc, holder, [buildResolveCampaign({ campaign: c.campaign, metricAccount: c.mint })]), "resolve");
}

/** The campaign of `resolved`, contested by a team key (byte 1): stage 1. */
async function contested(rpc: Rpc, r: Roles, holder: KeyPairSigner, c: Burn) {
  await resolved(rpc, holder, c);
  const opened = await contest(r.ctxOf(r.team), c.campaign);
  check(names(opened.sent)?.endsWith("ContestOpened"), "a team key contested the YES: stage 1, payouts held");
}

async function refusedBefore(label: string, attempt: () => Promise<unknown>) {
  const error = await attempt().then(
    () => null,
    (e: Error) => e,
  );
  check(error !== null, `${label}: refused before anything is built (${error?.message})`);
}

/** The act's simulation is refused with `error`, so nothing is sent. */
async function refusedWith(label: string, error: string, attempt: () => Promise<unknown>) {
  const thrown = await attempt().then(
    () => null,
    (e: Error) => e,
  );
  check(thrown?.message.includes(`(${error})`) === true, `${label}: refused, ${thrown?.message}`);
}

export async function rehearseContest(
  rpc: Rpc,
  r: Roles,
  holder: KeyPairSigner,
  open: (deadline: string) => Promise<Burn>,
  logDir: string,
) {
  const state = async (c: Burn) => decodeCampaign((await account(rpc, c.campaign))!);

  console.log(
    "\n▸ contest: the same reading, re-read by any wallet, pays with the stored result after stage 1's 24 hours",
  );
  const same = await open("+5d");
  await contested(rpc, r, holder, same);
  // The second review's S1: the same command again (a retry after a 429, or a second team member) opens, never
  // escalates, and the program refuses it.
  await refusedWith("the opening run again", "ContestAlreadyOpen", () => contest(r.ctxOf(r.team), same.campaign));
  check((await state(same)).contestStage === ContestStage.Stage1, "still stage 1: the retried opening changed nothing");
  await refusedWith("the same reading during stage 1", "RereadBeforeTimelock", () =>
    reread(r.ctxOf(holder), same.campaign),
  );
  const ends = (await state(same)).contestEndsAt;
  await rpc.call("surfnet_timeTravel", [{ absoluteTimestamp: Number(ends + 5n) * 1000 }]);
  check((await clock(rpc)).unixTimestamp >= ends, "the cluster's clock is past stage 1's deadline");
  const paid = await reread(r.ctxOf(holder), same.campaign);
  check(names(paid.sent) === "CampaignReread,CampaignFinalized", "re-read: the same reading, finalized after the wait");
  const settled = await state(same);
  check(settled.status >= Status.Settling && settled.outcome === Outcome.Yes, "the stored YES stands, never rewritten");

  console.log("\n▸ contest: the reading moved, so stage 2; a team key cannot decide, the admin confirms");
  const moved = await open("+5d");
  await contested(rpc, r, holder, moved);
  await burn(rpc, holder, moved, 5_000n);
  const escalated = await reread(r.ctxOf(holder), moved.campaign);
  check(names(escalated.sent) === "CampaignReread", "re-read: a different reading");
  check((await state(moved)).contestStage === ContestStage.Stage2, "stage 2: the admin has 48 hours");
  await refusedBefore("a team key deciding (the admin's act)", () =>
    decide(r.ctxOf(r.team), moved.campaign, "Confirm", null, "Not the team's decision."),
  );
  const confirmed = await decide(r.ctxOf(r.admin), moved.campaign, "Confirm", null, "The supply only fell further.");
  check(names(confirmed.sent) === "ContestClosed,CampaignFinalized", "the admin confirmed: the stored YES stands");
  check((await state(moved)).outcome === Outcome.Yes, "a confirm never inverts the outcome");

  console.log(
    "\n▸ contest: a team key sends it to stage 2 itself (--escalate), and the admin voids, its hash on-chain",
  );
  const voided = await open("+5d");
  await contested(rpc, r, holder, voided);
  const sentOn = await contest(r.ctxOf(r.team), voided.campaign, true);
  check(names(sentOn.sent) === "ContestOpened", "a team key's escalation during stage 1, byte 2 (ContestOpened)");
  check((await state(voided)).contestStage === ContestStage.Stage2, "stage 2: the admin has 48 hours");
  await refusedWith("a second escalation", "WrongContestStage", () => contest(r.ctxOf(r.team), voided.campaign, true));
  const text = "The token's supply was moved by its issuer during the review.";
  const decided = await decide(r.ctxOf(r.admin), voided.campaign, "Void", "TeamOutsideCause", text, logDir);
  const event = decided.sent?.events.find((e) => e.name === "ContestClosed")?.data as unknown as
    { noteHash: Uint8Array } | undefined;
  const hash = createHash("sha256").update(readFileSync(decided.path!)).digest("hex");
  check(event && bytesToHex(event.noteHash) === hash, `the admin's void: note hash = sha256 of its record`);
  check((await state(voided)).outcome === Outcome.Void, "the admin's void records Void, and the snapshot follows");

  console.log(
    "\n▸ contest: the reader in doubt: --escalate on a result in review opens and escalates in one transaction",
  );
  const doubt = await open("+5d");
  await resolved(rpc, holder, doubt);
  const both = await contest(r.ctxOf(r.team), doubt.campaign, true);
  check(names(both.sent) === "ContestOpened,ContestOpened", "one transaction: the opening, then the escalation");
  check((await state(doubt)).contestStage === ContestStage.Stage2, "stage 2 at once: the admin has 48 hours");
}
