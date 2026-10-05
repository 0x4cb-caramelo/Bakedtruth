# Prototype Lab

Disposable HTML prototypes go here before production app development.

## How to open

Serve this folder over HTTP (the mascot sprites and the WebGPU canvas do not work from `file://`):

```bash
python -m http.server 4173 --bind 127.0.0.1   # from prototype-lab/
```

Then open <http://127.0.0.1:4173/>.

## Directions

All fourteen read the same data ([`shared/mock-data.js`](shared/mock-data.js)), run the same logic
([`shared/app.js`](shared/app.js)) and host the same mascot ([`shared/mascot.js`](shared/mascot.js)).
They cover the same flows: home, category and status filters, search, sort, saving a market, the market
page with its on-chain proof, and the trade panel.

| | Brand hypothesis | Type | Markets | Effects | Mascot |
|---|---|---|---|---|---|
| [A · Ledger](prototype-a/index.html) | A trading desk with a grumpy bread roll on it. Closest to the reference. | Barlow Condensed + Inter | Dense card grid | Card spotlight, moving-border button, canvas dot field | Lands on top of cards and panels |
| [B · Oven](prototype-b/index.html) | A bakery at night. The crust sets the palette; proof is "doneness". | Fraunces + Manrope | Bento of wide and narrow cards | WebGPU heat shader (Canvas 2D fallback), word-by-word headline, tilting 3D card | Larger; climbs the headline and the cards |
| [C · Tape](prototype-c/index.html) | The mascot is pixel art, so the product is too. A scoreboard, not a dashboard. | Jersey 15 + Space Grotesk | Rows on a tape, progress in blocks | Infinite ticker, tracing beam on the rail, canvas cell field | Walks the rail pointing at the row; hops in steps |

### The mosaic wireframe (D to G)

D, E and F keep the look of A, B and C and change only the structure of the home page: a mosaic with a carousel
of the markets being traded on the left, "Upcoming" and "Closing soon" stacked on the right, the three principles
below it, then the status tabs (Active, Closing soon, Resolved, Saved) and the market list. The carousel and the
two side lists are driven by [`shared/mosaic.js`](shared/mosaic.js); upcoming markets live in `upcoming` in the
mock data. A, B and C are untouched.

| | Based on | What it tests |
|---|---|---|
| [D · Ledger²](prototype-d/index.html) | A | The mosaic in the trading-desk look |
| [E · Oven²](prototype-e/index.html) | B | The mosaic in the bakery look |
| [F · Tape²](prototype-f/index.html) | C | The mosaic in the approved pixel look |
| [G · Casino](prototype-g/index.html) | new | The gambling register taken all the way: green felt, gold, neon sign, marquee bulbs, slot reels, a roulette wheel, chips for Yes and No, "last call" countdowns, payout multipliers, a betting slip and confetti. The mascot is the only one at the table not smiling. |

G is a deliberate stress test. `DESIGN-DIRECTION.md` lists "a casino" under what the brand is not, so G shows
what that register does to the product rather than proposing it. Its multipliers are the real payout per USDC
(`100 / price`); its countdowns are mock clocks counted from page load.

### Web3 prediction market (H to J)

Variations on Ledger and Tape, the two directions that came closest, pushed toward an on-chain prediction
market. All three use the mosaic home. Each leans on one of the references named for the lab (Aceternity UI,
canvas effects, WebGPU, Spline).

| | Starts from | For / optimizes / sacrifices | Type | Markets | Effects |
|---|---|---|---|---|---|
| [H · Prism](prototype-h/index.html) | A | For traders who already use DeFi front ends. Optimizes for polish and familiarity. Sacrifices the mascot's pixel character: it sits on glass it does not match. | Sora + Inter, JetBrains Mono for numbers | Card grid with a probability ring and sparkline | Aurora, card spotlight, moving border (Aceternity), canvas constellation |
| [I · Blocks](prototype-i/index.html) | C | For crypto-native users who read explorers. Optimizes for the "it is a read" story: every market shows the account it reads first. Sacrifices warmth and approachability for newcomers. | VT323 + JetBrains Mono | Blocks chained on a rail | WebGPU cell shader with a Canvas 2D fallback ([`shared/shader.js`](shared/shader.js)), tracing beam, titles that decode from hex |
| [J · Orbit](prototype-j/index.html) | A + C | For a first-time visitor who needs one image to get YES/NO. Optimizes for a memorable hero. Sacrifices density: two wide cards per row. | Chakra Petch + Inter | Wide cards that tilt in 3D, progress in blocks | Outcome coin in orbit (CSS 3D, in the Spline manner), lamp under the header, canvas starfield |

Two limits worth knowing. The coin in J is CSS 3D, not a Spline scene: embedding Spline needs a `.splinecode`
URL exported from their editor, and `.stage` in `prototype-j/view.js` is where it would go. The WebGPU shader in
I was only exercised through its fallback, because the headless browser used to check the lab has no WebGPU
adapter; the footer of I says which renderer is drawing.

### Ledger² in three looks (K to M)

