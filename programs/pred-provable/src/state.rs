use anchor_lang::prelude::*;

/// Closed set of resolvers. Each variant fixes the owner and layout of the account
/// it reads; there is deliberately no generic "offset + comparator" reader.
///
/// Every variant reads state that flash capital cannot move: burned supply of a
/// mint with no authority, a revoked upgrade authority, or stake frozen at the
/// epoch boundary.
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

/// Pari-mutuel KPI market. The sponsor seeds the NO pool (pays out if the goal is
/// hit); doers buy YES and then move the metric. Lamports are held by this account.
#[account]
#[derive(InitSpace)]
pub struct Market {
    pub sponsor: Pubkey,
    pub market_id: u64,
    pub kind: ResolverKind,
    /// Human-facing subject: mint, program id, or vote account.
    pub target_pubkey: Pubkey,
    /// Account actually read at resolution (equals `target_pubkey`, except for
    /// `Immutable`, where it is the derived ProgramData address). Locked at creation.
    pub metric_account: Pubkey,
    pub metric_threshold: u64,
    /// Last slot (exclusive) in which bets are accepted.
    pub cutoff_slot: u64,
    /// Last slot (inclusive) in which a ratchet metric may resolve YES.
    pub deadline_slot: u64,
    pub yes_pool: u64,
    pub no_pool: u64,
    pub outcome: Outcome,
    pub resolved_slot: u64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Position {
    pub market: Pubkey,
    pub owner: Pubkey,
    pub yes: u64,
    pub no: u64,
    pub bump: u8,
}
