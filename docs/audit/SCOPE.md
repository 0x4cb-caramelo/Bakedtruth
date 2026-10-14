# Brot Markets — audit scope

**Status:** draft for the Sprint 16 freeze, written on 2026-10-13 against `main` at `395efa5`, and brought up to date
the same day for Sprints 14 and 15 (PRs #89 and #92): every `file:line` now points at `main` at `8af10e2`. Sprint 16's
pre-freeze hardening is PR #93 (branch `sprint-16-prefreeze`, head `fcedeaf`, CI green, open and **not on `main`
yet**: seven program and test commits on `a1e9c97`, whose program and mutation script equal `8af10e2`'s, then `main`
merged in and the records); where it changes a rule, the text says so and names the commit. "The branch" below is
that PR. Error codes are `BrotError` values (`src/error.rs`), returned as `ProgramError::Custom(code)`
(`src/error.rs:368-372`). "TP" is `docs/technical/TECHNICAL-PLAN.md`. **[to verify]** marks what nobody has checked.

**Paths.** `src/…`, `Cargo.toml` and the Rust test files `tests/<name>.rs` are under `programs/brot-markets/`; every
other path (`tests/brot/`, `tests/sdk/`, `tests/fixtures/`, `tests/programs/`, `scripts/`, `services/`, `docs/`,
`.github/`, `knowledge-base/`, `content/`, `packages/`) starts at the repository root. A shorter path such as
`open_campaign/payment.rs`, `join_core.rs` or `settlement/rules.rs` names a file under `src/instructions/`; a bare
Rust file name is used only when the crate has one file of that name; a bare `….ts` test name is under `tests/brot/`.
`:N` repeats the file just named. `file.rs::name` names a function, type or constant of that file, without a line:
the form used for the five paths the pre-freeze hardening rewrites, `settlement/tally_late_joins.rs`,
`settlement/bookkeeping.rs`, `settlement/collect_fee/` (`amount.rs`, `moves.rs`), `resolution/resolve_campaign.rs`
with `resolution/resolve_campaign/`, and `src/math/invariant.rs`. The branch also edits `close_campaign.rs`,
`collect_fee.rs`, `settle_entry.rs`, `settle_creator_share.rs`, `settle_prize.rs`, the end of `src/error.rs` and
`scripts/checks-mutation.mjs`: their lines below are `8af10e2`'s and move when it merges (README, "Before sending").

Contents: 1 What the firms read · 2 Accounts · 3 Instructions · 4 Opening · 5 Creation parameters · 6 Readers ·
7 Entries · 8 Resolution · 9 Review window · 10 Settlement · 11 Money math · 12 `VoidReason` · 13 `checks` and stored-key
comparisons · 14 Config, powers, pause · 15 Events · 16 Invariants · 17 Known open items · 18 Sprint 14: the referral
link and the contest · 19 Sprint 15: the sealed entry · 20 Out of scope.

## 1. What the firms read

