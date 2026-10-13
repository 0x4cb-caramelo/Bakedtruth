/**
 * Purpose: the lifecycle draws of the randomized test (Sprint 04, X0.1). A uniform draw over the kinds mostly names
 *          an operation the campaign's phase refuses, so the run would never reach settlement or close; the
 *          phase-directed draw names the operation that moves a campaign on, most of the time: the resolution, the
 *          tally, the window's acts or a contest, the contest's stages and the lapse, the payouts and the close.
 * Version: 0.1.3 (Sprint 14: the tally, the contest, the re-read, the admin's decision and the lapse; review fix F3,
 *          the lapse of an unread stage 1 and the clock run to its edge; D2: the team's escalation, stage 1's edge;
 *          Sprint 15: a held sponsor fee settled while settling and before the close, which waits for it)
 * Sprint:  04 (closure review); 14 (lane INV14; the uniform draw moved here from invariant-settle.ts); 15 (lane INV15)
 */
import { type Harness, type Rng, clock } from "./invariant-harness";
import { bakersOf, PROOF_DELAY, untallied } from "./invariant-model";
import { shareDue } from "./invariant-payouts";
import { liveSealed, type SealedSettleOp } from "./invariant-sealed-model";
import { drawSealedSettle } from "./invariant-sealed-settle";
import { SETTLE_KINDS, type SettleOp } from "./invariant-settle";
import { lapsesAt } from "./invariant-window";

export type AdvanceOp = { k: "advance"; seconds: bigint };

const bakerIndex = (h: Harness, address: string) => h.bakers.findIndex((b) => b.address === address);
/** The reasons a team key may choose, which the admin's void may name too. */
const TEAM_REASONS = [1, 3, 4, 5];

/** The next operation that moves campaign `index` along its lifecycle, or `null` when its phase has none. */
export function drawPhaseOp(h: Harness, r: Rng, index: number): SettleOp | AdvanceOp | null {
  const c = h.camps[index];
  const t = clock(h);
  const member = r.int(0, h.team.length - 1);
  const unsettled = bakersOf(c).filter((b) => !c.settled.has(b));
  // An honest settlement of a live held fee (the random draws put a thief in the sponsor's slot).
  const sealedSettle = (): SealedSettleOp => ({ ...drawSealedSettle(h, r, index), thief: null });
  switch (c.phase) {
    case "Open":
      if (t < c.deadline && r.next() < 0.5) return { k: "resolveYes", c: index, back: r.big(0n, 50n) };
      // After the proof window: mostly NO, sometimes the feed went stale (an automatic void the team may void; with
      // a house reason, a sponsor's held fee goes back, Sprint 15).
      if (t > c.deadline + PROOF_DELAY) return { k: r.next() < 0.3 ? "resolveStale" : "resolveNo", c: index };
      return null;
    case "InReview": {
      if (t >= c.reviewEndsAt) return { k: "finalize", c: index };
      // A contest opens only once every entry is tallied: now and then the keeper tallies one baker alone; mostly each
      // act sends the tallies first, in its own transaction.
      const pending = untallied(c);
      const x = r.next();
      if (pending.length > 0 && x < 0.2) return { k: "tally", c: index, baker: bakerIndex(h, r.pick(pending)) };
      const tally = r.next() < 0.85;
      // On an automatic void the team mostly records its cause (a house reason sends a held sponsor fee back, Sprint
      // 15); on a YES or NO it mostly contests, and its void is refused.
      const [first, second] = c.outcome === "Void" ? (["void", "contest"] as const) : (["contest", "void"] as const);
      const act = x < 0.55 ? first : x < 0.7 ? second : null;
      if (act === "contest") return { k: "contest", c: index, member, tally };
      if (act === "void") return { k: "void", c: index, member, reason: r.pick(TEAM_REASONS), tally };
      if (x < 0.8) return { k: "confirm", c: index, member, tally };
      return r.next() < 0.5 ? { k: "advance", seconds: c.reviewEndsAt - t + 1n } : null;
    }
    case "Contested": {
      const x = r.next();
      if (c.stage === 1) {
        // An unread stage 1 lapses 48 hours after its deadline (review fix F3): from then on, mostly the lapse.
        const lapse = lapsesAt(c)!;
        if (t >= lapse && x < 0.6) return { k: "finalize", c: index };
        // Stage 2's act is refused at stage 1 (WrongContestStage), and so is the lapse before its time (ContestNotLapsed).
        if (x < 0.08) return { k: "decide", c: index, decision: 0, reason: 0, signer: "admin" };
        if (x < 0.12) return { k: "finalize", c: index };
        // D2: a team key sends it to stage 2, until stage 1's deadline (ContestDeadlinePassed from it on).
        if (x < 0.18) return { k: "contest", c: index, member: r.next() < 0.1 ? -1 : member };
        // A matching re-read pays only from stage 1's deadline on (RereadBeforeTimelock before it): the clock runs to
        // that edge; now and then the keeper is down, and it runs to the lapse's edge (a later re-read adds no time).
        const wait = c.contestEndsAt - t + r.pick([-1n, 0n, 1n]);
        if (x < 0.32 && wait > 0n) return { k: "advance", seconds: wait };
        const edge = lapse - t + r.pick([-1n, 0n, 1n]);
        if (x < 0.37 && edge > 0n) return { k: "advance", seconds: edge };
        // A proof up to 90 s old: past 60 s the reader refuses it, and so does the re-read (review fix F4).
        const variant = r.pick(["same", "same", "moved", "none", "moved"] as const);
        return { k: "reread", c: index, variant, back: r.big(0n, 90n) };
      }
      // From the deadline on only the lapse remains: a decision then is refused (ContestDeadlinePassed).
      if (t >= c.contestEndsAt) {
        if (x < 0.15) return { k: "decide", c: index, decision: 1, reason: r.pick(TEAM_REASONS), signer: "admin" };
        return { k: "finalize", c: index };
      }
      if (x < 0.25) return { k: "decide", c: index, decision: 0, reason: 0, signer: "admin" };
      if (x < 0.5) return { k: "decide", c: index, decision: 1, reason: r.pick(TEAM_REASONS), signer: "admin" };
      // Before the deadline the lapse is refused (ContestNotLapsed), and so are a second re-read and a second
      // escalation (WrongContestStage).
      if (x < 0.57) return { k: "finalize", c: index };
      if (x < 0.62) return { k: "reread", c: index, variant: "same", back: 0n };
      if (x < 0.65) return { k: "contest", c: index, member };
      // Stage 2's edges: a second before the deadline the admin still decides; at it, only the lapse remains.
      return { k: "advance", seconds: c.contestEndsAt - t + r.pick([-1n, 0n, 1n]) };
    }
    case "Settling":
      if (unsettled.length > 0 && r.next() < 0.8)
        return { k: "settle", c: index, baker: bakerIndex(h, r.pick(unsettled)) };
      if (liveSealed(c).length > 0 && r.next() < 0.5) return sealedSettle();
      return r.next() < 0.5 ? { k: "prize", c: index } : null;
    case "Settled":
      if (!c.feeMoved) return { k: "collect", c: index };
      if (!c.prizeSettled) return { k: "prize", c: index };
      if (shareDue(c) > 0n && (!c.shareSettled || (c.reserved > 0n && r.next() < 0.5))) return { k: "share", c: index };
      // Close waits for every held fee (`SealedFeesOpen`): most draws settle one first, some try the close anyway.
      if (liveSealed(c).length > 0 && r.next() < 0.7) return sealedSettle();
      return { k: "close", c: index };
    default:
      return null;
  }
}

