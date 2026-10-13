/**
 * Purpose: the contest in `@brot/sdk` (Sprint 14, lane L14B): the decision builder refuses what the program refuses
 *          from the arguments alone; the summary trusts the re-read and the admin's decision as the SDK builds them
 *          and says what each signs (a matching re-read's 24-hour wait, the team's opening or escalation, the decision,
 *          its reason and what happens to the 10% opening fee); a changed role, a decision byte no variant has, or a
 *          hand-built pair the program refuses is flagged. Needs no binary. Filter: `bun test tests/ -t "contest sdk"`.
 * Version: 0.1.2 (D2: the wait and the escalation; review fixes F6, the fee's branch, and F9, no proof by default)
 * Sprint:  14 (lane L14B)
 */
import { describe, expect, test } from "bun:test";
import { AccountRole, generateKeyPairSigner, type Instruction } from "@solana/kit";

import {
  ACCOUNT_TAG,
  campaignAddress,
  ContestDecision,
  ContestStage,
  getCampaignDecoder,
  LAYOUT_VERSION,
  PROGRAM_ID,
  Status,
  VoidReason,
  type Campaign,
} from "@brot/sdk/read";
import * as T from "@brot/sdk/tx";

import * as IL from "../brot/instructions-14-15";
import * as P from "../brot/program";

const NOTE = new Uint8Array(32).fill(3);
const NOTE_HEX = "03".repeat(32);

async function world() {
  const admin = await generateKeyPairSigner();
  const campaign = await campaignAddress(14n);
  const decide = (decision: ContestDecision, voidReason?: VoidReason) =>
    T.buildAdminDecideContest({ admin, campaign, decision, voidReason, noteHash: NOTE });
  return { admin, campaign, decide, config: await P.configPda() };
}

const item = (ix: Instruction) => T.summarizeInstructions([ix]).items[0];

/** A campaign as the program stores one, every field zero (no entry: `firstBaker` all zeros) but the tag, then `over`. */
function stored(over: Partial<Campaign>): Campaign {
  const data = new Uint8Array(512);
  data.set([ACCOUNT_TAG.campaign, LAYOUT_VERSION]);
  return { ...getCampaignDecoder().decode(data), ...over };
}

