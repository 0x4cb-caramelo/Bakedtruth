use anchor_lang::prelude::*;
use anchor_spl::token::{self, burn, Burn, Mint, Token, TokenAccount};

use crate::{constants::*, error::ErrorCode, outcome, state::*};

#[derive(Accounts)]
pub struct BurnPair<'info> {
    pub owner: Signer<'info>,
    #[account(mut, seeds = [MARKET_SEED, market.sponsor.as_ref(), &market.market_id.to_le_bytes()], bump = market.bump)]
    pub market: Box<Account<'info, Market>>,
    #[account(mut, address = market.yes_mint)]
    pub yes_mint: Box<Account<'info, Mint>>,
    #[account(mut, address = market.no_mint)]
    pub no_mint: Box<Account<'info, Mint>>,
    #[account(mut, token::mint = yes_mint, token::authority = owner)]
    pub owner_yes_account: Box<Account<'info, TokenAccount>>,
    #[account(mut, token::mint = no_mint, token::authority = owner)]
    pub owner_no_account: Box<Account<'info, TokenAccount>>,
    #[account(address = USDC_MINT @ ErrorCode::NotUsdc)]
    pub usdc_mint: Box<Account<'info, Mint>>,
    #[account(mut, address = market.vault)]
    pub vault: Box<Account<'info, TokenAccount>>,
    #[account(mut, token::mint = usdc_mint, token::authority = owner)]
    pub owner_usdc_account: Box<Account<'info, TokenAccount>>,
    pub token_program: Program<'info, Token>,
}

/// Burns `amount` YES and `amount` NO and returns their `amount` USDC base units of collateral.
/// Only while the market is open; once it resolves the losing side is worthless and
/// `redeem` pays out the winning side alone.
pub fn handle_burn_pair(ctx: Context<BurnPair>, amount: u64) -> Result<()> {
    require!(
        ctx.accounts.market.outcome == Outcome::Open,
        ErrorCode::AlreadyResolved
    );
    require!(amount > 0, ErrorCode::StakeTooSmall);

    for (mint, from) in [
        (&ctx.accounts.yes_mint, &ctx.accounts.owner_yes_account),
        (&ctx.accounts.no_mint, &ctx.accounts.owner_no_account),
    ] {
        burn(
            CpiContext::new(
                token::ID,
                Burn {
                    mint: mint.to_account_info(),
                    from: from.to_account_info(),
                    authority: ctx.accounts.owner.to_account_info(),
                },
            ),
            amount,
        )?;
    }

    outcome::pay_usdc(
        &ctx.accounts.market,
        &ctx.accounts.usdc_mint,
        &ctx.accounts.vault,
        &ctx.accounts.owner_usdc_account,
        amount,
    )
}
