# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Brot Markets**, a platform of On-Chain Campaigns on Solana (devnet, unaudited), being rebuilt in this repository.

The code it grew from is `pred-provable`, "Provable KPI Markets": a sponsor sold YES outcome tokens below face value
as a bounty on an on-chain goal, and anyone resolved the market by reading the target account on-chain. What carried
over is its way of resolving: typed reads of on-chain accounts, with no opinion oracle. Sprint 03 ported its readers
and removed it, with the Anchor toolchain. The README describes Brot Markets since 2026-10-10, in the brand's voice;
the upstream program's own documents at the root (`ECONOMICS.md`, `RESOLVERS.md`, `NAMING.md`, `PRIVACY_PLAN.md`,
`OPTIMIZATION.md`) stay as its record. Neither is the source of truth for the product; the next section says what is.

Bun workspace (root, `app/`, `packages/*`, `services/*`), one program (`programs/brot-markets`, on Pinocchio) and a
test-only program that is never deployed (`tests/programs/cpi-proxy`), Next.js frontend (`app/`).

## State of the rewrite (read this before the rest)

The product is being rebuilt as **Brot Markets**, a platform of On-Chain Campaigns: a YES/NO question that an
on-chain account answers. Any wallet opens a campaign for US$500 in SOL, charged at the Pyth SOL/USD price (90% becomes
a prize in the pot, 10% goes to Brot); the team and launch partners open free. Bakers join YES or NO with SOL, the
winners split the pot, Brot keeps 10% of the losing side and the creator 1% of the entries. Everything is in SOL; there
are no outcome tokens, no pool, no early exit, no cap and no accepted-account list. Words: campaign, entry, baker,
creator, pot, YES/NO; never "market" or "bet" outside the brand.

- What to build: BP v0.0.4 (`docs/business/BUSINESS-PLAN.md` and its four parts), until the Product Brief
  (`docs/product/PRODUCT-BRIEF.md`, still v0.0.1 with USDC and the cap) is revised. How:
  `docs/technical/TECHNICAL-PLAN.md` v0.1.0, derived from the architecture proposal 0.4
  (`docs/technical/SYSTEM-ARCHITECTURE-PROPOSAL.md`, approved 2026-10-08). In what order: `docs/SPRINTS.md` and
  `docs/sprints/`, rewritten the same day. The founder's answers in
  `docs/business/ideacao-perguntas-e-respostas.md` outrank the README and the old code.
- The program is `programs/brot-markets` (id `5Rx8o5c5frxqF17mZwvTFg36ZcW5xU12ePojqDbj9n8o` since 2026-10-09; it
  replaced `6G2d…uVN`, whose keypair was not at hand for the devnet deploy), on Pinocchio.
  Sprint 02 built the config, the team and the pause, the paid opening and the SOL entry; Sprint 03 the five readers,
  the opening of all five kinds, the join lock and `resolve_campaign`; Sprint 04 the review window, settlement, the
  payouts, the fees, the creator share and the invariants; Sprint 05 the SDK and the devnet deploy. Each instruction
  emits one event by self-CPI.
  Its client library is `packages/sdk` (`@brot/sdk`, Sprint 05): `read` and `tx` entry points over the Codama client
  generated from the Shank IDL (T9), plus `schemas` (zod). `app/lib` is the old program's client, kept only for the
  current site until Sprint 09.
- `services/landing` is the provisional `brot.markets` site: a "coming soon" page with a waitlist, a privacy page and
  the pitch deck under the `pitch/` path. Plain Node, no dependencies, its own tests (`node --test services/landing/tests/*.test.mjs`).
  It stores emails, so read section 8.1 of the technical plan before changing what it keeps. It goes away in Sprint 09.
- Pyth has two generations of programs on Solana. Its documentation dates the Core upgrade 2026-08-26; the upgraded
  programs have been on-chain since 2026-05-05. The reader trusts only the upgraded
  receiver (`rec2HH...`), and the price service (Hermes) now needs an API key. Addresses, layout, cadence and
  sources: `knowledge-base/tecnologia/pyth-leitor-de-preco.md`. Read it before touching the price reader.
  Joining reads only a feed's sponsored account; a YES proof may be any fully verified account of the feed; a NO is
  recorded only 60 s after the deadline; `StaleFeed` voids a campaign whose sponsored account was not updated after
  the deadline and is older than `deadline − max(max_age, 600 s)` (`STALE_FEED_MIN_SECONDS`, `readers/price_touch/proof.rs`).
