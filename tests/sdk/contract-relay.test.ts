/**
 * Purpose: the read half's hand-written values the relay depends on (Sprint 08), checked so they cannot drift: the
 *          three instruction discriminators of the country gate (the sealed entry's since Sprint 15) against the
 *          Codama client generated from the IDL, and the program ids it accepts in a transaction against the tx
 *          half's and the Sprint 03 record. Needs no binary.
 * Version: 0.1.1
 * Sprint:  08 (indexer, API, relay and points); 15 (lane L15: the sealed entry)
 */
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

import * as R from "@brot/sdk/read";
import * as T from "@brot/sdk/tx";
import { SPONSOR_JOIN_CAMPAIGN_DISCRIMINATOR } from "../../packages/sdk/src/idl/generated/instructions/sponsorJoinCampaign";
import { USER_JOIN_CAMPAIGN_DISCRIMINATOR } from "../../packages/sdk/src/idl/generated/instructions/userJoinCampaign";
import { USER_OPEN_CAMPAIGN_DISCRIMINATOR } from "../../packages/sdk/src/idl/generated/instructions/userOpenCampaign";

describe("the relay's constants match their sources", () => {
  test("the join, open and sealed-entry discriminators are the generated client's", () => {
    expect(R.INSTRUCTION_DISCRIMINATOR).toEqual({
      userOpenCampaign: USER_OPEN_CAMPAIGN_DISCRIMINATOR,
      userJoinCampaign: USER_JOIN_CAMPAIGN_DISCRIMINATOR,
      sponsorJoinCampaign: SPONSOR_JOIN_CAMPAIGN_DISCRIMINATOR,
    });
  });

  test("ComputeBudget is the tx half's, and Lighthouse the address Sprint 03 recorded", () => {
    expect(T.COMPUTE_BUDGET_PROGRAM_ID).toBe(R.COMPUTE_BUDGET_PROGRAM_ID);
    expect(readFileSync("knowledge-base/tecnologia/lighthouse.md", "utf8")).toContain(R.LIGHTHOUSE_PROGRAM_ID);
  });
});
