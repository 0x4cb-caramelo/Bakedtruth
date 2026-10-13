/**
 * Purpose: the contest in `@brot/sdk` (Sprint 14, lane L14B): the decision builder refuses what the program refuses
 *          from the arguments alone; the summary trusts the re-read and the admin's decision as the SDK builds them
 *          and says what each signs (the decision, its reason and what happens to the 10% opening fee); a changed
 *          role, a decision byte no variant has, or a hand-built pair the program refuses is flagged. Needs no binary.
 *          Filter: `bun test tests/ -t "contest sdk"`.
 * Version: 0.1.0
 * Sprint:  14 (lane L14B)
 */
import { describe, expect, test } from "bun:test";
import { AccountRole, generateKeyPairSigner, type Instruction } from "@solana/kit";

import { campaignAddress, ContestDecision, VoidReason } from "@brot/sdk/read";
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

  test("contest sdk: the summary trusts a re-read and says what it does", async () => {
    const { campaign } = await world();
    const reread = await T.buildRereadCampaign({ campaign, metricAccount: P.BTC_USD_ACCOUNT });
    expect(item(reread)).toMatchObject({ name: "RereadCampaign", trusted: true, lamportsAtMost: 0n });
    expect(item(reread).text).toBe(
      `Run the reading of contested campaign ${campaign} again from ${P.BTC_USD_ACCOUNT}: the same result pays out as stored; a different one opens 48 hours for the admin to confirm or void`,
    );
    const proof = (await generateKeyPairSigner()).address;
    const offered = await T.buildRereadCampaign({ campaign, metricAccount: P.BTC_USD_ACCOUNT, proofAccount: proof });
    expect(item(offered).text).toContain(`, with ${proof} offered as proof:`);
  });

  test("contest sdk: the summary trusts the admin's decision and names the fee's way", async () => {
    const { campaign, decide } = await world();
    const confirm = item(await decide(ContestDecision.Confirm));
    expect(confirm).toMatchObject({ name: "AdminDecideContest", trusted: true, lamportsAtMost: 0n });
    expect(confirm.text).toBe(
      `As the admin, confirm the stored result of contested campaign ${campaign}: it pays out as stored; note hash ${NOTE_HEX}`,
    );
    const house = item(await decide(ContestDecision.Void, VoidReason.TeamHouseFailure)).text;
    expect(house).toBe(
      `As the admin, void contested campaign ${campaign} (TeamHouseFailure): every entry and the prize go back, and the 10% opening fee goes back to whoever opened; note hash ${NOTE_HEX}`,
    );
    const outside = item(await decide(ContestDecision.Void, VoidReason.TeamOutsideCause)).text;
    expect(outside).toContain("(TeamOutsideCause): every entry and the prize go back, and the 10% opening fee stays");
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
    expect(open.text).toContain("never to invert");
  });
});
