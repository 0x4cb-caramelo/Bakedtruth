# CODEMAP

Todo arquivo de código do projeto, com uma linha sobre o núcleo de cada um.

**Existe para a IA achar o arquivo certo sem ler todos.** Junto com o limite de 200 linhas de [`code-style`](.claude/rules/code-style.md), é o que mantém a leitura barata: arquivos curtos e um índice dizendo onde olhar.

> 🤖 **Gerado** por `node scripts/codemap.js`. Não edite à mão — a próxima geração sobrescreve. Para melhorar uma descrição, melhore o cabeçalho `Purpose:` do arquivo.

| | |
|---|---|
| Arquivos mapeados | **434** |
| Acima de 200 linhas | **48** ⚠️ |
| Sem cabeçalho `Purpose:` | **80** ⚠️ |

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
- `programs/brot-markets/src/error.rs` — 328 linhas
- `programs/brot-markets/src/instructions/campaigns/open_campaign.rs` — 210 linhas
- `programs/brot-markets/src/instructions/entries/join_campaign.rs` — 212 linhas
- `programs/brot-markets/src/instructions/interface.rs` — 216 linhas
- `programs/brot-markets/src/math/snapshot.rs` — 208 linhas
- `programs/brot-markets/tests/price_stale_feed.rs` — 201 linhas
- `programs/brot-markets/tests/settle_host_finalize.rs` — 236 linhas
- `prototype-lab/prototype-b/view.js` — 265 linhas
- `prototype-lab/prototype-e/view.js` — 258 linhas
- `prototype-lab/prototype-g/view.js` — 219 linhas
- `prototype-lab/prototype-i/view.js` — 213 linhas
- `prototype-lab/prototype-j/view.js` — 216 linhas
- `prototype-lab/shared/app.js` — 246 linhas
- `prototype-lab/shared/ledger.js` — 238 linhas
- `prototype-lab/shared/mascot.js` — 379 linhas
- `prototype-lab/shared/mock-data.js` — 290 linhas
- `scripts/codemap.js` — 223 linhas
- `scripts/devnet-clock-probe.ts` — 201 linhas
- `scripts/devnet-seed.ts` — 246 linhas
- `scripts/devnet-smoke.ts` — 273 linhas
- `scripts/devnet.ts` — 222 linhas
- `scripts/os-self-test.js` — 406 linhas
- `scripts/pyth-sponsored-feeds.ts` — 201 linhas
- `scripts/slot-matrix-spec.ts` — 272 linhas
- `scripts/sync-selfhosted.js` — 349 linhas
- `scripts/test/hooks.test.js` — 278 linhas
- `scripts/tokenomics-model.ts` — 584 linhas
- `tests/brot/codama-spike.test.ts` — 219 linhas
- `tests/brot/events.test.ts` — 211 linhas
- `tests/brot/idl.test.ts` — 231 linhas
- `tests/brot/invariant-checks.ts` — 208 linhas
- `tests/brot/invariant-model.ts` — 219 linhas
- `tests/brot/invariant-program.test.ts` — 236 linhas
- `tests/brot/invariant-settle.ts` — 214 linhas
- `tests/brot/join-campaign-support.ts` — 203 linhas
- `tests/brot/layout-v1.test.ts` — 245 linhas
- `tests/brot/resolve-support.ts` — 205 linhas
- `tests/brot/setup.ts` — 203 linhas
- `tests/brot/slot-matrix-fixtures.ts` — 267 linhas
- `tests/brot/slot-matrix.gen.ts` — 428 linhas

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

