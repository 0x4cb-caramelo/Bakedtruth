//! Purpose: a test-only program that forwards one instruction by CPI, so a test can show that
//!          `resolve_campaign` refuses to run below the top level (`checks::top_level`). Never
//!          deployed; built by `bun run build:program` into `target/deploy/cpi_proxy.so`.
//! Version: 0.0.3
//! Sprint: 03 (readers and resolution)
//!
//! Accounts: the target program, then the target instruction's accounts in order, each passed on
//! with the flags it has here. Data: the target instruction's data, unchanged.

use pinocchio::{
    cpi::invoke_with_bounds,
    error::ProgramError,
    instruction::{InstructionAccount, InstructionView},
    AccountView, Address, ProgramResult,
};

/// The most accounts the forwarded instruction may take.
const MAX_ACCOUNTS: usize = 8;

#[cfg(not(feature = "no-entrypoint"))]
pinocchio::entrypoint!(process_instruction);

pub fn process_instruction(
    _program_id: &Address,
    accounts: &mut [AccountView],
    data: &[u8],
) -> ProgramResult {
    let (target, forwarded) = accounts
        .split_first()
        .ok_or(ProgramError::NotEnoughAccountKeys)?;
    if forwarded.len() > MAX_ACCOUNTS {
        return Err(ProgramError::InvalidArgument);
    }
    let metas: [InstructionAccount; MAX_ACCOUNTS] =
        core::array::from_fn(|i| match forwarded.get(i) {
            Some(a) => InstructionAccount::new(a.address(), a.is_writable(), a.is_signer()),
            None => InstructionAccount::readonly(target.address()),
        });
    let accounts_used = metas
        .get(..forwarded.len())
        .ok_or(ProgramError::InvalidArgument)?;
    let instruction = InstructionView {
        program_id: target.address(),
        data,
        accounts: accounts_used,
    };
    invoke_with_bounds::<MAX_ACCOUNTS, AccountView>(&instruction, forwarded)
}
