# Sprint 13 — Site: ranking, notices and copy (closes the devnet MVP)

**Status:** merged (PR #63, 2026-10-10) and tagged `sprint-13` on `2dc5cb1`; the founder answered the twelve
questions the same evening (1a to 12a, below), and answer 3a's code went in a follow-up pull request
(`sprint-13-founder-answers`); the items that need Sprint 08, Sprint 19, a real device or the founder's deploys are
marked waiting below · **Branch:**
`sprint-13-site-notices-copy`, cut from `origin/main` at `sprint-12` (`107fec2`) · **Dates:** none, by the founder's decision

## Record (2026-10-10)

- **Starting point.** Sprint 12 was merged (PR #61) and tagged `sprint-12` on `107fec2` the same day; this branch was
  cut from that tag. The local program binary equals `main`'s CI artifact (run 38074799966, SHA-256 `cf2359…a3a8`).
- **The leaderboard and its source.** The founder was asked to choose (a) a read API route from the program's events,
  (b) the browser reading the chain, or (c) waiting for Sprint 08; (a) is built and recommended: the plan already lists
  `GET /api/v1/leaderboard` (TP §6), one server reads the chain instead of every visitor (TP §3.5), and the indexer can
  take it over. `services/api/src/history.ts` reads the program's own signatures at `finalized` (incremental by
  `until`, at most `API_HISTORY_PER_REFRESH` transactions a refresh, in memory) and keeps only the events the rule
  reads; `services/api/src/leaderboard.ts` serves the ranked wallets in pages. The rule is the SDK's `pointsTable`
  (`packages/sdk/src/read/points.ts`): 1 point per campaign entered on the side that won, once the result is final
  (settling or settled, or the 6-hour window ended without a contest: the program refuses every team act from
  `review_ends_at` on, and on devnet nobody finalizes automatically); a void scores nothing; a join tallied as late
  never scores. `/leaderboard` reads the list in pages and finds the connected wallet's line in the browser: the
  request carries no wallet, so no request to Brot's API ties a wallet to an IP address (the browser's own RPC reads
  still carry it to the RPC provider, TP §7.3). **It goes live on devnet when the founder
  redeploys the read API** (a server step, not done here); until then the page says it could not load.
- **The fee page** (`/fees`): P1 §1.2's case in SOL (6 and 4 SOL; the BP's 600 and 400 divided by 100, so every ratio
  is the same) through the SDK's finalize math: fee 0.4, creator 0.1, winners 9.5, 1.583 per 1; with a 4.5 SOL prize,
  14 and 2.333; a partner campaign, 9.6 and 1.6. The one-sided pot (1, 2 and 3 SOL), the void and where its opening fee
  goes, the opening's 90/10, the refund policy, rent and network fees.
- **The powers table** (`content/powers.md`, on `/record`): each key by role and address, never by person, read from
  the devnet program on 2026-10-10 (the upgrade authority, the admin and the fee recipient are one co-founder's devnet
  key; one team key), and each power with the limit in the program's code, the upgrade authority's included. The page
  checks each role against the chain in the visitor's browser and says when the table is out of date.
- **Notices and copy.** `app/features/notices/registry.ts` lists each mandatory notice that holds on devnet with its
  screen; `tests/site/notices.test.ts` renders the screens where it can (the campaign header, the state panel, How it
  works, the leaderboard, the entry notices) and checks the rest by the component that mounts them; the web smoke
  checks them on the built site. P1 §4.6's "Pago sozinho, ao fim da janela de 6 horas" is
  replaced on devnet by the founder's wording (the review rule and "Waiting for payout", no time promised). The copy
  test now forbids P1 §4.6's "Em vez de" phrases and the promises (a return, a yield, a profit, an automatic payout)
  in every source file of the site, and holds BP-5's line in one copy entry. The card's creator notice used other words
  than the page's; it uses the page's now. "No oracle. Just me, reading." was not in the site; the test keeps it out.
