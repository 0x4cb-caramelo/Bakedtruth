//! Purpose: row 7 of TP section 3.4.10, what an opening pays: US$ at the sponsored Pyth SOL/USD
//!          price of the config's feed, fresh by time and by slot and tight, at most the signed
//!          `max_lamports`, split 90/10; or nothing, for a team key that passes no `opening_usd`.
//! Version: 0.0.3
//! Sprint: 02 (pot core on Pinocchio), lane D; 03 (row 7's own codes and the slot bound), lane F
//!
//! Every value is recomputed here from the config and the price account; nothing the signer
//! passes is trusted but `opening_usd` and `max_lamports`, which only bound what they pay. Every
//! refusal of the SOL/USD account carries a row 7 code (Sprint 02 review): the reader's own codes
//! (6001 to 6004) stay with the campaign's metric account, so a refusal names the account at fault.

use pinocchio::{error::ProgramError, AccountView};

use crate::{
    error::BrotError,
    math::opening::{opening_paid_lamports, split_opening},
    readers::{
        price_touch::{check_fresh_and_tight, posted_within, PriceRefusal},
        price_update::{read_price_update, sponsored_account, PriceReading},
        ChainTime,
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
/// account of `sol_usd_feed_id` (derived, never trusted as passed), at most `max_lamports`. The
/// price is fresh within `max_price_age` by the clock's time and, through `posted_within`, by its
/// slot too (Sprint 03), so a cluster clock that lags cannot keep an old price fresh.
pub fn charge(
    params: &CreationParams,
    is_team: bool,
    opening_usd: u64,
    max_lamports: u64,
    sol_usd_price: &AccountView,
    time: &ChainTime,
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
    let reading = read_sol_usd(sol_usd_price, feed_id)?;
    let max_age = params.max_price_age.get();
    let max_conf_bps = params.max_price_conf_bps.get();
    check_fresh_and_tight(&reading, time.unix_timestamp, max_age, max_conf_bps)
        .map_err(sol_usd_refusal)?;
    if !posted_within(&reading, time.slot, max_age) {
        return Err(BrotError::SolUsdStale.into());
    }
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

/// The SOL/USD account read like any price account, owner and bytes from the same account, with
/// the reader's refusals renamed to row 7's.
fn read_sol_usd(account: &AccountView, feed_id: &[u8; 32]) -> Result<PriceReading, ProgramError> {
    let data = account.try_borrow()?;
    read_price_update(account.owner(), &data, feed_id).map_err(|error| sol_usd_read(error).into())
}

/// Row 7's own errors for a SOL/USD account the reader refused: its owner, its layout, its
/// verification and its feed. Any other error passes unchanged.
pub fn sol_usd_read(error: BrotError) -> BrotError {
    match error {
        BrotError::ReaderWrongOwner => BrotError::SolUsdWrongOwner,
        BrotError::ReaderBadLayout => BrotError::SolUsdBadLayout,
        BrotError::PriceNotFullyVerified => BrotError::SolUsdNotFullyVerified,
        BrotError::PriceWrongFeed => BrotError::SolUsdWrongFeed,
        other => other,
    }
}

/// Row 7's own errors for a SOL/USD price `check_fresh_and_tight` refused.
fn sol_usd_refusal(refusal: PriceRefusal) -> BrotError {
    match refusal {
        PriceRefusal::Stale => BrotError::SolUsdStale,
        PriceRefusal::NonPositive => BrotError::SolUsdPriceNonPositive,
        PriceRefusal::ConfidenceTooWide => BrotError::SolUsdConfidenceTooWide,
    }
}
