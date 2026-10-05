//! Purpose: on-chain readers that turn an account into a yes/no answer, ported from pred-provable (Sprint 03).
//! Version: 0.0.1
//! Sprint: 00 (setup); the price reader arrived in 01
//!
//! One reader per file. Each checks the owner and the layout of the account before it reads a
//! single field, and returns an error, never a panic, when the bytes are not what it expects.

pub mod cursor;
pub mod price_touch;