- **"How it works"** (`/how-it-works`), linked from the top bar, so its six steps open on a phone; BP-5's line ("No human
  picks the winner.") and BP-11's written name ("Baked") are built as recommended, one string each.
- **"Report this campaign"** on every campaign page, in every state: a plain link to the same X account as L-13 (the
  founder's [Q], built as recommended, one constant). The remedy is real: `content/unlisted.json`, changed by a commit
  with two people's review, hides a campaign from the home page; its page says so, and it stays on-chain with its
  entries, result and payouts unchanged. A malformed entry, or a reason that names a person, fails the build.
- **The PWA, manifest only:** `app/app/manifest.ts` (Next's convention for `app/manifest.ts`), icons drawn by
  `scripts/pwa-icons.ts` from the mascot on the dark theme's colour, an apple-icon; no service worker.
- **`scripts/team/resolution-post.ts`** writes the post from `scripts/team/resolution-post.template.txt`, read-only:
  the result, the value read and the target, the review's end or the void's reason, the account to re-check. It refuses
  a campaign with no result, uses no X API, and prints the length as X counts it; a person posts it.
- **Two Sprint 12 findings deferred here are fixed** (TP §7.3): `personalDataIn` refuses a bare domain and the "@x" and
  "[@x]" forms; the site finds `content/` or fails the build.
- **The web smoke** gained "site pages and notices" (`tests/e2e/site-pages.e2e.ts`, desktop and 412 px). On the final
  code the whole smoke passed under Node (28 passed, 16 skipped by design) and again with the site built and served by
  Bun 1.4.2 (`E2E_RUNTIME=bun`, `bun --bun next`; 28 passed, 16 skipped): the X2.4 evidence, on the development
  machine. The server's own staging test (Sprint 09) stays deferred with the server work.
- **The reviews (2026-10-10)**, summarised here and in the session log; the legal one is kept for the lawyer at
  `docs/legal/2026-10-10-sprint-13-legal-review.md` (with its before-mainnet items and questions): copy (4 must, 15
  should, 17 nits), legal-compliance (6 must, 8 before mainnet, 10 notes; a first draft for the lawyer, not a legal
  opinion) and adversarial (nothing critical; 1 high, 7 medium). **Applied:**
  - The fee page, How it works and the notice before signing now say the Economic Viability Rule (2026-10-09): a pot
    splits only when its losing side can pay Brot's fee and the creator's 1%, otherwise every entry is refunded; the
    bullet saying the creator's share can come from Brot's fee is gone (it cannot happen since that rule), and so is "no
    other refunds" (an entry after a YES proof comes back whole).
  - **The entry estimate:** in a paid campaign with 1 SOL on YES and 0.01 SOL on NO, the panel showed about 5 per 1
    while finalize would refund 0.99. The SDK's `shownReturnBps` is what finalize would pay if entries closed now; the
    panel, the review sheet and the cards show it, with a line when the other side is too small; the signed floor
    stays the program's own estimate.
  - The leaderboard: no success-rate column (a per-wallet rate is a profile, and a wallet on both sides showed 100%);
    the page says what it keeps and how to leave the ranking, and the API applies a hide list kept on the server; a YES
    price result counts only once settling (its late joins are tallied then); each opening of a reused campaign id
    counts apart; events are kept in chain order, not by slot; the history reads on its own loop with timeouts, never
    reads a transaction twice, skips one that never reads back after five tries, and says it is incomplete after a
    failed listing; the table is computed once per change.
  - "Pays as usual" is gone from the report link; an unlisting names one opening of a campaign id; a content file that
    cannot be read no longer takes a campaign page down.
  - The powers table names the discretion that moves money (the cause a team key records for an automatic void decides
    who keeps the 10% opening fee), the ceilings, what is a team rule rather than a code limit, and the plan for mainnet
    as a plan; a test maps every instruction of the program to a row.
  - The resolution post explains a price NO and a target met late, carries one link, puts the devnet line before it,
    fits 280 characters with a 20-digit id, and the script counts as X does.
  - The labels "Open a campaign" and "Public record", the not-audited notice links to the record, the footer carries
    BRAND.md's "nothing here is an offer", and the notices list names the screens that mount each notice.
  - CI runs the site's own tests now (`bun run test` is `bun test tests/ app/`): the X2.1 test never ran in CI before.
  **Deferred**, each with its reason and sprint: TP §7.4. **Found outside the sprint:** entering both sides of a paid
  campaign nobody else joins takes its prize at no risk (TP §13, a founder question); brot.markets' live `/terms` and
  `/privacy` (approved 2026-10-08) still describe USDC, automatic payouts within 55 hours and other team powers.
- **After the merge: the founder's answers (2026-10-10).** All twelve as recommended, 1a to 12a; who holds the X login
  came with them (the CTO, with an authenticator app as the second factor). Answer 3a changed code, in a follow-up pull
  request from `main` at `sprint-13`: no point for a wallet with entries on both sides (`BOTH_SIDES_SCORE` is false),
  none in a pot refunded as one-sided (finalize's `OneSided`, or for a final result still in its account the mode
  finalize would store, which the read API computes through the SDK's `snapshotOf`), and none for the wallet that
  opened a burn, lock or stake campaign (`creatorCanControl`); the creator's other wallets cannot be told apart
  on-chain, and the page now says so, with the 15 days of answer 8a. Tested on the rule
  (`tests/sdk/points-3a.test.ts`), on the route (`services/api/tests/leaderboard-pot.test.ts`) and on whole cycles in
  LiteSVM, a one-sided pot included (`tests/api/leaderboard.test.ts`). An independent review checked the rule against
  the program (entries close at resolution; a finalized campaign always stores its mode; the mode predicted for a final
  result is the one finalize stores) and found no high or medium issue: its copy findings were applied, and two ways the
  history can lag the live accounts for a moment are deferred to the indexer (TP §7.4). The other answers confirm what
  was built, or are recorded for later sprints (below).

| | |
|---|---|
| Technical Plan block | B8 (TP §3.5, §3.6, §8) |
| Depends on | Sprints 12, 08, 07 and 19 |
| Requirements covered | BR-27 (copy), BR-29 (points), BR-30 (partner report), BR-32 (fee page), BR-33 (resolution post), BR-41 (powers table), BR-47 (notices); C-10 (report link) |

## Goal

Close the devnet MVP: the public leaderboard, the fee page, the table of who can do what, every mandatory notice in
place, the copy reviewed in the campaign vocabulary, a report link on every campaign, and one full cycle run through
the site with both services on. The exit criteria X2 are met here.

## Definition of done

- [x] The leaderboard shows the points of `/api/v1/leaderboard`: 1 point per campaign entered on the right side (TP
      v0.0.1 Q7, answered a). It has no volume or profit column. **Done** (`/leaderboard`; the route in `services/api`;
      `tests/sdk/points.test.ts`, `tests/api/leaderboard.test.ts`, `services/api/tests/`, the web smoke). No success
      rate either (the legal review). Live on devnet once the founder redeploys the read API, after the conditions of
      TP §8.2. What scores is the founder's answer 3a (no point on both sides, in a refunded pot, or for the creator's
      own wallet on a burn, lock or stake campaign), applied after the merge.
- [x] **The fee page (BR-32):** a worked example net of the fee and the creator share, using P1 §1.2's case (600 on
      YES, 400 on NO: fee 40, creator 10, winners 950, 1.583 per 1; with the 450 prize, 1,400 and 2.333 per 1); the
      one-sided 1%; the opening's 90/10; the refund policy. **Done** at `/fees`, in SOL (the case divided by 100);
      `tests/site/fee-example.test.ts` ("fee page example matches sdk math").
- [x] **The powers table (BR-41):** `content/powers.md` is published on the public record route: who holds each key
      and the limit of each power (P4 §4.2). Sprint 16 updates it with the multisig. **Done** at `/record`, by role and
      address, with a live check of each key (`tests/site/powers.test.ts`).
- [x] Each mandatory notice that holds on devnet is on its screen (BR-47; P1 §4.6): the devnet notice and "Programa
      ainda sem auditoria" on every screen; the lock notice, the estimate notice and the fee before signing; the
      creator notice on burn, lock and stake campaigns; "Pago sozinho, ao fim da janela de 6 horas" while in review.
      A test lists each notice and the screen that must show it. **Done:** `app/features/notices/registry.ts` and
      `tests/site/notices.test.ts`; on devnet "Pago sozinho…" is the founder's "Waiting for payout" wording, with no time
      promised (Sprint 12's answer).
- [x] No word of P1 §4.6's "Em vez de" column or of the D6 table's copy row appears on the site; the copy test of
      Sprint 11 covers every `copy.ts`. **Done:** the D6 words in every `copy*.ts` and the brand's lines; the "Em vez
      de" phrases and the promises in every source file of the site.
- [x] "Nenhuma pessoa escolhe o vencedor" replaces the "no human in the loop" line, as BP-5's recommendation (P-9,
      open); the line lives in one `copy.ts` entry, so the founder's answer changes one string. **Done:** "No human picks
      the winner." in `app/features/how/copy.ts` (`PRINCIPLE`), approved by the founder (answer 6a).
- [x] The mascot's quips are reviewed; "No oracle. Just me, reading." is gone (design direction, conflict 7). **Done:**
      the site never carried that line; the five quips of `app/lib/brand.ts` are under the copy test now.
- [x] **The report link (C-10):** every campaign page has a "report this campaign" link. The remedy is unlisting
      (proposal §2.7); the campaign stays on-chain, resolves and pays. **Done**, worded for devnet ("its entries,
      result and payouts do not change": nothing pays by itself there yet) (`app/features/report/`,
      `content/unlisted.json`); where it leads is the founder's [Q], answered 5a: the X account, as built.
- [x] **The PWA, manifest only (S2):** `app/manifest.ts` and its icons. No service worker (proposal §3.3). **Done** as
      `app/app/manifest.ts` (`tests/site/manifest.test.ts`, the web smoke).
- [ ] The partner report, without addresses, is generated for an example campaign (BR-30; built in Sprint 08).
      **Waiting for Sprint 08:** L-24 is answered (4a: one text file per partner campaign, never an address; a partner
      who does not post keeps its campaign but loses the 72-hour highlight and is not invited again); Sprint 08 did not
      build the report. The events reader built for the leaderboard is what it would count from.
- [x] `scripts/team/resolution-post.ts` writes a resolution post from a template; a person posts it; no X API (BR-33).
      **Done** (`tests/ops/resolution-post.test.ts`).
- [x] The suggestions page is not built: BP v0.0.4 removed it (P1 §4.1, "quem tem uma ideia abre").
- [x] On phones, the mascot's bubble does not cut and the "How it works" steps open. **Done:** the bubble shifts back
      inside the screen (`app/lib/mascot/bubble.ts`); "How it works" opens from the top bar; both checked at 412 px in
      the web smoke.
- [ ] **A full devnet cycle through the site, with both services on:** a non-team wallet opens a paid campaign at
      `/abrir` (19), two wallets join it through the site, the keeper resolves and pays, and the result shows in "my
      entries" and on the leaderboard. **Waiting:** `/abrir` is Sprint 19 and is not built; every devnet write is the
      founder's; on devnet the keeper only resolves and does not pay (the founder's answer); the leaderboard needs the
      read API redeployed. The same cycle runs end to end in the web smoke against the program in LiteSVM, opening by
      script.
