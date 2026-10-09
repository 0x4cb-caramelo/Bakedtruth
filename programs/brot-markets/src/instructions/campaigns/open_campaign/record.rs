//! Purpose: steps 9 and 10 of `user_open_campaign`: every field an opening writes into the new
//!          `Campaign`, and the `CampaignOpened` event built from what was stored, so the event
//!          and the account can never disagree.
//! Version: 0.0.3
//! Sprint: 02 (pot core on Pinocchio), lane D; the epoch in 03

use pinocchio::Address;

use super::{payment::Payment, OpenCampaignArgs};
use crate::{
    constants::CAMPAIGN_TEMPLATE_VERSION,
    events::CampaignOpened,
    layout::{LeI32, LeI64, LeU16, LeU64},
    state::{
        campaign::Campaign,
        config::CreationParams,
        enums::{Direction, Outcome, ReaderKind, Status},
    },
};

/// What the handler settled before the campaign existed.
pub struct Opening<'a> {
    pub args: &'a OpenCampaignArgs,
    pub kind: ReaderKind,
    pub direction: Direction,
    pub bump: u8,
    pub vault_bump: u8,
    pub creator: &'a Address,
    pub is_team: bool,
    pub params: &'a CreationParams,
    pub metric_account: &'a Address,
    pub price_exponent: i32,
    pub now: i64,
    pub entries_close_at: i64,
    pub payment: Payment,
}

/// Writes every field an opening sets. The account was created in this instruction, so the
/// fields not named here (the pot, the result, the settlement, the reserve) are still zero.
pub fn write(c: &mut Campaign, o: &Opening) {
    c.bump = o.bump;
    c.vault_bump = o.vault_bump;
    c.kind = o.kind as u8;
    c.direction = o.direction as u8;
    c.status = Status::Open as u8;
    c.outcome = Outcome::Unresolved as u8;
    c.creator_is_team = u8::from(o.is_team);
    c.id = o.args.id;
    c.creator = *o.creator;
    c.rent_payer = *o.creator;
    // Row 9: the program names the sentence template; no argument is text (D-j).
    c.template_version = LeU16::new(CAMPAIGN_TEMPLATE_VERSION);
    // Row 6: copied from the config, never passed. A team key's campaign has no share (P-3, I12).
    c.creator_share_bps = if o.is_team {
        LeU16::new(0)
    } else {
        o.params.creator_share_bps
    };
    c.fee_bps = o.params.fee_bps;
    c.one_sided_fee_bps = o.params.one_sided_fee_bps;
    c.feed_id = o.args.feed_id;
    c.metric_account = *o.metric_account;
    c.target = o.args.target;
    c.price_exponent = LeI32::new(o.price_exponent);
    // The join-time price age: the config's, never the creator's (TP section 3.4.8).
    c.max_age = o.params.campaign_max_age;
    c.opens_at = LeI64::new(o.now);
    c.entries_close_at = LeI64::new(o.entries_close_at);
    c.deadline_at = o.args.deadline_at;
    c.opening_usd = o.args.opening_usd;
    c.opening_paid_lamports = LeU64::new(o.payment.paid);
    c.opening_price = LeI64::new(o.payment.price);
    c.opening_price_exponent = LeI32::new(o.payment.exponent);
    c.opening_price_publish_time = LeI64::new(o.payment.publish_time);
    c.prize_lamports = LeU64::new(o.payment.prize);
    c.opening_fee_lamports = LeU64::new(o.payment.fee);
    c.epoch = o.args.epoch;
}

/// `CampaignOpened` for `campaign`, read back from the stored fields, with `seq` the campaign's
/// next event number (0 at opening).
pub fn opened_event(campaign: &Address, c: &Campaign) -> CampaignOpened {
    CampaignOpened {
        campaign: *campaign,
        seq: c.event_seq,
        id: c.id,
        creator: c.creator,
        creator_is_team: c.creator_is_team,
        kind: c.kind,
        direction: c.direction,
        feed_id: c.feed_id,
        metric_account: c.metric_account,
        target: c.target,
        price_exponent: c.price_exponent,
        max_age: c.max_age,
        template_version: c.template_version,
        opens_at: c.opens_at,
        entries_close_at: c.entries_close_at,
        deadline_at: c.deadline_at,
        fee_bps: c.fee_bps,
        one_sided_fee_bps: c.one_sided_fee_bps,
        creator_share_bps: c.creator_share_bps,
        opening_usd: c.opening_usd,
        opening_paid_lamports: c.opening_paid_lamports,
        opening_price: c.opening_price,
        opening_price_exponent: c.opening_price_exponent,
        opening_price_publish_time: c.opening_price_publish_time,
        prize_lamports: c.prize_lamports,
        opening_fee_lamports: c.opening_fee_lamports,
        epoch: c.epoch,
    }
}
