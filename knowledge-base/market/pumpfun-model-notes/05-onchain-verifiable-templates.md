# On-chain verifiable market templates for Brot Markets (what a Solana program can resolve by itself, and what it costs to force each answer)

Research date: 2026-10-07. Scope: question templates a permissionless `resolve` can decide by reading typed Solana
accounts, with no opinion oracle, for an autocompleting public creation box. Labels: **FACT** (primary source: docs,
source code, or a read-only RPC read done for these notes), **SECONDARY FACT** (search snippet or aggregator),
**INFERENCE** (mine), **not verified** (layout or claim I could not confirm). Repo facts carry the repo's own tags
(V = verified on live mainnet bytes by the team, S = upstream source only).

Method notes: the repo files listed in the assignment were read first. Pyth's feed catalogue was pulled from the
public Hermes listing (`/v2/price_feeds`, no key needed). The sponsored-feed table was extracted from the Pyth docs
page payload; every sponsored account was derived (PDA seeds `[shard 0 as u16 LE, feed_id]`, checked against the
documented SOL address) and read with `getMultipleAccounts` on public mainnet and devnet RPC. No transaction was sent.
The session's web-search budget ran out midway; later material comes only from direct fetches of primary URLs (docs,
GitHub source), and the topics left unsearched are listed under Gaps.

## 1. Pyth coverage beyond crypto, and its manipulation risks

### Takeaway
Pyth lists about 1,880 feeds, among them 1,051 US equities and ETFs, 39 FX pairs, 11 metals, 36 commodities and 19
US rates. On Solana, though, only 64 feeds are sponsored (kept fresh by Pyth). They are almost all crypto, with one US
stock (GLXY) and no FX, metals or index feeds. Every other feed has to be posted by someone holding a Hermes API key.
Traditional-finance feeds stop updating outside market hours. Thin crypto feeds are where the oracle can be
manipulated, the Mango Markets pattern.

### Cited Findings