- [ ] **X2 is met and recorded:** X2.1 (MWA chain equals `/api/v1/health.cluster`); X2.2 (the wallet in-app browser
      checklists pass in Phantom and Solflare on Android and iOS, opening a campaign included); X2.3 (no chat route,
      no `OPENROUTER_API_KEY`); X2.4 (the E2E smoke passes under Bun 1.4.2, or the site runs on Node 22 with the reason
      recorded); X2.5 (CSP and headers). **Met but X2.2:** X2.1, the test passes (`app/features/wallet/mwa-chain.test.ts`,
      "X2.1: the wallet's chain equals the API's cluster"); X2.3, no chat route and no `OPENROUTER` in `app/`; X2.4, the
      whole web smoke passes with the site built and served by Bun 1.4.2 on the development machine (28 passed, 16
      skipped by design, on the final code), not yet in staging, which stays with the deferred server work; X2.5, the headers and the CSP are checked on the built site in the web smoke.
      **X2.2 waits** for Phantom and Solflare on real Android and iOS devices, and for `/abrir` (Sprint 19); Sprint
      11's Phantom entry stays "reported, not verified".
- [x] The `privacy-audit` skill answers the nine questions for the leaderboard (wallet addresses ranked in public) and
      for the report channel, before closure (gate 5), with what Cloudflare logs about visitors read and recorded (TP
      §14.4 C13 [AC]). **Done:** TP §8.2 (both PASS with conditions before going public: the live `/privacy`
      corrected and linked, and who holds the X login; founder items 8 and 9, answered 8a and 9a: the X login is
      recorded, the corrected `/privacy` is still to be deployed) and
      `knowledge-base/tecnologia/cloudflare-logs-visitantes.md`; what the account's dashboard keeps is the founder's to
      read.
