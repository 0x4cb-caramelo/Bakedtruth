//! Purpose: the bounds-checked cursor on its own. Readers of variable layouts lean on it, so "an
//!          error, never a panic" is proved here and not through one reader's fixed size.
//! Version: 0.0.2
//! Sprint: 01 (price reader proof); ported to Pinocchio in 02

use brot_markets::error::BrotError;
use brot_markets::readers::cursor::Cursor;

/// True when the read failed with `ReaderBadLayout`, the only error the cursor returns.
fn bad_layout<T>(result: Result<T, BrotError>) -> bool {
    matches!(result, Err(BrotError::ReaderBadLayout))
}

#[test]
fn empty_data_fails_every_read_that_needs_a_byte() {
    let mut cursor = Cursor::new(&[]);
    assert!(bad_layout(cursor.u8()));
    assert!(bad_layout(cursor.take::<8>()));
    assert!(bad_layout(cursor.skip(1)));
    // Asking for nothing is not an error.
    assert!(cursor.take::<0>().is_ok());
    assert!(cursor.skip(0).is_ok());
}

#[test]
fn a_take_past_the_end_fails_and_leaves_the_position_alone() {
    let data = [1u8, 2, 3, 4, 5, 6, 7];
    let mut cursor = Cursor::new(&data);
    assert!(bad_layout(cursor.take::<8>()));
    // The failed read consumed nothing: the whole slice is still there.
    assert_eq!(cursor.take::<7>().unwrap(), data);
    assert!(bad_layout(cursor.u8()));
}

#[test]
fn a_skip_reaches_the_end_but_not_one_byte_past_it() {
    let data = [0u8; 4];
    let mut cursor = Cursor::new(&data);
    assert!(bad_layout(cursor.skip(5)));
    assert!(cursor.skip(4).is_ok());
    assert!(bad_layout(cursor.skip(1)));
    assert!(cursor.skip(0).is_ok());
}

#[test]
fn a_skip_that_overflows_is_an_error_not_a_panic() {
    let data = [9u8, 8, 7, 6];
    let mut cursor = Cursor::new(&data);
    assert!(cursor.skip(1).is_ok());
    // Position 1 plus usize::MAX does not fit in a usize.
    assert!(bad_layout(cursor.skip(usize::MAX)));
    assert_eq!(cursor.take::<3>().unwrap(), [8, 7, 6]);
}

#[test]
fn reads_little_endian_integers_in_order() {
    let mut data = vec![0xab_u8];
    data.extend_from_slice(&(-8_i32).to_le_bytes());
    data.extend_from_slice(&i64::MIN.to_le_bytes());
    data.extend_from_slice(&u64::MAX.to_le_bytes());

    let mut cursor = Cursor::new(&data);
    assert_eq!(cursor.u8().unwrap(), 0xab);
    assert_eq!(cursor.i32().unwrap(), -8);
    assert_eq!(cursor.i64().unwrap(), i64::MIN);
    assert_eq!(cursor.u64().unwrap(), u64::MAX);
    assert!(bad_layout(cursor.u8()));
}
