# Open market creation: competitors and precedents for Brot Markets (2018 to October 2026)

Research notes for Brot Markets, written 2026-10-07. Every item is labelled **FACT** (a primary source: project docs,
site, contract source, terms, on-chain data, the DefiLlama API, or a Colosseum Copilot project record), **SECONDARY
FACT** (press, aggregator, wiki, academic paper, or search-result text not checked against a primary), or
**INFERENCE** (my reasoning from cited items). "Accessed" means fetched on 2026-10-07. Brot vocabulary is used in my
own prose (markets, positions, participants); source wording is quoted as written.

Method and limits: the session's shared web-search budget ran out partway through. After that, only known URLs, the
DefiLlama API, GitHub, Solana RPC and Colosseum Copilot data were used. `polymarket.com` failed DNS from this machine,
so Polymarket market data comes from aggregators. Several items rest on one source, and that is said. This file
updates `knowledge-base/competitors/mercados-de-previsao-web3.md` (2026-10-03), `competitor-longlist.md` and
`top-5-competitor-analysis.md` (2026-10-04). Section 2 lists what changed since then.

## 1. Who lets the public create event markets (2018 to Oct 2026), and who called itself "the pump.fun of prediction markets"?

### Takeaway
At least 35 projects have offered, or claimed to offer, public market creation. Four of them were explicitly pitched
as the "pump.fun" of the category: XO Market, Xmarket, Melee and PNP (the last two as "pump.fun meets Polymarket").
None of the Solana ones runs open creation with real money at meaningful scale today. Melee is still on devnet, PNP
pivoted to a token, PumpMarket's site is offline, and Pumpcade has no confirmed mainnet. The open-creation venues with
real volume are on other chains: XO Market (own rollup), Limitless (Base) and, gated by a large stake, Hyperliquid
HIP-4.

### Cited Findings

**Who used the "pump.fun" label**

