//! Purpose: the graduation kind's `PoolConfig`, read at opening only: the account passed after the
//!          nine slots of `user_open_campaign` must be the pool's own config, priced in SOL, with a
//!          threshold of at least `DBC_MIN_GRADUATION_LAMPORTS`. Returns that threshold.
//! Version: 0.0.1
//! Sprint: after 05 (the sixth kind; docs/technical/meteora-readers-plan.md section 4.3)
//!
//! Owner DBC, 1,048 bytes, the `PoolConfig` discriminator; `quote_mint` at 8 and
//! `migration_quote_threshold` (u64, in the quote mint's base units: lamports for wSOL) at 264. A
//! `ConfigWithTransferHook` (1,128 bytes) fails the size. DBC has no instruction that changes a
//! config (its `lib.rs` creates configs and updates none), so the threshold read at opening holds
//! for the campaign's life, and neither a join nor the resolution reads the config again.

use pinocchio::{error::ProgramError, AccountView, Address};

use super::CurvePool;
use crate::{
    constants::{DBC_MIN_GRADUATION_LAMPORTS, DBC_PROGRAM_ID, WSOL_MINT},
    error::BrotError,
    readers::cursor::Cursor,
};

/// DBC allocates every `PoolConfig` at this size, its discriminator included.
pub const CONFIG_LEN: usize = 1_048;
/// First 8 bytes of sha256("account:PoolConfig").
pub const CONFIG_DISCRIMINATOR: [u8; 8] = [0x1a, 0x6c, 0x0e, 0x7b, 0x74, 0xe6, 0x81, 0x2b];
/// Offsets of `quote_mint` (an address) and `migration_quote_threshold` (u64).
pub const QUOTE_MINT_AT: usize = 8;
pub const THRESHOLD_AT: usize = 264;
/// The bytes between the quote mint and the threshold, which the cursor skips.
const BEFORE_THRESHOLD: usize = THRESHOLD_AT - QUOTE_MINT_AT - 32;

/// What the reader takes from a config.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct CurveConfig {
    pub quote_mint: Address,
    /// `migration_quote_threshold`: the curve completes once `quote_reserve` reaches it.
    pub threshold: u64,
}

/// Reads a config from its owner and its bytes: the owner first, before a byte is read
/// (`ReaderWrongOwner`), then exactly `CONFIG_LEN` bytes starting with `CONFIG_DISCRIMINATOR`
/// (`ReaderBadLayout`).
pub fn read_config(owner: &Address, data: &[u8]) -> Result<CurveConfig, BrotError> {
    if *owner != DBC_PROGRAM_ID {
        return Err(BrotError::ReaderWrongOwner);
    }
    if data.len() != CONFIG_LEN {
        return Err(BrotError::ReaderBadLayout);
    }
    let mut cursor = Cursor::new(data);
    if cursor.take::<8>()? != CONFIG_DISCRIMINATOR {
        return Err(BrotError::ReaderBadLayout);
    }
    let quote_mint = Address::new_from_array(cursor.address()?);
    cursor.skip(BEFORE_THRESHOLD)?;
    let threshold = cursor.u64()?;
    Ok(CurveConfig {
        quote_mint,
        threshold,
    })
}

/// Row 2 for the config, in this order, each with its own error: the account is the pool's own
/// config, compared by address before a byte is read (`CurveConfigMismatch`); it is a
/// `PoolConfig` (`read_config`'s errors); it is priced in SOL (`CurveNotInSol`); its threshold is
/// at least `DBC_MIN_GRADUATION_LAMPORTS` (`CurveTooSmall`). Returns the threshold.
pub fn opening_threshold(config: &AccountView, pool: &CurvePool) -> Result<u64, ProgramError> {
    if *config.address() != pool.config {
        return Err(BrotError::CurveConfigMismatch.into());
    }
    let data = config.try_borrow()?;
    let read = read_config(config.owner(), &data)?;
    if read.quote_mint != WSOL_MINT {
        return Err(BrotError::CurveNotInSol.into());
    }
    if read.threshold < DBC_MIN_GRADUATION_LAMPORTS {
        return Err(BrotError::CurveTooSmall.into());
    }
    Ok(read.threshold)
}
