# Sprint 03 — Parity of the ported readers with `pred-provable`

**Record of a check that cannot be run again.** The four readers ported in Sprint 03 (`SupplyAtMost`,
`DammV2LockedAtLeast`, `StakePoolTvlAtLeast`, `StakeAtLeast`) were run next to their originals in the frozen Anchor
program, on the same account bytes, before that program left the workspace. The two suites (`tests/parity/facts.test.ts`,
`tests/parity/epoch.test.ts`) and their support files existed from commit `173f616` to commit `c1dafa9` of the branch
`sprint-03-readers-resolution`; they were removed with `pred-provable`, `tests/helpers.ts` and the Anchor toolchain in the
commit that follows `c1dafa9`. This file keeps what they printed.

**Run:** 2026-10-09, on the integrated program (binary of 93,216 bytes, SHA-256
`9e5128bef04c288c0aa22ed81499fe829cc68abe73b49ef72a602dd0280033d7`), `bun test tests/parity/`: 62 tests, 62 pass, 0
fail, 93 assertions, 4.53 s. Every row where the two programs differ carries the reason the suite asserted; a difference
without a reason would have failed the test.

**How a case ran.** One account's bytes were put before both programs. In `pred-provable`: `create_market` with the
account as the metric, then `resolve`, with the deadline in slots. In `brot-markets`: `user_open_campaign` by a team key
(so no SOL/USD read), then `resolve_campaign`, with the deadline in Unix time. Each answer was reduced to a verdict both
programs share: accepted, refused (account, target, authority, epoch, kind), not yet, YES, NO, void. For the epoch
kinds the campaign was written straight into the test cluster (`tests/brot/campaigns.ts`), so the resolution rows do
not depend on the opening's rules.

## The differences, and why each is wanted

| Difference | Reason | Where it is decided |
|---|---|---|
| After the deadline with the fact met, the port says NO and records `met_late`; the original said NO | The event tells a baker the goal was reached, only too late | TP §3.4.6 |
| After the deadline with an unreadable account, the port voids (`UnreadableAccount`); the original said NO | A reading that could not be made is not a NO | TP §3.4.6 |
| A target less than 1% from the current value is refused at opening; the original accepted it | Row 3's minimum distance (C45), 1% for every kind [AC] | `session-log/2026-10-09-sprint-03-abertura-contrato-e-valores.md` |
| An SPL mint whose option tag is not 0 or 1 is refused as a malformed account; the original read tag 2 as "authority set" or accepted it | SPL Token writes only 0 and 1; anything else is not a mint | `readers/spl_mint.rs` |
| A stake-pool snapshot overwritten by the next epoch, or never written, voids (`MissedWindow`); the original said NO | The epoch passed without a reading; nobody lost the goal | TP §3.4.6 |
| `StakeAtLeast` read after its epoch voids (`MissedWindow`); the original said NO | Same rule | TP §3.4.6 |
| A zeroed vote account is refused as an account, not read as zero stake | Owner and layout before any byte | `readers/vote_stake.rs` |
| `StakeAtLeast` does not open (`kind not open`) | Closed by the `stake-at-least` build feature until a devnet YES (Sprint 05) | `constants.rs`, the session log above |

## Irreversible facts (`tests/parity/facts.test.ts`, 73 rows)

