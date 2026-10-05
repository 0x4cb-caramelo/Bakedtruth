use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::{constants::*, error::ErrorCode, events::MarketCreated, outcome, resolver, state::*};

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct CreateMarketArgs {
    pub market_id: u64,
    pub kind: ResolverKind,
    pub metric_threshold: u64,
    pub cutoff_slot: u64,
    pub deadline_slot: u64,
    /// What a buyer pays per YES, in basis points of its payout.
    pub yes_price_bps: u16,
    /// USDC the sponsor commits to cover the rest of each YES sold: the bounty.
    pub sponsor_budget: u64,
}

#[derive(Accounts)]
#[instruction(args: CreateMarketArgs)]
pub struct CreateMarket<'info> {
    #[account(mut)]
    pub sponsor: Signer<'info>,
    #[account(
        init,
        payer = sponsor,
        space = 8 + Market::INIT_SPACE,
        seeds = [MARKET_SEED, sponsor.key().as_ref(), &args.market_id.to_le_bytes()],
        bump
    )]
    pub market: Box<Account<'info, Market>>,
    /// Only the market can mint, and there is no freeze authority, so nobody can stop
    /// holders from trading or redeeming.
    #[account(
        init,
        payer = sponsor,
        seeds = [YES_MINT_SEED, market.key().as_ref()],
        bump,
        mint::decimals = OUTCOME_DECIMALS,
        mint::authority = market,
    )]
    pub yes_mint: Box<Account<'info, Mint>>,
    #[account(
        init,
        payer = sponsor,
        seeds = [NO_MINT_SEED, market.key().as_ref()],
        bump,
        mint::decimals = OUTCOME_DECIMALS,
        mint::authority = market,
    )]
    pub no_mint: Box<Account<'info, Mint>>,
    #[account(address = USDC_MINT @ ErrorCode::NotUsdc)]
    pub usdc_mint: Box<Account<'info, Mint>>,
    /// Holds the budget and all collateral. Only the market can move it.
    #[account(
        init,
        payer = sponsor,
        seeds = [VAULT_SEED, market.key().as_ref()],
        bump,
        token::mint = usdc_mint,
        token::authority = market,
    )]
    pub vault: Box<Account<'info, TokenAccount>>,
    #[account(mut, token::mint = usdc_mint, token::authority = sponsor)]
    pub sponsor_usdc_account: Box<Account<'info, TokenAccount>>,
    /// CHECK: mint, program id, or vote account; validated per resolver kind.
    pub target: UncheckedAccount<'info>,
    /// CHECK: account read at resolution; validated per resolver kind and locked into the market.
    pub metric_account: UncheckedAccount<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn handle_create_market(ctx: Context<CreateMarket>, args: CreateMarketArgs) -> Result<()> {
    let clock = Clock::get()?;
    require!(
        args.cutoff_slot > clock.slot && args.cutoff_slot <= args.deadline_slot,
        ErrorCode::InvalidSchedule
    );
    // 0 would hand out free YES; 10_000 would leave no bounty.
    require!(
        args.yes_price_bps > 0 && u64::from(args.yes_price_bps) < BPS_DENOMINATOR,
        ErrorCode::InvalidPrice
    );
    require!(args.sponsor_budget >= MIN_STAKE, ErrorCode::StakeTooSmall);

    let metric_account = resolver::validate_new_market(
        args.kind,
        args.metric_threshold,
        &ctx.accounts.target,
        &ctx.accounts.metric_account,
        &clock,
    )?;

    let market = Market {
        sponsor: ctx.accounts.sponsor.key(),
        market_id: args.market_id,
        kind: args.kind,
        target_pubkey: ctx.accounts.target.key(),
        metric_account,
        metric_threshold: args.metric_threshold,
        cutoff_slot: args.cutoff_slot,
        deadline_slot: args.deadline_slot,
        yes_mint: ctx.accounts.yes_mint.key(),
        no_mint: ctx.accounts.no_mint.key(),
        vault: ctx.accounts.vault.key(),
        yes_price_bps: args.yes_price_bps,
        budget: args.sponsor_budget,
        sponsor_no: 0,
        pool_yes: 0,
        pool_no: 0,
        outcome: Outcome::Open,
        resolved_slot: 0,
        bump: ctx.bumps.market,
    };
    ctx.accounts.market.set_inner(market);

    outcome::deposit_usdc(
        &ctx.accounts.usdc_mint,
        &ctx.accounts.sponsor_usdc_account,
        &ctx.accounts.vault,
        ctx.accounts.sponsor.to_account_info(),
        args.sponsor_budget,
    )?;

    emit!(MarketCreated {
        market: ctx.accounts.market.key(),
        sponsor: ctx.accounts.sponsor.key(),
        kind: args.kind,
        target: ctx.accounts.target.key(),
        metric_threshold: args.metric_threshold,
        cutoff_slot: args.cutoff_slot,
        deadline_slot: args.deadline_slot,
        yes_price_bps: args.yes_price_bps,
        budget: args.sponsor_budget,
    });
    Ok(())
}
