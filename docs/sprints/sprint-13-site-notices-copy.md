# Sprint 13 — Site: ranking, notices and copy (closes the devnet MVP)

**Status:** built, PR open; the items that need the founder or a real device are marked waiting below · **Branch:**
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
  request carries no wallet, so no request ties a wallet to an IP address. **It goes live on devnet when the founder
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
  screen; `tests/site/notices.test.ts` renders the screens. P1 §4.6's "Pago sozinho, ao fim da janela de 6 horas" is
  replaced on devnet by the founder's wording (the review rule and "Waiting for payout", no time promised). The copy
  test now forbids P1 §4.6's "Em vez de" phrases and the promises (a return, a yield, a profit, an automatic payout)
  in every source file of the site, and holds BP-5's line in one copy entry. The card's creator notice used other words
  than the page's; it uses the page's now. "No oracle. Just me, reading." was not in the site; the test keeps it out.
- **"How it works"** (`/how-it-works`), linked from the top bar, so its six steps open on a phone; BP-5's line ("No human
  picks the winner.") and BP-11's written name ("Baked") are built as recommended, one string each.
- **"Report this campaign"** on every campaign page, in every state: a plain link to the same X account as L-13 (the
  founder's [Q], built as recommended, one constant). The remedy is real: `content/unlisted.json`, changed by a commit
  with two people's review, hides a campaign from the home page; its page says so, and it stays on-chain, resolves and
  pays. A malformed entry, or a reason that names a person, fails the build.
- **The PWA, manifest only:** `app/app/manifest.ts` (Next's convention for `app/manifest.ts`), icons drawn by
  `scripts/pwa-icons.ts` from the mascot on the dark theme's colour, an apple-icon; no service worker.
- **`scripts/team/resolution-post.ts`** writes the post from `scripts/team/resolution-post.template.txt`, read-only:
  the result, the value read and the target, the review's end or the void's reason, the account to re-check. It refuses
  a campaign with no result, uses no X API, and prints the length as X counts it; a person posts it.
- **Two Sprint 12 findings deferred here are fixed** (TP §7.3): `personalDataIn` refuses a bare domain and the "@x" and
  "[@x]" forms; the site finds `content/` or fails the build.
- **The web smoke** gained "site pages and notices" (`tests/e2e/site-pages.e2e.ts`, desktop and 412 px). The whole
  smoke passed under Node (26 passed, 14 skipped by design) and again with the site built and served by Bun 1.4.2
  (`E2E_RUNTIME=bun`, `bun --bun next`): the X2.4 evidence on this machine. The server's own staging test (Sprint 09)
  stays deferred with the server work.
- **The reviews (2026-10-10)**, saved in the session's scratchpad and summarised in the session log: copy (4 must, 15
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
      TP §8.2. Open: which edge cases score (founder question 3).
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
      the winner." in `app/features/how/copy.ts` (`PRINCIPLE`); the founder's answer is question 6.
- [x] The mascot's quips are reviewed; "No oracle. Just me, reading." is gone (design direction, conflict 7). **Done:**
      the site never carried that line; the five quips of `app/lib/brand.ts` are under the copy test now.
- [x] **The report link (C-10):** every campaign page has a "report this campaign" link. The remedy is unlisting
      (proposal §2.7); the campaign stays on-chain, resolves and pays. **Done** (`app/features/report/`,
      `content/unlisted.json`); where it leads is the founder's [Q], built as recommended (question 5).
- [x] **The PWA, manifest only (S2):** `app/manifest.ts` and its icons. No service worker (proposal §3.3). **Done** as
      `app/app/manifest.ts` (`tests/site/manifest.test.ts`, the web smoke).
- [ ] The partner report, without addresses, is generated for an example campaign (BR-30; built in Sprint 08).
      **Waiting for the founder:** its format and what happens to a partner who does not post are L-24 (question 4);
      Sprint 08 did not build it. The events reader built for the leaderboard is what it would count from.
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
      whole web smoke passes with the site built and served by Bun 1.4.2 on this machine (the server's staging stays
      with the deferred server work); X2.5, the headers and the CSP are checked on the built site in the web smoke.
      **X2.2 waits** for Phantom and Solflare on real Android and iOS devices, and for `/abrir` (Sprint 19); Sprint
      11's Phantom entry stays "reported, not verified".
- [x] The `privacy-audit` skill answers the nine questions for the leaderboard (wallet addresses ranked in public) and
      for the report channel, before closure (gate 5), with what Cloudflare logs about visitors read and recorded (TP
      §14.4 C13 [AC]). **Done:** TP §8.2 (two verdicts PASS_WITH_NOTES, with founder items) and
      `knowledge-base/tecnologia/cloudflare-logs-visitantes.md`; what the account's dashboard keeps is the founder's to
      read.
- [ ] The `release-check` skill passes.
- [ ] Common closure (`docs/SPRINTS.md`, section 4).

## Deliverables

- The leaderboard, fee page and powers table features in `app/features/`.
- The report link (size S) and the manifest-only PWA (size S) (proposal §4.0).
- `scripts/team/resolution-post.ts` and its template.
- The reviewed `copy.ts` files.

## Out of scope

Terms of use, privacy policy and the country list (17). The Cloak page (15) and the SODAX page (17). Posting to X by
program: a person posts. Web Push, wallet alerts or any other notification (L-16; proposal §3.9).

## Founder decisions that block the sprint

Asked on 2026-10-10, at the start, in one list. Each is built as recommended and switchable in one place, so an answer
changes one string or one constant.

1. **Where the leaderboard's data comes from** (the sprint's choice, recommended to the founder): (a) a
   `/api/v1/leaderboard` route in the read API from the program's events, **built**; (b) the browser reading the chain;
   (c) wait for Sprint 08. It goes live when the founder redeploys the read API.
2. **L-09** (Product Brief v0.0.1 gap): what the screen says points are worth after devnet. Recommended and built:
   "Points only count on devnet. They are not money, and nothing is promised for them after the test phase."
   (`POINTS_WORTH`, `app/features/leaderboard/copy.ts`; "game" dropped after the legal review). If the answer is
   "never", say so plainly; if points may ever be worth something, the lawyer reads it first.
3. **What scores** (found while building; the adversarial review ranks it high): Q7 read literally scores a wallet with
   entries on both sides, so 0.01 SOL on both sides of every campaign tops the board; one-sided pots and pots too small
   to split score too; and a creator's other wallets can score on a burn it forces. Recommended: no point for a wallet
   on both sides, and none in a pot that is refunded. Built as Q7 says; `BOTH_SIDES_SCORE` in
   `packages/sdk/src/read/points.ts` switches the first; answer before the API redeploy, since a later change rewrites
   every rank.
4. **L-24** (Product Brief v0.0.1 gap): the partner report's format, and what happens to a partner who does not post.
   Recommended: one text file per partner campaign with its result, entries and distinct wallets per side, SOL per
   side and whether it ended one-sided, never an address; a partner who does not post keeps its campaign (it is
   on-chain) but loses the 72-hour highlight and is not invited again. **Waiting:** the report is not built.
5. **[Q] Where the report link leads:** the same public channel as L-13, or another. Recommended and built: the same X
   account, https://x.com/brotmarkets (`REPORT_CAMPAIGN.url`).
6. **BP-5 and BP-11** (P-9, open): "No human picks the winner." (`PRINCIPLE`) and Baked in writing with Cacetinho as
   the spoken name (`MASCOT_NAME`), both in `app/features/how/copy.ts`. Built as recommended.
7. **[Q] The thresholds of the three demand tests** (P2 §2.5), written before the devnet beta. Recommended: tests 1 and
   2 keep v0.0.2's (fewer than 10% of wallets back within 30 days is a bad sign, 20% to 35% is reasonable; more than
   40% of pots one-sided is a bad sign); test 3 is measured on devnet without a pass mark, and gets its threshold
   before mainnet, since paying with test SOL proves nothing (P2 §2.5). Nothing in the code depends on it.
