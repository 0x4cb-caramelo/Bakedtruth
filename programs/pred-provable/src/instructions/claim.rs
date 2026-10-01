use anchor_lang::prelude::*;

use crate::{constants::*, error::ErrorCode, state::*};

#[derive(Accounts)]
pub struct Claim<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(mut, seeds = [MARKET_SEED, market.sponsor.as_ref(), &market.market_id.to_le_bytes()], bump = market.bump)]
    pub market: Account<'info, Market>,
    /// Closing the position is what prevents a double claim.
    #[account(
        mut,
        close = owner,
        seeds = [POSITION_SEED, market.key().as_ref(), owner.key().as_ref()],
        bump = position.bump,
        has_one = owner,
        has_one = market
    )]
    pub position: Account<'info, Position>,
}

pub fn handle_claim(ctx: Context<Claim>) -> Result<()> {
    let market = &ctx.accounts.market;
    let position = &ctx.accounts.position;

    let (stake, winning_pool) = match market.outcome {
        Outcome::Open => return err!(ErrorCode::NotResolved),
        Outcome::Yes => (position.yes, market.yes_pool),
        Outcome::No => (position.no, market.no_pool),
    };
    let total_pool = market.yes_pool as u128 + market.no_pool as u128;

    // Pari-mutuel: winners split the whole pot pro rata. If nobody backed the winning
    // side, everyone is refunded their own stake.
    let payout = if winning_pool == 0 {
        position
            .yes
            .checked_add(position.no)
            .ok_or(ErrorCode::MathOverflow)?
    } else {
        u64::try_from(stake as u128 * total_pool / winning_pool as u128)
            .map_err(|_| ErrorCode::MathOverflow)?
    };

    if payout > 0 {
        // The market account is program-owned, so lamports can be moved without a CPI.
        // Payouts never exceed the pools, so the account stays rent-exempt.
        ctx.accounts.market.sub_lamports(payout)?;
        ctx.accounts.owner.add_lamports(payout)?;
    }
    Ok(())
}
