//! Typed metric readers. Each reader checks the account owner and layout before
//! reading a single field; nothing here trusts caller-supplied offsets.

use anchor_lang::prelude::*;
use anchor_lang::solana_program::bpf_loader_upgradeable;

use crate::{constants::*, error::ErrorCode, state::*};

/// Bounds-checked forward reader for layouts with variable-length parts (Borsh options and
/// strings): a short or malformed account is an error, never a panic.
struct Cursor<'a> {
    data: &'a [u8],
    pos: usize,
}

impl<'a> Cursor<'a> {
    fn new(data: &'a [u8]) -> Self {
        Self { data, pos: 0 }
    }

    fn take(&mut self, len: usize) -> Result<&'a [u8]> {
        let end = self
            .pos
            .checked_add(len)
            .ok_or(ErrorCode::InvalidMetricAccount)?;
        let bytes = self
            .data
            .get(self.pos..end)
            .ok_or(ErrorCode::InvalidMetricAccount)?;
        self.pos = end;
        Ok(bytes)
    }

    fn skip(&mut self, len: usize) -> Result<()> {
        self.take(len).map(|_| ())
    }

    fn u8(&mut self) -> Result<u8> {
        Ok(self.take(1)?[0])
    }

    fn u32(&mut self) -> Result<u32> {
        Ok(u32::from_le_bytes(self.take(4)?.try_into().unwrap()))
    }

    fn u64(&mut self) -> Result<u64> {
        Ok(u64::from_le_bytes(self.take(8)?.try_into().unwrap()))
    }

    fn key(&mut self) -> Result<Pubkey> {
        Ok(Pubkey::new_from_array(self.take(32)?.try_into().unwrap()))
    }

    /// A Borsh bool or `Option` tag: exactly 0 or 1.
    fn flag(&mut self) -> Result<bool> {
        match self.u8()? {
            0 => Ok(false),
            1 => Ok(true),
            _ => err!(ErrorCode::InvalidMetricAccount),
        }
    }

    /// Borsh `Option<Pubkey>`: a tag, then the key if it is 1.
    fn skip_optional_key(&mut self) -> Result<()> {
        if self.flag()? {
            self.skip(32)?;
        }
        Ok(())
    }

    /// Stake pool `FutureEpoch<Fee>`: tag 0 (none) or 1 and 2 (a pending fee follows: u64
    /// denominator, u64 numerator).
    fn skip_future_fee(&mut self) -> Result<()> {
        match self.u8()? {
            0 => Ok(()),
            1 | 2 => self.skip(16),
            _ => err!(ErrorCode::InvalidMetricAccount),
        }
    }
}

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
    owner: Pubkey,
    amount: u64,
}

/// Reads a token account with no delegate and no close authority. Whether it is a lock account is
/// decided by its owner and address, which `validate_new_market` checks once.
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
        coption_is_none(&data, 72) && coption_is_none(&data, 129),
        ErrorCode::InvalidMetricAccount
    );
    Ok(LockedView {
        mint: Pubkey::new_from_array(data[0..32].try_into().unwrap()),
        owner: Pubkey::new_from_array(data[32..64].try_into().unwrap()),
        amount: u64::from_le_bytes(data[64..72].try_into().unwrap()),
    })
}

/// Owner of every lock account: a PDA of this program, which never signs for it. SPL Token only
/// skips the owner check on burn and close for token accounts owned by the system program or the
/// incinerator, so nobody can burn, move or close tokens held by this owner.
fn lock_owner() -> Pubkey {
    Pubkey::find_program_address(&[LOCK_SEED], &crate::ID).0
}

