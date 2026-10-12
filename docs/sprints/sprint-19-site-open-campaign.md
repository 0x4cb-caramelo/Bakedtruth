# Sprint 19 — Site: open a campaign (the creation box, `/abrir`)

**Status:** built on 2026-10-10; merged into `main` with pull request #68 on 2026-10-11, at Ronaldo's request, with
the tag `sprint-19` on the merge commit once CI passes on `main`; the items that need the founder, a devnet write or a
real device are marked waiting below · **Branch:** `sprint-19-site-open-campaign`, cut from `origin/main` at
`70fc29b` (PR #66, which holds the tag `sprint-13`), with `origin/main` at `c25d500` (PR #67, the brand's colours)
merged in before the pull request · **Dates:** none, by the founder's decision

## Record (2026-10-10)

- **Starting point.** `origin/main` holds `sprint-13` (`git merge-base --is-ancestor sprint-13 origin/main`), with PR #64
  (answer 3a's points rule), #65 (the legal pages) and #66 (the founder's privacy details, the "18 and over" line,
  docs.brot.markets down) merged. The local program binary equals `main`'s CI artifact (run 38094571074, SHA-256
  `cf2359…a3a8`). The 3 CPI-proxy tests fail locally by design (the artifact does not carry that test program).
- **What already existed.** Sprint 05's SDK holds the program's rules for an opening: `validateOpenCampaign` (rows 1 to 10
  in the program's order), the opening quote at `price − conf` with `max_lamports`, `prepareOpenCampaign` (A-3: re-read,
  checked, built, summarised from the bytes, simulated, the whole debit) and its parity tests against the program. The
  box is the site's layer over them. Nothing in the program changed; in the SDK, only the summary's words for the
  creator's share ("1% of the entries", not "of the pot", the reviews' S24 and L14).
