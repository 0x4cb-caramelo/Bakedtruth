/**
 * Purpose: the read half's hand-written values the relay depends on (Sprint 08), checked so they cannot drift: the
 *          two instruction discriminators of the country gate against the Codama client generated from the IDL, and
 *          the program ids it accepts in a transaction against the tx half's and the Sprint 03 record. Needs no
 *          binary.
 * Version: 0.1.0
 * Sprint:  08 (indexer, API, relay and points)
 */
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

import * as R from "@brot/sdk/read";
import * as T from "@brot/sdk/tx";
import { USER_JOIN_CAMPAIGN_DISCRIMINATOR } from "../../packages/sdk/src/idl/generated/instructions/userJoinCampaign";
import { USER_OPEN_CAMPAIGN_DISCRIMINATOR } from "../../packages/sdk/src/idl/generated/instructions/userOpenCampaign";

describe("the relay's constants match their sources", () => {
  test("the join and open discriminators are the generated client's", () => {
    expect(R.INSTRUCTION_DISCRIMINATOR).toEqual({
      userOpenCampaign: USER_OPEN_CAMPAIGN_DISCRIMINATOR,
      userJoinCampaign: USER_JOIN_CAMPAIGN_DISCRIMINATOR,
    });
  });

  test("ComputeBudget is the tx half's, and Lighthouse the address Sprint 03 recorded", () => {
    expect(T.COMPUTE_BUDGET_PROGRAM_ID).toBe(R.COMPUTE_BUDGET_PROGRAM_ID);
    expect(readFileSync("knowledge-base/tecnologia/lighthouse.md", "utf8")).toContain(R.LIGHTHOUSE_PROGRAM_ID);
  });
});
