//! Purpose: the Brot Markets program on Pinocchio: On-Chain Campaigns paid in SOL; declares the
//!          program id and wires the modules and the entrypoint.
//! Version: 0.0.3 (new program id 5Rx8…n8o, 2026-10-09: the keypair of 6G2d…uVN was not at hand for the devnet deploy)
//! Sprint: 02 (pot core on Pinocchio)
//!
//! Every account check Anchor used to make is written by hand in `checks`, and every balance is
//! bookkept in account fields, never read from a vault. The crate links `std` because the Shank
//! attributes crate does; the entrypoint therefore uses Pinocchio's std panic hook.

pub mod checks;
pub mod constants;
pub mod entrypoint;
pub mod error;
pub mod events;
pub mod feeds;
pub mod instructions;
pub mod layout;
pub mod math;
pub mod readers;
pub mod state;
pub mod vault;

pinocchio::address::declare_id!("5Rx8o5c5frxqF17mZwvTFg36ZcW5xU12ePojqDbj9n8o");

#[cfg(not(feature = "no-entrypoint"))]
pinocchio::entrypoint!(entrypoint::process_instruction);