- **The box** (`app/features/open-campaign/`, at `/abrir`): the four sections of the approved Sprint -1 design (1 What,
  2 Details, 3 Preview sticky beside them on a wide screen, 4 Cost) and the phone's sticky bar under 861 px. Pure pieces
  first, each with its test: `draft.ts` (the slots parsed as text into the SDK's `OpeningChoice`, no float), `kinds.ts`
  (the five templates), `search.ts` (the typeahead, local), `prefill.ts` (a link fills slots, never signs),
  `account-check.ts` (the readers' owner and layout rules, "if resolved now"), `quote.ts` (the quote and the US$ split),
  `check.ts` (`checkBox`: the exact `OpenArgs`, then `validateOpenCampaign`, then the box's own stops), `retry-guard.ts`
  and `recent.ts` (T17), `submit.ts` and `watch.ts` (the hand-off and the watch to `finalized`). Then the React hooks and
  the components.
- **The sentence is template v1 everywhere.** `app/features/campaigns/sentence.ts` now writes one template per kind
  (the price wording unchanged: "BTC/USD reaches 120,000"; a burn "<mint> supply falls to <target> raw units"; a lock
  "Meteora pool <pool> reaches <target> liquidity units locked for good"; a stake pool "Stake pool <pool> holds at least
  <SOL> SOL at the start of epoch <E>"; a stake "Validator <vote account> has at least <SOL> SOL staked in epoch <E>",
  "its measured epoch" where a list has no epoch), from the stored fields only, and the box's preview uses the same
  function, so what a creator reads is what every page and card shows. A field not filled in yet reads "(target)",
  "(epoch)". Accounts are named by their shortened address; a reviewed name shows beside them in the box, never inside
  the sentence.
- **The money.** The box's quote is the SDK's at the sponsored SOL/USD account, minus its confidence band, with
  `max_lamports` the quote plus 1% (`MARGIN_BPS`, the "quote + 1%" of the approved design; T25). On US$500 that bounds a
  price move of about US$5; past it the program refuses (`OpeningAboveMaxLamports`) and only the network fee of a sent
  transaction could move. Every amount is written in exact lamports as SOL. The reference example of the plan
  (US$109.27: 4,575,821,360, 4,118,239,224 and 457,582,136 lamports) is a test.
- **A-10.** Every error with a row of TP §3.4.10 has its own message in `copy-refusals.ts` (a test fails when one is
  missing). Twenty-one refused cases are built through the box itself (the draft, read through the site's RPC,
  `checkBox`) and their very arguments sent straight to the program in LiteSVM, which refuses each with the same error:
  the price kind's rows 3 to 5, 7, 8 and 10, a burn on the wrong owner and on a live mint authority, the closed
  `StakeAtLeast`, and, since the adversarial review (M7), a stake pool's epoch already started or after the deadline,
  its target already met, a pool that stopped updating, a Meteora pool's target met and a resized account, a price band
  too wide and a target out of reach. Four accepted cases go through both too (a stake pool on its measured epoch, a
  Meteora pool, a burn on a revoked mint, a team key with a stale SOL/USD). A feed Pyth no longer fully verifies is refused by the program, and
  the box names it at the asset field. Two cases the box cannot stop by itself (the terms changed, the price moved past
  `max_lamports`) are refused by the program and then by the SDK on its re-read (`tests/site/open-refusals.test.ts`,
  `open-cases.ts`, `open-kinds.test.ts`). The other errors with a row are fed to the program and to the SDK by Sprint
  05's parity tests (`tests/sdk/validate-open-*.test.ts`).
- **The retry guard (T17, A-9).** The id is drawn once per page and wallet (randomly), saved in this browser when "Sign
  in wallet" hands the transaction over (never before: the legal review, M6), and reused by every rebuild, so a second
  send fails on the existing `Campaign`; on a return without an answer the box looks the campaign up by its id on every
  poll until the transaction can no longer land, and links `/c/{id}` instead of offering a new opening. A refusal in the
  wallet deletes only its own attempt's record. With no record in flight, a paid opening first reads the wallet's own
  transactions of the last half hour (pages of 25 signatures, at most four; at most 20 transactions read) and offers
  the campaign it finds, newest first, so a busy wallet's retry still finds it; when it found none and could not read
  everything it says so and the creator chooses (the adversarial review, H2; the web smoke found the busy case); the
  plan's indexer for this does not exist. Tested end to end in LiteSVM (`tests/site/open-retry.test.ts`,
  `open-recent.test.ts`) and in the browser (`tests/e2e/open-guard.e2e.ts`).
- **The web smoke** gained "open a campaign" (`tests/e2e/open.e2e.ts`, desktop and 412 px: a paid opening from a link,
  whose stored charge equals the box's quote and the formula, and a team key's free opening) and "open a campaign:
  refusals and the retry guard" (`tests/e2e/open-guard.e2e.ts`, desktop: three refusals, an answer lost across a reload
  then an expired attempt rebuilt on the same id, cleared storage, a wallet that never answers, a deadline typed by
  hand). It runs on LiteSVM, as
  Sprint 11's smoke does, not on Surfpool: the same program binary with the captured Pyth accounts, in process.
- **Two bugs the smoke found and the box now handles.** After a reload, the watch of an unresolved attempt restarted on
  every render and never ended (callbacks recreated each render, fixed with refs), and the sheet did not show "Checking"
  until a watch ended; a fresh browser whose wallet opened a campaign minutes before is shown that campaign first, as
  the guard intends, so the tests answer that question.
- **Deviations, each until the piece it needs exists** (TP §3.6, "Built in Sprint 19"): names from
  `content/account-names.json` (empty) and Pyth's pinned list, since `/api/v1/names` is not built; the US$ shown is the
  opening's own amounts and the Pyth price with its publish time, since `/api/v1/price` is not built; reads through the
  site's RPC (`docs/technical/relay-allowlist.md` lists them), since `/rpc` is not built; the guard's second witness from
  the chain, since the indexer is not built; the list card in place of the share card, which Sprint 10 carried.
- **Also changed.** The fee page links the box. The read-only `scripts/team/check-opening.ts` checks a stored opening
  against the formula (the devnet DoD's evidence), with its steps in `deploy/devnet/README.md`. The wallet in-app
  browser checklist (X2.2) exists now, opening included (`docs/technical/wallet-browser-checklist.md`). The privacy page
  says when the box's browser record is written and deleted, what the RPC sees, and that clearing the site's data
  deletes the browser's notes (`docs/legal/PRIVACY-POLICY.md`, `services/landing/public/privacy.html` rebuilt; the nine
  questions in TP §8.3). The fee page, How it works and the powers table say "US$500 or more", split 90/10 as a whole.
  The root `tsconfig.json` maps the site's `@/` alias, so tests can import any site file.

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
      YES (TP §3.4.10, row 1). **Done:** five templates; `StakeAtLeast` is shown as "Opens after a test YES on devnet" and the
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
      (`tests/site/open-quote.test.ts`, "opening quote matches the program charge"). **Waiting:** `/api/v1/price` does
      not exist; by answer 4a the box shows the opening's own US$ amounts and the Pyth price with its publish time
      until it does.
- [x] The transaction carries `max_lamports`: the quote plus a margin recorded at the sprint's opening **[AC]** (T25).
      The box also shows the rent of the two new accounts, returned at close. **Done:** 1% (`MARGIN_BPS`), recorded
      above and in the session log; the rent is read from the cluster.
- [x] While SOL/USD is older than `max_price_age`, paid openings are blocked and the box says why; a team key can still
      open (proposal §2.4.5). **Done** (the web smoke's third refusal; a team key's free opening through the box with a
      stale SOL/USD in `tests/site/open-refusals.test.ts`).
- [x] **`validateOpenCampaign`** (SDK, Sprint 05) runs on every change. Each refusal of TP §3.4.10, rows 1 to 10,
      has its own message in `copy.ts`. The SDK refuses at least what the program refuses (X0.7), and a test sends each
      refused case straight to the program, past the site, and sees the program refuse it too (A-10). **Done** for
      twenty-one refused and four accepted cases built through the box, on every kind that opens (`copy-refusals.ts`;
      `tests/site/open-refusals.test.ts` and `open-kinds.test.ts`); the other errors with a row are fed to the program
      and the SDK by Sprint 05's parity tests (`tests/sdk/validate-open-*.test.ts`).
- [ ] **The preview card** is built from the exact `OpenCampaignArgs` the transaction carries (proposal Appendix B):
      the sentence; the rule in plain words; the live value with "if resolved now: YES/NO"; the money (house fee of
      10% of the losing side; creator share of 1% from the pot; the opening in SOL with its US$ value and 90/10 split;
      `max_lamports`; no cap); the share-card preview; and, on burn, lock and stake kinds, "quem abriu pode controlar o
      resultado e pode ter entrado no SIM ou no NÃO" (BR-26). **Built**, from the arguments `checkBox` built and, in the
      review sheet, from the prepared choice only (the adversarial review, H1); the creator notice in the campaign
      page's own English words on every kind but price, with who else can move the number; the creator's share written
      as 1% of the entries; and the list card as it will look. **Waiting:** the share-card preview, for the share card itself
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
      `prize_lamports + opening_fee_lamports` (I14). **Waiting (founder item 1, answered 1a: after the merge):** every
      devnet write is the founder's.
      Ready: the steps and the read-only check (`deploy/devnet/README.md`, "Checking an opening";
      `scripts/team/check-opening.ts`, tested in `tests/ops/check-opening.test.ts`).
- [ ] The web smoke covers opening at desktop width and about 412 CSS px on Surfpool: a paid opening, a team-key
      opening, three refusals and the retry guard. The wallet in-app browser checklists gain the opening (X2.2, closed
      in Sprint 13). **Built:** the paid and the team key's openings at desktop and 412 CSS px (`open.e2e.ts`); the three
      refusals, the retry guard and a deadline typed by hand once, at desktop width (`open-guard.e2e.ts`); on LiteSVM as
      Sprint 11's smoke does; the checklist is written (`docs/technical/wallet-browser-checklist.md`). **Waiting (item
      5):** Ronaldo runs it by hand, on Phantom and Solflare, on real Android and iOS phones.
