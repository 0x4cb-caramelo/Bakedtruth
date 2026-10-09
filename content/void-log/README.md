# Void log

The public text of every void a team key records (TP §3.4.7, BR-45). `scripts/team/void.ts` writes one file per void,
`<campaign address>-<UTC time>.md`, and sends `team_void_campaign` with the reason and the **SHA-256 of exactly the
file's bytes**, which the program stores in the campaign (`void_note_hash`) and the `CampaignVoided` event carries.

- **Never edit a committed record.** Its hash is on-chain; an edited file no longer matches, and anyone can check
  that (`sha256sum <file>` against the event). A correction is a new file that names the old one.
- **Commit the record with the void.** The script prints the path; the file belongs in the same day's commit.
- **What a team key may void.** Only an automatic void (a campaign `resolve_campaign` voided: missed window,
  unreadable account, stale feed), never a YES or NO (`TeamVoidNotAutomatic`, decision of 2026-10-09). The reason is
  `TeamHouseFailure` (the 10% opening fee goes back to the opener) or `TeamOutsideCause` (Brot keeps it).
- **No personal data.** The text explains the cause in public terms; it names no person and no private wallet owner.

Each file starts with a short header (campaign, reason, team key, time) followed by the team's text. Sprint 12 gives
the record its public format on the site.