**Catalogue size and asset classes**
- FACT: The public Hermes listing returned 1,882 feeds on 2026-10-07: Equity 1,251 (US 1,051, HK 107, Equity.Index 32,
  JP 21, KR 18, CN 14, TW 6, IN 1, other 1), Crypto 423, Crypto Redemption Rate 70, FX 39, Commodities 36, Funding Rate
  11, Metal 11, Crypto NAV 11, Crypto Index 11, plus 19 `InterestRate.*` entries with an empty asset type (SOFR, EFFR,
  OBFR, BGCR, TGCR, US 2Y/3Y/5Y/7Y/10Y/20Y/30Y yields and bond prices) — [Hermes price_feeds](https://hermes.pyth.network/v2/price_feeds)
- FACT: Sample symbols present: `Equity.US.AAPL/USD`, `Equity.US.SPY/USD`, `QQQ`, `IWM`, `GLD`, `TSLA`, `NVDA`; FX
  `EUR/USD`, `USD/JPY`, `USD/BRL`, `USDXY`; metals `XAU/USD`, `XAG/USD`, `XPT/USD`, `XPD/USD`; commodities
  `Commodities.Index.BRENT/USD`, `WTI1M`, `NATGAS`, `COPPER` and dated futures such as `BRENTZ6`; funding rates from
  Binance, Deribit and Hyperliquid; equity "index" products such as `Equity.Index.US500/USD`, `US100`, `JP225`, and
  `Equity.Index.OPENAI/USD`, `ANTHROPIC/USD` — [Hermes price_feeds](https://hermes.pyth.network/v2/price_feeds)
- FACT, conflicting with the listing count: Pyth's own docs say Core provides "500+ price feeds" and "All 500+ feeds
  are available on all chains" — [Pyth Core LLM guide](https://docs.pyth.network/llms-price-feeds-core.txt). The
  listing carries a `min_channel` attribute (`fixed_rate@200ms` 1,571, `fixed_rate@50ms` 279, `real_time` 32), a Pro
  concept, so some listed feeds may be Pro-only. Which listed feeds can actually be posted through Core on Solana is
  **not verified** — [Hermes price_feeds](https://hermes.pyth.network/v2/price_feeds)
- FACT: Each listing entry carries a machine-readable `schedule` and `market_hours {is_open, next_open, next_close}`.
  AAPL and SPY: `America/New_York;0930-1600` Mon to Fri, weekends closed, holidays listed (for example `1126/C`,
  `1127/0930-1300`, `1225/C`). XAU: Sunday 18:00 to Friday 17:00 ET with a daily 17:00 to 18:00 break. EUR/USD: Sunday
  17:00 to Friday 17:00 ET. Crypto.SOL/USD: open every day. EFFR: open daily, with holiday closures — [Hermes price_feeds](https://hermes.pyth.network/v2/price_feeds)
- FACT: Pyth Core has "120+ first-party publishers"; the on-chain contracts are permissionless, but Hermes needs an API
  key since 2026-08-26 (`Authorization: Bearer`). The upgraded drop-in endpoint is `pyth.dourolabs.app/hermes` — [Pyth Core LLM guide](https://docs.pyth.network/llms-price-feeds-core.txt); [Pyth docs index](https://docs.pyth.network/llms.txt)

**What is sponsored (pushed) on Solana**
- FACT: The Solana push-feed table lists 64 feeds: 61 on a 55 s heartbeat or 0.5% deviation, `CASH/RD.RR` and
  `CASH/USD` on 30 s / 0.5%, and `PST/USDC.RR` on 220 s / 0.05%. All are marked Pro-compatible "available". The list:
  SOL, MSOL, BSOL, SSOL/SOL, BONK, W, MEW, USDC, BTC, USDT, JUP, ETH, PYTH, WIF, INF, MNDE, JLP, WBTC, TRUMP, FARTCOIN,
  ACRED, PUMP, ZBTC, LBTC, ORE, CASH, JUPUSD, JITOSOL, JTO, RENDER, ZEC, DSOL, MET, CLOUD, HYPE, USD1, BNSOL, TNSR, 2Z,
  AAVE, EURC, SYRUPUSDC, USDE, a set of `.RR` redemption rates and `NAV.USTB`/`NAV.USCC`, and one equity,
  `Equity.US.GLXY/USD`. No FX, metal, commodity, rate or index feed is in the Solana table. The page's banner also
  announces added feeds (`Equity.Index.SPY/QQQ/EWZ/HIMS`, `InterestRate.Index.CMUS10Y...`), but these are not in the
  Solana table — [Pyth push feeds, Solana](https://docs.pyth.network/price-feeds/core/push-feeds/solana)
- FACT (derived and read for these notes): The addresses on that page are the **legacy-generation** PDAs. Deriving
  `[0u16 LE, feed_id]` under `pythWSnsw...` reproduces the documented SOL address `7UVimffx...`. Under the upgraded
  `pyt2F414...` it gives `7AviUf9n...`, the address the repo's reader notes already use — [Pyth push feeds, Solana](https://docs.pyth.network/price-feeds/core/push-feeds/solana); [repo Pyth notes](../../../knowledge-base/tecnologia/pyth-leitor-de-preco.md)
- FACT (read-only RPC, one snapshot, 2026-10-07): **Mainnet, upgraded generation: 64 of 64 accounts exist and 63 had a
  publish time 7 to 51 s old.** `NTBILL/USD.RR` was about 27 days stale. **Devnet, upgraded generation: only 17 of 64
  exist.** These are SOL, MSOL, SSOL/SOL, BONK, USDC, BTC, USDT, JUP, ETH, PYTH, WIF, INF, JLP, WBTC, FARTCOIN, PUMP and
  JITOSOL/USD. SOL and BTC were 21 s old; the others about 143 s. Devnet, legacy generation: 47 exist, and only SOL was
  fresh — [mainnet RPC](https://api.mainnet-beta.solana.com), [devnet RPC](https://api.devnet.solana.com), addresses from [Pyth push feeds](https://docs.pyth.network/price-feeds/core/push-feeds/solana)
- FACT (S, `main` branch): Anyone can call the push oracle's `update_price_feed` for any `(shard_id, feed_id)`. The
  account is the PDA `[shard_id.to_le_bytes(), feed_id]` and is its own write authority. The program "only update[s]
  the price feed if the message contains a newer price" (`next_timestamp > current_timestamp`), so `publish_time`
  in a push account only moves forward. TWAP messages are rejected there — [pyth-push-oracle lib.rs](https://github.com/pyth-network/pyth-crosschain/blob/main/target_chains/solana/programs/pyth-push-oracle/src/lib.rs).
  Whether the deployed upgraded program (`pyt2F4...`) is built from this exact source: **not verified**.
- FACT (repo): The reader trusts only `rec2HH...`, takes exactly 134 bytes and Full verification, and requires the
  named `feed_id`. Anyone can post a full-verified `PriceUpdateV2` of any feed to an account they choose. Mainnet
  sponsored SOL refreshed every 5 to 11 s, devnet every 62 to 64 s — [repo Pyth notes](../../../knowledge-base/tecnologia/pyth-leitor-de-preco.md); [price_touch.rs](../../../programs/brot-markets/src/readers/price_touch.rs)

**Market hours and closed-market behaviour**
- FACT: Pyth's published hours: US equities 9:30 to 16:00 ET on weekdays; pre-market 4:00 to 9:30; post-market 16:00 to
  20:00; overnight Sunday to Thursday 20:00 to 4:00. FX Sunday 17:00 to Friday 17:00 ET. Metals Sunday 18:00 to Friday
  17:00 ET with a daily 17:00 to 18:00 maintenance break. Rates weekdays 8:00 to 17:00 ET. WTI Sunday 18:00 to Friday
  17:00. Brent Sunday 18:00 to Friday 18:00. Exchange holidays apply — [Pyth market hours](https://docs.pyth.network/price-feeds/market-hours)
- FACT: "US equity markets only trade during certain hours, and outside those hours, it's not clear what an equity's
  price is ... In such cases, Pyth may return a stale price for the product." The SDKs apply a staleness check by
  default — [Pyth Core best practices](https://docs.pyth.network/price-feeds/core/best-practices)
- FACT: Pyth Pro (formerly Lazer) has, since 2026-03-23, carried forward the last price when a market is closed. A
  consumer detects this by comparing `feedUpdateTimestamp` with `timestampUs`. Pro also exposes `marketSession`
  (`regular`, `preMarket`, `postMarket`, `overNight`, `closed`) and `publisherCount` — [Pyth Pro FAQ](https://docs.pyth.network/price-feeds/pro/faq); [Pyth Pro LLM guide](https://docs.pyth.network/llms-price-feeds-pro.txt)
- FACT: On Solana, Pro payloads are verified with the native Ed25519 program through the Pyth Lazer program
  `pytd2yyk641x7ak7mkaasSJVXh6YYZnC7wTmtgAyxPt`, using the storage account `3rdJbqfnagQ4yx9HXJViD4zc4xpiSqmFsKpPuSCQVyQL`.
  Pro needs a subscription token scoped by asset type and channel — [Pyth Pro SVM integration](https://docs.pyth.network/price-feeds/pro/integrate-as-consumer/svm); [Pyth price feeds overview](https://docs.pyth.network/llms-price-feeds.txt)

**Confidence, publisher concentration, selection**
- FACT: In Pro, the aggregate price is "the median of all publisher prices when at least `min_pub` publishers have
  contributed". Confidence is `max(price − p25, p75 − price)` over the pooled publisher quotes. "A low publisher count
  can distort it: non-optimal behavior from a single publisher ... can move confidence in ways unrelated to the market."
  Pro's `confidence` field is labelled experimental — [Pyth Pro: understanding price data](https://docs.pyth.network/price-feeds/pro/understanding-price-data); [Pyth Pro LLM guide](https://docs.pyth.network/llms-price-feeds-pro.txt)
- FACT: Core guidance: use `price − conf` and `price + conf` conservatively; "Pause activity if the conf/price ratio
  exceeds your threshold (e.g., conf/price > 2%)" — [Pyth Core LLM guide](https://docs.pyth.network/llms-price-feeds-core.txt)
- FACT: "Pull updates give users ... some ability to select which price to use"; "This ability is functionally
  equivalent to latency"; "Adversaries are highly likely to win these races"; positions opened and closed in the same
  block can be exploited with flash loans; recommended defences are delayed settlement and strict staleness — [Pyth Core best practices](https://docs.pyth.network/price-feeds/core/best-practices)
- FACT: EVM `parsePriceFeedUpdatesUnique` returns "the first updates published in minPublishTime". This gives a
  canonical "first price at or after T" rule. The Solana `PriceUpdateV2` stores `prev_publish_time`, which allows the
  same test on Solana (`prev_publish_time < T <= publish_time`) — [IPyth.sol](https://github.com/pyth-network/pyth-crosschain/blob/main/target_chains/ethereum/sdk/solidity/IPyth.sol); [repo Pyth notes, layout](../../../knowledge-base/tecnologia/pyth-leitor-de-preco.md)
- FACT (S): The Solana receiver SDK defines a `TwapUpdate` account (`TwapPrice {feed_id, start_time, end_time, price,
  conf, exponent, down_slots_ratio}`) and `get_twap_no_older_than` checks the window size — [price_update.rs](https://github.com/pyth-network/pyth-crosschain/blob/main/target_chains/solana/pyth_solana_receiver_sdk/src/price_update.rs).
  Whether `rec2HH...` accepts TWAP posts: **not verified**.
- FACT: Mango Markets, October 2022. The SEC alleged "a series of large purchases of the thinly traded MNGO token for
  the purpose of artificially raising the price", which inflated a perpetual position used as collateral to borrow
  and withdraw about $116 million — [SEC press release 2023-13](https://www.sec.gov/news/press-release/2023-13)
- FACT (repo): The reader rules planned for Sprint 03 (starting values, to be calibrated): every bet carries a price
  at most 30 s old and is refused once `price + conf` reaches the target; YES needs `price − conf >= target`, with conf
  at most 0.5% of price, inside the deadline — [TECHNICAL-PLAN 3.4.8](../../../docs/technical/TECHNICAL-PLAN.md)

### Inferences
- **Questions that become possible.** Touch: "Will SOL touch $300 before Nov 30?". At-time: "Will BTC be above $X at
  00:00 UTC on D?". Range at time T. Relative: "Will SOL outperform ETH from D1 to D2?" (four reads). Session close:
  "Will AAPL close above $X on D?". FX, metals and rates level at time T: "Will the 10-year US yield be above 4.5% at
  16:00 ET on D?", "Will gold trade above $X before D?". All of these are deterministic functions of a
  Wormhole-attested Pyth price, so none is an opinion oracle.
- **"Close above X" needs the uniqueness rule, not "latest price".** Pyth Core publishes no official close. A safe
  definition is "the first Pyth update with `publish_time >= T`", proved with `prev_publish_time < T`. T should sit
  *inside* the session (for example 15:59:00 ET): once the regular feed closes at 16:00, the first update at or after
  16:00 may not come until the next open. The UI should refuse a T that falls on a holiday or outside the feed's
  `schedule`.
- **Bets on traditional-finance feeds can only open while the market is open.** Under the 30 s freshness rule, a bet
  on an equity cannot be placed on a weekend or overnight. Touch markets on equities will see gaps at the open: a
  touch then counts only if a posted update shows the price beyond target. The question text must say "as proved by
  a Pyth update".
- **Non-sponsored feeds need a Brot keeper with a Hermes key.** Because the push oracle is permissionless per shard,
  Brot can keep its own shard (for example shard 7) of AAPL, XAU or EUR/USD at a canonical, forward-only address. That
  gives bets the same canonical-account defence the repo review proposed for sponsored feeds. Cost: a 134-byte rent
  deposit (about 0.0018 SOL, computed from the rent constants in section 4), transaction fees, and the key.
- **Devnet demo constraint.** On devnet only SOL and BTC are fresh enough. The other 15 upgraded devnet feeds were
  about 143 s old in one read. A demo on another asset needs either a relaxed staleness bound or a keeper posting
  updates.
- **Manipulation cost depends on the feed.** For SOL, BTC and ETH, forcing a touch means moving the publisher median
  across many large venues: the market itself, not a cheap attack. For thin feeds (MEW, ORE, CLOUD, MET, small
  NAV/RR feeds, the exotic `Equity.Index.OPENAI` and similar), the Mango pattern applies: buy the spot on the few
  venues publishers read, long enough for one update. Requiring `price − conf >= target` helps, because a spike that
  moves only some publishers widens conf. It does not help if all publishers read the same thin venue.
- **Funding-rate feeds** (`FundingRate.Binance.BTC/USDT` and others) come from a single venue each. Treat them as
  thin, or refuse them.
- **The trust root is the same for every Pyth template:** Wormhole guardians (Full = two-thirds of guardians, per the
  SDK) plus whoever can upgrade `rec2HH...`. That authority is a PDA on mainnet, and who controls it is not verified
  (repo).

### Gaps
- Publisher count per feed (AAPL, XAU, EUR/USD, thin crypto feeds) was not found; Pyth Insights was not read because
  the search budget ran out. This is the key input for a per-feed cap.
- No quantitative cost-to-move-the-oracle figure was found for any Pyth feed.
- Whether every Hermes-listed equity, FX or rate feed is served by the upgraded Core endpoint and accepted by
  `rec2HH...` on devnet and mainnet: not verified.
- Update cadence of the rate feeds (EFFR and SOFR are published daily by the source) inside Pyth: not verified.
- The ages measured are one snapshot, not a time series.

## 2. Switchboard On-Demand and other oracles: where the "opinion oracle" line falls

### Takeaway
Switchboard On-Demand lets anyone define a feed as a job (HTTP calls, JSON parsing, Kalshi API, LLM prompts, Solana
account fetches). TEE-attested oracles sign the result, and a program can check the exact job by its hash. That
proves *which* recipe ran, not that the data source tells the truth. The line for Brot: accept only jobs that compute a
fixed function over many independent market sources. Refuse anything resting on one web API, a human, or an LLM. In
practice the MVP needs no Switchboard at all.

### Cited Findings
- FACT: "Switchboard feed IDs are deterministic SHA-256 hashes of the feed's protobuf definition". By rebuilding the
  expected feed on-chain and comparing hashes, "you cryptographically prove the oracle uses exactly the data sources
  you expect". The worked example is a Kalshi prediction-market order, fetched with an API key through variable
  overrides — [Switchboard prediction market tutorial](https://docs.switchboard.xyz/docs-by-chain/solana-svm/prediction-market/prediction-market-tutorial)
- FACT: Verification uses an Ed25519 instruction plus `QuoteVerifier` (queue, SlotHashes, Instructions sysvar, clock
  slot, `max_age`). Stored quotes carry `min_oracle_samples`. Canonical quote accounts are derived from the queue and
  the feed ID — [Switchboard quote program accounts](https://docs.switchboard.xyz/docs-by-chain/solana-svm/price-feeds/quote-program-accounts)
- FACT: Task types include `HttpTask`, `JsonParseTask`, `KalshiApiTask`, `LlmTask` (example: "Using OpenAI's GPT-4
  model to generate a joke"), `SolanaAccountDataFetchTask`, `SplTokenParseTask`, `SplStakePoolTask`,
  `SanctumLstPriceTask`, `MarinadeStateTask`, `PumpAmmTask`, `HistoryFunctionTask` (min or max over a lookback) and
  `OracleTask`, which can read Pyth — [Switchboard task types](https://docs.switchboard.xyz/custom-feeds/task-types)
- FACT: Oracles run in AMD SEV-SNP TEEs. "Because TEEs are not perfect and can have undocumented security flaws,
  Switchboard needs to have a system in place to quickly shut down or upgrade any oracle." A queue is "A whitelisted
  environment ... controlling which software can be executed and which oracles are authorised" — [Switchboard TEEs](https://docs.switchboard.xyz/how-it-works/technical-architecture/trusted-execution-environments-tees); [Switchboard oracle queues](https://docs.switchboard.xyz/how-it-works/technical-architecture/oracle-queues)
- FACT: Switchboard describes itself as "the only permissionless way to bring data on-chain", with latencies of
  "2-5ms with Surge, or 400ms with our standard oracles" — [Switchboard docs](https://docs.switchboard.xyz/)

### Inferences
- **Where the line falls.** An oracle is an "opinion oracle" when its answer needs someone's judgment, or when it
  comes from a single source that can be edited (a web page, a sports API, a Kalshi order, an LLM). A "data oracle"
  computes a fixed, public function over data no single party controls. Pyth's median over 120+ publishers is a data
  oracle. A Switchboard `LlmTask` or `HttpTask` against one endpoint is an opinion oracle with a signature on it: the
  feed hash proves the recipe, not the truth of the source.
- **Rule for the box.** Never offer Switchboard jobs containing `LlmTask`, `HttpTask` or `KalshiApiTask`, or any job
  with fewer than three independent market sources. `SolanaAccountDataFetchTask` adds nothing, since the program can
  read the account itself. Worse, it reads one slot off-chain, which brings back the flash-loan problem the repo
  rejected (live TVL, reserves).
- **Possible later use:** aggregating several on-chain accounts in one value (for example the sum of TVL across
  pools), or `HistoryFunctionTask` max/min for touch markets on assets Pyth lacks. Each adds a trust root (queue
  operators, TEE, Switchboard's upgrade keys) that Brot does not carry today. Research tier only.

### Gaps
- Number of oracles on the default Solana mainnet queue, the default `min_oracle_samples`, and who controls queue
  permissions and upgrades: not read.
- No public incident record for Switchboard On-Demand was searched (search budget exhausted).

## 3. Solana-native metrics: one-way, epoch-lagged, or flash-movable

### Takeaway
Most native metrics worth a market are already classified in `RESOLVERS.md`. They fall into three groups: ratchets
that cost real money to move (burn, permanent lock, DAMM v2 cumulative fees); epoch snapshots that need capital held
across a boundary (stake-pool TVL, validator stake, cluster stake); and party-controlled flags (authority revoked,
program upgraded, metadata frozen, governance or multisig outcomes, vesting cancels). The new findings: governance
votes can be flash-loaned when "vote tipping" is on, Squads proposals can be closed once final, vesting schedules are
mostly known in advance, and lending, perps and LST supply live values move within a single transaction.

### Cited Findings

**Already verified in the repo (V or S as tagged there)**
- FACT (repo): Classic SPL mint: supply u64 @36, mint authority COption @0, freeze authority @46. ProgramData: slot u64
  @4 and upgrade authority @12/13. SPL stake pool `last_epoch_total_lamports` (walks the options, @427 when they are
  unset) is a snapshot. Live `total_lamports` was flash-inflated in a mainnet simulation at a 0.10% round-trip cost on
  JitoSOL. DAMM v2 `permanent_lock_liquidity` u128 @552 has a single writer and no unlock. DAMM v2
  `metrics.total_lp_*_fee` @568/@584 and `total_protocol_*_fee` @600/@608 are cumulative, with no reset; the 20%
  protocol share is the minimum wash cost. Metaplex `is_mutable` only flips one way. Vote `epoch_credits` only grows,
  capped at 6,912,000 per epoch. Token-2022 TLV ratchets need a default-deny walker. Raydium volume counters are dead.
  pump.fun `complete` @48 costs 18.66 SOL on an untouched curve, 2.16 SOL for the last 10% and 0.07 SOL for the last
  1%. Native `delegation.stake` is rejected — [RESOLVERS.md sections 1 to 3](../../../RESOLVERS.md)
- FACT (repo, S): `sol_get_epoch_stake(null)` returns the cluster total. Epoch stakes are frozen for the epoch but
  filtered (top 2000, BLS key, minimum balance); LiteSVM returns 0 — [RESOLVERS.md 1.4, 3.3](../../../RESOLVERS.md)
- FACT (repo): In a pot, party-controlled kinds are a free option for the key holder. They should stay out of the MVP
  pot or carry a low cap and a "controlled by one party" badge — [wave-2 E1](../../../docs/business/_review/wave-2-technical-security.md)

**SPL Governance (Realms)**
- FACT (S): `ProposalV2` layout: `account_type` u8 @0, `governance` @1, `governing_token_mint` @33, `state` u8 @65
  (Borsh order: Draft 0, SigningOff 1, Voting 2, Succeeded 3, Executing 4, Completed 5, Cancelled 6, Defeated 7,
  ExecutingWithErrors 8, Vetoed 9). Variable-length fields follow, ending with `name` and the description link —
  [proposal.rs](https://github.com/solana-labs/solana-program-library/blob/master/governance/program/src/state/proposal.rs); [enums.rs](https://github.com/solana-labs/solana-program-library/blob/master/governance/program/src/state/enums.rs).
  `ProposalV2` is variant 14 of `GovernanceAccountType`; I computed that from the enum order, and it is **not verified
  on live bytes**.
- FACT (S): `VoteTipping`: `Strict` ("Tip when there is no way for another option to win"), `Early` and `Disabled`.
  `cast_vote` calls `try_tip_vote`. Once a proposal has left `Voting`, `relinquish_vote` releases the tokens without
  removing the vote. `assert_can_withdraw_governing_tokens` only requires no unrelinquished votes, no outstanding
  proposals and no unexpired locks. `voting_at_slot` notes that snapshot-based vote weights are "going to be required"
  (not implemented) — [token_owner_record.rs](https://github.com/solana-labs/solana-program-library/blob/master/governance/program/src/state/token_owner_record.rs); [process_relinquish_vote.rs](https://github.com/solana-labs/solana-program-library/blob/master/governance/program/src/processor/process_relinquish_vote.rs); [process_cast_vote.rs](https://github.com/solana-labs/solana-program-library/blob/master/governance/program/src/processor/process_cast_vote.rs)
- FACT: The `solana-labs/solana-program-library` repository is archived (GitHub API: `archived: true`, last push
  2025-03-11), so the deployed governance programs may differ from this source — [GitHub repo](https://github.com/solana-labs/solana-program-library)

**Squads v4**
- FACT (S): `Proposal` = 8-byte Anchor discriminator, `multisig` @8, `transaction_index` u64 @40, `status` Borsh enum
  tag @48 (Draft 0, Active 1, Rejected 2, Approved 3, Executing 4 deprecated, Executed 5, Cancelled 6; most variants
  carry an i64 timestamp), then the `approved`, `rejected` and `cancelled` vectors — [Squads proposal.rs](https://github.com/Squads-Protocol/v4/blob/main/programs/squads_multisig_program/src/state/proposal.rs)
- FACT (S): Transaction and proposal accounts can be closed, with rent going to `multisig.rent_collector`, when the
  proposal is `Executed`, `Rejected` or `Cancelled` (or stale), provided a rent collector is set. The account struct I
  read shows no signer requirement — [transaction_accounts_close.rs](https://github.com/Squads-Protocol/v4/blob/main/programs/squads_multisig_program/src/instructions/transaction_accounts_close.rs)

**Vesting: Jupiter Lock and Streamflow**
- FACT (IDL in the official SDK): Jupiter Lock program `LocpQgucEQHbqNABEYvBvwoxCPsSbG91A1QaQhQQqjn`. `VestingEscrow`
  fields in order: recipient, token_mint, creator, base (Pubkeys), escrow_bump, update_recipient_mode, cancel_mode,
  token_program_flag (u8), padding [u8;4], cliff_time, frequency, cliff_unlock_amount, amount_per_period,
  number_of_period, **total_claimed_amount**, vesting_start_time, **cancelled_at** (u64), padding u64, buffer
  [u128;5]. Instructions include `cancelVestingEscrow` and `closeVestingEscrow` — [jup-ag/lock-sdk idl.ts](https://github.com/jup-ag/lock-sdk/blob/HEAD/src/locker/idl.ts).
  The offsets that follow if the fields are packed are 184 (`total_claimed_amount`) and 200 (`cancelled_at`), 296
  bytes in all. These are computed and **not verified on live bytes**. The program source is not in a public jup-ag
  repo (the API returns Not Found for `jup-lock`).
- SECONDARY FACT (client SDK layout, not program source): a Streamflow stream has `magic` (8), `version` (1),
  `created_at`, **`withdrawn_amount`**, **`canceled_at`**, `end_time`, `last_withdrawn_at`, then sender, recipient,
  mint and escrow keys, `start_time`, `net_amount_deposited`, `period`, `amount_per_period`, `cliff`, `cliff_amount`,
  cancel/transfer flags, `pausable`, `can_update_rate`, a `closed` flag, `pause_cumulative` and `last_rate_change_time` — [Streamflow js-sdk layout.ts](https://github.com/streamflow-finance/js-sdk/blob/master/packages/stream/solana/layout.ts).
  Program ID and live layout: **not verified**.

**Sysvars and cluster-wide numbers**
- FACT: The sysvars are Clock (slot, epoch_start_timestamp, epoch, leader_schedule_epoch, unix_timestamp),
  EpochSchedule, Fees, Instructions, RecentBlockhashes, Rent, SlotHashes, SlotHistory, StakeHistory, EpochRewards
  (distribution_starting_block_height, num_partitions, parent_blockhash, total_points, total_rewards,
  distributed_rewards, active) and LastRestartSlot ("the slot number of the last restart or zero if none ever
  happened"). None of them exposes total SOL supply, inflation or transaction counts — [Anza sysvars](https://docs.anza.xyz/runtime/sysvars)

### Inferences
Each row gives the account and field, whether one transaction can reverse the value (flash risk), whether it is
monotone, what forcing YES costs, and whether a checkpoint is needed.

| Metric | Account and field | Reversible in one transaction? | Monotone? | Cost to force YES | Checkpoint? | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| Mint supply burned (classic SPL, mint authority None) | mint supply @36 | no | non-increasing | burn the gap: (supply − goal) × token price | baseline at creation | B (built upstream) |
| Mint or freeze authority revoked | mint @0 / @46 | no | one-way | 0 for the key holder | no | party-controlled: excluded from pot (E1) |
| Program upgrade authority revoked | ProgramData @12 | no | one-way | 0 for the authority | no | party-controlled |
| Program upgraded before D | ProgramData slot @4 > slot at creation | no | yes | 0 for the authority | baseline slot | party-controlled |
| Metadata frozen | Metaplex `is_mutable` | no | one-way | 0 for the update authority | no | party-controlled |
| Stake-pool TVL at epoch E | `last_epoch_total_lamports` | no (snapshot) | no | capital across one boundary; about 0.10% exit on JitoSOL, plus hedgeable price exposure (the yield is earned) | built-in epoch snapshot | B (built upstream); cap from the fee, not the principal |
| Validator stake at epoch E | `sol_get_epoch_stake(vote)` | no | no | delegate and wait an epoch; little or no fee | built-in | B after a devnet YES |
| Cluster stake at epoch E | `sol_get_epoch_stake(null)` | no | no | very large capital across an epoch | built-in | B (low interest) |
| Vote credits in epoch E | vote account `epoch_credits` walk | no | grows | cannot be bought; the validator can force NO by underperforming | per-epoch entry | B, flagged "the validator controls NO" |
| DAMM v2 locked liquidity | `permanent_lock_liquidity` @552 | no | grows | principal locked forever | no | B (built upstream) |
| DAMM v2 fees between creation and D | `total_*_fee` @568 to 608 | no | grows | at least 20% of the target as protocol share (attacker as sole LP), up to about 100% otherwise, plus price impact | baseline at creation | B (roadmap) |
| Raydium CPMM/AMM v4 LP burned | `lp_supply − lp_mint.supply` | no | grows | LP burned forever | baseline | B (needs two accounts) |
| pump.fun graduation | `BondingCurve.complete` @48 | no, but completion plus dump fits in one transaction | one-way | 18.66 SOL untouched; 0.07 SOL for the last 1% | progress at creation | C (on hold): needs a "curve mostly empty" guard and a cap |
| Governance proposal passes | `ProposalV2.state` @65 ∈ {3, 4, 5, 8} | maybe: deposit, tipping vote, relinquish and withdraw may fit one transaction when tipping is Strict or Early and no lock plugin applies | terminal states yes | from about 0 (flash-borrowed votes) to buying a majority; voters control it | no | C; refuse when tipping is on without a lock |
| Squads transaction executed | `Proposal.status` tag @48 = 5 | no | terminal | 0 for the members | no, but the account may be closed afterwards | party-controlled; closing makes it unreadable |
| Vesting claimed ≥ X / cancelled | Jupiter Lock @184 / @200; Streamflow `withdrawn_amount` / `canceled_at` | no | claimed grows | 0 for the recipient or sender; the unlock schedule itself is known at creation | baseline | party-controlled; the schedule is not a question |
| LST mint supply, Marinade mSOL supply, live stake-pool total | mint supply / `total_lamports` | yes (deposit then withdraw) | no | flash loan plus about 0.1% | — | refuse (repo 1.1) |
| Kamino / marginfi deposits, Drift / Jupiter perps open interest | reserve or market totals | yes (deposit and withdraw, open and close) | no | flash loan or round-trip fees | no snapshot field known | refuse |
| Jito tips to a validator in epoch E | tip-distribution account balance | donations add, nothing withdraws mid-epoch (inference) | grows within the epoch | the donated lamports themselves | per epoch | C; layout not verified |
| Epoch or slot reached before date D | Clock sysvar | no | grows | needs the cluster's validators, not money | no | A (novelty) |
| Cluster restart before D | LastRestartSlot sysvar | no | grows | halting Solana | no | C; feature activation not verified |
| Epoch rewards above X | EpochRewards `total_rewards`, readable while `active` | no | per epoch | not purchasable | short read window | C (low interest) |
| SOL total supply or inflation | none | — | — | — | — | refuse: not readable on-chain |

Notes on the table:
- **Stake-pool and validator-stake markets are "capital-gated", not "cost-gated".** A whale who deposits before the
  boundary and leaves after pays only the exit fee and a hedge, and earns staking yield meanwhile. The cost to force is
  about 0.1% of the gap on JitoSOL (repo figure), so a 1M SOL gap costs about 1,000 SOL in fees. The pot cap must
  come from that fee, not from the TVL.
- **Governance flash-pass is my reading of the source, not a tested exploit.** Most large DAOs use a voter-weight
  plugin (Voter Stake Registry and similar) whose locks would block withdrawal; whether a given realm does is a per-realm
  check (**not verified**). Governance outcomes are also decided by the very people who can take positions, which is
  E1 again.
- **Squads close is a griefing tool.** After `Executed`, anyone can close the accounts once a rent collector is set. A
  ratchet market must resolve YES on first sight of `Executed`. If it only ever sees a closed account, it must treat
  that as "unknown", never YES, and resolve NO only after the deadline: the repo's fail-closed rule.
- **Vesting:** "Will X tokens unlock by D?" is known at creation and is not a market. What is not known is decided by
  one party (the recipient claims, the sender cancels): party-controlled.

### Gaps
- Kamino, marginfi, Drift, Jupiter Perps, Marinade, Sanctum and the Jito tip-distribution layouts were not read
  (search budget exhausted). Their "flash-movable" verdicts are inferences from the repo's rule, not verified
  layouts. No snapshot field was found or ruled out.
- Deployed SPL Governance program IDs and versions, and whether `finalize_vote` is permissionless: not verified.
- Squads close permissionlessness: inferred from the account struct; the full instruction was not traced.
- LastRestartSlot activation on mainnet and devnet: not verified.

## 4. Counts that no single account holds (holders, active wallets, transactions, volume, "today's burn in fees")

### Takeaway
Holder counts, active wallets and transaction counts cannot be verified by a Solana program. No account holds them,
Solana's state hash does not support inclusion proofs (so no ZK or light-client shortcut exists), and they are cheap to
fake anyway: 10,000 fake holders cost about 20 SOL of refundable rent. The autocomplete should refuse them and offer
the nearest verifiable question instead.

### Cited Findings
- FACT: SIMD-0215 adds the Accounts Lattice Hash to the bank hash: a homomorphic sum over all accounts
  (`LTHASH(A) = sum of lthash(a)`, BLAKE3 XOF 2048 bytes). "The Accounts Lattice Hash does NOT support
  inclusion/exclusion proofs" — [SIMD-0215](https://github.com/solana-foundation/solana-improvement-documents/blob/main/proposals/0215-accounts-lattice-hash.md)
- FACT: The SlotHashes sysvar "contains the most recent hashes of the slot's parent banks". No sysvar exposes supply,
  inflation or transaction counts — [Anza sysvars](https://docs.anza.xyz/runtime/sysvars)
- FACT: `DEFAULT_LAMPORTS_PER_BYTE = 6_960` and `ACCOUNT_STORAGE_OVERHEAD = 128`, so a 165-byte token account needs
  (165 + 128) × 6,960 = 2,039,280 lamports (0.00203928 SOL), refundable on close — [solana-sdk rent](https://github.com/anza-xyz/solana-sdk/blob/master/rent/src/lib.rs)
  (arithmetic mine)
- FACT (repo): Raydium CLMM and AMM v4 volume counters are no longer written; DAMM v2 fee counters are the only live
  cumulative activity counters found — [RESOLVERS.md 1.2, 3.9](../../../RESOLVERS.md)
- FACT: Switchboard jobs can call any HTTP API (an indexer, for instance) and have the result signed — [Switchboard task types](https://docs.switchboard.xyz/custom-feeds/task-types)

### Inferences
The pitch judge's examples, one by one:

| Judge's example | Verifiable on Solana? | Why | What to offer instead |
| --- | --- | --- | --- |
| "more than 10,000 holders" | **No** | Spread over every token account; a crank cannot prove it saw them all; SIMD-0215 gives no inclusion proofs, so ZK has no state root to prove against. Sybil cost about 10,000 × 0.00204 = 20.4 SOL, refundable, plus dust and fees | "≥ X tokens burned by D" (supply ratchet), "≥ L liquidity locked forever in pool P", "pump curve completes by D" (research) |
| "active wallets this week" | **No** | Not stored anywhere; Sybil-cheap (signatures cost fees only) | Brot can count *its own* participants, but that is a metric of Brot, not of the token |
| "TVL above X" | **Only as an epoch snapshot** | Live TVL is flash-movable (repo 1.1) | "JitoSOL TVL ≥ X SOL at the start of epoch E" (built upstream); DAMM v2 permanent lock |
| "today's burn above $2,000 in fees" | **Partly** | (a) Token burn: a supply ratchet from a creation baseline works when mint authority is None, but it counts tokens, not dollars. Converting to USD needs a Pyth feed for that token plus a price rule, and most small tokens have none. (b) Fees: DAMM v2 cumulative fee counters from a creation baseline work as a ratchet "≥ X by D", in token units. Both require reading before the deadline, never after, because a later read only grows | "≥ N tokens burned between creation and D"; "≥ F token-B fees in DAMM v2 pool P by D" |
| transaction counts, volume | **No** (volume only through DAMM v2 fees) | Raydium counters are dead; volume is about fee ÷ variable rate | refuse |

- **A "crank that accumulates"** only proves what passes through the program running it. It works for Brot's own
  events, or for a new Token-2022 token that opts into a transfer hook which counts. Even then mint and burn bypass the
  hook, and splitting balances across wallets defeats a holder count. Research only.
- **An oracle job that asks an indexer** ("Helius says 10,412 holders") is exactly an opinion or single-source oracle
  by section 2's definition. It also does nothing against the Sybil cost.
- **Rule:** the creation box refuses any metric that is not (a) one field in one pinned account or syscall, or (b) a
  ratchet from a creation baseline over such a field.

### Gaps
- ZK coprocessors or light clients for Solana account state (for example Bonsol, or ZK-compression state roots) were
  not researched: search budget exhausted. SIMD-0215 alone rules out inclusion proofs against the bank hash.

## 5. Cross-chain facts verifiable from Solana

### Takeaway
Wormhole Queries can bring a guardian-signed `eth_call` result from EVM chains, which a Solana program could check
against the same guardian set Pyth already relies on. The Solana verifier is only a proof of concept. Defer it.

### Cited Findings
- FACT: Queries give "on-demand access to Guardian-attested on-chain data". Responses are final "once enough Guardians
  (2/3 quorum) return matching results". Up to 255 calls can be batched — [Wormhole Queries overview](https://wormhole.com/docs/products/queries/overview/)
- FACT: Supported query methods are `eth_call`, `eth_call_by_timestamp` and `eth_call_with_finality` on 40+ EVM
  mainnets. For Solana as a *queried* chain the table shows only partial support — [Wormhole Queries supported networks](https://wormhole.com/docs/products/queries/reference/supported-networks/)
- SECONDARY FACT (search snippet of the FAQ, page not fetched): "A Rust SDK for Solana is being actively investigated
  ... See the Solana Queries Verification repository as a proof of concept" — [Wormhole Queries FAQs](https://wormhole.com/docs/build/queries/faqs)

### Inferences
- A template like "Will contract C on Base have at least X balance at block B?" would trust 2/3 of Wormhole guardians,
  the same root as Pyth's Full verification, so it adds no new trust *root*. It does add a new verifier to audit, and
  the EVM read can be flash-moved on its own chain like any live balance. Research tier.
- Light-client verification of other chains on Solana: not researched (gap).

### Gaps
- Whether a production Solana Queries verifier exists in 2026: not verified.

## 6. The manipulation-cost model as a rule the creation UI can enforce

### Takeaway
For every template, compute at creation the cheapest way to force each outcome. Cap the opposite side of the pot so
the most an attacker can win stays well below that cost. Refuse the template if the cap leaves no viable market.
Party-controlled templates have a cost of zero and are refused.

### Cited Findings
- FACT (repo): "Forcing YES by paying" (E2): worth it whenever the attacker's share of the NO pot exceeds the cost.
  The fix is a `max_pot` recorded at creation and checked on every bet, set below the day's cost to force, with entries
  closed early if that cost falls — [wave-2 E2](../../../docs/business/_review/wave-2-technical-security.md)
- FACT (repo): Settlement: `fee_total = ceil(P × fee_bps / 10,000)` on the losing side P, and
  `distributable = V + P − fee_total + prize_amount`; `MAX_FEE_BPS = 1,000`. Entries close at 80% of duration (minimum
  24 h); questions run at most 30 days (E4); `resolve` is top-level only — [TECHNICAL-PLAN](../../../docs/technical/TECHNICAL-PLAN.md); [RESOLVERS.md section 4](../../../RESOLVERS.md)
- FACT (repo): Every reader checks owner, exact length and discriminator, and the metric account is pinned at
  creation. Ratchets resolve NO after the deadline without a read; a missing or closed account means "unknown" — [RESOLVERS.md section 4](../../../RESOLVERS.md)

### Inferences
**Bound.** An attacker holding y of the winning side V receives y/V × (V + P − fee + prize). Their profit from forcing
is therefore at most (1 − f) × P + prize, where f = fee_bps / 10,000 and P is the opposite side.

**Rule, one line per side, computed at creation and re-checked by a keeper:**

```
cap_NO  = max(0, (C_force_YES / k − prize) / (1 − f))     // limits the NO side, which a forced YES takes
cap_YES = max(0, (C_force_NO  / k − prize) / (1 − f))
k = 3 (safety margin for estimate error and for the cost falling over the market's life)
refuse the template if min(cap_YES, cap_NO) < MIN_VIABLE_POT (for example 50 USDC)
```

**Cost functions (C_force) per family, all in USDC at creation:**
- Burn: (supply − goal) × Pyth price of the token. No Pyth feed means no USD cost, so refuse, or cap at a fixed small
  amount.
- Permanent lock: value of the missing liquidity at the current pool price (repo formula in 3.5).
- DAMM v2 fees: 0.2 × fee target + round-trip price impact, assuming the attacker owns all LP. Use 0.2 if the pool's LP
  ownership is unknown.
- Stake-pool or validator stake at epoch E: exit fee × gap + one epoch of hedging. This is small, so the cap is
  small unless the gap is very large.
- Pyth touch or at-time: per-feed C from an off-chain depth model kept by the team (allow-list with `max_pot_per_feed`).
  Majors get a high cap; thin feeds a low cap or refusal.
- pump.fun graduation: the measured completion loss for the remaining curve (repo 1.5).
- Party-controlled (authority, upgrade, metadata, Squads, vesting, governance where a party holds a majority): C = 0,
  so refuse.

**Creation-time preconditions (enforced on-chain where the data is on-chain):**
1. The template comes from the closed enum and every account is pinned (owner, length, discriminator, binding to the
   target mint).
2. The goal is not already met, and its distance from the current value is at least a per-template minimum (burn ≥ m%
   of supply; lock ≥ L; pump curve progress ≤ 50% at creation, entries closed if progress passes 80%).
3. Pyth: the feed is on the allow-list, the account is the canonical push PDA for bets, conf/price ≤ 0.5%, the market
   is open now (`schedule`), and the deadline T falls inside a session for at-time questions.
4. A party-controlled flag means refusal, in line with E1.

**While open:**
- Entries close at 80% of duration (minimum 24 h).
- Price templates: every bet needs a fresh price and is refused once `price + conf` reaches the target.
- Ratchet templates: entries stop the moment the goal is met.
- A keeper recomputes C_force; if the cap falls below the pot, entries close early (E2).

**At resolve:**
- Top-level only.
- At-time questions use the uniqueness rule (`prev_publish_time < T <= publish_time`).
- Ratchets: YES needs a read before the deadline; after it, NO without a read.
- Epoch snapshots read only the snapshot field.

## 7. Ranked catalogue

### Takeaway
By 2026-10-12 only Pyth price questions on SOL and BTC (devnet) and Clock-based questions can realistically be shown,
and even these need the Sprint 03 touch logic, since the new program has no instruction yet. The proven native
ratchets and epoch snapshots belong to the audited MVP. Governance, multisig, vesting, pump.fun, Switchboard and
cross-chain are research. Counts and live TVL are refused.

### Cited Findings
- FACT (repo): After Sprint 01, `programs/brot-markets` has no instruction yet; its one reader parses `PriceUpdateV2`
  and nothing calls it until Sprint 03. The MVP plans five readers: `SupplyAtMost`, `DammV2LockedAtLeast`,
  `StakePoolTvlAtLeast`, `StakeAtLeast` and `PriceTouch` — [CLAUDE.md](../../../CLAUDE.md); [TECHNICAL-PLAN 3.4.8](../../../docs/technical/TECHNICAL-PLAN.md)
- FACT (read for these notes): on devnet only SOL and BTC upgraded push accounts were fresh (21 s); 15 others were
  about 143 s old; 47 of the 64 sponsored feeds do not exist there — [devnet RPC](https://api.devnet.solana.com)

### Inferences

**(A) Demo-ready by 2026-10-12 (existing Pyth reader plus the touch or at-time rule, or a sysvar read)**

| # | Template (autocomplete string) | Parameters | On-chain source | Guard and cap |
| --- | --- | --- | --- | --- |
| A1 | "Will SOL touch $300 before Nov 30, 2026?" | asset ∈ {SOL, BTC} on devnet (64 feeds on mainnet), direction above or below, target, deadline | `PriceUpdateV2` owned by `rec2HH...`, feed_id pinned; bets use the canonical push PDA `[0, feed_id]` under `pyt2F4...`; proof: any Full update with `price − conf ≥ target` and `publish_time ≤ deadline` | 30 s fresh price per bet (devnet needs about 70 s, or a keeper posting); bet refused once `price + conf ≥ target`; demo cap |
| A2 | "Will BTC be above $X at 00:00 UTC on Dec 1, 2026?" | asset, comparator, threshold, timestamp T | the same, using the first update with `prev_publish_time < T ≤ publish_time` | entries close well before T; T sits inside crypto's 24/7 session |
| A3 | "Will SOL be between $X and $Y at T?" | asset, X < Y, T | the same as A2 | the same |
| A4 | "Will Solana reach slot 500,000,000 before Nov 1, 2026?" or "Will epoch N start before D?" | slot or epoch target, date | Clock sysvar (`slot`, `epoch`, `unix_timestamp`) | no account; low interest; cannot be manipulated with money |

**(B) MVP after audit**

| # | Template | Parameters | Source | Notes |
| --- | --- | --- | --- | --- |
| B1 | A1 to A3 on all mainnet-sponsored crypto feeds | as A | as A | per-feed cap; thin feeds (MEW, ORE, CLOUD, MET, NAV/RR) low or refused |
| B2 | "Will AAPL close above $250 on Nov 20, 2026?" / "Will SPY touch $X before D?" | ticker from the allow-list (1,051 US equities and ETFs listed), comparator, threshold, session date | Brot-keeper push shard of the equity feed (Hermes key); price at T = 15:59 ET by the uniqueness rule | bets only during sessions; holiday calendar from `schedule`; regular session only |
| B3 | "Will gold (XAU/USD) trade above $X before D?" / "Will EUR/USD be above 1.20 at 17:00 ET Friday?" | metal or FX pair, threshold, date | as B2 | weekend closure; metals have a daily 17:00 to 18:00 break |
| B4 | "Will the US 10-year yield be above 4.5% at 16:00 ET on D?" / "Will EFFR be at or below X% on D?" | rate, threshold, date | `InterestRate.*` feeds via a keeper | cadence of daily-published rates not verified |
| B5 | "Will SOL outperform ETH between D1 and D2?" | two assets, two dates | four uniqueness-rule reads | — |
| B6 | "Will JitoSOL hold at least 15M SOL at the start of epoch 1080?" | stake pool (allow-list), threshold in SOL, epoch | SPL stake pool `last_epoch_total_lamports` | cap from the 0.1% exit fee × gap (capital-gated) |
| B7 | "Will at least X of pool P's liquidity be locked forever by D?" | DAMM v2 pool, goal (liquidity units shown as a %), date | `permanent_lock_liquidity` @552 | cap from the value of the missing liquidity |
| B8 | "Will at least 1B BONK be burned between now and Dec 31?" | mint (classic, mint authority None), amount, date | mint supply @36 from a creation baseline | needs a Pyth feed for the cap; Token-2022 later behind default-deny |
| B9 | "Will pool P earn at least 5,000 USDC in fees by D?" | DAMM v2 pool, fee token, amount, date | `total_lp_*_fee` + `total_protocol_*_fee` from a baseline | cap ≈ 0.2 × target / k |
| B10 | "Will validator V have at least X SOL staked in epoch E?" | vote account, threshold, epoch | `sol_get_epoch_stake` | only after a devnet YES; filter caveat (repo 1.4) |
| B11 | "Will validator V earn at least C vote credits in epoch E?" | vote account, credits, epoch | vote `epoch_credits` walk | the validator controls NO; label it |
| B12 | "Will at least X LP of Raydium pool P be burned by D?" | CPMM or AMM v4 pool, amount, date | `lp_supply − lp_mint.supply` | two accounts |
| B13 | "Will the 1-hour TWAP of SOL on D be above $X?" | asset, window, date | `TwapUpdate` (if `rec2HH` supports it) | stronger against spikes than touch; support not verified |

**(C) Research**

| # | Template | Blocker |
| --- | --- | --- |
| C1 | "Will token T graduate from pump.fun by D?" | closed-source upgradeable program; forcing costs 0.07 SOL at 99%; needs a progress-at-creation guard and a tiny cap |
| C2 | "Will Realms proposal P pass?" | voters can take positions (E1); flash-pass possible with tipping and no lock; per-realm checks |
| C3 | "Will Squads transaction #n of multisig M be executed by D?" | party-controlled; closable after execution |
| C4 | "Will the team cancel vesting escrow E before D?" / "Will the recipient claim ≥ X?" | party-controlled; IDL-only layouts |
| C5 | "Will validator V receive at least X SOL in Jito tips in epoch E?" | layout not verified; donations make it cost-equals-target |
| C6 | Switchboard multi-source values (for example a sum across pools, or an asset not on Pyth) | new trust root (queue, TEE); only fixed functions over many sources |
| C7 | Cross-chain EVM state via Wormhole Queries | Solana verifier is a proof of concept |
| C8 | Opt-in holder or transfer counters through a Token-2022 transfer hook | only for new tokens; mint and burn bypass the hook; Sybil |
| C9 | "Will Solana mainnet have a cluster restart before D?" | LastRestartSlot activation not verified; sensitive topic |
| C10 | Epoch rewards above X | readable only during distribution; low interest |

**Refused by the autocomplete (explain why and suggest the nearest verifiable template):** holder counts, active
wallets, transaction counts, volume, live TVL, lending deposits, perps open interest, LST or mSOL live supply, SOL
total supply or inflation, anything from an LLM, web API, sports or news source, and in the MVP pot every
party-controlled flag (mint or freeze authority revoked, upgrade authority revoked, program upgraded, metadata frozen,
Squads executed, vesting cancel or claim).

### Gaps
- Exact per-feed caps cannot be set without publisher counts and depth data (section 1 gaps).
- The A-tier timeline assumes the Sprint 03 touch logic lands by 2026-10-12, which these notes cannot confirm.
- Devnet availability of the SPL stake pool, DAMM v2 and Raydium programs (needed to demo B6, B7, B9 and B12 on devnet)
  was not checked.
