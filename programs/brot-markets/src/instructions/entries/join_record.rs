//! Purpose: the `Join` account (`["join", campaign, baker, index]`): its creation with the baker's
//!          rent, and the checked read of one join for the refund (lane G, question 7). The pure
//!          read (`record_from_bytes`) is what the host tests cover.
//! Version: 0.0.1
//! Sprint: 04 (settlement and invariants), lane G
//!
//! Nothing here is wired into `user_join_campaign` yet: the instruction's account list has no
//! slot for the Join account (see the lane G report), so the caller passes it once that slot exists.

use pinocchio::{
    account::Ref, cpi::Seed, error::ProgramError, AccountView, Address, ProgramResult,
};

use crate::{
    checks,
    constants::JOIN_SEED,
    error::BrotError,
    layout::ZeroCopy,
    state::{join::Join, AccountTag, LAYOUT_VERSION},
};

/// The fields of one join the refund and the payout read.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct JoinRecord {
    /// `true` for a YES join.
    pub yes: bool,
    pub joined_at: i64,
    pub amount: u64,
    pub bump: u8,
}

/// The seeds of a join's address: `index` in little-endian, as the join writes it.
fn join_seeds<'a>(campaign: &'a [u8], baker: &'a [u8], index: &'a [u8]) -> [&'a [u8]; 4] {
    [JOIN_SEED, campaign, baker, index]
}

/// Parses one join from its account bytes, checking the length, the tag and the layout version,
/// and that it belongs to `campaign` and `baker` at position `index` (`JoinAccountsMismatch`).
/// The PDA is checked by the caller, which holds the address.
pub fn record_from_bytes(
    data: &[u8],
    campaign: &Address,
    baker: &Address,
    index: u32,
) -> Result<JoinRecord, ProgramError> {
    checks::len(data, Join::LEN)?;
    checks::tag(data, AccountTag::Join)?;
    let join = Join::from_bytes(data).ok_or(BrotError::WrongLength)?;
    if join.campaign != *campaign || join.baker != *baker || join.index.get() != index {
        return Err(BrotError::JoinAccountsMismatch.into());
    }
    Ok(JoinRecord {
        yes: join.side == 0,
        joined_at: join.joined_at.get(),
        amount: join.amount.get(),
        bump: join.bump,
    })
}

/// Reads one join account: owner first, then its bytes, then its address re-derived from the
/// stored bump. `index` is the position the caller expects (`JoinAccountsMismatch` otherwise).
pub fn read_join(
    account: &AccountView,
    campaign: &Address,
    baker: &Address,
    index: u32,
    program_id: &Address,
) -> Result<JoinRecord, ProgramError> {
    checks::owned_by(account, program_id)?;
    let data: Ref<[u8]> = account.try_borrow()?;
    let record = record_from_bytes(&data, campaign, baker, index)?;
    let index_bytes = index.to_le_bytes();
    let seeds = join_seeds(campaign.as_ref(), baker.as_ref(), &index_bytes);
    checks::pda(account, &seeds, record.bump, program_id)?;
    Ok(record)
}

/// The fields a new join is written with.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct NewJoin {
    /// The baker's join count before this join (`Entry.join_count`).
    pub index: u32,
    /// `Side` as its byte: 0 for YES, 1 for NO.
    pub side: u8,
    pub joined_at: i64,
    pub amount: u64,
}

/// Creates the join at its canonical PDA with the baker paying its rent, then writes its fields.
/// `PdaMismatch` for a look-alike address; an account already created is refused by
/// `checks::create_pda_account`.
pub fn create_join(
    baker: &AccountView,
    join: &mut AccountView,
    campaign: &Address,
    new: NewJoin,
    program_id: &Address,
) -> ProgramResult {
    let baker_key = baker.address();
    let index_bytes = new.index.to_le_bytes();
    let seeds = join_seeds(campaign.as_ref(), baker_key.as_ref(), &index_bytes);
    let bump = checks::canonical_pda(join, &seeds, program_id)?;
    let bump_seed = [bump];
    let signer_seeds = [
        Seed::from(JOIN_SEED),
        Seed::from(campaign.as_array()),
        Seed::from(baker_key.as_array()),
        Seed::from(&index_bytes),
        Seed::from(&bump_seed),
    ];
    checks::create_pda_account(baker, join, Join::LEN, program_id, &signer_seeds)?;
    let mut data = join.try_borrow_mut()?;
    let state = Join::from_bytes_mut(&mut data).ok_or(BrotError::WrongLength)?;
    state.tag = AccountTag::Join as u8;
    state.version = LAYOUT_VERSION;
    state.bump = bump;
    state.side = new.side;
    state.campaign = *campaign;
    state.baker = *baker_key;
    state.index.set(new.index);
    state.joined_at.set(new.joined_at);
    state.amount.set(new.amount);
    Ok(())
}
