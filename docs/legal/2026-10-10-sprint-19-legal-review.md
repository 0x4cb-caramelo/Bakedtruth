# Sprint 19 — legal and compliance review of the creation box (`/abrir`)

**Version:** 0.0.1 · **Date:** 2026-10-10 · **Status:** draft. A lawyer must review it before production (L0). Not a
legal opinion.

> **What happened next (added when the sprint applied it, 2026-10-10).** This review read the branch before its fixes,
> so its line numbers are those of older versions; the quoted text identifies each finding. M1 to M7 were applied (the
> box's own devnet and not-audited lines, the team's powers in "Who decides", what comes back and when, no "nothing was
> charged", the public-opening notice, the privacy page made exact with the nine questions in TP §8.3, and "US$500 or
> more" on every page). M8, deploying the landing before `/abrir` is public, went to the founder
> (`docs/sprints/sprint-19-site-open-campaign.md`, founder item 2), and so did N1, the banner's words (item 6). N2 to
> N12 were applied: the age line and the receipt in the sheet, "creation rules" instead of "terms" (in the SDK's
> summary too), the unlisting line, the test wallet with no real funds in the checklist, and the review sheet rendered
> in the notices test. B1 to B12, before mainnet, and N13 are in TP §7.5. The questions for the lawyer below stand.

> **Disclaimer.** I am not a lawyer. This is a safe first draft, built from public standards and the project's own
> documents. Before real money, sensitive data or critical jurisdictions (health, fintech, minors), have a lawyer review
> it. That costs less than a lawsuit.
> (Original: "Eu não sou advogado. O material gerado aqui é um rascunho seguro de partida baseado em padrões públicos.
> Antes de lançar com pagamentos reais, dados sensíveis ou em jurisdições críticas (saúde, fintech, menores), peça pra
> um advogado revisar. O custo é menor que um processo.")

## Scope and method

- Branch `sprint-19-site-open-campaign`, `git diff origin/main...HEAD` (3 commits, 64 files), plus the working tree at
  review time. Files changed on disk during the review: `use-open-flow.ts`, `open-sheet.tsx` and `use-open-box.ts` (the
  id is drawn again after an opening; the sheet can be closed while the opening confirms). The plan's header now
  announces a §8.3 that is not written yet. None of these changes alters a finding.
- What I read: the three copy files and the four components that place them; `open-box.tsx`, `open-action.tsx`,
  `preview.ts`, `kinds.ts` and `draft.ts`; the notices registry and its test; the root layout, `site-notice.tsx`,
  `copy-site.ts` and `next.config.ts` (CSP); `retry-guard.ts`, `recent.ts`, `submit.ts`, `watch.ts`, `use-open-flow.ts`,
  `use-open-box.ts`, `search.ts`, `what-section.tsx`, `prefill.ts` and `names.ts`; the fee page's and How it works' copy;
  `content/powers.md` and `content/README.md`; the campaign header; `PRIVACY-POLICY.md` in full; TP §8 and §8.2; the
  relay list's diff; the Sprint 19 doc and session log; `check-opening.ts`, the wallet checklist and the devnet README's
  new section. In the program, I read `team_void_campaign.rs`, `void_reason.rs` and the headers of `settle_prize`,
  `close_campaign`, `settle_creator_share` and `collect_fee`.
- I ran one test, `node --test services/landing/tests/pages.test.mjs`: 7 passed, so `privacy.html` matches the markdown.
- On 2026-10-10 I fetched `brot.markets/privacy`, `/terms` and `/abrir` to see what is live.
- I read no statute for this review. Legal references come from general knowledge or the project's own research notes.
  Each one I am unsure of says "to confirm with the lawyer". I edited nothing in the repository.

## Summary

The box is careful work. The money table is exact, in lamports, with the price source, its time, the 1% ceiling, the
rent, the network fee and the total. The no-entry rule appears next to the price, in the preview and in the review
sheet. The creator notice shows on every kind but price. The typed search stays in memory (autocomplete and spellcheck
are off). A link fills slots but never signs, and the box says so. No third-party script loads: the CSP allows only the
site, the RPC and the read API. Names come only from a list that two people review, and it is empty today. The retry
guard and the "you opened one a moment ago" dialog protect a creator from paying twice. None of the box's text uses
gambling words or promises a profit, a yield or a time.

Seven things in the text should be fixed before merge. All are copy or text changes; none touches the program.

1. The review sheet never says "test SOL" or "not audited". The entry sheet does. The site banner speaks of *joining*
   with test SOL. (M1)
2. "Brot's team can only confirm or void a result" contradicts the program and `/record`: a team key never voids a YES
   or a NO, and on devnet one key can replace the program at any time. (M2)
3. The box never says plainly that the prize goes to the winning side when the pot splits. It never says that, on
   devnet, nothing comes back by itself. The review sheet, the only screen a phone's sticky button always passes
   through, says neither. (M3)
4. "Nothing was charged" sits next to "No SOL moved except the network fee" on the same failure screen, and contradicts
   the fee page. (M4)
5. Nothing tells a creator, before opening, that the opening is public and permanent, or that the campaign page labels
   their wallet's own entries. Entries got this notice in Sprint 13. (M5)
6. The privacy policy's two new bullets are close but not accurate: the RPC also sees the transaction being signed, and
   the record is written before signing and pruned only when the box is opened again. The repository's rule also wants
   the nine answers recorded (TP §8.3). (M6)
7. The fee page, How it works and `/record` still describe a fixed US$500 opening, with a US$50 fee. The box now sells
   US$1,000, US$1,500 and custom amounts, and Brot's fee is 10% of the whole amount. (M7)

One more condition does not block the merge, but blocks `/abrir` from going public. As of today the founder's answer 9a
is not live. `brot.markets/privacy` still serves the 8 October text ("No profiles", "remembers one thing"), and
`brot.markets/terms` answers 200 with "You accept these terms when you connect a wallet or sign a transaction through
brot.markets", USDC and "Payouts are automatic". (M8)

**Verdict.** Merge after M1 to M7. Make `/abrir` public only after M8. On devnet, the creator notice is enough for
tokens a creator controls. On mainnet it is not (B1).

## MUST (before this PR merges)

### M1. The box and its review sheet never say "test SOL" or "not audited"

- **Where.**
  - `app/features/open-campaign/copy.ts:15` (`BOX.lede`, "US$500 in SOL; 90% becomes the prize...").
  - `open-review.tsx:142-147`: the sheet's notices are the creator notice, no take-back, no-entry and "wallet differs".
  - `copy-site.ts:10`: the banner says "Here you **join** with test SOL".
  - Compare `entry/entry-notices.tsx:33`, which repeats `NOTICES.devnet` in the entry sheet: "Solana devnet: entries
    use test SOL, which has no real value. The program is not audited yet."
- **Facts.**
  - The banner is on every screen, `/abrir` included: `tests/e2e/site-pages.e2e.ts:20`, at both widths.
  - The review sheet is a modal `<dialog>` (`showModal()`, with a scrim), so the banner and the footer sit behind it.
  - On a phone, the sticky bar's "Review and sign" button (`open-action.tsx`) opens the sheet without scrolling past the
    preview or the cost.
  - The only devnet word in the sheet is "Network: Solana devnet". The sheet shows "Opening · US$500" next to an SOL
    amount.
- **Why it matters.**
  - The founder's rule is that no page may read as an offer (`NOT_AN_OFFER`, BRAND.md). The opening is the most
    price-like screen on the site.
  - The project already repeats the devnet notice in the entry sheet "before the wallet". The opening deserves the same,
    and its sum is larger.
  - Whether devnet promotion of the future service matters under the betting rules the project's research lists is
    for L0 (prior review B1).
- **Fix.**
  - Add to `copy.ts`: `export const OPEN_DEVNET = "Solana devnet: an opening is paid in test SOL, which has no real
    value; the US$ amounts only run the rules at Pyth's SOL/USD price. The program is not audited yet.";`
  - Show it in `cost-section.tsx` under the charge line, when `CLUSTER === "devnet"`, and as the first bullet of
    `open-review.tsx`'s list.
  - Add a `devnet-opening` row to `registry-open.ts`. Render it in the notices test (see N11).
  - Optional: `BOX.lede` → "US$500, paid in test SOL; 90% becomes the prize in your campaign's pot. ..."

### M2. "Who decides" says the team can void a result; the program never lets a team key void a YES or a NO

- **Where.** `copy.ts:127-128` (`PREVIEW.who`), shown in the preview's "Who decides" line (`preview-section.tsx:104`):
  "The program reads the account; Brot's team can only confirm or void a result during the review window."
- **Facts.**
  - The program: `void_reason.rs:36-41` (`team_void_outcome`) refuses YES and NO with `TeamVoidNotAutomatic`.
  - A team key can only confirm a result. On a campaign the program voided by itself, it records the cause
    (`team_may_choose`: MissedWindow, StaleFeed, TeamHouseFailure, TeamOutsideCause).
  - That cause decides whether the opening fee comes back (`is_house_failure`). So Brot's team decides Brot's own refund.
  - `content/powers.md:24` adds that the upgrade authority can replace the program "On devnet, at any time and with no
    waiting period".
  - The session log says the line came from the Sprint -1 prototype. Its time was removed; "void a result" stayed.
- **Why it matters.**
  - Two published texts disagree about the team's powers: the box, and `/record`. The prior review's M5 logic applies:
    the reader quotes the more generous one.
  - "Only" is false on devnet, because one key can replace the program.
  - The creator is not told who decides whether the fee comes back. That is material to a payer: CDC art. 6 III and
    art. 31 (correct, clear and precise information). Their reach at mainnet is L0's.
  - The fix also settles the prior review's N3 for the box.
- **Fix.** Replace with:
  `` `${principle} The program reads the account. In the review window a team key can confirm a YES or a NO, never
  change it; on a campaign the program voided by itself, it records the cause, which decides whether the opening fee
  comes back. On devnet one key can still replace the program at any time.` ``
  Then link "Who can do what" (`/record`) after it, as `site-notice.tsx` does.

### M3. What comes back to the creator, and when: the main case is never stated, and nothing says devnet sends nothing by itself

- **Where.**
  - `copy.ts:139` (`MONEY.prizeNote`): "On no side. Returns to you if the pot ends one-sided or the campaign is voided".
  - `:141` (`feeNote`), `:145` (`rentNote`: "returned to you when the campaign closes"), `:151-152` (`onEntries`: "you
    get 1% of the entries when the pot splits").
  - `copy-sheet.ts:35-40`: the sheet's prize, fee and rent rows. `rentNote` says "Returned when the campaign closes".
  - `open-review.tsx:142-147`: the sheet has no line about the prize, or about refunds.
- **Facts.**
  - In the usual case (YES or NO wins and the pot splits), the prize goes to the winning side and the fee stays with
    Brot: the creator gets none of the US$500 back. The box implies this by listing the cases where the prize returns.
    It never says it.
  - `settle_prize`, `settle_creator_share` and `close_campaign` pay out only when some wallet calls them ("Any wallet
    may call"). On devnet nothing calls them by itself.
  - The founder's devnet wording, used on the fee page (`fees/copy.ts`, `refunds[5]`) and in the lock notice: "On
    devnet they are not sent automatically yet, and no time is promised." The box does not use it.
- **Why it matters.**
  - Losing the opening in the usual case is the most important fact for someone paying US$500. Leaving it out is the
    misleading-by-omission pattern of CDC art. 37 §3, if the CDC applies (L0).
  - "Returned to you when the campaign closes" reads as a commitment the devnet service does not run.
  - The sheet is the only screen guaranteed before signing.
- **Fix (copy).**
  - `MONEY.prizeNote` → "On no side. When the pot splits, it goes to the side that was right; it comes back to you only
    if the pot ends one-sided or the campaign is voided"
  - `MONEY.feeNote` → "Held until the outcome; refunded only if a void is Brot's fault, as the team records it, and
    never on a campaign with no entry"
  - `MONEY.rentNote` and `SHEET.rentNote` → "Returned to you when the campaign is closed after its payouts"
  - New: `RETURNS_DEVNET = "On devnet, what comes back to you (the prize, the rent, your 1%) is not sent automatically
    yet, and no time is promised."` Show it under `NO_ENTRY_RULE` in `cost-section.tsx:163`.
  - New for the sheet, before `NO_TAKE_BACK`, on paid openings: `PRIZE_FATE = "When the pot splits, the prize goes to
    the side that was right. It comes back to you only if the pot ends one-sided or the campaign is voided."`, followed
    by `RETURNS_DEVNET`.
  - Register both (`what-comes-back`) in `registry-open.ts`.

### M4. "Nothing was charged" is false when a refused opening landed, and contradicts the line under it

- **Where.**
  - `copy-refusals.ts:94-98` (`OpeningAboveMaxLamports`: "...Nothing was charged.").
  - `copy.ts:143` (`MONEY.mostNote`: "Past it the program refuses the opening and nothing is charged").
  - `copy-sheet.ts:82` (`TAKEN.text`: "Nothing was charged.").
- **Facts.**
  - A refusal that lands on-chain pays the network fee: `watch.ts:109-117` returns `cost: "fee"`.
  - `open-sheet.tsx:81` and `:98` then show the refusal text and `COST.fee` on one screen: "...Nothing was charged." and
    "No SOL moved except the network fee." (`entry/copy-failures.ts:131`).
  - The fee page says it right: "the US$500 is not taken, only the network fee" (`fees/copy.ts:72`).
  - `TAKEN` can come from the watch after a send (`watch.ts:105-107`).
- **Why it matters.** It is a small amount, but it is a statement about cost, and it contradicts both the line under it
  and the price page (CDC art. 31, precision; to confirm). It costs nothing to fix now, before it carries to mainnet.
- **Fix.**
  - `OpeningAboveMaxLamports` → "SOL/USD moved more than 1% since your quote, so the program refused the opening and
    took no opening payment."
  - `mostNote` → "The quote plus 1% for price moves. Past it the program refuses the opening and takes no opening
    payment; a transaction that was sent still pays its network fee"
  - `TAKEN.text` → "Another wallet opened a campaign at the id this box drew, so yours could not open there. No
    opening payment was taken; if your transaction was sent, only its network fee moved. A new id is drawn when you try
    again."

### M5. No "public and permanent" notice before an opening

- **Where.** `open-review.tsx:142-147`. The creator's public trace is drawn in `campaign-page/campaign-header.tsx:62-75`.
- **Facts.**
  - Every paid campaign's page says "Opened by <wallet> (paid; prize X SOL)".
  - On every kind but price, the page adds "The creator's wallet has an entry: YES n SOL and NO m SOL".
  - The chain keeps the opening and its payment forever.
  - Before a first entry, the site says entries are public and permanent (`entry/copy.ts`, `SHEET.public`; TP §8,
    question 8). Openings have no equivalent. The box's creator notice tells the creator what bakers will read, not what
    the site shows about the creator.
- **Why it matters.** Under the privacy rule's question 9 (documentation, policy, consent), the project's own choice is
  to say this at the point of action. Transparency: LGPD art. 6 VI and art. 9, and GDPR art. 13 if it applies (L0). A
  public address is still personal data (prior review, question 3).
- **Fix.**
  - Add `SHEET.public` to `copy-sheet.ts`: "Openings are public and permanent: anyone can see, on-chain and on this
    site, that this wallet opened this campaign and what it paid. On every kind but price, the campaign's page also
    shows any entry this wallet makes in it."
  - Show it in the sheet's list and register it (`public-opening`).
  - In `PRIVACY-POLICY.md:52`, write "Before your first entry, and before you open a campaign, the site tells you this".

### M6. The privacy policy's new bullets: make them accurate, and record the nine answers

- **(a) The RPC bullet** (`docs/legal/PRIVACY-POLICY.md:107-109`) names three reads.
  - The RPC also receives: the simulation of each opening at "Review and sign", with the wallet as fee payer
    (`submit.ts:28-45`); the signature polled until finalized (`watch.ts`); and the accounts checked in the box
    (`relay-allowlist.md`, Sprint 19 block).
  - The sentence is also hard to parse ("...or, before you pay to open a campaign, your wallet's recent transactions,
    your wallet address...").
  - Replace with: "**The Solana RPC service** the campaign site reads the chain through (on devnet, Solana's public one,
    api.devnet.solana.com) sees your IP address, under its own rules. It also sees your wallet address whenever the
    page asks it about your wallet: your balance and your entries; a transaction you are about to sign, which the page
    tests first, and its progress after you sign; and, before you pay to open a campaign, your wallet's recent
    transactions. It sees the accounts you check in the creation box too."
- **(b) The opening record** (`:89-91`) says the record exists "while a campaign you open is on its way", and is deleted
  "a day after it was refused or could no longer land". In the code, it differs in three ways:
  - The record is written at "Review and sign", before anything is signed (`use-open-flow.ts:108`, `idFor`).
  - Old records are pruned only when the creation box loads (`use-open-box.ts:28-33`).
  - A record left while the wallet held the transaction ("handed") is never pruned by age. It is resolved on the next
    visit to the box with that wallet (`retry-guard.ts:142-161`; `use-open-flow.ts`, the effect on mount).

  Replace with: "while you open a campaign, a record of it (its wallet, the campaign number drawn for it, the
  transaction's signature and expiry, and when it was saved), so trying again can't open it twice. It is written when
  you press "Review and sign", before anything is signed, and deleted once the campaign opens. If you stopped before
  signing, or the opening was refused or could no longer land, the box deletes it the next time you open it, a day
  later or more. Clearing this site's data in your browser deletes it at once." The other way is to change the code
  to match the current text: prune on every page, delete a "drawn" record on Back, and age out old "handed" records.
- **(c) Record the review.** `.claude/rules/privacy-audit.md` says not to merge a personal-data change without the nine
  answers. The plan's header (working tree) announces §8.3, which does not exist yet. Put the table below into TP §8.3.
  Also qualify TP §8's first line (`TECHNICAL-PLAN.md:2021`, "Joining or opening a campaign collects no personal data").
  It is true of Brot's servers. It is not true of the browser record or of the RPC.
- **Why it matters.** The page promises accuracy and promises to change before anything new is collected (§8, `:156-159`).
  LGPD art. 6 VI and art. 9. GDPR art. 12-13, if it applies.

### M7. Three pages and `/record` describe a fixed US$500 opening; the box sells more, with Brot's fee at 10% of the whole

- **Where.**
  - `app/features/fees/copy.ts:19`: "The opening fee: 10% of the US$500 a paid opening costs."
  - `fees/copy.ts:70`: "A wallet opens a campaign for US$500 ... 10% (US$50) is Brot's opening fee".
  - `app/features/how/copy.ts:26`: "A wallet opens a campaign for US$500 in SOL".
  - `content/powers.md:25`: "Open a campaign, paying: US$500 in SOL...".
- **Facts.**
  - The box offers US$1,000, US$1,500 and custom amounts (`cost-section.tsx:29`). It says the extra is "a bigger prize,
    at the same 90/10" (`copy.ts:75`).
  - The program splits the whole payment (`splitOpening`: `fee = paid − 90%`). At US$1,500, Brot keeps US$150, not US$50.
  - Sprint 19 put the "Open a campaign" link right under the fee page's US$500 text.
- **Why it matters.** The fee page is the price list (BR-32). A price list that understates Brot's fee is the
  contradiction the prior review warned about: a payer quotes the cheaper text (CDC art. 30 and art. 47; to confirm).
  The box shows the right fee, but the price page should agree with it.
- **Fix.**
  - `fees:19` → "The opening fee: 10% of what a paid opening costs, US$50 on the minimum of US$500."
  - `fees:70` → "A wallet opens a campaign for US$500 or more, paid in SOL at the Pyth SOL/USD price the transaction
    reads; on devnet that is test SOL. 90% becomes the prize, in the pot on neither side (US$450 on US$500); 10% is
    Brot's opening fee (US$50 on US$500), held in the campaign until it settles."
  - `how:26` → "A wallet opens a campaign for US$500 or more in SOL: 90% becomes a prize in the pot, 10% goes to Brot."
  - `powers.md:25` → "At least US$500 in SOL ...; 90% of it becomes the prize and 10% Brot's opening fee; ...". This
    file needs its two-person review.
  - Or remove the larger amounts from the box until the pages say this.

### M8. Before `/abrir` is public, the founder's landing deploy (answer 9a). Not a code change, and not a merge blocker

- **Status, fetched 2026-10-10.**
  - `brot.markets/privacy`: "Last updated: 8 October 2026", "No profiles.", "Delete our copy of your market activity",
    and "remembers one thing on its own".
  - `brot.markets/terms`: HTTP 200, "You put USDC on a side", "Payouts are automatic", "55 hours", and "You accept these
    terms when you connect a wallet or sign a transaction through brot.markets".
  - `brot.markets/abrir`: 404. The new site is not served there yet.
  - The new site's footer links `https://brot.markets/privacy` (`app/lib/config.ts:7`).
- **Why it matters.** This was settled by the prior review (M5) and the founder's answer 9a, but it is not executed yet.
  Sprint 19 raises the stakes: once the box is reachable "through brot.markets", the live terms' own acceptance clause
  would claim to govern a paid opening.
- **Before `/abrir` is reachable at any public URL** (the sprint's founder item 2, with three additions):
  - deploy the landing with this PR's privacy text (after M6), with `/terms` down;
  - keep a date at the top newer than the live one: the day the text last changed;
  - post on X, as the page's §8 promises ("a new date at the top and a post on X").
  - Until then, the site's openings switch (`ISSUES.site`) can keep the box shut on a public build.

## BEFORE MAINNET (Sprint 17 with L0, and the audits)

- **B1. Creator-controlled outcomes (burn, lock, stake pool, validator stake).**
  - The sprint's own risk note: "a creator who controls the measured account can force the outcome once the other side
    holds just over US$56 of third-party money" (`docs/sprints/sprint-19-site-open-campaign.md:249-250`).
  - On devnet the notice is a fair defence, since the money has no value and the outcome teaches the test something. On
    mainnet a notice may not shield Brot. To confirm with the lawyer:
    - fraud exposure, where a creator profits from bakers on a result they cause;
    - if L0 classes campaigns as fixed-odds betting, the integrity rules that bar bets by persons who can influence the
      result (as I recall, Lei 14.790/2023 does this for sports events);
    - token promotion under securities and advertising rules, when an issuer opens a campaign on its own token.
  - Program changes, audit scope: refuse entries from the creator's own wallet on these kinds. This does not stop
    second wallets, but it removes the self-dealing the page now shows.
  - Product changes:
    - the terms state creator duties: no manipulation, no entries through other wallets, and declaring control of the
      mint, pool or validator, shown on the campaign;
    - consider these kinds for team, partner or KYB-checked creators only, or keep them off until L0;
    - reword the bakers' notice: "anyone holding enough of this token, pool or stake can move the result, the creator
      included".
  - Tell the lawyer that, by design, the team can never void a YES or a NO. That limits the remedies once a
    manipulation is found.
- **B2. The paid opening as a consumer purchase.** This builds on the prior review's B3; I do not repeat it. Specific to
  the box:
  - `NO_TAKE_BACK`: there is no cancellation, even before the first entry. CDC art. 49 and Decreto 7.962/2013 art. 5
    give a 7-day right of withdrawal; whether it applies to a service that starts at once is L0's question.
  - `NO_ENTRY_RULE`: the fee is kept even on a house failure. That is an exoneration for the supplier's own failure
    (CDC art. 51 I and IV; to confirm).
  - Brot's team records the void's cause, which decides Brot's own refund (M2).
  - Options: a cancel path while there is no entry yet; published criteria for each cause, kept in `content/void-log`;
    the contest path (Sprint 14) as a review of the team's choice.
  - Some creators are businesses and may not be consumers. That is also L0's question.
- **B3. The creator share and partner campaigns as promotion.**
  - If L0 classes campaigns as betting, creators paid 1% of entries look like promoters or affiliates, which the
    advertising rules cover (to confirm).
  - Partner campaigns read "Opened by the Brot team". Name the partner ("Opened by the Brot team for <partner>"), so the
    commercial link is clear (CDC art. 36: advertising must be identifiable as such; to confirm).
- **B4. Age, terms and identity.**
  - The footer line is a notice, not a gate. Mainnet needs C-07: the project's own research says ECA Digital (Lei
    15.211/2025, [E30]) forbids self-declaration where it applies.
  - Mainnet also needs C-12 (terms acceptance recorded), the age rule in the terms, and the supplier identification of
    the prior review's B2.
- **B5. Paid openings: screening, country and licensing.**
  - Any wallet can pay US$500 per opening, with no cap, and receive 1% of entries plus pots.
  - The relevant items are C-03 (sanctions warranties), C-11 (`brot-rpc`'s country refusal of openings, which waits for
    the relay), C-15 (SOL as a regulated service), and whether creators need KYC. All with L0.
- **B6. Unlisting a paid campaign.** The creator should hear before paying that a report can take the campaign off the
  site's list, that it stays open on-chain, and that the opening is not refunded. This belongs in the box and in the
  terms, with the procedure of `content/README.md` (prior review B3 and B7).
- **B7. Prominence.** The sheet's creator notice and the M3 lines are a muted bullet list (`text-xs text-muted`). Risk
  information must be prominent ("ostensiva", CDC art. 31; prior review B8). The preview's highlighted creator notice is
  the model.
- **B8. Links that prefill.**
  - `prefill.ts:70-71` accepts `usd` up to nine digits and any account.
  - A shared link can preselect a high amount and a token the sharer controls.
  - On mainnet: say "This link set the amount to US$X; the minimum is US$500" next to the amount, or ignore `usd` from
    links. Keep `BOX.fromLink` prominent.
- **B9. Names, marks and third parties.**
  - Add a line that Brot Markets is not affiliated with Pyth, Meteora or any project whose account a campaign reads.
    Using marks to describe what is read is likely descriptive use (to confirm).
  - Add a route for a named project to ask to be unnamed.
  - The validator-stake kind names vote accounts, which can belong to a natural person. That is a third party's personal
    data, with an objection route (GDPR art. 21, if it applies; to confirm).
- **B10. A receipt.** `DONE.charged` ("Charged X SOL at Y, the price the program read") exists but is unused
  (`copy-sheet.ts:69`). E-commerce confirmation rules (Decreto 7.962/2013 art. 4; to confirm) favour showing it.
- **B11. Clarity of targets.** Burn and lock targets are raw units (`copy.ts:58-59`), which bakers can misread by
  10^decimals. Show token units next to the raw value. An unclear question is read in the consumer's favour (CDC art.
  47; to confirm).
- **B12. Privacy at mainnet.** Update the policy when:
  - the `/rpc` relay changes who sees the wallet with the IP;
  - the legal basis per purpose is written (the browser record, the recent-transactions read);
  - the RPC operator's role is settled: an independent controller or Brot's processor;
  - the RPC's country is known, for the international-transfer sentence.

## NOTES

- **N1.** `copy-site.ts:10`. The banner says "Here you join with test SOL". It is the founder's P1 §4.6 line, so the
  wording is his call: "Here you join and open campaigns with test SOL, which has no real value."
- **N2. Age line in the sheet.** The footer line (`layout.tsx:52`) is enough on devnet as a notice, and it shows on
  `/abrir` (smoke-tested). The modal sheet and the phone's bar skip it. Add `AGE_NOTICE` to the sheet's list. It costs
  one line and the opening is a payment to Brot. It is still not a gate (B4).
- **N3. "Terms" while the Terms are down.**
  - `CreationParamsChanged` says "Brot's terms changed since this preview" (`copy-refusals.ts:123-127`).
  - `MONEY.usdSource` says "the opening's own terms" (`copy.ts:153`).
  - Say "Brot's creation rules changed" and "the opening's own amounts", so no reader assumes a contract exists.
- **N4.** `copy-sheet.ts:67`, `DONE.listed`: "It shows in the list once the read API reads it again." Add "unless the
  team unlists it after a report; it stays open on-chain" (see B6).
- **N5.** `copy-sheet.ts:76`, `ALREADY.text`: "Nothing was charged twice." A retry that landed and failed paid its
  network fee. Say "The opening was paid once."
- **N6. Unused copy.** `DONE.share` and `DONE.shareText` (`copy-sheet.ts:70-71`; the share button was removed) and
  `DONE.charged`. Delete the share lines, or keep them out until a copy review. Sharing to X is user-initiated, which is
  fine.
- **N7.** `copy.ts:135-136`, `MONEY.charge`: "its price minus its confidence band". Add the plain consequence: "(a
  slightly lower price, so slightly more SOL)".
- **N8. Small policy edits.**
  - `:116-117`: add the RPC service to the international-transfer sentence ("and the RPC service may be outside your
    country").
  - `:49`: say the site labels a campaign's opener and, on every kind but price, the opener's own entries.
  - Add one line that the browser notes can be deleted by clearing this site's data.
  - The entry bullet (`:87-88`) has the same deletion-timing gap as M6(b): it is pruned only where a campaign page or
    the box loads (`entry/use-rents.ts`, `browserStore`).
- **N9. Evidence from the check script.**
  - `scripts/team/check-opening.ts:38` prints the creator's address. Read-only, devnet only (`clusters.ts` refuses
    mainnet), no key, no funds: legally fine.
  - When its output is recorded in the sprint file ("Recording the result",
    `docs/technical/wallet-browser-checklist.md:35-39`), leave the address out unless the wallet's owner agrees. Next to
    a phone model and a date, it ties a person to a wallet.
  - In the checklist (`:10`) and the devnet README, write "a test wallet that holds no real funds". Phantom uses the same
    keys on every network, so a main wallet would link devnet activity to a real one.
  - Nothing in either document asks anyone to use real funds.
- **N10.** In the checklist's steps 10 and 11, check that the sheet shows the devnet notice, the public-opening notice,
  the no-entry rule and, on a burn, the creator notice.
- **N11. Test coverage.** The notices test renders only `PreviewSection` (`tests/site/notices.test.ts`, the Sprint 19
  case). For the review sheet, the registry test only checks that the file contains the name. Render `OpenReview` for a
  paid burn, a paid price and a free opening, and check the M1, M3 and M5 notices and the conditionals
  (`creatorCanPush`, `free`).
- **N12. The recent-transactions read is proportionate.** It reads at most 20 signatures and 5 transactions from the
  last 30 minutes, decodes them in the browser and discards them. It is disclosed after M6. A status line while it runs
  ("Checking this wallet's recent openings…") would make it visible.
- **N13.** The CSP's `script-src 'unsafe-inline'` lets an injected script read the browser record, or change what the
  sheet shows. That is for the security review, not this one.

## The nine privacy questions, for the creation box

| # | Question | The box | Verdict |
|---|---|---|---|
| 1 | What personal data | **Browser:** one record per wallet while an opening is under way: the wallet address (in the key and the record), a random campaign id, an attempt id, the signature, the block height after which it cannot land, its state, and the device time it was saved. **RPC operator:** the IP with the wallet address (the balance, the simulation of the opening, the signature's status, and, before a paid opening with no saved record, the wallet's last 20 signatures and up to 5 transactions), and the accounts checked. **Public:** the creator's wallet, the campaign, the payment and the creator's own entries, labelled on every kind but price. **Not kept:** the typed search (component memory, no autocomplete or spellcheck), any free text, any name a creator types | PASS |
| 2 | Why, and on what basis | The record exists so a retry cannot charge US$500 twice (T17). The RPC reads check the rules (A-10), price the opening and confirm it; the recent read is the guard's second witness when storage was cleared. The public record is how the program works, and the label is BR-26. The basis is not written: legitimate interest (LGPD art. 7 IX) or steps at the user's request (art. 7 V) are the working readings (L0) | PASS (basis to confirm) |
| 3 | Where | localStorage, mirrored in the page's memory; never sent to Brot. The RPC operator's systems, location unknown. Solana, plus the read API's in-memory copy (as before) | PASS |
| 4 | Who can access | Whoever uses that browser profile, and scripts on the site's own origin (the CSP blocks third-party scripts). Brot cannot read the record. The RPC operator sees what it receives. Anyone sees the chain | PASS |
| 5 | How access is controlled | Same-origin storage; the CSP (`connect-src` limited to the site, the RPC and the read API); no server copy; bounded reads, decoded in the browser; no amounts and no keys in the record. `unsafe-inline` is security's question (N13) | PASS |
| 6 | Retention | Deleted when the campaign opens or the id turns out taken. A never-signed, refused, failed or expired record is deleted a day after it was saved, but only when the box is opened again. A "handed" record waits until the box, with that wallet, resolves it. With no return visit, it stays until the user clears site data. The RPC keeps what it keeps under its own rules; the chain keeps everything forever | PASS WITH CONDITIONS: the policy matches this (M6(b)), or the code matches the policy |
| 7 | Logs | The box logs nothing. The page's server logs one error line for a malformed names file, with no personal data. Once the site is behind the tunnel, Cloudflare logs the IP and the URL, prefill query included, for up to 7 days. The RPC operator logs under its own rules | PASS |
| 8 | Deletion and export | Brot holds nothing from the box. The user can clear the site's data (N8 adds that line). The chain cannot be changed, and the policy says so | PASS |
| 9 | Documentation, policy or consent | The policy is updated with two bullets, under conditions: M6(a) and (b); M8 (deploy before `/abrir` is public, with a date and the post on X; 9a is not live yet); M5 (the public-opening notice); M6(c) (TP §8.3). The sheet already says the id is saved in this browser before signing. No consent is needed for storage strictly necessary for the opening the person asked for (ePrivacy art. 5(3)'s exemption, if it applies; L0) | PASS WITH CONDITIONS |

**Overall:** PASS WITH CONDITIONS. Merge after M5 and M6. `/abrir` goes public only after M8.

## The brief's four questions, answered

1. **What the creator reads.**
   - Cost: fully disclosed, in exact lamports, with the 1% ceiling.
   - The no-entry case: disclosed in three places.
   - The creator notice: on every kind but price, in the preview (highlighted) and in the sheet.
   - Devnet and not-audited: on every screen through the layout, `/abrir` included. Missing from the sheet, and the
     banner speaks of joining (M1).
   - What comes back: the main case is not stated, and nothing says devnet sends nothing by itself (M3).
   - Who decides: wrong (M2).
   - Two promises devnet does not keep: "nothing is charged" (M4) and "returned to you when the campaign closes" (M3).
   - No offer or inducement on devnet: default US$500, no urgency, no gambling words, and the footer's "not an offer".
     M1 keeps the US$500 from reading as a price.
   - The age line in the footer is enough as a devnet notice; repeat it in the sheet (N2). It is not enough for mainnet
     (B4).
2. **Personal data.** See the table. The two new policy bullets are close, but they need M6's wording. The page's own
   promise to change before anything new is collected holds only if M8 happens first.
3. **Third parties and content.**
   - No third-party script: PASS.
   - The names list (empty, reviewed by two people, never a person, link or handle): PASS.
   - Any account, including a token the creator controls: the notice is enough on devnet. B1 lists what mainnet needs.
4. **The check script and the checklist.** Read-only, devnet only, test SOL only; nothing asks for real funds. N9
   covers the creator's address in recorded evidence, and asks for "a test wallet that holds no real funds".

## Questions for the lawyer (L0)

1. Creator-controllable campaigns: is a notice enough, or must the platform stop the creator, or anyone in control, from
   entering? What are the exposures under fraud law, betting integrity rules (if campaigns are betting), and
   securities or advertising rules for token issuers?
2. The paid opening:
   - Is it a consumer contract when the creator is a person, or a project?
   - Does CDC art. 49 reach an opening with no entry yet?
   - Is keeping the fee on a house failure with no entry acceptable?
   - Is Brot's team choosing the void's cause, and with it Brot's own refund, acceptable under CDC art. 51?
3. The creators' 1% and partner campaigns: do affiliate or advertising rules apply, and how must a partner campaign be
   labelled?
4. The browser record and the in-browser read of a wallet's recent transactions:
   - What is the legal basis for each?
   - Does the ePrivacy art. 5(3) exemption apply, if GDPR applies at all?
   - Is the RPC operator an independent controller, or Brot's processor? What does the transfer abroad require?
5. Age: does ECA Digital reach a devnet demo with no value? What age assurance do creators and bakers need on mainnet?
6. The validator-stake kind: when a vote account belongs to a natural person, what basis and objection route apply?

## Not verified here

- I ran only the landing's page test. The site's unit tests, the web smoke and the build were not run.
- Live pages, fetched on 2026-10-10: `/privacy` (8 October text), `/terms` (200), `/abrir` (404 on brot.markets). I did
  not check whether `brot-web` is reachable at any other public URL.
- Who operates api.devnet.solana.com, where it is, what it logs and how long it keeps it.
- Statutes not read: CDC, LGPD, GDPR, ePrivacy Directive, Decreto 7.962/2013, Lei 14.790/2023. ECA Digital (Lei
  15.211/2025) is cited from the project's [E30], not read by me.
- The "US$56" threshold is the sprint's own figure; I did not recompute it.

---

> This document was generated by AI from public standards and the project's own documents. It does not replace a
> legal opinion. (Esse documento foi gerado por AI a partir de padrões públicos. Não substitui parecer jurídico.)
