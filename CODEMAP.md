# CODEMAP

Todo arquivo de código do projeto, com uma linha sobre o núcleo de cada um.

**Existe para a IA achar o arquivo certo sem ler todos.** Junto com o limite de 200 linhas de [`code-style`](.claude/rules/code-style.md), é o que mantém a leitura barata: arquivos curtos e um índice dizendo onde olhar.

> 🤖 **Gerado** por `node scripts/codemap.js`. Não edite à mão — a próxima geração sobrescreve. Para melhorar uma descrição, melhore o cabeçalho `Purpose:` do arquivo.

| | |
|---|---|
| Arquivos mapeados | **131** |
| Acima de 200 linhas | **30** ⚠️ |
| Sem cabeçalho `Purpose:` | **102** ⚠️ |

## ⚠️ Acima do limite de 200 linhas

A regra diz "under 200 lines where practical". Estes passaram — vale checar se dá pra separar:

- `app/components/market/trade-card.tsx` — 315 linhas
- `app/components/primitives.tsx` — 291 linhas
- `app/lib/hooks.ts` — 244 linhas
- `app/lib/idl/pred_provable.ts` — 3189 linhas
- `app/lib/instructions.ts` — 234 linhas
- `app/lib/market.ts` — 211 linhas
- `app/lib/mascot/engine.ts` — 302 linhas
- `app/lib/metric.ts` — 691 linhas
- `programs/pred-provable/src/resolver.rs` — 733 linhas
- `programs/pred-provable/tests/burn_goal.rs` — 219 linhas
- `prototype-lab/prototype-b/view.js` — 265 linhas
- `prototype-lab/prototype-e/view.js` — 258 linhas
- `prototype-lab/prototype-g/view.js` — 219 linhas
- `prototype-lab/prototype-i/view.js` — 213 linhas
- `prototype-lab/prototype-j/view.js` — 216 linhas
- `prototype-lab/shared/app.js` — 246 linhas
- `prototype-lab/shared/ledger.js` — 238 linhas
- `prototype-lab/shared/mascot.js` — 379 linhas
- `prototype-lab/shared/mock-data.js` — 290 linhas
- `scripts/codemap.js` — 222 linhas
- `scripts/devnet-seed.ts` — 246 linhas
- `scripts/devnet-smoke.ts` — 273 linhas
- `scripts/devnet.ts` — 222 linhas
- `scripts/os-self-test.js` — 406 linhas
- `scripts/sync-selfhosted.js` — 349 linhas
- `scripts/test/hooks.test.js` — 278 linhas
- `scripts/tokenomics-model.ts` — 584 linhas
- `target/types/pred_provable.ts` — 3189 linhas
- `tests/helpers.ts` — 424 linhas
- `tests/pred-provable.test.ts` — 2799 linhas

---

## `.claude/hooks/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`block-secret-commit.js`](.claude/hooks/block-secret-commit.js) | turn golden rule #9 ("never hardcode secrets") from a request into a guarantee. The `secrets-scan` skill finds leaks when invoked; this stops them at the commit | 179 |
| [`lint-on-edit.js`](.claude/hooks/lint-on-edit.js) | close the feedback loop at the edit instead of at the CI. Without this, the agent learns about a lint or format error one push later, from a red check | 99 |
| [`protect-env-files.js`](.claude/hooks/protect-env-files.js) | the OS position is that real secrets live in the user's local environment and the agent maintains `.env.example` instead. This enforces that split | 72 |

## `app/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`eslint.config.mjs`](app/eslint.config.mjs) | Override default ignores of eslint-config-next | 19 |
| [`next.config.ts`](app/next.config.ts) | ⚠️ sem cabeçalho — adicione purpose/version/sprint | 8 |
| [`postcss.config.mjs`](app/postcss.config.mjs) | ⚠️ sem cabeçalho — adicione purpose/version/sprint | 8 |

## `app/app/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`layout.tsx`](app/app/layout.tsx) | ⚠️ sem cabeçalho — adicione purpose/version/sprint | 56 |
| [`page.tsx`](app/app/page.tsx) | HomeView reads the search params (query, category, tab), which needs a Suspense boundary | 13 |

## `app/app/api/chat/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`route.ts`](app/app/api/chat/route.ts) | Server-only: the OpenRouter key never reaches the browser. Streams the model's reply as plain text | 123 |

