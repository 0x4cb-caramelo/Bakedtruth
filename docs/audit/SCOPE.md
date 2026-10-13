# Brot Markets — audit scope

**Status:** draft for the Sprint 16 freeze, written on 2026-10-13 against `main` at `395efa5`; every `file:line`
points at that commit. Error codes are `BrotError` values (`src/error.rs`), returned as `ProgramError::Custom(code)`
(`src/error.rs:331-335`). "TP" is `docs/technical/TECHNICAL-PLAN.md`. **[to verify]** marks what nobody has checked.

**Paths.** `src/…`, `Cargo.toml` and the Rust test files `tests/<name>.rs` are under `programs/brot-markets/`; every
other path (`tests/brot/`, `tests/sdk/`, `tests/fixtures/`, `tests/programs/`, `scripts/`, `docs/`, `.github/`,
`knowledge-base/`, `content/`, `packages/`) starts at the repository root. A shorter path such as
`open_campaign/payment.rs`, `join_campaign.rs` or `settlement/rules.rs` names a file under `src/instructions/`; a bare
Rust file name is used only when the crate has one file of that name; a bare `….ts` test name is under `tests/brot/`.
`:N` repeats the file just named.

Contents: 1 What the firms read · 2 Accounts · 3 Instructions · 4 Opening · 5 Creation parameters · 6 Readers ·
7 Entries · 8 Resolution · 9 Review window · 10 Settlement · 11 Money math · 12 `VoidReason` · 13 `checks` and stored-key
comparisons · 14 Config, powers, pause · 15 Events · 16 Invariants · 17 Known open items · 18 Sprint 14 (pending) ·
19 Sprint 15 (pending) · 20 Out of scope.

## 1. What the firms read

