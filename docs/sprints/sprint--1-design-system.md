# Sprint -1 — Design system, the opening screen and phone layouts

**Status:** closed 2026-10-10 by the founder's approval of the design (the approved screens are in `prototype-lab/campaigns/`, served at `/dev0x/`). The code items of this sprint are not built in `app/` and move to Sprint 09 (see "Closure") · **Branch:** `sprint--1-design-system` · **Dates:** none, by the founder's decision

**Final state (audit of 2026-10-13):** closed with a carry list: tag `sprint--1` at `635c77a`, pushed on 2026-10-13 at 18:41 UTC on Ronaldo's word. Evidence: the design approved 2026-10-10; its code built on `main` by PRs #53, #67 and #70 (`app/styles/tokens.css`, `app/components/ui/`, `tests/site/tokens.test.ts`). Carried: `docs/product/DESIGN-DIRECTION.md` still describes USDC and has no creation-screen or phone section (A); the approved share card, timeline, dense list and phone join bar are not built (A); a screen-reader pass (a person). Draft PR #36 is obsolete as code; its four session logs are to be copied to `main` before it closes (founder).

## Closure (2026-10-10, founder's decisions)

The founder answered every block and approved the design:

- **Theme:** the dark theme is official and the default.
- **Language (L-01):** English, to match the codebase.
- **Campaign page (L-23):** shows the chance history and recent activity.
- **Notices (L-03, L-24, P-9):** standard minimal warnings, with automatic notice ("permitir, com aviso automático").
- **Layouts:** the components and responsive layouts already built in `/dev0x/` are approved, at desktop and phone width.

The design is not rewritten. Items of the definition of done that are about the design's **code** are not built in
`app/`, and move to Sprint 09 as its first items: `app/styles/tokens.css` with the colour variables, the theme script in
`<head>` with the key `brot-theme`, Barlow Condensed and Inter served by the site, the primitives in `app/components/ui/`,
the re-read of the conflicts and gaps against BP v0.0.4, and the section of `DESIGN-DIRECTION.md` that records the result.
The founder's approval of the creation box at both widths is taken from the same review.

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

- Which of the two dark themes is official, and which theme is the default (TP §3.6; the design direction's last
  section).
- The site's language: L-01 (Product Brief v0.0.1 gap). It sets the copy and the language of the sentence templates.
- Whether the campaign page shows the chance history and recent activity: L-23 (Product Brief v0.0.1 gap).
- The text of the lock notice, L-03, and the place of the partner's seal and highlight, L-24 (Product Brief v0.0.1
  gaps).
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

Filled in during the sprint and at closure.
