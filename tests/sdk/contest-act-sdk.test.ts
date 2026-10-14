/**
 * Purpose: the contest's act in `@brot/sdk` is its signed byte (the second review's S1, 2026-10-13): the builder takes
 *          stage 1 or 2 and nothing else; the summary names the act from the byte, never from the screen's read of
 *          the campaign, which only adds the program's refusal (`ContestAlreadyOpen`, `NotContested`,
 *          `WrongContestStage`) and stage 1's deadline; in one transaction an opening stands for the read of the
 *          instructions after it (open, then send to the admin: the runbook's "reader in doubt"); a hand-built other
 *          byte is named as refused. Needs no binary. Filter: `bun test tests/ -t "contest act sdk"`.
 * Version: 0.1.0
 * Sprint:  14 (lane L14B, the second review's S1)
 */
import { describe, expect, test } from "bun:test";
import { generateKeyPairSigner } from "@solana/kit";

import {
  ACCOUNT_TAG,
  campaignAddress,
  ContestStage,
  getCampaignDecoder,
  LAYOUT_VERSION,
  Status,
  type Campaign,
} from "@brot/sdk/read";
import * as T from "@brot/sdk/tx";

import * as IS from "../brot/instructions-settlement";
import * as P from "../brot/program";

async function world() {
  return { campaign: await campaignAddress(14n), config: await P.configPda() };
}

const item = (ix: Parameters<typeof T.summarizeInstructions>[0][number]) => T.summarizeInstructions([ix]).items[0];

/** A campaign as the program stores one, every field zero but the tag, then `over`. */
function stored(over: Partial<Campaign>): Campaign {
  const data = new Uint8Array(512);
  data.set([ACCOUNT_TAG.campaign, LAYOUT_VERSION]);
  return { ...getCampaignDecoder().decode(data), ...over };
}

describe("contest act sdk", () => {
  test("contest act sdk: the act is named from the signed byte, never from the campaign read (review S1)", async () => {
    const { campaign } = await world();
    const team = await generateKeyPairSigner();
    const text = async (stage: ContestStage.Stage1 | ContestStage.Stage2, read?: Campaign) => {
      const built = await T.buildTeamOpenContest({ teamMember: team, campaign, stage });
      const context = read && { campaigns: new Map([[campaign, read]]) };
      return T.summarizeInstructions([built], { context }).items[0].text;
    };
    const review = stored({ status: Status.InReview });
    const atStage1 = stored({ status: Status.Contested, contestStage: ContestStage.Stage1, contestEndsAt: 86_400n });
    const atStage2 = stored({ status: Status.Contested, contestStage: ContestStage.Stage2, contestEndsAt: 86_400n });
    const opening = `Contest the result of campaign ${campaign} (stage 1, 24 hours)`;
    const sending = `Send the contest of campaign ${campaign} to the admin (stage 2, 48 hours)`;
    // Byte 1 opens, whatever the screen read: on a contested campaign it is refused, never an escalation.
    for (const read of [undefined, review]) expect(await text(ContestStage.Stage1, read)).toStartWith(`${opening}: `);
    const already = `${opening}, which the program refuses: the campaign is contested already (ContestAlreadyOpen): `;
    for (const read of [atStage1, atStage2]) expect(await text(ContestStage.Stage1, read)).toStartWith(already);
    // Byte 2 sends the contest to the admin, whatever the screen read.
    const rule = "only a contest at stage 1, before stage 1's deadline";
    const refusedAt =
      "from which the program refuses it (ContestDeadlinePassed); the re-read closes and the admin has 48";
    expect(await text(ContestStage.Stage2)).toStartWith(`${sending}: ${rule}, ${refusedAt}`);
    expect(await text(ContestStage.Stage2, atStage1)).toStartWith(`${sending}: ${rule} (1970-01-02 00:00:00 UTC), `);
    const notContested = `${sending}, which the program refuses: the campaign is not contested (NotContested): `;
    expect(await text(ContestStage.Stage2, review)).toStartWith(notContested);
    const atTwo = `${sending}, which the program refuses: it is at stage 2 already (WrongContestStage): `;
    expect(await text(ContestStage.Stage2, atStage2)).toStartWith(atTwo);
  });

  test("contest act sdk: the builder takes only stage 1 or 2, and a hand-built other byte is named as refused", async () => {
    const { campaign, config } = await world();
    const team = await generateKeyPairSigner();
    for (const stage of [0, 3] as unknown as ContestStage.Stage1[]) {
      await expect(T.buildTeamOpenContest({ teamMember: team, campaign, stage })).rejects.toThrow("stage must be");
    }
    const raw = item(IS.teamOpenContestIx(team, config, campaign, 7));
    expect(raw).toMatchObject({ name: "TeamOpenContest", trusted: true });
    expect(raw.text).toBe(
      `Contest campaign ${campaign} with stage byte 7, which the program refuses (BadInstructionData): the byte is 1 (open) or 2 (send to the admin)`,
    );
  });

  test("contest act sdk: in one transaction an opening stands for the read of the instructions after it", async () => {
    const { campaign } = await world();
    const team = await generateKeyPairSigner();
    const build = (stage: ContestStage.Stage1 | ContestStage.Stage2) =>
      T.buildTeamOpenContest({ teamMember: team, campaign, stage });
    const context = { campaigns: new Map([[campaign, stored({ status: Status.InReview })]]) };
    const [open, send] = [await build(ContestStage.Stage1), await build(ContestStage.Stage2)];
    const pair = T.summarizeInstructions([open, send], { context }).items.map((i) => i.text);
    expect(pair[0]).toStartWith(`Contest the result of campaign ${campaign} (stage 1, 24 hours): `);
    expect(pair[1]).toStartWith(
      `Send the contest of campaign ${campaign} to the admin (stage 2, 48 hours): only a contest at stage 1, before stage 1's deadline, 24 hours after the opening earlier in this transaction, from which`,
    );
    const twice = T.summarizeInstructions([open, open], { context }).items.map((i) => i.text);
    expect(twice[1]).toStartWith(
      `Contest the result of campaign ${campaign} (stage 1, 24 hours), which the program refuses: an opening earlier in this transaction contests it (ContestAlreadyOpen): `,
    );
    // Alone, the read decides: the escalation of a campaign in review is refused.
    expect(T.summarizeInstructions([send], { context }).items[0].text).toContain("(NotContested)");
  });
});
