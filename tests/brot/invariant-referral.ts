/**
 * Purpose: the randomized test's referral links (Sprint 14; TP section 3.4.11): a referee links its referrer once,
 *          at any phase and paused or not (I10′), paying only the top-up of its `ReferralLink`; a second link, a zero
 *          or self referrer and another wallet's link are refused; SOL sent by hand to a link address not yet made is
 *          kept. The per-run check: every link keeps its owner, lamports and bytes to the end of the run.
 * Version: 0.1.0
 * Sprint:  14 (lane INV14)
 */
import { type Address } from "@solana/kit";

import { clock, linkOf, type Harness, type Plan, type Rng } from "./invariant-harness";
import { withSlot } from "./instructions";
import { userLinkReferrerIx } from "./instructions-14-15";
import type { BrotErrorName } from "./errors";
import { systemTransferIx } from "./join-campaign-support";
import * as P from "./program";
import { field } from "./invariant-contest";
import { decode } from "./layouts";
import { REFERRAL_LINK } from "./structs-14-15";

export type LinkOp =
  /** `referrer` indexes `referrerPool`, or names the referee itself or the zero address. */
  | { k: "link"; referee: number; referrer: number | "self" | "zero" }
  /** Referee `referee` signs, naming the link address of referee `other` (`PdaMismatch`). */
  | { k: "linkOther"; referee: number; other: number }
  /** SOL sent by hand to the link address of a referee not linked yet. */
  | { k: "fundLink"; referee: number; amount: bigint };

/** The all-zero address (the System Program's id). */
const ZERO = P.SYSTEM_PROGRAM_ID as string;

/** Every wallet the run knows, as a referrer: the referees (so a referee may name itself), creators, team, admin. */
export const referrerPool = (h: Harness): string[] => [
  ...h.referees.map((s) => s.address),
  ...h.creators.map((s) => s.address),
  ...h.team.map((s) => s.address),
  h.admin.address,
  h.bank.address,
  h.sink,
];

/** Plans one referral operation; the refusals follow `user_link_referrer`'s order (address, referrer, once). */
export async function planLink(h: Harness, op: LinkOp): Promise<Plan> {
  const referee = h.referees[op.referee];
  const link = await linkOf(h, referee.address);
  if (op.k === "fundLink") {
    return {
      ixs: [systemTransferIx(h.bank, link, op.amount)],
      deltas: new Map<string, bigint>([
        [link, op.amount],
        [h.bank.address, -op.amount],
      ]),
      apply: () => h.linkFunds.set(referee.address, (h.linkFunds.get(referee.address) ?? 0n) + op.amount),
    };
  }
  if (op.k === "linkOther") {
    const other = await linkOf(h, h.referees[op.other].address);
    return {
      ixs: [withSlot(await userLinkReferrerIx(referee, h.sink), 1, { address: other })],
      error: "PdaMismatch",
      deltas: new Map<string, bigint>([
        [referee.address, 0n],
        [other, 0n],
      ]),
      still: true,
      apply: () => undefined,
    };
  }
  const referrer =
    op.referrer === "self" ? referee.address : op.referrer === "zero" ? ZERO : referrerPool(h)[op.referrer];
  const error: BrotErrorName | undefined =
    referrer === ZERO || referrer === referee.address
      ? "InvalidReferrer"
      : h.links.has(referee.address)
        ? "AlreadyInitialized"
        : undefined;
  // An address funded in advance is topped up to the rent, never refused; the referee pays only the difference.
  const funded = h.linkFunds.get(referee.address) ?? 0n;
  const topUp = funded >= h.rent.link ? 0n : h.rent.link - funded;
  const t = clock(h);
  const slot = h.w.client.svm.getClock().slot;
  const want = { tag: 4, version: 1, referee: referee.address, referrer, linked_at: t, linked_slot: slot };
  return {
    ixs: [await userLinkReferrerIx(referee, referrer as Address)],
    error,
    deltas: new Map<string, bigint>([
      [referee.address, -topUp],
      [link, topUp],
    ]),
    still: true,
    events: ["ReferralLinked"],
    verify: ([e]) => {
      const stored = decodeLinkAccount(h, link);
      if (!stored || stored.owner !== P.PROGRAM_ID) throw new Error(`link of ${referee.address}: not the program's`);
      if (stored.data.length !== 96) throw new Error(`link of ${referee.address}: ${stored.data.length} bytes, not 96`);
      for (const [name, value] of Object.entries(want)) {
        if (stored.fields[name] !== value) throw new Error(`link ${name} is ${stored.fields[name]}, wanted ${value}`);
        if (name !== "tag" && name !== "version" && field(e, name, camel(name)) !== value) {
          throw new Error(`ReferralLinked.${name} is ${field(e, name, camel(name))}, wanted ${value}`);
        }
      }
    },
    apply: () => {
      const stored = decodeLinkAccount(h, link)!;
      h.links.set(referee.address, { referrer, lamports: stored.lamports, bytes: Uint8Array.from(stored.data) });
      h.linkFunds.delete(referee.address);
      const lamports = funded > h.rent.link ? funded : h.rent.link;
      if (stored.lamports !== lamports) throw new Error(`link holds ${stored.lamports}, the model ${lamports}`);
    },
  };
}

/** A link address on chain: owner, lamports, bytes, and the link's fields once it holds one. */
function decodeLinkAccount(h: Harness, link: Address) {
  const account = h.w.client.svm.getAccount(link);
  if (!account.exists) return null;
  const data = account.data;
  const fields: Record<string, unknown> = data.length > 0 ? decode(REFERRAL_LINK, data) : {};
  return { owner: account.programAddress as string, lamports: BigInt(account.lamports), data, fields };
}

const camel = (snake: string) => snake.replace(/_([a-z])/g, (_, ch: string) => ch.toUpperCase());

/** Every link keeps its owner, lamports and bytes; an address funded by hand and not linked keeps exactly that SOL. */
export async function checkLinks(h: Harness) {
  for (const [referee, model] of h.links) {
    const stored = decodeLinkAccount(h, await linkOf(h, referee));
    if (!stored) throw new Error(`link of ${referee}: the account is gone`);
    const same = stored.data.length === model.bytes.length && stored.data.every((b, i) => b === model.bytes[i]);
    if (stored.owner !== P.PROGRAM_ID || stored.lamports !== model.lamports || !same) {
      throw new Error(`link of ${referee}: changed (owner ${stored.owner}, ${stored.lamports} lamports)`);
    }
  }
  for (const [referee, funds] of h.linkFunds) {
    const stored = decodeLinkAccount(h, await linkOf(h, referee));
    if (stored?.lamports !== funds || stored.data.length !== 0) throw new Error(`link address of ${referee} moved`);
  }
}

/** The draw of one referral operation: mostly a link, sometimes a refusal or SOL sent by hand first. */
export function drawLinkOp(h: Harness, r: Rng): LinkOp {
  const referee = r.int(0, h.referees.length - 1);
  const unlinked = h.referees.map((_, i) => i).filter((i) => !h.links.has(h.referees[i].address));
  const x = r.next();
  if (x < 0.15 && unlinked.length > 0) {
    return { k: "fundLink", referee: r.pick(unlinked), amount: r.big(h.rent.wallet, 3_000_000n) };
  }
  if (x < 0.25)
    return { k: "linkOther", referee, other: (referee + r.int(1, h.referees.length - 1)) % h.referees.length };
  if (x < 0.35) return { k: "link", referee, referrer: r.next() < 0.5 ? "self" : "zero" };
  return { k: "link", referee, referrer: r.int(0, referrerPool(h).length - 1) };
}
