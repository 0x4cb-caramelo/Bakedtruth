use anchor_lang::prelude::*;

#[constant]
pub const MARKET_SEED: &[u8] = b"market";

#[constant]
pub const POSITION_SEED: &[u8] = b"position";

/// Smallest stake accepted on either side, in lamports. Keeps dust positions out.
#[constant]
pub const MIN_STAKE_LAMPORTS: u64 = 1_000_000;

pub const SPL_TOKEN_PROGRAM_ID: Pubkey = pubkey!("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
pub const VOTE_PROGRAM_ID: Pubkey = pubkey!("Vote111111111111111111111111111111111111111");

/// Packed size of an SPL Token `Mint` account.
pub const SPL_MINT_LEN: usize = 82;
