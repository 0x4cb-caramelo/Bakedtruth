use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::{constants::*, error::ErrorCode, events::Swapped, outcome, resolver, state::*};

#[derive(Accounts)]
pub struct Swap<'info> {
    #[account(mut)]
    pub trader: Signer<'info>,
    #[account(mut, seeds = [MARKET_SEED, market.sponsor.as_ref(), &market.market_id.to_le_bytes()], bump = market.bump)]
    pub market: Box<Account<'info, Market>>,
    /// CHECK: address-locked to the market; read by the trading guard.
    #[account(address = market.metric_account @ ErrorCode::InvalidMetricAccount)]
    pub metric_account: UncheckedAccount<'info>,
    #[account(address = market.yes_mint)]
    pub yes_mint: Box<Account<'info, Mint>>,
    #[account(address = market.no_mint)]
    pub no_mint: Box<Account<'info, Mint>>,
    #[account(mut, associated_token::mint = yes_mint, associated_token::authority = market)]
    pub pool_yes_account: Box<Account<'info, TokenAccount>>,
    #[account(mut, associated_token::mint = no_mint, associated_token::authority = market)]
    pub pool_no_account: Box<Account<'info, TokenAccount>>,
    #[account(
        init_if_needed,
        payer = trader,
        associated_token::mint = yes_mint,
        associated_token::authority = trader,
    )]
    pub trader_yes_account: Box<Account<'info, TokenAccount>>,
    #[account(
        init_if_needed,
        payer = trader,
        associated_token::mint = no_mint,
        associated_token::authority = trader,
    )]
    pub trader_no_account: Box<Account<'info, TokenAccount>>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

/// Swaps `amount_in` of one outcome token for the other on the constant-product pool, with
/// `SWAP_FEE_BPS` of the input kept by liquidity providers. Guarded like the sale: trading
/// halts the moment the outcome is knowable, so the pool cannot be sniped at a stale price.
///
/// With `mint_pair`/`burn_pair` this covers every trade in one transaction:
/// buy YES = mint_pair + swap NO in; sell YES = swap part of it to NO + burn_pair.
pub fn handle_swap(ctx: Context<Swap>, token_in: Side, amount_in: u64, min_out: u64) -> Result<()> {
    let clock = Clock::get()?;
    let market = &ctx.accounts.market;
    resolver::require_trading_open(market, &ctx.accounts.metric_account, &clock)?;
    require!(amount_in > 0, ErrorCode::StakeTooSmall);

    let (reserve_in, reserve_out) = match token_in {
        Side::Yes => (market.pool_yes, market.pool_no),
        Side::No => (market.pool_no, market.pool_yes),
    };
    require!(reserve_in > 0 && reserve_out > 0, ErrorCode::PoolEmpty);
    let in_after_fee =
        amount_in as u128 * (BPS_DENOMINATOR - SWAP_FEE_BPS) as u128 / BPS_DENOMINATOR as u128;
    // Always below `reserve_out`, so the pool is never emptied.
    let amount_out =
        (reserve_out as u128 * in_after_fee / (reserve_in as u128 + in_after_fee)) as u64;
    require!(
        amount_out > 0 && amount_out >= min_out,
        ErrorCode::SlippageExceeded
    );

    let a = &ctx.accounts;
    let (mint_in, trader_in, pool_in, mint_out, pool_out, trader_out) = match token_in {
        Side::Yes => (
            &a.yes_mint,
            &a.trader_yes_account,
            &a.pool_yes_account,
            &a.no_mint,
            &a.pool_no_account,
            &a.trader_no_account,
        ),
        Side::No => (
            &a.no_mint,
            &a.trader_no_account,
            &a.pool_no_account,
            &a.yes_mint,
            &a.pool_yes_account,
            &a.trader_yes_account,
        ),
    };
    outcome::transfer_outcome(
        mint_in,
        trader_in,
        pool_in,
        a.trader.to_account_info(),
        &[],
        amount_in,
    )?;
    outcome::with_market_signer(market, |signer| {
        outcome::transfer_outcome(
            mint_out,
            pool_out,
            trader_out,
            a.market.to_account_info(),
            signer,
            amount_out,
        )
    })?;

    let reserve_in = reserve_in
        .checked_add(amount_in)
        .ok_or(ErrorCode::MathOverflow)?;
    let reserve_out = reserve_out - amount_out;
    let market = &mut ctx.accounts.market;
    match token_in {
        Side::Yes => (market.pool_yes, market.pool_no) = (reserve_in, reserve_out),
        Side::No => (market.pool_no, market.pool_yes) = (reserve_in, reserve_out),
    }
    emit!(Swapped {
        market: market.key(),
        trader: ctx.accounts.trader.key(),
        token_in,
        amount_in,
        amount_out,
        pool_yes: market.pool_yes,
        pool_no: market.pool_no,
    });
    Ok(())
}
