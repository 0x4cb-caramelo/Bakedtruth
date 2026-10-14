# Pinocchio: its own audits, and the versions this program pins

**Status:** written on 2026-10-13. Every outside fact below names the URL it was read from on that date. **[to verify]**
marks what was not checked. This program's `file:line` references point at `main` at `8af10e2`; the files the pre-freeze
hardening (PR #93) rewrites are cited by function (`file.rs::name`), as in `SCOPE.md`.

## In short

- The Technical Plan says Pinocchio is "audited by Zellic **[AC: link the report]**" (`docs/technical/TECHNICAL-PLAN.md`
  §1, line 159; TP §14.4 C38 asks for the link).
- **Two public reports were found, and both cover Pinocchio 0.8.4** (with `pinocchio-system` 0.2.3): Zellic's
  (review May 27 – June 16, 2025, report dated June 30, 2025) and Neodyme's (April 23 – June 12, 2025).
- **This program pins `pinocchio =0.11.2` and `pinocchio-system =0.6.1`** (`programs/brot-markets/Cargo.toml:30-31`), and
  through them four crates of `anza-xyz/solana-sdk` that now hold the account view, the address, the CPI layer and the
  program error. **The audited version differs from the pinned one**: three minor versions of a pre-1.0 crate, about two
  hundred commits, and a restructuring that moved the audited account code into another repository. No public audit of
  Pinocchio 0.9 to 0.11, of `pinocchio-system` 0.3 to 0.6, or of the `solana-sdk` view crates was found.
- Zellic's own conclusion asks for exactly this caution: "We also recommend reaudits for any nontrivial changes to these
  libraries" (report §5).

## 1. The reports found

### 1.1 Zellic — "Pinocchio and p-token: Solana Application Security Assessment" (June 30, 2025)

- **Report:** https://github.com/Zellic/publications/blob/master/Pinocchio%20and%20p-token%20-%20Zellic%20Audit%20Report.pdf
  (40 pages; the file fetched on 2026-10-13 had SHA-256
  `57555bd771cdaaa78e2240c004f42f4066b5e0c0ad36799d7bec44e1a03e93ad`). Zellic's publication page,
  https://reports.zellic.io/publications/pinocchio-and-p-token, appears in search results but answered HTTP 403 to our
  fetch, so its content was read from the PDF only.
- **Client and dates:** Anza Technology, Inc.; primary review May 27 – June 16, 2025; pull-request review period until
  September 10, 2025; three consultants, four and a half person-weeks (report §1.1, §2.4, §2.5).
- **Scope** (report §2.3): `https://github.com/anza-xyz/pinocchio` at commit
  `887a1150bba40c5c77373da90b76557d8c73b747`, folders `sdk/pinocchio/*`, `sdk/log/*`, `sdk/pubkey/*`,
  `programs/associated-token-account/*`, `programs/memo/*`, `programs/system/*`, `programs/token/*`; and
  `https://github.com/solana-program/token` at `4c3fabd685e30b27bbc8f5d515626177dd720a02` (`p-token/src/*`,
  `interface/*`). Pull-request reviews: Pinocchio PR #176 at `6e77c1ca228ec9cd79cd2ea97501ecef8e899fc0` and PR #209 at
  `8cbac4eec3093692ca1fc3a0d07c8d8696bf3031` (both `sdk/pinocchio/src/entrypoint/mod.rs`); token PRs #80, #81 and #82.
- **Versions at the audited commit**, read from the crates' manifests at `887a1150`
  (`https://raw.githubusercontent.com/anza-xyz/pinocchio/887a1150bba40c5c77373da90b76557d8c73b747/sdk/pinocchio/Cargo.toml`
  and the same path for the others): `pinocchio` **0.8.4**, `pinocchio-system` **0.2.3**, `pinocchio-log` 0.4.0,
  `pinocchio-pubkey` 0.2.4. The two PR-review commits also declare `pinocchio` 0.8.4.
- **Findings** (report §1.4 and §3; the table counts one critical, three high, one medium, three low and one
  informational, nine in all, while the text says "eight findings"):

  | # | Severity | Finding | Target | Fix named in the report |
  |---|---|---|---|---|
  | 3.1 | Critical | `copy_val` with a `?Sized` bound allows an out-of-bounds read | `sdk/pinocchio/src/memory.rs` | commit `293cc13c` |
  | 3.2 | High | Missing `Copy` bound on `copy_val` | `sdk/pinocchio/src/memory.rs` | `293cc13c` |
  | 3.3 | High | The `Transmutable` trait is missing `unsafe` | the token interface, `interface/src/state/mod.rs` | `5ac906f0` (in `solana-program/token`) |
  | 3.4 | High | `Log` trait missing `unsafe` | `sdk/log/crate/src/logger.rs` | `dee49f59` |
  | 3.5 | Medium | Undefined behaviour from an invalid reference cast in `AccountInfo::assign` | `sdk/pinocchio/src/account_info.rs` | `d043b5d6` |
  | 3.6 | Low | The system-program helpers require `AllocateWithSeed` and `AssignWithSeed` accounts to sign | `programs/system` | `fdf3d5fc` |
  | 3.7 | Low | Undefined behaviour from a `MaybeUninit` initialization invariant | `programs/token` | `32c13da7` |
  | 3.8 | Low | Missing alignment safety message | `sdk/pinocchio/src/entrypoint/lazy.rs` | `1777181c` |
  | 3.9 | Informational | `AccountInfo` raw pointer has an unclear provenance invariant | `sdk/pinocchio/src/account_info.rs` | PR #254 |

  The discussion (report §4) also records that `invoke_signed` now requires the account views in the instruction's
  account order (§4.3), and that the off-chain `impl_sysvar_get` may return a different `ProgramError` (§4.1).
- **Conclusion** (report §1.4): "Based on the number of severe findings uncovered during the audit, it is our opinion
  that the project is not yet ready for production. We strongly advise a comprehensive reassessment before
  deployment". And (§5): "while a particular commit could be determined to be safe, this is a weak assurance and is more
  likely to be broken with further changes to the code"; "We also recommend reaudits for any nontrivial changes to these
  libraries", and Miri in CI.

### 1.2 Neodyme — "Security Audit - P-Token" (June 12, 2025)

- **Report:** https://neodyme.io/reports/P-Token.pdf (16 pages; the file fetched on 2026-10-13 had SHA-256
  `ace34388817d0e19ce54c23e8075c58114b1603646cf6bef773a7eb992fab418`).
