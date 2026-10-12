/**
 * Purpose: a graduation campaign (`DbcGraduated`) on the site, from the program's own campaign account and the Meteora
 *          DBC pool captured from mainnet: the campaign page's proof (the SOL raised against the curve's threshold, the
 *          share filled, what is still missing, "if read now" by the pool's own stamp before and after the deadline, a
 *          pool the reader refuses shown as such), the share as the page writes it, a card's reading and the sentence
 *          every page shows. Filter: `bun test tests/ -t "a graduation campaign on the site"`.
 * Version: 0.1.0
 * Sprint:  the sixth kind's site, after 05 (docs/technical/meteora-readers-plan.md)
 */
import { describe, expect, test } from "bun:test";
import type { Address } from "@solana/kit";

import { decodeCampaign } from "@brot/sdk/read";

import { filledText } from "../../app/features/campaign-page/curve";
import { proofOf } from "../../app/features/campaign-page/proof";
import type { Card } from "../../app/features/campaigns/model";
import { readingOf } from "../../app/features/campaigns/readings";
import { questionOf, sentenceOf } from "../../app/features/campaigns/sentence";
import * as P from "../brot/program";
import { setFixture } from "../brot/readers";
import { at, campaignOn, DEADLINE, resolveWorld } from "../brot/resolve-support";
import { START_TIME, type World } from "../brot/setup";
import { chainOf, rawOf } from "./support";

const THRESHOLD = 85n * P.SOL;
/** What the captured stage-0 pool has raised, against its config's 85 SOL threshold. */
const RAISED = 19_457_897n;
/** The pool's fields DBC's swap writes when it completes a curve (readers/dbc_graduation.rs). */
const AT = { raised: 240, stage: 308, stamp: 344 } as const;
type Edit = { raised?: bigint; stage?: number; stamp?: bigint };

/** The captured stage-0 pool at its own address, with `edit` written over it. */
const setPool = (w: World, edit: Edit = {}): Address =>
  setFixture(w.client, "dbc-pool-stage0", {
    mutate: (_, view) => {
      if (edit.raised !== undefined) view.setBigUint64(AT.raised, edit.raised, true);
      if (edit.stage !== undefined) view.setUint8(AT.stage, edit.stage);
      if (edit.stamp !== undefined) view.setBigUint64(AT.stamp, edit.stamp, true);
    },
  }).address;

async function curveWorld() {
  const w = await resolveWorld();
  const c = await campaignOn(w, P.ReaderKind.DbcGraduated, setPool(w), THRESHOLD);
  const proof = () => {
    const campaign = decodeCampaign(rawOf(w, c.campaign));
    return proofOf(campaign, rawOf(w, c.metric), chainOf(w));
  };
  return { w, c, proof };
}

describe("a graduation campaign on the site", () => {
  test("the page shows the SOL raised against the threshold, the share filled and what is missing", async () => {
    const { proof } = await curveWorld();
    expect(proof()).toMatchObject({
      kind: "curve",
      value: RAISED,
      target: THRESHOLD,
      comparator: "≥",
      ifReadNow: "NO",
      problem: null,
      measuredEpoch: null,
    });
    expect(proof().curve).toEqual({
      raised: RAISED,
      threshold: THRESHOLD,
      filledBps: 2,
      missing: THRESHOLD - RAISED,
      stage: 0,
      graduated: false,
      completedAt: null,
    });
  });

  test("a completed curve: YES before the deadline; after it, YES by a stamp in time, NO by a late stamp or none", async () => {
    const { w, proof } = await curveWorld();
    const inTime = START_TIME - 60n;
    setPool(w, { stage: 1, stamp: inTime, raised: THRESHOLD });
    expect(proof()).toMatchObject({ ifReadNow: "YES", value: THRESHOLD });
    expect(proof().curve).toMatchObject({ graduated: true, completedAt: inTime, filledBps: 10_000, missing: 0n });
    at(w, DEADLINE + 3_600n);
    expect(proof().ifReadNow).toBe("YES");
    setPool(w, { stage: 3, stamp: DEADLINE + 1n, raised: THRESHOLD });
    expect(proof()).toMatchObject({ ifReadNow: "NO", curve: { stage: 3, completedAt: DEADLINE + 1n } });
    setPool(w, { stage: 2, stamp: 0n, raised: THRESHOLD });
    expect(proof()).toMatchObject({ ifReadNow: "NO", curve: { graduated: true, completedAt: null } });
    // Still on the curve after the deadline: NO.
    setPool(w, { stage: 0, stamp: 0n, raised: THRESHOLD - 1n });
    expect(proof()).toMatchObject({ ifReadNow: "NO", curve: { graduated: false, missing: 1n, filledBps: 9_999 } });
  });

  test("a pool the reader refuses shows why, never a value or a curve", async () => {
    const { w, c, proof } = await curveWorld();
    setFixture(w.client, "dbc-pool-stage0", { owner: P.SPL_TOKEN_PROGRAM_ID });
    expect(proof()).toMatchObject({ problem: "ReaderWrongOwner", value: null, curve: null, ifReadNow: null });
    setFixture(w.client, "dbc-hook-pool", { at: c.metric });
    expect(proof()).toMatchObject({ problem: "CurveHasTransferHook", value: null, curve: null });
  });

  test("the share filled is written exactly, and never rounded up to look complete", () => {
    const cases: [number, string][] = [
      [0, "0%"],
      [2, "0.02%"],
      [150, "1.5%"],
      [999, "9.99%"],
      [1_000, "10%"],
      [4_753, "47.5%"],
      [9_999, "99.9%"],
      [10_000, "100%"],
    ];
    for (const [bps, text] of cases) expect(`${bps}: ${filledText(bps)}`).toBe(`${bps}: ${text}`);
  });

  test("a card reads the curve's raise, YES only for a curve completed in time; the sentence names the curve", async () => {
    const { w, c } = await curveWorld();
    const card = { kind: "DbcGraduated", target: THRESHOLD, deadlineAt: DEADLINE } as Card;
    expect(readingOf(card, rawOf(w, c.metric))).toEqual({ value: RAISED, exponent: 0, ifReadNow: "NO" });
    setPool(w, { stage: 1, stamp: DEADLINE, raised: THRESHOLD });
    expect(readingOf(card, rawOf(w, c.metric))?.ifReadNow).toBe("YES");
    setPool(w, { stage: 1, stamp: DEADLINE + 1n, raised: THRESHOLD });
    expect(readingOf(card, rawOf(w, c.metric))?.ifReadNow).toBe("NO");
    setFixture(w.client, "dbc-pool-stage0", { owner: P.SPL_TOKEN_PROGRAM_ID });
    expect(readingOf(card, rawOf(w, c.metric))).toBeNull();
    const input = {
      kind: "DbcGraduated",
      direction: "Above",
      feedIdHex: null,
      target: THRESHOLD.toString(),
      priceExponent: 0,
      metricAccount: c.metric,
    };
    expect(sentenceOf(input)).toBe("Meteora launch curve mxGZ…P8S6 raises its full 85 SOL");
    expect(questionOf(input)).toBe("Meteora launch curve mxGZ…P8S6 raises its full 85 SOL?");
  });
});