8. **From the privacy review** (TP §8.2): who holds the X account's login and with which second factor. The way to
   leave the ranking is built (a signed request and a hide list on the server).
9. **The live legal pages** (found by the legal review): brot.markets' `/terms` and `/privacy`, approved 2026-10-08,
   still describe USDC, automatic payouts with a 55-hour worst case, team powers that differ from `/record`, "No
   profiles" and the deletion of Brot's copy of a wallet's activity; the new site's footer links no privacy page.
   Recommended: take `/terms` down until Sprint 17, correct `/privacy` (keeping the waitlist's deletion form), and link
   it from the site's footer before the site is public. Deploying the landing is the founder's.
10. **The success-rate column** (the approved prototype had it): dropped as a profile, after the legal review.
    Recommended: keep it dropped.
11. **"Your entry back plus your share of the rest"** (P1 §4.6's approved line) now says "when the losing side can pay
    the fees": re-approve the qualified wording.
12. **Prize harvesting** (found by the adversarial review, outside this sprint's code): one wallet entering both sides
    of a paid campaign nobody else joins takes its prize at no risk (TP §13). Recommended: decide the rule before
    mainnet (for example, a prize that pays out only in proportion to the losing side); nothing changes on devnet.

- **Answered:** TP v0.0.1 Q7 (a: 1 point per campaign entered on the right side, for devnet); the payout wording on
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

Filled in during the sprint and at closure.