## `app/app/markets/[address]/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`page.tsx`](app/app/markets/[address]/page.tsx) | `?side=no` comes from the No box on a market card | 33 |

## `app/components/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`activity-feed.tsx`](app/components/activity-feed.tsx) | ⚠️ sem cabeçalho — adicione purpose/version/sprint | 63 |
| [`cell-field.tsx`](app/components/cell-field.tsx) | Background grid: cells light up under the pointer and fade out in steps. One fixed canvas, | 68 |
| [`mascot.tsx`](app/components/mascot.tsx) | Mounts the mascot once for the whole app. Each page decides where it may stand with | 31 |
| [`price-chart.tsx`](app/components/price-chart.tsx) | ⚠️ sem cabeçalho — adicione purpose/version/sprint | 167 |
| [`primitives.tsx`](app/components/primitives.tsx) | Building blocks shared by the home page and the market page, in the "Tape" direction: | 291 |
| [`providers.tsx`](app/components/providers.tsx) | Phantom and Solflare are always listed (with an install link when missing); any other | 27 |
| [`site-header.tsx`](app/components/site-header.tsx) | ⚠️ sem cabeçalho — adicione purpose/version/sprint | 98 |
| [`tape-context.tsx`](app/components/tape-context.tsx) | What the ticker shows: the markets the current page has already loaded. Pages publish their | 32 |
| [`ticker.tsx`](app/components/ticker.tsx) | The tape across the top: cluster status, then the markets the page has loaded scrolling past, | 60 |
| [`toast.tsx`](app/components/toast.tsx) | ⚠️ sem cabeçalho — adicione purpose/version/sprint | 71 |
| [`wallet-button.tsx`](app/components/wallet-button.tsx) | The wallet button reads window state, so it must not render on the server | 25 |

## `app/components/chat/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`chat.tsx`](app/components/chat/chat.tsx) | ⚠️ sem cabeçalho — adicione purpose/version/sprint | 193 |

## `app/components/home/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`browse.tsx`](app/components/home/browse.tsx) | ⚠️ sem cabeçalho — adicione purpose/version/sprint | 185 |
| [`featured.tsx`](app/components/home/featured.tsx) | ⚠️ sem cabeçalho — adicione purpose/version/sprint | 135 |
| [`hero-meter.tsx`](app/components/home/hero-meter.tsx) | The hero's meter: the market with the most at stake, read live. A quantity goal shows the | 72 |
| [`home-view.tsx`](app/components/home/home-view.tsx) | The market with the most at stake leads the page | 75 |
| [`market-tile.tsx`](app/components/home/market-tile.tsx) | ⚠️ sem cabeçalho — adicione purpose/version/sprint | 91 |
| [`sidebar.tsx`](app/components/home/sidebar.tsx) | ⚠️ sem cabeçalho — adicione purpose/version/sprint | 92 |

## `app/components/market/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`chart-card.tsx`](app/components/market/chart-card.tsx) | ⚠️ sem cabeçalho — adicione purpose/version/sprint | 130 |
| [`details.tsx`](app/components/market/details.tsx) | ⚠️ sem cabeçalho — adicione purpose/version/sprint | 142 |
| [`market-view.tsx`](app/components/market/market-view.tsx) | A stable array, or publishing it would re-render this view in a loop | 182 |
| [`position-card.tsx`](app/components/market/position-card.tsx) | ⚠️ sem cabeçalho — adicione purpose/version/sprint | 121 |
| [`proof-card.tsx`](app/components/market/proof-card.tsx) | ⚠️ sem cabeçalho — adicione purpose/version/sprint | 176 |
| [`trade-card.tsx`](app/components/market/trade-card.tsx) | ⚠️ sem cabeçalho — adicione purpose/version/sprint | 315 |

