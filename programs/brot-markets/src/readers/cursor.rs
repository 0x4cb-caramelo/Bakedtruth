//! Purpose: bounds-checked little-endian reads over raw account data, for the readers. An account
//!          shorter than its layout is an error, never a panic.
//! Version: 0.0.2
//! Sprint: 01 (price reader proof); ported to Pinocchio in 02

use crate::error::BrotError;

/// Walks a byte slice from the start. Every read advances the position or fails.
pub struct Cursor<'a> {
    data: &'a [u8],
    pos: usize,
}

impl<'a> Cursor<'a> {
    pub fn new(data: &'a [u8]) -> Self {
        Self { data, pos: 0 }
    }

    /// The next `N` bytes, or `ReaderBadLayout` when the data ends first.
    pub fn take<const N: usize>(&mut self) -> Result<[u8; N], BrotError> {
        let end = self.pos.checked_add(N).ok_or(BrotError::ReaderBadLayout)?;
        let bytes = self
            .data
            .get(self.pos..end)
            .ok_or(BrotError::ReaderBadLayout)?;
        let array = <[u8; N]>::try_from(bytes).map_err(|_| BrotError::ReaderBadLayout)?;
        self.pos = end;
        Ok(array)
    }

    /// Moves past `n` bytes the caller does not need, still checking they exist.
    pub fn skip(&mut self, n: usize) -> Result<(), BrotError> {
        let end = self.pos.checked_add(n).ok_or(BrotError::ReaderBadLayout)?;
        if end > self.data.len() {
            return Err(BrotError::ReaderBadLayout);
        }
        self.pos = end;
        Ok(())
    }

    pub fn u8(&mut self) -> Result<u8, BrotError> {
        Ok(u8::from_le_bytes(self.take()?))
    }

    pub fn i32(&mut self) -> Result<i32, BrotError> {
        Ok(i32::from_le_bytes(self.take()?))
    }

    pub fn i64(&mut self) -> Result<i64, BrotError> {
        Ok(i64::from_le_bytes(self.take()?))
    }

    pub fn u64(&mut self) -> Result<u64, BrotError> {
        Ok(u64::from_le_bytes(self.take()?))
    }
}
