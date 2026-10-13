/**
 * Purpose: one message for each refusal of `user_open_campaign` (TP §3.4.10, rows 1 to 10; D-m vocabulary; English per
 *          L-01), keyed by the program's error name, with the slot of the box it belongs to and a short tag for the
 *          button. The words follow the Sprint -1 spec (prototype-lab/campaigns/js/screens/open-signing.js), fitted to
 *          the program's actual errors. Row 6 has no refusal: the fees and the share are read from the program, never
 *          typed. tests/site/open-refusals.test.ts checks every error with a row has its message here, and sends each
 *          refused case straight to the program.
 * Version: 0.3.0 (the sixth kind's refusals: a Meteora launch curve's own words; Sprint 19's copy review before it)
 * Sprint:  19 (site: open a campaign); the sixth kind (`DbcGraduated`), whose box comes later
 */
import type { BrotErrorName } from "@brot/sdk/read";

import type { Slot } from "./draft";

/** Where a refusal shows: a slot of the box, the box as a whole, or only once the program answered. */
export type RefusalPlace = Slot | "box" | "after";

/** What a refusal's text may name: the program that must own the account, the kind, the account in words. */
export type RefusalContext = { owner: string; kind: string; phrase: string };
export type RefusalCopy = { place: RefusalPlace; tag: string; text: (ctx: RefusalContext) => string };

const fixed = (place: RefusalPlace, tag: string, text: string): RefusalCopy => ({ place, tag, text: () => text });
const RELOAD = "Reload the page and try again.";
const SOL_USD_UNUSABLE = `The SOL/USD price account isn't one the program reads. ${RELOAD}`;
const SOL_USD_SHAKY = "Pyth's SOL/USD price is too uncertain right now. Try again in a minute.";

