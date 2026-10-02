pub mod constants;
pub mod error;
pub mod events;
pub mod instructions;
pub mod outcome;
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

    /// Sponsor opens a market, creates its YES/NO mints and USDC vault, and deposits the bounty budget.
    pub fn create_market(ctx: Context<CreateMarket>, args: CreateMarketArgs) -> Result<()> {
        crate::instructions::create_market::handle_create_market(ctx, args)
    }

    /// Buy YES at the sponsor's fixed price before the cutoff and before the metric is met.
    /// The matching NO is booked to the sponsor in `Market::sponsor_no`.
    pub fn buy_yes(ctx: Context<BuyYes>, amount: u64) -> Result<()> {
        crate::instructions::buy_yes::handle_buy_yes(ctx, amount)
    }

    /// Anyone: deposit USDC for the same number of YES and NO tokens, 1:1, until resolution.
    pub fn mint_pair(ctx: Context<MintPair>, amount: u64) -> Result<()> {
        crate::instructions::mint_pair::handle_mint_pair(ctx, amount)
    }

    /// Anyone: burn equal YES and NO for their USDC back, 1:1, until resolution.
    pub fn burn_pair(ctx: Context<BurnPair>, amount: u64) -> Result<()> {
        crate::instructions::burn_pair::handle_burn_pair(ctx, amount)
    }

    /// Deposit YES and NO into the guarded pool for LP shares. The first deposit sets the price.
    pub fn add_liquidity(
        ctx: Context<AddLiquidity>,
        max_yes: u64,
        max_no: u64,
        min_shares: u64,
    ) -> Result<()> {
        crate::instructions::add_liquidity::handle_add_liquidity(ctx, max_yes, max_no, min_shares)
    }

    /// Burn LP shares for a pro-rata cut of both reserves. Always open.
    pub fn remove_liquidity(
        ctx: Context<RemoveLiquidity>,
        shares: u64,
        min_yes: u64,
        min_no: u64,
    ) -> Result<()> {
        crate::instructions::remove_liquidity::handle_remove_liquidity(ctx, shares, min_yes, min_no)
    }

    /// Swap YES for NO or NO for YES on the pool; halts when the outcome becomes knowable.
    pub fn swap(ctx: Context<Swap>, token_in: Side, amount_in: u64, min_out: u64) -> Result<()> {
        crate::instructions::swap::handle_swap(ctx, token_in, amount_in, min_out)
    }

    /// Permissionless, instant resolution by reading the locked metric account.
    pub fn resolve(ctx: Context<Resolve>) -> Result<()> {
        crate::instructions::resolve::handle_resolve(ctx)
    }

    /// Burn winning outcome tokens for USDC, 1:1.
    pub fn redeem(ctx: Context<Redeem>) -> Result<()> {
        crate::instructions::redeem::handle_redeem(ctx)
    }

    /// Sponsor takes back the budget no sale used once the sale is closed (or before any
    /// sale), and its NO collateral 1:1 once NO wins.
    pub fn withdraw_budget(ctx: Context<WithdrawBudget>) -> Result<()> {
        crate::instructions::withdraw_budget::handle_withdraw_budget(ctx)
    }
}
