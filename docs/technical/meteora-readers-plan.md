# Meteora readers: the graduation kind, and what else Meteora writes on-chain

Plan, written 2026-10-12. Status: **the graduation kind is built** (branch `feat/dbc-graduation-reader`, 2026-10-12:
phases 1 to 3 of section 6 and the Surfpool run of phase 5, with M-1 to M-7 taken as section 1 proposes); the site
(phase 4), the devnet upgrade and phase 0's BP, Product Brief and Terms remain. Where the build departs from this text
is in `session-log/2026-10-12-sexto-tipo-dbc-graduated.md`. Section 5, the fees kind, is still a proposal. It adds a
sixth question kind beside the five of TP §3.4.8, so it needed the founder's approval first (section 1). Labels: **[F]** a fact read on the date, with where it
was read (section 9); **[INF]** an inference; **[OPEN]** a decision that is still open.

## 1. What this asks of the founder

| # | Decision | Proposed answer |
|---|---|---|
| M-1 | A sixth kind. BP v0.0.4 and the founder's answers fix five (P1 §4.2). | Yes: "does token X's Meteora curve complete by date D?" |
| M-2 | The smallest curve a campaign may name (the floor). | 85 SOL on mainnet. On devnet, either the same 85 SOL or a lower drill value (section 4.6) |
| M-3 | Which curves to accept. | Only curves priced in SOL, and only the plain pool account; transfer-hook pools are refused in v1 |
| M-4 | How close to complete a curve may be when a campaign opens. | At least 10% of the threshold still missing |
| M-5 | Resolution by the time the account records (YES even when the curve completed before the deadline but nobody resolved until after it). | Yes. This adds a new row to TP §3.4.6 |
| M-6 | YES can be bought: anyone can buy out the rest of the curve. | Accept it, as for burn and locked liquidity, and say so on the campaign page (section 4.5) |
| M-7 | Mainnet. | Behind a cargo feature, off in the mainnet build until the audits cover it (Sprints 16 to 17) |
| M-8 | Timing against the Crypto World's Fair deadline (2026-10-13 06:59 UTC). | After the deadline; section 7 gives the reasons |

## 2. Summary

- **What it reads [F].** Meteora's Dynamic Bonding Curve (DBC) records each launch in a `VirtualPool` account. Its
  `migration_progress` byte moves only forward: on the curve, then the curve complete, then vesting, then a pool
  created. The swap that completes the curve also writes `finish_curve_timestamp` from the clock. So "graduated by D"
  is an irreversible fact that also records when it happened.
- **The graduation value [F].** There is no single value. Each launchpad's config sets `migration_quote_threshold`,
  and the program only requires it to be above zero. Of the 482,122 configs priced in SOL on mainnet, 85 SOL is the
  most common (186,026 configs, 39%) and the median. About 15% are below 0.005 SOL.
- **How often curves graduate [F].** Mainnet holds 1,783,838 DBC pools, and 54% of them have graduated. That share is
  misleading. Under 0.5 SOL, 98% graduate, because a platform fills the curve on the spot. On the large curves of
  organic launchpads, 0.3% to 1.5% graduate. A campaign can only open on a curve that has not completed, so the
  instant ones never become campaigns.
- **Something else worth reading [F].** Both DBC and DAMM v2 keep cumulative counters of the protocol fees paid to
  Meteora. The code only ever adds to them. Faking them means paying Meteora real money. That makes them the first
  manipulation-resistant proxy for volume available to Brot (section 5).
- **Every Meteora program is on devnet [F].** DBC, DAMM v2, DAMM v1, DLMM, Presale, Alpha Vault, Locker and Dynamic
  Fee Sharing are each deployed at the same address on mainnet and devnet, and each is upgradeable.

## 3. What Meteora writes on-chain

### 3.1 The DBC pool and its config [F]