## `packages/sdk/src/read/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`bytes.ts`](packages/sdk/src/read/bytes.ts) | small byte helpers the SDK shares, written without `Buffer`, `TextEncoder` or any Node or DOM API, so they run the same in a browser, in Bun and under React Nat | 33 |
| [`constants.ts`](packages/sdk/src/read/constants.ts) | the program's address and the constants compiled into it that a client needs: seeds, other programs, code ceilings, price and reader bounds, account sizes, and  | 115 |
| [`feeds.ts`](packages/sdk/src/read/feeds.ts) | the compiled lists of Pyth feeds a price campaign may name, one per cluster, as programs/brot-markets/src/feeds.rs compiles them (founder answer 1, 2026-10-09;  | 107 |
| [`index.ts`](packages/sdk/src/read/index.ts) | `@brot/sdk/read`, the read half of the SDK: addresses, constants, codecs, the money math, events and their decoder, public state, the creation checks, the openi | 18 |
| [`pdas.ts`](packages/sdk/src/read/pdas.ts) | every program-derived address a client needs: the config, the fee vault, a campaign and its vault, an entry, a join, the event authority, the program's ProgramD | 68 |

## `packages/sdk/src/read/errors/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`codes.ts`](packages/sdk/src/read/errors/codes.ts) | the program's custom error codes by name (programs/brot-markets/src/error.rs), so a client names the exact refusal. Codes are appended there and here, never reu | 157 |
| [`index.ts`](packages/sdk/src/read/errors/index.ts) | one message per program error code, read from the IDL, and the refusal the SDK throws when its mirror of a program rule refuses (math, creation checks), carryin | 79 |

## `packages/sdk/src/read/math/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`fees.ts`](packages/sdk/src/read/math/fees.ts) | Brot's fee on the losing side and the one-sided fee per entry, both rounded up. Mirrors programs/brot-markets/src/math/fees.rs (P1 sections 3.3 and 3.5; TP 3.4. | 26 |
| [`index.ts`](packages/sdk/src/read/math/index.ts) | the money and schedule math of the program as pure TypeScript, for previews, estimates and checks: the opening conversion and split, the fees, the creator share | 47 |
| [`integers.ts`](packages/sdk/src/read/math/integers.ts) | the Rust integer types the program's math uses, as bigint bounds, and the checks that make bigint arithmetic fail where the program's checked arithmetic fails | 87 |
| [`opening.ts`](packages/sdk/src/read/math/opening.ts) | the price of a paid opening in lamports at the Pyth SOL/USD price, and its split into the prize and Brot's opening fee. Mirrors programs/brot-markets/src/math/o | 52 |
| [`payout.ts`](packages/sdk/src/read/math/payout.ts) | the creator share, what winners split, a winner's payout, the return estimate a join checks against `min_return_bps`, and a one-sided refund. Mirrors programs/b | 111 |
| [`rounding.ts`](packages/sdk/src/read/math/rounding.ts) | the multiply-divide and basis-point shares every money formula uses, rounded down or up, with the program's refusals: the one place a rounding direction is writ | 53 |
| [`schedule.ts`](packages/sdk/src/read/math/schedule.ts) | when entries close and which durations a campaign may have, for the real build and for the devnet drill build. Mirrors programs/brot-markets/src/math/schedule.r | 74 |
| [`settle.ts`](packages/sdk/src/read/math/settle.ts) | what one entry is paid under its campaign's snapshot, the late-entry split, and the reserve path of a credit below rent. Mirrors programs/brot-markets/src/instr | 94 |
| [`snapshot.ts`](packages/sdk/src/read/math/snapshot.ts) | the settlement snapshot: a campaign's totals and verdict turned into what finalize stores (the mode, the house fee, the creator share, `distributable`, what Bro | 136 |
| [`void.ts`](packages/sdk/src/read/math/void.ts) | what a void, and a pot with no entry, returns to whoever opened and what Brot keeps. Mirrors programs/brot-markets/src/math/void.rs (TP 3.4.7, P-4, founder answ | 50 |

## `packages/sdk/src/tx/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`index.ts`](packages/sdk/src/tx/index.ts) | `@brot/sdk/tx`, the transaction half (filled in below) | 7 |

## `programs/brot-markets/src/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`checks.rs`](programs/brot-markets/src/checks.rs) | every account check Anchor used to make, written by hand in one place (TP 3.4.17), each with its own error and a negative test that fails without it (T24, X0.9) | 172 |
| [`constants.rs`](programs/brot-markets/src/constants.rs) | seeds, program ids, code ceilings and the duration and window constants compiled into the program, with the devnet-only drill values behind the `drill` feature | 183 |
| [`entrypoint.rs`](programs/brot-markets/src/entrypoint.rs) | the instruction dispatcher: the first byte of the instruction data picks the handler, the rest is that handler's arguments | 81 |
| [`error.rs`](programs/brot-markets/src/error.rs) | every refusal the program can return, one code per cause, as custom program errors | 328 |
| [`events.rs`](programs/brot-markets/src/events.rs) | the events, one per instruction, and how they leave the program: a self-CPI signed by the event-authority PDA, so they survive log truncation (T4) | 101 |
| [`feeds.rs`](programs/brot-markets/src/feeds.rs) | the compiled list of Pyth feeds a price campaign may name (founder answer 1, 2026-10-09; TP 3.4.1, 3.4.10). One list per cluster, chosen by the `mainnet` featur | 147 |
| [`layout.rs`](programs/brot-markets/src/layout.rs) | zero-copy byte layouts shared by accounts, instruction arguments and events: the little-endian field types and the one place where bytes become a typed view | 126 |
| [`lib.rs`](programs/brot-markets/src/lib.rs) | the Brot Markets program on Pinocchio: On-Chain Campaigns paid in SOL; declares the program id and wires the modules and the entrypoint | 27 |
| [`vault.rs`](programs/brot-markets/src/vault.rs) | the lamport vault of a campaign: SOL arriving from a signer's wallet by System Program transfer, signed by that wallet (TP section 3.4.4) | 33 |

## `programs/brot-markets/src/checks/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`close.rs`](programs/brot-markets/src/checks/close.rs) | `checks::close_account`: closes one account the program owns. Its data is zeroed, its lamports must already have left (`AccountNotEmpty`), and then the crate's  | 24 |
| [`paying.rs`](programs/brot-markets/src/checks/paying.rs) | `checks::paying_vault`: the checks every paying instruction makes on its vault before any lamport moves (TP 3.4.17, Sprint 04): the vault belongs to this progra | 38 |
| [`top_level.rs`](programs/brot-markets/src/checks/top_level.rs) | `checks::top_level`, the guard that keeps `resolve_campaign` out of other programs' CPIs (TP section 3.4.17): the instruction must run at the transaction's top  | 34 |
| [`upgrade.rs`](programs/brot-markets/src/checks/upgrade.rs) | `checks::upgrade_authority`, the one check that binds the config's first write to this program's upgrade authority (TP 3.4.17), with its own refusals and negati | 45 |

## `programs/brot-markets/src/events/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`campaign.rs`](programs/brot-markets/src/events/campaign.rs) | the events of a campaign's life, each carrying the campaign and its contiguous `seq` (X0.4): opened, an entry added, resolved | 148 |
| [`finalize.rs`](programs/brot-markets/src/events/finalize.rs) | the events that fix the money and end the campaign: the snapshot (`CampaignFinalized`) and the close (`CampaignClosed`). Both carry the campaign and `seq` | 88 |
| [`payout.rs`](programs/brot-markets/src/events/payout.rs) | the events of the money leaving the program (TP section 3.4.14): an entry paid, the creator share, the fee collected, the prize returned, and the fee vault swep | 107 |
| [`review.rs`](programs/brot-markets/src/events/review.rs) | the events of the review window and the team's acts (TP section 3.4.14): the result confirmed, the campaign voided, a contest opened. Each carries the campaign  | 68 |
| [`self_cpi.rs`](programs/brot-markets/src/events/self_cpi.rs) | how an event leaves the program: `emit` sends it to this program by self-CPI, signed by the event-authority PDA, and the event handler accepts only that signatu | 92 |

## `programs/brot-markets/src/instructions/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`interface.rs`](programs/brot-markets/src/instructions/interface.rs) | the program's interface for the Shank IDL (T9): the `BrotInstruction` enum, with each instruction's accounts in order and its arguments | 216 |
| [`mod.rs`](programs/brot-markets/src/instructions/mod.rs) | the program's interface: every instruction with its discriminator, its accounts in order and its arguments, for the dispatcher and for the Shank IDL (T9) | 67 |

## `programs/brot-markets/src/instructions/admin/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`accept_admin.rs`](programs/brot-markets/src/instructions/admin/accept_admin.rs) | `admin_accept_admin`: the pending admin signs and becomes the admin; the pending slot is cleared (second step of the two-step change) | 45 |
| [`initialize_config.rs`](programs/brot-markets/src/instructions/admin/initialize_config.rs) | `admin_initialize_config`: creates `GlobalConfig` and the data-less fee vault, once. Only the program's upgrade authority, read from its ProgramData account, ca | 106 |
| [`mod.rs`](programs/brot-markets/src/instructions/admin/mod.rs) | the admin and team instructions: initialisation, team keys, creation parameters, fee recipient, the two-step admin change and the pause (TP section 3.4.3) | 15 |
| [`pause_entries.rs`](programs/brot-markets/src/instructions/admin/pause_entries.rs) | `team_pause_entries`: a team key pauses entries and openings, `Normal` to `EntriesHalted` only. Payouts never pause (P4 section 4.5) | 45 |
| [`resume_entries.rs`](programs/brot-markets/src/instructions/admin/resume_entries.rs) | `admin_resume_entries`: the admin resumes entries, `EntriesHalted` to `Normal` only | 40 |
| [`set_creation_params.rs`](programs/brot-markets/src/instructions/admin/set_creation_params.rs) | `admin_set_creation_params`: the admin changes the creation parameters, each under its code ceiling, and raises `params_version` by one; campaigns already open  | 56 |
| [`set_fee_recipient.rs`](programs/brot-markets/src/instructions/admin/set_fee_recipient.rs) | `admin_set_fee_recipient`: the admin sets where `sweep_fees` sends the fee vault (Sprint 04) | 54 |
| [`set_team.rs`](programs/brot-markets/src/instructions/admin/set_team.rs) | `admin_set_team`: the admin sets up to five team keys (Q12), one per person | 82 |
| [`shared.rs`](programs/brot-markets/src/instructions/admin/shared.rs) | what the admin and team instructions share: the zero address ("no key"), the admin role check and the `ConfigChanged` snapshot every change of the config emits | 50 |
| [`transfer_admin.rs`](programs/brot-markets/src/instructions/admin/transfer_admin.rs) | `admin_transfer_admin`: the admin names the pending admin, the first step of the two- step change; zero cancels a pending change | 51 |

## `programs/brot-markets/src/instructions/campaigns/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`mod.rs`](programs/brot-markets/src/instructions/campaigns/mod.rs) | opening a campaign (TP section 3.4.10). Resolution joins this folder in Sprint 03 | 6 |
| [`open_campaign.rs`](programs/brot-markets/src/instructions/campaigns/open_campaign.rs) | `user_open_campaign`: any wallet opens a campaign of any open kind paying US$500 in SOL at the Pyth SOL/USD price, 90% bookkept as the prize and 10% held as the | 210 |

## `programs/brot-markets/src/instructions/campaigns/open_campaign/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`create.rs`](programs/brot-markets/src/instructions/campaigns/open_campaign/create.rs) | row 10 of TP section 3.4.10 for `user_open_campaign`: the `Campaign` and its vault, created at their canonical PDAs with the creator paying both rents. An exist | 59 |
| [`payment.rs`](programs/brot-markets/src/instructions/campaigns/open_campaign/payment.rs) | row 7 of TP section 3.4.10, what an opening pays: US$ at the sponsored Pyth SOL/USD price of the compiled feed (`SOL_USD_FEED_ID`) at its charged low end, `pric | 137 |
| [`record.rs`](programs/brot-markets/src/instructions/campaigns/open_campaign/record.rs) | the end of `user_open_campaign`: every field an opening writes into the new `Campaign`, and the `CampaignOpened` event built from what was stored, so the event  | 151 |
| [`rules.rs`](programs/brot-markets/src/instructions/campaigns/open_campaign/rules.rs) | the rules of `user_open_campaign` that read no account: row 1 of TP section 3.4.10 (the kind opens in this build), the canonical arguments (D-j: a field the kin | 103 |

## `programs/brot-markets/src/instructions/entries/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`entry_account.rs`](programs/brot-markets/src/instructions/entries/entry_account.rs) | the baker's `Entry` at a join: created at its canonical PDA on the first join, rent paid by the baker, and checked against the campaign, the baker and the total | 121 |
| [`join_campaign.rs`](programs/brot-markets/src/instructions/entries/join_campaign.rs) | `user_join_campaign`: a baker joins YES or NO with at least `min_entry_lamports` while the outcome is not knowable; the entry moves from the baker's wallet into | 212 |
| [`join_lock.rs`](programs/brot-markets/src/instructions/entries/join_lock.rs) | the join lock (BR-06) and the proximity buffer (question 7): a join is refused once the campaign's reader says the outcome is knowable (`OutcomeKnowable`), and  | 78 |
| [`join_record.rs`](programs/brot-markets/src/instructions/entries/join_record.rs) | the `Join` account (`["join", campaign, baker, index]`): its creation with the baker's rent, and the checked read of one join for the refund (lane G, question 7 | 168 |
| [`join_rules.rs`](programs/brot-markets/src/instructions/entries/join_rules.rs) | the two pure rules of a join: the campaign's own minimum entry (question 5) and the proximity buffer at the join lock (question 7). Pure, so the host tests chec | 63 |
| [`join_tally.rs`](programs/brot-markets/src/instructions/entries/join_tally.rs) | the tally of one join (`tally_late_joins`): reads the join at its index, returns the rent to the baker and closes the account, and reports which side it was on  | 79 |
| [`mod.rs`](programs/brot-markets/src/instructions/entries/mod.rs) | entries: a baker joins a campaign with SOL (TP section 3.4.3) until the outcome is knowable (the join lock, BR-06), and each join leaves a `Join` record that th | 13 |

## `programs/brot-markets/src/instructions/resolution/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`mod.rs`](programs/brot-markets/src/instructions/resolution/mod.rs) | the instructions that decide a campaign's outcome: `resolve_campaign` (Sprint 03), and the team's acts inside the review window: confirming, voiding and contest | 13 |
| [`resolve_campaign.rs`](programs/brot-markets/src/instructions/resolution/resolve_campaign.rs) | `resolve_campaign`: any wallet records the outcome the campaign's reader reads, at the top level only, and opens the six-hour review window (TP sections 3.4.2,  | 98 |
| [`team_confirm_result.rs`](programs/brot-markets/src/instructions/resolution/team_confirm_result.rs) | `team_confirm_result`: a team key ends the review window now and the outcome stands; the snapshot runs at once, so the campaign is `Settling` (TP sections 3.4.3 | 74 |
| [`team_open_contest.rs`](programs/brot-markets/src/instructions/resolution/team_open_contest.rs) | `team_open_contest`: DISABLED until Sprint 14 (decision of 2026-10-09). A contest would freeze a pot with no exit (its payout is paused until an instruction tha | 22 |
| [`team_shared.rs`](programs/brot-markets/src/instructions/resolution/team_shared.rs) | what the three team instructions share: the team-key check, the event number each event takes from the campaign, and the refusal of a status that is not the sto | 31 |
| [`team_void_campaign.rs`](programs/brot-markets/src/instructions/resolution/team_void_campaign.rs) | `team_void_campaign(reason, note_hash)`: a team key voids a campaign inside the review window with a reason it may choose and the hash of its note; the snapshot | 98 |
| [`void_reason.rs`](programs/brot-markets/src/instructions/resolution/void_reason.rs) | the class of each `VoidReason` (TP section 3.4.7, P-4): a house failure refunds the 10% opening fee, an outside cause keeps it; which reasons a team key may cho | 43 |
| [`window.rs`](programs/brot-markets/src/instructions/resolution/window.rs) | the review window's rules (TP section 3.4.7): a team key acts only while the campaign is `InReview` (`TeamKeyOutsideReview`), and only before `review_ends_at` ( | 31 |

## `programs/brot-markets/src/instructions/resolution/resolve_campaign/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`record.rs`](programs/brot-markets/src/instructions/resolution/resolve_campaign/record.rs) | the effects of `resolve_campaign`: the result group the reader's decision writes into the `Campaign`, and the `CampaignResolved` event built from what was store | 112 |

## `programs/brot-markets/src/instructions/settlement/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`bookkeeping.rs`](programs/brot-markets/src/instructions/settlement/bookkeeping.rs) | the moves and counters every settlement instruction shares: the event sequence number, the lamport move out of the vault (checked against I1 by `math::invariant | 64 |
| [`close_campaign.rs`](programs/brot-markets/src/instructions/settlement/close_campaign.rs) | `close_campaign`: once the fee, the prize and the creator share are settled, moves the vault's dust and hand-sent surplus to the fee vault, returns the rent of  | 128 |
| [`collect_fee.rs`](programs/brot-markets/src/instructions/settlement/collect_fee.rs) | `collect_fee`: moves what Brot keeps to the fee vault, once, after the entries are settled: the house fee net of the creator's share from it, the opening fee un | 81 |
| [`finalize_campaign.rs`](programs/brot-markets/src/instructions/settlement/finalize_campaign.rs) | `finalize_campaign`: the snapshot of a reviewed campaign once its window has ended. Any wallet, permissionless; it chooses nothing. It runs `finalize_snapshot`, | 77 |
| [`mod.rs`](programs/brot-markets/src/instructions/settlement/mod.rs) | the instructions that settle a campaign after its outcome: the snapshot, the payouts to people and Brot's fee, the prize, the close and the sweep (TP section 3. | 17 |
| [`rules.rs`](programs/brot-markets/src/instructions/settlement/rules.rs) | the settlement rules as pure functions: what one entry is paid under the snapshot's mode, and the reserve path of a credit below rent (TP section 3.4.5; amendme | 131 |
| [`settle_creator_share.rs`](programs/brot-markets/src/instructions/settlement/settle_creator_share.rs) | `settle_creator_share`: pays the creator's share once, to the stored creator only (TP 3.4.5, I13). A credit that would leave the creator's wallet below its rent | 126 |
| [`settle_entry.rs`](programs/brot-markets/src/instructions/settlement/settle_entry.rs) | `settle_entry`: pays one entry from the vault to its stored baker and closes the Entry, its rent back to the baker (TP 3.4.5). A losing entry goes through the s | 161 |
| [`settle_prize.rs`](programs/brot-markets/src/instructions/settlement/settle_prize.rs) | `settle_prize`: returns the prize to whoever opened in `OneSided` and `Refund`, and the opening fee too on a house-failure void (TP sections 3.4.7, 3.4.16; P-4) | 77 |
| [`snapshot.rs`](programs/brot-markets/src/instructions/settlement/snapshot.rs) | `finalize_snapshot`, the one snapshot path that `finalize_campaign` and `team_confirm_result` both call: it takes the campaign's totals and verdict through lane | 122 |
| [`sweep_fees.rs`](programs/brot-markets/src/instructions/settlement/sweep_fees.rs) | `sweep_fees`: sends the fee vault's lamports above its rent-exempt minimum to `GlobalConfig.fee_recipient`, and nowhere else (TP sections 3.4.3, 3.4.4). Any wal | 71 |
| [`tally_late_joins.rs`](programs/brot-markets/src/instructions/settlement/tally_late_joins.rs) | `tally_late_joins` (amendment of 2026-10-09, founder decisions 1 and 2): reads a baker's Join accounts in index order, adds the late amounts (joined at or after | 121 |

## `programs/brot-markets/src/instructions/settlement/collect_fee/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`amount.rs`](programs/brot-markets/src/instructions/settlement/collect_fee/amount.rs) | what Brot keeps and what the opener gets back, worked out from the stored campaign alone (TP section 3.4.16, P-4). The snapshot's `brot_keeps` and `to_opener` a | 146 |
| [`moves.rs`](programs/brot-markets/src/instructions/settlement/collect_fee/moves.rs) | the lamport moves of the settlement instructions, and the two reads they share: the rent of an empty account, from the Rent sysvar (decision 6), and the fee vau | 47 |

## `programs/brot-markets/src/math/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`fees.rs`](programs/brot-markets/src/math/fees.rs) | Brot's fee on the losing side and the one-sided fee per entry (P1 sections 3.3 and 3.5; TP section 3.4.16). Both round up | 27 |
| [`invariant.rs`](programs/brot-markets/src/math/invariant.rs) | the in-program assertion of TP section 3.4.13: the vault's lamport change across an instruction equals the change the bookkeeping makes. A lamport sent by hand  | 111 |
| [`mod.rs`](programs/brot-markets/src/math/mod.rs) | the money and schedule math as pure functions: the opening conversion, the entry close, the fee and the creator share (TP section 3.4.16) | 21 |
| [`opening.rs`](programs/brot-markets/src/math/opening.rs) | the price of a paid opening in lamports at the Pyth SOL/USD price, and its split into the prize and Brot's opening fee (D-b, D-f; TP section 3.4.16; T25) | 79 |
| [`payout.rs`](programs/brot-markets/src/math/payout.rs) | the creator share, what winners split, and the return estimate a join checks against `min_return_bps` (D-g read as P-2; TP section 3.4.16) | 171 |
| [`refund.rs`](programs/brot-markets/src/math/refund.rs) | the late-entry refund (TP section 3.4.16; founder answer 7, 2026-10-09): the part of a baker's joins made at or after the YES proof's `publish_time` comes back  | 86 |
| [`rounding.rs`](programs/brot-markets/src/math/rounding.rs) | the multiply-divide and basis-point shares every money formula uses, rounded down or up in u128 with checked math: the one place a rounding direction is written | 75 |
| [`schedule.rs`](programs/brot-markets/src/math/schedule.rs) | when entries close and which durations a campaign may have (D-k; P1 section 3.6) | 73 |
| [`snapshot.rs`](programs/brot-markets/src/math/snapshot.rs) | the settlement snapshot, the one pure function finalize calls to turn a campaign's totals and its verdict into what it stores: the mode, the house fee, the crea | 208 |
| [`void.rs`](programs/brot-markets/src/math/void.rs) | what a void, and a pot with no entry, returns to whoever opened and what Brot keeps (TP section 3.4.7, P-4, founder answer 8). The 10% opening fee follows the c | 70 |

## `programs/brot-markets/src/readers/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`cursor.rs`](programs/brot-markets/src/readers/cursor.rs) | bounds-checked little-endian reads over raw account data, for the readers. An account shorter than its layout is an error, never a panic | 100 |
| [`damm_v2.rs`](programs/brot-markets/src/readers/damm_v2.rs) | `DammV2LockedAtLeast`: YES once a Meteora DAMM v2 pool's permanently locked liquidity reaches the target. Locking is one-way, so the fact is irreversible | 104 |
| [`epoch.rs`](programs/brot-markets/src/readers/epoch.rs) | the epoch kinds' shared rules: when the measured epoch starts, against the deadline (row 5 for `StakePoolTvlAtLeast` and `StakeAtLeast`), from the EpochSchedule | 149 |
| [`mod.rs`](programs/brot-markets/src/readers/mod.rs) | the closed set of readers that turn an on-chain account into a YES/NO answer, and the interface each one exposes: `validate_at_creation`, `outcome_knowable`, `t | 126 |
| [`price_touch.rs`](programs/brot-markets/src/readers/price_touch.rs) | the price kind (`PriceTouch`) at the three moments a campaign reads its feed: the opening (rows 2 to 4, and row 3 at both ends), the join lock on the sponsored  | 101 |
| [`price_update.rs`](programs/brot-markets/src/readers/price_update.rs) | read a Pyth `PriceUpdateV2` account into the price of one named feed, checking who wrote it and how well it was verified, and derive a feed's sponsored account | 127 |
| [`shared.rs`](programs/brot-markets/src/readers/shared.rs) | what the readers share: the outcome a reader decides and the reading behind it, the deadline test, the irreversible-fact table and row 3's minimum distance | 147 |
| [`spl_mint.rs`](programs/brot-markets/src/readers/spl_mint.rs) | `SupplyAtMost`, the burn kind: YES once a classic SPL Token mint's supply is at or below the target. An irreversible fact while the mint authority stays revoked | 136 |
| [`stake_pool.rs`](programs/brot-markets/src/readers/stake_pool.rs) | `StakePoolTvlAtLeast`: YES if an SPL stake pool's total at the start of the measured epoch, the snapshot its first balance update of that epoch writes, reaches  | 196 |
| [`vote_stake.rs`](programs/brot-markets/src/readers/vote_stake.rs) | `StakeAtLeast`: YES if a vote account's stake in the measured epoch, read by `sol_get_epoch_stake`, reaches the target. Closed at opening until a devnet YES | 180 |

## `programs/brot-markets/src/readers/price_touch/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`proof.rs`](programs/brot-markets/src/readers/price_touch/proof.rs) | resolution of a price campaign (TP section 3.4.6; D7): while the proof window is open only a YES proof records anything; after it, the sponsored account gives N | 136 |
| [`rules.rs`](programs/brot-markets/src/readers/price_touch/rules.rs) | the price rules the opening, the join lock and the YES proof share: freshness by time and by slot, the confidence bound, and the two touch tests (the confidence | 118 |
| [`target.rs`](programs/brot-markets/src/readers/price_touch/target.rs) | row 3 of TP section 3.4.10 for a price campaign, at both ends: the target is not touched at opening, sits at least the minimum distance past the edge of the con | 89 |

## `programs/brot-markets/src/state/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`campaign.rs`](programs/brot-markets/src/state/campaign.rs) | `Campaign` (`["campaign", id]`): everything about one campaign, and the loaders that check it. Its vault (`["vault", campaign]`) is data-less and its bump lives | 185 |
| [`config.rs`](programs/brot-markets/src/state/config.rs) | `GlobalConfig` (`["config"]`): roles, the pause, the creation parameters, the fee recipient and the open-campaign counter; and the creation parameters' own layo | 195 |
| [`entry.rs`](programs/brot-markets/src/state/entry.rs) | `Entry` (`["entry", campaign, baker]`): one baker's entry in one campaign, both sides, created on the baker's first join and closed by `settle_entry` (Sprint 04 | 80 |
| [`enums.rs`](programs/brot-markets/src/state/enums.rs) | the one-byte enums stored in accounts and passed in instruction data, with their checked conversion from a raw byte | 162 |
| [`join.rs`](programs/brot-markets/src/state/join.rs) | `Join` (`["join", campaign, baker, index]`): one join of one baker in one campaign. One account per join, so the late-entry refund is exact with no cap on joins | 46 |
| [`mod.rs`](programs/brot-markets/src/state/mod.rs) | the accounts the program owns: their type tags, layout version and the one loader that runs the owner, length, tag and PDA checks before any field is read | 106 |
| [`transitions.rs`](programs/brot-markets/src/state/transitions.rs) | the transition table of TP section 3.4.2 as one function. Every instruction that moves a campaign's status calls `transition` first, so a transition outside the | 31 |

## `programs/brot-markets/src/state/campaign/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`loaders.rs`](programs/brot-markets/src/state/campaign/loaders.rs) | the loaders of `Campaign`: the one place that re-derives a campaign's address from its stored id, after the slot, owner and length checks, before any field is r | 48 |

## `programs/brot-markets/tests/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`checks_close_paying.rs`](programs/brot-markets/tests/checks_close_paying.rs) | the close helper (`checks::close_account`) and the paying check (`checks::paying_vault`) on the host: refusals change nothing; a closed account is the System Pr | 106 |
| [`checks_host_accounts.rs`](programs/brot-markets/tests/checks_host_accounts.rs) | the checks that read whole accounts, on the host: the upgrade authority recorded in a ProgramData account, and the guards in front of account creation (T24) | 123 |
| [`checks_host_loaders.rs`](programs/brot-markets/tests/checks_host_loaders.rs) | the frozen loaders of `state` running the `checks` module on the host: owner, exact length, tag and version, then the PDA from the stored bump, each failure wit | 110 |
| [`checks_host.rs`](programs/brot-markets/tests/checks_host.rs) | each per-slot and per-byte check of the `checks` module on the host, over account views laid out like the runtime's: its own error on the wrong input, `Ok` on t | 181 |
| [`checks_mollusk_init.rs`](programs/brot-markets/tests/checks_mollusk_init.rs) | the checks negatives on the program's SBF binary in Mollusk, through `admin_initialize_config`: non-canonical bumps, a look-alike System Program, the upgrade au | 166 |
| [`checks_mollusk.rs`](programs/brot-markets/tests/checks_mollusk.rs) | the checks negatives on the program's SBF binary in Mollusk, through `admin_set_team`: the config under another owner, unsigned and read-only slots, a wrong tag | 158 |
| [`config_params.rs`](programs/brot-markets/tests/config_params.rs) | the floors and ceilings of the creation parameters (TP section 3.4.1, C43): the founder's values pass, every bound passes, and one step past a bound fails with  | 192 |
| [`cursor.rs`](programs/brot-markets/tests/cursor.rs) | the bounds-checked cursor on its own. Readers of variable layouts lean on it, so "an error, never a panic" is proved here and not through one reader's fixed siz | 69 |
| [`event_cpi.rs`](programs/brot-markets/tests/event_cpi.rs) | the self-CPI events on the host (T4): the instruction data `emit` sends for each of the six events, and the handler that accepts only the event authority, signi | 82 |
| [`feeds_list.rs`](programs/brot-markets/tests/feeds_list.rs) | the compiled feed list (`feeds::require_listed`): the SOL/USD and BTC/USD feeds are listed on this cluster, the feed ids are the ones the captured mainnet and d | 41 |
| [`join_host_buffer.rs`](programs/brot-markets/tests/join_host_buffer.rs) | the proximity buffer at the join lock (question 7): the margin exactly, one unit inside and one unit outside, on both directions, and the one-unit floor of a ti | 152 |
| [`join_host_min_entry.rs`](programs/brot-markets/tests/join_host_min_entry.rs) | the join's minimum entry (question 5): the campaign's own minimum, one lamport below refused, the minimum itself accepted, and the refusal's own error | 40 |
| [`join_host_record.rs`](programs/brot-markets/tests/join_host_record.rs) | the `Join` record's fields as the join writes them, the checked read of joins from account bytes, and the refund split of those joins against `split_late` (ques | 183 |
| [`join_host_tally.rs`](programs/brot-markets/tests/join_host_tally.rs) | the late rule of the tally (`LateRule`): late only on a YES price campaign, at or after the proof's publish time, inclusive at the boundary. A NO price campaign | 64 |
| [`join_layout.rs`](programs/brot-markets/tests/join_layout.rs) | the layout of the per-join account and the fields the join and the refund read from `Entry` and `Campaign` (founder decision, 2026-10-09: one `Join` per join, n | 34 |
| [`layout.rs`](programs/brot-markets/tests/layout.rs) | pins the program's frozen interface: account and argument sizes, event sizes, the event authority, the discriminators and the enum bytes. A change here is a cha | 123 |
| [`math_estimate_properties.rs`](programs/brot-markets/tests/math_estimate_properties.rs) | the join's return estimate over random pots: in `Split` it is the settlement's own payout in bps and never below 10,000; in a one-sided pot it is the refund, wi | 100 |
| [`math_fees.rs`](programs/brot-markets/tests/math_fees.rs) | the fee functions and the rounding helpers under them on the host: the TP's worked examples, the 100% ceiling, and the tight round-up over random amounts and ra | 102 |
| [`math_opening_properties.rs`](programs/brot-markets/tests/math_opening_properties.rs) | the opening conversion and split over random dollars, prices and exponents: tight rounding toward Brot, an overflow exactly past u64, and a larger prize at 90/1 | 104 |
| [`math_opening.rs`](programs/brot-markets/tests/math_opening.rs) | the opening conversion and its 90/10 split on the host: worked example A, the captured devnet SOL/USD price, the supported exponents, and every refusal | 103 |
| [`math_payout_properties.rs`](programs/brot-markets/tests/math_payout_properties.rs) | the money invariants of a `Split` pot over random sides, prizes and rates: I3′, I11 and I13 and the share's bound, against both readings of D-g; I6 and I9 over  | 81 |
| [`math_payout_refusals.rs`](programs/brot-markets/tests/math_payout_refusals.rs) | what the `Split` math and the join estimate refuse: an empty side, a fee above the losing side, a share that would cost a winner, a rate above 100%, an entry ab | 94 |
| [`math_payout.rs`](programs/brot-markets/tests/math_payout.rs) | the creator share, the split payout and the join estimate on the TP's worked examples A, B and C to the lamport, the proposal's table under both readings of D-g | 156 |
| [`math_refund_invariant.rs`](programs/brot-markets/tests/math_refund_invariant.rs) | the late-entry split (question 7: the joins at or after the YES proof's publish time) and the in-program vault assertion (TP 3.4.13), with their refusals. Hand- | 74 |
| [`math_schedule_properties.rs`](programs/brot-markets/tests/math_schedule_properties.rs) | the schedule math over random durations, under whichever build runs it (drill or not): where entries close, that it is monotonic, and that both functions refuse | 79 |
| [`math_schedule.rs`](programs/brot-markets/tests/math_schedule.rs) | the schedule math on the host: the P1 section 3.6 table, the 3-to-90-day bounds, the past deadline, and the drill and mainnet values (T12) | 150 |
| [`math_snapshot_invariant.rs`](programs/brot-markets/tests/math_snapshot_invariant.rs) | the snapshot's own sums (I3′) on a deterministic grid of pots, verdicts and prizes, and the refusals: a tampered total, a field that disagrees with the others,  | 157 |
| [`math_snapshot_modes.rs`](programs/brot-markets/tests/math_snapshot_modes.rs) | the `OneSided` and no-entry snapshots: the one-sided pot of Ana, Bruno and Carla (100, 198, 297 back, 5 to Brot), the one-sided baker with and without the prize | 123 |
| [`math_snapshot_split.rs`](programs/brot-markets/tests/math_snapshot_split.rs) | the `Split` snapshot on the sprint file's worked examples (V 600 / P 400 with and without a 450 prize), a team campaign, the late refunds, and the Economic Viab | 155 |
| [`math_snapshot_void.rs`](programs/brot-markets/tests/math_snapshot_void.rs) | the `Refund` snapshot of a void, per class: every entry back whole (late ones too), the prize to the opener, and the 10% opening fee back to the opener on a hou | 114 |
| [`math_vectors_snapshot.rs`](programs/brot-markets/tests/math_vectors_snapshot.rs) | the second set of committed math vectors (X0.3, Sprint 05): the finalize snapshot (every mode, the viability rule at its threshold, voids of both classes, team  | 52 |
| [`math_vectors.rs`](programs/brot-markets/tests/math_vectors.rs) | the committed math vectors (X0.3, the Rust half): 12,000 rows from a fixed seed over the house fee, the creator share, the distributable pot, the split payout,  | 169 |
| [`open_campaign_payment.rs`](programs/brot-markets/tests/open_campaign_payment.rs) | row 7 of TP section 3.4.10 on the host up to the conversion, each refusal with its own error (X0.7): who must pay, the US$ floor, the SOL/USD account derived fr | 189 |
| [`open_campaign_rows.rs`](programs/brot-markets/tests/open_campaign_rows.rs) | rows 1, 2 and 4 of TP section 3.4.10 on the host, each refusal with its own error (X0.7): `readers::validate_at_creation` over runtime-shaped accounts holding t | 157 |
| [`open_campaign_rules.rs`](programs/brot-markets/tests/open_campaign_rules.rs) | the rules of `user_open_campaign` that read no account, on the host: row 1 (the five kinds, `StakeAtLeast` behind its feature), the canonical arguments (D-j), t | 194 |
| [`open_h_feed.rs`](programs/brot-markets/tests/open_h_feed.rs) | lane H, question 3 and question 1 (founder answers 3 and 1, 2026-10-09): the SOL/USD feed id is a compiled constant that equals the id the captured mainnet and  | 71 |
| [`open_h_params.rs`](programs/brot-markets/tests/open_h_params.rs) | lane H, question 5 (founder answer 5, 2026-10-09): the minimum entry the campaign opens with is copied from the config at opening, and the admin range is 0.001  | 96 |
| [`open_h_price.rs`](programs/brot-markets/tests/open_h_price.rs) | lane H, question 2 (founder answer 2, 2026-10-09): a paid opening is charged at the low end of the SOL/USD band, `price − conf`, and the campaign records that c | 135 |
| [`open_h_valve.rs`](programs/brot-markets/tests/open_h_valve.rs) | lane H, question 4 (founder answer 4, 2026-10-09): the valve `max_open_campaigns` counts paid openings only. A team key's free opening is outside the limit, nei | 52 |
| [`price_join.rs`](programs/brot-markets/tests/price_join.rs) | the join lock of a price campaign (BR-06) on the host: `readers::outcome_knowable` on the sponsored account, each refusal with its own error, the freshness boun | 165 |
| [`price_math.rs`](programs/brot-markets/tests/price_math.rs) | the price rules on extreme readings, on the host: a negative price, the largest confidence, exponents of +5 and −30, publish times and slots at the ends of thei | 188 |
| [`price_opening.rs`](programs/brot-markets/tests/price_opening.rs) | what the price reader checks at an opening, on the captured Pyth accounts: the sponsored account each feed derives, the freshness and confidence bounds at their | 185 |
| [`price_proof.rs`](programs/brot-markets/tests/price_proof.rs) | a price campaign's YES proof on the host: `readers::try_resolve` up to the deadline plus 60 s, the proof at any address, each refusal with its own error (a non- | 199 |
| [`price_reader.rs`](programs/brot-markets/tests/price_reader.rs) | the price reader against real Pyth accounts captured from devnet and mainnet, and against the malformed versions of them. A wrong account must be an error, neve | 197 |
| [`price_stale_feed.rs`](programs/brot-markets/tests/price_stale_feed.rs) | a price campaign after its proof window on the host: NO from the sponsored account, the stale-feed void (D7) at `deadline − max(max_age, 600 s)` ± 1 s, an updat | 201 |
| [`price_target.rs`](programs/brot-markets/tests/price_target.rs) | row 3 of TP section 3.4.10 for the price kind, at both ends, on the host: a target already touched, too close to the band or out of reach is refused with its ow | 183 |
| [`readers_damm_v2.rs`](programs/brot-markets/tests/readers_damm_v2.rs) | the locked-liquidity kind's reader (`DammV2LockedAtLeast`) on the two DAMM v2 pools captured from mainnet and on broken copies of them: the read, the saturation | 180 |
| [`readers_epoch.rs`](programs/brot-markets/tests/readers_epoch.rs) | the epoch kinds' shared rules on the host: the first slot of an epoch against `solana-epoch-schedule` itself (the copy Mollusk carries) under warmup and normal  | 189 |
| [`readers_shared.rs`](programs/brot-markets/tests/readers_shared.rs) | what the fact readers share, on its own: `fact_resolution`'s table (TP section 3.4.6), `min_distance` (row 3, C45) and `after_deadline`, with the deadline's own | 170 |
| [`readers_spl_mint.rs`](programs/brot-markets/tests/readers_spl_mint.rs) | the burn kind's reader (`SupplyAtMost`) on the mainnet mints captured in tests/fixtures and on broken copies of them: the read, rows 2 and 3 in their order, the | 189 |
| [`readers_stake_pool.rs`](programs/brot-markets/tests/readers_stake_pool.rs) | `StakePoolTvlAtLeast` on the captured JitoSOL and bSOL pools: the walk's values at the frozen offsets and past set options, every refusal of the bytes (owner, a | 200 |
| [`readers_vote_stake.rs`](programs/brot-markets/tests/readers_vote_stake.rs) | `StakeAtLeast` on the captured mainnet vote account: Agave's version tags and sizes (every truncation, stretched, zeroed, unknown tags), the owner first, rows 2 | 154 |
| [`resolve_record.rs`](programs/brot-markets/tests/resolve_record.rs) | `resolve_campaign` on the host: what `record::write` stores and emits for a reader's decision (the result group only, checked math, `Unresolved` refused), and t | 198 |
| [`review_money_fixes.rs`](programs/brot-markets/tests/review_money_fixes.rs) | the regression tests of the Sprint 04 closure review (second lens, 2026-10-09): a void that follows a late-only pot pays the opener as a house failure requires, | 70 |
| [`settle_d_amounts.rs`](programs/brot-markets/tests/settle_d_amounts.rs) | lane D's pure money rules on the host: what `collect_fee` moves to the fee vault and what `settle_prize` returns, worked out from a stored campaign (TP 3.4.16,  | 185 |
| [`settle_d_close_sweep.rs`](programs/brot-markets/tests/settle_d_close_sweep.rs) | lane D's `close_campaign` and `sweep_fees` on the host: each refusal in its order, and that the Rent sysvar is read only after every refusal, so a refused close | 151 |
| [`settle_d_collect_prize.rs`](programs/brot-markets/tests/settle_d_collect_prize.rs) | lane D's `collect_fee` and `settle_prize` on the host: each refusal in its order, and the effect of a payment (the lamports that move, the flag, the sequence nu | 148 |
| [`settle_d_resolve.rs`](programs/brot-markets/tests/settle_d_resolve.rs) | lane D's write of `publish_time` at resolution, on the host: the YES proof's publish time for a price campaign, zero for the other kinds, and the rest of the re | 81 |
| [`settle_host_finalize.rs`](programs/brot-markets/tests/settle_host_finalize.rs) | ! Host tests of `finalize_snapshot` (lane C) on campaign and config bytes: its refusals, the late totals that | 236 |
| [`settle_host_rules.rs`](programs/brot-markets/tests/settle_host_rules.rs) | ! Host tests of the settlement rules (lane C): what each entry is paid under each mode, and the reserve | 170 |
| [`stake_at_least_mollusk.rs`](programs/brot-markets/tests/stake_at_least_mollusk.rs) | the `StakeAtLeast` YES path on the program's SBF binary in Mollusk, which LiteSVM's npm package cannot show (its `sol_get_epoch_stake` reads zero): an open camp | 174 |
| [`state_transitions.rs`](programs/brot-markets/tests/state_transitions.rs) | the transition table of TP section 3.4.2, checked over all 25 pairs of statuses: the six edges are allowed, every other pair is refused with `IllegalTransition` | 52 |
| [`team_keys.rs`](programs/brot-markets/tests/team_keys.rs) | the team rules of `admin_set_team` (Q12, TP section 3.4.9): at most five keys, none zero, none twice, every slot past `team_len` zero; each refusal with its own | 87 |
| [`team_window_rules.rs`](programs/brot-markets/tests/team_window_rules.rs) | the review window's rules of the team instructions on the host: a team key acts only while `InReview` (`TeamKeyOutsideReview`) and before `review_ends_at` (the  | 172 |
| [`team_window_transitions.rs`](programs/brot-markets/tests/team_window_transitions.rs) | the status moves of the team instructions go through `state::transitions::transition`: confirm and void move `InReview` to `Settling`, contest moves it to `Cont | 48 |
| [`team_window_void_reasons.rs`](programs/brot-markets/tests/team_window_void_reasons.rs) | the class of each `VoidReason` (TP section 3.4.7): one test per reason, for the 10% opening fee (refunded on a house failure, kept on an outside cause), for whe | 86 |
| [`vault.rs`](programs/brot-markets/tests/vault.rs) | pins what `vault::deposit` does with zero (nothing moves, no System Program call, success) and that any other amount reaches the transfer, which refuses a borro | 43 |

## `programs/brot-markets/tests/checks_support/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`host.rs`](programs/brot-markets/tests/checks_support/host.rs) | host `AccountView`s for the checks tests: an 8-byte-aligned buffer holding the runtime's account header (`RuntimeAccount`) followed by the account's data, as th | 131 |
| [`mollusk_data.rs`](programs/brot-markets/tests/checks_support/mollusk_data.rs) | what the checks negatives run in Mollusk: the config's bytes and the two admin instructions in the frozen slot order, built from the crate's own structs, with t | 169 |
| [`mollusk.rs`](programs/brot-markets/tests/checks_support/mollusk.rs) | the Mollusk world of the checks negatives: the program's SBF binary loaded once per test, the keys of a fresh deployment, and the assertion on the exact custom  | 151 |

## `programs/brot-markets/tests/common/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`mod.rs`](programs/brot-markets/tests/common/mod.rs) | a small seeded generator for the math property tests (xorshift64*): fixed seeds, reproducible runs, no dependency; plus the checked u128 helpers the oracles use | 152 |
| [`pots.rs`](programs/brot-markets/tests/common/pots.rs) | random `Split` pots for the property tests, and the P-2 chain that settles one (fee, creator share, distributable), shared by the payout and estimate properties | 54 |

## `programs/brot-markets/tests/epoch_support/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`mod.rs`](programs/brot-markets/tests/epoch_support/mod.rs) | what the epoch kinds' host tests share: the captured pools and vote account, a clock in a mainnet epoch, a `Campaign`, the reader calls and the expected outcome | 200 |

## `programs/brot-markets/tests/opening_support/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`mod.rs`](programs/brot-markets/tests/opening_support/mod.rs) | what the opening's host tests share: accounts laid out as the runtime lays them out, holding the captured Pyth bytes with fields changed in memory, and the fixt | 116 |

## `programs/brot-markets/tests/price_support/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`campaign.rs`](programs/brot-markets/tests/price_support/campaign.rs) | a price campaign written in place for the host tests, and the join lock and resolution called through `readers` as the program calls them | 159 |
| [`mod.rs`](programs/brot-markets/tests/price_support/mod.rs) | what the price kind's host tests share: the captured mainnet Pyth accounts next to the devnet ones of `opening_support`, changes to an update's fields made in m | 160 |
| [`opening.rs`](programs/brot-markets/tests/price_support/opening.rs) | rows 2 to 4 of an opening for the price kind's host tests: `readers:: validate_at_creation` on a runtime-shaped account, with the devnet `campaign_max_age` | 53 |
| [`outcome.rs`](programs/brot-markets/tests/price_support/outcome.rs) | the outcomes the price kind's host tests expect from the readers: the reading behind a recorded outcome, a YES, a NO, a void and a refusal, in the readers' own  | 52 |

## `programs/brot-markets/tests/readers_support/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`mod.rs`](programs/brot-markets/tests/readers_support/mod.rs) | what the fact readers' host tests share: a campaign built from zeroed bytes, the reader contexts over runtime-shaped accounts (`opening_support::HostAccount`),  | 191 |

## `programs/brot-markets/tests/settle_d_support/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`accounts.rs`](programs/brot-markets/tests/settle_d_support/accounts.rs) | the host accounts of lane D's handler tests: a campaign that is finalized, its vault and the fee vault at their real PDAs, the config, and a `run` that calls a  | 123 |

## `programs/brot-markets/tests/vectors_support/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`mod.rs`](programs/brot-markets/tests/vectors_support/mod.rs) | what the snapshot vector generator shares: the seeded generator, the amounts and rates it draws (zeros, values near `u64::MAX`, rates above 100%), and the print | 81 |
| [`other_rows.rs`](programs/brot-markets/tests/vectors_support/other_rows.rs) | the `entry`, `estimate` and `schedule` rows of the snapshot vectors: what one entry is paid under each mode (late parts included), the join's return estimate, a | 134 |
| [`snapshot_rows.rs`](programs/brot-markets/tests/vectors_support/snapshot_rows.rs) | the `snapshot` rows of the snapshot vectors: random pots under the four verdicts, with one row in three placed within a few lamports of the Economic Viability R | 103 |

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
| [`build-idl.ts`](scripts/build-idl.ts) | writes the brot-markets IDL with the pinned shank-cli into packages/sdk/src/idl, then renders the Codama spike client from it (T9). `bun run idl`; also the last | 59 |
| [`bun-junit.mjs`](scripts/bun-junit.mjs) | reads the JUnit file `bun test --reporter=junit` writes: each test by name, with its body (empty when it passed, `<skipped />` when filtered out, `<failure …>`  | 18 |
| [`capture-fixtures.ts`](scripts/capture-fixtures.ts) | capture real on-chain accounts into tests/fixtures, so the reader tests decode the bytes third-party programs actually write instead of a layout someone typed f | 182 |
| [`checks-mutation.mjs`](scripts/checks-mutation.mjs) | the X0.9 evidence for the checks module: removes each check of programs/brot-markets/src/checks.rs and its submodules (checks/top_level.rs) in turn, rebuilds th | 199 |
| [`ci-secret-scan.js`](scripts/ci-secret-scan.js) | the pre-commit hook only protects commits made on a machine that has it wired. This scans every line a branch adds relative to its base, with the same patterns | 74 |
| [`codama-spike.ts`](scripts/codama-spike.ts) | the Codama spike (T9): renders a Kit client from the Shank IDL of brot-markets into packages/sdk/src/idl/generated. Sprint 05 decides whether the SDK adopts it; | 61 |
| [`codemap.js`](scripts/codemap.js) | let an AI locate the right file without reading every file. Pairs with the 200-line limit in .claude/rules/code-style.md — small files plus a one-line index mea | 223 |
| [`detach-os.ps1`](scripts/detach-os.ps1) | detach-os.ps1 — desconecta seu projeto do repositório AI Dev Operating System | 161 |
| [`detach-os.sh`](scripts/detach-os.sh) | detach-os.sh — desconecta seu projeto do repositório AI Dev Operating System | 157 |
| [`devnet-clock-probe.ts`](scripts/devnet-clock-probe.ts) | measure a cluster's clock against wall time (slot length, the confirmed-to-finalized gap, the drift of the Clock sysvar and, under Alpenglow, of the leader's na | 201 |
| [`devnet-seed.ts`](scripts/devnet-seed.ts) | Seeds devnet with demo markets for the app, on named tokens (Metaplex metadata) so they read like | 246 |
| [`devnet-smoke.ts`](scripts/devnet-smoke.ts) | Devnet smoke test: the full USDC lifecycle against the deployed program, with the client stack | 273 |
| [`devnet.ts`](scripts/devnet.ts) | Shared setup for the devnet scripts: connection, deployer, Anchor client, sending, and the raw SPL | 222 |
| [`extract-external-links.sh`](scripts/extract-external-links.sh) | ⚠️ sem cabeçalho — adicione purpose/version/sprint | 16 |
| [`init-project.ps1`](scripts/init-project.ps1) | ⚠️ sem cabeçalho — adicione purpose/version/sprint | 34 |
| [`init-project.sh`](scripts/init-project.sh) | ⚠️ sem cabeçalho — adicione purpose/version/sprint | 25 |
| [`instruction-drift.js`](scripts/instruction-drift.js) | catch references in instruction files (CLAUDE.md, templates, skills, agents, WIZARD) to agents, commands and wizard stages that do not exist, and model generati | 160 |
| [`measure-cu.ts`](scripts/measure-cu.ts) | prints the compute units of each instruction's valid baseline and the program binary's size, in the Sprint 03 "Measurements" table's shape (T3). Runs in LiteSVM | 30 |
| [`measure-settle.ts`](scripts/measure-settle.ts) | the settle batch (T3) and the per-account write limit (C7). For each batch size it builds one transaction of `settle_entry` instructions in LiteSVM (self-CPI ev | 117 |
| [`os-self-test.js`](scripts/os-self-test.js) | the `os-self-test` skill did this, but only when a human or a model remembered to invoke it — and three session logs record it NOT being run when it would have  | 406 |
| [`pre-commit.js`](scripts/pre-commit.js) | the PreToolUse gate only sees commits Claude makes. A commit from a terminal or an editor skipped it entirely. This runs the same scan from git itself | 76 |
| [`push-oracle-probe.ts`](scripts/push-oracle-probe.ts) | probe Pyth's push oracle read-only: watch that the sponsored SOL/USD and BTC/USD accounts only move forward on devnet and mainnet, and scan its recent transacti | 200 |
| [`pyth-sponsored-feeds.ts`](scripts/pyth-sponsored-feeds.ts) | list which Pyth feeds have a shard-0 push account on devnet and mainnet, which of those stay fresh, how often they update and who pays for the writes, read-only | 201 |
| [`release-v0.2.0.ps1`](scripts/release-v0.2.0.ps1) | Release helper for AI Dev Operating System v0.2.0 | 11 |
| [`release-v0.2.0.sh`](scripts/release-v0.2.0.sh) | ⚠️ sem cabeçalho — adicione purpose/version/sprint | 16 |
| [`run-tests.js`](scripts/run-tests.js) | give `npm test` a file list that does not depend on the shell. npm runs scripts through cmd.exe on Windows, which does not expand globs, and Node only learned t | 33 |
| [`sensor-wiring.js`](scripts/sensor-wiring.js) | verify the repo has a standard test entry point, a linter with its config, a lockfile, a feedback hook, a git pre-commit, and a CI that actually runs them. The  | 121 |
| [`slot-matrix-check.ts`](scripts/slot-matrix-check.ts) | the CI step of the slot matrix: regenerates the matrix in memory and fails when the committed tests/brot/slot-matrix.gen.ts is stale (or missing) | 18 |
| [`slot-matrix-spec.ts`](scripts/slot-matrix-spec.ts) | the expectations of the slot matrix: what each account slot of each instruction is, and which BrotError a refused mutation gets, from the checks order of checks | 272 |
| [`slot-matrix.ts`](scripts/slot-matrix.ts) | generates tests/brot/slot-matrix.gen.ts, the slot matrix of Sprint 04 (T-lane F), from the frozen Shank IDL: every signer unsigned, every writable slot read-onl | 176 |
| [`sync-selfhosted.js`](scripts/sync-selfhosted.js) | keep a local, navigable mirror of the full self-hosted catalogue so the WIZARD (stage 4.2) can offer self-hosted alternatives without a network call | 349 |
| [`tokenomics-model.ts`](scripts/tokenomics-model.ts) | Quantitative model behind ECONOMICS.md: protocol fees, revenue split, staker yield, the token unlock curve and the | 584 |

## `scripts/surfpool/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`campaign.ts`](scripts/surfpool/campaign.ts) | the program's steps the price-touch run takes on a surfnet, with the test kit's builders and layouts: funded throwaway wallets, the config and the team, a free  | 111 |
| [`install.ts`](scripts/surfpool/install.ts) | install the brot-markets binary on a surfnet at the id the program declares, with no keypair: its ProgramData account (naming an upgrade authority the caller ho | 63 |
| [`price-touch.ts`](scripts/surfpool/price-touch.ts) | the Surfpool run of the price reader, the criterion Sprint 01 carried to Sprint 03: on a mainnet fork, a team campaign is opened on SOL/USD's sponsored account; | 140 |
| [`pyth-model.ts`](scripts/surfpool/pyth-model.ts) | drive Surfpool's Pyth `PriceUpdateV2` model on the upgraded receiver's accounts: read an account's fields, give the model's IDL to `rec2HH…`, and schedule overr | 177 |
| [`resolution-checks.ts`](scripts/surfpool/resolution-checks.ts) | what the price-touch run asserts about `resolve_campaign`, against the semantics frozen at Sprint 03's opening: refused while no YES is proven, then YES with th | 83 |
| [`rpc.ts`](scripts/surfpool/rpc.ts) | talk to a surfnet over JSON-RPC: plain calls and Surfpool's `surfnet_*` cheatcodes, the clock, account bytes, and a transaction sent, landed and read back with  | 153 |
| [`surfnet.ts`](scripts/surfpool/surfnet.ts) | start and stop a Surfpool surfnet for the scripts in this folder: a mainnet fork on 127.0.0.1 with both ports in 4200-4299, run from its own temporary directory | 153 |

## `scripts/test/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`codemap.test.js`](scripts/test/codemap.test.js) | pin the header-extraction behaviour, because the quality of the whole map depends on it — a bad describe() produces a map that reads plausibly and points nowher | 170 |
| [`hooks.test.js`](scripts/test/hooks.test.js) | hooks.test.js — unit tests for the PreToolUse gates and the PostToolUse feedback hook | 278 |
| [`instruction-drift.test.js`](scripts/test/instruction-drift.test.js) | pin what counts as a dangling reference and what does not, because a noisy check gets switched off and a silent one lets the template's dead command table survi | 142 |
| [`pre-commit.test.js`](scripts/test/pre-commit.test.js) | prove the hook stops a staged credential in a real git repository, and gets out of the way everywhere else | 95 |
| [`sensor-wiring.test.js`](scripts/test/sensor-wiring.test.js) | pin the two severities — a missing sensor is an error in the OS repo and a warning in a derived project — and the "exists but never gates" class | 140 |
| [`sync-selfhosted.test.js`](scripts/test/sync-selfhosted.test.js) | ⚠️ sem cabeçalho — adicione purpose/version/sprint | 146 |

## `services/landing/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`server.mjs`](services/landing/server.mjs) | HTTP entry of the "coming soon" site (landing page, /pitch, waitlist API) and of docs.brot.markets (the docs. host, from docs-site/), bound to localhost behind  | 152 |

## `services/landing/history/pitch-1/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`deck-motion.js`](services/landing/history/pitch-1/deck-motion.js) | the motion of the pitch deck at /pitch: each slide's entrance, the mascot hopping across the bottom on a slide change, and the closing slide's finale (blink, th | 179 |

## `services/landing/history/pitch-3/deck/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`bite.js`](services/landing/history/pitch-3/deck/bite.js) | the mascot's bite on the earnings slide of /pitch3: it runs to a loaf and takes a thin slice, which is the fee. The hidden surprise: a click on the mascot or on | 61 |
| [`creators.js`](services/landing/history/pitch-3/deck/creators.js) | the mascots of the Creators slide of /pitch3: one drops on the card of the creator's share and gives its thumbs up; two smaller ones come up from behind the oth | 79 |
| [`demo.js`](services/landing/history/pitch-3/deck/demo.js) | plays the product demo on the Solution slide of /pitch3: a pointer picks YES on one market and NO on another, the card flips between them, and each is resolved  | 150 |
| [`exits.js`](services/landing/history/pitch-3/deck/exits.js) | what the mascot does on a slide of /pitch3 before the deck leaves it, when the presenter moves forward. An exit is short, and it ends by calling `go`, which is  | 65 |
| [`finale.js`](services/landing/history/pitch-3/deck/finale.js) | the finale of the closing slide of /pitch3: the badge lands, blinks twice, gives a thumbs-up with sparkles and points at the code. The timings are the ones of t | 54 |
| [`motion.js`](services/landing/history/pitch-3/deck/motion.js) | the motion of the deck at /pitch3: it decides what plays when a slide arrives or is left (the scenes are in scenes.js and exits.js), starts the product demo and | 178 |
| [`partners.js`](services/landing/history/pitch-3/deck/partners.js) | the launch partners counter of the Growth slide of /pitch3: two seconds after the slide arrives the number climbs to the partners in the list, their logos come  | 69 |
| [`runner.js`](services/landing/history/pitch-3/deck/runner.js) | the mascot's plain run across a slide of /pitch3, used where a slide has no scene of its own. It runs along the bottom, in the direction of the slide change, al | 33 |
| [`scenes.js`](services/landing/history/pitch-3/deck/scenes.js) | the mascot's scenes of the deck at /pitch3, by the slide that arrives: what plays when it comes going forward, going back, or when the page opens on it. A slide | 124 |
| [`sponsors.js`](services/landing/history/pitch-3/deck/sponsors.js) | the mascot on the Sponsors slide of /pitch3: it swings in on a rope, lets go where the slide's own mascot stands, and from then on points at the last step, the  | 66 |
| [`sprites.js`](services/landing/history/pitch-3/deck/sprites.js) | the mascot images of /pitch3: which file is which pose, loading them ahead of time, and putting a pose on a slide at a place given in the slide's own 1920 x 108 | 81 |
| [`team.js`](services/landing/history/pitch-3/deck/team.js) | the curtains of the Team slide of /pitch3: the mascot runs in, pulls the rope of each curtain in turn, showing one person at a time, and runs off. Without motio | 54 |

## `services/landing/lib/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`api.mjs`](services/landing/lib/api.mjs) | the two waitlist endpoints of the "coming soon" site: join (POST /api/leads) and leave (/api/leads/remove) | 120 |
| [`leads.mjs`](services/landing/lib/leads.mjs) | waitlist store for the "coming soon" page: validates an email and keeps one line per lead in a JSONL file | 91 |
| [`rate-limit.mjs`](services/landing/lib/rate-limit.mjs) | in-memory request limiter per visitor address, so one address cannot flood the waitlist endpoint | 36 |
| [`static.mjs`](services/landing/lib/static.mjs) | serves the files under public/ for the "coming soon" site, with clean URLs and no way out of that folder | 104 |

## `services/landing/public/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`app.js`](services/landing/public/app.js) | browser script of the "coming soon" site: picks the theme before first paint and sends the waitlist forms. The mascot is a separate script, mascot.js | 111 |
| [`mascot-body.js`](services/landing/public/mascot-body.js) | draws Baked, the mascot, on the landing page: the sprite with its eight poses, the shadow and the speech bubble. It knows nothing about where to stand; mascot.j | 90 |
| [`mascot-senses.js`](services/landing/public/mascot-senses.js) | what Baked, the mascot, notices on the landing page: where the pointer rests, scrolling, keyboard focus, how long the visitor has been still, and which element  | 92 |
| [`mascot.js`](services/landing/public/mascot.js) | makes Baked, the mascot, live on the landing page: it stands on declared perches, hops to the one nearest to where the pointer rests, reacts to what is under th | 189 |

## `services/landing/public/pitch/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`bite.js`](services/landing/public/pitch/bite.js) | the mascot's bite on the earnings slide of /pitch4: it runs to a loaf and takes a thin slice, which is the fee. The hidden surprise: a click on the mascot or on | 61 |
| [`deck.js`](services/landing/public/pitch/deck.js) | runs the pitch deck at /pitch: scales the 1920 x 1080 slides to the window and moves between them by keyboard, click, swipe and the address (#3 opens slide 3) | 135 |
| [`demo.js`](services/landing/public/pitch/demo.js) | plays the product demo on the Solution slide of /pitch4: a pointer picks YES on one market and NO on another, the card flips between them, and each is resolved  | 152 |
| [`exits.js`](services/landing/public/pitch/exits.js) | what the mascot does on a slide of /pitch4 before the deck leaves it, when the presenter moves forward. An exit is short, and it ends by calling `go`, which is  | 65 |
| [`finale.js`](services/landing/public/pitch/finale.js) | the finale of the closing slide of /pitch4: the badge lands, blinks twice, gives a thumbs-up with sparkles and points at the code. The timings are the ones of t | 56 |
| [`lever.js`](services/landing/public/pitch/lever.js) | the lever of the "Open a market" slide of the v4 deck: the mascot pulls it down, the initial seed climbs from $500 to $10,000 and the market climbs the site. Th | 90 |
| [`motion.js`](services/landing/public/pitch/motion.js) | the motion of the deck at /pitch4: it decides what plays when a slide arrives or is left (the scenes are in scenes.js and exits.js), starts the product demo and | 178 |
| [`partners.js`](services/landing/public/pitch/partners.js) | the launch partners counter of the Growth slide of /pitch4: two seconds after the slide arrives the number climbs to the partners in the list, their logos come  | 69 |
| [`runner.js`](services/landing/public/pitch/runner.js) | the mascot's plain run across a slide of /pitch4, used where a slide has no scene of its own. It runs along the bottom, in the direction of the slide change, al | 33 |
| [`scenes.js`](services/landing/public/pitch/scenes.js) | the mascot's scenes of the deck at /pitch4, by the slide that arrives: what plays when it comes going forward, going back, or when the page opens on it. A slide | 116 |
| [`sprites.js`](services/landing/public/pitch/sprites.js) | the mascot images of /pitch4: which file is which pose, loading them ahead of time, and putting a pose on a slide at a place given in the slide's own 1920 x 108 | 78 |
| [`team.js`](services/landing/public/pitch/team.js) | the Team slide of the v4 deck: the mascot runs in and pulls the rope of each curtain in turn, showing each person drawn as a bread roll; a few seconds later eac | 67 |

## `services/landing/scripts/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`build-docs.mjs`](services/landing/scripts/build-docs.mjs) | builds docs.brot.markets (services/landing/docs-site/*.html) from the pages in docs/wiki/, the reviewed text. Edit a page there, or the menu below, then run `no | 121 |
| [`build-legal.mjs`](services/landing/scripts/build-legal.mjs) | builds public/terms.html and public/privacy.html from docs/legal/TERMS-OF-SERVICE.md and PRIVACY-POLICY.md, the reviewed texts. Edit those files, then run `node | 121 |
| [`docs-layout.mjs`](services/landing/scripts/docs-layout.mjs) | the HTML around each page of docs.brot.markets: header, side menu (a drop-down on phones), previous and next links, footer. build-docs.mjs fills it. Styles: pub | 102 |
| [`markdown.mjs`](services/landing/scripts/markdown.mjs) | the small Markdown the reviewed texts use (docs/legal and docs/wiki) turned into HTML: headings, the Baked's one-line summaries (block quotes, as <p class="crum | 109 |

## `services/landing/tests/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`docs.test.mjs`](services/landing/tests/docs.test.mjs) | tests docs.brot.markets: each generated page says what its text in docs/wiki says, every page is in the menu, every link and file a page points at exists, and t | 135 |
| [`leads.test.mjs`](services/landing/tests/leads.test.mjs) | tests the waitlist store and the request limiter of the "coming soon" site (node --test) | 113 |
| [`pages.test.mjs`](services/landing/tests/pages.test.mjs) | tests what the pages of the "coming soon" site promise without a browser: every file they point at exists, the suggestion draft keeps its mention and hashtag, t | 199 |
| [`server.test.mjs`](services/landing/tests/server.test.mjs) | tests the "coming soon" site over real HTTP: waitlist API rules, static files, headers and /pitch | 193 |
| [`two.test.mjs`](services/landing/tests/two.test.mjs) | tests /2, the home page in the pitch deck's look: it says exactly what the home page says (only the look may differ), the mascot perches and moods are the same, | 53 |

## `tests/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`fixtures.test.ts`](tests/fixtures.test.ts) | the captured accounts in tests/fixtures are exactly the ones index.json describes. Git shows a changed .bin only as "binary files differ", so a swapped fixture  | 34 |

## `tests/brot/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`admin-helpers.ts`](tests/brot/admin-helpers.ts) | what the admin test files share: the zero key, the one-event check, the ConfigChanged snapshot check against the stored config, a look-alike config, and each cr | 122 |
| [`admin-init.test.ts`](tests/brot/admin-init.test.ts) | initialisation by the program's upgrade authority only, read from its ProgramData account (TP section 7): other keys, an immutable program, a foreign ProgramDat | 152 |
| [`admin-params.test.ts`](tests/brot/admin-params.test.ts) | creation parameters change future campaigns only (TP section 3.4.1): an open campaign keeps every byte it copied at opening and a new one takes the new values;  | 157 |
| [`admin-pause.test.ts`](tests/brot/admin-pause.test.ts) | I10′, first half (TP section 3.4.9): with the pause on, only `user_join_campaign` and `user_open_campaign` fail; every other instruction of Sprint 02 still runs | 52 |
| [`admin-refusals.test.ts`](tests/brot/admin-refusals.test.ts) | every refusal of the admin and team instructions with its exact error (X0.7): a signer without the role, the team rules, the zero keys, each creation parameter  | 147 |
| [`admin.test.ts`](tests/brot/admin.test.ts) | the admin and team instructions on their success paths, each with its event decoded from the transaction (TP sections 3.4.3 and 3.4.14), and the two-step admin  | 160 |
| [`campaigns.ts`](tests/brot/campaigns.ts) | a `Campaign` of any kind and its vault written straight into the world, so the tests of resolution and of the join lock do not depend on the opening's rules for | 189 |
| [`checks-init.test.ts`](tests/brot/checks-init.test.ts) | the checks negatives in LiteSVM through `admin_initialize_config`: non-canonical bumps, a look-alike System Program, the upgrade authority, a second initialisat | 121 |
| [`checks-support.ts`](tests/brot/checks-support.ts) | helpers of the checks negatives in LiteSVM: rewrite or place one account (owner, bytes, lamports), a PDA at a bump below the canonical one, another program's Pr | 99 |
| [`checks.test.ts`](tests/brot/checks.test.ts) | the checks negatives in LiteSVM through `admin_set_team` and `user_join_campaign`: the config under another owner, unsigned and read-only slots, a wrong tag or  | 113 |
| [`close-reserve.test.ts`](tests/brot/close-reserve.test.ts) | the closure review's fix to `close_campaign` with a reserved creator share (decision of 2026-10-09): a reserve blocks close unless the creator is the rent payer | 78 |
| [`close-revival.test.ts`](tests/brot/close-revival.test.ts) | the revival of a closed campaign, in one transaction: close_campaign, a System Program transfer into the closed address, then a program instruction on it. The l | 63 |
| [`close-sweep.test.ts`](tests/brot/close-sweep.test.ts) | close_campaign and sweep_fees on the binary: the rent of the campaign and its vault goes back to the stored rent payer, the vault's surplus goes to the fee vaul | 86 |
| [`codama-spike.test.ts`](tests/brot/codama-spike.test.ts) | the Codama spike (T9): the Kit client rendered from the Shank IDL (packages/sdk/src/idl/generated) against the hand-written kit. Without the program: every inst | 219 |
| [`cutoff-reproof.test.ts`](tests/brot/cutoff-reproof.test.ts) | the earlier-proof re-proof (decision of 2026-10-09): a campaign already in review moves its cut-off back to an earlier valid YES price proof, and to no later on | 43 |
| [`errors.ts`](tests/brot/errors.ts) | the program's custom error codes by name, so tests assert the exact refusal (X0.7). Mirrors programs/brot-markets/src/error.rs; a code appended there is appende | 152 |
| [`events.test.ts`](tests/brot/events.test.ts) | the events round-trip (T4, X0.4): every instruction of Sprint 02 emits exactly one event by self-CPI, decoded from its inner instruction; campaign events carry  | 211 |
| [`events.ts`](tests/brot/events.ts) | the program's events as layouts: an inner instruction to the program whose data is [0xFF, discriminator, payload], signed by the event authority (T4). Mirrors e | 102 |
| [`flows.ts`](tests/brot/flows.ts) | the common paths every test file starts from: a config initialised with the founder's values, a team, a paid or free price campaign opened on BTC/USD, an entry | 124 |
| [`idl.test.ts`](tests/brot/idl.test.ts) | the drift check (X0.6): the hand-written test kit (struct layouts, events, instruction builders, error codes) against the Shank IDL that `bun run idl` writes fr | 231 |
| [`idl.ts`](tests/brot/idl.ts) | the Shank IDL (packages/sdk/src/idl/brot_markets.json) in the test kit's terms: struct fields as layouts.ts types, enums as one byte, names as Shank writes them | 127 |
| [`instructions-settlement.ts`](tests/brot/instructions-settlement.ts) | builders for the ten instructions of Sprint 04, with the accounts in the frozen order of programs/brot-markets/src/instructions/interface.rs. The bodies are lan | 81 |
| [`instructions.ts`](tests/brot/instructions.ts) | builders for every instruction of the program, with the accounts in the frozen order of programs/brot-markets/src/instructions/mod.rs, and helpers that tamper w | 166 |
| [`invariant-checks.ts`](tests/brot/invariant-checks.ts) | the money invariants I1 to I15 (TP section 3.4.13) as small functions of the model state and the chain state. The randomized test runs them after every operatio | 208 |
| [`invariant-harness.ts`](tests/brot/invariant-harness.ts) | the world of the randomized test: a seeded generator, the wallets, the price accounts the operations refresh, the reference model of every campaign, and the cha | 160 |
| [`invariant-model.ts`](tests/brot/invariant-model.ts) | the reference model of one campaign's money, the state the randomized test expects the program to hold (TP sections 3.4.7, 3.4.13, 3.4.16). It sits on money-mod | 219 |
| [`invariant-open.ts`](tests/brot/invariant-open.ts) | the randomized test's opening and joining operations: a paid opening (the 10% fee and the prize), a team opening (free), a join on either side, the pause, each  | 177 |
| [`invariant-ops.ts`](tests/brot/invariant-ops.ts) | the randomized test's operations: the dispatch of every operation to its planner, the money moved by hand and by the wallets (drain, fund, sweep), the run of on | 195 |
| [`invariant-phase.ts`](tests/brot/invariant-phase.ts) | the phase-directed draw of the randomized test (Sprint 04, X0.1). A uniform draw over the kinds mostly names an operation the campaign's phase refuses, so the r | 42 |
| [`invariant-program.test.ts`](tests/brot/invariant-program.test.ts) | the money rules run through the program, with the Sprint 04 instructions on injected states: a one-sided pot's rows, the pause never blocking a payout (I10′), t | 236 |
| [`invariant-review.ts`](tests/brot/invariant-review.ts) | the randomized test's review operations: the price touch and the price-proof resolution, the window (confirm, void, contest) and the snapshot that ends it (TP s | 184 |
| [`invariant-rules.test.ts`](tests/brot/invariant-rules.test.ts) | the money rules checked on the reference model alone, with no program: the one-sided pot's rows, the winners' floor (I11), the late-entry refund as a property o | 176 |
| [`invariant-settle.ts`](tests/brot/invariant-settle.ts) | the randomized test's settlement operations: the payouts out of order and twice, the fee, the prize, the creator share and the close, each with its expected ref | 214 |
| [`invariants.test.ts`](tests/brot/invariants.test.ts) | the randomized test of the money (Sprint 04, gate 1, X0.1): a fixed seed draws operations over the whole sprint, and I1 to I15 are checked after each one agains | 80 |
| [`join-campaign-adds.test.ts`](tests/brot/join-campaign-adds.test.ts) | what a join writes: the Entry created on the first join with the baker's rent, the first baker, later joins of the same wallet on either side (Q3), the bookkept | 148 |
| [`join-campaign-estimate.test.ts`](tests/brot/join-campaign-estimate.test.ts) | pins the join tests' copy of the money math to the worked examples of TP section 3.4.16, so a failing join test points at the program and not at its expectation | 41 |
| [`join-campaign-lock.test.ts`](tests/brot/join-campaign-lock.test.ts) | the join lock (BR-06): once the reader of the campaign's kind knows the outcome, a join is refused with `OutcomeKnowable` and nothing moves; inside the proximit | 189 |
| [`join-campaign-pot.test.ts`](tests/brot/join-campaign-pot.test.ts) | the pot is the books, never the vault's balance: SOL sent by hand to a vault moves no pool, no prize, no first baker and no estimate (I15, first half); and the  | 88 |
| [`join-campaign-price.test.ts`](tests/brot/join-campaign-price.test.ts) | the price split at the join (TP section 3.4.8): joining a price campaign reads only the sponsored account the campaign locked at opening, fully verified, of its | 102 |
| [`join-campaign-refuses.test.ts`](tests/brot/join-campaign-refuses.test.ts) | every refusal of `user_join_campaign` on the campaign's rules, each with its own error (X0.7): not Open, entries closed, the pause, the minimum, the signed tota | 158 |
| [`join-campaign-slots.test.ts`](tests/brot/join-campaign-slots.test.ts) | the slot checks of `user_join_campaign` in the order of checks.rs, each with its own error: signer and writable flags, the three pairs that must differ, the Sys | 69 |
| [`join-campaign-support.ts`](tests/brot/join-campaign-support.ts) | what the join tests share: a world with a paid price campaign, its sponsored price kept fresh across clock moves, a refused join that moves nothing, SOL sent by | 203 |
| [`join-campaign-wallets.test.ts`](tests/brot/join-campaign-wallets.test.ts) | two wallets: A cannot change, close or redirect B's Entry, whichever slot of a join it puts that Entry in, and cannot join as B without B's signature (A-1) | 58 |
| [`kit.test.ts`](tests/brot/kit.test.ts) | checks the test kit itself, without the program binary: addresses, layout sizes against the Rust structs, the codec, and the instruction shapes of the frozen co | 97 |
| [`late-entries.test.ts`](tests/brot/late-entries.test.ts) | the late-entry refund (TP section 3.4.16, founder answer 7) on the program: a join at or after the YES proof's publish_time comes back to its baker whole, neith | 63 |
| [`layout-v1.test.ts`](tests/brot/layout-v1.test.ts) | the Sprint 02 accounts (layout version 1) and this sprint's reserve changes. The reserve took the `epoch` and `min_entry_lamports` of the campaign (16 of its 64 | 245 |
| [`layouts.ts`](tests/brot/layouts.ts) | the byte layouts of the program's accounts, instruction arguments and events, field by field in the order of the Rust structs, with one encoder and one decoder  | 133 |
| [`money-model.ts`](tests/brot/money-model.ts) | a reference model of the money, written apart from the program's math (TP 3.4.16): the randomized test checks the program against it, so it must not reuse the R | 77 |
| [`open-campaign-kinds.test.ts`](tests/brot/open-campaign-kinds.test.ts) | `user_open_campaign` for the four kinds other than the price kind (TP section 3.4.10): row 1 (`StakeAtLeast` closed in this build), the canonical arguments (D-j | 192 |
| [`open-campaign-paid.test.ts`](tests/brot/open-campaign-paid.test.ts) | the paid opening (TP section 3.4.16, I14): US$500 in lamports at the captured Pyth SOL/USD price, all of it into the vault, 90% bookkept as the prize and 10% he | 137 |
| [`open-campaign-refuses-payment.test.ts`](tests/brot/open-campaign-refuses-payment.test.ts) | `user_open_campaign` refuses rows 7 and 8 of TP section 3.4.10, each with its own error (X0.7): who must pay and how much, the signed `max_lamports`, the SOL/US | 128 |
| [`open-campaign-refuses-slots.test.ts`](tests/brot/open-campaign-refuses-slots.test.ts) | `user_open_campaign` refuses a wrong account in any of its nine slots, each with the error of the check that catches it (TP section 3.4.17): the creator's signa | 70 |
| [`open-campaign-refuses.test.ts`](tests/brot/open-campaign-refuses.test.ts) | `user_open_campaign` refuses rows 1 to 6 and 9 of TP section 3.4.10 for the price kind, each with its own error (X0.7): the kind, the direction, the metric acco | 152 |
| [`open-campaign-retry.test.ts`](tests/brot/open-campaign-retry.test.ts) | row 10 of TP section 3.4.10 (T17; X0.5, opening half): a retried opening with the same id fails on the existing account and charges nothing twice, while an addr | 92 |
| [`open-campaign-team.test.ts`](tests/brot/open-campaign-team.test.ts) | a team key opens free (P-3, I12, I14): no lamports move but the two rents, the campaign stores a zero creator share and no opening price, the SOL/USD slot is ne | 97 |
| [`opening.ts`](tests/brot/opening.ts) | what the opening's LiteSVM tests share: a world with the founder's config, one team key and a funded creator; the default opening's arguments, and the canonical | 92 |
| [`price-proof.test.ts`](tests/brot/price-proof.test.ts) | the price kind's YES proof window in LiteSVM (TP sections 3.4.6 and 3.4.8; Q4; D7): a touch proven from any address resolves YES inside `[opens_at, deadline]` w | 143 |
| [`price-support.ts`](tests/brot/price-support.ts) | what the price kind's LiteSVM tests share: a captured update's fields read from its bytes, a fresh address holding a price update (the YES proof slot accepts an | 53 |
| [`program.ts`](tests/brot/program.ts) | the program's addresses for the LiteSVM tests: ids, seeds, discriminators, PDAs and the known outside accounts (Pyth, the loader). Mirrors programs/brot-markets | 128 |
| [`readers-epoch.test.ts`](tests/brot/readers-epoch.test.ts) | the two epoch kinds through the program in LiteSVM, on the captured JitoSOL pool and mainnet vote account: the stake pool opening at its edges, resolution with  | 194 |
| [`readers-facts.test.ts`](tests/brot/readers-facts.test.ts) | the two fact readers in the program, on the mainnet accounts of tests/fixtures: a team key opens `SupplyAtMost` and `DammV2LockedAtLeast` campaigns on the real  | 199 |
| [`readers-price.test.ts`](tests/brot/readers-price.test.ts) | the price reader on the captured mainnet accounts in LiteSVM (TP section 3.4.8): an opening checked and priced on them as captured, a campaign left on them void | 93 |
| [`readers.ts`](tests/brot/readers.ts) | the third-party accounts the readers read, for the LiteSVM tests: the captured fixtures written into the world (moved, re-owned or edited in memory), a syntheti | 110 |
| [`resolve-campaign.test.ts`](tests/brot/resolve-campaign.test.ts) | the resolution table of TP section 3.4.6 as test cases, one per row and kind: `Yes` before the deadline, `No` after it, `met_late`, `Void` for `MissedWindow`, ` | 161 |
| [`resolve-refuses.test.ts`](tests/brot/resolve-refuses.test.ts) | what `resolve_campaign` refuses, each with its exact error and nothing written: a call forwarded by another program (`checks::top_level`, `bun test tests/ -t "r | 143 |
| [`resolve-support.ts`](tests/brot/resolve-support.ts) | what the resolution tests share: a world at a mainnet-like slot and epoch, a campaign of each kind written into it with its metric account (a synthetic mint, th | 205 |
| [`setup.ts`](tests/brot/setup.ts) | a LiteSVM world for the program's tests: the binary loaded, the clock set next to the captured Pyth prices, the upgrade authority recorded, funded wallets, and  | 203 |
| [`slot-matrix-fixtures.ts`](tests/brot/slot-matrix-fixtures.ts) | one valid instruction per Brot Markets instruction, in a world of its own, the baseline each slot case mutates. Every baseline must succeed before its cases mea | 267 |
| [`slot-matrix-mutate.ts`](tests/brot/slot-matrix-mutate.ts) | the mutations of the slot matrix: one slot of a valid instruction changed (unsigned, read-only, a stranger, an account of another type, or an alias of an earlie | 75 |
| [`slot-matrix.gen.ts`](tests/brot/slot-matrix.gen.ts) | every slot case of the matrix: each signer unsigned (MissingSignature), each writable slot read-only (NotWritable), a stranger, an account of each other type, a | 428 |
| [`slot-matrix.test.ts`](tests/brot/slot-matrix.test.ts) | runs every case of the slot matrix (tests/brot/slot-matrix.gen.ts) against the binary: each refused with its own BrotError, and no lamport of the instruction's  | 55 |
| [`structs.ts`](tests/brot/structs.ts) | the program's structs as layouts: accounts (GlobalConfig, Campaign, Entry), instruction arguments and events, each in the field order of its Rust struct | 172 |
| [`team-window.test.ts`](tests/brot/team-window.test.ts) | the team's acts in the review window, on the binary: confirm, void (an automatic void only: a team key never voids a YES or NO, decision of 2026-10-09), and con | 184 |
| [`void-refund.test.ts`](tests/brot/void-refund.test.ts) | a void on the binary: the prize goes back to the stored creator, the opening fee goes with it on a house failure and stays with Brot on an outside cause, and th | 82 |

## `tests/programs/cpi-proxy/src/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`lib.rs`](tests/programs/cpi-proxy/src/lib.rs) | a test-only program that forwards one instruction by CPI, so a test can show that `resolve_campaign` refuses to run below the top level (`checks::top_level`). N | 49 |

## `tests/sdk/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`math-vectors.test.ts`](tests/sdk/math-vectors.test.ts) | X0.3, the TypeScript half, first file: every vector the program's Rust math wrote into tests/vectors/math-vectors.csv (programs/brot-markets/tests/math_vectors. | 56 |
| [`snapshot-vectors.test.ts`](tests/sdk/snapshot-vectors.test.ts) | X0.3, the TypeScript half, second file: every vector of tests/vectors/snapshot-vectors.csv (programs/brot-markets/tests/math_vectors_snapshot.rs: the finalize s | 114 |
| [`vectors.ts`](tests/sdk/vectors.ts) | what the two vector replays share: reading a vector file, running an SDK function the way the Rust generators print a `Result` (`ERR:<BrotError>` for a refusal) | 58 |

---

## Manutenção

Regenere sempre que criar, remover ou renomear arquivo de código:

```bash
node scripts/codemap.js
```

O CI roda `node scripts/codemap.js --check` e **falha se este arquivo estiver desatualizado**. Um codemap velho é pior que nenhum: a IA confia nele e pula a leitura.
