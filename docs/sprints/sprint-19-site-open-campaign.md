# Sprint 19 — Site: open a campaign (the creation box, `/abrir`)

**Status:** built on 2026-10-10 and in review (a pull request into `main`, not merged); the items that need the
founder, a devnet write or a real device are marked waiting below · **Branch:** `sprint-19-site-open-campaign`, cut
from `origin/main` at `70fc29b` (PR #66, which holds the tag `sprint-13`) · **Dates:** none, by the founder's decision

## Record (2026-10-10)

- **Starting point.** `origin/main` holds `sprint-13` (`git merge-base --is-ancestor sprint-13 origin/main`), with PR #64
  (answer 3a's points rule), #65 (the legal pages) and #66 (the founder's privacy details, the "18 and over" line,
  docs.brot.markets down) merged. The local program binary equals `main`'s CI artifact (run 38094571074, SHA-256
  `cf2359…a3a8`). The 3 CPI-proxy tests fail locally by design (the artifact does not carry that test program).
- **What already existed.** Sprint 05's SDK holds the program's rules for an opening: `validateOpenCampaign` (rows 1 to 10
  in the program's order), the opening quote at `price − conf` with `max_lamports`, `prepareOpenCampaign` (A-3: re-read,
  checked, built, summarised from the bytes, simulated, the whole debit) and its parity tests against the program. The
  box is the site's layer over them; nothing in the program or the SDK changed.
