//! Purpose: entry point of the Brot Markets program; declares the program id and wires the modules.
//! Version: 0.0.1
//! Sprint: 00 (setup)
//!
//! Sprint 00 ships the skeleton only: no instruction exists yet. The pot core (config, question,
//! position, bet) arrives in Sprint 02; see docs/technical/TECHNICAL-PLAN.md, section 3.4.

pub mod constants;
pub mod error;
pub mod events;
pub mod instructions;
pub mod math;
pub mod readers;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;

declare_id!("6G2d7Cv66MR1NayPabh5aL6ZThTx15WPxL3NU4N24uVN");

#[program]
pub mod brot_markets {}