## `app/lib/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`brand.ts`](app/lib/brand.ts) | Product name and copy in one place. The name is provisional (see docs/product/DESIGN-DIRECTION.md): | 35 |
| [`chat.ts`](app/lib/chat.ts) | Shared by the chat widget and the chat route: message shape, limits and the market summary | 59 |
| [`config.ts`](app/lib/config.ts) | ⚠️ sem cabeçalho — adicione purpose/version/sprint | 10 |
| [`format.ts`](app/lib/format.ts) | Display formatting for base-unit amounts, prices and slot-based times. Framework-free | 74 |
| [`history.ts`](app/lib/history.ts) | Price history and activity from the program's events: signatures for an address, the transactions, | 138 |
| [`hooks.ts`](app/lib/hooks.ts) | ⚠️ sem cabeçalho — adicione purpose/version/sprint | 244 |
| [`instructions.ts`](app/lib/instructions.ts) | Instruction builders with the exact account lists the program expects. The devnet smoke test | 234 |
| [`market.ts`](app/lib/market.ts) | Framework-free client helpers for pred-provable: addresses, the program's integer math, event | 211 |
| [`metric.ts`](app/lib/metric.ts) | Reads a market's KPI the way the program's resolver does (same owners, layouts and comparisons), | 691 |
| [`program.ts`](app/lib/program.ts) | Synced from target/ by `bun run sync-idl` after `anchor build` | 19 |
| [`tokens.ts`](app/lib/tokens.ts) | Token names from Metaplex metadata, so markets on real tokens read "$BONK" instead of an address | 47 |
| [`view.ts`](app/lib/view.ts) | How the app reads a market account: kind, status, phase and price. Framework-free | 155 |

## `app/lib/idl/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`pred_provable.ts`](app/lib/idl/pred_provable.ts) | Program IDL in camelCase format in order to be used in JS/TS | 3189 |

## `app/lib/mascot/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`engine.ts`](app/lib/mascot/engine.ts) | Baked, the mascot, as a page resident. It does not follow the cursor freely: it hops to the | 302 |
| [`perches.ts`](app/lib/mascot/perches.ts) | Where the mascot may stand. A page declares perches as data attributes on any element: | 65 |

## `packages/sdk/src/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`index.ts`](packages/sdk/src/index.ts) | public entry of the Brot Markets client library, shared by the site, the services, the scripts and the tests. Must stay free of React and Next imports | 22 |

## `packages/sdk/src/idl/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`brot_markets.ts`](packages/sdk/src/idl/brot_markets.ts) | Program IDL in camelCase format in order to be used in JS/TS | 130 |

## `programs/brot-markets/src/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`constants.rs`](programs/brot-markets/src/constants.rs) | seeds, the collateral mint and the hard limits compiled into the program | 57 |
| [`error.rs`](programs/brot-markets/src/error.rs) | every failure the program can return, one code per cause | 18 |
| [`events.rs`](programs/brot-markets/src/events.rs) | Anchor events, one per instruction; the indexer rebuilds history from them | 6 |
| [`lib.rs`](programs/brot-markets/src/lib.rs) | entry point of the Brot Markets program; declares the program id and wires the modules | 24 |

## `programs/brot-markets/src/instructions/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`mod.rs`](programs/brot-markets/src/instructions/mod.rs) | instruction handlers, one file each, grouped by feature (Sprint 02 onwards) | 6 |

## `programs/brot-markets/src/math/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`mod.rs`](programs/brot-markets/src/math/mod.rs) | money and schedule math: fees, payout, betting cutoff, invariants (Sprints 02 and 04) | 6 |

## `programs/brot-markets/src/readers/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`cursor.rs`](programs/brot-markets/src/readers/cursor.rs) | bounds-checked little-endian reads over raw account data, for the readers. An account shorter than its layout is an error, never a panic | 56 |
| [`mod.rs`](programs/brot-markets/src/readers/mod.rs) | on-chain readers that turn an account into a yes/no answer, ported from pred-provable (Sprint 03) | 10 |
| [`price_touch.rs`](programs/brot-markets/src/readers/price_touch.rs) | read a Pyth `PriceUpdateV2` account into a price, checking who wrote it and how well it was verified. The base of the "price of a large asset" question type | 87 |

## `programs/brot-markets/src/state/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`mod.rs`](programs/brot-markets/src/state/mod.rs) | account layouts: config, cap, question, position (Sprint 02) | 6 |

## `programs/brot-markets/tests/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`price_reader.rs`](programs/brot-markets/tests/price_reader.rs) | the price reader against real Pyth accounts captured from devnet, and against the malformed versions of them. A wrong account must be an error, never a panic | 128 |

