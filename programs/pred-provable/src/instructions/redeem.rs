use anchor_lang::prelude::*;
use anchor_spl::token::{self, burn, close_account, Burn, CloseAccount, Mint, Token, TokenAccount};

use crate::{constants::*, error::ErrorCode, outcome, state::*};

#[derive(Accounts)]
pub struct Redeem<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(mut, seeds = [MARKET_SEED, market.sponsor.as_ref(), &market.market_id.to_le_bytes()], bump = market.bump)]
    pub market: Box<Account<'info, Market>>,
    /// Checked against the outcome in the handler, so an open market reports `NotResolved`.
    #[account(mut)]
    pub winning_mint: Box<Account<'info, Mint>>,
    #[account(mut, token::mint = winning_mint, token::authority = owner)]
    pub owner_tokens: Box<Account<'info, TokenAccount>>,
    #[account(address = USDC_MINT @ ErrorCode::NotUsdc)]
    pub usdc_mint: Box<Account<'info, Mint>>,
    #[account(mut, address = market.vault)]
    pub vault: Box<Account<'info, TokenAccount>>,
    #[account(mut, token::mint = usdc_mint, token::authority = owner)]
    pub owner_usdc_account: Box<Account<'info, TokenAccount>>,
    pub token_program: Program<'info, Token>,
}

/// Burns the owner's whole winning balance for the same number of USDC base units, then
/// closes the emptied token account so its rent goes back too.
pub fn handle_redeem(ctx: Context<Redeem>) -> Result<()> {
    let market = &ctx.accounts.market;
    let winning_mint = match market.outcome {
        Outcome::Open => return err!(ErrorCode::NotResolved),
        Outcome::Yes => market.yes_mint,
        Outcome::No => market.no_mint,
    };
    require_keys_eq!(
        ctx.accounts.winning_mint.key(),
        winning_mint,
        ErrorCode::NotWinningMint
    );
    let amount = ctx.accounts.owner_tokens.amount;
    require!(amount > 0, ErrorCode::NothingToRedeem);

    burn(
        CpiContext::new(
            token::ID,
            Burn {
                mint: ctx.accounts.winning_mint.to_account_info(),
                from: ctx.accounts.owner_tokens.to_account_info(),
                authority: ctx.accounts.owner.to_account_info(),
            },
        ),
        amount,
    )?;
    close_account(CpiContext::new(
        token::ID,
        CloseAccount {
            account: ctx.accounts.owner_tokens.to_account_info(),
            destination: ctx.accounts.owner.to_account_info(),
            authority: ctx.accounts.owner.to_account_info(),
        },
    ))?;

    // Each winning token is backed by one USDC base unit in the vault, so this never
    // touches the sponsor's budget.
    outcome::pay_usdc(
        &ctx.accounts.market,
        &ctx.accounts.usdc_mint,
        &ctx.accounts.vault,
        &ctx.accounts.owner_usdc_account,
        amount,
    )
}
