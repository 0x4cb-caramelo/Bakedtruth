# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Brot Markets**, a pot-based prediction market on Solana (devnet, unaudited), being rebuilt in this repository.

The code it grew from is `pred-provable`, "Provable KPI Markets": a sponsor sells YES outcome tokens below face value
as a bounty on an on-chain goal, and anyone resolves the market by reading the target account on-chain. That program
is frozen. What carries over is its way of resolving: typed reads of on-chain accounts, with no opinion oracle. The
README still describes the old economics and stays as the record of the upstream program. It is no longer the source
of truth for the product; the next section says what is.

Bun workspace (root, `app/`, `packages/*`, `services/*`), two Anchor programs (`programs/brot-markets`, new, and
`programs/pred-provable`, frozen), Next.js frontend (`app/`).

## State of the rewrite (read this before the rest)

The product is being rebuilt as **Brot Markets**: a pot-based prediction market. People bet USDC on YES or NO, the
winners split the pot, the house keeps 10% of the losing side, and there are no outcome tokens, no pool and no early
exit. The sections below still describe the earlier program (`programs/pred-provable`, sponsor-subsidised YES
tokens), which is **frozen**: it stays in the workspace only until its readers are ported.

- What to build: `docs/product/PRODUCT-BRIEF.md`. How: `docs/technical/TECHNICAL-PLAN.md`. In what order:
  `docs/SPRINTS.md` and `docs/sprints/`. Why: `docs/business/BUSINESS-PLAN.md`. The founder's answers in
  `docs/business/ideacao-perguntas-e-respostas.md` outrank the README and the old code.
- The new program is `programs/brot-markets` (id `6G2d7Cv66MR1NayPabh5aL6ZThTx15WPxL3NU4N24uVN`). After Sprint 01
  it still has no instruction. It has one reader, `readers/price_touch.rs`, which parses a Pyth `PriceUpdateV2`
  of a feed the caller must name, and is called by nothing until Sprint 03. Its client library is `packages/sdk`; `app/lib` moves there in Sprint 05.
- `services/landing` is the provisional `brot.markets` site: a "coming soon" page with a waitlist, a privacy page and
  the pitch deck under the `pitch/` path. Plain Node, no dependencies, its own tests (`node --test services/landing/tests/*.test.mjs`).
  It stores emails, so read section 8.1 of the technical plan before changing what it keeps. It goes away in Sprint 09.
- Pyth has two generations of programs on Solana. Its documentation dates the Core upgrade 2026-08-26; the upgraded
  programs have been on-chain since 2026-05-05. The reader trusts only the upgraded
  receiver (`rec2HH...`), and the price service (Hermes) now needs an API key. Addresses, layout, cadence and
  sources: `knowledge-base/tecnologia/pyth-leitor-de-preco.md`. Read it before touching the price reader.
- New program code follows the house rules: one instruction and one reader per file, under 200 lines, a
  `Purpose:` header, checked math (clippy denies unchecked arithmetic and truncating casts in that crate), and
  `init-if-needed` off unless an instruction justifies it.
- The program is built in CI, never on the shared server. A machine without the pinned toolchain takes the
  generated IDL from the `idl-preview-<run id>` artifact of a pull-request run and commits it.
- `gh` resolves to the upstream repository here. Pass `--repo 0x4cb-caramelo/Bakedtruth` on every `gh` command.

## Commands

Bun is at `~/.bun/bin` and may not be on PATH in tool shells (`export PATH="$HOME/.bun/bin:$PATH"`). Anchor CLI must be
1.1.2, Solana CLI 3.1.x, Rust 1.89 (pinned by `rust-toolchain.toml`).

```bash
bun install
bun run build:program      # NO_DNA=1 anchor build (both programs), then sync-idl: app/lib/idl and packages/sdk/src/idl
bun run test               # bun test tests/  (TypeScript, LiteSVM, in-process; no validator)
bun run test:rust          # cargo test for pred-provable and brot-markets, --features no-entrypoint
bun run lint               # prettier --check on tests/, scripts/ and packages/
cargo fmt --all -- --check
cargo clippy --locked -p pred-provable --all-targets --features no-entrypoint -- -D warnings
cargo clippy --locked -p brot-markets --all-targets --features no-entrypoint -- -D warnings
cargo clippy --locked -p brot-markets --all-targets --features no-entrypoint,mainnet -- -D warnings
node scripts/codemap.js --check && node scripts/ci-secret-scan.js origin/main
bunx tsc --noEmit          # typecheck tests/scripts
bun run dev                # Next.js app (cp app/.env.example app/.env.local first)
cd app && bun run lint && bun run build
```

Single tests: `bun test tests/ -t "<describe or test name substring>"`; `cargo test -p pred-provable --features no-entrypoint <name>`.

Both test suites load `target/deploy/pred_provable.so`, so **run `anchor build` before testing** after any program change.
CI (`.github/workflows/ci.yml`) runs all of the above and fails if a committed IDL or `CODEMAP.md` is stale, if
`Cargo.lock` disagrees with the manifests, or if the branch adds something shaped like a credential.

