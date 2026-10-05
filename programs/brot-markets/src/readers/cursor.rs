//! Purpose: bounds-checked little-endian reads over raw account data, for the readers. An account
//!          shorter than its layout is an error, never a panic.
//! Version: 0.0.1
//! Sprint: 01 (price reader proof)

use anchor_lang::prelude::*;

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
    pub fn take<const N: usize>(&mut self) -> Result<[u8; N]> {
        let end = self.pos.checked_add(N).ok_or(BrotError::ReaderBadLayout)?;
        let bytes = self
            .data
            .get(self.pos..end)
            .ok_or(BrotError::ReaderBadLayout)?;
        self.pos = end;
        <[u8; N]>::try_from(bytes).map_err(|_| error!(BrotError::ReaderBadLayout))
    }

    /// Moves past `n` bytes the caller does not need, still checking they exist.
    pub fn skip(&mut self, n: usize) -> Result<()> {
        let end = self.pos.checked_add(n).ok_or(BrotError::ReaderBadLayout)?;
        require!(end <= self.data.len(), BrotError::ReaderBadLayout);
        self.pos = end;
        Ok(())
    }

    pub fn u8(&mut self) -> Result<u8> {
        Ok(u8::from_le_bytes(self.take()?))
    }

    pub fn i32(&mut self) -> Result<i32> {
        Ok(i32::from_le_bytes(self.take()?))
    }

    pub fn i64(&mut self) -> Result<i64> {
        Ok(i64::from_le_bytes(self.take()?))
    }

    pub fn u64(&mut self) -> Result<u64> {
        Ok(u64::from_le_bytes(self.take()?))
    }
}
