//! Purpose: the epoch kinds' shared rules: when the measured epoch starts, against the deadline
//!          (row 5 for `StakePoolTvlAtLeast` and `StakeAtLeast`), from the EpochSchedule sysvar.
//! Version: 0.0.3
//! Sprint: 03 (readers and resolution); the module is declared at the sprint's opening, its
//!         contents are lane B's
//!
//! TP section 3.4.8's working reading [INF], built in Sprint 03: the creator passes `epoch` and
//! `deadline_at`; the epoch must start before the deadline; entries close at the earlier of
//! `entries_close_at` and the epoch's start (the join lock); a missed epoch voids as
//! `MissedWindow`.