- **The crate** `brot-markets` (`Cargo.toml:1-64`): all of `src/` (99 files, 9,709 lines at `395efa5`). It links
  `pinocchio =0.11.2`, `pinocchio-system =0.6.1` (`Cargo.toml:30-31`), `shank =0.4.9` (attributes only, `:34`) and
  `thiserror =2.0.21` (the error enum's derive, never called on-chain, `:38`). Clippy denies unchecked arithmetic and
  truncating or sign-losing casts (`Cargo.toml:60-63`); the release profile keeps `overflow-checks = true`
  (root `Cargo.toml:13-14`). `PINOCCHIO.md` covers the library itself.
- **The binary**: built with the `mainnet` feature only (`Cargo.toml:22`). `drill` (`:19`, devnet-only short windows)
  and `stake-at-least` (`:25`) cannot be combined with it (`src/constants.rs:142-145`, `:168-169`). In code, `mainnet`
  changes two things: the feed list (`src/feeds.rs:33-37`, `:53-118`) and `DBC_GRADUATED_OPENS`
  (`src/instructions/campaigns/open_campaign/rules.rs:27`). The time constants depend on `drill` alone
  (`src/constants.rs:171-198`); by refusing `drill`, `mainnet` guarantees the real ones, the same values as the default
  build. These are all the feature gates in `src/`. No `mainnet` SBF binary is built yet (README, note 1; gap G-8).
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

Every account the program owns starts with a one-byte tag and a one-byte layout version (`src/state/mod.rs:25-38`), has
a fixed little-endian layout of alignment 1 read in place (`src/layout.rs:73-122`), and is loaded owner first, then exact
length, tag, version, then the PDA re-derived from its stored bump (`src/state/mod.rs:49-84`). `state::init` refuses an
account that already carries a tag or version (`src/state/mod.rs:90-105`). Enums are stored as `u8` and decoded with a
refusal for any other byte (`src/state/enums.rs:129-163`).

| Account | Seeds | Size, tag | Layout | Created by, rent paid by | Closed by |
|---|---|---|---|---|---|
| `GlobalConfig` | `["config"]` | 400 bytes, tag 1 | `src/state/config.rs:71-100` | `admin_initialize_config`, the upgrade authority | never |
| Fee vault | `["fee_vault"]`, bump kept in the config | data-less | `src/state/config.rs:77-78` | `admin_initialize_config`, the upgrade authority | never; `sweep_fees` keeps its rent |
| `Campaign` | `["campaign", id u64 LE]`, `id` chosen by the client | 512 bytes, tag 2 | `src/state/campaign.rs:19-176` | `user_open_campaign`, the creator (`rent_payer`) | `close_campaign` |
| Campaign vault | `["vault", campaign]`, bump kept in the campaign | data-less | `src/state/campaign.rs:25` | `user_open_campaign`, the creator | `close_campaign` |
| `Entry` | `["entry", campaign, baker]` | 116 bytes, tag 3 | `src/state/entry.rs:16-49` | the baker's first `user_join_campaign`, the baker | `settle_entry` |
| `Join` | `["join", campaign, baker, index u32 LE]` | 96 bytes, tag 5 | `src/state/join.rs:16-40` | every `user_join_campaign`, the baker | `tally_late_joins` (its rent moves into the `Entry`) |
| `ReferralLink` | `["referral", referee]` | tag 4 reserved | `src/state/mod.rs:33` | Sprint 14 (§18) | — |

Seeds: `src/constants.rs:15-29`. The event authority `["__event_authority"]` is a constant with its bump
(`src/constants.rs:28-34`). Layout sizes are pinned by `tests/layout.rs` and checked against the IDL by
`tests/brot/idl.test.ts`.

## 3. Instructions

The first byte of the instruction data is the discriminator (`src/entrypoint.rs:19-79`, `src/instructions/mod.rs:27-52`);
the rest must be exactly the argument layout (`src/instructions/mod.rs:55-66`, `BadInstructionData` 6021). Every
instruction ends its accounts with the event authority and the program (§15). Accounts after the listed ones are ignored,
except the DBC config of `user_open_campaign` and the `Join` accounts of `tally_late_joins`.

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
| 9 | `user_join_campaign` | `entries/join_campaign.rs:65-203` | the baker | 10 | 21 | `EntryAdded` |
| 10 | `resolve_campaign` | `resolution/resolve_campaign.rs:36-97` | nobody (any caller), top level only | 5 | 0 | `CampaignResolved` |
| 11 | `team_confirm_result` | `resolution/team_confirm_result.rs:32-77` | a team key | 5 | 0 | `ResultConfirmed`, `CampaignFinalized` |
| 12 | `team_void_campaign` | `resolution/team_void_campaign.rs:49-101` | a team key | 5 | 33 | `CampaignVoided`, `CampaignFinalized` |
| 13 | `team_open_contest` | `resolution/team_open_contest.rs:14-21` | refuses every call (`ContestExitDisabled` 6096) | 5 | 0 | none |
| 14 | `finalize_campaign` | `settlement/finalize_campaign.rs:25-55` | nobody | 4 | 0 | `CampaignFinalized` |
| 15 | `settle_entry` | `settlement/settle_entry.rs:74-160` | nobody | 6 | 0 | `EntrySettled` |
| 16 | `settle_creator_share` | `settlement/settle_creator_share.rs:37-125` | nobody | 5 | 0 | `CreatorShareSettled` (none when reserved) |
| 17 | `collect_fee` | `settlement/collect_fee.rs:28-67` | nobody | 5 | 0 | `FeeCollected` |
| 18 | `settle_prize` | `settlement/settle_prize.rs:25-76` | nobody | 5 | 0 | `PrizeSettled` |
| 19 | `close_campaign` | `settlement/close_campaign.rs:31-108` | nobody | 6 | 0 | `CampaignClosed` |
| 20 | `sweep_fees` | `settlement/sweep_fees.rs:27-70` | nobody | 5 | 0 | `FeesSwept` |
| 21 | `tally_late_joins` | `settlement/tally_late_joins.rs:27-116` | nobody | 5 + the `Join` accounts | not read (gap G-6) | `LateTallied` |
| 0xFF | event (not an instruction) | `src/events/self_cpi.rs:84-91` | the event-authority PDA, only by self-CPI | 1 | the event | — |

Handler paths in the table are under `src/instructions/`. The account lists, in order, with their roles, are in
`src/instructions/interface.rs:24-216` (the Shank source of the IDL, `packages/sdk/src/idl/brot_markets.json`).

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
| 9 | No argument is text: the arguments are a fixed 94-byte layout; the sentence template is set by the program | `OpenCampaignArgs` at `open_campaign.rs:39-75`; `src/instructions/mod.rs:55-57`; template `open_campaign/record.rs:55`, `src/constants.rs:77` | `BadInstructionData` 6021 | `open-campaign-refuses.test.ts:139`; `tests/brot/open-campaign-team.test.ts:89` |
| 10 | The `Campaign` for `id` does not exist yet (the retry guard, §4.3); both accounts at canonical PDAs; a pre-funded address still opens | `open_campaign/create.rs:26-58`; `src/checks.rs:108-118`, `:132-148` | `AlreadyInitialized` 6014, `PdaMismatch` 6010, `WrongOwner` 6005 | `open-campaign-retry.test.ts:18`, `:36`, `:52`; `tests/brot/open-campaign-refuses-slots.test.ts:60` |

The slots themselves (`open_campaign.rs:96-103`): creator signer and writable, config, campaign and vault writable,
campaign ≠ vault, the System Program, the event slots; refused cases in
`tests/brot/open-campaign-refuses-slots.test.ts:26-60` and 32 slot-matrix cases (`tests/brot/slot-matrix.gen.ts:413`).
The SDK mirrors every row for the preview (`packages/sdk/src/read/validate/`) and is fed the program's own refused cases
(`tests/sdk/validate-open-*.test.ts`); that mirror is out of scope (§20) but shows the rows' intended order.

### 4.2 The Pyth-priced opening and `max_lamports` (T25)

`payment::charge` (`open_campaign/payment.rs:47-93`):

1. `opening_usd == 0`: a team key pays nothing and the SOL/USD slot is neither checked nor read; any other signer is
   refused (`:55-61`).
2. `opening_usd < opening_fee_usd` is refused, for a team key that adds a prize too (`:62-64`).
3. The SOL/USD account must be the sponsored account of the compiled `SOL_USD_FEED_ID` (`src/constants.rs:49-52`),
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
| `opening_fee_usd` (whole US$) | 1 to 5,000 | `src/constants.rs:68-69` | `src/state/config.rs:159-161` | `OpeningFeeUsdOutOfRange` 6030 | 500 |
| `opening_prize_bps` | 9,000 to 10,000 | `src/constants.rs:65`, `:57` | `src/state/config.rs:162-164` | `OpeningPrizeBpsOutOfRange` 6031 | 9,000 |
| `fee_bps` | ≤ 1,000 | `src/constants.rs:59` | `src/state/config.rs:165-167` | `FeeBpsAboveCeiling` 6032 | 1,000 |
| `one_sided_fee_bps` | ≤ 100 | `src/constants.rs:63` | `src/state/config.rs:168-170` | `OneSidedFeeBpsAboveCeiling` 6033 | 100 |
| `creator_share_bps` | ≤ 100 | `src/constants.rs:61` | `src/state/config.rs:171-173` | `CreatorShareBpsAboveCeiling` 6034 | 100 |
| `max_open_campaigns` | 1 to 10,000 | `src/constants.rs:75` | `src/state/config.rs:174-176` | `MaxOpenCampaignsOutOfRange` 6035 | 1,000 on devnet; mainnet `<<FILL AT FREEZE>>` |
| `min_entry_lamports` | 1,000,000 to 1,000,000,000 | `src/constants.rs:72-73` | `src/state/config.rs:177-179` | `MinEntryOutOfRange` 6036 | 10,000,000 |
| `sol_usd_feed_id` | not all zeros; read by nothing (gap G-13) | — | `src/state/config.rs:180-182` | `SolUsdFeedIdZero` 6037 | — |
| `max_price_age` (s) | 1 to 300 | `src/constants.rs:84` | `src/state/config.rs:183-185` | `MaxPriceAgeOutOfRange` 6038 | 120 on devnet; mainnet `<<FILL AT FREEZE>>` |
| `max_price_conf_bps` | 1 to 100 | `src/constants.rs:86` | `src/state/config.rs:186-188` | `MaxPriceConfOutOfRange` 6039 | 50 on devnet; mainnet `<<FILL AT FREEZE>>` |
| `campaign_max_age` (s) | 30 to 300 | `src/constants.rs:92`, `:94` | `src/state/config.rs:189-191` | `CampaignMaxAgeOutOfRange` 6040 | 120 on devnet; mainnet `<<FILL AT FREEZE>>` |

Every bound, one step inside and outside, is tested on the host (`tests/config_params.rs:69-192`) and through the
program (`tests/brot/admin-refusals.test.ts:77`, `:91`). The founder values are TP §3.4.1 and §14.4 C43.

**Compiled rules no admin can change** (all in `src/constants.rs` unless noted): `MAX_PRICE_CLOCK_LEAD_SECONDS` 60
(`:90`); `PRICE_CAMPAIGN_MAX_CONF_BPS` 50 (`:82`); `PRICE_TARGET_MAX_RATIO` 10 (`:98`); `MIN_SLOT_MS` 100 (`:102`);
`MIN_DISTANCE_BPS_*` 100, and 1,000 for DBC (`:130-137`); `EPOCH_START_SLOW_SLOT_MS` 500 (`:140`);
`PROOF_DELAY_SECONDS` 60 (`:158`); `STALE_FEED_MIN_SECONDS` 600 (`:163`); `MAX_DURATION_SECONDS` 90 days (`:152`);
`MIN_DURATION_SECONDS` 3 days, `REVIEW_WINDOW_SECONDS` 6 h, `ENTRY_CLOSE_MIN_SECONDS` 24 h (`:171-179`; drill values
`:181-190`); `ENTRY_CLOSE_BPS` 500 and `ENTRY_CLOSE_MAX_SECONDS` 7 days (`:154-156`); `DBC_MIN_GRADUATION_LAMPORTS`
85 SOL (`:192-198`); `JOIN_BUFFER_BPS` 100 (`src/instructions/entries/join_rules.rs:29`); `SOL_USD_FEED_ID`
(`src/constants.rs:49-52`); the feed lists (`src/feeds.rs:54-118` mainnet, `:123-141` devnet). The mainnet time values are checked by
`tests/math_schedule.rs:132-140`, which compiles only with `mainnet` (CI `ci.yml:153-156`).

**Initialization** (`admin/initialize_config.rs:41-105`): only the program's upgrade authority, read from its loader
v3 ProgramData account (`src/checks/upgrade.rs:17-44`), signs, pays both rents and chooses the first `admin` and
`fee_recipient` (both non-zero, `admin/initialize_config.rs:62-64`) and the parameters. Deploy and initialize happen in one session (TP §7;
Sprint 18). The mainnet arguments are part of what the firms should see (README, release block).

## 6. The six reader kinds

`ReaderKind` is closed (`src/state/enums.rs:17-26`); dispatch is a `match` per entry point
(`src/readers/mod.rs:100-137`). Each reader checks the owner before reading a byte, then an exact size and a
discriminator or layout, and returns an error, never a panic (`src/readers/mod.rs:8-11`); variable layouts are read
through the bounds-checked `Cursor` (`src/readers/cursor.rs:13-99`, tested in `tests/cursor.rs`). Readers are tested
on real mainnet bytes (`tests/fixtures/`, SHA-256 pinned in `tests/fixtures/index.json`).

| Byte | Kind | Owner checked | Account check | Row 3 | Join lock (`outcome_knowable`) | Resolution (`try_resolve`) | Opens on mainnet | Host tests |
|---|---|---|---|---|---|---|---|---|
| 0 | `PriceTouch` | Pyth receiver `rec2HH…` (`src/constants.rs:42`) | 134 bytes, discriminator, `Full`, the feed id (`src/readers/price_update.rs:58-100`); the sponsored PDA of the feed (`:118-126`) | `price_touch/target.rs:34-68` | `src/readers/price_touch.rs:76-94`, plus the buffer (§7) | `price_touch/proof.rs:51-124` | yes; feed list of 63 (`src/feeds.rs:54-118`) | `tests/price_reader.rs`, `price_opening.rs`, `price_join.rs`, `price_proof.rs`, `price_stale_feed.rs`, `price_target.rs`, `price_math.rs` |
| 1 | `SupplyAtMost` | classic SPL Token (`src/constants.rs:107`); Token-2022 refused | 82 bytes, `COption` tags 0 or 1, initialized, mint authority revoked (`src/readers/spl_mint.rs:48-69`, `:86-90`) | `spl_mint.rs:91-103` | supply ≤ target (`:109-111`) | `fact_resolution` (`:115-118`, `src/readers/shared.rs:103-126`) | yes | `tests/readers_spl_mint.rs` |
| 2 | `DammV2LockedAtLeast` | Meteora DAMM v2 `cpamdpZC…` (`src/constants.rs:111`) | 1,112 bytes, `Pool` discriminator, `permanent_lock_liquidity` at 552 (`src/readers/damm_v2.rs:48-69`) | `damm_v2.rs:78-90` | locked ≥ target (`:94-96`) | `fact_resolution` (`:100-103`) | yes | `tests/readers_damm_v2.rs` |
| 3 | `StakePoolTvlAtLeast { epoch }` | SPL Stake Pool `SPoo1Ku8…` (`src/constants.rs:118`) | `account_type` 1 and a Borsh walk to `last_epoch_total_lamports` (`src/readers/stake_pool.rs:65-116`); a pool more than one epoch behind is refused (`:128-130`) | `stake_pool.rs:133-142` | the measured epoch has started (`:149-151`) | the epoch snapshot, `MissedWindow` otherwise (`:158-190`) | yes | `tests/readers_stake_pool.rs`, `readers_epoch.rs` |
| 4 | `StakeAtLeast { epoch }` | Vote program (`src/constants.rs:120`) | a known version at its exact size, initialized (`src/readers/vote_stake.rs:57-87`); stake from `sol_get_epoch_stake` (`:91-95`) | `vote_stake.rs:128-137` | the measured epoch has started (`:144-146`) | in the epoch only, `MissedWindow` otherwise (`:153-174`) | **no**: `stake-at-least` is refused with `mainnet` | `tests/readers_vote_stake.rs`; YES only in Mollusk, `tests/stake_at_least_mollusk.rs` |
| 5 | `DbcGraduated` | Meteora DBC `dbcij3LW…` (`src/constants.rs:114`) | 424-byte `VirtualPool`, `TransferHookPool` refused (`src/readers/dbc_graduation.rs:88-118`); its own `PoolConfig` passed after the nine slots, priced in wSOL, threshold ≥ 85 SOL (`dbc_graduation/config.rs:43-80`) | target = threshold, curve not completed, ≥ 10% missing (`dbc_graduation.rs:135-152`) | stage ≥ 1 (`:157-159`) | `stamped_resolution` on `finish_curve_timestamp` (`:163-165`, `src/readers/shared.rs:141-165`) | **no**: `DBC_GRADUATED_OPENS` is false with `mainnet` | `tests/readers_dbc.rs`, `readers_dbc_opening.rs`, `readers_dbc_target.rs`, `readers_dbc_resolve.rs` |

Through the program in LiteSVM: `tests/brot/readers-price.test.ts`, `readers-facts.test.ts`, `readers-epoch.test.ts`,
`readers-dbc.test.ts`, `readers-dbc-adversarial.test.ts`, `resolve-campaign.test.ts`, `join-campaign-lock.test.ts`.
On a Surfpool mainnet fork in CI: `scripts/surfpool/price-touch.ts`; by hand, the DBC cycle
`scripts/surfpool/dbc-graduation.ts`.

**The price kind reads three accounts at three moments** (TP §3.4.8): at opening, only the feed's sponsored account
(`price_touch.rs:48-50`); at a join, only the stored `metric_account` (`join_campaign.rs:106-108`), which is that
sponsored account; at resolution, a YES proof from **any** Full account of the feed (`proof.rs:72-96`), so a newer
update pushed into the sponsored account cannot erase a touch, and after the proof window only the sponsored account
(`proof.rs:104-124`).

## 7. Entries (`user_join_campaign`)

Order (`entries/join_campaign.rs:10-17`): arguments; slots (`:80-90`); the config, read for the pause only (`:93-96`);
the campaign and its vault (`:99-102`); the metric account is the stored one (`:106-108`, `MetricAccountMismatch`); then
the rules below; then the entry, the join record, the deposit and the books. Paths under `src/instructions/entries/`.

| Rule | Code | Error | Tests |
|---|---|---|---|
| `Open` | `join_campaign.rs:110-112` | `CampaignNotOpen` 6062 | `tests/brot/join-campaign-refuses.test.ts:33` |
| Before `entries_close_at` (one clock read for this and the lock) | `join_campaign.rs:114-117` | `EntriesClosed` 6063 | `join-campaign-refuses.test.ts:44` |
| The join lock: the outcome is not knowable yet (§6), or the reader's own error | `join_lock.rs:47-66` | `OutcomeKnowable` 6073, `JoinPriceStale` 6082, `PriceExponentChanged` 6081, reader errors | `tests/brot/join-campaign-lock.test.ts:58-189`; `tests/brot/join-campaign-price.test.ts:35-88` |
| The proximity buffer (price): the sponsored band edge is at least 1% of the price from the target | `join_lock.rs:70-78`; `join_rules.rs:43-62` | `JoinBufferRefused` 6131 | `tests/join_host_buffer.rs:29-152`; `join-campaign-lock.test.ts:64` |
| The pause is off | `join_campaign.rs:120-122` | `JoinWhilePaused` 6064 | `join-campaign-refuses.test.ts:58`; `tests/brot/join-campaign-pot.test.ts:62` |
| `amount ≥` the campaign's own `min_entry_lamports`, copied at opening | `join_campaign.rs:123`; `join_rules.rs:32-37` | `BelowCampaignMinEntry` 6132 | `join-campaign-refuses.test.ts:65`; `tests/join_host_min_entry.rs` |
| `expected_entry_total` equals the baker's entry before this join (0 creates the `Entry`): a retried join fails instead of doubling (T10, A-9) | `entry_account.rs:58-105` | `EntryTotalMismatch` 6066, `EntryMismatch` 6069, `PdaMismatch` 6010 | `join-campaign-refuses.test.ts:73`, `:129` |
| The return estimate is at least the signed `min_return_bps` | `join_campaign.rs:151-163`; `src/math/payout.rs:131-151` | `ReturnBelowMinimum` 6067 | `join-campaign-refuses.test.ts:92`; `tests/math_estimate_properties.rs` (see O-2) |
| The side byte is YES or NO | `join_campaign.rs:77` | `InvalidSide` 6068 | `join-campaign-refuses.test.ts:108` |

Effects: the first join creates the `Entry` at its canonical PDA with the baker's rent (`entry_account.rs:79-105`) and
counts it in `entries_open` and `entries_untallied` (`join_campaign.rs:126-136`); the wallet whose join lands in an
empty pot (by the books) becomes `first_baker`, exempt from the one-sided fee on its whole entry (`:140-144`); every join
creates a `Join` record at `["join", campaign, baker, join_count]` with the baker's rent (`join_record.rs:92-124`,
`:148-167`); the amount moves by System Program transfer and the vault's change must equal it (`join_campaign.rs:179-182`);
the books follow (`:183-187`). No instruction moves an entry out before settlement (no exit, BR-12). Two wallets: A cannot
change, close or redirect B's `Entry` (`tests/brot/join-campaign-wallets.test.ts:19`). Slot refusals:
`tests/brot/join-campaign-slots.test.ts:22-59` and 43 slot-matrix cases.

