//! Events for clients: every state change logs one, so an activity feed or price history
//! is a `getSignaturesForAddress(market)` plus log decoding, with no indexer.

use anchor_lang::prelude::*;

use crate::state::*;

#[event]
pub struct MarketCreated {
    pub market: Pubkey,
    pub sponsor: Pubkey,
    pub kind: ResolverKind,
    pub target: Pubkey,
    pub metric_threshold: u64,
    pub cutoff_slot: u64,
    pub deadline_slot: u64,
    pub yes_price_bps: u16,
    pub budget: u64,
}

#[event]
pub struct YesBought {
    pub market: Pubkey,
    pub buyer: Pubkey,
    pub amount: u64,
    /// USDC the buyer paid; the budget covered `amount - price`.
    pub price: u64,
    pub budget_left: u64,
}

#[event]
pub struct PairMinted {
    pub market: Pubkey,
    pub owner: Pubkey,
    pub amount: u64,
}

#[event]
pub struct PairBurned {
    pub market: Pubkey,
    pub owner: Pubkey,
    pub amount: u64,
}

#[event]
pub struct LiquidityAdded {
    pub market: Pubkey,
    pub provider: Pubkey,
    pub yes_in: u64,
    pub no_in: u64,
    pub shares: u64,
    pub pool_yes: u64,
    pub pool_no: u64,
}

#[event]
pub struct LiquidityRemoved {
    pub market: Pubkey,
    pub provider: Pubkey,
    pub yes_out: u64,
    pub no_out: u64,
    pub shares: u64,
    pub pool_yes: u64,
    pub pool_no: u64,
}

/// Reserves are after the swap, so the YES price is `pool_no / (pool_yes + pool_no)`.
#[event]
pub struct Swapped {
    pub market: Pubkey,
    pub trader: Pubkey,
    pub token_in: Side,
    pub amount_in: u64,
    pub amount_out: u64,
    pub pool_yes: u64,
    pub pool_no: u64,
}

#[event]
pub struct Resolved {
    pub market: Pubkey,
    pub outcome: Outcome,
    pub slot: u64,
}

#[event]
pub struct Redeemed {
    pub market: Pubkey,
    pub owner: Pubkey,
    pub outcome: Outcome,
    pub amount: u64,
}

#[event]
pub struct SponsorWithdrew {
    pub market: Pubkey,
    pub sponsor: Pubkey,
    /// Unspent budget paid out.
    pub budget: u64,
    /// The sponsor's NO paid out, 1:1, because NO won.
    pub sponsor_no: u64,
}