## `programs/pred-provable/src/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`constants.rs`](programs/pred-provable/src/constants.rs) | [constant] | 72 |
| [`error.rs`](programs/pred-provable/src/error.rs) | [error_code] | 54 |
| [`events.rs`](programs/pred-provable/src/events.rs) | ! Events for clients: every state change logs one, so an activity feed or price history | 103 |
| [`instructions.rs`](programs/pred-provable/src/instructions.rs) | ⚠️ sem cabeçalho — adicione purpose/version/sprint | 22 |
| [`lib.rs`](programs/pred-provable/src/lib.rs) | [program] | 83 |
| [`outcome.rs`](programs/pred-provable/src/outcome.rs) | ! Outcome-token and USDC plumbing shared by the sale, the pair instructions, the pool and payouts | 130 |
| [`resolver.rs`](programs/pred-provable/src/resolver.rs) | ! Typed metric readers. Each reader checks the account owner and layout before | 733 |
| [`state.rs`](programs/pred-provable/src/state.rs) | / Closed set of resolvers. Each variant fixes the owner and layout of the account | 106 |

## `programs/pred-provable/src/instructions/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`add_liquidity.rs`](programs/pred-provable/src/instructions/add_liquidity.rs) | [derive(Accounts)] | 145 |
| [`burn_pair.rs`](programs/pred-provable/src/instructions/burn_pair.rs) | [derive(Accounts)] | 69 |
| [`buy_yes.rs`](programs/pred-provable/src/instructions/buy_yes.rs) | [derive(Accounts)] | 88 |
| [`create_market.rs`](programs/pred-provable/src/instructions/create_market.rs) | [derive(AnchorSerialize, AnchorDeserialize, Clone)] | 139 |
| [`mint_pair.rs`](programs/pred-provable/src/instructions/mint_pair.rs) | [derive(Accounts)] | 74 |
| [`redeem.rs`](programs/pred-provable/src/instructions/redeem.rs) | [derive(Accounts)] | 80 |
| [`remove_liquidity.rs`](programs/pred-provable/src/instructions/remove_liquidity.rs) | [derive(Accounts)] | 111 |
| [`resolve.rs`](programs/pred-provable/src/instructions/resolve.rs) | / Permissionless. YES holders are the ones with the incentive to call it, so there is no resolver fee | 73 |
| [`swap.rs`](programs/pred-provable/src/instructions/swap.rs) | [derive(Accounts)] | 128 |
| [`withdraw_budget.rs`](programs/pred-provable/src/instructions/withdraw_budget.rs) | [derive(Accounts)] | 60 |

## `programs/pred-provable/tests/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`burn_goal.rs`](programs/pred-provable/tests/burn_goal.rs) | ! Rust-side smoke test with anchor-litesvm. Run `anchor build` first; the .so is embedded | 219 |

## `prototype-lab/prototype-a/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`view.js`](prototype-lab/prototype-a/view.js) | Direction A · Ledger. Templates and effects; state and wiring live in ../shared/app.js | 152 |

## `prototype-lab/prototype-b/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`view.js`](prototype-lab/prototype-b/view.js) | Direction B · Oven. Templates and effects; state and wiring live in ../shared/app.js | 265 |

## `prototype-lab/prototype-c/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`view.js`](prototype-lab/prototype-c/view.js) | Direction C · Tape. Templates and effects; state and wiring live in ../shared/app.js | 184 |

## `prototype-lab/prototype-d/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`view.js`](prototype-lab/prototype-d/view.js) | Direction D · Ledger² (A's look on the mosaic wireframe). Templates and effects; state and wiring live in ../shared/app.js | 181 |

## `prototype-lab/prototype-e/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`view.js`](prototype-lab/prototype-e/view.js) | Direction E · Oven² (B's look on the mosaic wireframe). Templates and effects; state and wiring live in ../shared/app.js | 258 |

## `prototype-lab/prototype-f/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`view.js`](prototype-lab/prototype-f/view.js) | Direction F · Tape² (C's look on the mosaic wireframe). Templates and effects; state and wiring live in ../shared/app.js | 200 |

## `prototype-lab/prototype-g/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`view.js`](prototype-lab/prototype-g/view.js) | Direction G · Casino (the gambling register on the mosaic wireframe). Templates and effects; state and wiring live in ../shared/app.js | 219 |

