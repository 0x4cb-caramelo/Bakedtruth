# Sprint 10 — Site: campaign list

**Status:** built for the Hackathon MVP (2026-10-10), by the AI on the founder's decision (Lucas's UI is not in the repository; the founder's 2026-10-10 plan gives the list to the AI, with `/5` and `/dev0x/` as references) · **Branch:** `sprint-10-site-campaign-list` · **Dates:** none, by the founder's decision

## Record (2026-10-10)

- **Built:** the home route `/` lists every campaign from `/api/v1/campaigns` (read in pages), with search, the five
  states and "Saved", the kinds, the sort (ranking, pot, entries close, YES chance) and the unlisted switch. Each card
  shows the kind, the sentence (price campaigns name the feed and the target from the SDK's pinned list), the state, the
  pot in SOL, the chance per side (no chance for an empty pot, L-05), the estimated return per side (the SDK's
  `estimateReturnBps`, labelled "estimate", one SOL on the side), the entries-close and deadline dates, the review date
  for campaigns in review, and the notice on burn, lock and stake cards (BR-26). There is no redemption.
- **Ranking, computed on the site** (the founder's decision: no wait for the indexer): two-sided campaigns first, by
  entries and then by time left to close; one-sided next; empty last. A campaign with no entry 24 hours after opening
  leaves the list unless "Show unlisted" is on.
- **Saved:** kept in this browser's localStorage only (a per-viewer convenience).
- **Verified:** `bun test` for the card values, the sentence and the arrangement (33 app tests, 14 API tests); lint,
  build; in headless Chrome against the live devnet read API, the list rendered its four campaigns with the values above.

## Not built (carried, with the reason)

- **The US$ value and its source and time:** the read API has no SOL/USD price yet. Carried to the price endpoint
  (Sprint 08's `/api/v1/price`) and the decision D-e (CoinGecko or Pyth).
- **The proof bar** on each card: the price campaign's proof progress is not computed yet.
- **The share card (BR-33)** and its link: carried to a later sprint.
- **Partner seal, name and 72-hour highlight:** no `content/partners.json` exists yet, so no card moves up for a partner.
- **Names from `content/account-names.json`:** the file does not exist; the shortened address shows instead.
- **Sentences of burn, lock and stake campaigns:** a generic form ("Burn campaign 4Rq3…m9X8") until the templates are
  confirmed with the founder.
- **Indexer rank and listed flags:** computed on the site instead (see above); the indexer's own values are Sprint 08.
- **Visual parity:** the cards follow the sprint's fields and the Sprint -1 tokens, but are not yet a pixel match of `/5`
  or of the `/dev0x/` table. The founder should review the layout; phone widths were not checked.


| | |
|---|---|
| Technical Plan block | B8 (TP §3.6, §4) |
| Depends on | Sprint 09 |
| Requirements covered | BR-05 and BR-09 on the card, BR-19 (partner highlight), BR-21, BR-26 (creator notice), BR-33 (share card), BR-44 (home ordering) |

The file was renamed with `git mv` from its v0.0.1 name, under D6.

## Goal

The home page with real data: the campaigns in the indexer's order, with filters and search, and on each card the
generated sentence, the chance, the estimated return, the pot in SOL and the two deadlines. Each campaign also gets the
share card it carries to X.

## Definition of done

- [ ] `/` reads `/api/v1/campaigns` and follows the indexer's `rank` and `listed` (proposal §2.7): partner campaigns
      during their 72-hour highlight, then two-sided campaigns by entries and by time left before entries close, then
      one-sided ones. A campaign with no entry 24 hours after opening leaves the home page and stays reachable by
      link and in an "all campaigns" list with filters (BR-44). Nothing a creator can pay for, the prize included,
      moves a card up.
- [ ] The card shows:
  - the kind;
  - the sentence, rendered by `template_version` from the stored fields, with names from
    `content/account-names.json` or the pinned Pyth feed list, and otherwise the shortened address (A-11);
  - the chance on each side, the share of entries (P1 §3.2);
  - the estimated return, with the word "estimativa", net of the fee and the creator share, from the SDK math;
  - the pot and each side in SOL, the prize when there is one, and the US$ display value with its source and time
    (D-e), with CoinGecko's attribution if the plan in use requires it **[AC]** (D4; [E79]);
  - entries close and deadline; the proof with its bar; the state.
- [ ] The categories are the five kinds. The filters are the five states and "Saved", kept in `localStorage`. The sort
      is by pot, by entries close and by YES chance.
- [ ] The card exists in the five states. "Em revisão" has a clock. There is no redemption.
- [ ] An empty pot shows no chance (L-05, Product Brief v0.0.1 gap).
- [ ] A partner campaign shows the seal, name, link and 72-hour highlight from `content/partners.json`. Burn, lock and
      stake cards, partner campaigns included, carry the notice "quem abriu pode controlar o resultado e pode ter
      entrado no SIM ou no NÃO" (BR-26).
- [ ] "Closing soon" counts to entries close. "Upcoming", "Notify" and "Sponsor a goal" do not exist (D-t). The link
      to open a campaign points to `/abrir` and appears with Sprint 19.
- [ ] **The share card:** `app/c/[id]/opengraph-image.tsx` renders the sentence, the live value, the deadline, the pot
      and the YES/NO split from the indexer's DTO, with self-hosted fonts; after resolution, the value read, the target
      and the result. The route convention is checked in `app/node_modules/next/dist/docs/` first **[AC]**. Cards are
      cached at the edge with a short TTL (proposal §2.8).
- [ ] The share button is a plain intent link. No X script or widget on any page (K-10).
- [ ] Loading, network-error and empty states exist for the grid, the carousel and the side list.
- [ ] "How it works" shows the steps of the pot and opens on phones.
- [ ] A long list paginates or loads in parts.
- [ ] The search has a focus ring, and the carousel does not announce every change to a screen reader.
- [ ] The phone layouts of Sprint -1 are in place.
- [ ] `cd app && bun run lint && bun run build` passes.
- [ ] Common closure (`docs/SPRINTS.md`, section 4).

## Deliverables

- The list feature in `app/features/`: mosaic, principles, filters and grid.
- The share-card route and the share button (size S, proposal §4.0).
- The seal's display fields (seal, name, link) added to `content/partners.json`, which Sprint 08 created, and to its
  JSON Schema check in CI (proposal §2.3).
- The copy of the steps and principles, reviewed against the design direction's conflicts table.

## Out of scope

The campaign page (11). The creation box (19). Notifying anyone that a campaign opened (L-16: no channel in the MVP).
The sponsor's seal on a sealed entry (15).

## Founder decisions that block the sprint

None open. Sprint -1 must have answered L-24 (where the partner's seal and highlight go). **Answered:** D-d (partners
open free, with a 72-hour highlight), D-e (CoinGecko for display), D-t (no sponsor request).

## Agents and skills

- **Agents:** `dev-product-agent`, `copywriter-agent` (steps and principles), `coordinator-agent`.
- **Skills:** `feature-scaffold`, `sprint-management`, `verify-build-works`, `codemap`, `secrets-scan`.

## Security gates

- `content/partners.json` lives in Git and changes only with two people's review.
- No screen promises a return: the number is always "estimativa".
- The share card renders only fields of the indexer's DTO, never text from a request.
- No third-party script. `secrets-scan` at closure.

## Tests

```bash
export PATH="$HOME/.bun/bin:$PATH"
(cd app && bun run lint && bun run build)
bun test tests/ -t "card estimate matches sdk math"      # to add
bun test tests/ -t "home follows the indexer ranking"    # to add; the ranking itself is tested in Sprint 08 (X1.9)
bun test tests/ -t "share card renders only dto fields"  # to add
```

The list against the campaigns that `seed:devnet` opens: chance and return on screen match the SDK. Filters, search
and sort by hand. Keyboard and phone widths. A card fetched twice is served from the edge the second time.

## Risks

- The card inherits "price" and "volume" from the prototype. Mitigation: the conflicts table as a checklist.
- Few devnet campaigns leave the mosaic empty: the empty states must exist.
- Card rendering costs CPU on the 2-vCPU server (K-06), so a card that spreads must come from the edge cache.
- The sentence drifts from the program's template: it is rendered only from the SDK's template table, by
  `template_version`.

## Expected artifacts

`app/features/` (the list), `app/c/[id]/opengraph-image.tsx`, `content/partners.json`, `CODEMAP.md`.

## Changelog and session log

- **Changelog:** home page with real data and the indexer's ordering; partner seal and highlight; share card.
- **Session log:** what changed from the design Sprint -1 approved, and why.

## Record and retrospective

Filled in during the sprint and at closure.
