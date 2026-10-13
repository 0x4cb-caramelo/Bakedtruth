# Brot Markets — threat model

**Status:** draft for the Sprint 16 freeze, written on 2026-10-13 against `main` at `395efa5`. Paths follow the
convention of `SCOPE.md` ("Paths"): `src/…` and the Rust tests `tests/<name>.rs` are under `programs/brot-markets/`,
every other path starts at the repository root, and a short path such as `join_campaign.rs` or
`open_campaign/payment.rs` names a file under `src/instructions/`. **[to verify]** marks what nobody has checked; **[INF]** marks an inference drawn here.

Method: what is worth stealing or breaking (§2), who can act and with which powers (§3), what the program trusts outside
itself (§4), then each attack class with, for each instruction it applies to, the mitigation in the code and the test
that shows it (§5). §6 lists the risks the founder accepted; §7 points at the open items.

## 1. Scope

The program `brot-markets` as `SCOPE.md` §1 defines it, built with the `mainnet` feature. Off-chain services appear here
only as actors (§3): they have no on-chain privilege (TP §3.4.9). The program holds users' SOL with **no cap** (D-h):
every lamport in every open vault is exposed to a program bug, and the only bounds left are the audits, the multisig,
the pause and an off-chain exposure alert (TP §13, first row; `docs/sprints/sprint-18-mainnet.md:104-105`).

## 2. Assets

| Asset | Where it sits | What reaching it gives | Bound in code |
|---|---|---|---|
| Campaign vault SOL: entries, the prize, the held 10% opening fee, a reserved creator share, hand-sent surplus, the vault's rent | One data-less PDA per campaign, `["vault", campaign]` (`src/constants.rs:21-22`), owned by the program, so only the program debits it (`src/vault.rs:6-8`) | Theft of bakers' and openers' money | None in size (D-h). Every debit is computed from the campaign's books and sent to a stored key or the fee vault (SCOPE §10) |
| Fee vault SOL: kept house fees, one-sided fees, kept opening fees, dust, surplus | `["fee_vault"]` (`src/constants.rs:17-18`) | Brot's revenue | Leaves only to `GlobalConfig.fee_recipient` (`src/instructions/settlement/sweep_fees.rs:44-62`) |
| `GlobalConfig`: admin, pending admin, team, fee recipient, creation parameters, pause, open count, `params_version` | `["config"]` (`src/state/config.rs:71-98`) | Control of future campaigns' terms, of the pause, of the team and of where Brot's fees go | Written only by the admin, the pending admin (acceptance), a team key (pause) and the initializer (SCOPE §14); parameters under code ceilings (SCOPE §5) |
| Account rents: `Campaign` and vault (the creator's), `Entry` and `Join` (the baker's) | The accounts themselves | Small amounts; a griefing lever | Returned at close and settlement to the stored payer (SCOPE §10) |
| The correctness of each outcome | `Campaign.outcome`, `observed_value`, `publish_time` | Paying the wrong side is a theft in effect | The reader's checks (§4, §5.9); once recorded, nothing on-chain corrects a YES or NO (SCOPE gap G-3) |
| The event stream | Self-CPI events, contiguous `seq` per campaign | Indexers, the site and the referral routine read it | Only this program can sign the event authority (§5.4) |
| The upgrade authority | Loader v3 ProgramData | Replacing the program, and with it every rule above | Outside the program: the 2-of-3 multisig with a public wait (Sprint 16) |

## 3. Actors

| Actor | Can do on-chain (from the code) | Cannot do | Trust |
|---|---|---|---|
| **Anonymous wallet** | Every permissionless instruction: `resolve_campaign` (top level only), `tally_late_joins`, `finalize_campaign`, `settle_entry`, `settle_creator_share`, `collect_fee`, `settle_prize`, `close_campaign`, `sweep_fees`; open a campaign by paying; join. Send SOL to any address; post its own Pyth updates to accounts it owns; call this program by CPI from its own program; land transactions in a chosen order within a slot through a block builder **[INF]** | Choose an amount or a destination of any payout; resolve through CPI | none |
| **Creator** | Pays the opening (`opening_usd ≥ opening_fee_usd`, at most `max_lamports`); is stored as `creator` and `rent_payer` (`src/instructions/campaigns/open_campaign/record.rs:52-53`); receives the creator share, the prize back and, on a house-failure void, the opening fee; may join their own campaign (TP §3.4.10, BR-26) | Choose the fees, the share or the join-time price age (copied from the config, SCOPE §4 row 6); open a `StakeAtLeast` or `DbcGraduated` campaign on mainnet | none |
| **Creator who controls the measured account** | Burn their own token, lock their own liquidity, move stake, buy out a curve: decide a fact-kind campaign's outcome | Change a price feed (the price kind is out of any creator's reach, TP §3.4.10) | Accepted risk (§6) |
| **Baker** | Joins YES or NO with at least the campaign's minimum, signing `expected_entry_total` and `min_return_bps`; is stored in its `Entry` and paid there | Leave early (no exit instruction, BR-12); join after the entry close or once the outcome is knowable | none |
| **Team key** (up to five, `src/state/config.rs:24-27`) | Pause entries and openings (`src/instructions/admin/pause_entries.rs:17-44`); open free campaigns, **outside the valve, without bound** (SCOPE gap G-4); confirm a result early, ending the review window (`src/instructions/resolution/team_confirm_result.rs:32-77`); record the cause of an automatic void, which moves the 10% opening fee between Brot and the opener (SCOPE gap G-12) | Resume; change the config; void a YES or NO; open a contest (disabled) | Trusted not to abuse the pause, free openings and void causes; a leaked key is removed by `admin_set_team` (`src/instructions/admin/set_team.rs:75-77`) |
| **Admin** | Set the team, the creation parameters (under ceilings, future campaigns only), the fee recipient; resume; hand over the admin role in two steps (SCOPE §14) | Touch any vault; change an open campaign's fees, share or minimum | The 2-of-3 multisig on mainnet (Sprint 16) |
| **Upgrade authority** | Initialize the config once, choosing the first admin and fee recipient (`src/checks/upgrade.rs:17-44`); replace the program | — | The 2-of-3 multisig with a public 24–48 h wait (Sprint 16, TP §3.4.9); devnet: one co-founder's key (`content/powers.md`) |
| **Keeper** (primary and standby, Sprints 06–07) | Calls the permissionless instructions with a wallet holding SOL for network fees only; chooses the timing and which YES proof to post (it posts its own Pyth updates once it has a Hermes key, D4) | Anything a wallet cannot | No privilege; if both stop, any wallet can do their work (Q1) |
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
  `proof.rs:75-77`); only the upgraded receiver (`src/constants.rs:41-42`; the pre-upgrade receiver is refused,
  `tests/price_reader.rs:112`).