## `prototype-lab/prototype-h/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`view.js`](prototype-lab/prototype-h/view.js) | Direction H · Prism (Ledger's desk in glass, on the mosaic wireframe). Templates and effects; state and wiring live in ../shared/app.js | 195 |

## `prototype-lab/prototype-i/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`view.js`](prototype-lab/prototype-i/view.js) | Direction I · Blocks (Tape read as a block explorer, on the mosaic wireframe). Templates and effects; state and wiring live in ../shared/app.js | 213 |

## `prototype-lab/prototype-j/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`view.js`](prototype-lab/prototype-j/view.js) | Direction J · Orbit (Ledger's cards and Tape's blocks around a 3D outcome coin, on the mosaic wireframe). Templates and effects; state and wiring live in ../sha | 216 |

## `prototype-lab/prototype-k/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`view.js`](prototype-lab/prototype-k/view.js) | Direction K · Desk (Ledger² for a full-time trader). Only what K adds lives here: the Ledger² blocks come from ../shared/ledger.js | 100 |

## `prototype-lab/prototype-l/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`view.js`](prototype-lab/prototype-l/view.js) | Direction L · Arena (Ledger² as a place to discover markets). Only what L adds lives here: the Ledger² blocks come from ../shared/ledger.js | 90 |

## `prototype-lab/prototype-m/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`view.js`](prototype-lab/prototype-m/view.js) | Direction M · Vault (Ledger² seen from a connected wallet). Only what M adds lives here: the Ledger² blocks come from ../shared/ledger.js | 131 |

## `prototype-lab/prototype-n/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`view.js`](prototype-lab/prototype-n/view.js) | D's templates (from ../shared/ledger.js) plus the light/dark switch. Nothing else is new | 51 |

## `prototype-lab/shared/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`app.js`](prototype-lab/shared/app.js) | Shared prototype logic: state, filtering, routing and event wiring. No markup lives here: | 246 |
| [`ledger.js`](prototype-lab/shared/ledger.js) | Ledger² building blocks shared by directions K, L and M: prototype-d's templates and effects, | 238 |
| [`mascot.js`](prototype-lab/shared/mascot.js) | Baked, the mascot, as a page resident | 379 |
| [`mock-data.js`](prototype-lab/shared/mock-data.js) | Mock data shared by the three prototype directions. Synthetic values only: nothing here is read | 290 |
| [`mosaic.js`](prototype-lab/shared/mosaic.js) | The home mosaic used by directions D–G: a carousel of trading markets on the left, then | 64 |
| [`shader.js`](prototype-lab/shared/shader.js) | Fullscreen WebGPU fragment shader on a canvas, with a caller-supplied Canvas 2D fallback | 108 |

