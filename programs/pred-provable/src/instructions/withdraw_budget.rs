use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::{constants::*, error::ErrorCode, outcome, state::*};

#[derive(Accounts)]
pub struct WithdrawBudget<'info> {
    pub sponsor: Signer<'info>,
    #[account(mut, seeds = [MARKET_SEED, market.sponsor.as_ref(), &market.market_id.to_le_bytes()], bump = market.bump, has_one = sponsor)]
    pub market: Box<Account<'info, Market>>,
    #[account(address = USDC_MINT @ ErrorCode::NotUsdc)]
    pub usdc_mint: Box<Account<'info, Mint>>,
    #[account(mut, address = market.vault)]
    pub vault: Box<Account<'info, TokenAccount>>,
    #[account(mut, token::mint = usdc_mint, token::authority = sponsor)]
    pub sponsor_usdc_account: Box<Account<'info, TokenAccount>>,
    pub token_program: Program<'info, Token>,
}

/// Returns the unspent budget to the sponsor. It is locked while the sale is open, so a
/// sponsor cannot pull the bounty out from under doers who are still buying.
pub fn handle_withdraw_budget(ctx: Context<WithdrawBudget>) -> Result<()> {
    let clock = Clock::get()?;
    let market = &mut ctx.accounts.market;
    require!(
        clock.slot >= market.cutoff_slot || market.outcome != Outcome::Open,
        ErrorCode::SaleStillOpen
    );

    let amount = market.budget;
    market.budget = 0;
    outcome::pay_usdc(
        &ctx.accounts.market,
        &ctx.accounts.usdc_mint,
        &ctx.accounts.vault,
        &ctx.accounts.sponsor_usdc_account,
        amount,
    )
}
