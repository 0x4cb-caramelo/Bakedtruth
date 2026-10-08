//! Purpose: `admin_set_team`: the admin sets up to five team keys (Q12), one per person.
//! Version: 0.0.2
//! Sprint: 02 (pot core on Pinocchio); accounts and arguments frozen at the sprint's opening,
//!         body by lane B

use pinocchio::{error::ProgramError, AccountView, Address, ProgramResult};
use shank::ShankType;

use crate::{
    checks,
    error::BrotError,
    events,
    instructions::{
        admin::shared::{config_changed, is_zero, require_admin},
        args,
    },
    layout::Pubkey,
    state::{
        config::{GlobalConfig, MAX_TEAM},
        enums::ConfigChange,
    },
    zero_copy,
};

#[derive(ShankType)]
#[repr(C)]
pub struct SetTeamArgs {
    /// How many of `team` are used: at most five, none zero, no key twice; the rest all zero.
    pub team_len: u8,
    pub team: [Pubkey; 5],
}

zero_copy!(SetTeamArgs = 161);

impl SetTeamArgs {
    /// At most five keys in use (`TeamTooLarge`); slot by slot, a used slot names a key
    /// (`ZeroAddress`) that no earlier slot names (`DuplicateTeamKey`), and a slot past
    /// `team_len` is zero (`TeamSlotNotEmpty`). An empty team is valid: it removes every key.
    pub fn validate(&self) -> ProgramResult {
        let len = usize::from(self.team_len);
        if len > MAX_TEAM {
            return Err(BrotError::TeamTooLarge.into());
        }
        for (slot, key) in self.team.iter().enumerate() {
            let used = slot < len;
            if used && is_zero(key) {
                return Err(BrotError::ZeroAddress.into());
            }
            if used && self.team.iter().take(slot).any(|earlier| earlier == key) {
                return Err(BrotError::DuplicateTeamKey.into());
            }
            if !used && !is_zero(key) {
                return Err(BrotError::TeamSlotNotEmpty.into());
            }
        }
        Ok(())
    }
}

pub fn admin_set_team(
    program_id: &Address,
    accounts: &mut [AccountView],
    data: &[u8],
) -> ProgramResult {
    let args = args::<SetTeamArgs>(data)?;
    let [admin, config, event_authority, program, ..] = accounts else {
        return Err(ProgramError::NotEnoughAccountKeys);
    };
    checks::signer(admin)?;
    checks::writable(config)?;
    checks::event_accounts(event_authority, program, program_id)?;
    let mut state = GlobalConfig::load_mut(config, program_id)?;
    require_admin(&state, admin.address())?;
    args.validate()?;
    // The whole list is replaced: a key left out is removed (a leaked key, TP section 3.4.9).
    state.team_len = args.team_len;
    state.team = args.team;
    let event = config_changed(ConfigChange::Team, admin.address(), &state);
    drop(state);
    events::emit(&event, event_authority, program, program_id)
}