- **The box** (`app/features/open-campaign/`, at `/abrir`): the four sections of the approved Sprint -1 design (1 What,
  2 Details, 3 Preview sticky beside them on a wide screen, 4 Cost) and the phone's sticky bar under 861 px. Pure pieces
  first, each with its test: `draft.ts` (the slots parsed as text into the SDK's `OpeningChoice`, no float), `kinds.ts`
  (the five templates), `search.ts` (the typeahead, local), `prefill.ts` (a link fills slots, never signs),
  `account-check.ts` (the readers' owner and layout rules, "if resolved now"), `quote.ts` (the quote and the US$ split),
  `check.ts` (`checkBox`: the exact `OpenArgs`, then `validateOpenCampaign`, then the box's own stops), `retry-guard.ts`
  and `recent.ts` (T17), `submit.ts` and `watch.ts` (the hand-off and the watch to `finalized`). Then the React hooks and
  the components.
- **The sentence is template v1 everywhere.** `app/features/campaigns/sentence.ts` now writes one template per kind
  (the price wording unchanged: "BTC/USD reaches 120,000"; a burn "<mint> supply falls to <raw target>"; a lock "Meteora
  pool <pool> reaches <raw target> liquidity locked for good"; a stake pool "Stake pool <pool> reaches <SOL> SOL"; a
  stake "Validator <vote account> reaches <SOL> SOL staked"), from the stored fields only, and the box's preview uses the
  same function, so what a creator reads is what every page and card shows. Accounts are named by their shortened
  address; a reviewed name shows beside them in the box, never inside the sentence.
- **The money.** The box's quote is the SDK's at the sponsored SOL/USD account, minus its confidence band, with
  `max_lamports` the quote plus 1% (`MARGIN_BPS`, the "quote + 1%" of the approved design; T25). On US$500 that bounds a
  price move of about US$5; past it the program refuses (`OpeningAboveMaxLamports`) and only the network fee of a sent
  transaction could move. Every amount is written in exact lamports as SOL. The reference example of the plan
  (US$109.27: 4,575,821,360, 4,118,239,224 and 457,582,136 lamports) is a test.
- **A-10.** Every error with a row of TP §3.4.10 has its own message in `copy-refusals.ts` (a test fails when one is
  missing), and thirteen refused cases are built through the box itself (the draft, read through the site's RPC,
  `checkBox`) and their very arguments sent straight to the program in LiteSVM, which refuses each with the same error;
  two cases the box cannot stop by itself (the terms changed, the price moved past `max_lamports`) are refused by the
  program and then by the SDK on its re-read (`tests/site/open-refusals.test.ts`, `open-cases.ts`).
- **The retry guard (T17, A-9).** The id is drawn once per page (randomly), saved in this browser at "Review and sign"
  before anything reaches the wallet, and reused by every rebuild, so a second send fails on the existing `Campaign`;
  on a return without an answer the box looks the campaign up by its id on every poll until the transaction can no
  longer land, and links `/c/{id}` instead of offering a new opening. With no saved record, a paid opening first reads
  the wallet's own transactions of the last half hour (at most 20 signatures, 5 transactions read) and offers the
  campaign it finds; the plan's indexer for this does not exist. Tested end to end in LiteSVM
  (`tests/site/open-retry.test.ts`) and in the browser (`tests/e2e/open-guard.e2e.ts`).
- **The web smoke** gained "open a campaign" (`tests/e2e/open.e2e.ts`, desktop and 412 px: a paid opening from a link,
  whose stored charge equals the box's quote and the formula, and a team key's free opening) and "open a campaign:
  refusals and the retry guard" (`tests/e2e/open-guard.e2e.ts`, desktop: three refusals, an answer lost across a reload
  then an expired attempt rebuilt on the same id, cleared storage, a wallet that never answers). It runs on LiteSVM, as
  Sprint 11's smoke does, not on Surfpool: the same program binary with the captured Pyth accounts, in process.
- **Two bugs the smoke found and the box now handles.** After a reload, the watch of an unresolved attempt restarted on
  every render and never ended (callbacks recreated each render, fixed with refs), and the sheet did not show "Checking"
  until a watch ended; a fresh browser whose wallet opened a campaign minutes before is shown that campaign first, as
  the guard intends, so the tests answer that question.
- **Deviations, each until the piece it needs exists** (TP §3.6, "Built in Sprint 19"): names from
  `content/account-names.json` (empty) and Pyth's pinned list, since `/api/v1/names` is not built; the US$ shown is the
  opening's own terms and the Pyth price with its publish time, since `/api/v1/price` is not built; reads through the
  site's RPC (`docs/technical/relay-allowlist.md` lists them), since `/rpc` is not built; the guard's second witness from
  the chain, since the indexer is not built; the list card in place of the share card, which Sprint 10 carried.
- **Also changed.** The fee page links the box. The read-only `scripts/team/check-opening.ts` checks a stored opening
  against the formula (the devnet DoD's evidence), with its steps in `deploy/devnet/README.md`. The wallet in-app
  browser checklist (X2.2) exists now, opening included (`docs/technical/wallet-browser-checklist.md`). The privacy page
  lists the box's browser record and its RPC read (`docs/legal/PRIVACY-POLICY.md`, `services/landing/public/privacy.html`
  rebuilt). The root `tsconfig.json` maps the site's `@/` alias, so tests can import any site file.

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

- [x] `/abrir` lives in `app/features/open-campaign/`, as Sprint -1's approved design draws it at desktop and phone
      widths. **Done:** the four sections and the phone's sticky bar; checked at 1280 and 412 CSS px in the web smoke.
- [x] **No free text (D-j):** the creator supplies only the kind, the account address, the target, the deadline and,
      for the price kind, the direction. What is typed in the typeahead is a search over the templates and the known
      names (`/api/v1/names`); it is never sent or stored. The sentence is rendered from `template_version` and the
      stored fields (A-11). **Done**, with the names from `content/account-names.json` and Pyth's pinned list, read on
      the server, since `/api/v1/names` is not built (`search.ts` and its query stay in the component's memory;
      `sentence.ts`, template v1).
- [x] **The five kinds (D-k; P1 §4.2):** one sentence template each. `StakeAtLeast` is offered only after its devnet
      YES (TP §3.4.10, row 1). **Done:** five templates; `StakeAtLeast` is shown as "Opens after a YES on devnet" and the
      box refuses it with row 1's message (`STAKE_AT_LEAST_OPENS`).
- [x] **The account check preview:** the account slot accepts any address (D-i) and checks it live through `/rpc`
      against the same rules as the kind's reader at creation: owner, size and layout. On the price kind, the
      sponsored push-oracle account of the feed, owned by `rec2HH…`, fully verified, fresh, with confidence at most
      0.5% of the price (TP §3.4.10, row 4). An account with no reviewed name shows its shortened address and an
      explorer link (A-11). The live value feeds "if resolved now: YES/NO". **Done**, through the site's RPC (the
      public devnet one) since `/rpc` is not built (`account-check.ts`, `feed-picker.tsx`, `account-slot.tsx`).
- [ ] **The opening quote:** the box reads the Pyth SOL/USD account through `/rpc` and computes, with the SDK's mirror
      of `math/opening.rs`, `opening_paid_lamports = ceil(opening_usd × 10^(9 − e) ÷ p)`; the prize is
      `floor(paid × 9,000 ÷ 10,000)` and the opening fee the rest (proposal §2.4.5). It shows the SOL amount and the
      US$500, US$450 and US$50 split; at the US$109.27 reference these are 4.5758, 4.1182 and 0.4576 SOL (display
      example; the program charges at the Pyth price). The US$ display value comes from `/api/v1/price`, with source
      and time (D-e). **Built:** the quote, the split and the reference example are tests
      (`tests/site/open-quote.test.ts`, "opening quote matches the program charge"). **Waiting (founder item 4):**
      `/api/v1/price` does not exist; the box shows the opening's own US$ terms and the Pyth price with its publish time.
- [x] The transaction carries `max_lamports`: the quote plus a margin recorded at the sprint's opening **[AC]** (T25).
      The box also shows the rent of the two new accounts, returned at close. **Done:** 1% (`MARGIN_BPS`), recorded
      above and in the session log; the rent is read from the cluster.
- [x] While SOL/USD is older than `max_price_age`, paid openings are blocked and the box says why; a team key can still
      open (proposal §2.4.5). **Done** (the web smoke's third refusal; a team key's free opening through the box with a
      stale SOL/USD in `tests/site/open-refusals.test.ts`).
- [x] **`validateOpenCampaign`** (SDK, Sprint 05) runs on every change. Each refusal of TP §3.4.10, rows 1 to 10,
      has its own message in `copy.ts`. The SDK refuses at least what the program refuses (X0.7), and a test sends each
      refused case straight to the program, past the site, and sees the program refuse it too (A-10). **Done**
      (`copy-refusals.ts`; `tests/site/open-refusals.test.ts`, "validateOpenCampaign refuses what the program refuses").
- [ ] **The preview card** is built from the exact `OpenCampaignArgs` the transaction carries (proposal Appendix B):
      the sentence; the rule in plain words; the live value with "if resolved now: YES/NO"; the money (house fee of
      10% of the losing side; creator share of 1% from the pot; the opening in SOL with its US$ value and 90/10 split;
      `max_lamports`; no cap); the share-card preview; and, on burn, lock and stake kinds, "quem abriu pode controlar o
      resultado e pode ter entrado no SIM ou no NÃO" (BR-26). **Built**, the creator notice in the campaign page's own
      English words, and the list card as it will look. **Waiting:** the share-card preview, for the share card itself
      (`app/c/[id]/opengraph-image.tsx`, carried by Sprint 10 and not built).
- [x] Before signing, `@brot/sdk/tx` re-reads the accounts, simulates, and shows the deterministic summary (A-3).
      **Done:** "Check before you sign" lists every argument and the SDK's summary of the very bytes the wallet gets.
- [x] **The retry guard (T17, A-9):** the client draws a random u64 `id` once and saves it in browser storage before
      handing the transaction to the wallet. A rebuilt transaction reuses it, so a second send fails on the existing
      `Campaign`. On a return without an answer, the box polls until `lastValidBlockHeight` passes, then looks the
      campaign up by `id` and links `/c/{id}` instead of offering a new opening. If the storage was cleared, it also
      checks the indexer for a recent `CampaignOpened` by this wallet before offering one **[INF]**. **Done**, the last
      check from the chain since the indexer is not built (`recent.ts`); the box looks the campaign up on every poll, not
      only past the height (`tests/site/open-retry.test.ts`, "a retried opening reuses its id";
      `tests/e2e/open-guard.e2e.ts`).
- [ ] **The team-key path (P-3):** a team key sees no payment and no creator share and sends no `openingUsd`. A
      partner's campaign is linked to the partner in `content/partners.json` by the team. **Built** (the web smoke's
      team opening). **Waiting:** `content/partners.json` does not exist yet (Sprint 08 creates it, Sprint 10 reads it).