D · Ledger² is the closest so far. K, L and M keep its structure and add the things prediction markets and web3
apps usually have that D did not, each from one angle. A first pass kept D's look for all three and they were
indistinguishable at a glance, so they were redone: each now has its own palette, type and shapes.
[`shared/ledger.css`](shared/ledger.css) holds the common skeleton with every colour, radius, border and font as
a variable (the defaults reproduce D), and [`shared/ledger.js`](shared/ledger.js) holds D's templates.

| | Look | For / optimizes / sacrifices | What it adds |
|---|---|---|---|
| [K · Desk](prototype-k/index.html) | A financial terminal on paper, the only light direction: white, ink, one cobalt; IBM Plex with mono numbers; square corners, hairlines, no shadows | For someone who trades daily. Optimizes for density and scanning. Sacrifices the mascot's room (table rows are too thin to perch on) and the dark, on-chain mood of the rest of the lab. | Summary strip (volume, open, closing in 48h, resolved, "oracles: 0"), market list as a table with a cards switch, price move on every row, live activity rail; on the market page chart ranges, quick amounts, market activity, related markets |
| [L · Arena](prototype-l/index.html) | Neo-brutalist colour blocks: lilac floor, flat yellow, sky and pink panels, thick black outlines, hard shadows; Bricolage Grotesque + DM Sans; tokens take their category's colour | For a newcomer browsing. Optimizes for energy and for finding something worth opening. Sacrifices the product's dry, factual tone: it is the loudest direction after G. | Categories with counts, "biggest moves" strip, a chance gauge on each card, top traders, latest trades; on the market page the resolution rule in one sentence |
| [M · Vault](prototype-m/index.html) | The inside of a web3 wallet: deep purple, a purple-to-pink gradient on anything pressable, Solana green for YES; Outfit; everything a pill, soft glows | For a returning user with positions. Optimizes for "what do I hold and what can I do now". Sacrifices a clean first impression, and green and red are no longer the only strong colours on screen. | A mock connected state (balance, positions, unrealised result), the sponsor's bounty on every market, "you hold" on cards; on the market page a four-step lifecycle, the permissionless Resolve button, a position card, redemption, a transaction toast |

What these lean on, and what they would cost to build:

- The patterns (table and cards, price move, activity feed, leaderboard, chance gauge, portfolio bar) are the
  common vocabulary of prediction-market and DeFi front ends as the author recalls them. No competitor page
  was checked for this round, so treat "like Kalshi or Polymarket" as a hypothesis, not a finding.
- M covers gaps already listed in `DESIGN-DIRECTION.md`: the connected wallet, user positions, resolve and
  redeem. Its wallet is a local flag; nothing is signed or sent.
- The new mock data is in `leaders`, `wallet` and `sponsors` in `shared/mock-data.js`. Sponsor budget and
  positions map to things the program already holds (the market's sale budget, token balances). The
  leaderboard does not: no account stores it, so it would have to be aggregated from events across every
  market. The app reads events with `getSignaturesForAddress` and no indexer, which is sized for one market's
  history, not for a ranking across all of them.

The reference these start from is [`docs/product/baked-home.html`](../docs/product/baked-home.html). The mascot
poses in `shared/mascot/` were normalized from the PNGs in `docs/product/`.

### Ledger² in light (N)

Asked for on 2026-10-03, when D was chosen for the site: "vamos usar o layout D, Ledger2, e dele queremos a
sua versão light".

| | Look | For / optimizes / sacrifices | What it changes |
|---|---|---|---|
| [N · Ledger² Light](prototype-n/index.html) | D's trading desk with the lights on: pale slate floor, white panels with a soft lift, the same Barlow Condensed + Inter, the same 10px corners | For the same reader as D, in daylight. Optimizes for the switch reading as one site inverted. Sacrifices contrast headroom: blue and crust amber had to darken to stay legible on white. | Nothing in structure or content. A light token set over `shared/ledger.css`, pastel market tokens per category, and a theme switch in the header; dark is D's own values |

N has no templates of its own: markup is D's, blocks come from `shared/ledger.js`. Its dark side is
`shared/ledger.css`'s defaults, which reproduce D closely but not to the pixel (a few hard-coded tints in D
became variables there).

## The mascot

It does not follow the cursor freely. Elements declare perches with `data-perch`, and the mascot hops to the
perch nearest to where the pointer has settled, after a short dwell. It stays on its perch while the page
scrolls and looks for another when that one leaves the screen. Poses change with context (`data-mood` on an
element, pointer speed, idle time). The full attribute list is at the top of `shared/mascot.js`.

## Status

On 2026-10-03 Lucas chose **D · Ledger²** for the site, with **N** as its light theme. This replaces the
2026-10-02 approval of C ("Tape"), which is what the app still shows. Lucas approved N the same week, and on
2026-10-05 [`docs/product/DESIGN-DIRECTION.md`](../docs/product/DESIGN-DIRECTION.md) was rewritten for D and N,
with `prototype-n/` as the consolidated folder because it holds both themes. The other directions stay in the
lab.

These prototypes were built before the product was redefined as a pot market and before BP v0.0.2 existed: they
come from the earlier program, the reference page and `knowledge-base/briefing-ideacao-nome-e-mascote.md`. The
visual language stands; several screens show the old model (YES price, buy and sell, redemption).
`DESIGN-DIRECTION.md` lists each conflict and `docs/product/PRODUCT-BRIEF.md` says what replaces it.
