# Brot Markets — threat model

**Status:** draft for the Sprint 16 freeze, written on 2026-10-13 against `main` at `395efa5` and brought up to date
the same day for Sprints 14 and 15: every `file:line` points at `main` at `8af10e2`. Sprint 16's pre-freeze hardening
(PR #93, branch `sprint-16-prefreeze`, head `fcedeaf`, CI green, not on `main` yet; "the branch" below) is named with its
commit where it changes a defence.
Paths follow the convention of `SCOPE.md` ("Paths"): `src/…` and the Rust tests `tests/<name>.rs` are under
`programs/brot-markets/`, every other path starts at the repository root, a short path such as `join_core.rs` or
`open_campaign/payment.rs` names a file under `src/instructions/`, and `file.rs::name` cites a function without a line
in the five paths the hardening rewrites. **[to verify]** marks what nobody has checked; **[INF]** marks an inference
drawn here.

Method: what is worth stealing or breaking (§2), who can act and with which powers (§3), what the program trusts outside
itself (§4), then each attack class with, for each instruction it applies to, the mitigation in the code and the test
that shows it (§5; Sprint 14's contest and referral in §5.16–§5.17, Sprint 15's sealed entry in §5.18). §6 lists the
risks the founder accepted; §7 points at the open items.

## 1. Scope

The program `brot-markets` as `SCOPE.md` §1 defines it, built with the `mainnet` feature. Off-chain services appear here
only as actors (§3): they have no on-chain privilege (TP §3.4.9). The program holds users' SOL with **no cap** (D-h):
every lamport in every open vault is exposed to a program bug, and the only bounds left are the audits, the multisig,
the pause and an off-chain exposure alert (TP §13, first row; `docs/sprints/sprint-18-mainnet.md:104-105`).

## 2. Assets

| Asset | Where it sits | What reaching it gives | Bound in code |
|---|---|---|---|
| Campaign vault SOL: entries (a sealed entry's 90% included), the prize, the held 10% opening fee, a reserved creator share, hand-sent surplus, the vault's rent | One data-less PDA per campaign, `["vault", campaign]` (`src/constants.rs:22-23`), owned by the program, so only the program debits it (`src/vault.rs:6-8`) | Theft of bakers' and openers' money | None in size (D-h). Every debit is computed from the campaign's books and sent to a stored key or the fee vault (SCOPE §10) |
| Fee vault SOL: kept house fees, one-sided fees, kept opening fees, dust, surplus | `["fee_vault"]` (`src/constants.rs:18-19`) | Brot's revenue | Leaves only to `GlobalConfig.fee_recipient` (`src/instructions/settlement/sweep_fees.rs:44-62`) |
| `GlobalConfig`: admin, pending admin, team, fee recipient, creation parameters, pause, open count, `params_version` | `["config"]` (`src/state/config.rs:71-98`) | Control of future campaigns' terms, of the pause, of the team and of where Brot's fees go | Written only by the admin, the pending admin (acceptance), a team key (pause) and the initializer (SCOPE §14); parameters under code ceilings (SCOPE §5) |
| A sponsor's held 10% (Sprint 15) | One `SealedFee` per sponsor and campaign, `["sealed", campaign, sponsor]` (`src/constants.rs:31-32`), owned by the program; never in the vault | Brot's fee, or the sponsor's refund on a house-failure void | Bookkept in `fee_lamports`; leaves only to the stored sponsor or the fee vault, by the campaign's outcome (SCOPE §19.3) |
| Account rents: `Campaign` and vault (the creator's), `Entry`, `Join` and `SealedFee` (the baker's or the sponsor's), `ReferralLink` (the referee's) | The accounts themselves | Small amounts; a griefing lever | Returned at close and settlement to the stored payer (SCOPE §10, §19.3); a `ReferralLink` is never closed, its rent stays |
| Who referred whom (Sprint 14) | `ReferralLink`, `["referral", referee]` | The off-chain payout of 20% of Brot's fee for 90 days, and the referee's rebate (TP §3.4.11) | Written once by the referee, never changed or closed (SCOPE §18.1); the payout itself is off-chain (SCOPE §18.7) |
| The correctness of each outcome | `Campaign.outcome`, `observed_value`, `publish_time` | Paying the wrong side is a theft in effect | The reader's checks (§4, §5.9); since Sprint 14 a team key can contest a result in its window and the admin can void it at stage 2, never invert it (SCOPE §18; gap G-3) |
| The time to payout | `review_ends_at`, `contest_stage`, `contest_ends_at` | Holding every pot is a denial of service on the bakers' money | At most 78 hours from resolution to a due payout, with or without a keeper (SCOPE §18.5; §5.16) |
| The event stream | Self-CPI events, contiguous `seq` per campaign | Indexers, the site and the referral routine read it | Only this program can sign the event authority (§5.4) |
| The upgrade authority | Loader v3 ProgramData | Replacing the program, and with it every rule above | Outside the program: the 2-of-3 multisig with a public wait (Sprint 16) |

## 3. Actors

| Actor | Can do on-chain (from the code) | Cannot do | Trust |
|---|---|---|---|
| **Anonymous wallet** | Every permissionless instruction: `resolve_campaign` and `reread_campaign` (top level only), `tally_late_joins`, `finalize_campaign` (the lapse included), `settle_entry`, `settle_creator_share`, `collect_fee`, `settle_prize`, `settle_sealed_fee`, `close_campaign`, `sweep_fees`; open a campaign by paying; join, plainly or sealed; link its own referrer. Send SOL to any address; post its own Pyth updates to accounts it owns; call this program by CPI from its own program; put several instructions in one transaction; land transactions in a chosen order within a slot through a block builder **[INF]** | Choose an amount or a destination of any payout; resolve or re-read through CPI; write a result by re-reading; pay a contested result before stage 1's 24 hours | none |
| **Creator** | Pays the opening (`opening_usd ≥ opening_fee_usd`, at most `max_lamports`); is stored as `creator` and `rent_payer` (`src/instructions/campaigns/open_campaign/record.rs:52-53`); receives the creator share, the prize back and, on a house-failure void, the opening fee; may join their own campaign (TP §3.4.10, BR-26) | Choose the fees, the share or the join-time price age (copied from the config, SCOPE §4 row 6); open a `StakeAtLeast` or `DbcGraduated` campaign on mainnet | none |
| **Creator who controls the measured account** | Burn their own token, lock their own liquidity, move stake, buy out a curve: decide a fact-kind campaign's outcome | Change a price feed (the price kind is out of any creator's reach, TP §3.4.10) | Accepted risk (§6) |
| **Baker** | Joins YES or NO with at least the campaign's minimum, signing `expected_entry_total` and `min_return_bps`; is stored in its `Entry` and paid there | Leave early (no exit instruction, BR-12); join after the entry close or once the outcome is knowable | none |
| **Sponsor** (Sprint 15) | A baker that joins sealed: at least `opening_fee_usd` at the SOL/USD price, bounded by `max_lamports` and the creation rules' version it signed; its 90% joins its own `Entry`, its 10% waits in its `SealedFee` (`src/instructions/entries/sponsor_join_campaign.rs:69-154`) | Get its 10% back except on a house-failure void; redirect the fee; join sealed while paused | none |
| **Referee and referrer** (Sprint 14) | The referee signs its own link once, naming any wallet but the zero address and itself (`src/instructions/referral/link_referrer.rs:42-94`); the referrer signs nothing on-chain | Change, close or create another wallet's link; be paid by the program (the payout is off-chain, SCOPE §18.7) | none; self-referral is an accepted risk (§6) |
| **Team key** (up to five, `src/state/config.rs:24-27`) | Pause entries and openings (`src/instructions/admin/pause_entries.rs:17-44`); open free campaigns, **outside the valve, without bound** (SCOPE gap G-4); confirm a result early, ending the review window (`src/instructions/resolution/team_confirm_result.rs:32-77`); record the cause of an automatic void, which moves the 10% opening fee between Brot and the opener (SCOPE gap G-12); since Sprint 14, contest a result inside its window once every entry is tallied, and escalate its contest to the admin before stage 1's deadline (`src/instructions/resolution/team_open_contest.rs:62-118`): **one key can so hold a payout up to 72 hours** (§5.16) | Resume; change the config; void a YES or NO; decide a contest | Trusted not to abuse the pause, free openings, void causes and contests; a leaked key is removed by `admin_set_team` (`src/instructions/admin/set_team.rs:75-77`) |
| **Admin** | Set the team, the creation parameters (under ceilings, future campaigns only), the fee recipient; resume; hand over the admin role in two steps (SCOPE §14); since Sprint 14, decide a contest at stage 2, before its deadline: confirm, or void with a team reason (`src/instructions/resolution/admin_decide_contest.rs:64-116`), so **with a team key's contest it can void a correct result** (§5.16, §6) | Touch any vault; change an open campaign's fees, share or minimum; turn a result into another YES or NO; decide outside stage 2 | The 2-of-3 multisig on mainnet (Sprint 16) |
| **Upgrade authority** | Initialize the config once, choosing the first admin and fee recipient (`src/checks/upgrade.rs:17-44`); replace the program | — | The 2-of-3 multisig with a public 24–48 h wait (Sprint 16, TP §3.4.9); devnet: one co-founder's key (`content/powers.md`) |
| **Keeper** (primary and standby, Sprints 06–07) | Calls the permissionless instructions with a wallet holding SOL for network fees only; chooses the timing and which YES proof to post (it posts its own Pyth updates once it has a Hermes key, D4); since Sprints 14–15 re-reads contests in stage 1 through a second RPC, finalizes lapsed ones and settles every `SealedFee` before a close (`docs/sprints/sprint-14-referral-second-read.md:240-242`; `docs/sprints/sprint-15-sponsorship.md:166-171`) | Anything a wallet cannot; act as a team key or the admin | No privilege; if both stop, any wallet can do their work (Q1), and a contest still lapses within 78 hours of the resolution |
| **Operations wallet and the person who signs the referral payout** (off-chain, Sprint 14) | Pays referrers and rebates by plain transfers, from a signing file a person runs once (SCOPE §18.7) | Anything on this program: it has no on-chain role | The company's; outside the program and the firms' scope (SCOPE §20) |
| **Relay `brot-rpc`** (Sprint 08) | Answers the site's JSON-RPC calls; may lie about accounts or drop a transaction | Sign; change what the program accepts | No on-chain power; the program re-checks every rule; the site pauses signing on a program upgrade it did not expect (A-8, TP §7.2) |
| **Slot leader / block builder** | Orders transactions in a slot; with Alpenglow, sets the Clock timestamp (TP §3.4.8) **[to verify on the cluster]** | Forge signatures or Pyth prices | Runtime trust |
| **Third parties behind the trust boundaries** (§4) | Pyth's publishers produce the prices, and the Wormhole guardians' signatures are what the receiver checks before it marks an update `Full`; the upgrade authorities of the Pyth, Meteora, SPL Stake Pool and Token programs can change those programs | — | Outside the program |

## 4. Trust boundaries

What the program takes from outside itself, how it checks it, and what happens if the assumption fails.

### 4.1 The Pyth receiver `rec2HH…`, its `PriceUpdateV2` layout, and the push oracle `pyt2F4…`

- **Trusted:** that only the receiver creates accounts it owns, and verifies Wormhole guardian signatures before marking
  an update `Full`; the layout (134 bytes, the Anchor discriminator, `write_authority`, `verification_level`, then the
  price message); that the push oracle writes the sponsored account `[shard 0, feed_id]` only with a strictly newer
  `publish_time` (`knowledge-base/tecnologia/pyth-leitor-de-preco.md:268-310`, read from Pyth's source; the creation of
  that PDA by another path is unverified, `:307-308`); Pyth's aggregate prices themselves.
- **Checked in code:** the owner (`src/readers/price_update.rs:63-65`), the exact size (`:66-68`), the discriminator
  (`:71-73`), `Full` (`:76-78`), the feed id (`:80-83`); the sponsored address derived on-chain, never trusted as passed
  (`:118-126`); freshness by time and by slot, a 60 s bound on a price ahead of the clock, a confidence bound
  (`src/readers/price_touch/rules.rs:24-74`); the exponent stored at opening (`src/readers/price_touch.rs:79-81`;
  `proof.rs:82-84`); only the upgraded receiver (`src/constants.rs:46-47`; the pre-upgrade receiver is refused,
  `tests/price_reader.rs:112`).
- **Anyone can post any signed update of any feed, of any age, to an account they own** (`price_update.rs:53-57`): a
  YES proof is therefore bounded to `[opens_at, deadline]` and to 60 s before the clock (`proof.rs:88-97`).
- **If it fails:** a receiver upgrade or a governance change (`setDataSources`, `setWormholeAddress`,
  `setMinimumSignatures`; `knowledge-base/tecnologia/pyth-leitor-de-preco.md:161-163`) could make an arbitrary price
  pass: a wrong opening price, a wrong YES. Who controls the receiver's upgrade (`6oXTdojy…`, a PDA) and its governance
  on mainnet is **unverified** (`:150-152`; TP §14.4 C40; a Sprint 16 carried-over item). A layout change at another
  size breaks reads instead of misreading them: joins refuse, resolution voids `UnreadableAccount` after the window.

### 4.2 Meteora DAMM v2 `cpamdpZC…`

Trusted: the 1,112-byte `Pool` layout and that `permanent_lock_liquidity` (u128 at offset 552) only grows
(`src/readers/damm_v2.rs:34-43`). Checked: owner, size, discriminator (`:48-61`); a value above `i128::MAX` saturates
(`:65-69`). If Meteora changed the field's meaning at the same size, the reader would misread it **[INF]**; the fixtures
pin today's bytes (`tests/readers_damm_v2.rs`; `tests/fixtures/index.json`).

### 4.3 Meteora DBC `dbcij3LW…` (not opening on mainnet)

Trusted: the 424-byte `VirtualPool` with `config` at 72, `quote_reserve` at 240, `migration_progress` at 308 (moves only
forward), `finish_curve_timestamp` at 344 stamped from the clock by the swap that completes the curve
(`src/readers/dbc_graduation.rs:7-15`, `:35-54`); that a `PoolConfig` never changes after creation
(`src/readers/dbc_graduation/config.rs:9-11`). Checked: owners, sizes, discriminators, the transfer-hook pool refused, the
config is the pool's own, wSOL quote, threshold ≥ 85 SOL (`dbc_graduation.rs:88-118`; `dbc_graduation/config.rs:43-80`). Tested against
the two attacks of an internal review (`tests/brot/readers-dbc-adversarial.test.ts:60-135`).

### 4.4 SPL Token (classic)

Trusted: the 82-byte `Mint`, and that a revoked mint authority can never be set again, so the supply only falls
(`src/readers/spl_mint.rs:9-18`). Checked: owner (Token-2022 refused), size, `COption` tags 0 or 1, initialized, the
authority revoked at opening (`:48-69`, `:86-90`).

### 4.5 SPL Stake Pool `SPoo1Ku8…`

Trusted: the Borsh `StakePool` layout, and the snapshot semantics: the pool's first balance update of an epoch writes
`last_epoch_total_lamports` and stamps `last_update_epoch`, and deposits and withdrawals revert until that update
(`src/readers/stake_pool.rs:13-20`). Checked: owner, `account_type`, every option tag in the walk, the pool still
updating (`:65-116`, `:128-130`). If the snapshot moved within an epoch, YES could be bought inside it **[INF]**; entries
lock when the epoch starts (`:149-151`).

### 4.6 The Vote program and `sol_get_epoch_stake` (not opening on mainnet)

Trusted: the vote account versions and sizes, and that the syscall returns the stake of the current epoch only
(`src/readers/vote_stake.rs:9-24`). Checked: owner, version tag against size, initialization (`:57-87`); a reading outside
the measured epoch voids `MissedWindow` (`:153-174`).

### 4.7 The System Program

Trusted: `Transfer`, `CreateAccount`, `Allocate` and `Assign` semantics. Checked: the slot holds the System Program
before any CPI (`src/checks.rs:121-125`); the vault's change across a deposit equals the amount booked
(`src/math/invariant.rs::vault_change_matches`, at `src/instructions/campaigns/open_campaign.rs:161-171` and
`src/instructions/entries/join_core.rs:161-164`), and a `SealedFee`'s change equals its fee
(`src/instructions/entries/sealed_fee_account.rs:140-142`). Account creation goes through `pinocchio-system`'s
create-or-top-up helper (`src/checks.rs:20`, `:147`), a function that postdates Pinocchio's audits (`PINOCCHIO.md`).

### 4.8 The BPF loader v3 and ProgramData

Trusted: the ProgramData layout (`u32` tag 3, slot, `Option<Pubkey>` authority) at the PDA of the program id under the
loader (`src/checks/upgrade.rs:11-44`). Only loader v3 is supported (TP §3.4.19). A funded ProgramData address makes a
program id undeployable for good (TP §3.4.19, rehearsed on devnet): the mainnet id stays unpublished until its deploy.

### 4.9 The runtime

Trusted: the Clock (`unix_timestamp`, slot, epoch), Rent and EpochSchedule sysvars (`src/readers/mod.rs:49-58`;
`src/instructions/settlement/collect_fee/moves.rs::empty_rent`; `settle_sealed_fee.rs:83`; `src/readers/epoch.rs:89-95`);
that the Clock never goes back along a fork, on which the contest's deadlines and the branch's O-3 fix rest (the
branch's review); `sol_get_stack_height` (`src/checks/top_level.rs:23-27`); the lamport-sum and rent-exemption rules;
that one account may appear in two slots (TP §14.4 C42), which is why `checks::distinct` exists
(`src/checks.rs:150-156`).

### 4.10 Pinocchio and the `solana-sdk` crates under it

`PINOCCHIO.md`: the audited version (0.8.4) is not the pinned one (0.11.2).

## 5. Attack classes, per instruction

### 5.0 Index by instruction

Which classes below apply to which instruction, with the main guard and the main tests. Each class section then gives
the detail per instruction.

| Instruction | Classes (§5.x) | Main guards | Main tests |
|---|---|---|---|
| `admin_initialize_config` | 5.1, 5.3, 5.7, 5.8, 5.15 | `src/checks/upgrade.rs:17-44`; `src/checks.rs:108-118`, `:132-148`; config ≠ fee vault (`admin/initialize_config.rs:57`) | `tests/brot/checks-init.test.ts:20-98`; `tests/brot/admin-init.test.ts:36-77` |
| `admin_set_team`, `admin_set_creation_params`, `admin_set_fee_recipient`, `admin_transfer_admin`, `admin_accept_admin`, `admin_resume_entries` | 5.1, 5.2, 5.3, 5.15 | the config loader (`src/state/mod.rs:74-91`); `require_admin` (`admin/shared.rs:24-30`); the pending admin (`admin/accept_admin.rs:33-38`) | `tests/brot/admin-refusals.test.ts:19-111`; `tests/brot/checks.test.ts:26-107`; `tests/checks_mollusk.rs` |
| `team_pause_entries` | 5.14, 5.15 | a listed team key (`admin/pause_entries.rs:31-33`); `Normal` → `EntriesHalted` only (`:35-38`) | `tests/brot/admin.test.ts:142`; `tests/brot/admin-refusals.test.ts:46` |
| `user_open_campaign` | 5.1, 5.2, 5.3, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10, 5.11, 5.14 | the ten rows (`SCOPE.md` §4) | `tests/brot/open-campaign-*.test.ts` |
| `user_join_campaign` | 5.1, 5.2, 5.3, 5.5, 5.6, 5.8, 5.9, 5.10, 5.11, 5.14 | `SCOPE.md` §7 (the join core) | `tests/brot/join-campaign-*.test.ts` |
| `sponsor_join_campaign` | 5.1, 5.2, 5.3, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10, 5.11, 5.14, 5.18 | the join core (`SCOPE.md` §7), the charge and the `SealedFee` (§19.1–§19.2) | `tests/sealed_entry.rs`; `tests/brot/sealed-*.test.ts` |
| `resolve_campaign` | 5.1, 5.2, 5.4, 5.9, 5.10, 5.11 | top level (`src/checks/top_level.rs:17-21`); status and re-proof (`resolve_campaign.rs::resolve_campaign`); the readers | `tests/brot/resolve-refuses.test.ts`; `tests/brot/resolve-campaign.test.ts`; `tests/brot/price-proof.test.ts` |
| `team_confirm_result`, `team_void_campaign` | 5.1, 5.10, 5.11, 5.15 | the window (`resolution/window.rs:17-30`); automatic voids only (`resolution/void_reason.rs:23-42`) | `tests/brot/team-window.test.ts`; `tests/team_window_rules.rs` |
| `team_open_contest(stage)` | 5.1, 5.10, 5.11, 5.14, 5.15, 5.16 | the act in the signed byte; a team key; the window and the tally for stage 1; stage 1 before its deadline for stage 2 (`resolution/team_open_contest.rs:62-118`; `resolution/contest_rules.rs:32-106`) | `tests/contest_mollusk_open.rs`, `contest_mollusk_act.rs`, `contest_mollusk_escalate.rs`; `tests/brot/contest-open.test.ts`, `contest-act.test.ts`, `contest-escalate.test.ts` |
| `reread_campaign` | 5.1, 5.2, 5.4, 5.9, 5.10, 5.11, 5.16 | top level; stage 1; the locked metric account; an offered proof's refusal; the 24-hour wait of a matching reading (`resolution/reread_campaign.rs:78-150`; `resolution/contest_reread.rs:45-93`) | `tests/contest_reread.rs`, `contest_timelock.rs`, `contest_mollusk_reread.rs`, `contest_mollusk_bounds.rs`; `tests/brot/contest-reread.test.ts`, `contest-proof.test.ts` |
| `admin_decide_contest` | 5.1, 5.10, 5.11, 5.15, 5.16 | the admin; stage 2 before its deadline; confirm or void, never invert (`resolution/admin_decide_contest.rs:64-116`; `resolution/contest_decision.rs:16-43`) | `tests/contest_decision.rs`; `tests/contest_mollusk_decide.rs`; `tests/brot/contest-decide.test.ts` |
| `finalize_campaign` | 5.1, 5.5, 5.6, 5.10, 5.11, 5.16 | status and window, or the contest's lapse (`finalize_campaign.rs:46-56`; `resolution/contest_rules.rs:142-175`); the snapshot and its sums (`settlement/snapshot.rs:76-124`; `src/math/invariant.rs::check_snapshot`) | `tests/settle_host_finalize.rs`; `tests/brot/invariant-program.test.ts:204`; `tests/brot/contest-worst-case.test.ts` |
| `tally_late_joins` | 5.1, 5.11, 5.12 | `tally_late_joins.rs::tally_late_joins`; `entries/join_record.rs:40-76`; branch: `::require_cutoff_final`, `::check_join_slots` | positive path only at `8af10e2` (SCOPE G-16); branch: `tests/brot/prefreeze-tally-refusals.test.ts`, `prefreeze-partial-tally.test.ts` |
| `user_link_referrer` | 5.1, 5.3, 5.7, 5.8, 5.17 | the signer's own PDA; the referrer's rule; created once (`referral/link_referrer.rs:42-94`) | `tests/referral_link.rs`, `referral_refusals.rs`; `tests/brot/referral-*.test.ts` |
| `settle_entry` | 5.1, 5.2, 5.6, 5.8, 5.11, 5.12, 5.13 | `settle_entry.rs:83-149` | `tests/brot/invariant-program.test.ts:185`; `tests/settle_host_rules.rs` |
| `settle_creator_share` | 5.1, 5.11, 5.13 | `settle_creator_share.rs:50-108` | `tests/sdk/prepare-claim.test.ts:46` |
| `collect_fee` | 5.1, 5.11 | `collect_fee.rs:44-50` | `tests/settle_d_collect_prize.rs:65-110` |
| `settle_prize` | 5.1, 5.11, 5.13 | `settle_prize.rs:41-54` | `tests/settle_d_collect_prize.rs:113-148` |
| `settle_sealed_fee` | 5.1, 5.2, 5.8, 5.11, 5.12, 5.13, 5.18 | the stored campaign and sponsor; finalized; the destination by the cause (`settlement/settle_sealed_fee.rs:44-176`) | `tests/sealed_settle.rs`; `tests/brot/sealed-settle.test.ts`, `sealed-outcomes.test.ts` |
| `close_campaign` | 5.1, 5.8, 5.11, 5.12, 5.13, 5.18 | `close_campaign.rs:47-100`; no `SealedFee` open (`:131-140`) | `tests/brot/close-sweep.test.ts`, `close-reserve.test.ts`, `close-revival.test.ts`; `tests/settle_d_close_sweep.rs`; `tests/sealed_settle.rs:189` |
| `sweep_fees` | 5.1, 5.13, 5.15 | `sweep_fees.rs:40-61` | `tests/settle_d_close_sweep.rs:118-151` |
| The event instruction `0xFF` | 5.4 | `src/events/self_cpi.rs:84-91` | `tests/brot/events.test.ts:159` |

Every named account slot of every instruction is also in the slot matrix (README, "Call sites"; 504 cases at
`8af10e2`, the five new instructions included), except the two event slots, which the checks negatives cover (README
table). The trailing accounts are not in it at `8af10e2`: `tally_late_joins`'s joins (SCOPE G-16; the branch adds the
first `Join` slot, 513 cases) and the DBC config of `user_open_campaign` (tested in
`tests/brot/readers-dbc-adversarial.test.ts:86`).

### 5.1 Account substitution

Passing a real account of the right type that is not the one this campaign, baker or config names.

| Instruction | Slot at risk | Mitigation | Test |
|---|---|---|---|
| `user_open_campaign` | the campaign or vault of another id; the metric account; the SOL/USD account; the DBC config | canonical PDAs of the argument `id` (`open_campaign/create.rs:34-38`); the reader validates the metric account, for price the sponsored PDA of the feed (`src/readers/price_touch.rs:48-50`); the SOL/USD address derived (`open_campaign/payment.rs:65-69`); the DBC config must be the pool's own (`src/readers/dbc_graduation/config.rs:67-70`) | `tests/brot/open-campaign-refuses-slots.test.ts:60`; `tests/brot/open-campaign-refuses.test.ts:33`; `tests/brot/open-campaign-refuses-payment.test.ts:43`; `tests/brot/readers-dbc-adversarial.test.ts:86` |
| `user_join_campaign`, `sponsor_join_campaign` (the join core) | another campaign's vault; another baker's or campaign's `Entry`; another metric account; a `Join` at another index | the vault at the campaign's PDA and stored bump (`join_core.rs:81-82`); the `Entry` re-derived from this campaign and this baker, and its stored keys compared (`src/instructions/entries/entry_account.rs:58-73`); the metric account is the stored one (`join_core.rs:86-88`); the `Join` at the canonical PDA of the entry's `join_count` (`src/instructions/entries/join_record.rs:99-102`, `:156`) | `tests/brot/join-campaign-slots.test.ts:22`, `:59`; `tests/brot/join-campaign-refuses.test.ts:119`, `:129`; `tests/brot/join-campaign-wallets.test.ts:19` |
| `sponsor_join_campaign` | another SOL/USD account; another sponsor's or campaign's `SealedFee`; a join slot as the `SealedFee` | the SOL/USD address derived (`open_campaign/payment.rs:65-69`, through `entries/sealed_charge.rs:44`); an existing `SealedFee` loaded at its PDA and its stored keys compared, a new one at the canonical PDA (`entries/sealed_fee_account.rs:57-95`); the slot apart from the join's writable ones (`:44-52`) | `tests/brot/sealed-entry.test.ts:124`; `tests/sealed_entry.rs:109`, `:120`; `tests/brot/sealed-settle.test.ts:130`; 55 slot-matrix cases |
| `resolve_campaign` | the metric account; the proof account | the metric account is the stored one (`resolve_campaign.rs::resolve_campaign`); the proof is read and judged by the reader, never trusted (`src/readers/price_touch/proof.rs:79-103`) | `tests/brot/resolve-refuses.test.ts:78`; `tests/brot/price-proof.test.ts:48-99` |
| `reread_campaign` | the metric account; the proof account; another config | the metric account is the locked one (`resolution/contest_rules.rs:108-116`); an offered proof the reader reads and refuses refuses the call (`:177-186`); the config at `["config"]` and apart from the campaign (`reread_campaign.rs:93-98`) | `tests/contest_mollusk_reread.rs:186`; `tests/contest_mollusk_bounds.rs:44`; `tests/brot/contest-proof.test.ts:62`; 13 slot-matrix cases |
| `team_open_contest`, `admin_decide_contest` | another config; another campaign | as `team_confirm_result` (below); a team key reads the config's team, the admin its admin (`resolution/contest_rules.rs:61-65`, `:188-193`) | `tests/contest_mollusk_open.rs:54`; `tests/contest_mollusk_decide.rs:89`; 7 and 14 slot-matrix cases |
| `user_link_referrer` | another referee's link | the link must be the canonical PDA of the signing referee (`referral/link_referrer.rs:60-61`) | `tests/referral_refusals.rs:77`; `tests/brot/referral-refuses.test.ts:72`; `tests/brot/referral-wallets.test.ts:24` |
| `settle_sealed_fee` | another campaign's `SealedFee`; a sponsor slot that is not the stored sponsor; another fee vault | the stored campaign (`settlement/settle_sealed_fee.rs:143-147`) and sponsor (`:149-154`) compared after the owner, length and tag and before the PDA, then the PDA from the two slots (`:72-79`); the canonical fee vault (`:80`) | `tests/sealed_settle.rs:127`, `:144`; `tests/brot/sealed-settle.test.ts:62` |
| `team_confirm_result`, `team_void_campaign`, `finalize_campaign` | another config; another campaign | the config at `["config"]`, the campaign at the PDA of its stored id (`src/state/campaign/loaders.rs:26-47`); the two must differ (`team_confirm_result.rs:44`; `team_void_campaign.rs:61`; `finalize_campaign.rs:41`) | slot matrix: 14, 14 and 13 cases (`tests/brot/slot-matrix.gen.ts:547-550`) |
| `settle_entry` | an `Entry` of another campaign; a recipient that is not the stored baker; another campaign's vault | the entry's stored campaign and baker compared before its PDA (`settle_entry.rs:96-105`), then re-derived (`:117`); `vault_of` (`:107`) | `tests/brot/invariant-program.test.ts:185` (`WrongBaker`); 32 slot-matrix cases |
| `settle_creator_share`, `settle_prize` | a recipient that is not the stored creator | `settle_creator_share.rs:59-61`; `settle_prize.rs:50-53` | `invariant-program.test.ts:185` (`WrongCreator`); `tests/settle_d_collect_prize.rs:136` |
| `collect_fee`, `close_campaign` | another fee vault; another rent payer | the canonical fee vault (`collect_fee/moves.rs::fee_vault_is_canonical`); the stored rent payer (`close_campaign.rs:55-58`) | `tests/settle_d_collect_prize.rs:90`; `tests/settle_d_close_sweep.rs:96`; `tests/brot/close-sweep.test.ts:74` |
| `sweep_fees` | a recipient that is not `fee_recipient` | `sweep_fees.rs:44-51` | `tests/settle_d_close_sweep.rs:118` |
| `tally_late_joins` | another entry; joins out of order or of another baker | `entry_account.rs:109-120`; each join's campaign, baker, index and PDA (`join_record.rs:40-76`); the next index only (`tally_late_joins.rs::tally_late_joins`) | 22 slot-matrix cases for the five named slots; the `Join` list only on the host parser at `8af10e2` (`tests/join_host_record.rs:51`); branch: through the program (`tests/brot/prefreeze-tally-refusals.test.ts`, SCOPE G-16) |
| admin instructions | a look-alike config | the config's PDA (`src/state/mod.rs:69`, `:89`) | `tests/brot/checks.test.ts:77`; `tests/checks_mollusk.rs:135` |

### 5.2 Owner and type confusion

The same bytes under another owner; a program account of another type; an Anchor discriminator that collides across
programs (`src/readers/damm_v2.rs:36-37`).

- **The program's own accounts:** owner first, then exact length, then tag and layout version, then the PDA, before
  any field is read (`src/state/mod.rs:56-91`); the tags are 1 to 6 since Sprints 14 and 15, and 0 is never written, so
  a zeroed account fails (`src/state/mod.rs:29-42`). Tests: `tests/brot/checks.test.ts:26`, `:44`, `:50`, `:56`, `:62`,
  `:71`; the slot matrix's "type" cases put an account of each other program type in every slot
  (`tests/brot/slot-matrix.gen.ts`). `Join` and `ReferralLink` are both 96 bytes, so between them the tag decides: the
  `Join` parser checks it (`src/instructions/entries/join_record.rs:45-46`), as `state::load` does for the others;
  `Entry` (116) and `SealedFee` (112) differ in length from every other account. `settle_entry` reads the entry's
  stored keys only after its owner, length and tag (`settle_entry.rs:53-67`), and `settle_sealed_fee` the `SealedFee`'s
  (`settlement/settle_sealed_fee.rs:131-141`).
- **Third-party accounts:** every reader checks the owner before a byte (`price_update.rs:63-65`; `spl_mint.rs:49-51`;
  `damm_v2.rs:49-51`; `stake_pool.rs:111-113`; `vote_stake.rs:82-84`; `dbc_graduation.rs:89-91`;
  `dbc_graduation/config.rs:44-46`), then the exact size and discriminator. Token-2022 fails the SPL owner check
  (`tests/readers_spl_mint.rs:66`). Tests on real mainnet bytes, with other owners, cut, stretched, zeroed and
  same-size foreign accounts: `tests/price_reader.rs:112-171`; `tests/readers_spl_mint.rs:66-92`;
  `tests/readers_damm_v2.rs:65-84`; `tests/readers_stake_pool.rs:81`; `tests/readers_vote_stake.rs:58`;
  `tests/readers_dbc.rs:89-142`; `tests/brot/open-campaign-refuses.test.ts:42` (a pre-upgrade receiver account at the
  sponsored address).

### 5.3 PDA spoofing

- **Loads** re-derive the address from the seeds and the bump the account stored (`src/checks.rs:94-103`); a campaign's
  address from its stored id (`src/state/campaign/loaders.rs:26-47`). `derive_address` makes no curve check: safe because
  the owner check runs first and only this program creates the accounts it owns, always at the canonical bump
  (`src/checks.rs:92-93`). Tests: `tests/brot/checks.test.ts:77`, `:86`; `tests/checks_mollusk.rs:135`;
  `tests/checks_host_loaders.rs:60`; `tests/brot/resolve-refuses.test.ts:96`.
- **Creation** requires the canonical bump, so no second account can exist for the same seeds and the retry guard holds
  (`src/checks.rs:105-118`); the `ReferralLink` and a new `SealedFee` are found at their canonical PDA the same way
  (`referral/link_referrer.rs:60-61`; `entries/sealed_fee_account.rs:71`). Tests: `tests/brot/checks-init.test.ts:20`;
  `tests/checks_mollusk_init.rs:62`; `tests/brot/open-campaign-refuses-slots.test.ts:60`;
  `tests/brot/referral-refuses.test.ts:72` (a look-alike, a non-canonical and another referee's link).
- **Other derived addresses:** the campaign vault from the campaign and its stored bump (`src/checks/paying.rs:29-37`;
  `join_core.rs:81-82`); the fee vault canonical (`collect_fee/moves.rs::fee_vault_is_canonical`, close, collect and
  the sealed fee) or at the config's bump (`sweep_fees.rs:52-53`); a settled `SealedFee` from the campaign and sponsor
  slots (`settlement/settle_sealed_fee.rs:72-79`); the sponsored Pyth account (`src/readers/price_update.rs:118-126`),
  the SOL/USD one included; the ProgramData PDA (`src/checks/upgrade.rs:25-28`); the event authority, a constant
  (`src/constants.rs:37-39`) proven canonical by `tests/layout.rs:75-79`.

### 5.4 CPI and re-entry

- **Outgoing calls:** the program calls only the System Program (`src/vault.rs:26-31`; `src/checks.rs:147`) and itself,
  for events (`src/events/self_cpi.rs:57`). It never calls a third-party program: the readers only read accounts. So no
  callback can re-enter a handler mid-state. The self-CPI re-enters only the `0xFF` handler, which reads and writes
  nothing (`self_cpi.rs:84-91`).
- **Incoming CPI:** `resolve_campaign` and, since Sprint 14, `reread_campaign` must run at the transaction's top level
  (`src/checks/top_level.rs:17-21`, each with its own error: `ResolveNotTopLevel` 6071, `RereadNotTopLevel` 6165), so no
  program can wrap a resolution or a re-read in logic the transaction does not show. Tests:
  `tests/brot/resolve-refuses.test.ts:53` and `tests/brot/contest-reread.test.ts:69`, through `tests/programs/cpi-proxy`.
  The top level does not stop several instructions in one transaction around a re-read (§5.16). The other instructions
  accept CPI by design (a multisig executes the admin's, a program may join or link for its PDA); each still checks its
  signer and every slot.
- **Forged events:** the event handler succeeds only for the event authority, signed, which only this program can sign
  (`self_cpi.rs:84-91`; `src/constants.rs:33-39`). Tests: `tests/brot/events.test.ts:159` (a top-level call refused);
  `tests/sdk/decoder.test.ts:89` (a call through another program refused); `tests/event_cpi.rs:71`.
- **Borrows across CPIs:** every handler drops its account borrows before an event or a transfer (for example
  `src/instructions/admin/accept_admin.rs:42`; `join_core.rs:182-183`); a slip fails as `AccountBorrowFailed`
  rather than passing silently (`src/vault.rs:21`).

### 5.5 Arithmetic

- Clippy denies unchecked arithmetic, truncating casts and sign-losing casts in the crate (`Cargo.toml:60-63`); the
  release profile keeps overflow checks (root `Cargo.toml:13-14`). Money is u64 with u128 intermediates
  (`src/math/rounding.rs:1-74`); prices, targets and times widen to i128 before they combine
  (`src/readers/price_touch/rules.rs:8-10`; `src/math/schedule.rs:9-10`). Every failure is `MathOverflow` 6000, never a
  wrap; a rate above 100% and a zero divisor are refused (`src/math/rounding.rs:12-31`).
- Counters are checked: `event_seq` (`src/instructions/resolution/team_shared.rs:25-30`), `join_count`
  (`src/instructions/entries/join_record.rs:156-157`), `entries_open` and `entries_untallied` (`join_core.rs:107-117`),
  `open_campaigns`, whose decrement refuses below zero (`src/instructions/settlement/snapshot.rs:103-107`), and since
  Sprint 15 `sealed_fees_open` (`entries/sponsor_join_campaign.rs:129-137`; its decrement refuses below zero,
  `settlement/settle_sealed_fee.rs:99-104`) and a `SealedFee`'s totals (`entries/sealed_fee_account.rs:74-82`). The
  contest's deadlines are checked additions (`resolution/team_open_contest.rs:104`; `resolution/contest_reread.rs:85-87`;
  `resolution/contest_rules.rs:152-155`); a stage-2 deadline that would overflow writes nothing (`tests/contest_reread.rs:136`).
- `unsafe` appears in three places only: the zero-copy views, whose alignment 1 and exact size are asserted at compile
  time (`src/layout.rs:73-125`), and two syscalls (`src/checks/top_level.rs:26`; `src/readers/vote_stake.rs:94`).
- Tests: `tests/math_opening_properties.rs` (an overflow exactly past u64); `tests/price_math.rs` (negative prices, the
  largest confidence, exponents +5 and −30); `tests/math_payout_refusals.rs`; `tests/readers_shared.rs`
  (`min_distance` at the ends of i128); `tests/price_stale_feed.rs:102` (publish times at the ends of i64);
  `tests/cursor.rs:46` (a skip that overflows); `tests/team_window_rules.rs:140` (`seq` at its maximum).

### 5.6 Rounding

- One direction per kind of amount, written once (`src/math/rounding.rs:1-8`): fees round up (`bps_ceil`), payouts and
  the creator share round down (`bps_floor`, `mul_div_floor`), the opening rounds toward Brot (`div_ceil` on the
  lamports, the prize floored, `src/math/opening.rs:45-78`), and so does a sealed entry, charged by the same function
  (the entry part floored, the 10% the rest; `entries/sealed_charge.rs:44`).
- The dust of a `Split` (less than the number of winning entries) stays in the vault and goes to the fee vault at close
  (I6; `close_campaign.rs:75-77`, `:95`). Splitting an entry across wallets never receives more (I9: the floor of a sum is
  at least the sum of floors). Winners never get back less than their entry (I11: `from_pot ≤ P − fee`,
  `src/math/payout.rs:65-68`).
- The join estimate rounds down (`src/math/payout.rs:150`), so a `min_return_bps` equal to the estimate passes.
- Tests: `tests/math_fees.rs`; `tests/math_payout_properties.rs` (I6, I9, I11, I13); `tests/brot/invariant-rules.test.ts:121-136`;
  24,000 vectors replayed by an independent TypeScript implementation (`tests/math_vectors.rs`,
  `tests/math_vectors_snapshot.rs`; `tests/sdk/math-vectors.test.ts`, `tests/sdk/snapshot-vectors.test.ts`).

### 5.7 Reinitialization

- `checks::create_pda_account` refuses an address the program owns, an address another program owns, and a System
  account that carries data (`src/checks.rs:139-143`); `state::init` refuses an account whose first two bytes are not
  zero (`src/state/mod.rs:97-112`).
- Per account: the config (a second `admin_initialize_config`: `tests/brot/checks-init.test.ts:64`;
  `tests/checks_mollusk_init.rs:112`; `tests/brot/admin-init.test.ts:69`); a campaign whose id is taken
  (`tests/brot/open-campaign-retry.test.ts:18`); an `Entry` (loaded, never re-created, once owned:
  `join_core.rs:107-117`); a `Join` (one index per join, a second creation at the same address refused:
  `join_record.rs:111`); a `ReferralLink` (a second link, to any referrer, is `AlreadyInitialized`:
  `tests/referral_link.rs:51`; `tests/brot/referral-refuses.test.ts:33`); a `SealedFee` (an existing one is loaded and
  topped up, never re-created: `entries/sealed_fee_account.rs:66-73`; `tests/brot/sealed-entry.test.ts:94`).
  `tests/checks_host_loaders.rs:87` shows `init` writes the tag once.
- Observation: `create_join` writes the `Join` header directly rather than through `state::init`
  (`join_record.rs:112-122`); safe, since `create_pda_account` has just refused any program-owned or data-carrying
  account, but outside the house rule (SCOPE gap G-15).
- Re-opening a closed campaign's id: SCOPE O-4.

### 5.8 Lamport injection

- **No balance is read from a vault.** Pools, prize, opening fee, fees and shares are fields
  (`src/state/campaign.rs:91-170`), and a sponsor's held fee is `SealedFee.fee_lamports`
  (`src/state/sealed_fee.rs:24-26`); hand-sent SOL never becomes an entry, a prize, a fee or a chance (I15). Test:
  `tests/brot/join-campaign-pot.test.ts:19`. The deposit assertion measures only the change across the instruction, so a
  surplus already in the vault never refuses a join (the module note of `src/math/invariant.rs`); the branch's payout
  assertion compares changes too, so a surplus never refuses a payout (SCOPE §10).
- **Pre-funded addresses** of a vault, campaign, `Entry`, `Join`, `ReferralLink`, `SealedFee`, config or fee vault:
  creation tops up, allocates and assigns instead of failing (`src/checks.rs:127-148`; `tests/referral_link.rs:64`;
  `tests/brot/sealed-settle.test.ts:106`). Tests: `tests/brot/open-campaign-retry.test.ts:36`, `:52`;
  `tests/brot/join-campaign-adds.test.ts:120`; `tests/brot/checks-init.test.ts:98`; `tests/brot/admin-init.test.ts:77`;
  `tests/checks_mollusk_init.rs:121`. A pre-funded unsigned path is refused by the signer check
  (`tests/brot/checks-init.test.ts:76`; `tests/brot/open-campaign-team.test.ts:72`).
- **Where hand-sent SOL ends:** a vault's or a campaign's surplus goes to the fee vault at close
  (`close_campaign.rs:68-90`); an `Entry`'s or a `Join`'s goes back to the baker with its rent (`settle_entry.rs:132`,
  `:147`; the `Join`'s through the `Entry`, `tally_late_joins.rs::tally_late_joins`); a `SealedFee`'s goes to the fee
  vault at its settlement (`settlement/settle_sealed_fee.rs:82-98`; `tests/sealed_settle.rs:94`); a `ReferralLink`'s
  stays, since nothing closes it; the fee vault's goes to `fee_recipient`. The randomized run sends SOL by hand to vaults,
  campaigns, `SealedFee` accounts and link addresses among its operations and checks I1 and I15 after each
  (`tests/brot/invariant-ops.ts:104-107`; `tests/brot/invariant-checks.ts:22-27`, `:155-159`;
  `tests/brot/invariant-sealed-checks.ts:23-45`).
- A funded ProgramData address blocks a deploy (§4.8).

### 5.9 Stale or manipulated price

| Moment | Threat | Mitigation | Test |
|---|---|---|---|
| A paid opening (SOL/USD) | an old, wide or foreign price lowers or raises the charge | the derived sponsored account, `Full`, the feed, age ≤ `max_price_age`, ≤ 60 s ahead, posted within the slot bound, confidence ≤ `max_price_conf_bps`; charged at `price − conf`; at most the signed `max_lamports` (`open_campaign/payment.rs:47-108`) | `tests/brot/open-campaign-refuses-payment.test.ts:43-97`; `tests/open_h_price.rs`; `tests/open_campaign_payment.rs` |
| A sealed entry (SOL/USD, Sprint 15) | the same, on a sponsor's US$; an admin change of the rules between preview and landing | the same function and bounds (`entries/sealed_charge.rs:36-45`); the creation rules' version signed (`:29-32`, `CreationParamsChanged`) | `tests/brot/sealed-entry.test.ts:124`, `:175`; `tests/sealed_entry.rs:78-102`; the randomized run's `SolUsdStale` and `SolUsdConfidenceTooWide` draws (`tests/brot/invariants.test.ts:47`) |
| Opening a price campaign | a feed outside the list, a stale or wide price, a target already touched or too near | the compiled feed list (`src/feeds.rs:40-49`); age ≤ `campaign_max_age`, slot bound, confidence ≤ 0.5% (`src/readers/price_touch.rs:47-67`); the target at least 1% past the band edge, within a tenfold move (`price_touch/target.rs:34-68`) | `tests/brot/open-campaign-refuses.test.ts:50-84`; `tests/price_opening.rs`; `tests/price_target.rs` |
| A join | a baker picks an older price to dodge the lock | only the stored sponsored account, which only moves forward (§4.1); the stored exponent; age ≤ the campaign's `max_age` (≥ 30 s); the slot bound (`price_touch.rs:76-94`) | `tests/brot/join-campaign-price.test.ts:35-88`; `tests/price_join.rs` |
| A join near the target | the price crossed off-chain before the sponsored account shows it | the proximity buffer: refused while the band edge is within 1% of the price (`src/instructions/entries/join_rules.rs:43-62`); a join at or after the YES proof's `publish_time` is refunded whole (`SCOPE.md` §7). Residual: a move that crosses inside one publisher interval without showing near the target first (`join_lock.rs:28-30`) | `tests/join_host_buffer.rs`; `tests/brot/join-campaign-lock.test.ts:64`; `tests/brot/late-entries.test.ts:27` |
| The YES proof | an old update, a foreign feed, a price in another exponent, a band that only half crosses | any `Full` account of the feed, published in `[opens_at, deadline]`, ≤ 60 s old and ≤ 600 slots, positive, the whole band past the target (`price_touch/proof.rs:79-103`). Within those bounds a resolver may pick any of Pyth's own updates: a touch counts if Pyth signed it (Q4) | `tests/brot/price-proof.test.ts:48-99`; `tests/price_proof.rs` |
| After the window | a lapsed sponsorship turns every open campaign to NO | `StaleFeed` voids when the last update before the deadline is older than `deadline − max(max_age, 600 s)` (`proof.rs:111-131`); an update after the deadline gives NO, since the program cannot see the last one before it | `tests/brot/price-proof.test.ts:114`; `tests/price_stale_feed.rs` |
| A touch nobody proves in time | a short touch is lost if no proof lands within 60 s | the keeper posts its own proofs with a Hermes key (D4; mainnet price campaigns wait for it, TP §3.4.8); no on-chain correction of the NO afterwards (SCOPE G-3) | — |
| The oracle itself | a receiver upgrade or governance change | out of the program's reach (§4.1) | — |

### 5.10 Clock

- One clock read per instruction serves every rule in it (`open_campaign.rs:122-125`; `join_core.rs:93-94`).
- Boundaries, each tested on both sides: entries close at `now ≥ entries_close_at` (`join_core.rs:95`;
  `tests/brot/join-campaign-refuses.test.ts:44`); a fact met in the deadline's own second is still YES
  (`src/readers/shared.rs:93-97`); the proof window ends at `D + 60` inclusive (`proof.rs:56`;
  `tests/brot/price-proof.test.ts:99`); the review window is closed from `review_ends_at` on (`window.rs:9-13`;
  `finalize_campaign.rs:53`; `tests/team_window_rules.rs:30-53`), for a contest's opening too
  (`tests/contest_mollusk_open.rs:75`); durations are inclusive at 3 and 90 days (`src/math/schedule.rs:39-48`;
  `tests/brot/open-campaign-refuses.test.ts:98`).
- The contest's clocks (Sprint 14): a matching re-read pays from stage 1's deadline on, not before
  (`resolution/contest_rules.rs:91-97`; `tests/contest_timelock.rs:30`); the escalation and the admin's decision are refused from
  their deadline's own second (`resolution/contest_rules.rs:83`, `:136`; `tests/contest_mollusk_escalate.rs:90`,
  `tests/contest_mollusk_decide.rs:118`); the lapse comes at stage 2's deadline, or 48 hours after an unread stage 1's,
  and is refused one second before (`resolution/contest_rules.rs:171`; `tests/contest_mollusk_decide.rs:167`, `:182`); a late
  re-read counts stage 2 from stage 1's deadline (`resolution/contest_reread.rs:84`). The worst case is 78 hours from the
  resolution, refused one second earlier (`tests/brot/contest-worst-case.test.ts:112`). On the branch, the tally of a
  YES price result waits until `now > publish_time + 60 s` (O-3), which rests on the Clock never going back (§4.9).
- A lagging cluster clock cannot keep an old price fresh: freshness is also bounded in slots, at 100 ms a slot
  (`price_touch/rules.rs:64-74`). A price published far ahead of the clock is stale (60 s lead,
  `src/constants.rs:92-95`).
- The epoch kinds assume a slowest average slot of 500 ms when they check that the measured epoch starts before the
  deadline (`src/readers/epoch.rs:131-148`); a missed epoch voids as `MissedWindow`, a house failure that refunds the 10%.
- Alpenglow may let the leader set the Clock timestamp and shorten slots to about 200 ms (TP §3.4.8) **[to verify on
  mainnet before launch]**; drift on devnet was 1 s in one sample (TP §14.4 C12).

### 5.11 Ordering, replays and double settlement

| Sequence | Guard | Test |
|---|---|---|
| A retried opening | the id's account exists (`AlreadyInitialized`) | `tests/brot/open-campaign-retry.test.ts:18` |
| A retried join | `expected_entry_total` (`entry_account.rs:69-71`) | `tests/brot/join-campaign-refuses.test.ts:73` |
| A second resolution | `CampaignNotOpen`, or the re-proof rule (`resolve_campaign.rs::resolve_campaign`) | `tests/brot/resolve-refuses.test.ts:64`, `:72`; `tests/brot/cutoff-reproof.test.ts:21` |
| Finalize twice, or after a team act | status, then the transition table (`finalize_campaign.rs:50-52`; `src/state/transitions.rs:14-35`) | `tests/settle_host_finalize.rs:175`; `tests/brot/invariant-program.test.ts:204` |
| A team act after the window; finalize inside it | the window rules (`window.rs:17-30`; `finalize_campaign.rs:53-55`) | `tests/brot/team-window.test.ts:149`; `tests/team_window_rules.rs:42` |
| A retried or duplicate contest opening (a 429 after it landed, a second team member on the same alert) | the act is the signed byte: byte 1 on a `Contested` campaign is `ContestAlreadyOpen`, never an escalation (`resolution/contest_rules.rs:45-59`) | `tests/contest_mollusk_act.rs:62`; `tests/brot/contest-act.test.ts:24` (§5.16) |
| A second escalation; a re-read or a decision at the wrong stage | the stage rules (`resolution/contest_rules.rs:77-87`, `:118-130`) | `tests/contest_mollusk_escalate.rs:83`; `tests/contest_mollusk_reread.rs:178`; `tests/contest_mollusk_decide.rs:109` |
| A team confirm, a tally, a resolution, or any payout on a `Contested` campaign before its exit | each needs another status: `TeamKeyOutsideReview`, `TallyNotReady`, `CampaignNotOpen`, `NotFinalized`, `CampaignNotSettled`; finalize before the lapse is `ContestNotLapsed` | `tests/brot/contest-open.test.ts:82`, at both stages, no lamport moved |
| Settle a sealed fee twice, or before finalize | a closed `SealedFee` is `AlreadySettled`; `NotFinalized` before `Settling` (`settlement/settle_sealed_fee.rs:122-127`, `:156-165`) | `tests/sealed_settle.rs:159`, `:115`; `tests/brot/sealed-settle.test.ts:95`, `:49` |
| A retried sealed entry | `expected_entry_total`, as a join | `tests/brot/sealed-entry.test.ts:159` |
| Settle an entry twice | the `Entry` closes in the instruction that pays it (`settle_entry.rs:146-149`); a closed one is `AlreadySettled` (`:93-95`) | the randomized run settles out of order and twice (`tests/brot/invariant-settle.ts`) |
| Settle before finalize, or before the tally | `NotFinalized` (`settle_entry.rs:108-112`); `NotTallied` (`:113-120`), defensive, since finalize already requires every join tallied (`src/instructions/settlement/snapshot.rs:80-82`) | the randomized run expects `NotFinalized` before finalize (`tests/brot/invariant-settle.ts:47`); finalize's own `NotTallied`: `tests/settle_host_finalize.rs:48`; no test reaches the two `NotTallied` branches of `settle_entry` **[INF: unreachable after finalize]** |
| The share, the fee, the prize twice | the flags (`settle_creator_share.rs:79-101`; `collect_fee.rs:45-47`; `settle_prize.rs:47-49`) | `tests/sdk/prepare-claim.test.ts:46`; `tests/settle_d_collect_prize.rs:65`, `:136` |
| Collect before every entry is settled | `entries_open == 0` (`collect_fee.rs:72-80`) | `tests/settle_d_collect_prize.rs:80` |
| Close twice, or early | `AlreadyClosed`; the flags (`close_campaign.rs:47-49`, `:115-129`); a `SealedFee` still open (`:131-140`) | `tests/settle_d_close_sweep.rs:73`, `:78`; `tests/brot/close-sweep.test.ts:74`; `tests/sealed_settle.rs:189` |
| Tally twice or out of order | the next index only; `EntryAlreadyTallied` (`tally_late_joins.rs::tally_late_joins`); a join passed twice fails the owner check once closed | none through the program at `8af10e2` (SCOPE G-16); the host parser in `tests/join_host_record.rs:51`; branch: `tests/brot/prefreeze-tally-refusals.test.ts` |
| A join landed in the same slot just before a burn, a lock or a curve's completion | the lock reads the account as it is when the join executes; whoever orders both transactions (the creator who controls the account, or a block builder) can put the join first | accepted risk (§6); `tests/brot/join-campaign-lock.test.ts:109`, `:127` |
| The first resolver chooses the YES proof | it sets the late-join cut-off; an earlier proof can move it back only while no entry is fully tallied, and at `8af10e2` a partial tally does not lock it; on the branch no join is tallied while the cut-off can move (`CutoffNotFinal`, `b1650fb`) | SCOPE O-3; `tests/brot/cutoff-reproof.test.ts:21` (the whole-entry case); branch: `tests/brot/prefreeze-partial-tally.test.ts` |

### 5.12 Closing and revival

- `checks::close_account` refuses an account it does not own or that still holds lamports, zeroes the data, then the
  library's `close` zeroes the owner (the System Program), the lamports and the data length (`src/checks/close.rs:17-23`;
  `solana-account-view` 2.1.0 `close`, `PINOCCHIO.md`). Tests: `tests/checks_close_paying.rs:23-63`.
- A campaign closed and funded again in the same transaction is the System Program's and fails the next instruction
  (`WrongOwner`): `tests/brot/close-revival.test.ts:27`. A revived `Entry` address reads as settled
  (`settle_entry.rs:69-72`, `:93-95`), and a revived `SealedFee` address the same way (`AlreadySettled`,
  `settlement/settle_sealed_fee.rs:122-127`; `tests/sealed_settle.rs:159`). A `Join` passed twice in one tally fails the
  owner check the second time. A `ReferralLink` is never closed.
- After close, the same id can be opened again (SCOPE O-4); close needs every `SealedFee` of the campaign settled first,
  so none outlives it.

### 5.13 Rent and the reserve path

- The runtime refuses a balance left between zero and the rent-exempt minimum. The creator share is the one credit routed
  around it: reserved in the vault when it would leave an empty wallet below the minimum, claimed later from a funded
  wallet, or paid with the rents at close (`src/instructions/settlement/rules.rs:99-130`;
  `settle_creator_share.rs:75-108`; `close_campaign.rs:62-80`). Tests: `tests/settle_host_rules.rs:150`, `:162`;
  `tests/sdk/prepare-claim.test.ts:46`; `tests/brot/close-reserve.test.ts:52`, `:63`.
- A settled `Entry` always credits at least its own rent to the baker (`settle_entry.rs:132`, `:147`), and a settled
  `SealedFee` its rent to the sponsor (`settlement/settle_sealed_fee.rs:82-98`); the rent returned is the current one, not
  the one paid (red team I3, `docs/sprints/sprint-15-sponsorship.md:159-161`).
- `settle_prize`, `collect_fee` and `sweep_fees` have no reserve path: a credit that would leave an empty recipient below
  the minimum makes the transaction fail, the flag stays unset, and `close_campaign` waits. With the founder's values the
  prize is about 4.12 SOL (TP §3.4.5), far above the minimum; the case needs an opening fee near its US$1 floor and a
  high SOL price **[INF]**. Liveness only: the recipient can fund its wallet and anyone can retry.
- Rent is read from the Rent sysvar at the moment of use (`collect_fee/moves.rs::empty_rent`; `close_campaign.rs:67`,
  `:82`; `settle_sealed_fee.rs:83`). On the branch, close also compares the vault above that rent with the books, so a
  rent rise above the SOL sent by hand would refuse a close (SCOPE S-3).

### 5.14 Denial of service and griefing

| Lever | Effect | Bound |
|---|---|---|
| The pause (a team key, or a leaked one) | stops joins and openings | never results or payouts (I10′); only the admin resumes (`admin/resume_entries.rs:16-39`) |
| Free openings by a leaked team key | unbounded campaigns for the services to resolve | none in code (SCOPE G-4); the key is removed by `admin_set_team`; every team opening raises an alert (Sprint 16) |
| Paid openings that fill the valve | stops other paid openings up to 90 days | `max_open_campaigns` (`open_campaign/rules.rs:101-111`); each costs US$500, of which about US$50 is kept when nobody joins (TP §7) |
| Many joins per baker | many `Join` accounts to tally before finalize | each join costs at least the minimum entry plus a `Join` rent; the tally is permissionless; how many joins fit one tally transaction is **[to verify]** |
| A keeper outage on an epoch kind | the measured epoch is missed | `MissedWindow` voids and refunds the opening fee (`src/readers/stake_pool.rs:186-188`) |
| A contest, by a team key (or a leaked one) | holds a campaign's payout | at most 72 hours after the contest opens, 78 after the resolution, with or without a keeper (§5.16) |
| Anyone re-reading a contested result into stage 2 | sends it to the admin, adding up to 48 hours | inside the same 78-hour bound: stage 2 counts from stage 1's deadline at the latest (`resolution/contest_reread.rs:79-93`) |
| A `SealedFee` nobody settles | the campaign cannot close: its rents, its dust and a reserved share wait | `settle_sealed_fee` is permissionless and never paused; the keeper settles every one before a close (§5.18) |

### 5.15 Privileged keys

- **Initialization** cannot be front-run: only the upgrade authority recorded in ProgramData initializes
  (`src/checks/upgrade.rs:17-44`). Tests: `tests/brot/admin-init.test.ts:36-58`; `tests/brot/checks-init.test.ts:34-58`.
- **Admin:** cannot touch a vault. Can raise the opening price up to US$5,000 and Brot's fee up to 10% for future
  campaigns only (`src/state/config.rs:142-193`; `tests/brot/admin-params.test.ts:69-147`); can redirect Brot's own fees
  (`admin/set_fee_recipient.rs:32-53`); a pending hand-over can be replaced or cancelled (`admin/transfer_admin.rs:44-46`).
- **Team key:** §3. The worst case of a leaked key is griefing (pause, unbounded free openings, a contest on every
  result in its window, each holding the payout up to 72 hours), skipping reviews (confirm early), and moving the 10%
  opening fee on automatic voids; it cannot redirect an entry, a prize or a share, and cannot decide a contest.
- **Admin, since Sprint 14:** decides a contest at stage 2; never inverts; with a team key's contest it can void a
  correct result, and its void's reason moves the 10% opening fee and every sponsor's held 10% (§5.16; SCOPE G-12).
- **Upgrade authority:** everything, by replacing the program (TP §3.4.9; `content/powers.md`). Mainnet: the multisig and
  a verifiable build (Sprints 16 and 18).

### 5.16 The contest (Sprint 14)

Paths under `src/instructions/resolution/`; the rules and their order are SCOPE §18.2–§18.6.

| Threat | Defence in the code | Test |
|---|---|---|
| **A retried or duplicate contest opening.** Before the second red-team pass (S1) the instruction chose open or escalate from the stored status, so a retried opening (a 429 after it landed) or a second team member answering the same alert escalated a stage-1 contest (`docs/sprints/sprint-14-referral-second-read.md:226-231`) | The act is the byte the team key signs: byte 1 on a `Contested` campaign is `ContestAlreadyOpen` 6177 and writes nothing, byte 2 on a campaign not contested is `NotContested` 6160, any other byte or length `BadInstructionData` (`resolution/contest_rules.rs:32-59`; `team_open_contest.rs:67`, `:75`, `:88`). An opening and an escalation sent together in one transaction are both deliberate and leave stage 2 | `tests/contest_mollusk_act.rs:35-100`; `tests/brot/contest-act.test.ts:24-61`; mutation ids `contest_act`, `contest_already_open`, `contest_not_open` |
| **A re-read gamed within one transaction.** The top-level guard stops a program from wrapping a re-read in logic the transaction does not show (`reread_campaign.rs:90`), but a transaction can still hold several top-level instructions: a swap that rebuilds a curve's quote reserve, then a re-read that finds "the same reading" and pays (the review's F1, `docs/sprints/sprint-14-referral-second-read.md:205-206`) | A re-read never writes a result (`resolution/contest_reread.rs:8-9`), so a gamed transaction can only choose between paying the stored result and sending it to the admin. "The same" needs the outcome, the void reason, `met_late` and the observed value all equal (`resolution/contest_reread.rs:45-55`). The paying path opens only at stage 1's deadline, 24 hours after the contest opened (`RereadBeforeTimelock` 6176, `resolution/contest_rules.rs:89-97`), and in those hours a team key can escalate, which no re-read can undo (a re-read needs stage 1, `resolution/contest_rules.rs:118-130`). An offered proof the reader refuses refuses the call instead of escalating (F4, `resolution/contest_rules.rs:177-186`). Residual, accepted with the founder's answer to D2 (§6): once stage 1's 24 hours are over and no team key escalated, such a transaction can pay the stored result | `tests/brot/contest-reread.test.ts:69` (a re-read forwarded by another program), `:176`; `tests/contest_timelock.rs:30`, `:40`; `tests/contest_mollusk_reread.rs:74`; `tests/contest_mollusk_bounds.rs:44-85`; `tests/brot/contest-proof.test.ts:62-89` |
| **A team key holding a payout.** One key contests every result in its window and escalates each before stage 1 ends | The payout is due at most 24 + 48 = 72 hours after the contest opened and 78 after the resolution, with or without a keeper: a contest opens only inside the six-hour window and once every entry is tallied (`resolution/contest_rules.rs:67-72`, `:99-106`); stage 2 cannot be extended (a second escalation is `WrongContestStage`, `:77-81`; the escalation is refused from stage 1's deadline on, `:82-85`); a late re-read counts stage 2 from stage 1's deadline (`resolution/contest_reread.rs:79-93`); an unread stage 1 lapses 48 hours after its deadline (`resolution/contest_rules.rs:142-175`). The stored result stands at the lapse. A delay, never a theft; a leaked key is removed by `admin_set_team`, and the keeper alerts at each stage a contest enters (`contest_opened`, `deploy/vps/runbooks/contest-opened.md:3-5`) | `tests/brot/contest-worst-case.test.ts:112`, `:124`, `:131`; `tests/contest_mollusk_escalate.rs:83`, `:90`; `tests/contest_mollusk_decide.rs:150-205`; stated on `content/powers.md:29` |
| **The admin voiding a correct contested result** | Only at stage 2, before its deadline, by `admin` (the 2-of-3 on mainnet), with a reason a team key may choose and the hash of a published note (`resolution/contest_rules.rs:188-193`, `:132-140`; `resolution/contest_decision.rs:16-32`). It never inverts: no decision writes YES or NO, so a correct result can be voided (every entry refunded, the 10% by the reason) but never paid to the losing side (`resolution/contest_decision.rs:34-43`). A power the founder accepted (TP §3.4.9, `docs/technical/TECHNICAL-PLAN.md:776`; §6) | `tests/contest_decision.rs:56` (every decision and reason byte for each stored outcome); `tests/brot/contest-decide.test.ts:69-114`; stated on `content/powers.md:30` |
| A contest that could never end, or never pay | A contest opens only once every entry is tallied, since the tally needs `InReview` (`resolution/contest_rules.rs:10-12`, `:99-106`); every exit runs the same snapshot, a pot with no entry goes straight to `Settled` (`src/state/transitions.rs:26-30`) | `tests/contest_mollusk_open.rs:85`; `tests/state_transitions.rs:19-42`; `tests/brot/contest-decide.test.ts:103` |
| A contest step rewriting the stored result | Only the status, the stage, its deadline and `event_seq` are written by the opening, the escalation and an escalating re-read (`team_open_contest.rs:104-108`; `resolution/contest_reread.rs:83-93`); the randomized run checks the stored result after every operation (`tests/brot/invariant-state.ts:1-5`) | `tests/contest_mollusk_open.rs:34`; `tests/contest_mollusk_escalate.rs:41`; `tests/contest_mollusk_reread.rs:125` |

### 5.17 The referral (Sprint 14)

The program records the link only; the payout is an off-chain routine outside the firms' scope (SCOPE §18.7, §20).

| Threat | Defence | Test |
|---|---|---|
| A link written for another wallet, or changed or removed later | The link is the canonical PDA of the signing referee (`referral/link_referrer.rs:60-61`), created once (`AlreadyInitialized`), and no instruction writes or closes it again | `tests/brot/referral-wallets.test.ts:24`, `:54` (66 cases over every writable slot of every instruction); `tests/referral_refusals.rs:77` |
| **Self-referral up to its ceiling** (accepted risk) | On-chain only the zero address and the referee itself are refused (`referral/rules.rs:15-20`, `InvalidReferrer` 6153); a second wallet of the referee passes (`:1-3`). The gain is bounded off-chain: 20% of the fee Brot actually kept on the referee's winning entries, for 90 days, and a rebate capped at 0.05 SOL (TP §3.4.11). No lock against it, by the founder's decision (§6) | `tests/referral_refusals.rs:120`, `:126`; `tests/brot/referral-refuses.test.ts:99`, `:104` |
| **A referrer that cannot be credited** (a sysvar, a builtin or precompile id, the incinerator, an executable account, the operations wallet itself), which stopped every batch before the second red-team pass (R2) | Off-chain: the routine holds such a line for a person at prepare, simulates every other line, and a failed line no longer stops the run; the program accepts any address but the two above | `services/indexer/tests/referral-hold.test.ts:54`, `:79` |
| **The payout file run twice** (R1) | Off-chain: each transfer carries the memo `brot-referral:<batch>:<index>`; the signing file runs once, looks for each line's memo on chain before sending it, and pays nothing twice when run again by mistake; `record` books what landed by memo and `record --cancel` gives up the rest; batch numbers never repeat and a stale signing file is refused before any row is written (R3); the file is bound to its cluster by the genesis hash (R4) | `scripts/referral/rehearse.ts:1-8` (the real Solana CLI on an offline surfnet); `services/indexer/tests/referral-ledger.test.ts:88`; `services/indexer/tests/referral-commands.test.ts:86`; `referral-hold.test.ts:92`, `:116` |
| A link dated after the first entry, to earn on entries made before it | Off-chain: "before the first entry" is decided by chain order (slot, place in the block, instruction), and a link in the same slot is resolved by reading the block once (TP §3.4.11); the program records the time and slot of every link (`link_referrer.rs:83-84`) | `tests/brot/referral-link.test.ts:81`; `services/indexer/tests/referral-order.test.ts` |

### 5.18 The sealed entry (Sprint 15)

Paths under `src/instructions/`; the rules are SCOPE §19.

| Threat | Defence | Test |
|---|---|---|
| **The sealed fee stuck, and the close refused until it is settled.** `close_campaign` refuses while any `SealedFee` of the campaign is open (`settlement/close_campaign.rs:131-140`, `SealedFeesOpen` 6172) | `settle_sealed_fee` is permissionless and never paused, callable as soon as the campaign is `Settling` or `Settled`, and its destinations are fixed (`settlement/settle_sealed_fee.rs:44-120`); the count is kept on both sides (`entries/sponsor_join_campaign.rs:129-137`; `settle_sealed_fee.rs:99-104`); the keeper settles every open `SealedFee` before it plans a close and alerts `sealed_fee_open` (`docs/sprints/sprint-15-sponsorship.md:166-171`). While it waits, only the two rents, the dust and a reserved creator share wait: every entry settles on its own. Residual (red team I4, `:159-161`): a sponsor address that could not be credited would fail the settlement, since its rent always goes to the sponsor, and keep the close waiting; the sponsor signed its sealed entry, so it is a key or a program's PDA, which a transfer can credit **[INF]** | `tests/sealed_settle.rs:189`; `tests/brot/sealed-outcomes.test.ts:80`; `services/keeper/tests/sealed-keeper.test.ts`; the randomized run must reach `close SealedFeesOpen` (`tests/brot/invariants.test.ts:50`) |
| A sponsor's fee taken, redirected or refunded by another wallet | The stored campaign and sponsor, compared after the owner, length and tag and before the PDA (`settle_sealed_fee.rs:143-154`); the refund only on a house-failure void (`:167-176`); the fee is `fee_lamports`, never the account's balance | `tests/sealed_settle.rs:127`, `:144`; `tests/brot/sealed-settle.test.ts:62` (two users) |
| A sealed entry charged more than signed, or under rules changed after the preview | `max_lamports` and `expected_params_version` (§5.9; `entries/sealed_charge.rs:29-68`) | `tests/sealed_entry.rs:78-102`; `tests/brot/sealed-entry.test.ts:124`, `:175` |
| The 10% inside the vault's books, or the creator share's base | The fee never enters the vault (`sponsor_join_campaign.rs:127-128`); the vault's assertion and I1/I15 count entry parts only; the share's base holds entry parts (I12) | `tests/brot/sealed-entry.test.ts:31`; `tests/brot/invariant-sealed-checks.ts:76-85` |
| A sealed entry made late, after a touch the sponsored account does not show yet | Its 90% comes back whole as any late entry's; Brot keeps its 10% (the founder's answer, §6) | `tests/brot/sealed-late.test.ts:38` |