**Late joins** (price kind, YES only): a join at or after the YES proof's `publish_time` is refunded whole, neither paid
as a winner nor charged as a loser (`join_tally.rs:21-44`; `src/instructions/settlement/rules.rs:46-97`). Tests:
`tests/brot/late-entries.test.ts:27`, `tests/join_host_tally.rs`, `tests/brot/invariant-rules.test.ts:130-169`.

## 8. Resolution (`resolve_campaign`)

Any wallet; it chooses nothing but the proof account it offers (`resolution/resolve_campaign.rs:6-18`). Order:
no arguments; five slots; `checks::top_level` before any account is read (`:47`, `ResolveNotTopLevel` 6071); the
campaign writable and loaded; status `Open` (or `InReview` for a re-proof) (`:53-56`, `CampaignNotOpen` 6062); the metric
account is the stored one (`:57-59`); the reader decides (`:80-83`, `NotResolvableYet` 6072); `record::write` stores
`InReview`, the outcome, the void reason, `met_late`, `observed_value`, `resolved_at`, `review_ends_at = now + 6 h` and,
for price, the YES proof's `publish_time` (`resolve_campaign/record.rs:31-67`). No lamport moves. A caller with no proof
passes the program's own address in the proof slot (`resolve_campaign.rs:73`).

