//! Purpose: the team rules of `admin_set_team` (Q12, TP section 3.4.9): at most five keys, none
//!          zero, none twice, every slot past `team_len` zero; each refusal with its own error.
//! Version: 0.0.1
//! Sprint: 02 (pot core on Pinocchio); lane B

use brot_markets::{
    error::BrotError,
    instructions::admin::{
        set_team::SetTeamArgs,
        shared::{is_zero, ZERO_ADDRESS},
    },
};
use pinocchio::{error::ProgramError, Address};

/// A distinct, non-zero key for each `n` above zero.
fn key(n: u8) -> Address {
    Address::new_from_array([n; 32])
}

fn team(team_len: u8, team: [Address; 5]) -> Result<(), ProgramError> {
    SetTeamArgs { team_len, team }.validate()
}

fn refused(error: BrotError) -> Result<(), ProgramError> {
    Err(error.into())
}

const Z: Address = ZERO_ADDRESS;

#[test]
fn the_zero_address_is_all_zero_bytes() {
    assert_eq!(ZERO_ADDRESS.to_bytes(), [0u8; 32]);
    assert!(is_zero(&Z));
    assert!(!is_zero(&key(1)));
}

#[test]
fn up_to_five_distinct_keys_pass() {
    assert_eq!(team(5, [key(1), key(2), key(3), key(4), key(5)]), Ok(()));
    assert_eq!(team(2, [key(1), key(2), Z, Z, Z]), Ok(()));
    assert_eq!(team(1, [key(9), Z, Z, Z, Z]), Ok(()));
}

#[test]
fn an_empty_team_passes_and_removes_every_key() {
    assert_eq!(team(0, [Z; 5]), Ok(()));
}

#[test]
fn more_than_five_keys_are_refused() {
    let five = [key(1), key(2), key(3), key(4), key(5)];
    assert_eq!(team(6, five), refused(BrotError::TeamTooLarge));
    assert_eq!(team(u8::MAX, five), refused(BrotError::TeamTooLarge));
}

#[test]
fn a_zero_key_in_a_used_slot_is_refused() {
    assert_eq!(team(1, [Z; 5]), refused(BrotError::ZeroAddress));
    let last = [key(1), key(2), key(3), key(4), Z];
    assert_eq!(team(5, last), refused(BrotError::ZeroAddress));
}

#[test]
fn the_same_key_twice_is_refused() {
    assert_eq!(
        team(2, [key(1), key(1), Z, Z, Z]),
        refused(BrotError::DuplicateTeamKey)
    );
    let far = [key(7), key(2), key(3), key(4), key(7)];
    assert_eq!(team(5, far), refused(BrotError::DuplicateTeamKey));
}

#[test]
fn a_key_past_team_len_is_refused() {
    let hidden = [key(1), key(2), Z, Z, key(3)];
    assert_eq!(team(2, hidden), refused(BrotError::TeamSlotNotEmpty));
    // A key the list names twice, once past `team_len`, is still a slot that must be zero.
    assert_eq!(
        team(1, [key(1), key(1), Z, Z, Z]),
        refused(BrotError::TeamSlotNotEmpty)
    );
    assert_eq!(
        team(0, [key(1), Z, Z, Z, Z]),
        refused(BrotError::TeamSlotNotEmpty)
    );
}
