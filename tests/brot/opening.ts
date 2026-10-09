/**
 * Purpose: what the opening's LiteSVM tests share: a world with the founder's config, one team key
 *          and a funded creator; the default opening's arguments, and the canonical ones of the
 *          other four kinds; an opening sent with a slot or a byte changed; the captured
 *          confidences and the two rents the money checks compare.
 * Version: 0.0.2
 * Sprint:  02 (pot core on Pinocchio), lane D; 03 (the other kinds' arguments), lane F
 */
import { type Address, type Instruction, type KeyPairSigner } from "@solana/kit";

import { BTC_PRICE, initConfig, newId, setTeam } from "./flows";
import * as I from "./instructions";
import * as P from "./program";
import { createWorld, fundedWallet, now, rentFor, send, START_TIME, type World } from "./setup";

/** Confidence of the captured BTC/USD and SOL/USD devnet accounts (exponent −8). */
export const BTC_CONF = 774_205_661n;
export const SOL_CONF = 655_484n;
/** The publish time `setPriceAccount` writes by default: fresh, 5 s before the world's clock. */
export const FRESH = START_TIME - 5n;
/** One second past the devnet `campaign_max_age` and `max_price_age` (120 s). */
export const STALE = START_TIME - 121n;
/** Account sizes (programs/brot-markets/tests/layout.rs): the campaign and its data-less vault. */
export const CAMPAIGN_LEN = 512;
export const VAULT_LEN = 0;

export type OpeningWorld = World & { admin: KeyPairSigner; team: KeyPairSigner; creator: KeyPairSigner };

/** A world with the founder's config, one team key and a creator holding 100 SOL. */
export async function openingWorld(): Promise<OpeningWorld> {
  const w = await createWorld();
  const { admin } = await initConfig(w);
  const [team] = await setTeam(w, admin, 1);
  return { ...w, admin, team, creator: await fundedWallet(w) };
}

/** The default opening of tests/brot/flows.ts (BTC/USD above 110% in seven days, US$500), with `over`. */
export function openArgs(w: World, over: Partial<I.OpenArgs> = {}): I.OpenArgs {
  return {
    id: newId(),
    feedId: P.BTC_USD_FEED_ID,
    direction: P.Direction.Above,
    target: (BTC_PRICE * 11n) / 10n,
    deadlineAt: now(w.client) + 7n * P.DAY,
    openingUsd: 500n,
    maxLamports: 10n * P.SOL,
    ...over,
  };
}

/** A team key's free opening: nothing paid, and the SOL/USD slot neither checked nor read. */
export const FREE = { openingUsd: 0n, maxLamports: 0n } as const;

/**
 * The canonical arguments of `kind` on `target` for a kind other than the price kind (D-j): no
 * feed, `Above`, and epoch 0 unless `over` names the epoch of an epoch kind.
 */
export const otherKind = (kind: number, target: bigint, over: Partial<I.OpenArgs> = {}): Partial<I.OpenArgs> => ({
  kind,
  target,
  feedId: new Uint8Array(32),
  direction: P.Direction.Above,
  epoch: 0n,
  ...over,
});

/** Changes a built opening before it is sent: a slot (`withSlot`) or the bytes (`withData`). */
export type Tamper = (ix: Instruction, args: I.OpenArgs) => Instruction | Promise<Instruction>;

/** Sends one opening by `creator`, with other slots for the price accounts and `tamper` applied last. */
export async function tryOpen(
  w: World,
  creator: KeyPairSigner,
  over: Partial<I.OpenArgs> = {},
  options: { slots?: { metric?: Address; solUsd?: Address }; tamper?: Tamper } = {},
) {
  const args = openArgs(w, over);
  const built = await I.openCampaignIx(creator, args, options.slots);
  const ix = options.tamper ? await options.tamper(built, args) : built;
  const campaign = await P.campaignPda(args.id);
  return { sent: await send(w, [ix]), args, campaign, vault: await P.vaultPda(campaign) };
}

/** The rent-exempt minimum of a campaign and of its vault, as this cluster charges it. */
export const rents = (w: World) => ({ campaign: rentFor(w, CAMPAIGN_LEN), vault: rentFor(w, VAULT_LEN) });

/** The 90/10 split of a paid opening (TP section 3.4.16): the prize rounds down, the fee is the rest. */
export function split(paid: bigint, prizeBps = 9_000n) {
  const prize = (paid * prizeBps) / 10_000n;
  return { paid, prize, fee: paid - prize };
}