- **Anyone can post any signed update of any feed, of any age, to an account they own** (`price_update.rs:53-57`): a
  YES proof is therefore bounded to `[opens_at, deadline]` and to 60 s before the clock (`proof.rs:81-90`).
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
(`src/math/invariant.rs:16-33`, at `src/instructions/campaigns/open_campaign.rs:161-171` and
`src/instructions/entries/join_campaign.rs:179-182`). Account creation goes through `pinocchio-system`'s create-or-top-up
helper (`src/checks.rs:20`, `:147`), a function that postdates Pinocchio's audits (`PINOCCHIO.md`).

### 4.8 The BPF loader v3 and ProgramData

Trusted: the ProgramData layout (`u32` tag 3, slot, `Option<Pubkey>` authority) at the PDA of the program id under the
loader (`src/checks/upgrade.rs:11-44`). Only loader v3 is supported (TP §3.4.19). A funded ProgramData address makes a
program id undeployable for good (TP §3.4.19, rehearsed on devnet): the mainnet id stays unpublished until its deploy.

### 4.9 The runtime

Trusted: the Clock (`unix_timestamp`, slot, epoch), Rent and EpochSchedule sysvars (`src/readers/mod.rs:49-58`;
`src/instructions/settlement/collect_fee/moves.rs:36-39`; `src/readers/epoch.rs:89-95`); `sol_get_stack_height`
(`src/checks/top_level.rs:24-28`); the lamport-sum and rent-exemption rules; that one account may appear in two slots
(TP §14.4 C42), which is why `checks::distinct` exists (`src/checks.rs:150-156`).

### 4.10 Pinocchio and the `solana-sdk` crates under it

`PINOCCHIO.md`: the audited version (0.8.4) is not the pinned one (0.11.2).

## 5. Attack classes, per instruction

### 5.0 Index by instruction

Which classes below apply to which instruction, with the main guard and the main tests. Each class section then gives
the detail per instruction.

