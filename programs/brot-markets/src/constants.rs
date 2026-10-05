//! Purpose: seeds, the collateral mint and the hard limits compiled into the program.
//! Version: 0.0.1
//! Sprint: 00 (setup)

use anchor_lang::prelude::*;

/// Global configuration, one per program: `["config"]`.
#[constant]
pub const CONFIG_SEED: &[u8] = b"config";

/// Global cap on the total held in open questions: `["cap"]`.
#[constant]
pub const CAP_SEED: &[u8] = b"cap";

/// One account per question: `["question", id]`.
#[constant]
pub const QUESTION_SEED: &[u8] = b"question";

/// The USDC vault of a question, a token account at a program-derived address so nobody can
/// create it first: `["vault", question]`.
#[constant]
pub const VAULT_SEED: &[u8] = b"vault";

/// One account per wallet and question, holding both sides: `["position", question, bettor]`.
#[constant]
pub const POSITION_SEED: &[u8] = b"position";

/// Where collected fees wait for the sweep: `["fee_vault"]`.
#[constant]
pub const FEE_VAULT_SEED: &[u8] = b"fee_vault";

/// Collateral for every question. Circle devnet USDC by default; build with
/// `--features mainnet` for mainnet USDC.
#[cfg(not(feature = "mainnet"))]
#[constant]
pub const USDC_MINT: Pubkey = pubkey!("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");
#[cfg(feature = "mainnet")]
#[constant]
pub const USDC_MINT: Pubkey = pubkey!("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");

#[constant]
pub const USDC_DECIMALS: u8 = 6;

/// Basis points in 100%.
#[constant]
pub const BPS_DENOMINATOR: u64 = 10_000;

/// Ceiling for the fee on the losing side. The admin can lower the fee of future questions,
/// never raise it above this (product rule R-32).
#[constant]
pub const MAX_FEE_BPS: u16 = 1_000;

/// Smallest bet, in USDC base units (1 USDC). Working default for founder question 3 of the
/// technical plan, section 14.2.
#[constant]
pub const MIN_BET: u64 = 1_000_000;
