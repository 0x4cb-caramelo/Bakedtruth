# CODEMAP

Todo arquivo de código do projeto, com uma linha sobre o núcleo de cada um.

**Existe para a IA achar o arquivo certo sem ler todos.** Junto com o limite de 200 linhas de [`code-style`](.claude/rules/code-style.md), é o que mantém a leitura barata: arquivos curtos e um índice dizendo onde olhar.

> 🤖 **Gerado** por `node scripts/codemap.js`. Não edite à mão — a próxima geração sobrescreve. Para melhorar uma descrição, melhore o cabeçalho `Purpose:` do arquivo.

| | |
|---|---|
| Arquivos mapeados | **268** |
| Acima de 200 linhas | **30** ⚠️ |
| Sem cabeçalho `Purpose:` | **100** ⚠️ |

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
- `scripts/codemap.js` — 223 linhas
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
| [`index.ts`](packages/sdk/src/index.ts) | public entry of the Brot Markets client library, shared by the site, the services, the scripts and the tests. Must stay free of React and Next imports | 21 |

## `programs/brot-markets/src/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`checks.rs`](programs/brot-markets/src/checks.rs) | every account check Anchor used to make, written by hand in one place (TP section 3.4.17). Each check returns its own error and has a negative test that fails w | 199 |
| [`constants.rs`](programs/brot-markets/src/constants.rs) | seeds, program ids, code ceilings and the duration and window constants compiled into the program, with the devnet-only drill values behind the `drill` feature | 121 |
| [`entrypoint.rs`](programs/brot-markets/src/entrypoint.rs) | the instruction dispatcher: the first byte of the instruction data picks the handler, the rest is that handler's arguments | 53 |
| [`error.rs`](programs/brot-markets/src/error.rs) | every refusal the program can return, one code per cause, as custom program errors | 190 |
| [`events.rs`](programs/brot-markets/src/events.rs) | the events, one per instruction, and how they leave the program: a self-CPI signed by the event-authority PDA, so they survive log truncation (T4) | 178 |
| [`layout.rs`](programs/brot-markets/src/layout.rs) | zero-copy byte layouts shared by accounts, instruction arguments and events: the little-endian field types and the one place where bytes become a typed view | 126 |
| [`lib.rs`](programs/brot-markets/src/lib.rs) | the Brot Markets program on Pinocchio: On-Chain Campaigns paid in SOL; declares the program id and wires the modules and the entrypoint | 26 |
| [`vault.rs`](programs/brot-markets/src/vault.rs) | the lamport vault of a campaign: SOL arriving from a signer's wallet by System Program transfer, signed by that wallet (TP section 3.4.4) | 33 |

## `programs/brot-markets/src/events/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`self_cpi.rs`](programs/brot-markets/src/events/self_cpi.rs) | how an event leaves the program: `emit` sends it to this program by self-CPI, signed by the event-authority PDA, and the event handler accepts only that signatu | 92 |

## `programs/brot-markets/src/instructions/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`mod.rs`](programs/brot-markets/src/instructions/mod.rs) | the program's interface: every instruction with its discriminator, its accounts in order and its arguments, for the dispatcher and for the Shank IDL (T9) | 144 |

