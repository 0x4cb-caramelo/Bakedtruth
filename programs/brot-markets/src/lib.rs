//! Purpose: the Brot Markets program on Pinocchio: On-Chain Campaigns paid in SOL; declares the
//!          program id and wires the modules and the entrypoint.
//! Version: 0.0.2
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

pinocchio::address::declare_id!("6G2d7Cv66MR1NayPabh5aL6ZThTx15WPxL3NU4N24uVN");

#[cfg(not(feature = "no-entrypoint"))]
pinocchio::entrypoint!(entrypoint::process_instruction);