| reader | fixture | original result | ported result |
|---|---|---|---|
| SupplyAtMost | mint-wif, target half the supply: opening | accepted | accepted |
| SupplyAtMost | mint-wif, target half the supply: before the deadline, as opened | not yet | not yet |
| SupplyAtMost | mint-wif, target half the supply: before the deadline, cut by one byte | refused: account | refused: account |
| SupplyAtMost | mint-wif, target half the supply: before the deadline, fact met | YES | YES |
| SupplyAtMost | mint-wif, target half the supply: after the deadline, as opened | NO | NO |
| SupplyAtMost | mint-wif, target half the supply: after the deadline, fact met | NO | NO, met late (expected: TP 3.4.6, the port reads after the deadline) |
| SupplyAtMost | mint-wif, target half the supply: after the deadline, cut by one byte | NO | void: unreadable account (expected: TP 3.4.6, the port reads after the deadline) |
| SupplyAtMost | mint-wif, target exactly 1% below the supply: opening | accepted | accepted |
| SupplyAtMost | mint-wif, target exactly 1% below the supply: before the deadline, as opened | not yet | not yet |
| SupplyAtMost | mint-wif, target exactly 1% below the supply: before the deadline, cut by one byte | refused: account | refused: account |
| SupplyAtMost | mint-wif, target exactly 1% below the supply: before the deadline, fact met | YES | YES |
| SupplyAtMost | mint-wif, target exactly 1% below the supply: after the deadline, as opened | NO | NO |
| SupplyAtMost | mint-wif, target exactly 1% below the supply: after the deadline, fact met | NO | NO, met late (expected: TP 3.4.6, the port reads after the deadline) |
| SupplyAtMost | mint-wif, target exactly 1% below the supply: after the deadline, cut by one byte | NO | void: unreadable account (expected: TP 3.4.6, the port reads after the deadline) |
| SupplyAtMost | mint-wif, target one unit short of 1% below: opening | accepted | refused: too close (expected: C45, row 3's 1% distance) |
| SupplyAtMost | mint-wif, target one unit below the supply: opening | accepted | refused: too close (expected: C45, row 3's 1% distance) |
| SupplyAtMost | mint-wif, target at the supply: opening | refused: already met | refused: already met |
| SupplyAtMost | mint-bonk, target half the supply: opening | accepted | accepted |
| SupplyAtMost | mint-bonk, target half the supply: before the deadline, as opened | not yet | not yet |
| SupplyAtMost | mint-bonk, target half the supply: before the deadline, cut by one byte | refused: account | refused: account |
| SupplyAtMost | mint-bonk, target half the supply: before the deadline, fact met | YES | YES |
| SupplyAtMost | mint-bonk, target half the supply: after the deadline, as opened | NO | NO |
| SupplyAtMost | mint-bonk, target half the supply: after the deadline, fact met | NO | NO, met late (expected: TP 3.4.6, the port reads after the deadline) |
| SupplyAtMost | mint-bonk, target half the supply: after the deadline, cut by one byte | NO | void: unreadable account (expected: TP 3.4.6, the port reads after the deadline) |
| SupplyAtMost | mint-bonk, target one unit below the supply: opening | accepted | refused: too close (expected: C45, row 3's 1% distance) |
| SupplyAtMost | mint-usdc, as captured, mint authority live: opening | refused: authority | refused: authority |
| SupplyAtMost | mint-pyusd, as captured, a Token-2022 mint: opening | refused: account | refused: account |
| SupplyAtMost | mint-wif, mint authority set: opening | refused: authority | refused: authority |
| SupplyAtMost | mint-wif, owned by Token-2022: opening | refused: account | refused: account |
| SupplyAtMost | mint-wif, cut by one byte: opening | refused: account | refused: account |
| SupplyAtMost | mint-wif, stretched by one byte: opening | refused: account | refused: account |
| SupplyAtMost | mint-wif, all zero: opening | refused: account | refused: account |
| SupplyAtMost | mint-wif, not initialized: opening | refused: account | refused: account |
| SupplyAtMost | mint-wif, mint authority tag 2: opening | refused: authority | refused: account (expected: SPL Token tags) |
| SupplyAtMost | mint-wif, freeze authority tag 2: opening | accepted | refused: account (expected: SPL Token tags) |
| DammV2LockedAtLeast | damm-ft8fd9, target twice the lock: opening | accepted | accepted |
| DammV2LockedAtLeast | damm-ft8fd9, target twice the lock: before the deadline, as opened | not yet | not yet |
| DammV2LockedAtLeast | damm-ft8fd9, target twice the lock: before the deadline, cut by one byte | refused: account | refused: account |
| DammV2LockedAtLeast | damm-ft8fd9, target twice the lock: before the deadline, fact met | YES | YES |
| DammV2LockedAtLeast | damm-ft8fd9, target twice the lock: after the deadline, as opened | NO | NO |
| DammV2LockedAtLeast | damm-ft8fd9, target twice the lock: after the deadline, fact met | NO | NO, met late (expected: TP 3.4.6, the port reads after the deadline) |
| DammV2LockedAtLeast | damm-ft8fd9, target twice the lock: after the deadline, cut by one byte | NO | void: unreadable account (expected: TP 3.4.6, the port reads after the deadline) |
| DammV2LockedAtLeast | damm-sol-usdc, target twice the lock: opening | accepted | accepted |
| DammV2LockedAtLeast | damm-sol-usdc, target twice the lock: before the deadline, as opened | not yet | not yet |
| DammV2LockedAtLeast | damm-sol-usdc, target twice the lock: before the deadline, cut by one byte | refused: account | refused: account |
| DammV2LockedAtLeast | damm-sol-usdc, target twice the lock: before the deadline, fact met | YES | YES |
| DammV2LockedAtLeast | damm-sol-usdc, target twice the lock: after the deadline, as opened | NO | NO |
| DammV2LockedAtLeast | damm-sol-usdc, target twice the lock: after the deadline, fact met | NO | NO, met late (expected: TP 3.4.6, the port reads after the deadline) |
| DammV2LockedAtLeast | damm-sol-usdc, target twice the lock: after the deadline, cut by one byte | NO | void: unreadable account (expected: TP 3.4.6, the port reads after the deadline) |
| DammV2LockedAtLeast | damm-sol-usdc, target twice the lock, met by a u128::MAX lock: opening | accepted | accepted |
| DammV2LockedAtLeast | damm-sol-usdc, target twice the lock, met by a u128::MAX lock: before the deadline, as opened | not yet | not yet |
| DammV2LockedAtLeast | damm-sol-usdc, target twice the lock, met by a u128::MAX lock: before the deadline, cut by one byte | refused: account | refused: account |
| DammV2LockedAtLeast | damm-sol-usdc, target twice the lock, met by a u128::MAX lock: before the deadline, fact met | YES | YES |
| DammV2LockedAtLeast | damm-sol-usdc, target twice the lock, met by a u128::MAX lock: after the deadline, as opened | NO | NO |
| DammV2LockedAtLeast | damm-sol-usdc, target twice the lock, met by a u128::MAX lock: after the deadline, fact met | NO | NO, met late (expected: TP 3.4.6, the port reads after the deadline) |
| DammV2LockedAtLeast | damm-sol-usdc, target twice the lock, met by a u128::MAX lock: after the deadline, cut by one byte | NO | void: unreadable account (expected: TP 3.4.6, the port reads after the deadline) |
| DammV2LockedAtLeast | damm-ft8fd9, target just above the lock: opening | accepted | refused: too close (expected: C45, row 3's 1% distance) |
| DammV2LockedAtLeast | damm-ft8fd9, target under the lock: opening | refused: already met | refused: already met |
| DammV2LockedAtLeast | damm-ft8fd9, target zero: opening | refused: already met | refused: already met |
| DammV2LockedAtLeast | damm-ft8fd9, lock 1,000,000, target exactly 1% above: opening | accepted | accepted |
| DammV2LockedAtLeast | damm-ft8fd9, lock 1,000,000, target exactly 1% above: before the deadline, as opened | not yet | not yet |
| DammV2LockedAtLeast | damm-ft8fd9, lock 1,000,000, target exactly 1% above: before the deadline, cut by one byte | refused: account | refused: account |
| DammV2LockedAtLeast | damm-ft8fd9, lock 1,000,000, target exactly 1% above: before the deadline, fact met | YES | YES |
| DammV2LockedAtLeast | damm-ft8fd9, lock 1,000,000, target exactly 1% above: after the deadline, as opened | NO | NO |
| DammV2LockedAtLeast | damm-ft8fd9, lock 1,000,000, target exactly 1% above: after the deadline, fact met | NO | NO, met late (expected: TP 3.4.6, the port reads after the deadline) |
| DammV2LockedAtLeast | damm-ft8fd9, lock 1,000,000, target exactly 1% above: after the deadline, cut by one byte | NO | void: unreadable account (expected: TP 3.4.6, the port reads after the deadline) |
| DammV2LockedAtLeast | damm-ft8fd9, lock 1,000,000, target one unit short of 1% above: opening | accepted | refused: too close (expected: C45, row 3's 1% distance) |
| DammV2LockedAtLeast | damm-ft8fd9, lock u128::MAX: opening | refused: already met | refused: already met |
| DammV2LockedAtLeast | damm-ft8fd9, owned by SPL Token: opening | refused: account | refused: account |
| DammV2LockedAtLeast | damm-ft8fd9, cut by one byte: opening | refused: account | refused: account |
| DammV2LockedAtLeast | damm-ft8fd9, stretched by one byte: opening | refused: account | refused: account |
| DammV2LockedAtLeast | damm-ft8fd9, another discriminator: opening | refused: account | refused: account |
| DammV2LockedAtLeast | damm-ft8fd9, all zero: opening | refused: account | refused: account |

## Epoch kinds (`tests/parity/epoch.test.ts`, 31 rows)

| reader | fixture | case | original result | ported result |
|---|---|---|---|---|
| StakePoolTvlAtLeast | stakepool-jitosol | opening 2% above the higher total | accepted | accepted |
| StakePoolTvlAtLeast | stakepool-jitosol | opening at the higher total | refused: target | refused: target |
| StakePoolTvlAtLeast | stakepool-jitosol | opening between the two totals | refused: target | refused: target |
| StakePoolTvlAtLeast | stakepool-jitosol | in E, the snapshot at the goal | YES | YES |
| StakePoolTvlAtLeast | stakepool-jitosol | in E, the snapshot one lamport short | NO | NO |
| StakePoolTvlAtLeast | stakepool-jitosol | opening at zero | refused: target | refused: target |
| StakePoolTvlAtLeast | stakepool-jitosol | opening for the epoch the clock is in | refused: epoch | refused: epoch |
| StakePoolTvlAtLeast | stakepool-jitosol | opening for a past epoch | refused: epoch | refused: epoch |
| StakePoolTvlAtLeast | stakepool-jitosol | opening on another owner's bytes | refused: account | refused: account |
| StakePoolTvlAtLeast | stakepool-jitosol | opening on a validator list | refused: account | refused: account |
| StakePoolTvlAtLeast | stakepool-jitosol | opening on a pool two epochs behind | refused: account | refused: account |
| StakePoolTvlAtLeast | stakepool-jitosol | opening on a pool one epoch behind | accepted | accepted |
| StakePoolTvlAtLeast | stakepool-jitosol | before E | not yet | not yet |
| StakePoolTvlAtLeast | stakepool-jitosol | in E, before the pool's first update | not yet | not yet |
| StakePoolTvlAtLeast | stakepool-jitosol | after E, the snapshot of E still there | YES | YES |
| StakePoolTvlAtLeast | stakepool-jitosol | in E, a short snapshot and a flash deposit | NO | NO |
| StakePoolTvlAtLeast | stakepool-jitosol | in E, another owner's bytes | refused: account | refused: account |
| StakePoolTvlAtLeast | stakepool-jitosol | after E, overwritten by E + 1 | NO | VOID(MissedWindow) |
| StakePoolTvlAtLeast | stakepool-jitosol | after E, never updated | NO | VOID(MissedWindow) |
| StakePoolTvlAtLeast | stakepool-jitosol | after E, another owner's bytes | NO | VOID(UnreadableAccount) |
| StakePoolTvlAtLeast | stakepool-jitosol | opening one lamport above the higher total | accepted | refused: target |
| StakePoolTvlAtLeast | stakepool-bsol | opening 2% above the higher total | accepted | accepted |
| StakePoolTvlAtLeast | stakepool-bsol | opening at the higher total | refused: target | refused: target |
| StakePoolTvlAtLeast | stakepool-bsol | opening between the two totals | refused: target | refused: target |
| StakePoolTvlAtLeast | stakepool-bsol | in E, the snapshot at the goal | YES | YES |
| StakePoolTvlAtLeast | stakepool-bsol | in E, the snapshot one lamport short | NO | NO |
| StakeAtLeast | vote-mainnet-top | before E | not yet | not yet |
| StakeAtLeast | vote-mainnet-top | in E, zero stake | NO | NO |
| StakeAtLeast | vote-mainnet-top | after E | NO | VOID(MissedWindow) |
| StakeAtLeast | vote-mainnet-top | in E, a zeroed vote account | NO | refused: account |
| StakeAtLeast | vote-mainnet-top | opening on the vote account | accepted | refused: kind not open |

The `StakeAtLeast` YES itself (stake injected into the test cluster) is not in this table: the npm LiteSVM both suites
ran on answers 0 to `sol_get_epoch_stake`. It is tested in Mollusk, which injects epoch stake
(`programs/brot-markets/tests/stake_at_least_mollusk.rs`).
