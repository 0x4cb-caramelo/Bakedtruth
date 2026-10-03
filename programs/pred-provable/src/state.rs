use anchor_lang::prelude::*;

/// Closed set of resolvers. Each variant fixes the owner and layout of the account
/// it reads; there is deliberately no generic "offset + comparator" reader.
///
/// Every variant reads state that flash capital cannot move: burned supply of a
/// mint with no authority, a revoked authority, tokens locked at an address the
/// program never signs for, liquidity locked forever, or a balance frozen at an
/// epoch boundary.
///
/// Variants are Borsh-tagged by position: append new ones, never reorder.
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace, Debug)]
pub enum ResolverKind {
    /// YES once the SPL Token mint's supply is <= `metric_threshold`.
    /// Resolves early on cross. Requires `mint_authority == None` at creation.
    SupplyAtMost,
    /// YES once the program's upgrade authority is revoked. Resolves early on cross.
    Immutable,
    /// YES if the vote account's stake in `epoch` is >= `metric_threshold` lamports.
    /// Only resolvable while `Clock::epoch == epoch`.
    StakeAtLeast { epoch: u64 },
    /// YES once the SPL Token mint's mint authority is revoked. Resolves early on cross.
    MintAuthorityRevoked,
    /// YES once the SPL Token mint's freeze authority is revoked. Resolves early on cross.
    FreezeAuthorityRevoked,
    /// YES once the lock account for the mint (the associated token account of the program's
    /// `[LOCK_SEED]` PDA) holds >= `metric_threshold` base units, e.g. LP tokens locked forever.
    /// Resolves early on cross.
    LockedAtLeast,
    /// YES if the SPL stake pool's total at the start of `epoch` (`last_epoch_total_lamports`, written
    /// once by the pool's first balance update of that epoch, before deposits reopen) is >=
    /// `metric_threshold` lamports. `target` is the pool's mint. Capital has to sit in the pool across
    /// the epoch boundary, so a flash loan cannot move it.
    StakePoolTvlAtLeast { epoch: u64 },
    /// YES once the Meteora DAMM v2 pool's permanently locked liquidity is >= `metric_threshold <<
    /// shift` (liquidity units are u128, `shift` scales the u64 threshold, at most 64). Locking is
    /// one-way and the locked principal cannot repay a loan. Resolves early on cross.
    DammV2LockedAtLeast { shift: u8 },
    /// YES once the mint's Metaplex Token Metadata is immutable (`is_mutable == false`, which can only
    /// be flipped to false). Resolves early on cross.
    MetadataImmutable,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace, Debug)]
pub enum Outcome {
    Open,
    Yes,
    No,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug)]
pub enum Side {
    Yes,
    No,
}

/// KPI market with outcome tokens. The sponsor funds a budget and sells YES at a fixed
/// price. Each sale mints one YES to the buyer and books the matching NO to the sponsor
/// in `sponsor_no`. The buyer pays the price and the budget covers the rest, so every
/// YES is backed by exactly one USDC base unit held in the market's vault. The winning
/// side redeems 1:1 for it.
///
/// Invariants while the market is open:
/// `yes_supply == no_supply + sponsor_no` and `vault == budget + yes_supply`.
#[account]
#[derive(InitSpace)]
pub struct Market {
    pub sponsor: Pubkey,
    pub market_id: u64,
    pub kind: ResolverKind,
    /// Human-facing subject: mint, program id, or vote account.
    pub target_pubkey: Pubkey,
    /// Account actually read at resolution (equals `target_pubkey` for the mint and vote readers;
    /// the derived ProgramData for `Immutable`; the lock account for `LockedAtLeast`; the stake pool,
    /// DAMM v2 pool and metadata account for the three kinds that name `target_pubkey`'s mint).
    /// Locked at creation.
    pub metric_account: Pubkey,
    pub metric_threshold: u64,
    /// Last slot (exclusive) in which YES can be bought.
    pub cutoff_slot: u64,
    /// Last slot (inclusive) in which a ratchet metric may resolve YES.
    pub deadline_slot: u64,
    pub yes_mint: Pubkey,
    pub no_mint: Pubkey,
    /// USDC token account owned by this market. Holds the unspent budget plus one base unit
    /// per YES/NO pair.
    pub vault: Pubkey,
    /// What a buyer pays per YES, in basis points of its payout. The sponsor's
    /// bounty per YES is the remaining `BPS_DENOMINATOR - yes_price_bps`.
    pub yes_price_bps: u16,
    /// Sponsor USDC still available to cover future sales. Withdrawable after the sale closes.
    pub budget: u64,
    /// NO owed to the sponsor for every YES the sale minted. Kept as a balance instead of
    /// tokens so the sponsor cannot burn it against YES to unwind the sale while it is open,
    /// and the sale never depends on a token account the sponsor controls. Paid out by
    /// `withdraw_budget` if NO wins.
    pub sponsor_no: u64,
    /// Reserves of the guarded YES/NO pool. Tracked here instead of read from the pool's token
    /// accounts, so tokens sent to the pool by hand cannot move its price.
    pub pool_yes: u64,
    pub pool_no: u64,
    pub outcome: Outcome,
    pub resolved_slot: u64,
    pub bump: u8,
}