## 6. Accepted risks (the founder's decisions)

| Risk | Decision and source | What is left |
|---|---|---|
| **No cap**, global or per campaign: a bug's loss has no ceiling | D-h (`session-log/2026-10-08-decisoes-do-fundador-bp-v0.0.4.md:20`; TP §13, first row; `docs/sprints/sprint-18-mainnet.md:104-105`) | Both audits, the multisig, the pause, the exposure alert (off-chain) |
| **No accepted-account list**: any account a reader accepts can back a campaign, a worthless token included | D-i (`session-log/2026-10-08-decisoes-do-fundador-bp-v0.0.4.md:20`; TP §3.4.10 "What the checks do not stop"); narrowed for the price kind by the compiled feed list (TP §14.2, answer 1) | The US$500 opening, the automatic notice, the indexer's creator flag, unlisting (off-chain) |
| **A creator who controls the measured account forces the outcome** (burn, lock, stake, curve) | TP §3.4.10 "What the checks do not stop"; TP §13, third row; `docs/sprints/sprint-18-mainnet.md:107-109`. Alone on the forced side, the creator's net cost is about US$50, so forcing pays once `0.9 × X > 50` (X ≈ US$56 of third-party money) **[INF, TP]** | The notice; the creator may join their own campaign and nothing blocks it (BR-26) |
| **YES can be bought** on fact kinds (pay the rest of a curve, lock liquidity, burn supply) | DBC M-6 (`docs/technical/meteora-readers-plan.md:20`); the same for burn and lock | The campaign page says so; DBC does not open on mainnet |
| **Self-referral** (Sprint 14): possible, its gain capped | TP §3.4.11 ("Self-referral is possible and its gain has a ceiling"); `docs/sprints/sprint-14-referral-second-read.md:100-101` ("isso memso", P1 §3.9) | On-chain only the zero address and the referee itself are refused; the off-chain routine's ceiling (§5.17) |
| **A recorded YES or NO is corrected only through the contest**: a team key never voids it in the window; since Sprint 14 a team key contests it and the admin may void it at stage 2, never invert it | Decision of 2026-10-09 (TP §3.4.18; `src/instructions/resolution/void_reason.rs:33-42`); TP §3.4.7 | A wrong YES or NO nobody contests inside its six hours stands (SCOPE G-3, which also lists the TP rows that still assume a team void) |
| **One team key can hold a payout up to 72 hours** (contest, then escalate) | The founder's answer to S14-D2, 2026-10-13 (TP §3.4.7, "Why stage 1 waits"; TP §3.4.9, `docs/technical/TECHNICAL-PLAN.md:776`; `docs/sprints/sprint-14-referral-second-read.md:105-107`) | 78 hours from the resolution at most, enforced on-chain (§5.16); the powers page says so (`content/powers.md:29`) |
| **With a team key's contest, the admin can void a correct result** | TP §3.4.9 (`docs/technical/TECHNICAL-PLAN.md:776`); `content/powers.md:30` | Never an inversion; the void's reason moves the 10% (§5.16) |
| **A matching re-read after stage 1's 24 hours pays the stored result**, even one a transaction built (a swap, then the re-read) | The founder's answer (a) to S14-D2: the 24-hour wait, during which a team key may escalate (`docs/sprints/sprint-14-referral-second-read.md:205-211`) | A re-read never writes a result, so at worst the stored result is paid (§5.16) |
| **A late sealed entry's 10% is kept** (its 90% comes back whole) | The founder's answer of 2026-10-13 (TP §14.2 S15-L1, `docs/technical/TECHNICAL-PLAN.md:2644`; `docs/sprints/sprint-15-sponsorship.md:82-83`) | Pinned by `tests/brot/sealed-late.test.ts:38` |
| **The upgrade authority can replace the program** | TP §3.4.9, last row; `content/powers.md` | The 2-of-3 multisig with a public wait; a verifiable build |

Not accepted, still open: **prize harvesting** (SCOPE O-1; TP §14.2: a rule before mainnet).

## 7. Open items

The threats this model leaves open are listed, with code references, in `SCOPE.md` §17: O-1 (prize harvesting), O-2
(the join's return floor in a lopsided pot, the sealed entry's too), O-4 (id reuse after close), O-5 (a reserve paid at
close appears in no event), G-3 (a YES or NO corrected only through the contest), G-4 (unbounded free openings and
contests by a team key), G-12 (the team key's and the admin's choice of the 10%), S-1 (readers that take transaction
version 0 only, off-chain), S-2 (a moved cut-off keeps the first proof's price), S-3 (a rent rise and the branch's close
check), and the unverified Pyth receiver controller (§4.1). O-3 (the YES-proof cut-off and partial tallies), G-10 (I10′
coverage) and G-16 (`tally_late_joins` through the program) are closed on the pre-freeze branch (PR #93), not on `main`
yet.