- **The crate** `brot-markets` (`Cargo.toml:1-64`): all of `src/` (117 files, 11,703 lines at `8af10e2`). It links
  `pinocchio =0.11.2`, `pinocchio-system =0.6.1` (`Cargo.toml:30-31`), `shank =0.4.9` (attributes only, `:34`) and
  `thiserror =2.0.21` (the error enum's derive, never called on-chain, `:38`). Clippy denies unchecked arithmetic and
  truncating or sign-losing casts (`Cargo.toml:60-63`); the release profile keeps `overflow-checks = true`
  (root `Cargo.toml:13-14`). `PINOCCHIO.md` covers the library itself.
- **The binary**: built with the `mainnet` feature only (`Cargo.toml:22`). `drill` (`:19`, devnet-only short windows)
  and `stake-at-least` (`:25`) cannot be combined with it (`src/constants.rs:147-150`, `:173-174`). In code, `mainnet`
  changes two things: the feed list (`src/feeds.rs:33-37`, `:53-118`) and `DBC_GRADUATED_OPENS`
  (`src/instructions/campaigns/open_campaign/rules.rs:27`). The time constants depend on `drill` alone
  (`src/constants.rs:176-203`); by refusing `drill`, `mainnet` guarantees the real ones, the same values as the default
  build. The contest's 24 and 48 hours are the same in every build, `drill` included (`src/constants.rs:169-171`).
  These are all the feature gates in `src/`. Since Sprint 16's CI (PR #87) every run builds the `mainnet` variant, runs
  the host and Mollusk tests on it, and publishes it from `main` after two identical verifiable builds (README, note 1;
  G-8 closed).
- **Compiled but not opening on mainnet.** `StakeAtLeast` opens only with `stake-at-least`
  (`open_campaign/rules.rs:23`, `:32-43`), which `mainnet` refuses; `DbcGraduated` opens in every build but `mainnet`
  (`:27`). Both readers stay in the binary, reachable through the resolution and join dispatch (`src/readers/mod.rs:116-137`)
  for campaigns that exist; on a fresh mainnet deploy no such campaign can exist. The firms are asked to review the
  row 1 gate (§4) in any case. Reviewing the two readers as well would let the founder turn them on later, but turning
  either on is a code change (a constant), so a new build and a new review in any case (meteora-readers-plan M-7,
  `docs/technical/meteora-readers-plan.md:21`).
- **Not in the program:** the test-only `tests/programs/cpi-proxy` (never deployed; it forwards one instruction by CPI
  to prove `resolve_campaign` refuses it). Everything off-chain: §20.

## 2. Accounts

Every account the program owns starts with a one-byte tag and a one-byte layout version (`src/state/mod.rs:29-45`), has
a fixed little-endian layout of alignment 1 read in place (`src/layout.rs:73-122`), and is loaded owner first, then exact
length, tag, version, then the PDA re-derived from its stored bump (`src/state/mod.rs:56-91`). `state::init` refuses an
account that already carries a tag or version (`src/state/mod.rs:97-112`). Enums are stored as `u8` and decoded with a
refusal for any other byte (`src/state/enums.rs:139-174`).

| Account | Seeds | Size, tag | Layout | Created by, rent paid by | Closed by |
|---|---|---|---|---|---|
| `GlobalConfig` | `["config"]` | 400 bytes, tag 1 | `src/state/config.rs:71-100` | `admin_initialize_config`, the upgrade authority | never |
| Fee vault | `["fee_vault"]`, bump kept in the config | data-less | `src/state/config.rs:77-78` | `admin_initialize_config`, the upgrade authority | never; `sweep_fees` keeps its rent |
| `Campaign` | `["campaign", id u64 LE]`, `id` chosen by the client | 512 bytes, tag 2 | `src/state/campaign.rs:20-179`; Sprint 15 took its last four spare bytes for `sealed_fees_open` (`:171-174`) | `user_open_campaign`, the creator (`rent_payer`) | `close_campaign` |
| Campaign vault | `["vault", campaign]`, bump kept in the campaign | data-less | `src/state/campaign.rs:26` | `user_open_campaign`, the creator | `close_campaign` |
| `Entry` | `["entry", campaign, baker]` | 116 bytes, tag 3 | `src/state/entry.rs:16-49` | the baker's first `user_join_campaign` or `sponsor_join_campaign` (one `Entry` per wallet, both shared), the baker | `settle_entry` |
| `Join` | `["join", campaign, baker, index u32 LE]` | 96 bytes, tag 5 | `src/state/join.rs:16-40` | every `user_join_campaign` and `sponsor_join_campaign`, the baker | `tally_late_joins` (its rent moves into the `Entry`) |
| `ReferralLink` (Sprint 14) | `["referral", referee]` | 96 bytes, tag 4 | `src/state/referral.rs:16-35` | `user_link_referrer`, the referee | never: no instruction changes or closes it (§18.1) |
| `SealedFee` (Sprint 15) | `["sealed", campaign, sponsor]` | 112 bytes, tag 6 | `src/state/sealed_fee.rs:16-40` | the sponsor's first `sponsor_join_campaign` on the campaign, the sponsor; later sealed entries top it up | `settle_sealed_fee` (its rent back to the sponsor, §19.3) |

Seeds: `src/constants.rs:16-34`. The event authority `["__event_authority"]` is a constant with its bump
(`src/constants.rs:36-39`). Every layout's size and alignment are asserted at compile time by `zero_copy!`
(`src/layout.rs:113-120`); `tests/layout.rs:35-41` pins the Sprint 02 sizes (`GlobalConfig`, `Campaign`, `Entry`,
`CreationParams`), and `tests/brot/idl.test.ts:209-219` checks all six accounts against hand-written layouts.

## 3. Instructions

The IDL lists 27 instructions (`packages/sdk/src/idl/brot_markets.json`; discriminators 0–26). The first byte of the
instruction data is the discriminator (`src/entrypoint.rs:20-95`, `src/instructions/mod.rs:27-58`); the rest must be
exactly the argument layout (`src/instructions/mod.rs:61-72`, `BadInstructionData` 6021). Every instruction ends its
accounts with the event authority and the program (§15). Accounts after the listed ones are ignored, except the DBC
config of `user_open_campaign` and the `Join` accounts of `tally_late_joins`. Sprints 14 and 15 appended 22–26 and gave
13 its one-byte argument; no earlier discriminator, account list or argument layout changed.

| # | Instruction | Handler | Signer | Accounts | Args (bytes) | Event(s) |
|---|---|---|---|---|---|---|
| 0 | `admin_initialize_config` | `src/instructions/admin/initialize_config.rs:41-105` | the upgrade authority | 7 | 134 | `ConfigInitialized` |
| 1 | `admin_set_team` | `admin/set_team.rs:60-81` | `admin` | 4 | 161 | `ConfigChanged` |
| 2 | `admin_set_creation_params` | `admin/set_creation_params.rs:24-55` | `admin` | 4 | 70 | `ConfigChanged` |
| 3 | `admin_set_fee_recipient` | `admin/set_fee_recipient.rs:32-53` | `admin` | 4 | 32 | `ConfigChanged` |
| 4 | `admin_transfer_admin` | `admin/transfer_admin.rs:30-50` | `admin` | 4 | 32 | `ConfigChanged` |
| 5 | `admin_accept_admin` | `admin/accept_admin.rs:20-44` | `pending_admin` | 4 | 0 | `ConfigChanged` |
| 6 | `team_pause_entries` | `admin/pause_entries.rs:17-44` | a team key | 4 | 0 | `EntriesPaused` |
| 7 | `admin_resume_entries` | `admin/resume_entries.rs:16-39` | `admin` | 4 | 0 | `EntriesResumed` |
| 8 | `user_open_campaign` | `campaigns/open_campaign.rs:77-208` | any wallet, or a team key | 9 (+1 for `DbcGraduated`) | 94 | `CampaignOpened` |
| 9 | `user_join_campaign` | `entries/join_campaign.rs:51-84`, then `entries/join_core.rs:49-186` | the baker | 10 | 21 | `EntryAdded` |
| 10 | `resolve_campaign` | `resolution/resolve_campaign.rs::resolve_campaign` | nobody (any caller), top level only | 5 | 0 | `CampaignResolved` |
| 11 | `team_confirm_result` | `resolution/team_confirm_result.rs:32-77` | a team key | 5 | 0 | `ResultConfirmed`, `CampaignFinalized` |
| 12 | `team_void_campaign` | `resolution/team_void_campaign.rs:49-101` | a team key | 5 | 33 | `CampaignVoided`, `CampaignFinalized` |
| 13 | `team_open_contest(stage)` | `resolution/team_open_contest.rs:62-118` | a team key | 5 | 1 | `ContestOpened` |
| 14 | `finalize_campaign` | `settlement/finalize_campaign.rs:28-63` | nobody | 4 | 0 | `CampaignFinalized` |
| 15 | `settle_entry` | `settlement/settle_entry.rs:74-160` | nobody | 6 | 0 | `EntrySettled` |
| 16 | `settle_creator_share` | `settlement/settle_creator_share.rs:37-125` | nobody | 5 | 0 | `CreatorShareSettled` (none when reserved) |
| 17 | `collect_fee` | `settlement/collect_fee.rs:28-67` | nobody | 5 | 0 | `FeeCollected` |
| 18 | `settle_prize` | `settlement/settle_prize.rs:25-76` | nobody | 5 | 0 | `PrizeSettled` |
| 19 | `close_campaign` | `settlement/close_campaign.rs:32-110` | nobody | 6 | 0 | `CampaignClosed` |
| 20 | `sweep_fees` | `settlement/sweep_fees.rs:27-70` | nobody | 5 | 0 | `FeesSwept` |
| 21 | `tally_late_joins` | `settlement/tally_late_joins.rs::tally_late_joins` | nobody | 5 + the `Join` accounts | not read (gap G-6) | `LateTallied` |
| 22 | `user_link_referrer(referrer)` | `referral/link_referrer.rs:42-94` | the referee | 5 | 32 | `ReferralLinked` |
| 23 | `reread_campaign` | `resolution/reread_campaign.rs:78-150` | nobody (any caller), top level only | 6 | 0 | `CampaignReread`, then `CampaignFinalized` when it pays |
| 24 | `admin_decide_contest(decision, void_reason, note_hash)` | `resolution/admin_decide_contest.rs:64-116` | `admin` | 5 | 34 | `ContestClosed`, `CampaignFinalized` |
| 25 | `sponsor_join_campaign(side, entry_usd, max_lamports, min_return_bps, expected_entry_total, expected_params_version)` | `entries/sponsor_join_campaign.rs:69-154`, through `entries/join_core.rs:49-186` | the sponsor | 12 | 33 | `EntryAdded`, `SealedFeeHeld` |
| 26 | `settle_sealed_fee` | `settlement/settle_sealed_fee.rs:44-120` | nobody | 6 | 0 | `SealedFeeSettled` |
| 0xFF | event (not an instruction) | `src/events/self_cpi.rs:84-91` | the event-authority PDA, only by self-CPI | 1 | the event | — |

Handler paths in the table are under `src/instructions/`. The account lists, in order, with their roles, are in
`src/instructions/interface.rs:29-283` (the Shank source of the IDL, `packages/sdk/src/idl/brot_markets.json`).

## 4. Opening a campaign (`user_open_campaign`)

The handler runs the rows in a fixed order, each refusal with its own error (`campaigns/open_campaign.rs:8-16`): row 9
(argument size), row 1 and the canonical arguments, the feed list, the slots, row 8, the terms version, row 5, rows 2 to
4 in the reader, row 7, row 10, then the deposit, row 6 and the record. Paths below are under
`src/instructions/campaigns/`.

### 4.1 The ten rows of TP §3.4.10

| Row | Rule | Code | Error codes | Tests |
|---|---|---|---|---|
| 1 | The kind byte names one of six readers, and that kind opens in this build (`StakeAtLeast` only with `stake-at-least`; `DbcGraduated` not with `mainnet`) | `open_campaign/rules.rs:19-43`, called at `open_campaign.rs:89` | `UnknownReaderKind` 6043, `ReaderKindNotOpen` 6044 | `tests/brot/open-campaign-refuses.test.ts:21`; `tests/brot/open-campaign-kinds.test.ts:62`; `tests/open_campaign_rules.rs` (host) |
| — | Canonical arguments: a valid direction byte; a non-price kind passes a zero feed and `Above`; a kind not measured by epoch passes `epoch` 0 | `open_campaign/rules.rs:51-67`, at `open_campaign.rs:91` | `InvalidDirection` 6050, `UnusedArgumentNotZero` 6077 | `open-campaign-refuses.test.ts:28`; `open-campaign-kinds.test.ts:70` |
| 2 | The metric account fits the kind: owner, exact size, discriminator or layout, through the reader's `validate_at_creation` (§6) | `src/readers/mod.rs:100-112`, at `open_campaign.rs:132-143` | `ReaderWrongOwner` 6001, `ReaderBadLayout` 6002, `PriceNotFullyVerified` 6003, `PriceWrongFeed` 6004, `MetricAccountMismatch` 6045, `MintAuthorityLive` 6074, `StakePoolNotUpdating` 6080, `CurveHasTransferHook` 6148, `CurveConfigMismatch` 6149, `CurveNotInSol` 6150, `CurveTooSmall` 6151; `NotEnoughAccountKeys` for a DBC opening without its config | `open-campaign-refuses.test.ts:33`, `:42`; `open-campaign-kinds.test.ts:87`, `:104`, `:140`; `tests/brot/readers-dbc-adversarial.test.ts:61-97` |
| 3 | The target is not met yet and sits at least a minimum distance from the current value (per kind, §6) | price `src/readers/price_touch/target.rs:34-68`; others in each reader; distance `src/readers/shared.rs:171-187` | `TargetAlreadyTouched` 6046, `TargetTooClose` 6075, `TargetUnreachable` 6076, `TargetNotThreshold` 6152 | `open-campaign-refuses.test.ts:84`; `open-campaign-kinds.test.ts:94`, `:120`, `:145`; `readers-dbc-adversarial.test.ts:107-135`; `tests/price_target.rs` |
| 4 | Price kind: the feed is on the compiled list (checked before any account), its sponsored account is the metric account, Full, fresh by time and by slot, confidence at most 0.5% | list `src/feeds.rs:40-49` at `open_campaign/rules.rs:85-90`; account `src/readers/price_touch.rs:47-67` | `FeedNotOnList` 6141, `MetricAccountMismatch` 6045, `PriceStale` 6047, `PriceConfidenceTooWide` 6048, `PriceNonPositive` 6049, and the reader's 6001–6004 | `open-campaign-refuses.test.ts:50`, `:63`, `:69`; `tests/price_opening.rs`; `tests/feeds_list.rs` |
| 5 | `deadline_at − now` is 3 to 90 days for every kind; entries close at `deadline − clamp(5% of duration, 24 h, 7 d)`; the epoch kinds' epoch has not started and starts before the deadline | `src/math/schedule.rs:39-72` at `open_campaign.rs:124-128`; `src/readers/epoch.rs:120-148` | `DurationTooShort` 6051, `DurationTooLong` 6052, `EpochAlreadyStarted` 6078, `EpochAfterDeadline` 6079 | `open-campaign-refuses.test.ts:98`; `tests/brot/open-campaign-retry.test.ts:72`; `open-campaign-kinds.test.ts:131`; `tests/math_schedule.rs`; `tests/readers_epoch.rs` |
| 6 | Fee, one-sided fee, creator share (0 for a team key), `min_entry_lamports` and, for price, the join-time `max_age` are copied from the config; none is an argument | `open_campaign/record.rs:56-80` | none: there is no argument to refuse | `open-campaign-refuses.test.ts:106`; `tests/brot/admin-params.test.ts:69`, `:99` |
| 7 | A non-team signer pays `opening_usd ≥ opening_fee_usd` at `price − conf` of the compiled SOL/USD feed, at most `max_lamports`; a team key passing 0 pays nothing (§4.2) | `open_campaign/payment.rs:47-93`, at `open_campaign.rs:146-154` | `OpeningUsdBelowFee` 6053, `OpeningAboveMaxLamports` 6054, `SolUsdAccountMismatch` 6055, `SolUsdStale` 6056, `SolUsdConfidenceTooWide` 6057, `SolUsdPriceNonPositive` 6058, `PriceExponentOutOfRange` 6059, `SolUsdWrongOwner` 6086, `SolUsdBadLayout` 6087, `SolUsdNotFullyVerified` 6088, `SolUsdWrongFeed` 6089, `MathOverflow` 6000 | `tests/brot/open-campaign-refuses-payment.test.ts:24-97`; `tests/brot/open-campaign-paid.test.ts:50-130`; `tests/open_campaign_payment.rs`; `tests/open_h_price.rs` |
| 8 | The pause is off (team keys too); a paid opening needs `open_campaigns < max_open_campaigns`, a free team opening is outside the valve; the creator signed the current `params_version` | `open_campaign.rs:106-119`; `open_campaign/rules.rs:74-111` | `OpenWhilePaused` 6060, `TooManyOpenCampaigns` 6061, `CreationParamsChanged` 6090 | `open-campaign-refuses-payment.test.ts:103`, `:112`; `open-campaign-refuses.test.ts:117`; `tests/open_h_valve.rs:14-52` |
| 9 | No argument is text: the arguments are a fixed 94-byte layout; the sentence template is set by the program | `OpenCampaignArgs` at `open_campaign.rs:39-75`; `src/instructions/mod.rs:61-63`; template `open_campaign/record.rs:55`, `src/constants.rs:82` | `BadInstructionData` 6021 | `open-campaign-refuses.test.ts:139`; `tests/brot/open-campaign-team.test.ts:89` |
| 10 | The `Campaign` for `id` does not exist yet (the retry guard, §4.3); both accounts at canonical PDAs; a pre-funded address still opens | `open_campaign/create.rs:26-58`; `src/checks.rs:108-118`, `:132-148` | `AlreadyInitialized` 6014, `PdaMismatch` 6010, `WrongOwner` 6005 | `open-campaign-retry.test.ts:18`, `:36`, `:52`; `tests/brot/open-campaign-refuses-slots.test.ts:60` |

The slots themselves (`open_campaign.rs:96-103`): creator signer and writable, config, campaign and vault writable,
campaign ≠ vault, the System Program, the event slots; refused cases in
`tests/brot/open-campaign-refuses-slots.test.ts:26-60` and 32 slot-matrix cases (`tests/brot/slot-matrix.gen.ts:544`).
The SDK mirrors every row for the preview (`packages/sdk/src/read/validate/`) and is fed the program's own refused cases
(`tests/sdk/validate-open-*.test.ts`); that mirror is out of scope (§20) but shows the rows' intended order.

### 4.2 The Pyth-priced opening and `max_lamports` (T25)

`payment::charge` (`open_campaign/payment.rs:47-93`):

1. `opening_usd == 0`: a team key pays nothing and the SOL/USD slot is neither checked nor read; any other signer is
   refused (`:55-61`).
2. `opening_usd < opening_fee_usd` is refused, for a team key that adds a prize too (`:62-64`).
3. The SOL/USD account must be the sponsored account of the compiled `SOL_USD_FEED_ID` (`src/constants.rs:54-57`),
   derived on-chain from the push oracle, shard 0 (`src/readers/price_update.rs:118-126`), never trusted as passed
   (`payment.rs:65-69`). `GlobalConfig.params.sol_usd_feed_id` is not read (gap G-13).
4. It is read like any price account, owner first (`payment.rs:112-115`), fresh within `max_price_age` and the 60 s
   clock lead, confidence within `max_price_conf_bps` (`:71-74`, `src/readers/price_touch/rules.rs:24-62`), and posted
   within `ceil(max_price_age × 1,000 / 100)` slots (`payment.rs:75-77`, `src/readers/price_touch/rules.rs:68-74`).
5. The price charged is `price − conf` (`payment.rs:98-108`).
6. `paid = ceil(opening_usd × 10^(9 − e) ÷ (price − conf))`, exponent between −18 and 0
   (`src/math/opening.rs:45-68`); refused above `max_lamports` (`payment.rs:80-82`); the amount compared is the
   amount that moves.
7. `prize = floor(paid × opening_prize_bps ÷ 10,000)`, `opening fee = paid − prize` (`src/math/opening.rs:74-78`): the
   rounding goes to Brot.
8. All of `paid` moves into the vault by System Program transfer signed by the creator (`src/vault.rs:22-32`), after
   the campaign and vault exist, and the vault's change must equal `paid` (`open_campaign.rs:161-171`, I14).

Rent of the two new accounts is paid separately by the creator and comes back at close (I14; `rent_payer` is always the
creator, `open_campaign/record.rs:53`).

The sealed entry (Sprint 15) is charged by this same `charge`, always as a signer that is not a team key, so a zero US$
is refused too; only the floor's and the bound's error codes are renamed (`entries/sealed_charge.rs:37-68`, §19.1).

### 4.3 The retry guard on `id` (T17, A-9)

The client draws the random `id` once and saves it before signing; a retried transaction reuses it and fails on the
existing account instead of charging twice. In code: the campaign's address is the canonical PDA of
`["campaign", id]` (`open_campaign/create.rs:34-36`), and `checks::create_pda_account` refuses an address the program
already owns (`src/checks.rs:140`, `AlreadyInitialized` 6014). A non-canonical bump is refused so that a second account
cannot exist for the same seeds (`src/checks.rs:105-118`). Exact duplicates under different ids are allowed by design
(TP §3.4.10). Tested: `tests/brot/open-campaign-retry.test.ts:18` (nothing charged twice). An id is reusable after
`close_campaign` (known item O-4).

## 5. Creation parameters and their code ceilings

`admin_set_creation_params` replaces the whole `CreationParams` (`admin/set_creation_params.rs:24-55`) after
`CreationParams::validate` (`src/state/config.rs:142-193`), which `admin_initialize_config` also runs
(`admin/initialize_config.rs:65`). Each successful call raises `params_version` by one, the same values included
(`set_creation_params.rs:39-51`), so an opening previewed before it is refused (row 8). A campaign copies what it needs at
opening (row 6); the opening fee, the prize share, the valve and the SOL/USD bounds act at opening only. Nothing an admin
sets reaches an open campaign (`tests/brot/admin-params.test.ts:69-147`).

| Parameter | Range in code | Constants | Check | Error | Founder value (Sprint 16 records mainnet's) |
|---|---|---|---|---|---|
| `opening_fee_usd` (whole US$) | 1 to 5,000 | `src/constants.rs:73-74` | `src/state/config.rs:159-161` | `OpeningFeeUsdOutOfRange` 6030 | 500 |
| `opening_prize_bps` | 9,000 to 10,000 | `src/constants.rs:70`, `:62` | `src/state/config.rs:162-164` | `OpeningPrizeBpsOutOfRange` 6031 | 9,000 |
| `fee_bps` | ≤ 1,000 | `src/constants.rs:64` | `src/state/config.rs:165-167` | `FeeBpsAboveCeiling` 6032 | 1,000 |
| `one_sided_fee_bps` | ≤ 100 | `src/constants.rs:68` | `src/state/config.rs:168-170` | `OneSidedFeeBpsAboveCeiling` 6033 | 100 |
| `creator_share_bps` | ≤ 100 | `src/constants.rs:66` | `src/state/config.rs:171-173` | `CreatorShareBpsAboveCeiling` 6034 | 100 |
| `max_open_campaigns` | 1 to 10,000 | `src/constants.rs:80` | `src/state/config.rs:174-176` | `MaxOpenCampaignsOutOfRange` 6035 | 1,000 on devnet; mainnet `<<FILL AT FREEZE>>` |
| `min_entry_lamports` | 1,000,000 to 1,000,000,000 | `src/constants.rs:77-78` | `src/state/config.rs:177-179` | `MinEntryOutOfRange` 6036 | 10,000,000 |
| `sol_usd_feed_id` | not all zeros; read by nothing (gap G-13) | — | `src/state/config.rs:180-182` | `SolUsdFeedIdZero` 6037 | — |
| `max_price_age` (s) | 1 to 300 | `src/constants.rs:89` | `src/state/config.rs:183-185` | `MaxPriceAgeOutOfRange` 6038 | 120 on devnet; mainnet `<<FILL AT FREEZE>>` |
| `max_price_conf_bps` | 1 to 100 | `src/constants.rs:91` | `src/state/config.rs:186-188` | `MaxPriceConfOutOfRange` 6039 | 50 on devnet; mainnet `<<FILL AT FREEZE>>` |
| `campaign_max_age` (s) | 30 to 300 | `src/constants.rs:97`, `:99` | `src/state/config.rs:189-191` | `CampaignMaxAgeOutOfRange` 6040 | 120 on devnet; mainnet `<<FILL AT FREEZE>>` |

Every bound, one step inside and outside, is tested on the host (`tests/config_params.rs:69-192`) and through the
program (`tests/brot/admin-refusals.test.ts:77`, `:91`). The founder values are TP §3.4.1 and §14.4 C43.

**Compiled rules no admin can change** (all in `src/constants.rs` unless noted): `MAX_PRICE_CLOCK_LEAD_SECONDS` 60
(`:95`); `PRICE_CAMPAIGN_MAX_CONF_BPS` 50 (`:87`); `PRICE_TARGET_MAX_RATIO` 10 (`:103`); `MIN_SLOT_MS` 100 (`:107`);
`MIN_DISTANCE_BPS_*` 100, and 1,000 for DBC (`:135-142`); `EPOCH_START_SLOW_SLOT_MS` 500 (`:145`);
`PROOF_DELAY_SECONDS` 60 (`:163`); `STALE_FEED_MIN_SECONDS` 600 (`:168`); `MAX_DURATION_SECONDS` 90 days (`:157`);
`MIN_DURATION_SECONDS` 3 days, `REVIEW_WINDOW_SECONDS` 6 h, `ENTRY_CLOSE_MIN_SECONDS` 24 h (`:176-184`; drill values
`:186-195`); `ENTRY_CLOSE_BPS` 500 and `ENTRY_CLOSE_MAX_SECONDS` 7 days (`:159-161`); `DBC_MIN_GRADUATION_LAMPORTS`
85 SOL (`:197-203`); `JOIN_BUFFER_BPS` 100 (`src/instructions/entries/join_rules.rs:29`); `SOL_USD_FEED_ID`
(`src/constants.rs:54-57`); the feed lists (`src/feeds.rs:54-118` mainnet, `:123-141` devnet). The mainnet time values are checked by
`tests/math_schedule.rs:132-140`, which compiles only with `mainnet` (CI `ci.yml:176-182`, on the mainnet binary since Sprint 16).

**Initialization** (`admin/initialize_config.rs:41-105`): only the program's upgrade authority, read from its loader
v3 ProgramData account (`src/checks/upgrade.rs:17-44`), signs, pays both rents and chooses the first `admin` and
`fee_recipient` (both non-zero, `admin/initialize_config.rs:62-64`) and the parameters. Deploy and initialize happen in one session (TP §7;
Sprint 18). The mainnet arguments are part of what the firms should see (README, release block).

## 6. The six reader kinds

`ReaderKind` is closed (`src/state/enums.rs:18-27`); dispatch is a `match` per entry point
(`src/readers/mod.rs:100-137`). Each reader checks the owner before reading a byte, then an exact size and a
discriminator or layout, and returns an error, never a panic (`src/readers/mod.rs:8-11`); variable layouts are read
through the bounds-checked `Cursor` (`src/readers/cursor.rs:13-99`, tested in `tests/cursor.rs`). Readers are tested
on real mainnet bytes (`tests/fixtures/`, SHA-256 pinned in `tests/fixtures/index.json`).

| Byte | Kind | Owner checked | Account check | Row 3 | Join lock (`outcome_knowable`) | Resolution (`try_resolve`) | Opens on mainnet | Host tests |
|---|---|---|---|---|---|---|---|---|
| 0 | `PriceTouch` | Pyth receiver `rec2HH…` (`src/constants.rs:47`) | 134 bytes, discriminator, `Full`, the feed id (`src/readers/price_update.rs:58-100`); the sponsored PDA of the feed (`:118-126`) | `price_touch/target.rs:34-68` | `src/readers/price_touch.rs:76-94`, plus the buffer (§7) | `price_touch/proof.rs:51-131` | yes; feed list of 63 (`src/feeds.rs:54-118`) | `tests/price_reader.rs`, `price_opening.rs`, `price_join.rs`, `price_proof.rs`, `price_stale_feed.rs`, `price_target.rs`, `price_math.rs` |
| 1 | `SupplyAtMost` | classic SPL Token (`src/constants.rs:112`); Token-2022 refused | 82 bytes, `COption` tags 0 or 1, initialized, mint authority revoked (`src/readers/spl_mint.rs:48-69`, `:86-90`) | `spl_mint.rs:91-103` | supply ≤ target (`:109-111`) | `fact_resolution` (`:115-118`, `src/readers/shared.rs:103-126`) | yes | `tests/readers_spl_mint.rs` |
| 2 | `DammV2LockedAtLeast` | Meteora DAMM v2 `cpamdpZC…` (`src/constants.rs:116`) | 1,112 bytes, `Pool` discriminator, `permanent_lock_liquidity` at 552 (`src/readers/damm_v2.rs:48-69`) | `damm_v2.rs:78-90` | locked ≥ target (`:94-96`) | `fact_resolution` (`:100-103`) | yes | `tests/readers_damm_v2.rs` |
| 3 | `StakePoolTvlAtLeast { epoch }` | SPL Stake Pool `SPoo1Ku8…` (`src/constants.rs:123`) | `account_type` 1 and a Borsh walk to `last_epoch_total_lamports` (`src/readers/stake_pool.rs:65-116`); a pool more than one epoch behind is refused (`:128-130`) | `stake_pool.rs:133-142` | the measured epoch has started (`:149-151`) | the epoch snapshot, `MissedWindow` otherwise (`:158-190`) | yes | `tests/readers_stake_pool.rs`, `readers_epoch.rs` |
| 4 | `StakeAtLeast { epoch }` | Vote program (`src/constants.rs:125`) | a known version at its exact size, initialized (`src/readers/vote_stake.rs:57-87`); stake from `sol_get_epoch_stake` (`:91-95`) | `vote_stake.rs:128-137` | the measured epoch has started (`:144-146`) | in the epoch only, `MissedWindow` otherwise (`:153-174`) | **no**: `stake-at-least` is refused with `mainnet` | `tests/readers_vote_stake.rs`; YES only in Mollusk, `tests/stake_at_least_mollusk.rs` |
| 5 | `DbcGraduated` | Meteora DBC `dbcij3LW…` (`src/constants.rs:119`) | 424-byte `VirtualPool`, `TransferHookPool` refused (`src/readers/dbc_graduation.rs:88-118`); its own `PoolConfig` passed after the nine slots, priced in wSOL, threshold ≥ 85 SOL (`dbc_graduation/config.rs:43-80`) | target = threshold, curve not completed, ≥ 10% missing (`dbc_graduation.rs:135-152`) | stage ≥ 1 (`:157-159`) | `stamped_resolution` on `finish_curve_timestamp` (`:163-165`, `src/readers/shared.rs:141-165`) | **no**: `DBC_GRADUATED_OPENS` is false with `mainnet` | `tests/readers_dbc.rs`, `readers_dbc_opening.rs`, `readers_dbc_target.rs`, `readers_dbc_resolve.rs` |

Through the program in LiteSVM: `tests/brot/readers-price.test.ts`, `readers-facts.test.ts`, `readers-epoch.test.ts`,
`readers-dbc.test.ts`, `readers-dbc-adversarial.test.ts`, `resolve-campaign.test.ts`, `join-campaign-lock.test.ts`.
On a Surfpool mainnet fork in CI: `scripts/surfpool/price-touch.ts`; by hand, the DBC cycle
`scripts/surfpool/dbc-graduation.ts`.

**The price kind reads three accounts at three moments** (TP §3.4.8): at opening, only the feed's sponsored account
(`price_touch.rs:48-50`); at a join, only the stored `metric_account` (`join_core.rs:86-88`), which is that
sponsored account; at resolution, a YES proof from **any** Full account of the feed (`proof.rs:79-103`), so a newer
update pushed into the sponsored account cannot erase a touch, and after the proof window only the sponsored account
(`proof.rs:111-131`).

## 7. Entries (`user_join_campaign`, and the join core the sealed entry shares)

Since Sprint 15 the join's checks live in two files that `user_join_campaign` and `sponsor_join_campaign` (§19) both
call, moved out of `join_campaign.rs` with their order, errors and effects unchanged (`entries/join_campaign.rs:9-15`;
`join_core.rs:1-17`; `join_slots.rs:1-6`). `join_campaign.rs` reads the arguments, the ten slots and the side byte
(`:56-63`), runs the slot checks (`join_slots.rs:49-61`), then the core with the signed amount (`join_campaign.rs:83`).
Order inside the core (`join_core.rs:9-17`): the config, read for the pause and the creation parameters (`:69-76`); the
campaign and its vault (`:79-82`); the metric account is the stored one (`:86-88`, `MetricAccountMismatch`); then the
rules below; then the entry, the join record, the deposit and the books. The caller names the amount only after the
pause (`amount_of`, `:103`): the signed `amount` for a plain join, the sealed entry's charge for a sponsor (§19.1), so a
sealed entry meets every rule of the table, the campaign's minimum included. Paths under `src/instructions/entries/`.

| Rule | Code | Error | Tests |
|---|---|---|---|
| `Open` | `join_core.rs:90-92` | `CampaignNotOpen` 6062 | `tests/brot/join-campaign-refuses.test.ts:33` |
| Before `entries_close_at` (one clock read for this and the lock) | `join_core.rs:94-97` | `EntriesClosed` 6063 | `join-campaign-refuses.test.ts:44` |
| The join lock: the outcome is not knowable yet (§6), or the reader's own error | `join_lock.rs:47-66` | `OutcomeKnowable` 6073, `JoinPriceStale` 6082, `PriceExponentChanged` 6081, reader errors | `tests/brot/join-campaign-lock.test.ts:58-189`; `tests/brot/join-campaign-price.test.ts:35-88` |
| The proximity buffer (price): the sponsored band edge is at least 1% of the price from the target | `join_lock.rs:70-78`; `join_rules.rs:43-62` | `JoinBufferRefused` 6131 | `tests/join_host_buffer.rs:29-152`; `join-campaign-lock.test.ts:64` |
| The pause is off | `join_core.rs:100-102` | `JoinWhilePaused` 6064 | `join-campaign-refuses.test.ts:58`; `tests/brot/join-campaign-pot.test.ts:62` |
| `amount ≥` the campaign's own `min_entry_lamports`, copied at opening | `join_core.rs:104`; `join_rules.rs:32-37` | `BelowCampaignMinEntry` 6132 | `join-campaign-refuses.test.ts:65`; `tests/join_host_min_entry.rs` |
| `expected_entry_total` equals the baker's entry before this join (0 creates the `Entry`): a retried join fails instead of doubling (T10, A-9) | `entry_account.rs:58-105` | `EntryTotalMismatch` 6066, `EntryMismatch` 6069, `PdaMismatch` 6010 | `join-campaign-refuses.test.ts:73`, `:129` |
| The return estimate is at least the signed `min_return_bps` | `join_core.rs:132-144`; `src/math/payout.rs:131-151` | `ReturnBelowMinimum` 6067 | `join-campaign-refuses.test.ts:92`; `tests/math_estimate_properties.rs` (see O-2) |
| The side byte is YES or NO | `join_campaign.rs:63` | `InvalidSide` 6068 | `join-campaign-refuses.test.ts:108` |

Effects: the first join creates the `Entry` at its canonical PDA with the baker's rent (`entry_account.rs:79-105`) and
counts it in `entries_open` and `entries_untallied` (`join_core.rs:107-117`); the wallet whose join lands in an empty
pot (by the books) becomes `first_baker`, exempt from the one-sided fee on its whole entry (`:121-125`); every join
creates a `Join` record at `["join", campaign, baker, join_count]` with the baker's rent (`join_record.rs:92-124`,
`:148-167`); the amount moves by System Program transfer and the vault's change must equal it (`join_core.rs:161-164`);
the books follow (`:165-169`). No instruction moves an entry out before settlement (no exit, BR-12). Two wallets: A cannot
change, close or redirect B's `Entry` (`tests/brot/join-campaign-wallets.test.ts:19`). Slot refusals:
`tests/brot/join-campaign-slots.test.ts:22-59` and 43 slot-matrix cases. The move into the two files changed no plain-join
test (`docs/sprints/sprint-15-sponsorship.md:144-145`).

**Late joins** (price kind, YES only): a join at or after the YES proof's `publish_time` is refunded whole, neither paid
as a winner nor charged as a loser (`join_tally.rs:21-44`; `src/instructions/settlement/rules.rs:46-97`). Tests:
`tests/brot/late-entries.test.ts:27`, `tests/join_host_tally.rs`, `tests/brot/invariant-rules.test.ts:138-177`. The
classification happens at the tally (§10); on the pre-freeze branch the tally of a YES price result waits until its
proof is more than 60 s old, when the cut-off can no longer move (O-3, closed there by `b1650fb`). A late sealed entry
gets its 90% back the same way, and Brot keeps its 10% (§19.4).

## 8. Resolution (`resolve_campaign`)

Any wallet; it chooses nothing but the proof account it offers (the module note of `resolution/resolve_campaign.rs`).
Order, all in `resolve_campaign.rs::resolve_campaign`: no arguments; five slots; `checks::top_level` before any account
is read (`ResolveNotTopLevel` 6071; since Sprint 14 the caller passes its error, `src/checks/top_level.rs:17-21`); the
campaign writable and loaded; status `Open`, or `InReview` for a re-proof (`CampaignNotOpen` 6062); the metric account
is the stored one (`MetricAccountMismatch` 6045); the reader decides (`NotResolvableYet` 6072 for `NotYet`);
`resolve_campaign/record.rs::write` stores `InReview`, the outcome, the void reason, `met_late`, `observed_value`,
`resolved_at`, `review_ends_at = now + 6 h` and, for price, the YES proof's `publish_time`
(`resolve_campaign/record.rs::stored_publish_time`). No lamport moves. A caller with no proof passes the program's own address in the
proof slot (the `no_proof` test in `resolve_campaign`). The contest's re-read runs the same readers on the stored campaign
but never writes a result (§18.3).

| Family | Before the deadline | After the deadline | Code |
|---|---|---|---|
| Irreversible fact (`SupplyAtMost`, `DammV2LockedAtLeast`) | met: YES; not met: `NotResolvableYet`; unreadable: refused | NO, `met_late` if met; unreadable: `Void(UnreadableAccount)` | `src/readers/shared.rs:103-126` |
| Stamped fact (`DbcGraduated`) | completed: YES; else `NotResolvableYet` | completed with a stamp at or before the deadline: YES; later or no stamp: NO `met_late`; not completed: NO; unreadable: void | `src/readers/shared.rs:141-165` |
| Epoch snapshot (`StakePoolTvlAtLeast`, `StakeAtLeast`) | in the measured epoch: YES or NO | epoch missed: `Void(MissedWindow)`; unreadable: `Void(UnreadableAccount)` | `src/readers/stake_pool.rs:158-190`; `src/readers/vote_stake.rs:153-174` |
| Price touch | up to D + 60 s: only a YES proof; without one, `NotResolvableYet` | after D + 60 s: NO; `Void(StaleFeed)` when the sponsored `publish_time ≤ D` and `< D − max(max_age, 600 s)`; unreadable or changed exponent: `Void(UnreadableAccount)` | `src/readers/price_touch/proof.rs:51-131` |

The YES proof (`proof.rs:79-103`): Full update of the feed at any address, the stored exponent
(`PriceExponentChanged` 6081), a positive price (`PriceNonPositive` 6049), `publish_time` inside `[opens_at, deadline]`
(`ProofOutsideWindow` 6083), at most 60 s old and 60 s ahead, posted within 600 slots (`ProofStale` 6084), and the whole
confidence band past the target (`ProofDoesNotTouch` 6085). **`StaleFeed`** rests on the push oracle never writing an
older update into the sponsored account (`proof.rs:14-33`; `knowledge-base/tecnologia/pyth-leitor-de-preco.md:268-310`).

**The re-proof (cut-off move).** A YES price campaign in review may move `publish_time` back to an earlier valid YES
proof, only while no entry is fully tallied (`entries_untallied == entries_open`); outcome and window stay (the two
`CutoffNotMovable` 6147 tests in `resolve_campaign.rs::resolve_campaign`; `resolve_campaign/record.rs::move_cutoff`). A
partial tally did not lock it (O-3); on the pre-freeze branch the tally of a YES price result waits until its proof is
more than 60 s old, and from then on no earlier proof is young enough to be accepted, so the cut-off is final before any
join is classified (`tally_late_joins.rs::require_cutoff_final`, `CutoffNotFinal` 6178, commit `b1650fb`, on `main` since
PR #93). On the follow-up branch a move also stores the earlier proof's price (`observed_value`, the review's F3,
`addf462`), so its `CampaignResolved` pairs that proof's account and time with its own price.

Tests: `tests/brot/resolve-campaign.test.ts:45-154` (the table, row by row), `tests/brot/resolve-refuses.test.ts:52-133`
(top level, every refusal), `tests/brot/price-proof.test.ts:47-134`, `tests/brot/cutoff-reproof.test.ts:21`,
`tests/resolve_record.rs`, `tests/price_proof.rs`, `tests/price_stale_feed.rs`.

## 9. The review window

A team key confirms, voids or opens a contest only while the campaign is `InReview` and before `review_ends_at`
(`resolution/window.rs:11-30`; `TeamKeyOutsideReview` 6091, `OutsideReviewWindow` 6092, `ContestOutsideReview` 6095 for
the contest; the instant it ends is closed); its one later act is the escalation of its own contest (§18.2). After the
window, any wallet finalizes (§10).

| Instruction | What it does | Code | Errors | Tests |
|---|---|---|---|---|
| `team_confirm_result` | Ends the window now; the outcome stands; runs the snapshot at once (`Settling`, or `Settled` with no entry) and emits `ResultConfirmed` then `CampaignFinalized` | `resolution/team_confirm_result.rs:32-77` | `NotTeamMember` 6023, the window's, `NotTallied` 6114, the snapshot's | `tests/brot/team-window.test.ts:128-164`, `:177`; `tests/brot/team-window-events.test.ts:61` |
| `team_void_campaign(reason, note_hash)` | Only an **automatic** void (stored outcome `Void`): records the team's reason and note hash, runs the snapshot in `Refund`. A YES or NO is never voided by a person | `resolution/team_void_campaign.rs:49-101`; `void_reason.rs:23-42` | `TeamVoidNotAutomatic` 6097, `VoidReasonNotForTeam` 6094, `BadInstructionData` 6021 for a reason byte past the enum, the window's | `team-window.test.ts:57-126`; `team-window-events.test.ts:88`; `tests/team_window_void_reasons.rs` |
| `team_open_contest(stage)` | Since Sprint 14. Stage 1 contests the result inside the window, once every entry is tallied: `Contested`, the payout paused for stage 1's 24 hours. Stage 2 sends a contest still at stage 1 to the admin. The result is never touched (§18.2) | `resolution/team_open_contest.rs:62-118` | §18.2 | §18.2 |

The status moves of the team instructions go through the transition table (`src/state/transitions.rs:14-35`;
`team_confirm_result.rs:60`; `team_void_campaign.rs:81`; `team_open_contest.rs:103`; the snapshot's at
`settlement/snapshot.rs:96`), checked over all 25 status pairs in `tests/state_transitions.rs:19-53` (eight edges since
Sprint 14 added `Contested` → `Settled`). Consequence auditors should keep in mind: in the window a team key confirms or
re-labels an automatic void, never changes a YES or NO; since Sprint 14 a contested YES or NO can be voided by the
admin at stage 2, never inverted (§18.4; gap G-3).

## 10. Settlement, payouts and the reserve path

Order a keeper follows: `tally_late_joins` for every baker → `finalize_campaign` (or a team confirm or void, or one of
a contest's exits, §18) → `settle_entry` for every `Entry` → `settle_creator_share` → `collect_fee` → `settle_prize` →
`settle_sealed_fee` for every `SealedFee` (§19) → `close_campaign` → `sweep_fees` (TP §3.4.5, §3.4.19). Every one is
permissionless and chooses nothing: amounts come from the snapshot or the books, destinations are stored keys or the fee
vault. Paths under `src/instructions/settlement/`. **On the pre-freeze branch** (not on `main`): the tally waits for a
final cut-off and checks its `Join` slots (`b1650fb`, `c91b3eb`), and every paying instruction asserts the vault's
change against its books (`af198a7`, below the table).

| Instruction | Gate | Effect | Code | Errors | Tests |
|---|---|---|---|---|---|
| `tally_late_joins` | `InReview`; the `Join` accounts passed in index order from `joins_tallied`. Branch: on a YES price result, only once `now > publish_time + 60 s`; each `Join` slot writable and none of the three named slots | Reads and closes each `Join` (owner, length, tag, campaign, baker, index, PDA), moves its rent into the `Entry`, adds late amounts (YES price only) to entry and campaign; decrements `entries_untallied` when the entry's last join is closed | `tally_late_joins.rs::tally_late_joins`; branch: `::require_cutoff_final`, `::check_join_slots`; `src/instructions/entries/join_tally.rs:60-78`; `src/instructions/entries/join_record.rs:40-76` | `TallyNotReady` 6134, `EntryAlreadyTallied` 6135, `JoinAccountsMismatch` 6133, `EntryMismatch` 6069; branch: `CutoffNotFinal` 6178, `NotWritable` 6007, `DuplicateAccount` 6015 | `tests/join_host_tally.rs`; `tests/join_host_record.rs`; randomized run (`tests/brot/invariant-window.ts:47-56`, all of a baker's joins at once); 22 slot-matrix cases. Branch: `tests/brot/prefreeze-tally-refusals.test.ts` (each refusal through the program, G-16), `tests/brot/prefreeze-partial-tally.test.ts`, `tests/prefreeze_tally.rs`, 31 slot-matrix cases |
| `finalize_campaign` | `InReview` with `now ≥ review_ends_at`, or `Contested` once its contest lapsed (§18.5); every entry tallied | The snapshot (§11): mode, totals, fee, creator share, `distributable`; `Settling`, or `Settled` with no entry; decrements `open_campaigns` for a paid campaign (I7) | `finalize_campaign.rs:28-63`; the lapse `resolution/contest_rules.rs:146-175`; `settlement/snapshot.rs:76-124` | `CampaignNotInReview` 6116, `ReviewNotEnded` 6117, `ContestNotLapsed` 6163, `NotTallied` 6114, `NoProofTime` 6115, `IllegalTransition` 6146, `SnapshotInconsistent` 6102, `InvariantViolated` 6101 | `tests/settle_host_finalize.rs:48-236`; `tests/brot/invariant-program.test.ts:204`; the lapse: `tests/contest_mollusk_decide.rs:150-205`, `tests/brot/contest-decide.test.ts:181` |
| `settle_entry` | `Settling`; the entry's joins all tallied | Pays the entry its amount under the mode, credits the `Entry`'s lamports (its rent, the joins' rents) to the stored baker, closes the `Entry`; the last one moves the campaign to `Settled` | `settle_entry.rs:74-160`; `settlement/rules.rs:50-97`; `bookkeeping.rs::pay_from_vault`, `::credit`; branch: `bookkeeping.rs::VaultWatch` | `AlreadySettled` 6107, `EntryNotOnCampaign` 6113, `WrongBaker` 6108, `NotFinalized` 6106, `NotTallied` 6114, `PayoutExceedsSnapshot` 6112; branch: `InvariantViolated` 6101 | `tests/settle_host_rules.rs:34-129`; `invariant-program.test.ts:89`, `:185`; `tests/brot/late-entries.test.ts:27` |
| `settle_creator_share` | `Settling` or `Settled`; `Split`, not a team campaign, share > 0 | Pays `from_pot + from_fee` to the stored creator once; **if that would leave an empty wallet below its rent-exempt minimum, reserves it in the vault** (`creator_share_reserved`, no event); a later call from a funded wallet claims it | `settle_creator_share.rs:37-125`; `settlement/rules.rs:99-130`; branch: `VaultWatch` | `NotFinalized` 6106, `WrongCreator` 6110, `CreatorShareNotDue` 6109, `AlreadySettled` 6107, `ReserveNotClaimable` 6111; branch: `InvariantViolated` 6101 | `tests/settle_host_rules.rs:150`, `:162`; `tests/sdk/prepare-claim.test.ts:46` |
| `collect_fee` | finalized, `entries_open == 0`, once | Moves what Brot keeps to the fee vault: `Split` fee − `from_fee` + opening fee; `OneSided` the recorded one-sided fees + opening fee; `Refund` the opening fee unless a house failure with entries | `collect_fee.rs:28-80`; `collect_fee/amount.rs::kept`; branch: `VaultWatch` | `NotFinalized` 6106, `CampaignNotSettled` 6121, `FeeAlreadyCollected` 6125, `PdaMismatch` 6010; branch: `InvariantViolated` 6101 | `tests/settle_d_amounts.rs:53-174`; `tests/settle_d_collect_prize.rs:65-110` |
| `settle_prize` | finalized, once | Returns the prize to the stored creator in `OneSided` and `Refund`, plus the opening fee on a house-failure void; in `Split` it moves nothing and sets the flag | `settle_prize.rs:25-76`; `collect_fee/amount.rs::opener_return`, `::no_entry`, `::prize_return`; branch: `VaultWatch` | `NotFinalized` 6106, `PrizeAlreadySettled` 6126, `WrongCreator` 6110; branch: `InvariantViolated` 6101 | `tests/settle_d_collect_prize.rs:113-148`; `tests/brot/void-refund.test.ts:52` |
| `settle_sealed_fee` (Sprint 15) | `Settling` or `Settled`; the `SealedFee` names this campaign and this sponsor | The held fee to the sponsor on a house-failure void, to the fee vault otherwise; hand-sent lamports to the fee vault; the account's rent to the sponsor; the account closed; `sealed_fees_open` decremented (§19.3) | `settle_sealed_fee.rs:44-176` | `AlreadySettled` 6107, `SealedFeeMismatch` 6173, `WrongSponsor` 6174, `NotFinalized` 6106, `PdaMismatch` 6010, `DuplicateAccount` 6015, `BadAccountData` 6019, `InvariantViolated` 6101 | `tests/sealed_settle.rs:66-204`; `tests/brot/sealed-settle.test.ts:49-130`; `tests/brot/sealed-outcomes.test.ts:80-118` |
| `close_campaign` | `Settled`, no entry open, fee, prize and share flags set; a reserved share only if the creator is the rent payer; since Sprint 15 no `SealedFee` open. Branch: the vault above its rent covers what the books still hold | Vault dust and hand-sent surplus, and the campaign's surplus over its rent, to the fee vault; both rents (and a reserved share) to the stored `rent_payer`; both accounts zeroed and given to the System Program | `close_campaign.rs:32-129`, the sealed-fee wait `:134-140`; `src/checks/close.rs:17-23`; branch: `bookkeeping.rs::books_held`, `::require_books_covered` | `AlreadyClosed` 6124, `CampaignNotSettled` 6121, `ReserveNotClaimable` 6111, `SealedFeesOpen` 6172, `RentPayerNotStored` 6128, `InvariantViolated` 6101 | `tests/settle_d_close_sweep.rs:73-116`; `tests/brot/close-sweep.test.ts:47`, `:74`; `tests/brot/close-reserve.test.ts:52`, `:63`; `tests/brot/close-revival.test.ts:27`; `tests/sealed_settle.rs:189`; branch: `tests/prefreeze_vault.rs` |
| `sweep_fees` | the recipient is the stored `fee_recipient` and not the fee vault | Moves the fee vault's lamports above its rent-exempt minimum to `fee_recipient` | `sweep_fees.rs:27-70` | `FeeRecipientMismatch` 6129, `FeeRecipientIsFeeVault` 6122, `NothingToSweep` 6123 | `tests/settle_d_close_sweep.rs:118-151` |

**The reserve path below rent** (TP §3.4.5). The runtime refuses a transaction that leaves an account with a positive
balance below its rent-exempt minimum. Only the creator share is routed around it: `plan_credit` reserves when
`wallet + amount < Rent::minimum_balance(0)` (`settlement/rules.rs:108-117`, read from the Rent sysvar in
`settle_creator_share.rs:75`), and `claimable` pays the reserve once the wallet with it reaches the minimum
(`settlement/rules.rs:121-130`). `close_campaign` pays a reserve with the rents when the creator is the rent payer
(`close_campaign.rs:62`, `:73-80`, `:115-121`), which is always the case today (`open_campaign/record.rs:53`), and
emits nothing for it (O-5). Entries are safe without it: a settled `Entry` credits at least its own rent
(`settle_entry.rs:132`, `:147`), above an empty account's minimum (TP §3.4.5). A settled `SealedFee` always returns at
least its rent to the sponsor (`settle_sealed_fee.rs:83-98`). `settle_prize` and `sweep_fees` have no reserve path: they
rely on the amounts being above the minimum (`THREAT-MODEL.md` §5.13).

**Lamport moves out of program accounts** are plain balance edits (`bookkeeping.rs::pay_from_vault`;
`collect_fee/moves.rs::move_lamports`); the runtime checks the instruction's lamport sum. The vault's balance is never
read as a pot: every amount comes from the campaign's books. At `8af10e2` the deposit at open and join is asserted
against the amount booked (I1 as a delta, §16), but a payout's assertion compares the change it just made with itself
(G-2). **Since PR #93** (`af198a7`, on `main` as `a5e6014` since 2026-10-14): `settle_entry`, `settle_creator_share` (pay, reserve
and claim), `collect_fee` and `settle_prize` take a `VaultWatch` before their first write and check at the end that the
vault's change equals the change of `booked_out` (what the books say has left: `paid_out_total`, the collected fee,
the returned prize; `bookkeeping.rs::booked_out`); `close_campaign` requires, before it moves anything, the vault above
its rent to cover `booked_in − booked_out`, the reserve inside it (`bookkeeping.rs::require_books_covered`, I15 as a
level); and `move_lamports` and `pay_from_vault` read both accounts again after the move, which refuses the same account
on both sides (`collect_fee/moves.rs::moved_exactly`). Each is `InvariantViolated` 6101. These compare changes, never the
vault's level against the books, so SOL sent by hand never refuses a payout. `sweep_fees` (the fee vault has no books)
and `settle_sealed_fee` (the `SealedFee`'s fee is bookkept in the account itself) get the both-sides check only.
**On the follow-up branch** (the review's F4 and F5, `27e42aa`): each paying instruction first checks a cap from the
snapshot (`settlement/payout_cap.rs`, `PaidOutAboveSnapshot` 6179). In `Split`, `paid_out_total` is at most
`distributable + late_yes + late_no + creator_share`; in `OneSided` and `Refund`, `paid_out_total + one_sided_fees` is
at most `pool_yes + pool_no`. So a wrong amount is caught, not only an unbooked move. `close_campaign` requires
`vault ≥ held` and returns the vault's rent as `min(rent, vault − held)`, so a rise in the rent-exempt minimum never
blocks a close.

## 11. The money math: fee, one-sided fee, creator share

All pure functions in `src/math/`, u64 lamports with u128 intermediates and checked math; fees round up, payouts and
the share round down, the opening rounds toward Brot (`src/math/mod.rs:6-10`; `src/math/rounding.rs:12-74`). A rate above
10,000 bps is refused (`rounding.rs:13-19`).

**The snapshot** (`src/math/snapshot.rs:137-176`), with V the winning side and P the losing side, both **without**
their late parts (`src/instructions/settlement/snapshot.rs:47-74`), R the prize:

| Mode | When | Code |
|---|---|---|
| `Refund` | a void; or no entry at all (`entries == 0 && late == 0`: the prize back, the opening fee kept, whatever the outcome) | `src/math/snapshot.rs:150-163` |
| `OneSided` | one side empty, **or** the losing side not larger than the fees it would pay (the Economic Viability Rule: `P > ceil(P × fee_bps) + floor((V + P) × share_bps)`, share 0 for a team) | `src/math/snapshot.rs:165-174`, `:191-207` |
| `Split` | otherwise | `src/math/snapshot.rs:95-133` |

**`Split`** (the P-2 reading of D-g, as the code computes it after the closure review of 2026-10-09, TP §3.4.18):
`fee = ceil(P × fee_bps ÷ 10,000)` (`src/math/fees.rs:14-16`); `C = floor((V + P) × creator_share_bps ÷ 10,000)`,
`from_pot = min(C, P − fee)`, `from_fee = min(C − from_pot, fee)` (`src/math/payout.rs:53-77`; the prize is outside
the base and never pays the share); `distributable = V + P − fee − from_pot + R`, never below V
(`src/math/payout.rs:80-96`); each winner gets `floor(early_winning × distributable ÷ V)` plus its late part
(`src/math/payout.rs:99-104`; `src/instructions/settlement/rules.rs:80-94`); Brot keeps `fee − from_fee` + the opening fee
(`src/math/snapshot.rs:115-118`). The header of `src/math/payout.rs:6-12` and TP §3.4.16 still write `from_pot = min(C, P − fee + R)`
(gap G-5); the code is the rule.

**`OneSided`**: each entry gets its early part minus `ceil(early × one_sided_fee_bps ÷ 10,000)`, zero fee for the first
baker's whole entry, plus its late part whole (`src/math/fees.rs:20-26`; `src/math/payout.rs:162-170`;
`settlement/rules.rs:67-79`); the fees are summed at settlement (`settle_entry.rs:141`) and collected after the last
entry; the prize returns to whoever opened, Brot keeps the opening fee (`src/math/void.rs:64-69`). No creator share
(P-1).

**`Refund`**: every entry back whole, late parts included (`settlement/rules.rs:60-66`); the prize back; the opening fee
follows the `VoidReason` (§12).

The snapshot's own sums are asserted in the program at every finalize path, the contest's three exits included
(`src/math/invariant.rs::check_snapshot`, called at `settlement/snapshot.rs:98-100`). Vectors: 24,000 rows generated by
the Rust functions (`tests/math_vectors.rs`,
`tests/math_vectors_snapshot.rs`) and replayed by the SDK's TypeScript mirror in Bun and on Hermes
(`tests/sdk/math-vectors.test.ts`, `tests/sdk/snapshot-vectors.test.ts`). Worked examples A, B and C of TP §3.4.16:
`tests/math_payout.rs`, `tests/math_snapshot_split.rs`, `tests/math_snapshot_modes.rs`. Properties over random pots:
`tests/math_payout_properties.rs` (I3′, I6, I9, I11, I13), `tests/math_snapshot_invariant.rs`.

## 12. `VoidReason` and the 10% path (T23)

The 10% opening fee is held in the vault until the outcome (`opening_fee_lamports`); a sponsor's 10% is held in its
`SealedFee` (§19). On a void, the reason decides both:

| Reason (byte) | Written by | Class | The 10% opening fee, and a sealed entry's 10% | A team key (in the window) or the admin (deciding a contest) may record it |
|---|---|---|---|---|
| `MissedWindow` (1) | `resolve_campaign` (epoch kinds); a team key; the admin | house failure | back to whoever opened; back to the sponsor | yes |
| `UnreadableAccount` (2) | `resolve_campaign` | outside cause | kept by Brot | no (`VoidReasonNotForTeam` 6094) |
| `StaleFeed` (3) | `resolve_campaign` (price); a team key; the admin | outside cause | kept by Brot | yes |
| `TeamHouseFailure` (4) | `team_void_campaign`, `admin_decide_contest` | house failure | back to whoever opened; back to the sponsor | yes |
| `TeamOutsideCause` (5) | `team_void_campaign`, `admin_decide_contest` | outside cause | kept by Brot | yes |

The class is written three times, and the three copies must agree: `src/math/void.rs:21-31` (the snapshot),
`collect_fee/amount.rs::class_of` (`collect_fee`, `settle_prize`) and `src/instructions/resolution/void_reason.rs:13-18`
(`is_house_failure`, which `settle_sealed_fee` also reads, `settle_sealed_fee.rs:170-176`); the module note of
`collect_fee/amount.rs` says "unify at integration". The prize always returns whole to whoever opened. **A campaign
with no entry at all keeps the opening fee whatever the reason** (founder answer 8; `src/math/snapshot.rs:150-156`;
`collect_fee/amount.rs::opener_return`, `::no_entry`); a pot whose only joins were late is not "no entry"
(`src/math/snapshot.rs:149`; `tests/review_money_fixes.rs:32-63`). A campaign with a sealed entry is never "no entry":
the sealed entry is an entry (§19). A team key re-labels an automatic void, and with it moves the 10% between Brot and
the opener (gap G-12); since Sprint 14 the admin's void of a contested campaign chooses the class the same way
(`resolution/contest_decision.rs:26-29`, through `team_may_choose`, §18.4). Tests: `tests/brot/team-window.test.ts:57-126`,
`tests/brot/void-refund.test.ts:52`, `tests/team_window_void_reasons.rs`, `tests/math_snapshot_void.rs`,
`tests/settle_d_amounts.rs:104-144`; the contest's void: `tests/brot/contest-decide.test.ts:69-112`; the sealed fee:
`tests/sealed_settle.rs:66-92`, `tests/brot/sealed-outcomes.test.ts:109-118`.

## 13. The `checks` module, and the explicit stored-key comparisons

`src/checks.rs` and `src/checks/` hold every check Anchor used to generate (TP §3.4.17). The order contract inside an
instruction is written at `src/checks.rs:6-11`. Each check, its negative tests and its mutation row are tabled in
`README.md` ("The `checks` module"). The account loaders that run those checks are `src/state/mod.rs:56-112` and
`src/state/campaign/loaders.rs:15-47`. Since Sprints 14 and 15 the rules of the new instructions carry the same
`// X0.9 <id>` markers in their own modules, and the mutation script reads those files too
(`scripts/checks-mutation.mjs:26-37`): `referral/rules.rs`, `resolution/contest_rules.rs`,
`resolution/contest_decision.rs`, `entries/sealed_charge.rs`, `entries/sealed_fee_account.rs`,
`settlement/settle_sealed_fee.rs` and `settlement/close_campaign.rs`.

The comparisons with stored keys (Anchor's `has_one` and constraints) are written in the instructions:

| Comparison | Code | Error | Test |
|---|---|---|---|
| The join's metric account is the campaign's (plain and sealed) | `src/instructions/entries/join_core.rs:86-88` | `MetricAccountMismatch` 6045 | `tests/brot/join-campaign-refuses.test.ts:119` |
| The resolution's metric account is the campaign's | `resolution/resolve_campaign.rs::resolve_campaign` | `MetricAccountMismatch` 6045 | `tests/brot/resolve-refuses.test.ts:78` |
| The re-read's metric account is the campaign's | `resolution/contest_rules.rs:110-116`, at `reread_campaign.rs:100` | `MetricAccountMismatch` 6045 | `tests/contest_mollusk_reread.rs:186`; `tests/brot/contest-reread.test.ts:158` |
| An existing `Entry` names this campaign and this baker | `src/instructions/entries/entry_account.rs:66-68`, `:116-118` | `EntryMismatch` 6069 | `join-campaign-refuses.test.ts:129` |
| The settled `Entry` names this campaign and this baker | `src/instructions/settlement/settle_entry.rs:96-105` | `EntryNotOnCampaign` 6113, `WrongBaker` 6108 | `tests/brot/invariant-program.test.ts:185` |
| A `Join` names this campaign, this baker and the expected index | `src/instructions/entries/join_record.rs:49-51` | `JoinAccountsMismatch` 6133 | `tests/join_host_record.rs` |
| An existing `SealedFee` names this campaign and this sponsor (at a sealed entry) | `src/instructions/entries/sealed_fee_account.rs:90-95` | `SealedFeeMismatch` 6173 | `tests/sealed_entry.rs:120`; `tests/brot/sealed-settle.test.ts:130` |
| The settled `SealedFee` names this campaign, and the sponsor slot is its stored sponsor | `settle_sealed_fee.rs:143-154`; then its PDA from the two slots (`:72-79`) | `SealedFeeMismatch` 6173, `WrongSponsor` 6174, `PdaMismatch` 6010 | `tests/sealed_settle.rs:127`, `:144`; `tests/brot/sealed-settle.test.ts:62` |
| A `ReferralLink` is the canonical PDA of the signing referee, so no wallet names another's link | `src/instructions/referral/link_referrer.rs:60-61` | `PdaMismatch` 6010 | `tests/referral_refusals.rs:77`; `tests/brot/referral-refuses.test.ts:72` |
| The share and prize recipient is the stored creator | `settle_creator_share.rs:59-61`; `settle_prize.rs:50-53` | `WrongCreator` 6110 | `invariant-program.test.ts:185`; `tests/settle_d_collect_prize.rs:136` |
| The close's rent payer is the stored one | `close_campaign.rs:55-58` | `RentPayerNotStored` 6128 | `tests/brot/close-sweep.test.ts:74`; `tests/settle_d_close_sweep.rs:96` |
| The sweep's recipient is the stored `fee_recipient` | `sweep_fees.rs:44-47` | `FeeRecipientMismatch` 6129 | `tests/settle_d_close_sweep.rs:118` |
| The vault is the campaign's own (owner, then PDA with the stored bump) | `src/checks/paying.rs:29-37`; in the join `join_core.rs:81-82` | `WrongOwner` 6005, `PdaMismatch` 6010 | `tests/brot/join-campaign-slots.test.ts:59`; `tests/settle_d_collect_prize.rs:90` |
| The fee vault is the canonical `["fee_vault"]` (close, collect, the sealed fee) or at the config's bump (sweep) | `collect_fee/moves.rs::fee_vault_is_canonical`; `sweep_fees.rs:52-53` | `PdaMismatch` 6010 | `tests/settle_d_close_sweep.rs:131` |
| The signer is the admin, a team key, or the pending admin; the contest: a team key opens and escalates, the admin decides | `src/instructions/admin/shared.rs:24-30`; `src/state/config.rs:127-135`; `accept_admin.rs:33-38`; `resolution/contest_rules.rs:62-65`, `:190-193` | `NotAdmin` 6022, `NotTeamMember` 6023, `NoPendingAdmin` 6025, `NotPendingAdmin` 6024 | `tests/brot/admin-refusals.test.ts:19`, `:46`, `:69`; `tests/team_window_rules.rs:158-167`; `tests/contest_mollusk_open.rs:54`; `tests/contest_mollusk_escalate.rs:72`; `tests/contest_mollusk_decide.rs:89` |

The Sprint 02–04 comparisons above are not in the mutation plan (X0.9 covers `checks` bodies); they are covered by the
tests above and by the slot matrix (README). The Sprint 14 and 15 ones carry markers and plan rows (`reread_metric`,
`sealed_fee_keys`, `sealed_fee_campaign`, `sealed_fee_sponsor`, `contest_team_key`, `decide_admin`; README).

## 14. Config, powers and the pause

| Power | Who | Limit in code | Code |
|---|---|---|---|
| Replace the program | the upgrade authority (loader v3) | none in the program; the multisig and its public wait are Sprint 16 | — |
| Initialize the config, once | the upgrade authority, read from ProgramData | chooses the first admin, fee recipient and parameters | `admin/initialize_config.rs:41-105`; `src/checks/upgrade.rs:17-44` |
| Set the team (0 to 5 keys, distinct, non-zero) | `admin` | replaces the whole list | `admin/set_team.rs:35-81` |
| Set the creation parameters | `admin` | ceilings of §5; future campaigns only | `admin/set_creation_params.rs:24-55` |
| Set the fee recipient | `admin` | non-zero; any address | `admin/set_fee_recipient.rs:32-53` |
| Change the admin | `admin` names, the named key accepts; zero cancels | two steps | `admin/transfer_admin.rs:30-50`; `admin/accept_admin.rs:20-44` |
| Pause entries and openings | one team key | `Normal` → `EntriesHalted` only | `admin/pause_entries.rs:17-44` |
| Resume | `admin` | `EntriesHalted` → `Normal` only | `admin/resume_entries.rs:16-39` |
| Open free, outside the valve, with no creator share | one team key | `opening_usd` 0; a team key that adds a prize pays like anyone, with a zero share | `open_campaign/payment.rs:55-61`; `open_campaign/rules.rs:92-111`; `open_campaign/record.rs:57-61` |
| Confirm a result early (end the window) | one team key | in review, inside the window; never changes the outcome | §9 |
| Record the cause of an automatic void | one team key | only on a stored `Void`, inside the window; decides the 10% | §9, §12 |
| Contest a result (stage 1), or escalate one's contest to the admin (stage 2) | one team key | stage 1 only in review, inside the window, every entry tallied; stage 2 only on a contest at stage 1, before its deadline; never touches the result; **holds the payout up to 72 hours** (24 + 48), 78 after the resolution | `resolution/team_open_contest.rs:62-118`; §18.2 |
| Decide a contest at stage 2 | `admin` (the 2-of-3 on mainnet) | before stage 2's deadline; confirm, or void with a reason a team key may choose; **never inverts**; a void decides the 10% by its reason, so with a team key's contest the admin **can void a correct result** (TP §3.4.9) | `resolution/admin_decide_contest.rs:64-116`; §18.4 |
| Re-read a contested result (stage 1) | any wallet, top level only | the same reading pays the stored result from stage 1's deadline on; any difference escalates; never writes a result | `resolution/reread_campaign.rs:78-150`; §18.3 |
| Link a referrer | the referee, once | its own PDA; never the zero address or itself; never changed or closed | `referral/link_referrer.rs:42-94`; §18.1 |
| Join with a sealed entry | any wallet (the sponsor) | at least `opening_fee_usd` at the SOL/USD price, at most `max_lamports`, the creation rules' version signed; 10% held apart | `entries/sponsor_join_campaign.rs:69-154`; §19 |
| Resolve, finalize, tally, settle, collect, return the prize, settle a sealed fee, close, sweep | any wallet | amount and destination fixed by the program | §8, §10, §19.3 |
| Move a baker's entry, or any vault lamport, by instruction | nobody | no such instruction | — |

**The pause (I10′).** Only `user_open_campaign`, `user_join_campaign` and, through the same join core,
`sponsor_join_campaign` read `operating_level` (`open_campaign.rs:107-109`; `join_core.rs:69-76`, `:100-102`); no other
instruction reads it (a search of `src/` finds it written only by the pause, the resume and the initialization). The
contest's three instructions, the lapse, the referral link and `settle_sealed_fee` never read it. A team key pauses,
only the admin resumes (`tests/brot/admin.test.ts:142`). Tests: `tests/brot/admin-pause.test.ts:18`,
`tests/brot/invariant-program.test.ts:156`, `tests/brot/join-campaign-pot.test.ts:62`,
`tests/brot/open-campaign-refuses-payment.test.ts:103`; the sealed entry refused and `settle_sealed_fee` run under the
pause (`tests/brot/sealed-pause.test.ts:33`); the contest and the link under the pause
(`tests/brot/contest-open.test.ts:74`, `contest-escalate.test.ts:72`, `contest-reread.test.ts:186`,
`contest-decide.test.ts:170`, `referral-link.test.ts:70`); and the randomized run, which draws pause and resume among
its operations (`tests/brot/invariant-ops.ts:102-103`) and expects only joins, sealed entries and openings to refuse
(`tests/brot/invariant-open.ts:50`, `:98`, `:142`). **On the pre-freeze branch** one test walks all 27 instructions of
the IDL under the pause, through a real cycle, and fails when an instruction is added without it
(`tests/brot/prefreeze-pause.test.ts`, "paused campaign refuses new money, never payouts", commit `c45e349`): exactly
the three that bring new money refuse, `admin_initialize_config` and `team_pause_entries` refuse for reasons of their
own, the other 22 run (G-10 closed there). At `8af10e2` TP §3.4.9 still names `sponsor_add_prize` and not
`sponsor_join_campaign` as the third paused instruction (`docs/technical/TECHNICAL-PLAN.md:783-784`; G-5; the branch's
TP fixes it); TP §3.4.13's I10′ row is right.

The public table of powers, `content/powers.md`, states the same powers for devnet.

## 15. Events by self-CPI

Every instruction emits one event as an inner instruction to this program with data `[0xFF, discriminator, payload]`
and one account, the event authority PDA `["__event_authority"]`, signing through `invoke_signed`
(`src/events/self_cpi.rs:39-58`, `:62-78`). Five emit two: `team_confirm_result`, `team_void_campaign`,
`admin_decide_contest` and a paying `reread_campaign` add `CampaignFinalized` after their own event (TP §3.4.14), and
`sponsor_join_campaign` emits the join core's `EntryAdded` then `SealedFeeHeld`. The handler of `0xFF` succeeds only
when its first account is the event authority and signed, which only this program can bring about
(`self_cpi.rs:84-91`); a top-level call is `WrongEventAuthority` 6016. Both trailing slots are checked before anything
else is read (`src/checks.rs:160-171`) and again in `emit` (`self_cpi.rs:46`). Discriminators are positional, appended,
never reused (`src/events.rs:25-28`, `:77-88`; `src/events/campaign.rs:139-147`; `src/events/review.rs:106-120`;
`src/events/finalize.rs:79-87`; `src/events/payout.rs:92-106`; `src/events/referral.rs:28-30`;
`src/events/sealed.rs:63-68`): `ConfigInitialized` 0 … `LateTallied` 17, then Sprint 14's `ReferralLinked` 18,
`CampaignReread` 19 and `ContestClosed` 20, and Sprint 15's `SealedFeeHeld` 21 and `SealedFeeSettled` 22; `ContestOpened`
9, declared in Sprint 04, is emitted since Sprint 14. Every campaign event carries the campaign and a contiguous `seq`
from `Campaign.event_seq`; config events, `FeesSwept` and `ReferralLinked` (no campaign) carry none. The buffer is sized
at compile time for the largest event (`self_cpi.rs:25-30`, `:66-71`). Tests: `tests/brot/events.test.ts:70-197` (one
event per Sprint 02 instruction, contiguous `seq`, a forged top-level call refused, a failed transaction keeps no
event), `tests/event_cpi.rs:35-71`, `tests/brot/team-window-events.test.ts:61`, `:88`; the new events in their own
instruction tests (`contest-open.test.ts:27`, `contest-escalate.test.ts:29`, `contest-reread.test.ts:55-60`,
`contest-decide.test.ts:43`, `referral-link.test.ts:29`, `sealed-entry.test.ts:74-75`, `sealed-outcomes.test.ts:91`);
the randomized run checks `event_seq`
after every operation (`tests/brot/invariant-state.ts:30`); every discriminator and size against the Rust source
(`tests/sdk/contract-events.test.ts:27-37`); the decoder rules (off-chain) in `tests/sdk/decoder.test.ts:55-142`.
`tests/layout.rs:54-73` pins the Sprint 02–03 events' sizes; `tests/brot/idl.test.ts:221-248` pins every event's layout and
every instruction's discriminator, arguments and account flags against hand-written copies.

## 16. Invariants I1–I15 (TP §3.4.13)

"In program" means an assertion the instruction itself makes; everything else is checked by tests. The randomized
test (`tests/brot/invariants.test.ts`: seed `0x0badc0de` at `:25`; 2,000 operations since Sprint 14, `:26-31`; the
kinds of both sprints' operations at `:33-39`, the link, the contest, the re-read, the decision, the lapse and the sealed
entry among them) checks I1–I8 and I11–I15 after every operation (`tests/brot/invariant-checks.ts:161-199`), the sealed
entry's own (`tests/brot/invariant-sealed-checks.ts:23-92`), the campaign's record, which no contest step may rewrite
(`tests/brot/invariant-state.ts:1-5`), and every referral link (`tests/brot/invariant-referral.ts`). Sprint 14 ran it on
the fixed seed plus 24 seeds before D2 and 12 after (`docs/sprints/sprint-14-referral-second-read.md:80-81`), Sprint 15
on 35 seeds (`docs/sprints/sprint-15-sponsorship.md:156`). It opens price campaigns only (gap G-11) and tallies all of
a baker's joins at once (`tests/brot/invariant-window.ts:47-56`), which is why it never saw O-3.

| # | Invariant (short) | In program | Tests |
|---|---|---|---|
| I1 | Vault − rent = entries + prize + held fee − paid out + hand-sent | as a **delta**: the vault's change equals the booked change at open (`open_campaign.rs:161-171`) and at every join, plain or sealed (`join_core.rs:161-164`), and a `SealedFee`'s change equals the fee it books (`sealed_fee_account.rs:140-142`), all through `src/math/invariant.rs::vault_change_matches`. At `8af10e2` no payout asserts anything that can fail: `bookkeeping.rs::pay_from_vault` compares a value with itself, and `collect_fee`, `settle_prize`, `close_campaign` and `sweep_fees` assert nothing (G-2). **Branch** (`af198a7`, G-2 closed there): every paying instruction checks its vault change against its books (`bookkeeping.rs::VaultWatch`), and every move re-reads both sides (`collect_fee/moves.rs::moved_exactly`) | `invariant-checks.ts:22-27`; each `SealedFee`: `invariant-sealed-checks.ts:23-45`; branch: `tests/prefreeze_vault.rs` |
| I2 | Pools are the sums of the entries | — | `invariant-checks.ts:30-47`; `tests/brot/join-campaign-adds.test.ts:69`; a `SealedFee`'s sums: `invariant-sealed-checks.ts:23-45` |
| I3′ | `Split`: `(fee − from_fee) + (from_pot + from_fee) + distributable = V + P + R` | yes, at every finalize path, the contest's exits included (`src/math/invariant.rs::check_snapshot`; `src/instructions/settlement/snapshot.rs:98-100`) | `invariant-checks.ts:50-61`; `tests/math_snapshot_invariant.rs`; `tests/math_payout_properties.rs` |
| I4 | `OneSided`: payouts + fees = entries; the first baker whole; the prize back | the snapshot's shape (`src/math/invariant.rs::check_snapshot`) | `invariant-checks.ts:64-73`; `tests/brot/invariant-rules.test.ts:41-92`; `tests/brot/invariant-program.test.ts:89`; `tests/math_snapshot_modes.rs`; the sealed entry in a one-sided pot: `tests/brot/sealed-outcomes.test.ts:94-108` |
| I5 | `Refund`: each entry back exactly; the prize back; the fee by reason | the snapshot's sums (`src/math/invariant.rs::check_snapshot`); a held sealed fee by the same reason (`settle_sealed_fee.rs:167-176`) | `invariant-checks.ts:76-85`; `tests/brot/void-refund.test.ts:52`; `tests/math_snapshot_void.rs`; `invariant-sealed-checks.ts:57-75` |
| I6 | Dust below the winners' count; closed accounts empty and the System Program's; no `SealedFee` left at close | close moves every lamport and checks zero before closing (`src/checks/close.rs:17-23`), and waits for `sealed_fees_open == 0` (`close_campaign.rs:134-140`) | `invariant-checks.ts:87-99`; `tests/brot/close-sweep.test.ts:47`; `tests/math_payout_properties.rs`; `invariant-sealed-checks.ts:47-55`; `tests/sealed_settle.rs:189` |
| I7 | `open_campaigns` = paid campaigns opened and not finalized, never above the valve | the valve at opening (`open_campaign/rules.rs:101-111`); the decrement at every finalize path, the contest's exits included, refuses below zero (`settlement/snapshot.rs:103-107`) | `invariant-checks.ts:188-196`, after every exit from `Contested`; `tests/settle_host_finalize.rs:122-166`; `tests/open_h_valve.rs` |
| I8 | No entry paid twice; payees are only the baker, the creator, the sponsor (a refunded sealed fee) or the fee vault | the `Entry` and the `SealedFee` close as they pay; stored-key comparisons (§13) | `invariant-checks.ts:102-109`; `tests/brot/join-campaign-wallets.test.ts:19`; `invariant-program.test.ts:185`; `invariant-sealed-checks.ts:57-75`; `tests/brot/sealed-settle.test.ts:62`; slot matrix |
| I9 | Splitting an entry across wallets never pays more | floor rounding of each payout (`src/math/payout.rs:99-104`) | property only, not in the randomized run: `invariant-rules.test.ts:121-136`; `tests/math_payout_properties.rs:72` |
| I10′ | With the pause on, only open, join and the sealed entry fail | only those three read the level (§14) | `invariant-checks.ts:196-198` (the level only); §14's tests; branch: `tests/brot/prefreeze-pause.test.ts`, every instruction of the IDL (G-10 closed there) |
| I11 | `Split`: every winner gets at least its entry | `from_pot ≤ P − fee` keeps `distributable ≥ V` (`src/math/payout.rs:65-68`, `:80-96`) | `invariant-checks.ts:112-125`; `invariant-rules.test.ts:94-136`; `tests/math_payout_properties.rs` |
| I12 | No creator share in `OneSided`, `Refund`, or a team campaign; its base holds entry parts, never a fee | zero share stored for a team key (`open_campaign/record.rs:57-61`); the snapshot refuses a team share (`src/math/invariant.rs::check_snapshot`); a sealed fee never enters the vault (§19.2) | `invariant-checks.ts:128-132`; `tests/brot/open-campaign-team.test.ts:32`; `invariant-sealed-checks.ts:76-85` |
| I13 | The share is paid at most once, only to the creator; `from_fee ≤ fee` | `from_fee ≤ fee_total` at finalize (`src/math/invariant.rs::check_snapshot`); the flag and the reserve (`settle_creator_share.rs:79-108`) | `invariant-checks.ts:134-143`; `tests/sdk/prepare-claim.test.ts:46` |
| I14 | A paid opening moves exactly `prize + opening fee` into the vault; a team opening moves nothing but rent | yes, the vault's change at opening (`open_campaign.rs:161-171`); `paid = prize + fee` by construction (`src/math/opening.rs:74-78`) | `invariant-checks.ts:145-152`; `tests/brot/open-campaign-paid.test.ts:50`; `open-campaign-team.test.ts:32` |
| I15 | Vault − rent ≥ unpaid books; the difference is hand-sent SOL, never an entry | at `8af10e2` no level check; the books are never read from a vault (§10). **Branch** (`af198a7`): close requires the vault above its rent to cover `booked_in − booked_out` (`bookkeeping.rs::require_books_covered`) | `invariant-checks.ts:155-159`; `tests/brot/join-campaign-pot.test.ts:19`; `tests/brot/open-campaign-retry.test.ts:52`; each `SealedFee`: `invariant-sealed-checks.ts:23-45`; branch: `tests/prefreeze_vault.rs` |

**Sprint 15's additions** (TP §3.4.13, last paragraph, `docs/technical/TECHNICAL-PLAN.md:971-976`): each `SealedFee`
holds exactly its rent, its bookkept fee and any SOL sent to it by hand (I1, I15 for that account); `sealed_fees_open`
counts the live `SealedFee` accounts and none is left at close (I6); a held fee goes only to its stored sponsor on a
house-failure void or to the fee vault (I5, I8); the creator share's base holds entry parts, never fees (I12). **Sprint
14's** contest steps never rewrite the stored result and every exit keeps I7 (`invariant-state.ts:1-5`;
`docs/sprints/sprint-14-referral-second-read.md:214-216`).

## 17. Known open items before the freeze

Each item is to be **fixed in the candidate** or **sent to the firms as a known issue**, decided by the lead and the
founder before the freeze. O-items are already recorded by the team; G-items were found while writing this package;
S-1 to S-4 come from the branch's adversarial review. Status on 2026-10-14: PR #93 is on `main` (`a5e6014`, and on
devnet at slot 510863588); the review's follow-ups are on the follow-up branch ("closed on the branch" means fixed and
tested there, to be checked
again on the candidate):

