# CODEMAP

Todo arquivo de código do projeto, com uma linha sobre o núcleo de cada um.

**Existe para a IA achar o arquivo certo sem ler todos.** Junto com o limite de 200 linhas de [`code-style`](.claude/rules/code-style.md), é o que mantém a leitura barata: arquivos curtos e um índice dizendo onde olhar.

> 🤖 **Gerado** por `node scripts/codemap.js`. Não edite à mão — a próxima geração sobrescreve. Para melhorar uma descrição, melhore o cabeçalho `Purpose:` do arquivo.

| | |
|---|---|
| Arquivos mapeados | **791** |
| Acima de 200 linhas | **39** ⚠️ |
| Sem cabeçalho `Purpose:` | **40** ⚠️ |

## ⚠️ Acima do limite de 200 linhas

A regra diz "under 200 lines where practical". Estes passaram — vale checar se dá pra separar:

- `app/lib/mascot/engine.ts` — 304 linhas
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
- `scripts/os-self-test.js` — 406 linhas
- `scripts/pyth-sponsored-feeds.ts` — 201 linhas
- `scripts/slot-matrix-spec.ts` — 272 linhas
- `scripts/sync-selfhosted.js` — 349 linhas
- `scripts/test/hooks.test.js` — 278 linhas
- `scripts/tokenomics-model.ts` — 584 linhas
- `services/api/tests/api.test.ts` — 203 linhas
- `services/landing/tests/pages.test.mjs` — 214 linhas
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
- `tests/brot/slot-matrix-fixtures.ts` — 267 linhas
- `tests/brot/slot-matrix.gen.ts` — 428 linhas

---

## `(raiz)`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`.dependency-cruiser.cjs`](.dependency-cruiser.cjs) | the import rules of the SDK and its consumers (proposal 2.3 and 3.2; TP 3.2, 10): the read half never imports the transaction half; the SDK imports no Node buil | 91 |

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
| [`next.config.ts`](app/next.config.ts) | the site's Next.js settings: the security headers and the Content-Security-Policy (Sprint 09, X2.5). The policy allows the page's own origin, the one RPC origin | 106 |
| [`postcss.config.mjs`](app/postcss.config.mjs) | ⚠️ sem cabeçalho — adicione purpose/version/sprint | 8 |

## `app/app/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`layout.tsx`](app/app/layout.tsx) | the site's root layout (Sprint 09): the two fonts the site serves itself, the theme script in <head> before the stylesheet, the notice, the top bar, the page an | 54 |
| [`manifest.ts`](app/app/manifest.ts) | the installable PWA, manifest only (Sprint 13 DoD, S2; TP §3.6): the name, the start page, standalone display, the dark theme's colours and the icons scripts/pw | 33 |
| [`page.tsx`](app/app/page.tsx) | the home route (Sprint 10): the campaign list from the read API, with the search, the filters, the sort and the cards. Since Sprint 13 the campaigns the team un | 19 |

## `app/app/abrir/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`page.tsx`](app/app/abrir/page.tsx) | The creation route (the creation box, Sprint 19). A shell for Sprint 09: the route exists and shows its title; the content comes in Sprint 19 | 14 |

## `app/app/c/[id]/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`page.tsx`](app/app/c/[id]/page.tsx) | one campaign by its id, the client-drawn u64 (TP §3.4.1): the campaign page and its entry panel (Sprint 11). The server only passes the route's id and the link' | 42 |

## `app/app/fees/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`page.tsx`](app/app/fees/page.tsx) | the fee page at /fees (Sprint 13; BR-32): what Brot keeps, what the creator gets, a worked example net of the fee and the creator share, the one-sided pot, the  | 21 |

## `app/app/how-it-works/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`page.tsx`](app/app/how-it-works/page.tsx) | "How it works" at /how-it-works (Sprint 13; spec 3.2 and 3.15 of Sprint -1): the six steps of a campaign as one path that opens the same on a phone, then what t | 21 |

## `app/app/leaderboard/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`page.tsx`](app/app/leaderboard/page.tsx) | the devnet leaderboard at /leaderboard (Sprint 13; BR-29): wallets by points from the read API's /api/v1/leaderboard, read in the browser. The route existed as  | 20 |

## `app/app/my-entries/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`page.tsx`](app/app/my-entries/page.tsx) | the wallet's own entries, results and payouts at /my-entries (Sprint 12; the route name confirmed by the founder with L-01). The page reads the chain in the bro | 16 |

## `app/app/record/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`page.tsx`](app/app/record/page.tsx) | the public record at /record (Sprint 12; the route name confirmed by the founder with L-01): since Sprint 13, first who can do what (content/powers.md, BR-41) w | 25 |

## `app/components/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`copy-site.ts`](app/components/copy-site.ts) | the words every screen shows above any campaign or entry (BR-47; P1 §4.6), in English per L-01: the test-money notice and the not-audited notice, while each is  | 12 |
| [`mascot.tsx`](app/components/mascot.tsx) | Mounts the mascot once for the whole app. Each page decides where it may stand with | 31 |
| [`providers.tsx`](app/components/providers.tsx) | Phantom and Solflare are always listed (with an install link when missing); any other | 37 |
| [`site-header.tsx`](app/components/site-header.tsx) | the site's top bar (Sprint 09): the brand, the routes (Sprint 13 adds "How it works" and the fees, so both open from a phone too), the theme button and the wall | 68 |
| [`site-notice.tsx`](app/components/site-notice.tsx) | the two notices every screen shows (Sprint 09, BR-47, P1 §4.6), in English per the founder's L-01 decision: the test-money notice and the not-audited notice (th | 18 |
| [`toast.tsx`](app/components/toast.tsx) | ⚠️ sem cabeçalho — adicione purpose/version/sprint | 71 |
| [`wallet-button.tsx`](app/components/wallet-button.tsx) | the site's wallet control (Sprint 09, S1): "Use Installed Wallet" connects only from that click, through the installed wallet the site registered (MWA on Androi | 58 |

