# Sprint 09 — Site: shell, theme and wallet

**Status:** planned · **Branch:** `sprint-09-site-shell` · **Dates:** none, by the founder's decision

| | |
|---|---|
| Technical Plan block | B8 (TP §3.6, with its headers and MWA rules; §8.1 for the landing's data; §12 for the unit) |
| Depends on | Sprints 05, 08 and -1; Sprint 06 for the tunnel, the per-unit identities and the deploy script |
| Requirements covered | BR-27 (copy base and devnet notice), BR-28 (wallet only; the country switch is read), BR-47 (notices); D-q (no AI) |

## Goal

The new site, in Ledger², stands on the server: the shell, the light and dark themes, a wallet connected through
explicit Mobile Wallet Adapter registration, and the wiring to `/api/v1`, `/rpc` and the SDK. The chat route inherited
from upstream leaves. There is no campaign screen yet.

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
