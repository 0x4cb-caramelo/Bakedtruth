# Campaigns prototype (Sprint -1)

The design of Brot Markets' site for On-Chain Campaigns: every screen and state of the product decided in BP v0.0.4,
in the approved Ledger² language (`docs/product/DESIGN-DIRECTION.md`), dark by default, at desktop and phone widths.
Static HTML, CSS and ES modules over mock data: nothing connects to a wallet, reads the chain or signs.

**Open it** over HTTP (ES modules do not load from `file://`), from `prototype-lab/`:

```bash
python -m http.server 4173 --bind 127.0.0.1
# http://127.0.0.1:4173/campaigns/            the home page
# http://127.0.0.1:4173/campaigns/#/screens   every screen and state, with phone previews
```

**Routes** (English, spec 1.8): `#/` home, `#/campaigns` all campaigns, `#/c/<id>` a campaign, `#/abrir` (or `#/open`)
open a campaign, `#/entries` my entries, `#/leaderboard`, `#/fees`, `#/record` (who can do what, and the voids),
`#/how`, `#/card/<id>` the share card, `#/screens` the review index. The first names (`/all`, `/me`, `/ranking`,
`/powers`) still work.

**Switches in the address bar** (before the `#`): `?wallet=off|connecting|on|nosol|wrongnet`, `android=1`,
`paused=1`, `stale=1`, `geo=1`, `valve=1`, `theme=light|dark`. Example: `?wallet=on&paused=1#/c/8231904417`.

## Decisions it carries (founder, 2026-10-08)

- Dark is the default theme, and the official dark is the one live on brot.markets (prototype N's dark).
- English is the site language. No chance-history chart (L-23, "probably not").
- Everything is SOL: no USDC, no cap, no outcome tokens, no buying or redemption, no sponsor form, no suggestions page.
- The lock notice text is a proposal for the founder (L-03). The partner seal's placement is open (L-24): the
  prototype shows both options on the screens index.

## Structure

| Path | What it holds |
|---|---|
| `index.html` | The frame: status strip, top bar, site notices, `<main id="main">`, footer |
| `css/tokens.css` | Every colour, font and radius, both themes. **No other file has a literal colour** |
| `css/base.css`, `css/components.css`, `css/chrome.css`, `css/mascot.css` | Shared floor, primitives, frame, mascot |
| `css/cards.css`, `campaign.css`, `entry.css`, `open.css`, `pages.css` | One per screen family |
| `js/main.js`, `router.js`, `state.js`, `effects.js` | Boot, hash routes, switches, effects |
| `js/format.js`, `js/model.js` | How numbers and times are written; the pot math of TP §3.4.16 (BigInt) |
| `js/data/` | Mock campaigns (16), the demo wallet's history, the ranking |
| `js/ui/` | `icons`, `layer` (dialog, sheet, menu, toast), `parts` (shared pieces), `notices`, `wallet`, `card` |
| `js/screens/` | One module per route; `review.js` is the screens index |
| `js/mascot/` | Baked, copied from the live site |

## The contract every screen follows

- **A screen module** exports `default (params) => ({ title, html, mount(main) })`. `html` starts with one `<h1>`;
  `mount` wires events and may return a cleanup function. Redraws come from `state.js`'s `set()`.
- **Data:** `byId(id)`, `listed()`, `CAMPAIGNS`, `ENTRIES`, `RECEIPTS`, `RESERVED`, `RANKING` from `js/data/index.js`.
  Campaign fields are the program's (`poolYes`, `poolNo`, `prize`, `feeBps`, `creatorShareBps`, `entriesCloseAt`,
  `deadlineAt`, `status`, `outcome`, `voidReason`…), all amounts in lamports.
- **Numbers and times only through `format.js`** (`sol` up to 4 decimals, `exact` for 9; `usdApprox` for display US$;
  `utc`, `local`, `rel`, `countdown`, `short`, `value`), so every screen writes them the same way. The clock is `NOW`.
  Returns read "est. 2.47 per 1"; chance pairs come from `chancePair` and add up to 100.
- **Money only through `model.js`** (`pot`, `chance`, `estimate`, `settleSplit`, `opening`).
- **Shared pieces from `ui/parts.js`** (kind tile, state chip, seal, split bar, moments, live value vs target, empty
  state) and `ui/notices.js` (`notice(kind, html)`, `TEXT`).
- **CSS:** tokens only; classes prefixed by screen family (`.card-*`, `.cp-*` campaign page, `.en-*` entry, `.op-*`
  opening, `.pg-*` other pages); breakpoints 1100 / 860 / 700 / 412 px; touch targets of at least 44 px on phones;
  no horizontal scroll at 360 px; inline `style` only for computed widths.
- **Words:** campaign, entry, baker, creator, pot, YES/NO, join, open a campaign. Never "market", "bet", "trade",
  "position", "buy" or "redeem" (the brand and the footer's legal line are the only exceptions). Short, dry, factual;
  Baked is grumpy, never salesy.
- **Accessibility:** one `<h1>` per screen, labels on every field, text with every colour (YES/NO, states), live
  estimates in `aria-live="polite"`, dialogs from `ui/layer.js` only, visible focus, `prefers-reduced-motion` honoured.
- **Files** stay under 200 lines and start with a `Purpose:` header, as the rest of the repository.