- **Dates and team:** April 23 – June 12, 2025; lead auditor Nico Gründel, second auditor Sebastian Fritsch (report
  cover and §2).
- **Scope** (report §3): "Primarily, making sure that P-Token behaves exactly like the old Solana token program;
  Additionally, evaluating Pinocchio for security footguns". Revisions: P-Token `4c3fabd685e30b27bbc8f5d515626177dd720a02`,
  Pinocchio `837535f244a8f995e11266a52471a5cd3e3e548f`; "Third-party dependencies are not in scope."
- **Versions at `837535f2`** (manifests at that commit): `pinocchio` **0.8.4**, `pinocchio-system` **0.2.3**.
- **Findings:** none at any severity (report §1, §2, §7: "we did not find any issues with the P-Token program or with
  Pinocchio").

### 1.3 Not about the library: Zellic's p-token patch review (October 13, 2025)

https://github.com/Zellic/publications/blob/master/Anza%20P%20Token%20-%20Zellic%20Audit%20Report.pdf reviews three
commits of `solana-program/token` (October 7–9, 2025). It does not cover Pinocchio itself.

## 2. What this program pins, against what was audited

| Crate | Pinned here | Published on crates.io | Audited | Distance |
|---|---|---|---|---|
| `pinocchio` | `=0.11.2` (`programs/brot-markets/Cargo.toml:30`) | 2026-06-09 | 0.8.4 (published 2025-05-01) | Tag `pinocchio@v0.11.2` is 201 commits ahead of Zellic's `887a1150` and 204 ahead of Neodyme's `837535f2`; three minor versions (0.9, 0.10, 0.11) |
| `pinocchio-system` | `=0.6.1` (`Cargo.toml:31`) | 2026-04-23 | 0.2.3 (published 2025-03-29) | Tag `pinocchio-system@v0.6.1` is 193 commits ahead of `887a1150`; four minor versions |
| `solana-account-view` | 2.1.0 (`Cargo.lock`) | — | not in either scope | lives in `anza-xyz/solana-sdk` |
| `solana-address` | 2.8.0 (`Cargo.lock`; `Cargo.toml:43` for host builds) | — | not in either scope | `anza-xyz/solana-sdk` |
| `solana-instruction-view` | 2.1.0 (`Cargo.lock`) | — | not in either scope | `anza-xyz/solana-sdk` |
| `solana-program-error` | 3.0.1 (`Cargo.lock`) | — | not in either scope | `anza-xyz/solana-sdk` |

Sources: publish dates from `https://crates.io/api/v1/crates/pinocchio/versions` and
`https://crates.io/api/v1/crates/pinocchio-system/versions`; commit distances from the GitHub compare API
(`https://api.github.com/repos/anza-xyz/pinocchio/compare/<audited commit>...pinocchio@v0.11.2`, status "ahead"); the
`solana-sdk` crates' repository from their crates.io records. All read on 2026-10-13.

**The audited version differs, plainly:**

1. **The code moved.** In 0.8.4 the account type was `AccountInfo` in `sdk/pinocchio/src/account_info.rs`, the file
   of findings 3.5 and 3.9. In 0.11.2 the `pinocchio` crate holds only `lib.rs`, `entrypoint/` and `sysvars/` (the copy in
   the local cargo registry), and this program's `AccountView`, `Address`, CPI types and `ProgramError` come from the
   four `solana-sdk` crates above, which neither report covers. The closing routine this program relies on,
   `AccountView::close` (zeroing the owner, the lamports and the data length in place), is in
   `solana-account-view` 2.1.0 (`src/lib.rs:336-379` of that crate); its 0.8.4 counterpart `AccountInfo::close` was in
   the audited file.
2. **The create-or-top-up helper was not audited.** Every account this program creates goes through
   `pinocchio_system::create_account_with_minimum_balance_signed` (`programs/brot-markets/src/checks.rs:20`, `:147`). In
   `pinocchio-system` 0.2.3 the crate's `lib.rs` was five lines of module declarations and its `instructions/` folder had
   no such helper (read at `887a1150`); in 0.6.1 it is `src/lib.rs:47-95`, plus a new `create_account_allow_prefund.rs`.
3. **The fixes.** The fix commits Zellic names (`293cc13c`, `d043b5d6`, `fdf3d5fc`, `1777181c`, `dee49f59`, `32c13da7`)
   are not ancestors of the `pinocchio@v0.11.2` tag (GitHub compare: "diverged", one commit behind each), which fits
   squash merges. Whether each fix's content reached 0.11.2 and the split-out crates is **[to verify]**. The memory module
   of findings 3.1 and 3.2 is no longer in the 0.11.2 crate (no `copy_val` in its source).
4. **No later report was found** (searches in §4).

## 3. The Pinocchio surface this program uses

What a firm reviewing the library as a dependency should look at, with where this program calls it. Paths under
`programs/brot-markets/src/`.

| API | Crate it comes from in 0.11.2 **[to verify per item]** | Used at |
|---|---|---|
| `pinocchio::entrypoint!` (input deserialization, duplicate accounts aliased, the std panic hook) | `pinocchio` | `lib.rs:25-26`; the crate links `std` (`lib.rs:7-8`) |
| `declare_id!` | `pinocchio` / `solana-address` | `lib.rs:23` |
| `AccountView`: `owned_by`, `is_signer`, `is_writable`, `address`, `owner`, `lamports`, `set_lamports`, `is_data_empty`, `try_borrow`, `try_borrow_mut`, `close` | `solana-account-view` | `checks.rs:48-171`; `state/mod.rs:56-112`; `instructions/settlement/bookkeeping.rs::pay_from_vault`, `::credit`; `instructions/settlement/collect_fee/moves.rs::move_lamports` (with `::moved_exactly` on the pre-freeze branch); `instructions/entries/sealed_fee_account.rs:66-73`, `:140-142`; `checks/close.rs:17-23` |
| `Ref::try_map`, `RefMut::try_map` | `solana-account-view` | `state/mod.rs:65-68`, `:85-88`, `:108-111` |
| `Address::derive_address` (no curve check), `Address::try_find_program_address` | `solana-address` | `checks.rs:101`, `:113-114`; `checks/upgrade.rs:25`; `readers/price_update.rs:120-125` |
| `cpi::invoke_signed`, `Seed`, `Signer`, `InstructionAccount`, `InstructionView` | `pinocchio` with `solana-instruction-view` | `events/self_cpi.rs:11-16`, `:49-57`; `checks.rs:144-147` |
| Sysvars: `Clock::get`, `Rent::get`, `get_sysvar` (EpochSchedule) | `pinocchio` | `readers/mod.rs:50-57`; `instructions/settlement/collect_fee/moves.rs::empty_rent`; `instructions/settlement/settle_creator_share.rs:75`; `instructions/settlement/close_campaign.rs:82`; `instructions/settlement/settle_sealed_fee.rs:83`; `readers/epoch.rs:90-95` |
| Syscalls `sol_get_stack_height`, `sol_get_epoch_stake` (the program's only `unsafe` calls into the library) | `pinocchio::syscalls` | `checks/top_level.rs:23-27`; `readers/vote_stake.rs:89-95` |
| `ProgramError` | `solana-program-error` | `error.rs:14`, `:368-372` |
| `create_account_with_minimum_balance_signed` (create, or top up, allocate and assign) | `pinocchio-system` | `checks.rs:20`, `:132-148` |
| `instructions::Transfer` | `pinocchio-system` | `vault.rs:11`, `:22-32` |

This program writes its own zero-copy layer (`layout.rs:73-125`) rather than Pinocchio's; its only other `unsafe` is that
layer.

## 4. What was searched

- The `anza-xyz/pinocchio` repository on 2026-10-13: its README and `SECURITY.MD` mention no audit, and its top-level
  tree has no audits folder (`https://github.com/anza-xyz/pinocchio`;
  `https://raw.githubusercontent.com/anza-xyz/pinocchio/main/SECURITY.MD`).
- Zellic's public PDF repository, `https://github.com/Zellic/publications` (416 entries listed through the GitHub API):
  "Pinocchio and p-token" and "Anza P Token" are the only Pinocchio-related ones; none covers `anza-xyz/solana-sdk`.
- Neodyme's report above, and web searches for audits of Pinocchio 0.10 or 0.11 and of `solana-account-view`: none
  found.
- Not asked: Anza itself, whether a newer review exists **[to verify]**.

## 5. What this means for the audit

- The firms should treat `pinocchio` 0.11.2, `pinocchio-system` 0.6.1 and the four `solana-sdk` crates as **unaudited
  dependencies**, and review at least the surface of §3: the entrypoint's deserialization and its aliasing of a
  repeated account (TP §14.4 C42: the runtime and Pinocchio accept one account in two slots; `checks::distinct` exists
  for that, `checks.rs:150-156`), `AccountView::close`, the borrow flags, `invoke_signed` with PDA signers, and the
  create-or-top-up helper.
- TP §1 (line 159) should stop saying "audited by Zellic" without the version: the accurate sentence is "Pinocchio 0.8.4 was audited
  by Zellic and by Neodyme in 2025; this program uses 0.11.2, which no public report covers".
- Upgrading Pinocchio after the freeze changes the binary, so it needs a new review (`FIX-WORKFLOW.md`, rule of the
  freeze).