## `programs/brot-markets/src/instructions/admin/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`accept_admin.rs`](programs/brot-markets/src/instructions/admin/accept_admin.rs) | `admin_accept_admin`: the pending admin signs and becomes the admin; the pending slot is cleared (second step of the two-step change) | 45 |
| [`initialize_config.rs`](programs/brot-markets/src/instructions/admin/initialize_config.rs) | `admin_initialize_config`: creates `GlobalConfig` and the data-less fee vault, once. Only the program's upgrade authority, read from its ProgramData account, ca | 106 |
| [`mod.rs`](programs/brot-markets/src/instructions/admin/mod.rs) | the admin and team instructions: initialisation, team keys, creation parameters, fee recipient, the two-step admin change and the pause (TP section 3.4.3) | 15 |
| [`pause_entries.rs`](programs/brot-markets/src/instructions/admin/pause_entries.rs) | `team_pause_entries`: a team key pauses entries and openings, `Normal` to `EntriesHalted` only. Payouts never pause (P4 section 4.5) | 45 |
| [`resume_entries.rs`](programs/brot-markets/src/instructions/admin/resume_entries.rs) | `admin_resume_entries`: the admin resumes entries, `EntriesHalted` to `Normal` only | 40 |
| [`set_creation_params.rs`](programs/brot-markets/src/instructions/admin/set_creation_params.rs) | `admin_set_creation_params`: the admin changes the creation parameters, each under its code ceiling; campaigns already open keep the values they copied | 43 |
| [`set_fee_recipient.rs`](programs/brot-markets/src/instructions/admin/set_fee_recipient.rs) | `admin_set_fee_recipient`: the admin sets where `sweep_fees` sends the fee vault (Sprint 04) | 54 |
| [`set_team.rs`](programs/brot-markets/src/instructions/admin/set_team.rs) | `admin_set_team`: the admin sets up to five team keys (Q12), one per person | 82 |
| [`shared.rs`](programs/brot-markets/src/instructions/admin/shared.rs) | what the admin and team instructions share: the zero address ("no key"), the admin role check and the `ConfigChanged` snapshot every change of the config emits | 50 |
| [`transfer_admin.rs`](programs/brot-markets/src/instructions/admin/transfer_admin.rs) | `admin_transfer_admin`: the admin names the pending admin, the first step of the two- step change; zero cancels a pending change | 51 |

## `programs/brot-markets/src/instructions/campaigns/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`mod.rs`](programs/brot-markets/src/instructions/campaigns/mod.rs) | opening a campaign (TP section 3.4.10). Resolution joins this folder in Sprint 03 | 6 |
| [`open_campaign.rs`](programs/brot-markets/src/instructions/campaigns/open_campaign.rs) | `user_open_campaign`: any wallet opens a price campaign paying US$500 in SOL at the Pyth SOL/USD price, 90% bookkept as the prize and 10% held as the opening fe | 192 |

## `programs/brot-markets/src/instructions/campaigns/open_campaign/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`create.rs`](programs/brot-markets/src/instructions/campaigns/open_campaign/create.rs) | row 10 of TP section 3.4.10 for `user_open_campaign`: the `Campaign` and its vault, created at their canonical PDAs with the creator paying both rents. An exist | 59 |
| [`payment.rs`](programs/brot-markets/src/instructions/campaigns/open_campaign/payment.rs) | row 7 of TP section 3.4.10, what an opening pays: US$ at the sponsored Pyth SOL/USD price of the config's feed, fresh and tight, at most the signed `max_lamport | 93 |
| [`record.rs`](programs/brot-markets/src/instructions/campaigns/open_campaign/record.rs) | steps 9 and 10 of `user_open_campaign`: every field an opening writes into the new `Campaign`, and the `CampaignOpened` event built from what was stored, so the | 111 |

## `programs/brot-markets/src/instructions/entries/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`entry_account.rs`](programs/brot-markets/src/instructions/entries/entry_account.rs) | the baker's `Entry` at a join: created at its canonical PDA on the first join, rent paid by the baker, and checked against the campaign, the baker and the total | 72 |
| [`join_campaign.rs`](programs/brot-markets/src/instructions/entries/join_campaign.rs) | `user_join_campaign`: a baker joins YES or NO with at least `min_entry_lamports`; the entry moves from the baker's wallet into the vault by System Program trans | 188 |
| [`mod.rs`](programs/brot-markets/src/instructions/entries/mod.rs) | entries: a baker joins a campaign with SOL (TP section 3.4.3) | 7 |

