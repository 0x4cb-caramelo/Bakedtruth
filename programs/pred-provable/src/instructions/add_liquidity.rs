use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::{constants::*, error::ErrorCode, events::LiquidityAdded, outcome, resolver, state::*};

#[derive(Accounts)]
pub struct AddLiquidity<'info> {
    #[account(mut)]
    pub provider: Signer<'info>,
    #[account(mut, seeds = [MARKET_SEED, market.sponsor.as_ref(), &market.market_id.to_le_bytes()], bump = market.bump)]
    pub market: Box<Account<'info, Market>>,
    /// CHECK: address-locked to the market; read by the trading guard.
    #[account(address = market.metric_account @ ErrorCode::InvalidMetricAccount)]
    pub metric_account: UncheckedAccount<'info>,
    #[account(address = market.yes_mint)]
    pub yes_mint: Box<Account<'info, Mint>>,
    #[account(address = market.no_mint)]
    pub no_mint: Box<Account<'info, Mint>>,
    /// Pool shares. Created with the pool by its first provider.
    #[account(
        init_if_needed,
        payer = provider,
        seeds = [LP_MINT_SEED, market.key().as_ref()],
        bump,
        mint::decimals = OUTCOME_DECIMALS,
        mint::authority = market,
    )]
    pub lp_mint: Box<Account<'info, Mint>>,
    #[account(
        init_if_needed,
        payer = provider,
        associated_token::mint = yes_mint,
        associated_token::authority = market,
    )]
    pub pool_yes_account: Box<Account<'info, TokenAccount>>,
    #[account(
        init_if_needed,
        payer = provider,
        associated_token::mint = no_mint,
        associated_token::authority = market,
    )]
    pub pool_no_account: Box<Account<'info, TokenAccount>>,
    #[account(mut, token::mint = yes_mint, token::authority = provider)]
    pub provider_yes_account: Box<Account<'info, TokenAccount>>,
    #[account(mut, token::mint = no_mint, token::authority = provider)]
    pub provider_no_account: Box<Account<'info, TokenAccount>>,
    #[account(
        init_if_needed,
        payer = provider,
        associated_token::mint = lp_mint,
        associated_token::authority = provider,
    )]
    pub provider_lp_account: Box<Account<'info, TokenAccount>>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

/// Deposits up to `max_yes` YES and `max_no` NO into the pool for LP shares. The first
/// deposit sets the price (YES costs `pool_no / (pool_yes + pool_no)`); later deposits take
/// both sides at the current ratio and leave any excess with the provider.
pub fn handle_add_liquidity(
    ctx: Context<AddLiquidity>,
    max_yes: u64,
    max_no: u64,
    min_shares: u64,
) -> Result<()> {
    let clock = Clock::get()?;
    let market = &ctx.accounts.market;
    resolver::require_trading_open(market, &ctx.accounts.metric_account, &clock)?;

    let supply = ctx.accounts.lp_mint.supply as u128;
    let (yes_in, no_in, shares) = if supply == 0 {
        require!(
            max_yes >= MIN_STAKE && max_no >= MIN_STAKE,
            ErrorCode::StakeTooSmall
        );
        (
            max_yes as u128,
            max_no as u128,
            (max_yes as u128 * max_no as u128).isqrt(),
        )
    } else {
        let (pool_yes, pool_no) = (market.pool_yes as u128, market.pool_no as u128);
        let shares = (max_yes as u128 * supply / pool_yes).min(max_no as u128 * supply / pool_no);
        // Rounded up, so existing providers are never diluted.
        (
            (shares * pool_yes).div_ceil(supply),
            (shares * pool_no).div_ceil(supply),
            shares,
        )
    };
    require!(
        shares > 0 && shares >= min_shares as u128,
        ErrorCode::SlippageExceeded
    );
    let to_u64 = |v: u128| u64::try_from(v).map_err(|_| error!(ErrorCode::MathOverflow));
    let (yes_in, no_in, shares) = (to_u64(yes_in)?, to_u64(no_in)?, to_u64(shares)?);

    let provider = ctx.accounts.provider.to_account_info();
    outcome::transfer_outcome(
        &ctx.accounts.yes_mint,
        &ctx.accounts.provider_yes_account,
        &ctx.accounts.pool_yes_account,
        provider.clone(),
        &[],
        yes_in,
    )?;
    outcome::transfer_outcome(
        &ctx.accounts.no_mint,
        &ctx.accounts.provider_no_account,
        &ctx.accounts.pool_no_account,
        provider,
        &[],
        no_in,
    )?;
    outcome::mint_from_market(
        &ctx.accounts.market,
        &ctx.accounts.lp_mint,
        &ctx.accounts.provider_lp_account,
        shares,
    )?;

    let market = &mut ctx.accounts.market;
    market.pool_yes = market
        .pool_yes
        .checked_add(yes_in)
        .ok_or(ErrorCode::MathOverflow)?;
    market.pool_no = market
        .pool_no
        .checked_add(no_in)
        .ok_or(ErrorCode::MathOverflow)?;
    emit!(LiquidityAdded {
        market: market.key(),
        provider: ctx.accounts.provider.key(),
        yes_in,
        no_in,
        shares,
        pool_yes: market.pool_yes,
        pool_no: market.pool_no,
    });
    Ok(())
}
