# Sprint 08 — legal and privacy review of `/api/v1/price`, `/api/v1/names` and `brot-rpc`

**Version:** 0.0.1 · **Date:** 2026-10-11 · **Status:** draft. A lawyer must review it before production (L0). Not a
legal opinion.

> **What happened next (added when the sprint applied it, 2026-10-11).** P1/F1 applied: CoinGecko is off by default
> (`API_COINGECKO`, `.env.example`), so `/api/v1/price` serves Pyth SOL/USD. F3 applied: no price older than a day is
> served; the answer carries `attribution_url`. F4 applied (the keyless API's wording). R1/F5 applied: the relay sweeps
> idle buckets every ten seconds, with a test. P2/F2 applied to the plan, the roadmap and the Sprint 08 doc. The policy
> blocks of (c) stay here, unpublished, for the day the site moves to the relay. The founder's decisions in (d) and the
> questions for the lawyer stand.

> **Disclaimer.** I am not a lawyer. This is a safe first draft, built from public standards, the third parties' own
> published terms and the project's documents. Before real money, sensitive data or critical jurisdictions (health,
> fintech, minors), have a lawyer review it. That costs less than a lawsuit.
> (Original: "Eu não sou advogado. O material gerado aqui é um rascunho seguro de partida baseado em padrões públicos.
> Antes de lançar com pagamentos reais, dados sensíveis ou em jurisdições críticas (saúde, fintech, menores), peça pra
> um advogado revisar. O custo é menor que um processo.")

## Scope and method

- **Branch** `sprint-08-price-names-relay`, commits `2dbd45c` (names and price), `4a74d61` (relay) and `1a82ad2` (the
  relay's cache narrowed to other programs' accounts and sysvars). `1a82ad2` landed while I was reading, from another
  session, together with an untracked `session-log/2026-10-11-sprint-08-nomes-preco-e-relay.md`. It changes no finding.
- **Code read:** `services/api/src/{price,price-sources,names,routes,config,main}.ts`, `services/api/README.md` and
  `.env.example`; `services/rpc/src/*.ts`, `services/rpc/README.md` and `.env.example`; `deploy/vps/brot-rpc.service`;
  `packages/sdk/src/schemas/account-names.ts`; `content/account-names.json` (`[]`) and `content/README.md`;
  `services/landing/lib/rate-limit.mjs` and `server.mjs` (the limiter's sweep, for comparison); the site's price and
  names code under `app/features/open-campaign/`; `app/lib/api-client.ts` (the site reads the API from the browser).
- **Documents read:** `CLAUDE.md`; `.claude/rules/privacy-audit.md`; `docs/legal/PRIVACY-POLICY.md` in full (and
  `services/landing/public/privacy.html`, built from it, same text); TP §3.5, §6, §7.2–§7.5, §8, §8.1–§8.3, §12, §14.4;
  `docs/technical/relay-allowlist.md`; `docs/sprints/sprint-08-indexer-api-points.md`; the Sprint 19 legal review.
- **Third-party documents fetched on 2026-10-11** and read as text: CoinGecko's API Terms ("Latest Version: 5 Sept
  2025"), its pricing page, its keyless-API page, its attribution guide and its data-licence page; Pyth's Price Feeds
  and Sponsored Feeds disclaimers and its website Terms of Use. Clause numbers are rebuilt from the page's nested lists.
- **Law texts read on 2026-10-11:** LGPD (Lei 13.709/2018) arts. 5 I, 7 V and IX, 7 §3–§4, 10, 33, 39; Marco Civil
  (Lei 12.965/2014) arts. 5 VIII, 11, 15 (planalto.gov.br); GDPR Recital 49 (gdpr-info.eu). Breyer and the ANPD's
  2024 transfer rule come from secondary sources only.
- **Live pages, 2026-10-11:** `brot.markets/privacy` serves "Last updated: 8 October 2026" (no leaderboard section);
  `brot.markets/terms` answers 200 with the USDC text ("USDC" 7 times, "Payouts are automatic"); `/rpc` and
  `/api/v1/*` answer 404 on brot.markets.
- I ran no test, made no call to CoinGecko's API and changed no file in the repository.
- **Tags:** **[F]** a fact, with its source. **[INF]** my inference. **[AC]** to confirm. **[L0]** for the lawyer.

## Summary

**In plain words.** The two new routes are clean on privacy. The relay is too, with one fix: it forgets visitors' IP
addresses only after a thousand requests have passed. The real problem is CoinGecko. Its terms bar using the API "for
or to promote gambling". They also require Brot to have binding user terms, and those are offline until Sprint 17.
They forbid passing access to its data on to others, which a public JSON endpoint comes close to. And its free tiers
are meant for testing, not for a public site that polls every three minutes. Pyth has none of these problems, and the
program already charges at Pyth's price. So on devnet, show Pyth's price, and switch CoinGecko off by default before
the API is next deployed.

1. **CoinGecko verdict (a):** do not run `/api/v1/price` in public with CoinGecko, on any plan, today. Run it on Pyth
   SOL/USD only (`API_COINGECKO=off`). Four reasons:
   - §7.1 needs a binding user agreement with CoinGecko clauses, and Brot has none live.
   - §4.1.7.2 bars gambling uses.
   - §4.1.6 bars redistributing access.
   - The keyless API is "not suitable for production workloads, scheduled polling", and the Demo plan is for "testing
     and exploration", capped at 10,000 calls a month. The code's 3-minute refresh makes 14,400 to 14,880.
2. **MUST before this branch merges, or at the latest before the API is redeployed from it:** make CoinGecko off by
   default. `config.ts:61` defaults to on and `.env.example:28` says `on`, against the file's own comment ("off while
   its terms are checked", `config.ts:28`). A redeploy with an env file that lacks the variable would run CoinGecko's
   keyless API in public.
3. **Privacy (b):**
   - `/api/v1/price`: PASS.
   - `/api/v1/names`: PASS. The "never a person" rule stays a reviewer's check; the code cannot see a person's name.
   - `brot-rpc`: PASS WITH CONDITIONS before the site points at `/rpc`. R1 adds a timed sweep of the limiter; R2 to R5
     are the policy, the provider's terms, the docs and the country list.
4. **Policy (c):**
   - No change for this branch.
   - Three paragraphs and the date change on the day the site moves to the relay, published before the switch, with
     the provider named and the post on X.
   - Still open from answer 9a/2a: the 10 October text is not live.

---

## (a) CoinGecko: the verdict and what to change

### What CoinGecko's documents say [F]

API Terms, https://www.coingecko.com/en/api_terms, "Latest Version: 5 Sept 2025", read 2026-10-11:

| Clause | Text |
|---|---|
| §3.1 | A licence "to use the CoinGecko API to develop, test, and support any software application, mobile application, website, platform, service or product, as well as to integrate or incorporate the CoinGecko API with your Application". It is "subject to the limitations set forth in Section 4 and Section 9", and "violation of Section 4 will automatically terminate the license" |
| §4.1.1 | Scope "will be dependent on the usage plan that you select" (the pricing page). "Regardless of the usage plan that you select, you will still need to comply with the provisions of this API Terms at all times" |
| §4.1.6 | "You are entitled to charge for your services and products that incorporate or integrates our CoinGecko API. However, you are not permitted to sell, rent, lease, sub-license, re-distribute or syndicate access to the CoinGecko API or part thereof (unless pursuant to the terms of an Executed Agreement that you enter into with CoinGecko)." |
| §4.1.7.2 | You may not "use the CoinGecko API for or to promote gambling (whether the CoinGecko API is integrated with or incorporated as part of your Products), or place any advertisements around any of your Products integrating or incorporating the CoinGecko API that constitutes adult/sexual content or offers online gambling" |
| §4.2(i) | "You agree not to exceed or circumvent (or make any attempts thereto) the aforesaid rate limitation, limitations on the calls (such as monthly call limits as may be indicated)" |
| §4.3 | Attribution "by displaying prominently the message “Powered by CoinGecko” in a legible font (an example of a legible font type being “Arial”) no smaller than font size 10". Further guidelines are in the attribution guide |
| §4.4 | No use of the brand that suggests your product "is endorsed, sponsored by or howsoever associated with CoinGecko" |
| §6.1, §6.1.1 | "We do not encourage caching or storage of Data. However, if you must cache or store Data: You should refresh the cache at least every 24 hours" |
| §6.2 | "Except as expressly permitted hereunder this API Terms, you are not allowed to duplicate, reproduce, copy, store, derive from or translate any Data … or any information expressed by the Data" |
| §7.1 | If your products "are offered for use to others outside your entity", you must have "a binding user agreement and privacy policy". At least: (a) they name the API as CoinGecko's property; (b) users are bound "no less protective of CoinGecko than" these terms; (c) all CoinGecko liability is excluded; (d) you assume "full responsibility"; (e) the privacy policy is "in no event to be less stringent than" CoinGecko's; (f) you give the warnings about the data's accuracy and "the inherent volatility and risks associated with cryptocurrency markets" |
| §10.3 | CoinGecko "may also in our discretion restrict your access … if in our sole discretion, we determine that your access to or use of our CoinGecko API may howsoever negatively impact on our Products or Services" |
| §11.2 | You warrant you are not sanctioned "nor ordinarily resident nor domiciled in any of the countries" on its Excluded Countries list |
| §13.1 | Singapore law; "the exclusive jurisdiction of the Courts of Singapore" |

The other CoinGecko pages, all read 2026-10-11:

| Page | Text |
|---|---|
| Pricing, https://www.coingecko.com/en/api/pricing | Demo: "$0 /month", "Attribution required", "10k" call credits a month, "100" calls a minute, freshness "from 60 sec". Licence row: "Commercial" for Basic, Analyst, Lite and Pro; "Custom" for Enterprise, whose list includes "Commercial redistribution license". FAQ: "The Demo Plan is a free plan to try out the CoinGecko API. It’s good for testing and exploration". "Paid plans start at $35/mo". "1 call = 1 credit". "Commercial use for Basic, Analyst, Lite and Pro plan: Your product shall prominently display the message 'Data provided by CoinGecko' and include a hyperlink to https://www.coingecko.com/en/api". "If your product or service requires a custom license (such as but not limited to redistribution of data and white labeling) … please consider subscribing to an Enterprise plan". The page also calls Basic "For personal use cases" while its licence row says "Commercial": an inconsistency |
| Keyless API, https://docs.coingecko.com/docs/keyless-public-api | "Useful for quick prototyping, open-source projects, and educational use." "All keyless requests share an IP-based rate pool: CoinGecko endpoints: ~10–30 calls/min". "The keyless API is not suitable for production workloads, scheduled polling, or high-frequency updates." |
| Attribution guide, https://brand.coingecko.com/resources/attribution-guide ("Last updated 11 months ago") | Text attributions, each linked: "Data provided by CoinGecko", "Price data by CoinGecko", "Source: CoinGecko" (to coingecko.com), "Powered by CoinGecko API" (to /en/api/). "Ensure that the attribution is placed in a visible location, close to where the data is displayed, i.e. above or below the data set." "Do not attribute us to the wrong data source." No claims like "We partner with CoinGecko" |
| Data licence, https://www.coingecko.com/en/api/enterprise/data-license | Enterprise licences, among them a "Data Reseller License": "Enable your customers to connect to CoinGecko API endpoints directly within your product environment", for "API/Data Routing Platform", "Aggregators" |
| Excluded Countries | **Not read:** the link redirects to support.coingecko.com, which answered 403 |

And the facts about our code:

- `/api/v1/price` will be public. The site reads the read API from the browser (`app/lib/api-client.ts:148`,
  `NEXT_PUBLIC_API_URL`), and the tunnel is to route `/api/v1` from the main host (TP §12). The route answers with
  `access-control-allow-origin: *` by default (`.env.example:12`, `routes.ts:39`), takes no key and is documented in
  `services/api/README.md`.
- It polls CoinGecko every 180 s by default (`config.ts:60`; `.env.example:25`).
- When both sources fail it keeps serving the last good price, marked `stale`, with no age limit (`price.ts:61`).
- The `attribution` field says "Powered by CoinGecko" only when the source is CoinGecko (`price.ts:77`).

**Pyth [F].** Its Price Feeds disclaimer (8 May 2025) and Sponsored Feeds disclaimer (23 May 2025) are no-warranty,
no-liability texts. Users "acknowledge and accept all risks". I found no attribution requirement and no limit on
showing or re-serving the price in either. The website Terms of Use (7 Aug 2025) restrict price data "contained in the
Site" (§1) and extraction "from the Site" by scraping (§7), meaning pyth.network itself, not Solana accounts. Pyth's
site also markets its feeds to prediction markets (https://www.pyth.network/prediction-markets, "Prices for Markets
Built on Outcomes").

### What it means for `/api/v1/price` [INF]

1. **Showing the price on Brot's own pages is the licensed use.** Brot's server fetches it and the page displays it
   with attribution, which is "integrate or incorporate … with your Application" (§3.1). CoinGecko's own FAQ even
   tells developers to keep the key "in your own backend and use a proxy".
2. **A public JSON endpoint is close to redistribution.** Anyone, from any site's browser (CORS `*`) or with curl, can
   take CoinGecko's price from it. That is near "re-distribute or syndicate access to the CoinGecko API or part
   thereof" (§4.1.6), and CoinGecko sells the right to let customers "connect to CoinGecko API endpoints" as an
   Enterprise "Data Reseller License". One number refreshed every few minutes is a small "part", but the clause has
   no small-use exception, and §10.3 lets CoinGecko cut access at its discretion. Moderate risk. CORS limited to the
   site's origin narrows it; curl and servers still get through.
3. **The gambling clause is the largest risk, and no plan removes it.** CoinGecko's terms do not define "gambling".
   Brot's mechanics are close to what many laws and companies call a pool wager: SOL in on YES or NO, the winning side
   splits the pot, Brot keeps a fee. The project's vocabulary rule ("never market or bet") does not change how a
   counterparty reads its own terms. On devnet, test SOL has no value, which weakens that reading today. But the clause
   also covers "promote", and the site's waitlist exists to announce the real-money opening (policy §2). Whether
   campaigns are gambling where Brot operates is a question for L0 (C-15). Under these terms a violation of §4 ends
   the licence "automatically" (§3.1).
4. **§7.1 cannot be met today, on any plan.** The live `/terms` describes the earlier USDC product and carries no
   CoinGecko clauses. Answer 9a takes it down until Sprint 17. A public product using the API without that agreement
   breaches §7.1.
5. **Keyless is out, and Demo is a stretch.**
   - Keyless: CoinGecko's own docs rule out "production workloads, scheduled polling", which is exactly this use. On a
     shared VPS, the IP-based pool is also shared with any neighbour that calls CoinGecko.
   - Demo: "testing and exploration", with no "Commercial" licence. The 3-minute default makes 480 calls a day, so
     14,400 in a 30-day month and 14,880 in a 31-day month, over the 10,000 cap (§4.2(i)). Staying under it in any
     month needs at least 268 s between calls; 300 s gives 8,928, with room for restarts, each of which makes one
     immediate call.
   - A public beta used by strangers is more than testing, and devnet shows no revenue yet. Gray either way.
6. **Caching fits §6.1, with one edge.** One price held in memory and refreshed every few minutes fits "refresh the
   cache at least every 24 hours". The edge: when both sources fail, `price.ts:61` would keep serving a CoinGecko price
   older than 24 h. Storing CoinGecko prices for later is "store" under §6.2 and not "expressly permitted"; that
   covers the history tables, and Sprint 18's monthly reports at "that day's CoinGecko price" (BR-43). Logging only
   the gap between the two sources is a derived number, a negligible risk.
7. **The attribution the code uses matches the binding text.** "Powered by CoinGecko" is §4.3's exact message, and §4.3
   binds on every plan. The plan's "Data provided by CoinGecko" (TP §3.5, line 1274) is the paid plans' FAQ wording,
   and the guide lists it too. TP §3.5's "If the plan bought under D4 requires attribution" is wrong: every plan does,
   keyless and Demo included.
8. **Pyth only clears every point above.** I found no licence or attribution obstacle, the price is the one the
   program charges at, and nothing new is bought. "Not found" is not "permitted"; L0 confirms. Pyth's disclaimers put
   the risk of a wrong price on Brot, so Brot's own terms (Sprint 17) should pass that on to users.

### Verdict

- **Devnet, now:** `/api/v1/price` on Pyth SOL/USD only. This is the safest workable setup.
- **CoinGecko later, at the minimum:**
  - a paid "Commercial" plan;
  - the price shown only on Brot's pages, not offered as a public API;
  - Brot's terms live with §7.1's clauses;
  - a written answer from CoinGecko on §4.1.7.2.
- **A public JSON endpoint of CoinGecko's price** needs an Executed Agreement (Enterprise, reseller-type).

### What to change before `/api/v1/price` runs in public

- **P1 (MUST, before merge or the next API redeploy):** CoinGecko off by default.
  - `config.ts:61`: change `onOff(env.API_COINGECKO, true, …)` to `false`.
  - `.env.example:28`: `API_COINGECKO=off`, with the comment "off until the founder's decision on CoinGecko's terms".
  - At the least, put `API_COINGECKO=off` in the server's env file before any redeploy.
- **P2:** update the README's "CoinGecko first" (lines 47–54) and TP §6's `/price` row to "Pyth SOL/USD on devnet;
  CoinGecko off (legal review 2026-10-11)".
- **P3: the site's source line.** Where the US$ figure shows, write `Price: Pyth Network SOL/USD, published <time>`,
  close to the creation box's own "at Pyth SOL/USD … published …" (`copy-money.ts:14`). Never show "Powered by
  CoinGecko" next to a Pyth price: the guide says "Do not attribute us to the wrong data source", and the code already
  handles this.
- **P4:** if CoinGecko is ever switched on, all of the following:
  - a plan that permits the use;
  - `API_PRICE_REFRESH_MS` within the plan's monthly credits (≥ 300000 on Demo, with one key used only by the server);
  - CORS limited to the site's origin;
  - no CoinGecko price served past 24 h (`price.ts:61`): answer 503 or fall back to Pyth;
  - no CoinGecko price stored beyond that in-memory value;
  - the §7.1 clauses in the terms;
  - the Excluded Countries list read (§11.2);
  - the attribution below.

### Attribution wording, if CoinGecko's price is ever shown

- **On any plan, at the minimum (§4.3):** directly above or below the US$ figure, on every page, card or image that
  shows a CoinGecko value:

  `Powered by CoinGecko`

  with "CoinGecko" linked to https://www.coingecko.com/en/api, in the site's sans-serif at no less than 10 pt. On
  screen, use at least 14 px, which meets "font size 10" whether the unit is read as points or pixels. Do not make it
  smaller or lighter than the figure's own caption.
- **On a paid plan (Basic to Pro), the same line becomes:**

  `Data provided by CoinGecko · Powered by CoinGecko`

  both linked to https://www.coingecko.com/en/api. The FAQ's text and §4.3's text both bind there, until CoinGecko
  confirms in writing that one is enough.
- **Never:** "in partnership with CoinGecko", "official data partner", or a CoinGecko logo that is not the Brand Kit
  file, unmodified (§4.4; the guide).
- **In the API:** add an `attribution_url` field next to `attribution`, so every client renders the same link. TP §6
  allows changes "only by adding fields".
- **A terms clause for §7.1, a draft for Sprint 17 and L0:** "Prices from others. Some US$ figures on Brot Markets come
  from CoinGecko's API, which belongs to CoinGecko (Gecko Labs Pte. Ltd.), or from Pyth Network. They are for
  information only, can be late or wrong, and are not advice; crypto prices move fast and can fall to nothing.
  CoinGecko and Pyth are not responsible for them or for anything you decide with them; Brot is responsible for how it
  shows them. You may not copy, store or re-serve these figures from our site or our API."

---

## (b) The nine privacy questions

### `brot-rpc`, the relay (not live; the site still calls `api.devnet.solana.com`)

| # | Question | Answer | Verdict |
|---|---|---|---|
| 1 | What personal data | **The visitor's IP address**, from Cloudflare's `cf-connecting-ip`: IPv4 whole, IPv6 cut to its /64 prefix, as the rate limiter's key (`limits.ts:12-29`, `relay.ts:91`). **The country code**, from `CF-IPCountry`, read only for a transaction that joins or opens (`relay.ts:87-89`). **What each call carries**: the connected wallet's address (balance; the wallet's own signatures and transactions; its `Entry`); the transactions it simulates and sends; the accounts checked in the creation box (relay-allowlist rows). IP and wallet sit together in memory for the length of a request. No cookie, no session, no user agent | PASS |
| 2 | Why, and on what basis | The IP shares the paid capacity fairly and stops one machine from exhausting it. Legitimate interest is the working reading: LGPD art. 7 IX, with art. 10 §1 (only "estritamente necessários" data) and §2 (transparency); GDPR Recital 49 names "stopping ‘denial of service’ attacks"; per secondary sources, Breyer (C-582/14) held that keeping a public website working can be a legitimate interest. The country serves the K-11 gate; the list is empty, so it has no effect today. The wallet data is what the visitor's own page asks the chain for: steps at the user's request (art. 7 V) or legitimate interest. All of it [L0] | PASS (basis to confirm) |
| 3 | Where | The relay's memory on the VPS (Hostinger, United States): the bucket map (key, tokens, time), the request in flight, and a 1.5 s cache of other programs' accounts and sysvars. The cache is keyed by method and parameters, never by IP (`relay.ts:93`, `accounts.ts`). Nothing on disk (`brot-rpc.service`: `ProtectSystem=strict`, `UMask=0077`). The upstream provider (D4, not chosen) gets each call from the server's address: only `content-type` is sent (`rpc/src/main.ts:19-27`), no forwarded header. Cloudflare carries every `/rpc` request through the tunnel, IP and body together | PASS |
| 4 | Who can access | The `brot-rpc` process. Whoever administers the server could read its memory (Lucas and Ronaldo, §8.1). The provider sees the calls' content without the IP. Cloudflare sees both. `/healthz` shows counts only (budget, cache size, number of clients) | PASS |
| 5 | How access is controlled | Loopback bind (`config.ts`), reached only through the tunnel; the systemd sandbox; no admin route; same-origin by default (no CORS); refusals with no upstream detail; method and argument allowlist (`simulateTransaction`'s `accounts` option refused); other owners' accounts cut to owner and size | PASS |
| 6 | Retention | **The bucket**: dropped only when a prune runs, and a prune runs only on every 1,000th call (`limits.ts:45`). In a quiet hour an IP can stay in memory for hours, until the 1,000th call or a restart. The landing fixed the same issue with a sweep every 10 s (`server.mjs:167`; TP §8.1 row 7). **The cache**: 1.5 s, though an expired entry stays in the map until read again or the map fills; no IP in it. **The country**: the request only. **The provider**: its own rules (unknown). **Cloudflare**: basic logs up to 7 days (C13) | **CONDITION R1** |
| 7 | Logs | One line a minute: counts by outcome, budget left; a start line with the size of the country list (`rpc/src/main.ts:44-50`). Never an IP, a header, a parameter or the upstream URL. Cloudflare logs under its account (7 days) | PASS |
| 8 | Deletion and export | Nothing kept to delete or export; a restart clears memory. Whatever the provider logs falls under its terms, to read before choosing it (R3) | PASS |
| 9 | Document or consent | The policy must change **before** the site is pointed at `/rpc` (policy §8): a new use of the IP, the country check, and who sees the wallet data (the provider without the IP, Cloudflare with it), with the provider named. No consent needed for rate limiting [L0]. C-14 (Marco Civil art. 15) stays with L0 | **CONDITION R2** |

**Conditions before the site is pointed at `/rpc`:**

- **R1 (code):** a timer in the relay, as the landing has, every 10 s drops each bucket idle for 50 s or more and each
  full one. With it the policy can say "about a minute after your last request". Add a test. Sweep expired cache
  entries on the same timer (optional; no IP in them).
- **R2 (policy):** the text of (c), published before the switch with the provider named, a new date and the post on X.
- **R3 (D4):** before choosing the relay's provider, read its privacy policy and data terms. Where it processes, what
  it logs about requests (our server is the caller), for how long, and whether it uses request data for its own
  purposes. If it does, it is a controller of that data, not Brot's processor (LGPD art. 39), and the policy must say
  so.
- **R4 (docs):** record these answers as TP §8.4. At the switch, rewrite §8.2's "Browser RPC calls go to the RPC
  provider directly, not through Cloudflare" (TP line 2166).
- **R5 (country):** keep `GEO_BLOCK_COUNTRIES` empty until the founder (K-11), L0 (C-11) and the C9 check. The policy
  and the terms change before the first country.

Done right **[F]**: no visitor header sent upstream; counts-only logs; IPv6 cut to /64; no CORS by default; a typo in
the country list stops the start instead of blocking someone silently; no batches; unrelated owners' account data
withheld. **[INF]** Overall the relay is a privacy gain. Today the public devnet RPC, whose operator and logs were never
verified, sees IP and wallet together. After the switch the paid provider sees the wallet without the IP, and only
Brot's relay (memory) and Cloudflare (already Brot's processor) see both.

### `/api/v1/price`

| # | Question | Answer | Verdict |
|---|---|---|---|
| 1 | What personal data | None of the visitor's. No parameters (a query is a 400, `routes.ts:111`), no wallet, no header read. The request's IP reaches Cloudflare and the API's HTTP layer, as every request does, and is not used. CoinGecko and the RPC receive only the server's own calls (the server's IP; a key in a header, never in the URL) | PASS |
| 2 | Why | Display only; the answer says so (`use`) | PASS |
| 3 | Where | One price in the API's memory | PASS |
| 4 | Who can access | Anyone (public data) | PASS |
| 5 | Control | Read-only, GET only, errors without detail | PASS |
| 6 | Retention | The last price, until the next refresh (no limit when both sources fail: a licence point in (a), not a privacy one) | PASS |
| 7 | Logs | `price` lines: source, an error's name, the gap (`api/src/main.ts:96-108`). No personal data | PASS |
| 8 | Deletion and export | Nothing personal | PASS |
| 9 | Document or consent | No policy change. CoinGecko is not a helper that touches visitors' data | PASS |

### `/api/v1/names`

| # | Question | Answer | Verdict |
|---|---|---|---|
| 1 | What personal data | Today none: the file is `[]`. A name labels a mint, a DAMM v2 pool, a stake pool or a vote account. The schema refuses emails, handles, URLs and domains (`account-names.ts:38`, `personalDataIn`), but it cannot recognise a person's name, so "never a person" (`content/README.md`, step 2) rests on the two reviewers. A vote account can belong to a natural person, a solo validator whose public name is their own. Naming it would publish a link between a public key and an identified person. The feed list (Pyth ids, symbols, accounts) holds none | PASS |
| 2 | Why | To help a creator find an account (A-11); not a gate (D-i) | PASS |
| 3 | Where | Git, and the API's memory | PASS |
| 4 | Who can access | Anyone | PASS |
| 5 | Control | Two-person review (a team rule, no CODEOWNERS until Sprint 16); the schema | PASS |
| 6 | Retention | Git history keeps every name for good, which is why a person's name must never enter | PASS (rule) |
| 7 | Logs | The API logs only a broken file's error name | PASS |
| 8 | Deletion and export | A name can be removed by a PR, but it stays in Git history | PASS (rule) |
| 9 | Document or consent | No policy change while no person is named. If one ever is: LGPD art. 7 §3 (public data, used for "a finalidade, a boa-fé e o interesse público" of its publication) and §4 (the subject's rights remain), a removal route, and policy text. Add to `content/README.md` step 3: "the reviewer confirms the name is a project's or an organization's; a validator named after a person stays unnamed". Sprint 19's L0 question 6 stands | PASS |

---

## (c) Privacy-policy changes, and when

### When

| Moment | What changes | Why |
|---|---|---|
| **Now, for this branch** | Nothing in the privacy policy | `/names` and `/price` take nothing from visitors. Even with CoinGecko on, CoinGecko receives only the server's call |
| **Still open from answers 9a and 2a** | The 10 October text goes live; `/terms` comes down | Checked 2026-10-11: the live page says "Last updated: 8 October 2026", and `/terms` still serves the USDC text. This already blocks `/abrir` and the leaderboard from going public (TP §8.2, §8.3). Every block below assumes it. Do **not** bundle the relay's text into that deploy: the relay is not live, so the text would be false |
| **The day the site is pointed at `/rpc`, before the switch** | Blocks 1 to 5 below, and the post on X | Policy §8: the relay is a new use of the IP and changes who sees what. Published weeks early, the RPC paragraph would be false while the site still calls the public RPC. If it must go out a few days early, keep the old RPC paragraph, starting "Until [DATE],", and the new one starting "From [DATE],", and drop the old one at the next update |
| **Before a country is added to the list** | The country bullet (which countries, what is refused) and a terms line | K-11, C-11 |
| **Before the relay's provider changes** | Its name, country and link | The policy names every helper |
| **If L0 says Marco Civil art. 15 applies** (C-14) | The IP bullet (six months of access logs) | Before any such log is kept |
| **Before CoinGecko runs in public, if ever** | No privacy text; the terms with §7.1's clauses | CoinGecko's §7.1 |

### The exact text (`docs/legal/PRIVACY-POLICY.md`; rebuild `privacy.html` with `build-legal.mjs`)

**Block 1, the date (line 3).**

```markdown
**Brot Markets** · Last updated: [DAY MONTH 2026, the day this text goes live]
```

**Block 2, "Every visit" (lines 71–78): the crumb and the first bullet replaced, a country bullet added, "Our logs"
kept.**

```markdown
### Every visit

> **The crumb:** we look at your address for a minute to stop spam and keep things fair, then we forget it.

- **Your IP address** reaches our server because that's how the internet works. Two things use it, only in memory and
  on our legitimate interest in keeping the site working for everyone: the waitlist forms, for about one minute, to
  stop one machine from spamming them; and our Solana relay (section 3), for about a minute after your last request,
  so one machine can't use up what everyone shares. For an IPv6 address, the relay keeps only its first half. We don't
  write your IP address to disk or to our logs.
- **Your country.** Cloudflare tells our server which country your IP address appears to be in. When you join or open
  a campaign, the relay checks that country against a list of countries where joining and opening are not offered.
  Today the list is empty, so no one is turned away. The country isn't kept. Before we add a country to the list,
  this page will say so, with a post on X.
- **Our logs** record counts and errors ("an email was added, total N"), never your email, your wallet or your IP.
```

**Block 3, Cloudflare (lines 103–106).**

```markdown
- **Cloudflare** carries every request to our server, including the campaign site's requests to Solana through our
  relay. Like any network provider, it sees your IP address, the page you ask for, what you type into our forms and
  what the site asks Solana for you (your wallet's balance and entries, the transactions you sign), under its own
  [privacy policy](https://www.cloudflare.com/privacypolicy/). It keeps basic logs of these requests for up to 7 days.
  Cloudflare also tries to add its own visitor statistics to our pages; our site's security settings block that
  script, so nothing is measured.
```

**Block 4, the RPC service (lines 112–116), replaced.**

```markdown
- **Our Solana relay, and [PROVIDER] behind it.** From [DATE OF THE SWITCH], the campaign site reads Solana and sends
  your transactions through our relay, at brot.markets/rpc. The relay passes each request on to [PROVIDER], an RPC
  service we pay for, in [COUNTRY]. [PROVIDER] sees what the page asks about your wallet: your balance and your
  entries; a transaction you are about to sign, which the page tests first, and its progress after you sign; and,
  before you pay to open a campaign, your wallet's recent transactions. It sees the accounts you check when you open a
  campaign too. The requests reach it from our server, so it doesn't see your IP address. It handles them under its
  [privacy policy]([LINK]). Our relay keeps none of these requests: it holds a few public answers from Solana for a
  second or two, so visitors can share them, never with your IP address, and its logs only count requests. Your
  wallet app may also send your transactions through its own RPC service, under its own rules.
```

If any read still goes to `api.devnet.solana.com` after the switch (TP §7.2: A-8's ProgramData read was left on the
public RPC "until the relay"), add: "One check, of the program's own version, still goes to Solana's public RPC
service, api.devnet.solana.com, which sees your IP address but not your wallet."

**Block 5, transfers (lines 123–125).**

```markdown
Our server and X are in the United States, [PROVIDER] is in [COUNTRY], and Cloudflare's network is worldwide, so your
data leaves your country.
```

**The post on X (policy §8), a suggestion:**

```text
Our privacy page changed today: the campaign site now reaches Solana through our own relay. The RPC service behind it
no longer sees your IP address; our relay uses it for about a minute to keep things fair and keeps nothing.
brot.markets/privacy
```

The 30-second summary, sections 4 to 8 and the waitlist's purpose sentence stay as they are.

---

## (d) What the founder must decide

1. **The display price on devnet.**
   - (a) Pyth SOL/USD only: `API_COINGECKO=off`, with off as the default.
   - (b) CoinGecko's free Demo plan.
   - (c) A paid CoinGecko plan, from US$35 a month.

   **Recommendation: (a).** It is the price the program charges at, it costs nothing, and CoinGecko's terms cannot be
   met today on any plan (§7.1, and the gambling clause).
2. **CoinGecko's place in the plan** (D-e, D4; Sprint 18's reports in US$).
   - (a) Write to CoinGecko support now with two questions: whether a YES/NO campaign platform is "gambling" under
     §4.1.7.2, and whether its pages may show the price through their own API.
   - (b) Drop CoinGecko: Pyth for display and reports, recorded as replacing D-e.
   - (c) Leave it open until Sprint 18.

   **Recommendation: (a), then (b)** if the answer is no or never comes. One ticket settles it before anything is
   bought. Whether reports for accounts need a recognised reference rate is for the accountant and L0.
3. **When the site moves to the relay.**
   - (a) Once the relay is installed and R1 is done, publish the policy text the same day.
   - (b) Stay on the public devnet RPC until Sprint 09.

   **Recommendation: (a).** The provider stops seeing visitors' IPs, and the public RPC is "not intended for
   production" [E43]. This depends on choosing the relay's provider (D4), whose name goes in the text.
4. **The country list** stays empty (decided 2026-10-11).
   - (a) Empty until mainnet, when L0 names the countries.
   - (b) Fill it on devnet.

   **Recommendation: (a).** Test SOL has no value, and filling the list needs the C9 check, L0 and new terms and policy
   text first.
5. **US$ next to test SOL** (Sprint 10's cards, which plan "the US$ display value" of the pot).
   - (a) On devnet, show US$ only where it sets a cost in test SOL (the opening), as the box already does.
   - (b) Show a pot's US$ value with "test SOL has no value" beside it.
   - (c) As planned.

   **Recommendation: (a).** A US$ value for a test pot contradicts the banner ("test SOL, which has no real value").
6. **Pending, not a decision:** the landing deploy of answers 9a and 2a. The live privacy and terms pages describe the
   earlier product (checked 2026-10-11), and every text in (c) builds on the 10 October one.

## Other findings for the coordinator (docs and code)

- **F1 (MUST):** P1, CoinGecko off by default (`config.ts:61`, `.env.example:28`).
- **F2:** TP §3.5 (lines 1273–1274), the TP D4 row (line 2479), C32 (line 2644), `docs/SPRINTS.md:211` and the Sprint
  08 doc (lines 108–109) say attribution applies only "if the plan requires it" and that the free plan's terms are
  "unclear". Rewrite them with the facts above: attribution on every plan; Demo for "testing and exploration"; keyless
  not for "scheduled polling"; and the §4.1.6, §4.1.7.2 and §7.1 limits. Update [E79] with the terms' version date
  (5 Sept 2025) and the keyless, attribution-guide and data-licence pages.
- **F3:** `price.ts:61` serves the last good price with no age limit when both sources fail. For CoinGecko, cap it at
  24 h (§6.1.1). For Pyth, a cap is a product choice.
- **F4:** `.env.example:30` says the keyless API is "updated about once a minute". CoinGecko's keyless page gives no
  interval; the pricing page gives Demo freshness "from 60 sec" and says endpoints are "cached to around 1 to 5
  minutes".
- **F5:** R1, the relay's limiter (`limits.ts:45`), with a test, as in `services/landing/lib/rate-limit.mjs`.
- **F6 (for the security review, not verified):** the relay passes the upstream's JSON-RPC errors through unchanged
  (`relay.ts:115-117`). Confirm a provider's error cannot carry its key or URL.

## Questions for the lawyer (L0)

1. **The relay's use of IP addresses:** is legitimate interest the basis (LGPD art. 7 IX and art. 10; GDPR Recital 49)?
   Should a written legitimate-interest assessment exist, since the ANPD may ask for an impact report (art. 10 §3)?
2. **Marco Civil art. 15 (C-14):** once a company exists, is Brot an "aplicações de internet" provider "com fins
   econômicos" that must keep IP-and-time access records for six months? That would reverse "never the IP on disk",
   and the policy would change first. Note art. 11: one act in Brazil is enough.
3. **Transfers abroad:** what mechanism of LGPD art. 33 covers the relay's provider, Hostinger (US), Cloudflare and X?
   Per secondary sources, Resolução CD/ANPD nº 19/2024 set standard clauses, to be incorporated by 23 August 2025
   [AC].
4. **The provider's role:** Brot's processor (art. 39), or a controller of the wallet data it receives?
5. **The country gate, when filled:** the basis for reading `CF-IPCountry`, what the terms must say, and whether IP
   geolocation, which a VPN defeats, is a sufficient measure for the rules it serves (C-11, C-15).
6. **CoinGecko:** are campaigns "gambling" in the sense that matters for §4.1.7.2 (C-15; Sprint 19's question 1)? And
   §13.1's Singapore law and courts, if a dispute ever arises.
7. **Names:** Sprint 19's question 6 (a vote account owned by a natural person) stands.

## Not verified here

- CoinGecko's Excluded Countries list (403), its Privacy Policy and its Website Terms (incorporated by reference, not
  read). So I could not check §7.1(e) ("no less stringent than our Privacy Policy").
- The relay provider's terms: no provider is chosen.
- Whether Cloudflare's basic logs hold request bodies.
- Pyth's Hermes and Pyth Pro terms: these routes do not use them.
- Breyer's judgment text and the ANPD resolution's text: secondary sources only.
- No test was run, and no call was made to CoinGecko's API.

## Sources

- CoinGecko API Terms (5 Sept 2025): https://www.coingecko.com/en/api_terms. Pricing:
  https://www.coingecko.com/en/api/pricing. Keyless API: https://docs.coingecko.com/docs/keyless-public-api.
  Attribution guide: https://brand.coingecko.com/resources/attribution-guide. Data licence:
  https://www.coingecko.com/en/api/enterprise/data-license. All read 2026-10-11.
- Pyth: https://www.pyth.network/legal/disclaimer-for-pyth-network-price-feeds (8 May 2025);
  https://www.pyth.network/legal/disclaimer-for-pyth-network-sponsored-feeds (23 May 2025);
  https://www.pyth.network/legal/terms-conditions (7 Aug 2025); https://www.pyth.network/prediction-markets. Read
  2026-10-11.
- LGPD: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm. Marco Civil:
  https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l12965.htm. GDPR Recital 49:
  https://gdpr-info.eu/recitals/no-49/. Read 2026-10-11.
- Breyer, C-582/14, 19 October 2016 (secondary):
  https://twobirds.com/en/insights/2016/global/cjeu-decision-on-dynamic-ip-addresses-touches-fundamental-dp-law-questions,
  https://www.thomashelbing.com/en/wissen/dsgvo-hub/rechtsprechung/1.4.37-eugh-breyer.
- Resolução CD/ANPD nº 19/2024 (secondary):
  https://lefosse.com/noticias/transferencia-internacional-de-dados-prazo-para-adocao-das-clausulas-padrao-da-anpd-se-encerra-em-23-de-agosto/,
  https://www.mattosfilho.com.br/unico/regulamentacao-transferencia-internacional-dados/.

---

> This document was generated by AI from public standards, third parties' published terms and the project's own
> documents. It does not replace a legal opinion. (Esse documento foi gerado por AI a partir de padrões públicos. Não
> substitui parecer jurídico.)
