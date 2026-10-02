use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::{constants::*, error::ErrorCode, events::PairMinted, outcome, state::*};

#[derive(Accounts)]
pub struct MintPair<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(mut, seeds = [MARKET_SEED, market.sponsor.as_ref(), &market.market_id.to_le_bytes()], bump = market.bump)]
    pub market: Box<Account<'info, Market>>,
    #[account(mut, address = market.yes_mint)]
    pub yes_mint: Box<Account<'info, Mint>>,
    #[account(mut, address = market.no_mint)]
    pub no_mint: Box<Account<'info, Mint>>,
    #[account(
        init_if_needed,
        payer = owner,
        associated_token::mint = yes_mint,
        associated_token::authority = owner,
    )]
    pub owner_yes_account: Box<Account<'info, TokenAccount>>,
    #[account(
        init_if_needed,
        payer = owner,
        associated_token::mint = no_mint,
        associated_token::authority = owner,
    )]
    pub owner_no_account: Box<Account<'info, TokenAccount>>,
    #[account(address = USDC_MINT @ ErrorCode::NotUsdc)]
    pub usdc_mint: Box<Account<'info, Mint>>,
    #[account(mut, address = market.vault)]
    pub vault: Box<Account<'info, TokenAccount>>,
    #[account(mut, token::mint = usdc_mint, token::authority = owner)]
    pub owner_usdc_account: Box<Account<'info, TokenAccount>>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

/// Deposits `amount` USDC base units and mints `amount` YES plus `amount` NO to the caller. A pair
/// is worth exactly its collateral whichever side wins, so it carries no outcome risk: it is
/// open to anyone until resolution, even after the metric is met, and never touches the
/// sponsor's budget. Speculators sell the side they do not want on any SPL market.
pub fn handle_mint_pair(ctx: Context<MintPair>, amount: u64) -> Result<()> {
    require!(
        ctx.accounts.market.outcome == Outcome::Open,
        ErrorCode::AlreadyResolved
    );
    require!(amount >= MIN_STAKE, ErrorCode::StakeTooSmall);

    outcome::deposit_usdc(
        &ctx.accounts.usdc_mint,
        &ctx.accounts.owner_usdc_account,
        &ctx.accounts.vault,
        ctx.accounts.owner.to_account_info(),
        amount,
    )?;

    outcome::mint_backed_pair(
        &ctx.accounts.market,
        (&ctx.accounts.yes_mint, &ctx.accounts.owner_yes_account),
        (&ctx.accounts.no_mint, &ctx.accounts.owner_no_account),
        amount,
    )?;
    emit!(PairMinted {
        market: ctx.accounts.market.key(),
        owner: ctx.accounts.owner.key(),
        amount,
    });
    Ok(())
}
