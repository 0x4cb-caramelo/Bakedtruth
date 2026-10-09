//! Purpose: bounds-checked little-endian reads over raw account data, for the readers. An account
//!          shorter than its layout is an error, never a panic.
//! Version: 0.0.3
//! Sprint: 01 (price reader proof); ported to Pinocchio in 02; Sprint 03 adds the reads the
//!         ported readers need (Borsh flags and options, u16 to u128, addresses)
//!
//! The Borsh helpers follow pred-provable's `Cursor` (`resolver.rs`): Copyright (c) 2026 Ronaldo
//! Pereira, MIT License (LICENSE at the repository root).

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

    /// Bytes read so far.
    pub fn position(&self) -> usize {
        self.pos
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

    pub fn u16(&mut self) -> Result<u16, BrotError> {
        Ok(u16::from_le_bytes(self.take()?))
    }

    pub fn u32(&mut self) -> Result<u32, BrotError> {
        Ok(u32::from_le_bytes(self.take()?))
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

    pub fn u128(&mut self) -> Result<u128, BrotError> {
        Ok(u128::from_le_bytes(self.take()?))
    }

    /// A 32-byte address, as raw bytes.
    pub fn address(&mut self) -> Result<[u8; 32], BrotError> {
        self.take()
    }

    /// A Borsh `bool` or `Option` tag: exactly 0 or 1, anything else `ReaderBadLayout`.
    pub fn flag(&mut self) -> Result<bool, BrotError> {
        match self.u8()? {
            0 => Ok(false),
            1 => Ok(true),
            _ => Err(BrotError::ReaderBadLayout),
        }
    }

    /// A Borsh `Option<T>` whose `T` is `len` bytes: the tag, then `T` when it is 1.
    pub fn skip_option(&mut self, len: usize) -> Result<(), BrotError> {
        if self.flag()? {
            self.skip(len)?;
        }
        Ok(())
    }
}