- Program code follows the house rules: one instruction and one reader per file, under 200 lines, a `Purpose:`
  header, checked math (clippy denies unchecked arithmetic and truncating casts in that crate), the owner of an
  account checked before any of its bytes is read, and Anchor's `init-if-needed` restated for Pinocchio: never
  re-initialise an account that already carries a tag (`state::init` refuses one).
- The program is built in CI, never on the shared server. The IDL needs no build: `bun run idl` writes it from the
  source with shank-cli 0.4.9.
- `gh` resolves to the upstream repository here. Pass `--repo 0x4cb-caramelo/Bakedtruth` on every `gh` command.

## Commands

`brot-markets` builds with `cargo build-sbf`, Shank writes its IDL and Codama its client; there is no Anchor in the
workspace since Sprint 03.

Bun 1.4.2 is at `~/.bun/bin` and may not be on PATH in tool shells (`export PATH="$HOME/.bun/bin:$PATH"`). Solana CLI
3.1.x, Rust 1.89 (pinned by `rust-toolchain.toml`), shank-cli 0.4.9 in the ignored `target/tools`
(`cargo install --locked --version 0.4.9 --root target/tools shank-cli`; `bun run idl` refuses any other version),
Surfpool 1.6.0 (CI downloads it pinned by SHA-256; a local 1.5.0 runs the same scenario).

```bash
bun install
bun run build:program      # cargo build-sbf (brot-markets and the test-only cpi-proxy, into target/deploy); bun run idl
bun run idl                # brot-markets: Shank IDL from the source into packages/sdk/src/idl, then the Codama client into idl/generated
bun run test               # bun test tests/ app/  (TypeScript, LiteSVM, in-process; no validator; the site's own tests too)
bun run test:rust          # cargo test -p brot-markets --features no-entrypoint (host and Mollusk; needs the binary)
cargo test --locked -p brot-markets --features no-entrypoint,mainnet   # the mainnet values, never the drill ones (T12)
bun run lint               # prettier --check on tests/, scripts/ and packages/, then lint:sdk
bun run lint:sdk           # dependency-cruiser (read never imports tx; no Node/React/zod in read and tx), the SDK's
                           # ES2022-only typecheck, and scripts/sdk-portability.ts (no Node, Bun or DOM global)
(cd tests/react-native && npm ci --ignore-scripts && node run.mjs)   # Metro for Android, on Hermes (CI: Mobile bundle)
cargo fmt --all -- --check
cargo clippy --locked -p brot-markets --all-targets --features no-entrypoint -- -D warnings
cargo clippy --locked -p brot-markets --all-targets --features no-entrypoint,mainnet -- -D warnings
bun run scripts/surfpool/price-touch.ts   # the price reader on Surfpool's mainnet fork (needs the binary)
node scripts/codemap.js --check && node scripts/ci-secret-scan.js origin/main
bunx tsc --noEmit          # typecheck tests/scripts
bun run dev                # Next.js app (cp app/.env.example app/.env.local first)
cd app && bun run lint && bun run build
```

Single tests: `bun test tests/ -t "<describe or test name substring>"`;
`cargo test -p brot-markets --features no-entrypoint --test <file> <name>`.

The test suites load `target/deploy/brot_markets.so` (and `cpi_proxy.so` for the CPI refusal), so **run
`bun run build:program` before testing** after any program change. `tests/brot/kit.test.ts`,
`tests/brot/idl.test.ts` and the SDK's contract, vector and schema tests (`tests/sdk/`) need no binary. CI
(`.github/workflows/ci.yml`) runs all of the above and fails if the committed IDL (the Codama client included) or
`CODEMAP.md` is stale, if `Cargo.lock` disagrees with the manifests, or if the branch adds something shaped like a
credential.