export const REFUSALS: Partial<Record<BrotErrorName, RefusalCopy>> = {
  // Row 1: the kind.
  UnknownReaderKind: fixed("kind", "Unknown kind", `That kind doesn't exist. ${RELOAD}`),
  ReaderKindNotOpen: fixed(
    "kind",
    "Opens later",
    "This kind isn't open yet. It opens once a YES has been recorded for it on devnet. The other four kinds are open.",
  ),
  // Row 2: the account fits the kind.
  ReaderWrongOwner: {
    place: "account",
    tag: "Account refused",
    text: ({ owner, kind, phrase }) =>
      phrase === "token mint"
        ? "This account isn't a classic SPL token mint, so it can't back a burn campaign. Token-2022 mints aren't supported."
        : `This account isn't owned by ${owner}, so it can't back a ${kind.toLowerCase()} campaign.`,
  },
  ReaderBadLayout: {
    place: "account",
    tag: "Account refused",
    text: ({ phrase }) => `Right owner, but this isn't a ${phrase}.`,
  },
  MetricAccountMismatch: fixed("feed", "Wrong price account", "This isn't the price account Pyth keeps for that feed."),
  MintAuthorityLive: fixed(
    "account",
    "Can still be minted",
    "This token can still be minted, so its supply could grow. Burn campaigns need a revoked mint authority.",
  ),
  StakePoolNotUpdating: fixed(
    "account",
    "Pool not updating",
    "This stake pool stopped updating: its last update is more than one epoch old.",
  ),
  // Row 2, a Meteora launch curve (the graduation kind).
  CurveHasTransferHook: fixed(
    "account",
    "Transfer hook",
    "This Meteora launch uses a transfer-hook token. Graduation campaigns take plain launch pools only, for now.",
  ),
  CurveConfigMismatch: fixed("after", "Wrong curve config", `This isn't the config this Meteora pool uses. ${RELOAD}`),
  CurveNotInSol: fixed(
    "account",
    "Not priced in SOL",
    "This launch curve is priced in another token. Graduation campaigns take curves priced in SOL only.",
  ),
  CurveTooSmall: fixed(
    "account",
    "Curve too small",
    "This curve graduates below 85 SOL. Graduation campaigns need a curve of at least 85 SOL.",
  ),
  // Row 3: the target.
  TargetAlreadyTouched: fixed(
    "target",
    "Already met",
    "Already met: the campaign would be decided the moment it opens. Pick a target the account hasn't reached yet.",
  ),
  TargetTooClose: fixed(
    "target",
    "Too close",
    "Too close to the value now. Keep at least 1% between them; for a price, from the edge of Pyth's confidence band.",
  ),
  TargetUnreachable: fixed(
    "target",
    "Too far",
    "Too far from the price now. The target must be within ten times the price, up or down, and above zero.",
  ),
  TargetNotThreshold: fixed(
    "target",
    "Not the threshold",
    "A graduation campaign's target is the curve's own graduation threshold, and nothing else.",
  ),
  // Row 4: the price kind's feed.
  FeedNotOnList: fixed("feed", "Feed not listed", "This feed isn't on the program's list of Pyth feeds."),
  PriceNotFullyVerified: fixed("feed", "Not verified", "Pyth hasn't fully verified this price right now."),
  PriceWrongFeed: fixed("feed", "Wrong feed", "This account carries another asset's price."),
  PriceStale: fixed(
    "feed",
    "Not fresh",
    "No fresh price for this feed right now. Devnet updates about once a minute; try again shortly.",
  ),
  PriceConfidenceTooWide: fixed(
    "feed",
    "Too uncertain",
    "Pyth's confidence band for this feed is wider than 0.5% of the price right now. Try again in a minute.",
  ),
  PriceNonPositive: fixed("feed", "No valid price", "This feed reports no valid price right now."),
  InvalidDirection: fixed("feed", "Pick a direction", "Pick a direction: reaches or goes above, or falls to or below."),
  // Row 5: the duration and the epoch.
  DurationTooShort: fixed("deadline", "Deadline too soon", "The deadline must be at least 3 days away."),
  DurationTooLong: fixed("deadline", "Deadline too far", "The deadline must be at most 90 days away."),
  EpochAlreadyStarted: fixed("epoch", "Epoch started", "That epoch has already started. Pick a later one."),
  EpochAfterDeadline: fixed(
    "epoch",
    "Epoch after the deadline",
    "That epoch may start after the deadline. Pick an earlier one, or a later deadline.",
  ),
  // Row 7: the payment.
  OpeningUsdBelowFee: fixed("usd", "At least US$500", "Opening costs at least US$500 in SOL."),
  OpeningAboveMaxLamports: fixed(
    "after",
    "Price moved",
    "SOL/USD moved more than 1% since your quote, so the program refused the opening and took no opening payment.",
  ),
  SolUsdAccountMismatch: fixed("box", "Price unusable", `The SOL/USD price can't be used right now. ${RELOAD}`),
  SolUsdStale: fixed(
    "box",
    "Price on hold",
    "Pyth's SOL/USD price is older than the program accepts, so paid openings wait for its next update (about once a minute on devnet). A team key can still open.",
  ),
  SolUsdConfidenceTooWide: fixed("box", "Price uncertain", SOL_USD_SHAKY),
  SolUsdPriceNonPositive: fixed(
    "box",
    "Price unusable",
    "Pyth reports no valid SOL/USD price right now. Try again in a minute.",
  ),
  PriceExponentOutOfRange: fixed("box", "Price unusable", `The SOL/USD price can't be used right now. ${RELOAD}`),
  SolUsdWrongOwner: fixed("box", "Price unusable", SOL_USD_UNUSABLE),
  SolUsdBadLayout: fixed("box", "Price unusable", SOL_USD_UNUSABLE),
  SolUsdNotFullyVerified: fixed("box", "Price unusable", "Pyth hasn't fully verified the SOL/USD price right now."),
  SolUsdWrongFeed: fixed("box", "Price unusable", SOL_USD_UNUSABLE),
  // Row 8: the pause, the valve and the terms the creator read.
  OpenWhilePaused: fixed(
    "box",
    "Paused",
    "The team paused entries and new campaigns. Payouts and refunds continue. Try again when they resume.",
  ),
  TooManyOpenCampaigns: fixed(
    "box",
    "Limit reached",
    "The program's limit of open campaigns is reached, so paid openings wait until one ends.",
  ),
  CreationParamsChanged: fixed(
    "after",
    "Rules changed",
    "Brot's creation rules changed since this preview: the fees, the split or the price rules. Review the new ones before you sign.",
  ),
  // Row 9: no free text, a fixed layout.
  BadInstructionData: fixed("after", "Malformed", `This transaction is malformed. ${RELOAD}`),
  UnusedArgumentNotZero: fixed(
    "after",
    "Malformed",
    `This transaction carries a field its kind doesn't use. ${RELOAD}`,
  ),
  // Row 10: the campaign's id is new.
  AlreadyInitialized: fixed("after", "Already open", "A campaign with this id is already open."),
  WrongOwner: fixed("after", "Address taken", `Another account sits at this campaign's address. ${RELOAD}`),
};

/** The message of a refusal, or a plain one naming the program's error when no row covers it. */
export function refusalCopy(name: BrotErrorName): RefusalCopy {
  return REFUSALS[name] ?? fixed("after", "Refused", `The program refused this opening (${name}).`);
}