| Instruction | Classes (§5.x) | Main guards | Main tests |
|---|---|---|---|
| `admin_initialize_config` | 5.1, 5.3, 5.7, 5.8, 5.15 | `src/checks/upgrade.rs:17-44`; `src/checks.rs:108-118`, `:132-148`; config ≠ fee vault (`admin/initialize_config.rs:57`) | `tests/brot/checks-init.test.ts:20-98`; `tests/brot/admin-init.test.ts:36-77` |
| `admin_set_team`, `admin_set_creation_params`, `admin_set_fee_recipient`, `admin_transfer_admin`, `admin_accept_admin`, `admin_resume_entries` | 5.1, 5.2, 5.3, 5.15 | the config loader (`src/state/mod.rs:67-84`); `require_admin` (`admin/shared.rs:24-30`); the pending admin (`admin/accept_admin.rs:33-38`) | `tests/brot/admin-refusals.test.ts:19-111`; `tests/brot/checks.test.ts:26-107`; `tests/checks_mollusk.rs` |
| `team_pause_entries` | 5.14, 5.15 | a listed team key (`admin/pause_entries.rs:31-33`); `Normal` → `EntriesHalted` only (`:35-38`) | `tests/brot/admin.test.ts:142`; `tests/brot/admin-refusals.test.ts:46` |
| `user_open_campaign` | 5.1, 5.2, 5.3, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10, 5.11, 5.14 | the ten rows (`SCOPE.md` §4) | `tests/brot/open-campaign-*.test.ts` |
| `user_join_campaign` | 5.1, 5.2, 5.3, 5.5, 5.6, 5.8, 5.9, 5.10, 5.11, 5.14 | `SCOPE.md` §7 | `tests/brot/join-campaign-*.test.ts` |
| `resolve_campaign` | 5.1, 5.2, 5.4, 5.9, 5.10, 5.11 | top level (`src/checks/top_level.rs:16-22`); status and re-proof (`resolve_campaign.rs:53-69`); the readers | `tests/brot/resolve-refuses.test.ts`; `tests/brot/resolve-campaign.test.ts`; `tests/brot/price-proof.test.ts` |
| `team_confirm_result`, `team_void_campaign` | 5.1, 5.10, 5.11, 5.15 | the window (`resolution/window.rs:17-30`); automatic voids only (`resolution/void_reason.rs:23-42`) | `tests/brot/team-window.test.ts`; `tests/team_window_rules.rs` |
| `team_open_contest` | none: it refuses every call | `resolution/team_open_contest.rs:14-21` | `tests/brot/team-window.test.ts:166` |
| `finalize_campaign` | 5.1, 5.5, 5.6, 5.10, 5.11 | status and window (`finalize_campaign.rs:42-48`); the snapshot and its sums (`settlement/snapshot.rs:76-124`; `src/math/invariant.rs:45-95`) | `tests/settle_host_finalize.rs`; `tests/brot/invariant-program.test.ts:204` |
| `tally_late_joins` | 5.1, 5.11, 5.12 | `tally_late_joins.rs:35-103`; `entries/join_record.rs:40-76` | positive path only (SCOPE G-16) |
| `settle_entry` | 5.1, 5.2, 5.6, 5.8, 5.11, 5.12, 5.13 | `settle_entry.rs:83-149` | `tests/brot/invariant-program.test.ts:185`; `tests/settle_host_rules.rs` |
| `settle_creator_share` | 5.1, 5.11, 5.13 | `settle_creator_share.rs:50-108` | `tests/sdk/prepare-claim.test.ts:46` |
| `collect_fee` | 5.1, 5.11 | `collect_fee.rs:44-50` | `tests/settle_d_collect_prize.rs:65-110` |
| `settle_prize` | 5.1, 5.11, 5.13 | `settle_prize.rs:41-54` | `tests/settle_d_collect_prize.rs:113-148` |
| `close_campaign` | 5.1, 5.8, 5.11, 5.12, 5.13 | `close_campaign.rs:46-98` | `tests/brot/close-sweep.test.ts`, `close-reserve.test.ts`, `close-revival.test.ts`; `tests/settle_d_close_sweep.rs` |
| `sweep_fees` | 5.1, 5.13, 5.15 | `sweep_fees.rs:40-61` | `tests/settle_d_close_sweep.rs:118-151` |
| The event instruction `0xFF` | 5.4 | `src/events/self_cpi.rs:84-91` | `tests/brot/events.test.ts:159` |

Every named account slot of every instruction is also in the slot matrix (README, "Call sites"), except the two event
slots, which the checks negatives cover (README table). The trailing accounts are not in it: `tally_late_joins`'s joins
(SCOPE G-16) and the DBC config of `user_open_campaign` (tested in `tests/brot/readers-dbc-adversarial.test.ts:86`).

### 5.1 Account substitution

Passing a real account of the right type that is not the one this campaign, baker or config names.

| Instruction | Slot at risk | Mitigation | Test |
|---|---|---|---|
| `user_open_campaign` | the campaign or vault of another id; the metric account; the SOL/USD account; the DBC config | canonical PDAs of the argument `id` (`open_campaign/create.rs:34-38`); the reader validates the metric account, for price the sponsored PDA of the feed (`src/readers/price_touch.rs:48-50`); the SOL/USD address derived (`open_campaign/payment.rs:65-69`); the DBC config must be the pool's own (`src/readers/dbc_graduation/config.rs:67-70`) | `tests/brot/open-campaign-refuses-slots.test.ts:60`; `tests/brot/open-campaign-refuses.test.ts:33`; `tests/brot/open-campaign-refuses-payment.test.ts:43`; `tests/brot/readers-dbc-adversarial.test.ts:86` |
| `user_join_campaign` | another campaign's vault; another baker's or campaign's `Entry`; another metric account; a `Join` at another index | the vault at the campaign's PDA and stored bump (`join_campaign.rs:101-102`); the `Entry` re-derived from this campaign and this baker, and its stored keys compared (`src/instructions/entries/entry_account.rs:58-73`); the metric account is the stored one (`join_campaign.rs:106-108`); the `Join` at the canonical PDA of the entry's `join_count` (`src/instructions/entries/join_record.rs:99-102`, `:156`) | `tests/brot/join-campaign-slots.test.ts:22`, `:59`; `tests/brot/join-campaign-refuses.test.ts:119`, `:129`; `tests/brot/join-campaign-wallets.test.ts:19` |
| `resolve_campaign` | the metric account; the proof account | the metric account is the stored one (`resolve_campaign.rs:57-59`); the proof is read and judged by the reader, never trusted (`src/readers/price_touch/proof.rs:72-96`) | `tests/brot/resolve-refuses.test.ts:78`; `tests/brot/price-proof.test.ts:48-99` |
| `team_confirm_result`, `team_void_campaign`, `finalize_campaign` | another config; another campaign | the config at `["config"]`, the campaign at the PDA of its stored id (`src/state/campaign/loaders.rs:26-47`); the two must differ (`team_confirm_result.rs:44`; `team_void_campaign.rs:61`; `finalize_campaign.rs:38`) | slot matrix: 14, 14 and 13 cases (`tests/brot/slot-matrix.gen.ts:416-419`) |
| `settle_entry` | an `Entry` of another campaign; a recipient that is not the stored baker; another campaign's vault | the entry's stored campaign and baker compared before its PDA (`settle_entry.rs:96-105`), then re-derived (`:117`); `vault_of` (`:107`) | `tests/brot/invariant-program.test.ts:185` (`WrongBaker`); 32 slot-matrix cases |
| `settle_creator_share`, `settle_prize` | a recipient that is not the stored creator | `settle_creator_share.rs:59-61`; `settle_prize.rs:50-53` | `invariant-program.test.ts:185` (`WrongCreator`); `tests/settle_d_collect_prize.rs:136` |
| `collect_fee`, `close_campaign` | another fee vault; another rent payer | the canonical fee vault (`collect_fee/moves.rs:43-46`); the stored rent payer (`close_campaign.rs:53-56`) | `tests/settle_d_collect_prize.rs:90`; `tests/settle_d_close_sweep.rs:96`; `tests/brot/close-sweep.test.ts:74` |
| `sweep_fees` | a recipient that is not `fee_recipient` | `sweep_fees.rs:44-51` | `tests/settle_d_close_sweep.rs:118` |
| `tally_late_joins` | another entry; joins out of order or of another baker | `entry_account.rs:109-120`; each join's campaign, baker, index and PDA (`join_record.rs:40-76`); the next index only (`tally_late_joins.rs:66-70`) | 22 slot-matrix cases for the five named slots; the `Join` list only on the host parser (`tests/join_host_record.rs:51`); no instruction-level test (SCOPE G-16) |
| admin instructions | a look-alike config | the config's PDA (`src/state/mod.rs:62`, `:82`) | `tests/brot/checks.test.ts:77`; `tests/checks_mollusk.rs:135` |

