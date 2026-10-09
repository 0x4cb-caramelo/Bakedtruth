//! Purpose: `SupplyAtMost`, the burn kind: YES once a classic SPL Token mint's supply is at or
//!          below the target. An irreversible fact while the mint authority stays revoked.
//! Version: 0.0.3
//! Sprint: 03 (readers and resolution); signatures frozen at the sprint's opening, bodies by lane A
//!
//! Ported from pred-provable's `resolver.rs`: Copyright (c) 2026 Ronaldo Pereira, MIT License
//! (LICENSE at the repository root).
//!
//! Owner classic SPL Token (a Token-2022 mint fails it), 82 bytes, initialized, mint authority
//! revoked at opening (`MintAuthorityLive`); target below the supply by at least
//! `MIN_DISTANCE_BPS_SUPPLY` (row 3). Resolution through `fact_resolution`.
//!
//! Where the port departs from `read_mint` and `ratchet_met`: each `COption` tag must be exactly
//! 0 or 1 and `is_initialized` exactly 1, as SPL Token's own unpacking requires (the original read
//! any non-zero tag as set); row 3's minimum distance is new (C45); after the deadline the account
//! is read again, so a late burn sets `met_late` and an unreadable mint voids, where the original
//! recorded NO without reading (TP section 3.4.6). A revoked mint authority cannot be set again,
//! so resolution reads the supply alone, as the original did.

use pinocchio::{error::ProgramError, AccountView, Address};

use super::{
    cursor::Cursor, fact_resolution, min_distance, CreationContext, CreationReading, ReadContext,
    Resolution,
};
use crate::{
    constants::{MIN_DISTANCE_BPS_SUPPLY, SPL_TOKEN_PROGRAM_ID},
    error::BrotError,
};

/// Size of a classic SPL Token `Mint`: `COption<Pubkey>` mint authority (36) | supply u64 (at 36)
/// | decimals u8 | is_initialized bool (at 45) | `COption<Pubkey>` freeze authority (36, at 46).
pub const MINT_LEN: usize = 82;

/// What the reader takes from a mint.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct MintReading {
    /// The mint authority is set: whoever holds it can mint, so the supply can still grow.
    pub mint_authority_live: bool,
    /// Tokens in existence, in base units.
    pub supply: u64,
}

/// Reads a classic SPL Token mint from its owner and its bytes. The owner comes first, before a
/// byte is read: any other program, Token-2022 included, is `ReaderWrongOwner`. Then the layout:
/// exactly `MINT_LEN` bytes, both `COption` tags 0 or 1, `is_initialized` 1, else
/// `ReaderBadLayout`. The decimals and both authorities' addresses are not read.
pub fn read_mint(owner: &Address, data: &[u8]) -> Result<MintReading, BrotError> {
    if *owner != SPL_TOKEN_PROGRAM_ID {
        return Err(BrotError::ReaderWrongOwner);
    }
    if data.len() != MINT_LEN {
        return Err(BrotError::ReaderBadLayout);
    }
    let mut cursor = Cursor::new(data);
    let mint_authority_live = coption_is_some(&mut cursor)?;
    let supply = cursor.u64()?;
    // decimals: not part of the comparison, which is in base units.
    cursor.skip(1)?;
    if cursor.u8()? != 1 {
        return Err(BrotError::ReaderBadLayout);
    }
    // The freeze authority: its tag must be valid; whether it is set does not matter here.
    coption_is_some(&mut cursor)?;
    Ok(MintReading {
        mint_authority_live,
        supply,
    })
}

/// The same read taken from the account itself, so the owner and the bytes cannot come from two
/// different accounts. Instructions use this one.
pub fn read_mint_account(account: &AccountView) -> Result<MintReading, ProgramError> {
    let data = account.try_borrow()?;
    Ok(read_mint(account.owner(), &data)?)
}

/// Rows 2 and 3 for this kind, checked in this order, each with its own error:
/// 1. the account is a classic SPL Token mint (`ReaderWrongOwner`, then `ReaderBadLayout`);
/// 2. its mint authority is revoked (`MintAuthorityLive`), so the supply can only fall;
/// 3. the target is not below zero, where no supply can go (`TargetUnreachable`);
/// 4. the supply is still above the target (`TargetAlreadyTouched`);
/// 5. the target is at least `min_distance(supply, MIN_DISTANCE_BPS_SUPPLY)` below the supply
///    (`TargetTooClose`): with a supply of 1,000,000, a target of 990,000 opens and 990,001 does
///    not.
pub fn validate_at_creation(ctx: &CreationContext) -> Result<CreationReading, ProgramError> {
    let mint = read_mint_account(ctx.metric)?;
    if mint.mint_authority_live {
        return Err(BrotError::MintAuthorityLive.into());
    }
    if ctx.target < 0 {
        return Err(BrotError::TargetUnreachable.into());
    }
    let supply = i128::from(mint.supply);
    if supply <= ctx.target {
        return Err(BrotError::TargetAlreadyTouched.into());
    }
    let highest_target = supply
        .checked_sub(min_distance(supply, MIN_DISTANCE_BPS_SUPPLY)?)
        .ok_or(BrotError::MathOverflow)?;
    if ctx.target > highest_target {
        return Err(BrotError::TargetTooClose.into());
    }
    Ok(CreationReading::default())
}

/// The join lock for this kind: true once the supply is at or below the target, which no later
/// mint can undo. An unreadable mint is an error, so the join is refused.
pub fn outcome_knowable(ctx: &ReadContext) -> Result<bool, ProgramError> {
    Ok(supply(ctx.metric)? <= ctx.campaign.target.get())
}

/// Resolution for this kind (TP section 3.4.6): the irreversible-fact table of `fact_resolution`,
/// met when the supply is at or below the target.
pub fn try_resolve(ctx: &ReadContext) -> Result<Resolution, ProgramError> {
    let target = ctx.campaign.target.get();
    fact_resolution(supply(ctx.metric), |supply| supply <= target, ctx)
}

/// The supply in the campaign's units: a u64, so always within i128.
fn supply(account: &AccountView) -> Result<i128, ProgramError> {
    read_mint_account(account).map(|mint| i128::from(mint.supply))
}

/// An SPL `COption<Pubkey>`: a u32 tag, exactly 0 (`None`) or 1 (`Some`), then 32 bytes that are
/// there either way.
fn coption_is_some(cursor: &mut Cursor) -> Result<bool, BrotError> {
    let some = match cursor.u32()? {
        0 => false,
        1 => true,
        _ => return Err(BrotError::ReaderBadLayout),
    };
    cursor.skip(32)?;
    Ok(some)
}
