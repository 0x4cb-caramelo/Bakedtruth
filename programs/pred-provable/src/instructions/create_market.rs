use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

use crate::{constants::*, error::ErrorCode, resolver, state::*};

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct CreateMarketArgs {
    pub market_id: u64,
    pub kind: ResolverKind,
    pub metric_threshold: u64,
    pub cutoff_slot: u64,
    pub deadline_slot: u64,
    /// Sponsor's NO stake: the bounty paid to YES holders if the goal is hit.
    pub sponsor_stake: u64,
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
    pub market: Account<'info, Market>,
    #[account(
        init,
        payer = sponsor,
        space = 8 + Position::INIT_SPACE,
        seeds = [POSITION_SEED, market.key().as_ref(), sponsor.key().as_ref()],
        bump
    )]
    pub sponsor_position: Account<'info, Position>,
    /// CHECK: mint, program id, or vote account; validated per resolver kind.
    pub target: UncheckedAccount<'info>,
    /// CHECK: account read at resolution; validated per resolver kind and locked into the market.
    pub metric_account: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handle_create_market(ctx: Context<CreateMarket>, args: CreateMarketArgs) -> Result<()> {
    let clock = Clock::get()?;
    require!(
        args.cutoff_slot > clock.slot && args.cutoff_slot <= args.deadline_slot,
        ErrorCode::InvalidSchedule
    );
    require!(
        args.sponsor_stake >= MIN_STAKE_LAMPORTS,
        ErrorCode::StakeTooSmall
    );

    let metric_account = resolver::validate_new_market(
        args.kind,
        args.metric_threshold,
        &ctx.accounts.target,
        &ctx.accounts.metric_account,
        &clock,
    )?;

    let market_key = ctx.accounts.market.key();
    let sponsor_key = ctx.accounts.sponsor.key();

    ctx.accounts.market.set_inner(Market {
        sponsor: sponsor_key,
        market_id: args.market_id,
        kind: args.kind,
        target_pubkey: ctx.accounts.target.key(),
        metric_account,
        metric_threshold: args.metric_threshold,
        cutoff_slot: args.cutoff_slot,
        deadline_slot: args.deadline_slot,
        yes_pool: 0,
        no_pool: args.sponsor_stake,
        outcome: Outcome::Open,
        resolved_slot: 0,
        bump: ctx.bumps.market,
    });
    ctx.accounts.sponsor_position.set_inner(Position {
        market: market_key,
        owner: sponsor_key,
        yes: 0,
        no: args.sponsor_stake,
        bump: ctx.bumps.sponsor_position,
    });

    transfer(
        CpiContext::new(
            anchor_lang::system_program::ID,
            Transfer {
                from: ctx.accounts.sponsor.to_account_info(),
                to: ctx.accounts.market.to_account_info(),
            },
        ),
        args.sponsor_stake,
    )
}
