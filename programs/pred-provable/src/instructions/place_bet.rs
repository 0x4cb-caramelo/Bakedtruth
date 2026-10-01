use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

use crate::{constants::*, error::ErrorCode, resolver, state::*};

#[derive(Accounts)]
pub struct PlaceBet<'info> {
    #[account(mut)]
    pub bettor: Signer<'info>,
    #[account(mut, seeds = [MARKET_SEED, market.sponsor.as_ref(), &market.market_id.to_le_bytes()], bump = market.bump)]
    pub market: Account<'info, Market>,
    #[account(
        init_if_needed,
        payer = bettor,
        space = 8 + Position::INIT_SPACE,
        seeds = [POSITION_SEED, market.key().as_ref(), bettor.key().as_ref()],
        bump
    )]
    pub position: Account<'info, Position>,
    /// CHECK: address-locked to the market; read by the typed resolver.
    #[account(address = market.metric_account @ ErrorCode::InvalidMetricAccount)]
    pub metric_account: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handle_place_bet(ctx: Context<PlaceBet>, side: Side, amount: u64) -> Result<()> {
    let clock = Clock::get()?;
    let market = &ctx.accounts.market;
    require!(market.outcome == Outcome::Open, ErrorCode::AlreadyResolved);
    require!(clock.slot < market.cutoff_slot, ErrorCode::BettingClosed);
    require!(amount >= MIN_STAKE_LAMPORTS, ErrorCode::StakeTooSmall);

    // Anti-sniping: once a ratchet metric is met, nobody can buy into the known outcome.
    // Stake markets lock as soon as the measured epoch starts.
    match market.kind {
        ResolverKind::StakeAtLeast { epoch } => {
            require!(clock.epoch < epoch, ErrorCode::BettingClosed)
        }
        _ => require!(
            !resolver::ratchet_met(market, &ctx.accounts.metric_account)?,
            ErrorCode::MetricAlreadyMet
        ),
    }

    transfer(
        CpiContext::new(
            anchor_lang::system_program::ID,
            Transfer {
                from: ctx.accounts.bettor.to_account_info(),
                to: ctx.accounts.market.to_account_info(),
            },
        ),
        amount,
    )?;

    let market_key = ctx.accounts.market.key();
    let market = &mut ctx.accounts.market;
    let position = &mut ctx.accounts.position;
    if position.owner == Pubkey::default() {
        position.market = market_key;
        position.owner = ctx.accounts.bettor.key();
        position.bump = ctx.bumps.position;
    }
    match side {
        Side::Yes => {
            market.yes_pool = market
                .yes_pool
                .checked_add(amount)
                .ok_or(ErrorCode::MathOverflow)?;
            position.yes = position
                .yes
                .checked_add(amount)
                .ok_or(ErrorCode::MathOverflow)?;
        }
        Side::No => {
            market.no_pool = market
                .no_pool
                .checked_add(amount)
                .ok_or(ErrorCode::MathOverflow)?;
            position.no = position
                .no
                .checked_add(amount)
                .ok_or(ErrorCode::MathOverflow)?;
        }
    }
    Ok(())
}
