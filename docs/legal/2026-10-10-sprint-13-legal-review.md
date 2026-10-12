# Sprint 13 — legal and compliance review of what the site says and collects

**Version:** 0.0.1 · **Date:** 2026-10-10 · **Status:** draft for the team lawyer (L0) to read. Not a legal opinion.

> **What happened next (added when the sprint applied it, 2026-10-10).** This review read the branch before its fixes.
> M1, M2 and M4 were applied; M3's leave path was built (a signed request and a hide list on the server), and its
> response period went to the founder; M5 and M6 went to the founder (`docs/sprints/sprint-13-site-notices-copy.md`,
> "Founder decisions that block the sprint", items 2, 8 and 9); B4's display half was applied (`shownReturnBps`), its
> program half is deferred (TP §7.4). The B-items and the questions for the lawyer below stand.
>
> **The founder's answers (2026-10-10, after the merge).** M3: a request to leave the ranking is answered within 15
> days, the period this review proposed, for the lawyer to confirm; the page says so. M4: the success rate stays
> dropped. M5: `/terms` comes down until Sprint 17, and `/privacy` is corrected and linked from the site's footer
> before the site is public (not done yet; the founder deploys the landing). M6: L-09 is answered with the line as
> built. N10: a wallet with entries on both sides no longer scores, nor does a refunded pot or the creator's own wallet
> on a burn, lock or stake campaign. The X account's login is held by the CTO, with an authenticator app as the second
> factor.