/** The draw of one lifecycle operation against campaign `index`, any kind; a moot draw becomes a clock advance. */
export function drawSettleOp(h: Harness, r: Rng, index: number): SettleOp | AdvanceOp {
  const camp = h.camps[index];
  const t = clock(h);
  const member = r.int(0, h.team.length - 1);
  const advance: AdvanceOp = { k: "advance", seconds: 3_600n };
  const bakers = bakersOf(camp);
  switch (SETTLE_KINDS[r.int(0, SETTLE_KINDS.length - 1)]) {
    case "resolveYes":
      return t >= camp.deadline ? advance : { k: "resolveYes", c: index, back: r.big(0n, 50n) };
    case "resolveNo":
      return { k: "resolveNo", c: index };
    case "resolveStale":
      return { k: "resolveStale", c: index };
    case "tally":
      return bakers.length === 0 ? advance : { k: "tally", c: index, baker: bakerIndex(h, r.pick(bakers)) };
    case "confirm":
      return { k: "confirm", c: index, member, tally: r.next() < 0.5 };
    case "void": {
      const inside = camp.phase === "InReview" && t < camp.reviewEndsAt;
      const reason = inside && r.next() < 0.3 ? r.pick([0, 2, 1, 3]) : r.pick([4, 5]);
      return { k: "void", c: index, member, reason, tally: r.next() < 0.5 };
    }
    case "contest":
      // Now and then the admin, who holds no team key, tries.
      return { k: "contest", c: index, member: r.next() < 0.15 ? -1 : member, tally: r.next() < 0.5 };
    case "reread":
      return { k: "reread", c: index, variant: r.pick(["same", "moved", "none"] as const), back: r.big(0n, 90n) };
    case "decide": {
      // Raw bytes: an unknown decision, an unknown reason, a reason that does not fit, a team key signing.
      const decision = r.pick([0, 0, 1, 1, 2]);
      const reason = r.pick([0, 0, 1, 2, 3, 4, 5, 6]);
      return { k: "decide", c: index, decision, reason, signer: r.next() < 0.15 ? "team" : "admin" };
    }
    case "finalize":
      return { k: "finalize", c: index };
    case "settle":
      return bakers.length === 0 ? advance : { k: "settle", c: index, baker: bakerIndex(h, r.pick(bakers)) };
    case "collect":
      return { k: "collect", c: index };
    case "share":
      return { k: "share", c: index };
    case "prize":
      return { k: "prize", c: index };
    case "close":
      return { k: "close", c: index };
    case "sealedSettle":
      return drawSealedSettle(h, r, index);
    default:
      return advance;
  }
}
