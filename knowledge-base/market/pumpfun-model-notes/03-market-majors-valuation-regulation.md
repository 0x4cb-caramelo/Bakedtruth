# Market majors: size, revenue, valuations and regulation (as of 2026-10-07)

Research date: 2026-10-07. Not legal advice; every legal point is a question for counsel.
Labels: **[FACT]** = primary source read this session (regulator, statute, court, company page, or a data platform
queried directly, such as the DefiLlama API); **[SECONDARY FACT]** = press, research firm, aggregator or law-firm note;
**[INFERENCE]** = my own reading or arithmetic, with the inputs shown. "Not found" means I could not verify it.
Limits of this pass: the shared web-search budget ran out partway through (after about 30 searches). docs.polymarket.com
and help.kalshi.com failed DNS on every fetch, so their wording comes from search snippets of those official pages.
legislation.gov.uk returned empty pages. Items that could not be closed are listed under each section's Gaps.
Two measures of volume appear everywhere and must not be mixed. **Face value / notional** counts each contract at $1.
**Dollars actually paid / premium** counts the price paid. DefiRate puts the ratio at about 3.8x across the sector
for Sep 7 to Oct 6, 2026 ($85.7B vs $22.6B).

## 1. Sector volume and growth, and the pitch's "$21.7B in 30 days"

### Takeaway
The sector is now about $22-23B a month in dollars paid and $80-86B a month in face value (30 days to 2026-10-06). That
is roughly 9x year on year. About 70-80% is sports. Crypto is the second-largest category: 14% of notional in July 2026,
and 27% of dollars paid in the latest 30 days. The pitch's "$21.7B in 30 days" is correct as a dollars-paid figure for
Sep 4 to Oct 3, 2026. The latest window reads $22.6B, and the deck should name the measure.

