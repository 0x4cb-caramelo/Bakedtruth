//! Purpose: the program's interface: every instruction with its discriminator, its accounts in
//!          order and its arguments, for the dispatcher and for the Shank IDL (T9).
//! Version: 0.0.3
//! Sprint: 02 (pot core on Pinocchio); frozen at the sprint's opening; 03 appends
//!         `resolve_campaign`
//!
//! Instruction data is `[discriminator, arguments]`; the arguments are a fixed little-endian
//! layout of exactly their size (no string, no optional field: D-j). Shank numbers the variants
//! of `BrotInstruction` by position, so the constants in `ix` follow the same order and new
//! instructions are appended. Accounts after the listed ones are ignored. Every instruction
//! ends with the two event slots (T4).

pub mod admin;
pub mod campaigns;
pub mod entries;
pub mod interface;
pub mod resolution;
pub mod settlement;

use pinocchio::{error::ProgramError, ProgramResult};

use crate::{error::BrotError, layout::ZeroCopy};

pub use interface::BrotInstruction;

/// Instruction discriminators, in the order of `BrotInstruction`.
pub mod ix {
    pub const ADMIN_INITIALIZE_CONFIG: u8 = 0;
    pub const ADMIN_SET_TEAM: u8 = 1;
    pub const ADMIN_SET_CREATION_PARAMS: u8 = 2;
    pub const ADMIN_SET_FEE_RECIPIENT: u8 = 3;
    pub const ADMIN_TRANSFER_ADMIN: u8 = 4;
    pub const ADMIN_ACCEPT_ADMIN: u8 = 5;
    pub const TEAM_PAUSE_ENTRIES: u8 = 6;
    pub const ADMIN_RESUME_ENTRIES: u8 = 7;
    pub const USER_OPEN_CAMPAIGN: u8 = 8;
    pub const USER_JOIN_CAMPAIGN: u8 = 9;
    pub const RESOLVE_CAMPAIGN: u8 = 10;
    pub const TEAM_CONFIRM_RESULT: u8 = 11;
    pub const TEAM_VOID_CAMPAIGN: u8 = 12;
    pub const TEAM_OPEN_CONTEST: u8 = 13;
    pub const FINALIZE_CAMPAIGN: u8 = 14;
    pub const SETTLE_ENTRY: u8 = 15;
    pub const SETTLE_CREATOR_SHARE: u8 = 16;
    pub const COLLECT_FEE: u8 = 17;
    pub const SETTLE_PRIZE: u8 = 18;
    pub const CLOSE_CAMPAIGN: u8 = 19;
    pub const SWEEP_FEES: u8 = 20;
    /// Not an instruction: the self-CPI that carries an event (`events::EVENT_IX_TAG`).
    pub const EMIT_EVENT: u8 = crate::events::EVENT_IX_TAG;
}

/// The arguments of an instruction, refused unless the data is exactly their size.
pub fn args<T: ZeroCopy>(data: &[u8]) -> Result<&T, ProgramError> {
    T::from_bytes(data).ok_or_else(|| BrotError::BadInstructionData.into())
}

/// An instruction without arguments carries none.
pub fn no_args(data: &[u8]) -> ProgramResult {
    if data.is_empty() {
        Ok(())
    } else {
        Err(BrotError::BadInstructionData.into())
    }
}
