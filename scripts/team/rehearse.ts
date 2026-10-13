/**
 * Purpose: rehearse every team script on a local offline surfnet, inside a loopback-only network namespace: the
 *          admin sets the team and the creation parameters; a team key pauses and the admin resumes; a stranger
 *          and a team key acting as admin are refused before anything is built; a team key opens free campaigns;
 *          a void of a YES is refused by the program (simulated, nothing written); a team key confirms a YES a baker
 *          joined, its late-join tally first; the contest (rehearse-contest.ts): a re-read that pays, a stage 2 the
 *          admin confirms and one the admin voids; and, after the deadline, the team voids an automatic void with its
 *          record's hash on-chain.
 * Version: 0.2.0 (Sprint 14: the contest is real; the confirm tallies first)
 * Sprint:  05 (SDK and the devnet cycle), lane OPS; 14 (lane INV14)
 *
 * `bun run scripts/team/rehearse.ts`. The void records go to a temporary folder, not content/void-log/.
 */
import { createHash } from "node:crypto";
import { mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { generateKeyPairSigner, type Address, type KeyPairSigner } from "@solana/kit";

import { Outcome, Side, Status, bytesToHex, campaignAddress, decodeCampaign } from "@brot/sdk/read";
import { buildJoinCampaign, buildResolveCampaign } from "@brot/sdk/tx";

import { check, type Session } from "../devnet";
import { initializeConfig, readInitParams } from "../deploy/initialize";
import { burnMint } from "../validator/cycle-open";
import { isolateOrExit } from "../validator/isolate";
import { account, airdrop, clock, expectOk, send, type Rpc } from "../validator/rpc";
import { setAccount } from "../validator/surfnet";
import { SOL, startLocalWorld } from "../validator/world";
import type { TeamContext } from "./common";
import { confirm } from "./confirm";
import { openTeamCampaign } from "./open";
import { pause } from "./pause";
import { rehearseContest } from "./rehearse-contest";
import { resume } from "./resume";
import { setParams } from "./set-params";
import { setTeamKeys } from "./set-team";
import { voidCampaign } from "./void";

isolateOrExit(import.meta.path);

const ctxOf = (rpc: Rpc, signer: KeyPairSigner, yes = true): TeamContext => ({ rpc, signer, yes });

async function refusedBefore(label: string, attempt: () => Promise<unknown>) {
  const error = await attempt().then(
    () => null,
    (e: Error) => e,
  );
  check(error !== null, `${label}: refused before anything is built (${error?.message})`);
}

/** A free burn campaign opened by a team key, its mint held by `holder`, then resolved by anyone. */
async function teamBurnCampaign(rpc: Rpc, team: KeyPairSigner, holder: KeyPairSigner, deadline: string) {
  const { mint, holding } = await burnMint({ rpc, payer: holder } as Session, holder, 1_000_000n);
  const spec = { kind: "SupplyAtMost" as const, metric: mint, target: "990000", deadline };
  const opened = await openTeamCampaign(ctxOf(rpc, team), spec);
  check(opened.sent?.events[0]?.name === "CampaignOpened", `team opening ${opened.id}: free (CampaignOpened)`);
  return { campaign: await campaignAddress(opened.id), mint, holding };
}

async function main() {
  const world = await startLocalWorld();
  const rpc = world.rpc;
  const logDir = mkdtempSync(join(tmpdir(), "brot-void-log-"));
  try {
    const [admin, alice, bob, stranger] = await Promise.all([1, 2, 3, 4].map(() => generateKeyPairSigner()));
    for (const s of [admin, alice, bob, stranger]) await airdrop(rpc, s.address, 50n * SOL);
    const params = readInitParams("deploy/devnet/init-params.json");
    await initializeConfig(rpc, world.upgradeAuthority, {
      authority: world.upgradeAuthority,
      admin: admin.address,
      feeRecipient: admin.address,
      params,
    });

    console.log("\n▸ set-team (admin): a dry run sends nothing, then --yes");
    check(
      (await setTeamKeys(ctxOf(rpc, admin, false), [alice.address, bob.address])).sent === null,
      "dry run: nothing sent",
    );
    check((await setTeamKeys(ctxOf(rpc, admin), [alice.address, bob.address])).sent?.ok, "team set to alice and bob");

    console.log("\n▸ roles are checked against the stored config");
    await refusedBefore("a stranger pausing", () => pause(ctxOf(rpc, stranger)));
    await refusedBefore("a team key resuming (the admin's act)", () => resume(ctxOf(rpc, alice)));
    await refusedBefore("a team key setting params", () => setParams(ctxOf(rpc, alice), params));

    console.log("\n▸ pause (team) and resume (admin)");
    check((await pause(ctxOf(rpc, alice))).sent?.events[0]?.name === "EntriesPaused", "alice paused entries");
    check((await resume(ctxOf(rpc, admin))).sent?.events[0]?.name === "EntriesResumed", "the admin resumed");

    console.log("\n▸ set-params (admin): the diff, then --yes");
    const file = join(logDir, "params.json");
    const raw = JSON.parse(readFileSync("deploy/devnet/init-params.json", "utf8"));
    writeFileSync(file, JSON.stringify({ ...raw, maxOpenCampaigns: 900 }));
    check(
      (await setParams(ctxOf(rpc, admin), readInitParams(file))).sent?.ok,
      "maxOpenCampaigns 1000 -> 900, params_version 1",
    );

    console.log("\n▸ open (team, free): a price campaign by feed symbol, and a burn campaign");
    const btc = await openTeamCampaign(ctxOf(rpc, alice), {
      kind: "PriceTouch",
      feed: "BTC/USD",
      direction: "above",
      target: "9500000000000",
      deadline: "+7d",
    });
    check(btc.sent?.ok, `BTC/USD above 95,000 opened free (${btc.id})`);
    const yes = await teamBurnCampaign(rpc, alice, bob, "+4d");
    const { prizeLamports, creatorIsTeam, creatorShareBps } = decodeCampaign((await account(rpc, yes.campaign))!);
    check(prizeLamports === 0n && creatorIsTeam && creatorShareBps === 0, "no prize, no creator share (P-3)");

    console.log("\n▸ a YES in review a baker joined: a void refused by the program, the confirm tallies first");
    const joinArgs = { baker: stranger, campaign: yes.campaign, metricAccount: yes.mint, side: Side.Yes, joinIndex: 0 };
    const joinIx = await buildJoinCampaign({ ...joinArgs, amount: SOL / 10n, minReturnBps: 0, expectedEntryTotal: 0n });
    expectOk(await send(rpc, stranger, [joinIx]), "a baker joins before the burn");
    const { burnIx } = await import("../validator/spl-token");
    expectOk(await send(rpc, bob, [burnIx(yes.holding, yes.mint, bob, 10_000n)]), "burn");
    expectOk(
      await send(rpc, bob, [buildResolveCampaign({ campaign: yes.campaign, metricAccount: yes.mint })]),
      "resolve",
    );
    await refusedBefore("void of a YES", () =>
      voidCampaign(ctxOf(rpc, alice), yes.campaign, "TeamOutsideCause", "text", logDir),
    );
    check(
      readdirSync(logDir).every((f) => !f.endsWith(".md")),
      "no void record was written for the refused void",
    );
    const confirmed = await confirm(ctxOf(rpc, alice), yes.campaign);
    const events = confirmed.sent?.events.map((e) => e.name).join();
    check(
      events === "LateTallied,ResultConfirmed,CampaignFinalized",
      `alice confirmed the YES, tallied first (${events})`,
    );

    await rehearseContest(
      rpc,
      { ctxOf: (s) => ctxOf(rpc, s), team: alice, admin },
      bob,
      (d) => teamBurnCampaign(rpc, alice, bob, d),
      logDir,
    );

    console.log("\n▸ an automatic void (unreadable after the deadline), then the team's void with its record");
    const late = await teamBurnCampaign(rpc, alice, bob, "+3d");
    await setAccount(rpc, late.mint, {
      lamports: SOL,
      data: new Uint8Array(82),
      owner: "11111111111111111111111111111111",
    });
    const deadline = decodeCampaign((await account(rpc, late.campaign))!).deadlineAt;
    await rpc.call("surfnet_timeTravel", [{ absoluteTimestamp: Number(deadline + 120n) * 1000 }]);
    check((await clock(rpc)).unixTimestamp > deadline, "the cluster's clock is past the deadline");
    expectOk(
      await send(rpc, bob, [buildResolveCampaign({ campaign: late.campaign, metricAccount: late.mint })]),
      "resolve",
    );
    check(
      decodeCampaign((await account(rpc, late.campaign))!).outcome === Outcome.Void,
      "resolve: automatic void (UnreadableAccount)",
    );
    const voided = await voidCampaign(
      ctxOf(rpc, alice),
      late.campaign,
      "TeamOutsideCause",
      "The mint's account was closed.",
      logDir,
    );
    const record = readFileSync(voided.path!);
    const event = voided.sent?.events.find((e) => e.name === "CampaignVoided")?.data as
      { noteHash: Uint8Array } | undefined;
    const hash = createHash("sha256").update(record).digest("hex");
    check(
      event && bytesToHex(event.noteHash) === hash,
      `on-chain note hash = sha256 of the saved record (${hash.slice(0, 16)}…)`,
    );
    check(
      decodeCampaign((await account(rpc, late.campaign))!).status >= Status.Settling,
      "the void finalized the campaign",
    );
    console.log("\nteam scripts: every act behaved as expected");
  } finally {
    world.surfnet.stop();
  }
}

main().catch((error) => {
  console.error(`\nteam rehearsal FAILED: ${error instanceof Error ? error.message : error}`);
  process.exit(1);
});
