/**
 * Purpose: the pot arithmetic of the /pitch demo: what a market holds after the visitor's stake and how it is
 *          shared when the chain resolves it.
 * Version: 0.1.0 · Sprint: out of band (landing page), 2026-10-10
 *
 * Every figure is an example, and the card says so. FEE is the fee rule: 10% of the losing side. CREATOR is the share
 * of whoever opened the market, 1% of its volume. CREATOR_FROM says where that 1% comes from:
 *   "fee": out of Brot's fee, as the founder asked for this preview on 2026-10-10. A pot of 6 SOL against 4 pays 0.30 to
 *          Brot, 0.10 to the creator and 9.60 to the winners.
 *   "pot": out of the pot, next to the fee, which is what the program does today (programs/brot-markets, math/payout.rs)
 *          and what the deck at /pitch shows: 0.40, 0.10 and 9.50 of the same pot.
 * The two do not agree. Until the founder settles it, this one word switches the whole demo.
 */
export const FEE = { of: "losers", rate: 0.1 };
export const CREATOR = 0.01;
export const CREATOR_FROM = "fee";
export const STAKE = 0.5; // SOL: the platform has no other currency

/** The sentence under the 1% on the left of the slide, by where the 1% comes from. */
export const CREATOR_NOTE = {
  fee: "It comes out of our fee. The winners get the same.",
  pot: "It comes out of the losing side, next to our fee.",
}[CREATOR_FROM];

/** What the Brot chip says once the creator's share is on the card. */
export const BROT_NOTE = { fee: "what is left of our 10%", pot: "10% of the losing side" }[CREATOR_FROM];

/**
 * The pot after the visitor's stake, and who gets what. `withCreator` is false on the third example, which shows the
 * fee alone before the fourth adds the creator.
 */
export function split(market, withCreator = true) {
  const yes = market.yes + (market.pick === "yes" ? STAKE : 0);
  const no = market.no + (market.pick === "no" ? STAKE : 0);
  const pot = yes + no;
  const winning = market.outcome === "yes" ? yes : no;
  const fee = (FEE.of === "pot" ? pot : pot - winning) * FEE.rate;
  const creator = withCreator ? pot * CREATOR : 0;
  const fromFee = CREATOR_FROM === "fee" ? Math.min(creator, fee) : 0;
  const brot = fee - fromFee;
  const winners = pot - fee - (creator - fromFee);
  const won = market.pick === market.outcome;
  const net = won ? (STAKE / winning) * winners - STAKE : -STAKE;
  return {
    yes: Math.round((yes / pot) * 100),
    no: Math.round((no / pot) * 100),
    winning,
    brot,
    creator,
    winners,
    won,
    net,
  };
}
