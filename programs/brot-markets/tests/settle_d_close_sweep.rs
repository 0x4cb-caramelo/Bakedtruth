//! Purpose: lane D's `close_campaign` and `sweep_fees` on the host: each refusal in its order, and that the
//!          Rent sysvar is read only after every refusal, so a refused close or sweep moves nothing. The host
//!          has no sysvars, so a call that passes every check stops at the Rent read (`UnsupportedSysvar`);
//!          the moves and the closed accounts are checked by the LiteSVM tests on the binary.
//! Version: 0.0.1
//! Sprint: 04 (lane D)

#[path = "settle_d_support/accounts.rs"]
mod accounts;
#[path = "checks_support/host.rs"]
mod host;

use accounts::*;
use brot_markets::{
    error::BrotError::{self, *},
    instructions::settlement::{close_campaign::close_campaign, sweep_fees::sweep_fees},
    layout::LeU32,
    state::enums::Status,
    ID,
};
use pinocchio::{error::ProgramError, Address};

const NO_DATA: &[u8] = &[];
const NO_SYSVAR: ProgramError = ProgramError::UnsupportedSysvar;

/// Every flag of a closable campaign set: fee, prize and creator share settled, nothing open.
fn ready(edit: impl FnOnce(&mut brot_markets::state::campaign::Campaign)) -> Vec<u8> {
    campaign(|c| {
        (c.fee_collected, c.prize_settled, c.creator_share_settled) = (1, 1, 1);
        c.status = Status::Settled as u8;
        c.entries_open = LeU32::new(0);
        edit(c);
    })
}

/// `close_campaign`'s slots: the campaign, the vault, the rent payer, the fee vault and the event slots.
fn close_slots(campaign_bytes: Option<Vec<u8>>, rent_payer: Address) -> Vec<HostAccount> {
    let [event_authority, program] = event_slots();
    let campaign = match campaign_bytes {
        Some(bytes) => campaign_account(bytes),
        None => HostAccount::new(campaign_addresses().0 .0, SYSTEM, &[]).writable(),
    };
    let rent = HostAccount::new(rent_payer, SYSTEM, &[]).writable();
    vec![
        campaign,
        vault_account(),
        rent,
        fee_vault_account(),
        event_authority,
        program,
    ]
}

/// `sweep_fees`'s slots: the config, the fee vault, the recipient and the event slots.
fn sweep_slots(config_recipient: Address, recipient: Address) -> Vec<HostAccount> {
    let [event_authority, program] = event_slots();
    let (_, fee_bump) = fee_vault();
    vec![
        config_account(config_recipient, fee_bump),
        fee_vault_account(),
        HostAccount::new(recipient, SYSTEM, &[]).writable(),
        event_authority,
        program,
    ]
}

#[track_caller]
fn refuses(handler: Handler, mut accounts: Vec<HostAccount>, error: BrotError) {
    assert_eq!(run(handler, &mut accounts, NO_DATA), Err(error.into()));
}

#[test]
fn settle_d_close_refuses_a_second_call_once_the_accounts_are_closed() {
    refuses(close_campaign, close_slots(None, RENT_PAYER), AlreadyClosed);
}

#[test]
fn settle_d_close_refuses_until_fee_prize_creator_share_and_entries_are_settled() {
    let cases: [fn(&mut brot_markets::state::campaign::Campaign); 5] = [
        |c| c.fee_collected = 0,
        |c| c.prize_settled = 0,
        |c| c.creator_share_settled = 0,
        |c| c.entries_open = LeU32::new(1),
        |c| c.status = Status::Settling as u8,
    ];
    for edit in cases {
        refuses(
            close_campaign,
            close_slots(Some(ready(edit)), RENT_PAYER),
            CampaignNotSettled,
        );
    }
}

#[test]
fn settle_d_close_refuses_another_rent_payer_and_a_vault_at_another_address() {
    refuses(
        close_campaign,
        close_slots(Some(ready(|_| {})), key(7)),
        RentPayerNotStored,
    );
    let mut wrong_vault = close_slots(Some(ready(|_| {})), RENT_PAYER);
    wrong_vault[1] = HostAccount::new(key(2), ID, &[])
        .writable()
        .lamports(VAULT_LAMPORTS);
    refuses(close_campaign, wrong_vault, PdaMismatch);
}

#[test]
fn settle_d_close_reads_the_rent_last_so_a_closable_campaign_moves_nothing_on_the_host() {
    let mut accounts = close_slots(Some(ready(|_| {})), RENT_PAYER);
    assert_eq!(run(close_campaign, &mut accounts, NO_DATA), Err(NO_SYSVAR));
    assert_eq!(lamports(&mut accounts, 1), VAULT_LAMPORTS);
    assert_eq!(lamports(&mut accounts, 2), 1_000_000_000);
}

#[test]
fn settle_d_sweep_refuses_another_recipient_and_the_fee_vault_as_recipient() {
    refuses(
        sweep_fees,
        sweep_slots(key(6), key(5)),
        FeeRecipientMismatch,
    );
    let fee = fee_vault().0;
    let mut as_fee_vault = sweep_slots(fee, fee);
    as_fee_vault[2] = HostAccount::new(fee, SYSTEM, &[]).writable();
    refuses(sweep_fees, as_fee_vault, FeeRecipientIsFeeVault);
}

#[test]
fn settle_d_sweep_refuses_a_fee_vault_at_another_address_and_arguments() {
    let mut wrong_vault = sweep_slots(key(6), key(6));
    wrong_vault[1] = HostAccount::new(key(2), ID, &[])
        .writable()
        .lamports(FEE_LAMPORTS);
    refuses(sweep_fees, wrong_vault, PdaMismatch);
    let mut with_data = sweep_slots(key(6), key(6));
    assert_eq!(
        run(sweep_fees, &mut with_data, &[0]),
        Err(BadInstructionData.into())
    );
}

#[test]
fn settle_d_sweep_reads_the_rent_after_the_checks_and_moves_nothing_on_the_host() {
    let mut accounts = sweep_slots(key(6), key(6));
    assert_eq!(run(sweep_fees, &mut accounts, NO_DATA), Err(NO_SYSVAR));
    assert_eq!(lamports(&mut accounts, 1), FEE_LAMPORTS);
    assert_eq!(lamports(&mut accounts, 2), 1_000_000_000);
}
