use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{self, burn, Burn, Mint, Token, TokenAccount};

use crate::{constants::*, error::ErrorCode, outcome, state::*};

#[derive(Accounts)]
pub struct RemoveLiquidity<'info> {
    #[account(mut)]
    pub provider: Signer<'info>,
    #[account(mut, seeds = [MARKET_SEED, market.sponsor.as_ref(), &market.market_id.to_le_bytes()], bump = market.bump)]
    pub market: Box<Account<'info, Market>>,
    #[account(address = market.yes_mint)]
    pub yes_mint: Box<Account<'info, Mint>>,
    #[account(address = market.no_mint)]
    pub no_mint: Box<Account<'info, Mint>>,
    #[account(mut, seeds = [LP_MINT_SEED, market.key().as_ref()], bump)]
    pub lp_mint: Box<Account<'info, Mint>>,
    #[account(mut, associated_token::mint = yes_mint, associated_token::authority = market)]
    pub pool_yes_account: Box<Account<'info, TokenAccount>>,
    #[account(mut, associated_token::mint = no_mint, associated_token::authority = market)]
    pub pool_no_account: Box<Account<'info, TokenAccount>>,
    #[account(mut, token::mint = lp_mint, token::authority = provider)]
    pub provider_lp_account: Box<Account<'info, TokenAccount>>,
    #[account(
        init_if_needed,
        payer = provider,
        associated_token::mint = yes_mint,
        associated_token::authority = provider,
    )]
    pub provider_yes_account: Box<Account<'info, TokenAccount>>,
    #[account(
        init_if_needed,
        payer = provider,
        associated_token::mint = no_mint,
        associated_token::authority = provider,
    )]
    pub provider_no_account: Box<Account<'info, TokenAccount>>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

/// Burns `shares` for their pro-rata cut of both reserves, rounded down. Never guarded:
/// providers can always leave, including after the halt and after resolution, when they
/// redeem the winning side of what they get back.
pub fn handle_remove_liquidity(
    ctx: Context<RemoveLiquidity>,
    shares: u64,
    min_yes: u64,
    min_no: u64,
) -> Result<()> {
    require!(shares > 0, ErrorCode::StakeTooSmall);
    let supply = ctx.accounts.lp_mint.supply as u128;

    // Burn first: it proves the provider holds `shares`, so `shares <= supply` below.
    burn(
        CpiContext::new(
            token::ID,
            Burn {
                mint: ctx.accounts.lp_mint.to_account_info(),
                from: ctx.accounts.provider_lp_account.to_account_info(),
                authority: ctx.accounts.provider.to_account_info(),
            },
        ),
        shares,
    )?;

    let market = &ctx.accounts.market;
    let yes_out = (shares as u128 * market.pool_yes as u128 / supply) as u64;
    let no_out = (shares as u128 * market.pool_no as u128 / supply) as u64;
    require!(
        yes_out >= min_yes && no_out >= min_no,
        ErrorCode::SlippageExceeded
    );

    outcome::with_market_signer(market, |signer| {
        let pool = ctx.accounts.market.to_account_info();
        outcome::transfer_outcome(
            &ctx.accounts.yes_mint,
            &ctx.accounts.pool_yes_account,
            &ctx.accounts.provider_yes_account,
            pool.clone(),
            signer,
            yes_out,
        )?;
        outcome::transfer_outcome(
            &ctx.accounts.no_mint,
            &ctx.accounts.pool_no_account,
            &ctx.accounts.provider_no_account,
            pool,
            signer,
            no_out,
        )
    })?;

    let market = &mut ctx.accounts.market;
    market.pool_yes -= yes_out;
    market.pool_no -= no_out;
    Ok(())
}
