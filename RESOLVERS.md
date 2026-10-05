# Resolver research

What a program can read from other programs' accounts without an oracle, which of it is worth a market, and how each read
can be attacked. Written 2026-10-02 against mainnet (slot ~452.72M, epoch 1047). Layouts come from upstream source and
were decoded from live account bytes. Every claim carries a tag: **V** verified on live mainnet bytes, **S** read from
upstream source only, **U** unverified.

Three resolvers came out of it and are built: `StakePoolTvlAtLeast`, `DammV2LockedAtLeast` and `MetadataImmutable`
(section 5). `LockedAtLeast` was fixed (section 1.3). The rest of this file is the evidence, and what was left out.

## 1. What the research changed

### 1.1 Pool reserves and TVL read from a live balance are a free option

Resolution is instant and final, so a metric that one transaction can raise and lower hands the sponsor's budget to the
first bot. It buys YES from the sale, borrows, deposits, calls `resolve`, withdraws and repays, all in one transaction.
`require_trading_open` does not help: the bot buys YES before the metric moves. Sale math from `app/lib/market.ts`, flash
fee 0.001% (reported: Kamino 0.001% on its Multiply flash loans, and zero-fee flash loans from Kamino and marginfi
through integrators; the fee is a rounding error either way):

| Sponsor budget | YES price | Flash-borrowed TVL goal | Bot buys / pays | Bot redeems | Bot's net | TVL left |
| --- | --- | --- | --- | --- | --- | --- |
| $1,000 | 20c | $5M | 1,250 YES / $250 | $1,250 | ~$950 | $0 |
| $10,000 | 10c | $20M | 11,111 YES / $1,111 | $11,111 | ~$9,800 | $0 |
| $50,000 | 5c | $100M | 52,632 YES / $2,632 | $52,632 | ~$49,000 | $0 |

