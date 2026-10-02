use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::{constants::*, error::ErrorCode, outcome, resolver, state::*};

#[derive(Accounts)]
pub struct BuyYes<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,
    #[account(mut, seeds = [MARKET_SEED, market.sponsor.as_ref(), &market.market_id.to_le_bytes()], bump = market.bump)]
    pub market: Box<Account<'info, Market>>,
    /// CHECK: address-locked to the market; read by the typed resolver.
    #[account(address = market.metric_account @ ErrorCode::InvalidMetricAccount)]
    pub metric_account: UncheckedAccount<'info>,
    #[account(mut, address = market.yes_mint)]
    pub yes_mint: Box<Account<'info, Mint>>,
    #[account(mut, address = market.no_mint)]
    pub no_mint: Box<Account<'info, Mint>>,
    #[account(
        init_if_needed,
        payer = buyer,
        associated_token::mint = yes_mint,
        associated_token::authority = buyer,
    )]
    pub buyer_yes_account: Box<Account<'info, TokenAccount>>,
    /// CHECK: the market's sponsor; only receives NO tokens.
    #[account(address = market.sponsor)]
    pub sponsor: UncheckedAccount<'info>,
    /// Created at market creation. Recreated here if the sponsor closed it, so the
    /// sponsor cannot halt the sale by closing their own token account.
    #[account(
        init_if_needed,
        payer = buyer,
        associated_token::mint = no_mint,
        associated_token::authority = sponsor,
    )]
    pub sponsor_no_account: Box<Account<'info, TokenAccount>>,
    #[account(address = USDC_MINT @ ErrorCode::NotUsdc)]
    pub usdc_mint: Box<Account<'info, Mint>>,
    #[account(mut, address = market.vault)]
    pub vault: Box<Account<'info, TokenAccount>>,
    #[account(mut, token::mint = usdc_mint, token::authority = buyer)]
    pub buyer_usdc_account: Box<Account<'info, TokenAccount>>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

/// Buys `amount` YES base units, each redeemable for one USDC base unit if YES wins.
pub fn handle_buy_yes(ctx: Context<BuyYes>, amount: u64) -> Result<()> {
    let clock = Clock::get()?;
    let market = &ctx.accounts.market;
    resolver::require_trading_open(market, &ctx.accounts.metric_account, &clock)?;
    require!(amount >= MIN_STAKE, ErrorCode::StakeTooSmall);

    // The buyer pays the price, rounded up, and the budget (already in the vault) covers
    // the rest, so the YES/NO pair minted below is backed by exactly `amount` USDC base units.
    let price = (amount as u128 * market.yes_price_bps as u128).div_ceil(BPS_DENOMINATOR as u128);
    let price = u64::try_from(price).map_err(|_| ErrorCode::MathOverflow)?;
    let cover = amount - price;
    let budget = market
        .budget
        .checked_sub(cover)
        .ok_or(ErrorCode::BudgetExhausted)?;

    outcome::deposit_usdc(
        &ctx.accounts.usdc_mint,
        &ctx.accounts.buyer_usdc_account,
        &ctx.accounts.vault,
        ctx.accounts.buyer.to_account_info(),
        price,
    )?;

    outcome::mint_backed_pair(
        &ctx.accounts.market,
        (&ctx.accounts.yes_mint, &ctx.accounts.buyer_yes_account),
        (&ctx.accounts.no_mint, &ctx.accounts.sponsor_no_account),
        amount,
    )?;

    ctx.accounts.market.budget = budget;
    Ok(())
}
