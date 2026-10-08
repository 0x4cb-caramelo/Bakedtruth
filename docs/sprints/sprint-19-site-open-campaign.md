# Sprint 19 — Site: open a campaign (the creation box, `/abrir`)

**Status:** planned · **Branch:** `sprint-19-site-open-campaign` · **Dates:** none, by the founder's decision

| | |
|---|---|
| Technical Plan block | B8 (TP §3.6), on the program contract of TP §3.4.10 and the money math of TP §3.4.16 |
| Depends on | Sprints 11 and -1; through them, Sprint 05 (SDK) and Sprint 08 (`/api/v1/names`, `/api/v1/price`, `brot-rpc`) |
| Requirements covered | BR-01 (any wallet opens for US$500 in SOL), BR-02 (the rules, mirrored), BR-26 (creator notice), BR-33 (creators as a growth motor); A-3, A-9, A-10, A-11 |

**Where it fits.** New in v0.1.0, from D8 option (a), taken as approved with the architecture proposal: a design pass
in Sprint -1 and a site slot of size M (proposal §4.0, §5.2) **[DP]**. It runs after Sprint 11 and before Sprint 13
closes, because 13's full cycle opens its campaign here and X2.2 includes opening. Without this screen, "anyone can
open" exists only for people who run scripts (proposal §5.2, D8).

## Goal

Any wallet opens an On-Chain Campaign from the site, inside the rules. The site builds the sentence; the creator fills
typed slots, sees exactly what the transaction will do and what it costs in SOL at the Pyth price, and signs once. The
program decides; the box only mirrors its refusals. A retry never charges twice.

## Definition of done

- [ ] `/abrir` lives in `app/features/open-campaign/`, as Sprint -1's approved design draws it at desktop and phone
      widths.
- [ ] **No free text (D-j):** the creator supplies only the kind, the account address, the target, the deadline and,
      for the price kind, the direction. What is typed in the typeahead is a search over the templates and the known
      names (`/api/v1/names`); it is never sent or stored. The sentence is rendered from `template_version` and the
      stored fields (A-11).
- [ ] **The five kinds (D-k; P1 §4.2):** one sentence template each. `StakeAtLeast` is offered only after its devnet
      YES (TP §3.4.10, row 1).
- [ ] **The account check preview:** the account slot accepts any address (D-i) and checks it live through `/rpc`
      against the same rules as the kind's reader at creation: owner, size and layout. On the price kind, the
      sponsored push-oracle account of the feed, owned by `rec2HH…`, fully verified, fresh, with confidence at most
      0.5% of the price (TP §3.4.10, row 4). An account with no reviewed name shows its shortened address and an
      explorer link (A-11). The live value feeds "if resolved now: YES/NO".
- [ ] **The opening quote:** the box reads the Pyth SOL/USD account through `/rpc` and computes, with the SDK's mirror
      of `math/opening.rs`, `opening_paid_lamports = ceil(opening_usd × 10^(9 − e) ÷ p)`; the prize is
      `floor(paid × 9,000 ÷ 10,000)` and the opening fee the rest (proposal §2.4.5). It shows the SOL amount and the
      US$500, US$450 and US$50 split; at the US$109.27 reference these are 4.5758, 4.1182 and 0.4576 SOL (display
      example; the program charges at the Pyth price). The US$ display value comes from `/api/v1/price`, with source
      and time (D-e).
- [ ] The transaction carries `max_lamports`: the quote plus a margin recorded at the sprint's opening **[AC]** (T25).
      The box also shows the rent of the two new accounts, returned at close.
- [ ] While SOL/USD is older than `max_price_age`, paid openings are blocked and the box says why; a team key can still
      open (proposal §2.4.5).
- [ ] **`validateOpenCampaign`** (SDK, Sprint 05) runs on every change. Each refusal of TP §3.4.10, rows 1 to 10,
      has its own message in `copy.ts`. The SDK refuses at least what the program refuses (X0.7), and a test sends each
      refused case straight to the program, past the site, and sees the program refuse it too (A-10).
- [ ] **The preview card** is built from the exact `OpenCampaignArgs` the transaction carries (proposal Appendix B):
      the sentence; the rule in plain words; the live value with "if resolved now: YES/NO"; the money (house fee of
      10% of the losing side; creator share of 1% from the pot; the opening in SOL with its US$ value and 90/10 split;
      `max_lamports`; no cap); the share-card preview; and, on burn, lock and stake kinds, "quem abriu pode controlar o
      resultado e pode ter entrado no SIM ou no NÃO" (BR-26).
- [ ] Before signing, `@brot/sdk/tx` re-reads the accounts, simulates, and shows the deterministic summary (A-3).
- [ ] **The retry guard (T17, A-9):** the client draws a random u64 `id` once and saves it in browser storage before
      handing the transaction to the wallet. A rebuilt transaction reuses it, so a second send fails on the existing
      `Campaign`. On a return without an answer, the box polls until `lastValidBlockHeight` passes, then looks the
      campaign up by `id` and links `/c/{id}` instead of offering a new opening. If the storage was cleared, it also
      checks the indexer for a recent `CampaignOpened` by this wallet before offering one **[INF]**.
