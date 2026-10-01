//! Typed metric readers. Each reader checks the account owner and layout before
//! reading a single field; nothing here trusts caller-supplied offsets.

use anchor_lang::prelude::*;
use anchor_lang::solana_program::bpf_loader_upgradeable;

use crate::{constants::*, error::ErrorCode, state::*};

/// SPL Token `Mint` layout: COption<Pubkey> authority (36) | supply u64 | decimals u8 | is_initialized u8 | ...
struct MintView {
    authority_revoked: bool,
    supply: u64,
}

fn read_mint(info: &AccountInfo) -> Result<MintView> {
    require_keys_eq!(
        *info.owner,
        SPL_TOKEN_PROGRAM_ID,
        ErrorCode::InvalidMetricAccount
    );
    let data = info.try_borrow_data()?;
    require!(
        data.len() == SPL_MINT_LEN && data[45] == 1,
        ErrorCode::InvalidMetricAccount
    );
    let tag = u32::from_le_bytes(data[0..4].try_into().unwrap());
    Ok(MintView {
        authority_revoked: tag == 0,
        supply: u64::from_le_bytes(data[36..44].try_into().unwrap()),
    })
}

/// Loader-v3 `ProgramData` layout: u32 tag (= 3) | u64 slot | Option<Pubkey> upgrade authority.
fn read_upgrade_authority_revoked(info: &AccountInfo) -> Result<bool> {
    require_keys_eq!(
        *info.owner,
        bpf_loader_upgradeable::ID,
        ErrorCode::InvalidMetricAccount
    );
    let data = info.try_borrow_data()?;
    require!(data.len() >= 45, ErrorCode::InvalidMetricAccount);
    let tag = u32::from_le_bytes(data[0..4].try_into().unwrap());
    require!(tag == 3, ErrorCode::InvalidMetricAccount);
    Ok(data[12] == 0)
}

/// Validates the target and metric accounts for a new market and returns the
/// metric account key to lock into the market.
pub fn validate_new_market(
    kind: ResolverKind,
    metric_threshold: u64,
    target: &AccountInfo,
    metric_account: &AccountInfo,
    clock: &Clock,
) -> Result<Pubkey> {
    match kind {
        ResolverKind::SupplyAtMost => {
            require_keys_eq!(
                target.key(),
                metric_account.key(),
                ErrorCode::InvalidMetricAccount
            );
            let mint = read_mint(metric_account)?;
            require!(mint.authority_revoked, ErrorCode::MintAuthorityLive);
            // A goal that is already met would be a free payout to early YES buyers.
            require!(mint.supply > metric_threshold, ErrorCode::MetricAlreadyMet);
        }
        ResolverKind::Immutable => {
            require_keys_eq!(
                *target.owner,
                bpf_loader_upgradeable::ID,
                ErrorCode::InvalidMetricAccount
            );
            require_keys_eq!(
                metric_account.key(),
                bpf_loader_upgradeable::get_program_data_address(&target.key()),
                ErrorCode::ProgramDataMismatch
            );
            require!(
                !read_upgrade_authority_revoked(metric_account)?,
                ErrorCode::AlreadyImmutable
            );
        }
        ResolverKind::StakeAtLeast { epoch } => {
            require_keys_eq!(
                target.key(),
                metric_account.key(),
                ErrorCode::InvalidMetricAccount
            );
            require_keys_eq!(
                *metric_account.owner,
                VOTE_PROGRAM_ID,
                ErrorCode::InvalidMetricAccount
            );
            require!(epoch > clock.epoch, ErrorCode::InvalidEpoch);
        }
    }
    Ok(metric_account.key())
}

/// Reads a ratchet metric (one that cannot be un-met). Not defined for `StakeAtLeast`.
pub fn ratchet_met(market: &Market, metric_account: &AccountInfo) -> Result<bool> {
    match market.kind {
        ResolverKind::SupplyAtMost => {
            Ok(read_mint(metric_account)?.supply <= market.metric_threshold)
        }
        ResolverKind::Immutable => read_upgrade_authority_revoked(metric_account),
        ResolverKind::StakeAtLeast { .. } => unreachable!("stake is not a ratchet metric"),
    }
}

/// Current-epoch stake for the market's vote account (SIMD-0133 syscall).
pub fn epoch_stake(market: &Market) -> u64 {
    solana_epoch_stake::get_epoch_stake_for_vote_account(&market.metric_account)
}