- [x] The `release-check` skill passes. **RELEASE_WITH_NOTES** (2026-10-10): tests pass but the 3 CPI-proxy tests that
      only CI can run; the site builds and the web smoke loads every route on the built site, under Node and Bun; the
      secret scan is clean; the privacy audit passes with conditions before the leaderboard is public; CHANGELOG, code
      map, sprint doc and session log are current; the OS self-test is coherent (its three standing warnings); the
      coordinator approved with caveats, applied. Notes: the conditions of TP §8.2 and founder items 3, 8 and 9 come
      before the API redeploy that makes the leaderboard public; 3 and 8 are answered and applied, and 9a's corrected
      `/privacy` is prepared and waits for the founder's deploy of the landing.
- [x] Common closure (`docs/SPRINTS.md`, section 4). **Done:** the standard checks (CI on PR #63), the secret scan,
      the code map, CHANGELOG and session log, the coordinator review and three adversarial-style reviews (copy, legal,
      adversarial), the record and retrospective below; merged on 2026-10-10 (PR #63) and tagged `sprint-13` on
      `2dc5cb1` once `main`'s CI passed.

## Deliverables

- The leaderboard, fee page and powers table features in `app/features/`.
- The report link (size S) and the manifest-only PWA (size S) (proposal §4.0).
- `scripts/team/resolution-post.ts` and its template.
- The reviewed `copy.ts` files.

## Out of scope

Terms of use, privacy policy and the country list (17). The Cloak page (15) and the SODAX page (17). Posting to X by
program: a person posts. Web Push, wallet alerts or any other notification (L-16; proposal §3.9).

## Founder decisions that block the sprint

Asked on 2026-10-10, at the start, in one list, each built as recommended and switchable in one place. **Answered the
same evening, after the merge: 1a to 12a, every one as recommended.** Only 3a changed code (a follow-up pull request,
from `main` at `sprint-13`); 8a added the 15 days to the leaderboard page.

1. **Where the leaderboard's data comes from: (a)**, a `/api/v1/leaderboard` route in the read API from the program's
   events, as built; not (b) the browser reading the chain, nor (c) waiting for Sprint 08. It goes live when the
   founder redeploys the read API.
2. **L-09, what the screen says points are worth after devnet: (a)**, "Points only count on devnet. They are not money,
   and nothing is promised for them after the test phase." (`POINTS_WORTH`, `app/features/leaderboard/copy.ts`), as
   built. Should points ever be worth something, the lawyer reads the wording first.
3. **What scores: (a), none of the three cases Q7 read literally scored.** No point for a wallet with entries on both
   sides of a campaign (0.01 SOL on both sides of every campaign topped the board); none in a pot refunded as
   one-sided, with one side empty or a losing side too small to pay the fees; none for the wallet that opened a burn,
   lock or stake campaign, whose result its creator can control. The creator's other wallets cannot be told apart
   on-chain and still score; the page says so. Applied before the API redeploy, so no published rank is rewritten
   (`packages/sdk/src/read/points.ts`, `services/api/src/leaderboard.ts`).
4. **L-24, the partner report: (a)**, one text file per partner campaign with its result, entries and distinct wallets
   per side, SOL per side and whether it ended one-sided, never an address; a partner who does not post keeps its
   campaign (it is on-chain) but loses the 72-hour highlight and is not invited again. **Waiting:** the report is
   Sprint 08's, not built.
5. **[Q] Where the report link leads: (a)**, the same X account as L-13, https://x.com/brotmarkets
   (`REPORT_CAMPAIGN.url`), as built; not an email address (there is none) nor a form on the site (personal data).
6. **BP-5 and BP-11 (P-9): (a)**, "No human picks the winner." (`PRINCIPLE`) and Baked in writing, with Cacetinho
   only spoken (`MASCOT_NAME`), both in `app/features/how/copy.ts`, as built.
7. **[Q] The thresholds of the three demand tests (P2 §2.5): (a)**, tests 1 and 2 keep v0.0.2's (fewer than 10% of
   wallets back within 30 days is a bad sign, 20% to 35% is reasonable; more than 40% of pots one-sided is a bad
   sign); test 3 is measured on devnet without a pass mark and gets its threshold before mainnet, since paying with
   test SOL proves nothing (P2 §2.5). Nothing in the code depends on it.
8. **From the privacy review (TP §8.2): (a)**, a request to leave the ranking is answered within 15 days (the legal
   review's proposal; the lawyer confirms the period before mainnet), and the page says so (`BOARD.leave`). The X
   account's login is held by the CTO, with an authenticator app as the second factor.
9. **The live legal pages: (a)**, take brot.markets' `/terms` down until Sprint 17, correct `/privacy` (keeping the
   waitlist's deletion form), and link it from the site's footer before the site is public. The text is prepared in
   the repository; deploying the landing is the founder's. **Prepared** (branch `fix/legal-pages-9a`, 2026-10-10):
   `/terms` is no longer built or linked, here or on docs.brot.markets, and answers 404; `/privacy` describes the
   campaign product (the leaderboard and how to leave it, what the new site keeps in the browser, the RPC service, X),
   with the waitlist's purpose sentence as consented; the new site's footer links it. **Merged** (PR #65). The founder's
   details the same evening went in a follow-up: the contact gm@brot.markets, Hostinger's 30-day backups, Cloudflare's
   7-day logs, 15 days for every request, the X conversation deleted after a request to leave the ranking, an "18 and
   over" line in the new site's footer, and docs.brot.markets offline (it also described the earlier product) until the
   docs are rewritten. **Waiting:** the founder's email routing for gm@brot.markets, the deploy of the landing, and the
   post on X the page promises when it changes, all before the read API's redeploy.
10. **The success-rate column** (the approved prototype had it): **(a)**, kept dropped, as a profile.
11. **"Your entry back plus your share of the rest, when the losing side can pay the fees"** (P1 §4.6's approved line,
    qualified by the viability rule): **(a)**, re-approved.
12. **Prize harvesting** (the adversarial review; one wallet entering both sides of a paid campaign nobody else joins
    takes its prize at no risk, TP §13): **(a)**, the rule is decided before mainnet, for example a prize that pays
    out only in proportion to the losing side; nothing changes on devnet. It is a program change, inside the audit
    scope (TP §14.2).

- **Answered earlier:** TP v0.0.1 Q7 (a: 1 point per campaign entered on the right side, for devnet); the payout wording on
  devnet (Sprint 12: "Waiting for payout", no time promised; the L-03 devnet wording; the "Result final" chip).

## Agents and skills

- **Agents:** `copywriter-agent`, `legal-compliance-agent` (the notices), `devils-advocate-agent` (the whole MVP),
  `dev-product-agent`, `coordinator-agent`.
- **Skills:** `privacy-audit`, `release-check`, `plain-portuguese-explainer`, `sprint-management`,
  `verify-build-works`, `codemap`, `secrets-scan`.

## Security gates

- **Personal data (gate 5):** the `privacy-audit` skill runs on the leaderboard and the report channel before closure.
- No X script or any other third-party script on any page (K-10).
- No promise of price, return or yield anywhere.
- `secrets-scan` at closure.

## Tests

```bash
export PATH="$HOME/.bun/bin:$PATH"
(cd app && bun run lint && bun run build)
bun test tests/ -t "copy uses the campaign vocabulary"       # from Sprint 11; Sprint 13 widened it
bun test app/features/wallet/mwa-chain.test.ts                # from Sprint 09 (X2.1; its name begins "X2.1")
bun test tests/ -t "fee page example matches sdk math"       # added
bun test tests/ -t "every mandatory notice is on its screen" # added
bun test tests/ -t "leaderboard points rule"                 # added: the SDK's rule
bun test tests/ -t "leaderboard from the program's events"   # added: the read API's route on whole cycles
bun test tests/ -t "powers table"                            # added
bun test tests/ -t "report this campaign"                    # added
bun test tests/ -t "pwa manifest only"                       # added
bun test tests/ -t "resolution post"                         # added
bun test services/api                                        # the read API, the leaderboard route included
bun run e2e                                                  # the full smoke, desktop and 412 px
E2E_RUNTIME=bun bun run e2e                                  # X2.4: the same smoke, the site built and served by Bun
test ! -e app/app/api/chat/route.ts                          # X2.3
```

The full devnet cycle through the site. The wallet in-app browser checklists, screen by screen, on Android and iOS.

## Risks

- Many wallets inflate the leaderboard (TP v0.0.1 Q7). The points are for devnet only.
- An open L-01 mixes two languages on the site.
- The full cycle depends on Sprint 19's creation box being done: if it slips, Sprint 13 cannot close (X2.2).

## Expected artifacts

`app/features/` (leaderboard, fee page, powers), `app/manifest.ts`, `content/powers.md`,
`scripts/team/resolution-post.ts`, the reviewed `copy.ts` files, `CODEMAP.md`.

## Changelog and session log

- **Changelog:** leaderboard; fee page; powers table; notices and copy; report link; PWA manifest; devnet MVP closed.
- **Session log:** the answers to L-09 and L-24; where the report link leads; the demand-test thresholds; the result of
  the privacy review; the X2 evidence.

## Record and retrospective

The record is at the top of this file (2026-10-10). Retrospective:

- **What worked:** the pure pieces first (the points rule, the fee example through the SDK's finalize math, the notices
  list), each with its test before any page; the three reviews in parallel, then the coordinator. The reviews paid for
  themselves: the viability rule was missing from the copy and from the estimate (a screen showing about 5 per 1 where
  the program would refund 0.99), the leaderboard carried a profile, and the points had three correctness holes (late
  joins before the tally, a reused campaign id, events reordered within a slot) that the unit tests could not see
  because their fixtures were too tidy; the whole-cycle test on LiteSVM caught the last one.
- **What did not:** the leaderboard's data source has no indexer behind it, so the API reads the program's history
  itself, in memory, and the page goes live only with a server step that is the founder's; the full devnet cycle
  through the site waits for `/abrir` (Sprint 19), and X2.2 for real phones. An early edit of the post script did not
  apply (the formatter had reflowed the line) and went unnoticed until two reviewers found it: re-read after a scripted
  edit.
- **Carried:** TP §7.4's deferrals (the web smoke in CI, the indexer for the history, a tombstone for closed campaigns
  and the program's floor in a lopsided pot for the audit scope); the partner report (L-24 answered, Sprint 08); the
  live `/terms` and `/privacy` (answer 9a, the founder deploys); prize harvesting's rule before mainnet (answer 12a, TP
  §13). The twelve founder items are answered.