describe("contest sdk", () => {
  test("contest sdk: the decision builder refuses what the program refuses from the arguments", async () => {
    const { decide } = await world();
    for (const reason of [VoidReason.MissedWindow, VoidReason.TeamHouseFailure, VoidReason.StaleFeed]) {
      expect(T.contestDecisionProblem(ContestDecision.Confirm, reason)).toBe("ConfirmWithVoidReason");
      await expect(decide(ContestDecision.Confirm, reason)).rejects.toThrow("ConfirmWithVoidReason");
    }
    for (const reason of [VoidReason.None, VoidReason.UnreadableAccount]) {
      expect(T.contestDecisionProblem(ContestDecision.Void, reason)).toBe("VoidReasonNotForTeam");
      await expect(decide(ContestDecision.Void, reason)).rejects.toThrow("VoidReasonNotForTeam");
    }
    expect(T.contestDecisionProblem(ContestDecision.Confirm, VoidReason.None)).toBeNull();
    for (const reason of T.TEAM_VOID_REASONS) expect(T.contestDecisionProblem(ContestDecision.Void, reason)).toBeNull();
    const { admin, campaign } = await world();
    const short = { admin, campaign, decision: ContestDecision.Confirm, noteHash: new Uint8Array(31) };
    await expect(T.buildAdminDecideContest(short)).rejects.toThrow("32 bytes");
  });

  test("contest sdk: the summary trusts a re-read, offers no proof unless asked, and names any proof offered", async () => {
    const { campaign } = await world();
    const reread = await T.buildRereadCampaign({ campaign, metricAccount: P.BTC_USD_ACCOUNT });
    // Review fix F9: the default proof slot is the program's own address, which the program reads as none offered.
    expect(reread.accounts![3].address).toBe(PROGRAM_ID);
    expect(item(reread)).toMatchObject({ name: "RereadCampaign", trusted: true, lamportsAtMost: 0n });
    expect(item(reread).text).toBe(
      `Run the reading of contested campaign ${campaign} again from ${P.BTC_USD_ACCOUNT}: the same result pays out as stored, but only from stage 1's deadline on, 24 hours after the contest opened (before it the program refuses the re-read, RereadBeforeTimelock); a different one opens stage 2, where the admin may confirm or void for 48 hours (counted from stage 1's deadline once that has passed)`,
    );
    // D2: read at stage 1, the campaign's own deadline is dated.
    const atStage1 = stored({ status: Status.Contested, contestStage: ContestStage.Stage1, contestEndsAt: 86_400n });
    const dated = T.summarizeInstructions([reread], { context: { campaigns: new Map([[campaign, atStage1]]) } });
    expect(dated.items[0].text).toContain("only from stage 1's deadline on (1970-01-02 00:00:00 UTC), 24 hours after");
    // Any proof offered is named, the metric account itself included.
    for (const proof of [(await generateKeyPairSigner()).address, P.BTC_USD_ACCOUNT]) {
      const offered = await T.buildRereadCampaign({ campaign, metricAccount: P.BTC_USD_ACCOUNT, proofAccount: proof });
      expect(item(offered).text).toContain(
        `, with ${proof} offered as proof (a proof the reader refuses refuses the re-read):`,
      );
    }
  });

  test("contest sdk: the summary trusts the admin's decision and names the fee's way", async () => {
    const { campaign, decide } = await world();
    const confirm = item(await decide(ContestDecision.Confirm));
    expect(confirm).toMatchObject({ name: "AdminDecideContest", trusted: true, lamportsAtMost: 0n });
    expect(confirm.text).toBe(
      `As the admin, confirm the stored result of contested campaign ${campaign}: it pays out as stored; note hash ${NOTE_HEX}`,
    );
    const outside = item(await decide(ContestDecision.Void, VoidReason.TeamOutsideCause)).text;
    expect(outside).toContain("(TeamOutsideCause): every entry and the prize go back, and the 10% opening fee stays");
  });

  test("contest sdk: a house-failure void promises the fee's refund only when an entry landed (review fix F6)", async () => {
    const { campaign, decide } = await world();
    const house = await decide(ContestDecision.Void, VoidReason.TeamHouseFailure);
    const voidText = (context?: T.SummaryContext) => T.summarizeInstructions([house], { context }).items[0].text;
    const prefix = `As the admin, void contested campaign ${campaign} (TeamHouseFailure): `;
    // The campaign not read: the rule, both branches.
    expect(voidText()).toBe(
      `${prefix}every entry and the prize go back, and the 10% opening fee goes back to whoever opened if any entry landed (with no entry, Brot keeps it); note hash ${NOTE_HEX}`,
    );
    // Read: the branch the program takes (founder answer 8 keeps the fee of a pot nobody joined).
    const withEntries = stored({ firstBaker: (await generateKeyPairSigner()).address });
    expect(voidText({ campaigns: new Map([[campaign, withEntries]]) })).toBe(
      `${prefix}every entry and the prize go back, and the 10% opening fee goes back to whoever opened; note hash ${NOTE_HEX}`,
    );
    expect(voidText({ campaigns: new Map([[campaign, stored({})]]) })).toBe(
      `${prefix}the prize goes back, and with no entry in the pot Brot keeps the 10% opening fee; note hash ${NOTE_HEX}`,
    );
  });

  test("contest sdk: a pair the program refuses, a decision byte no variant has, or a changed role is flagged", async () => {
    const { admin, campaign, config, decide } = await world();
    // Hand-built with the kit's raw builder: the SDK's own builder refuses these.
    const raw = (decision: number, voidReason: number) =>
      IL.adminDecideContestIx(admin, config, campaign, { decision, voidReason, noteHash: NOTE });
    expect(item(raw(0, VoidReason.TeamHouseFailure)).text).toContain(
      "with void reason TeamHouseFailure, which the program refuses (ConfirmWithVoidReason)",
    );
    expect(item(raw(1, VoidReason.None)).text).toContain("which the program refuses (VoidReasonNotForTeam)");
    expect(item(raw(2, VoidReason.None))).toMatchObject({ trusted: false, name: "unknown" });
    const built = await decide(ContestDecision.Confirm);
    const unsigned: Instruction = {
      ...built,
      accounts: built.accounts!.map((a, i) => (i === 0 ? { ...a, role: AccountRole.READONLY } : a)),
    };
    expect(item(unsigned)).toMatchObject({ trusted: false });
    expect(item(unsigned).text).toContain("account 1 is read-only, not read-only signer");
    const reread = await T.buildRereadCampaign({ campaign, metricAccount: P.BTC_USD_ACCOUNT });
    const trailing = { ...reread, accounts: [...reread.accounts!, { ...reread.accounts![2] }] };
    expect(item(trailing).text).toContain("carries accounts the instruction does not take");
  });

  test("contest sdk: the contest's text says the payout pauses and the result is never inverted", async () => {
    const { campaign } = await world();
    const team = await generateKeyPairSigner();
    const open = item(await T.buildTeamOpenContest({ teamMember: team, campaign }));
    expect(open).toMatchObject({ name: "TeamOpenContest", trusted: true });
    expect(open.text).toContain("its payout pauses until the reading is run again");
    expect(open.text).toContain(
      "only after stage 1's 24 hours, during which a team key may send the contest to stage 2",
    );
    expect(open.text).toContain("never to invert");
  });

  test("contest sdk: the same call opens a contest or sends one at stage 1 to the admin, named by the campaign read (D2)", async () => {
    const { campaign } = await world();
    const built = await T.buildTeamOpenContest({ teamMember: await generateKeyPairSigner(), campaign });
    const text = (read?: Campaign) =>
      T.summarizeInstructions([built], { context: read && { campaigns: new Map([[campaign, read]]) } }).items[0].text;
    const escalate =
      "the re-read closes and the admin has 48 hours to confirm or void the stored result, never to invert it";
    // Not read: both branches.
    expect(text()).toContain(
      `; on a contest still at stage 1, before its deadline, the same call sends it to stage 2: ${escalate}`,
    );
    // In review: the opening alone.
    const review = text(stored({ status: Status.InReview }));
    expect(review.startsWith(`Contest the result of campaign ${campaign}: `)).toBe(true);
    expect(review).not.toContain("the same call sends it");
    // At stage 1: the escalation, with stage 1's deadline dated, and the refusal from it on.
    const atStage1 = stored({ status: Status.Contested, contestStage: ContestStage.Stage1, contestEndsAt: 86_400n });
    expect(text(atStage1)).toBe(
      `Send the contest of campaign ${campaign} to stage 2 before stage 1's deadline (1970-01-02 00:00:00 UTC), from which the program refuses it (ContestDeadlinePassed): ${escalate} (with no decision by then, it pays out as stored)`,
    );
    // At stage 2: the refusal.
    const atStage2 = stored({ status: Status.Contested, contestStage: ContestStage.Stage2, contestEndsAt: 86_400n });
    expect(text(atStage2)).toBe(
      `Send the contest of campaign ${campaign} to stage 2, which the program refuses: it is at stage 2 already (WrongContestStage)`,
    );
  });
});