Devnet: brot-markets runs at `5Rx8o5c5frxqF17mZwvTFg36ZcW5xU12ePojqDbj9n8o` since 2026-10-09 (CI run 38014319993,
`main` at `c20e79a`; upgrade authority, admin and fee recipient are Ronaldo's devnet key, the team his team key), and
`smoke:devnet -- --cluster devnet` passed there the same night. The procedure is `deploy/devnet/README.md` (CI's
artifact by run id and its `SHA256SUMS`, the program keypair from its backup outside `target/deploy/` and at the
declared id, loader v3 only, initialization and the team in one session, the run bound to the reviewed commit and the
binary's hash typed at `--execute`; `scripts/deploy/binding.ts` refuses a checkout whose program differs from the run's
commit). The public devnet RPC drops buffer writes and answers 429 under load: pass a keyed RPC with `--url` or
`DEVNET_RPC_URL`, and keep its key out of every file in the repository and out of the logs. Anyone can fund a public address: a funded ProgramData
address makes a program id undeployable for good (rehearsed; the dry run names it). `smoke:devnet` and
`seed:devnet` drive brot-markets in SOL through the SDK; they default to a local cluster and act on devnet only with
`-- --cluster devnet` (`DEVNET_WALLET`, default `~/.config/solana/pred-provable-devnet.json`, needs about 6.3 SOL for
a first smoke run, since it tops the creator up to 6 SOL, and the wallets it derives keep what the cycle pays back; `TEAM_KEYPAIR` is the person's own team key; `DEVNET_RPC_URL` overrides the RPC). `scripts/team/` holds one
command per team act, each simulating unless `--yes`. `solana-test-validator` 3.1.10 needs AVX2, which the development
machine lacks: the local rehearsals (`deploy:rehearse`, `team:rehearse`, `validator:negative`, the smoke and the seed)
run Surfpool `--offline` inside a loopback-only network namespace (`scripts/validator/isolate.ts`). The current site
still renders the old program's devnet deployment through `app/lib` until Sprint 09.

## Architecture

**Program** (`programs/brot-markets/src`), Pinocchio, no Anchor:
- `state/`: `GlobalConfig`, `Campaign`, `Entry`, `Join` (one per join, tallied after resolution): fixed
  little-endian layouts read in place (`layout.rs`, `zero_copy!`), each starting with a tag and a layout version, sizes
  pinned by `tests/layout.rs`. Enums are tagged by position: append, never reorder. Balances (`pool_yes`, `pool_no`,
  `prize_lamports`) are bookkept, never read from a vault (I15); vaults are data-less program-owned PDAs.
- `checks.rs` (and `checks/top_level.rs`): every check Anchor made, written by hand, each with its own error and a
  negative test; `scripts/checks-mutation.mjs` (X0.9) shows each check's tests fail without it.
- `readers/`: the closed `ReaderKind`, five kinds, one file each, no generic reader: `price_touch.rs` (with
  `price_update.rs` and `price_touch/`), `spl_mint.rs`, `damm_v2.rs`, `stake_pool.rs`, `vote_stake.rs` (with
  `epoch.rs`). Each exposes `validate_at_creation`, `outcome_knowable` (the join lock) and `try_resolve`, checks owner
  and layout before a byte, reads options and strings through the bounds-checked `Cursor`, and is tested on real
  mainnet bytes; `shared.rs` holds the irreversible-fact table of TP §3.4.6 and row 3's minimum distance.
- `instructions/`: admin and team; `user_open_campaign` (the ten rows of TP §3.4.10); `user_join_campaign`;
  `resolve_campaign` (any wallet, top level only, never by CPI: YES, NO or Void into `InReview` with the review window);
  the team's window (`team_confirm_result`, `team_void_campaign`, `team_open_contest`, refused until Sprint 14); and
  settlement (Sprint 04): `tally_late_joins`, `finalize_campaign` (the snapshot), `settle_entry`,
  `settle_creator_share`, `collect_fee`, `settle_prize`, `close_campaign`, `sweep_fees`.
- `events/`: one event per instruction by self-CPI, signed by the `["__event_authority"]` PDA, with a contiguous `seq`
  per campaign. `error.rs`: codes from 6000, appended, never reused.
- Features: `drill` (devnet drill values), `mainnet` (refuses `drill` and `stake-at-least` at compile time),
  `stake-at-least` (opens `StakeAtLeast`; off in every build until a devnet YES is recorded).

**Client library** (`packages/sdk`, `@brot/sdk`): the one library the site, the app, the services, the scripts and the
tests import (A-6). `read`: constants, PDAs, account and event decoding with the decoder rules, the money math (a mirror
of `math/`, replaying the 24,000 Rust vectors of `tests/vectors/`), `validateOpenCampaign` and `checkJoin` (the
program's rules in its order), the opening quote and debit, `publicState` from chain time, `recheck`, one message per
error code (from the IDL). `tx`: the 22 builders, `simulate`, the deterministic summary and the A-3 preparation of a
join and an opening (`ok` only when the checks, the summary and the simulation all pass; a join's retry passes the saved
`expectedEntryTotal`, A-9). The summary reads the bytes the wallet signs (`summarizeMessage`): this program's
instructions as the IDL shapes them, compute-unit limits and prices with the priority fee bounded, and nothing else
trusted. `schemas`: zod, kept out of `read` and `tx` (React Native's Babel preset cannot bundle zod 4's
ESM). The Shank IDL and the Codama client are committed (`bun run idl`); the event table and the PDA seeds are written
by hand and checked against the program's source (`tests/sdk/contract-*.test.ts`). The test kit (`tests/brot/`) builds
its common flows with the SDK and decodes every event through it, while its hand-written layouts stay the independent
oracle that `tests/brot/idl.test.ts` checks against the IDL. `app/lib` is the old program's client, with its committed
IDL copy (`app/lib/idl`), used by the current app until Sprint 09; no script or test uses it.

**Frontend** (`app/`): Next.js App Router, Tailwind v4, wallet-adapter. The UI follows the approved design direction in
`docs/product/DESIGN-DIRECTION.md` (Ledger²: lab direction D in dark and N in light, consolidated in `prototype-lab/prototype-n/`,
with the Baked mascot), in the brand's colours of `docs/product/BRAND.md` §5 since 2026-10-10 (`app/styles/tokens.css`). The app still renders the earlier direction C ("Tape") until the design-system sprint (-1)
and the site sprints (09 to 13) replace it. A generic dashboard look was rejected. `app/AGENTS.md`
(loaded via `app/CLAUDE.md`) says this Next.js version has breaking changes: read `app/node_modules/next/dist/docs/`
before writing app code.

**In-app chat: removed in Sprint 09** (D-q, no AI in the new scope). `app/app/api/chat/route.ts`, `app/components/chat/`
and `app/lib/chat.ts` are gone, and `OPENROUTER_API_KEY` and `OPENROUTER_MODEL` are no longer read anywhere.

## Gotchas

- `@solana/kit` is pinned `~8.4.0` (Sprint 05: 8.4.0 first shipped with unpublished sub-packages; all 27 are published
  now). Kit's types pull in `@types/node`, so a TypeScript config without Node types still accepts `Buffer` and
  `process`: `scripts/sdk-portability.ts` asks the compiler where each name is declared instead.
- dependency-cruiser 18 needs Node 22+; it runs under Bun (`bunx --bun depcruise`), which CI already has. Never exclude
  `node_modules` in its config: a rule aimed at a package (zod, React, web3.js) would then never fire.
- The SDK's builders cannot encode an invalid enum byte (a side of 2, a direction of 3); a test of the program's own
  refusal of such bytes builds the instruction with the kit's raw builders (`tests/brot/instructions.ts`).
- Kit's RPC client parses every integer in a response as a bigint: an `InstructionError`'s instruction index arrives
  as `0n`, not `0`.
- A node writes `simulateTransaction`'s inner instructions with addresses (the System Program's parsed, any other
  partially decoded), not with indexes as `getTransaction` (`json`) does; the decoder reads both. A fake RPC must
  answer in the node's shape, or its test agrees with the code instead of with the cluster.
- After `resolve_campaign`, every baker of a campaign with entries needs `tally_late_joins` (its joins
  `joins_tallied..join_count`) before `team_confirm_result` or `finalize_campaign` (`NotTallied` otherwise), whatever
  the kind and outcome.
- `brot-markets` calls `sol_get_epoch_stake`, `sol_get_stack_height` and `sol_get_sysvar` through
  `pinocchio::syscalls`; it needs no `solana-epoch-stake` crate.
- `mollusk-svm` 0.15 and later and the `litesvm` crate 0.17 need Agave 4.3 crates, which declare Rust 1.97.1, above
  the pinned 1.89; `.cargo/config.toml` keeps `cargo update` on versions Rust 1.89 builds (`brot-markets` uses Mollusk
  0.14.0). Mollusk 0.14 injects epoch stake (`mollusk.epoch_stake`), which is how the `StakeAtLeast` YES is tested:
  LiteSVM's npm package and Surfpool both answer 0 to `sol_get_epoch_stake`.
- Rust tests need `--features no-entrypoint`: the Mollusk tests load the SBF binary, not the library's entrypoint.
- LiteSVM (npm) runs the instruction tests (no bankrun). It starts at a nonzero slot and the kit warps to slot 1, so a
  captured price account's posted slot is far ahead of the clock; the slot bound counts that as posted now. The app
  still uses `@anchor-lang/core` (never `@coral-xyz/anchor`) for the old program until Sprint 09.
- Pyth's `prev_publish_time` is Pythnet's previous aggregate (the publish time minus one second in every captured
  account), not the account's previous write; nothing reads it.
- Worktrees that share one `CARGO_TARGET_DIR` compile `brot-markets` to the same unit hash, so cargo can reuse another
  worktree's library: give each worktree its own target dir, or touch the sources before building (Sprint 03).
- Third-party account layouts (Pyth, SPL mints, stake pools, DAMM v2, vote accounts) are tested on real mainnet bytes in
  `tests/fixtures`, captured by `scripts/capture-fixtures.ts`. Re-run it after an upstream upgrade and read the diff.
  `index.json` records each file's SHA-256 and `tests/fixtures.test.ts` checks it, so never edit a `.bin` by hand.
  Read their fields by copying bytes at pinned offsets; Anchor discriminators are name-derived and collide across
  programs, so check the owner first.
- App code under `app/lib` runs in browsers: `import { Buffer } from "buffer"` (no global Buffer). The wallet-adapter
  stylesheet loads after `globals.css`, so overrides need extra specificity. Single-column mobile grids need
  `grid-cols-1`.
- Devnet slots are ~235 ms, not 400; derive slot counts from `getRecentPerformanceSamples`.
- Prettier `printWidth` is 120; Rust uses 4-space indent, everything else 2.

---

## Working method: AI Dev Operating System

This repository also carries the AI Dev Operating System (`.claude/rules`, `.claude/agents`, `.claude/skills`,
`.claude/commands`, `WIZARD.md`, `START-HERE.md`). It entered the OS with code already written, so the wizard's phases
are applied where they still add value rather than from zero. Phases 1 to 4 are done: BP v0.0.2 in `docs/business/`,
the prototype lab with fourteen directions and the approved one in `docs/product/DESIGN-DIRECTION.md`, the Product
Brief, the Technical Plan and the sprint roadmap. Phase 5 is under way: Sprints 00 and 01 are closed (tags `sprint-00`,
`sprint-01`), Sprint 02 is merged (PR #35, 2026-10-08; tag `sprint-02`), Sprint 03 is merged (PR #40, 2026-10-09;
tag `sprint-03`), Sprint 04 is merged (PR #41, 2026-10-09; tag `sprint-04`) and Sprint 05 is merged (PR #43,
2026-10-10; tag `sprint-05`). On 2026-10-08 BP v0.0.4 changed the product, and the Technical Plan and the
roadmap were rewritten in English from the approved architecture proposal 0.4; the Product Brief and the design
direction are still to be aligned. The pitch (wizard stage 2.9) is written in `docs/business/PITCH.md`; the founder's
own deck is served at `/pitch` by link only, and stays out of search engines until the founder approves the redaction
table there.

Golden rules carried over from the OS:

1. Do not code before context.
2. Keep documentation layers separate.
3. Preserve decision memory in `session-log/` and keep `CHANGELOG.md` current.
4. Use multi-agent review for hard-to-reverse decisions.
5. No invented facts in market, competitor, legal, pricing, or regulatory claims.
6. Use separation of concerns and keep code files under 200 lines where practical.
7. Use stable dependencies by default; avoid alpha/beta unless explicitly accepted.
8. End every reply to the founder with what was done, in plain Portuguese, and then the next steps: the possible
   paths tied to the roadmap, and one recommendation (`.claude/rules/interaction-closing.md`).

Checks the OS adds:

```bash
node scripts/os-self-test.js   # coherence of the OS inside this project
npm run test:os                # unit tests for the OS scripts and hooks
```

A `PreToolUse` hook blocks commits that look like they contain credentials (`.claude/hooks/block-secret-commit.js`).
