pub mod constants;
pub mod error;
pub mod instructions;
pub mod resolver;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("F9KfegHTBzeHmkhUxgvpTzYD8xvwRmV3sue2BVXiKoE2");

#[program]
pub mod pred_provable {
    use super::*;

    /// Sponsor opens a market and seeds the NO pool (the bounty).
    pub fn create_market(ctx: Context<CreateMarket>, args: CreateMarketArgs) -> Result<()> {
        crate::instructions::create_market::handle_create_market(ctx, args)
    }

    /// Stake on YES or NO before the cutoff and before the metric is met.
    pub fn place_bet(ctx: Context<PlaceBet>, side: Side, amount: u64) -> Result<()> {
        crate::instructions::place_bet::handle_place_bet(ctx, side, amount)
    }

    /// Permissionless resolution by reading the locked metric account.
    pub fn resolve(ctx: Context<Resolve>) -> Result<()> {
        crate::instructions::resolve::handle_resolve(ctx)
    }

    /// Pari-mutuel payout to a winning position; closes the position.
    pub fn claim(ctx: Context<Claim>) -> Result<()> {
        crate::instructions::claim::handle_claim(ctx)
    }
}