### 5.2 Owner and type confusion

The same bytes under another owner; a program account of another type; an Anchor discriminator that collides across
programs (`src/readers/damm_v2.rs:36-37`).

- **The program's own accounts:** owner first, then exact length, then tag and layout version, then the PDA, before
  any field is read (`src/state/mod.rs:49-84`); the tags are 1, 2, 3 and 5, and 0 is never written, so a zeroed account
  fails (`src/state/mod.rs:25-35`). Tests: `tests/brot/checks.test.ts:26`, `:44`, `:50`, `:56`, `:62`, `:71`; the slot
  matrix's "type" cases put an account of each other program type in every slot (`tests/brot/slot-matrix.gen.ts`).
  `Join` (96 bytes) and `Entry` (116) differ in length, so one cannot pass for the other. `settle_entry` reads the entry's
  stored keys only after its owner, length and tag (`settle_entry.rs:53-67`).
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
  (`src/checks.rs:105-118`). Tests: `tests/brot/checks-init.test.ts:20`; `tests/checks_mollusk_init.rs:62`;
  `tests/brot/open-campaign-refuses-slots.test.ts:60`.
- **Other derived addresses:** the campaign vault from the campaign and its stored bump (`src/checks/paying.rs:29-37`;
  `join_campaign.rs:101-102`); the fee vault canonical (`collect_fee/moves.rs:43-46`) or at the config's bump
  (`sweep_fees.rs:52-53`); the sponsored Pyth account (`src/readers/price_update.rs:118-126`); the ProgramData PDA
  (`src/checks/upgrade.rs:25-28`); the event authority, a constant (`src/constants.rs:32-34`) proven canonical by
  `tests/layout.rs:75-79`.

### 5.4 CPI and re-entry

- **Outgoing calls:** the program calls only the System Program (`src/vault.rs:26-31`; `src/checks.rs:147`) and itself,
  for events (`src/events/self_cpi.rs:57`). It never calls a third-party program: the readers only read accounts. So no
  callback can re-enter a handler mid-state. The self-CPI re-enters only the `0xFF` handler, which reads and writes
  nothing (`self_cpi.rs:84-91`).
- **Incoming CPI:** `resolve_campaign` must run at the transaction's top level (`src/checks/top_level.rs:16-22`), so no
  program can wrap a resolution in logic the transaction does not show. Test: `tests/brot/resolve-refuses.test.ts:53`,
  through `tests/programs/cpi-proxy`. The other instructions accept CPI by design (a multisig executes the admin's, a
  program may join for its PDA); each still checks its signer and every slot.
- **Forged events:** the event handler succeeds only for the event authority, signed, which only this program can sign
  (`self_cpi.rs:84-91`; `src/constants.rs:28-34`). Tests: `tests/brot/events.test.ts:159` (a top-level call refused);
  `tests/sdk/decoder.test.ts:89` (a call through another program refused); `tests/event_cpi.rs:71`.
- **Borrows across CPIs:** every handler drops its account borrows before an event or a transfer (for example
  `src/instructions/admin/accept_admin.rs:42`; `join_campaign.rs:200-201`); a slip fails as `AccountBorrowFailed`
  rather than passing silently (`src/vault.rs:21`).

### 5.5 Arithmetic