> **Disclaimer.** I am not a lawyer. This is a safe first draft built from public standards and the project's own
> documents. Before real money, sensitive data or critical jurisdictions (health, fintech, minors), a lawyer must review
> it. That costs less than a lawsuit.
> (Original: "Eu não sou advogado. O material gerado aqui é um rascunho seguro de partida baseado em padrões públicos.
> Antes de lançar com pagamentos reais, dados sensíveis ou em jurisdições críticas (saúde, fintech, menores), peça pra
> um advogado revisar. O custo é menor que um processo.")

## Scope and method

- Branch `sprint-13-site-notices-copy`, `git diff sprint-12..HEAD` (10 commits, 80 files), plus the uncommitted
  leaderboard edits in the working tree at review time (`youBeyond`; no legal effect).
- Read: every Sprint 13 `copy*.ts`, the notices registry and its two tests, `content/powers.md`, `content/unlisted.json`,
  the resolution-post template and script, the leaderboard API (`services/api/src/{history,leaderboard,routes,main}.ts`),
  TP §8, §8.1, §8.2, §3.4.16, §3.4.18, §14.2, the C-items, BP v0.0.4 P1 §1.2, §3.2–§3.5, §4.6,
  `knowledge-base/tecnologia/cloudflare-logs-visitantes.md`, `knowledge-base/market/regulacao.md`, `docs/legal/*`, the
  program's `math/snapshot.rs`, the SDK's `math/payout.ts` and `math/snapshot.ts`.
- Fetched `https://brot.markets/terms` and `https://brot.markets/privacy` on 2026-10-10 (HTTP 200) to confirm what is
  live. No test was run. No statute was read for this review: legal references below are from general knowledge or
  from the project's research note, and each uncertain one says "to confirm with the lawyer". Nothing in the repository
  was edited.

## Verdict

The sprint's design choices are privacy-conscious and the devnet framing is solid: the devnet and "not audited"
notices are in the root layout, so they are on every screen (unit test plus web smoke on 8 routes, desktop and 412 px);
no copy file promises a price, yield, profit, automatic payout or time; the leaderboard API never receives a wallet;
the report link is a plain link with no third-party script.

Six things should not ship as they are. Two are wrong statements on Sprint 13 pages (the refund and split rules omit
the Economic Viability Rule and the late-entry refund; the leaderboard says "Nothing about you is stored"). Three
come from a fact the brief did not have: **a Terms of Service and a Privacy Policy are live at brot.markets since
2026-10-08** (founder-approved, never reviewed by a lawyer, per `docs/legal/NOTAS-DA-REVISAO.md`). They describe the
USDC product, promise automatic payouts within 55 hours, and promise "No profiles" and deletion of Brot's copy of a
wallet's activity, all of which the Sprint 13 site contradicts. The sixth is the open L-09 answer on points.

Merging the code is fine. Putting the new site or the leaderboard in front of the public should wait for M1 to M6.

## MUST (before this sprint closes; M3 to M5 at the latest before the site or the leaderboard is public)

### M1. The refund and split rules on /fees, How it works and the pre-signing notice omit two refund cases and state a guarantee the program does not keep

- **Text.**
  - `app/features/fees/copy.ts`, `FEES.lead`: "The side that was right splits the rest, prize included: if you were
    right, you get your entry back plus your share of the rest."
  - `FEES.creator[1]`: "From Brot's fee instead, only for the part the losing side cannot cover: the winners never get
    back less than they put in."
  - `FEES.refunds[1]`: "One side only: every entry back, the first wallet's in full and the others less 1%."
  - `FEES.refunds[3]`: "No early exit and no other refunds."
  - `app/features/entry/copy.ts`, `NOTICES.oneSided` (shown before signing): "If only one side has entries when they
    close, every entry is refunded: the first wallet in full, the others less 1%."
  - `app/features/how/copy.ts`, step "Paid" and "One side only": same omission.
- **Facts.** The Economic Viability Rule (decision of 2026-10-09; `programs/brot-markets/src/math/snapshot.rs`,
  `split_is_viable`) splits a pot only when the losing side is larger than Brot's fee plus the creator's 1% of all
  entries. Otherwise the pot is refunded as one-sided: every entry but the first wallet's loses 1%, **the side that
  was right included**, and the prize goes back to the opener. Consequences:
  1. In a lopsided pot the right side gets back 0.99 per 1. "Never get back less than they put in" and "your entry
     back plus your share" are false there.
  2. The branch `FEES.creator[1]` describes cannot run: a split now requires P − fee > C, so `from_fee` is always 0.
     TP §3.4.16's D-g text and its worked example B (V 600 / P 1, now one-sided) are superseded by §3.4.18. The fee
     page copied the older rule.
  3. An entry that lands at or after a YES proof's `publish_time` is refunded whole (TP §3.4.16, Sprint 04). So "no
     other refunds" is false.
  4. Worked case on devnet today (a paid campaign with its 4.5 SOL prize). The pot holds 0.99 SOL on YES and the
     0.01 SOL minimum on NO, and a baker adds 0.01 SOL on YES. The panel's estimate (`checkJoin` →
     `estimateReturnBps`, which by its own comment ignores the viability rule) shows about **5.5 per 1**. If YES
     wins, finalize refunds **0.99 per 1**. This happens whenever a paid pot's losing side is under about 1.12% of the
     winning side.
  5. The after-the-fact screen already says it (`STATES.oneSided`: "...or the losing side was too small to cover the
     fees"). The before-signing notice and the fee page do not.
- **Concern.** The fee page and the entry notices are BR-32 and BR-10's disclosures. A disclosure that is wrong in a
  reachable case, and an absolute "never" on unaudited code, is the classic misleading-by-omission pattern. Today it
  is test SOL. At mainnet it is a consumer claim.
- **Basis.** CDC (Lei 8.078/1990) art. 6 III and art. 31 (correct, clear and precise information about the service
  and its price), art. 30 (precise information binds the supplier), art. 37 §1 and §3 (misleading, including by
  omission of essential data). It also breaks the sprint's own gate "no promise of return anywhere". Applicability of
  the CDC to these pots is part of L0.
- **Change (copy only).**
  - `NOTICES.oneSided`: "If only one side has entries when they close, or the losing side is too small to pay the
    fees, every entry is refunded: the first wallet in full, the others less 1%."
  - `FEES.lead`: "...When the losing side is large enough to pay those fees, the side that was right splits the
    rest, prize included. Otherwise every entry is refunded (One side only, below)."
  - Delete `FEES.creator[1]`, or replace it with: "If the losing side is too small to pay Brot's fee and the
    creator's 1%, the pot is not split: it is refunded like a one-sided pot, and the creator gets nothing."
  - `FEES.refunds[1]`: "One side only, or a losing side too small to pay the fees: every entry back, the first
    wallet's in full and the others less 1%, whichever side was right."
  - Add to `FEES.refunds`: "An entry that lands at or after the moment a YES is proven comes back whole."
  - `FEES.refunds[3]`: "No early exit, and no refunds other than these."
  - How it works: mirror the same two cases.
  - P1 §4.6's approved line ("Quem acerta recebe o seu de volta e mais a parte dele no resto") predates the rule.
    Ask the founder to re-approve the qualified wording.
  - The estimate itself is B4.
- **Severity.** MUST.

### M2. The leaderboard's privacy line is inaccurate

- **Text.** `app/features/leaderboard/copy.ts`, `BOARD.public`: "Wallet addresses and entries are public on Solana
  already; this page only counts them. Nothing about you is stored to make it."
- **Facts.**
  - The read API keeps every `EntryAdded` event in memory, with the baker's wallet and amount
    (`services/api/src/history.ts`). For a baker, the main audience of the page, that is data about them, held to
    make this page.
  - Cloudflare logs each visitor's IP address and requested URL as Brot's processor ([CF-PP] in the knowledge note).
  - The browser sends the connected wallet together with the IP address to the RPC
    (`app/lib/config.ts`: `api.devnet.solana.com` by default; `use-sol-balance.ts` calls `getBalance`).
  - TP §8.2's question 9 relies on this line.
- **Basis.** LGPD (Lei 13.709/2018) art. 5 X ("tratamento" includes storage), art. 6 VI (transparency), art. 9.
  GDPR art. 12–14 if it applies (see question 3).
- **Change.** "Wallet addresses and their entries are public on Solana. This ranking is computed from them on Brot's
  server, held in memory and never written to disk. The page does not send your wallet to Brot: it finds your line in
  your browser." Add a link to the privacy page (M5) for Cloudflare and the RPC.
- **Severity.** MUST.

### M3. No way to leave the ranking, while the live Privacy Policy promises deletion; and the pre-entry notice is silent on the ranking

- **Text.**
  - TP §8.2, question 8: "has no switch today [Q]: a hide list ... for the privacy policy of Sprint 17".
  - Live `brot.markets/privacy` (`docs/legal/PRIVACY-POLICY.md:96`): "Delete our copy of your market activity: ask us,
    and we'll remove it from our database."
  - `app/features/entry/copy.ts`, `SHEET.public`: "Entries are public and permanent: anyone can see this wallet's
    entries on-chain."
- **Concern.**
  - The ranking rebuilds from the chain on every restart, so the published promise cannot be kept for it without a
    hide list.
  - Under the GDPR, an objection to processing based on legitimate interests, profiling included, must be honoured
    unless compelling grounds override (art. 21(1)), and erasure follows (art. 17(1)(c)). A devnet points table has
    no such grounds.
  - Under the LGPD the objection right is narrower (art. 18 §2: on non-compliance), but blocking or elimination of
    excessive data (art. 18 IV) and the necessity and transparency principles apply. Brot has also promised it
    publicly.
  - The chain cannot be erased; the ranking is Brot's own view and can.
  - The only privacy notice before an entry does not mention that a scoring wallet is ranked in public, and no test
    renders it (`grep` finds no test for `SHEET.public`).
- **Basis.** GDPR art. 17(1)(c), 21(1). LGPD art. 6 III and VI, art. 10 §1–§2, art. 18 IV and §2. Whether the GDPR
  applies (art. 3(2)): to confirm with the lawyer.
- **Change.**
  1. A hide list applied **in the API**, not only in the page, kept on the server and not in the public site or
     content. A public list of the wallets that asked to hide would itself be a disclosure.
  2. Verify each request with a message signed by the wallet, so no one can hide a rival.
  3. One line on `/leaderboard`: who runs it ("the Brot Markets team") and how to be left out (the X channel today),
     with a period the team can keep. 15 days is the project's own baseline.
  4. `SHEET.public`: add "...and a wallet that scores appears on the public devnet leaderboard". Add it to the
     notices render test.
- **Severity.** MUST (before the leaderboard is public).

### M4. The "Hit rate" column is a performance profile, against the live "No profiles"

- **Text.** `BOARD.columns.hitRate` "Hit rate" (`app/features/leaderboard/leaderboard.tsx`, `Row`).
  Live `brot.markets/privacy` §4: "No profiles."
- **Concern.**
  - A per-wallet success rate evaluates "performance" and "behaviour". That is profiling in the GDPR's sense, and
    behavioural-profile data under the LGPD once the person is identifiable.
  - It is not needed for BR-29: the points already rank.
  - With `BOTH_SIDES_SCORE = true` (`packages/sdk/src/read/points.ts`), a wallet that enters 0.01 SOL on both sides
    shows 100%. The figure is also misleading as a skill measure.
  - "Hit rate" is tipster vocabulary (N2).
  - The column is in the approved prototype (`prototype-lab/campaigns/js/screens/ranking.js`), so removing it is the
    founder's call.
- **Basis.** GDPR art. 4(4), 21(1). LGPD art. 6 III (necessity), art. 12 §2, art. 20 (review of profile decisions:
  whether it reaches a public ranking is to confirm with the lawyer).
- **Change.** Drop the column (recommended), keeping Points and Entered. Or keep it, and change the privacy page and
  TP §8.2 to declare the profile, its legal basis and the objection route (M3).
- **Severity.** MUST (resolve before the leaderboard is public).

### M5. The live Terms and Privacy Policy at brot.markets contradict the new site, and the new site links no privacy page

- **Facts.** Fetched 2026-10-10; the source is `docs/legal/TERMS-OF-SERVICE.md` and `PRIVACY-POLICY.md`, generated
  into `services/landing/public/`. `/terms` says:
  - "You put USDC on a side" (:12), against the SOL product.
  - "Payouts are automatic, after the review window" (:77) and "Worst case, payouts go out 55 hours after the result"
    (:61–62). The site promises neither on devnet (L-03's wording).
  - "A market is annulled ... when the review finds the reading was wrong" (:64–65), and "three team members decide
    by majority" (:61). /record says a team key "never [voids] a YES or a NO" and "Open a contest: Nobody yet".
  - "Change the program: Two team members on devnet" (:112). /record says one co-founder's key, "at any time and with
    no waiting period".
  - "real money comes only after an audit, a 2-of-3 founders' wallet and a cap" (:124). D-h removed the cap.
  - "The odds are an estimate" (:51) and "market" throughout (D-m).
  - "You accept these terms when you connect a wallet or sign a transaction through brot.markets" (:22): they would
    govern the new site the day it takes the domain.

  `/privacy` says:
  - "No profiles" (M4).
  - "Delete our copy ... we'll remove it" (M3).
  - "Your browser remembers one thing on its own: ... theme" (:61). The new site also keeps the wallet name (adapter),
    saved campaigns, the entry retry guard and rent records in localStorage, and a pause counter in sessionStorage.

  The new footer (`app/app/layout.tsx:64–74`) links no privacy or terms page. When `brot-web` replaces the landing,
  `/privacy` and its waitlist deletion form disappear unless ported (TP §8.1, open [Q]).
- **Concern.** Two published texts disagree about payouts, timing, team powers and the currency. A user quotes the
  more generous one. A privacy notice that is wrong on profiles, deletion and storage undermines transparency. A
  deletion path that existing waitlist consent relies on would vanish.
- **Basis.** CDC art. 30 and art. 47 (ambiguity read in the consumer's favour). LGPD art. 6 VI, art. 9, art. 18 VI
  (elimination for consent-based data: the waitlist). The project's D-m and "no time promised" rules. This agent's
  baseline: the privacy link is in the footer of every page.
- **Change (not a Sprint 17 draft).** Before the new site is reachable at brot.markets or any public URL:
  - (a) Every page's footer links a privacy page.
  - (b) That page is today's `/privacy` corrected for the three facts above, keeping the waitlist deletion form.
    Leave the waitlist's purpose sentence as people consented to it: changing it is a consent change (TP §8.1).
  - (c) `/terms` is either taken down until Sprint 17, and with it the "you accept by connecting" sentence, or
    corrected for the listed contradictions. It is never ported as is.
  - Taking `/terms` down now costs little and removes a live promise of automatic payouts.
- **Severity.** MUST.

### M6. L-09 (what points are worth) needs the founder's answer before the line ships

- **Text.** `app/features/leaderboard/copy.ts`, `POINTS_WORTH`: "Points are a devnet game. They are not money, and
  nothing is promised for them after the beta."
- **Reading.**
  - As written, with no prize and nothing of value paid to take part (test SOL is free), there is no lottery,
    sweepstakes or prize-promotion exposure today.
  - The exposure starts only if points are later turned into anything. Possible frames, all to confirm with the
    lawyer:
    - a prize promotion by contest, Lei 5.768/1971 (prior authorisation);
    - a token distribution;
    - promotion of the service, if L0 classes campaigns as betting (see B1).
  - "Nothing is promised ... after the beta" honestly promises nothing, but "after the beta" visibly leaves a door
    open, in a culture where points are read as a future airdrop.
  - "Game" becomes "jogo" in Portuguese, the word of Decreto-Lei 3.688/1941 art. 50.
- **Change.**
  - The founder records L-09; the sprint DoD already lists it as blocking.
  - If the answer is "never": "Points are a score for the devnet beta only. They are not money and will not be
    exchanged for money, tokens or prizes."
  - If it is "maybe": no hint anywhere (site, X, chats), and L0 before any reward is mentioned.
- **Severity.** MUST (the answer). The wording change is part of N2.

## BEFORE-MAINNET (Sprint 17 with L0)

- **B1. Classification before any real-money copy.** The pages describe mainnet economics: US$500 opening, 90% "prize",
  10% and 1% fees, "est. X per 1", "chance".
  - Per the project's research note (`knowledge-base/market/regulacao.md`; secondary sources except MP 1.394, which
    the note says was read on the Planalto site; **not verified by me**):
    - MP 1.394/2026 art. 3 I defines fixed-odds betting as putting a value at risk expecting a "prêmio" whose amount
      is set by a "fator de multiplicação". Its art. 16 bars "todo conteúdo que oferte, promova, divulgue ou facilite
      o acesso" aimed at the Brazilian public.
    - CMN Res. 5.298/2026 bars event derivatives on non-economic references.
    - The SPA's Nota Técnica 2958/2026 treats prediction platforms as fixed-odds betting.
  - Devnet entries put no value at risk. Mainnet copy (the per-1 multiplier, "prize", the fee page as a price list,
    powers.md's "On mainnet, later") waits for L0.
  - Also for L0: Decreto-Lei 3.688/1941 art. 50.
- **B2. Supplier identity and language.**
  - "Brot keeps" names a brand, not an entity. The live pages name three natural persons and "a company being set up".
  - Before charging US$500: the e-commerce identification (Decreto 7.962/2013 art. 2: name, CNPJ, address, contact).
  - CDC art. 31 requires information "em língua portuguesa" for Brazilian consumers, which gives L-01 a legal side.
    How far both reach an English site in SOL is to confirm with the lawyer.
- **B3. The refund policy against withdrawal and abusive-clause rules.**
  - "No early exit ... no refunds other than these" against CDC art. 49 (7-day withdrawal for distance contracts)
    and Decreto 7.962/2013 art. 5, at least for the paid opening.
  - Unlisting a paid campaign after payment against CDC art. 51.
  - Both to confirm with the lawyer.
- **B4. The estimate and the program's `min_return_bps` check ignore the viability rule** (M1, fact 4). With a US$450
  prize, a dust entry on the other side makes the panel show a large multiple while finalize refunds 0.99.
  - Fix in the SDK and app: when `splitIsViable` fails for the totals plus this entry, show the refund rather than
    the split.
  - Decide whether the program's check should follow; that is audit scope.
  - Recommended for the devnet beta too: it distorts the demand test and invites complaints.
  - Basis: CDC art. 37 §3.
- **B5. What the privacy policy must cover for Sprint 13's features** (topics, not a draft):
  - the controller (the company once it exists);
  - the encarregado, or the small-agent channel under Res. CD/ANPD 2/2022, and whether its "high risk" exclusion
    (innovative technology plus profiling) applies — to confirm;
  - the legal basis per purpose, with a written legitimate-interest assessment for the ranking (LGPD art. 7 IX,
    art. 10 §2–§3);
  - named recipients:
    - Cloudflare, as processor: Brot as controller owns the retention answer, so read the dashboard (C13 [AC]);
    - the RPC provider, which sees wallet plus IP;
    - X;
    - the US host;
  - international transfer (LGPD art. 33; ANPD Res. 19/2024 — to confirm);
  - retention, including C-14: Marco Civil art. 15 requires six months of access logs from a legal-entity application
    provider, against "never the IP";
  - the browser storage list;
  - the on-chain permanence;
  - the profile decision (M4);
  - age (C-07, ECA Digital);
  - incident notice (LGPD art. 48; ANPD Res. 15/2024 deadline — to confirm).
- **B6. A mainnet ranking would be a public list of people taking part in what L0 may class as betting.**
  Make it opt-in or drop it on mainnet, and exclude or label team wallets.
- **B7. The report and rights channel.**
  - Add an email (non-public) channel; X-only is §8.1's accepted risk.
  - Write the unlisting criteria and a response time as a notice-and-action procedure.
  - Ask whether the STF's 2025 judgment on Marco Civil art. 19 creates duties after notice (to confirm).
  - Record who holds the X login and with which second factor (§8.2 [AC]).
- **B8. Prominence.** The banner (`site-notice.tsx`) and the card's creator notice render as 12 px dim text. That is
  fine for devnet. For mainnet, risk information must be "ostensiva" (CDC art. 31).

## NOTE

- **N1. Devnet framing of the price.** `FEES.opening` ("A wallet opens a campaign for US$500, paid in SOL...") and How
  it works step "Open" read most like an offer. The banner covers them; one clause removes the doubt: "On devnet the
  US$500 is counted in test SOL, at the real SOL/USD price."
- **N2. Gambling-adjacent words that pass the vocabulary test.**
  - Replace now: "Hit rate" (tipster), "a devnet game".
  - Leave to L0: "put SOL on YES" (betting idiom), "est. X per 1" (odds format), "prize", "chance".
  - The scan (`tests/site/copy-vocabulary.test.ts`) does not read `content/*.md` or
    `scripts/team/*.template.txt`, which are published. Extend it.
- **N3. "No human picks the winner."** (`app/features/how/copy.ts`, `PRINCIPLE`) sits unqualified on a page that does
  not mention that the opener of a burn, lock or stake campaign "can control the result", or that the devnet upgrade
  key can replace the program. Give the founder this when he answers BP-5. Suggested qualifier: "...the program reads
  the account. On burn, lock and stake campaigns, whoever opened it may be able to make the target happen; those
  campaigns say so."
- **N4. Small notice gaps.**
  - Make "The program is not audited yet." link to /record, so the upgrade-at-any-time row is one tap away.
  - The default meta description (`app/app/layout.tsx`: "On-chain campaigns on Solana. Resolution is a read, not a
    judgement.") feeds search snippets and link previews without "devnet". The manifest has it.
- **N5. The report link.**
  - "Mention campaign N" steers to a public post, which exposes the reporter and possibly a third party. Suggest
    "send a direct message (or mention us)".
  - `personalDataIn` does not catch personal names, ID or phone numbers, or wallet addresses. The two-person review
    is the backstop.
  - Keep unlisting reasons generic: a project named as "misleading" in a public reason may claim reputational harm
    (to confirm).
- **N6. The resolution post.** It carries "Devnet, test SOL. Not audited yet." and promises no time ("Every entry is
  refunded in full" states the rule).
  - Consider "no real value", which P1 §4.6 has.
  - A public post that a named project's target was missed is factual, but third-party names and marks are for L0.
- **N7. TP §8.2 drafting.**
  - Question 2 gives a purpose but no legal basis.
  - Question 5's "None needed for public data" is wrong in law: public personal data stays personal data (LGPD art. 7
    §3, §4 and §7; the GDPR has no public-data exemption).
  - Question 7 should cite C-14.
  - Question 9 should cite M2 and M3.
  - The verdict should read "PASS with conditions before going public".
- **N8. Tests.**
  - The `public-entries` notice is not rendered by any test.
  - The registry's `drawnBy` for `no-human` and `points-worth`, and one of `waiting`'s two rows, points at a copy
    file, so the first registry test is tautological there; their render tests cover them.
- **N9. A forward-looking sentence phrased as fact.** `content/powers.md`: "Before real money, the upgrade authority,
  the admin and the fee recipient move to a 2-of-3 multisig on hardware devices, and an upgrade waits 24 to 48 hours
  in public..." Phrase it as a plan ("The plan before real money is..."). It must be true on launch day (CDC art. 30).
- **N10. `BOTH_SIDES_SCORE = true`** lets 0.01 SOL hedgers score every campaign. Harmless while points are worth
  nothing. If they ever are, it is an unfair-contest rule (founder question 3 of the session log).

## The four questions

1. **Notices.**
   - The devnet and not-audited notices are adequate for devnet and on every screen: root layout, unit test, web
     smoke on 8 routes at both widths. The PWA manifest also says "Devnet: test SOL only".
   - The powers table's "at any time and with no waiting period" is an honest, strong disclosure; N4 links it from
     the banner.
   - Missing on pages:
     - /fees: the viability refund and the late-entry refund (M1).
     - The pre-signing one-sided notice: the "too small" case (M1).
     - /leaderboard: an accurate data line, the operator and the leave path (M2, M3), and the L-09 answer (M6).
     - Every page: a privacy link in the footer (M5).
   - Points as written carry no prize, sweepstakes or lottery exposure. It starts only if points become something
     (M6).
2. **Promises.**
   - No promise of price, yield, profit, automatic payout or time in `app/features/**/copy*.ts`, `content/powers.md`
     or the resolution template.
   - Two absolute guarantees fail in a reachable case (M1).
   - The live /terms promises automatic payouts and a 55-hour worst case (M5).
3. **Personal data.**
   - **Is an address alone personal data?** Treat it as such. It is pseudonymous data that relates to identifiable
     people: founders, people who post their wallet, people who report on X. The GDPR covers it when identification
     is reasonably likely by anyone (Recital 26; CJEU C-582/14 Breyer, by analogy for IP addresses). The EDPB's
     Guidelines 02/2025 on blockchain take the same line (to confirm the final text). Under the LGPD, art. 5 I
     ("identificável"), and art. 12 §2 once a behavioural profile such as a hit rate is built.
   - **Removal from a public ranking:** see M3. The chain stays; Brot's view must honour objections (GDPR art.
     21/17(1)(c)). The LGPD is narrower (art. 18 §2, IV), but Brot has already promised it.
   - **Is §8.2 sound?** Yes in method and in its best decision (no wallet in API requests, nothing on disk, no
     amounts). It has gaps: no legal basis, the question 5 wording, the leave path deferred past a live promise, a
     page line that is wrong, the hit-rate profile, and no reconciliation with the live /privacy and /terms (N7, M2
     to M5).
   - The report channel's review is sound. Add a private channel, and record who holds the X login (B7).
   - **Before mainnet, write:** the list in B5, plus B6 and B7.
4. **Offer or gambling look.**
   - Nothing on the new pages invites real money. The banner, the faucet line ("free from the faucet and worth
     nothing") and the /abrir shell keep it on the test side.
   - No casino patterns: no jackpots, no "win big", no urgency to enter.
   - The words that lean that way are listed in N2, and the mainnet-economics framing is for B1.

## Questions for the lawyer (L0)

1. The classification of a paid-entry SOL pot on an on-chain fact under MP 1.394/2026, CMN 5.298/2026 and DL 3.688/1941
   art. 50 (B1). Does that classification reach devnet promotion of the future service?
2. Does the GDPR apply (art. 3(2)) to an English site with a public ranking of wallet behaviour? Which LGPD basis
   fits the ranking?
3. Do the small-agent rules (Res. CD/ANPD 2/2022) still apply given blockchain plus profiling? Encarregado or channel?
4. CDC art. 49 and art. 51 for the paid opening and the refund policy. The supplier-identification and Portuguese-
   language duties (Decreto 7.962/2013; CDC art. 31) for an English, SOL-priced site.
5. C-14: Marco Civil art. 15 log retention against "never the IP", once the company exists.
6. Points: what turning them into anything would trigger (Lei 5.768/1971, securities rules).

## Not verified here

- The text of MP 1.394/2026, CMN 5.298/2026, SPA 2958/2026, ANPD Res. 2/2022, 15/2024 and 19/2024, the EDPB
  blockchain guidelines and the STF's 2025 art. 19 judgment were not read for this review.
- Cloudflare's dashboard (Logpush or Log Explorer, retention) is the founder's.
- Whether the new site is already reachable at any public URL.
- No test was run. The viability example was computed by hand from the SDK's and the program's formulas.

---

> This document was generated by AI from public standards and the project's own documents. It does not replace a
> legal opinion. (Esse documento foi gerado por AI a partir de padrões públicos. Não substitui parecer jurídico.)