## `scripts/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`capture-fixtures.ts`](scripts/capture-fixtures.ts) | capture real on-chain accounts into tests/fixtures, so the reader tests decode the bytes third-party programs actually write instead of a layout someone typed f | 121 |
| [`ci-secret-scan.js`](scripts/ci-secret-scan.js) | the pre-commit hook only protects commits made on a machine that has it wired. This scans every line a branch adds relative to its base, with the same patterns | 74 |
| [`codemap.js`](scripts/codemap.js) | let an AI locate the right file without reading every file. Pairs with the 200-line limit in .claude/rules/code-style.md — small files plus a one-line index mea | 222 |
| [`detach-os.ps1`](scripts/detach-os.ps1) | detach-os.ps1 — desconecta seu projeto do repositório AI Dev Operating System | 161 |
| [`detach-os.sh`](scripts/detach-os.sh) | detach-os.sh — desconecta seu projeto do repositório AI Dev Operating System | 157 |
| [`devnet-seed.ts`](scripts/devnet-seed.ts) | Seeds devnet with demo markets for the app, on named tokens (Metaplex metadata) so they read like | 246 |
| [`devnet-smoke.ts`](scripts/devnet-smoke.ts) | Devnet smoke test: the full USDC lifecycle against the deployed program, with the client stack | 273 |
| [`devnet.ts`](scripts/devnet.ts) | Shared setup for the devnet scripts: connection, deployer, Anchor client, sending, and the raw SPL | 222 |
| [`extract-external-links.sh`](scripts/extract-external-links.sh) | ⚠️ sem cabeçalho — adicione purpose/version/sprint | 16 |
| [`init-project.ps1`](scripts/init-project.ps1) | ⚠️ sem cabeçalho — adicione purpose/version/sprint | 34 |
| [`init-project.sh`](scripts/init-project.sh) | ⚠️ sem cabeçalho — adicione purpose/version/sprint | 25 |
| [`instruction-drift.js`](scripts/instruction-drift.js) | catch references in instruction files (CLAUDE.md, templates, skills, agents, WIZARD) to agents, commands and wizard stages that do not exist, and model generati | 157 |
| [`os-self-test.js`](scripts/os-self-test.js) | the `os-self-test` skill did this, but only when a human or a model remembered to invoke it — and three session logs record it NOT being run when it would have  | 406 |
| [`pre-commit.js`](scripts/pre-commit.js) | the PreToolUse gate only sees commits Claude makes. A commit from a terminal or an editor skipped it entirely. This runs the same scan from git itself | 76 |
| [`release-v0.2.0.ps1`](scripts/release-v0.2.0.ps1) | Release helper for AI Dev Operating System v0.2.0 | 11 |
| [`release-v0.2.0.sh`](scripts/release-v0.2.0.sh) | ⚠️ sem cabeçalho — adicione purpose/version/sprint | 16 |
| [`run-tests.js`](scripts/run-tests.js) | give `npm test` a file list that does not depend on the shell. npm runs scripts through cmd.exe on Windows, which does not expand globs, and Node only learned t | 33 |
| [`sensor-wiring.js`](scripts/sensor-wiring.js) | verify the repo has a standard test entry point, a linter with its config, a lockfile, a feedback hook, a git pre-commit, and a CI that actually runs them. The  | 121 |
| [`sync-selfhosted.js`](scripts/sync-selfhosted.js) | keep a local, navigable mirror of the full self-hosted catalogue so the WIZARD (stage 4.2) can offer self-hosted alternatives without a network call | 349 |
| [`tokenomics-model.ts`](scripts/tokenomics-model.ts) | Quantitative model behind ECONOMICS.md: protocol fees, revenue split, staker yield, the token unlock curve and the | 584 |

## `scripts/test/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`codemap.test.js`](scripts/test/codemap.test.js) | pin the header-extraction behaviour, because the quality of the whole map depends on it — a bad describe() produces a map that reads plausibly and points nowher | 169 |
| [`hooks.test.js`](scripts/test/hooks.test.js) | hooks.test.js — unit tests for the PreToolUse gates and the PostToolUse feedback hook | 278 |
| [`instruction-drift.test.js`](scripts/test/instruction-drift.test.js) | pin what counts as a dangling reference and what does not, because a noisy check gets switched off and a silent one lets the template's dead command table survi | 142 |
| [`pre-commit.test.js`](scripts/test/pre-commit.test.js) | prove the hook stops a staged credential in a real git repository, and gets out of the way everywhere else | 95 |
| [`sensor-wiring.test.js`](scripts/test/sensor-wiring.test.js) | pin the two severities — a missing sensor is an error in the OS repo and a warning in a derived project — and the "exists but never gates" class | 140 |
| [`sync-selfhosted.test.js`](scripts/test/sync-selfhosted.test.js) | ⚠️ sem cabeçalho — adicione purpose/version/sprint | 146 |

## `target/types/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`brot_markets.ts`](target/types/brot_markets.ts) | Program IDL in camelCase format in order to be used in JS/TS | 130 |
| [`pred_provable.ts`](target/types/pred_provable.ts) | Program IDL in camelCase format in order to be used in JS/TS | 3189 |

## `tests/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`helpers.ts`](tests/helpers.ts) | Only for the fixture names; the file itself is read at run time by `loadFixture` | 424 |
| [`pred-provable.test.ts`](tests/pred-provable.test.ts) | ⚠️ sem cabeçalho — adicione purpose/version/sprint | 2799 |

---

## Manutenção

Regenere sempre que criar, remover ou renomear arquivo de código:

```bash
node scripts/codemap.js
```

O CI roda `node scripts/codemap.js --check` e **falha se este arquivo estiver desatualizado**. Um codemap velho é pior que nenhum: a IA confia nele e pula a leitura.