- **XO Market.** Blockworks Research titled its piece on XO "pump.fun of prediction markets". **SECONDARY FACT**,
  2025-07-01 — [Blockworks Research](https://blockworks-research.beehiiv.com/p/pump-fun-of-prediction-markets)
- **Xmarket.** Its own press release says "Xmarket is Pump.fun for Prediction Markets": BNB Chain, private beta in
  February 2026 in Seoul. **SECONDARY FACT** (press release), 2026-02-27 and 2026-03-04 —
  [Crypto Briefing PR](https://cryptobriefing.com/prediction-markets-have-a-creator-problem-2/),
  [Bitcoin.com PR](https://news.bitcoin.com/xmarket-launches-beta-on-bnb-chain-mainnet-the-first-prediction-market-that-pays-creators-and-early-believers/)
- **Melee.** Its Breakout 2025 hackathon description: "a viral market platform blending PumpFun-style speculation with
  Polymarket-style prediction markets". **FACT** (Copilot record), accessed —
  [Colosseum: Melee Markets](https://colosseum.com/projects/explore/melee-markets)
  - A site at `meleemarkets.fun` titled "Melee - Where Pump.fun Meets Polymarket" appeared in search but returned
    HTTP 523. Provenance unverified; it may not be official. **SECONDARY FACT**, accessed — [meleemarkets.fun](https://meleemarkets.fun/)
- **PNP.** "Think Pump.fun meets Polymarket", per the PNP materials cited in `top-5-competitor-analysis.md` §2.1
  (2026-10-04). **SECONDARY FACT** (carried over from the prior note).
- **Dum.fun.** Its hackathon description: "Pump fun meets Polymarket". Colosseum Frontier 2026, devnet. **FACT**
  (Copilot record) — [Colosseum: Dum.fun](https://colosseum.com/projects/explore/dum.fun)
- **Bubblegum.** "we took the engine from Pump.fun and built an attention surfacing machine for prediction markets".
  Frontier 2026, by the creators of PNP. **FACT** (Copilot record) — [Colosseum: Bubblegum](https://colosseum.com/projects/explore/bubblegum)
- **Pumpcade and PumpMarket.** Both are pump.fun-adjacent: one backed by pump.fun, one built in pump.fun's hackathon.
  Neither was found using the label. **SECONDARY FACT** —
  [The Block, 2026-04-02](https://www.theblock.co/post/396213/pump-fun-pre-seed-funding-round-livestream-prediction-markets-pumpcade),
  [GlobeNewswire, 2026-02-26](https://www.globenewswire.com/news-release/2026/02/26/3245639/0/en/pumpmarket-brings-prediction-markets-to-pump-fun-public-hackathon.html)
- **Two names seen once.** CoinDesk names "Nine Lives" and "Warm Protocol" as rivals that "struggled to convert the
  concept into meaningful liquidity, resulting in inactive markets". Neither was verified further. **SECONDARY FACT**,
  2026-04-30 — [CoinDesk](https://www.coindesk.com/business/2026/04/30/xo-market-bets-on-user-generated-prediction-markets-to-rival-polymarket-and-kalshi)

**Long list.** Status is as of the cited date. "Open" means the public can create markets.

| # | Project | Chain | Launch | Who creates | Status (label, source, date) |
|---|---|---|---|---|---|
| 1 | Augur v1 / v2 | Ethereum | 2018-07-09 / 2020-07-28 | Open, with validity bond | Legacy. DefiLlama TVL $2.01M on 2026-10-07 [FACT, api.llama.fi/protocol/augur]; v2 launch [SECONDARY, [The Block](https://www.theblock.co/post/73057/augur-v2-launch) 2020-07-28] |
| 2 | Augur Turbo | Polygon | May 2021 | Unverified (Chainlink-fed sports and crypto markets) | Dead. Repo last pushed 2021-12-17 [FACT, GitHub AugurProject/turbo]; launch [SECONDARY, [Decrypt](https://decrypt.co/71811/sports-betting-goes-high-speed-augur-launches-turbo-offering) 2021-05-24] |
| 3 | Augur reboot (Lituus, Zoltar) | Ethereum and L2 | Reboot 2025-04-01 | Not found | Reboot under way. First real fork closed 2026-08-03; app layer appears to be testnet [FACT, [Augur reboot blog](https://raw.githubusercontent.com/AugurProject/augur-reboot-website/main/src/content/blog/post-fork-announcements/index.mdx) 2026-08-05; INFERENCE on testnet] |
| 4 | Omen (Presagio) | Ethereum, then xDai/Gnosis | ~2020-07; xDai 2021-02 | Open (Conditional Tokens and FPMM) | Dormant. Repo last pushed 2023-09-20 [FACT, [GitHub](https://github.com/protofire/omen-exchange)]; presagio.pm did not resolve when accessed [INFERENCE: offline] |
| 5 | Seer | Ethereum, Gnosis | Listed on DefiLlama 2024-10-17 | Open, with a Kleros "Verified" list | Live, small. $142k volume in 30 days [FACT, DefiLlama API, accessed] |
| 6 | Zeitgeist | Polkadot parachain | (Kusama era earlier) | Open (1,000 ZTG bond) or advised (200 ZTG) | Dormant. Last release 2025-08-07; listed under "Archive" [FACT, [GitHub](https://github.com/zeitgeistpm/zeitgeist); SECONDARY, [polkadotecosystem](https://polkadotecosystem.com/dapps/archive/zeitgeist/)] |
| 7 | Polkamarkets | EVM | — | Gated (`isAllowedToCreateMarket`, lock tokens for a "land") | Near-zero. TVL $14k on 2026-10-07 [FACT, DefiLlama API; [contract](https://github.com/Polkamarkets/polkamarkets-js/blob/main/contracts/PredictionMarketV3_4.sol)] |
| 8 | Myriad | Abstract, Linea, then BNB | 2025-01 | Unverified | Live. 30-day volume $2.70M [FACT, DefiLlama API]; BNB/USD1 move [SECONDARY, [Decrypt](https://decrypt.co/360708/myriad-to-use-usd1-on-bnb-chain-as-exclusive-settlement-asset) 2026-03-11] |
| 9 | Manifold | Web2, play money | — | Open; the creator resolves | Live [FACT, [Manifold FAQ](https://docs.manifold.markets/faq) accessed] |
| 10 | Limitless | Base | Creator markets 2026-06-04 | Any signed-in user, with daily limits | Live; volume falling after an April 2026 peak [FACT, [docs](https://docs.limitless.exchange/user-guide/user-generated-markets.md); SECONDARY, [DeFi Rate](https://defirate.com/news/limitless-files-cftc-approval-after-record-1-66b-month/) 2026-05-05] |
| 11 | XO Market | Own rollup (Celestia DA) | Mainnet beta mid-Nov 2025 | Open; the creator sets fees | Live beta. 600+ user markets [SECONDARY, [CoinDesk](https://www.coindesk.com/business/2026/04/30/xo-market-bets-on-user-generated-prediction-markets-to-rival-polymarket-and-kalshi) 2026-04-30] |
| 12 | Xmarket | BNB Chain | Private beta Feb 2026 | Open; creator gets up to 50% of fees | Private beta at the PR date. Later status not found [SECONDARY, PR 2026-03-04] |
| 13 | Truemarkets, renamed Trueo | Base, then Ethereum | 2025-03-11; Ethereum 2026-09-22 | Not found (guidelines only) | Live, nearly unused: ~$780k lifetime volume [SECONDARY, [KuCoin](https://www.kucoin.com/news/flash/trueo-migrates-to-ethereum-mainnet-after-vitalik-buterin-s-endorsement-token-surges-10x) 2026-09-22] |
| 14 | Opinion | BNB Chain | 2025-10-23 | "Permissionless" with AI help in the docs; not confirmed for ordinary users | Live [FACT, [docs](https://docs.opinion.trade); SECONDARY, [DeFi Rate](https://defirate.com/news/opinion-hits-8b-in-monthly-prediction-market-volume-but-the-data-raises-questions/) 2026-02-23] |
| 15 | predict.fun | BNB Chain | 2025-12-04 | Not found | Live [FACT, [UMA blog](https://blog.uma.xyz/articles/uma-powers-market-resolution-for-predict-fun-on-bnb-chain) 2026-03-10] |
| 16 | Hyperliquid HIP-4 | Hyperliquid L1 | 2026-05-02 | Team-approved at first; then deployers staking 500k HYPE | Live. Permissionless mainnet status not found [SECONDARY, [The Block](https://theblock.co/post/408875/hyperliquid-hip-4-permissionless-deployment) 2026-07-20] |
| 17 | Precog | Base, Arbitrum | — | Open (LS-LMSR) | Status not found [SECONDARY, [Karma](https://www.karmahq.org/project/precog/about)] |
| 18 | Kash | On X | Pre-testnet, Mar 2026 | Via @kash_bot | Pre-launch [SECONDARY, [Pulse 2.0](https://pulse2.com/kash-2-million-raised-to-bring-prediction-markets-to-social-media/) 2026-03-01] |
| 19 | PredX | Multichain | — | Communities, influencers, AI | Effectively inactive. TVL $3,413 [SECONDARY, [DefiLlama](https://defillama.com/protocol/predx-ai)] |
| 20 | Polymarket | Polygon | — | Curated. "permissionless market deployment and creator fees next…" (2026-02-17) | Not open as far as found [SECONDARY, [DeFi Rate](https://defirate.com/news/polymarket-launches-public-api-unlocks-permissionless-liquidity/) 2026-02-17] |
| 21 | Melee Markets | Solana | Alpha 2025-10-21 | Open, via templates, in Phase 2 | Devnet beta with free-play credit [FACT, beta.melee.markets bundle accessed; SECONDARY, [KuCoin](https://www.kucoin.com/news/insight/BTC/6abefddb38a26400079225b7) 2026-10-02] |
| 22 | PNP Exchange | Solana | GitHub org 2024-12-01 | Open, no review | Pivoted to "A coin that trades Polymarket" [FACT, [pnp.exchange](https://www.pnp.exchange) accessed] |
| 23 | Bubblegum | Solana | Frontier, Apr 2026 | Open; every question launches a token | Devnet hackathon build [FACT, Copilot] |
| 24 | PumpMarket | Solana | Devnet 2026-02-18; mainnet ~2026-02-26 | Open, on any new pump.fun token | Frontend offline: HTTP 402 `DEPLOYMENT_DISABLED` [FACT, accessed 2026-10-07] |
| 25 | Pumpcade | Solana / pump.fun | Private beta Jan 2026 | Streamers and users, one click | No confirmed mainnet; pumpcade.com and .fun are parked [SECONDARY, [Bitget](https://www.bitget.com/news/detail/12560605367582) 2026-04-15; FACT on the domains, accessed] |
| 26 | Hedgehog Markets | Solana, Eclipse | Earlier pivots; "V1 Jan 2026" unverified | Open: "Create a Market", pick your own odds | Site up [FACT, [hedgehog.markets](https://www.hedgehog.markets) accessed] |
| 27 | Hxro Parimutuel | Solana | Not found | Any app (protocol level) | Dormant. Last successful transaction 2026-05-01 [FACT, Solana RPC, accessed] |
| 28 | Drift BET | Solana | 2024-08-19 | Drift security council | Probably discontinued: docs redirect to Velocity, a perps and money-market product [FACT on the redirect, accessed; INFERENCE on the status] |
| 29 | World (world.xyz) | Solana, inside Phantom | 2026-07-01 | Not found (150k+ markets, probably automatic) | Live [SECONDARY, [Genfinity](https://genfinity.io/2026/07/01/world-solana-prediction-market-chainlink-phantom/) 2026-07-01] |
| 30 | Triad Markets | Solana | — | Team | Live [FACT, [docs](https://docs.triadmarkets.app) accessed] |
| 31 | TBD | Solana | Public after a private beta, Feb 2026 | TBD runs the polls; trading is open | Live [SECONDARY, [The Block](https://www.theblock.co/post/391253/solana-based-tbd-a-prediction-market-protocol-for-verified-human-opinion-raises-3-million) 2026-02-25] |
| 32 | Worm (worm.wtf) | Solana | — | "Create permissionless, community-driven markets… earn creator rewards" | Live; mechanism and resolution not found [FACT, [worm.wtf](https://www.worm.wtf) accessed] |
| 33 | Dum.fun, Survive.fun, RugRoulette, Tapebound, Hunchy, ORRA, Degencalls, Predictedwtf | Solana | Frontier 2026 | Open | Hackathon builds, mostly devnet [FACT, Copilot] |
| 34 | dehype.fun, SAGA, Betlify.fun, Polyquest | Solana | Radar 2024 | Open | Hackathon builds [FACT, Copilot] |
| 35 | Pumply.Market, Momimarket, priddi.market, Caudal, depredict | Solana | Cypherpunk 2025 | Open | Hackathon builds [FACT, Copilot] |

**Density of hackathon entries.** Colosseum Copilot classifies 275 hackathon projects in "Prediction & information
markets": Frontier 130, Cypherpunk 78, Breakout 32, Radar 29, Renaissance 6. Ten of them won prizes. Melee is the only
winner among them with open creation that was found (Breakout, 2nd place Consumer Apps, $20k). **FACT** (Copilot data,
population = Copilot-classified projects, accessed) —
[Colosseum: Melee Markets](https://colosseum.com/projects/explore/melee-markets)

### Inferences
- **INFERENCE.** "The pump.fun of X" is a common pitch here: at least four projects, plus about a dozen hackathon
  builds. None of them reached pump.fun-like scale with open creation.
- **INFERENCE.** The open-creation venues with sourced real volume (XO, Limitless, HIP-4) all run order books or AMMs
  where positions can be sold. None is a pot design. Melee is the only pot-style open-creation design with funding,
  and it has not handled real money yet.
- **INFERENCE.** The Solana pump.fun-adjacent attempts that reached mainnet (PumpMarket) or raised money (Pumpcade)
  show no public sign of sustained traction.

### Gaps
- Not verified: Football.fun, Polymtrade, Forecast, Futuur, Thales/Overtime, Kizzy, Moonshot or Bonk-branded markets,
  Gnosis Olympia, and the other names in the brief. The search budget ran out before they were checked.
- Not verified: Xmarket's status after March 2026. Also not verified: whether Hyperliquid HIP-4 permissionless
  deployment is live on mainnet.

## 2. How do the serious ones work: mechanism, creation, creator pay, resolution, scale, money, token, failures?

### Takeaway
Creator pay ranges from 2% of taker fees (Limitless) to "up to 50%" of fees (Xmarket, Hunchy, HIP-4's cap), and
historically 0 to 50% (Augur v1). Resolution is human or semi-human almost everywhere:
- the creator: Melee, Manifold, HIP-4 deployers, PNP custom settlers;
- the team: Limitless event markets, Drift BET;
- AI with a short dispute window: Opinion, XO, PNP;
- an optimistic bond plus vote: Polymarket/UMA, Trueo, Seer/Reality.eth plus Kleros, Augur REP.

Fully automatic resolution exists mainly for price markets, through Pyth or Chainlink.

### Cited Findings

#### Solana

**Melee Markets**
- **Mechanism.** A "Parimutuel Market Maker": a pot with per-outcome price curves, a payout floor that "only ratchets
  up", and early exit through a separate liquidity-provider vault. **SECONDARY FACT** —
  [iq.wiki](https://iq.wiki/wiki/melee), 2026-09-01, and `top-5-competitor-analysis.md` §1.4 (official PMM document,
  2026-10-04).
- **Creation.** Phase 2 lets users launch markets from Melee templates, claim them, share them and earn fees. Phase 1
  is reported as "10,000+ price markets → $337.7M volume". **SECONDARY FACT**, 2026-10-02 —
  [KuCoin](https://www.kucoin.com/news/insight/BTC/6abefddb38a26400079225b7)
- **Network.** The beta app runs on devnet: Helius devnet RPC, a `freePlayBalance` with `faucetEnabled` and
  `cashoutBlocked`, and "Bets paid with credit are held until the market resolves". **FACT**, accessed —
  [beta.melee.markets](https://beta.melee.markets)
- **Creator pay: sources disagree.**
  - "Up to 20% of transaction fees". **SECONDARY FACT**, 2025-09-26 — [ChainCatcher](https://www.chaincatcher.com/en/article/2208752)
  - "As high as 20% of trading volume". **SECONDARY FACT**, accessed — [Solana Compass](https://solanacompass.com/projects/melee-markets)
  - The Breakout pitch: creators "monetize through a 1% market fee". **FACT** (Copilot pitch summary).
- **Resolution: the creator decides.** The Terms of Use say creators are "solely responsible for… Determining the
  resolution of… your own Creator-made Markets", and results "are final and made in the discretion of the Creator or
  Company". **FACT**, Terms PDF created 2025-10-16 — [Melee Terms of Use](https://melee.markets/docs/melee-terms-of-use.pdf)
  - The beta code has states `PendingResolve`, `Arbitration` and `CreatorResolved`, and a
    `NEXT_PUBLIC_DISPUTE_FILING_ENABLED` flag. **FACT** (bundle, accessed).
  - The pitch prioritises "Creator-Driven Resolution" and calls decentralised resolution deprioritised because it takes
    about 24 h. **FACT** (Copilot record).
- **Money.** $3.5M led by Variant, with DBA, Anatoly Yakovenko, Meltem Demirors and Santiago Roel Santos. ChainCatcher
  calls it a "seed"; Bitget calls it a "Pre-Seed". **SECONDARY FACT** —
  [ChainCatcher](https://www.chaincatcher.com/en/article/2208752) 2025-09-26,
  [Bitget](https://www.bitget.com/news/detail/12560605023791) 2025-10-21
- **Token and audit.** No token found. No public audit. **SECONDARY FACT** — [Solana Compass](https://solanacompass.com/projects/melee-markets)

**PNP Exchange**
- **Creation.** Open, "PNP doesn't review or reject markets". **FACT** — [docs](https://docs.pnp.exchange/platform/creating-markets.md), accessed
- **Market models.**
  - V2 "Pythagorean" AMM: the creator seeds USDC; minimum deadline 2 days.
  - V3 parimutuel peer-to-peer.
  - Bubblegum: each market gets its own token.
  - **FACT** — [docs llms.txt](https://docs.pnp.exchange/llms.txt), accessed
- **Fees.** 1% per trade, split 30% creator / 20% PNP DAO / 50% protocol. Plus 2% on redemption (60% to the creator
  treasury, 40% protocol). Bubblegum creators get 0.5% per trade. **FACT** —
  [fees and rewards](https://docs.pnp.exchange/platform/fees-and-rewards.md), accessed
- **Resolution.**
  - An LLM oracle: Perplexity plus Grok for general markets. Birdeye or CoinGecko for coin markets. Twitter, YouTube,
    DefiLlama and Kalshi APIs for typed markets. The PNP DAO handles edge cases.
  - A "resolvability gate" before trading refunds questions it cannot answer.
  - **FACT** — [oracle settlement](https://docs.pnp.exchange/platform/oracle-settlement.md), accessed
  - `createMarketCustom` lets the creator name any public key as settler. Admins can also settle. **FACT** —
    [custom oracles](https://docs.pnp.exchange/sdk/custom-oracles.md), accessed
- **Now.**
  - The homepage reads "PnP: A coin that trades Polymarket": a Meteora DBC launchpad where 90% of buy fees fund a
    program-owned Polymarket account. **FACT**, accessed — [pnp.exchange](https://www.pnp.exchange)
  - Earlier: 206 program transactions in six months and a token worth about $109k. **FACT**, from
    `top-5-competitor-analysis.md` §2.6 and §2.8 (2026-10-04, RPC and DexScreener).

**Bubblegum (by the PNP founders)**
- Every question launches a token on a bonding curve, and that token is the collateral for the market.
- After graduation, the token moves to Meteora DAMM v2.
- Markets "settle to declared winners", and those that fail to graduate are refunded pro rata.
- A cranker service handles graduation and settlement. Devnet.
- **FACT** (Copilot record), Frontier start 2026-04-06 — [Colosseum: Bubblegum](https://colosseum.com/projects/explore/bubblegum)

**PumpMarket**
- **What it does.** "Graduation Markets" where "anyone can create a market on any new Pump.fun token" and take a side
  on graduation within one hour. Parimutuel in SOL. Settlement uses "integrations with … Bitquery, Helius, and
  Birdeye". **SECONDARY FACT** (press release), 2026-02-26 —
  [GlobeNewswire](https://www.globenewswire.com/news-release/2026/02/26/3245639/0/en/pumpmarket-brings-prediction-markets-to-pump-fun-public-hackathon.html)
- **First 48 hours.** 63 markets resolved, 66 SOL of volume, 150+ entries. **SECONDARY FACT** (same release).
  Recipient in pump.fun's $3M Build in Public hackathon. **SECONDARY FACT** (same release).
- **Now.** Frontend returns HTTP 402 `DEPLOYMENT_DISABLED`. **FACT** (subagent fetch, 2026-10-07 15:45 UTC).

**Pumpcade**
- **Product.** One-click markets inside livestream chat, lasting 60 s to 30 min. Resolution via "direct official API
  calls or deterministic data". Private beta since January 2026 with about 500 users. **SECONDARY FACT**, 2026-04-02 —
  [The Block](https://www.theblock.co/post/396213/pump-fun-pre-seed-funding-round-livestream-prediction-markets-pumpcade)
  - Another source says resolution is "automatically or by the streamer", which conflicts with The Block.
    **SECONDARY FACT**, 2026-04-10 —
    [XT blog](https://www.xt.com/en/blog/post/pumpcade-pumpcade-how-a-small-team-is-turning-meme-attention-into-live-prediction-markets)
- **Money.**
  - $1M pre-seed led by pump.fun, with Foundation Capital and RadioSolace (The Block, above).
  - $5M seed with Jump Crypto and Foundation Capital at a $44M valuation. **SECONDARY FACT**, 2026-04-15 —
    [Bitget](https://www.bitget.com/news/detail/12560605367582)
- **Token.** PUMPCADE was fair-launched on pump.fun. **SECONDARY FACT** (XT).
- **Mainnet:** not found.

**Hedgehog Markets**
- The site meta reads "building permissionless prediction markets on Solana and Eclipse", with "Create a Market" and
  "Select Your Own Odds 1:5 / 1:1 / 5:1". **FACT**, accessed — [hedgehog.markets](https://www.hedgehog.markets)
- Funding and the HHDG token appear only in unverified snippets.

**Hxro Parimutuel**
- Anyone can run the settlement crank. Networks: USDC, GUAC and BONK. Settlement uses Pyth. **FACT** —
  [crank docs](https://github.com/hxro-network/hxro-protocol-docs/blob/main/PARIMUTUEL_CRANK.md)
- The last successful transaction was on 2026-05-01. **FACT** (Solana RPC, accessed).

**Drift BET**
- Launched 2024-08-19. **SECONDARY FACT** — [The Block](https://www.theblock.co/post/311888/solana-based-drift-protocol-launches-prediction-market)
- The security council creates markets and resolves them by setting the oracle to 0 or 1. **SECONDARY FACT**,
  2026-06-28 — [Prediction Markets Index](https://predictionmarketsindex.com/platforms/drift-bet/)
- Drift was exploited for $285M on 2026-04-01. **SECONDARY FACT** —
  [Unchained](https://unchainedcrypto.com/drift-protocol-suffers-285-million-exploit-after-admin-key-compromise-and-oracle-manipulation-unchained/)
- Drift docs now redirect to Velocity, which documents perps and a money market only. **FACT**, accessed —
  [Velocity docs](https://docs.velocity.exchange/protocol/)

**World (world.xyz)**
- Chainlink Data Streams plus Automation settle markets. **SECONDARY FACT**, 2026-07-01 —
  [Genfinity](https://genfinity.io/2026/07/01/world-solana-prediction-market-chainlink-phantom/)
- "over 150,000 markets have already been created". **SECONDARY FACT**, 2026-09-09 —
  [Coinotag](https://en.coinotag.com/world-opens-solana-prediction-market-1m-waitlisted-users)
- Who creates: not found.

**Triad**
- **Mechanism.** A pot ("1:1 payout"). Trading fee 5% between $0.10 and $0.90, down to 0.9%, plus 0.36% on profits.
  **FACT** — [Triad fees](https://docs.triadmarkets.app/fees), accessed
- **Who creates.** No user creation is documented.
- **Scale.** $2.6M volume and 5,000+ traders in early 2025. **SECONDARY FACT** — [Solana Compass](https://solanacompass.com/projects/triad)

**TBD**
- $3M seed co-led by CMT Digital and ParaFi, with Jump Crypto. **SECONDARY FACT**, 2026-02-25 —
  [The Block](https://www.theblock.co/post/391253/solana-based-tbd-a-prediction-market-protocol-for-verified-human-opinion-raises-3-million)
- Every market is tied to a World ID-gated poll run by TBD, and resolves on the poll result. The private beta had
  4,000+ markets, 19M votes and 225,000+ participants. Same source.

#### Other chains

**Limitless (Base)**
- **Creator markets.**
  - "Any signed-in user can create one (subject to a daily limit and per-duration capacity caps)". Creator fee is
    "currently 2% of taker fees by default", paid daily in USDC. **FACT**, accessed —
    [docs](https://docs.limitless.exchange/user-guide/user-generated-markets.md)
  - Launched 2026-06-04, price targets only. **FACT** —
    [Limitless blog](https://limitless.exchange/blog/limitless-launches-user-generated-markets-anyone-can-now-create-and-earn-from-their-own-prediction-market)
  - Beta month: 162 creators, 1,611 markets, $2.2M volume. **SECONDARY FACT**, 2026-08-26 —
    [The Black Swans](https://theblackswans.substack.com/p/limitless-the-prediction-market-that)
  - An HTX snippet claimed an LMTS burn of 100 to 1,000 tokens to create and a 50% creator share. This conflicts with
    the docs and is unverified. **SECONDARY FACT** (snippet).
- **Resolution.**
  - Pyth for most markets, Chainlink TWAP for 5- and 15-minute markets, sports APIs, and the team by hand in 24 to 72
    h. **FACT** — [resolution docs](https://docs.limitless.exchange/user-guide/market-resolution.md)
  - On a misresolution, only the cost basis is refunded. **FACT** — [refund policy](https://docs.limitless.exchange/user-guide/refund-policy.md)
- **Volume: sources disagree.**
  - DeFi Rate: $1.66B in April 2026 and about $3.9B cumulative. **SECONDARY FACT**, 2026-05-05 —
    [DeFi Rate](https://defirate.com/news/limitless-files-cftc-approval-after-record-1-66b-month/)
  - The Black Swans: Q2 2026 at $1.53B, which conflicts with DeFi Rate.
  - DefiLlama shows a 30-day volume of $10.13M on 2026-10-03. **FACT**, from `mercados-de-previsao-web3.md`.
- **Money and regulation.** $17M raised. A CFTC contract-market application was filed on 2026-05-01. **SECONDARY
  FACT** (DeFi Rate).

**XO Market**
- **Mechanism and creation.** An LS-LMSR AMM. Any user creates a market, writes the criteria, picks the collateral and
  sets a fee. **SECONDARY FACT**, 2025-07-01 —
  [Blockworks Research](https://blockworks-research.beehiiv.com/p/pump-fun-of-prediction-markets)
- **Resolution.** "AI-first" oracle, with disputes going to a quadratic-voting jury of XO stakers. Same source.
- **Money.** $6M seed from 20VC, Picus, Coinbase Ventures and others. **SECONDARY FACT**, 2026-04-30 —
  [CoinDesk](https://www.coindesk.com/business/2026/04/30/xo-market-bets-on-user-generated-prediction-markets-to-rival-polymarket-and-kalshi)
- **Scale.** $150M volume, 30,000+ users and 600+ user markets since the mainnet beta. Same source.
- **Chain conflict.** Alchemy lists XO on BNB Chain, while Blockworks says it runs its own rollup. **SECONDARY FACT**
  — [Alchemy](https://www.alchemy.com/dapps/xo-market)

**Xmarket**
- An order book plus a "pre-sale" model for market backers.
- Creators earn "up to 50% of the trading and redemption fees".
- During beta, 100% of revenue is shared back to users. An $XMRK token is "upcoming".
- Resolution: not stated.
- **SECONDARY FACT** (press release), 2026-03-04 —
  [Bitcoin.com PR](https://news.bitcoin.com/xmarket-launches-beta-on-bnb-chain-mainnet-the-first-prediction-market-that-pays-creators-and-early-believers/)

**Opinion (BNB)**
- **Resolution.** "Most markets are resolved through Opinion AI". **FACT** —
  [resolution docs](https://docs.opinion.trade/trade-on-opinion.trade/resolution.md)
- **Disputes.** A bond of max(1% of open interest, 1,000 OPN), a window of about 2 h, and an unnamed reviewer.
  **FACT** — [dispute docs](https://docs.opinion.trade/trade-on-opinion.trade/dispute.md)
- **Volume.** $8.08B in January 2026. **SECONDARY FACT** (DeFi Rate, 2026-02-23).
- **Money.** $21.55M Series A in December 2025. **SECONDARY FACT** — [Binance Research](https://www.binance.com/research/projects/opinion)

**Trueo (ex-Truemarkets)**
- **Resolution.** An optimistic ladder: a $750 bond to propose, a council, a $7,500 escalation, then a TRUE vote.
  **FACT** — [enshrined oracle docs](https://truemarkets.gitbook.io/truemarkets/enshrined-oracle)
- **Money.** $4.03M from an NFT sale. **SECONDARY FACT**, 2024-11-21 —
  [The Block](https://www.theblock.co/news/business/2024-11-21-market-based-media-platform-truemarkets-raises-4-million-from-public-nft-sale-attracting-vitalik-buterin-as-a-buyer-327743)
- **Volume.** ~$780k lifetime. **SECONDARY FACT** (KuCoin, 2026-09-22).
- Aggregators call its oracle "AI-powered", but the primary docs read mention no AI.

**Hyperliquid HIP-4**
- **Deployer rules.**
  - Stake 500k HYPE for six months.
  - Validators can slash the stake for poorly defined markets, wrong settlement, or settling more than a week late.
  - 100 outcomes per deployer. Deployer fee capped at 50%. The deployer settles its own markets.
  - **SECONDARY FACT**, 2026-07-20 — [The Block](https://theblock.co/post/408875/hyperliquid-hip-4-permissionless-deployment)
  - An earlier article said 1M HYPE. **SECONDARY FACT** —
    [BlockEden](https://blockeden.xyz/blog/2026/05/13/hyperliquid-hip4-prediction-market-deep-dive/) 2026-05-13
- **Phase 1.** Settled on Hyperliquid's own BTC mark price. Same BlockEden source.

**Augur**
- **Creation rules (v1).**
  - Open creation.
  - Creator fee "between 0% and 50%".
  - A validity bond refunded unless the market resolves Invalid.
  - A no-show bond in REP.
  - 7-day dispute rounds, and a fork at 2.5% of REP.
  - **FACT** — [v1 glossary](https://raw.githubusercontent.com/AugurProject/v1-docs/master/source/includes/_glossary.md)
- **v2.** DAI, a tradeable Invalid outcome, and 24 h reporting. **FACT** — [Augur whitepaper v3](https://arxiv.org/abs/1501.01042), 2020-11-30
- **Usage (v1).** 265 daily users in early July 2018, falling to 37 on 2018-08-08. **SECONDARY FACT** —
  [Wikipedia, citing The Economist](https://en.wikipedia.org/wiki/Augur_(software))

**Seer / Omen / Zeitgeist** — see the long list in section 1 and the controls in section 3.

#### Changes since the repo notes of 2026-10-03 and 2026-10-04

1. **Melee.** Still devnet with free-play credit (FACT, bundle). Template creation (Phase 2) went live around
   2026-10-02 (SECONDARY). The ToU now confirms primary evidence that **the creator resolves, at its discretion**. The
   prior note had only a secondary source.
   - The Breakout pitch put creator pay at 1% market fee, adding a third figure to the "20%" disagreement.
   - INFERENCE: the "$337.7M Phase 1 volume" is devnet play money and should not be cited as scale.
2. **PNP.** Pivot confirmed. Fee split confirmed at 30/20/50, plus a 2% redemption fee the prior note did not have. The
   creator can name any wallet as settler. Its founders built Bubblegum at Frontier 2026.
3. **Drift BET.** Was "status unknown". The docs now redirect to Velocity, which lists no event markets.
   INFERENCE: BET is discontinued.
4. **Limitless.** Creator markets launched 2026-06-04 (price targets only). The DeFi Rate peak of $1.66B in April
   2026 fits the prior note's "volume fell 96% May to September".
   - LMTS launch date: the prior note had 22/Oct/2025 (BingX); a new source says 2025-10-31 (CoinMarketCap AI summary).
     Unresolved.
5. **Hedgehog.** Was "?". It is now FACT that the site is up with "Create a Market" and choose-your-odds. Volume is
   still unknown.
6. **Hxro Parimutuel.** Was "listing only". Now FACT dormant: no successful transaction since 2026-05-01.
7. **Myriad.** Moved its catalogue to BNB Chain with USD1 settlement (2026-03-11) and adopted Chainlink for crypto
   markets (2026-05-13). DefiLlama: $234.9M all-time, $2.70M over 30 days.
8. **New and absent from the repo notes:** XO Market, Xmarket, PumpMarket, Pumpcade, TBD, Worm, Bubblegum, Opinion,
   predict.fun, Trueo, Seer, HIP-4 permissionless deployers, Tapebound and the other Frontier 2026 memecoin market
   builds.
9. **Polymarket.** An employee publicly said "permissionless market deployment and creator fees next…"
   (2026-02-17). Not shipped as far as found.

### Inferences
- **INFERENCE.** Fee shares are no longer a differentiator. 30% (PNP), "up to 50%" (Xmarket, HIP-4) and up to 50%
  (Augur v1) have all been offered. None of these offers is documented to have produced liquidity by itself.
- **INFERENCE.** The creator-as-resolver model (Melee, Manifold, HIP-4 deployers, PNP custom settlers) is common
  wherever creation is open and markets are subjective. It is the main trust weakness Brot could avoid.

### Gaps
- Not found for most projects: creation cost or bond (XO, Xmarket, Melee, Worm, Hedgehog).
- Not found: Melee's total fee percentage; Worm's resolution; Opinion's live user-creation flow; World's market
  creator.
- Not verified: Xmarket's resolution method; XO's chain; Pumpcade's mainnet and current domain.

## 3. What went wrong with open creation, and what controls were adopted?

### Takeaway
The recurring failures are:
- ambiguous or invalid markets, made profitable on purpose;
- harmful-topic markets (death and assassination);
- thin liquidity spread over many dead markets;
- slow or captured resolution;
- volume inflated for points or airdrops.

The controls that appear repeatedly are refundable bonds, an Invalid outcome, two-tier creation, curated "verified"
lists, daily creation limits, stake-and-slash for creators, and checks at creation time for whether a question can be
resolved. I found no documented case of an AI oracle resolving a market wrongly, and no documented case of a creator
abusing self-resolution. That reflects how little these systems have been tested, not that they are safe.

### Cited Findings

**Augur**
- **Assassination markets (July 2018).** Within weeks of launch, users created markets on whether Trump, Bezos, Buffett
  or Betty White would die by a given date. Critics noted that a large "no" position works as a bounty. The only
  safeguard was REP reporters declaring them Invalid. **SECONDARY FACT**, 2018-07-26 —
  [MIT Technology Review](https://www.technologyreview.com/2018/07/26/2449/the-latest-blockchain-use-case-anonymously-betting-on-public-figure-death-pools/)
- **Regulatory critique.** Augur works as a "bucket shop"; the critique cites the CFTC's $3M InTrade judgment.
  **SECONDARY FACT**, 2018-07-30 —
  [David Gerard](https://davidgerard.co.uk/blockchain/2018/07/30/augurs-big-problem-is-not-the-assassination-markets-its-being-a-bucket-shop/)
- **Invalid-market scam (2019).**
  - Creators set end times so that an ambiguous outcome was guaranteed, bought the cheap side, and collected 0.5 per
    share on Invalid. Validity bonds were "often less than the money made off the invalid market".
  - Augur's response: interface filters that hid wide-spread, shallow or "dust-order" markets, and in v2 a tradeable
    Invalid outcome.
  - **SECONDARY FACT**, 2019-06-05 — [The Block](https://www.theblock.co/post/26075/augur-is-making-a-big-push-to-take-down-bad-actors-on-its-platform)
- **What makes a market Invalid.** A subjective question, an outcome unknown at end time, conflicting title and
  details, several defensible outcomes, or a source that gives different answers. **FACT** —
  [Augur v1 glossary](https://raw.githubusercontent.com/AugurProject/v1-docs/master/source/includes/_glossary.md)
- **Thin liquidity.** One 2018 midterm Senate market had "$24K… by just five participants". **SECONDARY FACT** —
  [The Block](https://www.theblock.co/post/2936/results-auguring-the-2018-u-s-midterm-elections)
- **Fork cost.** Augur's first real fork closed 2026-08-03. About 40% of REP never migrated. **FACT** —
  [Augur reboot blog](https://raw.githubusercontent.com/AugurProject/augur-reboot-website/main/src/content/blog/post-fork-announcements/index.mdx), 2026-08-05
  - Its own later report gives a different migrated total: 6,399,867.64 against 6,547,546.66. **FACT** —
    [Q2 report](https://raw.githubusercontent.com/AugurProject/augur-reboot-website/main/src/content/blog/q2-2026-progress-report/index.mdx), 2026-10-01

**Other protocols**
- **Omen.** On mainnet a market needed more than $100k of funding to be viable; on xDai, $100 to $1,000. **SECONDARY
  FACT**, 2021-02-10 —
  [CryptoNinjas](https://www.cryptoninjas.net/2021/02/10/decentralized-prediction-market-omen-app-launches-on-the-xdai-network/)
- **Zeitgeist: two tiers.** Advised markets carry a 200 ZTG bond and need committee approval; a rejection forfeits the
  bond. Permissionless markets carry a 1,000 ZTG bond; harmful ones are "retroactively remove[d]", but poorly defined
  ones stay up and traders lose money. **FACT** — [Zeitgeist market rules](https://docs.zeitgeist.pm/docs/learn/market-rules)
- **Seer.** "Verified" status through a Kleros Curate deposit. A dispute takes up to 14 days 12 hours, plus 11 days per
  appeal. **FACT** —
  [verify](https://seer-3.gitbook.io/seer-documentation/getting-started/navigate-our-site/verify-market.md),
  [dispute](https://seer-3.gitbook.io/seer-documentation/getting-started/navigate-our-site/raise-a-dispute.md)
- **Polymarket and UMA, governance capture.** A $7M market ("Ukraine agrees to Trump mineral deal before April?")
  resolved YES after a large UMA holder's votes. Polymarket called it "unprecedented" and gave no refunds. **SECONDARY
  FACT**, 2025-03-25 — [The Block](https://www.theblock.co/post/348171/polymarket-says-governance-attack-by-uma-whale-to-hijack-a-bets-resolution-is-unprecedented)
- **Wash trading.**
  - About 25% of Polymarket volume over three years was artificial, peaking near 60% and tied to token rumours.
    **SECONDARY FACT** (Columbia working paper reported by Fortune), 2025-11-07 —
    [Fortune](https://fortune.com/2025/11/07/polymarket-wash-trading-inflated-prediction-markets-columbia-research/)
  - Opinion: average trade $2,525, against $175 on Kalshi and $147 on Polymarket; weekly users swung 6x, with signs of
    "airdrop farming". **SECONDARY FACT**, 2026-02-23 —
    [DeFi Rate](https://defirate.com/news/opinion-hits-8b-in-monthly-prediction-market-volume-but-the-data-raises-questions/)
  - After Opinion's token launch, TVL fell from about $150M to $36M. **SECONDARY FACT**, 2026-03-05 —
    [Odaily](https://www.odaily.news/en/post/5209576)
- **AI oracles.**
  - UMA's Optimistic Truth Bot only shadows human proposers. Its single-LLM prototype "lagged badly"; hallucinations
    "dropped" after an Overseer layer was added; humans remain "the ultimate safety net". **FACT**, 2025-07-30 —
    [UMA blog](https://blog.uma.xyz/articles/inside-umas-optimistic-truth-bot)
  - Opinion added disputes only in April 2026, after billions in volume. **SECONDARY FACT** —
    [CoinMarketCap AI summary](https://coinmarketcap.com/cmc-ai/opinion/latest-updates/) (low reliability)
- **Inactive markets.** XO's founder is quoted saying unsuccessful markets "die naturally". Rivals' markets ended up
  "inactive" or with "minimal trading activity". **SECONDARY FACT**, 2026-04-30 —
  [CoinDesk](https://www.coindesk.com/business/2026/04/30/xo-market-bets-on-user-generated-prediction-markets-to-rival-polymarket-and-kalshi)
- **Manifold.** Users complain of "spam markets"; the creator resolves, and moderators overturn only "in exceptional
  circumstances". **SECONDARY FACT**, 2026-02-19 —
  [Eli Goldfine](https://itsnotgambling.substack.com/p/the-right-to-ask-a-question); **FACT** —
  [Manifold FAQ](https://docs.manifold.markets/faq)

**Controls adopted, by project**

| Control | Who uses it | Source |
|---|---|---|
| Refundable bond, forfeited on Invalid | Augur (validity bond), Zeitgeist (200 or 1,000 ZTG) | **FACT**, Augur glossary and Zeitgeist rules above |
| Invalid as a tradeable outcome | Augur v2 | **SECONDARY FACT**, [The Block 2020](https://www.theblock.co/post/73057/augur-v2-launch) |
| Committee review, or retroactive removal | Zeitgeist; Melee (company may remove content "for any or no reason") | **FACT**, Zeitgeist rules; [Melee ToU](https://melee.markets/docs/melee-terms-of-use.pdf) |
| Curated "verified" list | Seer (Kleros Curate) | **FACT**, Seer docs |
| Daily limit and capacity caps; small fixed creator share | Limitless (2% of taker fees) | **FACT**, [Limitless docs](https://docs.limitless.exchange/user-guide/user-generated-markets.md) |
| Stake and slashing for deployers | Hyperliquid HIP-4 (500k HYPE) | **SECONDARY FACT**, [The Block 2026-07-20](https://theblock.co/post/408875/hyperliquid-hip-4-permissionless-deployment) |
| Resolvability check before trading, with refund | PNP (AI gate); Opinion (AI checks rules) | **FACT**, [PNP oracle docs](https://docs.pnp.exchange/platform/oracle-settlement.md), [Opinion docs](https://docs.opinion.trade) |
| Templates instead of free text | Melee Phase 2; Limitless (price targets only); HIP-4 (validator-voted templates); Survive.fun and RugRoulette (one market type) | **SECONDARY FACT**, KuCoin 2026-10-02; **FACT**, Limitless blog; **SECONDARY FACT**, The Block 2026-07-20 |
| Invite waves, reputation score | Melee (invite codes, "Melee Score") | **FACT**, homepage via `top-5-competitor-analysis.md` §1.2 |
| Gated creation by locked tokens | Polkamarkets/Myriad (`isAllowedToCreateMarket`, "land") | **FACT**, [contract](https://github.com/Polkamarkets/polkamarkets-js/blob/main/contracts/PredictionMarketV3_4.sol) |
| ToS ban on wash trading | Limitless, Melee | **FACT**, Limitless docs; Melee ToU |

### Inferences
- **INFERENCE.** Augur's 2019 scam is the precedent closest to Brot's design. In a pot market, a creator who can make
  the outcome ambiguous, or who controls resolution, captures the pot. Brot's typed readers remove ambiguity by
  construction: the account either meets the threshold or it does not. That covers the Invalid problem. It does not
  cover manipulation of the underlying account.
- **INFERENCE.** For memecoin markets the manipulation risk sits in the metric itself. A creator can buy a
  low-liquidity pump.fun token to graduation, or dump it, to win their own market. A Frontier reviewer flagged exactly
  this for Survive.fun ("could easily be manipulated by the market creator"). **FACT** (Copilot judge summary) —
  [Colosseum: Survive.fun](https://colosseum.com/projects/explore/survive.fun-the-first-on-chain-memecoin-survival-market.)
- **INFERENCE.** Creator fee shares invite self-trading wherever pay depends on volume. In a pot model, creator pay
  tied to the pot or to distinct participants is harder to farm than pay tied to volume.

### Gaps
- No documented case found of a creator abusing self-resolution on Melee, Manifold or PNP.
- No documented AI-oracle misresolution found. The search budget limited this.
- No academic post-mortem on Augur was found. Omen and Zeitgeist lifetime volume: not found.

## 4. Does any project resolve markets by reading on-chain accounts directly (no oracle vote, no AI, no creator)?

### Takeaway
No live product was found whose program settles by reading **non-price** on-chain state directly: a pump.fun
bonding-curve completion flag, a mint's supply, a stake pool size, a locked-liquidity position. Every memecoin market
checked settles through off-chain infrastructure plus a privileged signer.

What does exist is programs that read **oracle price accounts** (Pyth `PriceUpdateV2` or Chainlink): Tapebound (a
hackathon build on devnet), Hxro Parimutuel (dormant), and price markets at Limitless, Triad and World. HIP-4 settles
on its own chain's mark price. So "results read only from on-chain accounts" is distinctive only for the non-price
market kinds, not for price markets.

### Cited Findings

**Memecoin and token-state markets: off-chain data plus a signer**
- **PumpMarket.** Graduation outcomes are "verified in real time through integrations with … Bitquery, Helius, and
  Birdeye". **SECONDARY FACT**, 2026-02-26 —
  [GlobeNewswire](https://www.globenewswire.com/news-release/2026/02/26/3245639/0/en/pumpmarket-brings-prediction-markets-to-pump-fun-public-hackathon.html)
- **Survive.fun.** A backend (BullMQ, Helius webhooks, DexScreener fallback) "triggers on-chain `resolve_market` via the
  platform authority wallet". **FACT** (Copilot repo summary) —
  [Colosseum: Survive.fun](https://colosseum.com/projects/explore/survive.fun-the-first-on-chain-memecoin-survival-market.)
- **RugRoulette.** A crank or backend calls Helius, Birdeye and Anthropic Claude, then triggers on-chain resolution.
  **FACT** (Copilot repo summary) — [Colosseum: RugRoulette](https://colosseum.com/projects/explore/rugroulette)
- **Bubblegum.** A cranker service; markets "settle to declared winners". **FACT** (Copilot) —
  [Colosseum: Bubblegum](https://colosseum.com/projects/explore/bubblegum)
- **Dum.fun.** "Markets resolve automatically from on-chain signals", but the mechanism is "not detailed". **FACT**
  (Copilot) — [Colosseum: Dum.fun](https://colosseum.com/projects/explore/dum.fun)
- **PNP coin markets.** Resolved by the Birdeye or CoinGecko API plus an LLM. **FACT** —
  [PNP oracle docs](https://docs.pnp.exchange/platform/oracle-settlement.md)

**Price markets: direct reads of oracle accounts**
- **Tapebound** (Frontier 2026, not a winner).
  - Permissionless market creation. The program settles from a Pyth Solana Receiver `PriceUpdateV2`, with
    `VerificationLevel::Full` and a boundary check (`prev_publish_time < boundary_time <= publish_time`).
  - Market types: AbovePrice, BelowPrice, WithinRange, UpDown. A backend indexer pushes the updates.
  - **FACT** (Copilot repo summary) — [Colosseum: Tapebound](https://colosseum.com/projects/explore/tapebound),
    repo [Sam-Jeston/outcome-markets](https://github.com/Sam-Jeston/outcome-markets)
- **Hxro Parimutuel.** Anyone can run the crank that settles from Pyth; now dormant. **FACT** —
  [crank docs](https://github.com/hxro-network/hxro-protocol-docs/blob/main/PARIMUTUEL_CRANK.md); RPC, accessed
- **Limitless.** "Pyth Network now resolves the majority of markets", automatically at the deadline. Whether the
  contract verifies the Pyth update itself is not stated. **FACT** —
  [Limitless resolution](https://docs.limitless.exchange/user-guide/market-resolution.md)
- **World.** Chainlink Data Streams plus Automation. **SECONDARY FACT** —
  [Genfinity](https://genfinity.io/2026/07/01/world-solana-prediction-market-chainlink-phantom/)
  - The prior repo note found that a company key writes the result. **FACT**, `top-5-competitor-analysis.md`, 2026-10-04.
- **Triad.** 15-minute "Fast Markets" on Pyth. Who triggers settlement is not stated. **FACT** —
  [Triad docs](https://docs.triadmarkets.app)
- **HIP-4 Phase 1.** Settles on Hyperliquid's own BTC mark price. **SECONDARY FACT** —
  [BlockEden](https://blockeden.xyz/blog/2026/05/13/hyperliquid-hip4-prediction-market-deep-dive/)

**Settled by a privileged key**
- **Drift BET.** Resolved by the security council setting the oracle to 0 or 1. **SECONDARY FACT** —
  [Prediction Markets Index](https://predictionmarketsindex.com/platforms/drift-bet/)

**Theory**
- The idea is known in the literature: oracle-less markets "reference on-chain truth (such as total value locked…)".
  **SECONDARY FACT** — [Rahman, Al-Chami, Clark, SoK on DePMs](https://arxiv.org/abs/2510.15612),
  2025-10-17, revised 2026-07-08 (the point appears in search text, not the abstract).

**Brot's own scope**
- Brot's first-day market kinds are big-asset price (touch), supply burn, Meteora locked liquidity, stake pool size
  and validator stake. **FACT** (repo), via `06-guided-creation-ux-and-abuse.md`, citing `docs/product/PRODUCT-BRIEF.md` R-13.
- Brot's price reader parses a Pyth `PriceUpdateV2`, the same account type Tapebound reads. **FACT** (repo), `CLAUDE.md`.

**How this was checked**
- Colosseum Copilot searches:
  - "prediction market resolved trustlessly by reading on-chain account state, pump.fun token graduation, memecoin
    market cap, no oracle";
  - "permissionless prediction market anyone can create markets pump.fun for prediction markets";
  - the "prediction-markets" category filtered to winners.
- Web searches: "prediction market 'no oracle' settles from on-chain state…", "pump.fun of prediction markets",
  "permissionless prediction market Solana…", "memecoin prediction market graduate bonding curve…".
- Primary docs read: Limitless, PNP, Triad, Hxro, Melee ToU and bundle, Drift/Velocity.
- Not run: a dedicated web search for "trustless settlement" on Solana; the budget was exhausted.

### Inferences
- **INFERENCE.** Brot's real difference is narrower than "reads on-chain accounts". Pyth-settled price markets are
  already common and easy to build (Tapebound did it in a hackathon). The open space is:
  - typed readers for **non-price** Solana state, where none of the competitors checked resolves without a backend
    signer: pump.fun graduation, mint supply and burns, locked LP, stake;
  - plus a permissionless, CPI-rejecting `resolve` with no admin key;
  - plus creation restricted to questions those readers can answer.
- **INFERENCE.** The closest conceptual rival is PumpMarket: graduation markets, pot model, open creation. It used
  off-chain indexers and appears offline. A program that reads pump.fun's bonding-curve account would remove the
  backend trust it needed.

### Gaps
- PumpMarket's on-chain program was not inspected; its address was not found. It might check bonding-curve state
  on-chain. Its press material describes only off-chain data providers.
- Dum.fun's and Worm's settlement code was not inspected.
- Not verified: whether Limitless's contracts verify Pyth updates on-chain or a team key posts them.

## 5. Who offers markets on pump.fun tokens or memecoins, how do they resolve, and how much volume do they draw?

### Takeaway
The only sourced memecoin-market volume of any size is on Polymarket, and it covers token launches and FDV
thresholds: one to a few million dollars per event. Those markets resolve through UMA, under rules like "the most
liquid price source available". The Solana-native memecoin market products are tiny or offline: PumpMarket did 66 SOL
in its first 48 h, and the rest are hackathon builds. pump.fun itself runs no event-market product as far as found; it
backs Pumpcade instead.

### Cited Findings

**Polymarket token and FDV markets**
- **Category size.** Polymarket's "Token Launches" page showed about "500 active markets" with "$12.8M in trading
  volume". **SECONDARY FACT** (search-result text of the Polymarket page; capture date unknown, likely Sep or Oct
  2026) — [Polymarket token launches](https://polymarket.com/predictions/token-launches)
- **pump.fun's own token.**
  - "Pump.fun >$4B market cap (FDV) one day after launch?" resolved Yes on 2025-07-15 with $1.1M volume.
  - The ">$10B" market resolved No with $453.3K.
  - **SECONDARY FACT** (Polyguana via search text; the pages now redirect to X) —
    [Polymarket event](https://polymarket.com/event/pumpfun-market-cap-fdv-above-one-day-after-launch)
- **$LAPTOP.**
  - "$LAPTOP FDV above ___ one day after launch?": $4.6M total volume, shown as unresolved, with the rule "resolve to
    'Yes' if the Fully Diluted Valuation of the LAPTOP token is greater than the specified value 1 day after launch".
    **SECONDARY FACT**, accessed — [Predscope](https://predscope.com/event/laptop-fdv-above-one-day-after-launch)
  - A search summary gave $4,024,545 for the same market, and said $LAPTOP launched on Base on 2026-09-09. **SECONDARY
    FACT** (search text). Repo note: `knowledge-base/market/mercado-de-token-na-polymarket.md`.
- **Other launch markets.**
  - Lighter FDV >$2B: $25.1M volume, resolved 2025-12-31.
  - Extended FDV: $3.74M as of 2026-09-17.
  - MetaMask FDV: $3M since 2025-11-04.
  - **SECONDARY FACT** (search text from Polyguana and Bitget).
- **Rule text.** A Predict.fun FDV market on Polymarket defines FDV as "total token supply multiplied by token price",
  measured "at 4:00 PM ET on the calendar day following the token's launch". It excludes "memecoins" from what counts
  as the governance token, and states "the most liquid price source available will be used for resolution".
  **SECONDARY FACT** (OctagonAI snapshot of the rules), accessed —
  [OctagonAI](https://www.octagonai.co/markets/crypto/fdv/predict-fun-fdv-above-one-day-after-launch.md)
- **Other pump.fun markets.** Polymarket also lists PUMP-price and "Pump.fun airdrop by…" markets. **SECONDARY FACT**
  (search titles) — [Polymarket pump.fun airdrop](https://polymarket.com/event/pumpfun-airdop-by)

**Solana-native memecoin markets**
- **PumpMarket.** Graduation within one hour; pot in SOL; 63 markets and 66 SOL in 48 h; now offline (see section 2).
- **PNP.** Coin markets resolved by the Birdeye or CoinGecko API plus an LLM. The current product is a token whose fees
  fund a Polymarket account. **FACT** — [PNP oracle docs](https://docs.pnp.exchange/platform/oracle-settlement.md),
  [pnp.exchange](https://www.pnp.exchange)
- **Pumpcade.** Livestream markets, "curated pairs". Its token PUMPCADE traded above a $46M market cap in April 2026.
  **SECONDARY FACT** — [Bitget](https://www.bitget.com/news/detail/12560605367582), 2026-04-15
- **Hackathon builds** (Colosseum, all **FACT** via Copilot records):
  - Dum.fun: rug, moon or graduate.
  - Survive.fun: survive or rug, 2% fee on the losing pool.
  - RugRoulette: 3% fee from the losing side, 7-day resolution.
  - Bet on Pump (Breakout 2025), PumpRace, Movr.
  - dehype.fun (Radar 2024).
  - Pumply.Market (Cypherpunk 2025): settles via Polymarket.
  - Bubblegum: every question is a token.
  - [Colosseum project pages](https://colosseum.com/projects/explore/dum.fun) follow the pattern
    `https://colosseum.com/projects/explore/<slug>`.

**pump.fun itself**
- pump.fun's June 2026 launch, "GO", is a task-bounty escrow (about 754 bounties, about $440K in escrow), not an
  event market. **SECONDARY FACT**, 2026-06-12 —
  [Galaxy Research](https://www.galaxy.com/insights/research/weekly-top-stories-06-12-26-pump-fun-go-marketplace-cftc-prediction-market-rules-anthropic-fable-5)
- pump.fun backs Pumpcade and PumpMarket's hackathon. **SECONDARY FACT** — [The Block](https://www.theblock.co/post/396213/pump-fun-pre-seed-funding-round-livestream-prediction-markets-pumpcade),
  [GlobeNewswire](https://www.globenewswire.com/news-release/2026/02/26/3245639/0/en/pumpmarket-brings-prediction-markets-to-pump-fun-public-hackathon.html)

**Graduation context**
- Fewer than about 2% of pump.fun tokens graduate; graduation happens at roughly $69k market value, about 85 SOL of
  net buying. **SECONDARY FACT** (search text) —
  [crypto.news](https://crypto.news/what-is-a-bonding-curve-memecoin-pricing-explained/),
  [BloFin Academy](https://blofin.com/en/academy/education/solana/solana-memecoins-and-pump-fun-explained)
- The Block reports pump.fun at 95% of daily graduations and about 100 graduations a day across launchpads.
  **SECONDARY FACT** (search text) —
  [The Block](https://www.theblock.co/post/375352/pump-fun-dominates-token-launches-1-million-daily-despite-market-slowdown)
  - The date of that article is not confirmed. Treat these as indicative.

### Inferences
- **INFERENCE.** Demand clusters around **big, named token events**: pump.fun's own token, $LAPTOP, Lighter. Small-coin
  graduation markets have not shown demand. PumpMarket's 66 SOL over 63 markets is about 1 SOL per market.
- **INFERENCE.** With a base graduation rate under 2%, an hourly "will X graduate?" pot is lopsided by default. Most
  pots would have almost everyone on NO and pay little, and the YES side is exposed to the creator pumping the coin.
  Big-token thresholds (supply burned, locked LP, FDV by on-chain supply × Pyth price) look more viable than
  per-coin graduation.
- **INFERENCE.** Polymarket's token markets resolve on "the most liquid price source", decided through UMA. A Brot
  market that computes, say, supply × Pyth price at a slot from on-chain accounts would be verifiable where
  Polymarket's is discretionary. Brot's deck already makes this point.

### Gaps
- Not read: Polymarket's own pages and rules (DNS failure). Volumes come from aggregators and search text, and the
  $LAPTOP figure differs between sources ($4.0M against $4.6M).
- Not found: memecoin markets on Kalshi; how much of World's or Limitless's catalogue is memecoins.

## 6. Where is the empty space?

### Takeaway
No live, funded product combines all three:
- open creation, steered to questions that can be checked;
- a pot model;
- resolution that a Solana program performs itself from on-chain accounts, with no creator, AI, vote or admin key.

Each piece exists separately:
- open creation: XO, Limitless, Melee;
- pots: Melee, Triad, PumpMarket;
- program-read price resolution: Tapebound, Hxro.

The gap is narrowest on price markets and widest on non-price Solana state.

### Cited Findings
- **Open creation with human resolution.**
  - Melee: the creator resolves, at its discretion. **FACT** — [Melee ToU](https://melee.markets/docs/melee-terms-of-use.pdf)
  - XO Market: an AI oracle plus a jury. **SECONDARY FACT** — [Blockworks Research](https://blockworks-research.beehiiv.com/p/pump-fun-of-prediction-markets)
  - Limitless: Pyth for price markets, the team for events. **FACT** — [docs](https://docs.limitless.exchange/user-guide/market-resolution.md)
- **Template-steered creation.** Already used by Melee Phase 2, Limitless (price targets only) and HIP-4
  (validator-voted templates). **SECONDARY FACT**, KuCoin 2026-10-02; **FACT**, Limitless blog; **SECONDARY FACT**,
  The Block 2026-07-20.
- **AI resolvability gate.** PNP checks at creation whether a question is answerable, and Opinion AI "assists in the
  creation of permissionless markets". **FACT** — [PNP docs](https://docs.pnp.exchange/platform/oracle-settlement.md),
  [Opinion docs](https://docs.opinion.trade)
- **Off-chain settlement everywhere for memecoins.** Every memecoin market product found settles through off-chain
  indexers and a signer (section 4).
- **Polymarket may open creation.** It signalled permissionless deployment and creator fees (2026-02-17). **SECONDARY
  FACT** — [DeFi Rate](https://defirate.com/news/polymarket-launches-public-api-unlocks-permissionless-liquidity/)

### Inferences
- **INFERENCE.** A creation box that only offers what a typed on-chain reader can verify is a stronger version of
  what PNP (AI gate) and Melee or Limitless (templates) do. Its advantage: the check is the same code that resolves,
  so a question that passes creation cannot become unresolvable later.
- **INFERENCE.** The defensible message is "nobody, including the creator and Brot, decides the result", not "reads
  on-chain data". Pyth-settled price markets already do the latter. That message holds only for market kinds whose
  underlying account a single participant cannot cheaply move.
  - The repo's resolver notes already reject pool reserves and live TVL for that reason (`CLAUDE.md`, `RESOLVERS.md`).
  - Per-coin pump.fun graduation would fail that test unless markets are limited to coins with enough liquidity.
- **INFERENCE.** The main threats are three:
  - Polymarket shipping permissionless creation with creator fees;
  - Melee reaching mainnet with funding and a waitlist;
  - Limitless or HIP-4 extending templated, automatically resolved creator markets to Solana-style token-state
    questions.
- **INFERENCE.** Base rates argue for caution on creator rewards as a growth engine. Augur (0 to 50% creator fee), PNP
  (30%), Trueo ($4M raised, about $780k lifetime volume), Zeitgeist and Omen all show that open creation plus a fee
  share does not by itself bring liquidity.

### Gaps
- Not quantified: market-level liquidity distribution on XO or Limitless creator markets, beyond the totals cited.
- Not verified: whether Melee's mainnet date has been announced.

## Addendum, 2026-10-07: who used the pump.fun comparison, and which sites answer today

Checked on 2026-10-07 by HTTP request and page read. "Up" means the site answered; it does not mean real money or
open access. A site's own text is labelled FACT for what it says, not for whether it is true.

| # | Project | Chain | The comparison, and who made it | Status on 2026-10-07 |
|---|---|---|---|---|
| 1 | XO Market | Own rollup | "pump.fun of prediction markets", Blockworks Research title, 2025-07-01 (third party) | Up; title "Permissionless Conviction Markets", "Launch App" link [FACT, xo.market] |
| 2 | Xmarket | BNB Chain | "Pump.fun for Prediction Markets", own press release, 2026-03-04 | Up; "Xmarket IS NOW LIVE!", homepage volume showed "$0" [FACT, xmarket.app] |
| 3 | Melee Markets | Solana | "PumpFun-style speculation with Polymarket-style prediction markets", own Colosseum entry | Beta up; access "drops in waves", codes on X and Discord [FACT, melee.markets]; play credit on devnet per section 2 |
| 4 | Dum.fun | Solana | "Pump fun meets Polymarket", own Colosseum Frontier entry | Up; page text mentions points before a "mainnet launch" [FACT, dum.fun; INFERENCE: not on mainnet yet] |
| 5 | Bubblegum | Solana | "we took the engine from Pump.fun", own Colosseum Frontier entry (PNP team) | Vercel preview up; page says "mainnet" [FACT on the text; not verified on-chain] |
| 6 | PNP Exchange | Solana | "Pump.fun meets Polymarket" (SECONDARY, earlier repo note) | Up, pivoted: coin launches whose fees fund a Polymarket account; contrasts itself with pump.fun's fee wallet [FACT, pnp.exchange] |
| 7 | PumpMarket | Solana | Pairs Polymarket with pump.fun's approach; graduation markets in pump.fun's hackathon (SECONDARY, GlobeNewswire 2026-02-26) | Down, HTTP 402 [FACT]; code public at github.com/ganette57/pumpmarket.fun |
| 8 | Llatria | Off-chain (plans to route to Kalshi) | "If you've seen pump.fun in the crypto world, the shape is familiar", own Product Hunt text [SECONDARY, hunted.space] | No response [FACT]; alpha with play money per its listing |
| 9 | Pumpcade | Solana | Not found using the comparison; pump.fun led its $1M pre-seed; $5M seed led by Jump Crypto and Foundation Capital at a reported $44M valuation [SECONDARY, The Block 2026-04-02; laikalabs.ai] | Docs up (docs.cade.market, "During beta…"); cade.market shows a waitlist [FACT; INFERENCE that it is Pumpcade's] |
| 10 | Limitless | Base | Not found using the comparison; open creator markets with daily limits, 2% of taker fees to the creator | Up [FACT, limitless.exchange] |

Also seen once, not verified: AnyMarkets ("meme coins (moon or rug)", creators earn 1% of volume, per pm.wiki; no
site found), Proteus and evently (free creation, per their docs pages).