| Family | Before the deadline | After the deadline | Code |
|---|---|---|---|
| Irreversible fact (`SupplyAtMost`, `DammV2LockedAtLeast`) | met: YES; not met: `NotResolvableYet`; unreadable: refused | NO, `met_late` if met; unreadable: `Void(UnreadableAccount)` | `src/readers/shared.rs:103-126` |
| Stamped fact (`DbcGraduated`) | completed: YES; else `NotResolvableYet` | completed with a stamp at or before the deadline: YES; later or no stamp: NO `met_late`; not completed: NO; unreadable: void | `src/readers/shared.rs:141-165` |
| Epoch snapshot (`StakePoolTvlAtLeast`, `StakeAtLeast`) | in the measured epoch: YES or NO | epoch missed: `Void(MissedWindow)`; unreadable: `Void(UnreadableAccount)` | `src/readers/stake_pool.rs:158-190`; `src/readers/vote_stake.rs:153-174` |
| Price touch | up to D + 60 s: only a YES proof; without one, `NotResolvableYet` | after D + 60 s: NO; `Void(StaleFeed)` when the sponsored `publish_time ≤ D` and `< D − max(max_age, 600 s)`; unreadable or changed exponent: `Void(UnreadableAccount)` | `src/readers/price_touch/proof.rs:51-124` |

The YES proof (`proof.rs:72-96`): Full update of the feed at any address, the stored exponent
(`PriceExponentChanged` 6081), a positive price (`PriceNonPositive` 6049), `publish_time` inside `[opens_at, deadline]`
(`ProofOutsideWindow` 6083), at most 60 s old and 60 s ahead, posted within 600 slots (`ProofStale` 6084), and the whole
confidence band past the target (`ProofDoesNotTouch` 6085). **`StaleFeed`** rests on the push oracle never writing an
older update into the sponsored account (`proof.rs:14-33`; `knowledge-base/tecnologia/pyth-leitor-de-preco.md:268-310`).

**The re-proof (cut-off move).** A YES price campaign in review may move `publish_time` back to an earlier valid YES
proof, only while no entry is fully tallied; outcome and window stay (`resolve_campaign.rs:61-69`, `:85-91`;
`resolve_campaign/record.rs:100-111`; `CutoffNotMovable` 6147). See O-3.

Tests: `tests/brot/resolve-campaign.test.ts:45-154` (the table, row by row), `tests/brot/resolve-refuses.test.ts:52-133`
(top level, every refusal), `tests/brot/price-proof.test.ts:47-134`, `tests/brot/cutoff-reproof.test.ts:21`,
`tests/resolve_record.rs`, `tests/price_proof.rs`, `tests/price_stale_feed.rs`.

## 9. The review window

A team key acts only while the campaign is `InReview` and before `review_ends_at`
(`resolution/window.rs:11-30`; `TeamKeyOutsideReview` 6091, `OutsideReviewWindow` 6092; the instant it ends is
closed). After the window, any wallet finalizes (§10).

| Instruction | What it does | Code | Errors | Tests |
|---|---|---|---|---|
| `team_confirm_result` | Ends the window now; the outcome stands; runs the snapshot at once (`Settling`, or `Settled` with no entry) and emits `ResultConfirmed` then `CampaignFinalized` | `resolution/team_confirm_result.rs:32-77` | `NotTeamMember` 6023, the window's, `NotTallied` 6114, the snapshot's | `tests/brot/team-window.test.ts:128-175`; `tests/brot/team-window-events.test.ts:61` |
| `team_void_campaign(reason, note_hash)` | Only an **automatic** void (stored outcome `Void`): records the team's reason and note hash, runs the snapshot in `Refund`. A YES or NO is never voided by a person | `resolution/team_void_campaign.rs:49-101`; `void_reason.rs:23-42` | `TeamVoidNotAutomatic` 6097, `VoidReasonNotForTeam` 6094, `BadInstructionData` 6021 for a reason byte past the enum, the window's | `team-window.test.ts:57-126`; `team-window-events.test.ts:88`; `tests/team_window_void_reasons.rs` |
| `team_open_contest` | Disabled until Sprint 14: every call refused, nothing changes, so `Contested` is unreachable | `resolution/team_open_contest.rs:14-21` | `ContestExitDisabled` 6096 | `team-window.test.ts:166` |

The status moves of the team instructions go through the transition table (`src/state/transitions.rs:13-30`;
`team_confirm_result.rs:60`; `team_void_campaign.rs:81`), checked over all 25 status pairs in
`tests/state_transitions.rs:20-52`. Consequence auditors should keep in mind: once `resolve_campaign` records YES or NO,
nothing on-chain can change it (gap G-3).

## 10. Settlement, payouts and the reserve path

Order a keeper follows: `tally_late_joins` for every baker → `finalize_campaign` (or a team confirm or void) →
`settle_entry` for every `Entry` → `settle_creator_share` → `collect_fee` → `settle_prize` → `close_campaign` →
`sweep_fees` (TP §3.4.5, §3.4.19). Every one is permissionless and chooses nothing: amounts come from the snapshot,
destinations are stored keys or the fee vault. Paths under `src/instructions/settlement/`.

