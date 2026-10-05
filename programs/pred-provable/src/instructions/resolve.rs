use anchor_lang::prelude::*;
use anchor_lang::solana_program::instruction::{get_stack_height, TRANSACTION_LEVEL_STACK_HEIGHT};

use crate::{constants::*, error::ErrorCode, events::Resolved, resolver, state::*};

/// Permissionless. YES holders are the ones with the incentive to call it, so there is no resolver fee.
#[derive(Accounts)]
pub struct Resolve<'info> {
    #[account(mut, seeds = [MARKET_SEED, market.sponsor.as_ref(), &market.market_id.to_le_bytes()], bump = market.bump)]
    pub market: Account<'info, Market>,
    /// CHECK: address-locked to the market; read by the typed resolver.
    #[account(address = market.metric_account @ ErrorCode::InvalidMetricAccount)]
    pub metric_account: UncheckedAccount<'info>,
}

pub fn handle_resolve(ctx: Context<Resolve>) -> Result<()> {
    // Block resolution from inside another program's CPI, where the outer program could
    // wrap it with borrow/repay logic the instructions sysvar would not show.
    require!(
        get_stack_height() == TRANSACTION_LEVEL_STACK_HEIGHT,
        ErrorCode::CpiNotAllowed
    );

    let clock = Clock::get()?;
    let market = &ctx.accounts.market;
    require!(market.outcome == Outcome::Open, ErrorCode::AlreadyResolved);

    let outcome = match market.kind {
        // Ratchet metrics: YES the moment the goal is crossed, as long as it is proven by the
        // deadline. After the deadline the market is NO regardless, so an unresolved YES
        // cannot be claimed late with a metric that crossed after the deadline.
        ResolverKind::SupplyAtMost
        | ResolverKind::Immutable
        | ResolverKind::MintAuthorityRevoked
        | ResolverKind::FreezeAuthorityRevoked
        | ResolverKind::LockedAtLeast => {
            if clock.slot > market.deadline_slot {
                Outcome::No
            } else if resolver::ratchet_met(market, &ctx.accounts.metric_account)? {
                Outcome::Yes
            } else {
                return err!(ErrorCode::NotResolvableYet);
            }
        }
        // Stake is fixed for the whole epoch, so any slot within the target epoch reads the
        // same value and the caller cannot pick a favorable moment.
        ResolverKind::StakeAtLeast { epoch } => {
            require!(clock.epoch >= epoch, ErrorCode::NotResolvableYet);
            if clock.epoch == epoch && resolver::epoch_stake(market) >= market.metric_threshold {
                Outcome::Yes
            } else {
                Outcome::No
            }
        }
    };

    let market = &mut ctx.accounts.market;
    market.outcome = outcome;
    market.resolved_slot = clock.slot;
    emit!(Resolved {
        market: market.key(),
        outcome,
        slot: clock.slot,
    });
    Ok(())
}