- Clippy denies unchecked arithmetic, truncating casts and sign-losing casts in the crate (`Cargo.toml:60-63`); the
  release profile keeps overflow checks (root `Cargo.toml:13-14`). Money is u64 with u128 intermediates
  (`src/math/rounding.rs:1-74`); prices, targets and times widen to i128 before they combine
  (`src/readers/price_touch/rules.rs:8-10`; `src/math/schedule.rs:9-10`). Every failure is `MathOverflow` 6000, never a
  wrap; a rate above 100% and a zero divisor are refused (`src/math/rounding.rs:12-31`).
- Counters are checked: `event_seq` (`src/instructions/resolution/team_shared.rs:25-30`), `join_count`
  (`src/instructions/entries/join_record.rs:156-157`), `entries_open` and `entries_untallied` (`join_campaign.rs:126-136`),
  `open_campaigns`, whose decrement refuses below zero (`src/instructions/settlement/snapshot.rs:103-107`).
- `unsafe` appears in three places only: the zero-copy views, whose alignment 1 and exact size are asserted at compile
  time (`src/layout.rs:73-125`), and two syscalls (`src/checks/top_level.rs:27`; `src/readers/vote_stake.rs:94`).
- Tests: `tests/math_opening_properties.rs` (an overflow exactly past u64); `tests/price_math.rs` (negative prices, the
  largest confidence, exponents +5 and −30); `tests/math_payout_refusals.rs`; `tests/readers_shared.rs`
  (`min_distance` at the ends of i128); `tests/price_stale_feed.rs:102` (publish times at the ends of i64);
  `tests/cursor.rs:46` (a skip that overflows); `tests/team_window_rules.rs:140` (`seq` at its maximum).

### 5.6 Rounding

- One direction per kind of amount, written once (`src/math/rounding.rs:1-8`): fees round up (`bps_ceil`), payouts and
  the creator share round down (`bps_floor`, `mul_div_floor`), the opening rounds toward Brot (`div_ceil` on the
  lamports, the prize floored, `src/math/opening.rs:45-78`).
- The dust of a `Split` (less than the number of winning entries) stays in the vault and goes to the fee vault at close
  (I6; `close_campaign.rs:73-75`, `:93`). Splitting an entry across wallets never receives more (I9: the floor of a sum is
  at least the sum of floors). Winners never get back less than their entry (I11: `from_pot ≤ P − fee`,
  `src/math/payout.rs:65-68`).
- The join estimate rounds down (`src/math/payout.rs:150`), so a `min_return_bps` equal to the estimate passes.
- Tests: `tests/math_fees.rs`; `tests/math_payout_properties.rs` (I6, I9, I11, I13); `tests/brot/invariant-rules.test.ts:113-128`;
  24,000 vectors replayed by an independent TypeScript implementation (`tests/math_vectors.rs`,
  `tests/math_vectors_snapshot.rs`; `tests/sdk/math-vectors.test.ts`, `tests/sdk/snapshot-vectors.test.ts`).

### 5.7 Reinitialization

- `checks::create_pda_account` refuses an address the program owns, an address another program owns, and a System
  account that carries data (`src/checks.rs:139-143`); `state::init` refuses an account whose first two bytes are not
  zero (`src/state/mod.rs:90-105`).
- Per account: the config (a second `admin_initialize_config`: `tests/brot/checks-init.test.ts:64`;
  `tests/checks_mollusk_init.rs:112`; `tests/brot/admin-init.test.ts:69`); a campaign whose id is taken
  (`tests/brot/open-campaign-retry.test.ts:18`); an `Entry` (loaded, never re-created, once owned:
  `join_campaign.rs:126-136`); a `Join` (one index per join, a second creation at the same address refused:
  `join_record.rs:111`). `tests/checks_host_loaders.rs:87` shows `init` writes the tag once.
- Observation: `create_join` writes the `Join` header directly rather than through `state::init`
  (`join_record.rs:112-122`); safe, since `create_pda_account` has just refused any program-owned or data-carrying
  account, but outside the house rule (SCOPE gap G-15).
- Re-opening a closed campaign's id: SCOPE O-4.

### 5.8 Lamport injection

- **No balance is read from a vault.** Pools, prize, opening fee, fees and shares are fields
  (`src/state/campaign.rs:90-169`); hand-sent SOL never becomes an entry, a prize or a chance (I15). Test:
  `tests/brot/join-campaign-pot.test.ts:19`. The deposit assertion measures only the change across the instruction, so a
  surplus already in the vault never refuses a join (`src/math/invariant.rs:1-4`).
- **Pre-funded addresses** of a vault, campaign, `Entry`, `Join`, config or fee vault: creation tops up, allocates and
  assigns instead of failing (`src/checks.rs:127-148`). Tests: `tests/brot/open-campaign-retry.test.ts:36`, `:52`;
  `tests/brot/join-campaign-adds.test.ts:120`; `tests/brot/checks-init.test.ts:98`; `tests/brot/admin-init.test.ts:77`;
  `tests/checks_mollusk_init.rs:121`. A pre-funded unsigned path is refused by the signer check
  (`tests/brot/checks-init.test.ts:76`; `tests/brot/open-campaign-team.test.ts:72`).