Fee figures are from aggregator pages (https://solanacompass.com/projects/kamino-finance and
https://solanacompass.com/projects/category/defi/flash-loans), not from the protocols' own docs.

The bot's gross is exactly the budget, because every YES it buys is covered `1 - p` by the sponsor. "Mercenary capital"
is welcome here when it commits for the incentive window; a same-slot round trip commits for nothing. Every resolver
therefore reads something one-way, or something that needs capital held across a boundary the caller cannot move.

### 1.2 Raydium's volume counters no longer update

CLMM `swap_in_amount_token_*` / `swap_out_amount_token_*` and AMM v4 `swap_*_amount` are strictly monotonic **in the
code that used to write them**, but upstream deleted every write (CLMM commit `5ec3081af0`, 2026-04-09; AMM v4 PR #69,
2026-07-23). Live (V): all counters had a change of 0 across three snapshots while the SOL-USDC pools traded. CPMM never
had one. A "volume >= X" market on them resolves YES at creation (a stale value above X) or never. The only live
cumulative counters found are Meteora DAMM v2's `metrics.total_*_fee` (section 3.9).

### 1.3 `LockedAtLeast` on the incinerator was not one-way

SPL Token skips the owner check on `Burn`, and on `CloseAccount` of an empty account, when the token account is owned by
the incinerator or the system program (S: `process_burn` and `process_close_account` in `solana-program/token`,
`Account::is_owned_by_system_program_or_incinerator`). So anyone can burn the "locked" balance, and anyone can close the
account while it is empty, which makes `buy_yes` and `resolve` revert on the missing account.

V: a simulation against mainnet, nothing sent, with an authority that is not a signer: `Burn(1)` on the incinerator's
BONK token account succeeded (balance 638,657,530,458 became ...457 and the mint's supply fell by 1), and a `Transfer`
by the same key failed with `owner does not match`. The same holds for Token-2022 (PYUSD's incinerator account).

Effect on a market: the NO side can reset the doers' progress, or halt the sale, for a transaction fee. The previous
tests missed it because they injected token accounts instead of running the real Token program.

Fix (built): the metric account is now the associated token account of a PDA of this program, `["lock"]`, which never
signs. SPL Token has no special case for it, so nothing can burn, move or close what it holds. `tests/pred-provable.test.ts`
keeps both facts as regression tests: the incinerator account can be burned by a non-signer, the lock account cannot.

Not fixed, by design: a mint with a live freeze authority can still freeze the lock account (and the doers' wallets).
SOL cannot be tracked this way at all: `Bank::freeze` calls `run_incinerator` every slot, so SOL sent to the incinerator
leaves no balance to read (S: Agave `runtime/src/bank.rs`).

### 1.4 `sol_get_epoch_stake` reads a filtered snapshot

On Agave 4.x the epoch stakes stored at each epoch boundary come from `clone_and_filter_for_vat(2000, ...)` (S:
`bank.rs`, `update_epoch_stakes` called with `filtered_distribution_vote_accounts`). Vote accounts with no BLS key,
below the minimum balance or outside the top 2000 by stake read 0. V (indirect): 5 staked vote accounts report
`epochVoteAccount = false`, 4 of them without a BLS key. Nothing has called the syscall directly (no deployed caller). A
`StakeAtLeast` market on such a validator can only resolve NO; it is documented in the README, not changed.

### 1.5 pump.fun graduation is cost-bounded, not flash-proof

`BondingCurve.complete` (byte 48) never reverts in anything observed, and buying and selling revert after it
(`BondingCurveComplete`, V). But `migrate` is permissionless and the PumpSwap pool exists as soon as it runs, so a flash
loan can complete the curve and dump the tokens in the same transaction. Lower bound of the loss, from live event
numbers: 18.66 SOL (21.7%) on an untouched curve, 2.16 SOL for the last 10%, **0.07 SOL for the last 1%**. A bounty above
that cost, on a nearly full curve, is a free option. The program is closed source, upgradeable and was redeployed hours
before the check, and its account has grown four times by appending fields. On hold (section 3.12).

### 1.6 Token-2022 "fee accumulators"

`TransferFeeConfig.withheld_amount` on the mint is raised by the permissionless `HarvestWithheldTokensToMint` and zeroed
by `WithdrawWithheldTokensFromMint`, so it is not monotonic. No cumulative counter of fees ever collected exists (V,
layout and processors). It becomes a ratchet only when `withdraw_withheld_authority` is None (21 of 529 fee mints live):
then harvest keeps adding and nothing can take it out.

## 2. Classification

| Source | Reads | One-way? | Cost to move it | Verdict |
| --- | --- | --- | --- | --- |
| SPL Token mint | supply, mint and freeze authority | yes (authority revoked) | burn supply for good | built |
| SPL Token account at the lock PDA | locked balance | yes | tokens locked for good | built (fixed) |
| Loader-v3 ProgramData | upgrade authority | yes | none: only the authority holder | built |
| Vote stake (`sol_get_epoch_stake`) | validator stake in one epoch | snapshot | stake held across epochs | built |
| **SPL stake pool `last_epoch_total_lamports`** | TVL at an epoch start | snapshot | capital held across the boundary | **built** |
| **Meteora DAMM v2 `permanent_lock_liquidity`** | liquidity locked forever | yes | principal locked for good | **built** |
| **Metaplex `is_mutable`** | metadata frozen | yes | none: only the update authority | **built** |
| Meteora DAMM v2 `metrics.total_*_fee` | cumulative fees | yes | at least the 20% protocol share | roadmap |
| Vote `epoch_credits` | validator credits per epoch | yes | none: only the validator earns them | roadmap |
| Token-2022 extensions (TLV) | authority revocations, fee schedule | yes | none | roadmap |
| Orca `LockConfig` | one locked position | yes | principal locked | roadmap, per position |
| Raydium CPMM / AMM v4 `lp_supply` minus LP mint supply | LP burned | yes | LP burned for good | roadmap |
| pump.fun `BondingCurve.complete` | graduation | yes | the rest of the curve | on hold |
| DEX vault balances, `liquidity`, `sqrt_price` (all venues) | reserves | no | a flash loan | rejected |
| Stake pool live `total_lamports` | live TVL | no | 0.1% fee on JitoSOL | rejected |
| Raydium CLMM / AMM v4 swap counters | volume | not updated | n/a | dead |
| Native stake `delegation.stake` | delegated amount | no | split, merge, withdraw | rejected |
| StakeHistory, EpochRewards sysvars | cluster totals | n/a | n/a | not useful |
| SOL sent to the incinerator | burned SOL | n/a | n/a | unreadable |

## 3. Verified layouts

Offsets are bytes from the start of account data. Anchor accounts include their 8-byte discriminator. All integers are
little-endian. Read third-party fields by copying bytes (`u128::from_le_bytes(data[a..b])`); never cast to a struct: the
zero-copy u128s sit at offsets that are not 16-aligned.

### 3.1 SPL Token mint and account (classic)

Program `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`. Packed C layout, no discriminator. **V**.

| Account | Fields |
| --- | --- |
| Mint, 82 bytes | mint authority `COption` @0 (u32 tag + 32), supply u64 @36, decimals @44, is_initialized @45, freeze authority `COption` @46 |
| Token account, 165 bytes | mint @0, owner @32, amount u64 @64, delegate `COption` @72, state @108, is_native @109, delegated_amount @121, close authority `COption` @129 |

### 3.2 Loader-v3 ProgramData

Program `BPFLoaderUpgradeab1e11111111111111111111111`. bincode. u32 tag @0 (= 3), u64 slot @4, upgrade authority
`Option<Pubkey>`: tag @12, key @13. Inputs: the program account (owner = the loader) and its ProgramData PDA
(`[program_id]` under the loader). **V**.

### 3.3 Vote stake through `sol_get_epoch_stake`

`sol_get_epoch_stake(var_addr) -> u64`: a null pointer returns the cluster total, otherwise 32 bytes at the pointer are a
vote address (100 and 110 CU). **S**: it reads `epoch_stakes[bank.epoch + 1]`, inserted once at the first slot of epoch E,
so it is the effective stake at the start of E, frozen for all of E (Delegate, Deactivate, Split, Withdraw and reward
payouts during E cannot change it). It includes delegations up to E-1 and excludes the compounding of E-1's rewards. Only
the current epoch is readable. See section 1.4 for the filter. LiteSVM returns 0.

### 3.4 SPL stake pool (`StakePoolTvlAtLeast`)

Program `SPoo1Ku8WFXoNDMHPsrGSTSG1Y47rzgn41SLUNakuHy` (upgrade authority `dPpFfahSWhm5M2RB3nVaHsXfnh9ooz5bWtR3WeUguDH`).
Borsh, allocated 611 bytes, `account_type` byte 1 (a `ValidatorList` is 2). **V** on JitoSOL
(`Jito4APyf642JPZPx3hGc6WWJ8zPKtRbRs4P815Awbb`) and bSOL (`stk9ApL5HeVAwPLr3TLhDXdZS8ptVu7zp6ov8HFDuMi`).

| Field | Type | Offset |
| --- | --- | --- |
| account_type | u8 | 0 |
| manager, staker, stake_deposit_authority | 3 x Pubkey | 1, 33, 65 |
| stake_withdraw_bump_seed | u8 | 97 |
| validator_list, reserve_stake | 2 x Pubkey | 98, 130 |
| **pool_mint** | Pubkey | 162 |
| manager_fee_account, token_program_id | 2 x Pubkey | 194, 226 |
| **total_lamports**, pool_token_supply, **last_update_epoch** | 3 x u64 | 258, 266, 274 |
| lockup, epoch_fee | 48 + 16 | 282, 330 |
| next_epoch_fee | `FutureEpoch<Fee>`: tag 0/1/2, +16 if not 0 | 346 |
| preferred deposit and withdraw validator | 2 x `Option<Pubkey>` | variable from here on |
| stake_deposit_fee, stake_withdrawal_fee, next_stake_withdrawal_fee, stake_referral_fee | 16, 16, `FutureEpoch<Fee>`, u8 | |
| sol_deposit_authority, sol_deposit_fee, sol_referral_fee | `Option<Pubkey>`, 16, u8 | |
| sol_withdraw_authority, sol_withdrawal_fee, next_sol_withdrawal_fee | `Option<Pubkey>`, 16, `FutureEpoch<Fee>` | |
| last_epoch_pool_token_supply, **last_epoch_total_lamports** | 2 x u64 | 419, **427** when every option is unset (JitoSOL, bSOL) |

`Fee` is `{denominator u64, numerator u64}`. The reader walks the options, so it does not depend on 427.

Why `last_epoch_total_lamports` is safe and `total_lamports` is not (S, `solana-program/stake-pool`
`processor.rs`; V on the effect):
- `DepositSol`, `WithdrawSol`, `DepositStake` and `WithdrawStake` all revert with `StakeListAndPoolOutOfDate` when
  `last_update_epoch < clock.epoch`. During the first slots of an epoch, until the pool's first update, nobody can change
  the total.
- `UpdateStakePoolBalance` stores `last_epoch_total_lamports = previous total_lamports` only when
  `last_update_epoch < clock.epoch`, i.e. once per epoch. It is therefore the bookkept total after the last deposit or
  withdrawal of the previous epoch, before that epoch's rewards are counted.
- A `DepositSol` followed by `WithdrawSol` in one transaction works (mainnet simulation, V): `total_lamports` and
  `pool_token_supply` moved for the instructions in between, at 0.10% round-trip cost on JitoSOL (0 in, 0.1% out; bSOL
  about 0.18%, computed). So the live total is flash-inflatable, the snapshot is not.
- Identity (V, difference 0 on both pools): `total_lamports = reserve lamports - rent_minimum(200) + sum(active +
  transient stake)`.

Hazards: pool bookkeeping can lag the mint (bSOL's supply differed by 326,880 base units until the next update); the
manager can change fees and authorities; offsets past 346 move with the options; other pools may use Token-2022.

### 3.5 Meteora DAMM v2 pool (`DammV2LockedAtLeast`)

Program `cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG` (upgradeable, last deploy 2026-09-08). Anchor zero-copy `Pool`,
**1112 bytes** with the discriminator `f19a6d0411b16dbc`. **V** on four pools.

| Field | Type | Offset |
| --- | --- | --- |
| pool_fees (`protocol_fee_percent` u8 @48, live 20) | 160 bytes | 8 |
| **token_a_mint**, **token_b_mint** | Pubkey | 168, 200 |
| token_a_vault, token_b_vault, whitelisted_vault | 3 x Pubkey | 232, 264, 296 |
| liquidity (total, all positions) | u128 | 360 |
| protocol_a_fee, protocol_b_fee (uncollected) | u64 | 392, 400 |
| sqrt_min_price, sqrt_max_price, sqrt_price (Q64.64, range fixed at creation) | 3 x u128 | 424, 440, 456 |
| activation_type, pool_status, token flags, collect_fee_mode, pool_type, fee_version | u8 each | 480 to 486 |
| fee_a_per_liquidity, fee_b_per_liquidity (Q128, monotonic) | 2 x U256 | 488, 520 |
| **permanent_lock_liquidity** | u128 | **552** |
| metrics: total_lp_a_fee u128, total_lp_b_fee u128, total_protocol_a_fee u64, total_protocol_b_fee u64 | | 568, 584, 600, 608 |
| creator | Pubkey | 648 |
| token_a_amount, token_b_amount (bookkept reserves, valid only if `layout_version` @696 is 1) | u64 | 680, 688 |

`permanent_lock_liquidity` has exactly one writer (S: `accumulate_permanent_locked_liquidity` in `state/pool.rs`, a
checked add, called only from `handle_permanent_lock_position`), which first moves the same liquidity from unlocked to
permanent in the position. No instruction unlocks; `remove_liquidity` touches only unlocked liquidity; closing a position
needs total liquidity, permanent included, to be 0. V: on `Ft8FD9gg1TdawhWijNzdkpYTiVL8ETfY6gAwS24bwYio` the sum of
`permanent_locked_liquidity` (position @184) over all 42 positions equals the pool field exactly (5 locked positions,
59.7% of liquidity), and unlocked + vested + permanent equals `liquidity` exactly. On the SOL-USDC pool
`8Pm2kZpnxD3hoMmt4bjStX2Pw2Z9abpbHzZxMPqxPmie` 0.019% of liquidity is locked.

Value of L at the current price (V to 1.5e-5 on two pools; U for compounding pools): `amount_a = L * (Pmax - P) / (P * Pmax)`
and `amount_b = L * (P - Pmin) / 2^128`, with the Q64.64 prices as integers. That depends on the spot price, so a goal is
set in liquidity units, which only locking can move.

Hazards: the discriminator is name-derived, so DAMM `Position` and Orca `Position` share one (check the owner first);
padding fields get reused (`padding_0` and `padding_1` hold stale legacy data on old pools); anyone can create pools
(759 configs, many SOL-USDC pools) and picks the price range; the creator's own locked liquidity counts.

### 3.6 Metaplex Token Metadata (`MetadataImmutable`)

Program `metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s`. **Not upgradeable** (V: ProgramData authority None, deployed slot
380725176). Borsh, no Anchor discriminator. PDA `["metadata", program_id, mint]`. Sizes 679 or 607 bytes. **V** on 20 live
accounts and 52,952 truncation and corruption cases (no panic).

| Field | Type | Offset |
| --- | --- | --- |
| key (4 = `MetadataV1`) | u8 | 0 |
| update_authority, mint | Pubkey | 1, 33 |
| name, symbol, uri | u32 length + bytes (at most 32, 10, 200; padded with NULs, the length counts the padding) | 65 |
| seller_fee_basis_points | u16 | after uri (319 padded) |
| creators | `Option<Vec<{address 32, verified u8, share u8}>>`, at most 5 | after (321) |
| primary_sale_happened | bool | after creators |
| **is_mutable** | bool | **323** with no creators, 395 with 2, 429 with 3 |

`is_mutable` has three writers (S, `mpl-token-metadata`): creation, `UpdateMetadataAccountV2` and `Update` V1; both update
paths are guarded by `if !val || self.is_mutable` and otherwise fail with `IsMutableCanOnlyBeFlippedToFalse` (error 73).
Nothing flips it back. With `is_mutable = false` the on-chain `data` (name, symbol, uri, fee, creator list) is frozen,
but these can still change: the update authority (it can be handed over), `primary_sale_happened` (false to true), the
creators' `verified` flags, collection, uses and `token_standard`. The JSON behind the URI is off-chain.

Today (V): USDC, USDT, JUP, BONK, JTO, PYTH, RAY, mSOL and jitoSOL are **mutable**; WIF, WEN, Fartcoin (and pump `create`
coins) and SMB NFTs are immutable. Coins made by pump.fun's `create_v2` have no Metaplex account at all (V). A missing or
closed account means "unknown", never "immutable"; the reader fails closed.

### 3.7 Token-2022 (roadmap)

Program `TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`. **V** on every Token-2022 account the incinerator holds (3,470
accounts, 3,348 extended mints) and on PYUSD.

- A mint without extensions is byte-identical to a classic one (82 bytes; 121 seen live). An extended mint or account is
  at least 170 bytes: mint bytes 82..165 are zero padding, **byte 165 is the account type** (1 mint, 2 account), and a
  TLV list starts at 166: `u16 type`, `u16 length`, value, repeated until type 0. Order is initialization order, not
  fixed. Length 355 is never a mint or account (it is a multisig).
- Today's `len == 82` and `len == 165` checks therefore fail closed on extended Token-2022 mints: safe, unsupported.
- Extension values (offsets inside the value): TransferFeeConfig (108): config authority 0, withdraw authority 32,
  withheld u64 @64, older fee {epoch @72, max @80, bps @88}, newer fee {epoch @90, max @98, bps @106}; MetadataPointer
  (64): authority 0, address 32; TokenMetadata (variable): update authority 0, mint 32, Borsh strings; PermanentDelegate
  (32); MintCloseAuthority (32); Pausable (33): authority 0, paused @32. An authority that is all zeros is `None` and is
  final: every `SetAuthority` branch needs the current value to be `Some`.
- A fee change takes effect two epochs later (`newer.epoch = current + 2`); the fee at epoch X is `newer` if
  `X >= newer.epoch`, else `older`.
- Reject for supply, mint-authority and freeze-authority markets: `PermanentDelegate` set (it can burn or move from any
  account), `MintCloseAuthority` set (burn all, close, re-create at the same address), `ConfidentialMintBurn` (hidden
  supply), `PermissionedBurn` (in the deployed binary, not in interface 2.1.0), any unknown id. Default-deny.
- Incinerator accounts under Token-2022 have the same flaw as in 1.3 (V on PYUSD), and `PermanentDelegate` mints
  (PYUSD, USDG, CASH, the xStocks) can drain any account.
- No new dependency: `anchor_spl::token_2022::spl_token_2022` is the interface crate already in the build
  (`StateWithExtensions::<Mint>::unpack` plus `get_extension_types()`, which errors on unknown ids). CU on SBF: U.
- Ratchets worth a market (each is one account): MetadataFrozen (pointer authority None, update authority None; 2,280 of
  3,115 live qualify), FeeScheduleFrozen (config authority None and both fees at or below B; 186 of 529 fee mints have no
  config authority), FeesLockedForever (withdraw authority None and `withheld >= X`; 21 live), PermanentDelegateRevoked.

### 3.8 Vote account (roadmap: `VoteCreditsAtLeast`)

Program `Vote111111111111111111111111111111111111111`, bincode, 3,762 bytes. u32 tag @0: 2 = V3, 3 = V4 (SIMD-0185,
active since epoch 949). **V**: 683 of 684 staked vote accounts are V4, one is V3, and old tags still exist on dormant
accounts (accept 2 and 3, reject 0 and 1). `node_pubkey` @4, `authorized_withdrawer` @36; V3 `commission` u8 @68; V4
`inflation_rewards_commission_bps` u16 @132. Everything after is variable (V4's BLS key is optional: 680 of 683 set):

```
p = offset of votes_len        // V3: 69, V4: 145 (bls None) or 193 (bls Some)
n = u64(p) (<= 31);  p += 8 + 13n        // votes
t = u8(p)  (0|1);    p += 1 + 8t         // root_slot
m = u64(p) (<= 8);   p += 8 + 40m        // authorized_voters
if tag == 2: p += 1545                   // prior_voters (absent in V4)
k = u64(p) (<= 64);  entries at p + 8 + 24i = (epoch, credits, prev_credits)
```

Verified against `getVoteAccounts` for all 684 accounts (0 decode errors, equal epoch credits). Credits earned in epoch
E are `credits - prev_credits` of the entry for E; no entry means 0 or aged out (64 entries kept); the current epoch's
entry is live; credits only grow; the cap is 6,912,000 per epoch. Only the validator earns them, so no capital moves
them. The cost is the walk and keeping up with vote-state versions.

### 3.9 Meteora DAMM v2 cumulative fees (roadmap)

Same account as 3.5. `metrics.total_lp_*_fee` (u128 @568, @584) and `total_protocol_*_fee` (u64 @600, @608) are written
only in `apply_swap_result` by checked adds, with no reset (S, grep; V on live pools): the only true cumulative activity
counters found. The fee token follows `collect_fee_mode` (0 both tokens on the output side, 1 only token B, 2
compounding). Volume is about `fee / fee_rate`, but the rate varies (scheduler, rate limiter, dynamic fee, operator
updates; the creator picks the base fee up to 50% or 99%), and a creator who is also the only LP wash-trades for the
protocol share only (20% live). So it measures fees paid, not volume, and costs at least 20% of what it reports.
`metrics.total_position` is unreliable (245 against 42 live positions).

### 3.10 Orca Whirlpool (roadmap, limited)

Program `whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc` (multisig upgrade authority). `Whirlpool`: 653 bytes, disc
`3f95d10ce1806309`: whirlpools_config @8, tick_spacing @41, fee_rate @45, liquidity u128 @49 (active range only),
sqrt_price @65, tick_current @81, protocol_fee_owed @85/@93, mint_a @101, vault_a @133, fee_growth_global_a @165, mint_b
@181, vault_b @213, fee_growth_global_b @245. **V** on three pools. No volume counter exists; `fee_growth_global` is fee
per unit of liquidity (monotonic, wrapping), so equal volume gives small deltas on a deep pool and huge ones on a thin
one. Vault balances include protocol fees and unclaimed LP fees. `LockConfig` (241 bytes, disc `6a2fee9f7c0ca0c0`, PDA
`["lock_config", position]`): position @8, position_owner @40, whirlpool @72, locked_timestamp @104, lock_type @112
(0 = Permanent). Live: 1,641 of them. A locked position's liquidity can never be decreased and the lock never removed
(S: every decrease path rejects a frozen token account; no unlock exists). It is one account per position, only
Token-2022 position NFTs can be locked, and locks are cheap to fake (dust, out of range), so a pool-level goal would need
a sum over positions. 508 `WhirlpoolsConfig` accounts exist: pin the pool address.

### 3.11 Raydium (CPMM, CLMM, AMM v4)

All three are upgradeable by one key (`FytDrVzDybM1TwFQPGb8qaxZR7dBCzNeqT3vtQsceZQK`); CPMM was redeployed 2026-10-01.

| | Program | Size | Notes |
| --- | --- | --- | --- |
| CPMM `PoolState` | `CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C` | 637 | disc `f7ede3f5d7c3de46`, **identical to CLMM's**; status @329, lp_supply u64 @333, mints @168 and @200, vaults @72 and @104, lp_mint @136 |
| CLMM `PoolState` | `CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK` | 1544 | mints @73 and @105, vaults @137 and @169, liquidity u128 @237, sqrt_price @253; counters @325 to 389 and @1032 to 1064 are now padding |
| AMM v4 `AmmInfo` | `675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8` | 752 | no discriminator (first u64 is `status`); coin_vault @336, pc_vault @368, lp_mint @464, lp_amount u64 @720 |

**V.** For a raw-bytes reader: owner plus exact length are the only discriminators; pin the pool address (creation is
permissionless; AMM v4's coin and pc can even be inverted, 2 of 17 live). Reserves are `vault amount` minus owed fees and
move with any swap or LP action, and donations move CPMM and AMM v4 reserves. Admin key `GThUX1...` can set `status` and
halt a pool.

One useful monotone quantity (S plus V on one pool): CPMM's `lp_supply` (@333) is the share denominator and only
deposits and withdrawals change it, but SPL-burning LP lowers only the mint's supply, so `lp_supply - lp_mint.supply` is
the LP burned forever (baseline 100 from initialization; pool `7JuwJuNU...` shows 300). AMM v4's `lp_amount` (@720) works
the same way. The Burn and Earn lock program (`LockrWmn6K5twhz3y9w1dQERbmgSaRkfnTeTKbpofwE`, closed source,
upgradeable) keeps locked LP in an associated token account of PDA `3f7GcQFG397GAaEnv51zR6tsTVihYRydnydDD1cXekxH`. Both
need a second account (the LP mint) at resolve time.

### 3.12 pump.fun bonding curve and PumpSwap (on hold)

Program `6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P` (closed source, upgradeable). `BondingCurve` PDA
`["bonding-curve", mint]`, disc `17b7f83760d8ac60`: reserves 4 x u64 @8..40, token_total_supply @40, **complete @48**,
creator @49, then fields appended over time (sizes 49, 125, 141, 150 and 151 exist live; the stable prefix is 0..49).
`complete` is set by the buy that empties the curve (V on two transactions) and was never seen to reset (2024 curves
still read 1). PumpSwap `Pool` (program `pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA`): base_mint @43, quote_mint @75,
lp_mint @107, lp_supply @203; migrated pools burn their LP. A market would pin an existing mint with `complete == 0`,
read only byte 48, never require an exact length, and cap the bounty below the cost in section 1.5.

### 3.13 Not worth reading

- Native stake account (`Stake111...`, bincode, 200 bytes; voter @124, stake @156, activation @164, deactivation @172):
  `delegation.stake` is stale (749 of 2,536 sampled exceed their lamports), is not effective stake, and one balance can be
  split, merged or moved inside a transaction.
- StakeHistory (`SysvarStakeHistory...`, 16,392 bytes, newest first, 32 bytes per epoch: effective, activating,
  deactivating) and EpochRewards: cluster totals and a single overwritten record, no per-protocol signal. Readable with
  `sol_get_sysvar` (110 CU).
- Meteora DLMM `LbPair` (`LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo`, 904 bytes, disc `210b3162b565b10d`; mints @88 and
  @120, reserves @152 and @184, active_id @76, protocol fees @216): no cumulative counter, vault balances include
  protocol fees, many pairs per mint pair. The program source is not public.

## 4. Attack vectors and what each read checks

| Vector | Defence | Where |
| --- | --- | --- |
| Spoofed account with the right layout | owner program, exact length, discriminator, and the address locked into the market at creation | every reader |
| Same discriminator in two programs (CPMM and CLMM `PoolState`, Orca and DAMM `Position`) | owner check first | `read_*` wrappers |
| Look-alike pool, pair or config for the same mints | the sponsor pins the account; the program binds it to `target` (pool mint, a pool mint, metadata mint); the app shows it | `validate_new_market` |
| Metric account swapped at resolve | `#[account(address = market.metric_account)]` on `Resolve` and `BuyYes` | `resolve.rs`, `buy_yes.rs` |
| Flash capital | one-way fields, or snapshots that need capital across an epoch boundary | section 2 |
| Same-transaction composition | `resolve` is top-level only (existing); it does not stop a bot that moves the metric in the same transaction, which is why flash-movable metrics are out | `resolve.rs` |
| Short or malformed data | a bounds-checked `Cursor`; every length, tag and count is validated; no slice panics | `resolver.rs` |
| Layout drift after an upstream upgrade | fixed length and offsets, fail closed; Token Metadata is not upgradeable; the others are re-verified with the fixture script | `scripts/capture-fixtures.ts` |
| Reader can never succeed, vault stuck | ratchet kinds resolve NO after the deadline without reading; the stake pool kind resolves NO once its epoch has passed and the pool is unreadable | `resolve.rs`, `resolve_stake_pool` |
| SPL Token special cases (incinerator and system-owned accounts) | lock into a PDA owned account, never the incinerator | section 1.3 |
| Freeze authority on the locked mint | documented; not blocked | README known limits |
| Operator or admin kill switch (DAMM, Raydium, Orca, DLMM `status`) | accepted: a halted pool simply never meets the goal | |
| Token-2022 extension traps | default-deny walker for a later release; classic Token only today | section 3.7 |
| Zero-copy alignment | copy bytes, never cast | `parse_damm_pool` |

## 5. The three built resolvers

Resolution accounts are generic in this program, so there is no per-resolver `Accounts` struct to write. `Resolve` and
`BuyYes` take the market and one metric account, address-locked to what the sponsor pinned; `CreateMarket` takes the
`target` and `metric_account` as unchecked accounts; everything resolver-specific is a typed reader plus one arm in each of
`validate_new_market`, `ratchet_met` (or `resolve_stake_pool`) and `resolve`, all in
`programs/pred-provable/src/resolver.rs`. CU measurements are in section 5.4.

```rust
#[derive(Accounts)]
pub struct Resolve<'info> {
    #[account(mut, seeds = [MARKET_SEED, market.sponsor.as_ref(), &market.market_id.to_le_bytes()], bump = market.bump)]
    pub market: Account<'info, Market>,
    /// CHECK: address-locked to the market; read by the typed resolver.
    #[account(address = market.metric_account @ ErrorCode::InvalidMetricAccount)]
    pub metric_account: UncheckedAccount<'info>,
}
```

### 5.1 `StakePoolTvlAtLeast { epoch }`: TVL at an epoch start

- **Target and metric.** `target` is the LST mint, `metric_account` the stake pool; the program requires
  `pool.pool_mint == target`. `metric_threshold` is in lamports.
- **Sponsor value.** A liquid staking project, validator or DAO that wants "X SOL in the pool at epoch N" and cannot get a
  number a flash loan did not make. Doers have to deposit before the boundary and leave the capital in the pool across it
  (JitoSOL: 0 to enter, 0.1% to leave), the "mercenary capital" case with real exposure.
- **Create.** Owner is the stake pool program; the account parses; `epoch > clock.epoch`; threshold above 0; the pool's
  `last_update_epoch + 1 >= clock.epoch` (a pool whose updates stopped can never write the snapshot); and neither the
  current total nor the last snapshot already meets the goal.
- **Trading.** `require_trading_open` reverts once `clock.epoch >= epoch`, without reading the pool (the same rule as
  `StakeAtLeast`).
- **Resolve.**

```rust
pub fn resolve_stake_pool(market: &Market, epoch: u64, metric_account: &AccountInfo, clock: &Clock) -> Result<Outcome> {
    require!(clock.epoch >= epoch, ErrorCode::NotResolvableYet);
    let pool = match read_stake_pool(metric_account) {
        Ok(pool) => pool,
        // A pool that can no longer be read cannot prove YES; do not leave the vault stuck.
        Err(_) if clock.epoch > epoch => return Ok(Outcome::No),
        Err(error) => return Err(error),
    };
    if pool.last_update_epoch == epoch {
        if pool.last_epoch_total_lamports >= market.metric_threshold { Ok(Outcome::Yes) } else { Ok(Outcome::No) }
    } else if pool.last_update_epoch > epoch || clock.epoch > epoch {
        Ok(Outcome::No)   // the epoch's snapshot was never written, or the next epoch overwrote it
    } else {
        err!(ErrorCode::NotResolvableYet)   // the epoch started but the pool has not updated yet
    }
}
```

- **Window.** From the pool's first balance update of `epoch` until its first update of `epoch + 1` (about two days).
- **Limits.** Depends on the pool's own crank (the first update needs every validator record refreshed first); resolves
  NO if nobody runs it. The program is upgradeable. Sponsors should set `cutoff_slot` early.

### 5.2 `DammV2LockedAtLeast { shift }`: liquidity locked forever

- **Target and metric.** `target` is one of the pool's two mints, `metric_account` the DAMM v2 pool. The goal is
  `metric_threshold << shift` liquidity units (`shift <= 64`), because liquidity is a u128 (2.5e28 to 3.6e28 on the pools
  sampled) and the market's threshold is a u64.
- **Sponsor value.** A token team or community that wants "at least L of the pool's liquidity locked for good", the same
  trust signal as burned LP, for pools whose liquidity is a position rather than an LP token.
- **Create.** Owner DAMM v2, length exactly 1112, discriminator `f19a6d0411b16dbc`, `target` is token A or B, threshold
  above 0, and the current lock is below the goal.

```rust
const DAMM_POOL_LEN: usize = 1112;
const DAMM_POOL_DISCRIMINATOR: [u8; 8] = [0xf1, 0x9a, 0x6d, 0x04, 0x11, 0xb1, 0x6d, 0xbc];

fn parse_damm_pool(data: &[u8]) -> Result<DammPoolView> {
    require!(data.len() == DAMM_POOL_LEN && data[..8] == DAMM_POOL_DISCRIMINATOR, ErrorCode::InvalidMetricAccount);
    Ok(DammPoolView {
        token_a_mint: Pubkey::new_from_array(data[168..200].try_into().unwrap()),
        token_b_mint: Pubkey::new_from_array(data[200..232].try_into().unwrap()),
        permanent_lock_liquidity: u128::from_le_bytes(data[552..568].try_into().unwrap()),
    })
}

fn damm_goal(threshold: u64, shift: u8) -> u128 {
    u128::from(threshold).checked_shl(u32::from(shift)).unwrap_or(u128::MAX)
}
```

- **Resolve.** A ratchet kind: YES once `permanent_lock_liquidity >= damm_goal(...)` by `deadline_slot`, NO after it;
  `buy_yes` and the pool stop the moment it is met.
- **Cost to move.** The doer adds real liquidity and locks it with `permanent_lock_position`; the principal cannot be
  withdrawn, so a flash loan cannot repay (the doer keeps earning the position's fees).
- **Limits.** Units, not dollars; the pool creator chose the range; the creator's own lock counts; the program is
  upgradeable and its padding has been reused before.

### 5.3 `MetadataImmutable`: metadata frozen

- **Target and metric.** `target` is the mint, `metric_account` its Token Metadata account, which must equal the PDA
  `["metadata", program, mint]`.
- **Sponsor value.** Mint authority, freeze authority and supply already have their own kinds; this adds the metadata
  flag (is the name and URI still editable). It is also the only new read on a program that cannot change under it.
- **Create.** Address equals the PDA, owner is Token Metadata, the walk succeeds with `mint == target`, and the metadata is
  still mutable (`AlreadyImmutable` otherwise).

```rust
fn parse_metadata_is_mutable(data: &[u8], mint: &Pubkey) -> Result<bool> {
    const KEY_METADATA_V1: u8 = 4;
    let mut c = Cursor::new(data);
    require!(c.u8()? == KEY_METADATA_V1, ErrorCode::InvalidMetricAccount);
    c.skip(32)?; // update_authority
    let found = c.key()?;
    require_keys_eq!(found, *mint, ErrorCode::InvalidMetricAccount);
    for max_len in [32u32, 10, 200] {          // name, symbol, uri
        let len = c.u32()?;
        require!(len <= max_len, ErrorCode::InvalidMetricAccount);
        c.skip(len as usize)?;
    }
    c.skip(2)?; // seller_fee_basis_points
    if c.flag()? {                              // creators
        let creators = c.u32()? as usize;
        require!(creators <= 5, ErrorCode::InvalidMetricAccount);
        c.skip(creators * 34)?;
    }
    c.flag()?; // primary_sale_happened
    c.flag()   // is_mutable
}
```

- **Resolve.** A ratchet kind: YES once `is_mutable` is false.
- **Limits.** Only the on-chain name, symbol, URI, fee and creator list freeze; the update authority and the off-chain
  JSON do not. The big tokens are mutable today, so a sponsor needs the team to act, as with the renounce markets.

### 5.4 Tests and compute

`tests/fixtures/*.bin` are real mainnet accounts (`scripts/capture-fixtures.ts`). The Rust unit tests in `resolver.rs`
decode them (field values, the options walk on a modified pool, creators, truncation at every length, bad tags). The
TypeScript suite runs each kind end to end in LiteSVM on the same bytes: create, trading halt, YES, NO, spoof and layout
rejections, the stake pool's flash-proof property, and the lock account's regression tests against the real Token program.
A mutation pass over `resolver.rs` (17 deliberate bugs, built outside the repo: reading the live total, dropping the
`max()`, no stale check, a u64-truncated DAMM goal, a creator-stride off-by-one, each lock check removed) is caught by
the suite.

Compute units, measured in LiteSVM with a fixed sponsor key and market id (`bun test` prints the table). `create_market`
also initializes the market, both mints and the vault; it moves by about 1.5k per extra PDA bump attempt depending on the
keys.

| Kind | `create_market` | `resolve` |
| --- | --- | --- |
| `SupplyAtMost` (baseline) | 39,543 | 5,573 |
| `LockedAtLeast` | 47,427 | 5,605 |
| `StakePoolTvlAtLeast` (JitoSOL, bSOL) | 40,782 | 6,552 (YES and NO) |
| `DammV2LockedAtLeast` | 39,906 | 5,685 |
| `MetadataImmutable` (no creators, 2 and 3 creators) | 41,784, 41,876 | 6,057, 6,149 |

Every new read costs under 1k CU more than the baseline at `resolve` (+979 for the stake pool walk, +484 to +576 for
metadata). `LockedAtLeast` pays for two PDA derivations (the lock owner and its token account) at creation only.

## 6. Roadmap, in order

1. `FeesGeneratedAtLeast` on DAMM v2 (section 3.9): same account and reader as 5.2.
2. Token-2022 mints for the three mint resolvers, behind the default-deny walker (3.7).
3. `VoteCreditsAtLeast` (3.8): the one metric nobody can buy; needs the V3 and V4 walk.
4. `LpBurnedAtLeast` for Raydium CPMM and AMM v4 (3.11): needs the LP mint as a second account.
5. pump.fun graduation, only with a "curve must be mostly empty at creation" guard and a capped bounty (1.5).

## 7. Re-verification

The third-party programs above are upgradeable (Token Metadata is not). After any upgrade of the stake pool, DAMM v2,
Raydium, Orca or pump programs:

```bash
bun run scripts/capture-fixtures.ts        # MAINNET_RPC_URL overrides the RPC
git diff tests/fixtures                    # review what changed
cargo test -p pred-provable --features no-entrypoint --lib && bun run test
```

A changed length or moved offset in a fixture is the signal to re-read the upstream struct before trusting the readers.
