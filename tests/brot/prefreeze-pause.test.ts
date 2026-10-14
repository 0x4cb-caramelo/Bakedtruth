/**
 * Purpose: I10′ with every instruction (G-10 of the audit package; the test Sprint 16 names): with entries paused, the
 *          program refuses exactly the three instructions that bring new money, `user_open_campaign`
 *          (`OpenWhilePaused`, a paid opening and a team key's free one alike), `user_join_campaign` and
 *          `sponsor_join_campaign` (`JoinWhilePaused`). Every other
 *          instruction of the IDL runs under the pause, through a real life cycle (a NO split to its close, a stale
 *          feed voided by the team, a NO confirmed, a NO contested to the admin), or refuses for a reason of its own
 *          (the config exists; the pause is on already), never the pause's. The payouts move their lamports. The list
 *          is the IDL's: an instruction added later fails this test until it is walked here.
 * Version: 0.0.2 (the review's F7: a team key's free opening; the static check is prefreeze-pause-static.test.ts)
 * Sprint:  16 (lane L16P, the pre-freeze hardening and its review). Needs target/deploy/brot_markets.so.
 */
import { describe, expect, test } from "bun:test";

import type { Address, Instruction, KeyPairSigner } from "@solana/kit";

import { BROT_MARKETS_IDL, ContestDecision, ContestStage, VoidReason } from "@brot/sdk/read";
import * as B from "@brot/sdk/tx";

import { BrotError } from "./errors";
import * as F from "./flows";
import { refreshBase, refreshSol, setBtc } from "./invariant-harness";
import * as P from "./program";
import { sealedEntry } from "./sealed-support";
import { balance, createWorld, expectOk, fundedWallet, send, setTime, type Sent } from "./setup";

/** The pause refuses exactly these, each with its own error. */
const NEW_MONEY: Record<string, string> = {
  UserOpenCampaign: "OpenWhilePaused",
  UserJoinCampaign: "JoinWhilePaused",
  SponsorJoinCampaign: "JoinWhilePaused",
};
/** Refused under the pause for a reason of their own: the config exists already; the pause is on already. */
const OWN_REASON: Record<string, string> = {
  AdminInitializeConfig: "AlreadyInitialized",
  TeamPauseEntries: "AlreadyPaused",
};
const NOTE = new Uint8Array(32).fill(16);

/** "ok", or the program's error name (the runtime's text for any other failure). */
const outcome = (sent: Sent) =>
  sent.ok ? "ok" : (Object.entries(BrotError).find(([, code]) => code === sent.code)?.[0] ?? sent.error);