- **Where hand-sent SOL ends:** a vault's or a campaign's surplus goes to the fee vault at close
  (`close_campaign.rs:66-88`); an `Entry`'s or a `Join`'s goes back to the baker with its rent (`settle_entry.rs:132`,
  `:147`; `tally_late_joins.rs:92-93`); the fee vault's goes to `fee_recipient`. The randomized run sends SOL by hand
  among its operations and checks I1 and I15 after each (`tests/brot/invariant-ops.ts:181-182`;
  `tests/brot/invariant-checks.ts:26-31`, `:157-161`).
- A funded ProgramData address blocks a deploy (§4.8).

### 5.9 Stale or manipulated price

| Moment | Threat | Mitigation | Test |
|---|---|---|---|
| A paid opening (SOL/USD) | an old, wide or foreign price lowers or raises the charge | the derived sponsored account, `Full`, the feed, age ≤ `max_price_age`, ≤ 60 s ahead, posted within the slot bound, confidence ≤ `max_price_conf_bps`; charged at `price − conf`; at most the signed `max_lamports` (`open_campaign/payment.rs:47-108`) | `tests/brot/open-campaign-refuses-payment.test.ts:43-97`; `tests/open_h_price.rs`; `tests/open_campaign_payment.rs` |
| Opening a price campaign | a feed outside the list, a stale or wide price, a target already touched or too near | the compiled feed list (`src/feeds.rs:40-49`); age ≤ `campaign_max_age`, slot bound, confidence ≤ 0.5% (`src/readers/price_touch.rs:47-67`); the target at least 1% past the band edge, within a tenfold move (`price_touch/target.rs:34-68`) | `tests/brot/open-campaign-refuses.test.ts:50-84`; `tests/price_opening.rs`; `tests/price_target.rs` |
| A join | a baker picks an older price to dodge the lock | only the stored sponsored account, which only moves forward (§4.1); the stored exponent; age ≤ the campaign's `max_age` (≥ 30 s); the slot bound (`price_touch.rs:76-94`) | `tests/brot/join-campaign-price.test.ts:35-88`; `tests/price_join.rs` |
| A join near the target | the price crossed off-chain before the sponsored account shows it | the proximity buffer: refused while the band edge is within 1% of the price (`src/instructions/entries/join_rules.rs:43-62`); a join at or after the YES proof's `publish_time` is refunded whole (`SCOPE.md` §7). Residual: a move that crosses inside one publisher interval without showing near the target first (`join_lock.rs:28-30`) | `tests/join_host_buffer.rs`; `tests/brot/join-campaign-lock.test.ts:64`; `tests/brot/late-entries.test.ts:27` |
| The YES proof | an old update, a foreign feed, a price in another exponent, a band that only half crosses | any `Full` account of the feed, published in `[opens_at, deadline]`, ≤ 60 s old and ≤ 600 slots, positive, the whole band past the target (`price_touch/proof.rs:72-96`). Within those bounds a resolver may pick any of Pyth's own updates: a touch counts if Pyth signed it (Q4) | `tests/brot/price-proof.test.ts:48-99`; `tests/price_proof.rs` |
| After the window | a lapsed sponsorship turns every open campaign to NO | `StaleFeed` voids when the last update before the deadline is older than `deadline − max(max_age, 600 s)` (`proof.rs:104-124`); an update after the deadline gives NO, since the program cannot see the last one before it | `tests/brot/price-proof.test.ts:114`; `tests/price_stale_feed.rs` |
| A touch nobody proves in time | a short touch is lost if no proof lands within 60 s | the keeper posts its own proofs with a Hermes key (D4; mainnet price campaigns wait for it, TP §3.4.8); no on-chain correction of the NO afterwards (SCOPE G-3) | — |
| The oracle itself | a receiver upgrade or governance change | out of the program's reach (§4.1) | — |

### 5.10 Clock

- One clock read per instruction serves every rule in it (`open_campaign.rs:122-125`; `join_campaign.rs:113-114`).
- Boundaries, each tested on both sides: entries close at `now ≥ entries_close_at` (`join_campaign.rs:115`;
  `tests/brot/join-campaign-refuses.test.ts:44`); a fact met in the deadline's own second is still YES
  (`src/readers/shared.rs:93-97`); the proof window ends at `D + 60` inclusive (`proof.rs:56`;
  `tests/brot/price-proof.test.ts:99`); the review window is closed from `review_ends_at` on (`window.rs:9-13`;
  `finalize_campaign.rs:46`; `tests/team_window_rules.rs:30-53`); durations are inclusive at 3 and 90 days
  (`src/math/schedule.rs:39-48`; `tests/brot/open-campaign-refuses.test.ts:98`).
- A lagging cluster clock cannot keep an old price fresh: freshness is also bounded in slots, at 100 ms a slot
  (`price_touch/rules.rs:64-74`). A price published far ahead of the clock is stale (60 s lead,
  `src/constants.rs:87-90`).
- The epoch kinds assume a slowest average slot of 500 ms when they check that the measured epoch starts before the
  deadline (`src/readers/epoch.rs:131-148`); a missed epoch voids as `MissedWindow`, a house failure that refunds the 10%.
- Alpenglow may let the leader set the Clock timestamp and shorten slots to about 200 ms (TP §3.4.8) **[to verify on
  mainnet before launch]**; drift on devnet was 1 s in one sample (TP §14.4 C12).