- [x] `cd app && bun run lint && bun run build` passes.
- [x] Common closure (`docs/SPRINTS.md`, section 4). **Done:** the checks, the secret scan, the code map, CHANGELOG and
      session log, the four reviews (below); merged with pull request #68 at Ronaldo's request, tag `sprint-19`. One
      thing stays open: `content/powers.md` changed in this sprint, and its two-person review has Ronaldo's approval
      only, while the change was made at his request; Lucas or Bernardo reviews it.

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
pull request). **Answered on 2026-10-11 by Ronaldo: 1a, 2a, 3a, 4a and 6a, each as recommended; item 5 he runs by
hand.** He also approved `content/powers.md` as its second reviewer; since the change was made at his request, the
`content/` rule's second person is still Lucas or Bernardo (open).

1. **The devnet opening (only the founder can do it):** a paid opening through `/abrir` from a wallet outside the team,
   then the read-only check that the charge equals the formula; and a team key's free opening by hand. (a) after this
   pull request is merged, with the steps and the check in `deploy/devnet/README.md`; (b) once the site is deployed on
   the server. Recommended (a). **Answered (a); waiting for the opening itself.**
2. **The privacy page before `/abrir` is public:** the box keeps one new record in the browser and, with none in
   flight, reads the wallet's recent transactions from the RPC. (a) deploy the landing with the updated page, a new
   date and the post on X its section 8 promises, before the new site is public; (b) drop the RPC read and keep only
   the browser record. Recommended (a), built. **Answered (a); waiting for the landing deploy, before `/abrir` is
   public.**
