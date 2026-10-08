# Sprint 13 — Site: ranking, notices and copy (closes the devnet MVP)

**Status:** planned · **Branch:** `sprint-13-site-notices-copy` · **Dates:** none, by the founder's decision

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

- [ ] The leaderboard shows the points of `/api/v1/leaderboard`: 1 point per campaign entered on the right side (TP
      v0.0.1 Q7, answered a). It has no volume or profit column.
- [ ] **The fee page (BR-32):** a worked example net of the fee and the creator share, using P1 §1.2's case (600 on
      YES, 400 on NO: fee 40, creator 10, winners 950, 1.583 per 1; with the 450 prize, 1,400 and 2.333 per 1); the
      one-sided 1%; the opening's 90/10; the refund policy.
- [ ] **The powers table (BR-41):** `content/powers.md` is published on the public record route: who holds each key
      and the limit of each power (P4 §4.2). Sprint 16 updates it with the multisig.
- [ ] Each mandatory notice that holds on devnet is on its screen (BR-47; P1 §4.6): the devnet notice and "Programa
      ainda sem auditoria" on every screen; the lock notice, the estimate notice and the fee before signing; the
      creator notice on burn, lock and stake campaigns; "Pago sozinho, ao fim da janela de 6 horas" while in review.
      A test lists each notice and the screen that must show it.
- [ ] No word of P1 §4.6's "Em vez de" column or of the D6 table's copy row appears on the site; the copy test of
      Sprint 11 covers every `copy.ts`.
- [ ] "Nenhuma pessoa escolhe o vencedor" replaces the "no human in the loop" line, as BP-5's recommendation (P-9,
      open); the line lives in one `copy.ts` entry, so the founder's answer changes one string.
- [ ] The mascot's quips are reviewed; "No oracle. Just me, reading." is gone (design direction, conflict 7).
- [ ] **The report link (C-10):** every campaign page has a "report this campaign" link. The remedy is unlisting
      (proposal §2.7); the campaign stays on-chain, resolves and pays.
- [ ] **The PWA, manifest only (S2):** `app/manifest.ts` and its icons. No service worker (proposal §3.3).
- [ ] The partner report, without addresses, is generated for an example campaign (BR-30; built in Sprint 08).
- [ ] `scripts/team/resolution-post.ts` writes a resolution post from a template; a person posts it; no X API (BR-33).
- [ ] The suggestions page is not built: BP v0.0.4 removed it (P1 §4.1, "quem tem uma ideia abre").
- [ ] On phones, the mascot's bubble does not cut and the "How it works" steps open.
- [ ] **A full devnet cycle through the site, with both services on:** a non-team wallet opens a paid campaign at
      `/abrir` (19), two wallets join it through the site, the keeper resolves and pays, and the result shows in "my
      entries" and on the leaderboard.
- [ ] **X2 is met and recorded:** X2.1 (MWA chain equals `/api/v1/health.cluster`); X2.2 (the wallet in-app browser
      checklists pass in Phantom and Solflare on Android and iOS, opening a campaign included); X2.3 (no chat route,
      no `OPENROUTER_API_KEY`); X2.4 (the E2E smoke passes under Bun 1.4.2, or the site runs on Node 22 with the reason
      recorded); X2.5 (CSP and headers).
- [ ] The `privacy-audit` skill answers the nine questions for the leaderboard (wallet addresses ranked in public) and
      for the report channel, before closure (gate 5), with what Cloudflare logs about visitors read and recorded (TP
      §14.4 C13 [AC]).
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

- L-09 (Product Brief v0.0.1 gap): what the screen says points are worth after devnet.
- L-24 (Product Brief v0.0.1 gap): the format of the partner report, and what happens to a partner who does not post.
- **[Q]** Where the report link leads: the same public channel as L-13, or another. The store requires the flag for
  the app (C-10); the site has it first.
- BP-5 and BP-11 (P-9, open): "no human picks the winner", and Baked in writing with Cacetinho as the spoken name.
  Both are built as recommended and switchable.
- **[Q]** The thresholds of the three demand tests (P2 §2.5), written before the devnet beta: tests 1 and 2 have
  v0.0.2's, test 3 has none (TP §14.2).
- **Answered:** TP v0.0.1 Q7 (a: 1 point per campaign entered on the right side, for devnet).

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
bun test tests/ -t "copy uses the campaign vocabulary"     # from Sprint 11, over every copy.ts
bun test tests/ -t "mwa chain equals the api cluster"      # from Sprint 09 (X2.1)
bun test tests/ -t "fee page example matches sdk math"     # to add
bun test tests/ -t "every mandatory notice is on its screen" # to add
bun run e2e                                                # the full smoke, desktop and 412 px
test ! -e app/app/api/chat/route.ts                        # X2.3
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