/// The lock account for `mint`: `owner`'s associated token account, one per mint.
fn lock_account(owner: &Pubkey, mint: &Pubkey) -> Pubkey {
    Pubkey::find_program_address(
        &[owner.as_ref(), SPL_TOKEN_PROGRAM_ID.as_ref(), mint.as_ref()],
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

/// SPL stake pool `StakePool` (Borsh): account_type u8 (= 1) | manager, staker, stake_deposit_authority
/// (3 x 32) | stake_withdraw_bump_seed u8 | validator_list, reserve_stake (2 x 32) | pool_mint (32) |
/// manager_fee_account, token_program_id (2 x 32) | total_lamports, pool_token_supply,
/// last_update_epoch (3 x u64) | lockup (48) | epoch_fee (16) | next_epoch_fee: FutureEpoch<Fee> and then
/// the fields up to last_epoch_pool_token_supply and last_epoch_total_lamports, whose offsets move with
/// the options in between (427 when all are unset, as on JitoSOL and bSOL).
struct StakePoolView {
    pool_mint: Pubkey,
    total_lamports: u64,
    last_update_epoch: u64,
    last_epoch_total_lamports: u64,
}

const STAKE_POOL_ACCOUNT_TYPE: u8 = 1;

fn parse_stake_pool(data: &[u8]) -> Result<StakePoolView> {
    let mut c = Cursor::new(data);
    require!(
        c.u8()? == STAKE_POOL_ACCOUNT_TYPE,
        ErrorCode::InvalidMetricAccount
    );
    c.skip(3 * 32 + 1 + 2 * 32)?;
    let pool_mint = c.key()?;
    c.skip(2 * 32)?;
    let total_lamports = c.u64()?;
    c.skip(8)?; // pool_token_supply
    let last_update_epoch = c.u64()?;
    c.skip(48 + 16)?; // lockup, epoch_fee
    c.skip_future_fee()?; // next_epoch_fee
    c.skip_optional_key()?; // preferred_deposit_validator_vote_address
    c.skip_optional_key()?; // preferred_withdraw_validator_vote_address
    c.skip(16 + 16)?; // stake_deposit_fee, stake_withdrawal_fee
    c.skip_future_fee()?; // next_stake_withdrawal_fee
    c.skip(1)?; // stake_referral_fee
    c.skip_optional_key()?; // sol_deposit_authority
    c.skip(16 + 1)?; // sol_deposit_fee, sol_referral_fee
    c.skip_optional_key()?; // sol_withdraw_authority
    c.skip(16)?; // sol_withdrawal_fee
    c.skip_future_fee()?; // next_sol_withdrawal_fee
    c.skip(8)?; // last_epoch_pool_token_supply
    let last_epoch_total_lamports = c.u64()?;
    Ok(StakePoolView {
        pool_mint,
        total_lamports,
        last_update_epoch,
        last_epoch_total_lamports,
    })
}

fn read_stake_pool(info: &AccountInfo) -> Result<StakePoolView> {
    require_keys_eq!(
        *info.owner,
        STAKE_POOL_PROGRAM_ID,
        ErrorCode::InvalidMetricAccount
    );
    parse_stake_pool(&info.try_borrow_data()?)
}

/// Meteora DAMM v2 `Pool` (zero-copy, 1112 bytes with its 8-byte Anchor discriminator): token_a_mint
/// at 168, token_b_mint at 200, `permanent_lock_liquidity` (u128) at 552. The field has one writer,
/// which adds the liquidity a position owner locks forever, so it only grows.
struct DammPoolView {
    token_a_mint: Pubkey,
    token_b_mint: Pubkey,
    permanent_lock_liquidity: u128,
}

const DAMM_POOL_LEN: usize = 1112;
/// First 8 bytes of sha256("account:Pool").
const DAMM_POOL_DISCRIMINATOR: [u8; 8] = [0xf1, 0x9a, 0x6d, 0x04, 0x11, 0xb1, 0x6d, 0xbc];

fn parse_damm_pool(data: &[u8]) -> Result<DammPoolView> {
    require!(
        data.len() == DAMM_POOL_LEN && data[..8] == DAMM_POOL_DISCRIMINATOR,
        ErrorCode::InvalidMetricAccount
    );
    Ok(DammPoolView {
        token_a_mint: Pubkey::new_from_array(data[168..200].try_into().unwrap()),
        token_b_mint: Pubkey::new_from_array(data[200..232].try_into().unwrap()),
        permanent_lock_liquidity: u128::from_le_bytes(data[552..568].try_into().unwrap()),
    })
}

fn read_damm_pool(info: &AccountInfo) -> Result<DammPoolView> {
    require_keys_eq!(
        *info.owner,
        DAMM_V2_PROGRAM_ID,
        ErrorCode::InvalidMetricAccount
    );
    parse_damm_pool(&info.try_borrow_data()?)
}

/// `DammV2LockedAtLeast` goal in liquidity units: the u64 threshold scaled by 2^shift. A shift past
/// the width of u128 is unreachable (it never meets the goal).
fn damm_goal(threshold: u64, shift: u8) -> u128 {
    u128::from(threshold)
        .checked_shl(u32::from(shift))
        .unwrap_or(u128::MAX)
}

/// Metaplex Token Metadata `Metadata` (Borsh): key u8 (= 4) | update_authority (32) | mint (32) |
/// name, symbol, uri (u32 length + bytes each, at most 32, 10 and 200) | seller_fee_basis_points u16 |
/// creators Option<Vec<{address 32, verified u8, share u8}>> (at most 5) | primary_sale_happened bool |
/// is_mutable bool | ... Returns `is_mutable`. The strings and creators move it (323 without
/// creators), so it is found by walking, and trailing fields are ignored.
fn parse_metadata_is_mutable(data: &[u8], mint: &Pubkey) -> Result<bool> {
    const KEY_METADATA_V1: u8 = 4;
    let mut c = Cursor::new(data);
    require!(c.u8()? == KEY_METADATA_V1, ErrorCode::InvalidMetricAccount);
    c.skip(32)?; // update_authority
    let found = c.key()?;
    require_keys_eq!(found, *mint, ErrorCode::InvalidMetricAccount);
    for max_len in [32u32, 10, 200] {
        let len = c.u32()?;
        require!(len <= max_len, ErrorCode::InvalidMetricAccount);
        c.skip(len as usize)?;
    }
    c.skip(2)?; // seller_fee_basis_points
    if c.flag()? {
        let creators = c.u32()? as usize;
        require!(creators <= 5, ErrorCode::InvalidMetricAccount);
        c.skip(creators * 34)?;
    }
    c.flag()?; // primary_sale_happened
    c.flag()
}

fn read_metadata_is_mutable(info: &AccountInfo, mint: &Pubkey) -> Result<bool> {
    require_keys_eq!(
        *info.owner,
        TOKEN_METADATA_PROGRAM_ID,
        ErrorCode::InvalidMetricAccount
    );
    parse_metadata_is_mutable(&info.try_borrow_data()?, mint)
}

/// The Token Metadata account of `mint`.
fn metadata_account(mint: &Pubkey) -> Pubkey {
    Pubkey::find_program_address(
        &[
            b"metadata",
            TOKEN_METADATA_PROGRAM_ID.as_ref(),
            mint.as_ref(),
        ],
        &TOKEN_METADATA_PROGRAM_ID,
    )
    .0
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
            // One canonical account per mint: the lock owner's associated token account.
            let owner = lock_owner();
            require_keys_eq!(
                metric_account.key(),
                lock_account(&owner, &target.key()),
                ErrorCode::InvalidMetricAccount
            );
            let locked = read_locked_tokens(metric_account)?;
            require_keys_eq!(locked.mint, target.key(), ErrorCode::InvalidMetricAccount);
            require_keys_eq!(locked.owner, owner, ErrorCode::InvalidMetricAccount);
            require!(
                locked.amount < metric_threshold,
                ErrorCode::MetricAlreadyMet
            );
        }
        ResolverKind::StakePoolTvlAtLeast { epoch } => {
            let pool = read_stake_pool(metric_account)?;
            require_keys_eq!(
                pool.pool_mint,
                target.key(),
                ErrorCode::InvalidMetricAccount
            );
            require!(epoch > clock.epoch, ErrorCode::InvalidEpoch);
            // The goal is read from a total of 0 or more, so 0 would be a free YES.
            require!(metric_threshold > 0, ErrorCode::MetricAlreadyMet);
            // A pool whose balance updates stopped can never write the epoch's snapshot.
            require!(
                pool.last_update_epoch.saturating_add(1) >= clock.epoch,
                ErrorCode::InvalidMetricAccount
            );
            require!(
                pool.total_lamports.max(pool.last_epoch_total_lamports) < metric_threshold,
                ErrorCode::MetricAlreadyMet
            );
        }
        ResolverKind::DammV2LockedAtLeast { shift } => {
            require!(shift <= 64, ErrorCode::InvalidThreshold);
            require!(metric_threshold > 0, ErrorCode::MetricAlreadyMet);
            let pool = read_damm_pool(metric_account)?;
            let mint = target.key();
            require!(
                mint == pool.token_a_mint || mint == pool.token_b_mint,
                ErrorCode::InvalidMetricAccount
            );
            require!(
                pool.permanent_lock_liquidity < damm_goal(metric_threshold, shift),
                ErrorCode::MetricAlreadyMet
            );
        }
        ResolverKind::MetadataImmutable => {
            require_keys_eq!(
                metric_account.key(),
                metadata_account(&target.key()),
                ErrorCode::InvalidMetricAccount
            );
            require!(
                read_metadata_is_mutable(metric_account, &target.key())?,
                ErrorCode::AlreadyImmutable
            );
        }
    }
    Ok(metric_account.key())
}

