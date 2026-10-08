//! Purpose: zero-copy byte layouts shared by accounts, instruction arguments and events: the
//!          little-endian field types and the one place where bytes become a typed view.
//! Version: 0.0.2
//! Sprint: 02 (pot core on Pinocchio)
//!
//! Every layout is `#[repr(C)]` and built only from `u8`, byte arrays, `Address` and the `Le*`
//! wrappers below, so its alignment is 1 and any byte pattern is a valid value. A view over
//! account data or instruction data is therefore sound as soon as the length matches, and no
//! field read can misalign or read past the end. Values are kept little-endian in place;
//! `get` and `set` convert. Integer accessors never wrap: arithmetic happens on the decoded value
//! with checked math.

use core::mem::{align_of, size_of};

/// The name Shank recognises for a 32-byte account address, so the IDL shows `publicKey`.
pub type Pubkey = pinocchio::Address;

macro_rules! le_type {
    ($(#[$doc:meta])* $name:ident, $int:ty, $bytes:literal) => {
        $(#[$doc])*
        #[repr(transparent)]
        #[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
        pub struct $name([u8; $bytes]);

        impl $name {
            pub const fn new(value: $int) -> Self {
                Self(value.to_le_bytes())
            }

            pub const fn get(&self) -> $int {
                <$int>::from_le_bytes(self.0)
            }

            pub fn set(&mut self, value: $int) {
                self.0 = value.to_le_bytes();
            }
        }

        impl From<$int> for $name {
            fn from(value: $int) -> Self {
                Self::new(value)
            }
        }
    };
}

le_type!(
    /// A `u16` stored as two little-endian bytes.
    LeU16, u16, 2
);
le_type!(
    /// A `u32` stored as four little-endian bytes.
    LeU32, u32, 4
);
le_type!(
    /// A `u64` stored as eight little-endian bytes.
    LeU64, u64, 8
);
le_type!(
    /// An `i32` stored as four little-endian bytes.
    LeI32, i32, 4
);
le_type!(
    /// An `i64` stored as eight little-endian bytes.
    LeI64, i64, 8
);
le_type!(
    /// An `i128` stored as sixteen little-endian bytes. Kept as bytes on purpose: `i128` has
    /// alignment 16 on x86-64 hosts and 8 on SBF, which would shift `#[repr(C)]` offsets.
    LeI128, i128, 16
);

/// A layout that can be viewed in place over a byte slice.
///
/// # Safety
///
/// Implement only through [`zero_copy!`], for `#[repr(C)]` structs made solely of `u8`, byte
/// arrays, [`Pubkey`], the `Le*` wrappers and other `ZeroCopy` structs. The macro asserts the
/// alignment at compile time; the field rule is what makes every byte pattern valid.
pub unsafe trait ZeroCopy: Sized {
    /// Exact size in bytes. Account data and instruction arguments must match it exactly.
    const LEN: usize = size_of::<Self>();

    /// A view over `data`, or `None` unless `data` is exactly [`Self::LEN`] bytes.
    fn from_bytes(data: &[u8]) -> Option<&Self> {
        if data.len() != Self::LEN {
            return None;
        }
        // SAFETY: the length is exactly size_of::<Self>(), the alignment is 1 (asserted by
        // `zero_copy!`) and every byte pattern is a valid value (the trait's contract).
        Some(unsafe { &*data.as_ptr().cast::<Self>() })
    }

    /// A mutable view over `data`, or `None` unless `data` is exactly [`Self::LEN`] bytes.
    fn from_bytes_mut(data: &mut [u8]) -> Option<&mut Self> {
        if data.len() != Self::LEN {
            return None;
        }
        // SAFETY: as in `from_bytes`; the exclusive borrow of `data` covers the whole value.
        Some(unsafe { &mut *data.as_mut_ptr().cast::<Self>() })
    }

    /// The value's bytes, for writing events.
    fn as_bytes(&self) -> &[u8] {
        // SAFETY: `Self` is plain bytes with alignment 1 and no padding (asserted by `zero_copy!`).
        unsafe { core::slice::from_raw_parts((self as *const Self).cast::<u8>(), Self::LEN) }
    }
}

/// Declares `ZeroCopy` for layouts and checks at compile time that each has alignment 1 and the
/// exact size its documentation states, so a field added or resized by mistake fails the build.
#[macro_export]
macro_rules! zero_copy {
    ($($ty:ty = $len:expr),+ $(,)?) => {
        $(
            // SAFETY: see `ZeroCopy`; the assertions below enforce alignment and size.
            unsafe impl $crate::layout::ZeroCopy for $ty {}
            const _: () = assert!(core::mem::align_of::<$ty>() == 1);
            const _: () = assert!(core::mem::size_of::<$ty>() == $len);
        )+
    };
}

const _: () = assert!(align_of::<Pubkey>() == 1 && size_of::<Pubkey>() == 32);
const _: () = assert!(align_of::<LeI128>() == 1 && size_of::<LeI128>() == 16);