Devnet: `deploy:devnet`, `smoke:devnet` (full USDC lifecycle with the app's client stack), `seed:devnet` (demo markets).
Scripts use `~/.config/solana/pred-provable-devnet.json` (`DEVNET_WALLET`, `DEVNET_RPC_URL` override).

## Architecture

**Program** (`programs/pred-provable/src`):
- `state.rs`: `Market` is the single account holding everything, including sale budget, `sponsor_no`, and the guarded
  pool's reserves (`pool_yes`/`pool_no`). Pool reserves and `sponsor_no` are *bookkept balances*, not read from token
  accounts, on purpose (hand-sent tokens must not move price; the sponsor must not be able to burn its NO early).
- Invariants while open: `yes_supply == no_supply + sponsor_no` and `vault == budget + yes_supply`. A randomized test
  checks these after every operation; preserve them in any new instruction.
- `resolver.rs`: closed `ResolverKind` enum (no generic offset reader, deliberately rejected). Each variant checks the
  owner/layout of its `metric_account`, which is locked at creation. Only irreversible or epoch-lagged metrics: nothing a
  flash loan can move (pool reserves and live TVL were rejected on purpose; `RESOLVERS.md` has the reasoning, every
  verified third-party layout and the roadmap). Variants are Borsh-tagged by position: append, never reorder. Layouts
  with options or strings are read through the bounds-checked `Cursor`, never by slicing. Also holds
  `require_trading_open`, the anti-sniping guard used by `buy_yes`, `add_liquidity` and `swap` (not by
  `remove_liquidity`, which is always open).
- `outcome.rs`: market-PDA-signed minting/transfers of YES/NO/LP tokens and USDC vault deposits/payouts. All collateral
  moves use `transfer_checked`. Collateral mint is `USDC_MINT` (devnet Circle USDC by default; `--features mainnet`
  swaps it), exported in the IDL.
- `resolve` is permissionless, top-level only (rejects CPI), and final in one instruction.
- Vault is a program-owned token account PDA `["vault", market]`, not an ATA (avoids pre-creation griefing). Don't make
  one party's instruction depend on another party's ATA: classic SPL Token lets an ATA owner reassign it.
- `events.rs`: every instruction emits one Anchor event; the app builds activity and price history from
  `getSignaturesForAddress` + `decodeEvents`, no indexer.

**Client library** (`app/lib`): `market.ts` (PDAs, quotes, `decodeEvents`) is framework-free and imported by both the
app *and* the test suite (`tests/helpers.ts`), so tests exercise the exact math/addresses the UI uses. `instructions.ts`,
`metric.ts`, `view.ts`, `format.ts`, `history.ts`, `hooks.ts` are also shared with `scripts/devnet-*.ts`. Keep these
free of React/Next imports where they are used by scripts or tests.

**IDL flow**: `target/idl` and `target/types` are committed (gitignore re-includes them) and copied to `app/lib/idl`.
Program signature changes require `bun run build:program` and committing the regenerated files.

**Frontend** (`app/`): Next.js App Router, Tailwind v4, wallet-adapter. The UI follows the approved design direction in
`docs/product/DESIGN-DIRECTION.md` (Ledger²: lab direction D in dark and N in light, consolidated in `prototype-lab/prototype-n/`,
with the Baked mascot). The app still renders the earlier direction C ("Tape") until the design-system sprint (-1)
and the site sprints (09 to 13) replace it. A generic dashboard look was rejected. `app/AGENTS.md`
(loaded via `app/CLAUDE.md`) says this Next.js version has breaking changes: read `app/node_modules/next/dist/docs/`
before writing app code.

**In-app chat** (`app/app/api/chat/route.ts`, `app/components/chat/chat.tsx`, `app/lib/chat.ts`): a read-only explainer
that streams from OpenRouter (`OPENROUTER_API_KEY`, optional `OPENROUTER_MODEL`, server-only in `app/.env.local`). The
market page feeds it a text summary through `useChatContext`. It cannot sign or trade. The per-IP rate limit is
in-memory, so a multi-instance deploy needs a shared store.

## Gotchas

- `@solana/kit` is pinned `~8.3.0` (8.4.0 shipped with unpublished sub-packages); re-check before bumping.
- `solana-epoch-stake` must stay `=3.0.0` (3.0.1 pulls solana-pubkey 4, mismatching anchor-lang 1.1.x).
- Rust tests need `--features no-entrypoint` (spl-token's `entrypoint` symbol collides at link).
- Keep `anchor-spl` default features: Anchor's `mint::`/`associated_token::` codegen needs `token_interface` even for
  classic SPL Token.
- Use `@anchor-lang/core` (never `@coral-xyz/anchor`) and LiteSVM (no bankrun). LiteSVM starts at a nonzero slot; tests
  warp to slot 1 and use absolute cutoff/deadline slots. Anchor 1.x decoded account/enum names are PascalCase.
- LiteSVM cannot inject epoch stake (`sol_get_epoch_stake` returns 0), so `StakeAtLeast` YES is only testable on a real
  cluster.
- The incinerator is not a lock: SPL Token lets anyone burn from, or close when empty, token accounts owned by the
  incinerator or the system program. `LockedAtLeast` therefore reads the ATA of the program's `["lock"]` PDA. Injecting
  token accounts with `setTokenAccount` hides this kind of bug; use the real Token program for behavior tests.
- Third-party account layouts (stake pool, DAMM v2, Token Metadata) are tested on real mainnet bytes in
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
`sprint-01`) and Sprint 02 is next. The pitch (wizard stage 2.9) is written in `docs/business/PITCH.md`; the founder's
own deck is served at `/pitch` by link only, and stays out of search engines until he approves the redaction table there.

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