## `programs/brot-markets/src/math/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`fees.rs`](programs/brot-markets/src/math/fees.rs) | Brot's fee on the losing side and the one-sided fee per entry (P1 sections 3.3 and 3.5; TP section 3.4.16). Both round up | 27 |
| [`mod.rs`](programs/brot-markets/src/math/mod.rs) | the money and schedule math as pure functions: the opening conversion, the entry close, the fee and the creator share (TP section 3.4.16) | 17 |
| [`opening.rs`](programs/brot-markets/src/math/opening.rs) | the price of a paid opening in lamports at the Pyth SOL/USD price, and its split into the prize and Brot's opening fee (D-b, D-f; TP section 3.4.16; T25) | 79 |
| [`payout.rs`](programs/brot-markets/src/math/payout.rs) | the creator share, what winners split, and the return estimate a join checks against `min_return_bps` (D-g read as P-2; TP section 3.4.16) | 145 |
| [`rounding.rs`](programs/brot-markets/src/math/rounding.rs) | the multiply-divide and basis-point shares every money formula uses, rounded down or up in u128 with checked math: the one place a rounding direction is written | 75 |
| [`schedule.rs`](programs/brot-markets/src/math/schedule.rs) | when entries close and which durations a campaign may have (D-k; P1 section 3.6) | 73 |

