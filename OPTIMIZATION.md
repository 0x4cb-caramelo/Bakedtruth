# Binary and rent footprint audit

Status: **analysis and proposal, nothing applied.** No program, `Cargo.toml`, IDL or client file was changed. Every number
below was measured on a scratch copy of `programs/`, `Cargo.toml` and `Cargo.lock` (same toolchain as CI: Anchor 1.1.2,
Solana CLI 3.1.10, platform-tools v1.52, rustc 1.89), after the unmodified copy rebuilt **byte-for-byte identical** to
`target/deploy/pred_provable.so` (579,504 bytes). Written 2026-10-03, rent figures read from mainnet the same day.

## Summary

| | |
| --- | --- |
| Where the SOL is | **Program deploy, not account state.** The `.so` locks 2.94 SOL of ProgramData rent. One `Market` locks 0.0021 SOL. |
| The one change worth making | `opt-level = "s"` in `[profile.release]`: **579,504 → 478,016 bytes (-17.5%), -0.516 SOL** of deploy rent. Zero behavior difference over 961 replayed transactions. Costs +13% to +28% compute units per instruction (worst call 126k of the 200k default). |
| Already done | `lto = "fat"`, `codegen-units = 1`, `overflow-checks = true`. `panic = "abort"` is the SBF target default and `strip` is done by `cargo build-sbf`; setting either changes nothing. |
| Accounts | `Market` is 285 bytes, Borsh, no padding, no field order to improve. Every shrink that exists saves at most 0.0005 SOL per market and costs CU or an IDL break. **Recommend no account change.** |
| Not possible | Trimming `anchor-spl` features (the `mint::` init macro needs all of Token-2022's extension items), SBPFv3 (feature inactive on mainnet, no v3 target in platform-tools v1.52). |
| Real per-market lever | Not smaller accounts: **reclaiming** them. `Market` + vault are 63% of a market's creation rent and nothing closes them today (section 2.5). |

### Where the brief's premises differ from this repo

| Brief | Measured |
| --- | --- |
| Rent is 0.00000348 SOL/byte + 0.00089088 SOL base; "0.696 SOL per 100 KB" | Those two numbers disagree with each other (3,480 vs 6,960 lamports/byte) and neither is the chain's. Mainnet and devnet both return **5,080 lamports per byte, all-in** (`(128 + len) * 5080`; base 650,240 lamports = 0.00065024 SOL). Rent sysvar at slot 452,980,113: `lamports_per_byte_year = 5080`, `exemption_threshold = 1.0`. 100 KB costs 0.508 SOL. LiteSVM in the tests still uses the old 6,960, so rent amounts in tests are 37% higher than mainnet. |
| Unstripped debug symbols | `cargo build-sbf` already strips: the intermediate cdylib is 682,632 bytes with `.symtab`/`.strtab`, the shipped `.so` is 579,504 with neither. |
| LTO, codegen-units, panic settings to add | `lto = "fat"` and `codegen-units = 1` are set. Turning LTO off (and cgu to 16) *grows* the binary by only 4,624 bytes (+0.8%): this code is mostly Anchor-generated and already inlined. |
| Zero-copy readers, alignment hazards | None. `resolver.rs` copies bytes (`from_le_bytes(slice.try_into())`, bounds-checked `Cursor`); `Market` is Borsh (`#[account]`, not `zero_copy`). `grep` finds no `unsafe`, `bytemuck`, `transmute`, `repr(`, `AccountLoader` in the program. |
| Duplicate error strings | 24 messages = 945 bytes of text, 342 bytes of names. About 1.3 KB (0.0066 SOL) in total. Not worth touching. |
| Many state accounts (Market, Vault, PDA records) | One program-owned type, `Market`. The vault, mints and ATAs are SPL Token accounts with fixed 165/82-byte layouts the program cannot compact. |

## 1. SBF binary and deploy rent

### 1.1 Where the bytes are

ELF sections of the current `.so` (579,504 bytes):

| Section | Bytes | Share |
| --- | --- | --- |
| `.text` | 523,040 | 90.3% |
| `.rel.dyn` (1,948 relocations) | 31,168 | 5.4% |
| `.rodata` | 17,084 | 2.9% |
| `.data.rel.ro` | 6,344 | 1.1% |
| headers, dynsym/dynstr | 1,868 | 0.3% |

`.text` by function origin, from the unstripped build (432 functions; shares of symbol bytes):

| Origin | Share | Note |
| --- | --- | --- |
| Anchor `try_accounts` + its closures | **41.1%** (224,016 B) | Account validation and `init` / `init_if_needed` codegen |
| Anchor/SPL support (`anchor_lang`, `anchor_spl`) | 10.0% | |
| `core`/`alloc`/`std`/`hashbrown` | 8.9% | |
| `resolver.rs` (9 readers + `validate_new_market`) | 7.4% (40,136 B) | |
| Instruction handlers | 7.4% (40,072 B) | |
| `Accounts::exit` | 5.5% | |
| SPL interface crates | 4.3% (23,152 B) | upper bound for any dependency trim |
| everything else | 15.5% | `compiler_builtins`, Anchor error tables, `solana_instruction`, ... |

`try_accounts` per instruction, bytes: `add_liquidity` 44,048, `create_market` 43,624, `remove_liquidity` 29,472, `swap` 27,504,
`mint_pair` 26,552, `buy_yes` 18,064, `burn_pair` 12,640, `redeem` 9,864, `withdraw_budget` 8,240, `resolve` 4,008. The
largest single items are 6.4 to 6.7 KB closures inside `try_accounts`; removing the 10 `init_if_needed` ATAs saved 72,752
bytes (about 7.3 KB each), so each such constraint is what they are.

The nine resolvers are only 7% of the binary. Adding resolvers costs little; Anchor account constraints are what weigh.

### 1.2 What each knob does (measured)

All rows: same source, default (devnet) features, `cargo build-sbf`. Rent is ProgramData only,
`(45 + len + 128) * 5080` lamports. Savings are against the 579,504-byte baseline.

| Variant | Bytes | Δ bytes | Δ % | ProgramData rent | Δ SOL | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| Baseline (`opt-level` 3, current) | 579,504 | | | 2.94476 | | |
| **`opt-level = "s"`** | 478,016 | -101,488 | -17.5% | 2.42920 | **-0.51556** | **Recommended** |
| `opt-level = "z"` | 451,736 | -127,768 | -22.0% | 2.29570 | -0.64906 | Only if size beats CU (1.3) |
| `no-log-ix-name` feature | 578,448 | -1,056 | -0.2% | 2.93939 | -0.00536 | Optional |
| `s` + `no-log-ix-name` | 477,096 | -102,408 | -17.7% | 2.42453 | -0.52023 | Optional extra over `s` |
| `z` + `no-log-ix-name` | 450,712 | -128,792 | -22.2% | 2.29050 | -0.65426 | |
| `overflow-checks = false` | 577,544 | -1,960 | -0.3% | 2.93480 | -0.00996 | **Rejected**: see 3.4 |
| `lto = "off"`, `codegen-units = 16` | 584,128 | +4,624 | +0.8% | 2.96825 | +0.02349 | Keep fat LTO |
| No-op `custom_panic` (`custom-panic` feature) | 579,248 | -256 | -0.04% | 2.94346 | -0.00130 | Rejected: loses panic location for nothing |
| `panic = "abort"` | n/a | 0 | | | | Target default (`"panic-strategy": "abort"` in the SBF target spec) |
| `strip` / `debug = false` | n/a | 0 | | | | `cargo build-sbf` strips; no debug info by default |
| `anchor-spl` without `token_2022` or `token_2022_extensions` | does not compile | | | | | `mint::` init references `GroupPointerInitialize`, `MetadataPointerInitialize`, ... in `token_interface`. The `CLAUDE.md` gotcha is correct and complete. |
| `--arch v3` | does not build | | | | | `sbpfv3-solana-solana` std is not in platform-tools v1.52, and SIMD-0178/0179/0189 (`BUwGLeF3...`) is **inactive** on mainnet (`solana feature status -u m`) |

Source-level options (measured on `opt-level` 3; they are interface or validation changes, so they are choices, not
free wins):

| Change | Bytes | Δ bytes | Δ SOL | Verdict |
| --- | --- | --- | --- | --- |
| `UncheckedAccount` for the address-pinned mints (`usdc_mint`, `yes_mint`, `no_mint`, `winning_mint`) | 575,968 | -3,536 (-0.6%) | -0.01796 | Skip: small, and drops the owner/layout parse in front of the `address` pin |
| Remove the 8 user-side `init_if_needed` ATAs (buyer, trader, provider, owner) | 524,520 | -54,984 (-9.5%) | -0.27932 | **Not recommended**: the instructions stop creating the user's ATA, so every client and CPI caller must add `createAssociatedTokenAccountIdempotent` first. 52 of 138 tests fail by design. |

(Removing all 10 `init_if_needed` ATAs gave 506,752, but that also stops the pool ATAs from ever being created, so it is
not a valid design; it is only the upper bound.)

### 1.3 Compute-unit cost of `opt-level`

Size optimization trades CU for bytes. Measured on the same 743 single-instruction calls (the test suite, with fixed
keypairs so PDA bump searches are identical in both builds), median ratio vs baseline and the worst single call:

| Instruction | Baseline median CU | `s` ratio | `z` ratio | Worst call: base → `s` → `z` |
| --- | --- | --- | --- | --- |
| `resolve` | 5,573 | 1.28 | 1.59 | 6,858 → 8,707 → 10,662 |
| `withdraw_budget` | 10,670 | 1.29 | 1.58 | 10,727 → 13,778 → 16,930 |
| `redeem` | 17,821 | 1.26 | 1.54 | 17,870 → 22,585 → 27,491 |
| `burn_pair` | 20,152 | 1.25 | 1.52 | 20,214 → 25,285 → 30,848 |
| `buy_yes` | 21,530 | 1.20 | 1.42 | 59,487 → 64,202 → 69,422 |
| `create_market` | 40,782 | 1.26 | 1.47 | 62,427 → 72,782 → 81,703 |
| `mint_pair` | 28,458 | 1.18 | 1.39 | 99,934 → 106,082 → 112,608 |
| `swap` | 34,173 | 1.14 | 1.30 | 60,141 → 65,469 → 71,164 |
| `remove_liquidity` | 39,834 | 1.15 | 1.30 | 51,069 → 56,879 → 63,116 |
| `add_liquidity` | 43,296 | 1.13 | 1.28 | 117,330 → 126,371 → 135,245 |

- Worst call anywhere is the first `add_liquidity` (creates the LP mint and three ATAs): 126k under `s`, 135k under `z`,
  against the 200,000 default per-instruction limit. Nothing in `app/`, `scripts/` or `tests/` sets a compute budget, so
  all of it runs on that default.
- Nobody pays for CU unless they set a priority fee (the fee is on the *requested limit*), so the cost lands on users
  as a small fee delta only if they bid. `no-log-ix-name` takes back ~106 CU per call.
- `s` gives 79% of `z`'s saving for roughly half of `z`'s CU penalty. That is why `s` is the recommendation.

### 1.4 Recommended `Cargo.toml`

```toml
[profile.release]
overflow-checks = true   # keep: the handlers rely on it (amount - price, reserve_out - amount_out, pool_yes -= ...)
lto = "fat"              # already set
codegen-units = 1        # already set
opt-level = "s"          # new: -17.5% bytes
# No panic = "abort" (SBF default), no strip (build-sbf strips), no debug (off by default).
```

Verified end to end on a scratch copy with that one line added to the manifest: `NO_DNA=1 anchor build` produced a
478,016-byte `.so` **byte-identical** to the one measured through `CARGO_PROFILE_RELEASE_OPT_LEVEL=s`, and the IDL it
regenerated (`target/idl/pred_provable.json`, `target/types/pred_provable.ts`) is **byte-identical** to the files in the
working tree and to the `app/lib/idl` copies, so the CI staleness check is unaffected. The IDL is built from the host
test target, which the release profile does not touch; `cargo test` and `clippy` are unaffected for the same reason.

### 1.5 What a deploy actually costs

- ProgramData account = 45-byte header + the ELF. Rent = `(45 + len + 128) * 5080` lamports. The Program account is 36
  bytes: 833,120 lamports (0.00083312 SOL), fixed.
- `solana program deploy` writes a buffer first; the buffer's lamports move into ProgramData at the end, so the peak need
  is about one ProgramData rent plus fees (the README says the same).
- `--max-len` defaults to the ELF length: **there is no headroom**. A later upgrade that is larger than the deployed
  binary needs `solana program extend <id> <bytes>` (5,080 lamports per extra byte). Shrinking now therefore also
  shrinks the room that later growth will have to pay for; if upgrades are planned, deploy with `--max-len` about 10%
  above the final size (about +0.24 SOL at `s`) instead of paying per extension.
- Upload fees: about one write transaction per kilobyte at 5,000 lamports, so roughly 0.0029 SOL now and 0.0024 SOL at
  `s` (an estimate; it depends on the CLI's chunking, plus any priority fee).
- **It is a deposit, not a spend.** ProgramData rent comes back on `solana program close`, which retires the program ID
  for good. The permanent cost of a deploy is the fees; the rest is locked capital. The saving matters for how much SOL
  has to sit in the deploy wallet, and for the next upgrade's `extend`.

If you want the same savings under the brief's constants (they overstate or understate depending on which one you use):

| Saving from | Live, 5,080 lamports/byte | Brief, 0.00000348 SOL/byte | Brief, 0.696 SOL per 100 KB |
| --- | --- | --- | --- |
| `s` (-101,488 B) | **0.516 SOL** | 0.353 SOL | 0.706 SOL |
| `z` (-127,768 B) | 0.649 SOL | 0.445 SOL | 0.889 SOL |
| Baseline ProgramData rent | 2.945 SOL | 2.018 SOL | 4.035 SOL |
| One `Market` (285 B) | 0.002098 SOL | 0.001883 SOL | 0.002874 SOL |

If an upload fails or is abandoned, its buffer account keeps holding about one ProgramData rent until it is resumed or
closed (`solana program show --buffers`, then `solana program close --buffers`).

| Build | `.so` bytes | ProgramData + Program rent | Upload fees (est.) |
| --- | --- | --- | --- |
| Baseline | 579,504 | 2.94559 SOL | 0.0029 |
| `s` + `no-log-ix-name` | 477,096 | 2.42536 SOL | 0.0024 |
| `z` + `no-log-ix-name` | 450,712 | 2.29133 SOL | 0.0023 |

Devnet today has 554,672 bytes deployed (2.8186 SOL); the three resolvers added since cost +24,832 bytes (+0.126 SOL).

## 2. Account layout and memory audit

### 2.1 `Market` (the only program-owned state)

Anchor `#[account]` + `InitSpace`, Borsh, allocated at `8 + Market::INIT_SPACE = 285` bytes. Borsh has no alignment and no
padding, so field order does not change the size. Confirmed by running the suite: the roughly 1,980 `Market` reads it
makes saw 285 bytes for every one of the nine resolver tags.

`ResolverKind` is the one variable part: allocated at `1 + 8 = 9` (the `u64` of `StakeAtLeast`/`StakePoolTvlAtLeast`),
serialized as 1 byte for the six unit variants and 2 for `DammV2LockedAtLeast`. Fields after `kind` therefore **move**
with the variant; offsets below are for a unit variant (add 8 for the two `epoch` kinds, 1 for DAMM).

| Field | Type | Bytes | Offset (unit kind) | Needed? |
| --- | --- | --- | --- | --- |
| discriminator | `[u8; 8]` | 8 | 0 | Anchor |
| `sponsor` | `Pubkey` | 32 | 8 | PDA seed, `has_one` |
| `market_id` | `u64` | 8 | 40 | PDA seed |
| `kind` | `ResolverKind` | 9 allocated (1 to 9 used) | 48 | yes |
| `target_pubkey` | `Pubkey` | 32 | 49 | yes (differs from `metric_account` for 5 of 9 kinds) |
| `metric_account` | `Pubkey` | 32 | 81 | yes, locked at creation |
| `metric_threshold` | `u64` | 8 | 113 | yes |
| `cutoff_slot` | `u64` | 8 | 121 | yes |
| `deadline_slot` | `u64` | 8 | 129 | yes |
| `yes_mint` | `Pubkey` | 32 | 137 | PDA `[yes_mint, market]`: derivable |
| `no_mint` | `Pubkey` | 32 | 169 | PDA `[no_mint, market]`: derivable |
| `vault` | `Pubkey` | 32 | 201 | PDA `[vault, market]`: derivable |
| `yes_price_bps` | `u16` | 2 | 233 | yes |
| `budget` | `u64` | 8 | 235 | yes (bookkept) |
| `sponsor_no` | `u64` | 8 | 243 | yes (bookkept on purpose) |
| `pool_yes` | `u64` | 8 | 251 | yes (bookkept on purpose) |
| `pool_no` | `u64` | 8 | 259 | yes (bookkept on purpose) |
| `outcome` | `Outcome` | 1 | 267 | yes |
| `resolved_slot` | `u64` | 8 | 268 | UI and event only |
| `bump` | `u8` | 1 | 276 | yes |
| **Total** | | **285** allocated, 277 used by a unit kind | | |

Rent at 5,080 lamports/byte: 285 bytes = **2,098,040 lamports (0.00209804 SOL)**.

No external program reads `Market`. The only readers are this program and the client through the IDL
(`program.account.market.all()`, `fetchNullable`); nothing filters on a raw offset (`grep` finds no `memcmp` or `dataSize`
in `app/lib`, `scripts` or `tests/helpers.ts`; the third-party offsets in `app/lib/metric.ts` mirror `resolver.rs`). If a
`memcmp` filter is ever added, only `sponsor` (8), `market_id` (40) and `kind` (48) have fixed offsets.

### 2.2 Everything else a market creates

`Market` is this program's own layout; everything after it is an SPL Token account, whose size the Token program fixes:

| Account | Created by | Bytes | Rent (SOL) | Payer |
| --- | --- | --- | --- | --- |
| `Market` | `create_market` | 285 | 0.00209804 | sponsor |
| YES mint | `create_market` | 82 | 0.00106680 | sponsor |
| NO mint | `create_market` | 82 | 0.00106680 | sponsor |
| USDC vault | `create_market` | 165 | 0.00148844 | sponsor |
| **`create_market` total** | | | **0.00572008** | `Market` is 36.7% of it |
| LP mint, pool YES ATA, pool NO ATA | first `add_liquidity` | 82 + 165 + 165 | 0.00404368 | first provider |
| User ATAs (YES, NO, LP) | on first touch | 165 each | 0.00148844 each | user; `redeem` closes the winning one |

### 2.3 What could be shrunk, and what it buys

Per `Market`, at 5,080 lamports/byte. "x1,000" is the saving over a thousand markets.

| Option | Bytes | Per market | x1,000 | Cost |
| --- | --- | --- | --- | --- |
| A. Today | 285 | | | |
| B. Allocate `kind` at its real size (277 for 6 of 9 kinds) | 277 | 0.0000406 SOL | 0.041 SOL | `space` becomes a function of `args.kind`; client `dataSize` assumptions change |
| C. Drop `yes_mint`, `no_mint`, `vault`; keep 3 bump bytes | 192 | 0.0004724 SOL | 0.472 SOL | `address = market.yes_mint` (a compare) becomes `seeds + bump` (a `create_program_address`, about 1.5k CU each) on every instruction that names a mint or the vault; IDL and layout break; devnet markets unreadable |
| D. 1-byte custom discriminator (`#[account(discriminator = 1)]`, supported in Anchor 1.1.2) | 278 | 0.0000356 SOL | 0.036 SOL | IDL discriminator changes; every account of this program would start with `0x01` |
| E. Narrower integers (`market_id`, slots to `u32`) | | | | Changes PDA seed schema and fixed IDL types; not safe to do after launch |
| F. Drop `resolved_slot` | 277 | 0.0000406 SOL | 0.041 SOL | The UI shows it; the `Resolved` event also has it |
| B + C + D | 177 | 0.0005486 SOL | 0.549 SOL | all of the above |

The best case (177 bytes) saves 26% of the account and 9.6% of one market's creation rent. That is real only at
thousands of markets, it is paid by sponsors, and it spends CU on every call. **Recommendation: keep `Market` as it is.**

### 2.4 Padding, ordering and zero-copy

- No padding exists to remove: Borsh packs fields back to back.
- Reordering fields changes no size. It would only make offsets after `kind` stable (move `kind` last); that helps a
  future raw-offset indexer, saves nothing, and breaks the IDL.
- Converting `Market` to `zero_copy` would add `repr(C)` padding for the `u64`s (or `repr(packed)`, which makes field
  references unsound without copies) and Pod/alignment constraints, for a 285-byte account whose Borsh decode is cheap.
  No size gain, new risk. **Do not.**
- The third-party readers are alignment-safe by construction: every multi-byte read is `from_le_bytes` over a
  `try_into()` copy, never a pointer cast.

### 2.5 The real per-market lever: reclaiming rent

No instruction closes a market's accounts (`redeem` closes only the redeemer's own winning-token account), so each market
locks 0.00572 SOL for good. Of that, the `Market` (0.00209804) and the
vault (0.00148844) = **0.00358648 SOL, 63%**, can be closed by a program (a classic SPL Token mint cannot be closed). A
`close_market` that returns that to the sponsor once the vault is empty would beat every shrink in 2.3, and is not
a layout change. It is also new behavior (and new attack surface), so it is out of scope here; noted for the roadmap. Two
caveats: the vault only empties if every winner redeems (a stranded winner keeps it open), and a closed market
disappears from `program.account.market.all()`, so the app's market list and any history built from the account would
need a rule for it.

## 3. Safety and invariance

### 3.1 How equivalence was checked

Not a formal proof; differential evidence over the whole suite:

1. The 138 TypeScript tests (LiteSVM, the exact client math in `app/lib`) pass against each candidate `.so`.
2. A deterministic replay: fixed keypairs (so PDAs and bump searches match), then for **every** transaction record
   success/failure, a SHA-256 of the post-state (lamports, owner, data) of every account the transaction names, and a hash
   of its logs with the compute-unit lines removed. 961 transactions, the same on two runs of the baseline.

| Candidate | Tests | Status / post-state mismatches (of 961 tx) | Log mismatches |
| --- | --- | --- | --- |
| `opt-level = "s"` | 138 pass | **0** | **0** |
| `opt-level = "z"` | 138 pass | **0** | **0** |
| `no-log-ix-name` (alone, and with `s`) | 138 pass | **0** | 892: the `Program log: Instruction: X` line is gone, as intended |
| `UncheckedAccount` mints | 138 pass | **0** | 29, all failed transactions, all the same error code: only the source line number inside `AnchorError thrown in ...rs:NN` moved because the scratch edit added comment lines |
| Drop user `init_if_needed` ATAs | 86 pass, 52 fail | not compared | fails by design |

The same replay on the **mainnet-feature** builds (`--features mainnet`, IDL and client constants switched to mainnet
USDC in the scratch harness), compared with the mainnet-feature `opt-level` 3 build:

| Candidate | Tests | Status / post-state mismatches (of 961 tx) | Log mismatches |
| --- | --- | --- | --- |
| mainnet + `opt-level = "s"` | 137 pass, 1 fail* | **0** | **0** |
| mainnet + `opt-level = "s"` + `no-log-ix-name` | 137 pass, 1 fail* | **0** | 892: the `Instruction:` line |

\* The same single test fails on all three mainnet builds, including the `opt-level` 3 reference: `create_market rejects a
target that is not one of the pool's mints` uses `USDC_MINT` as the decoy, and the Ft8FD9 pool fixture is SOL/USDC
(token B is mainnet USDC), so once the harness swaps in mainnet USDC the decoy is a real pool mint and the program
correctly accepts it. A harness artifact, not a difference between builds.

The suite includes the real mainnet bytes for the stake pool, DAMM v2 and Token Metadata readers
(`tests/fixtures`), so the SBF-compiled readers are exercised on third-party layouts under `s` and `z` too.

### 3.2 Per-change invariance

| Change | Field offsets | Alignment | Discriminators | Borsh/IDL | External readers and CPIs |
| --- | --- | --- | --- | --- | --- |
| `opt-level = "s"` | none | no `unsafe`, no pointer casts in the crate; every read is a byte copy | none | none: IDL is built on the host | Same CPIs and seeds; the replay shows identical account writes |
| `no-log-ix-name` | none | none | none | none | Nothing in `app/lib`, `scripts/` or `tests/` parses the `Instruction:` log line |
| (rejected) overflow-checks off | none | none | none | none | **Behavior changes**: see 3.4 |
| Account options B to F | B: none until `kind`; C to F: shift every later field | none (Borsh) | D changes the 8-byte tag | IDL and `app/lib/idl` regenerate; existing devnet markets stop decoding | None outside this repo |

### 3.3 Things that can still go wrong with `opt-level`

- **Stack frames.** SBF has a 4 KB frame limit per function and a hard fault when it is exceeded; the compiler reports it
  at build time as `Stack offset of N exceeded max offset of 4096`. None of the builds reported one (baseline, `s`, `z`), and
  the accounts structs are already `Box`ed. A future edit that adds a large local can trip it; the warning is the signal.
- **Heap.** The default 32 KB bump heap is unchanged; no heap-related difference showed up in the replay.
- **CU headroom.** 126k worst case against 200k (1.3). A new instruction that creates more accounts than
  `add_liquidity` does would deserve a CU check, or an explicit `SetComputeUnitLimit` in the client.
- **Anything LLVM could miscompile** is invisible to a replay that does not hit it. The mitigation is cheap: run the
  full CI and `smoke:devnet` (the whole USDC lifecycle on a real cluster) against the `s` build before the mainnet deploy.

### 3.4 Why `overflow-checks` stays on

Turning it off saves 1,960 bytes (0.0100 SOL), 0.34%. The handlers lean on it as a backstop where they do plain
arithmetic that the invariants say cannot overflow: `amount - price` and `reserve_out - amount_out` in `buy_yes`/`swap`,
`pool_yes -= yes_out` in `remove_liquidity`. With checks off, an invariant bug would wrap silently in a program that
holds user funds, instead of aborting the transaction. Not worth 0.01 SOL.

### 3.5 Not verified

- `cargo test -p pred-provable --features no-entrypoint` (the Rust suite) was not run against the `s` build: its one
  integration test (`burn_goal.rs`, a single scenario the TypeScript suite also covers) needs a 3.4 GB host build, which
  does not fit the scratch space. CI runs it.
- No devnet or mainnet deploy was done. `StakeAtLeast` YES is untestable in LiteSVM (`sol_get_epoch_stake` returns 0), so
  that path has no replay evidence under any build.
- The mainnet-feature binary is the same size as the devnet one, byte for byte of length (579,504 / 478,016 / 477,096),
  but not the same machine code: the different `USDC_MINT` constant changes inlining and stack layout (about 3.5k to 4.6k
  differing bytes). That is why the replay above was repeated on the mainnet builds instead of assumed.
- A `--verifiable` build needs Docker and `solana-verify`; neither is installed here, so it was not tried and may differ
  from a local build by a few bytes. Do the profile change before producing the artifact you verify.

## 4. Implementation plan

Order: 4.1 is the whole recommendation. 4.2 and 4.3 are optional. Nothing in 4.4 is recommended.

### 4.1 `Cargo.toml` (recommended)

```diff
 [profile.release]
 overflow-checks = true
 lto = "fat"
 codegen-units = 1
+opt-level = "s"
 [profile.release.build-override]
```

Then, in this order (each is already in CI):

```bash
export PATH="$HOME/.bun/bin:$PATH"
sha256sum target/idl/pred_provable.json target/types/pred_provable.ts app/lib/idl/pred_provable.* > /tmp/idl.sha256
bun run build:program                      # anchor build + sync-idl
sha256sum -c /tmp/idl.sha256               # expect all OK: the profile does not touch the IDL
ls -l target/deploy/pred_provable.so       # expect 478,016 bytes
bun run test && bun run test:rust
cargo clippy -p pred-provable --all-targets --features no-entrypoint -- -D warnings
bun run deploy:devnet && bun run smoke:devnet
```

### 4.2 Mainnet artifact (optional `no-log-ix-name`)

`no-log-ix-name` is already declared in `programs/pred-provable/Cargo.toml`; it is a build flag, not a source change.
`--no-idl` keeps the mainnet `USDC_MINT` constant out of the committed IDL. This exact command was run on the scratch
copy (with `--ignore-keys`, which the repo does not need because its program keypair exists): 477,096 bytes,
byte-identical to the `cargo build-sbf` build, IDL files untouched.

```bash
NO_DNA=1 anchor build --no-idl -- --features mainnet,no-log-ix-name   # -920 bytes over `s`; drop it to keep instruction names in logs
solana program deploy target/deploy/pred_provable.so \
  --program-id target/deploy/pred_provable-keypair.json --url mainnet-beta \
  --keypair <deploy-wallet> --max-len <final size + headroom, or omit for no headroom>
```

Decide on `--max-len` before the first mainnet deploy: it is the only moment headroom is free of `extend` transactions (1.5).

### 4.3 If CU matters more than SOL, or the reverse

`opt-level = "s"` is the default recommendation. `"z"` is a one-word change (a further -0.133 SOL, and 20% to 25% more
CU than `s`) and `"3"` is today's setting.

### 4.4 Account changes (not recommended; shown for completeness)

Option C, the only one with a meaningful saving, `programs/pred-provable/src/state.rs`:

```diff
     pub cutoff_slot: u64,
     pub deadline_slot: u64,
-    pub yes_mint: Pubkey,
-    pub no_mint: Pubkey,
-    /// USDC token account owned by this market. ...
-    pub vault: Pubkey,
+    pub yes_mint_bump: u8,
+    pub no_mint_bump: u8,
+    pub vault_bump: u8,
     pub yes_price_bps: u16,
```

and in each `Accounts` struct that names one of them (`buy_yes`, `mint_pair`, `burn_pair`, `add_liquidity`,
`remove_liquidity`, `swap`, `redeem`, `withdraw_budget`):

```diff
-    #[account(mut, address = market.yes_mint)]
+    #[account(mut, seeds = [YES_MINT_SEED, market.key().as_ref()], bump = market.yes_mint_bump)]
     pub yes_mint: Box<Account<'info, Mint>>,
```

`create_market` sets the bumps from `ctx.bumps`, and `redeem` compares against derived keys instead of
`market.yes_mint`/`no_mint`. That is the whole of the 93-byte saving: 0.00047 SOL per market, paid back as about 1.5k CU
per derived key on every call, plus an IDL break. Options B and D are one-liners (`space = 8 + Market::INIT_SPACE - ...`,
`#[account(discriminator = 1)]`) and save 0.00004 SOL each.

## Appendix: reproducing the numbers

```bash
# Rent (live): mainnet and devnet agree. 285 -> 2,098,040; 579,549 (ProgramData of the baseline) -> 2,944,759,160
curl -s https://api.mainnet-beta.solana.com -X POST -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"getMinimumBalanceForRentExemption","params":[285]}'

# Size variants (profile via env, so Cargo.toml stays untouched); copy programs/, Cargo.toml, Cargo.lock to a scratch dir first
CARGO_PROFILE_RELEASE_OPT_LEVEL=s cargo build-sbf --manifest-path programs/pred-provable/Cargo.toml \
  --sbf-out-dir out/opt_s --offline
cargo build-sbf ... --features no-log-ix-name

# End to end through Anchor: a scratch tree needs programs/, Cargo.toml (+ the opt-level line), Cargo.lock,
# rust-toolchain.toml, Anchor.toml and tests/fixtures (IDL generation compiles the crate's test target, which
# include_bytes!s the fixtures); add --ignore-keys if the tree has no target/deploy keypair
NO_DNA=1 anchor build --ignore-keys
NO_DNA=1 anchor build --no-idl --ignore-keys -- --features mainnet,no-log-ix-name

# Function sizes: the unstripped cdylib is target/sbpf-solana-solana/release/pred_provable.so (the shipped one is stripped)
~/.cache/solana/v1.52/platform-tools/llvm/bin/llvm-readelf -s -W <that file> | awk '$4=="FUNC"{print $3, $8}' | sort -rn | head
~/.cache/solana/v1.52/platform-tools/llvm/bin/llvm-readelf -S -W out/opt_s/pred_provable.so
```

Differential harness (scratch only, in a copy of `tests/` and a Bun `--preload`; the repo's `tests/` is untouched). In
`send()` of the copied `tests/helpers.ts`, after `client.svm.sendTransaction(tx)`:

```ts
if (process.env.DIFF_LOG) {
  const keys = new Set<string>();
  for (const ix of ixs) { keys.add(ix.programId.toBase58()); for (const k of ix.keys) keys.add(k.pubkey.toBase58()); }
  const failed = isFailedTransaction(result);
  const logs = (failed ? result.meta().logs() : result.logs()).filter((l) => !l.includes("consumed"));
  const h = createHash("sha256");
  for (const k of [...keys].sort()) {
    const a = client.svm.getAccount(address(k));
    h.update(k);
    if (a.exists) { h.update(String(a.lamports)); h.update(a.programAddress); h.update(a.data); } else h.update("none");
  }
  appendFileSync(process.env.DIFF_LOG, `${failed ? "ERR" : "OK "} ${h.digest("hex").slice(0, 16)} ` +
    `${createHash("sha256").update(logs.join("\n")).digest("hex").slice(0, 16)}\n`);
}
```

and a preload that makes `generateKeyPairSigner` deterministic:

```ts
// det-preload.ts, run as: DIFF_LOG=out.log bun test --preload ./det-preload.ts tests/
import { mock } from "bun:test";
import { createHash } from "node:crypto";
const real = await import("@solana/kit");
let n = 0;
mock.module("@solana/kit", () => ({
  ...real,
  generateKeyPairSigner: async () =>
    real.createKeyPairSignerFromPrivateKeyBytes(new Uint8Array(createHash("sha256").update(`diff-${n++}`).digest())),
}));
```

Run it once per `.so` (copied to `target/deploy/pred_provable.so` of the scratch tree) and `cmp` the logs. The same hook
with `process.env.CU_LOG` and `result.computeUnitsConsumed()` produced the table in 1.3.
