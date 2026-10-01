use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("cutoff_slot must be in the future and no later than deadline_slot")]
    InvalidSchedule,
    #[msg("Stake is below the minimum")]
    StakeTooSmall,
    #[msg("Metric account does not match the resolver kind (owner, size or layout)")]
    InvalidMetricAccount,
    #[msg("Mint authority must be revoked, otherwise supply can be faked by mint-then-burn")]
    MintAuthorityLive,
    #[msg("Program is already immutable; the market would be decided at creation")]
    AlreadyImmutable,
    #[msg("Target epoch must be in the future")]
    InvalidEpoch,
    #[msg("Program data account is not derived from the target program")]
    ProgramDataMismatch,
    #[msg("Betting is closed for this market")]
    BettingClosed,
    #[msg("Metric is already met; betting is locked")]
    MetricAlreadyMet,
    #[msg("Market is already resolved")]
    AlreadyResolved,
    #[msg("Market is not resolved yet")]
    NotResolved,
    #[msg("Market cannot be resolved yet")]
    NotResolvableYet,
    #[msg("resolve must be a top-level instruction, not a CPI")]
    CpiNotAllowed,
    #[msg("Position already claimed")]
    AlreadyClaimed,
    #[msg("Arithmetic overflow")]
    MathOverflow,
}