Program `dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN`, the same address on mainnet and devnet (README). Both are Anchor
zero-copy accounts. The offsets below were read from the source, then checked on mainnet bytes on 2026-10-12: nine
pools at stages 1 and 3, and one config.

| Account | Size | Discriminator | Field | Offset | Type |
|---|---|---|---|---|---|
| `VirtualPool` | 424 | `d5e005d16245775c` | `config` | 72 | pubkey |
| | | | `creator`, `base_mint` | 104, 136 | pubkey |
| | | | `quote_reserve` | 240 | u64 |
| | | | `is_migrated` | 305 | u8 |
| | | | `migration_progress` (0 curve, 1 post-curve, 2 locked vesting, 3 pool created) | 308 | u8 |
| | | | `metrics`: protocol base fee, protocol quote fee, trading base fee, trading quote fee | 312, 320, 328, 336 | u64 each |
| | | | `finish_curve_timestamp` | 344 | u64, unix seconds |
| `TransferHookPool` | 424 | `eddbb8172abda923` | the same `PoolState` | same | same |
| `PoolConfig` | 1,048 | `1a6c0e7b74e6812b` | `quote_mint` | 8 | pubkey |
| | | | `migration_quote_threshold` | 264 | u64, quote base units |
| `ConfigWithTransferHook` | 1,128 | `28dcc2fb29c77bfd` | a `PoolConfig` and the hook program | | |

What the source says about these fields:

- **The stage only moves forward.** `MigrationProgress` runs from `PreBondingCurve` to `PostBondingCurve` to
  `LockedVesting` to `CreatedPool` (comment and enum in `state/virtual_pool.rs`).
- **The swap stamps the completion.** The swap that completes the curve sets `finish_curve_timestamp` from
  `Clock::unix_timestamp` and moves the stage to 1 or 2 (`process_swap.rs` lines 230 and 343 to 362).
- **The curve is closed once complete.** The swap is refused after completion (line 225).
- **A config cannot be changed.** `lib.rs` has `create_config` and `create_config_with_transfer_hook`, but no
  instruction that updates a config. The threshold check at creation is only `migration_quote_threshold > 0`
  (`process_create_config.rs` line 467).
- **The fee counters only grow.** `PoolMetrics::accumulate_fee` only adds. Meteora's share is
  `PROTOCOL_FEE_PERCENT = 20` (`constants.rs`), and `HOST_FEE_PERCENT = 20` goes to a referral host.

### 3.2 Mainnet numbers, 2026-10-12 [F]

These come from `getProgramAccounts` on the public mainnet RPC, at about 20:00 UTC.

| Measure | Value |
|---|---|
| DBC pools (424-byte accounts) | 1,783,838 |
| By stage: 0 / 1 / 2 / 3 | 813,372 / 42 / 925 / 969,486 |
| Configs priced in SOL (`PoolConfig`, quote = wSOL) | 482,122 |
| Most common thresholds | 85 SOL (186,026); under 0.005 SOL (73,107); 5 SOL (34,909); 66 SOL (19,300); 1,195.46 SOL (9,704); 100 SOL (9,400) |
| Thresholds: 10th percentile / median / 90th percentile | 0.00009 / 85 / 154 SOL |

Graduation share by threshold, for the pools whose config is priced in SOL. Another 257,415 pools use a config that
is not priced in SOL, or a transfer-hook config.

| Threshold | Pools | Graduated (stage 1 or more) |
|---|---|---|
| under 0.5 SOL | 145,140 | 98.3% |
| 0.5 to 10 SOL | 115,224 | 96.6% |
| 10 to 50 SOL | 322,042 | 94.3% |
| 50 to 85 SOL | 127,189 | 57.9% |
| exactly 85 SOL | 347,396 | 45.2% |
| 85 to 150 SOL | 196,076 | 59.7% |
| 150 SOL and up | 273,356 | 22.6% |

These averages hide two very different populations [F]:

- **Configs where almost every pool graduates.** The two largest configs of 85 SOL and above (59,803 and 21,045
  pools) graduate at 100%. The pools sampled from them hold exactly the threshold and no quote fees.