- [ ] The pause, a full `max_open_campaigns` valve and `entries_allowed` false each block the box with their own
      message. `brot-rpc` refuses an opening from a blocked country (proposal §2.6). **Built:** the three messages (the
      pause and the valve in `tests/site/open-refusals.test.ts`; the site's switch from the read API's health, K-11).
      **Waiting:** the country refusal, for the `brot-rpc` relay (Sprint 08).
- [x] **Prefill:** `/abrir` accepts a template id and slot values in the URL; a prefilled box never signs anything
      (proposal §3.8). **Done** (`prefill.ts`; the box says a link filled it; the web smoke opens from a link only after
      the clicks).
- [x] After signing, the box polls `getSignatureStatuses` to finalized and links `/c/{id}`, which shows the campaign
      once the indexer ingests `CampaignOpened`. **Done:** `/c/{id}` reads the chain, so it shows the campaign at once;
      the home list shows it once the read API reads it again.
- [ ] **On devnet,** a non-team wallet opens a paid campaign through the box, and the `Campaign` account shows
      `opening_paid_lamports` equal to the quote's formula at the price read, split as
      `prize_lamports + opening_fee_lamports` (I14). **Waiting (founder item 1):** every devnet write is the founder's.
      Ready: the steps and the read-only check (`deploy/devnet/README.md`, "Checking an opening";
      `scripts/team/check-opening.ts`, tested in `tests/ops/check-opening.test.ts`).
- [ ] The web smoke covers opening at desktop width and about 412 CSS px on Surfpool: a paid opening, a team-key
      opening, three refusals and the retry guard. The wallet in-app browser checklists gain the opening (X2.2, closed
      in Sprint 13). **Built:** the smoke covers all of it at both widths, on LiteSVM as Sprint 11's smoke does; the
      checklist is written (`docs/technical/wallet-browser-checklist.md`). **Waiting (founder item 5):** running it on
      Phantom and Solflare on real Android and iOS phones.
