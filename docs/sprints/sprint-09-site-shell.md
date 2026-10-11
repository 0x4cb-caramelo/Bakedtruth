# Sprint 09 — Site: shell, theme and wallet

**Status:** closed 2026-10-10 for the Hackathon MVP, by the founder's decision; the server and mobile items are deferred to the end of the Hackathon · **Branch:** `sprint-09-site-shell` · **Dates:** none, by the founder's decision

## Founder decisions of 2026-10-10 (blocks answered)

- **L-01:** English. **Dark theme** official and default. **Notices:** standard minimal warnings.
- **Waitlist:** kept active as a separate route for now. **Pitch decks** at `/pitch` and `/pitch2`: kept as they are, by link only.
- **Sprint -1** is closed; its code items arrive here (see that sprint's "Closure").

## Record (2026-10-10, second increment)

- **Done:** the Sprint -1 code items (`app/styles/tokens.css` with the approved dark and light values, the head theme
  script with the key `brot-theme`, Barlow Condensed and Inter through `next/font`, the primitives in `app/components/ui/`);
  the routes `/`, `/abrir`, `/c/[id]`, `/my-entries`, `/leaderboard` and `/record` as shells; the notices on every
  screen, in English; `app/features/wallet/` with the explicit MWA registration once for the site's cluster
  (`@solana-mobile/wallet-standard-mobile` 0.6.0, published 2026-08-17; 0.7.0 is under two weeks old and was not used),
  the wallet states and the X2.1 test; `app/lib/api-client.ts` reading `/api/v1` with `entriesAllowed` (true only when
  health is `ok`); the header's "Use Installed Wallet" button; the old direction-C components, the old `markets` route and
  the old program client (`app/lib` Anchor modules, `@anchor-lang/core`, `buffer`) removed. `bun run lint` and
  `bun run build` pass. Checked on a running build: the theme script and the status line are in the page; the CSP allows
  the API origin; the five shell routes return 200.
- **Not verified here:** the wallet connection itself (needs a browser wallet or the Android emulator with the fake
  wallet); the API call from a real browser; the phone widths.
- **Decisions taken for the founder to confirm:** the route names `/my-entries`, `/leaderboard` and `/record` (English, after
  L-01), and `/abrir` kept as the sprint doc names it; the no-SOL floor of 0.005 SOL in the wallet states.
- **Still open:** the app does not import `@brot/sdk` yet (the DoD asks for `read` and `tx`); `.env.example` at the root is
  still the OS template; the server parts (`brot-web.service`, the Bun staging test, the tunnel routes) change the
  shared server and need a separate go-ahead; the device and emulator tests; the campaign, entry, creation and ranking
  screens (Sprints 10 to 13 and 19).

## Record (2026-10-10, first increment)

- **Done:** the inherited chat is deleted (`app/app/api/chat/`, `app/components/chat/`, `app/lib/chat.ts`), with its
  provider and its context call; `OPENROUTER_*` are gone from `app/.env.example`, the root `.env.example` and CLAUDE.md
  (X2.3); `app/next.config.ts` sends the security headers and a Content-Security-Policy (X2.5), checked on a running
  build: the page answers with `frame-ancestors`/`X-Frame-Options: DENY`, and `POST /api/chat` answers 404.
  `cd app && bun run lint && bun run build` pass.
- **Not done (still in this sprint's definition of done):** the SDK migration (the app still uses `app/lib`, the old
  program's Anchor client, and `@anchor-lang/core`); the routes `/c/[id]`, `/abrir`, my entries, leaderboard and the
  public record; explicit MWA registration and its test; the wallet's states; the copy notices on every screen; the
  Sprint -1 code items; the `features/` layout; the Bun staging test; `brot-web.service`, its deploy and the tunnel
  routes (these change the server and need a separate go-ahead); the waitlist and the pitch decks' routes; the emulator and
  device tests.

| | |
|---|---|
| Technical Plan block | B8 (TP §3.6, with its headers and MWA rules; §8.1 for the landing's data; §12 for the unit) |
| Depends on | Sprints 05, 08 and -1; Sprint 06 for the tunnel, the per-unit identities and the deploy script |
| Requirements covered | BR-27 (copy base and devnet notice), BR-28 (wallet only; the country switch is read), BR-47 (notices); D-q (no AI) |

## Goal

The new site, in Ledger², stands on the server: the shell, the light and dark themes, a wallet connected through
explicit Mobile Wallet Adapter registration, and the wiring to `/api/v1`, `/rpc` and the SDK. The chat route inherited
from upstream leaves. There is no campaign screen yet.

## Closure (2026-10-10, founder's decision)

The founder closed this sprint so Lucas can build the Campaign, Entry and Leaderboard screens on the shells and the SDK
access. Each Definition-of-done item has a disposition below. Nothing is ticked that was not checked.

| Item | Disposition |
|---|---|
| `app/` organised by feature; `components/ui/` holds Sprint -1's primitives | Primitives done; feature folders started (`features/wallet/`). The rest is Lucas's screen work (Sprints 10 to 13) |
| Direction C components gone; providers, wallet button, toast and mascot kept | Done |
| The app imports `@brot/sdk/read` and `@brot/sdk/tx`; no copy of the program's rules in `app/lib` | Done: `app/lib/brot.ts` re-exports both; the footer's program link uses the SDK's `PROGRAM_ID`. `@anchor-lang/core` and the old client removed |
| Chat route, components and library deleted; `OPENROUTER_*` gone | Done (PR #52), and the root `.env.example` is rewritten |
| Routes exist: `/`, `/c/[id]`, `/abrir`, my entries, leaderboard, public record | Done as shells, with the approved names `/my-entries`, `/leaderboard`, `/record` and `/abrir` |
| Explicit MWA registration, once, chain from config, relative icon, "Use Installed Wallet" | Done. Sending through `sendTransaction` comes with the entry flow (Sprint 11) |
| The MWA chain equals the API's `cluster` (X2.1) | Done, tested |
| Wallet states: disconnected, connected, no SOL with the faucet link | Done, tested (the 0.005 SOL floor is approved) |
| Notices on every screen, in English | Done |
| The shell reads `entries_allowed` and hands it to the features | Function done (`entriesAllowed`) and shown on the home page; the entry panel that hides on it is Sprint 11 |
| The old name "baked" is gone from the brand; Baked is the mascot | Done: the brand is Brot Markets, and the old USDC copy is removed. The motto and the mascot's quips are kept; the founder may review them |
| Security headers and a CSP; no paid key in the bundle | Done (X2.5), checked on a running build |
| Bun staging test (D-p), `brot-web.service`, deploy, tunnel routes | **Deferred to the end of the Hackathon** (founder, 2026-10-10: no server changes now) |
| Emulator and device tests for MWA (S1b) | **Deferred to the end of the Hackathon** (founder, 2026-10-10) |
| The waitlist, the pitch decks, and `services/landing` retirement | Founder decision: the waitlist stays active as a separate route, and the decks stay as they are, by link. So `services/landing` is **not retired** in this sprint |
| `cd app && bun run lint && bun run build` | Passes |
| Common closure (`docs/SPRINTS.md`, section 4) | Codemap and changelog updated; secret scan runs on the PR |

## Definition of done

- [ ] `app/` is organised as `app/features/<feature>/{components,hooks,copy.ts}`; `app/components/ui/` holds only
      Sprint -1's primitives.
- [ ] The components of direction C ("Tape") are gone; `providers.tsx`, `wallet-button.tsx`, `toast.tsx` and the
      mascot stay (TP §3.6).
- [ ] The app imports `@brot/sdk/read` and `@brot/sdk/tx` (Sprint 05). `app/lib` holds no copy of PDAs, money math,
      creation checks or event decoding (A-6).
- [ ] **The inherited chat route is gone (D-q):** `app/app/api/chat/route.ts`, `app/components/chat/` and
      `app/lib/chat.ts` are deleted; `OPENROUTER_API_KEY` and `OPENROUTER_MODEL` leave `app/.env.example` and are unset
      in every environment (X2.3); `CLAUDE.md`'s in-app chat section goes; the root `.env.example`, the operating
      system's generic template, is replaced by one that describes this project (TP §14.1).
- [ ] Routes exist: `/`, `/c/[id]`, `/abrir`, the "my entries" route, the leaderboard and the public record. The last
      three are named with L-01. The old app's route folder `app/app/markets` is removed.
- [ ] **Explicit MWA (S1, proposal §3.4):** `app/features/wallet/register-mwa.ts` calls `registerMwa` once from
      `providers.tsx`; the chain comes from config (`CLUSTER`), never from the RPC URL; the icon is a relative path;
      connecting happens only from a user gesture labelled "Use Installed Wallet"; sending goes through
      `sendTransaction`.
- [ ] A test asserts that the MWA chain equals `/api/v1/health.cluster` (X2.1).
- [ ] The wallet has its states: disconnected; connected, with address, SOL balance and disconnect; no SOL, with the
      devnet faucet link. TP v0.0.1 question 10 (test dollars) falls away with D-a.
- [ ] Every screen shows "Estamos em fase de testes. Aqui se entra com SOL de teste, que não vale dinheiro." (P1
      §4.6) and "Programa ainda sem auditoria" (BR-47), in the language L-01 sets.
- [ ] The shell reads `entries_allowed` from `/api/v1/health` and hands it to the features. The entry panel (11) and
      the creation box (19) hide when it is false; states and payouts never do (K-11).
- [ ] The name "baked" is gone from the places the design direction lists. The brand is Brot Markets; Baked is the
      mascot.
- [ ] Security headers and a CSP in `app/next.config.ts` (X2.5); no third-party script; no secret in a `NEXT_PUBLIC_`
      variable; no paid key in the browser bundle (A-5).
- [ ] **The site's runtime is decided here by its staging test (D-p, not a founder question):** `next build` and
      `next start` under Bun 1.4.2 on port 4200, with the shell's pages loading. If they pass, `brot-web` runs on Bun;
      if not, on Node 22, and the reason is recorded. The web smoke of Sprint 11 runs on the runtime chosen here, and
      Sprint 13 records X2.4.
- [ ] `brot-web.service` runs on `127.0.0.1:4200` with its own identity and the sandbox of the other units (proposal
      §2.10). The tunnel sends the domain to it in place of the landing; `/api/v1` and `/rpc` keep Sprint 08's routes.
      Deploys go through `deploy/vps/push-deploy.sh`, with health-checked rollback (Sprint 06).
- [ ] **The founder's choice for the landing's data is built** (TP §8.1, §14.2 "Waitlist"): either the new site keeps
      a deletion path at `/privacy` and the twelve-month purge runs until the last line expires, or the list is used
      once for its stated purpose and then deleted. The decks at `/pitch` and `/pitch2` move or go as the founder decides, and
      keep their link-only `noindex` rule if they stay. The waitlist record's fields are named the same in code, README,
      privacy page and TP §8.1 (TP §14.4 C31). The `privacy-audit` skill runs on the change.
- [ ] MWA is checked on an Android emulator with the fake wallet (`solana-mobile` 0.5.0), and in Phantom's and
      Solflare's in-app browsers on Android and iOS: connect and disconnect on devnet (S1b).
- [ ] `cd app && bun run lint && bun run build` passes.
- [ ] Common closure (`docs/SPRINTS.md`, section 4).

## Deliverables

- The shell: status strip, top bar, footer, dot field, the mascot's perches and the theme button, at desktop and
  phone widths.
- The `/api/v1` client on `@brot/sdk/read`'s schemas, and chain reads through `brot-rpc`. Clients open no WebSocket:
  signature status is polled (proposal §1.6).
- `register-mwa.ts` (S1, size S), the chat removal (size S) and the site's Bun staging test (size S) (proposal §4.0).
- The `brot-web` systemd unit and deploy; the tunnel's routes; `services/landing` retired.

## Out of scope

The campaign list (10). The campaign page and the entry (11). The creation box (19). The country list and what the
screen says with the switch on (17, after L0). A team dashboard, which has no screen in the MVP (TP §3.6). Any AI
feature (D-q).

## Founder decisions that block the sprint

- L-01, the site's language, and the official dark theme and default theme, both from Sprint -1.
- **[Q]** What happens to the waitlist, its twelve-month purge and its deletion form at `/privacy` when the landing
  leaves: keep a deletion path and the purge until the last line expires, or use the list once and delete it (TP §8.1,
  §14.2). And the decks at `/pitch` and `/pitch2`: do they move into the site, still by link only, or go
  (`services/landing/README.md`, "O deck em `/pitch`")? The choice is needed before this sprint closes.
- **[Q]** The waitlist was promised a notice when the devnet opens (TP §8.1). Sending it needs an email provider (TP
  T5) and the founder's word on when.
- Turning off the Cloudflare zone's analytics injection, which waits for the founder's agreement (`CHANGELOG.md`;
  K-10).
- **Answered:** D-q (no AI: the chat route is deleted); D-p (Bun, with Node 22 as the site's fallback, chosen by the
  staging test above); TP v0.0.1 Q11 (the domain is bought and on Cloudflare).

## Agents and skills

- **Agents:** `dev-product-agent`, `technical-security-red-team-agent` (headers, CSP, MWA, nothing secret in the
  bundle), `coordinator-agent`.
- **Skills:** `feature-scaffold`, `privacy-audit` (the landing swap), `sprint-management`, `verify-build-works`,
  `secrets-scan`, `codemap`, `release-check`.

## Security gates

- Read `app/node_modules/next/dist/docs/` before writing app code (`app/AGENTS.md`).
- The shared-server rules, as in Sprint 06, with one identity per unit.
- No provider key reaches the browser (A-5); clients reach the chain only through `brot-rpc`.
- `secrets-scan` at closure.

## Tests

```bash
export PATH="$HOME/.bun/bin:$PATH"
(cd app && bun run lint && bun run build)
(cd app && bun --bun next build && bun --bun next start -p 4200)   # staging: the site under Bun 1.4.2 (D-p)
test ! -e app/app/api/chat/route.ts && ! grep -rq OPENROUTER app/  # the chat route and its key are gone (X2.3)
bun test tests/ -t "mwa chain equals the api cluster"               # to add (X2.1)
bunx solana-mobile device install fakewallet                        # MWA on the emulator
ss -ltn | grep 127.0.0.1:4200                                       # on the VPS
```

Both themes at desktop and phone widths. Connect and disconnect on devnet in the browsers listed above.

## Carried over

From Sprint 00's security review (`docs/sprints/sprint-00-setup.md`; TP §7.1): the chat route
(`app/app/api/chat/route.ts`) had a bypassable rate limit, no spend ceiling, client-built context and copy for the old
product. **Resolved by D-q:** it is deleted here, not rewritten, and `OPENROUTER_API_KEY` stays unset everywhere.

## Risks

- This Next.js version has breaking changes (`app/AGENTS.md`).
- Next.js 16.3.8 under Bun is not confirmed by Next's documentation, and a community report shows a 16.3 build failing
  with Bun [E78]. The Node 22 fallback exists for this.
- wallet-adapter 0.15.40 adds a legacy MWA adapter that infers the network from the RPC URL and would ask for mainnet
  behind `/rpc` [E8]. Explicit registration fixes it; that the two never show as two wallets is checked **[AC]**.
- Chrome shows Local Network Access dialogs on the first MWA connection [E5].
- The old site goes offline at the swap. The moment is agreed with the founder.

## Expected artifacts

`app/app/` (routes), `app/features/`, `app/features/wallet/register-mwa.ts`, `app/next.config.ts`,
`deploy/vps/brot-web.service`, `app/.env.example`, the root `.env.example`, `CLAUDE.md`, `CODEMAP.md`.

## Changelog and session log

- **Changelog:** new site in Ledger²; direction C retired; chat route removed; explicit MWA; landing retired.
- **Session log:** Bun or Node 22 for the site, and why; what stayed from the old app; where the waitlist and the deck
  went.

## Record and retrospective

Filled in during the sprint and at closure.

### The UI overhaul (2026-10-11, branch `feat/full-ui-overhaul`)

Sprint -1's code items, which its closure moved here, built on 2026-10-11 at Ronaldo's request: the site now has the
structure of the approved screens (`prototype-lab/campaigns/`, served at `/dev0x/`), not only their colours (PR #67).

- **The prototype's styles,** as they are, in `app/styles/ui/`, inside the `base` and `components` cascade layers so
  Tailwind's utilities still win; their colours come from `app/styles/tokens.css` (BRAND.md §5), whose variables carry
  the prototype's names. `additions.css` holds what the site needs on top.
- **Rebuilt on the prototype's markup:**
  - the frame (strip, top bar with Baked, search, wallet chip and menu, the menu under 1180 px, footer);
  - the whole home page, with a batched live reading on every card;
  - the campaign page and its entry panel;
  - the creation box's sections;
  - my entries and the leaderboard.

  The content pages took the prototype's page head and titles.
- **Kept from the site where its words are newer:** the full notices at every width, the devnet payout lines, Sprint
  19's kind labels.
- **Ronaldo's changes after seeing it (2026-10-11):**
  - the home page's title and subtitle are the pitch cover's, in the site's vocabulary: "Campaigns the chain
    resolves." and "Permissionless campaigns that turn on-chain milestones into growth, settled by the chain itself.";
  - the wallet button says "Connect" (it still connects only from that click, S1);
  - "question" became "campaign" in the site's copy;
  - Lucas's vocabulary rule stays whole, with no exception.
- **One opening button:** the home page's large yellow button is gone; the top bar's "Open a campaign" is the brand's
  yellow primary.
- **"Connect" opens the "Connect a wallet" list** of the approved design: the browser's wallets, detected first; the
  picked one is selected and connected from that click only (S1); a wallet that does not connect says why. It used to
  connect the first installed wallet and swallow its error, so a refusal or the wrong wallet looked like a dead
  button.
- **The creation box's search completes what is typed** (Ronaldo, 2026-10-11), as the approved prototype's does
  (`open-slots.js`). Each suggestion is the whole sentence of the campaign it would start (template v1, the target in
  the kind's unit, a reviewed name for the address), grouped by kind, its filled slots in bold. It reads:
  - a direction ("falls to", "drop", "reaches");
  - a deadline ("in 30 days", "2 weeks"), kept within the program's 3 to 90 days;
  - a target with "k" or "m" ("120k").

  With the feeds' live prices it never offers a target already met: a target past the price reads the one way the
  program opens it. A bare number finds the feeds priced near it; an empty box starts with examples a fair way off the
  price (BTC, SOL and ETH first); a feed without a fresh price is flagged. Outside the grammar, Baked skeptical over
  "We can't check this on-chain." and the three nearest kinds. Enter takes the first suggestion, and the cursor moves
  on to the account or the target. The query still stays in the page (D-j); a pick fills only the slots, checked as
  typed ones. Tests: `tests/site/open-search.test.ts` and a scene in `tests/e2e/open.e2e.ts`. The chosen deadline chip
  shows as chosen again (the prototype's `.op-days` style, which the overhaul had left out).
- **"$" before a price** (Ronaldo, 2026-10-11): "SOL/USD reaches $150", as the prototype writes it (`dollars()` and
  `value(v, "$")`), wherever template v1 shows (the cards, the campaign page, the creation box, the search's
  suggestions) and on the other US$ prices of the page and the cards: the rule, the proof's price now, target and
  confidence, the cards' read line and the home page's read panel (`priceText` in `sentence.ts`, through `valueText`).
  A ratio feed (SSOL/SOL.RR) keeps a plain number, since its value is not in dollars. What a campaign stores and means
  does not change. The creation box's own preview keeps its "US$" (Sprint 19's copy review).
- **The prototype's pointer effects** (Ronaldo, 2026-10-11): their styles had come over in the overhaul, but not
  `effects.js`. `app/components/pointer-effects.tsx` now draws the dot field behind every page, brightening within
  190 px of the pointer, and moves the spotlight across the card grid; with prefers-reduced-motion the dots stay still
  and the spotlight is off. The top bar's border on scroll was already the header's. A web-smoke scene reads the
  canvas: the dot under the pointer lights up, a far one does not.
- **The wallet's balance follows the entries** (Ronaldo, 2026-10-11: after a NO entry of 0.5 SOL the top bar still said
  5.0 SOL). Each component read the balance once on its own: the entry panel read it again after a landing, but the top
  bar's chip only when the wallet connected. One reading now serves the whole site (`sol-balance-provider.tsx`): read
  on connect, after any landed entry or opening, every 20 s while the page is visible, and on return to the tab. The
  smoke checks that the chip drops after the entries.
- **Baked's bubble on a phone** is fitted to the screen again whenever Baked moves while it shows (Sprint 13's rule:
  it never cuts). A tap mid-hop used to leave it past the edge after the landing; the new layout exposed it.
- **Tests:** two web-smoke expectations follow the design (the phone menu holds "How it works"; the wallet chip, not a
  visible "Disconnect", says the wallet is connected); the notice registry points at the new footer.
- **Not built yet:**
  - the share card;
  - "About this campaign";
  - the open campaign's timeline;
  - the dense list of every campaign;
  - the phone's fixed join bar;
  - the partner seal;
  - Baked's lines per screen.