/// The epoch an epoch-measured kind reads, or `None` for a ratchet metric.
pub fn measured_epoch(kind: &ResolverKind) -> Option<u64> {
    match kind {
        ResolverKind::StakeAtLeast { epoch } | ResolverKind::StakePoolTvlAtLeast { epoch } => {
            Some(*epoch)
        }
        _ => None,
    }
}

/// Reads a ratchet metric (one that cannot be un-met). Not defined for the epoch-measured kinds.
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
        ResolverKind::DammV2LockedAtLeast { shift } => Ok(read_damm_pool(metric_account)?
            .permanent_lock_liquidity
            >= damm_goal(market.metric_threshold, shift)),
        ResolverKind::MetadataImmutable => Ok(!read_metadata_is_mutable(
            metric_account,
            &market.target_pubkey,
        )?),
        ResolverKind::StakeAtLeast { .. } | ResolverKind::StakePoolTvlAtLeast { .. } => {
            unreachable!("epoch-measured kinds are not ratchet metrics")
        }
    }
}

/// Guard for everything that trades YES against NO or USDC: the sponsor sale and the pool.
/// Trading stops at the cutoff and the moment the outcome is knowable, so nobody can buy
/// the known winner from a stale price: a ratchet metric already met, or the measured
/// epoch already started.
pub fn require_trading_open(
    market: &Market,
    metric_account: &AccountInfo,
    clock: &Clock,
) -> Result<()> {
    require!(market.outcome == Outcome::Open, ErrorCode::AlreadyResolved);
    require!(clock.slot < market.cutoff_slot, ErrorCode::BettingClosed);
    match measured_epoch(&market.kind) {
        Some(epoch) => require!(clock.epoch < epoch, ErrorCode::BettingClosed),
        None => require!(
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

/// Outcome of a `StakePoolTvlAtLeast { epoch }` market, or `NotResolvableYet` while the pool has not
/// yet written epoch `epoch`'s snapshot.
///
/// The pool's first balance update of an epoch stores the total it held before the update in
/// `last_epoch_total_lamports` and sets `last_update_epoch`; deposits and withdrawals revert until
/// then. So the value is the total at the start of `epoch`, fixed until the first update of the next
/// epoch overwrites it. Once that has happened, or the epoch is over and the pool cannot be read,
/// the market is NO.
pub fn resolve_stake_pool(
    market: &Market,
    epoch: u64,
    metric_account: &AccountInfo,
    clock: &Clock,
) -> Result<Outcome> {
    require!(clock.epoch >= epoch, ErrorCode::NotResolvableYet);
    let pool = match read_stake_pool(metric_account) {
        Ok(pool) => pool,
        // A pool that can no longer be read cannot prove YES; do not leave the vault stuck.
        Err(_) if clock.epoch > epoch => return Ok(Outcome::No),
        Err(error) => return Err(error),
    };
    if pool.last_update_epoch == epoch {
        if pool.last_epoch_total_lamports >= market.metric_threshold {
            Ok(Outcome::Yes)
        } else {
            Ok(Outcome::No)
        }
    } else if pool.last_update_epoch > epoch || clock.epoch > epoch {
        Ok(Outcome::No)
    } else {
        err!(ErrorCode::NotResolvableYet)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // Real mainnet accounts (scripts/capture-fixtures.ts), so the readers are tested against the
    // bytes the third-party programs actually wrote.
    const JITOSOL_POOL: &[u8] = include_bytes!("../../../tests/fixtures/stakepool-jitosol.bin");
    const BSOL_POOL: &[u8] = include_bytes!("../../../tests/fixtures/stakepool-bsol.bin");
    const DAMM_SOL_USDC: &[u8] = include_bytes!("../../../tests/fixtures/damm-sol-usdc.bin");
    const DAMM_FT8FD9: &[u8] = include_bytes!("../../../tests/fixtures/damm-ft8fd9.bin");
    const META_USDC: &[u8] = include_bytes!("../../../tests/fixtures/metadata-usdc.bin");
    const META_WIF: &[u8] = include_bytes!("../../../tests/fixtures/metadata-wif.bin");
    const META_SMB: &[u8] = include_bytes!("../../../tests/fixtures/metadata-smb-1301.bin");
    const META_MADLADS: &[u8] = include_bytes!("../../../tests/fixtures/metadata-madlads-1725.bin");

    const USDC: Pubkey = pubkey!("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
    const WIF: Pubkey = pubkey!("EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm");
    const SMB_1301: Pubkey = pubkey!("7ZSAteJutckigttWZD7ECd8FYuoZfMB2WSgaJQrc2Sgk");
    const MADLADS_1725: Pubkey = pubkey!("A9NcfDzeRWEHnrq5txTCEAab4MMgxzb9LvL73NaEGVef");

    fn u64_at(data: &[u8], at: usize) -> u64 {
        u64::from_le_bytes(data[at..at + 8].try_into().unwrap())
    }

    #[test]
    fn stake_pool_decodes_the_real_jitosol_and_bsol_accounts() {
        let jito = parse_stake_pool(JITOSOL_POOL).unwrap();
        assert_eq!(
            jito.pool_mint,
            pubkey!("J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn")
        );
        // Every option is unset on these pools, so the walk ends at the offsets we know.
        assert_eq!(jito.total_lamports, u64_at(JITOSOL_POOL, 258));
        assert_eq!(jito.last_update_epoch, u64_at(JITOSOL_POOL, 274));
        assert_eq!(jito.last_epoch_total_lamports, u64_at(JITOSOL_POOL, 427));
        assert!(jito.last_epoch_total_lamports > 1_000_000_000_000_000);

        let bsol = parse_stake_pool(BSOL_POOL).unwrap();
        assert_eq!(
            bsol.pool_mint,
            pubkey!("bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1")
        );
        assert_eq!(bsol.last_epoch_total_lamports, u64_at(BSOL_POOL, 427));
    }

    #[test]
    fn stake_pool_walk_follows_set_options() {
        // A pending next_epoch_fee (tag 1, +16 bytes) and a set sol_deposit_authority (+32) move the
        // field: the walk must land 48 bytes later, on the value we plant there.
        let mut moved = JITOSOL_POOL.to_vec();
        let tail = moved[346..].to_vec();
        moved.truncate(346);
        moved.push(1);
        moved.extend_from_slice(&[0u8; 16]);
        // preferred_deposit, preferred_withdraw, stake fees, next_stake_withdrawal_fee,
        // stake_referral_fee are unchanged: copy them (349 - 347 = 2 options + 32 + 1 + 1 + ...).
        moved.extend_from_slice(&tail[1..383 - 346]);
        // sol_deposit_authority: Some(key)
        moved.push(1);
        moved.extend_from_slice(&[7u8; 32]);
        moved.extend_from_slice(&tail[384 - 346..]);
        let pool = parse_stake_pool(&moved).unwrap();
        assert_eq!(
            pool.last_epoch_total_lamports,
            u64_at(JITOSOL_POOL, 427),
            "the walk found the same value 48 bytes further on"
        );
        assert_eq!(&moved[427 + 48..427 + 56], &JITOSOL_POOL[427..435]);
    }

    #[test]
    fn stake_pool_rejects_other_account_types_and_bad_tags() {
        let mut validator_list = JITOSOL_POOL.to_vec();
        validator_list[0] = 2;
        assert!(parse_stake_pool(&validator_list).is_err());
        let mut bad_tag = JITOSOL_POOL.to_vec();
        bad_tag[346] = 3; // FutureEpoch tags are 0, 1 or 2
        assert!(parse_stake_pool(&bad_tag).is_err());
        let mut bad_option = JITOSOL_POOL.to_vec();
        bad_option[347] = 2; // Option tags are 0 or 1
        assert!(parse_stake_pool(&bad_option).is_err());
    }

    #[test]
    fn truncated_accounts_error_instead_of_panicking() {
        for len in 0..JITOSOL_POOL.len() {
            let parsed = parse_stake_pool(&JITOSOL_POOL[..len]);
            assert_eq!(parsed.is_ok(), len >= 435, "stake pool at {len} bytes");
        }
        for len in 0..META_USDC.len() {
            let parsed = parse_metadata_is_mutable(&META_USDC[..len], &USDC);
            assert_eq!(parsed.is_ok(), len >= 324, "metadata at {len} bytes");
        }
        for len in 0..DAMM_SOL_USDC.len() {
            assert!(parse_damm_pool(&DAMM_SOL_USDC[..len]).is_err());
        }
        assert!(parse_damm_pool(DAMM_SOL_USDC).is_ok());
    }

    #[test]
    fn damm_pool_decodes_the_real_pools() {
        let pool = parse_damm_pool(DAMM_SOL_USDC).unwrap();
        assert_eq!(
            pool.token_a_mint,
            pubkey!("So11111111111111111111111111111111111111112")
        );
        assert_eq!(pool.token_b_mint, USDC);
        assert_eq!(
            pool.permanent_lock_liquidity,
            u128::from_le_bytes(DAMM_SOL_USDC[552..568].try_into().unwrap())
        );
        let locked = parse_damm_pool(DAMM_FT8FD9).unwrap();
        // Ft8FD9 has the most liquidity locked of the pools sampled: 3.6e28 units.
        assert!(locked.permanent_lock_liquidity > 36_000_000_000_000_000_000_000_000_000);
        let mut wrong_discriminator = DAMM_SOL_USDC.to_vec();
        wrong_discriminator[0] ^= 1;
        assert!(parse_damm_pool(&wrong_discriminator).is_err());
    }

    #[test]
    fn damm_goal_scales_by_a_power_of_two_without_overflow() {
        assert_eq!(damm_goal(5, 0), 5);
        assert_eq!(damm_goal(5, 64), 5 << 64);
        assert_eq!(damm_goal(u64::MAX, 64), u128::from(u64::MAX) << 64);
        assert_eq!(damm_goal(1, 200), u128::MAX, "unreachable goal, no panic");
    }

    #[test]
    fn metadata_walk_finds_is_mutable_with_and_without_creators() {
        assert!(parse_metadata_is_mutable(META_USDC, &USDC).unwrap());
        assert!(!parse_metadata_is_mutable(META_WIF, &WIF).unwrap());
        // 3 and 2 creators move the flag from 323 to 429 and 395.
        assert!(!parse_metadata_is_mutable(META_SMB, &SMB_1301).unwrap());
        assert!(parse_metadata_is_mutable(META_MADLADS, &MADLADS_1725).unwrap());
        // A flag flipped at the offset the walk finds is read back.
        let mut flipped = META_USDC.to_vec();
        flipped[323] = 0;
        assert!(!parse_metadata_is_mutable(&flipped, &USDC).unwrap());
    }

    #[test]
    fn metadata_rejects_the_wrong_mint_key_lengths_and_tags() {
        assert!(parse_metadata_is_mutable(META_USDC, &WIF).is_err());
        let mut wrong_key = META_USDC.to_vec();
        wrong_key[0] = 5; // MasterEditionV2, not a metadata account
        assert!(parse_metadata_is_mutable(&wrong_key, &USDC).is_err());
        let mut long_name = META_USDC.to_vec();
        long_name[65..69].copy_from_slice(&33u32.to_le_bytes());
        assert!(parse_metadata_is_mutable(&long_name, &USDC).is_err());
        let mut many_creators = META_USDC.to_vec();
        many_creators[321] = 1; // Some(creators) ...
        many_creators[322..326].copy_from_slice(&6u32.to_le_bytes()); // ... of 6, more than allowed
        assert!(parse_metadata_is_mutable(&many_creators, &USDC).is_err());
        let mut bad_bool = META_USDC.to_vec();
        bad_bool[323] = 2;
        assert!(parse_metadata_is_mutable(&bad_bool, &USDC).is_err());
    }

    #[test]
    fn lock_account_is_owned_by_a_pda_that_is_not_special_cased_by_spl_token() {
        let owner = lock_owner();
        let (expected, _) = Pubkey::find_program_address(&[LOCK_SEED], &crate::ID);
        assert_eq!(owner, expected);
        // SPL Token skips owner checks on burn and close only for these two owners.
        assert_ne!(owner, anchor_lang::solana_program::system_program::ID);
        assert_ne!(
            owner,
            pubkey!("1nc1nerator11111111111111111111111111111111")
        );
        assert!(!owner.is_on_curve(), "a PDA has no private key");
        assert_ne!(lock_account(&owner, &USDC), lock_account(&owner, &WIF));
    }
}