- [x] `cd app && bun run lint && bun run build` passes.
- [ ] Common closure (`docs/SPRINTS.md`, section 4). **Done but the merge and the tag:** the checks, the secret scan,
      the code map, CHANGELOG and session log, the reviews (below); the pull request waits for review and is not merged.

## Deliverables

- The creation box in `app/features/open-campaign/`: templates, typed slots, the account check, the quote, the
  preview card, the retry guard, and `copy.ts` with one message per refusal.
- The opening flow in the Playwright smoke and in the wallet in-app browser checklists.

## Out of scope

Program changes: every rule lives in `user_open_campaign` (Sprints 02 and 03). The second team signature for entries
closing less than 24 hours before the deadline, which waits for traffic (P1 §3.6). Free text in any form. The sealed
entry and the added prize (15). The Android app's creation box (21).

## Founder decisions that block the sprint

- L-01 (Product Brief v0.0.1 gap): the language of the sentence templates. **Answered** in Sprint -1's closure: English.
- BP-14 (P-9, open): the creator notice is built as recommended, "permitir, com aviso automático". **Answered** in
  Sprint -1's closure ("standard minimal warnings, with automatic notice").
- **Answered:** D8 (a), taken as approved with the proposal; D-b (US$500 in SOL, 90/10); D-f (Pyth on-chain for the
  charge, CoinGecko for display); D-i (no list); D-j (no free text); D-k (five kinds, account checked, 3 to 90 days,
  fixed fees); P-3 (team and partners pay nothing and keep no 1%).

**Asked on 2026-10-10, at the start, in one list** (each built as recommended where it is a choice; none blocks the
pull request):

1. **The devnet opening (only the founder can do it):** a paid opening through `/abrir` from a wallet outside the team,
   then the read-only check that the charge equals the formula; and a team key's free opening by hand. (a) after this
   pull request is merged, with the steps and the check in `deploy/devnet/README.md`; (b) once the site is deployed on
   the server. Recommended (a). **Waiting.**
2. **The privacy page before `/abrir` is public:** the box keeps one new record in the browser and, with none saved,
   reads the wallet's recent transactions from the RPC. (a) deploy the landing with the updated page before the new
   site is public; (b) drop the RPC read and keep only the browser record. Recommended (a), built. **Waiting.**
3. **Known account names:** (a) ship with none but Pyth's pinned feeds; the team adds names to
   `content/account-names.json`, each reviewed by two people; (b) the founder names some devnet accounts now.
   Recommended (a), built. **Waiting.**
4. **The US$ shown next to SOL:** `/api/v1/price` (CoinGecko, D-e) does not exist. (a) until it does, the opening's own
   US$ terms and the Pyth price the program charges at, with its publish time; (b) block the box until Sprint 08 builds
   the route. Recommended (a), built. **Waiting.**
5. **Real phones (only the founder can do it):** the wallet in-app browser checklist, opening included, in Phantom and
   Solflare on Android and iOS (`docs/technical/wallet-browser-checklist.md`; X2.2). **Waiting.**

Recorded rather than asked: the `max_lamports` margin is 1%, the "quote + 1%" of the approved Sprint -1 design.

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
bun test tests/ -t "validateOpenCampaign refuses what the program refuses"   # added (A-10, X0.7)
bun test tests/ -t "opening quote matches the program charge"        # added: quote vs lamports moved (I14)
bun test tests/ -t "a retried opening reuses its id"                 # added (T17)
bun test tests/ -t "open campaign box"                               # added: templates, slots, prefill, search, names
bun test tests/ -t "check an opening"                                # added: the devnet check script
bun test tests/ -t "every mandatory notice is on its screen"         # Sprint 13's, with the box's notices
bun test tests/ -t "the client's rpc trace"                          # Sprint 11's, with the box's reads
bun run e2e -- --grep "open a campaign"                              # added: open.e2e.ts and open-guard.e2e.ts
```

A paid opening and a team-key opening by hand on devnet, in a desktop browser and in a wallet's in-app browser.

## Risks

- The price moves between the quote and the signature: `max_lamports` bounds it, and too small a margin makes honest
  openings fail.
- Devnet's SOL/USD updates every 62 to 64 s, so `max_price_age` there is at least 90 s (proposal §2.4.5).
- Browser storage cleared between the hand-off and the return loses the `id`; the indexer check reduces the risk.
- A campaign that ends with no entry returns the prize but not the 10% opening fee, even on a house-failure void (the
  program's rule since Sprint 04; Sprint 12's copy review): the box should say so next to the price, before paying.
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
