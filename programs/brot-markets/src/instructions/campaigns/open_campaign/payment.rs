//! Purpose: row 7 of TP section 3.4.10, what an opening pays: US$ at the sponsored Pyth SOL/USD
//!          price of the config's feed, fresh and tight, at most the signed `max_lamports`, split
//!          90/10; or nothing, for a team key that passes no `opening_usd` (P-3).
//! Version: 0.0.2
//! Sprint: 02 (pot core on Pinocchio), lane D
//!
//! Every value is recomputed here from the config and the price account; nothing the signer
//! passes is trusted but `opening_usd` and `max_lamports`, which only bound what they pay.

use pinocchio::{error::ProgramError, AccountView};

use crate::{
    error::BrotError,
    math::opening::{opening_paid_lamports, split_opening},
    readers::price_touch::{
        check_fresh_and_tight, read_price_account, sponsored_account, PriceRefusal,
    },
    state::config::CreationParams,
};

/// What an opening moves into the vault and the SOL/USD price it was charged at. All zero for a
/// team key that adds no prize: nothing moves but rent (I14).
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub struct Payment {
    pub paid: u64,
    pub prize: u64,
    pub fee: u64,
    pub price: i64,
    pub exponent: i32,
    pub publish_time: i64,
}

/// Row 7. `opening_usd` 0 is a free opening, for a team key only (`OpeningUsdBelowFee` for any
/// other signer), and the SOL/USD slot is then neither checked nor read, so a stale feed never
/// stops the team. Any other amount pays like any wallet, a team key included (the [AC] reading
/// of how the team adds a prize): at least `opening_fee_usd`, at the price of the sponsored
/// account of `sol_usd_feed_id` (derived, never trusted as passed), at most `max_lamports`.
pub fn charge(
    params: &CreationParams,
    is_team: bool,
    opening_usd: u64,
    max_lamports: u64,
    sol_usd_price: &AccountView,
    now: i64,
) -> Result<Payment, ProgramError> {
    if opening_usd == 0 {
        return if is_team {
            Ok(Payment::default())
        } else {
            Err(BrotError::OpeningUsdBelowFee.into())
        };
    }
    if opening_usd < params.opening_fee_usd.get() {
        return Err(BrotError::OpeningUsdBelowFee.into());
    }
    let feed_id = &params.sol_usd_feed_id;
    let expected = sponsored_account(feed_id).map_err(|_| BrotError::SolUsdAccountMismatch)?;
    if *sol_usd_price.address() != expected {
        return Err(BrotError::SolUsdAccountMismatch.into());
    }
    let reading = read_price_account(sol_usd_price, feed_id)?;
    check_fresh_and_tight(
        &reading,
        now,
        params.max_price_age.get(),
        params.max_price_conf_bps.get(),
    )
    .map_err(sol_usd_refusal)?;
    let paid = opening_paid_lamports(opening_usd, reading.price, reading.exponent)?;
    if paid > max_lamports {
        return Err(BrotError::OpeningAboveMaxLamports.into());
    }
    let split = split_opening(paid, params.opening_prize_bps.get())?;
    Ok(Payment {
        // The amount compared with `max_lamports` is the amount that moves (T25).
        paid,
        prize: split.prize,
        fee: split.fee,
        price: reading.price,
        exponent: reading.exponent,
        publish_time: reading.publish_time,
    })
}

/// Row 7's own errors for a SOL/USD price `check_fresh_and_tight` refused.
fn sol_usd_refusal(refusal: PriceRefusal) -> BrotError {
    match refusal {
        PriceRefusal::Stale => BrotError::SolUsdStale,
        PriceRefusal::NonPositive => BrotError::SolUsdPriceNonPositive,
        PriceRefusal::ConfidenceTooWide => BrotError::SolUsdConfidenceTooWide,
    }
}