3. **Known account names:** (a) ship with none but Pyth's pinned feeds; the team adds names to
   `content/account-names.json`, each reviewed by two people; (b) the founder names some devnet accounts now.
   Recommended (a), built. **Answered (a).**
4. **The US$ shown next to SOL:** `/api/v1/price` (CoinGecko, D-e) does not exist. (a) until it does, the opening's own
   US$ terms and the Pyth price the program charges at, with its publish time; (b) block the box until Sprint 08 builds
   the route. Recommended (a), built. **Answered (a).**
5. **Real phones (only the founder can do it):** the wallet in-app browser checklist, opening included, in Phantom and
   Solflare on Android and iOS (`docs/technical/wallet-browser-checklist.md`; X2.2). **Ronaldo runs it by hand.**
6. **The site's top banner** (asked after the legal review, N1): it says "We are in a test phase. Here you join with
   test SOL, which has no real value.", the founder's own P1 §4.6 line, and the box now takes test SOL for openings
   too. (a) "We are in a test phase. Here you join and open campaigns with test SOL, which has no real value."; (b) keep
   it as it is: the box says it on its own, by the price and in the sheet.
   Recommended (a), because the banner is on every page and openings cost far more test SOL than entries.
   **Answered (a); applied** (`app/components/copy-site.ts`).

Recorded rather than asked: the `max_lamports` margin is 1%, the "quote + 1%" of the approved Sprint -1 design; a link
never sets the opening's amount (the adversarial review, M6).

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
bun test tests/ -t "a lost record is looked up on-chain"             # added: the guard's second witness, closed on errors
bun test tests/ -t "the box's other kinds agree with the program"    # added: A-10 for pool, lock, burn and more price refusals
bun test tests/ -t "the creation box keeps its promises"             # added: the sheet's facts, the clean-up, no false refusal
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

**The reviews (2026-10-10).** Four reviews ran on the box. The legal report is filed for the lawyer in
`docs/legal/2026-10-10-sprint-19-legal-review.md`, as Sprint 13's was; the others stayed in the session's scratchpad.

- **Copy** (`copywriter-agent`): 9 must, 26 should, 14 nits. The ones that mattered: a paying creator read "Free (team
  key)" and a total of a few thousandths of a SOL until every field was filled; the team key read about a prize and a
  share it does not have; burn and lock targets had no unit; "Row 7:" reached the screen through the program's message;
  the target help said to use a dot where no decimal parses. All must items and most others applied; NIT 10 (the 90/10
  and US$500 written in labels) is deferred (TP §7.5).
- **Legal** (`legal-compliance-agent`): the box's own devnet and not-audited lines, where the prize goes in the usual
  case and that devnet sends nothing by itself, "public and permanent" before an opening, an exact privacy page and
  the nine questions (TP §8.3): applied. M8, deploying the landing before `/abrir` is public, is the founder's (item 2);
  N1, the top banner's words, is the founder's (item 6); B1 to B12, before mainnet, are in TP §7.5 for the lawyer.
