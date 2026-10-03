//! Typed metric readers. Each reader checks the account owner and layout before
//! reading a single field; nothing here trusts caller-supplied offsets.

use anchor_lang::prelude::*;
use anchor_lang::solana_program::bpf_loader_upgradeable;

use crate::{constants::*, error::ErrorCode, state::*};

/// SPL `COption` tag: a little-endian u32 at `at`, 0 for `None`.
fn coption_is_none(data: &[u8], at: usize) -> bool {
    u32::from_le_bytes(data[at..at + 4].try_into().unwrap()) == 0
}

/// SPL Token `Mint` layout: COption<Pubkey> mint authority (36) | supply u64 | decimals u8 |
/// is_initialized u8 | COption<Pubkey> freeze authority (36).
struct MintView {
    mint_authority_revoked: bool,
    freeze_authority_revoked: bool,
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
    Ok(MintView {
        mint_authority_revoked: coption_is_none(&data, 0),
        freeze_authority_revoked: coption_is_none(&data, 46),
        supply: u64::from_le_bytes(data[36..44].try_into().unwrap()),
    })
}

/// SPL Token `Account` layout: mint (32) | owner (32) | amount u64 | COption<Pubkey> delegate (36) |
/// state u8 | COption<u64> is_native (12) | delegated_amount u64 | COption<Pubkey> close authority (36).
struct LockedView {
    mint: Pubkey,
    amount: u64,
}

/// Reads a token account nobody can ever sign for: owned by the incinerator, with no
/// delegate and no close authority, so its balance can only go up.
fn read_locked_tokens(info: &AccountInfo) -> Result<LockedView> {
    require_keys_eq!(
        *info.owner,
        SPL_TOKEN_PROGRAM_ID,
        ErrorCode::InvalidMetricAccount
    );
    let data = info.try_borrow_data()?;
    require!(
        data.len() == SPL_TOKEN_ACCOUNT_LEN && data[108] != 0,
        ErrorCode::InvalidMetricAccount
    );
    require!(
        data[32..64] == INCINERATOR_ID.to_bytes()
            && coption_is_none(&data, 72)
            && coption_is_none(&data, 129),
        ErrorCode::InvalidMetricAccount
    );
    Ok(LockedView {
        mint: Pubkey::new_from_array(data[0..32].try_into().unwrap()),
        amount: u64::from_le_bytes(data[64..72].try_into().unwrap()),
    })
}

fn incinerator_ata(mint: &Pubkey) -> Pubkey {
    Pubkey::find_program_address(
        &[
            INCINERATOR_ID.as_ref(),
            SPL_TOKEN_PROGRAM_ID.as_ref(),
            mint.as_ref(),
        ],
        &ASSOCIATED_TOKEN_PROGRAM_ID,
    )
    .0
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
            require!(mint.mint_authority_revoked, ErrorCode::MintAuthorityLive);
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
            // Every vote account has at least zero stake, so 0 would be a free YES.
            require!(metric_threshold > 0, ErrorCode::MetricAlreadyMet);
        }
        ResolverKind::MintAuthorityRevoked => {
            require_keys_eq!(
                target.key(),
                metric_account.key(),
                ErrorCode::InvalidMetricAccount
            );
            require!(
                !read_mint(metric_account)?.mint_authority_revoked,
                ErrorCode::MetricAlreadyMet
            );
        }
        ResolverKind::FreezeAuthorityRevoked => {
            require_keys_eq!(
                target.key(),
                metric_account.key(),
                ErrorCode::InvalidMetricAccount
            );
            require!(
                !read_mint(metric_account)?.freeze_authority_revoked,
                ErrorCode::MetricAlreadyMet
            );
        }
        ResolverKind::LockedAtLeast => {
            // One canonical account per mint: the one wallets create when sending to the incinerator.
            require_keys_eq!(
                metric_account.key(),
                incinerator_ata(&target.key()),
                ErrorCode::InvalidMetricAccount
            );
            let locked = read_locked_tokens(metric_account)?;
            require_keys_eq!(locked.mint, target.key(), ErrorCode::InvalidMetricAccount);
            require!(
                locked.amount < metric_threshold,
                ErrorCode::MetricAlreadyMet
            );
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
        ResolverKind::MintAuthorityRevoked => Ok(read_mint(metric_account)?.mint_authority_revoked),
        ResolverKind::FreezeAuthorityRevoked => {
            Ok(read_mint(metric_account)?.freeze_authority_revoked)
        }
        ResolverKind::LockedAtLeast => {
            Ok(read_locked_tokens(metric_account)?.amount >= market.metric_threshold)
        }
        ResolverKind::StakeAtLeast { .. } => unreachable!("stake is not a ratchet metric"),
    }
}

/// Guard for everything that trades YES against NO or USDC: the sponsor sale and the pool.
/// Trading stops at the cutoff and the moment the outcome is knowable, so nobody can buy
/// the known winner from a stale price: a ratchet metric already met, or the measured
/// stake epoch already started.
pub fn require_trading_open(
    market: &Market,
    metric_account: &AccountInfo,
    clock: &Clock,
) -> Result<()> {
    require!(market.outcome == Outcome::Open, ErrorCode::AlreadyResolved);
    require!(clock.slot < market.cutoff_slot, ErrorCode::BettingClosed);
    match market.kind {
        ResolverKind::StakeAtLeast { epoch } => {
            require!(clock.epoch < epoch, ErrorCode::BettingClosed)
        }
        _ => require!(
            !ratchet_met(market, metric_account)?,
            ErrorCode::MetricAlreadyMet
        ),
    }
    Ok(())
}

/// Current-epoch stake for the market's vote account (SIMD-0133 syscall).
pub fn epoch_stake(market: &Market) -> u64 {
    solana_epoch_stake::get_epoch_stake_for_vote_account(&market.metric_account)
}
