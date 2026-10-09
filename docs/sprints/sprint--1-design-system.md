# Sprint -1 — Design system, the opening screen and phone layouts

**Status:** in progress (opened 2026-10-08) · **Branch:** `sprint--1-design-system`, stacked on `sprint-02-pot-core` (PR #30, which carries the plan's PR #27) · **Dates:** none, by the founder's decision

| | |
|---|---|
| Technical Plan block | Prerequisite of B8 (TP §3.6); input to M, the Android app (TP §3.7) |
| Depends on | Sprint 00, for the repository and CI only. It does not read the program |
| Requirements covered | The screens of BR-01, BR-02, BR-05, BR-09 to BR-12, BR-19, BR-23, BR-26, BR-27, BR-33, BR-44 and BR-47. No money rule |

**Where it fits.** It runs in parallel with Sprints 00 to 08 and blocks only the site (09 to 13, and 19). Its tokens
and phone layouts are the input of the Android app's own design pass, which opens Sprint 20.

**What changed from v0.0.1.** D8, option (a), taken as approved with the architecture proposal (the founder can
correct it), adds two things to this sprint: the design pass for the creation screen, at web and phone widths, and a
layout below 700 px for every web screen (proposal §2.9, §3.11, §6) **[DP]**. The approved prototype has neither: no
creation screen, and no breakpoint below 700 px **[F]** (`docs/product/DESIGN-DIRECTION.md`, "Gaps" and the breakpoint
table).

## Goal

Turn the approved Ledger² prototype (`prototype-lab/prototype-n/`) and `docs/product/DESIGN-DIRECTION.md` into real
tokens, components and layout primitives in `app/`; redesign the content that still shows the old model (price,
buying, redemption, test dollars, a sponsor request); design the creation box at `/abrir`; and give every web screen
a phone layout. The visual language does not change.

## Definition of done

- [ ] `app/styles/tokens.css` carries the colour variables of the design direction: dark in `:root`, light in
      `:root[data-theme='light']`. Tailwind v4's `@theme` points at them, and no component uses a literal colour.
- [ ] The theme is set by a script in `<head>`, before the CSS, with the storage key `brot-theme` (TP §3.6).
- [ ] Barlow Condensed 700 and Inter 400, 500 and 600 are served by the site itself, with no third-party font host
      (K-10). How this Next.js version serves fonts is checked first **[AC]** (TP §14.4).
- [ ] Every component of the design direction's inventory has a primitive in `app/components/ui/`, in both themes, or
      is marked as cut, with the reason.
- [ ] The conflicts table (19 rows) and the gaps table are re-read against BP v0.0.4. Each row has a new design that
      the founder approved, or is marked gone with its source: the sponsor request form (D-t), the suggestions page
      (P1 §4.1: "quem tem uma ideia abre"), the cap-reached state (D-h), test dollars (D-a), "Upcoming" and "Notify"
      (no campaign exists before it opens).
- [ ] **The creation box (D8):** the founder approved its design at desktop width and at phone width, with every
      state listed under Deliverables.
- [ ] **Phone layouts:** every web screen has an approved layout at about 412 CSS px (proposal §3.11) and down to
      360 CSS px **[INF]** (a common narrow Android width, not from the sources), with a breakpoint below 700 px. The
      mascot's bubble does not cut at the right edge, and "How it works" has a path on phones.
- [ ] The three text pairs below 4.5:1 and the four accessibility problems listed in the design direction are fixed.
- [ ] `docs/product/DESIGN-DIRECTION.md` records the result: a section for the creation screen, a section for the
      phone layouts, the resolved conflicts, and the last item of its handoff checklist ticked.
- [ ] `cd app && bun run lint && bun run build` passes.
- [ ] Common closure (`docs/SPRINTS.md`, section 4).

## Deliverables

- One primitive per inventory component, from the status strip to the footer. The mascot stays.
- Layout primitives: page, mosaic, grid, the two-column campaign page, and a breakpoint below 700 px.
- Colours for the five kinds (P1 §4.2: large-asset price, supply burn, Meteora locked liquidity, stake pool size,
  validator stake), in place of the five old categories.
- The new content:
  - chance and estimated return, net of the fee and the creator share (BR-09);
  - the pot with two totals in SOL, the prize line, and the US$ display value with its source and time (D-e);
  - entries close and deadline, as two moments (BR-06);
  - the five public states, "Aberta", "Fechada", "Em revisão", "Paga" and "Anulada" (P1 §3.1), the six-hour
    countdown, the contested state, the one-sided pot and the void with its reason;
  - the wallet: disconnected, "Use Installed Wallet" (proposal §3.4), connected with address, SOL balance and
    disconnect, and no SOL;
  - "my entries", with what the wallet received as baker, creator or opener;
  - the confirmation before signing: the deterministic summary (A-3) and the lock notice (BR-12);
  - loading, errors, the price kind (current price, target, no fresh price), the leaderboard, the partner's seal and
    72-hour highlight, and the devnet and "Programa ainda sem auditoria" notices (BR-47).
- **The creation box at `/abrir`** (proposal §2.9 and flow F0), at both widths:
  - the typeahead over one sentence template per kind and over the known names, with typed slots (number, date,
    account picker) rather than inline blanks, so it works with a screen reader; text outside the grammar answers
    "we can't check this on-chain" with the nearest templates;
  - the account slot's states: checking; accepted with a reviewed name; accepted without one, shown as a shortened
    address with an explorer link (A-11); refused for owner or layout;
  - the preview card: the generated sentence; the rule in plain words (account and explorer link, deadline in UTC and
    local time, entries close, what a missing value means, early resolution, one-sided and void refunds); the live
    value with "if resolved now: YES/NO"; the money (house fee, creator share, the opening in SOL with its US$ value
    and the 90/10 split, `max_lamports`, the rent returned at close, no cap); the share-card preview; and, on burn,
    lock and stake kinds, the notice "quem abriu pode controlar o resultado e pode ter entrado no SIM ou no NÃO"
    (P1 §4.2);
  - one message per refusal of `user_open_campaign` (TP §3.4.10, rows 1 to 10), paid openings blocked while the
    SOL/USD price is stale, the pause, and the `max_open_campaigns` valve;
  - signing, pending and confirmed, and the retried opening that finds its campaign already open (T17);
  - the team-key variant: no payment and no creator share (P-3).
- **[NEW]** The share card (the `/c/[id]` image) and the re-check panel (proposal §2.9). Reason: both are new surfaces
  the design direction does not show, and Sprints 10 and 11 build them; designing them here keeps a design round out
  of those sprints.

The medium of the redesign, a prototype in `prototype-lab/` or straight in `app/`, is chosen at the sprint's opening.

## Out of scope

Screens bound to real data (09 to 13, and 19). The Android app's screens: Sprint 20 opens with their own design pass,
built from this sprint's tokens and phone layouts (proposal §6). Referral, sealed entry, Cloak and SODAX screens (14,
15, 17). Changing the approved direction. Touching the program.