- **Devil's advocate** (`devils-advocate-agent`): two high findings, fixed: the review sheet wrote its sentence,
  account and target from the draft, which could change while the opening was prepared (now from the prepared choice
  only, and the box is inert while it prepares); the recent-openings look-up failed open. Also fixed: never "free" by
  default, `max_lamports` and the balance against the most an opening can take, the record cleared only by its own
  attempt, the id redrawn as soon as a campaign sits at it, a superseded watch kept off the screen, commas only as
  thousands, the 90-day choice inside the bound, the link that set the amount, and the A-10 claim (now 21 refused and
  4 accepted cases on every kind that opens). L9 and L13 are deferred (TP §7.5).
- **Coordinator** (`coordinator-agent`, the final gate): **approve with conditions**. Both high findings and every must
  item of the three reviews were fixed in the code; six conditions, all applied: a header that still said the id was
  saved at "Review and sign"; this DoD's web-smoke line, which claimed both widths for everything; a test claimed for
  the date typed before its time that did not exist (now in the smoke); the privacy page's "before you open a
  campaign"; this record (the coordinator's verdict, the legal report filed); and the checks run again. Its should-fix
  items were applied too: a team key's own devnet line and "went through once", a test of the review sheet's facts
  and of the one-day clean-up, no false refusal while an account is read, the unit on the campaign page's proof and
  state panels, an accepted burn case, "creation rules" in the SDK's summary, and the residuals in TP §7.5.

**Found while fixing and checking.** A target with letters ("abc", "1e5") threw and would have taken the whole box down;
a date typed before its time was wiped; a feed Pyth no longer fully verifies showed "Reading the feed's price…" forever.
The web smoke then found two regressions of the fixes themselves: with a stale SOL/USD the box no longer showed the
wallet's balance, and the recent-openings look-up gave up before reading anything once a wallet had more than 20
transactions in the half hour, so a busy wallet's retry was asked "couldn't check" instead of shown its campaign (now
read newest first). The coordinator's test of the one-day clean-up found one more, older than the sprint: one unreadable
record in the browser stopped the clean-up of every other, for openings and for Sprint 11's entries alike (now each
record is read on its own). Each has a test.

**`main` moved.** PR #67 (the brand's colours) was merged into the branch before the pull request: `CHANGELOG.md`
keeps both entries, `session-log/INDEX.md` merged by itself, `CODEMAP.md` was generated again. Every colour token the
box uses exists in the new tokens.

**Checks, on the merged head, after the coordinator's conditions.**

| Check | Result |
|---|---|
| `bun run test` | 701 pass, 3 fail: the three CPI-proxy tests, which fail locally by design (CI builds `cpi_proxy.so`) |
| `bunx tsc --noEmit`, and the app's `tsc` | clean |
| `bun run lint`; `cd app && bun run lint` | clean |
| `cd app && bun run build` (devnet) | passes; A-8 reads the deploy at slot 509389614 |
| Web smoke (`bun run e2e`, isolated network) | 38 passed, 0 failed, 22 skipped by design (each width's own tests) |
| The opening scenarios with the site built and served by Bun 1.4.2 (`E2E_RUNTIME=bun`) | 9 passed, 0 failed, 5 skipped by design |
| `node scripts/codemap.js --check` | up to date |
| `node scripts/ci-secret-scan.js origin/main` | clean |
| `node scripts/os-self-test.js` | coherent, with its usual warnings |
| Landing tests, after rebuilding the privacy page | 47 pass |
| CI on pull request #68 | green on `8259f13` (App, Repo, Program, Mobile bundle); the final head's run is in the pull request |

**Retrospective.**

- **What worked.** Writing the pure pieces first, each with its test, made the reviews' many changes cheap and safe:
  most landed as copy or one function. Building the A-10 cases through the box itself, not only the SDK, is what
  proved the units and the epoch parsing once the new kinds were added. The web smoke caught two regressions that the
  unit tests could not see.
- **What did not.** The first build showed "Free (team key)" to a payer and wrote the review sheet from the draft: a
  test of what a paying visitor sees before filling anything, and one rendering the sheet from prepared arguments,
  would have caught both before review. The DoD's A-10 line claimed more than the tests did. The first privacy text
  was written before the guard's write and delete rules settled, and described an older rule.
- **Next time.** Render every screen that carries a notice in the notices test from the first commit; count the cases
  before writing a DoD claim; write the privacy bullet last, from the code's own tests.
