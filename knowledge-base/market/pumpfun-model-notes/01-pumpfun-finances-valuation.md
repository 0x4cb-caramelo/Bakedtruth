# pump.fun as a company: revenue, fees, PUMP token, valuation and trajectory (Jan 2024 to 7 Oct 2026)

Research date: 2026-10-07. Labels: **FACT** = read at the primary source (the company's own page, docs or code,
a regulator filing, or a dataset queried directly); **SECONDARY FACT** = read in a publication that cites a source;
**INFERENCE** = my own arithmetic or conclusion. "Weak" marks numbers seen only in a search-engine summary or an
aggregator I could not open. The web-search budget ran out partway through; questions still open are listed under
each "Gaps".

How to read the DefiLlama numbers: I queried the DefiLlama API directly on 2026-10-07 (data to 2026-10-06), at
`https://api.llama.fi/summary/fees/<slug>?dataType=dailyRevenue|dailyFees|dailyHoldersRevenue` and
`https://api.llama.fi/summary/dexs/<slug>?dataType=dailyVolume`, slugs `pump` (parent), `pump.fun`, `pumpswap`,
`terminal`, `pump.fun-mobile-app`. Human pages: https://defillama.com/protocol/pump. DefiLlama is a third party that
computes these from on-chain data, so it is a measurement, not company accounts. Daily values are FACT (dataset).
Monthly and yearly sums are my arithmetic on them. The DefiLlama methodology says the mobile-app numbers are
"Already counted in the parent pump.fun and PumpSwap listings", yet the parent total adds them again, so I subtract
the app from the parent ("ex-app"). The series start on 2024-03-01, so pump.fun's first six weeks (19 Jan to Feb
2024) are missing.

## 1. Revenue: cumulative and per period, peak, troughs, 2026 trend, product mix

### Takeaway
pump.fun has earned about **$1.34B in protocol revenue** from March 2024 to 6 Oct 2026, by DefiLlama's count. That is
**$321M in 2024, $652M in 2025 and $367M in 2026 to date**. The peak was January 2025 ($150M in the month, $15.5M on
24 Jan 2025). Revenue then fell 87% by July 2025, sat at about $1.0 to 1.5M a day through H1 2026 (trough June 2026,
$0.88M a day), and rebounded from August 2026. The first six days of October 2026 average **$2.5M a day**, the fastest
pace since February 2025. In 2026, about **68% of revenue comes from the bonding curve, 27% from PumpSwap and 6% from
Terminal** (ex-Padre). The mobile app's revenue overlaps those lines.

### Cited Findings