## `app/components/ui/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`button.tsx`](app/components/ui/button.tsx) | the buttons of the design: the primary action with its orbiting edge, the secondary and quiet ones, and the icon button. Colour from the tokens only | 69 |
| [`card.tsx`](app/components/ui/card.tsx) | the surface of a card or a panel: the panel colour, a 1px line and the card radius. Its contents set their own spacing | 21 |
| [`cx.ts`](app/components/ui/cx.ts) | joins class names, dropping the falsy ones. The only helper the primitives share | 7 |
| [`dialog.tsx`](app/components/ui/dialog.tsx) | the dialog of the design (a bottom sheet on phones): the browser's own modal <dialog>, which keeps focus inside, puts the page behind it out of reach and closes | 69 |
| [`empty-state.tsx`](app/components/ui/empty-state.tsx) | the empty state: a title, a line of text and an optional action, centred in the space of a list or a page | 17 |
| [`field.tsx`](app/components/ui/field.tsx) | the form controls: a labelled field with its help or error text, a text input, and a select. The error sets aria-invalid and the error colour; the text says wha | 50 |
| [`kind-tile.tsx`](app/components/ui/kind-tile.tsx) | the campaign's kind as a letter tile on the kind's own colour, with its name beside it in the screens. The five kinds (P1 §4.2) map from the program's reader ki | 35 |
| [`notice.tsx`](app/components/ui/notice.tsx) | the notice: a short message in one of three tones (info, warn, danger), with its icon and text, so colour is never the only signal. A close button is optional | 42 |
| [`odds-button.tsx`](app/components/ui/odds-button.tsx) | the YES and NO buttons: the side's word on the left and its price in cents on the right, with aria-pressed for the selected side | 41 |
| [`progress-bar.tsx`](app/components/ui/progress-bar.tsx) | the progress bar of the proof: a role=progressbar with its value, 6px on the proof and 3px on a card | 33 |
| [`segmented.tsx`](app/components/ui/segmented.tsx) | the segmented control for filters: toggle buttons with aria-pressed, the pressed one on the pressed tokens | 43 |
| [`skeleton.tsx`](app/components/ui/skeleton.tsx) | the loading block: a shimmering shape the size of the content it replaces. The shimmer stops when reduced motion is on | 19 |
| [`split-bar.tsx`](app/components/ui/split-bar.tsx) | the pot as a bar: YES, then NO, then the prize as a neutral end cap that belongs to neither side, with a legend in text | 38 |
| [`state-chip.tsx`](app/components/ui/state-chip.tsx) | the public state of a campaign as a chip: text and a dot, never colour alone (P1 §3.1). The states are the five of the public view, and contested. Sprint 12 (th | 46 |
| [`tabs.tsx`](app/components/ui/tabs.tsx) | the category tabs: one active tab with a 2px accent underline, arrow keys move between them. Keeps role=tablist, aria-selected and roving focus | 62 |

## `app/features/campaign-page/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`activity-panel.tsx`](app/features/campaign-page/activity-panel.tsx) | the recent entries and the chance history (L-23, answered yes), read from the chain's `EntryAdded` events (activity.ts) once per page view and again after an en | 80 |
| [`activity.ts`](app/features/campaign-page/activity.ts) | the campaign's recent activity and its chance history (L-23, answered yes), read from the chain until the indexer serves them (Sprint 08's activity route is not | 79 |
| [`campaign-header.tsx`](app/features/campaign-page/campaign-header.tsx) | the campaign page's header (spec 3.5 of Sprint -1): the way back, the kind, the public state from chain time (A-7), the team chip, the sentence as the page's on | 81 |
| [`campaign-page.tsx`](app/features/campaign-page/campaign-page.tsx) | the campaign page at /c/[id] (Sprint 11; spec 3.5 of Sprint -1): the header, the proof, the pot, the recent entries, the re-check panel, and the entry panel, or | 168 |
| [`chance-chart.tsx`](app/features/campaign-page/chance-chart.tsx) | the chance history (L-23): the YES share of the entries after each entry, as a step line (a share changes only when an entry goes in), one series in the design' | 89 |
| [`copy-states.ts`](app/features/campaign-page/copy-states.ts) | the words of the campaign states (Sprint 12; D-m vocabulary; English per L-01): closed and why, in review with the six-hour window, contested (L-04, answered "C | 128 |
| [`copy.ts`](app/features/campaign-page/copy.ts) | the campaign page's words (BR-23, BR-26, BR-27; D-m vocabulary; English per L-01): the rule of each kind in plain words, the proof's labels, the price facts and | 154 |
| [`format.ts`](app/features/campaign-page/format.ts) | how the campaign page writes what it read: a value in its field's units (a price in the feed's exponent, a supply or a liquidity as a whole number, a pool or a  | 70 |
| [`load.ts`](app/features/campaign-page/load.ts) | what the campaign page reads, through the SDK over RPC (the read API has no account bytes, no entries and no metric reading): the campaign at the route's id, th | 131 |
| [`payout-panel.tsx`](app/features/campaign-page/payout-panel.tsx) | the connected wallet's own lines on the campaign page (Sprint 12): "Your entry" with its sides and what it returns, as an estimate while the pot or the result c | 168 |
| [`pot-panel.tsx`](app/features/campaign-page/pot-panel.tsx) | the split and the pot (P1 §3.1–3.2; spec 3.5): each side's chance (its share of the entries; none for an empty pot, L-05) and its total in SOL, the bar, the pri | 58 |
| [`proof-panel.tsx`](app/features/campaign-page/proof-panel.tsx) | the campaign page's proof (BR-23; spec 3.5): the value read now through the SDK's copy of the program's reader against the target, "if read now", the distance,  | 157 |
| [`proof.ts`](app/features/campaign-page/proof.ts) | the proof a campaign page shows (BR-23; P1 §4.4): the value read now from the account the campaign reads, through the SDK's copy of the program's readers (owner | 159 |
| [`recheck-commands.ts`](app/features/campaign-page/recheck-commands.ts) | the re-check panel's commands (BR-23, "Anyone can re-check. Same account, same answer"; proposal §2.9): one JSON-RPC request that fetches the bytes the reader r | 68 |
| [`recheck-panel.tsx`](app/features/campaign-page/recheck-panel.tsx) | the re-check panel (BR-23; P1 §4.4 "Anyone can re-check. Same account, same answer"; spec 3.7): the account, its owner, the field the reader reads, the raw valu | 150 |
| [`state-panel.tsx`](app/features/campaign-page/state-panel.tsx) | what takes the entry panel's place once a campaign takes no entry (Sprint 12; BR-05, BR-10, BR-11, BR-25, BR-45): closed and why; in review with the result, the | 189 |
| [`states.ts`](app/features/campaign-page/states.ts) | what the campaign page says in each public state (Sprint 12; BR-05, BR-10, BR-11, BR-25, BR-45), as pure values from the stored campaign and the SDK's public vi | 165 |
| [`use-campaign-page.ts`](app/features/campaign-page/use-campaign-page.ts) | the campaign page's data (load.ts) in React: read once, then again every 20 seconds while the tab is visible (a devnet price updates about once a minute), and o | 73 |
| [`void-note.ts`](app/features/campaign-page/void-note.ts) | the team's note on a void, as the campaign page shows it (BR-45): the void-log record whose SHA-256 equals the `void_note_hash` the program stored, and which na | 25 |

## `app/features/campaigns/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`arrange.test.ts`](app/features/campaigns/arrange.test.ts) | the list's rules: the ranking order, the state, kind and search filters, the saved filter, the unlisted switch, the sorts, and the empty pot's chance (none) | 103 |
| [`arrange.ts`](app/features/campaigns/arrange.ts) | what the list shows and in which order (Sprint 10): the five states and "saved", the five kinds, the search, the unlisted switch, and the sort. The default orde | 62 |
| [`campaign-card.tsx`](app/features/campaigns/campaign-card.tsx) | one campaign's card in the list (Sprint 10): the kind, the sentence, the state, the pot in SOL, the chance per side (none for an empty pot), the estimated retur | 83 |
| [`campaign-list.tsx`](app/features/campaigns/campaign-list.tsx) | the home route's campaign list (Sprint 10): the search, the state and kind filters, the sort, the unlisted switch, and the cards in the ranking order. The data  | 146 |
| [`model.test.ts`](app/features/campaigns/model.test.ts) | the card values: the chance (none for an empty pot), the estimated return from the SDK's math, the 24-hour listing rule, and the sentence of a price campaign fr | 117 |
| [`model.ts`](app/features/campaigns/model.ts) | a campaign's card values, from the read API's fields and the SDK's math (Sprint 10): the pot in lamports, the chance per side (none for an empty pot, L-05), the | 112 |
| [`saved.ts`](app/features/campaigns/saved.ts) | the "Saved" list of campaigns, kept in this browser's localStorage (Sprint 10: a per-viewer convenience, never state anyone else needs). Every read and write is | 45 |
| [`sentence.ts`](app/features/campaigns/sentence.ts) | the campaign's sentence, from its stored fields (Sprint 10): a price campaign reads the feed's symbol from the SDK's pinned list and its target in the feed's ex | 53 |
| [`state-line.ts`](app/features/campaigns/state-line.ts) | a card's line for its state (Sprint 12: "the states of the card"), from the read API's fields: the chip (contested apart from in review, L-04), and one line aft | 54 |
| [`use-campaigns.ts`](app/features/campaigns/use-campaigns.ts) | the campaign list's data (Sprint 10): every campaign the read API lists, read in pages, with each card's values computed from the chain time the API reports. A  | 48 |

## `app/features/claim/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`claim-button.tsx`](app/features/claim/claim-button.tsx) | the "Receive" button for a reserved creator share (Sprint 12 DoD: the only claim on the site): prepares through the SDK (A-3, A-8 first), hands the exact bytes  | 81 |
| [`claim.ts`](app/features/claim/claim.ts) | "Receive" for a reserved creator share (TP §3.4.5, the reserve path), without React: the SDK's A-3 preparation for the connected wallet (`prepareClaim`: A-8's d | 112 |
| [`copy.ts`](app/features/claim/copy.ts) | the words of "Receive", the one claim on the site (a reserved creator share; D-m vocabulary; English per L-01): the button, its steps, and one message per way i | 40 |

## `app/features/entry/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`amount-field.tsx`](app/features/entry/amount-field.tsx) | the amount of an entry, in SOL: a decimal field (exact lamports, amount.ts), quick amounts, "Max" (the balance less the rents and the network fee, in 0.01 SOL s | 100 |
| [`amount.ts`](app/features/entry/amount.ts) | the amount a baker types, as lamports, exactly: no floating point between the text and the bigint the transaction carries. Accepts a dot or a comma, at most nin | 36 |
| [`copy-failures.ts`](app/features/entry/copy-failures.ts) | one message for each way an entry can fail (the Sprint 11 list: entries closed, outcome already known, no fresh price, pause, below the minimum, not enough SOL, | 150 |
| [`copy.ts`](app/features/entry/copy.ts) | the entry panel's words (BR-12, BR-27; D-m vocabulary): the panel, the five notices a baker reads before signing (the estimate, a large entry, the lock, the fee | 126 |
| [`entry-action.tsx`](app/features/entry/entry-action.tsx) | the entry panel's one button, the one that fits the moment: entries paused, waiting for a fresh price, "Use Installed Wallet", the devnet faucet when the wallet | 66 |
| [`entry-estimate.tsx`](app/features/entry/entry-estimate.tsx) | the live estimate under the amount (BR-09), in a polite live region: what the entry returns if its side wins, net of Brot's fee and the creator's share, with th | 73 |
| [`entry-notices.tsx`](app/features/entry/entry-notices.tsx) | the notices a baker reads before signing (Sprint 11 DoD; BR-12, P1 §3.2, P1 §4.6): the return is an estimate that changes until entries close; a large entry low | 51 |
| [`entry-panel.tsx`](app/features/entry/entry-panel.tsx) | the entry panel of the campaign page (Sprint 11; spec 3.6 of Sprint -1): YES or NO, the amount in SOL (the campaign's minimum, 0.01 SOL under P-5), the estimate | 193 |
| [`entry-review.tsx`](app/features/entry/entry-review.tsx) | the sheet "Check before you sign" (A-3): what the transaction carries, from the SDK's preparation of it — side, amount, the estimate net of the fee and the crea | 132 |
| [`entry-sheet.tsx`](app/features/entry/entry-sheet.tsx) | the one dialog of an entry, from "Review entry" to the result: the review (entry-review.tsx), the signing steps, the receipt and the failures (entry-status.tsx) | 79 |
| [`entry-status.tsx`](app/features/entry/entry-status.tsx) | the sheet after "Sign in wallet": the signing steps (the wallet, then confirming by polling, or checking a transaction the wallet never answered for, with the b | 166 |
| [`estimate.ts`](app/features/entry/estimate.ts) | the entry panel's estimate (BR-09; P1 §3.2): what an entry returns if its side wins, net of Brot's fee and the creator's share, with the baker's own amount adde | 82 |
| [`failures.ts`](app/features/entry/failures.ts) | why an entry did not go in, as one of the panel's failures, each with its own message (copy-failures.ts). A program refusal is named by the SDK's error map: its | 171 |
| [`landed.ts`](app/features/entry/landed.ts) | what a landed transaction says about its own failure: the program of the instruction that failed, read from the transaction as the cluster recorded it (`getTran | 46 |
| [`reload-countdown.tsx`](app/features/entry/reload-countdown.tsx) | A-8 on screen: under the "program updated" failure, the seconds left before the page reloads (the back-off of upgrade-pause.ts); at zero the page reloads. The f | 37 |
| [`retry-guard.ts`](app/features/entry/retry-guard.ts) | the retry guard (A-9; proposal §3.4 rule 6; TP §3.6 S1 rule 6). Before the wallet gets a join, the site saves what it read: the entry total the join is signed a | 198 |
| [`side-picker.tsx`](app/features/entry/side-picker.tsx) | YES or NO in the entry panel: each side with its chance (its share of the entries) and its estimated return per 1 for a 1 SOL entry, or "refund if alone" while  | 55 |
| [`submit.ts`](app/features/entry/submit.ts) | an entry from the panel to the chain, without React. `prepareEntry` is the SDK's A-3 preparation for the connected wallet's address (re-read, checked, built, su | 183 |
| [`upgrade-pause.ts`](app/features/entry/upgrade-pause.ts) | A-8's back-off. When Brot's program is no longer the deploy this site was built for, the page does not sign: it waits, then reloads to fetch a site built for th | 69 |
| [`use-entry-flow.ts`](app/features/entry/use-entry-flow.ts) | the entry's steps in React, around submit.ts: review (A-3: the SDK re-reads the campaign and the wallet's entry, checks, builds, summarises the bytes and simula | 182 |
| [`use-rents.ts`](app/features/entry/use-rents.ts) | the rents an entry opens, from the cluster (`getMinimumBalanceForRentExemption`), read once per page: a `Join` record on every entry and the `Entry` account on  | 53 |
| [`watch.ts`](app/features/entry/watch.ts) | watching an entry after the wallet, by polling and never a WebSocket (proposal §2.6): the signature's status (`getSignatureStatuses`), the finalized block heigh | 107 |

## `app/features/fees/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`copy.ts`](app/features/fees/copy.ts) | the words of the fee page (BR-32; P1 §1.2, §3.3–§3.5, §3.7; D-m vocabulary; English per L-01): what Brot keeps, what the creator gets, the worked example, the o | 88 |
| [`example.ts`](app/features/fees/example.ts) | the fee page's worked examples (BR-32), every number computed by the SDK's mirror of the program: the split of P1 §1.2 (6 SOL on YES and 4 SOL on NO, YES wins)  | 72 |
| [`fee-page.tsx`](app/features/fees/fee-page.tsx) | the fee page (BR-32; spec 3.10 of Sprint -1, prototype-lab/campaigns/js/screens/fees.js): what Brot keeps and what the creator gets, the worked example of P1 §1 | 129 |

## `app/features/how/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`copy.ts`](app/features/how/copy.ts) | the words of "How it works" (spec 3.2 and 3.15 of Sprint -1; D-m vocabulary; English per L-01): the six steps of a campaign from opening to payout, what chance  | 77 |
| [`how-page.tsx`](app/features/how/how-page.tsx) | "How it works" (spec 3.2 and 3.15 of Sprint -1, prototype-lab/campaigns/js/screens/how.js): the six steps as one ordered path that reads the same on a phone (th | 75 |

## `app/features/leaderboard/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`copy.ts`](app/features/leaderboard/copy.ts) | the words of the devnet leaderboard (spec 3.9 of Sprint -1; BR-29; D-m vocabulary; English per L-01): the table, the connected wallet's own line, the loading, e | 47 |
| [`leaderboard.tsx`](app/features/leaderboard/leaderboard.tsx) | the devnet leaderboard at /leaderboard (Sprint 13 DoD; spec 3.9 of Sprint -1, prototype-lab/campaigns/js/screens/ranking.js): wallets by points from /api/v1/lea | 162 |
| [`model.ts`](app/features/leaderboard/model.ts) | the leaderboard's values, as pure functions (Sprint 13): a wallet's hit rate (its points over its campaigns with a final YES or NO), and the connected wallet's  | 19 |
| [`use-leaderboard.ts`](app/features/leaderboard/use-leaderboard.ts) | the leaderboard's data in React (Sprint 13): every ranked wallet from the read API's /api/v1/leaderboard, read in pages of 100 up to 1,000 wallets, once when th | 47 |

## `app/features/my-entries/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`close-share.ts`](app/features/my-entries/close-share.ts) | a creator share paid by the campaign's close (the Sprint 12 security review, M1). A share the program kept in the vault (the creator's wallet was empty) is paid | 55 |
| [`copy.ts`](app/features/my-entries/copy.ts) | the words of "My entries" (Sprint 12; D-m vocabulary; English per L-01, route `/my-entries` confirmed by the founder): the wallet prompt, the totals received an | 38 |
| [`entry-row.tsx`](app/features/my-entries/entry-row.tsx) | one row of "My entries": the campaign's sentence (a link to its page), its state, the wallet's sides, what the entry returns or is owed, what it received (from  | 105 |
| [`events-in.ts`](app/features/my-entries/events-in.ts) | the program's events in one landed transaction, as the site reads them: `getTransaction` (JSON, confirmed) decoded by the SDK under its four decoder rules (this | 21 |
| [`history.ts`](app/features/my-entries/history.ts) | a wallet's history with the program, read from the chain until the indexer serves it (TP §6's `/api/v1/wallets/:address/entries` is Sprint 08's and not built):  | 146 |
| [`load.ts`](app/features/my-entries/load.ts) | what "my entries" reads from the chain (Sprint 12 DoD: open entries come from the chain): for every campaign the wallet may be in (the read API's list, and ever | 103 |
| [`model.ts`](app/features/my-entries/model.ts) | the rows of "my entries" (Sprint 12 DoD), as pure values: one per campaign the wallet entered or opened, with its sides and amounts, its public state (the SDK's | 136 |
| [`my-entries.tsx`](app/features/my-entries/my-entries.tsx) | "My entries" at /my-entries (Sprint 12; route name confirmed with L-01): the connected wallet's totals, received (from its settlement events only) and waiting f | 116 |
| [`received.ts`](app/features/my-entries/received.ts) | what a wallet received, summed from the program's settlement events and nothing else (Sprint 12 DoD: the sum on screen equals the wallet's `EntrySettled` and `C | 96 |
| [`use-my-entries.ts`](app/features/my-entries/use-my-entries.ts) | "My entries" data in React: the read API's campaign list (which campaigns exist now), the wallet's history from the chain (its events, one page at a time), then | 100 |

## `app/features/notices/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`registry.ts`](app/features/notices/registry.ts) | every mandatory notice that holds on devnet (BR-47; P1 §4.6; TP §3.6 "Notices and copy"; Sprint 13 DoD), each with the screens that must show it and the compone | 136 |

## `app/features/record/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`copy.ts`](app/features/record/copy.ts) | the words of the public record (Sprint 12; BR-45; English per L-01, route `/record` confirmed by the founder): what the record holds, how to check a record agai | 47 |
| [`live-keys.tsx`](app/features/record/live-keys.tsx) | the powers table's keys checked against the chain in the visitor's browser (BR-41; "anyone can re-check"): the program's upgrade authority from its ProgramData  | 84 |
| [`load-powers.ts`](app/features/record/load-powers.ts) | the powers table (BR-41), read on the server when the site is built from content/powers.md and parsed into blocks (markdown.ts). Its keys table must name the fo | 31 |
| [`load-void-log.ts`](app/features/record/load-void-log.ts) | the void log read on the server (the site's build and its server render; never in the browser): every record in content/void-log/ (not the README, the JSON Sche | 33 |
| [`markdown.ts`](app/features/record/markdown.ts) | the few Markdown blocks content/powers.md uses, parsed without a library (Sprint 13): headings, paragraphs, pipe tables (a header, a separator, rows) and inline | 55 |
| [`powers-view.tsx`](app/features/record/powers-view.tsx) | the powers table on /record (BR-41, Sprint 13 DoD): content/powers.md drawn on the server, block by block (headings, paragraphs, tables, inline code), with ever | 88 |
| [`record-list.tsx`](app/features/record/record-list.tsx) | the public record (Sprint 12 DoD: voids and decisions, with reasons, from content/void-log/; BR-45), drawn on the server from the void log: each void with its c | 85 |

## `app/features/report/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`copy.ts`](app/features/report/copy.ts) | the words of "Report this campaign" (C-10; Sprint 13; D-m vocabulary; English per L-01): where a report goes, what the team can do about it (unlist the campaign | 22 |
| [`report-campaign.tsx`](app/features/report/report-campaign.tsx) | "Report this campaign" on every campaign page (C-10, Sprint 13 DoD), in every state: a plain link to where reports go (no X script, widget or API, K-10), what t | 34 |
| [`unlisted.ts`](app/features/report/unlisted.ts) | the campaigns the team unlisted after a report (C-10; proposal §2.7), read on the server when the site is built from content/unlisted.json: a list of `{ "id": " | 45 |

## `app/features/wallet/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`mwa-chain.test.ts`](app/features/wallet/mwa-chain.test.ts) | X2.1. The chain the wallet registers for (from the site's cluster setting) equals the chain for the cluster the read API reports in /api/v1/health. Registration | 54 |
| [`register-mwa.ts`](app/features/wallet/register-mwa.ts) | the explicit Mobile Wallet Adapter registration (S1, proposal §3.4). Registers the MWA wallet once, for the chain of the site's cluster (never the RPC URL's), w | 46 |
| [`use-installed-wallet.ts`](app/features/wallet/use-installed-wallet.ts) | "Use Installed Wallet" (S1, proposal §3.4 rule 3): connect only from a person's click, through the installed wallet the site found (MWA on Android, or a browser | 39 |
| [`use-sol-balance.ts`](app/features/wallet/use-sol-balance.ts) | the connected wallet's SOL balance in lamports, read from the site's connection. `null` while it loads or when nothing is connected. A failed read leaves `null` | 33 |
| [`wallet-state.test.ts`](app/features/wallet/wallet-state.test.ts) | the wallet's view: disconnected, connected with a balance, no SOL (faucet on devnet only), the balance still loading, and the SOL formatting (four decimals, tru | 54 |
| [`wallet-state.ts`](app/features/wallet/wallet-state.ts) | the wallet's view, as pure logic: disconnected; connected with its address and SOL balance; connected with no SOL, which offers the devnet faucet only on devnet | 36 |

## `app/lib/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`api-client.test.ts`](app/lib/api-client.test.ts) | the read API client with a fake fetch: the URLs and query it builds, the body on 200 and on health's 503, the named ApiError on other answers, the unreachable c | 89 |
| [`api-client.ts`](app/lib/api-client.ts) | a read-only client for the read API (`services/api`, /api/v1): health, the campaign list, one campaign and, since Sprint 13, the devnet leaderboard. Typed from  | 150 |
| [`brand.ts`](app/lib/brand.ts) | Product name and copy in one place. The name is Brot Markets; Baked is the mascot. Only the copy the site shows lives | 13 |
| [`brot.ts`](app/lib/brot.ts) | the site's one door to the Brot Markets SDK (Sprint 09, A-6): the read half (constants, PDAs, decoding, public state) and the tx half (the transaction builders  | 17 |
| [`config.ts`](app/lib/config.ts) | ⚠️ sem cabeçalho — adicione purpose/version/sprint | 10 |
| [`content.ts`](app/lib/content.ts) | where the repository's content/ folder is, for what the site reads on the server when it is built (the void log, the powers table, the unlisted campaigns). The  | 21 |
| [`deploy.ts`](app/lib/deploy.ts) | A-8 on the site: the program deploy this bundle was built for (ProgramData's slot), baked at build time by next.config.ts. `null` when the build could not read  | 11 |
| [`fonts.ts`](app/lib/fonts.ts) | the site's two fonts, served by the site itself: Barlow Condensed 700 for display and numbers, Inter 400, 500 and 600 for text. next/font downloads them at buil | 26 |
| [`rpc.ts`](app/lib/rpc.ts) | the browser's one Kit RPC client, on the site's RPC (NEXT_PUBLIC_RPC_URL: public configuration, never a paid key, A-5). The SDK reads accounts, simulates and po | 13 |
| [`theme.ts`](app/lib/theme.ts) | the site's theme: the storage key, the script that sets data-theme before the first paint, and the reads and writes the theme button needs. Dark is the default  | 39 |

## `app/lib/mascot/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`bubble.ts`](app/lib/mascot/bubble.ts) | keeps the mascot's speech bubble inside the screen (Sprint 13 DoD: on phones the bubble does not cut). The | 16 |
| [`engine.ts`](app/lib/mascot/engine.ts) | Baked, the mascot, as a page resident. It does not follow the cursor freely: it hops to the | 304 |
| [`perches.ts`](app/lib/mascot/perches.ts) | Where the mascot may stand. A page declares perches as data attributes on any element: | 65 |

## `packages/sdk/src/read/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`accounts.ts`](packages/sdk/src/read/accounts.ts) | the program's own accounts decoded from their bytes (Codama's codecs, from the Shank IDL), after the checks the program makes before it reads a field: the owner | 70 |
| [`bytes.ts`](packages/sdk/src/read/bytes.ts) | small byte helpers the SDK shares, written without `Buffer`, `TextEncoder` or any Node or DOM API, so they run the same in a browser, in Bun and under React Nat | 39 |
| [`constants.ts`](packages/sdk/src/read/constants.ts) | the program's address and the constants compiled into it that a client needs: seeds, other programs, code ceilings, price and reader bounds, account sizes, and  | 115 |
| [`decoder.ts`](packages/sdk/src/read/decoder.ts) | the program's events out of a transaction as the RPC returns it (`getTransaction` with JSON encoding, or `simulateTransaction`), under the four decoder rules ev | 153 |
| [`events.ts`](packages/sdk/src/read/events.ts) | the program's events: each name with its discriminator and the Codama decoder of its payload, and the decoding of one event's inner-instruction data `[0xFF, dis | 99 |
| [`feeds.ts`](packages/sdk/src/read/feeds.ts) | the compiled lists of Pyth feeds a price campaign may name, one per cluster, as programs/brot-markets/src/feeds.rs compiles them (founder answer 1, 2026-10-09;  | 113 |
| [`format.ts`](packages/sdk/src/read/format.ts) | exact, deterministic display of the program's units: lamports as SOL with all nine decimals (no floating point), Unix seconds as a UTC date, basis points as a p | 54 |
| [`index.ts`](packages/sdk/src/read/index.ts) | `@brot/sdk/read`, the read half of the SDK: addresses, constants, codecs, the money math, events and their decoder, public state, the creation checks, the openi | 37 |
| [`knowable.ts`](packages/sdk/src/read/knowable.ts) | the join lock (BR-06) as the program applies it, for a client that wants to know whether a join can still go in: `outcomeKnowable` per kind (the price band reac | 66 |
| [`pdas.ts`](packages/sdk/src/read/pdas.ts) | every program-derived address a client needs: the config, the fee vault, a campaign and its vault, an entry, a join, the event authority, the program's ProgramD | 68 |
| [`points.ts`](packages/sdk/src/read/points.ts) | devnet points (BR-29; TP §3.5 "Points"; Q7 answered a): 1 point per campaign a wallet entered on the side that won, once that result is final. Volume and profit | 115 |
| [`program-data.ts`](packages/sdk/src/read/program-data.ts) | the program's last deploy (A-8), read from its ProgramData account under the upgradeable loader (loader v3), whose first 45 bytes are `[state u32 = 3 (ProgramDa | 86 |
| [`quote.ts`](packages/sdk/src/read/quote.ts) | what an opening pays (row 7 of TP 3.4.10): US$ at the sponsored Pyth SOL/USD price charged at `price − conf`, the 90/10 split, the `max_lamports` the creator si | 146 |
| [`recheck.ts`](packages/sdk/src/read/recheck.ts) | `recheck(campaign, rpcUrl)` (BR-23, "Anyone can re-check. Same account, same answer"): through any RPC the caller chooses, read the campaign, then the very acco | 158 |
| [`rpc.ts`](packages/sdk/src/read/rpc.ts) | the reads the SDK makes through any Solana RPC (Kit's `createSolanaRpc`, no paid key, A-5): an account's owner and bytes, several at once, the cluster's clock f | 72 |
| [`view.ts`](packages/sdk/src/read/view.ts) | a campaign's public state (BR-05; TP 3.4.2): Open, Closed, In review, Paid or Void, computed by one function from what the program recorded and the CHAIN's time | 82 |

## `packages/sdk/src/read/chain/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`accounts.ts`](packages/sdk/src/read/chain/accounts.ts) | the other programs' accounts the four non-price kinds read, parsed the way the program parses them, owner first: a classic SPL Token mint (`SupplyAtMost`), a Me | 119 |
| [`cursor.ts`](packages/sdk/src/read/chain/cursor.ts) | bounds-checked little-endian reads over raw account bytes, for the SDK's readers of other programs' accounts. An account shorter than its layout is `ReaderBadLa | 66 |
| [`epoch.ts`](packages/sdk/src/read/chain/epoch.ts) | the epoch kinds' opening rule (row 5's part for `StakePoolTvlAtLeast` and `StakeAtLeast`): the measured epoch has not started, and its latest plausible start is | 72 |
| [`price-rules.ts`](packages/sdk/src/read/chain/price-rules.ts) | the price rules the opening, the join lock and the proof share: freshness by time and by slot, the confidence bound, the two touch tests, row 3's minimum distan | 91 |
| [`price-update.ts`](packages/sdk/src/read/chain/price-update.ts) | a Pyth `PriceUpdateV2` account read the way the program reads it: owner first (the upgraded receiver `rec2HH…` only), exactly 134 bytes, the discriminator, Full | 62 |

## `packages/sdk/src/read/errors/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`codes.ts`](packages/sdk/src/read/errors/codes.ts) | the program's custom error codes by name (programs/brot-markets/src/error.rs), so a client names the exact refusal. Codes are appended there and here, never reu | 157 |
| [`index.ts`](packages/sdk/src/read/errors/index.ts) | one message per program error code, read from the IDL, and the refusal the SDK throws when its mirror of a program rule refuses (math, creation checks), carryin | 79 |

## `packages/sdk/src/read/math/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`fees.ts`](packages/sdk/src/read/math/fees.ts) | Brot's fee on the losing side and the one-sided fee per entry, both rounded up. Mirrors programs/brot-markets/src/math/fees.rs (P1 sections 3.3 and 3.5; TP 3.4. | 26 |
| [`index.ts`](packages/sdk/src/read/math/index.ts) | the money and schedule math of the program as pure TypeScript, for previews, estimates and checks: the opening conversion and split, the fees, the creator share | 61 |
| [`integers.ts`](packages/sdk/src/read/math/integers.ts) | the Rust integer types the program's math uses, as bigint bounds, and the checks that make bigint arithmetic fail where the program's checked arithmetic fails | 87 |
| [`opening.ts`](packages/sdk/src/read/math/opening.ts) | the price of a paid opening in lamports at the Pyth SOL/USD price, and its split into the prize and Brot's opening fee. Mirrors programs/brot-markets/src/math/o | 52 |
| [`payout.ts`](packages/sdk/src/read/math/payout.ts) | the creator share, what winners split, a winner's payout, the return estimate a join checks against `min_return_bps`, and a one-sided refund. Mirrors programs/b | 111 |
| [`rounding.ts`](packages/sdk/src/read/math/rounding.ts) | the multiply-divide and basis-point shares every money formula uses, rounded down or up, with the program's refusals: the one place a rounding direction is writ | 53 |
| [`schedule.ts`](packages/sdk/src/read/math/schedule.ts) | when entries close and which durations a campaign may have, for the real build and for the devnet drill build. Mirrors programs/brot-markets/src/math/schedule.r | 74 |
| [`settle.ts`](packages/sdk/src/read/math/settle.ts) | what one entry is paid under its campaign's snapshot, the late-entry split, and the reserve path of a credit below rent. Mirrors programs/brot-markets/src/instr | 94 |
| [`snapshot.ts`](packages/sdk/src/read/math/snapshot.ts) | the settlement snapshot: a campaign's totals and verdict turned into what finalize stores (the mode, the house fee, the creator share, `distributable`, what Bro | 136 |
| [`stored.ts`](packages/sdk/src/read/math/stored.ts) | what a campaign owes, read from its stored account alone, for the screens that follow a payout (Sprint 12): the pot rule `settle_entry` pays an entry by, what ` | 135 |
| [`void.ts`](packages/sdk/src/read/math/void.ts) | what a void, and a pot with no entry, returns to whoever opened and what Brot keeps. Mirrors programs/brot-markets/src/math/void.rs (TP 3.4.7, P-4, founder answ | 50 |

## `packages/sdk/src/read/validate/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`join.ts`](packages/sdk/src/read/validate/join.ts) | `checkJoin`, the SDK's mirror of `user_join_campaign`'s rules for the preview: from the campaign, the config, the baker's entry, the metric account and the chai | 79 |
| [`kinds.ts`](packages/sdk/src/read/validate/kinds.ts) | rows 2 and 3 of TP 3.4.10 (and the epoch kinds' part of row 5) for each of the five kinds: the metric account fits the kind and the target is neither met nor to | 107 |
| [`open-campaign.ts`](packages/sdk/src/read/validate/open-campaign.ts) | `validateOpenCampaign`, the SDK's mirror of `user_open_campaign`'s rules (TP 3.4.10) for the preview: from the arguments, the config, the chain's clock and the  | 123 |
| [`open-rules.ts`](packages/sdk/src/read/validate/open-rules.ts) | the opening's rules that read no account, in the program's order: the argument sizes (row 9), row 1 (the kind names a reader and opens in this build), the canon | 85 |
| [`rows.ts`](packages/sdk/src/read/validate/rows.ts) | which row of the opening's checks (TP 3.4.10) each refusal belongs to, so a preview can say "row 7: the price moved past your maximum" next to the program's own | 55 |

## `packages/sdk/src/schemas/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`index.ts`](packages/sdk/src/schemas/index.ts) | `@brot/sdk/schemas`, the zod 4 schemas the site, the app and the services share: the opening's input; the public format of a void-log record (Sprint 12); the re | 11 |
| [`open-campaign.ts`](packages/sdk/src/schemas/open-campaign.ts) | the zod schema of an opening's input (TP Appendix B, written here as Sprint 05 must), shared by the SDK, the site, the app and the preview: what a creator may c | 117 |
| [`void-log.ts`](packages/sdk/src/schemas/void-log.ts) | the public format of a `content/void-log/` record (TP §3.4.7, BR-45; Sprint 12 gives it its public format, which Sprint 05's `scripts/team/void.ts` started): a  | 135 |

## `packages/sdk/src/tx/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`index.ts`](packages/sdk/src/tx/index.ts) | `@brot/sdk/tx`, the transaction half of the SDK: every instruction builder, and (A-3) the path a baker's or creator's transaction takes before the wallet signs  | 23 |
| [`message.ts`](packages/sdk/src/tx/message.ts) | the transaction message a prepared instruction is simulated and signed in: one instruction, the signer paying, the cluster's latest blockhash. The network fee a | 31 |
| [`prepare-claim.ts`](packages/sdk/src/tx/prepare-claim.ts) | A-3 for the one claim a person ever signs (TP §3.4.5, the reserve path; TP v0.0.1 Q2, answered b): a creator share the program kept in the vault because paying  | 124 |
| [`prepare-open.ts`](packages/sdk/src/tx/prepare-open.ts) | A-3 for an opening: re-read the config, the SOL/USD price account, the metric account, the campaign's address and the chain's clock; quote the payment and its ` | 190 |
| [`prepare.ts`](packages/sdk/src/tx/prepare.ts) | A-3 for a join: re-read the campaign, the config, the baker's entry, the metric account and the chain's clock through the RPC; check them with the SDK's mirror  | 126 |
| [`simulate.ts`](packages/sdk/src/tx/simulate.ts) | simulate a transaction before the wallet signs it (A-3): the cluster runs it on its current state, unsigned, with the latest blockhash, and the SDK reports the  | 90 |
| [`summary-brot.ts`](packages/sdk/src/tx/summary-brot.ts) | the summary of this program's own instructions (A-3). The structure is checked against the IDL first: the exact data size, the exact account count, each slot's  | 163 |
| [`summary-budget.ts`](packages/sdk/src/tx/summary-budget.ts) | the summary's reading of compute-budget instructions (Sprint 05 review, H1): the unit limit and the unit price decoded, the priority fee they allow bounded and  | 87 |
| [`summary-other.ts`](packages/sdk/src/tx/summary-other.ts) | what the summary says for the instructions that move no money out of a signer's wallet (the admin, team and settlement instructions), each with the values it si | 122 |
| [`summary.ts`](packages/sdk/src/tx/summary.ts) | the deterministic summary of a transaction before the wallet signs it (A-3). `summarizeMessage` reads the very bytes the wallet signs: the compiled message, dec | 173 |

## `packages/sdk/src/tx/builders/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`admin.ts`](packages/sdk/src/tx/builders/admin.ts) | the admin and team-configuration instructions, built by the Codama client from the Shank IDL with every program address derived here: initialisation, the team k | 98 |
| [`campaign.ts`](packages/sdk/src/tx/builders/campaign.ts) | the instructions of a campaign's open life, built by the Codama client with every program address derived here: opening (`user_open_campaign`), joining (`user_j | 136 |
| [`review.ts`](packages/sdk/src/tx/builders/review.ts) | the team's acts inside a campaign's review window, built by the Codama client: confirm the result, void it with a reason and the hash of its public note, open a | 55 |
| [`settlement.ts`](packages/sdk/src/tx/builders/settlement.ts) | the permissionless settlement instructions, built by the Codama client with every program address derived here: finalize, the late-join tally, an entry's payout | 104 |

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
| [`team_confirm_result.rs`](programs/brot-markets/src/instructions/resolution/team_confirm_result.rs) | `team_confirm_result`: a team key ends the review window now and the outcome stands; the snapshot runs at once, so the campaign is `Settling` (TP sections 3.4.3 | 78 |
| [`team_open_contest.rs`](programs/brot-markets/src/instructions/resolution/team_open_contest.rs) | `team_open_contest`: DISABLED until Sprint 14 (decision of 2026-10-09). A contest would freeze a pot with no exit (its payout is paused until an instruction tha | 22 |
| [`team_shared.rs`](programs/brot-markets/src/instructions/resolution/team_shared.rs) | what the three team instructions share: the team-key check, the event number each event takes from the campaign, and the refusal of a status that is not the sto | 31 |
| [`team_void_campaign.rs`](programs/brot-markets/src/instructions/resolution/team_void_campaign.rs) | `team_void_campaign(reason, note_hash)`: a team key voids a campaign inside the review window with a reason it may choose and the hash of its note; the snapshot | 102 |
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
| [`finalize_campaign.rs`](programs/brot-markets/src/instructions/settlement/finalize_campaign.rs) | `finalize_campaign`: the snapshot of a reviewed campaign once its window has ended. Any wallet, permissionless; it chooses nothing. It runs `finalize_snapshot`, | 56 |
| [`mod.rs`](programs/brot-markets/src/instructions/settlement/mod.rs) | the instructions that settle a campaign after its outcome: the snapshot, the payouts to people and Brot's fee, the prize, the close and the sweep (TP section 3. | 17 |
| [`rules.rs`](programs/brot-markets/src/instructions/settlement/rules.rs) | the settlement rules as pure functions: what one entry is paid under the snapshot's mode, and the reserve path of a credit below rent (TP section 3.4.5; amendme | 131 |
| [`settle_creator_share.rs`](programs/brot-markets/src/instructions/settlement/settle_creator_share.rs) | `settle_creator_share`: pays the creator's share once, to the stored creator only (TP 3.4.5, I13). A credit that would leave the creator's wallet below its rent | 126 |
| [`settle_entry.rs`](programs/brot-markets/src/instructions/settlement/settle_entry.rs) | `settle_entry`: pays one entry from the vault to its stored baker and closes the Entry, its rent back to the baker (TP 3.4.5). A losing entry goes through the s | 161 |
| [`settle_prize.rs`](programs/brot-markets/src/instructions/settlement/settle_prize.rs) | `settle_prize`: returns the prize to whoever opened in `OneSided` and `Refund`, and the opening fee too on a house-failure void (TP sections 3.4.7, 3.4.16; P-4) | 77 |
| [`snapshot.rs`](programs/brot-markets/src/instructions/settlement/snapshot.rs) | `finalize_snapshot`, the one snapshot path that `finalize_campaign`, `team_confirm_result` and `team_void_campaign` call: it takes the campaign's totals and ver | 158 |
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
| [`snapshot_rows.rs`](programs/brot-markets/tests/vectors_support/snapshot_rows.rs) | the `snapshot` rows of the snapshot vectors: random pots under the four verdicts, one in three of the YES and NO rows (about a sixth of all) placed within a few | 103 |

## `prototype-lab/campaigns/js/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`effects.js`](prototype-lab/campaigns/js/effects.js) | the approved prototype's two effects, the dot field that brightens around the pointer and the spotlight that follows the pointer across the card grid, plus the  | 71 |
| [`format.js`](prototype-lab/campaigns/js/format.js) | how the site writes numbers and times: SOL amounts from lamports, the US$ display value, percentages, short addresses, a moment in UTC and in the visitor's time | 88 |
| [`main.js`](prototype-lab/campaigns/js/main.js) | starts the prototype: icons, the theme switch (saved as `brot-theme`), the wallet button, the phone menu, the search box, the site-wide notices, the effects, th | 97 |
| [`model.js`](prototype-lab/campaigns/js/model.js) | what the screens compute from a campaign: the pot's parts, the chance (each side's share of the entries), the estimated return of an entry net of Brot's fee and | 87 |
| [`router.js`](prototype-lab/campaigns/js/router.js) | the prototype's hash router: each route of TP §3.6 maps to a screen module loaded on first use. A screen is `export default (params) => ({ title, html, mount(ma | 84 |
| [`state.js`](prototype-lab/campaigns/js/state.js) | the prototype's state: the wallet in each of its states, the switches that show the site-wide notices (entries paused, a stale SOL/USD price, the country switch | 69 |

## `prototype-lab/campaigns/js/data/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`campaigns-done.js`](prototype-lab/campaigns/js/data/campaigns-done.js) | the campaigns past their entries in the prototype's mock data: one in its six-hour review, one contested, paid YES, paid NO, a one-sided pot refunded, two voids | 83 |
| [`campaigns.js`](prototype-lab/campaigns/js/data/campaigns.js) | the open and closing campaigns of the prototype's mock data, in the program's own fields (Sprint 02's `Campaign`): every kind, a paid opening with its prize, a  | 78 |
| [`index.js`](prototype-lab/campaigns/js/data/index.js) | one door to the mock data: every campaign by id, the listed ones in ranking order (TP §3.5: the partner highlight first), and the demo wallet's history and the  | 23 |
| [`wallet.js`](prototype-lab/campaigns/js/data/wallet.js) | the demo wallet's history for "My entries" and the ranking: its entries on each side, what it received as a baker, as a creator (the 1%) and as whoever opened ( | 49 |

## `prototype-lab/campaigns/js/mascot/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`body.js`](prototype-lab/campaigns/js/mascot/body.js) | draws Baked, the mascot, on the campaigns prototype: the sprite with its eight poses, the shadow and the speech bubble. It knows nothing about where to stand; m | 95 |
| [`mascot.js`](prototype-lab/campaigns/js/mascot/mascot.js) | makes Baked, the mascot, live on the campaigns prototype: it stands on declared perches, hops to the one nearest to where the pointer rests, reacts to what is u | 188 |
| [`senses.js`](prototype-lab/campaigns/js/mascot/senses.js) | what Baked, the mascot, notices on the campaigns prototype: where the pointer rests, scrolling, keyboard focus, how long the visitor has been still, and which e | 92 |

## `prototype-lab/campaigns/js/screens/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`campaign-head.js`](prototype-lab/campaigns/js/screens/campaign-head.js) | the campaign page's header, split-and-pot block and timeline. The header: back link, the eyebrow (kind chip, display name, partner seal, state badge with its vi | 133 |
| [`campaign-proof.js`](prototype-lab/campaigns/js/screens/campaign-proof.js) | the campaign page's proof block and re-check panel. The proof: the value read now against the target, the distance (price, burn) or a bar (targets that only gro | 128 |
| [`campaign-state.js`](prototype-lab/campaigns/js/screens/campaign-state.js) | the campaign page's blocks that change with the state. The state card takes the entry panel's place once entries close (spec 3.5 table): closed with the deadlin | 149 |
| [`campaign.js`](prototype-lab/campaigns/js/screens/campaign.js) | the campaign page, #/c/:id (spec 3.5; TP §3.6; S11–S12), in every state. Left: the header, the proof, the creator notice, the split and pot, the timeline, the r | 174 |
| [`error.js`](prototype-lab/campaigns/js/screens/error.js) | the error pages of spec 3.14 besides the 404: something broke on our side (500), with Baked tired and a way to try again, and offline, which retries by itself w | 43 |
| [`fees.js`](prototype-lab/campaigns/js/screens/fees.js) | the fee page (#/fees): what Brot keeps and what the creator gets; TP worked example A in SOL (a paid campaign, YES wins), every lamport through the program's ma | 114 |
| [`home-mosaic.js`](prototype-lab/campaigns/js/screens/home-mosaic.js) | the left half of the home page's mosaic, the "Open now" carousel of the top-ranked campaigns that take entries: each slide has its chance, pot bar, YES/NO short | 171 |
| [`home-parts.js`](prototype-lab/campaigns/js/screens/home-parts.js) | what the home page and the list of all campaigns share: the state and kind filters (the five public states and Saved, spec 3.2), the sorts, the view kept in the | 150 |
| [`home.js`](prototype-lab/campaigns/js/screens/home.js) | the home page (#/): a top line with the opening action and its cost, the mosaic (the carousel of home-mosaic.js, then "Closing soon" and "Answered recently"), h | 161 |
| [`how.js`](prototype-lab/campaigns/js/screens/how.js) | how a campaign works (#/how), as a path that reads the same on a phone: the six steps from opening to payout, what "chance" means, why there is no early exit, w | 60 |
| [`list.js`](prototype-lab/campaigns/js/screens/list.js) | every campaign (#/campaigns), unlisted ones included (TP §3.6, spec 3.3), as a dense list: a search read from the hash (#/campaigns?q=sol matches the sentence,  | 175 |
| [`me-creator.js`](prototype-lab/campaigns/js/screens/me-creator.js) | the wallet as creator and opener, in "My entries": one row per campaign it opened, saying where its 1% of the entries, the prize, the 10% opening fee and the ac | 118 |
| [`me-rows.js`](prototype-lab/campaigns/js/screens/me-rows.js) | the rows of "My entries": one per campaign the wallet joined, with the sentence, the side or sides and the amount, the state, and what matters in that state: th | 114 |
| [`me.js`](prototype-lab/campaigns/js/screens/me.js) | "My entries" (#/entries): a connect prompt with no wallet, a skeleton while it connects, then the summary (in open campaigns, waiting for a result, received in  | 126 |
| [`not-found.js`](prototype-lab/campaigns/js/screens/not-found.js) | the 404 screen: a path that matches no route, or a campaign id that does not exist. Baked sulks, and there is one way back to the campaigns | 17 |
| [`open-preview.js`](prototype-lab/campaigns/js/screens/open-preview.js) | sections 3 and 4 of the creation box (spec 3.12). 3 Preview, built only from what the transaction would carry: the sentence, the value now with "If read now", t | 170 |
| [`open-signing.js`](prototype-lab/campaigns/js/screens/open-signing.js) | what the creation box refuses and how it signs. One plain message per refusal of user_open_campaign (spec 3.12; TP §3.4.10 rows 1–10: program codes 6043–6061, t | 199 |
| [`open-slots.js`](prototype-lab/campaigns/js/screens/open-slots.js) | sections 1 and 2 of the creation box (spec 3.12). 1 What: the combobox "What should the chain answer?" over the templates and the known names, grouped by kind,  | 161 |
| [`open-templates.js`](prototype-lab/campaigns/js/screens/open-templates.js) | what the creation box knows before it reads anything: the five sentence templates (spec 1.5, P1 §4.2), the pinned Pyth feeds and the reviewed account names (A-1 | 189 |
| [`open.js`](prototype-lab/campaigns/js/screens/open.js) | the creation box at /abrir and /open (spec 3.12; TP §3.6; proposal §2.9, flow F0), where any wallet opens an On-Chain Campaign: 1 What and 2 Details build the s | 200 |
| [`powers.js`](prototype-lab/campaigns/js/screens/powers.js) | the public record (#/record): the keys by role and address (never by person), every power with who holds it and its limit in code (TP §3.4.9), said plainly that | 99 |
| [`ranking.js`](prototype-lab/campaigns/js/screens/ranking.js) | the devnet leaderboard (#/leaderboard): wallets by points (1 per campaign entered on the right side, Q7), with the campaigns each entered and its hit rate, the  | 93 |
| [`review.js`](prototype-lab/campaigns/js/screens/review.js) | the screens index for review (#/screens): every route and every state in one place, with links that set the switches (wallet, pause, stale price, country, valve | 102 |
| [`share-card.js`](prototype-lab/campaigns/js/screens/share-card.js) | the share card (#/card/:id), the 1200 × 630 image an X post shows for a campaign (/c/[id]/opengraph-image): before the result, the sentence, the live value agai | 109 |

## `prototype-lab/campaigns/js/ui/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`card.js`](prototype-lab/campaigns/js/ui/card.js) | the campaign card, shared by the home grid, the full list, the opening preview and the screens index: kind and state, the generated sentence, the live value aga | 120 |
| [`entry-flow.js`](prototype-lab/campaigns/js/ui/entry-flow.js) | the entry flow after "Review entry" (spec 3.6): the sheet "Check before you sign", built like the deterministic summary (A-3), with the return floor signed as m | 199 |
| [`entry.js`](prototype-lab/campaigns/js/ui/entry.js) | the entry panel of the campaign page (spec 3.6; S11): YES or NO with each side's chance and estimated return, the amount in SOL (0.01 SOL minimum, the balance,  | 183 |
| [`icons.js`](prototype-lab/campaigns/js/ui/icons.js) | the line icons of the site as inline SVG strings, drawn on a 24 px grid with a 2 px stroke, plus one helper that returns an icon ready to place in a template. I | 57 |
| [`layer.js`](prototype-lab/campaigns/js/ui/layer.js) | what floats above a screen: the dialog (a bottom sheet on phones), the small menus anchored to a button, and toasts. The dialog traps focus, closes on Escape or | 109 |
| [`notices.js`](prototype-lab/campaigns/js/ui/notices.js) | the notices that apply to the whole site, drawn above every screen: entries and openings paused by the team (I10′: everything else keeps running), and entries u | 30 |
| [`parts.js`](prototype-lab/campaigns/js/ui/parts.js) | the small pieces every screen repeats, each one function returning HTML: the kind tile and label, the state chip, the partner seal, the YES/NO bar with the priz | 96 |
| [`wallet.js`](prototype-lab/campaigns/js/ui/wallet.js) | the wallet button in the top bar and its flows: connect (a wallet list, or "Use Installed Wallet" on Android, proposal §3.4), connecting, connected with the sho | 81 |

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
| [`codama-spike.ts`](scripts/codama-spike.ts) | the Codama spike (T9): renders a Kit client from the Shank IDL of brot-markets into packages/sdk/src/idl/generated. T9, decided in Sprint 05: the generated clie | 61 |
| [`codemap.js`](scripts/codemap.js) | let an AI locate the right file without reading every file. Pairs with the 200-line limit in .claude/rules/code-style.md — small files plus a one-line index mea | 223 |
| [`detach-os.ps1`](scripts/detach-os.ps1) | detach-os.ps1 — desconecta seu projeto do repositório AI Dev Operating System | 161 |
| [`detach-os.sh`](scripts/detach-os.sh) | detach-os.sh — desconecta seu projeto do repositório AI Dev Operating System | 157 |
| [`devnet-clock-probe.ts`](scripts/devnet-clock-probe.ts) | measure a cluster's clock against wall time (slot length, the confirmed-to-finalized gap, the drift of the Clock sysvar and, under Alpenglow, of the leader's na | 201 |
| [`devnet-open-test.ts`](scripts/devnet-open-test.ts) | open one short-lived BTC/USD price campaign on devnet for the keeper's real-resolve test (Sprint 06): target 1.2% above the sponsored price (past its confidence | 47 |
| [`devnet-seed.ts`](scripts/devnet-seed.ts) | seed a cluster with example campaigns opened free by a team key (Sprint 05 DoD), one per kind that can open there: a price campaign above and one below (targets | 137 |
| [`devnet-settle-batch.ts`](scripts/devnet-settle-batch.ts) | the real settle batch on a cluster (Sprint 05 DoD, "the real settle batch with self-CPI events and its compute cost", T3, C7): a free team burn campaign, twelve | 153 |
| [`devnet-smoke.ts`](scripts/devnet-smoke.ts) | the full cycle in SOL (Sprint 05 DoD, X0.2 and X0.5): a wallet outside the team opens a burn campaign and pays US$500 at the Pyth price after previewing the who | 76 |
| [`devnet.ts`](scripts/devnet.ts) | the session the devnet scripts (smoke, seed) share: the cluster they write to, the payer, a team key, wallets, funding and fresh prices. `--cluster local` (the  | 127 |
| [`extract-external-links.sh`](scripts/extract-external-links.sh) | ⚠️ sem cabeçalho — adicione purpose/version/sprint | 16 |
| [`init-project.ps1`](scripts/init-project.ps1) | ⚠️ sem cabeçalho — adicione purpose/version/sprint | 34 |
| [`init-project.sh`](scripts/init-project.sh) | ⚠️ sem cabeçalho — adicione purpose/version/sprint | 25 |
| [`instruction-drift.js`](scripts/instruction-drift.js) | catch references in instruction files (CLAUDE.md, templates, skills, agents, WIZARD) to agents, commands and wizard stages that do not exist, and model generati | 162 |
| [`measure-cu.ts`](scripts/measure-cu.ts) | prints the compute units of each instruction's valid baseline and the program binary's size, in the Sprint 03 "Measurements" table's shape (T3). Runs in LiteSVM | 30 |
| [`measure-settle.ts`](scripts/measure-settle.ts) | the settle batch (T3) and the per-account write limit (C7). For each batch size it builds one transaction of `settle_entry` instructions in LiteSVM (self-CPI ev | 117 |
| [`os-self-test.js`](scripts/os-self-test.js) | the `os-self-test` skill did this, but only when a human or a model remembered to invoke it — and three session logs record it NOT being run when it would have  | 406 |
| [`pre-commit.js`](scripts/pre-commit.js) | the PreToolUse gate only sees commits Claude makes. A commit from a terminal or an editor skipped it entirely. This runs the same scan from git itself | 76 |
| [`push-oracle-probe.ts`](scripts/push-oracle-probe.ts) | probe Pyth's push oracle read-only: watch that the sponsored SOL/USD and BTC/USD accounts only move forward on devnet and mainnet, and scan its recent transacti | 200 |
| [`pwa-icons.ts`](scripts/pwa-icons.ts) | writes the PWA's icons (Sprint 13 DoD, S2: the manifest and its icons, no service worker) from the mascot's deadpan pose on the dark theme's page colour: 192 an | 42 |
| [`pyth-sponsored-feeds.ts`](scripts/pyth-sponsored-feeds.ts) | list which Pyth feeds have a shard-0 push account on devnet and mainnet, which of those stay fresh, how often they update and who pays for the writes, read-only | 201 |
| [`release-v0.2.0.ps1`](scripts/release-v0.2.0.ps1) | Release helper for AI Dev Operating System v0.2.0 | 11 |
| [`release-v0.2.0.sh`](scripts/release-v0.2.0.sh) | ⚠️ sem cabeçalho — adicione purpose/version/sprint | 16 |
| [`run-tests.js`](scripts/run-tests.js) | give `npm test` a file list that does not depend on the shell. npm runs scripts through cmd.exe on Windows, which does not expand globs, and Node only learned t | 33 |
| [`sdk-portability.ts`](scripts/sdk-portability.ts) | the SDK's portability lint (proposal 3.2; Sprint 05 DoD "a lint rule fails if it does"): every identifier in packages/sdk/src (the generated Codama client aside | 59 |
| [`sensor-wiring.js`](scripts/sensor-wiring.js) | verify the repo has a standard test entry point, a linter with its config, a lockfile, a feedback hook, a git pre-commit, and a CI that actually runs them. The  | 121 |
| [`slot-matrix-check.ts`](scripts/slot-matrix-check.ts) | the CI step of the slot matrix: regenerates the matrix in memory and fails when the committed tests/brot/slot-matrix.gen.ts is stale (or missing) | 18 |
| [`slot-matrix-spec.ts`](scripts/slot-matrix-spec.ts) | the expectations of the slot matrix: what each account slot of each instruction is, and which BrotError a refused mutation gets, from the checks order of checks | 272 |
| [`slot-matrix.ts`](scripts/slot-matrix.ts) | generates tests/brot/slot-matrix.gen.ts, the slot matrix of Sprint 04 (T-lane F), from the frozen Shank IDL: every signer unsigned, every writable slot read-onl | 176 |
| [`sync-selfhosted.js`](scripts/sync-selfhosted.js) | keep a local, navigable mirror of the full self-hosted catalogue so the WIZARD (stage 4.2) can offer self-hosted alternatives without a network call | 349 |
| [`tokenomics-model.ts`](scripts/tokenomics-model.ts) | Quantitative model behind ECONOMICS.md: protocol fees, revenue split, staker yield, the token unlock curve and the | 584 |
| [`void-log-schema.ts`](scripts/void-log-schema.ts) | writes content/void-log/record.schema.json, the JSON Schema of a void-log record, from the zod schema in packages/sdk/src/schemas/void-log.ts (Sprint 12: the re | 33 |

## `scripts/deploy/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`artifact.ts`](scripts/deploy/artifact.ts) | fetch the program CI built, by run id and never by name (Sprint 00's carried item): the run must be a completed, successful run of the CI workflow on `main` (th | 76 |
| [`binding.ts`](scripts/deploy/binding.ts) | what binds a deploy to what was reviewed (Sprint 05 deploy review, F1). The CI run built the commit the operator names (`--expect-commit`); this checkout contai | 71 |
| [`checks.ts`](scripts/deploy/checks.ts) | the pure checks of the devnet deploy (TP §10, §12; Sprint 05 DoD "Deploy from CI's artifact"): the artifact's SHA256SUMS parsed and every file checked against i | 136 |
| [`devnet-deploy.ts`](scripts/deploy/devnet-deploy.ts) | the first deploy of brot-markets to devnet from CI's artifact, and its initialization in the same session (TP §10, §12; deploy/devnet/README.md): the artifact b | 156 |
| [`finish.ts`](scripts/deploy/finish.ts) | the deploy's second half, shared by the first run and a resume (`devnet-deploy.ts --resume`): the program at the declared id read back (loader v3, the expected  | 83 |
| [`initialize.ts`](scripts/deploy/initialize.ts) | the two writes the deploy makes in the same session as the deploy itself (TP §3.4.3, §7; Sprint 05): `admin_initialize_config`, signed by the program's upgrade  | 142 |
| [`preflight.ts`](scripts/deploy/preflight.ts) | what the deploy checks on the cluster and on this machine before it plans anything (Sprint 05 deploy review, F4, F5, F8, F11): how the program id, its ProgramDa | 122 |
| [`rehearse-funded.ts`](scripts/deploy/rehearse-funded.ts) | rehearse what a stranger's lamports do to a deploy (Sprint 05 deploy review, F4), on the offline surfnet, with the real `solana program deploy` at throwaway ids | 89 |
| [`rehearse.ts`](scripts/deploy/rehearse.ts) | rehearse every step of the devnet deploy on a local offline surfnet, inside a loopback-only network namespace: the artifact check (and its refusal of a changed  | 181 |

## `scripts/rehearsal/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`open-paid.ts`](scripts/rehearsal/open-paid.ts) | a PAID opening by a wallet outside the team (Sprint 12's devnet rehearsal: the creator's 1% and a prize that returns exist only on a paid, non-team opening; scr | 119 |
| [`settle-steps.ts`](scripts/rehearsal/settle-steps.ts) | the devnet rehearsal's settlement of one campaign, one step at a time (Sprint 12: the five-campaign rehearsal; until the keeper settles, every payout on devnet  | 183 |
| [`settle.ts`](scripts/rehearsal/settle.ts) | `bun run scripts/rehearsal/settle.ts <campaign> <step>`: one settlement step of one campaign on a cluster (Sprint 12's devnet rehearsal; settle-steps.ts). The p | 41 |

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

## `scripts/team/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`common.ts`](scripts/team/common.ts) | what the team scripts share (Sprint 05 DoD, `scripts/team/`): your own key from TEAM_KEYPAIR (each person uses theirs; nobody shares one), the cluster named on  | 86 |
| [`confirm.ts`](scripts/team/confirm.ts) | `team_confirm_result` with your own team key: ends a campaign's review window now; the snapshot runs at once and payouts can start (TP §3.4.7). Only inside the  | 35 |
| [`contest.ts`](scripts/team/contest.ts) | `team_open_contest`, SIMULATED ONLY: the program refuses it with `ContestExitDisabled` until Sprint 14 (decision of 2026-10-09: a contest would freeze the pot w | 31 |
| [`open.ts`](scripts/team/open.ts) | `user_open_campaign` with your own TEAM key, free (`opening_usd` 0): for the team or a launch partner, with no prize and no creator share (P-3; TP §3.4.10). Out | 92 |
| [`pause.ts`](scripts/team/pause.ts) | `team_pause_entries` with your own team key: stops joins and openings at once, never payouts or refunds (TP §3.4.9). One team key is enough, to be fast; only th | 21 |
| [`rehearse.ts`](scripts/team/rehearse.ts) | rehearse every team script on a local offline surfnet, inside a loopback-only network namespace: the admin sets the team and the creation parameters; a team key | 180 |
| [`resolution-post.ts`](scripts/team/resolution-post.ts) | the text of a resolution post (BR-33; TP §3.6 "The share card"; Sprint 13 DoD), written from scripts/team/resolution-post.template.txt for a person to post on X | 122 |
| [`resume.ts`](scripts/team/resume.ts) | `admin_resume_entries` with the admin's key: ends a pause (`EntriesHalted` to `Normal`). The admin's act, not a team key's (TP §3.4.9); on mainnet it is the 2-o | 21 |
| [`set-params.ts`](scripts/team/set-params.ts) | `admin_set_creation_params` with the admin's key: the new parameters from a reviewed JSON file (the format of deploy/devnet/init-params.json), each change shown | 43 |
| [`set-team.ts`](scripts/team/set-team.ts) | `admin_set_team` with the admin's key: up to five team keys, one per person (Q12; Lucas, Ronaldo and Bernardo, founder answer 6, 2026-10-09), shown against the  | 35 |
| [`void.ts`](scripts/team/void.ts) | `team_void_campaign(reason, note_hash)` with your own team key (TP §3.4.7, BR-45): the public text of the void is saved to content/void-log/<campaign>-<UTC time | 109 |

## `scripts/test/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`codemap.test.js`](scripts/test/codemap.test.js) | pin the header-extraction behaviour, because the quality of the whole map depends on it — a bad describe() produces a map that reads plausibly and points nowher | 170 |
| [`hooks.test.js`](scripts/test/hooks.test.js) | hooks.test.js — unit tests for the PreToolUse gates and the PostToolUse feedback hook | 278 |
| [`instruction-drift.test.js`](scripts/test/instruction-drift.test.js) | pin what counts as a dangling reference and what does not, because a noisy check gets switched off and a silent one lets the template's dead command table survi | 142 |
| [`pre-commit.test.js`](scripts/test/pre-commit.test.js) | prove the hook stops a staged credential in a real git repository, and gets out of the way everywhere else | 95 |
| [`sensor-wiring.test.js`](scripts/test/sensor-wiring.test.js) | pin the two severities — a missing sensor is an error in the OS repo and a warning in a derived project — and the "exists but never gates" class | 140 |
| [`sync-selfhosted.test.js`](scripts/test/sync-selfhosted.test.js) | ⚠️ sem cabeçalho — adicione purpose/version/sprint | 146 |

## `scripts/validator/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`clusters.ts`](scripts/validator/clusters.ts) | which cluster an RPC really is, by its genesis hash, so an ops script never writes to a cluster other than the one its operator named: mainnet is refused outrig | 51 |
| [`cycle-open.ts`](scripts/validator/cycle-open.ts) | the first half of the smoke cycle (Sprint 05, X0.2 and X0.5): a burn campaign's mint (classic SPL Token, authority revoked), the opening preview with the whole  | 160 |
| [`cycle-settle.ts`](scripts/validator/cycle-settle.ts) | the second half of the smoke cycle (Sprint 05, X0.2): resolve a burn campaign YES, tally each baker's joins, end the window with a team confirmation, then settl | 181 |
| [`isolate.ts`](scripts/validator/isolate.ts) | run a rehearsal script inside a network namespace that has only loopback (`unshare -rn`), so the local cluster and the script can talk on 127.0.0.1 and nothing  | 32 |
| [`keys.ts`](scripts/validator/keys.ts) | keypairs for the ops scripts: read a Solana CLI keypair file (64-byte JSON array) into a Kit signer, check that a key file is fit to sign with, write a throwawa | 101 |
| [`negative-baselines-settle.ts`](scripts/validator/negative-baselines-settle.ts) | the slot matrix's baselines of the review window and of settlement on the surfnet: the team's confirm, void and contest, finalize, the late-join tally, each pay | 157 |
| [`negative-baselines.ts`](scripts/validator/negative-baselines.ts) | the slot matrix's baselines on one surfnet, in an order that keeps each one's state: one valid instruction per instruction of the config, the pause, the opening | 131 |
| [`negative-extra.ts`](scripts/validator/negative-extra.ts) | the last three refusals of the negative run, each needing a state the others must not see: the valve (`TooManyOpenCampaigns`, the creation parameters changed th | 72 |
| [`negative-join.ts`](scripts/validator/negative-join.ts) | the refusals of `user_join_campaign` on a local validator, one case per error, as the LiteSVM suites test them (tests/brot/join-campaign-refuses.test.ts, join-c | 90 |
| [`negative-open.ts`](scripts/validator/negative-open.ts) | the refusals of `user_open_campaign` on a local validator, one case per error, as the LiteSVM suites test them (tests/brot/open-campaign-refuses*.test.ts, open- | 179 |
| [`negative-price.ts`](scripts/validator/negative-price.ts) | rewrite a sponsored Pyth account on the surfnet with one field changed, from the captured devnet bytes (the .bin files are never edited): price, confidence, exp | 56 |
| [`negative-run.ts`](scripts/validator/negative-run.ts) | the slot matrix and one paid opening on a local validator (Sprint 05 DoD: "the negative tests, the slot tests and one paid opening run once on a real validator" | 146 |
| [`negative-world.ts`](scripts/validator/negative-world.ts) | run the test kit's account injectors and the slot matrix's mutations against a surfnet, unchanged: a recording stand-in for the three synchronous LiteSVM calls  | 107 |
| [`rpc.ts`](scripts/validator/rpc.ts) | talk to a cluster over JSON-RPC for the ops scripts: the cluster guard (a non-local URL is refused unless the caller names the cluster on purpose; the genesis h | 186 |
| [`simulate.ts`](scripts/validator/simulate.ts) | simulate a transaction before sending it, so an ops script shows what the program would answer (its custom error by name, the logs, the compute units) without w | 53 |
| [`spl-token.ts`](scripts/validator/spl-token.ts) | the few System Program and classic SPL Token instructions the ops scripts need to make a burn campaign's mint (`SupplyAtMost`): create an account, transfer SOL, | 115 |
| [`surfnet.ts`](scripts/validator/surfnet.ts) | start and stop a local OFFLINE Surfpool surfnet for the ops rehearsals: no datasource (`--offline`), bound to 127.0.0.1 on two free ports in 4200-4299, run from | 95 |
| [`world.ts`](scripts/validator/world.ts) | a local cluster ready for the ops rehearsals: an offline surfnet, the brot-markets binary installed at the id the program declares with an upgrade authority hel | 114 |

## `services/api/src/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`config.ts`](services/api/src/config.ts) | the API's settings, read from its environment only: the RPC URL (a secret, so logs show its origin only), the port and host (loopback by default), the refresh i | 57 |
| [`dto.ts`](services/api/src/dto.ts) | the JSON shape of a campaign for the site. Amounts are lamport strings, addresses base58, times Unix seconds (strings for the big integers). The state is the SD | 58 |
| [`history.ts`](services/api/src/history.ts) | the program's own history, read for the leaderboard (Sprint 13) until Sprint 08's indexer exists: every signature of the program through `getSignaturesForAddres | 97 |
| [`leaderboard.ts`](services/api/src/leaderboard.ts) | `GET /api/v1/leaderboard` (TP §6; Sprint 13, BR-29): devnet points from the program's events (history.ts) and the live campaign accounts (the snapshot), through | 52 |
| [`main.ts`](services/api/src/main.ts) | the read API's entry point. Reads its settings, takes a chain snapshot at start and then every API_REFRESH_MS, reads the program's new history for the leaderboa | 51 |
| [`query.ts`](services/api/src/query.ts) | validates the list's query string. An unknown parameter, a bad state, or a limit or offset out of range is a 400 with a named code; nothing is guessed. The stat | 49 |
| [`routes.ts`](services/api/src/routes.ts) | the read API's routes, all GET (HEAD too): /api/v1/health, /api/v1/campaigns (filtered, paged), /api/v1/campaigns/:address and, since Sprint 13, /api/v1/leaderb | 100 |
| [`snapshot.ts`](services/api/src/snapshot.ts) | one read of the chain: every campaign account of the program, decoded by the SDK (a wrong owner, tag or version is skipped), with its public state computed from | 46 |
| [`store.ts`](services/api/src/store.ts) | holds the last good chain snapshot in memory and refreshes it on a timer. A failed refresh keeps the last good snapshot and records the error, so the API answer | 33 |

## `services/api/tests/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`api.test.ts`](services/api/tests/api.test.ts) | the read API's contract with fake data and no cluster: the list's filters and paging, the 400 and 404 answers, the detail route, CORS, the method refusal, the h | 203 |
| [`leaderboard.test.ts`](services/api/tests/leaderboard.test.ts) | the leaderboard route's contract with fake data and no cluster (Sprint 13): 503 until the program's history has been read (or with no history at all), what heal | 108 |

## `services/keeper/src/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`alert.ts`](services/keeper/src/alert.ts) | the keeper's alerts. Each alert is one JSON line on the journal, de-duplicated per (kind, key) within a window, so a stuck condition does not flood the log. Ema | 65 |
| [`campaigns.ts`](services/keeper/src/campaigns.ts) | the keeper's view of the chain: every campaign account of the program that has a given status. One `getProgramAccounts` filtered by the campaign's size; each ac | 38 |
| [`config.ts`](services/keeper/src/config.ts) | the keeper's settings, read from its environment only: the RPC URL (a secret, so the log shows its origin and never the path or the query), the keeper's keypair | 116 |
| [`cycle.ts`](services/keeper/src/cycle.ts) | one keeper cycle: read the open campaigns, try the resolve task on each, and report the counts and the keeper's SOL balance. A failure on one campaign is logged | 51 |
| [`health.ts`](services/keeper/src/health.ts) | GET /healthz on a loopback address only: the keeper's last full cycle (open campaigns, what it tried, its SOL balance), the cycle count and the last cycle's err | 37 |
| [`log.ts`](services/keeper/src/log.ts) | one JSON line per event on stdout, with a time stamp. The RPC URL and the keypair never reach it: the caller passes only fields it has checked (an origin, a pub | 10 |
| [`main.ts`](services/keeper/src/main.ts) | the keeper's entry point. Reads its settings and keypair, serves /healthz on loopback (and POST /restart on the primary, when its secret is set), and runs one c | 84 |
| [`resolve.ts`](services/keeper/src/resolve.ts) | the keeper's one task in the MVP: for an open campaign, offer `resolve_campaign` with the campaign's own metric account (the program's reader decides), simulate | 51 |
| [`restart.ts`](services/keeper/src/restart.ts) | POST /restart of the primary keeper. A request is accepted only when its HMAC-SHA256 over `${timestamp}\n${body}` matches (constant-time compare) and its timest | 68 |
| [`review-queue.ts`](services/keeper/src/review-queue.ts) | the review queue, one JSON line per entry, appended to a file the keeper owns. A second-read mismatch lands here so that a person looks at it (T22). Entries car | 28 |
| [`second-read.ts`](services/keeper/src/second-read.ts) | the second read of a PRICE campaign (proposal §2.11, Sprint 07): the sponsored or proof price account is read through the primary's RPC and through RPC B, each  | 77 |
| [`secret.ts`](services/keeper/src/secret.ts) | loads the HMAC secret of POST /restart from the file named by KEEPER_RESTART_SECRET_FILE (a systemd credential, root-owned, 0600). The file is read once at star | 14 |
| [`send.ts`](services/keeper/src/send.ts) | the keeper's transaction path: a message with a fresh blockhash, signed by the keeper, sent without preflight (the simulation already ran), rebroadcast as the s | 72 |
| [`signer.ts`](services/keeper/src/signer.ts) | the keeper's signer, loaded from a keypair file named by KEEPER_KEYPAIR (the standard 64-byte JSON array). The file lives outside the repository; the keeper nev | 22 |
| [`standby-loop.ts`](services/keeper/src/standby-loop.ts) | the standby's three loops: the watchdog (every 5 minutes, probes the primary and takes over by the rules in standby.ts), the continuous feed watcher for open pr | 109 |
| [`standby.ts`](services/keeper/src/standby.ts) | the standby's rules, as pure functions with no I/O. The gate: a standby may send only while it has taken over AND the primary does not answer; while the primary | 82 |
| [`watchdog.ts`](services/keeper/src/watchdog.ts) | the watchdog's I/O. Each tick it probes the primary's GET /healthz (10 s timeout), feeds the answer to the pure rules in standby.ts, and performs what they deci | 80 |
| [`watcher.ts`](services/keeper/src/watcher.ts) | the standby's continuous feed watcher. Every interval it lists the open campaigns, keeps the price ones (their sponsored feed moves between the primary's 60 s c | 75 |

## `services/keeper/tests/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`alert.test.ts`](services/keeper/tests/alert.test.ts) | the alerter's rules: a repeat of the same (kind, key) inside the window is suppressed, a new key or a later time emits again, each emitted line is one JSON obje | 69 |
| [`keeper.test.ts`](services/keeper/tests/keeper.test.ts) | the keeper's unit tests: its settings and their refusals, the send-or-skip rule, the signer's input check, the campaign listing (a non-campaign account is skipp | 128 |
| [`restart.test.ts`](services/keeper/tests/restart.test.ts) | POST /restart's refusals and its one acceptance: an unsigned, wrongly signed, stale, future or re-bodied request is refused with 401 and writes nothing; a valid | 172 |
| [`second-read.test.ts`](services/keeper/tests/second-read.test.ts) | the second read's rules and the review queue's line: a match, a real difference, a missing account, a difference that a retry at RPC B clears (publish landing b | 130 |
| [`standby.test.ts`](services/keeper/tests/standby.test.ts) | the standby's rules: the send gate (a standby refuses to send while the primary is alive), the takeover timeline (restarts, then takeover, then no automatic han | 86 |
| [`watchdog.test.ts`](services/keeper/tests/watchdog.test.ts) | the standby's rule at the send itself (a standby refuses to send while the primary answers, checked in signAndSend before any RPC call), the watchdog's probe an | 152 |
| [`watcher.test.ts`](services/keeper/tests/watcher.test.ts) | the feed watcher's rules: only price campaigns are resolved, nothing is sent while the standby gate is closed, an error is reported and the next tick still runs | 150 |

## `services/landing/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`server.mjs`](services/landing/server.mjs) | HTTP entry of the "coming soon" site (landing page, /pitch, waitlist API), of the unlisted campaign preview under /dev0x/ and of docs.brot.markets (the docs. ho | 174 |

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

## `services/landing/history/pitch-4/deck/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`bite.js`](services/landing/history/pitch-4/deck/bite.js) | the mascot's bite on the earnings slide of /pitch4: it runs to a loaf and takes a thin slice, which is the fee. The hidden surprise: a click on the mascot or on | 61 |
| [`deck.js`](services/landing/history/pitch-4/deck/deck.js) | runs the pitch deck at /pitch: scales the 1920 x 1080 slides to the window and moves between them by keyboard, click, swipe and the address (#3 opens slide 3) | 135 |
| [`demo.js`](services/landing/history/pitch-4/deck/demo.js) | plays the product demo on the Solution slide of /pitch4: a pointer picks YES on one market and NO on another, the card flips between them, and each is resolved  | 152 |
| [`exits.js`](services/landing/history/pitch-4/deck/exits.js) | what the mascot does on a slide of /pitch4 before the deck leaves it, when the presenter moves forward. An exit is short, and it ends by calling `go`, which is  | 65 |
| [`finale.js`](services/landing/history/pitch-4/deck/finale.js) | the finale of the closing slide of /pitch4: the badge lands, blinks twice, gives a thumbs-up with sparkles and points at the code. The timings are the ones of t | 56 |
| [`lever.js`](services/landing/history/pitch-4/deck/lever.js) | the lever of the "Open a market" slide of the v4 deck: the mascot pulls it down, the initial seed climbs from $500 to $10,000 and the market climbs the site. Th | 90 |
| [`motion.js`](services/landing/history/pitch-4/deck/motion.js) | the motion of the deck at /pitch4: it decides what plays when a slide arrives or is left (the scenes are in scenes.js and exits.js), starts the product demo and | 178 |
| [`partners.js`](services/landing/history/pitch-4/deck/partners.js) | the launch partners counter of the Growth slide of /pitch4: two seconds after the slide arrives the number climbs to the partners in the list, their logos come  | 69 |
| [`runner.js`](services/landing/history/pitch-4/deck/runner.js) | the mascot's plain run across a slide of /pitch4, used where a slide has no scene of its own. It runs along the bottom, in the direction of the slide change, al | 33 |
| [`scenes.js`](services/landing/history/pitch-4/deck/scenes.js) | the mascot's scenes of the deck at /pitch4, by the slide that arrives: what plays when it comes going forward, going back, or when the page opens on it. A slide | 116 |
| [`sprites.js`](services/landing/history/pitch-4/deck/sprites.js) | the mascot images of /pitch4: which file is which pose, loading them ahead of time, and putting a pose on a slide at a place given in the slide's own 1920 x 108 | 78 |
| [`team.js`](services/landing/history/pitch-4/deck/team.js) | the Team slide of the v4 deck: the mascot runs in and pulls the rope of each curtain in turn, showing each person drawn as a bread roll; a few seconds later eac | 67 |

## `services/landing/lib/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`api.mjs`](services/landing/lib/api.mjs) | the two waitlist endpoints of the "coming soon" site: join (POST /api/leads) and leave (/api/leads/remove) | 120 |
| [`campaigns.mjs`](services/landing/lib/campaigns.mjs) | serves the Sprint -1 campaign screens under /dev0x/ (the team's preview, unlisted: noindex, no link from the site) from prototype-lab/campaigns, with a CSP that | 68 |
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
| [`chart.js`](services/landing/public/pitch/chart.js) | the one chart behind the two Market slides of /pitch: World's four measured months and, after them, our two-year scenario, drawn at any point between the close  | 128 |
| [`deck.js`](services/landing/public/pitch/deck.js) | runs the pitch deck at /pitch: scales the 1920 x 1080 slides to the window and moves between them by keyboard, click, swipe and the address (#3 opens slide 3) | 135 |
| [`demo.js`](services/landing/public/pitch/demo.js) | plays the product demo on the Solution slide of /pitch: four examples in a row, each finished before the next begins. A pointer picks a side on three markets an | 177 |
| [`exits.js`](services/landing/public/pitch/exits.js) | what the mascot does on a slide of /pitch before the deck leaves it, when the presenter moves forward. An exit is short, and it ends by calling `go`, which is w | 67 |
| [`finale.js`](services/landing/public/pitch/finale.js) | the finale of the closing slide of /pitch: the badge lands, blinks twice, gives a thumbs-up with sparkles and points at the code. The timings are the ones of th | 56 |
| [`market.js`](services/landing/public/pitch/market.js) | what moves on the two Market slides of /pitch, which share one chart (chart.js). "Market": the mascot runs from June to September 2026, a month at a time, and s | 84 |
| [`motion.js`](services/landing/public/pitch/motion.js) | the motion of the deck at /pitch: it decides what plays when a slide arrives or is left (the scenes are in scenes.js and exits.js), starts the product demo and  | 178 |
| [`partners.js`](services/landing/public/pitch/partners.js) | the launch partners counter of the Growth slide of /pitch: two seconds after the slide arrives the number climbs to the partners in the list, their logos come i | 69 |
| [`pot.js`](services/landing/public/pitch/pot.js) | the pot arithmetic of the /pitch demo: what a market holds after the visitor's stake and how it is shared when the chain resolves it | 55 |
| [`runner.js`](services/landing/public/pitch/runner.js) | the mascot's plain run across a slide of /pitch, used where a slide has no scene of its own. It runs along the bottom, in the direction of the slide change, alo | 33 |
| [`scenes.js`](services/landing/public/pitch/scenes.js) | the mascot's scenes of the deck at /pitch, by the slide that arrives: what plays when it comes going forward, going back, or when the page opens on it. A slide  | 91 |
| [`sprites.js`](services/landing/public/pitch/sprites.js) | the mascot images of /pitch: which file is which pose, loading them ahead of time, and putting a pose on a slide at a place given in the slide's own 1920 x 1080 | 78 |
| [`tally.js`](services/landing/public/pitch/tally.js) | the two things around the demo card of /pitch that follow the examples: the text on the left of the Solution slide, which changes with the example (a "beat"), a | 80 |
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
| [`dev0x.test.mjs`](services/landing/tests/dev0x.test.mjs) | tests the unlisted campaign preview under /dev0x/ over real HTTP: redirects, noindex, its CSP, the files it needs, the refusal of paths out of its folder, and t | 151 |
| [`docs.test.mjs`](services/landing/tests/docs.test.mjs) | tests docs.brot.markets: each generated page says what its text in docs/wiki says, every page is in the menu, every link and file a page points at exists, and t | 135 |
| [`leads.test.mjs`](services/landing/tests/leads.test.mjs) | tests the waitlist store and the request limiter of the "coming soon" site (node --test) | 113 |
| [`pages.test.mjs`](services/landing/tests/pages.test.mjs) | tests what the pages of the "coming soon" site promise without a browser: every file they point at exists, the suggestion draft keeps its mention and hashtag, t | 214 |
| [`server.test.mjs`](services/landing/tests/server.test.mjs) | tests the "coming soon" site over real HTTP: waitlist API rules, static files, headers and /pitch | 193 |
| [`two.test.mjs`](services/landing/tests/two.test.mjs) | tests /2, the home page in the pitch deck's look: it says exactly what the home page says (only the look may differ), the mascot perches and moods are the same, | 53 |

## `tests/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`fixtures.test.ts`](tests/fixtures.test.ts) | the captured accounts in tests/fixtures are exactly the ones index.json describes. Git shows a changed .bin only as "binary files differ", so a swapped fixture  | 34 |

## `tests/api/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`leaderboard.test.ts`](tests/api/leaderboard.test.ts) | the read API's leaderboard against the program in LiteSVM behind the recording RPC (Sprint 13 DoD: the leaderboard shows the points of `/api/v1/leaderboard`): w | 158 |

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
| [`errors.ts`](tests/brot/errors.ts) | the program's custom error codes by name, so tests assert the exact refusal (X0.7). The map moved to the SDK in Sprint 05 (packages/sdk/src/read/errors/codes.ts | 9 |
| [`events.test.ts`](tests/brot/events.test.ts) | the events round-trip (T4, X0.4): every instruction of Sprint 02 emits exactly one event by self-CPI, decoded from its inner instruction; campaign events carry  | 211 |
| [`events.ts`](tests/brot/events.ts) | the program's events as layouts: an inner instruction to the program whose data is [0xFF, discriminator, payload], signed by the event authority (T4). Mirrors e | 137 |
| [`flows.ts`](tests/brot/flows.ts) | the common paths every test file starts from: a config initialised with the founder's values, a team, a paid or free price campaign opened on BTC/USD, an entry | 144 |
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
| [`join-campaign-refuses.test.ts`](tests/brot/join-campaign-refuses.test.ts) | every refusal of `user_join_campaign` on the campaign's rules, each with its own error (X0.7): not Open, entries closed, the pause, the minimum, the signed tota | 162 |
| [`join-campaign-slots.test.ts`](tests/brot/join-campaign-slots.test.ts) | the slot checks of `user_join_campaign` in the order of checks.rs, each with its own error: signer and writable flags, the three pairs that must differ, the Sys | 69 |
| [`join-campaign-support.ts`](tests/brot/join-campaign-support.ts) | what the join tests share: a world with a paid price campaign, its sponsored price kept fresh across clock moves, a refused join that moves nothing, SOL sent by | 203 |
| [`join-campaign-wallets.test.ts`](tests/brot/join-campaign-wallets.test.ts) | two wallets: A cannot change, close or redirect B's Entry, whichever slot of a join it puts that Entry in, and cannot join as B without B's signature (A-1) | 58 |
| [`kit.test.ts`](tests/brot/kit.test.ts) | checks the test kit itself, without the program binary: addresses, layout sizes against the Rust structs, the codec, and the instruction shapes of the frozen co | 101 |
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
| [`sent-events.ts`](tests/brot/sent-events.ts) | the events of a transaction the kit sent, decoded by the SDK (`@brot/sdk/read`), the way an indexer reads them: the LiteSVM result put in the RPC's `getTransact | 66 |
| [`setup.ts`](tests/brot/setup.ts) | a LiteSVM world for the program's tests: the binary loaded, the clock set next to the captured Pyth prices, the upgrade authority recorded, funded wallets, and  | 193 |
| [`slot-matrix-fixtures.ts`](tests/brot/slot-matrix-fixtures.ts) | one valid instruction per Brot Markets instruction, in a world of its own, the baseline each slot case mutates. Every baseline must succeed before its cases mea | 267 |
| [`slot-matrix-mutate.ts`](tests/brot/slot-matrix-mutate.ts) | the mutations of the slot matrix: one slot of a valid instruction changed (unsigned, read-only, a stranger, an account of another type, or an alias of an earlie | 75 |
| [`slot-matrix.gen.ts`](tests/brot/slot-matrix.gen.ts) | every slot case of the matrix: each signer unsigned (MissingSignature), each writable slot read-only (NotWritable), a stranger, an account of each other type, a | 428 |
| [`slot-matrix.test.ts`](tests/brot/slot-matrix.test.ts) | runs every case of the slot matrix (tests/brot/slot-matrix.gen.ts) against the binary: each refused with its own BrotError, and no lamport of the instruction's  | 55 |
| [`structs.ts`](tests/brot/structs.ts) | the program's structs as layouts: accounts (GlobalConfig, Campaign, Entry), instruction arguments and events, each in the field order of its Rust struct | 172 |
| [`team-window-events.test.ts`](tests/brot/team-window-events.test.ts) | what the team's confirm and void emit, on the binary (TP sections 3.4.3, 3.4.14): their own event (`ResultConfirmed`, `CampaignVoided`) with the campaign's next | 119 |
| [`team-window.test.ts`](tests/brot/team-window.test.ts) | the team's acts in the review window, on the binary: confirm, void (an automatic void only: a team key never voids a YES or NO, decision of 2026-10-09), and con | 185 |
| [`void-refund.test.ts`](tests/brot/void-refund.test.ts) | a void on the binary: the prize goes back to the stored creator, the opening fee goes with it on a house failure and stays with Brot on an outside cause, and th | 82 |

## `tests/e2e/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`chain.ts`](tests/e2e/chain.ts) | the web smoke's chain (Sprint 11, `bun run e2e`): the program in LiteSVM (CI's binary in target/deploy) with the founder's config, a team key and a paying creat | 63 |
| [`control-states.ts`](tests/e2e/control-states.ts) | the web smoke's control routes for Sprint 12 ("campaign states"): a campaign written in any public state (tests/site/state-world.ts); a whole cycle with the smo | 97 |
| [`control.ts`](tests/e2e/control.ts) | the web smoke's control endpoint (loopback, test only): what the Playwright runner asks of the chain. Sign the bytes the injected wallet was handed with the tes | 164 |
| [`helpers.ts`](tests/e2e/helpers.ts) | what the web smoke's tests share on the runner's side: calls to the chain's control endpoint, the page opened with the injected wallet and the runner's answer f | 75 |
| [`playwright.config.ts`](tests/e2e/playwright.config.ts) | the web smoke's Playwright configuration (Sprint 11; @playwright/test 1.63.0, pinned in package.json, whose Chromium is build 1243): the site built against the  | 27 |
| [`run.ts`](tests/e2e/run.ts) | `bun run e2e`, the web smoke on this machine (Sprint 11): the chain process (tests/e2e/chain.ts: the program in LiteSVM, CI's binary in target/deploy), then the | 60 |
| [`smoke.e2e.ts`](tests/e2e/smoke.e2e.ts) | the web smoke (Sprint 11 DoD; `bun run e2e`): the built site in Chromium at desktop width and at 412 CSS px, with an injected Wallet Standard test wallet, again | 198 |
| [`states.e2e.ts`](tests/e2e/states.e2e.ts) | "campaign states" in the web smoke (Sprint 12 DoD; `bun run e2e -- --grep "campaign states"`): the built site in Chromium against the program in LiteSVM. Every  | 79 |
| [`upgrade.e2e.ts`](tests/e2e/upgrade.e2e.ts) | A-8 in the web smoke (the founder's answer of 2026-10-10): the program is upgraded while a page built for its previous deploy is open (the site was built agains | 92 |
| [`wallet.ts`](tests/e2e/wallet.ts) | the web smoke's injected wallet: a Wallet Standard wallet ("E2E Test Wallet") registered in the page before its own scripts run, the way a browser extension reg | 66 |

## `tests/ops/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`deploy-checks.test.ts`](tests/ops/deploy-checks.test.ts) | the pure checks of the devnet deploy (scripts/deploy/checks.ts), each refusal with its own case: SHA256SUMS parsing, the artifact folder against its sums, the p | 99 |
| [`deploy-preflight.test.ts`](tests/ops/deploy-preflight.test.ts) | the deploy's preflight and bindings (Sprint 05 deploy review, F1, F4, F6, F7, F8, F9, F11), each refusal with its own case: a key file in any Git work tree or r | 120 |
| [`rehearsal.test.ts`](tests/ops/rehearsal.test.ts) | the devnet rehearsal's two scripts run against the program in LiteSVM behind the recording RPC before the founder runs them on devnet (Sprint 12): `open-paid` o | 89 |
| [`resolution-post.test.ts`](tests/ops/resolution-post.test.ts) | scripts/team/resolution-post.ts writes a resolution post from its template (Sprint 13 DoD; BR-33): read from the program in LiteSVM behind the recording RPC thr | 79 |

## `tests/programs/cpi-proxy/src/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`lib.rs`](tests/programs/cpi-proxy/src/lib.rs) | a test-only program that forwards one instruction by CPI, so a test can show that `resolve_campaign` refuses to run below the top level (`checks::top_level`). N | 49 |

## `tests/react-native/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`bundle.mjs`](tests/react-native/bundle.mjs) | one entry bundled as a React Native 0.87.1 Android release build makes it: Metro with `platform android`, `dev false`, `minify false` and the `default` transfor | 78 |
| [`hermes.mjs`](tests/react-native/hermes.mjs) | the Hermes VM the React Native check runs JavaScript on: Hermes v0.13.0's Linux CLI, the newest Hermes release that publishes a runnable VM, downloaded once, ch | 73 |
| [`metro.config.cjs`](tests/react-native/metro.config.cjs) | the Metro configuration of the React Native check: React Native 0.87.1's own defaults (`@react-native/metro-config`), so the SDK resolves and transforms as it w | 48 |
| [`run.mjs`](tests/react-native/run.mjs) | the React Native check, end to end (Sprint 05, proposal section 3.2): bundles `@brot/sdk/read`, `@brot/sdk/tx` and the math-vector replay with Metro for Android | 143 |

## `tests/react-native/entries/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`digest-shim.js`](tests/react-native/entries/digest-shim.js) | a minimal `crypto.subtle.digest("SHA-256")` for the Hermes CLI, which has no `crypto` at all, so the check can show that PDA derivation is the one thing the SDK | 25 |
| [`outcome.js`](tests/react-native/entries/outcome.js) | an SDK call's result written the way the Rust vector generators print a `Result`: the value through a formatter, or `ERR:<Name>` for a `BrotRefusal`. Anything e | 22 |
| [`read.js`](tests/react-native/entries/read.js) | the read half under Hermes: every export of `@brot/sdk/read` loaded as an app loads it on first use, the runtime's globals reported, and the config PDA derived  | 37 |
| [`rows-math.js`](tests/react-native/entries/rows-math.js) | the four kinds of tests/vectors/math-vectors.csv (programs/brot-markets/tests/math_vectors.rs), each row's inputs passed to `@brot/sdk/read`'s math and its resu | 46 |
| [`rows-snapshot.js`](tests/react-native/entries/rows-snapshot.js) | the four kinds of tests/vectors/snapshot-vectors.csv (programs/brot-markets/tests/ math_vectors_snapshot.rs and vectors_support/): the finalize `snapshot`, one  | 97 |
| [`tx.js`](tests/react-native/entries/tx.js) | the transaction half under Hermes: every export of `@brot/sdk/tx` loaded as an app loads it on first use; the random campaign id refused with no `crypto.getRand | 33 |
| [`vector-rows.js`](tests/react-native/entries/vector-rows.js) | replays one line of either Rust vector file through `@brot/sdk/read`'s math: splits it into kind, inputs and expected output, and hands the inputs to the kind's | 31 |
| [`vectors.js`](tests/react-native/entries/vectors.js) | the entry the Hermes VM runs: every row of the Rust math vectors replayed through the SDK's math (X0.3, the React Native half), with a count per file and per ki | 42 |

## `tests/sdk/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`boundaries.test.ts`](tests/sdk/boundaries.test.ts) | every import rule of `.dependency-cruiser.cjs` fires (Sprint 05 review): the SDK is copied into a temporary folder with the configuration, one violation of each | 64 |
| [`builders.test.ts`](tests/sdk/builders.test.ts) | every builder of `@brot/sdk/tx` against the test kit's hand-written builder of the same instruction (which tests/brot/idl.test.ts checks against the IDL and eve | 110 |
| [`contract-events.test.ts`](tests/sdk/contract-events.test.ts) | the SDK's event table and addresses against the program: each event's discriminator and size as events.rs and events/*.rs declare them, the event decoder's refu | 103 |
| [`contract-source.test.ts`](tests/sdk/contract-source.test.ts) | the SDK's hand-written copies of the program's contract, checked against the program's own source so they cannot drift: the error codes (and one IDL message per | 166 |
| [`decoder-shapes.test.ts`](tests/sdk/decoder-shapes.test.ts) | the decoder reads an inner instruction whichever way the node wrote it (Sprint 05 review, M1 and L6): compiled with indexes (`getTransaction`, `json`), partiall | 139 |
| [`decoder.test.ts`](tests/sdk/decoder.test.ts) | the decoder rules (TP 3.4.14; proposal 2.3) on transactions sent in LiteSVM and read back in the RPC's shape: a failed transaction is skipped; only this program | 168 |
| [`fake-rpc.ts`](tests/sdk/fake-rpc.ts) | a JSON-RPC endpoint on 127.0.0.1 backed by a LiteSVM world, so SDK functions that take an RPC URL (`recheck`, the A-3 preparation) run against the program's rea | 86 |
| [`fake-simulate.ts`](tests/sdk/fake-simulate.ts) | the two RPC methods the A-3 preparation needs beyond reads, answered by a LiteSVM world: `getLatestBlockhash`, and `simulateTransaction` of an unsigned transact | 84 |
| [`join-parity.test.ts`](tests/sdk/join-parity.test.ts) | `checkJoin` against `user_join_campaign` (Sprint 05 closure review: a baker's money path had no parity harness). Each case of the program's join tests that the  | 131 |
| [`math-vectors.test.ts`](tests/sdk/math-vectors.test.ts) | X0.3, the TypeScript half, first file: every vector the program's Rust math wrote into tests/vectors/math-vectors.csv (programs/brot-markets/tests/math_vectors. | 56 |
| [`open-parity.ts`](tests/sdk/open-parity.ts) | the parity harness of A-10 / X0.7 (SDK half): one opening fed to both `validateOpenCampaign` (from the world's accounts and clock, read before anything is sent) | 124 |
| [`points.test.ts`](tests/sdk/points.test.ts) | the leaderboard's points rule (Sprint 13; BR-29; Q7 answered a): 1 point per campaign entered on the side that won, once the result is final; never for volume,  | 146 |
| [`prepare-claim.test.ts`](tests/sdk/prepare-claim.test.ts) | the reserve path end to end (TP §3.4.5; TP v0.0.1 Q2, answered b): a creator share that would leave the creator's empty wallet below the rent-exempt minimum sta | 136 |
| [`prepare-guards.test.ts`](tests/sdk/prepare-guards.test.ts) | the guards of the A-3 preparation (Sprint 05 review): a retried join that already landed is refused instead of doubled (A-9, M2); the slippage is bounded (L3);  | 109 |
| [`prepare.test.ts`](tests/sdk/prepare.test.ts) | A-3 end to end against the program's state (LiteSVM behind a local RPC endpoint): a join and a paid opening are re-read, checked, built, summarised from the byt | 138 |
| [`prepared.ts`](tests/sdk/prepared.ts) | `ready(prepared)` for the SDK tests: the prepared transaction when `prepareJoin` or `prepareOpenCampaign` says ready, or a failure that names the stage that sto | 18 |
| [`program-data.test.ts`](tests/sdk/program-data.test.ts) | A-8 in the SDK: the program's last deploy read from its ProgramData account (owner first, the loader's layout, only 45 bytes), and the preparations of a join an | 116 |
| [`recheck.test.ts`](tests/sdk/recheck.test.ts) | BR-23: `recheck(campaign, rpcUrl)` re-reads, through an RPC endpoint the caller chooses (here a local one backed by the LiteSVM world), the account and field th | 126 |
| [`rpc-shape.ts`](tests/sdk/rpc-shape.ts) | a transaction sent in LiteSVM, returned in the shape the RPC's `getTransaction` (encoding `json`, `maxSupportedTransactionVersion: 0`) gives it, so the SDK's de | 107 |
| [`schemas.test.ts`](tests/sdk/schemas.test.ts) | the opening's zod schema (TP Appendix B): one valid input per kind parses and converts to the SDK's `OpenArgs` the builders take; text, extra keys, numbers wher | 75 |
| [`snapshot-vectors.test.ts`](tests/sdk/snapshot-vectors.test.ts) | X0.3, the TypeScript half, second file: every vector of tests/vectors/snapshot-vectors.csv (programs/brot-markets/tests/math_vectors_snapshot.rs: the finalize s | 114 |
| [`stored.test.ts`](tests/sdk/stored.test.ts) | the SDK's reading of a stored campaign (packages/sdk/src/read/math/stored.ts) against the program's own payouts in LiteSVM, on whole cycles: what each entry is  | 131 |
| [`summary-budget.test.ts`](tests/sdk/summary-budget.test.ts) | the summary bounds what a compute budget can cost (Sprint 05 review, H1): the unit limit and price decoded, `ceil(price × limit / 10^6)` counted in what the sig | 83 |
| [`summary-message.test.ts`](tests/sdk/summary-message.test.ts) | the summary of the bytes a wallet signs (Sprint 05 review, M5) and of what they say (M3, L1, L10): `summarizeMessage` decodes the compiled message itself, so an | 192 |
| [`summary-shape.test.ts`](tests/sdk/summary-shape.test.ts) | the summary trusts this program's instructions only as the IDL shapes them (Sprint 05 review, L11): every instruction the SDK builds, all 22 kinds, is trusted;  | 116 |
| [`validate-open-extra.test.ts`](tests/sdk/validate-open-extra.test.ts) | A-10 / X0.7, SDK half: the cases of the program's own tests the first parity files left out (Sprint 05 closure review), each fed to `validateOpenCampaign` and t | 91 |
| [`validate-open-kinds.test.ts`](tests/sdk/validate-open-kinds.test.ts) | A-10 / X0.7, SDK half, for the four kinds other than the price kind: each case tests/brot/open-campaign-kinds.test.ts feeds to the program (row 1's closed `Stak | 120 |
| [`validate-open-payment.test.ts`](tests/sdk/validate-open-payment.test.ts) | A-10 / X0.7, SDK half, for rows 7, 8 and 10: each case tests/brot/open-campaign-refuses-payment.test.ts and open-campaign-retry.test.ts feed to the program is f | 100 |
| [`validate-open-price.test.ts`](tests/sdk/validate-open-price.test.ts) | A-10 / X0.7, SDK half, for the price kind and the rules every kind shares: each case that tests/brot/open-campaign-refuses.test.ts feeds to the program is fed t | 109 |
| [`vectors.ts`](tests/sdk/vectors.ts) | what the two vector replays share: reading a vector file, running an SDK function the way the Rust generators print a `Result` (`ERR:<BrotError>` for a refusal) | 58 |
| [`view.test.ts`](tests/sdk/view.test.ts) | A-7 and BR-05: `publicState` gives each of the five public states (and its details) from the campaign and the CHAIN's time alone; chain times decades from the m | 103 |

## `tests/site/`

| Arquivo | Núcleo | Linhas |
|---|---|---:|
| [`amount.test.ts`](tests/site/amount.test.ts) | the amount a baker types becomes lamports exactly (no floating point), with a dot or a comma and at most nine decimals; anything else is refused, never guessed. | 54 |
| [`campaign-load.test.ts`](tests/site/campaign-load.test.ts) | what the campaign page reads through the RPC, against the program in LiteSVM: the campaign at the route's u64 id (nothing at an unknown one), its public state a | 101 |
| [`campaign-proof.test.ts`](tests/site/campaign-proof.test.ts) | the campaign page's proof (BR-23) for each kind, from the program's own campaign accounts and real captured bytes of the accounts they read: the value read now  | 120 |
| [`copy-vocabulary.test.ts`](tests/site/copy-vocabulary.test.ts) | the site's words follow D-m (campaign, entry, baker, creator, pot, YES/NO) and never the D6 table's old copy (proposal 0.4 §5.2: "mercado", "aposta", "apostar", | 132 |
| [`cycle-run.ts`](tests/site/cycle-run.ts) | one campaign's life run end to end through the recording RPC (cycle.ts), stopping where a test needs it: in review (just resolved), settling (finalized, nothing | 97 |
| [`cycle.ts`](tests/site/cycle.ts) | a campaign's whole life driven through the site tests' recording RPC (fake-chain.ts), so every transaction is in the RPC's history and a wallet's page can read  | 192 |
| [`entry-estimate.test.ts`](tests/site/entry-estimate.test.ts) | the entry panel's estimate is the SDK's (BR-09; P1 §3.2): the number `checkJoin` gives for the pot with the baker's own amount added, which is the number `prepa | 135 |
| [`entry-failures.test.ts`](tests/site/entry-failures.test.ts) | each way an entry can fail has its own message (Sprint 11 DoD): the program's refusals are named by the SDK's error map, with the program's own message from the | 163 |
| [`fake-chain.ts`](tests/site/fake-chain.ts) | the SDK's LiteSVM-backed fake RPC (tests/sdk/fake-rpc.ts) with what the site's entry flow adds: the wallet's submission (`sendTransaction`, landed in LiteSVM an | 161 |
| [`fee-example.test.ts`](tests/site/fee-example.test.ts) | the fee page's worked example is the SDK's math, and it is P1 §1.2's case (Sprint 13 DoD; BR-32): 600 on YES and 400 on NO (here 6 and 4 SOL) give a fee of 40,  | 64 |
| [`manifest.test.ts`](tests/site/manifest.test.ts) | the PWA is the manifest and its icons only (Sprint 13 DoD, S2): the manifest names the site, opens at "/" standalone in the dark theme's colour, and lists icons | 43 |
| [`my-entries.test.ts`](tests/site/my-entries.test.ts) | the rows of "My entries" through a whole cycle, read the way the page reads them (the chain behind the recording RPC, the wallet's history): while settling, eac | 150 |
| [`notices.test.ts`](tests/site/notices.test.ts) | every mandatory notice is on its screen (Sprint 13 DoD; BR-47, P1 §4.6): each notice of app/features/notices/registry.ts is drawn by the component it names, and | 136 |
| [`page-format.test.ts`](tests/site/page-format.test.ts) | how the campaign page writes what it read: exact grouped integers, a value in its kind's units, an age, the visitor's local time (built with options a browser a | 37 |
| [`powers.test.ts`](tests/site/powers.test.ts) | the powers table (BR-41, Sprint 13 DoD): content/powers.md is published on /record with who holds each key and the limit of each power (P4 §4.2), its four roles | 74 |
| [`received.test.ts`](tests/site/received.test.ts) | what "my entries" says a wallet received equals the program's settlement events for that wallet, and the SOL that actually reached it (Sprint 12 DoD), on whole  | 172 |
| [`recheck-commands.test.ts`](tests/site/recheck-commands.test.ts) | the re-check panel's commands fetch the bytes the program's readers read (BR-23): on real captured accounts, the byte range each command asks for decodes to the | 79 |
| [`relay-trace.test.ts`](tests/site/relay-trace.test.ts) | the relay's allowlist is taken from a trace of the real client (Sprint 11 DoD; proposal §2.6): the campaign page's reads, the entry's preparation, the hand-off  | 111 |
| [`report.test.ts`](tests/site/report.test.ts) | "Report this campaign" (C-10, Sprint 13 DoD): the link goes where reports go (the founder's [Q], built as recommended: the same X account as L-13), as a plain l | 77 |
| [`retry-guard-rules.test.ts`](tests/site/retry-guard-rules.test.ts) | the retry guard's rules (A-9), without a chain: what a record means given the chain now (a signature's confirmed status decides; without one, the entry total; p | 170 |
| [`retry-guard.test.ts`](tests/site/retry-guard.test.ts) | the site's retry guard (A-9; proposal §3.4 rule 6) end to end, against the program in LiteSVM behind a local RPC: the record is saved before the wallet sees the | 141 |
| [`state-world.ts`](tests/site/state-world.ts) | a campaign account written into the program's world in each public state the site shows (Sprint 12), for the render test and the web smoke: closed on time, clos | 120 |
| [`states-render.test.ts`](tests/site/states-render.test.ts) | every public state of the campaign page renders what the chain says (Sprint 12 DoD), one case per state: a campaign account in that state is written into the pr | 195 |
| [`support.ts`](tests/site/support.ts) | what the site's tests share: the world's accounts read the way the page reads them (owner and bytes), the inputs of the entry panel's estimate, a key-value stor | 93 |
| [`upgrade-pause.test.ts`](tests/site/upgrade-pause.test.ts) | A-8 on the site (the founder's answers of 2026-10-10: ProgramData read through the site's RPC; the floor at 1%): the entry's preparation passes the deploy the s | 89 |
| [`void-log.test.ts`](tests/site/void-log.test.ts) | the void log's public format (Sprint 12 deliverable, "its JSON Schema check in CI"): the committed JSON Schema is the one generated from the zod schema; every r | 132 |

---

## Manutenção

Regenere sempre que criar, remover ou renomear arquivo de código:

```bash
node scripts/codemap.js
```

O CI roda `node scripts/codemap.js --check` e **falha se este arquivo estiver desatualizado**. Um codemap velho é pior que nenhum: a IA confia nele e pula a leitura.
