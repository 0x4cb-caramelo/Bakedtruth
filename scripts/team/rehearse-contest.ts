/**
 * Purpose: the contest's part of the team rehearsal (Sprint 14; TP §3.4.7), on the local offline surfnet of
 *          rehearse.ts: a team key contests a YES in review, and a re-read of the same reading pays at once; a contest
 *          whose reading moved (more tokens burned after the YES) goes to stage 2, where a team key cannot decide and
 *          the admin confirms; another the admin voids, with its record, whose SHA-256 is the note hash on-chain.
 * Version: 0.1.0
 * Sprint:  14 (the two-stage dispute; lane INV14)
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

import { type Address, type KeyPairSigner } from "@solana/kit";

import { ContestStage, Outcome, Status, bytesToHex, decodeCampaign } from "@brot/sdk/read";
import { buildResolveCampaign } from "@brot/sdk/tx";

import { check } from "../devnet";
import { account, expectOk, send, type Rpc } from "../validator/rpc";
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

/** A burn campaign resolved YES (the supply under its target), then contested by a team key: stage 1. */
async function contested(rpc: Rpc, r: Roles, holder: KeyPairSigner, c: Burn) {
  await burn(rpc, holder, c, 10_000n);
  expectOk(await send(rpc, holder, [buildResolveCampaign({ campaign: c.campaign, metricAccount: c.mint })]), "resolve");
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

export async function rehearseContest(
  rpc: Rpc,
  r: Roles,
  holder: KeyPairSigner,
  open: (deadline: string) => Promise<Burn>,
  logDir: string,
) {
  const state = async (c: Burn) => decodeCampaign((await account(rpc, c.campaign))!);

  console.log("\n▸ contest: the same reading, re-read by any wallet, pays at once with the stored result");
  const same = await open("+5d");
  await contested(rpc, r, holder, same);
  const paid = await reread(r.ctxOf(holder), same.campaign);
  check(names(paid.sent) === "CampaignReread,CampaignFinalized", "re-read: the same reading, finalized at once");
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

  console.log("\n▸ contest: the admin voids at stage 2, the record's hash on-chain");
  const voided = await open("+5d");
  await contested(rpc, r, holder, voided);
  await burn(rpc, holder, voided, 5_000n);
  check(names((await reread(r.ctxOf(holder), voided.campaign)).sent) === "CampaignReread", "stage 2 again");
  const text = "The token's supply was moved by its issuer during the review.";
  const decided = await decide(r.ctxOf(r.admin), voided.campaign, "Void", "TeamOutsideCause", text, logDir);
  const event = decided.sent?.events.find((e) => e.name === "ContestClosed")?.data as unknown as
    { noteHash: Uint8Array } | undefined;
  const hash = createHash("sha256").update(readFileSync(decided.path!)).digest("hex");
  check(event && bytesToHex(event.noteHash) === hash, `the admin's void: note hash = sha256 of its record`);
  check((await state(voided)).outcome === Outcome.Void, "the admin's void records Void, and the snapshot follows");
}