### 5.11 Ordering, replays and double settlement

| Sequence | Guard | Test |
|---|---|---|
| A retried opening | the id's account exists (`AlreadyInitialized`) | `tests/brot/open-campaign-retry.test.ts:18` |
| A retried join | `expected_entry_total` (`entry_account.rs:69-71`) | `tests/brot/join-campaign-refuses.test.ts:73` |
| A second resolution | `CampaignNotOpen`, or the re-proof rule (`resolve_campaign.rs:53-69`) | `tests/brot/resolve-refuses.test.ts:64`, `:72`; `tests/brot/cutoff-reproof.test.ts:21` |
| Finalize twice, or after a team act | status, then the transition table (`finalize_campaign.rs:42-44`; `src/state/transitions.rs:13-30`) | `tests/settle_host_finalize.rs:175`; `tests/brot/invariant-program.test.ts:204` |
| A team act after the window; finalize inside it | the window rules (`window.rs:17-30`; `finalize_campaign.rs:45-48`) | `tests/brot/team-window.test.ts:149`; `tests/team_window_rules.rs:42` |
| Settle an entry twice | the `Entry` closes in the instruction that pays it (`settle_entry.rs:146-149`); a closed one is `AlreadySettled` (`:93-95`) | the randomized run settles out of order and twice (`tests/brot/invariant-settle.ts`) |
| Settle before finalize, or before the tally | `NotFinalized` (`settle_entry.rs:108-112`); `NotTallied` (`:113-120`), defensive, since finalize already requires every join tallied (`src/instructions/settlement/snapshot.rs:80-82`) | the randomized run expects `NotFinalized` before finalize (`tests/brot/invariant-settle.ts:60`); finalize's own `NotTallied`: `tests/settle_host_finalize.rs:48`; no test reaches the two `NotTallied` branches of `settle_entry` **[INF: unreachable after finalize]** |
| The share, the fee, the prize twice | the flags (`settle_creator_share.rs:79-101`; `collect_fee.rs:45-47`; `settle_prize.rs:47-49`) | `tests/sdk/prepare-claim.test.ts:46`; `tests/settle_d_collect_prize.rs:65`, `:136` |
| Collect before every entry is settled | `entries_open == 0` (`collect_fee.rs:72-80`) | `tests/settle_d_collect_prize.rs:80` |
| Close twice, or early | `AlreadyClosed`; the flags (`close_campaign.rs:46-48`, `:113-127`) | `tests/settle_d_close_sweep.rs:73`, `:78`; `tests/brot/close-sweep.test.ts:74` |
| Tally twice or out of order | the next index only; `EntryAlreadyTallied` (`tally_late_joins.rs:58-70`); a join passed twice fails the owner check once closed | none through the program (SCOPE G-16); the host parser in `tests/join_host_record.rs:51` |
| A join landed in the same slot just before a burn, a lock or a curve's completion | the lock reads the account as it is when the join executes; whoever orders both transactions (the creator who controls the account, or a block builder) can put the join first | accepted risk (§6); `tests/brot/join-campaign-lock.test.ts:109`, `:127` |
| The first resolver chooses the YES proof | it sets the late-join cut-off; an earlier proof can move it back only while no entry is fully tallied, and a partial tally does not lock it | SCOPE O-3; `tests/brot/cutoff-reproof.test.ts:21` covers the whole-entry case only |

### 5.12 Closing and revival

- `checks::close_account` refuses an account it does not own or that still holds lamports, zeroes the data, then the
  library's `close` zeroes the owner (the System Program), the lamports and the data length (`src/checks/close.rs:17-23`;
  `solana-account-view` 2.1.0 `close`, `PINOCCHIO.md`). Tests: `tests/checks_close_paying.rs:23-63`.
- A campaign closed and funded again in the same transaction is the System Program's and fails the next instruction
  (`WrongOwner`): `tests/brot/close-revival.test.ts:27`. A revived `Entry` address reads as settled
  (`settle_entry.rs:69-72`, `:93-95`). A `Join` passed twice in one tally fails the owner check the second time.
- After close, the same id can be opened again (SCOPE O-4).

### 5.13 Rent and the reserve path

- The runtime refuses a balance left between zero and the rent-exempt minimum. The creator share is the one credit routed
  around it: reserved in the vault when it would leave an empty wallet below the minimum, claimed later from a funded
  wallet, or paid with the rents at close (`src/instructions/settlement/rules.rs:99-130`;
  `settle_creator_share.rs:75-108`; `close_campaign.rs:60-78`). Tests: `tests/settle_host_rules.rs:150`, `:162`;
  `tests/sdk/prepare-claim.test.ts:46`; `tests/brot/close-reserve.test.ts:52`, `:63`.
- A settled `Entry` always credits at least its own rent to the baker (`settle_entry.rs:132`, `:147`).
- `settle_prize`, `collect_fee` and `sweep_fees` have no reserve path: a credit that would leave an empty recipient below
  the minimum makes the transaction fail, the flag stays unset, and `close_campaign` waits. With the founder's values the
  prize is about 4.12 SOL (TP §3.4.5), far above the minimum; the case needs an opening fee near its US$1 floor and a
  high SOL price **[INF]**. Liveness only: the recipient can fund its wallet and anyone can retry.
