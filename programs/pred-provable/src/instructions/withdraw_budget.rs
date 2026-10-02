use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::{constants::*, error::ErrorCode, events::SponsorWithdrew, outcome, state::*};

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

/// Pays the sponsor what it is owed now, and can be called again later:
/// - the unspent budget, once the sale is closed (cutoff passed or market resolved), or at
///   any time while the sale has sold nothing, which cancels it. Once a YES is sold the
///   budget stays locked until the cutoff, so it cannot be pulled from under doers;
/// - its NO collateral (`sponsor_no`), 1:1, once the market resolves NO.
pub fn handle_withdraw_budget(ctx: Context<WithdrawBudget>) -> Result<()> {
    let clock = Clock::get()?;
    let market = &mut ctx.accounts.market;

    require!(
        clock.slot >= market.cutoff_slot
            || market.outcome != Outcome::Open
            || market.sponsor_no == 0,
        ErrorCode::SaleStillOpen
    );
    let budget = std::mem::take(&mut market.budget);
    let sponsor_no = match market.outcome {
        Outcome::No => std::mem::take(&mut market.sponsor_no),
        Outcome::Open | Outcome::Yes => 0,
    };
    let amount = budget
        .checked_add(sponsor_no)
        .ok_or(ErrorCode::MathOverflow)?;
    require!(amount > 0, ErrorCode::NothingToWithdraw);

    outcome::pay_usdc(
        &ctx.accounts.market,
        &ctx.accounts.usdc_mint,
        &ctx.accounts.vault,
        &ctx.accounts.sponsor_usdc_account,
        amount,
    )?;
    emit!(SponsorWithdrew {
        market: ctx.accounts.market.key(),
        sponsor: ctx.accounts.sponsor.key(),
        budget,
        sponsor_no,
    });
    Ok(())
}
