//! Purpose: what the admin and team instructions share: the zero address ("no key"), the admin
//!          role check and the `ConfigChanged` snapshot every change of the config emits.
//! Version: 0.0.2
//! Sprint: 02 (pot core on Pinocchio); lane B

use pinocchio::{Address, ProgramResult};

use crate::{
    error::BrotError,
    events::ConfigChanged,
    state::{config::GlobalConfig, enums::ConfigChange},
};

/// The all-zero address: no key. `pending_admin` holds it when no change is pending, and so does
/// every team slot past `team_len`; a key the config must name is never zero (`ZeroAddress`).
pub const ZERO_ADDRESS: Address = Address::new_from_array([0; 32]);

/// True when `address` is the all-zero address.
pub fn is_zero(address: &Address) -> bool {
    *address == ZERO_ADDRESS
}

/// The signer is the config's admin (`NotAdmin`).
pub fn require_admin(config: &GlobalConfig, signer: &Address) -> ProgramResult {
    if config.admin == *signer {
        Ok(())
    } else {
        Err(BrotError::NotAdmin.into())
    }
}

/// `ConfigChanged` for `change`, signed by `signer`: the values of everything an admin
/// instruction can change, read from the config as just written. Config events carry no `seq`.
pub fn config_changed(
    change: ConfigChange,
    signer: &Address,
    config: &GlobalConfig,
) -> ConfigChanged {
    ConfigChanged {
        change: change as u8,
        signer: *signer,
        admin: config.admin,
        pending_admin: config.pending_admin,
        fee_recipient: config.fee_recipient,
        team_len: config.team_len,
        team: config.team,
        params: config.params,
    }
}
