//! Purpose: what the three team instructions share: the team-key check, the event number each
//!          event takes from the campaign, and the refusal of a status that is not the stored one.
//! Version: 0.0.1
//! Sprint: 04 (lane A)

use pinocchio::Address;

use crate::{
    error::BrotError,
    layout::LeU64,
    state::{campaign::Campaign, config::GlobalConfig},
};

/// The signer is one of the config's team keys (`NotTeamMember`). The admin is not one unless named.
pub fn require_team_key(config: &GlobalConfig, signer: &Address) -> Result<(), BrotError> {
    if config.is_team(signer) {
        Ok(())
    } else {
        Err(BrotError::NotTeamMember)
    }
}

/// The number this event takes (`event_seq` before the event), and the campaign's next one.
/// Checked, so a counter at its maximum refuses with `MathOverflow` and changes nothing.
pub fn take_seq(campaign: &mut Campaign) -> Result<u64, BrotError> {
    let seq = campaign.event_seq.get();
    let next = seq.checked_add(1).ok_or(BrotError::MathOverflow)?;
    campaign.event_seq = LeU64::new(next);
    Ok(seq)
}
