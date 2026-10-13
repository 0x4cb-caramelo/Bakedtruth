//! Purpose: the Mollusk world of the contest tests (Sprint 14, lane L14B): the accounts (`data.rs`) and the
//!          contest's four instructions (`calls.rs`), run on the program's SBF binary at a clock the test sets.
//! Version: 0.0.1
//! Sprint: 14 (lane L14B). Each test crate declares `checks_support/mollusk.rs` as `world` beside this module.
#![allow(dead_code)]

mod calls;
mod data;

pub use calls::*;
pub use data::*;