## `programs/brot-markets/src/readers/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`cursor.rs`](programs/brot-markets/src/readers/cursor.rs) | bounds-checked little-endian reads over raw account data, for the readers. An account shorter than its layout is an error, never a panic | 57 |
| [`mod.rs`](programs/brot-markets/src/readers/mod.rs) | the closed set of readers that turn an on-chain account into a YES/NO answer, and the interface each one exposes: `validate_at_creation`, `outcome_knowable`, `t | 114 |
| [`price_touch.rs`](programs/brot-markets/src/readers/price_touch.rs) | read a Pyth `PriceUpdateV2` account into the price of one named feed, checking who wrote it and how well it was verified; the price kind's reader, and the SOL/U | 192 |

## `programs/brot-markets/src/state/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`campaign.rs`](programs/brot-markets/src/state/campaign.rs) | `Campaign` (`["campaign", id]`): everything about one campaign, and the loaders that check it. Its vault (`["vault", campaign]`) is data-less and its bump lives | 200 |
| [`config.rs`](programs/brot-markets/src/state/config.rs) | `GlobalConfig` (`["config"]`): roles, the pause, the creation parameters, the fee recipient and the open-campaign counter; and the creation parameters' own layo | 190 |
| [`entry.rs`](programs/brot-markets/src/state/entry.rs) | `Entry` (`["entry", campaign, baker]`): one baker's entry in one campaign, both sides, created on the baker's first join and closed by `settle_entry` (Sprint 04 | 67 |
| [`enums.rs`](programs/brot-markets/src/state/enums.rs) | the one-byte enums stored in accounts and passed in instruction data, with their checked conversion from a raw byte | 151 |
| [`mod.rs`](programs/brot-markets/src/state/mod.rs) | the accounts the program owns: their type tags, layout version and the one loader that runs the owner, length, tag and PDA checks before any field is read | 97 |

## `programs/brot-markets/tests/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`checks_host_accounts.rs`](programs/brot-markets/tests/checks_host_accounts.rs) | the checks that read whole accounts, on the host: the upgrade authority recorded in a ProgramData account, and the guards in front of account creation (T24) | 123 |
| [`checks_host_loaders.rs`](programs/brot-markets/tests/checks_host_loaders.rs) | the frozen loaders of `state` running the `checks` module on the host: owner, exact length, tag and version, then the PDA from the stored bump, each failure wit | 82 |
| [`checks_host.rs`](programs/brot-markets/tests/checks_host.rs) | each per-slot and per-byte check of the `checks` module on the host, over account views laid out like the runtime's: its own error on the wrong input, `Ok` on t | 181 |
| [`checks_mollusk_init.rs`](programs/brot-markets/tests/checks_mollusk_init.rs) | the checks negatives on the program's SBF binary in Mollusk, through `admin_initialize_config`: non-canonical bumps, a look-alike System Program, the upgrade au | 166 |
| [`checks_mollusk.rs`](programs/brot-markets/tests/checks_mollusk.rs) | the checks negatives on the program's SBF binary in Mollusk, through `admin_set_team`: the config under another owner, unsigned and read-only slots, a wrong tag | 158 |
| [`config_params.rs`](programs/brot-markets/tests/config_params.rs) | the floors and ceilings of the creation parameters (TP section 3.4.1, C43): the founder's values pass, every bound passes, and one step past a bound fails with  | 192 |
| [`cursor.rs`](programs/brot-markets/tests/cursor.rs) | the bounds-checked cursor on its own. Readers of variable layouts lean on it, so "an error, never a panic" is proved here and not through one reader's fixed siz | 69 |
| [`event_cpi.rs`](programs/brot-markets/tests/event_cpi.rs) | the self-CPI events on the host (T4): the instruction data `emit` sends for each of the six events, and the handler that accepts only the event authority, signi | 82 |
| [`layout.rs`](programs/brot-markets/tests/layout.rs) | pins the program's frozen interface: account and argument sizes, event sizes, the event authority, the discriminators and the enum bytes. A change here is a cha | 119 |
| [`math_estimate_properties.rs`](programs/brot-markets/tests/math_estimate_properties.rs) | the join's return estimate over random pots: in `Split` it is the settlement's own payout in bps and never below 10,000; in a one-sided pot it is the refund, wi | 100 |
| [`math_fees.rs`](programs/brot-markets/tests/math_fees.rs) | the fee functions and the rounding helpers under them on the host: the TP's worked examples, the 100% ceiling, and the tight round-up over random amounts and ra | 102 |
| [`math_opening_properties.rs`](programs/brot-markets/tests/math_opening_properties.rs) | the opening conversion and split over random dollars, prices and exponents: tight rounding toward Brot, an overflow exactly past u64, and a larger prize at 90/1 | 104 |
| [`math_opening.rs`](programs/brot-markets/tests/math_opening.rs) | the opening conversion and its 90/10 split on the host: worked example A, the captured devnet SOL/USD price, the supported exponents, and every refusal | 103 |
| [`math_payout_properties.rs`](programs/brot-markets/tests/math_payout_properties.rs) | the money invariants of a `Split` pot over random sides, prizes and rates: I3′, I11 and I13 and the share's bound, against both readings of D-g; I6 and I9 over  | 88 |
| [`math_payout_refusals.rs`](programs/brot-markets/tests/math_payout_refusals.rs) | what the `Split` math and the join estimate refuse: an empty side, a fee above the losing side, a share that would cost a winner, a rate above 100%, an entry ab | 94 |
| [`math_payout.rs`](programs/brot-markets/tests/math_payout.rs) | the creator share, the split payout and the join estimate on the TP's worked examples A, B and C to the lamport, the proposal's table under both readings of D-g | 155 |
| [`math_schedule_properties.rs`](programs/brot-markets/tests/math_schedule_properties.rs) | the schedule math over random durations, under whichever build runs it (drill or not): where entries close, that it is monotonic, and that both functions refuse | 79 |
| [`math_schedule.rs`](programs/brot-markets/tests/math_schedule.rs) | the schedule math on the host: the P1 section 3.6 table, the 3-to-90-day bounds, the past deadline, and the drill and mainnet values (T12) | 150 |
| [`open_campaign_payment.rs`](programs/brot-markets/tests/open_campaign_payment.rs) | row 7 of TP section 3.4.10 on the host up to the conversion, each refusal with its own error (X0.7): who must pay, the US$ floor, the SOL/USD account derived fr | 106 |
| [`open_campaign_rows.rs`](programs/brot-markets/tests/open_campaign_rows.rs) | rows 1 to 4 of TP section 3.4.10 on the host, each refusal with its own error (X0.7): `readers::validate_at_creation` over runtime-shaped accounts holding the c | 188 |
| [`price_opening.rs`](programs/brot-markets/tests/price_opening.rs) | what the price reader checks at an opening, on the captured Pyth accounts: the sponsored account each feed derives, the freshness and confidence bounds at their | 178 |
| [`price_reader.rs`](programs/brot-markets/tests/price_reader.rs) | the price reader against real Pyth accounts captured from devnet, and against the malformed versions of them. A wrong account must be an error, never a panic | 157 |
| [`team_keys.rs`](programs/brot-markets/tests/team_keys.rs) | the team rules of `admin_set_team` (Q12, TP section 3.4.9): at most five keys, none zero, none twice, every slot past `team_len` zero; each refusal with its own | 87 |
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

## `programs/brot-markets/tests/opening_support/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`mod.rs`](programs/brot-markets/tests/opening_support/mod.rs) | what the opening's host tests share: accounts laid out as the runtime lays them out, holding the captured Pyth bytes with fields changed in memory, and the fixt | 116 |

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
| [`build-idl.ts`](scripts/build-idl.ts) | writes the brot-markets IDL with the pinned shank-cli into packages/sdk/src/idl, then renders the Codama spike client from it (T9). `bun run idl`; also the last | 59 |
| [`bun-junit.mjs`](scripts/bun-junit.mjs) | reads the JUnit file `bun test --reporter=junit` writes: each test by name, with its body (empty when it passed, `<skipped />` when filtered out, `<failure …>`  | 18 |
| [`capture-fixtures.ts`](scripts/capture-fixtures.ts) | capture real on-chain accounts into tests/fixtures, so the reader tests decode the bytes third-party programs actually write instead of a layout someone typed f | 145 |
| [`checks-mutation.mjs`](scripts/checks-mutation.mjs) | the X0.9 evidence for the checks module: removes each check of programs/brot-markets/src/checks.rs in turn, rebuilds the program with cargo build-sbf, and shows | 200 |
| [`ci-secret-scan.js`](scripts/ci-secret-scan.js) | the pre-commit hook only protects commits made on a machine that has it wired. This scans every line a branch adds relative to its base, with the same patterns | 74 |
| [`codama-spike.ts`](scripts/codama-spike.ts) | the Codama spike (T9): renders a Kit client from the Shank IDL of brot-markets into packages/sdk/src/idl/generated. Sprint 05 decides whether the SDK adopts it; | 61 |
| [`codemap.js`](scripts/codemap.js) | let an AI locate the right file without reading every file. Pairs with the 200-line limit in .claude/rules/code-style.md — small files plus a one-line index mea | 223 |
| [`detach-os.ps1`](scripts/detach-os.ps1) | detach-os.ps1 — desconecta seu projeto do repositório AI Dev Operating System | 161 |
| [`detach-os.sh`](scripts/detach-os.sh) | detach-os.sh — desconecta seu projeto do repositório AI Dev Operating System | 157 |
| [`devnet-seed.ts`](scripts/devnet-seed.ts) | Seeds devnet with demo markets for the app, on named tokens (Metaplex metadata) so they read like | 246 |
| [`devnet-smoke.ts`](scripts/devnet-smoke.ts) | Devnet smoke test: the full USDC lifecycle against the deployed program, with the client stack | 273 |
| [`devnet.ts`](scripts/devnet.ts) | Shared setup for the devnet scripts: connection, deployer, Anchor client, sending, and the raw SPL | 222 |
| [`extract-external-links.sh`](scripts/extract-external-links.sh) | ⚠️ sem cabeçalho — adicione purpose/version/sprint | 16 |
| [`init-project.ps1`](scripts/init-project.ps1) | ⚠️ sem cabeçalho — adicione purpose/version/sprint | 34 |
| [`init-project.sh`](scripts/init-project.sh) | ⚠️ sem cabeçalho — adicione purpose/version/sprint | 25 |
| [`instruction-drift.js`](scripts/instruction-drift.js) | catch references in instruction files (CLAUDE.md, templates, skills, agents, WIZARD) to agents, commands and wizard stages that do not exist, and model generati | 160 |
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
| [`codemap.test.js`](scripts/test/codemap.test.js) | pin the header-extraction behaviour, because the quality of the whole map depends on it — a bad describe() produces a map that reads plausibly and points nowher | 170 |
| [`hooks.test.js`](scripts/test/hooks.test.js) | hooks.test.js — unit tests for the PreToolUse gates and the PostToolUse feedback hook | 278 |
| [`instruction-drift.test.js`](scripts/test/instruction-drift.test.js) | pin what counts as a dangling reference and what does not, because a noisy check gets switched off and a silent one lets the template's dead command table survi | 142 |
| [`pre-commit.test.js`](scripts/test/pre-commit.test.js) | prove the hook stops a staged credential in a real git repository, and gets out of the way everywhere else | 95 |
| [`sensor-wiring.test.js`](scripts/test/sensor-wiring.test.js) | pin the two severities — a missing sensor is an error in the OS repo and a warning in a derived project — and the "exists but never gates" class | 140 |
| [`sync-selfhosted.test.js`](scripts/test/sync-selfhosted.test.js) | ⚠️ sem cabeçalho — adicione purpose/version/sprint | 146 |

## `services/landing/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`server.mjs`](services/landing/server.mjs) | HTTP entry of the "coming soon" site (landing page, /pitch, waitlist API), bound to localhost behind the project's Cloudflare tunnel | 129 |

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
| [`mascot.js`](services/landing/public/mascot.js) | makes Baked, the mascot, live on the landing page: it stands on declared perches, hops to the one nearest to where the pointer rests, reacts to what is under th | 188 |

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

## `services/landing/tests/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`leads.test.mjs`](services/landing/tests/leads.test.mjs) | tests the waitlist store and the request limiter of the "coming soon" site (node --test) | 113 |
| [`pages.test.mjs`](services/landing/tests/pages.test.mjs) | tests what the pages of the "coming soon" site promise without a browser: every file they point at exists, the suggestion draft keeps its mention and hashtag, t | 159 |
| [`server.test.mjs`](services/landing/tests/server.test.mjs) | tests the "coming soon" site over real HTTP: waitlist API rules, static files, headers and /pitch | 192 |

## `target/types/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`pred_provable.ts`](target/types/pred_provable.ts) | Program IDL in camelCase format in order to be used in JS/TS | 3189 |

## `tests/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`fixtures.test.ts`](tests/fixtures.test.ts) | the captured accounts in tests/fixtures are exactly the ones index.json describes. Git shows a changed .bin only as "binary files differ", so a swapped fixture  | 34 |
| [`helpers.ts`](tests/helpers.ts) | Only for the fixture names; the file itself is read at run time by `loadFixture` | 424 |
| [`pred-provable.test.ts`](tests/pred-provable.test.ts) | ⚠️ sem cabeçalho — adicione purpose/version/sprint | 2799 |

## `tests/brot/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`admin-helpers.ts`](tests/brot/admin-helpers.ts) | what the admin test files share: the zero key, the one-event check, the ConfigChanged snapshot check against the stored config, a look-alike config, and each cr | 122 |
| [`admin-init.test.ts`](tests/brot/admin-init.test.ts) | initialisation by the program's upgrade authority only, read from its ProgramData account (TP section 7): other keys, an immutable program, a foreign ProgramDat | 152 |
| [`admin-params.test.ts`](tests/brot/admin-params.test.ts) | creation parameters change future campaigns only (TP section 3.4.1): an open campaign keeps every byte it copied at opening and a new one takes the new values;  | 117 |
| [`admin-pause.test.ts`](tests/brot/admin-pause.test.ts) | I10′, first half (TP section 3.4.9): with the pause on, only `user_join_campaign` and `user_open_campaign` fail; every other instruction of Sprint 02 still runs | 51 |
| [`admin-refusals.test.ts`](tests/brot/admin-refusals.test.ts) | every refusal of the admin and team instructions with its exact error (X0.7): a signer without the role, the team rules, the zero keys, each creation parameter  | 147 |
| [`admin.test.ts`](tests/brot/admin.test.ts) | the admin and team instructions on their success paths, each with its event decoded from the transaction (TP sections 3.4.3 and 3.4.14), and the two-step admin  | 159 |
| [`checks-init.test.ts`](tests/brot/checks-init.test.ts) | the checks negatives in LiteSVM through `admin_initialize_config`: non-canonical bumps, a look-alike System Program, the upgrade authority, a second initialisat | 105 |
| [`checks-support.ts`](tests/brot/checks-support.ts) | helpers of the checks negatives in LiteSVM: rewrite or place one account (owner, bytes, lamports), a PDA at a bump below the canonical one, another program's Pr | 99 |
| [`checks.test.ts`](tests/brot/checks.test.ts) | the checks negatives in LiteSVM through `admin_set_team` and `user_join_campaign`: the config under another owner, unsigned and read-only slots, a wrong tag or  | 113 |
| [`codama-spike.test.ts`](tests/brot/codama-spike.test.ts) | the Codama spike (T9): the Kit client rendered from the Shank IDL (packages/sdk/src/idl/generated) against the hand-written kit. Without the program: every inst | 154 |
| [`errors.ts`](tests/brot/errors.ts) | the program's custom error codes by name, so tests assert the exact refusal (X0.7). Mirrors programs/brot-markets/src/error.rs; a code appended there is appende | 92 |
| [`events.test.ts`](tests/brot/events.test.ts) | the events round-trip (T4, X0.4): every instruction of Sprint 02 emits exactly one event by self-CPI, decoded from its inner instruction; campaign events carry  | 198 |
| [`events.ts`](tests/brot/events.ts) | the program's events as layouts: an inner instruction to the program whose data is [0xFF, discriminator, payload], signed by the event authority (T4). Mirrors e | 82 |
| [`flows.ts`](tests/brot/flows.ts) | the common paths every test file starts from: a config initialised with the founder's values, a team, a paid or free price campaign opened on BTC/USD, an entry | 110 |
| [`idl.test.ts`](tests/brot/idl.test.ts) | the drift check (X0.6): the hand-written test kit (struct layouts, events, instruction builders, error codes) against the Shank IDL that `bun run idl` writes fr | 150 |
| [`idl.ts`](tests/brot/idl.ts) | the Shank IDL (packages/sdk/src/idl/brot_markets.json) in the test kit's terms: struct fields as layouts.ts types, enums as one byte, names as Shank writes them | 127 |
| [`instructions.ts`](tests/brot/instructions.ts) | builders for every instruction of the program, with the accounts in the frozen order of programs/brot-markets/src/instructions/mod.rs, and helpers that tamper w | 137 |
| [`join-campaign-adds.test.ts`](tests/brot/join-campaign-adds.test.ts) | what a join writes: the Entry created on the first join with the baker's rent, the first baker, later joins of the same wallet on either side (Q3), the bookkept | 146 |
| [`join-campaign-estimate.test.ts`](tests/brot/join-campaign-estimate.test.ts) | pins the join tests' copy of the money math to the worked examples of TP section 3.4.16, so a failing join test points at the program and not at its expectation | 41 |
| [`join-campaign-pot.test.ts`](tests/brot/join-campaign-pot.test.ts) | the pot is the books, never the vault's balance: SOL sent by hand to a vault moves no pool, no prize, no first baker and no estimate (I15, first half); and the  | 88 |
| [`join-campaign-refuses.test.ts`](tests/brot/join-campaign-refuses.test.ts) | every refusal of `user_join_campaign` on the campaign's rules, each with its own error (X0.7): not Open, entries closed, the pause, the minimum, the signed tota | 147 |
| [`join-campaign-slots.test.ts`](tests/brot/join-campaign-slots.test.ts) | the slot checks of `user_join_campaign` in the order of checks.rs, each with its own error: signer and writable flags, the three pairs that must differ, the Sys | 58 |
| [`join-campaign-support.ts`](tests/brot/join-campaign-support.ts) | what the join tests share: a world with the founder's config, a team and a paid BTC/USD campaign; SOL sent by hand with a plain System Program transfer; an acco | 170 |
| [`join-campaign-wallets.test.ts`](tests/brot/join-campaign-wallets.test.ts) | two wallets: A cannot change, close or redirect B's Entry, whichever slot of a join it puts that Entry in, and cannot join as B without B's signature (A-1) | 58 |
| [`kit.test.ts`](tests/brot/kit.test.ts) | checks the test kit itself, without the program binary: addresses, layout sizes against the Rust structs, the codec, and the instruction shapes of the frozen co | 92 |
| [`layouts.ts`](tests/brot/layouts.ts) | the byte layouts of the program's accounts, instruction arguments and events, field by field in the order of the Rust structs, with one encoder and one decoder  | 133 |
| [`open-campaign-paid.test.ts`](tests/brot/open-campaign-paid.test.ts) | the paid opening (TP section 3.4.16, I14): US$500 in lamports at the captured Pyth SOL/USD price, all of it into the vault, 90% bookkept as the prize and 10% he | 122 |
| [`open-campaign-refuses-payment.test.ts`](tests/brot/open-campaign-refuses-payment.test.ts) | `user_open_campaign` refuses rows 7 and 8 of TP section 3.4.10, each with its own error (X0.7): who must pay and how much, the signed `max_lamports`, the SOL/US | 92 |
| [`open-campaign-refuses-slots.test.ts`](tests/brot/open-campaign-refuses-slots.test.ts) | `user_open_campaign` refuses a wrong account in any of its nine slots, each with the error of the check that catches it (TP section 3.4.17): the creator's signa | 70 |
| [`open-campaign-refuses.test.ts`](tests/brot/open-campaign-refuses.test.ts) | `user_open_campaign` refuses rows 1 to 6 and 9 of TP section 3.4.10, each with its own error (X0.7): the kind, the direction, the metric account, the price and  | 120 |
| [`open-campaign-retry.test.ts`](tests/brot/open-campaign-retry.test.ts) | row 10 of TP section 3.4.10 (T17; X0.5, opening half): a retried opening with the same id fails on the existing account and charges nothing twice, while an addr | 92 |
| [`open-campaign-team.test.ts`](tests/brot/open-campaign-team.test.ts) | a team key opens free (P-3, I12, I14): no lamports move but the two rents, the campaign stores a zero creator share and no opening price, the SOL/USD slot is ne | 75 |
| [`opening.ts`](tests/brot/opening.ts) | what the opening's LiteSVM tests share: a world with the founder's config, one team key and a funded creator; the default opening's arguments; an opening sent w | 75 |
| [`program.ts`](tests/brot/program.ts) | the program's addresses for the LiteSVM tests: ids, seeds, discriminators, PDAs and the known outside accounts (Pyth, the loader). Mirrors programs/brot-markets | 82 |
| [`setup.ts`](tests/brot/setup.ts) | a LiteSVM world for the program's tests: the binary loaded, the clock set next to the captured Pyth prices, the upgrade authority recorded, funded wallets, and  | 199 |
| [`structs.ts`](tests/brot/structs.ts) | the program's structs as layouts: accounts (GlobalConfig, Campaign, Entry), instruction arguments and events, each in the field order of its Rust struct | 139 |

---

## Manutenção

Regenere sempre que criar, remover ou renomear arquivo de código:

```bash
node scripts/codemap.js
```

O CI roda `node scripts/codemap.js --check` e **falha se este arquivo estiver desatualizado**. Um codemap velho é pior que nenhum: a IA confia nele e pula a leitura.
