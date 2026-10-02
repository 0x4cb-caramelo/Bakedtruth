//! Outcome-token and USDC plumbing shared by the sale, the pair instructions, the pool and payouts.

use anchor_lang::prelude::*;
use anchor_spl::token::{
    self, mint_to, transfer_checked, Mint, MintTo, TokenAccount, TransferChecked,
};

use crate::{constants::*, state::*};

/// Runs `f` with the market PDA's signer seeds. The market is the mint authority of the
/// YES, NO and LP mints and the owner of the USDC vault and the pool's token accounts.
pub fn with_market_signer<R>(market: &Market, f: impl FnOnce(&[&[&[u8]]]) -> R) -> R {
    let market_id = market.market_id.to_le_bytes();
    let bump = [market.bump];
    let seeds: &[&[u8]] = &[MARKET_SEED, market.sponsor.as_ref(), &market_id, &bump];
    f(&[seeds])
}

/// Mints `amount` of a market-controlled mint (YES, NO or LP) to `to`.
pub fn mint_from_market<'info>(
    market: &Account<'info, Market>,
    mint: &Account<'info, Mint>,
    to: &Account<'info, TokenAccount>,
    amount: u64,
) -> Result<()> {
    with_market_signer(market, |signer| {
        mint_to(
            CpiContext::new_with_signer(
                token::ID,
                MintTo {
                    mint: mint.to_account_info(),
                    to: to.to_account_info(),
                    authority: market.to_account_info(),
                },
                signer,
            ),
            amount,
        )
    })
}

/// Mints `amount` YES to `yes_to` and `amount` NO to `no_to`. Callers must already have
/// added `amount` USDC base units to the vault, which is what keeps every pair backed 1:1.
pub fn mint_backed_pair<'info>(
    market: &Account<'info, Market>,
    yes: (&Account<'info, Mint>, &Account<'info, TokenAccount>),
    no: (&Account<'info, Mint>, &Account<'info, TokenAccount>),
    amount: u64,
) -> Result<()> {
    for (mint, to) in [yes, no] {
        mint_from_market(market, mint, to, amount)?;
    }
    Ok(())
}

/// Moves outcome tokens. `authority` signs for `from`: a user, or the market itself
/// (pass its seeds via `with_market_signer`) when paying out of the pool.
pub fn transfer_outcome<'info>(
    mint: &Account<'info, Mint>,
    from: &Account<'info, TokenAccount>,
    to: &Account<'info, TokenAccount>,
    authority: AccountInfo<'info>,
    signer: &[&[&[u8]]],
    amount: u64,
) -> Result<()> {
    transfer_checked(
        CpiContext::new_with_signer(
            token::ID,
            TransferChecked {
                from: from.to_account_info(),
                mint: mint.to_account_info(),
                to: to.to_account_info(),
                authority,
            },
            signer,
        ),
        amount,
        OUTCOME_DECIMALS,
    )
}

/// Moves USDC from `from` into the market's vault; `authority` signs for `from`.
pub fn deposit_usdc<'info>(
    usdc_mint: &Account<'info, Mint>,
    from: &Account<'info, TokenAccount>,
    vault: &Account<'info, TokenAccount>,
    authority: AccountInfo<'info>,
    amount: u64,
) -> Result<()> {
    transfer_checked(
        CpiContext::new(
            token::ID,
            TransferChecked {
                from: from.to_account_info(),
                mint: usdc_mint.to_account_info(),
                to: vault.to_account_info(),
                authority,
            },
        ),
        amount,
        USDC_DECIMALS,
    )
}

/// Pays USDC out of the market's vault, signed by the market.
pub fn pay_usdc<'info>(
    market: &Account<'info, Market>,
    usdc_mint: &Account<'info, Mint>,
    vault: &Account<'info, TokenAccount>,
    to: &Account<'info, TokenAccount>,
    amount: u64,
) -> Result<()> {
    with_market_signer(market, |signer| {
        transfer_checked(
            CpiContext::new_with_signer(
                token::ID,
                TransferChecked {
                    from: vault.to_account_info(),
                    mint: usdc_mint.to_account_info(),
                    to: to.to_account_info(),
                    authority: market.to_account_info(),
                },
                signer,
            ),
            amount,
            USDC_DECIMALS,
        )
    })
}