- Rent is read from the Rent sysvar at the moment of use (`collect_fee/moves.rs:36-39`; `close_campaign.rs:65`, `:80`).

### 5.14 Denial of service and griefing

| Lever | Effect | Bound |
|---|---|---|
| The pause (a team key, or a leaked one) | stops joins and openings | never results or payouts (I10′); only the admin resumes (`admin/resume_entries.rs:16-39`) |
| Free openings by a leaked team key | unbounded campaigns for the services to resolve | none in code (SCOPE G-4); the key is removed by `admin_set_team`; every team opening raises an alert (Sprint 16) |
| Paid openings that fill the valve | stops other paid openings up to 90 days | `max_open_campaigns` (`open_campaign/rules.rs:101-111`); each costs US$500, of which about US$50 is kept when nobody joins (TP §7) |
| Many joins per baker | many `Join` accounts to tally before finalize | each join costs at least the minimum entry plus a `Join` rent; the tally is permissionless; how many joins fit one tally transaction is **[to verify]** |
| A keeper outage on an epoch kind | the measured epoch is missed | `MissedWindow` voids and refunds the opening fee (`src/readers/stake_pool.rs:186-188`) |

### 5.15 Privileged keys

- **Initialization** cannot be front-run: only the upgrade authority recorded in ProgramData initializes
  (`src/checks/upgrade.rs:17-44`). Tests: `tests/brot/admin-init.test.ts:36-58`; `tests/brot/checks-init.test.ts:34-58`.
- **Admin:** cannot touch a vault. Can raise the opening price up to US$5,000 and Brot's fee up to 10% for future
  campaigns only (`src/state/config.rs:142-193`; `tests/brot/admin-params.test.ts:69-147`); can redirect Brot's own fees
  (`admin/set_fee_recipient.rs:32-53`); a pending hand-over can be replaced or cancelled (`admin/transfer_admin.rs:44-46`).
- **Team key:** §3. The worst case of a leaked key is griefing (pause, unbounded free openings), skipping reviews
  (confirm early), and moving the 10% opening fee on automatic voids; it cannot redirect an entry, a prize or a share.
- **Upgrade authority:** everything, by replacing the program (TP §3.4.9; `content/powers.md`). Mainnet: the multisig and
  a verifiable build (Sprints 16 and 18).

## 6. Accepted risks (the founder's decisions)

| Risk | Decision and source | What is left |
|---|---|---|
| **No cap**, global or per campaign: a bug's loss has no ceiling | D-h (`session-log/2026-10-08-decisoes-do-fundador-bp-v0.0.4.md:20`; TP §13, first row; `docs/sprints/sprint-18-mainnet.md:104-105`) | Both audits, the multisig, the pause, the exposure alert (off-chain) |
| **No accepted-account list**: any account a reader accepts can back a campaign, a worthless token included | D-i (same session log, `:20`; TP §3.4.10 "What the checks do not stop"); narrowed for the price kind by the compiled feed list (TP §14.2, answer 1) | The US$500 opening, the automatic notice, the indexer's creator flag, unlisting (off-chain) |
| **A creator who controls the measured account forces the outcome** (burn, lock, stake, curve) | TP §3.4.10 "What the checks do not stop"; TP §13, third row; `docs/sprints/sprint-18-mainnet.md:107-109`. Alone on the forced side, the creator's net cost is about US$50, so forcing pays once `0.9 × X > 50` (X ≈ US$56 of third-party money) **[INF, TP]** | The notice; the creator may join their own campaign and nothing blocks it (BR-26) |
| **YES can be bought** on fact kinds (pay the rest of a curve, lock liquidity, burn supply) | DBC M-6 (`docs/technical/meteora-readers-plan.md:20`); the same for burn and lock | The campaign page says so; DBC does not open on mainnet |
| **Self-referral** (Sprint 14): possible, its gain capped | TP §3.4.11; `docs/sprints/sprint-14-referral-second-read.md:72-73` | Off-chain payout routine with a ceiling |
| **No correction of a recorded YES or NO** until Sprint 14's contest: a team key never voids a result the reader recorded | Decision of 2026-10-09 (TP §3.4.18; `src/instructions/resolution/void_reason.rs:33-42`) | The six-hour window only lets a team key confirm early or re-label an automatic void (SCOPE G-3 lists the TP rows that still assume a team void) |
| **The upgrade authority can replace the program** | TP §3.4.9, last row; `content/powers.md` | The 2-of-3 multisig with a public wait; a verifiable build |

Not accepted, still open: **prize harvesting** (SCOPE O-1; TP §14.2: a rule before mainnet).

## 7. Open items

The threats this model leaves open are listed, with code references, in `SCOPE.md` §17: O-1 (prize harvesting), O-2
(the join's return floor in a lopsided pot), O-3 (the YES-proof cut-off and partial tallies), O-4 (id reuse after
close), O-5 (a reserve paid at close appears in no event), G-3 (no correction of a YES or NO), G-4 (unbounded free
openings by a team key), G-10 (I10′ coverage), G-12 (the team key and the 10%), G-16 (`tally_late_joins` untested
through the program), and the unverified Pyth receiver controller (§4.1).