## Founder decisions that block the sprint

Answered by the founder on 2026-10-08, at the sprint's opening (session log of that day):

- **The official dark theme is the one live on brot.markets**, which is the approved prototype's dark
  (`prototype-lab/shared/ledger.css`), and **dark is the default** ("i only see one when i enter the site
  brot.markets, the default is dark theme"). The other dark, lab direction D's, differed only in radii and a few tones.
- **The site's language is English** by default (L-01: "site language is english default").
- **No chance history on the campaign page** (L-23: "i dont know about this, but probably not").
- **The lock notice (L-03):** "i accept a suggestion". The prototype carries the recommended text and the options go
  to the founder with the screens.
- **The partner's seal and highlight (L-24):** "i dont know too, after i decide". The prototype shows two placements
  side by side for the choice.
- **"Forget USDC and cap":** the redesign follows BP v0.0.4 alone; the Product Brief v0.0.1's USDC and cap are
  ignored until the brief is revised.

Still open:
- The creator notice is drawn as BP-14's recommendation ("permitir, com aviso automático"), still open in P-9.
- To close: the founder's approval of the redesigned screens, the creation box and the phone layouts.
- **Taken as approved with the proposal:** D8, option (a) (`docs/SPRINTS.md`, section 5). **Answered:** D-j (no free
  text), D-m (vocabulary).

## Agents and skills

- **Agents:** `dev-product-agent` (nothing of the old model left), `copywriter-agent` (screen copy in the D-m
  vocabulary), `coordinator-agent`.
- **Skills:** `sprint-management`, `codemap`, `verify-build-works`, `decision-log`, `secrets-scan`.

## Security gates

- No third-party script or font on any page (K-10).
- Read `app/node_modules/next/dist/docs/` before writing app code (`app/AGENTS.md`).
- No creator-supplied text appears anywhere in the creation box: names come from `content/account-names.json` or the
  pinned Pyth feed list (A-11).
- `secrets-scan` at closure.

## Tests

```bash
export PATH="$HOME/.bun/bin:$PATH"
(cd app && bun run lint && bun run build)
bun test tests/ -t "design tokens meet contrast"   # to add: every text pair in both themes at 4.5:1 or more
```

A visual check in both themes at desktop width, 412 and 360 CSS px. A keyboard pass with visible focus. A
screen-reader pass over the creation box's typed slots.

## Risks

- The redesign turns into a new prototype round. Mitigation: hold to the inventory, the conflicts table and the state
  lists above.
- The site inherits the old model by inertia. The design direction's conflicts table is the checklist.
- The creation box is designed before `validateOpenCampaign` exists (Sprint 05). Mitigation: the ten refusals of
  TP §3.4.10 are the contract; a refusal added later adds a message, not a layout.
- An open L-01 doubles the copy work.

## Expected artifacts

`app/styles/tokens.css`, `app/components/ui/*`, the updated `docs/product/DESIGN-DIRECTION.md`, `CODEMAP.md`.

## Changelog and session log

- **Changelog:** design system created; creation screen and phone layouts designed; design direction updated.
- **Session log:** the official dark theme, the default theme, the language, and every conflict resolved differently
  from what was expected.

## Record and retrospective

### Where it stands (2026-10-08): the redesign is built and waits for the founder's approval

The medium chosen at the opening is a static prototype, `prototype-lab/campaigns/` (69 files, every one under 200
lines with a `Purpose:` header): HTML, CSS and ES modules over mock data, opened over HTTP (its `README.md`). The
founder reviews it on any screen; what the founder approves is then ported into `app/` (tokens, theme script, fonts,
primitives), which is the second half of this definition of done.

**How it ran.** The base first, by the orchestrator: tokens in both themes (contrast fixed), the components, the site
frame, the wallet in every state, the campaign card, the pot math of TP §3.4.16 in BigInt (checked against worked
examples A, B and C to the lamport), 16 mock campaigns covering every kind and state, and the contract
(`prototype-lab/campaigns/README.md`). A read-only agent compiled a screen-by-screen spec from the sources (15
screens, 24 notices, the 19 conflicts and the gaps mapped, 15 founder questions); the shared files adopted its
conventions (English routes, SOL to 4 decimals, "est. 2.47 per 1", chance pairs that add up to 100, kind colours that
avoid YES/NO green and red and the interface blue). Then four agents built the screens in parallel, each in its own
files:

| Lane | Screens | Files | States |
|---|---|---|---|
| 1 | Home, all campaigns | `home*.js`, `list.js`, `cards.css` | Carousel with pause and slide groups; closing soon; answered recently; filters, sort, search, load more; empty, loading, error; seal A and B |
| 2 | Campaign page, entry flow | `campaign*.js`, `ui/entry*.js`, `campaign.css`, `entry.css` | 16 campaign states; "You're in"; the summary before signing, signing steps, receipt and 15 refusals; re-check command checked against devnet SOL/USD |
| 3 | Opening box `/abrir` | `open*.js`, `open.css` | Five kinds (price opens now; the other four show when they open); typed slots; nine account-check states; the money table; 33 refusal messages; signing, retried, team key |
| 4 | My entries, leaderboard, fees, record, how it works, share card | `me*.js`, `ranking.js`, `fees.js`, `powers.js`, `how.js`, `share-card.js`, `error.js`, `pages.css` | Tabs, the held credit and how to receive it; points; worked examples A, C and D; who can do what and the void log; the 1200 × 630 card before and after resolution |

**Checks.** 93 page states at 360 px (31 routes, each with three combinations of wallet, pause, stale price, blocked
country and light theme): no console error, one `<h1>` each, no sideways scroll, none of the banned words. Each lane
checked its screens at 1440, 412 and 360 px in both themes. The contrast of every new token pair is computed (all
text at 4.5:1 or more, borders of fields and controls at 3:1 or more). The integration fixed the top bar (it wrapped
between 860 and 1180 px), the mascot's bubble at the window's edge (a definition-of-done item; the live site still
cuts it), a short wallet label on narrow phones, the mock sentences regenerated from the spec's templates, and the
leaderboard's points as Q7 decided (1 per campaign entered on the right side).

**Open for the founder** (the closure waits on the first three): approving the screens, the creation box and the
phone layouts; the partner seal's placement (A, a chip, or B, a band; the screens index shows both); the lock notice
(A, recommended and in the prototype; B and C in the spec); and the questions the lanes and the spec raised, listed in
the session log of the opening.

**Still to do after the approval:** port the tokens, the theme script, the fonts and the primitives into `app/`; record
the result in `docs/product/DESIGN-DIRECTION.md`; `cd app && bun run lint && bun run build`; the common closure.