| Instruction | Gate | Effect | Code | Errors | Tests |
|---|---|---|---|---|---|
| `tally_late_joins` | `InReview`; the `Join` accounts passed in index order from `joins_tallied` | Reads and closes each `Join` (owner, length, tag, campaign, baker, index, PDA), moves its rent into the `Entry`, adds late amounts (YES price only) to entry and campaign; decrements `entries_untallied` when the entry's last join is closed | `tally_late_joins.rs:27-116`; `src/instructions/entries/join_tally.rs:60-78`; `src/instructions/entries/join_record.rs:40-76` | `TallyNotReady` 6134, `EntryAlreadyTallied` 6135, `JoinAccountsMismatch` 6133, `EntryMismatch` 6069 | `tests/join_host_tally.rs`; `tests/join_host_record.rs`; randomized run (`tests/brot/invariant-review.ts:158-178`); no instruction-level refusal test (G-16) |
| `finalize_campaign` | `InReview`, `now ≥ review_ends_at`, every entry tallied | The snapshot (§11): mode, totals, fee, creator share, `distributable`; `Settling`, or `Settled` with no entry; decrements `open_campaigns` for a paid campaign (I7) | `finalize_campaign.rs:25-55`; `settlement/snapshot.rs:76-124` | `CampaignNotInReview` 6116, `ReviewNotEnded` 6117, `NotTallied` 6114, `NoProofTime` 6115, `IllegalTransition` 6146, `SnapshotInconsistent` 6102, `InvariantViolated` 6101 | `tests/settle_host_finalize.rs:48-236`; `tests/brot/invariant-program.test.ts:204` |
| `settle_entry` | `Settling`; the entry's joins all tallied | Pays the entry its amount under the mode, credits the `Entry`'s lamports (its rent, the joins' rents) to the stored baker, closes the `Entry`; the last one moves the campaign to `Settled` | `settle_entry.rs:74-160`; `settlement/rules.rs:50-97`; `bookkeeping.rs:27-53` | `AlreadySettled` 6107, `EntryNotOnCampaign` 6113, `WrongBaker` 6108, `NotFinalized` 6106, `NotTallied` 6114, `PayoutExceedsSnapshot` 6112 | `tests/settle_host_rules.rs:34-129`; `invariant-program.test.ts:89`, `:185`; `tests/brot/late-entries.test.ts:27` |
| `settle_creator_share` | `Settling` or `Settled`; `Split`, not a team campaign, share > 0 | Pays `from_pot + from_fee` to the stored creator once; **if that would leave an empty wallet below its rent-exempt minimum, reserves it in the vault** (`creator_share_reserved`, no event); a later call from a funded wallet claims it | `settle_creator_share.rs:37-125`; `settlement/rules.rs:99-130` | `NotFinalized` 6106, `WrongCreator` 6110, `CreatorShareNotDue` 6109, `AlreadySettled` 6107, `ReserveNotClaimable` 6111 | `tests/settle_host_rules.rs:150`, `:162`; `tests/sdk/prepare-claim.test.ts:46` |
| `collect_fee` | finalized, `entries_open == 0`, once | Moves what Brot keeps to the fee vault: `Split` fee − `from_fee` + opening fee; `OneSided` the recorded one-sided fees + opening fee; `Refund` the opening fee unless a house failure with entries | `collect_fee.rs:28-80`; `collect_fee/amount.rs:98-128` | `NotFinalized` 6106, `CampaignNotSettled` 6121, `FeeAlreadyCollected` 6125, `PdaMismatch` 6010 | `tests/settle_d_amounts.rs:53-174`; `tests/settle_d_collect_prize.rs:65-110` |
| `settle_prize` | finalized, once | Returns the prize to the stored creator in `OneSided` and `Refund`, plus the opening fee on a house-failure void; in `Split` it moves nothing and sets the flag | `settle_prize.rs:25-76`; `collect_fee/amount.rs:60-93`, `:131-145` | `NotFinalized` 6106, `PrizeAlreadySettled` 6126, `WrongCreator` 6110 | `tests/settle_d_collect_prize.rs:113-148`; `tests/brot/void-refund.test.ts:52` |
| `close_campaign` | `Settled`, no entry open, fee, prize and share flags set; a reserved share only if the creator is the rent payer | Vault dust and hand-sent surplus, and the campaign's surplus over its rent, to the fee vault; both rents (and a reserved share) to the stored `rent_payer`; both accounts zeroed and given to the System Program | `close_campaign.rs:31-127`; `src/checks/close.rs:17-23` | `AlreadyClosed` 6124, `CampaignNotSettled` 6121, `ReserveNotClaimable` 6111, `RentPayerNotStored` 6128, `InvariantViolated` 6101 | `tests/settle_d_close_sweep.rs:73-116`; `tests/brot/close-sweep.test.ts:47`, `:74`; `tests/brot/close-reserve.test.ts:52`, `:63`; `tests/brot/close-revival.test.ts:27` |
| `sweep_fees` | the recipient is the stored `fee_recipient` and not the fee vault | Moves the fee vault's lamports above its rent-exempt minimum to `fee_recipient` | `sweep_fees.rs:27-70` | `FeeRecipientMismatch` 6129, `FeeRecipientIsFeeVault` 6122, `NothingToSweep` 6123 | `tests/settle_d_close_sweep.rs:118-151` |

**The reserve path below rent** (TP §3.4.5). The runtime refuses a transaction that leaves an account with a positive
balance below its rent-exempt minimum. Only the creator share is routed around it: `plan_credit` reserves when
`wallet + amount < Rent::minimum_balance(0)` (`settlement/rules.rs:108-117`, read from the Rent sysvar in
`settle_creator_share.rs:75`), and `claimable` pays the reserve once the wallet with it reaches the minimum
(`settlement/rules.rs:121-130`). `close_campaign` pays a reserve with the rents when the creator is the rent payer
(`close_campaign.rs:60`, `:71-78`, `:113-119`), which is always the case today (`open_campaign/record.rs:53`), and
emits nothing for it (O-5). Entries are safe without it: a settled `Entry` credits at least its own rent
(`settle_entry.rs:132`, `:147`), above an empty account's minimum (TP §3.4.5). `settle_prize` and `sweep_fees` have no
reserve path: they rely on the amounts being above the minimum (`THREAT-MODEL.md` §5.13).

Lamport moves out of program accounts are plain balance edits (`bookkeeping.rs:27-53`; `collect_fee/moves.rs:19-34`);
the runtime checks the instruction's lamport sum. The vault's balance is never read as a pot: every amount comes from
the campaign's books.

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

The snapshot's own sums are asserted in the program at every finalize path (`src/math/invariant.rs:45-95`, called at
`settlement/snapshot.rs:98-100`). Vectors: 24,000 rows generated by the Rust functions (`tests/math_vectors.rs`,
`tests/math_vectors_snapshot.rs`) and replayed by the SDK's TypeScript mirror in Bun and on Hermes
(`tests/sdk/math-vectors.test.ts`, `tests/sdk/snapshot-vectors.test.ts`). Worked examples A, B and C of TP §3.4.16:
`tests/math_payout.rs`, `tests/math_snapshot_split.rs`, `tests/math_snapshot_modes.rs`. Properties over random pots:
`tests/math_payout_properties.rs` (I3′, I6, I9, I11, I13), `tests/math_snapshot_invariant.rs`.

## 12. `VoidReason` and the 10% path (T23)

The 10% opening fee is held in the vault until the outcome (`opening_fee_lamports`). On a void, the reason decides it:

| Reason (byte) | Written by | Class | The 10% opening fee | A team key may record it |
|---|---|---|---|---|
| `MissedWindow` (1) | `resolve_campaign` (epoch kinds) | house failure | back to whoever opened | yes |
| `UnreadableAccount` (2) | `resolve_campaign` | outside cause | kept by Brot | no (`VoidReasonNotForTeam` 6094) |
| `StaleFeed` (3) | `resolve_campaign` (price) | outside cause | kept by Brot | yes |
| `TeamHouseFailure` (4) | `team_void_campaign` | house failure | back to whoever opened | yes |
| `TeamOutsideCause` (5) | `team_void_campaign` | outside cause | kept by Brot | yes |

The class is written three times, and the three copies must agree: `src/math/void.rs:21-31` (the snapshot),
`src/instructions/settlement/collect_fee/amount.rs:39-47` (`collect_fee`, `settle_prize`) and
`src/instructions/resolution/void_reason.rs:13-18` (`collect_fee/amount.rs:6` says "unify at integration"). The prize
always returns whole to whoever opened. **A campaign with no entry at all keeps the opening fee whatever the reason**
(founder answer 8; `src/math/snapshot.rs:150-156`; `src/instructions/settlement/collect_fee/amount.rs:76-93`); a pot whose only joins were late is not "no entry"
(`src/math/snapshot.rs:149`; `tests/review_money_fixes.rs:32-63`). A team key re-labels an automatic void, and with it moves the
10% between Brot and the opener (gap G-12). Tests: `tests/brot/team-window.test.ts:57-126`,
`tests/brot/void-refund.test.ts:52`, `tests/team_window_void_reasons.rs`, `tests/math_snapshot_void.rs`,
`tests/settle_d_amounts.rs:104-144`.

## 13. The `checks` module, and the explicit stored-key comparisons

`src/checks.rs` and `src/checks/` hold every check Anchor used to generate (TP §3.4.17). The order contract inside an
instruction is written at `src/checks.rs:6-11`. Each check, its negative tests and its mutation row are tabled in
`README.md` ("The `checks` module"). The account loaders that run those checks are `src/state/mod.rs:49-105` and
`src/state/campaign/loaders.rs:15-47`.