- **Configs where almost none do.** Other large configs, at 202.8, 98.4, 85.0 and 87.9 SOL with 6,000 to 20,000 pools
  each, graduate at 0.3% to 1.5%.

**[INF]** The first group is a platform filling the curve in one go. The sampled mints end in `pump`, so they are
probably tokens brought over from another launchpad. No platform was identified. The second group is the organic
base rate.

### 3.3 The other Meteora programs [F]

All eight programs below exist at the same address on mainnet and devnet, and each is upgradeable (`getMultipleAccounts`
on 2026-10-12). The candidates come from Meteora's public source or IDLs (section 9).

| Program | Account and field | Moves only one way? | Who can make YES happen, and what it costs | Verdict |
|---|---|---|---|---|
| DBC | `VirtualPool.migration_progress`, `finish_curve_timestamp` | Yes | Whoever buys the rest of the curve. They get tokens they can sell after migration, so the loss is a fraction of the threshold **[INF]** | **Build (section 4)** |
| DBC | `metrics.total_protocol_quote_fee` | Yes | Whoever trades. Each SOL of protocol fee is paid to Meteora, less the 20% host share, which the trader might route to himself **[INF]** | **Next (section 5)** |
| DAMM v2 | `metrics.total_protocol_a_fee` / `_b_fee` | Yes (`accumulate_fee` only adds) | The same, on the pool after migration | **Next (section 5)** |
| DAMM v2 | `permanent_lock_liquidity` | Yes | Whoever locks liquidity forever | Already built (`DammV2LockedAtLeast`) |
| DAMM v2 | `metrics.total_lp_a_fee` / `_b_fee` | Yes | A wash trader who is the main liquidity provider gets most of it back | Set aside |
| DAMM v2 | `metrics.total_position` | No (`reduce_position` subtracts) | | Set aside |
| Presale `presSVxn…` | `Presale.total_deposit` against `presale_minimum_cap`, after `presale_end_time` | Fixed after the end, if refunds leave `total_deposit` alone (not verified) | Depositors. Their money buys tokens | Maybe later. The program's source is not public, only the SDK and the IDL |
| Alpha Vault `vaU6kP7i…` | `Vault.bought_token`, `swapped_amount` | Set once, at the fill | The vault's depositors, at launch | Set aside (it happens at the launch instant) |
| Dynamic Fee Sharing `dfsdo2Uq…` | `FeeVault.total_funded_fee` | Yes | Whoever funds it, but the funder may also hold the shares and take the money back | Set aside |
| Locker `LocpQguc…` | `VestingEscrow.total_claimed_amount`, `cancelled_at` | Yes | The recipient or the creator | Set aside (it reads the team's own vesting, not the market) |
| DLMM `LBUZKhRx…` | `LbPair.active_id` (price), `protocol_fee` | No: the price moves, the fees are claimed | | Set aside |
| DAMM v1 `Eo7WjKq6…` | Lock escrows of LP | Yes **[INF]** | Whoever locks LP | Maybe later. DBC can still migrate to DAMM v1, but the layout has not been read |

**Already usable [INF].** After graduation, the token's DAMM v2 pool is an ordinary pool. Where the config locks part
of the LP, the existing `DammV2LockedAtLeast` kind already applies, and a classic SPL token is already open to
`SupplyAtMost`. With graduation added, Brot follows a Meteora launch through its whole life: the curve, the pool, the
locked liquidity, the burn.

## 4. The graduation kind

### 4.1 The question

"Does token X's Meteora launch curve complete by D?" In the brand's words, the token graduates. The kind's name is
`DbcGraduated`. It takes `ReaderKind` byte 5, appended after the five existing kinds and never reordered.

### 4.2 Accounts and arguments

- **The metric account is the `VirtualPool`.** The campaign stores only this address, as it does today
  (`metric_account`).
- **The opening also takes the pool's `PoolConfig`, in a tenth account slot.** `user_open_campaign` already accepts
  extra accounts (`[.., ..]`). `CreationContext` gains a `curve_config: Option<&AccountView>` that only this kind
  reads. Joining and resolution need only the pool.
- **The target is the curve's threshold, in lamports.** The opening refuses any target that differs from the
  config's `migration_quote_threshold`. That keeps the campaign self-describing ("needs 85 SOL") and the reading's
  `observed` value (`quote_reserve`) in the same unit.
- **The other arguments stay at zero.** The direction, the feed and the epoch must be zero, as the canonical
  arguments require (D-j).

### 4.3 The opening (rows 2 and 3 of TP §3.4.10, in this order, each with its own error)

1. **The pool is a DBC pool.** Its owner is DBC (`ReaderWrongOwner`), it is 424 bytes long, and it carries the
   `VirtualPool` discriminator (`ReaderBadLayout`). A `TransferHookPool` is refused (M-3).
2. **The config is the pool's own.** Its address equals the pool's `config`, its owner is DBC, it is 1,048 bytes with
   the `PoolConfig` discriminator, and its quote mint is wSOL. New error: `CurveConfigMismatch`.
3. **The curve is large enough.** `migration_quote_threshold >= DBC_MIN_GRADUATION_LAMPORTS` (M-2). New error:
   `CurveTooSmall`.
4. **The target is the threshold** (new error, or reuse the canonical-argument error, decided at the sprint's
   opening).
5. **The curve has not completed.** `migration_progress == 0`, otherwise `TargetAlreadyTouched`.
6. **The curve is not almost complete.** `threshold − quote_reserve >= threshold × 10%`, otherwise `TargetTooClose`
   (M-4). This is row 3 again, through `min_distance`.

### 4.4 The join lock and resolution

- **The join lock.** `outcome_knowable` is true once `migration_progress >= 1`.
- **Resolution by the recorded time (M-5).** This adds a row to TP §3.4.6:

| State read | Before the deadline | After the deadline |
|---|---|---|
| Stage 0 | `NotYet` | NO |
| Stage ≥ 1, `finish_curve_timestamp ≤ deadline_at` | YES | **YES** (the account says when it completed) |
| Stage ≥ 1, `finish_curve_timestamp > deadline_at` | cannot happen | NO, flagged `met_late` |
| Stage ≥ 1 with `finish_curve_timestamp == 0` (not expected from this program version) | YES, as the irreversible-fact table does | NO, flagged `met_late` |
| Unreadable | refused | Void (`UnreadableAccount`) |

It is a new helper next to `fact_resolution` in `readers/shared.rs`. `Reading.observed` is `quote_reserve`.

### 4.5 Risks to state openly

- **YES can be bought (M-6) [INF].** Anyone who pays the rest of the threshold completes the curve. They receive
  tokens they can sell into the new pool, so the net cost is a fraction of the threshold, not all of it. At 85 SOL
  that is still a real cost, but smaller than the cost of locking liquidity. The token's own team is the actor
  most able to do it. As with burn, the campaign is in effect a bet on whether they will. The page should say who
  can make YES happen.
- **Late, informed entries [INF].** As the curve fills, YES gets more likely and anyone can see it. The entry close
  and the 10% distance at opening limit this, but do not remove it. A tighter lock ("entries close at 90% filled")
  is possible later. It would need care, because sells can push the share back down.
- **Meteora upgrades its programs [F].** DBC is upgradeable. A change of layout fails the size and discriminator
  checks, and the campaign voids after the deadline (`UnreadableAccount`). Recapture the fixtures after every
  upgrade, as `CLAUDE.md` already requires for third-party layouts.
- **The base rate [F].** On organic launchpads, roughly 1% of curves graduate, so most of these campaigns will
  resolve NO. That is a product question for the founder, not a defect.

### 4.6 Devnet

DBC runs on devnet at the same address [F]. A demo has to create a config and a pool there, open a campaign, join it,
buy the curve out and resolve. Meteora's `meteora-invent` studio does the first two steps.

- **With the real 85 SOL floor**, the demo needs about 90 devnet SOL. The faucet gives 5 SOL per call
  (`skills/meteora/references/dbc.md`).
- **With a drill value under the existing `drill` feature**, the demo is cheap. But the deployed devnet program runs
  the real values (Sprint 05 answer), so this needs its own decision (M-2).
- **A Surfpool mainnet fork needs no deploy**, as `scripts/surfpool/price-touch.ts` already does for the price
  reader. It can resolve a campaign on a real curve.

## 5. The second kind: fees paid to Meteora, as a volume proxy

"Does token X pay Y SOL in Meteora protocol fees by D?" It reads `total_protocol_quote_fee` (DBC) or the SOL side of
`total_protocol_a/b_fee` (DAMM v2). Both counters only grow, and the money behind them goes to Meteora. So a wash
trader buys every unit of progress at full price, less the host share **[INF]**.

**[OPEN]** Before building it:

- **How it is phrased.** In fees, not volume, because fee rates are dynamic and a config sets its own.
- **Which pools qualify.** Only those that collect fees in SOL. DBC's `collect_fee_mode` can charge them in the base
  token: the 85 SOL pools in section 3.2 had zero quote fees.
- **Who receives the host fee**, and whether it can be pointed at the trader.
- **Where the counters sit in DAMM v2.** The `PoolMetrics` offsets inside its 1,112-byte pool are pinned from
  captured bytes.

This would be the first volume-like question Brot can ask without an oracle.

## 6. Implementation plan

The house rules hold throughout: one reader per file, files under 200 lines, a `Purpose:` header, checked math, the
owner checked before any byte is read, errors appended and never reused, and enum bytes appended.

| Phase | Work | Where |
|---|---|---|
| 0. Decide and write down | M-1 to M-8; the BP's kinds table and its impact review (sixth kind); TP §3.4.6 (the new row), §3.4.8 (the reader), §3.4.10 (rows 2 and 3 for this kind); PB R-13; `docs/wiki/market-types.md`; the kinds list in `docs/legal/TERMS-OF-SERVICE.md` (a legal review) | `docs/` |
| 1. Program | The constants: `DBC_PROGRAM_ID`, `WSOL_MINT`, sizes, discriminators, offsets, `DBC_MIN_GRADUATION_LAMPORTS` (drill and mainnet values), `MIN_DISTANCE_BPS_DBC = 1000`. `ReaderKind::DbcGraduated = 5`, also in the list of all kinds. Row 1 and the canonical arguments in `rules.rs`, behind a `dbc-graduation` feature that `mainnet` refuses until approved (M-7). The reader `readers/dbc_graduation.rs`, and `dbc_graduation/config.rs` if it passes 200 lines. Dispatch in `readers/mod.rs` and `curve_config` in `CreationContext`. The resolution helper in `shared.rs`. The new error codes. The join lock's comment. `open_campaign.rs` is already 210 lines, so the slot read moves into `rules.rs` instead of growing it | `programs/brot-markets/src` |
| 2. Fixtures and program tests | `scripts/capture-fixtures.ts` captures mainnet bytes: one pool at each stage (0, 1, 2, 3), one `TransferHookPool`, an 85 SOL wSOL config, a tiny-threshold config, a USDC config and a transfer-hook config; then `index.json`. Host tests per check, with their own errors. Layout pins. Mollusk and LiteSVM: opening, join lock, YES before the deadline, YES after the deadline by the timestamp, NO, `met_late`, void. The refusal suites (`open-campaign-refuses*`, `negative-open.ts`). `checks-mutation.mjs` if `checks.rs` changes | `tests/`, `programs/brot-markets/tests/`, `scripts/` |
| 3. IDL and SDK | `bun run idl` (Shank and Codama). In `read`: the constants mirror, DBC pool and config decoding (for the preview and the progress bar), `validateOpenCampaign` in the program's order, `checkJoin`, `publicState`, the error messages. `schemas/open-campaign.ts` gets `{ kind: "DbcGraduated", pool, deadlineAt }`. The opening builder adds the config slot. Contract and parity tests; `lint:sdk` | `packages/sdk`, `tests/sdk` |
| 4. Site | The kind in the creation box, with its refusal messages (`app/features/open-campaign/copy-refusals.ts`). A progress bar on the campaign page (`quote_reserve` over the threshold) and who can make YES happen | `app/` |
| 5. Devnet and demo | CI build. The upgrade under `deploy/devnet/README.md` with the devnet upgrade key. A DBC config and pool on devnet, then the full cycle. A Surfpool mainnet-fork script on a real curve. Kinds added to `smoke:devnet` and `seed:devnet` | `deploy/`, `scripts/` |
| 6. Closure | `CODEMAP.md`, `CHANGELOG.md`, the session log, and the audit scope in Sprint 17 grows by one reader | |

**Effort [INF].** Phases 1 to 3 with full tests are about one working day. Phase 5 adds half a day, more with the
85 SOL floor on devnet. Phase 0 is the founder's time. The rest of the roadmap is untouched. The kind sits behind a
feature until the audits.

**Compatibility [INF].** Appending an enum byte and an optional extra account leaves the `Campaign` layout as it is,
so campaigns already on devnet are unaffected. Clients need the new IDL to show the new kind.

## 7. Against the hackathon deadline

The Meteora side track judges five things: the depth of the Meteora integration, technical execution, originality,
impact, and traction, with a preference for projects live on mainnet (Earn listing `meteora-dbc`). The deadline is
2026-10-13 06:59 UTC.

The smallest cut that is still honest is Phase 1, Phase 2's host tests on real mainnet bytes, and a Surfpool
mainnet-fork demo. That is roughly 5 to 6 hours **[INF]**, with no devnet upgrade, no SDK and no site. It competes for
the same hours as the main submission and its two videos, which every side track depends on. **Recommendation:**
build it after the deadline, starting with Phase 0. Name it in the main submission as the next reader.

## 8. Where this leaves the five kinds

Nothing is replaced. `DammV2LockedAtLeast` stays, and graduation is the step before it in a token's life.

## 9. Sources (read 2026-10-12)

- `github.com/MeteoraAg/dynamic-bonding-curve` (main): `README.md` (program ids); `programs/dynamic-bonding-curve/src/`
  `state/virtual_pool.rs`, `state/config.rs`, `constants.rs`, `lib.rs`, `instructions/swap/process_swap.rs`,
  `instructions/partner/create_config/process_create_config.rs`.
- `github.com/MeteoraAg/damm-v2`: `programs/cp-amm/src/state/pool.rs` (`PoolMetrics`, `accumulate_fee`,
  `reduce_position`), `constants.rs`.
- `github.com/MeteoraAg/meteora-invent`: `studio/config/dbc_config.jsonc` (default threshold 10),
  `skills/meteora/references/dbc.md` (about 92.6 SOL for market caps of 20 to 600 SOL; 5 SOL per faucet call).
- IDLs: `presale-sdk/src/idl/presale.json`, `alpha-vault-sdk/idls/alpha_vault.json`, `met-lock-sdk/src/idl/idl.json`,
  `dlmm-sdk/idls/dlmm.json`. Source: `dynamic-fee-sharing/programs/dynamic-fee-sharing/src/state/fee_vault.rs`.
- Chain: `api.mainnet-beta.solana.com` (`getProgramAccounts` over DBC pools and configs, about 19:50 to 20:05 UTC;
  `getAccountInfo` on the sampled pools); `getMultipleAccounts` for the eight program ids on mainnet and devnet.
- Superteam Earn listing `meteora-dbc` (the judging criteria), read through its page data.