**Totals and run rates (DefiLlama, as of 2026-10-06)**
- FACT: Parent "Pump" revenue: 24h $2.74M; 7d $18.64M; 30d $60.70M; 1y $471.9M; all-time $1.349B. Children,
  all-time: pump.fun (bonding curve) $1.153B; PumpSwap $161.6M (from 2025-03-17); Terminal $25.7M (from 2025-10-25);
  mobile app $8.4M (from 2026-05-22, overlapping). — [DefiLlama API, parent](https://api.llama.fi/summary/fees/pump?dataType=dailyRevenue); [DefiLlama protocol page](https://defillama.com/protocol/pump)
- INFERENCE (arithmetic on the DefiLlama series): all-time revenue ex-app is **$1,340.3M**. Trailing 365 days to
  2026-10-06: $463.5M. Last 30 days annualized: $688.7M. Last 7 days annualized: $906.5M.
- FACT (company): "Annualized revenue $565.19M (≈ $1.55M / day · 90d avg)", data as of 6 Oct 2026. The company's own
  revenue definition: "From 24 Oct 2025, 'Revenue' includes all Pump.fun bonding curve, PumpSwap, and Terminal revenue
  (Solana, Base, Ethereum L1, BNB) net of referral fees and cash backs, exclusive of Mayhem Mode." The page also warns:
  "Since the introduction of the custom pairs, the fee dashboard does not correctly reflect the revenue and buyback
  amount." — [pump.fun, PUMP token page](https://pump.fun/pump-token) (read 2026-10-07)
- FACT (company, self-description): "Pump.fun quickly became the fastest-growing company in history, reaching $100M,
  $300M, and $500M in revenue faster than any other company in the world." — [pump.fun/pump-token](https://pump.fun/pump-token).
  INFERENCE: in the DefiLlama series, cumulative revenue crossed $100M on 2024-09-02, $300M on 2024-12-23, $500M on
  2025-02-09 and $1B on 2026-01-19.

**Monthly series (DefiLlama, USD millions; "revenue ex-app" = parent minus the overlapping app line; my sums)**

| Month | Revenue ex-app | Bonding curve | PumpSwap | Terminal | (App, overlap) | Gross fees (parent) | Buyback (DefiLlama "holders revenue") | Curve volume ($B) | PumpSwap volume ($B) | Avg revenue/day |
|---|---|---|---|---|---|---|---|---|---|---|
| 2024-03 | 2.4 | 2.4 | 0 | 0 | 0 | 2.4 | 0 | 0.00 | 0 | 0.08 |
| 2024-04 | 10.5 | 10.5 | 0 | 0 | 0 | 10.5 | 0 | 0.12 | 0 | 0.35 |
| 2024-05 | 16.6 | 16.6 | 0 | 0 | 0 | 16.6 | 0 | 2.11 | 0 | 0.54 |
| 2024-06 | 20.8 | 20.8 | 0 | 0 | 0 | 20.8 | 0 | 1.94 | 0 | 0.69 |
| 2024-07 | 28.6 | 28.6 | 0 | 0 | 0 | 28.6 | 0 | 2.45 | 0 | 0.92 |
| 2024-08 | 20.5 | 20.5 | 0 | 0 | 0 | 20.5 | 0 | 1.97 | 0 | 0.66 |
| 2024-09 | 14.4 | 14.4 | 0 | 0 | 0 | 14.4 | 0 | 1.51 | 0 | 0.48 |
| 2024-10 | 30.5 | 30.5 | 0 | 0 | 0 | 30.5 | 0 | 4.51 | 0 | 0.98 |
| 2024-11 | 93.9 | 93.9 | 0 | 0 | 0 | 93.9 | 0 | 9.41 | 0 | 3.13 |
| 2024-12 | 82.9 | 82.9 | 0 | 0 | 0 | 82.9 | 0 | 8.18 | 0 | 2.68 |
| 2025-01 | **149.8** | 149.8 | 0 | 0 | 0 | 149.8 | 0 | 11.62 | 0 | **4.83** |
| 2025-02 | 73.6 | 73.6 | 0 | 0 | 0 | 73.6 | 0 | 6.13 | 0 | 2.63 |
| 2025-03 | 41.7 | 40.4 | 1.3 | 0 | 0 | 46.9 | 0 | 3.76 | 1.85 | 1.35 |
| 2025-04 | 55.2 | 49.6 | 5.6 | 0 | 0 | 77.6 | 0 | 4.96 | 8.04 | 1.84 |
| 2025-05 | 58.9 | 52.0 | 6.9 | 0 | 0 | 90.4 | 0 | 5.36 | 10.88 | 1.90 |
| 2025-06 | 46.1 | 41.2 | 4.9 | 0 | 0 | 71.8 | 0 | 3.66 | 11.93 | 1.54 |
| 2025-07 | **20.1** | 17.3 | 2.8 | 0 | 0 | 34.3 | 6.6 | 1.37 | 10.40 | **0.65** |
| 2025-08 | 45.3 | 40.6 | 4.7 | 0 | 0 | 71.0 | 40.6 | 3.23 | 15.89 | 1.46 |
| 2025-09 | 55.5 | 42.8 | 12.7 | 0 | 0 | 123.8 | 42.8 | 3.37 | 17.10 | 1.85 |
| 2025-10 | 37.6 | 28.5 | 8.5 | 0.7 | 0 | 85.9 | 28.5 | 2.34 | 12.38 | 1.21 |
| 2025-11 | 34.7 | 24.8 | 8.3 | 1.6 | 0 | 79.3 | 24.6 | 1.70 | 8.56 | 1.16 |
| 2025-12 | 34.0 | 23.5 | 8.6 | 1.8 | 0 | 83.5 | 23.5 | 1.63 | 8.13 | 1.10 |
| 2026-01 | 48.0 | 31.9 | 12.4 | 3.7 | 0 | 120.9 | 31.8 | 2.12 | 27.82 | 1.55 |
| 2026-02 | 37.9 | 25.6 | 9.5 | 2.8 | 0 | 90.7 | 25.6 | 1.92 | 23.01 | 1.35 |
| 2026-03 | 36.3 | 25.0 | 9.2 | 2.2 | 0 | 82.8 | 25.7 | 1.76 | 27.07 | 1.17 |
| 2026-04 | 30.6 | 21.4 | 7.5 | 1.7 | 0 | 67.4 | 27.6 | 1.48 | 17.23 | 1.02 |
| 2026-05 | 34.4 | 23.7 | 8.8 | 1.9 | 0.0 | 78.6 | 16.2 | 1.77 | 15.76 | 1.11 |
| 2026-06 | **26.5** | 18.1 | 7.0 | 1.4 | 0.1 | 66.3 | 12.2 | 1.29 | 15.19 | **0.88** |
| 2026-07 | 32.8 | 21.8 | 9.4 | 1.7 | 0.9 | 86.7 | 15.7 | 1.63 | 17.96 | 1.06 |
| 2026-08 | 55.5 | 36.7 | 15.9 | 2.9 | 2.6 | 145.1 | 27.1 | 2.66 | 19.99 | 1.79 |
| 2026-09 | 49.4 | 33.1 | 13.7 | 2.6 | 3.7 | 165.4 | 23.6 | 3.04 | 14.57 | 1.65 |
| 2026-10 (1 to 6) | 15.1 | 10.7 | 3.8 | 0.6 | 1.1 | 45.9 | 7.4 | 1.10 | 2.10 | **2.52** |

Source of every cell: [DefiLlama API](https://api.llama.fi/summary/fees/pump?dataType=dailyRevenue) plus the child
slugs listed at the top, queried 2026-10-07. Monthly sums are mine.

- INFERENCE (yearly sums, ex-app): 2024 (from March) $321.2M; 2025 $652.5M (curve $584.1M, PumpSwap $64.3M, Terminal
  $4.1M); 2026 to 6 Oct $366.6M (curve $247.7M, PumpSwap $97.3M, Terminal $21.6M; app $8.4M overlapping). Gross fees
  (including creator and LP shares): 2025 $987.9M; 2026 to date $949.9M.
- FACT (DefiLlama): the top day was **2025-01-24, $15.46M** (2025-01-01: $14.08M; 2025-01-28: $9.24M). The highest
  day of 2026 was 2026-08-27, $3.27M; the lowest was 2026-03-21, $0.60M. — [DefiLlama API](https://api.llama.fi/summary/fees/pump?dataType=dailyRevenue)
- SECONDARY FACT: Cointelegraph puts the daily fee record at "~$15.4M" over 24 to 26 Jan 2025, and also has July 2025
  monthly revenue at "~$25M (80% below January)", a weekly record of $13.5M over 11 to 21 Aug 2025 and cumulative fees
  above $800M on 20 Aug 2025. — [Cointelegraph via TradingView](https://www.tradingview.com/news/cointelegraph:9c3a24b10094b:0-how-pump-fun-captured-80-of-solana-memecoins-and-can-it-last/) (Sept 2025)
- SECONDARY FACT: by July 2024, $60M in fees "a 1% cut of trades" (Wired); "over $250 million in revenue" by Nov 2024
  (Ars Technica, 7 Dec 2024); "nearly $800 million in revenue" since launch (Fortune, 18 Jul 2025). — [Wikipedia, Pump.fun](https://en.wikipedia.org/wiki/Pump.fun); [Fortune](https://fortune.com/crypto/2025/07/18/pump-fun-memecoin-raise-ico-era-600-million-1-3-billion/). Forbes headline 22 Feb 2025: "From Memes To $500 Million In Revenue" — [Forbes](https://www.forbes.com/sites/boazsobrado/2025/02/22/from-memes-to-500-million-in-revenue-the-pumpfun-phenomenon/)
- SECONDARY FACT (CoinDesk, 29 Apr 2026): "Lifetime revenue: Over $1 billion"; "2025 gross protocol revenue:
  $971.37 million"; "2026 annualized ~$320 million"; "current annualized fees $802 million; revenue $416 million". — [CoinDesk](https://www.coindesk.com/markets/2026/04/29/pump-fun-burns-36-of-pump-supply-in-usd370-million-wipe-locks-50-revenue-into-ongoing-buybacks).
  CONFLICT: CoinDesk's $971.37M for 2025 is close to DefiLlama's 2025 *gross fees* ($987.9M), not to DefiLlama's 2025
  *revenue* ($652.5M). CoinDesk's figure most likely counts creator and LP fees.

**Weekly protocol fees reported by the company (bonding curve + PumpSwap + Terminal; CEO newsletter on the PUMP page)**
- FACT (company, [pump.fun/pump-token](https://pump.fun/pump-token), weekly entries): week of 29 Jun to 5 Jul 2026
  $7.20M; 6 to 12 Jul $5.9M; 13 to 19 Jul $5.81M; 20 to 26 Jul $7.56M; 27 Jul to 2 Aug $8.95M; 3 to 9 Aug $10.03M
  ("first week above $10M"); 10 to 16 Aug $10.74M; 17 to 23 Aug $12.48M; 24 to 30 Aug **$16.07M** ("biggest revenue
  week since early September 2025"; Thursday $2.92M, "best single revenue day since September 2025"); 31 Aug to 6 Sep
  $9.75M; 7 to 13 Sep $9.27M; 14 to 20 Sep $10.89M; 21 to 27 Sep $13.64M; 28 Sep to 4 Oct **$16.32M** ("biggest
  revenue week since September 2025", every day above $2M, best day 4 Oct at $2.53M).
- FACT (company): "pump.fun flipped Hyperliquid in 30 day revenue this week" (newsletter of 10 Aug 2026) and "Pump's 7
  day revenue flipped Hyperliquids 7 day revenue" (27 Jul 2026). — [pump.fun/pump-token](https://pump.fun/pump-token).
  SECONDARY FACT: 7-day revenue of $15.16M against Hyperliquid's $15.06M (Blockonomi, 29 Sep 2026). — [Blockonomi](https://blockonomi.com/pump-fun-pump-surges-20-as-platforms-buyback-program-exceeds-466m)
- FACT (DefiLlama, 2026-10-06): Hyperliquid revenue 30d $72.5M against pump's $60.7M (parent, with the app overlap);
  7d $14.1M against $18.6M. INFERENCE: pump leads on 7 days but not on 30 days as of 6 Oct 2026. — [DefiLlama API, hyperliquid](https://api.llama.fi/summary/fees/hyperliquid?dataType=dailyRevenue)

**Product mix**
- INFERENCE (DefiLlama): share of 2026-to-date revenue ex-app: bonding curve 67.6%, PumpSwap 26.5%, Terminal 5.9%.
  The overlapping app line is 2.3%. Q3 2026 ($137.7M): curve 66.4%, PumpSwap 28.3%, Terminal 5.3%, app 5.2%
  (overlapping).
- FACT (DefiLlama methodology): PumpSwap revenue is "the 0.05% protocol fee from each trade". The mobile-app line
  counts curve and PumpSwap fees on trades placed through the app program. Terminal revenue is "trading terminal fees
  retained by Pump.fun after cashback/referral payouts". — [DefiLlama API, parent methodology](https://api.llama.fi/summary/fees/pump?dataType=dailyRevenue)
- INFERENCE: PumpSwap's 2026 revenue/volume ratio is $97.3M / $180.7B ≈ 0.054%. So most PumpSwap volume trades in
  the low-fee tiers (large caps or non-canonical pools, 0.05% protocol) and not in the 0.93% small-cap tier.
- FACT (company): Terminal weekly volume went from $63.8M (13 to 19 Jul 2026) to $184M (a later week); Terminal fees
  were $562K in the week of 7 to 13 Sep 2026. — [pump.fun/pump-token](https://pump.fun/pump-token)
- FACT (company): Custom Pairs (launched 9 Sep 2026) produced "$1.08M in protocol fees ... from September 9 to 13".
  — [pump.fun/pump-token](https://pump.fun/pump-token)

### Inferences
- The business is extremely cyclical. Revenue per day fell from $4.83M (Jan 2025) to $0.65M (Jul 2025), down 87%,
  in six months. It fell again to $0.88M (Jun 2026), then went back to about $2.5M (early Oct 2026). The bottom of the
  cycle is about a fifth of the top.
- Volume, not outcomes, drives revenue: about two thirds still come from the 0.95% protocol slice of the bonding
  curve. That is a transaction tax on speculative trading of brand-new tokens.
- Revenue diversification is real but modest: PumpSwap went from 0% to ~27% of revenue in 18 months, and Terminal adds
  ~6%. No line outside trading fees shows up in any dataset.

### Repo cross-check (corrections)
- `knowledge-base/market/publico-web3.md` says DefiLlama's API returned "dados congelados de 2025". On 2026-10-07 the
  API returned live data to 2026-10-06 for every slug above. The earlier problem no longer holds.
- `publico-web3.md` cites "Receita diária US$ 800 mil (jun/2026) contra US$ 4,8 mi seis meses antes" (The Block).
  FACT: The Block wrote "$800,000 per day so far in June" and "$4.8 million per day it used to generate just six months
  ago" ([The Block, 16 Jun 2026](https://www.theblock.co/post/404806/pump-fun-activity-craters-80-three-months-solana-fees-lower-traders-rotate-perps)).
  CONFLICT: DefiLlama has December 2025 at $1.10M a day, not $4.8M. **$4.83M a day is the January 2025 average**, about
  17 months earlier. Measured on DefiLlama, Dec 2025 to Jun 2026 went from $1.10M to $0.88M a day (-20%).

### Gaps
- Jan and Feb 2024 revenue (before DefiLlama's series starts): not found.
- Whether DefiLlama counts Custom Pairs coins (quote assets other than SOL/USDC) correctly: not stated. The company
  says its own dashboard does not.
- Revenue on non-Solana chains (Base, BNB, Ethereum, HyperEVM, Robinhood Chain via the app and Terminal): the company
  includes some in "Revenue"; DefiLlama's split by chain was not checked.
- Audited financial statements: none found. The UK DevCo's accounts were listed as overdue (see section 5).

## 2. Fee schedule history: bonding curve, graduation, PumpSwap, creator fees, Project Ascend, 2026 changes

### Takeaway
The bonding-curve fee was a flat 1% to pump.fun until May 2025. A creator share was carved out in May 2025 (0.95%
protocol + 0.05% creator). Project Ascend, effective 1 Sep 2025, raised the total to **1.25% (0.95% protocol + 0.30%
creator)** and made PumpSwap fees tier with market cap. The graduation fee fell from 6 SOL to 1.5 SOL and then to
**0.015 SOL**. 2026 added fee sharing, cashback coins (later deprecated), USDC-quoted curves, Custom Pairs and Holder
Rewards. Since 28 Apr 2026, 50% of protocol revenue buys and burns PUMP.

### Cited Findings
- FACT (DefiLlama adapter header, which encodes the fee eras): "< 2025-05-13 pump 1.00% | creator 0.00% total 1.00%";
  "2025-05-13 to 2025-09-15 pump 0.95% | creator 0.05% total 1.00%"; ">= 2025-09-15 pump 0.95% | creator 0.30% OR
  cashback 0.30% total 1.25%"; "Cashback Coins, from 2026-02-17"; migration fees "6 SOL pre-2024-08-09, 1.5 SOL
  ~2025-03, 0.015 SOL after"; "2025-07-14: PUMP buyback begins (100% of pump slice)"; "2026-04-28: buyback share
  drops to 50%". — [DefiLlama dimension-adapters, fees/pumpdotfun.ts](https://github.com/DefiLlama/dimension-adapters/blob/master/fees/pumpdotfun.ts) (read 2026-10-07)
- FACT (pump.fun's official docs repo): "On Monday, September 1, 20:00 UTC ... the programs fee structure will change
  from the existing one to a dynamic fee structure depending on the current market cap of the coin in lamports. This
  new fee structure applies only to: Pump bonding curves; PumpSwap canonical pools" (published 2025-08-29). — [pump-public-docs, FEE_PROGRAM_README.md](https://github.com/pump-fun/pump-public-docs/blob/main/docs/FEE_PROGRAM_README.md).
  INFERENCE: tiers went live on 1 Sep 2025; DefiLlama dates the 0.30% creator slice from 15 Sep 2025. The two dates
  conflict slightly.
- FACT (PumpSwap at launch, 2025): "`lp_fee_basis_points == 20 bps` and `protocol_fee_basis_points == 5 bps`", with
  protocol fees paid to "an array of 8 pubkeys". — [pump-public-docs, PUMP_SWAP_README.md](https://github.com/pump-fun/pump-public-docs/blob/main/docs/PUMP_SWAP_README.md).
  DefiLlama's methodology for PumpSwap: LP 0.20%, protocol 0.05%, coin creator 0.05%. — [DefiLlama API, pumpswap](https://api.llama.fi/summary/fees/pumpswap?dataType=dailyRevenue)
- FACT (current schedule, pump.fun "last updated May 20, 2026"): coin creation free; graduation "0.015 SOL"; bonding
  curve (SOL and USDC) creator 0.300%, protocol 0.95%, LP 0%, total 1.25%. PumpSwap canonical pools tier by market cap,
  from 1.25% total for the smallest caps to 0.30% at 98,240 SOL and above. For USDC-quoted coins: 1.25% at 0 to 59,000
  USDC down to 0.30% at 20,000,000 USDC and above. Protocol (0.05%) and LP (0.20%) are stable in the upper tiers, while
  the creator share falls. Non-canonical pools: creator 0%, protocol 0.05%, LP 0.25%, total 0.30%. "Mobile users may
  experience fee increases up to 0.1% on certain transactions". — [pump.fun/docs/fees](https://pump.fun/docs/fees).
  The full tier table is already in `knowledge-base/market/modelos-de-token.md` section 1.3 and matches.
- FACT (docs commit history, dates of fee-related changes): "Add coin creator fee docs" 2025-05-08; "Publish fee
  program README" 2025-08-29; "Idl and type files for mayhem mode and create v2" 2025-11-07; "Immutable global volume
  accumulator and reserved fee recipients" 2025-11-15; "creator rewards sharing" 2026-01-09; "cashback update"
  2026-02-17; "github fees" 2026-03-05; "permanent fee distribution" 2026-03-19; "BREAKING_FEE_RECIPIENT" 2026-04-22;
  "USDC paired coins" 2026-05-07; "pool virtual quotes reserves" 2026-07-15; "holder rewards coins, cashback
  deprecated" 2026-09-12; "negative virtual quote reserves on PumpSwap pools" 2026-09-29. — [pump-public-docs commits](https://github.com/pump-fun/pump-public-docs/commits/main)
- FACT (cashback, 2026): "Cashback mode is deprecated: `create_v2` now rejects `is_cashback_enabled = [true]`".
  Existing cashback coins keep routing the creator fee to traders. — [PUMP_CASHBACK_README.md](https://github.com/pump-fun/pump-public-docs/blob/main/docs/PUMP_CASHBACK_README.md)
- FACT (Holder Rewards, Sept 2026): on a holder rewards coin "the creator fee ... is set aside for the people who hold
  the coin". "A regular coin can later be converted into a holder rewards coin through a community takeover ... but a
  holder rewards coin can never go back to being a regular coin". The creator fee bps of a coin on a custom pair can be
  changed via the CTO team, while "SOL- and USDC-paired coins always use the standard fee schedule". — [HOLDER_REWARDS_README.md](https://github.com/pump-fun/pump-public-docs/blob/main/docs/HOLDER_REWARDS_README.md)
- FACT (company): Custom Pairs launched 9 Sep 2026 "with 93 pairs at launch and over 70 more added September 12";
  "50% of Custom Pairs revenue going to the $PUMP buyback & burn"; 170 quote assets in use by the week of 14 to 20 Sep.
  App: "Zero fee trading on Solana and seamless crosschain trading with USDC" (10 Aug 2026); "Crosschain fees were cut
  to just 0.1%" (24 Aug 2026). — [pump.fun/pump-token](https://pump.fun/pump-token)
- SECONDARY FACT: in 2024 the platform charged a 1% swap fee and "1.5 Solana tokens when a coin ... is listed" at about
  a $90,000 market cap (Forbes Australia, 14 Nov 2024). Launch tweet, 19 Jan 2024: create a coin "for a cost of < $2".
  — [Wikipedia, Pump.fun](https://en.wikipedia.org/wiki/Pump.fun)
- FACT (who receives the protocol slice): the 0.95% protocol share and PumpSwap's protocol fee go to pump.fun's fee
  recipients. Since 28 Apr 2026, "5,000 basis points" (50%) of net revenue goes to buyback-and-burn under the on-chain
  `buyback_basis_points` parameter, for a one-year term ending April 2027. — [Blockworks token-transparency filing](https://blockworks.com/token-transparency/filing/pump) (filing date 21 Sep 2026). From 14 Jul 2025 to 27 Apr 2026, 100% of revenue went to buybacks (CoinDesk: "Over 9 months, 100% of revenue went to buybacks") — [CoinDesk](https://www.coindesk.com/markets/2026/04/29/pump-fun-burns-36-of-pump-supply-in-usd370-million-wipe-locks-50-revenue-into-ongoing-buybacks)

### Inferences
- Who gets what today on a SOL-paired coin: the trader pays 1.25% on the curve, of which pump.fun keeps 0.95% (half of
  it goes to PUMP buyback and burn). The other 0.30% goes to the creator, to holders (Holder Rewards) or, for legacy
  coins, back to traders (cashback). After graduation the total falls with market cap (1.25% to 0.30%), and the
  creator's share falls fastest.
- Project Ascend (Sept 2025) cut pump.fun's take as a share of the total fee: 1.00 of 1.00% before, 0.95 of 1.25%
  after. The curve's total cost to traders rose 25%, and the extra went to creators. The fee changes look like
  competitive responses: creator fees arrived in May 2025, as Believe/LetsBonk launched; Ascend arrived in Sept 2025,
  after the July 2025 LetsBonk episode; Custom Pairs arrived on 9 Sep 2026, five weeks after StonkFun launched on
  3 Aug 2026 (section 6).

### Repo cross-check
- `modelos-de-token.md` and BP Part 3 section 3.1 (0.015 SOL graduation, 1.25% curve, creator 0.30%, tiers, Holder
  Rewards irreversible) still match the primary docs on 2026-10-07. Two additions: Holder Rewards can now also be
  turned *on* for an existing coin through a community takeover (the reverse is not possible), and cashback is
  deprecated.

### Gaps
- Terminal's per-trade fee rate: not found (DefiLlama only says "fees charged on each trade").
- Mayhem-mode fee rate: not found (DefiLlama counts it as 100% protocol).
- An official "Project Ascend" announcement text: not read. Its dates come from the docs README and DefiLlama.
- The exact dates of the 6 SOL to 1.5 SOL to 0.015 SOL migration-fee changes: only DefiLlama's code comment, which is
  approximate ("~2025-03").

## 3. The PUMP token: ICO, allocations, vesting, buybacks, market cap and price against the ICO

### Takeaway
PUMP sold 33% of its 1T supply at **$0.004 on 12 Jul 2025**: $600M public (sold out in 12 minutes) plus $720M private,
**$1.32B in all, at a $4B FDV**. The price peaked at $0.00882 (14 Sep 2025) and fell to **$0.00115 (25 Jun 2026),
71% below the ICO**. It then rallied to **$0.00621 on 7 Oct 2026, 55% above the ICO**. Cumulative buybacks reached
**$477.3M**, and **170.32B PUMP (17.03% of supply) have been burned** (company, 6 Oct 2026). Market cap is $2.88B and
FDV $5.15B (CoinGecko, 7 Oct 2026).

### Cited Findings
- FACT (Blockworks filing): TGE 12 Jul 2025; private tranche 180B PUMP (18%) at $0.004 = $720M; public 150B (15%) at
  $0.004 = $600M; total $1.32B; FDV at ICO $4B; max supply 1T, fixed. Allocations: ICO 33%, community/ecosystem 24%,
  team 20%, existing investors 13%, livestream incentives 3%, liquidity/exchanges 2.6%, ecosystem fund 2.4%,
  foundation 2%. ICO tokens fully unlocked at TGE. Team plus existing investors (330B): 12-month lock from
  12 Jul 2025, then linear over 3 years to July 2029. Cliff 12 Jul 2026: 82.5B (team 50B, investors 32.5B, ~$125M),
  then 6.875B a month. 15 Jul 2026: 57.279B PUMP (~$86.49M) distributed across 121 wallets. — [Blockworks token-transparency filing, PUMP](https://blockworks.com/token-transparency/filing/pump) (filed 21 Sep 2026)
- SECONDARY FACT: "$600 million within 12 minutes" (Bloomberg, 12 Jul 2025). Total "about $1.3 billion in cash"
  (Fortune, 18 Jul 2025). Bloomberg reported on 3 Jun 2025 that pump.fun planned a "$1 Billion Raise via Token Sale".
  — [Wikipedia citing Bloomberg and Fortune](https://en.wikipedia.org/wiki/Pump.fun); [Fortune](https://fortune.com/crypto/2025/07/18/pump-fun-memecoin-raise-ico-era-600-million-1-3-billion/); [Bloomberg](https://www.bloomberg.com/news/articles/2025-07-12/memecoin-platform-pump-fun-raises-600-million-within-12-minutes)
- FACT (CoinGecko API, 2026-10-07 15:38 UTC): price $0.00620914; market cap $2.883B; FDV $5.155B; circulating 463.91B;
  total supply 829.41B; max 1T; ATH $0.00881908 on 2025-09-14; ATL $0.00115473 on 2026-06-25; 30d +43.0%; 1y -2.1%.
  — [CoinGecko, PUMP](https://www.coingecko.com/en/coins/pump-fun)
- FACT (CoinGecko daily closes): 2025-10-08 $0.006436; 2025-10-11 $0.004032; 2025-11-01 $0.004618; 2025-12-31
  $0.001842; 2026-04-28 $0.001778; 2026-06-25 $0.001282; 2026-08-01 $0.00207; 2026-09-01 $0.004452; 2026-09-16
  $0.003514; 2026-10-05 $0.006518. Reported market cap fell from $1.121B (29 Apr 2026) to $0.629B (30 Apr 2026) at an
  almost unchanged price. — [CoinGecko](https://www.coingecko.com/en/coins/pump-fun). INFERENCE: that step is the
  29 Apr 2026 burn of previously bought-back tokens leaving the circulating count.
- FACT (Blockworks filing): 28 Aug 2026 total supply 837.08B; circulating 396.95B; price $0.004684; market cap $1.86B;
  FDV $3.92B. Update of 6 Oct 2026: circulating 464.12B, total 829.63B, price $0.006316, market cap $2.93B, FDV $5.24B.
  "162.72 billion PUMP purchased and destroyed" (Aug 2026). — [Blockworks filing](https://blockworks.com/token-transparency/filing/pump)
- FACT (company, 6 Oct 2026): "Total bought back and burnt: $477.28M"; "170.32B $PUMP burned"; "17.032%" of supply;
  daily buybacks $1.28M on 6 Oct (50.70% of revenue), $1.30M on 5 Oct (50.56%), $1.26M on 4 Oct (49.81%). Policy:
  "Half of every dollar Pump.fun earns buys $PUMP on the open market, then burns it forever". Weekly cumulative
  buybacks: $437M (31 Aug), $442M (7 Sep), $446M (14 Sep), $451M (22 Sep), $458M (28 Sep), $465M (5 Oct). An earlier
  entry: "In total, 41.80% of the total circulating supply has been bought back & burned". — [pump.fun/pump-token](https://pump.fun/pump-token)
- SECONDARY FACT: on 29 Apr 2026 pump.fun burned "36% of PUMP's circulating supply" worth $370M and moved from 100% to
  50% of revenue for buybacks for one year. PUMP had traded "sideways below its launch valuation" despite nine months
  of 100% buybacks. A co-founder said there was "a lack of trust". — [CoinDesk, 29 Apr 2026](https://www.coindesk.com/markets/2026/04/29/pump-fun-burns-36-of-pump-supply-in-usd370-million-wipe-locks-50-revenue-into-ongoing-buybacks)
- FACT (DefiLlama "holders revenue" = buybacks, from 2025-07-15): cumulative $166.5M by 2025-12-31, $274.3M by
  2026-04-27, $372.0M by 2026-09-30, $379.4M by 2026-10-06. — [DefiLlama API, holders revenue](https://api.llama.fi/summary/fees/pump?dataType=dailyHoldersRevenue).
  CONFLICT: DefiLlama ($379M) is about $98M below the company's $477M. INFERENCE: DefiLlama's pre-April-2026 figure
  equals 100% of the *bonding-curve* revenue only, so it misses buybacks funded by PumpSwap and Terminal. The company's
  figure, roughly $370M by 28 Apr 2026 (consistent with CoinDesk's "$370 million"), fits the broader revenue definition.
- SECONDARY FACT: "more than $230M" spent on buybacks in 2025 (SolanaFloor, 5 Jan 2026; already in
  `monetizacao-e-tesouraria.md`). That sits between DefiLlama's $166.5M and the company's implied total.
- SECONDARY FACT (unlock behaviour, company): "only 8% was sold" of the unlocked team/investor tokens (20 Jul 2026);
  "~84.5% of the unlocked tokens have never left the recipient wallets, and on-chain DEX sales remain under 4%"
  (27 Jul 2026). — [pump.fun/pump-token](https://pump.fun/pump-token). A Blockworks analyst says 77% of the
  team/investor allocation was unmoved (Sept 2026) — [KuCoin flash summarizing Blockworks](https://www.kucoin.com/news/flash/blockworks-analyst-pump-may-be-undervalued-short-term-long-term-uncertainty-remains)
- FACT (rights): PUMP "confers no governance rights, no equity, no debt claim, no dividend, and no redemption right over
  platform revenue or assets" (already in `dois-tokens-e-ico-privado.md`, from the Blockworks filing). Token mint
  `pumpCmXqMfrsAkQ5r49WcJnRayYRqmXz6ae8H7H9Dfn`, Token-2022, 6 decimals. — [Blockworks filing](https://blockworks.com/token-transparency/filing/pump)
- SECONDARY FACT: Padre holders were promised PUMP compensation; the PADRE snapshot date was 24 Oct 2025. — [Blockworks filing](https://blockworks.com/token-transparency/filing/pump); [DL News](https://www.dlnews.com/articles/defi/pump-fun-placates-padre-tokenholders-with-airdrop-promise/)

### Inferences
- Average buyback price: $477.28M / 170.32B ≈ **$0.0028 per PUMP**, 30% below the ICO price. At today's price, the
  burned tokens would be worth about $1.06B.
- Buybacks so far equal about 36% of lifetime revenue ($477M / $1,340M) and about 36% of the ICO raise ($1.32B).
- The token's path shows that buybacks alone did not hold the price. With 100% of revenue going to buybacks
  (Jul 2025 to Apr 2026), PUMP still fell about 80% from its Sept 2025 peak. The rally of Aug to Oct 2026 lines up with
  revenue recovering (Aug 2026 revenue +69% over July) more than with any change in the buyback rate.

### Repo cross-check
- `dois-tokens-e-ico-privado.md` section 5.3 (162.72B burned; $0.004684 on 28 Aug 2026; +17% against the ICO) is out
  of date. As of 6 to 7 Oct 2026: 170.32B burned, $477.28M bought back, price $0.00621 (+55% against the ICO).
- `monetizacao-e-tesouraria.md` (SolanaFloor: PUMP 41% below the ICO in Jan 2026) agrees with CoinGecko (~$0.0019 to
  0.0023 in early Jan 2026).

### Gaps
- A general PUMP airdrop to users: not found (only the Padre compensation and the 24% community allocation).
- Daily price for Jul to early Oct 2025: CoinGecko's free API only covers 365 days, so I could not read it.
- Exchange venues and per-venue amounts of the ICO: not read.

## 4. Valuation: equity rounds, implied valuation, revenue multiples, peer comparisons

### Takeaway
The only equity price found is a **pre-TGE secondary sale of a $15M stake at a $1.5B valuation** (SecondLane). The
token sale then set a $4B FDV, about **5.7x trailing revenue**. At the June 2026 low, PUMP's market cap (~$0.44B) was
about **1x trailing revenue**. Today it is $2.88B market cap, **about 6x trailing and 4x run-rate revenue**. Peers
trade far higher: Hyperliquid about 28x trailing revenue by market cap, Jupiter about 12x, Raydium about 27x.

### Cited Findings
- FACT (Blockworks filing): "Third-party shareholder sale: $15 million stake at $1.5 billion valuation (SecondLane,
  pre-TGE)". — [Blockworks filing](https://blockworks.com/token-transparency/filing/pump)
- SECONDARY FACT: the token sale was planned as "$1 billion raise ... at $4 billion valuation" (Bloomberg, 3 Jun 2025).
  — [Wikipedia citing Bloomberg](https://en.wikipedia.org/wiki/Pump.fun)
- SECONDARY FACT (Blockworks analyst Shaunda Devens, X post dated 2026-09-10 by its ID): PUMP at a "2.8x
  price-to-sales" multiple on "~$677 million" annual revenue. Fair-value range $0.0108 to 0.0205 (2.3 to 4.4x upside);
  59 to 76% downside "if activity drops"; treasury $2B "controlled by Baton Corp, not PUMP holders"; buyback expires
  April 2027. — [KuCoin flash](https://www.kucoin.com/news/flash/blockworks-analyst-pump-may-be-undervalued-short-term-long-term-uncertainty-remains); [X post](https://x.com/shaundadevens/status/2098041316596748509).
  CONFLICT: the summary quotes a price of $0.00645 "as of Sept 9", while CoinGecko's close on 2026-09-09 was $0.004315.
  Treat the price in that summary as unreliable.
- Weak (search summary only): "Ignas and Delphi Digital" argued PUMP was undervalued at a $4B FDV, with FDV/earnings
  below most DeFi leaders; an account called ~2x P/S "criminally undervalued". — not opened.

**Multiples (INFERENCE; revenue from DefiLlama ex-app, price and market cap from CoinGecko)**

| Date | Price | Market cap | FDV | Trailing 365-day revenue | MC / TTM | FDV / TTM | FDV / 30-day annualized |
|---|---|---|---|---|---|---|---|
| 2025-07-12 (ICO) | $0.004 | n/a | $4.0B | $697.7M | n/a | 5.7x | 9.0x ($442M) |
| 2025-12-31 | $0.001842 | $1.087B | ~$1.84B (1T supply) | $652.5M | 1.7x | 2.8x | 4.6x ($399M) |
| 2026-06-25 (low) | $0.001282 (close) | $0.443B | ~$1.07B (~838B supply) | $440.9M (to 30 Jun) | 1.0x | 2.4x | 3.3x ($323M) |
| 2026-10-07 | $0.00621 | $2.883B | $5.155B | $463.5M | 6.2x | 11.1x | 7.5x ($689M) |

- On the company's 90-day annualized $565.19M: market cap 5.1x, FDV 9.1x (INFERENCE).
- Peers, same basis (CoinGecko markets 2026-10-07; DefiLlama 1y revenue): Hyperliquid market cap $19.71B / $709.0M =
  **27.8x** (FDV $84.63B, 119x); Jupiter $1.044B / $83.5M = **12.5x**; Raydium $0.674B / $25.1M = **26.9x**; PUMP
  $2.909B / $463.5M = **6.3x**. — [CoinGecko markets API](https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=hyperliquid,jupiter-exchange-solana,raydium,pump-fun); [DefiLlama, hyperliquid](https://defillama.com/protocol/hyperliquid); [jupiter](https://defillama.com/protocol/jupiter); [raydium](https://defillama.com/protocol/raydium).
  Caveat: DefiLlama's "revenue" is defined differently for each protocol, so the peer multiples are rough.

### Inferences
- The market prices pump.fun's revenue at a deep discount to other crypto apps. Plausible reasons, all named by the
  sources above: the token has no claim on revenue or assets, and the treasury belongs to a private UK company. The
  buyback commitment runs only one year, to April 2027. Memecoin revenue is very cyclical, and competitors can take
  share in weeks.
- For a startup pitching "the pump.fun of on-chain markets": even the category leader, with about $0.5 to 0.7B of
  annual revenue, has traded between 1x and 11x revenue in fifteen months. The valuation follows activity almost
  one-for-one.

### Gaps
- Pre-ICO equity rounds (seed or Series A amounts, investors, valuations): not found. The 13% "existing investors"
  allocation implies earlier investors, but none was named in the sources read.
- A dated analyst FDV/revenue comparison from Messari or Artemis: not found (search budget exhausted).

## 5. Acquisitions, spending, team, treasury and money moved

### Takeaway
pump.fun is run by **Baton Corporation Ltd** (England and Wales), owned by its three founders. It has bought three
trading-tool companies: **Kolscan (Jul 2025), Padre (Oct 2025, now "Terminal") and Vyper (Feb 2026)**, all on
undisclosed terms. It funds ecosystem programmes: a $3M hackathon, the Pumpcade pre-seed, trading competitions and
bounties. Arkham labels **$2.84B of on-chain assets** to pump.fun (6 Oct 2026), but $2.19B of that is its own PUMP.
Non-PUMP assets come to about $0.6B (SOL ~$390M, USDC $169M, USDT $46M). Headcount was not found.

### Cited Findings
- FACT (Blockworks filing, citing Companies House): Baton Corporation Ltd, company 14743013, incorporated 20 Mar 2023;
  registered office in Mildenhall, Suffolk; "accounts overdue (next due 30 June 2026)". Noah Tweedale (CEO) 25 to 50%
  of shares and >75% of voting rights; Alon Cohen (COO) 25 to 50%; Dylan Kerler (CTO) 25 to 50%. — [Blockworks filing](https://blockworks.com/token-transparency/filing/pump)
- FACT (company): "I'm the CEO of Baton Corporation, the DevCo that develops and maintains pump.fun"; the page is
  "Written and presented by Baton Corporation for the Pump Foundation". — [pump.fun/pump-token](https://pump.fun/pump-token)
- FACT (Blockworks filing): acquisitions Kolscan (July 2025), Padre (October 2025; PADRE snapshot 24 Oct 2025) and
  Vyper (February 2026). Glass Full Foundation launched 8 Aug 2025 and deployed 2,022 SOL into ten ecosystem coins on
  9 Aug 2025. Incidents: 16 May 2024 bonding-curve exploit (~$1.9M); X account compromise 26 Feb 2025; Instagram
  compromise April 2026. — [Blockworks filing](https://blockworks.com/token-transparency/filing/pump)
- SECONDARY FACT (The Block, 5 Feb 2026): pump.fun acquired Vyper, a trading-execution terminal. "No financial details
  disclosed". Vyper's infrastructure moves into Terminal and Vyper will be sunset. Alon Cohen: "Despite market
  conditions, we're expanding our team rapidly and aggressively." Nearly 30,000 tokens launched on 2 Feb 2026, against
  9,000 to 13,000 a day in early Oct 2025. — [The Block](https://www.theblock.co/news/ecosystems/2026-02-05-pump-fun-acquires-vyper-388764)
- SECONDARY FACT (Padre): the 24 Oct 2025 acquisition notice said PADRE "will no longer have utility" (-67%), and
  compensation in PUMP was promised two days later. — [DL News, 28 Oct 2025](https://www.dlnews.com/articles/defi/pump-fun-placates-padre-tokenholders-with-airdrop-promise/) (already in the repo)
- SECONDARY FACT (Arkham via Crypto Briefing, 6 Oct 2026): total $2.838B on-chain: 341.224B PUMP ($2.19B), 2.786M WSOL
  ($336M), 450.5K SOL ($54M), 168.7M USDC, 46M USDT, plus other memecoins. — [Crypto Briefing](https://cryptobriefing.com/pump-fun-on-chain-treasury-pump-token/)
- SECONDARY FACT (money moved): "Pump.Fun Cashes Out $436.5M USDC, Token Slumps 24% in 1W" (Cryptonews headline,
  24 Nov 2025). Wikipedia's text, citing the same article, says "$465.5 million". CONFLICT between the two numbers; the
  article itself returned HTTP 403. — [Cryptonews](https://cryptonews.com/news/pump-fun-cashes-out-436-5m-usdc-token-slumps-24-in-1-week/); [Wikipedia](https://en.wikipedia.org/wiki/Pump.fun)
- SECONDARY FACT (ecosystem spending): "$3 million Build in Public Hackathon" launched January 2026; zauth (14 Feb 2026)
  and Opal received $250,000 each. — [GlobeNewswire, 26 Feb 2026](https://www.globenewswire.com/news-release/2026/02/26/3245639/0/en/pumpmarket-brings-prediction-markets-to-pump-fun-public-hackathon.html).
  pump.fun led a $1M pre-seed in Pumpcade (2 Apr 2026). — [The Block](https://www.theblock.co/news/deals/2026-04-02-pump-fun-pre-seed-funding-round-livestream-prediction-markets-pumpcade-396213)
- FACT (company spending items): app trading competition, "$50,000 prize pool" (ended 16 Jul 2026); new competition
  from 3 Oct 2026 with "$100,000 in solo prizes and another $100,000 for squads". GO bounties: "~3,000 bounties
  created, 18,000 submissions, and over $600k paid out to submitters". BOOST: "since going live July 21, more than
  110,000 SOL (~$8.3M) has been injected into 8,400+ newly bonded coins via buybacks & burns". The hiring note reads
  "Growth Marketing Lead at Baton Corporation ... $400k to $1M base plus incentives". A 48-hour "99% cashback event" on
  Terminal marked Robinhood Chain support. — [pump.fun/pump-token](https://pump.fun/pump-token)

### Inferences
- The ICO raised $1.32B in July 2025. Fifteen months later, Arkham can see about $0.6B of non-PUMP assets on-chain, and
  the Nov 2025 USDC move ($436.5M or $465.5M) probably went to off-chain custody. The sources read do not reconcile
  the treasury.
- The acquisitions point one way: pump.fun is buying the trading front-end layer (KOL tracking, terminals, EVM
  execution), not new kinds of markets.

### Gaps
- Team size or headcount: not found. Only "expanding our team rapidly" (Feb 2026) and the hiring post.
- Acquisition prices: undisclosed in every case.
- Cumulative SOL sold since 2024 (the Lookonchain/Kraken series): not found; the search budget ran out.
- Consolidated spending on livestream incentives (3% of supply) and the ecosystem fund: not found.

## 6. Usage metrics and market share

### Takeaway
pump.fun's share of Solana launchpad revenue has twice collapsed and twice recovered. **In July 2025 LetsBonk took the
lead**, and pump.fun's share of curve revenue fell to about 34% by my DefiLlama count; it was back to 85 to 95% from
September 2025. **In September 2026 StonkFun, a stock-paired launchpad, cut it to about 46%**. Weekly coin launches ran
at 266,000 to 311,000 in late August 2026. The graduation rate is below 1%: 0.26% in June 2026. The "80 million
wallets" figure is Crypto Briefing's (30 Aug 2026), not The Block's. It counts wallets, not people.

### Cited Findings

**Wallets and users**
- SECONDARY FACT: "The platform has attracted roughly 80 million unique wallets"; lifetime trading volume $214B;
  "total fees earned $1.3 billion"; 30-day average daily volume $347M; app daily volume $50M and 905,000 transactions
  (from $250,000 and 2,500 at launch). — [Crypto Briefing, 30 Aug 2026](https://cryptobriefing.com/pumpfun-app-50m-daily-volume/)
- FACT (company, data as of 6 Oct 2026): "Daily active wallets on Solana, with and without Pump activity. Solana
  913.1K, excl. Pump 124.5K". "The app crossed 100,000 daily active users" (week of 24 to 30 Aug 2026). — [pump.fun/pump-token](https://pump.fun/pump-token).
  INFERENCE (uncertain): if 913.1K is all Solana daily active wallets and 124.5K is those without Pump activity, the
  company is claiming ~86% of Solana DAW touch Pump products. The page does not define the series.

**Volume (DefiLlama)**
- FACT: bonding-curve volume 2024 $32.2B, 2025 $49.1B, 2026 to date $18.8B (all-time $100.1B since 2024-04-26; peak
  day 2025-01-23 $553M). PumpSwap volume 2025 $105.2B, 2026 to date $180.7B (all-time $285.9B; peak day 2026-03-18
  $1.93B). — [DefiLlama API, pump.fun volume](https://api.llama.fi/summary/dexs/pump.fun?dataType=dailyVolume); [pumpswap volume](https://api.llama.fi/summary/dexs/pumpswap?dataType=dailyVolume).
  CONFLICT: "$214B lifetime" (Crypto Briefing) does not match DefiLlama's $386B combined curve and PumpSwap volume.
  Arkham/Crypto Briefing's "cumulative DEX volume exceeds $97 billion" matches DefiLlama's curve-only figure.
- FACT (company): "$4.72B traded this week across the Bonding Curve and PumpSwap ... matching the biggest volume week
  since early May 2025" (28 Sep to 4 Oct 2026). Thursday 27 Aug 2026 at $828M was "the biggest volume day of 2026".
  — [pump.fun/pump-token](https://pump.fun/pump-token)

**Launches and graduation**
- FACT (company): "266,000 new coins launched this week" (17 to 23 Aug 2026); "310,696 new coins launched this week, up
  17%" (24 to 30 Aug 2026); Holder Rewards, first full week: "more than 40,000 coins launched" (14 to 20 Sep 2026).
  — [pump.fun/pump-token](https://pump.fun/pump-token). INFERENCE: about 38,000 to 44,000 coins a day in late Aug 2026.
- SECONDARY FACT: graduation rate 0.26% (7-day average), "80% decline in the last three months" (The Block, 16 Jun
  2026) — [The Block](https://www.theblock.co/post/404806/pump-fun-activity-craters-80-three-months-solana-fees-lower-traders-rotate-perps).
  0.7 to 0.8% in Jul to Aug 2025 — [Cointelegraph](https://www.tradingview.com/news/cointelegraph:9c3a24b10094b:0-how-pump-fun-captured-80-of-solana-memecoins-and-can-it-last/).
  FACT (company, mid-2026, undated entry): bounty-linked coins graduate at 32.7% "vs 0.82% for other new coins" —
  [pump.fun/pump-token](https://pump.fun/pump-token).
- Cointelegraph's "Daily launches peak ~1,200/day" (Jan 2025) is far below every other launch count and probably
  measures something else, such as graduations. Do not use it.

**Market share**
- INFERENCE (my DefiLlama count; share of *bonding-curve / launchpad revenue* among Solana launchpads: pump.fun curve,
  BONK.fun, Graphite (LetsBonk JV), Raydium LaunchLab, StonkFun, Bags, Believe, Meteora DBC, Moonshot Create, boop):
  Apr 2025 95%; May 2025 61% (Believe $21.3M); **Jul 2025 34%** (BONK.fun $20.1M + LaunchLab $9.4M against pump's
  $17.3M); Aug 2025 63% (Bags $12.9M); Sep to Dec 2025 85 to 93%; Jan 2026 65% (Bags $10.0M); Feb to Aug 2026 89 to
  96%; **Sep 2026 46%** (StonkFun $27.4M against pump's $33.1M); 1 to 6 Oct 2026 67%; last 30 days 48%. — [DefiLlama, stonkfun](https://defillama.com/protocol/stonkfun); [bonk.fun-launchpad](https://defillama.com/protocol/bonk.fun-launchpad); [launchlab](https://defillama.com/protocol/launchlab); [bags](https://defillama.com/protocol/bags).
  Caveats: BONK.fun, Graphite and LaunchLab may double-count parts of the same LetsBonk fees. pump.fun's PumpSwap
  revenue is left out, and so are rivals' DEX revenues. EVM rivals such as Pons are not included.
- SECONDARY FACT (CoinGecko Learn, data to 7 Sep 2026, cross-chain set): 30-day launchpad revenue: pump.fun $35.5M
  (64.20%), Pons $15.6M (28.21%), StonkFun $4.2M (7.58%). Daily on 7 Sep: Pons $1.47M, StonkFun $1.20M, pump.fun
  $0.93M. Pons launched 14 Jul 2026 on Robinhood Chain (which went live 1 Jul 2026); StonkFun on 3 Aug 2026. In July
  2025, "BONKfun achieved 78% market share while Pumpfun's collapsed from 80% down to 13%". — [CoinGecko Learn](https://www.coingecko.com/learn/memecoin-launchpad-wars-pumpfun-stonkfun-ponsfamily)
- SECONDARY FACT: pump.fun went from 5% to 90% of launches in two weeks after starting buybacks (CMC Academy, mid-2025,
  citing analyst WazzCrypto) — [CoinMarketCap Academy](https://coinmarketcap.com/academy/article/pumpfun-reclaims-90percent-market-share-in-solana-launchpad-war).
  73 to 74% 7-day share in mid-Aug 2025 — [Cointelegraph](https://www.tradingview.com/news/cointelegraph:9c3a24b10094b:0-how-pump-fun-captured-80-of-solana-memecoins-and-can-it-last/)
- Weak (search snippets): StonkFun out-earned pump.fun on 6 Sep 2026 ($1.508M); BSCN (X, 23 Sep 2026) has 7-day
  revenue StonkFun $8.13M against pump.fun $7.99M; StonkFun puts "around 60%" of revenue into STONK buybacks. — [BSCN on X](https://x.com/BSCNews/status/2102759892863836292); [CoinDCX](https://coindcx.com/blog/crypto-news-global/solana-launchpad-stonkfun-out-earned-pump-fun-for-a-day/)
- FACT (DefiLlama, last 30 days to 6 Oct 2026): other launchpads' revenue: Pons V2 (Robinhood Chain) $14.9M; Flap
  (BSC and others) $9.4M; four.meme (BSC) $0.26M (1y $77.0M); Bags $0.18M (1y $16.4M); Believe ~$0 (1y $0.28M). — [DefiLlama fees overview API](https://api.llama.fi/overview/fees?dataType=dailyRevenue)

### Inferences
- Share swings come from two things: incentives (LetsBonk in July 2025; buyback-funded rivals in 2026) and new pairing
  features (StonkFun's stock-quoted coins). pump.fun has answered by copying within weeks: buybacks in July 2025,
  Custom Pairs in September 2026. The moat is distribution (app, Terminal, brand) more than technology.
- Graduation below 1% means about 99% of markets created on pump.fun die on the curve. If Brot lets anyone create a
  market, most user-created markets should be expected to have no liquidity.

### Repo cross-check
- `publico-web3.md` lists "80 milhões; volume vitalício > US$ 214 bi; jun/2026; The Block [S3]". The Block article S3
  (16 Jun 2026), fetched today, does not contain the 80M, $214B or $347M figures. They appear in **Crypto Briefing,
  30 Aug 2026**. Correct the source and date. They are wallets, not unique people.
- BP Part 3 section 3.1 (graduation 0.26% in Jun 2026; historical ~1.4%) agrees with The Block. The company's own
  mid-2026 figure for ordinary new coins is 0.82%.

### Gaps
- Total tokens created since launch: not found (no Dune access; search budget exhausted).
- Monthly active wallets over time: the repo's 5.2M (May 2025) and 1.8M (Dec 2025) remain unverified.
- Share by number of launches or by graduated tokens for 2026 (Dune adam_tehc / hashed): not read.

## 7. Prediction or event markets, and expansion beyond memecoins

### Takeaway
As of 7 Oct 2026 I found **no pump.fun-native prediction-market product**. pump.fun has instead backed one: it **led a
$1M pre-seed (2 Apr 2026) in Pumpcade**, which runs livestream prediction markets resolving in 60 seconds to 30
minutes and later raised a $5M seed led by Jump Crypto and Foundation Capital. Separately, **PumpMarket**, an entrant
in pump.fun's $3M hackathon, runs **parimutuel "Graduation Markets" on whether a new pump.fun coin graduates within an
hour, settled from on-chain state**. That is the closest existing analogue to Brot Markets. pump.fun's own expansion
has gone to tokenized-stock pairs (Custom Pairs, 9 Sep 2026), cross-chain trading, social "Callouts" and GO bounties.

### Cited Findings
- SECONDARY FACT (The Block, 2 Apr 2026): Pumpcade lets users create prediction markets "embedded in livestream chats",
  resolving "in 60 seconds to 30 minutes" across crypto prices, stocks, sports and real-time events. Resolution uses
  "direct official API calls or deterministic data". Founder Harrison Leggio. The $1M pre-seed was led by pump.fun,
  with Foundation Capital and angel RadioSolace. Private beta January 2026 (500 users), open beta Q2 2026, then
  mainnet. Alon Cohen: "Pumpcade shows how powerful it is when builders ship publicly and let the community validate
  them early." — [The Block](https://www.theblock.co/news/deals/2026-04-02-pump-fun-pre-seed-funding-round-livestream-prediction-markets-pumpcade-396213)
- SECONDARY FACT (Phemex, 17 Apr 2026): Pumpcade raised a $5M seed led by Jump Crypto and Foundation Capital. It is
  described as a "Solana-based live-streaming prediction market and meme coin launch platform" that integrates with
  pump.fun's chat. pump.fun is not listed in the seed round. — [Phemex](https://phemex.com/news/article/pumpcade-secures-5m-seed-funding-led-by-jump-crypto-73862).
  Weak (search summary): valuation "$44M"; a PUMPCADE token rose 100% in a week. — [Cryptopolitan](https://www.cryptopolitan.com/pump-fun-completes-5m-funding-for-pumpcade/) (HTTP 403, not read)
- SECONDARY FACT (press release, self-reported, 26 Feb 2026): PumpMarket, "a crypto-native prediction market on Solana",
  is an entrant in pump.fun's "$3 million Build in Public Hackathon" (January 2026) and not an official pump.fun product.
  "Graduation Markets" (mainnet, late Feb 2026) let users predict whether new pump.fun tokens graduate within 1-hour
  windows. Users stake SOL in a parimutuel pool; settlement is "anchored to objective on-chain state changes" with no
  discretionary settlement. Planned: downside, market-cap milestone, volume-threshold and exchange-listing markets.
  First 48 hours: 63 markets resolved, 66 SOL volume, 150+ predictions. Fees were not disclosed. — [GlobeNewswire](https://www.globenewswire.com/news-release/2026/02/26/3245639/0/en/pumpmarket-brings-prediction-markets-to-pump-fun-public-hackathon.html)
- FACT (company newsletters, 6 Jul to 5 Oct 2026, read in full): the products named are the launchpad, PumpSwap, the
  mobile app, Terminal, GO (bounties), Callouts (social trading, public 7 Aug 2026), Custom Pairs, Holder Rewards,
  Mayhem, BOOST, cross-chain support (Base, BNB, Ethereum, HyperEVM from 26 Aug 2026, Robinhood Chain, Arc), Apple Pay
  buys, limit orders and a "Stocks feed for tokenized stocks". None is a prediction or event market. The CEO wrote
  that "Many upcoming features and products will only be announced upon release and are being worked on by Baton
  Corporation ... in secret", and that "Baton and the Foundation are very aware of the activity happening on other
  chains". — [pump.fun/pump-token](https://pump.fun/pump-token)
- FACT (company): Custom Pairs launched 9 Sep 2026, letting creators "launch coins paired with tokenized stocks, crypto
  majors and more on Solana". From 9 to 13 Sep, "$310M was traded on Custom Pairs by 180,000 traders, 8.6% of the
  week's volume". "Robinhood tokenized stocks are now tradable in the Pumpfun app ... (excl. UK, US, CH, CA)". — [pump.fun/pump-token](https://pump.fun/pump-token).
  SECONDARY FACT: pairs include Tesla, NVIDIA, Circle, Nasdaq and S&P 500 trackers via xStocks and Sunrise. — [Bitcoin.com News](https://news.bitcoin.com/defi/pump-fun-lets-memecoins-trade-against-tokenized-stocks-on-solana/); [crypto.news](https://crypto.news/pumpfun-moves-beyond-meme-coins-with-new-update/)
- FACT (company): GO bounties: "6 of 10 bounties are linked to coins"; "578 bounty coins ... have done $498M in volume".
  — [pump.fun/pump-token](https://pump.fun/pump-token)
- Already in the repo (`publico-web3.md`): Polymarket lists markets *about* PUMP, but not about third-party tokens'
  on-chain facts.

### Inferences
- pump.fun's pattern is to let the ecosystem test a new category and then buy or copy what works: Kolscan, Padre and
  Vyper for terminals; Custom Pairs after StonkFun. Pumpcade (an investee, integrated with pump.fun chat) and
  PumpMarket (a hackathon entrant with on-chain-settled parimutuel graduation markets) put event markets one step away
  from pump.fun's distribution. The risk for Brot is that pump.fun adds pot-style markets on its own coins inside its
  app with little warning; the CEO says new products ship "in secret".
- PumpMarket's design (parimutuel pool in SOL, objective on-chain settlement, markets about pump.fun coin outcomes)
  overlaps directly with Brot's pot model and its on-chain-only resolution. Its first-48-hour traction (66 SOL) was
  tiny.
- pump.fun's stated ambition is mass-market: "an app used by hundreds of millions" (hiring post). Its expansion beyond
  memecoins so far means *more quote assets and more chains for the same coin-launch-and-trade loop*, not new kinds of
  contracts.

### Gaps
- Any pump.fun statement, after Apr 2026, specifically about prediction markets: not found in the newsletters or the
  sources read. A dedicated search (X posts by @pumpdotfun, @a1lon9, Tweedale) was not possible after the search
  budget ran out.
- Pumpcade's live metrics, fees and status after the Q2 2026 open beta: not found.
- PumpMarket's fee or house cut, and its traction after February 2026: not found.
