# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Provable KPI Markets on Solana (hackathon MVP, devnet, unaudited). A sponsor sells YES outcome tokens below face value
as a bounty on an on-chain goal; anyone resolves the market by reading the target account on-chain, instantly and
irreversibly. No oracle, indexer or dispute window. The README is the source of truth for the economics, lifecycle and
known limits; read it before changing program behavior.

Bun workspace (root + `app/`), one Anchor program (`programs/pred-provable`), Next.js frontend (`app/`).

## Commands

Bun is at `~/.bun/bin` and may not be on PATH in tool shells (`export PATH="$HOME/.bun/bin:$PATH"`). Anchor CLI must be
1.1.2, Solana CLI 3.1.x, Rust 1.89 (pinned by `rust-toolchain.toml`).

```bash
bun install
bun run build:program      # NO_DNA=1 anchor build, then copies the IDL into app/lib/idl (sync-idl)
bun run test               # bun test tests/  (TypeScript, LiteSVM, in-process; no validator)
bun run test:rust          # cargo test -p pred-provable --features no-entrypoint  (anchor-litesvm)
bun run lint               # prettier --check on tests/ and scripts/ only
cargo fmt --all -- --check
cargo clippy -p pred-provable --all-targets --features no-entrypoint -- -D warnings
bunx tsc --noEmit          # typecheck tests/scripts
bun run dev                # Next.js app (cp app/.env.example app/.env.local first)
cd app && bun run lint && bun run build
```

Single tests: `bun test tests/ -t "<describe or test name substring>"`; `cargo test -p pred-provable --features no-entrypoint <name>`.

Both test suites load `target/deploy/pred_provable.so`, so **run `anchor build` before testing** after any program change.
CI (`.github/workflows/ci.yml`) runs all of the above and fails if the committed IDL is stale.

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
`docs/product/DESIGN-DIRECTION.md` (direction C, "Tape": pixel-art scoreboard, markets as rows, progress in blocks, hard
edges, and the Baked mascot hopping between declared perches). A generic dashboard look was rejected. `app/AGENTS.md`
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
are applied where they still add value rather than from zero. Phase 3 (Protótipo) is done: `prototype-lab/` holds the
three directions and `docs/product/DESIGN-DIRECTION.md` records the approved one.

Golden rules carried over from the OS:

1. Do not code before context.
2. Keep documentation layers separate.
3. Preserve decision memory in `session-log/` and keep `CHANGELOG.md` current.
4. Use multi-agent review for hard-to-reverse decisions.
5. No invented facts in market, competitor, legal, pricing, or regulatory claims.
6. Use separation of concerns and keep code files under 200 lines where practical.
7. Use stable dependencies by default; avoid alpha/beta unless explicitly accepted.

Checks the OS adds:

```bash
node scripts/os-self-test.js   # coherence of the OS inside this project
npm run test:os                # unit tests for the OS scripts and hooks
```

A `PreToolUse` hook blocks commits that look like they contain credentials (`.claude/hooks/block-secret-commit.js`).