- [ ] **The team-key path (P-3):** a team key sees no payment and no creator share and sends no `openingUsd`. A
      partner's campaign is linked to the partner in `content/partners.json` by the team.
- [ ] The pause, a full `max_open_campaigns` valve and `entries_allowed` false each block the box with their own
      message. `brot-rpc` refuses an opening from a blocked country (proposal §2.6).
- [ ] **Prefill:** `/abrir` accepts a template id and slot values in the URL; a prefilled box never signs anything
      (proposal §3.8).
- [ ] After signing, the box polls `getSignatureStatuses` to finalized and links `/c/{id}`, which shows the campaign
      once the indexer ingests `CampaignOpened`.
- [ ] **On devnet,** a non-team wallet opens a paid campaign through the box, and the `Campaign` account shows
      `opening_paid_lamports` equal to the quote's formula at the price read, split as
      `prize_lamports + opening_fee_lamports` (I14).
- [ ] The web smoke covers opening at desktop width and about 412 CSS px on Surfpool: a paid opening, a team-key
      opening, three refusals and the retry guard. The wallet in-app browser checklists gain the opening (X2.2, closed
      in Sprint 13).
- [ ] `cd app && bun run lint && bun run build` passes.
- [ ] Common closure (`docs/SPRINTS.md`, section 4).

## Deliverables

- The creation box in `app/features/open-campaign/`: templates, typed slots, the account check, the quote, the
  preview card, the retry guard, and `copy.ts` with one message per refusal.
- The opening flow in the Playwright smoke and in the wallet in-app browser checklists.

## Out of scope

Program changes: every rule lives in `user_open_campaign` (Sprints 02 and 03). The second team signature for entries
closing less than 24 hours before the deadline, which waits for traffic (P1 §3.6). Free text in any form. The sealed
entry and the added prize (15). The Android app's creation box (21).

## Founder decisions that block the sprint

- L-01 (Product Brief v0.0.1 gap): the language of the sentence templates.
- BP-14 (P-9, open): the creator notice is built as recommended, "permitir, com aviso automático".
- **Answered:** D8 (a), taken as approved with the proposal; D-b (US$500 in SOL, 90/10); D-f (Pyth on-chain for the
  charge, CoinGecko for display); D-i (no list); D-j (no free text); D-k (five kinds, account checked, 3 to 90 days,
  fixed fees); P-3 (team and partners pay nothing and keep no 1%).

## Agents and skills

- **Agents:** `technical-security-red-team-agent` (what the creator signs; the retry guard), `copywriter-agent` (the
  templates and the refusals), `dev-product-agent`, `coordinator-agent`.
- **Skills:** `feature-scaffold`, `multi-ai-review` (the transaction the creator signs), `sprint-management`,
  `verify-build-works`, `codemap`, `secrets-scan`.

## Security gates

- No creator-supplied text is stored or shown (A-11).
- No creation rule lives only in the site: the program checks every one (A-10).
- The summary the creator reads comes from deterministic code, built from the exact arguments signed (A-3).
- No third-party script on `/abrir` (K-10).
- `secrets-scan` at closure.

## Tests

```bash
export PATH="$HOME/.bun/bin:$PATH"
(cd app && bun run lint && bun run build)
bun test tests/ -t "open campaign refuses"                           # Sprint 02's program test, one case per row
bun test tests/ -t "validateOpenCampaign refuses what the program refuses"   # to add (A-10, X0.7)
bun test tests/ -t "opening quote matches the program charge"        # to add: quote vs lamports moved (I14)
bun test tests/ -t "a retried opening reuses its id"                 # to add (T17)
bun run e2e -- --grep "open a campaign"                              # to add to the Sprint 11 smoke
```

A paid opening and a team-key opening by hand on devnet, in a desktop browser and in a wallet's in-app browser.

## Risks

- The price moves between the quote and the signature: `max_lamports` bounds it, and too small a margin makes honest
  openings fail.
- Devnet's SOL/USD updates every 62 to 64 s, so `max_price_age` there is at least 90 s (proposal §2.4.5).
- Browser storage cleared between the hand-off and the return loses the `id`; the indexer check reduces the risk.
- Any token the reader accepts can be used (D-i), and a creator who controls the measured account can force the
  outcome once the other side holds just over US$56 of third-party money. The notice is the defence the box adds.

## Expected artifacts

`app/features/open-campaign/`, its `copy.ts`, the updated Playwright smoke and checklists, `CODEMAP.md`.

## Changelog and session log

- **Changelog:** the creation box at `/abrir`; any wallet can open a campaign from the site.
- **Session log:** the `max_lamports` margin and why; the final text of each refusal; what changed from Sprint -1's
  design.

## Record and retrospective

Filled in during the sprint and at closure.
