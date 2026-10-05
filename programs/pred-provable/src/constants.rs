use anchor_lang::prelude::*;

#[constant]
pub const MARKET_SEED: &[u8] = b"market";

#[constant]
pub const YES_MINT_SEED: &[u8] = b"yes_mint";

#[constant]
pub const NO_MINT_SEED: &[u8] = b"no_mint";

#[constant]
pub const LP_MINT_SEED: &[u8] = b"lp_mint";

/// The market's USDC vault: a token account owned by the market PDA at a program-derived
/// address, so nobody else can create it first and block `create_market`.
#[constant]
pub const VAULT_SEED: &[u8] = b"vault";

/// Collateral for every market. Circle's devnet USDC by default; build with
/// `--features mainnet` for mainnet USDC.
#[cfg(not(feature = "mainnet"))]
#[constant]
pub const USDC_MINT: Pubkey = pubkey!("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");
#[cfg(feature = "mainnet")]
#[constant]
pub const USDC_MINT: Pubkey = pubkey!("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");

#[constant]
pub const USDC_DECIMALS: u8 = 6;

/// Pool swap fee, kept in the pool for liquidity providers.
#[constant]
pub const SWAP_FEE_BPS: u64 = 100;

/// Outcome tokens use USDC's decimals, so one base unit redeems for exactly one USDC base unit.
#[constant]
pub const OUTCOME_DECIMALS: u8 = 6;

/// YES price is quoted in basis points of the token's payout.
#[constant]
pub const BPS_DENOMINATOR: u64 = 10_000;

/// Smallest sponsor budget, YES purchase, pair mint and first pool deposit: 1 USDC. Keeps dust out.
#[constant]
pub const MIN_STAKE: u64 = 1_000_000;

/// Owner of every `LockedAtLeast` lock account: the PDA `[LOCK_SEED]` of this program. The program
/// never signs for it, so tokens sent to its associated token accounts can never be moved, burned or
/// closed. The incinerator is not a lock: SPL Token lets anyone burn from, or close, the token accounts
/// it owns (and the system program's).
#[constant]
pub const LOCK_SEED: &[u8] = b"lock";

pub const SPL_TOKEN_PROGRAM_ID: Pubkey = pubkey!("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
pub const VOTE_PROGRAM_ID: Pubkey = pubkey!("Vote111111111111111111111111111111111111111");
pub const ASSOCIATED_TOKEN_PROGRAM_ID: Pubkey =
    pubkey!("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");
/// SPL stake pool program (JitoSOL, bSOL and most other Solana LSTs).
pub const STAKE_POOL_PROGRAM_ID: Pubkey = pubkey!("SPoo1Ku8WFXoNDMHPsrGSTSG1Y47rzgn41SLUNakuHy");
/// Meteora DAMM v2 (cp-amm).
pub const DAMM_V2_PROGRAM_ID: Pubkey = pubkey!("cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG");
/// Metaplex Token Metadata. Not upgradeable.
pub const TOKEN_METADATA_PROGRAM_ID: Pubkey =
    pubkey!("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

/// Packed size of an SPL Token `Mint` account.
pub const SPL_MINT_LEN: usize = 82;

/// Packed size of an SPL Token `Account`.
pub const SPL_TOKEN_ACCOUNT_LEN: usize = 165;