The comparisons with stored keys (Anchor's `has_one` and constraints) are written in the instructions:

| Comparison | Code | Error | Test |
|---|---|---|---|
| The join's metric account is the campaign's | `src/instructions/entries/join_campaign.rs:106-108` | `MetricAccountMismatch` 6045 | `tests/brot/join-campaign-refuses.test.ts:119` |
| The resolution's metric account is the campaign's | `src/instructions/resolution/resolve_campaign.rs:57-59` | `MetricAccountMismatch` 6045 | `tests/brot/resolve-refuses.test.ts:78` |
| An existing `Entry` names this campaign and this baker | `src/instructions/entries/entry_account.rs:66-68`, `:116-118` | `EntryMismatch` 6069 | `join-campaign-refuses.test.ts:129` |
| The settled `Entry` names this campaign and this baker | `src/instructions/settlement/settle_entry.rs:96-105` | `EntryNotOnCampaign` 6113, `WrongBaker` 6108 | `tests/brot/invariant-program.test.ts:185` |
| A `Join` names this campaign, this baker and the expected index | `src/instructions/entries/join_record.rs:49-51` | `JoinAccountsMismatch` 6133 | `tests/join_host_record.rs` |
| The share and prize recipient is the stored creator | `settle_creator_share.rs:59-61`; `settle_prize.rs:50-53` | `WrongCreator` 6110 | `invariant-program.test.ts:185`; `tests/settle_d_collect_prize.rs:136` |
| The close's rent payer is the stored one | `close_campaign.rs:53-56` | `RentPayerNotStored` 6128 | `tests/brot/close-sweep.test.ts:74`; `tests/settle_d_close_sweep.rs:96` |
| The sweep's recipient is the stored `fee_recipient` | `sweep_fees.rs:44-47` | `FeeRecipientMismatch` 6129 | `tests/settle_d_close_sweep.rs:118` |
| The vault is the campaign's own (owner, then PDA with the stored bump) | `src/checks/paying.rs:29-37`; in the join `join_campaign.rs:101-102` | `WrongOwner` 6005, `PdaMismatch` 6010 | `tests/brot/join-campaign-slots.test.ts:59`; `tests/settle_d_collect_prize.rs:90` |
| The fee vault is the canonical `["fee_vault"]` (close and collect) or at the config's bump (sweep) | `collect_fee/moves.rs:43-46`; `sweep_fees.rs:52-53` | `PdaMismatch` 6010 | `tests/settle_d_close_sweep.rs:131` |
| The signer is the admin, a team key, or the pending admin | `src/instructions/admin/shared.rs:24-30`; `src/state/config.rs:127-135`; `accept_admin.rs:33-38` | `NotAdmin` 6022, `NotTeamMember` 6023, `NoPendingAdmin` 6025, `NotPendingAdmin` 6024 | `tests/brot/admin-refusals.test.ts:19`, `:46`, `:69`; `tests/team_window_rules.rs:158-167` |

These comparisons are not in the mutation plan (X0.9 covers `checks` bodies); they are covered by the tests above and by
the slot matrix (README).

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
| Resolve, finalize, tally, settle, collect, return the prize, close, sweep | any wallet | amount and destination fixed by the program | §8, §10 |
| Move a baker's entry, or any vault lamport, by instruction | nobody | no such instruction | — |

**The pause (I10′).** Only `user_open_campaign` and `user_join_campaign` read `operating_level`
(`open_campaign.rs:107-109`; `join_campaign.rs:93-96`, `:120-122`); no other instruction reads it (a search of `src/`
finds it written only by the pause, the resume and the initialization). A team key pauses, only the admin resumes
(`tests/brot/admin.test.ts:142`). Tests: `tests/brot/admin-pause.test.ts:18`, `tests/brot/invariant-program.test.ts:156`,
`tests/brot/join-campaign-pot.test.ts:62`, `tests/brot/open-campaign-refuses-payment.test.ts:103`, and the randomized
run, which draws pause and resume among its operations (`tests/brot/invariant-ops.ts:179-180`) and expects only joins and
openings to refuse (`tests/brot/invariant-open.ts:50`, `:97`, `:140`). See gap G-10.

The public table of powers, `content/powers.md`, states the same powers for devnet.

## 15. Events by self-CPI

Every instruction emits one event (two for confirm and void) as an inner instruction to this program with data
`[0xFF, discriminator, payload]` and one account, the event authority PDA `["__event_authority"]`, signing through
`invoke_signed` (`src/events/self_cpi.rs:39-58`, `:62-78`). The handler of `0xFF` succeeds only when its first account is
the event authority and signed, which only this program can bring about (`self_cpi.rs:84-91`); a top-level call is
`WrongEventAuthority` 6016. Both trailing slots are checked before anything else is read
(`src/checks.rs:160-171`) and again in `emit` (`self_cpi.rs:46`). Discriminators are positional, appended, never reused
(`src/events.rs:24-27`, `:76-87`; `src/events/campaign.rs:139-147`; `src/events/review.rs:59-67`;
`src/events/finalize.rs:79-87`; `src/events/payout.rs:92-106`): `ConfigInitialized` 0 … `LateTallied` 17 (`ContestOpened` 9 is never emitted today). Every
campaign event carries the campaign and a contiguous `seq` from `Campaign.event_seq`; config events and `FeesSwept`
carry none. The buffer is sized at compile time for the largest event (`self_cpi.rs:25-30`, `:66-71`). Tests:
`tests/brot/events.test.ts:70-197` (one event per instruction, contiguous `seq`, a forged top-level call refused, a
failed transaction keeps no event), `tests/event_cpi.rs:35-71`, `tests/brot/team-window-events.test.ts:61`, `:88`;
the decoder rules (off-chain) in `tests/sdk/decoder.test.ts:55-142` and `tests/sdk/contract-events.test.ts:27-52`.

## 16. Invariants I1–I15 (TP §3.4.13)

"In program" means an assertion the instruction itself makes; everything else is checked by tests. The randomized
test (`tests/brot/invariants.test.ts`, seed `0x0badc0de`, 1,200 operations, `:16-18`) checks I1–I8 and I11–I15 after
every operation (`tests/brot/invariant-checks.ts:163-196`); it opens price campaigns only (gap G-11) and always tallies
all of a baker's joins at once (O-3).

| # | Invariant (short) | In program | Tests |
|---|---|---|---|
| I1 | Vault − rent = entries + prize + held fee − paid out + hand-sent | as a **delta** only: the vault's change equals the booked change at open (`open_campaign.rs:161-171`) and join (`join_campaign.rs:179-182`) via `src/math/invariant.rs:16-33`; `pay_from_vault` compares a value with itself (`src/instructions/settlement/bookkeeping.rs:31-41`); `collect_fee`, `settle_prize`, `close_campaign`, `sweep_fees` assert nothing (gap G-2) | `invariant-checks.ts:26-31` |
| I2 | Pools are the sums of the entries | — | `invariant-checks.ts:34-51`; `tests/brot/join-campaign-adds.test.ts:69` |
| I3′ | `Split`: `(fee − from_fee) + (from_pot + from_fee) + distributable = V + P + R` | yes, at every finalize path (`src/math/invariant.rs:45-71`; `src/instructions/settlement/snapshot.rs:98-100`) | `invariant-checks.ts:54-65`; `tests/math_snapshot_invariant.rs`; `tests/math_payout_properties.rs` |
| I4 | `OneSided`: payouts + fees = entries; the first baker whole; the prize back | the snapshot's shape (`src/math/invariant.rs:81-92`) | `invariant-checks.ts:68-77`; `tests/brot/invariant-rules.test.ts:44-84`; `tests/brot/invariant-program.test.ts:89`; `tests/math_snapshot_modes.rs` |
| I5 | `Refund`: each entry back exactly; the prize back; the fee by reason | the snapshot's sums (`src/math/invariant.rs:72-80`) | `invariant-checks.ts:80-89`; `tests/brot/void-refund.test.ts:52`; `tests/math_snapshot_void.rs` |
| I6 | Dust below the winners' count; closed accounts empty and the System Program's | close moves every lamport and checks zero before closing (`src/checks/close.rs:17-23`) | `invariant-checks.ts:92-102`; `tests/brot/close-sweep.test.ts:47`; `tests/math_payout_properties.rs` |
| I7 | `open_campaigns` = paid campaigns opened and not finalized, never above the valve | the valve at opening (`open_campaign/rules.rs:101-111`); the decrement refuses below zero (`settlement/snapshot.rs:103-107`) | `invariant-checks.ts:187-192`; `tests/settle_host_finalize.rs:122-166`; `tests/open_h_valve.rs` |
| I8 | No entry paid twice; payees are only the baker, the creator or the fee vault | the `Entry` closes as it pays; stored-key comparisons (§13) | `invariant-checks.ts:105-112`; `tests/brot/join-campaign-wallets.test.ts:19`; `invariant-program.test.ts:185`; slot matrix |
| I9 | Splitting an entry across wallets never pays more | floor rounding of each payout (`src/math/payout.rs:99-104`) | property only, not in the randomized run: `invariant-rules.test.ts:113-128`; `tests/math_payout_properties.rs:72` |
| I10′ | With the pause on, only join and open fail | only those two read the level (§14) | `invariant-checks.ts:193-195` (the level only); §14's tests; gap G-10 |
| I11 | `Split`: every winner gets at least its entry | `from_pot ≤ P − fee` keeps `distributable ≥ V` (`src/math/payout.rs:65-68`, `:80-96`) | `invariant-checks.ts:115-128`; `invariant-rules.test.ts:86-128`; `tests/math_payout_properties.rs` |
| I12 | No creator share in `OneSided`, `Refund`, or a team campaign | zero share stored for a team key (`open_campaign/record.rs:57-61`); the snapshot refuses a team share (`src/math/invariant.rs:58`) | `invariant-checks.ts:131-135`; `tests/brot/open-campaign-team.test.ts:32` |
| I13 | The share is paid at most once, only to the creator; `from_fee ≤ fee` | `from_fee ≤ fee_total` at finalize (`src/math/invariant.rs:55-57`); the flag and the reserve (`settle_creator_share.rs:79-108`) | `invariant-checks.ts:138-144`; `tests/sdk/prepare-claim.test.ts:46` |
| I14 | A paid opening moves exactly `prize + opening fee` into the vault; a team opening moves nothing but rent | yes, the vault's change at opening (`open_campaign.rs:161-171`); `paid = prize + fee` by construction (`src/math/opening.rs:74-78`) | `invariant-checks.ts:147-154`; `tests/brot/open-campaign-paid.test.ts:50`; `open-campaign-team.test.ts:32` |
| I15 | Vault − rent ≥ unpaid books; the difference is hand-sent SOL, never an entry | no level check; the books are never read from a vault (§10) | `invariant-checks.ts:157-161`; `tests/brot/join-campaign-pot.test.ts:19`; `tests/brot/open-campaign-retry.test.ts:52` |

## 17. Known open items before the freeze

Each item is to be **fixed in the candidate** or **sent to the firms as a known issue**, decided by the lead and the
founder before the freeze. O-items are already recorded by the team; G-items were found while writing this package.

**O-1. Prize harvesting** (TP §13; TP §14.2 "Prize harvesting", founder answer 12a: "choose the rule before mainnet").
One wallet with a minimum entry on each side of a paid campaign nobody else joins splits a viable pot and takes the
whole prize: with 0.01 SOL a side, `P = 10,000,000 > fee 1,000,000 + share 200,000`, so the pot splits
(`src/math/snapshot.rs:165-175`) and the prize sits inside `distributable` (`src/math/payout.rs:80-96`). Open: a program
change inside the audit scope, rule not chosen **[Q]**.

**O-2. `min_return_bps` uses the split formula when the pot would not split.** `estimate_return_bps` picks the split
whenever the other side is non-zero (`src/math/payout.rs:135-149`), but the snapshot pays one-sided when the Economic
Viability Rule fails (`src/math/snapshot.rs:165-174`); a baker's floor then never binds in a lopsided pot (TP §7.4).

**O-3. The YES-proof cut-off depends on who acts first.** The first resolver picks any valid YES proof, whose
`publish_time` splits early from late joins (`resolve_campaign/record.rs:54`, `:61-67`). An earlier proof moves it
back only while `entries_untallied == entries_open` (`resolve_campaign.rs:61-69`), and a tally decrements
`entries_untallied` only when an entry's **last** join is tallied (`tally_late_joins.rs:96-103`): joins tallied before
the move keep the classification of the old cut-off (`tally_late_joins.rs:49-53`, `:66-81`). A move is possible only
while the earlier proof is at most 60 s old (`src/readers/price_touch/proof.rs:85-90`). TP §7.4 lists it for the audit;
the randomized run never tallies part of an entry (`tests/brot/invariant-review.ts:158-178`).

**O-4. A closed campaign's id can be opened again.** `close_campaign` gives both accounts back to the System Program
(`close_campaign.rs:97-98`; `src/checks/close.rs:17-23`), so `user_open_campaign` at the same id succeeds and restarts
`event_seq` at 0 under the same address (`open_campaign/record.rs:96-116`). No `Entry` or `Join` of the old campaign can
survive (close needs `entries_open == 0`, `close_campaign.rs:113-127`; finalize needs every join tallied,
`settlement/snapshot.rs:80-82`), so the risk is to consumers keyed by address. TP §7.4: "a tombstone in
`close_campaign`, with the audit scope".

**O-5. A reserved creator share paid by `close_campaign` appears in no event.** `to_payer = vault_rent + reserved`
(`close_campaign.rs:76-78`) while `CampaignClosed.rent_returned` counts only the two rents (`:89-91`, `:100-106`), and no
`CreatorShareSettled` is emitted (TP §7.3, deferred to "the next program upgrade").

**G-1. The mutation script does not cover the two Sprint 04 checks.** `checks/close.rs:19` (`close_account_lamports`)
and `checks/paying.rs:21` (`paying_vault_distinct`) carry markers, but `SOURCES` (`scripts/checks-mutation.mjs:26`)
omits both files and `PLAN` (`:40-69`) has no row for either; the script runs by hand only (`:9`) and its last recorded
run predates Sprint 04 (`docs/sprints/sprint-03-readers-resolution.md:364-369`). TP §3.4.17 promises the proof for
every check.

**G-2. The TP overstates the in-program invariant assertions.** TP §3.4.13 says I1, I3′, I13, I14 and I15 "are asserted
at the end of every instruction that moves SOL". The code asserts I1 as a delta at open and join only, I14 at open, I3′
and part of I13 at finalize, and nothing in `collect_fee`, `settle_prize`, `close_campaign` and `sweep_fees`
(`collect_fee/moves.rs:19-34`); the delta in `pay_from_vault` cannot fail (`bookkeeping.rs:31-41`); no instruction checks
I15 as a level. The Sprint 04 DoD chose the delta on purpose (`docs/sprints/sprint-04-settlement-invariants.md:70-72`),
so this is the TP's wording against the code; the table in §16 is the code's version.

**G-3. The team cannot void a YES or NO, but several TP mitigations still say it can.** The code refuses it
(`src/instructions/resolution/void_reason.rs:36-42`; `team_void_campaign.rs:79`; TP §3.4.18) and the contest is disabled
(§9). Still written as "the team voids in the window": TP §3.4.6 (the `met_late` row; the `StaleFeed` paragraph); TP §13
rows "Both keepers stop", "The same code has the same bug in both keepers", "Whoever controls the Pyth receiver",
"A short touch erased"; and the comment at `src/readers/price_touch/proof.rs:25-28`. Today nothing on-chain corrects a
wrong YES or NO once recorded. The firms should read THREAT-MODEL §5 with the code's rule.

**G-4. A leaked team key opens without bound.** Free team openings are outside the valve
(`open_campaign/rules.rs:92-111`; `tests/open_h_valve.rs:24`), but TP §7 ("`max_open_campaigns` bounds the burst") and
TP §13 ("can hold `max_open_campaigns` full for up to 90 days") describe the older rule. Each free opening costs the key
two rents (TP §3.4.10: 3,901,440 lamports on devnet).

**G-5. Stale comments and documents the firms will read.** `src/instructions/entries/join_record.rs:7-8` (says the
`Join` is not wired into the join; it is: `join_campaign.rs:88`, `:178`); `src/state/join.rs:3-4` (says `settle_entry`
closes the `Join`; `tally_late_joins` does); `src/instructions/interface.rs:212` (the baker "receives the rent of the
closed joins"; the rent goes to the `Entry`, `tally_late_joins.rs:90-93`); `src/math/payout.rs:6-12` and TP §3.4.16
(`from_pot` with `+ R`); `src/state/transitions.rs:1-3` (says every status move calls `transition`; `resolve_campaign`
writes `InReview` without it, `resolve_campaign/record.rs:47`, guarded by the explicit status check at
`resolve_campaign.rs:53-56`); `src/state/config.rs:52` and TP §3.4.3 (the minimum entry "read at every join, not
copied"; it is copied at opening, `open_campaign/record.rs:66`); the test names
`tests/team_window_void_reasons.rs:31` and `:58` (they assert that the team may **not** void).

**G-6. `tally_late_joins` never checks its instruction data** (`tally_late_joins.rs:30`, `_data`), the only handler
that skips `args`/`no_args` (`src/instructions/mod.rs:55-66`), against the order contract (`src/checks.rs:6-7`).
Harmless today.

**G-7. Dead code in the crate.** `read_joins` (`src/instructions/entries/entry_account.rs:22-52`) and
`math::refund::split_late` (`src/math/refund.rs:19-35`) have no caller in any instruction. Whether LTO strips them from
the binary is **[to verify]**; removing them, or marking them test-only, shrinks what the firms read.

**G-8. No `mainnet` SBF binary is built anywhere yet** (README, note 1). The `mainnet`-only paths (the mainnet feed
list, `DBC_GRADUATED_OPENS` false) are tested on the host only (`tests/open_campaign_rules.rs:46`;
`tests/readers_dbc_target.rs:118-128`; `tests/math_schedule.rs:132-140`); the Mollusk and LiteSVM suites run the default
binary.

**G-9. The mainnet program id is not in the code yet.** `src/lib.rs:23` declares the devnet id; the event authority
constant and bump (`src/constants.rs:32-34`) follow it. The audited commit must carry the final id (README, note 2).

**G-10. I10′ has no single test over every instruction.** Sprint 16 names one ("paused campaign refuses new money, never
payouts", `docs/sprints/sprint-16-hardening.md`, Tests) that does not exist. `tests/brot/invariant-program.test.ts:156`
starts from a campaign written straight into `Settling` (`:50-87`), so under the pause it runs `settle_entry`,
`settle_creator_share`, `collect_fee` and `close_campaign` only; `resolve_campaign`, `tally_late_joins`,
`team_confirm_result`, `team_void_campaign`, `finalize_campaign`, `settle_prize` and `sweep_fees` run under a pause only
when the randomized draw happens to order them so **[to verify from its trace]** (`tests/brot/invariants.test.ts:53-76`
prints it).

**G-11. The randomized run opens price campaigns only** (`tests/brot/invariant-open.ts:44`, `:90`). The other five
kinds share the settlement code but no randomized run.

**G-12. A team key moves the 10% on automatic voids.** It may record `MissedWindow`, `StaleFeed`, `TeamHouseFailure`
or `TeamOutsideCause` on any automatic void (`void_reason.rs:23-31`; `team_void_campaign.rs:83-84`), which sends the held
opening fee to the opener or to Brot (`src/math/void.rs:43-60`). Stated on the public powers page (`content/powers.md`,
"Record the cause of an automatic void"); a trust assumption, not a bug.

**G-13. `CreationParams.sol_usd_feed_id` is dead.** Validated non-zero (`src/state/config.rs:180-182`), stored and
emitted in `ConfigChanged`, read by no instruction (pricing uses `SOL_USD_FEED_ID`, `open_campaign/payment.rs:65`).

**G-14. Error codes: unused ranges, and four variants the program never returns.** The lanes' allocation left
6098–6100, 6103–6105, 6118–6120, 6136–6140 and 6142–6145 unassigned (`src/error.rs:226-328`); new codes start at 6153
(`:328`). Four declared variants are returned by no instruction (a search of `src/`): `EntryBelowMinimum` 6065
(`src/error.rs:164-165`, superseded by `BelowCampaignMinEntry` 6132), `ReaderNotReady` 6070 (`:176-177`, marked unused),
`AutomaticVoidNotInvertible` 6093 (`:231-232`) and `OneSidedFeesNotRecorded` 6130 (`:292-295`). They stay, since a code
is never reused, but their messages reach the IDL and the SDK's error map; a firm should not look for the paths that
return them.

**G-15. `create_join` writes the `Join` header by hand.** It sets the tag and layout version directly
(`src/instructions/entries/join_record.rs:112-122`) instead of through `state::init`, which refuses an account that
already carries a tag (`src/state/mod.rs:90-105`; the house rule in `CLAUDE.md`). Safe as written, because
`checks::create_pda_account` has just refused any program-owned or data-carrying account (`src/checks.rs:139-143`), but
it is the one creation path outside the rule. `Join` has no `AccountState` impl and is read by its own parser
(`join_record.rs:40-76`).

**G-16. `tally_late_joins` has no instruction-level negative test.** Its own refusals, `TallyNotReady` 6134 and
`EntryAlreadyTallied` 6135 (`tally_late_joins.rs:54-62`), are named by no test, and its trailing `Join` accounts, the
list it reads and closes, appear in no slot-matrix case (the matrix covers the five named slots,
`tests/brot/slot-matrix.gen.ts:373-394`). An empty list, joins out of order, a join passed twice, one too many, another
baker's or another campaign's join are refused by the code (`tally_late_joins.rs:35-37`, `:66-70`;
`src/instructions/entries/join_record.rs:40-76`) but shown only on the host parser (`tests/join_host_record.rs:51`,
`:71`). Its positive path is tested (`tests/brot/late-entries.test.ts:48`; the randomized run). X0.7 asks one test per
refusal through the program.

## 18. Sprint 14 (pending) — the lead fills this section if Sprint 14 enters the candidate

Plan: `docs/sprints/sprint-14-referral-second-read.md`; TP §3.4.7, §3.4.11. Not in the code at `395efa5`.

| Item | To fill |
|---|---|
| `ReferralLink` account (`["referral", referee]`, tag 4 reserved at `src/state/mod.rs:33`) | file:line, size, layout version |
| `user_link_referrer(referrer)`: signed by the referee, once, immutable; event `ReferralLinked` | file:line; slots and checks; error codes; negative test per check (T24) and its mutation row (X0.9) |
| `reread_campaign`: stage 1 within one hour; the same reading pays, a different one opens stage 2 (48 h) | file:line; how "same reading" is compared per kind; errors; events (`ContestClosed`, stage-2 `ContestOpened`) |
| `admin_decide_contest(confirm or void, reason)`: `admin` (the 2-of-3 on mainnet), stage 2 only, never inverts | file:line; errors; `CampaignFinalized` after `ContestClosed` |
| `team_open_contest` enabled again | what replaces `ContestExitDisabled` (`team_open_contest.rs:14-21`); the `Contested` edges already in `src/state/transitions.rs:20-22` |
| The pause | unchanged: linking and contesting are never paused (the I10′ list does not grow) |
| Invariants | the randomized run extended with the new instructions; I1–I15 hold |
| Accepted risk | self-referral is possible and its gain has a ceiling (TP §3.4.11; P1 §3.9, "isso memso"): no lock against it |
| Off-chain | the referral payout is a weekly routine from an operations wallet, outside the program (§20) |

## 19. Sprint 15 (pending) — the lead fills this section if Sprint 15 enters the candidate

Plan: `docs/sprints/sprint-15-sponsorship.md`; TP §3.4.12. Not in the code at `395efa5`.

| Item | To fill |
|---|---|
| The sealed entry (`SponsorEntry`): an entry on one side that also charges 10%, held in the vault until the outcome | a flag on `user_join_campaign` or its own instruction (C50); file:line; its minimum; how the 10% is bookkept and where it goes (kept, or refunded on a house-failure void) |
| `sponsor_add_prize(lamports, disclosed)` | **only if the founder keeps it** (P1 §3.7 [Q]); file:line; the funder record for the prize's return on a void; outside the creator share's base (P-1, I12) |
| The pause | both are in the I10′ list: they fail with the pause on |
| Invariants | I3′ and I15 with the sponsor fee in the books; the randomized run extended |
| Tests | negative test per check (T24); two users (A cannot settle, redirect or refund B's sealed entry or added prize) |

## 20. Out of scope, and why

| Out of scope | Why |
|---|---|
| The services: keeper pair, watchdog, indexer, `brot-rpc` relay, read API (`services/`, Sprints 06–08) | Off-chain; their wallets hold SOL for network fees only and have no on-chain privilege (TP §3.4.9). They call permissionless instructions whose amounts and destinations the program fixes, so a service bug delays or omits a call but cannot redirect money. They are actors in `THREAT-MODEL.md` §3. Exception, when Sprint 14 ships: the weekly referral payout is paid by the company from an operations wallet (TP §3.4.11) and needs its own review |
| The site (`app/`), the provisional landing (`services/landing`), the Android app (Sprints 20–22) | Off-chain clients. They prepare transactions the user signs; the program re-checks every rule (TP §7, "never trust the client") |
| The SDK (`packages/sdk`, `@brot/sdk`) | A client library mirroring the program's math and rules for previews, and the deterministic summary of what a wallet signs (A-3). It cannot widen what the program accepts. Worth a separate review because users sign what it builds |
| The test-only `tests/programs/cpi-proxy` | Never deployed |
| The scripts (`scripts/`), deployment (`deploy/`), CI | Tooling; the build's integrity is Sprint 16's work (verifiable build, attestation) |
| Third-party programs and runtime: Pyth receiver and push oracle, Meteora DAMM v2 and DBC, SPL Token, SPL Stake Pool, the Vote program and `sol_get_epoch_stake`, the System Program, the BPF loader v3 | Not ours to audit; the program's assumptions about each are written as trust boundaries in `THREAT-MODEL.md` §4 |
| Pinocchio and its dependencies, as libraries | Their own audits and the version gap are in `PINOCCHIO.md`. No public audit covers the pinned versions, so `PINOCCHIO.md` §5 asks the firms to review the part of them this program calls (its §3) |
| The multisig product (Sprint 16, T7) | Chosen in Sprint 16; it holds the upgrade authority, `admin` and `fee_recipient` |
| Content (`content/`: powers table, void log, partners, account names) | Off-chain publication; the void log's hash is on-chain (`void_note_hash`), its text is not |
| Economics and law | The founder's decisions (no cap D-h, no list D-i, the creator controlling the measured account) are accepted risks, listed in `THREAT-MODEL.md` §6; whether a rule is wise is not the firms' question, whether the code does what the rule says is |
