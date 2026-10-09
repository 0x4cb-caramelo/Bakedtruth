//! Purpose: lane D's `collect_fee` and `settle_prize` on the host: each refusal in its order, and the effect of
//!          a payment (the lamports that move, the flag, the sequence number). The host runs no CPI, so the
//!          events are not emitted here; the LiteSVM tests cover them on the binary.
//! Version: 0.0.1
//! Sprint: 04 (lane D)

#[path = "settle_d_support/accounts.rs"]
mod accounts;
#[path = "checks_support/host.rs"]
mod host;

use accounts::*;
use brot_markets::{
    error::BrotError::{self, *},
    instructions::settlement::{collect_fee::collect_fee, settle_prize::settle_prize},
    layout::{LeU32, ZeroCopy},
    state::{
        campaign::Campaign,
        enums::{SettleMode, Status, VoidReason},
    },
    ID,
};
use pinocchio::{error::ProgramError, Address};

const NO_DATA: &[u8] = &[];

/// `collect_fee`'s slots: the campaign, the vault, the fee vault and the two event slots.
fn collect_slots(bytes: Vec<u8>) -> Vec<HostAccount> {
    let [event_authority, program] = event_slots();
    vec![
        campaign_account(bytes),
        vault_account(),
        fee_vault_account(),
        event_authority,
        program,
    ]
}

/// `settle_prize`'s slots: the campaign, the vault, the recipient and the two event slots.
fn prize_slots(bytes: Vec<u8>, recipient: Address) -> Vec<HostAccount> {
    let [event_authority, program] = event_slots();
    let recipient = HostAccount::new(recipient, SYSTEM, &[]).writable();
    vec![
        campaign_account(bytes),
        vault_account(),
        recipient,
        event_authority,
        program,
    ]
}

fn settled(edit: impl FnOnce(&mut Campaign)) -> Vec<u8> {
    campaign(|c| {
        c.fee_collected = 0;
        edit(c);
    })
}

#[track_caller]
fn refuses(handler: Handler, mut accounts: Vec<HostAccount>, error: BrotError) {
    assert_eq!(run(handler, &mut accounts, NO_DATA), Err(error.into()));
}

#[test]
fn settle_d_collect_fee_moves_the_house_fee_and_the_opening_fee_once() {
    let mut accounts = collect_slots(settled(|_| {}));
    assert_eq!(run(collect_fee, &mut accounts, NO_DATA), Ok(()));
    // Split: fee 5,000 less the creator's 1,200, plus the held opening fee 100,000.
    let moved = 3_800 + OPENING;
    assert_eq!(lamports(&mut accounts, 1), VAULT_LAMPORTS - moved);
    assert_eq!(lamports(&mut accounts, 2), FEE_LAMPORTS + moved);
    let after = stored(&mut accounts, 0);
    let c = Campaign::from_bytes(&after).unwrap();
    assert_eq!((c.fee_collected, c.event_seq.get()), (1, 1));
    // A second call is refused, and moves nothing more.
    refuses(collect_fee, collect_slots(after), FeeAlreadyCollected);
}

#[test]
fn settle_d_collect_fee_refuses_until_the_entries_are_settled() {
    let open_entries = settled(|c| c.entries_open = LeU32::new(1));
    refuses(collect_fee, collect_slots(open_entries), CampaignNotSettled);
    let in_review = settled(|c| c.status = Status::InReview as u8);
    refuses(collect_fee, collect_slots(in_review), CampaignNotSettled);
    let not_finalized = settled(|c| c.settle_mode = SettleMode::Unset as u8);
    refuses(collect_fee, collect_slots(not_finalized), NotFinalized);
}

#[test]
fn settle_d_collect_fee_refuses_a_one_sided_pot_until_lane_c_records_its_total() {
    let one_sided = settled(|c| c.settle_mode = SettleMode::OneSided as u8);
    refuses(
        collect_fee,
        collect_slots(one_sided),
        OneSidedFeesNotRecorded,
    );
}

#[test]
fn settle_d_collect_fee_refuses_arguments_a_wrong_vault_and_a_read_only_slot() {
    let mut with_data = collect_slots(settled(|_| {}));
    assert_eq!(
        run(collect_fee, &mut with_data, &[0]),
        Err(BadInstructionData.into())
    );
    let mut short = collect_slots(settled(|_| {}));
    short.truncate(4);
    assert_eq!(
        run(collect_fee, &mut short, NO_DATA),
        Err(ProgramError::NotEnoughAccountKeys)
    );
    let mut wrong_vault = collect_slots(settled(|_| {}));
    wrong_vault[1] = HostAccount::new(key(2), ID, &[])
        .writable()
        .lamports(VAULT_LAMPORTS);
    refuses(collect_fee, wrong_vault, PdaMismatch);
    let mut read_only = collect_slots(settled(|_| {}));
    read_only[2] = HostAccount::new(fee_vault().0, ID, &[]).lamports(FEE_LAMPORTS);
    refuses(collect_fee, read_only, NotWritable);
}

#[test]
fn settle_d_settle_prize_returns_the_prize_to_the_stored_creator() {
    let one_sided = settled(|c| c.settle_mode = SettleMode::OneSided as u8);
    let mut accounts = prize_slots(one_sided, CREATOR);
    assert_eq!(run(settle_prize, &mut accounts, NO_DATA), Ok(()));
    assert_eq!(lamports(&mut accounts, 2), 1_000_000_000 + PRIZE);
    assert_eq!(lamports(&mut accounts, 1), VAULT_LAMPORTS - PRIZE);
    let c_after = stored(&mut accounts, 0);
    let c = Campaign::from_bytes(&c_after).unwrap();
    assert_eq!((c.prize_settled, c.event_seq.get()), (1, 1));
}

#[test]
fn settle_d_a_house_failure_void_returns_the_prize_and_the_opening_fee() {
    let void = settled(|c| {
        c.settle_mode = SettleMode::Refund as u8;
        c.void_reason = VoidReason::MissedWindow as u8;
    });
    let mut accounts = prize_slots(void, CREATOR);
    assert_eq!(run(settle_prize, &mut accounts, NO_DATA), Ok(()));
    assert_eq!(lamports(&mut accounts, 2), 1_000_000_000 + PRIZE + OPENING);
}

#[test]
fn settle_d_settle_prize_refuses_a_second_payment_another_recipient_and_an_open_campaign() {
    let paid = settled(|c| c.prize_settled = 1);
    refuses(
        settle_prize,
        prize_slots(paid, CREATOR),
        PrizeAlreadySettled,
    );
    let wrong = settled(|_| {});
    refuses(settle_prize, prize_slots(wrong, key(5)), WrongCreator);
    let open = settled(|c| c.status = Status::InReview as u8);
    refuses(settle_prize, prize_slots(open, CREATOR), NotFinalized);
}