### Cited Findings
- [SECONDARY FACT] DefiRate, 30 days Sep 7 to Oct 6, 2026 (page updated 2026-10-07 09:30 ET): **$85.7B face value; $22.6B
  "dollars actually paid"**. Method, verbatim: "Volume counts contracts traded at their $1 face value, the venues' own
  headline measure; the dollars actually paid are shown beside it." Face value by platform, with share and change vs the
  prior 30 days: Kalshi $66.7B (78%, +58%); Polymarket US $10.2B (12%, +167%); Polymarket (international) $4.7B (5%, −3%);
  Novig $1.7B; Rothera $1.2B; Underdog Exchange $948M; ProphetX $259M. Dollars paid: Kalshi $15.9B, Polymarket US $3.1B,
  Polymarket $2.3B, Rothera $606M, Novig $509M — [DefiRate volume](https://defirate.com/prediction-markets/volume/)
- [SECONDARY FACT] The same page's category split: sports "68% of dollars actually paid ($12.4B)", crypto 27%, finance 2%.
  It also gives face-value sports $30.3B and crypto $10.6B. **These figures do not reconcile**: 68% of $22.6B is $15.4B,
  not $12.4B. Treat the category split as unreliable until it has been read by hand —
  [DefiRate volume](https://defirate.com/prediction-markets/volume/)
- [SECONDARY FACT] Repo's earlier DefiRate read for Sep 4 to Oct 3, 2026: $81.8B face value and $21.7B dollars paid, an
  average of $0.27 per contract. This is the source of the pitch number —
  `knowledge-base/competitors/top-5-competitor-analysis.md` §6.2, citing [DefiRate](https://defirate.com/prediction-markets/volume/)
- [SECONDARY FACT] A DefiRate snapshot (search snippet) gives "$16.3 billion for the 30-day period from August 26 to
  September 24, 2026", Kalshi 85% (~$13.8B), Polymarket US "$16 million". That last figure contradicts every other source
  and looks like a data or snippet error — [DefiRate snapshot](https://defirate.com/prediction-markets/volume/snapshot/2026-09-25T1730/)
- [SECONDARY FACT] Pew Research, published 2026-09-23. Kalshi + Polymarket "notional taker volume", each contract at $1:
  **May 2026 $25.7B; June $47.7B; July $53.0B; August ~$47B**; "early data for September suggests trading volume is
  ticking back up". July 2026 by category: **Kalshi** sports $31,395.7M, crypto $6,101.1M, politics $169.2M, other
  $2,437.1M. **Polymarket** sports $10,618.5M, politics $726.8M, crypto $1,154.1M, other $391.0M. "In June and July,
  coinciding with the FIFA World Cup, sports trading topped $58 billion on Kalshi and neared $22 billion on Polymarket" —
  [Pew Research](https://www.pewresearch.org/short-reads/2026/09/23/prediction-markets-trading-volume-doubled-between-may-and-july-largely-driven-by-sports/)
- [SECONDARY FACT] CoinShares report (July 2026, via Solana Compass/CryptoBriefing): "combined monthly notional volume
  crossed $43.7B in June, up from $4.5B in September 2025" —
  [Solana Compass](https://solanacompass.com/news/prediction-market-monthly-volume-surged-to-437b-by-june-as-solana-earns-14mmonth)
- [FACT, data platform] DefiLlama "Prediction Market" category, queried 2026-10-07. Sum of 30-day volume across all 47
  adapters: **$18.67B**. Kalshi $12.79B (30d) and $80.0B (1y). Polymarket US $2.77B and $10.1B. Polymarket International
  $2.20B and $37.5B. Predict Fun $306M (30d). OPINION $289M. All other venues are under $65M each. DefiLlama does not
  declare its Kalshi method; the figures track "dollars paid" — [DefiLlama API](https://api.llama.fi/overview/dexs)
- [FACT, data platform] DefiLlama monthly series, dollars-paid style, queried 2026-10-07. **Kalshi**: Sep 2025 $1.34B;
  Dec 2025 $2.68B; Mar 2026 $5.26B; Jun $9.40B; Jul $12.37B; Aug $11.41B; **Sep 2026 $13.52B**. **Polymarket
  International**: Sep 2025 $0.72B; Nov $1.88B; Mar 2026 $4.79B (peak); Jun $4.28B; Aug $2.35B; **Sep 2026 $2.13B**.
  **Polymarket US**: Dec 2025 $0.04B; Jun 2026 $1.66B; Jul $2.02B; **Sep 2026 $2.48B** —
  [DefiLlama Kalshi](https://api.llama.fi/summary/dexs/kalshi), [Polymarket Intl](https://api.llama.fi/summary/dexs/polymarket-international), [Polymarket US](https://api.llama.fi/summary/dexs/polymarket-us)
- [SECONDARY FACT, weak] Publish0x blog: "Prediction markets closed September with $78.2 billion in notional volume",
  against July's $56.4B. This is a user blog, and the September figure is not confirmed elsewhere —
  [Publish0x](https://www.publish0x.com/prediction-graph/prediction-markets-hit-a-record-dollar-782b-in-september-q3-xnjpnem)
- [SECONDARY FACT] CoinReporter headline: the sector crossed "$20 Billion in Weekly Trading Volume for the First Time"
  (Sep 2026). Only the title was seen. It is consistent with the repo's Artemis week of $20.4B —
  [CoinReporter](https://www.coinreporter.io/2026/09/prediction-markets-cross-20-billion-in-weekly-trading-volume-for-the-first-time/)
- [SECONDARY FACT] TRM Labs (2026-03-27), on-chain venues only (Polymarket, Limitless, Opinion, predict.fun), from raw
  contract logs: "USD 20+ billion" monthly in January 2026, against $1.2B in early 2025. Single-day record $425M on
  2026-02-28. 840,000 unique monthly wallets in February 2026. "Crypto price markets represent a consistently small share
  of activity at every tier". This on-chain total is several times DefiLlama's (Polymarket Intl $3.39B in Jan 2026), most
  likely the double-count problem Paradigm flagged — [TRM Labs](https://www.trmlabs.com/resources/blog/how-prediction-markets-scaled-to-usd-21b-in-monthly-volume-in-2026)
- [SECONDARY FACT] 2025 annual totals conflict across sources. PYMNTS/The Information: "Prediction market volumes in 2025:
  $51 billion" and "$60 billion" for Kalshi + Polymarket in 2026 year to date as of April 20, 2026 —
  [PYMNTS](https://www.pymnts.com/news/investment-tracker/2026/polymarket-targets-15-billion-valuation-in-new-funding-round/).
  UK coverage: $44B in 2025 (Polymarket ~$21.5B, Kalshi ~$17.1B) —
  [Yahoo/CCN](https://finance.yahoo.com/markets/options/articles/polymarket-kalshi-coming-uk-fca-112215545.html).
  The repo has Kalshi 2025 at $23.8B (`market-research.md`) and $22.9B (`receita-mercados-de-previsao.md`).
- [SECONDARY FACT] Projection: an industry figure of $240B for 2026 (Bernstein, April 2026, cited again by CoinDesk on
  2026-09-07) — [CoinDesk](https://www.coindesk.com/policy/2026/09/07/uk-regulator-weighs-easing-financial-prediction-market-ban-times)

### Inferences
- [INFERENCE] Year-on-year growth, DefiLlama dollars-paid basis. Kalshi + Polymarket Intl + Polymarket US went from
  $2.06B (Sep 2025) to $18.13B (Sep 2026): **8.8x**. Kalshi alone grew 10.1x. On a notional basis, CoinShares' $4.5B
  (Sep 2025) and DefiRate's ~$85.7B (30 days to Oct 6) imply about 19x. The two bases should not be mixed.
- [INFERENCE] Shares from Pew, July 2026, notional: **sports 79.3%** ($42.0B of $53.0B); **crypto 13.7%** ($7.26B:
  Kalshi $6.10B, Polymarket $1.15B); politics 1.7%; other 5.3%. July was the World Cup month, so sports is
  seasonally high. Crypto is 15.2% of Kalshi's July volume but only 9.0% of Polymarket's.
- [INFERENCE] Crypto's share rises when it is measured in dollars paid (27% in DefiRate's 30 days) rather than notional
  (13.7%). Short-dated crypto price contracts trade near 50¢, while sports parlays are many cheap contracts that inflate
  face value. For a crypto-native entrant, the dollars-paid crypto category is about **$6B a month** across the sector
  (27% × $22.6B). That is my arithmetic on a page whose category numbers do not reconcile. The Pew notional figure is
  $7.3B in July.
- [INFERENCE] The sector is one company plus a long tail. Kalshi is 78% of face value and 70% of dollars paid
  ($15.9B/$22.6B). Everything outside Kalshi and Polymarket is under 5%.

### Gaps
- No primary monthly 2026 series from Kalshi or Polymarket. Both measures come from third parties (DefiRate's licensed
  data, DefiLlama, Pew, Artemis).
- The September 2026 notional total ($78.2B) is unconfirmed; the source is a blog.
- The DefiRate category split could not be reconciled. Read the page by hand before quoting "27% crypto".
- The "40% of new users entered through crypto markets" claim is in the repo (The Defiant, Q1 2026, via
  `publico-web3.md`). It was not re-verified this session.

## 2. Polymarket: volume, users, revenue, funding, token, who creates markets, oracle disputes

### Takeaway
Polymarket went from zero fees in 2025 to about $1.0-1.3B in annualized fees by mid/late 2026. It raised about $1B at a
**$21B post-money valuation** (Bloomberg, 2026-08-31, round led by 1789 Capital). ICE owns about 22%. Volume is flat to
down since March 2026 on the international venue and growing on the US exchange. The team curates every market, and
users can only suggest one. Its UMA opinion oracle has produced two well-documented disputed resolutions (March 2025,
July 2025). UMA responded by restricting who may *propose* outcomes.

### Cited Findings
- [FACT, data platform] DefiLlama fees, 30 days to 2026-10-07: Polymarket US **$72.5M**, Polymarket International
  **$30.9M**, Polymarket Combos $0.15M. Trailing year: $212.8M (US) + $239.1M (Intl). DefiLlama "revenue" for Intl,
  probably net of maker rebates: $14.9M (30d) — [DefiLlama fees API](https://api.llama.fi/overview/fees)
- [SECONDARY FACT] Fee rollout: January 2026 on high-frequency crypto markets; February 2026 on select sports;
  2026-03-06 on all crypto durations; **2026-03-30 "Fee Structure V2"** on politics, finance, economics, culture, weather
  and tech. Geopolitics and world events stay fee-free. Daily fees on 2026-04-01 were $927K (Dune) to $1.07M
  (DefiLlama), "an estimated $338 million" annualized at that point —
  [Yahoo Finance](https://finance.yahoo.com/markets/crypto/articles/polymarket-fee-overhaul-pushes-daily-054836739.html)
- [SECONDARY FACT] Sacra: "$1.0B annualized revenue (June 2026)", "$0 revenue in 2025" —
  [Sacra Polymarket](https://sacra.com/c/polymarket/)
- [FACT, from repo, read 2026-10-03] International fee formula: `coefficient × C × p × (1 − p)`, paid by takers only.
  Crypto 0.07; sports, economics, culture, weather and other 0.05; finance, politics, tech and mentions 0.04;
  geopolitics 0. Makers get 15-25% back. **Conflict**: Sacra and several guides list sports at 0.03 under V2
  (March 30). The repo's later primary read says 0.05, which suggests sports was raised after March. Polymarket US
  (repo, primary): taker 0.0695, maker rebate 0.0125. Sacra instead gives a "uniform 0.05" taker fee effective
  2026-04-03 — `knowledge-base/market/receita-mercados-de-previsao.md`; [Sacra](https://sacra.com/c/polymarket/)
- [SECONDARY FACT] Funding and valuation:
  - ~$200M led by Founders Fund at ~$1B (June 2025) — [Sacra](https://sacra.com/c/polymarket/)
  - **ICE, 2025-10-07: up to $2B at ~$8B pre-money**: $1.0B primary plus up to $1.0B of secondary purchases. Sacra puts
    the stake at 9.6M Series D shares, 17% of outstanding and 11% fully diluted —
    [Sacra](https://sacra.com/c/polymarket/), [Cryptonomist](https://en.cryptonomist.ch/2026/09/01/polymarket-funding-round/)
  - **ICE +$600M in March 2026** (Series E). ICE booked a $389M fair-value gain in Q1 2026. Its stake was valued at
    $1.64B as of March 2026, and it is now "roughly 22%" (Cryptonomist) or 23% of outstanding / 14% fully diluted
    (Sacra) — [Cryptonomist](https://en.cryptonomist.ch/2026/09/01/polymarket-funding-round/)
  - **2026-04-20: $400M at "around $15 billion, including the new funds"** (The Information via PYMNTS) —
    [PYMNTS](https://www.pymnts.com/news/investment-tracker/2026/polymarket-targets-15-billion-valuation-in-new-funding-round/)
  - 2026-08-04: "Polymarket Seeks More Than $20 Billion Valuation" (Bloomberg headline) —
    [Bloomberg](https://www.bloomberg.com/news/articles/2026-08-04/polymarket-seeks-more-than-20-billion-valuation-in-funding-round)
  - **2026-08-31: ~$1B round led by 1789 Capital at $21B post-money**, a 40% step-up from $15B. 1789 puts in ~$300M,
    for "roughly $500 million across multiple rounds" — [Bloomberg](https://www.bloomberg.com/news/articles/2026-08-31/polymarket-funding-round-led-by-1789-values-firm-at-21-billion),
    [Cryptonomist](https://en.cryptonomist.ch/2026/09/01/polymarket-funding-round/)
  - **Conflict**: CoinDesk (2026-08-13) says Polymarket "raised $600 million at a $15 billion valuation in August 2026".
    This looks like a conflation of the ICE $600M (March) and the $15B mark (April) —
    [CoinDesk](https://www.coindesk.com/business/2026/08/13/kalshi-in-talks-with-sequoia-wellington-for-usd750-million-fund-raise-at-usd40-billion-valuation)
- [SECONDARY FACT] US exchange: QCEX (QCX LLC, QC Clearing LLC) bought for $112M in July 2025. CFTC Amended Order of
  Designation on 2025-11-25 allows intermediated access through FCMs. US relaunch on 2025-12-03 —
  [Sacra](https://sacra.com/c/polymarket/); `regulacao.md`
- [SECONDARY FACT] Users. Mexc aggregator: 679K monthly actives on 2026-02-17, a record, but "just over 242,000"
  in June 2026, 47.6% below January's ~462K. These internal numbers conflict, and the source is weak —
  [MEXC](https://www.mexc.com/news/738626). Pew, a sample of 11,989 active wallets from May 7 to June 19, 2026: median
  user made 46 trades over 10 days, average trade $6.50, and was net down under $2. Crypto-focused users trade under $4
  on average — [Pew](https://www.pewresearch.org/short-reads/2026/07/22/what-we-know-about-the-typical-polymarket-user/)
- [SECONDARY FACT] Token. CMO Matthew Modabber, October 2025: "There will be a token, there will be an airdrop" —
  [The Block](https://www.theblock.co/post/376048/polymarket-cmo-confirms-poly-token-airdrop-plans). Blockratize Inc.
  filed for the USPTO trademarks "POLY" and "$POLY" on 2026-02-04. In March 2026 the Help Centre still said it "does not
  have a token" (search snippet) — [The Prediction Report](https://thepredictionreport.beehiiv.com/p/polymarket-air-drop-on-the-horizon).
  **No POLY launch found as of 2026-10-07.**
- [FACT, official page via search snippet; fetch failed DNS] Market creation: "Markets are created by the markets team
  with input from users and the community". Users "cannot directly create their own markets". Proposals should include
  "the market title and resolution source", and "the best ways to propose a new market are on Twitter/X by tagging
  @polymarket" — [Polymarket docs](https://docs.polymarket.com/polymarket-learn/markets/how-are-markets-created),
  [Help Center](https://help.polymarket.com/en/articles/13364541-how-are-markets-created)
- [SECONDARY FACT] Oracle dispute 1, the Ukraine minerals deal (resolved around 2025-03-27, $7M market). A whale with
  "as much as five million" UMA tokens "forced through a premature 'Yes' resolution". Polymarket said "This market
  resolved against the expectations of our users", called it "unprecedented", and refused refunds —
  [Web3 is Going Great](https://web3isgoinggreat.com/single/polymarket-governance-attack) (citing The Block and
  CoinTelegraph)
- [SECONDARY FACT] Oracle dispute 2, "Will Zelenskyy wear a suit before July?" ($58M, July 2025). On June 24 he wore an
  outfit that BBC and Reuters called a suit. UMA went from an initial "Yes" to a final "No" after two disputes. "Fewer
  than ten UMA holders supplied nearly all of the ~18 million UMA staked", three addresses held over 70% of the vote
  weight, and 95% of UMA sits in whale wallets (Sentora) —
  [The Defiant](https://thedefiant.io/news/nfts-and-web3/polymarket-controversy-heats-up-after-the-zelenskyy-suit-market-resolves)
- [SECONDARY FACT] UMA's response: UMIP-189 passed on 2025-08-06, moving OOV2 to **MOOV2**. "Only whitelisted addresses
  can submit resolution proposals". The initial whitelist had 37 addresses: Risk Labs and Polymarket employees, plus
  users with more than 20 proposals and over 95% accuracy. "Anyone can still dispute" —
  [The Block](https://www.theblock.co/post/366507/polymarket-uma-oracle-update)

### Inferences
- [INFERENCE] Annualized fees: $103.5M over 30 days × 12.17 ≈ **$1.26B**. The take rate is ≈ **2.1% of dollars paid**
  ($103.5M / $4.99B of 30-day volume across US, Intl and Combos). The repo's 2025 Kalshi figure is ~1.15% of volume.
- [INFERENCE] Volume on Polymarket International peaked in March 2026 ($4.79B) and fell to $2.13B by September. The US
  exchange took over: $2.48B in September, and +167% month on month at DefiRate. Fees moved the same way. The
  US venue's fees ($72.5M) are now more than double the international venue's ($30.9M).
- [INFERENCE] Both oracle incidents were opinion questions ("deal agreed?", "is this a suit?") settled by a token
  vote concentrated in a few wallets. The fix (MOOV2) narrows *proposers* but leaves the token-weighted *dispute vote*
  in place. This supports Brot's claim that resolving from typed on-chain account reads removes a known failure mode.
  It does not remove the risk of manipulating the underlying on-chain metric.

### Gaps
- POLY token status after March 2026, and any token-sale terms: not found (search budget exhausted).
- No reliable monthly active-trader series for 2026; sources conflict.
- No primary statement of Polymarket's 2026 revenue; only DefiLlama, Dune and Sacra.

## 3. Kalshi: volume, revenue, fees, funding, who creates markets, litigation, Solana

### Takeaway
Kalshi is the sector: 78% of face-value volume, about $13.5B a month in dollars paid, and about $4B in annualized
revenue (July 2026). It is valued at $22B (Series F, May 2026) and is in talks at $40B. I found no confirmation that the
$40B round has closed. Its staff curate every market. In court, 2026 turned against it at the Sixth and Ninth Circuits,
while the Third Circuit held for it. The CFTC is suing states on its side.

### Cited Findings
- [FACT, data platform] DefiLlama: Sep 2026 $13.52B; 30 days to 2026-10-07 $12.79B; trailing year $80.0B. DefiLlama
  has no Kalshi fee adapter — [DefiLlama](https://api.llama.fi/summary/dexs/kalshi)
- [SECONDARY FACT] DefiRate, Sep 7 to Oct 6, 2026: $66.7B face value (78%), $15.9B paid —
  [DefiRate](https://defirate.com/prediction-markets/volume/). The Block, 2026-06-24: "$21.1 billion" for the current
  month — [The Block](https://www.theblock.co/post/406061/kalshi-40-billion-valuation). Sacra, June 2026: ~$29.2-30B,
  including "$7B World Cup" and "$7B unmonetized crypto perps" — [Sacra Kalshi](https://sacra.com/c/kalshi/)
- [SECONDARY FACT] Revenue (annualized): ~$25M (Dec 2024); $600-700M (Nov 2025); ~$735M (Dec 2025) — [Sacra](https://sacra.com/c/kalshi/).
  $1.5B as of 2026-04-20 — [PYMNTS](https://www.pymnts.com/news/investment-tracker/2026/polymarket-targets-15-billion-valuation-in-new-funding-round/).
  "Surpassed $2 billion" (The Information, mid-June 2026) — [The Block](https://www.theblock.co/post/406061/kalshi-40-billion-valuation).
  **"$4 billion in annualized revenue" as of July 2026**, with "over 80% of its volume" in sports and a claimed "95% U.S.
  market share" — [CoinDesk](https://www.coindesk.com/business/2026/08/13/kalshi-in-talks-with-sequoia-wellington-for-usd750-million-fund-raise-at-usd40-billion-valuation)
- [SECONDARY FACT, from repo, not re-verified] Fee formula: taker `0.07 × C × P × (1 − P)`, at most 1.75¢ per contract
  at 50¢; `0.0175 × C × P × (1 − P)` on resting orders in some markets. 2025: $263.5M in fees on $22.9B —
  `receita-mercados-de-previsao.md` (pm.wiki, thelines.com). Sacra: parlays rose to ~50% of volume during the World Cup,
  from ~2%. Robinhood sources "more than half of Kalshi's trading volume" — [Sacra](https://sacra.com/c/kalshi/)
- [SECONDARY FACT] Funding:
  - Jun 2025: $185M, Paradigm, $2B
  - Oct 2025: $300M, a16z/Sequoia, $5B
  - Dec 2025: $1B, Paradigm, $11B
  - **May 2026: $1B Series F, Coatue, $22B**, with Sequoia, a16z, IVP, Paradigm, Morgan Stanley and ARK. Total raised
    ~$2.89B, including $300M of debt in late 2024 — [Sacra](https://sacra.com/c/kalshi/)
  - 2026-06-24: FT reports talks at **$40B**, closing "as early as the third quarter of 2026". Mansour is "considering
    an IPO", but "not this year" — [The Block](https://www.theblock.co/post/406061/kalshi-40-billion-valuation)
  - 2026-08-13: The Information reports Sequoia and Wellington in "advanced talks" to lead "at least $750 million" at
    $40B, "expected to be Kalshi's last private raise before an IPO", possibly in 2027 —
    [CoinDesk](https://www.coindesk.com/business/2026/08/13/kalshi-in-talks-with-sequoia-wellington-for-usd750-million-fund-raise-at-usd40-billion-valuation)
- [FACT, official page via search snippet; fetch failed DNS] Market creation: users "submit ideas for entirely new
  markets to Kalshi's markets team, which analyzes all suggested markets to ensure compliance with CFTC regulations, that
  they are not easy to manipulate, and are in the interest of users" — [Kalshi Help Center](https://help.kalshi.com/markets/markets-101/suggesting-a-new-market)
- [SECONDARY FACT] Why DCMs curate: "DCMs ... are partially responsible for all the listed event contracts that are
  tradable on their exchange", including "exclusively listing contracts that are not susceptible to manipulation" —
  [It's Not Gambling (Substack)](https://itsnotgambling.substack.com/p/the-right-to-ask-a-question)
- [SECONDARY FACT] Courts, 2026:
  - Nevada Gaming Control Board complaint on 2026-02-17; the case is now at the Ninth Circuit.
  - **Third Circuit (April 2026)**: Kalshi likely to succeed in arguing that sports contracts are "swaps", with New
    Jersey preempted.
  - **Ninth Circuit**: Kalshi is subject to Nevada gambling law.
  - **Sixth Circuit (2026-09-25, unanimous, Judge Gibbons)**: "Ohio and Tennessee can regulate event contracts under
    their gambling laws". Kalshi "did not show its sports-event contracts are 'swaps'". The split "opens up the
    possibility that the US Supreme Court could weigh in"
  - Sources: [Al Jazeera](https://www.aljazeera.com/news/2026/9/25/us-court-rules-against-kalshi-says-states-can-regulate-prediction-markets),
    [SBC Americas](https://sbcamericas.com/2026/09/25/kalshi-sixth-circuit-sides-oh-tn/),
    [Prediction News](https://predictionnews.com/story/kalshi-loses-sixth-circuit-appeal)
  - "About 20 states still challenging sports event contracts from Kalshi, Polymarket" (headline only) —
    [Prediction News](https://predictionnews.com/story/about-20-states-still-challenging-sports-event-contracts-from-kalshi-polymarket)
  - The New York AG sued Kalshi "nearly two months" before its 2026-09-24 suit against Polymarket US —
    [Fox 5 NY](https://www.fox5ny.com/news/new-york-sues-polymarket-illegal-gambling-lawsuit)
- [SECONDARY FACT] On Solana: Kalshi tokenized thousands of markets via DFlow and Jupiter, live 2025-12-01/02. In October
  2025, 57% of Kalshi volume came through Robinhood — [The Block](https://www.theblock.co/post/380983/kalshi-tokenizes-thousands-of-its-prediction-markets-using-solana).
  See section 4 for the mechanics.

### Inferences
- [INFERENCE] Take rate: $4B annualized revenue against July's $12.37B dollars paid × 12 ($148B) ≈ **2.7% of dollars
  paid**, or ≈ 0.83% of Pew's July notional ($40.1B × 12). This is consistent with the formula: at 50¢ the fee is 3.5%
  of premium, and higher at low prices.
- [INFERENCE] Kalshi grew revenue about 5.4x in seven months (Dec 2025 $735M to Jul 2026 $4B). Its valuation went from
  $11B to $22B (and $40B in talks), so revenue multiples are *compressing* even as valuations rise (section 5).
- [INFERENCE] Every Kalshi legal loss is about **sports** contracts under state gambling law. None of the 2026 rulings
  found concern crypto or economic contracts.

### Gaps
- Whether the $40B round closed, and at what size: not found as of 2026-10-07 (search budget exhausted).
- Kalshi's current fee schedule was not re-read at the primary source (help.kalshi.com DNS failure).
- No primary filing for the New York v. Kalshi suit date.

## 4. Solana-native volume and the "$28.6M in three weeks" claim

### Takeaway
Volume on Solana is tiny: about $20-55M a month across all Solana-tagged venues, ~0.1-0.3% of the sector. The biggest
venue purely on Solana in September 2026 is **World** ($15.4M, inside Phantom). TurboFlow is larger ($33.8M), but its
total mixes Solana and BSC. The pitch's "$28.6M in three weeks" is accurate as history (Jupiter + DFlow, mid-Dec 2025
to early Jan 2026). It is now nine months old, and it measures Kalshi contracts wrapped on Solana rather than an
on-chain market. The judge's objection is fair.

### Cited Findings
- [FACT, data platform] DefiLlama, queried 2026-10-07 (monthly $M):
  - **World** (Solana only): Jun 2026 1.14; Jul 13.22; Aug 22.20; **Sep 15.44**. 30d $14.58M; all-time $54.5M
  - **TurboFlow** (Solana + BSC, no split): Apr 4.73; Jun 13.65; Aug 19.65; **Sep 33.81**. 30d $38.85M; all-time $108.7M
  - **Jupiter Prediction** (interface for Kalshi markets): Dec 2025 1.90; Mar 2026 2.50; Jun 13.79 (peak); Jul 11.42;
    **Sep 5.28**. 30d $5.54M; all-time $55.25M
  - **DFlow**: Dec 2025 1.84; Feb 2026 6.11 (peak); Jun 0.72; Jul 0.13; Aug-Sep 0.00; all-time $17.3M. The adapter may
    have stopped, or the flow may now route through Jupiter; unknown
  - Worm (Solana): $41K over 30d
  - No DefiLlama prediction adapter exists for Drift BET, Hedgehog or Triad
  - Sources: [Jupiter Prediction](https://api.llama.fi/summary/dexs/jupiter-prediction), [World](https://api.llama.fi/summary/dexs/world),
    [DFlow](https://api.llama.fi/summary/dexs/dflow), [TurboFlow](https://api.llama.fi/summary/dexs/turboflow-prediction-markets)
- [SECONDARY FACT] Origin of the pitch number: Jupiter + DFlow did **$28.6M from mid-December 2025 to about
  2026-01-05**, of which DFlow $22.4M, with ~21K unique wallets. "98% of DFlow volume" came from the Phantom integration —
  [Step Data](https://stepdata.substack.com/p/prediction-markets-on-solana-286m), [SolanaFloor](https://solanafloor.com/news/prediction-markets-on-solana-28-6-m-in-early-onchain-volume-across-jupiter-and-d-flow).
  Later: DFlow $37.43M cumulative notional and Jupiter $7.8M by 2026-01-26 (search snippet) —
  [Solana Compass](https://solanacompass.com/projects/jupiter)
- [SECONDARY FACT] Mechanics of DFlow tokenized Kalshi markets: users "submit intents on Solana, and providers then fill
  them asynchronously", with tokens "minted for positions and burned at settlement". "Concurrent Liquidity Programs
  (CLPs) ... connect offchain Kalshi liquidity to onchain users". The source does not say who holds the underlying Kalshi
  contract — [Token Relations](https://tokenrelations.substack.com/p/how-dflow-is-expanding-prediction-markets-solana)
- [SECONDARY FACT] **Jupiter Forecast** launched 2026-06-04. It is Jupiter's first market infrastructure of its own,
  built on "Prop AMMs that route prediction market orders across competing market makers". Settlement is in JupUSD
  through a "keeper network operating escrow", and "each prediction market within Forecast also issues its own native
  token". The public rollout opened with 15-minute crypto-price windows. Before it, Jup Predict had "approximately $17
  million in total trading volume", $5.3M of it in April 2026. That conflicts with DefiLlama's all-time $55M, which
  uses a different scope — [Solana Compass](https://solanacompass.com/news/jupiter-launches-forecast-solanas-first-native-prediction-market-with-multi-market-maker-quoting)
- [SECONDARY FACT] CoinShares (July 2026): "Solana-based prediction market protocols generated roughly $1.4M per month in
  protocol revenue" in Q2 2026. Hyperliquid HIP-4 launched on 2026-05-02 and did $331.1M notional in its first nine
  weeks — [Solana Compass](https://solanacompass.com/news/prediction-market-monthly-volume-surged-to-437b-by-june-as-solana-earns-14mmonth)
- [SECONDARY FACT] Melee (Solana): $3.5M seed led by Variant, with DBA and angels including Anatoly Yakovenko and
  Meltem Demirors, announced 2025-09-24 — [Phemex](https://phemex.com/news/article/melee-secures-35-million-to-launch-viral-prediction-market-platform-21008)
- [SECONDARY FACT] Drift BET launched in August 2024 with "$3.5 million in total liquidity" in its first 24 hours.
  No 2026 volume was found — [The Block](https://www.theblock.co/post/311888/solana-based-drift-protocol-launches-prediction-market)

### Inferences
- [INFERENCE] Solana-tagged adapters total $53.5M over 30 days. That is **0.29%** of DefiLlama's $18.67B sector total, or
  0.11% without TurboFlow ($20.2M). World alone is ~300x smaller than Polymarket (Sep: $15.4M vs $4.61B).
- [INFERENCE] **Is "$28.6M in three weeks" on-chain?** Partly. The user leg (USDC in, an SPL outcome token minted, burned
  at settlement) is on Solana. Price discovery, the order book, the contract itself and the resolution sit at Kalshi, a
  CFTC-regulated off-chain exchange whose staff determine outcomes. It is also a Jupiter + DFlow interface figure, not
  "Kalshi contracts" in general. Accurate wording: "Kalshi markets wrapped as Solana tokens did $28.6M in their first
  three weeks (Dec 2025 to Jan 2026)". The current figure is ~$5M a month through Jupiter.
- [INFERENCE] Biggest venue today: **World** among Solana-only venues by DefiLlama, unless TurboFlow's Solana share
  exceeds $15.4M (unknown). No Solana venue resolves from on-chain account reads, and none lets anyone create a market
  (World routes to liquidity providers; Jupiter wraps Kalshi; Forecast is run by Jupiter).

### Gaps
- No 2026 figures for Hedgehog, Triad or Drift BET (no adapters, and the search budget was exhausted).
- TurboFlow's Solana vs BSC split is unknown.
- I could not determine whether DFlow's zero since August is real or a broken adapter.
- No Dune dashboard was read (needs an API key).

## 5. Valuation comparables and multiples

### Takeaway
The leaders are priced at about **0.25-0.5x annualized dollars-paid volume** and **5-20x annualized revenue**. Revenue
multiples fall as fees ramp: Kalshi went from 15x in Dec 2025 to 5.5-10x in 2026, and Polymarket from 44x in April 2026
to 17-21x in August. Smaller crypto-native venues raise $3-20M rounds at undisclosed valuations. Their volume collapses
when incentives end. For a seed-stage Solana entrant, the realistic comparables are those $3-20M rounds, not the
leaders' multiples.

### Cited Findings
- [SECONDARY FACT] Leaders' rounds and run-rates: see sections 2 and 3 (Sacra, PYMNTS, Bloomberg via Cryptonomist,
  CoinDesk, The Block).
- [SECONDARY FACT] **Opinion Labs** (BNB Chain): "$20 million pre-Series A" in February 2026, from Hack VC, Jump Crypto,
  Primitive Ventures, Decasonic and Continue Fund; $25M total over four rounds. Token "FDV ~$175M" (aggregator, weak) —
  [The Defiant](https://thedefiant.io/news/defi/top-bnb-chain-prediction-market-opinion-raises-usd20-million),
  [CB Insights](https://www.cbinsights.com/company/opinion-labs/financials), [MEXC](https://www.mexc.com/news/633683).
  DefiLlama: $289M volume over 30d and **$12.5B over the trailing year**; fees $41K (30d) and $17.5M (1y) —
  [DefiLlama](https://api.llama.fi/overview/dexs)
- [SECONDARY FACT] **Limitless** (Base): $3M pre-seed in fall 2024 led by 1confirmation; $4M in June 2025 (Coinbase
  Ventures and others); **$10M seed on 2025-10-31** from 1confirmation, Collider, F-Prime, DCG, Coinbase Ventures, Node,
  Arrington, SID Venture Partners and Flyer One. Valuation not disclosed. Volume was then "$508 million". LMTS token
  planned — [Diia / Ministry of Digital Transformation](https://dia.dp.gov.ua/en/ukrainian-created-platform-limitless-raises-10m/),
  [The Defiant](https://thedefiant.io/news/press-releases/prediction-market-limitless-raises-3m-in-pre-seed-round-led-by-1confirmation).
  DefiLlama: $9.16M over 30d against $1.08B over the year; fees $180K (30d) against $14.0M (1y)
- [SECONDARY FACT] **Myriad** (Dastan, Decrypt's parent): seed round of undisclosed size in March 2026, from MoonPay,
  Walrus and Tom Lee — [Yahoo Finance](https://finance.yahoo.com/markets/crypto/articles/prediction-market-myriad-closes-milestone-162400075.html).
  DefiLlama: $2.70M (30d), $223M (1y)
- [SECONDARY FACT] **Melee** (Solana): $3.5M seed, Variant, 2025-09-24 (section 4)
- [FACT, data platform] **predict.fun** (BSC/Blast): $306M volume, $5.96M fees and $1.32M revenue over 30d. No
  disclosed round was found; Cryptorank lists only "$100" —
  [Cryptorank](https://cryptorank.io/ico/predict-fun), [DefiLlama](https://api.llama.fi/overview/fees)
- [FACT, data platform] **XO Market**, which describes itself as "The YouTube of prediction markets: user-generated
  conviction markets on any event": $31.6M (30d), $391M (1y) on DefiLlama. Funding not found —
  [DefiLlama](https://api.llama.fi/overview/dexs), [NeuronFeed](https://neuronfeed.com/compare/xo-market-vs-kalshi)

### Inferences
[INFERENCE] Volume uses DefiLlama dollars-paid monthly × 12; revenue is the run-rate cited nearest the round.

| Round | Valuation | Annualized volume (paid) | Valuation / volume | Annualized revenue | Valuation / revenue |
|---|---|---|---|---|---|
| Kalshi, Oct 2025 | $5B | $23.9B (Oct) | 0.21x | $0.6-0.7B (Nov) | 7-8x |
| Kalshi, Dec 2025 | $11B | $32.2B (Dec) | 0.34x | $0.735B | 15x |
| Kalshi, May 2026 | $22B | $73.8B (May) | 0.30x | $1.5B (Apr) to $4B (Jul) | 14.7x to 5.5x |
| Kalshi, talks Aug 2026 | $40B | $162B (Sep) | 0.25x | $4B (Jul) | 10x |
| Polymarket, Oct 2025 | ~$9B post | $18.1B (Oct, Intl) | ~0.5x | ~0 | n/m |
| Polymarket, Apr 2026 | ~$15B | $55.2B (Apr, Intl+US) | 0.27x | ~$0.34B (Apr 1) | ~44x |
| Polymarket, Aug 2026 | $21B | $55.3B (Sep) | 0.38x | $1.0B (Jun) to $1.26B (Oct, DefiLlama) | 21x to 17x |

- [INFERENCE] On face value, Kalshi at $40B against DefiRate's $66.7B × 12 = $800B is only ~0.05x. Always say which
  volume a multiple uses.
- [INFERENCE] Polymarket earns a premium per revenue dollar over Kalshi (17-21x vs 5.5-10x) despite lower revenue.
  Plausible reasons: the token/airdrop option, ICE's data deal and global reach. These reasons are not established by
  any source.
- [INFERENCE] Long-tail warning: Opinion did $12.5B over a year but $289M in the latest 30 days (~28% of its $1.04B monthly
  average). Limitless fell from ~$90M a month to $9M. Incentive-driven volume does not hold, and valuing an entrant on
  launch-period volume would mislead.
- [INFERENCE] Only Opinion has a token valuation: FDV ~$175M against $17.5M of trailing fees, ~10x. Both inputs are
  weak.

### Gaps
- PNP Exchange funding, predict.fun funding and XO Market funding: not found (search budget exhausted).
- No disclosed post-money valuations for Limitless, Myriad, Melee or Opinion.
- Whether Kalshi's $40B round closed is unconfirmed.

## 6. Regulation for a public, permissionless market creator on Solana

### Takeaway
In the US, a crypto-price or on-chain-metric contract is still a "swap" or option under the Commodity Exchange Act. It
can be offered to retail only on a CFTC-designated contract market. The CFTC said in 2022, against Polymarket, that the
technology does not matter. Crypto-only lowers the *state gambling* exposure, where all 2026 litigation is about sports.
It does not lower the federal exposure.

In Brazil, MP 1.394 (in force since 2026-09-25, under review in Congress and at the STF) defines fixed-odds wagering by
a "fator de multiplicação" and drops the 2018 requirement that the payout be fixed "no momento de efetivação da
aposta". A pot (pari-mutuel) design is therefore weaker cover than it would have been under the old text.

In the UK, crypto price contracts fall under the FCA's retail binary-options ban, and non-financial contracts need a
Gambling Commission licence. A permissionless creator model also defeats the curation every licensed venue relies on.

### Cited Findings
**United States: federal**
- [FACT] 7 U.S.C. §1a(47)(A), the definition of "swap", includes any agreement "(i) that is a put, call, cap, floor,
  collar, or similar option of any kind that is for the purchase or sale, or based on the value, of 1 or more ...
  commodities ... or other financial or economic interests or property of any kind" and any agreement "(ii) that
  provides for any purchase, sale, payment, or delivery ... that is dependent on the occurrence, nonoccurrence, or the
  extent of the occurrence of an event or contingency associated with a potential financial, economic, or commercial
  consequence" — [7 U.S.C. §1a, LII](https://www.law.cornell.edu/uscode/text/7/1a)
- [FACT] 7 U.S.C. §2(e): "It shall be unlawful for any person, other than an eligible contract participant, to enter
  into a swap unless the swap is entered into on, or subject to the rules of, a board of trade designated as a contract
  market under section 7 of this title." — [7 U.S.C. §2, LII](https://www.law.cornell.edu/uscode/text/7/2)
- [FACT] 7 U.S.C. §7a-2(c)(5)(C), the special rule for event contracts. The Commission may find contracts "contrary to
  the public interest" if they involve "(I) activity that is unlawful under any Federal or State law; (II) terrorism;
  (III) assassination; (IV) war; (V) gaming; or (VI) other similar activity". Such contracts may not "be listed or made
  available for clearing or trading on or through a registered entity" — [7 U.S.C. §7a-2, LII](https://www.law.cornell.edu/uscode/text/7/7a-2)
- [FACT] CFTC v. Polymarket (Blockratize), 2022-01-03. The markets were "event-based binary options contracts", and
  "such event market contracts ... constitute swaps". Polymarket lacked designation as a "designated contract market
  (DCM) or registration as a swap execution facility (SEF)". Penalty: **$1.4 million civil monetary penalty**, and an
  order to "facilitate the resolution (i.e. wind down) of all markets ... that do not comply". Acting Director
  McGonagle: "All derivatives markets must operate within the bounds of the law regardless of the technology used, and
  particularly including those in the so-called decentralized finance or 'DeFi' space." —
  [CFTC release 8478-22](https://www.cftc.gov/PressRoom/PressReleases/8478-22)
- [SECONDARY FACT] 2026 rulemaking:
  - ANPRM published 2026-03-12 (`regulacao.md`).
  - **NPRM "Prediction Markets; Public Interest Determinations"**, issued 2026-06-10, published in the Federal Register
    on **2026-06-12** (doc 2026-11854), comments due by 2026-07-27. It amends Rule 40.11 so the CFTC "may determine" on
    a contract-specific basis that enumerated-activity contracts are contrary to the public interest, "removing the
    categorical prohibitions in the existing rule".
  - Sources: [Federal Register](https://www.federalregister.gov/documents/2026/06/12/2026-11854/prediction-markets-public-interest-determinations),
    [CRS LSB11441](https://www.congress.gov/crs-product/LSB11441), [Greenberg Traurig](https://www.gtlaw.com/en/insights/2026/6/cftc-proposes-new-rules-for-events-contracts-on-prediction-markets)
- [FACT] **CFTC sued Arizona, Connecticut and Illinois on 2026-04-02**, asserting "exclusive jurisdiction to regulate
  event contracts under the Commodity Exchange Act" for DCMs. Chairman Selig: "The CFTC will continue to safeguard its
  exclusive regulatory authority over these markets and defend market participants against overzealous state
  regulators." **The release says nothing about unregistered, offshore or decentralized platforms** —
  [CFTC release 9206-26](https://www.cftc.gov/PressRoom/PressReleases/9206-26)
- [SECONDARY FACT] The CFTC later added New York and Wisconsin to its suits and won a preliminary injunction in Arizona
  (search snippet). It filed amicus briefs at the Sixth Circuit, the Ninth Circuit and the Massachusetts SJC —
  [CFTC 9230-26 (title)](https://www.cftc.gov/PressRoom/PressReleases/9230-26),
  [PYMNTS](https://www.pymnts.com/news/regulation/2026/cftc-files-amicus-brief-defending-exclusive-jurisdiction-over-prediction-markets/),
  [Forbes](https://www.forbes.com/sites/jasonbrett/2026/04/09/prediction-market-regulator-sues-3-states-as-kalshi-wins-in-new-jersey/)

**United States: states**
- [SECONDARY FACT] The Sixth Circuit (2026-09-25) and Ninth Circuit rulings went against Kalshi; the Third Circuit
  (April 2026) went for it; Nevada filed its complaint on 2026-02-17 (section 3).
- [SECONDARY FACT] **New York v. QCX LLC d/b/a Polymarket US, 2026-09-24** (AG James and Gov. Hochul), calling it an
  "illegal, unlicensed gambling operation". New York seeks a Gaming Commission licence, fines and restitution, and the
  suit covers sports, election and culture contracts. Polymarket sued James in federal court the same evening —
  [Fox 5 NY](https://www.fox5ny.com/news/new-york-sues-polymarket-illegal-gambling-lawsuit),
  [DefiRate](https://defirate.com/?p=21637)

**UK and EU**
- [SECONDARY FACT] UK: "Binary options linked to financial and certain weather events" have been banned for retail since
  2019. The FCA's perimeter report says the ban "remained appropriate". The FCA is weighing an easing (The Times, via
  CoinDesk, 2026-09-07). Any broad platform needs "FCA permission for financial event contracts and a Gambling
  Commission license for sports and political markets" — [CoinDesk](https://www.coindesk.com/policy/2026/09/07/uk-regulator-weighs-easing-financial-prediction-market-ban-times).
  FCA markets chief Simon Walls confirmed talks with operators on Oct 6. Neither Kalshi nor Polymarket holds a UKGC
  licence. The UKGC view is that such products "would likely need a licence under the Gambling Act 2005, most likely as
  a betting intermediary" — [CCN](https://www.ccn.com/news/crypto/polymarket-kalshi-uk-fca-prediction-markets-push-back-gambling/),
  [Gambling.com](https://www.gambling.com/uk/news/are-prediction-markets-legal-in-the-uk)
- [FACT, from repo] France: ANJ ordered ISP blocking of Polymarket on 2026-07-16/17 as illegal gambling, citing no KYC.
  The ANJ notice lists DE, BE, RO, CH, PL, NL, GR, IT and PT as having restricted or blocked these markets —
  [ANJ](https://anj.fr/promotion-illegal-gambling-services-blocking-polymarket-website) (`regulacao.md`)

**Brazil**
- [FACT] **MP 1.394/2026**, art. 1º: "Ficam proibidas, no território nacional, a exploração, a oferta, a intermediação e
  a publicidade de loterias de aposta de quota fixa, em meio físico ou virtual, inclusive quando realizadas por agente
  sediado no exterior que as ofereça a pessoa localizada no território nacional." **§ 1º**: "A proibição de que trata o
  caput abrange as apostas sobre eventos reais de temática esportiva e sobre eventos virtuais de jogos on-line." **§ 2º**:
  "não se aplica às demais modalidades lotéricas autorizadas por lei." **Art. 3º, I**: "aposta de quota fixa - ato por
  meio do qual se coloca determinado valor em risco na expectativa de obtenção de prêmio cujo montante é definido por
  fator de multiplicação". **Art. 29** revokes "o Capítulo V da Lei nº 13.756, de 12 de dezembro de 2018", Lei
  14.790/2023 arts. 1-21, 22-24, 25-40, 43-48 and 54, and "o art. 68 da Lei nº 15.421, de 1º de junho de 2026". In force
  on publication — [Planalto, MPV 1.394](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2026/mpv/mpv1394.htm)
- [FACT] The earlier definitions it replaces. Lei 13.756/2018 art. 29 §1º: "sistema de apostas relativas a eventos reais
  de temática esportiva, em que é definido, **no momento de efetivação da aposta**, quanto o apostador pode ganhar em
  caso de acerto do prognóstico" — [Planalto, Lei 13.756](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13756.htm).
  Lei 14.790/2023 art. 2º, II (now marked "Revogado pela Medida Provisória nº 1.394, de 2026"): "quota fixa: fator de
  multiplicação do valor apostado que define o montante a ser recebido pelo apostador, em caso de premiação, para cada
  unidade de moeda nacional apostada" — [Planalto, Lei 14.790](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2023/lei/l14790.htm)
- [FACT] The criminal-misdemeanour baseline that still applies. Decreto-Lei 3.688/1941, art. 50 §3º: "Consideram-se,
  jogos de azar: a) o jogo em que o ganho e a perda dependem exclusiva ou principalmente da sorte; b) as apostas sobre
  corrida de cavalos fora de hipódromo ou de local onde sejam autorizadas; c) as apostas sobre qualquer outra
  competição esportiva." §2º fines whoever is found taking part, "ainda que pela internet" —
  [Planalto, DL 3.688](https://www.planalto.gov.br/ccivil_03/decreto-lei/del3688.htm)
- [FACT] Status in Congress (2026-10-07): published 2026-09-25; mixed committee installed 2026-09-30; **48
  amendments**; amendment period extended to 2026-10-13; deliberation period 2026-09-25 to **2026-11-23**; the agenda
  urgency regime starts 2026-11-09; **no rapporteur designated, no vote**. Status: "Aguardando recebimento de emendas" —
  [Congresso Nacional, MPV 1394/2026](https://www.congressonacional.leg.br/materias/medidas-provisorias/-/mpv/175871).
  MPs lapse unless confirmed within 120 days. The Senado has opened a public poll —
  [Rádio Senado](https://www12.senado.leg.br/radio/1/noticia/2026/09/28/medida-provisoria-que-proibe-bets-no-pais-ja-esta-no-congresso-nacional)
- [SECONDARY FACT] STF: on 2026-09-28, ANJL and IBJR asked for the MP's full suspension until Congress decides. They
  filed as amici in ADIs 7.721, 7.723 and 7.749 (rapporteur Min. Luiz Fux), with a new ANJL action to follow. Their
  argument: "As apostas de quota fixa não representam fenômeno novo ou imprevisível". **Pending** —
  [Migalhas](https://www.migalhas.com.br/quentes/465423/entidades-pedem-ao-stf-suspensao-da-mp-que-proibe-bets)
- [SECONDARY FACT, from repo] **CMN Resolution 5.298/2026** (in force 2026-05-04) bars derivatives on events that are
  not a "referencial econômico-financeiro", including offshore derivatives offered in Brazil. **SPA Nota Técnica
  2958/2026** says Polymarket and Kalshi reproduce the essentials of "aposta de quota fixa". Polymarket lists Brazil as
  "close-only" — `regulacao.md`

### Inferences
- [INFERENCE] **Pari-mutuel vs fixed-odds.**
  - *Brazil*: this is the one place where the distinction had textual support. The 2018 text required the payout to be
    fixed "no momento de efetivação da aposta". MP 1.394 revoked it, and its new definition, "prêmio cujo montante é
    definido por fator de multiplicação", has no timing element. A pot payout of (pot ÷ winning side) × stake × (1 − fee)
    is still a multiplication factor, only fixed at close. The pot design is therefore weaker cover now than under the
    2018 law. Counsel must confirm.
  - *US federal*: the payout mechanics are not an element of §1a(47)(A). A pool contract "dependent on the occurrence"
    of a financially consequential event is still a swap.
  - *UK*: not verified this session (see Gaps).
- [INFERENCE] **Does "crypto on-chain metrics only, no sports, no elections" reduce risk?**
  - *US federal: no.* Crypto is a commodity, and §1a(47)(A)(i)-(ii) plus §2(e) put retail swaps on DCMs only. The 2022
    Polymarket order already covered DeFi. US geofencing remains necessary.
  - *US states: yes, materially.* Every 2026 state action and ruling found targets sports, election or culture
    contracts.
  - *Brazil: partly.* MP §1 names sports and online games ("abrange", which may not be exhaustive). CMN 5.298 permits
    "referencial econômico-financeiro" underlyings, which a crypto price may fit; a token-burn or LP-lock fact is less
    clear. DL 3.688 "dependem ... principalmente da sorte" remains an open question. SPA 2958 treats these markets as
    quota fixa regardless.
  - *UK: it shifts the problem* from the UKGC to the FCA's binary-options ban rather than removing it.
- [INFERENCE] **A permissionless creator makes each of these worse.** Every licensed venue (Kalshi and Polymarket US)
  and even unlicensed Polymarket International curate markets because a DCM answers for each listed contract. Open
  creation invites sports and election questions despite the policy. In Brazil, a creator who earns fees could be read
  as "intermediação" (art. 1º), and promoting markets as "publicidade" (art. 16). A typed on-chain-account resolver
  narrows what can be created (no sports or elections can be read from a Solana account). That is a real mitigation,
  and it should be documented as a legal control.

### Gaps
- The UK Gambling Act 2005 text on "pool betting" (s.12) and "betting intermediary" (s.13): legislation.gov.uk returned
  empty pages, so it was not verified.
- Any 2026 CFTC action against an *unregistered, offshore or decentralized* venue: not found (search budget
  exhausted). The CFTC's 2026 releases address DCMs only.
- EU/MiCA treatment of on-chain event contracts: not researched this pass.
- Official texts of CMN 5.298 and SPA Nota Técnica 2958 are still unread (carried over from `regulacao.md`).
- Whether Chapter V of Lei 13.756 is the chapter containing art. 29: not confirmed.
- No US state-law source on pari-mutuel (pool) contests outside licensed racing.

## 7. Prior repo notes: what is now outdated or contradicted

### Takeaway
Most numbers in the repo hold up as history. Several are stale: Polymarket's valuation ($15B is now $21B), the state
litigation picture, the MP 1.394 status, and the Solana volume claim. The pitch's crypto-share line also mixes up two
scopes.

### Cited Findings
- `market-research.md`, "Polymarket valuation US$ 15 bi (2026)". **Outdated**: $21B post-money on 2026-08-31 —
  [Bloomberg](https://www.bloomberg.com/news/articles/2026-08-31/polymarket-funding-round-led-by-1789-values-firm-at-21-billion)
- `market-research.md`, "Kalshi US$ 22 bi (mai/2026)". Still the last *closed* round found. Talks at $40B since
  2026-06-24 — [The Block](https://www.theblock.co/post/406061/kalshi-40-billion-valuation)
- `market-research.md`, "Polymarket peak US$ 10,5 bi (mar/2026); 8,9 bi (mai)" (Sacra). **Contradicted** on a
  dollars-paid basis: DefiLlama has Mar $4.79B Intl + $0.30B US, and May $3.23B + $0.72B. The two use different
  measures — [DefiLlama](https://api.llama.fi/summary/dexs/polymarket-international)
- `market-research.md`, "Kalshi + Polymarket 2025 > US$ 44 bi". **Conflicts** with PYMNTS/The Information's "$51
  billion" for 2025. Kalshi 2025 also appears as $23.8B, $22.9B (repo) and $17.1B (CCN) —
  [PYMNTS](https://www.pymnts.com/news/investment-tracker/2026/polymarket-targets-15-billion-valuation-in-new-funding-round/)
- `market-research.md` and the pitch, "Solana: US$ 28,6 mi (Dec 2025-Jan 2026)". **Stale**: Jupiter Prediction is now
  $5.3M a month (Sep 2026), World $15.4M, and all Solana-tagged venues ~$53M over 30d (section 4)
- `regulacao.md`, "ao menos 11 estados". **Outdated**: about 20 states (Prediction News, Sep 2026). Since then: Sixth
  Circuit loss (2026-09-25), Ninth Circuit loss, New York suits against Kalshi and Polymarket US, and CFTC suits against
  five states (section 6)
- `regulacao.md`, NPRM "publicada em 10/06/2026". **Precision**: issued June 10 and *published* in the Federal Register
  on 2026-06-12 —
  [Federal Register](https://www.federalregister.gov/documents/2026/06/12/2026-11854/prediction-markets-public-interest-determinations)
- `regulacao.md`, MP 1.394 "tramitação não conferida". **Now known**: committee installed, 48 amendments, deadline
  2026-11-23 (extendable), no rapporteur, STF suspension request pending (section 6)
- `receita-mercados-de-previsao.md`, Polymarket fee coefficients (repo primary read, 2026-10-03: sports 0.05; US 0.0695)
  against Sacra (sports 0.03 from March 30; US uniform 0.05 from April 3). **Conflict**: keep the later primary read
  and re-check the page by hand — [Sacra](https://sacra.com/c/polymarket/)
- Pitch "$21.7B in the last 30 days". **Accurate** as DefiRate *dollars actually paid*, Sep 4 to Oct 3, 2026. The latest
  window is $22.6B (Sep 7 to Oct 6). The face value is $85.7B — [DefiRate](https://defirate.com/prediction-markets/volume/)
- Pitch "Polymarket went from 1.9 to 4.6 billion a month in ten months". **Consistent** with DefiLlama: Nov 2025 Intl
  $1.88B, Sep 2026 Intl + US $4.61B. It compares the international venue alone with international + US combined —
  [DefiLlama](https://api.llama.fi/summary/dexs/polymarket-us)
- Pitch "Crypto is about a fifth of the volume". The source is **Polymarket only, May 2026** (BP part 2 §2.5). The
  sector figure is 13.7% of notional (Pew, Jul 2026) or 27% of dollars paid (DefiRate, 30d) —
  [Pew](https://www.pewresearch.org/short-reads/2026/09/23/prediction-markets-trading-volume-doubled-between-may-and-july-largely-driven-by-sports/)

### Inferences
- [INFERENCE] `services/landing/pitch2-notes.md` says crypto is "cerca de um quinto disso [21,7 bi], quase 1 bilhão por
  mês". This is internally inconsistent: a fifth of $21.7B is about $4.3B. The "~$1B" matches Polymarket's own crypto
  category (~20% of ~$4.6B), not the sector. Suggested fix: "crypto is about a quarter of the money actually paid across
  the sector, roughly $6B a month (DefiRate, 30 days to Oct 6, 2026)", after the DefiRate category table has been
  checked by hand.
- [INFERENCE] Suggested pitch wording for Solana: "Kalshi markets wrapped as Solana tokens did $28.6M in their first three
  weeks (Dec 2025); in Sep 2026 the largest Solana-only venue, World, did $15.4M". This answers the judge, because it
  stops implying an on-chain-native market.

### Gaps
- The DefiRate category split (68% sports / 27% crypto) needs a manual read to resolve the $12.4B vs $15.4B
  inconsistency before the pitch uses it.