describe("paused campaign refuses new money, never payouts", () => {
  test("paused campaign refuses new money, never payouts: every instruction of the IDL under the pause", async () => {
    const w = await createWorld();
    const { admin, feeRecipient } = await F.initConfig(w);
    const team = await F.setTeam(w, admin, 2);
    const creator = await fundedWallet(w, 1_000n);
    const [ana, bia, sponsor, referee] = [
      await fundedWallet(w, 100n),
      await fundedWallet(w, 100n),
      await fundedWallet(w, 1_000n),
      await fundedWallet(w, 1n),
    ];
    refreshBase(w);
    refreshSol(w);
    // Four paid price campaigns with the same deadline: `a` splits a NO to its close, `b` goes stale and the team
    // records the cause, `c` is contested up to the admin, `d` is confirmed.
    const [a, b, c, d] = [
      (await F.openedCampaign(w, creator)).campaign,
      (await F.openedCampaign(w, creator)).campaign,
      (await F.openedCampaign(w, creator)).campaign,
      (await F.openedCampaign(w, creator)).campaign,
    ];
    const bakers = new Map<Address, KeyPairSigner[]>([
      [a, [ana, bia, sponsor]],
      [b, [bia]],
      [c, [ana, bia]],
      [d, [ana]],
    ]);
    for (const [campaign, list] of bakers) {
      for (const baker of list.filter((x) => x !== sponsor)) {
        const side = baker === ana ? P.Side.Yes : P.Side.No;
        expectOk(await F.join(w, baker, campaign, { side, amount: P.SOL }));
      }
    }
    expectOk(await sealedEntry(w, sponsor, a, { side: P.Side.Yes }));
    expectOk(await send(w, [await B.buildPauseEntries({ teamMember: team[0] })]));

    // Each instruction's outcome under the pause; a name sent more than once keeps its first refusal.
    const ran = new Map<string, Sent>();
    const keep = (name: string, sent: Sent) => {
      if (ran.get(name)?.ok !== false) ran.set(name, sent);
      return sent;
    };
    const run = async (name: string, ...ixs: Instruction[]) => keep(name, await send(w, ixs));

    // New money stops: an opening, a join, a sealed entry.
    keep("UserOpenCampaign", (await F.openPriceCampaign(w, creator)).sent);
    // A team key's free opening is refused the same way: the pause stops openings whoever pays (F7).
    const free = await F.openPriceCampaign(w, team[0], { openingUsd: 0n, maxLamports: 0n });
    expect(outcome(keep("UserOpenCampaign", free.sent))).toBe("OpenWhilePaused");
    keep("UserJoinCampaign", await F.join(w, ana, a, { side: P.Side.Yes, amount: P.SOL, expectedEntryTotal: P.SOL }));
    keep("SponsorJoinCampaign", await sealedEntry(w, sponsor, a, { side: P.Side.Yes }));
    // Nothing else: a referral link, the team and the creation rules, a second pause, a second config.
    await run("UserLinkReferrer", await B.buildUserLinkReferrer({ referee, referrer: ana.address }));
    await run("AdminSetTeam", await B.buildSetTeam({ admin, team: team.map((t) => t.address) }));
    const params = F.sdkParams(F.DEFAULT_PARAMS);
    await run("AdminSetCreationParams", await B.buildSetCreationParams({ admin, params }));
    await run("TeamPauseEntries", await B.buildPauseEntries({ teamMember: team[1] }));
    const authority = w.upgradeAuthority;
    const again = { authority, admin: admin.address, feeRecipient: feeRecipient.address, params };
    await run("AdminInitializeConfig", await B.buildInitializeConfig(again));

    // Resolution after the deadline: `b` reads a feed gone stale before it (an automatic void), the rest a NO.
    const deadline = F.readCampaign(w, a).deadline_at as bigint;
    setTime(w.client, deadline + 61n);
    const metricAccount = P.BTC_USD_ACCOUNT;
    setBtc(w, F.BTC_PRICE, deadline - P.STALE_FEED_MIN_SECONDS - 1n);
    await run("ResolveCampaign", B.buildResolveCampaign({ campaign: b, metricAccount }));
    setBtc(w, F.BTC_PRICE, deadline + 30n);
    for (const campaign of [a, c, d]) await run("ResolveCampaign", B.buildResolveCampaign({ campaign, metricAccount }));
    for (const [campaign, list] of bakers) {
      for (const baker of list) {
        const to = Number((await F.readEntry(w, campaign, baker.address)).join_count);
        await run("TallyLateJoins", await B.buildTallyLateJoins({ campaign, baker: baker.address, from: 0, to }));
      }
    }

    // The window's acts: the team records the stale feed's cause, confirms `d` and contests `c`; a newer price makes
    // the re-read differ, which sends the contest to the admin, who confirms the stored NO.
    const reason = VoidReason.TeamOutsideCause;
    await run(
      "TeamVoidCampaign",
      await B.buildTeamVoidCampaign({ teamMember: team[0], campaign: b, reason, noteHash: NOTE }),
    );
    await run("TeamConfirmResult", await B.buildTeamConfirmResult({ teamMember: team[1], campaign: d }));
    const stage = ContestStage.Stage1;
    await run("TeamOpenContest", await B.buildTeamOpenContest({ teamMember: team[0], campaign: c, stage }));
    setBtc(w, F.BTC_PRICE + 1n, deadline + 50n);
    await run("RereadCampaign", await B.buildRereadCampaign({ campaign: c, metricAccount }));
    const decision = ContestDecision.Confirm;
    await run("AdminDecideContest", await B.buildAdminDecideContest({ admin, campaign: c, decision, noteHash: NOTE }));

    // `a` after its window: the snapshot, every payout, the held fee, Brot's fee, the prize's flag, the close, the sweep.
    setTime(w.client, (F.readCampaign(w, a).review_ends_at as bigint) + 1n);
    await run("FinalizeCampaign", await B.buildFinalizeCampaign({ campaign: a }));
    const [biaBefore, creatorBefore, feesBefore] = [bia, creator, feeRecipient].map((x) => balance(w, x.address));
    for (const baker of bakers.get(a)!) {
      await run("SettleEntry", await B.buildSettleEntry({ campaign: a, baker: baker.address }));
    }
    await run("SettleSealedFee", await B.buildSettleSealedFee({ campaign: a, sponsor: sponsor.address }));
    await run("SettleCreatorShare", await B.buildSettleCreatorShare({ campaign: a, creator: creator.address }));
    await run("CollectFee", await B.buildCollectFee({ campaign: a }));
    await run("SettlePrize", await B.buildSettlePrize({ campaign: a, recipient: creator.address }));
    await run("CloseCampaign", await B.buildCloseCampaign({ campaign: a, rentPayer: creator.address }));
    await run("SweepFees", await B.buildSweepFees({ feeRecipient: feeRecipient.address }));
    // Bia's NO won the split: more than her 1 SOL back; the creator's share and the rents, Brot's fees, all paid.
    expect(balance(w, bia.address) - biaBefore).toBeGreaterThan(P.SOL);
    expect(balance(w, creator.address)).toBeGreaterThan(creatorBefore);
    expect(balance(w, feeRecipient.address)).toBeGreaterThan(feesBefore);

    // The admin's own acts, the handover last; the pause holds until the new admin ends it.
    const [newAdmin, newRecipient] = [await fundedWallet(w), await fundedWallet(w, 1n)];
    await run("AdminSetFeeRecipient", await B.buildSetFeeRecipient({ admin, feeRecipient: newRecipient.address }));
    await run("AdminTransferAdmin", await B.buildTransferAdmin({ admin, newAdmin: newAdmin.address }));
    await run("AdminAcceptAdmin", await B.buildAcceptAdmin({ newAdmin }));
    expect((await F.readConfig(w)).operating_level).toBe(P.OperatingLevel.EntriesHalted);
    await run("AdminResumeEntries", await B.buildResumeEntries({ admin: newAdmin }));

    const names = BROT_MARKETS_IDL.instructions.map((ix) => ix.name);
    expect(names.length).toBe(27);
    const want = Object.fromEntries(names.map((n) => [n, NEW_MONEY[n] ?? OWN_REASON[n] ?? "ok"]));
    const got = Object.fromEntries(names.map((n) => [n, ran.has(n) ? outcome(ran.get(n)!) : "not run"]));
    expect(got).toEqual(want);
  });
});