| Item | Status |
|---|---|
| O-1, O-2, O-4, O-5, G-4, G-6, G-7, G-9, G-11, G-13 | open, unchanged by Sprints 14 and 15 (O-2 now also binds the sealed entry) |
| O-3 | closed on `main`, `b1650fb` (PR #93) |
| G-1 | closed on `main`, `5f5cfd1` (PR #93) |
| G-2 | closed on `main`, `af198a7` (PR #93); the cap per payout on the follow-up branch, `27e42aa` |
| G-10 | closed on `main`, `c45e349` (PR #93); the free opening and a static check on the follow-up branch, `88c8735` |
| G-16 | closed on `main`, `c91b3eb` (PR #93) |
| G-8 | closed at `8af10e2` by Sprint 16's CI (PR #87) |
| G-3, G-12 | changed by Sprint 14: the admin may now void a contested YES or NO, never invert it |
| G-5, G-14 | open, with new entries from Sprints 14 and 15 (the branch's TP fixes G-5's pause list and G-2's wording) |
| G-15 | narrowed: the two new accounts are created through `state::init` |
| S-1 | closed on the follow-up branch: every reader uses the SDK's version constant and skips an unreadable transaction without stopping (devnet serves v1 since at least 2026-10-14) |
| S-2 | closed on the follow-up branch, `addf462` |
| S-3 | closed on the follow-up branch, `27e42aa` |
| S-4 | informative: what the randomized run and the pause walk still do not draw |
| S-5 | closed on the last pre-freeze branch (`5c0a046`): in `Split`, `settle_entry` checks each entry's payout against its share of the stored snapshot, `payout × V ≤ early × D` (`EntryPayoutAboveShare` 6180), a guard against a regression in the formula; and the keeper raises `settle_invariant` once per campaign when a settlement is refused with 6101, 6179 or 6180 (`b202803`). The third review found that no legitimate payout trips it |
| S-6 | closed on the last pre-freeze branch (`9b4a150`, then the third review's P2): every file that names `operating_level` has its count pinned, and the files that name `OperatingLevel` are pinned too |
| S-7 | informative: if the rent-exempt minimum falls, the difference goes to the fee vault, not the rent payer (I14); after a rise, SOL sent by hand that fills the gap goes to the rent payer (I15): each under one rent, never money the books owe; the rule to state in I14 and I15 |
| S-8 | low, from the third review: 6180 and the cap reuse the stored snapshot's `winning_total` and `distributable`, so a regression in the snapshot itself would pass both until the running cap is crossed, and the last payouts of that campaign would then be refused. The fix the review proposes: in `Split`, refuse unless `winning_total == pool_w − late_w` from the campaign's books (or pin `winning_total` and `losing_total` in `check_snapshot`); `Refund`: `amount ≤ yes + no`; `OneSided`: `amount + fee == yes + no`. To fix before the freeze or send to the firms (the founder's choice with the freeze) |
| S-9 | closed on the last pre-freeze branch: the units read their credentials by the spelled-out path; the server's systemd 249 drops `%d` (`d1543a1`, and the test refuses `%d` in any directive) |

**O-1. Prize harvesting** (TP §13; TP §14.2 "Prize harvesting", founder answer 12a: "choose the rule before mainnet").
One wallet with a minimum entry on each side of a paid campaign nobody else joins splits a viable pot and takes the
whole prize: with 0.01 SOL a side, `P = 10,000,000 > fee 1,000,000 + share 200,000`, so the pot splits
(`src/math/snapshot.rs:165-175`) and the prize sits inside `distributable` (`src/math/payout.rs:80-96`). Open: a program
change inside the audit scope, rule not chosen **[Q]**.

**O-2. `min_return_bps` uses the split formula when the pot would not split.** `estimate_return_bps` picks the split
whenever the other side is non-zero (`src/math/payout.rs:135-149`), but the snapshot pays one-sided when the Economic
Viability Rule fails (`src/math/snapshot.rs:165-174`); a baker's floor then never binds in a lopsided pot (TP §7.4).
The sealed entry signs the same floor on its entry part through the same core (`sponsor_join_campaign.rs:55-57`,
`join_core.rs:132-144`).

**O-3. The YES-proof cut-off depended on who acts first.** The first resolver picks any valid YES proof, whose
`publish_time` splits early from late joins (`resolve_campaign/record.rs::write`, `::stored_publish_time`). An earlier
proof moves it back only while `entries_untallied == entries_open` (`resolve_campaign.rs::resolve_campaign`), and a tally
decrements `entries_untallied` only when an entry's **last** join is tallied (`tally_late_joins.rs::tally_late_joins`):
at `8af10e2` joins tallied before the move keep the classification of the old cut-off. A move is possible only while
the earlier proof is at most 60 s old (`src/readers/price_touch/proof.rs:92-97`). TP §7.4 listed it for the audit; the
randomized run never tallies part of an entry (`tests/brot/invariant-window.ts:47-56`). **Closed on the branch**
(`b1650fb`): `tally_late_joins` refuses a YES price result while `now ≤ publish_time + PROOF_DELAY_SECONDS`
(`tally_late_joins.rs::require_cutoff_final`, `CutoffNotFinal` 6178, marker `tally_cutoff_final`); from then on the
recorded proof and every earlier one are too old to be accepted, so the cut-off is final before any join is classified.
Other outcomes and kinds tally at once. Tests: `tests/brot/prefreeze-partial-tally.test.ts` (the reproduction, which the
commit records as failing on the old binary), `tests/prefreeze_tally.rs`; the randomized model refuses the early tally
too.

**O-4. A closed campaign's id can be opened again.** `close_campaign` gives both accounts back to the System Program
(`close_campaign.rs:99-100`; `src/checks/close.rs:17-23`), so `user_open_campaign` at the same id succeeds and restarts
`event_seq` at 0 under the same address (`open_campaign/record.rs:96-116`). No `Entry`, `Join` or `SealedFee` of the old
campaign can survive (close needs `entries_open == 0` and `sealed_fees_open == 0`, `close_campaign.rs:115-140`; finalize
needs every join tallied, `settlement/snapshot.rs:80-82`), so the risk is to consumers keyed by address. TP §7.4: "a
tombstone in `close_campaign`, with the audit scope".

**O-5. A reserved creator share paid by `close_campaign` appears in no event.** `to_payer = vault_rent + reserved`
(`close_campaign.rs:78-80`) while `CampaignClosed.rent_returned` counts only the two rents (`:91-93`, `:102-108`), and no
`CreatorShareSettled` is emitted (TP §7.3, deferred to "the next program upgrade").

**G-1. The mutation script did not cover the two Sprint 04 checks.** At `8af10e2`, `checks/close.rs:19`
(`close_account_lamports`) and `checks/paying.rs:21` (`paying_vault_distinct`) carry markers, but `SOURCES`
(`scripts/checks-mutation.mjs:26-37`) omits both files and `PLAN` (`:80-165`) has no row for either; the script runs by
hand only (`:9`). Sprints 14 and 15 added their own modules and rows and ran them (README). **Closed on the branch**
(`5f5cfd1`): both files enter the plan with their host tests (`tests/checks_close_paying.rs`), and so do the
hardening's five new markers (`tally_cutoff_final`, `tally_join_slots`, `vault_booked_change`, `move_both_sides`,
`close_books_covered`); a run of the seven ids saw all 11 tests fail without their checks. TP §3.4.17 promises the
proof for every check: the freeze reruns the whole plan on the candidate (README, "Before sending").

**G-2. The TP overstated the in-program invariant assertions.** TP §3.4.13 says I1, I3′, I13, I14 and I15 "are asserted
at the end of every instruction that moves SOL". At `8af10e2` the code asserts I1 as a delta at open, at every join and
at a sealed fee's deposit, I14 at open, I3′ and part of I13 at finalize, and nothing in `collect_fee`, `settle_prize`,
`close_campaign` and `sweep_fees` (`collect_fee/moves.rs::move_lamports`); the delta in `bookkeeping.rs::pay_from_vault`
cannot fail; no instruction checks I15 as a level. The Sprint 04 DoD chose the delta on purpose
(`docs/sprints/sprint-04-settlement-invariants.md:70-72`). **Closed on the branch** (`af198a7`): the paying
instructions assert their vault change against the books, close checks the level, every move re-reads both sides
(§10, §16; `tests/prefreeze_vault.rs`, each assertion with its error planted), and the branch's TP §3.4.13 says so.
The assertion catches a move the books do not record, not a wrong amount the books record (the review's low finding);
`sweep_fees` (the fee vault has no books) and `settle_sealed_fee` get the both-sides check only.

**G-3. A YES or NO is never voided in the window; since Sprint 14 the admin may void a contested one, never invert it;
the TP still says "the team voids in the window".** The window's rule is unchanged
(`src/instructions/resolution/void_reason.rs:36-42`; `team_void_campaign.rs:79`; TP §3.4.18). The correction a YES or
NO can now get is the contest: a team key contests inside the window, and only the admin, at stage 2 and before its
deadline, voids, never writing another YES or NO (`resolution/contest_decision.rs:37-43`; §18.4). A wrong YES or NO nobody contests
inside its six hours stands. Still written as "the team voids in the window": TP §3.4.6 (the `met_late` row and the
`StaleFeed` paragraph, `docs/technical/TECHNICAL-PLAN.md:646`, `:660`); TP §3.4.18 (`team_open_contest` "disabled ...
until Sprint 14", `:1750-1752`); TP §13 rows "Both keepers stop", "Whoever controls the Pyth receiver", "A short touch
erased", "The same code has the same bug in both keepers" (`:2595-2601`); and the comment at
`src/readers/price_touch/proof.rs:25-28`. The firms should read THREAT-MODEL §5 with the code's rule.

**G-4. A leaked team key opens without bound.** Free team openings are outside the valve
(`open_campaign/rules.rs:92-111`; `tests/open_h_valve.rs:24`), but TP §7 ("`max_open_campaigns` bounds the burst") and
TP §13 ("can hold `max_open_campaigns` full for up to 90 days") describe the older rule. Each free opening costs the key
two rents (TP §3.4.10: 3,901,440 lamports on devnet). Since Sprint 14 the same key can also contest every result in its
window and escalate it, holding each payout up to 72 hours (§18.2; THREAT-MODEL §5.16).

**G-5. Stale comments and documents the firms will read.** `src/instructions/entries/join_record.rs:7-8` (says the
`Join` is not wired into the join; it is: `join_slots.rs:58`, `join_core.rs:160`); `src/state/join.rs:3-4` (says
`settle_entry` closes the `Join`; `tally_late_joins` does); `src/instructions/interface.rs:224` (the baker "receives the
rent of the closed joins"; the rent goes to the `Entry`, `tally_late_joins.rs::tally_late_joins`);
`src/math/payout.rs:6-12` and TP §3.4.16 (`from_pot` with `+ R`); `src/state/transitions.rs:1-3` (says every status move
calls `transition`; `resolve_campaign` writes `InReview` without it, `resolve_campaign/record.rs::write`, guarded by
the explicit status check in `resolve_campaign.rs::resolve_campaign`); `src/state/config.rs:52` and TP §3.4.3 (the
minimum entry "read at every join, not copied"; it is copied at opening, `open_campaign/record.rs:66`); the test names
`tests/team_window_void_reasons.rs:31` and `:58` (they assert that the team may **not** void). New with Sprints 14 and
15: TP §3.4.9 names `sponsor_add_prize`, not `sponsor_join_campaign`, as the third instruction the pause refuses
(`docs/technical/TECHNICAL-PLAN.md:783-784`; TP §3.4.13's I10′ row is right; the branch's TP fixes it); TP §3.4.2's and §3.4.3's
`close_campaign` rows omit the wait for every `SealedFee` (`:502`, `:545`; the code: `close_campaign.rs:134-140`); the
late sealed entry's test still calls the founder's question open ("until the founder decides",
`tests/brot/sealed-late.test.ts:1-8`, `:38`), answered on 2026-10-13 (`docs/sprints/sprint-15-sponsorship.md:82-83`; TP
§14.2 S15-L1, `docs/technical/TECHNICAL-PLAN.md:2644`); the header of `src/error.rs:3-5` lists 6153 and 6160–6174 as
appended, not 6175–6177.

**G-6. `tally_late_joins` never checks its instruction data** (`tally_late_joins.rs::tally_late_joins` takes `_data`),
the only handler that skips `args`/`no_args` (`src/instructions/mod.rs:61-72`), against the order contract
(`src/checks.rs:6-7`). Harmless today; unchanged on the branch.

**G-7. Dead code in the crate.** `read_joins` (`src/instructions/entries/entry_account.rs:22-52`) and
`math::refund::split_late` (`src/math/refund.rs:19-35`) have no caller in any instruction. Whether LTO strips them from
the binary is **[to verify]**; removing them, or marking them test-only, shrinks what the firms read.

**G-8. No `mainnet` SBF binary was built** (closed at `8af10e2`). Since Sprint 16's CI (PR #87) every run builds the
`mainnet` variant (`.github/workflows/ci.yml:113-117`), runs the host and Mollusk tests on it (`:176-182`) and two
LiteSVM tests that a drill build fails (`:184-198`), and a run on `main` publishes it as `programs-mainnet-<sha>` after
two identical verifiable builds (`:369-443`, `:495-502`; `docs/technical/verifiable-build.md`). `main`'s run at
`8af10e2` (38491785973) succeeded in every job and published `programs-mainnet-8af10e2…`; its provenance job was
skipped because the repository is private (`ci.yml:504-511`). Left: the LiteSVM suites (instructions, refusals, slot
matrix, randomized run) run the default binary, which differs from the mainnet one in the feed list and
`DBC_GRADUATED_OPENS` only (§1).

**G-9. The mainnet program id is not in the code yet.** `src/lib.rs:23` declares the devnet id; the event authority
constant and bump (`src/constants.rs:37-39`) follow it, and so does the published mainnet build
(`docs/technical/verifiable-build.md`, "The mainnet build still declares the devnet program id"). The audited commit
must carry the final id (README, note 2).

**G-10. I10′ had no single test over every instruction.** At `8af10e2`, `tests/brot/invariant-program.test.ts:156`
starts from a campaign written straight into `Settling`, and Sprint 15's `tests/brot/sealed-pause.test.ts:33` and the
contest tests (§14) cover their own instructions; the rest run under a pause only when the randomized draw orders them
so. **Closed on the branch** (`c45e349`): `tests/brot/prefreeze-pause.test.ts` runs the 27 instructions of the IDL
under the pause through a real cycle, and an instruction added to the IDL fails it until it is walked there (§14).

**G-11. The randomized run opens price campaigns only** (`tests/brot/invariant-open.ts:44`, `:91`). The other five
kinds share the settlement code but no randomized run.

**G-12. A team key moves the 10% on automatic voids, and since Sprint 14 the admin on contested results.** A team key
may record `MissedWindow`, `StaleFeed`, `TeamHouseFailure` or `TeamOutsideCause` on any automatic void
(`void_reason.rs:23-31`; `team_void_campaign.rs:83-84`), which sends the held opening fee, and every sponsor's held 10%,
to the opener and the sponsors or to Brot (`src/math/void.rs:43-60`; `settle_sealed_fee.rs:170-176`). The admin's void of
a contested campaign picks from the same four (`resolution/contest_decision.rs:26-29`). Stated on the public powers page
(`content/powers.md`, "Record the cause of an automatic void", "Decide a contest at its second stage"); a trust
assumption, not a bug.

**G-13. `CreationParams.sol_usd_feed_id` is dead.** Validated non-zero (`src/state/config.rs:180-182`), stored and
emitted in `ConfigChanged`, read by no instruction (pricing, the sealed entry's included, uses `SOL_USD_FEED_ID`,
`open_campaign/payment.rs:65`).

**G-14. Error codes: unused ranges, and five variants the program never returns.** The allocation left 6098–6100,
6103–6105, 6118–6120, 6136–6140, 6142–6145, and since Sprints 14 and 15 6154–6159 and 6166–6169, unassigned
(`src/error.rs:19-366`); new codes start at 6178 (`:365`; the branch assigns 6178, `CutoffNotFinal`). Five declared
variants are returned by no instruction (a search of `src/`): `EntryBelowMinimum` 6065 (`src/error.rs:165-166`,
superseded by `BelowCampaignMinEntry` 6132), `ReaderNotReady` 6070 (`:177-178`, marked unused),
`AutomaticVoidNotInvertible` 6093 (`:232-233`), `ContestExitDisabled` 6096 (`:238-239`, no longer returned since
Sprint 14 enabled the contest) and `OneSidedFeesNotRecorded` 6130 (`:293-296`). They stay, since a code is never reused,
but their messages reach the IDL and the SDK's error map; a firm should not look for the paths that return them.

**G-15. `create_join` writes the `Join` header by hand.** It sets the tag and layout version directly
(`src/instructions/entries/join_record.rs:112-122`) instead of through `state::init`, which refuses an account that
already carries a tag (`src/state/mod.rs:97-112`; the house rule in `CLAUDE.md`). Safe as written, because
`checks::create_pda_account` has just refused any program-owned or data-carrying account (`src/checks.rs:139-143`), but
it is the one creation path outside the rule: Sprint 14's `ReferralLink` and Sprint 15's `SealedFee` go through
`state::init` (`referral/link_referrer.rs:79`; `entries/sealed_fee_account.rs:124`). `Join` has no `AccountState` impl
and is read by its own parser (`join_record.rs:40-76`).

**G-16. `tally_late_joins` had no instruction-level negative test.** At `8af10e2` its own refusals, `TallyNotReady`
6134 and `EntryAlreadyTallied` 6135, are named by no test, and its trailing `Join` accounts appear in no slot-matrix case
(the matrix covers the five named slots, 22 cases); an empty list, joins out of order, a join passed twice, one too
many, another baker's or another campaign's join are refused by the code (`tally_late_joins.rs::tally_late_joins`;
`src/instructions/entries/join_record.rs:40-76`) but shown only on the host parser (`tests/join_host_record.rs:51`,
`:71`). **Closed on the branch** (`c91b3eb`): `tests/brot/prefreeze-tally-refusals.test.ts` sends each refusal through
the program with its own error and nothing tallied; a read-only `Join` slot, or one aliased with a named slot, which fell
to the runtime's errors before, is refused by the program first (`tally_late_joins.rs::check_join_slots`, `NotWritable`
6007, `DuplicateAccount` 6015, marker `tally_join_slots`); the slot matrix gains the first `Join` slot, 9 cases (513 in
all).

The branch's adversarial review (read-only, recorded in its session log,
`session-log/2026-10-14-sprint-16-endurecimento-antes-do-congelamento.md` at `fcedeaf`) found the O-3 argument sound,
since the cluster's clock never goes back along a fork, found no legitimate payout the vault assertion refuses and no
test weakened, and left four items for the step before the freeze:

**S-1. Readers that ask for transaction version 0 only** (off-chain, outside the firms' scope; the review rates it
high). A node refuses a version-1 transaction to a caller that asks for version 0 at most: the indexer, the read API's
history, the site's activity and "my entries" and the team scripts would stop at a v1 transaction that names the
program, and the relay forwards version 0 only. On the branch the SDK's search for `CampaignResolved` (the re-check and
the keeper's second read) asks for version 1 and falls back to 0 when an RPC refuses the option
(`packages/sdk/src/read/recheck.ts`, commit `c74ab36`). Open for the others; it bears on what the services read and
count (points, the referral basis), never on what the program pays.

**S-2. A moved cut-off keeps the first proof's price** (low). The re-proof writes only `publish_time`
(`resolve_campaign/record.rs::move_cutoff`), so the stored `observed_value` stays the first proof's price, while the
re-read compares `observed_value` (§18.3) and the event of the move carries the earlier proof's reading. **Closed on the
follow-up branch** (`addf462`): the move also stores that proof's price; `observed_value` is read only by the re-read's
`same_reading`, never by a snapshot or a payout.

**S-3. On the branch, a rise of the rent-exempt minimum above the SOL sent by hand would refuse a close**
(informative). `close_campaign` compares the vault above its current rent with what the books still hold
(`bookkeeping.rs::require_books_covered`, §10); the rent is read from the sysvar at close.

**S-4. What the tests still do not draw** (informative): no randomized operation tallies only part of a baker's joins,
so O-3's case is shown by `tests/brot/prefreeze-partial-tally.test.ts` alone, and the pause walk opens no free team
campaign under the pause (`tests/brot/prefreeze-pause.test.ts`; the randomized run does, `tests/brot/invariant-open.ts:98`).

## 18. Sprint 14: the referral link and the contest

Plan and record: `docs/sprints/sprint-14-referral-second-read.md` (its "Record and retrospective", `:180-244`); TP
§3.4.2, §3.4.3, §3.4.7, §3.4.11. Merged into `main` with PR #92. Three instructions are new, `user_link_referrer` (22),
`reread_campaign` (23) and `admin_decide_contest` (24); `team_open_contest` (13) is enabled, with a one-byte argument;
`finalize_campaign` takes the lapse. The link, a contest's opening, its escalation and a re-read that escalates move no
lamport; the exits that pay run the snapshot every finalize path runs (§11). Paths below are under `src/instructions/`.
The slot checks of every instruction here are the shared ones of §13 (`MissingSignature` 6006, `NotWritable` 6007,
`DuplicateAccount` 6015, `WrongEventAuthority` 6016, `WrongProgramAccount` 6017, after `NotEnoughAccountKeys`), and
their slots are in the slot matrix: 16 cases for the link, 7 for the contest's opening, 13 for the re-read, 14 for the
decision (`tests/brot/slot-matrix.gen.ts:535-563`).

### 18.1 The referral link (`user_link_referrer`, `ReferralLink`)

The referee signs, once, the wallet that referred it, in `ReferralLink` at `["referral", referee]` (96 bytes, tag 4:
referee, referrer, `linked_at`, `linked_slot`; `src/state/referral.rs:16-35`), and pays its rent
(`referral/link_referrer.rs:42-94`).

| Check, in order | Code | Error | Tests |
|---|---|---|---|
| The arguments are exactly the 32-byte `referrer` | `link_referrer.rs:47` | `BadInstructionData` 6021 | `tests/referral_refusals.rs:134`; `tests/brot/referral-refuses.test.ts:121` |
| The referee signs and is writable, the link is writable, the System Program, the event slots | `link_referrer.rs:52-56` | the shared ones; `WrongSystemProgram` 6011 | `tests/referral_refusals.rs:50-118`; `referral-refuses.test.ts:44-115` |
| The link is the canonical PDA of the signer: no wallet can name another wallet's link | `link_referrer.rs:60-61` | `PdaMismatch` 6010 | `tests/referral_refusals.rs:77`; `referral-refuses.test.ts:72` |
| The referrer is neither the zero address nor the referee (`referrer_not_zero`, `referrer_not_referee`) | `link_referrer.rs:62`; `referral/rules.rs:15-20` | `InvalidReferrer` 6153 | `tests/referral_refusals.rs:120`, `:126`; `referral-refuses.test.ts:99`, `:104` |
| The address holds no link yet; one funded in advance is topped up | `link_referrer.rs:72-78` (`checks::create_pda_account`), then `state::init` (`:79`) | `AlreadyInitialized` 6014, `WrongOwner` 6005 | `tests/referral_link.rs:51`, `:64`; `referral-refuses.test.ts:33`, `:83`; `referral-link.test.ts:51` |

The event is `ReferralLinked` (`link_referrer.rs:87-93`; `src/events/referral.rs:17-30`), with no campaign and no `seq`. The config is
not read, so linking is never paused (`link_referrer.rs:14-15`; `tests/brot/referral-link.test.ts:70`). No instruction
changes or closes a link: 66 cases put a link in every writable slot of every instruction
(`tests/brot/referral-wallets.test.ts:54`), and wallet A cannot create, change or remove B's (`:24`). What the program
does not check: that the link comes before the referee's first entry (the indexer decides it by chain order,
`link_referrer.rs:15-16`; a link after the first entry is recorded, `referral-link.test.ts:81`), and that the referrer
is another person (a second wallet of the referee passes, `referral/rules.rs:1-3`; accepted risk, THREAT-MODEL §6).

### 18.2 Opening and escalating a contest (`team_open_contest(stage)`)

The act is the byte the team key signs, never the stored status (the second red-team pass's S1:
`docs/sprints/sprint-14-referral-second-read.md:226-231`): `1` opens a contest, `2` escalates one
(`resolution/team_open_contest.rs:1-21`, handler `:62-118`; rules `resolution/contest_rules.rs:32-106`). The result is
never touched; only the status, the stage, its deadline and `event_seq` are written (`team_open_contest.rs:103-108`).
No lamport moves; the pause never blocks it.

| Check, in order | Code | Error | X0.9 id | Tests |
|---|---|---|---|---|
| One byte of arguments | `team_open_contest.rs:67` | `BadInstructionData` 6021 | — | `tests/brot/contest-act.test.ts:52` |
| Slots: the team key signs, the campaign is writable, config ≠ campaign, the event slots | `team_open_contest.rs:68-74` | the shared ones | shared | 7 slot-matrix cases |
| The byte is 1 or 2 | `team_open_contest.rs:75`; `resolution/contest_rules.rs:34-40` | `BadInstructionData` 6021 | `contest_act` | `tests/contest_mollusk_act.rs:84`; `contest-act.test.ts:52` |
| The signer is a team key (before the campaign is read) | `team_open_contest.rs:84-85`; `resolution/contest_rules.rs:62-65` | `NotTeamMember` 6023 | `contest_team_key` | `tests/contest_mollusk_open.rs:54`; `tests/contest_mollusk_act.rs:94`; `tests/brot/contest-open.test.ts:57` |
| The act fits the campaign: byte 1 on a campaign already `Contested` is a retried or duplicate opening; byte 2 needs a `Contested` one | `team_open_contest.rs:88`; `resolution/contest_rules.rs:45-59` | `ContestAlreadyOpen` 6177; `NotContested` 6160 | `contest_already_open`; `contest_not_open` | `tests/contest_mollusk_act.rs:62`, `:74`; `contest-act.test.ts:24`, `:44` |
| Byte 1: `InReview`, inside the six-hour window (closed at its instant) | `team_open_contest.rs:95`; `resolution/contest_rules.rs:69-72`; `window.rs:17-30` | `TeamKeyOutsideReview` 6091, `ContestOutsideReview` 6095 | `contest_window` | `tests/contest_mollusk_open.rs:64`, `:75`; `contest-open.test.ts:57` |
| Byte 1: every entry tallied (the tally runs only `InReview`, so a contest opened before it could never be finalized by any of its exits) | `team_open_contest.rs:96`; `resolution/contest_rules.rs:99-106` | `NotTallied` 6114 | `contest_tallied` | `tests/contest_mollusk_open.rs:85`; `contest-open.test.ts:57` |
| Byte 2: the contest is at stage 1, before stage 1's deadline | `team_open_contest.rs:92`; `resolution/contest_rules.rs:74-87` | `WrongContestStage` 6161, `ContestDeadlinePassed` 6162 | `escalate_stage`; `escalate_deadline` | `tests/contest_mollusk_escalate.rs:83`, `:90`; `tests/brot/contest-escalate.test.ts:60` |
| The transition (`InReview` → `Contested`, or `Contested` → `Contested`) | `team_open_contest.rs:103`; `src/state/transitions.rs:20`, `:25` | `IllegalTransition` 6146 | — | `tests/state_transitions.rs:19-42` |

Byte 1 sets `contest_ends_at = now + 24 h` (`CONTEST_STAGE1_SECONDS`), byte 2 `now + 48 h` (`CONTEST_STAGE2_SECONDS`;
`team_open_contest.rs:90-98`, `:104`; `src/constants.rs:169-171`), and both emit `ContestOpened` 9 with the stage they
opened (`team_open_contest.rs:109-117`). A retried opening (a 429 after it landed, or a second team member on the same alert) is refused and
writes nothing; an opening and an escalation sent together in one transaction leave the contest at stage 2
(`contest-act.test.ts:24`, `:61`).

### 18.3 The re-read (`reread_campaign`)

Stage 1 of a contest. Any wallet, **at the top level only**, runs the campaign's reading again, now, through the reader
the resolution used, and compares it exactly with the stored result; it never writes a result
(`resolution/reread_campaign.rs:1-51`, handler `:78-150`; `resolution/contest_reread.rs:1-9`). No arguments; six slots:
the campaign and the config (writable: the open count, for the snapshot), the metric account, a proof account (price
kind; the program's own address offers none), the event slots.

| Check or step, in order | Code | Error | X0.9 id | Tests |
|---|---|---|---|---|
| No arguments; six slots | `reread_campaign.rs:83-87` | `BadInstructionData` 6021, `NotEnoughAccountKeys` | — | `tests/brot/contest-reread.test.ts:158` |
| The top level, before any account is read (no program can wrap a re-read in logic the transaction does not show) | `reread_campaign.rs:90`; `src/checks/top_level.rs:17-21` | `RereadNotTopLevel` 6165 | `top_level` | `contest-reread.test.ts:69` (forwarded by `tests/programs/cpi-proxy`) |
| Campaign and config writable and distinct; the event slots; both loaded | `reread_campaign.rs:91-98` | the shared ones, the loaders' | shared | 13 slot-matrix cases |
| `Contested`, at stage 1 | `reread_campaign.rs:99`; `resolution/contest_rules.rs:118-130` | `NotContested` 6160, `WrongContestStage` 6161 | `contest_status`; `contest_stage` | `tests/contest_mollusk_reread.rs:163`, `:178`; `contest-reread.test.ts:158` |
| The metric slot is the locked account | `reread_campaign.rs:100`; `resolution/contest_rules.rs:108-116` | `MetricAccountMismatch` 6045 | `reread_metric` | `tests/contest_mollusk_reread.rs:186`; `contest-reread.test.ts:158` |
| The reader runs on the stored campaign. An offered proof the reader reads (the price kind inside its proof window, `src/readers/mod.rs:139-151`) and refuses refuses the re-read with the reader's own error; a reader that cannot decide now, or that refuses the campaign's own metric account, is a different reading | `reread_campaign.rs:103-123`; `resolution/contest_rules.rs:177-186` | the reader's (`ReaderWrongOwner` 6001, `PriceWrongFeed` 6004, `ProofStale` 6084, `ProofDoesNotTouch` 6085, …) | `reread_proof` | `tests/contest_mollusk_bounds.rs:44`, `:52`, `:72`; `tests/brot/contest-proof.test.ts:62`, `:82` |
| "The same reading": outcome, void reason, `met_late` and observed value all equal; the publish time is evidence, not compared | `reread_campaign.rs:124`; `resolution/contest_reread.rs:45-55` | — | — | `tests/contest_reread.rs:56`, `:73` |
| The act (`reread_act`): a different reading opens stage 2 at once; the same one pays only from stage 1's deadline on, 24 hours after the contest opened | `reread_campaign.rs:126-142`; `resolution/contest_reread.rs:66-77`; `resolution/contest_rules.rs:89-97` | `RereadBeforeTimelock` 6176 | `reread_timelock` | `tests/contest_timelock.rs:30`, `:40`; `tests/contest_mollusk_reread.rs:74`; `contest-reread.test.ts:176` |

**Pay**: the snapshot with the stored outcome, as `team_confirm_result` runs it (`reread_campaign.rs:128-136`), then
`CampaignReread` 19 (same) and `CampaignFinalized`. **Escalate**: stage 2 until `min(now, stage 1's deadline) + 48 h`, so a
late re-read adds no time (review fix F3; `resolution/contest_reread.rs:79-93`; `tests/contest_mollusk_bounds.rs:85`;
`tests/contest_reread.rs:148`), then `CampaignReread` with `same` false. What "the same reading" means per family is
written at `reread_campaign.rs:27-51`: many correct results read differently hours later (a price feed that moved, a
curve's quote reserve, an epoch that ended), and each goes to a person at stage 2, the safe direction; the re-read runs
the readers' own code, so it cannot catch a reader's bug. That is why a matching re-read waits 24 hours, during which a
team key may escalate (the founder's answer to D2, 2026-10-13, `docs/sprints/sprint-14-referral-second-read.md:105-107`;
TP §3.4.7, "Why stage 1 waits"). The pause never blocks it (`contest-reread.test.ts:186`).

### 18.4 The admin's decision (`admin_decide_contest`)

Stage 2. Before its deadline the admin (the 2-of-3 multisig on mainnet) confirms the stored result or voids the
campaign with a reason a team key may choose and the hash of a published note; the snapshot follows at once
(`resolution/admin_decide_contest.rs:1-21`, handler `:64-116`; `resolution/contest_decision.rs`). Arguments: 34 bytes,
`decision` (`ContestDecision`: `Confirm` 0, `Void` 1, `src/state/enums.rs:130-137`), `void_reason`, `note_hash`.

| Check, in order | Code | Error | X0.9 id | Tests |
|---|---|---|---|---|
| The arguments' size; five slots; the admin signs, config and campaign writable and distinct, the event slots | `admin_decide_contest.rs:69-77` | `BadInstructionData` 6021; the shared ones | shared | 14 slot-matrix cases |
| The decision byte | `admin_decide_contest.rs:78`; `src/state/enums.rs:173` | `InvalidContestDecision` 6164 | — | `tests/contest_decision.rs:92`; `tests/contest_mollusk_decide.rs:127` |
| The reason byte | `admin_decide_contest.rs:79-80` | `BadInstructionData` 6021 | — | `tests/contest_mollusk_decide.rs:127` |
| The reason fits the decision: a `Confirm` names none; a `Void` names one a team key may choose (`MissedWindow`, `StaleFeed`, `TeamHouseFailure`, `TeamOutsideCause`) | `admin_decide_contest.rs:81`; `resolution/contest_decision.rs:16-32`; `void_reason.rs:23-31` | `ConfirmWithVoidReason` 6175, `VoidReasonNotForTeam` 6094 | `decide_confirm_reason`; `decide_void_reason` | `tests/contest_decision.rs:24`; `tests/contest_mollusk_decide.rs:127`; `tests/brot/contest-decide.test.ts:151` |
| The signer is the config's admin (a team key does not decide) | `admin_decide_contest.rs:86-87`; `resolution/contest_rules.rs:188-193` | `NotAdmin` 6022 | `decide_admin` | `tests/contest_mollusk_decide.rs:89`; `contest-decide.test.ts:142` |
| `Contested`, at stage 2 | `admin_decide_contest.rs:89`; `resolution/contest_rules.rs:118-130` | `NotContested` 6160, `WrongContestStage` 6161 | `contest_status`; `contest_stage` | `tests/contest_mollusk_decide.rs:98`, `:109`; `contest-decide.test.ts:151` |
| Before stage 2's deadline (its own second is already past it) | `admin_decide_contest.rs:90-91`; `resolution/contest_rules.rs:132-140` | `ContestDeadlinePassed` 6162 | `decide_deadline` | `tests/contest_mollusk_decide.rs:118`; `contest-decide.test.ts:151` |

**Never inverts**: `Confirm` keeps the stored outcome (YES, NO or an automatic void) and every stored field of the
result; `Void` records `Void` with the reason and the note's hash; no path writes YES or NO
(`resolution/contest_decision.rs:34-43`; `admin_decide_contest.rs:92-99`). Checked for each stored outcome over every decision
and reason byte, 65,536 pairs (`tests/contest_decision.rs:56`, "decide contest never inverts";
`tests/brot/contest-decide.test.ts:114`). A void's reason decides the 10% opening fee and every sponsor's held 10%, as
a team void does (§12). Then `ContestClosed` 20 and `CampaignFinalized` (`admin_decide_contest.rs:102-115`; `contest-decide.test.ts:43`). The
pause never blocks it (`contest-decide.test.ts:170`; `tests/contest_mollusk_decide.rs:81`). **With a team key's
contest, the admin can void a correct result**, which moves the 10% by the reason it records (TP §3.4.9,
`docs/technical/TECHNICAL-PLAN.md:776`): a power the founder accepted (THREAT-MODEL §6).

### 18.5 The lapse, and the 78-hour bound

A contest nobody decides lapses with the stored result: `finalize_campaign` takes a `Contested` campaign from stage 2's
deadline on, or from 48 hours after stage 1's deadline when nobody re-read it (`settlement/finalize_campaign.rs:46-48`;
`resolution/contest_rules.rs:142-175`): `ContestNotLapsed` 6163 before (`lapse_deadline`), `CampaignNotInReview` 6116 for a
contest with no stage (`lapse_stage`). The bound holds with or without a keeper (review fix F3,
`resolution/contest_rules.rs:13-15`): a contest opens at most 6 hours after the resolution, stage 1 ends 24 hours later, and stage
2's deadline, from the team's escalation (before stage 1's deadline) or from a re-read (counted from
`min(now, stage 1's deadline)`), and the lapse of an unread stage 1 are all at most 48 hours after that: **the payout is
due at most 78 hours (6 + 24 + 48) after the resolution**, and one team key can hold it at most 72 hours after its
contest opened (TP §3.4.7, "Worst case"). Tests: `tests/brot/contest-worst-case.test.ts:112` (78 hours, and refused one
second earlier), `:124` (the keeper down for a week: the unread stage 1 lapses), `:131` (a re-read a week late adds
nothing); `tests/contest_mollusk_decide.rs:150-205`; `tests/brot/contest-decide.test.ts:181`. The keeper finalizes a
lapsed contest and never acts as a team key or the admin (`docs/sprints/sprint-14-referral-second-read.md:240-242`;
`services/keeper/tests/contest-keeper.test.ts`; §20).

### 18.6 The transition table's rows

TP §3.4.2 (`docs/technical/TECHNICAL-PLAN.md:487-502`), as `src/state/transitions.rs:14-35` allows them:

| From | To | Instruction | Who | Condition | Code |
|---|---|---|---|---|---|
| `InReview` | `Contested`, stage 1 | `team_open_contest(1)` | a team key | inside the window, every entry tallied | `team_open_contest.rs:95-103` |
| `Contested`, stage 1 | `Contested`, stage 2 | `team_open_contest(2)` | a team key | before stage 1's deadline | `team_open_contest.rs:92`, `:103` |
| `Contested`, stage 1 | `Contested`, stage 2 | `reread_campaign`, a different reading | any wallet, top level | any time in stage 1 | `resolution/contest_reread.rs:83-93` |
| `Contested`, stage 1 | `Settling` | `reread_campaign`, the same reading | any wallet, top level | from stage 1's deadline on | `reread_campaign.rs:128-136` |
| `Contested`, stage 2 | `Settling` | `admin_decide_contest` | `admin` | before stage 2's deadline; confirm or void | `admin_decide_contest.rs:101` |
| `Contested` | `Settling` | `finalize_campaign`, the lapse | any wallet | stage 2 from its deadline; an unread stage 1 from 48 hours after its deadline | `finalize_campaign.rs:46-48` |
| `Contested` | `Settled` | any of the three exits, on a pot with no entry | as above | nothing left to settle (the lead's addendum, 2026-10-13) | `src/state/transitions.rs:26-30`; `settlement/snapshot.rs:96` |

There is no other way out of `Contested`: `resolve_campaign`, the tally and the team's confirm and void all require
`InReview` or `Open`, and `tests/state_transitions.rs:19-53` checks the 25 pairs. While contested, at either stage, no
payout moves a lamport (`tests/brot/contest-open.test.ts:82`).

### 18.7 The referral payout: what the program does not enforce

The program records who referred whom and nothing else (TP §3.4.11: "The program records only the link; the payout is
a service routine"). Everything below is off-chain, outside the firms' scope (§20), with its own tests:

- **Who is owed, and how much.** The indexer decides "before the first entry" by chain order (slot, the transaction's
  place in the block, the instruction), computes each winning entry's basis `(fee − from_fee) × entry ÷ V` from the
  events and checks it against the campaign's snapshot; 20% for 90 days to the referrer, the referee's rebate capped at
  0.05 SOL (`services/indexer/src/referral/`; `docs/sprints/sprint-14-referral-second-read.md:187-197`; TP §3.4.11).
- **Who pays.** A person signs each batch from an operations wallet; the routine prepares a signing file and no key is
  on the server (`scripts/referral/prepare.ts`; `services/indexer/src/referral/script.ts:1-10`).
- **Never twice.** Each transfer carries the memo `brot-referral:<batch>:<index>`; the signing file runs once and looks
  for each line's memo on chain before sending it, and a re-run pays nothing twice (R1; `scripts/referral/rehearse.ts:1-8`;
  `services/indexer/tests/referral-ledger.test.ts:88`).
- **A referrer that cannot be credited** (a sysvar, a builtin, an executable account, the operations wallet itself) is
  held for a person at prepare, every other line is simulated, and a failed line no longer stops the run (R2;
  `services/indexer/tests/referral-hold.test.ts:54`).
- **The cluster.** The file embeds the genesis hash and refuses another cluster; the RPC URL never reaches a command line
  (R4; `referral-hold.test.ts:116`).
- **Self-referral** is possible and its gain has a ceiling (accepted risk, P1 §3.9; THREAT-MODEL §6).

The privacy audit of the referral data is TP §8.5 (`docs/technical/TECHNICAL-PLAN.md:2332`). The routine is the one
exception to "no money decision reads the database" (TP §3.4.11, K-05).

## 19. Sprint 15: the sealed entry

Plan and record: `docs/sprints/sprint-15-sponsorship.md` (its "Record and retrospective", `:138-171`); TP §3.4.12
(`docs/technical/TECHNICAL-PLAN.md:914-944`) and §3.4.13's additions (`:971-976`). Merged into `main` with PR #89. Two
instructions are new, `sponsor_join_campaign` (25) and `settle_sealed_fee` (26), with the `SealedFee` account (tag 6) and
`Campaign.sealed_fees_open`; `close_campaign` waits for every held fee. `sponsor_add_prize` was deferred by the founder
and is not built, nothing reserved for it (`docs/sprints/sprint-15-sponsorship.md:140-142`). Paths below are under `src/instructions/`.

### 19.1 What a sealed entry costs: the floor, `max_lamports`, `expected_params_version`

A sponsor joins YES or NO with at least the config's `opening_fee_usd` (US$500, the founder's answer of 2026-10-13),
priced on-chain at the SOL/USD price exactly as a paid opening is (`entries/sponsor_join_campaign.rs:1-24`, handler
`:69-154`). Arguments, 33 bytes (`:44-67`): `side`, `entry_usd` (whole US$), `max_lamports`, `min_return_bps`,
`expected_entry_total`, `expected_params_version`. Slots, 12 (`:75-79`; `src/instructions/interface.rs:258-272`): the
ten of a join, with the sponsor as the baker, plus the SOL/USD account (7) and the sponsor's `SealedFee` (8).

| Check, in order | Code | Error | X0.9 id | Tests |
|---|---|---|---|---|
| Arguments, slots, the side byte; then the join's slot checks | `sponsor_join_campaign.rs:74-96`; `join_slots.rs:49-61` | `BadInstructionData` 6021, `InvalidSide` 6068, the shared ones | shared | 55 slot-matrix cases |
| The `SealedFee` slot is writable and none of the join's writable slots | `sponsor_join_campaign.rs:97-104`; `sealed_fee_account.rs:44-52` | `NotWritable` 6007, `DuplicateAccount` 6015 | `sealed_fee_distinct` | `tests/sealed_entry.rs:109`; `tests/brot/sealed-settle.test.ts:130` |
| The join core's rules in its order, the pause included (§7) | `join_core.rs:69-102` | as §7; `JoinWhilePaused` 6064 | — | `tests/brot/sealed-pause.test.ts:33` |
| Where a join names its amount: the creation rules' version the sponsor previewed is the config's (an admin change between preview and landing refuses the entry rather than charge a larger fee; red team L2) | `sponsor_join_campaign.rs:112-113`; `sealed_charge.rs:9-12`, `:29-32` | `CreationParamsChanged` 6090 | `sealed_terms` | `tests/sealed_entry.rs:78`; `tests/brot/sealed-entry.test.ts:175` |
| The charge: the opening's own `charge` for a signer that is not a team key, so a zero US$ is refused too; the SOL/USD account is the sponsored account of `SOL_USD_FEED_ID`, derived on-chain, fresh, tight, posted within the slot bound, charged at `price − conf` (§4.2) | `sponsor_join_campaign.rs:115`; `sealed_charge.rs:36-45`; `open_campaign/payment.rs:47-93` | row 7's codes for the account (`SolUsdAccountMismatch` 6055 … `SolUsdWrongFeed` 6089) | — | `tests/brot/sealed-entry.test.ts:124`; `tests/brot/sealed-sol-usd.test.ts:19` |
| The floor: `entry_usd ≥ opening_fee_usd` | `sealed_charge.rs:55-60` (row 7's `OpeningUsdBelowFee` renamed) | `SealedEntryBelowFloor` 6170 | `sealed_floor` | `tests/sealed_entry.rs:90`; `sealed-entry.test.ts:124` |
| The bound: the lamports charged ≤ the signed `max_lamports` | `sealed_charge.rs:62-68` (row 7's `OpeningAboveMaxLamports` renamed) | `SealedEntryAboveMaxLamports` 6171 | `sealed_max_lamports` | `tests/sealed_entry.rs:102`; `sealed-entry.test.ts:124` |
| An existing `SealedFee` names this campaign and this sponsor; a new one is the canonical PDA; the totals after this entry, with checked math, before anything moves | `sponsor_join_campaign.rs:116-123`; `sealed_fee_account.rs:57-95` | `SealedFeeMismatch` 6173, `PdaMismatch` 6010, `MathOverflow` 6000 | `sealed_fee_keys` | `tests/sealed_entry.rs:120`; `sealed-settle.test.ts:130` |
| Then the campaign's minimum on the entry part, the retry guard (`expected_entry_total`, T10), the estimate (`min_return_bps`) | `join_core.rs:104-144` | `BelowCampaignMinEntry` 6132, `EntryTotalMismatch` 6066, `ReturnBelowMinimum` 6067 | — | `sealed-entry.test.ts:159` |

The price and the split are §4.2's: `paid = ceil(entry_usd × 10^(9 − e) ÷ (price − conf))`, `entry = floor(paid ×
opening_prize_bps ÷ 10,000)` (90%), `fee = paid − entry` (10%, the rounding to Brot) (`src/math/opening.rs:45-78`).

### 19.2 The join core it shares, and the 10% held apart

The entry part (90%) joins the pot through the very path of a plain join (`join_core::join`, §7): the sponsor's `Entry`
(shared with any plain join of the same wallet), a `Join` record, the first-baker rule, the estimate, the deposit into
the vault with its assertion, `EntryAdded` (`sponsor_join_campaign.rs:112-125`; `join_core.rs:49-186`;
`tests/brot/sealed-entry.test.ts:94`). The fee part (10%) never enters the vault: after the join, the sponsor's
`SealedFee` (`["sealed", campaign, sponsor]`, 112 bytes, `src/state/sealed_fee.rs:16-40`) is created with the
sponsor's rent through `state::init`, or topped up, and the fee moves into it by System Program transfer signed by the
sponsor; the account's change must equal the fee (`sponsor_join_campaign.rs:127-128`; `sealed_fee_account.rs:97-144`).
The fee is bookkept in `fee_lamports`, never read from the account's lamports (I15; `src/state/sealed_fee.rs:24-26`), so
the campaign vault's books and its assertion are untouched (TP §3.4.12). `sealed_fees_open` grows by one when the
account is created (`sponsor_join_campaign.rs:129-137`), and `SealedFeeHeld` 21 records the US$, the lamports paid, the
entry and fee parts, the account's fee total and the SOL/USD price used (`:140-153`; `src/events/sealed.rs:16-44`).
A sealed entry is an entry like any other in a split, a one-sided pot and a void ("sealed entry follows the common
rule", `tests/brot/sealed-outcomes.test.ts:77-118`), and the creator share's base counts its entry part, never its fee
(I12).

### 19.3 `settle_sealed_fee`: where the 10% goes

Once the campaign is finalized, any wallet sends a sponsor's held fee **to the sponsor on a void the house caused**
(`MissedWindow`, `TeamHouseFailure`: `resolution/void_reason.rs:12-18`) **and to the fee vault in every other case**
(a split, a one-sided pot, a void by an outside cause), returns the account's rent to the sponsor, sends SOL sent to the
account by hand to the fee vault, closes it and decrements `sealed_fees_open` (P-4: the 10% follows the cause;
`settlement/settle_sealed_fee.rs:1-19`, handler `:44-120`). The amount is the stored `fee_lamports` and every
destination is stored or the fee vault: the caller chooses nothing.

| Check, in order | Code | Error | X0.9 id | Tests |
|---|---|---|---|---|
| No arguments; six slots; the four writable slots; the `SealedFee` apart from the campaign, the sponsor and the fee vault; the event slots | `settle_sealed_fee.rs:49-60` | `BadInstructionData` 6021, the shared ones | `distinct` (its own row) | `tests/sealed_settle.rs:170`; 33 slot-matrix cases |
| A `SealedFee` closed by an earlier call (the System Program's and empty) | `settle_sealed_fee.rs:62`, `:122-127` | `AlreadySettled` 6107 | `sealed_fee_settled` | `tests/sealed_settle.rs:159`; `tests/brot/sealed-settle.test.ts:95` |
| Its owner, length and tag, before its stored keys are read; the campaign's owner | `settle_sealed_fee.rs:63-65`, `:131-141` | `WrongOwner` 6005, `WrongLength` 6009, `WrongTag` 6008 | shared | slot matrix (stranger and type cases) |
| The stored campaign is the campaign passed | `settle_sealed_fee.rs:66`, `:143-147` | `SealedFeeMismatch` 6173 | `sealed_fee_campaign` | `tests/sealed_settle.rs:127`; `sealed-settle.test.ts:62` |
| The sponsor slot is the stored sponsor: the refund and the rent go nowhere else | `settle_sealed_fee.rs:67`, `:149-154` | `WrongSponsor` 6174 | `sealed_fee_sponsor` | `tests/sealed_settle.rs:144`; `sealed-settle.test.ts:62` |
| The campaign is `Settling` or `Settled`, so its outcome and void reason can no longer change | `settle_sealed_fee.rs:70`, `:156-165` | `NotFinalized` 6106 | `sealed_fee_finalized` | `tests/sealed_settle.rs:115`; `sealed-settle.test.ts:49` |
| The `SealedFee`'s PDA from the two slots, not from the stored keys; the fee vault's address | `settle_sealed_fee.rs:72-80` | `PdaMismatch` 6010 | — | slot matrix |
| The destination by the settle mode and the void's class; a finalized campaign with no mode is corrupt | `settle_sealed_fee.rs:71`, `:167-176` | `BadAccountData` 6019 | — | `tests/sealed_settle.rs:66`; `sealed-outcomes.test.ts:80-118` |

Then the moves: the rent (at most the account's current rent-exempt minimum) to the sponsor, with the fee on a refund;
the fee otherwise, and any surplus, to the fee vault (`settle_sealed_fee.rs:82-98`, `:108-110`); `SealedFeeSettled` 22
with `refunded` (`:112-119`). Lamports sent by hand go to the fee vault, and a `SealedFee` address funded in advance is still created
(`tests/sealed_settle.rs:94`; `sealed-settle.test.ts:106`). It never reads the pause (`sealed-pause.test.ts:33`). The
red team's two notes stand as written: the rent returned is the current rent, not the rent paid (I3), and a sponsor
address that could not be credited (I4) would keep the account, and with it the close, waiting
(`docs/sprints/sprint-15-sponsorship.md:159-161`; THREAT-MODEL §5.18).

### 19.4 `sealed_fees_open`, the close, and the late sealed entry

`Campaign.sealed_fees_open` (u32, the last four spare bytes, so the size stays 512; `src/state/campaign.rs:171-174`)
counts the campaign's live `SealedFee` accounts: one more when a sponsor's first sealed entry creates one
(`sponsor_join_campaign.rs:129-137`), one less at its settlement (`settle_sealed_fee.rs:99-104`; `InvariantViolated` 6101
below zero). `close_campaign` refuses while it is not zero (`close_campaign.rs:54`, `:131-140`; `SealedFeesOpen` 6172,
`sealed_fees_open`), because `settle_sealed_fee` reads the campaign's outcome to know where the fee goes
(`tests/sealed_settle.rs:189`). The keeper settles every open `SealedFee` before it plans the close and raises
`sealed_fee_open` when one stays open (`docs/sprints/sprint-15-sponsorship.md:166-171`;
`services/keeper/tests/sealed-keeper.test.ts`; `deploy/vps/runbooks/sealed-fee-open.md`).

**The late sealed entry.** A sealed YES entry the join lock admits after a touch the sponsored account does not show
yet, at or after the YES proof's `publish_time`, is late (§7): its 90% comes back whole, as any late entry's, and
**Brot keeps its 10%**, since the campaign is not a house-failure void. That is the founder's answer of 2026-10-13
(`docs/sprints/sprint-15-sponsorship.md:82-83`; TP §14.2 S15-L1, `docs/technical/TECHNICAL-PLAN.md:2644`), pinned by
`tests/brot/sealed-late.test.ts:38`, whose name and header still call the question open (G-5).

### 19.5 The pause, the invariants, and the evidence

`sponsor_join_campaign` is the third instruction the pause refuses (`JoinWhilePaused`, through the join core, before its
price is read), and `settle_sealed_fee` never pauses (§14; `tests/brot/sealed-pause.test.ts:33`, "paused campaign
refuses new money, never payouts"). The invariants it touches are §16's Sprint 15 additions (I1, I2, I5, I6, I8, I10′,
I12, I15). Two users: wallet A cannot settle, redirect or refund B's sealed fee (`tests/brot/sealed-settle.test.ts:62`).
The named tests of the brief: "sealed entry holds its 10 percent until the outcome" (`sealed-entry.test.ts:31`), "sealed
entry follows the common rule" (`sealed-outcomes.test.ts:77`), "paused campaign refuses new money, never payouts"
(`sealed-pause.test.ts:32`). The negative suite on Surfpool refused 461 of 461 cases with their own errors, and the
randomized test ran green on 35 seeds (`docs/sprints/sprint-15-sponsorship.md:154-157`). The ten markers and their plan
rows are in the README.

## 20. Out of scope, and why

| Out of scope | Why |
|---|---|
| The services: keeper pair, watchdog, indexer, `brot-rpc` relay, read API (`services/`, Sprints 06–08) | Off-chain; their wallets hold SOL for network fees only and have no on-chain privilege (TP §3.4.9). They call permissionless instructions whose amounts and destinations the program fixes, so a service bug delays or omits a call but cannot redirect money. They are actors in `THREAT-MODEL.md` §3. Since Sprints 14 and 15 the keeper also re-reads contests in stage 1 through a second RPC, finalizes lapsed ones and settles every `SealedFee` before a close; it never acts as a team key or the admin. Exception: the weekly referral payout (`scripts/referral/`, `services/indexer/src/referral/`), built in Sprint 14, moves the company's money from an operations wallet on a person's signature (TP §3.4.11); what the program does not enforce about it is §18.7, and it needs its own review |
| The site (`app/`), the provisional landing (`services/landing`), the Android app (Sprints 20–22) | Off-chain clients. They prepare transactions the user signs; the program re-checks every rule (TP §7, "never trust the client") |
| The SDK (`packages/sdk`, `@brot/sdk`) | A client library mirroring the program's math and rules for previews, and the deterministic summary of what a wallet signs (A-3). It cannot widen what the program accepts. Worth a separate review because users sign what it builds |
| The test-only `tests/programs/cpi-proxy` | Never deployed |
| The scripts (`scripts/`), deployment (`deploy/`), CI | Tooling; the build's integrity is Sprint 16's work: the verifiable build is in CI since PR #87 (`docs/technical/verifiable-build.md`), the attestation waits for a public repository (G-8) |
| Third-party programs and runtime: Pyth receiver and push oracle, Meteora DAMM v2 and DBC, SPL Token, SPL Stake Pool, the Vote program and `sol_get_epoch_stake`, the System Program, the BPF loader v3 | Not ours to audit; the program's assumptions about each are written as trust boundaries in `THREAT-MODEL.md` §4 |
| Pinocchio and its dependencies, as libraries | Their own audits and the version gap are in `PINOCCHIO.md`. No public audit covers the pinned versions, so `PINOCCHIO.md` §5 asks the firms to review the part of them this program calls (its §3) |
| The multisig product (Sprint 16, T7) | Chosen in Sprint 16; it holds the upgrade authority, `admin` and `fee_recipient` |
| Content (`content/`: powers table, void log, partners, account names) | Off-chain publication; the void log's hash is on-chain (`void_note_hash`), its text is not |
| Economics and law | The founder's decisions (no cap D-h, no list D-i, the creator controlling the measured account) are accepted risks, listed in `THREAT-MODEL.md` §6; whether a rule is wise is not the firms' question, whether the code does what the rule says is |
