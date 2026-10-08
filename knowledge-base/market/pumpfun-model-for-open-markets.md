# Borrow pump.fun's zeros, refuse its harms

The pump.fun comparison supports Brot Markets on one axis and cuts against the easy version of the idea on three. What
carries over is the friction cut behind pump.fun's roughly **$1.34B of protocol revenue since March 2024**: creating
costs nothing, needs no code and no liquidity provider, and goes live in seconds. Brot can add the filter pump.fun never
had, a creation box that only accepts questions its own program can settle, and among at least 35 open-creation
attempts found, no live, funded product combines that with a pot and with settlement the program performs itself. What
does not carry over is the incentive engine (a bonding curve pays the earliest buyer most and makes every creator a
promoter, while a pot pays every winning USDC the same), the scale (every Solana-tagged market venue together did
**$53.5M in the last 30 days**, which at Brot's planned take would earn in a year less than pump.fun earned in its
worst month of 2026), and the legal shelter (the **2026-08-31 opinion in *Aguilar v. Baton Corp.*** cleared pump.fun of
gambling *because* buying a token is not a payout on an event, and its footnote 6 left open exactly the contract a pot
is). The defensible difference is therefore narrower than "reads on-chain data", since Pyth-settled price markets
already exist: it is public creation limited to typed readers, including non-price Solana state that no competitor
settles without a backend signer, with a permissionless resolve in which no creator, model, vote or admin key picks the
winner. For Colosseum's Crypto World's Fair (deadline **2026-10-12 23:59 PT**), the credible scope is one template, a
Pyth price-touch market on SOL or BTC, working end to end on devnet behind a grammar autocomplete and a "would resolve
NO if checked now" preview, with the reused `pred-provable` code disclosed and every committer listed. Opening creation
to the public reverses four approved decisions, so it is the founder's call.

*Reading key.* Every claim keeps the label the research notes gave it. **FACT** means it was read at a primary source:
company docs or code, a court filing, a statute, a regulator, or on-chain or API data queried directly. **SECONDARY
FACT** means press, an aggregator, an analyst, a press release or search-result text. **INFERENCE** means arithmetic or
reasoning by the research team, never a sourced claim. "Weak" marks a figure seen only in a snippet or a low-quality
source. Dates are publication dates or the access date 2026-10-07, and repo facts cite the file. In its own voice this
report describes Brot only as markets, with positions, participants, "take a position" and "entries close"; other
companies' own terms ("prediction market", "bet", "wager") appear inside quotes or as their product descriptions.

## The analogy holds for creation and breaks on incentive, scale and law

pump.fun's founding promise is that "Pump lets anyone create coins, giving everyone equal access to buy and sell from
the start" ([FACT · pump.fun FAQ, accessed 2026-10-07](https://pump.fun/docs/faq)), and its mechanics keep that promise.
Creation costs "0 SOL / 0 USDC", graduation to its own venue costs 0.015 SOL ([FACT · pump.fun fees, updated
2026-05-20](https://pump.fun/docs/fees)), and a smart contract is the counterparty to every trade from the first second,
so nobody has to supply liquidity ([FACT · *Aguilar v. Baton Corp.*, Dkt. 184, pp. 51-52,
2026-08-31](https://www.courtlistener.com/docket/69593359/184/aguilar-v-baton-corporation-ltd-dba-pumpfun/)). The move
that transfers most directly came on 2024-08-09, when pump.fun shifted the deployment fee to a coin's first buyer
because "This unlocks the use case of someone creating a coin without buying any of its supply" ([SECONDARY FACT · The
Block, 2024-08-09](https://www.theblock.co/post/310376/pump-fun-cuts-fees-and-unveils-80-incentive)). For Brot that maps
onto letting someone open a market without taking a side (INFERENCE).

| Dimension | pump.fun | Brot, as proposed | Verdict (INFERENCE) |
|---|---|---|---|
| Cost and effort to create | Free, no code, no LP, live in seconds | Free or a refundable deposit; no code; no LP | Holds |
| Counterparty from the first second | The curve contract trades with everyone | A pot needs both sides; a one-sided pot is refunded (R-10) | Holds only in part |
| Reward for entering early | Curve price rises with each buy | None: every winning USDC is paid the same | Breaks |
| Reason for the creator to promote | 0.30% creator fee on curve trades | Must be designed (a share of the house fee) | Must be built |
| Filter on what can be created | None; moderation after the fact | Closed set of templates the program can read | Brot is stronger |
| Revenue base | $463.5M trailing year | Solana-tagged market venues: $53.5M of volume in 30 days | Breaks |
| Legal footing | Gambling claims failed because a token is not a payout on an event | A pot is money put up "to abide a contingent event" | Breaks |
| Distribution | Terminals, bots, KOLs on X | Share cards, blinks, terminal-friendly IDL and events | Holds if built |

The first break is incentive. The bonding curve solved two cold-start problems at once: there is always a price, because
the contract trades, and the first buyer pays least, which rewards early entry and promotion (INFERENCE). A pot solves
the first only weakly, since a market opens without a liquidity provider but a YES participant has nothing to win until
someone takes NO, and it does not solve the second at all. Builders of pot designs concede both points. Pumpcade argues
that "Parimutuel pools always work", yet adds time-weighted shares for an "early bird advantage" and says production will
need "1 participant on each side for a market to execute" ([FACT · Pumpcade docs, accessed
2026-10-07](https://docs.cade.market/mechanics/parimutuel-markets)). Most publicly created markets should be expected to
stay empty or one-sided: fewer than 1% of pump.fun coins graduate, **0.26%** on a 7-day average in June 2026
([SECONDARY FACT · The Block,
2026-06-16](https://www.theblock.co/post/404806/pump-fun-activity-craters-80-three-months-solana-fees-lower-traders-rotate-perps))
and 4,338 of 655,770 coins (0.63%) in September 2025 ([SECONDARY FACT · arXiv 2602.14860,
2026-02-16](https://arxiv.org/html/2602.14860v1)). The empty pot is also harsher than the dead coin. A pump.fun buyer in
a dead coin can still sell back to the curve, but a Brot participant in a one-sided pot gets a refund, so the
experience is "nothing happened", and under R-10 every participant after the first even pays 1% for it (FACT, repo:
`docs/product/PRODUCT-BRIEF.md` R-10).

The second break is scale. pump.fun's trailing-year revenue to 2026-10-06 was **$463.5M** (INFERENCE on the DefiLlama
series in the next section). Brot's natural category is far smaller: every Solana-tagged venue together did **$53.5M**
of volume in the 30 days to 2026-10-07 (INFERENCE on [FACT · DefiLlama API](https://api.llama.fi/overview/dexs)), and the
largest Solana-only venue, World, did $15.4M in September 2026 ([FACT · DefiLlama,
World](https://api.llama.fi/summary/dexs/world)). At the Business Plan's average take of 3.70% of volume, capturing that
entire $53.5M every month would earn about $23.8M a year (INFERENCE), less than pump.fun's $26.5M in June 2026, its
weakest month of the year. The analogy is a product analogy, not a revenue forecast.

The third break is legal, and it is the hardest: the reasoning that cleared pump.fun of gambling is the reasoning that
exposes a pot, as the legal section below shows. The honest version of the idea, then, is to copy the zero-friction
creation that made pump.fun, add the verification filter it never had, rebuild the promotion incentive deliberately
through creator pay, and settle the legal route before real money (INFERENCE). The public phrasing should follow the
repo's vocabulary rule, "the pump.fun of on-chain markets", rather than the working phrase "pump.fun of prediction
markets", which at least four other projects have already used.

## pump.fun earned $1.34B by taxing new-token trades through two crashes

### Revenue is a transaction tax that swings fivefold

DefiLlama measures on-chain flows, not company accounts. By its count, pump.fun's protocol revenue was **$321.2M in
2024** (from March), **$652.5M in 2025** and **$366.6M in 2026 to 6 October**, about **$1,340M** in all once the
overlapping mobile-app line is removed (INFERENCE, sums of [FACT · DefiLlama API, queried
2026-10-07](https://api.llama.fi/summary/fees/pump?dataType=dailyRevenue); [DefiLlama protocol
page](https://defillama.com/protocol/pump)). The peak was January 2025, **$149.8M in the month and $4.83M a day**, with
a record day of $15.46M on 2025-01-24 (FACT, DefiLlama daily values). Six months later revenue had fallen 87%, to $0.65M
a day in July 2025. It sat near $1.0-1.5M a day through the first half of 2026, bottomed at **$0.88M a day in June
2026**, and recovered to **$2.52M a day in the first six days of October**, the fastest pace since February 2025
(monthly sums INFERENCE). The company's own figure is "Annualized revenue $565.19M (≈ $1.55M / day · 90d avg)" as of 6
October, net of referral fees and cash backs, and it warns that since Custom Pairs "the fee dashboard does not correctly
reflect the revenue and buyback amount" ([FACT · pump.fun PUMP page, read 2026-10-07](https://pump.fun/pump-token)).
Sources disagree on 2025: CoinDesk's "2025 gross protocol revenue: $971.37 million" matches DefiLlama's 2025 *gross
fees* ($987.9M, which include creator and LP shares), not its 2025 revenue ([SECONDARY FACT · CoinDesk,
2026-04-29](https://www.coindesk.com/markets/2026/04/29/pump-fun-burns-36-of-pump-supply-in-usd370-million-wipe-locks-50-revenue-into-ongoing-buybacks)).

Two-thirds of the money is still a tax on brand-new tokens. In 2026, **67.6%** of revenue came from the bonding curve,
26.5% from PumpSwap and 5.9% from the Terminal, and no line outside trading fees appears in any dataset (INFERENCE on
DefiLlama). The cycle is the business: the bottom runs at about a fifth of the top (INFERENCE). The company calls
itself "the fastest-growing company in history" ([FACT, a self-description · pump.fun](https://pump.fun/pump-token)); on
DefiLlama, cumulative revenue crossed $100M on 2024-09-02 and $1B on 2026-01-19 (INFERENCE). It also said its 7-day
revenue "flipped" Hyperliquid's in late July 2026, and on 6 October DefiLlama did show pump ahead on 7 days ($18.6M
against $14.1M), though still behind on 30 days ($60.7M against $72.5M) ([FACT · DefiLlama,
Hyperliquid](https://api.llama.fi/summary/fees/hyperliquid?dataType=dailyRevenue)).

### Fees moved toward creators, then away from rewarding launches

Until 2025-05-13 the curve fee was a flat 1% to pump.fun. A 0.05% creator slice was then carved out of that 1%, and
Project Ascend, with dynamic fees from 1 September 2025 (DefiLlama dates the 0.30% creator slice from 15 September),
raised the total to **1.25%: 0.95% protocol and 0.30% creator** ([FACT · DefiLlama fee adapter, which encodes the fee
eras](https://github.com/DefiLlama/dimension-adapters/blob/master/fees/pumpdotfun.ts); [FACT · pump-public-docs fee
README, 2025-08-29](https://github.com/pump-fun/pump-public-docs/blob/main/docs/FEE_PROGRAM_README.md)). Creators
received about $2M in Ascend's first 24 hours, against $198k the day before ([SECONDARY FACT · Decrypt,
2025-09-03](https://decrypt.co/337872/pump-funs-new-fee-model-hands-out-2m-to-creators-in-first-24-hours)). The
migration fee fell from 6 SOL to 1.5 SOL and then to 0.015 SOL, on dates the sources do not agree on.

Then the company turned against what creator pay had rewarded. Co-founder Alon Cohen said the design "failed to produce
durable trading incentives" and that "issuance outpaced sustained secondary liquidity" ([SECONDARY FACT · Yahoo Finance,
2026-01-10](https://finance.yahoo.com/news/pump-fun-admits-creator-fees-160120983.html)), and that "Creator fees may have
skewed incentives toward low-risk coin creation instead of high-risk trading, which is dangerous, because traders are
the lifeblood of the platform" ([SECONDARY FACT · Cointelegraph,
2026-03-25](https://cointelegraph.com/news/pump-fun-creator-fee-cap-update-memecoin-model)). The 2026 changes followed in
quick succession. In January creators gained the right to share fees across up to ten wallets. February brought
Cashback Coins, which send the creator slice to traders and were deprecated in September. In March each token was
limited to a single fee redirect, to stop "griefing", and May added USDC-quoted curves. Custom Pairs, coins quoted
against tokenized stocks, arrived on 9 September, and Holder Rewards in September can be switched on for an existing
coin but never off ([FACT · Holder Rewards
README](https://github.com/pump-fun/pump-public-docs/blob/main/docs/HOLDER_REWARDS_README.md)). Several of these landed
within weeks of a rival's surge (INFERENCE): creator fees as Believe and LetsBonk launched, Ascend after the July 2025
LetsBonk episode, Custom Pairs five weeks after StonkFun. The lesson for Brot (INFERENCE) is to pay creators for markets
that attract money on both sides, never for the act of creating; pump.fun spent eighteen months learning that pay per
launch rewards issuance over flow.

### Every creator was a marketer, and terminals carried the feed

Growth was a loop (INFERENCE). Free launches produced tens of thousands of coins a day, with **266,000** launches in the
week of 17-23 August 2026 and **310,696** the week after ([FACT · company newsletter](https://pump.fun/pump-token)).
Every creator and early buyer had a direct financial reason to promote, because promoting after buying raises the curve
price. Trading terminals and bots turned the flood into one tradable feed, and KOLs on X turned single coins into
events. Terminal share moved fast: Axiom went from 4.41% to 57.33% of Solana bot and terminal volume between February
and July 2025 ([SECONDARY FACT · Stepdata,
2025-08-08](https://stepdata.substack.com/p/solana-trading-bot-axiom-becomes)), and pump.fun bought three trading-tool
companies, Kolscan, Padre (now its Terminal) and Vyper, all on undisclosed terms ([FACT · Blockworks token-transparency
filing, 2026-09-21](https://blockworks.com/token-transparency/filing/pump)). Part of the "organic" promotion is alleged,
not proven, to have been coordinated: the complaint says pump.fun "recruited KOLs to publicize selected tokens and, in
some instances, gave them compensation or insider information that was not disclosed" (FACT that this is alleged,
[Dkt. 184, pp. 7-8](https://www.courtlistener.com/docket/69593359/184/aguilar-v-baton-corporation-ltd-dba-pumpfun/)).
Scale claims need care, too. "Roughly 80 million unique wallets" counts wallets, not people, and comes from Crypto
Briefing on 2026-08-30, not from The Block as the repo says ([SECONDARY FACT · Crypto
Briefing](https://cryptobriefing.com/pumpfun-app-50m-daily-volume/)).

For a pot, the promotion half of this loop is missing unless Brot builds it (INFERENCE): a creator gains nothing from
bringing in participants unless Brot pays the creator a share of the fee. The distribution half does transfer. Brot's
markets should be easy for terminals and bots to index, with a clean IDL, events and deterministic accounts, because
that is where Solana's active traders already are.

### PUMP raised $1.32B and gives its holders no claim on revenue

On 2025-07-12 PUMP sold 33% of its fixed 1T supply at $0.004: **$600M public, sold out in 12 minutes, plus $720M
private, for $1.32B at a $4B FDV** ([FACT · Blockworks filing](https://blockworks.com/token-transparency/filing/pump)).
The Defiant and The Block reported "$500 million" for the public tranche, a conflict the filing settles. The token
"confers no governance rights, no equity, no debt claim, no dividend, and no redemption right over platform revenue or
assets" (FACT, same filing). Its price peaked at $0.00882 on 2025-09-14, fell to $0.00115 on 2026-06-25, 71% below the
ICO, and stood at **$0.00621 on 2026-10-07, 55% above it**, for a $2.88B market cap and a $5.16B FDV ([FACT ·
CoinGecko, 2026-10-07](https://www.coingecko.com/en/coins/pump-fun)).

Buybacks took 100% of revenue from 2025-07-14 to 2026-04-27, and since 2026-04-28 they take half, under an on-chain
`buyback_basis_points` of 5,000 for a term ending April 2027 (FACT, Blockworks filing). The company reports **$477.28M
bought back and 170.32B PUMP burned**, 17.03% of supply, as of 6 October ([FACT · pump.fun](https://pump.fun/pump-token));
DefiLlama counts $379.4M, probably because before April 2026 it tracks only buybacks funded by the curve (INFERENCE).
Nine months of 100% buybacks did not hold the price, which fell about 80% from its peak, and when the company burned 36%
of circulating supply on 2026-04-29 a co-founder cited "a lack of trust" ([SECONDARY FACT · CoinDesk,
2026-04-29](https://www.coindesk.com/markets/2026/04/29/pump-fun-burns-36-of-pump-supply-in-usd370-million-wipe-locks-50-revenue-into-ongoing-buybacks)).
The rally from August to October 2026 lines up with revenue, up 69% in August over July, more than with the buyback
rate (INFERENCE). For Brot, a platform token answers no current question (INFERENCE). Colosseum's rules are silent on
tokens, but a token scores on no judging criterion and raises the cost of the rules' "law in your country" clause under
Brazil's MP 1.394.

### The market has priced pump.fun at 1x to 11x revenue in fifteen months

The only equity price found is a pre-TGE secondary sale: "$15 million stake at $1.5 billion valuation (SecondLane)"
(FACT, Blockworks filing). Against DefiLlama revenue, with prices and market caps from CoinGecko, the multiples moved as
follows (INFERENCE):

| Date | Price | Market cap | FDV | Trailing 365-day revenue | Market cap / revenue | FDV / revenue |
|---|---|---|---|---|---|---|
| 2025-07-12 (ICO) | $0.004 | n/a | $4.0B | $697.7M | n/a | 5.7x |
| 2025-12-31 | $0.001842 | $1.087B | ~$1.84B | $652.5M | 1.7x | 2.8x |
| 2026-06-25 (low) | $0.001282 | $0.443B | ~$1.07B | $440.9M | 1.0x | 2.4x |
| 2026-10-07 | $0.00621 | $2.883B | $5.155B | $463.5M | 6.2x | 11.1x |

Peers trade far higher on the same basis: Hyperliquid at about 27.8x trailing revenue by market cap, Jupiter at 12.5x
and Raydium at 26.9x, against PUMP's 6.3x (INFERENCE on the [CoinGecko markets
API](https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=hyperliquid,jupiter-exchange-solana,raydium,pump-fun)
and DefiLlama; each protocol defines revenue differently, so these are rough). A Blockworks analyst put PUMP at "2.8x
price-to-sales" on "~$677 million" of annual revenue, noting a $2B treasury "controlled by Baton Corp, not PUMP holders"
and the April 2027 buyback expiry ([SECONDARY FACT · KuCoin summary, Sept
2026](https://www.kucoin.com/news/flash/blockworks-analyst-pump-may-be-undervalued-short-term-long-term-uncertainty-remains));
the price quoted in that summary does not match CoinGecko and should not be used. Arkham labels $2.838B of on-chain
assets to pump.fun, of which $2.19B is its own PUMP, so the non-PUMP assets come to about $0.6B ([SECONDARY FACT ·
Crypto Briefing, 2026-10-06](https://cryptobriefing.com/pump-fun-on-chain-treasury-pump-token/)), and the sources read
do not reconcile that with the $1.32B raised. The operator, Baton Corporation Ltd (England and Wales, company
14743013), is owned by its three founders and was listed with "accounts overdue (next due 30 June 2026)" (FACT,
Blockworks filing). The lesson for a startup pitch (INFERENCE) is that even the category leader's valuation follows
activity almost one for one, discounted for a token with no claim on revenue, a treasury held privately and a buyback
that runs for one year.

### Launch share swung in days, while owning the stack lasted

pump.fun lost and regained the lead twice. In July 2025 LetsBonk passed it in 24-hour revenue and, by 2025-07-25, held
about 84% of daily Solana launches against pump.fun's 12% ([SECONDARY FACT ·
Tokenomist](https://tokenomist.ai/research/will-pump-fun-reclaim-the-throne); [Crypto
Briefing](https://cryptobriefing.com/pump-token-incentives-trading-rewards/)). Within about two weeks of August pump.fun
was back near 90%, because, as one analyst put it, "The top 10 deployers on BonkFun (mostly bots), just started
deploying en masse to Pump.fun again" ([SECONDARY FACT · The Block via TradingView, Aug
2025](https://ru.tradingview.com/news/the_block%3Ae1b5c5f60094b%3A0-solana-memecoin-launchpad-war-flips-again-as-pump-takes-top-spot-amid-letsbonk-collapse/)).
In September 2026 StonkFun, a launchpad that pairs coins with stocks, cut pump.fun's share of Solana launchpad revenue
to about 46% (INFERENCE on [DefiLlama](https://defillama.com/protocol/stonkfun)). Through all of this, pump.fun plus
PumpSwap rose to 21-35% of all Solana DEX volume in 2026, above any month of 2024 or 2025 ([SECONDARY FACT · DefiLlama
Solana DEX API, researcher's computation](https://api.llama.fi/overview/dexs/solana)). Launch share is not a moat; what
lasted was owning the venue, the terminal, the app and the brand, plus a war chest (INFERENCE). For Brot, a creation form
can be copied in weeks, while a library of readers checked against real mainnet bytes, a record of correct resolutions
and the liquidity of the best markets cannot (INFERENCE).

### pump.fun is circling event markets through investees, not products

As of 2026-10-07 no event-market product of pump.fun's own was found. Its newsletters list the launchpad, PumpSwap, the
app, Terminal, GO bounties, Callouts, Custom Pairs, Holder Rewards and cross-chain features, and the CEO wrote that new
products are "being worked on by Baton Corporation ... in secret" ([FACT · pump.fun](https://pump.fun/pump-token)).
Instead pump.fun has invested next door. It led a $1M pre-seed in **Pumpcade** on 2026-04-02, for markets inside
livestream chats that resolve "in 60 seconds to 30 minutes" ([SECONDARY FACT · The Block,
2026-04-02](https://www.theblock.co/news/deals/2026-04-02-pump-fun-pre-seed-funding-round-livestream-prediction-markets-pumpcade-396213));
Pumpcade later raised a $5M seed led by Jump Crypto and Foundation Capital ([SECONDARY FACT · Phemex,
2026-04-17](https://phemex.com/news/article/pumpcade-secures-5m-seed-funding-led-by-jump-crypto-73862)), reportedly at a
$44M valuation ([SECONDARY FACT, weak · Bitget, 2026-04-15](https://www.bitget.com/news/detail/12560605367582)), and has
no confirmed mainnet. **PumpMarket**, an entrant in pump.fun's $3M Build in Public hackathon, ran pot-style "Graduation
Markets" in SOL on whether a new coin graduates within an hour; its first 48 hours produced 63 resolved markets, 66 SOL
of volume and 150+ positions ([SECONDARY FACT · press release, GlobeNewswire,
2026-02-26](https://www.globenewswire.com/news-release/2026/02/26/3245639/0/en/pumpmarket-brings-prediction-markets-to-pump-fun-public-hackathon.html)).
It settled through Bitquery, Helius and Birdeye, and its frontend returned HTTP 402 `DEPLOYMENT_DISABLED` on 2026-10-07
(FACT, direct fetch). pump.fun is therefore a likely future competitor or acquirer, not just an analogy (INFERENCE): it
already owns a USDC pair, the venue and the terminal, and it buys or copies what its ecosystem proves.

## Every feature that paid for attention failed within days, and the court followed the fairness claims

### Most coins die, and attention-paying features drew self-harm stunts

Solidus Labs studied more than 7 million pump.fun tokens with at least five trades, from January 2024 to March 2025, and
found that only about 97,000 still held $1,000 of liquidity, so **98.6% had collapsed** ([FACT, read via fetch summary ·
Solidus Labs, May 2025](https://www.soliduslabs.com/reports/solana-rug-pulls-pump-dumps-crypto-compliance)). The press
turned that into "98.6% are rug pulls", but the test measures collapse of liquidity, not fraud, and it is often confused
with the share of coins that never graduate. An academic sample found at least one dump event in 92.22% of 184,282
tokens ([SECONDARY FACT · arXiv 2602.14860](https://arxiv.org/html/2602.14860v1)), and most tokens are bought
"immediately after launch, often in the same block" ([SECONDARY FACT · Lightspeed via Solana Compass,
2025-05-17](https://solanacompass.com/learn/Lightspeed/what-weve-learned-from-pumpfuns-sniping-problem)).

The features that paid for attention went wrong fastest. Livestreams were paused on 2024-11-25 after streamers used
threats of suicide and violence to pump tokens ([SECONDARY FACT ·
Decrypt](https://decrypt.co/293495/pump-fun-drops-livestreaming-controversy)), and returned on 2025-04-04 for 5% of users
with pump.fun admitting that "some content — perhaps much content — generally defined as NSFW will in fact appear"
([SECONDARY FACT · The Block,
2025-04-04](https://www.theblock.co/post/349647/memecoin-launchpad-pump-fun-reopens-livestreaming-to-5-of-users-with-stricter-moderation-rules)).
GO bounties, launched 2026-06-04, drew a 10,000 SOL bounty linked to suicide within hours, and New York Governor Kathy
Hochul called the product a "dystopian nightmare" ([SECONDARY FACT · The
Defiant](https://thedefiant.io/news/nfts-and-web3/pump-fun-launches-go-bounty-platform-backlash-extreme-listings)). The
worst single loss came from inside: on 2024-05-16 a former employee used withdraw authority he had obtained
illegitimately, plus flash loans, to take about 12,300 SOL (~$1.9M) of the $45M held in the curves ([SECONDARY FACT · The
Block post-mortem](https://www.theblock.co/post/295029/pump-fun-post-mortem)), and was sentenced to six years on
2025-12-18 ([SECONDARY FACT ·
Decrypt](https://decrypt.co/352876/former-pump-fun-dev-sentenced-six-years-prison-2-million-solana-fraud)). pump.fun's
pattern was to pause the feature, write a policy and relaunch small; no protocol-level defence against sniping was
found.

For Brot (INFERENCE), the rule that markets resolve only from on-chain accounts is a structural shield against the
attention class of harm, because "will streamer X do Y" cannot be created. Three risks do carry over. The first is
creator influence over the outcome: a creator who controls the account a market reads can pick a side and make it
happen. The second is the last-second entry made with information others lack, which the `require_trading_open` guard
in Brot's lineage already addresses. The third is any admin key over user funds.

### The 2026-08-31 opinion: gambling failed for pump.fun because a token is not a payout

In *Aguilar v. Baton Corporation Ltd. d/b/a Pump.Fun*, No. 1:25-cv-00880-CM (S.D.N.Y.), Judge Colleen McMahon's 79-page
Opinion and Order of 2026-08-31 (Dkt. 184), read in full from CourtListener, dismissed every claim against Solana Labs,
the Solana Foundation and their executives, dismissed the Securities Act counts and unjust enrichment, and held that
"Plaintiffs' asserted gambling predicates fail as against all moving Defendants" ([FACT · Dkt.
184](https://www.courtlistener.com/docket/69593359/184/aguilar-v-baton-corporation-ltd-dba-pumpfun/)). RICO counts
survive against Baton and its three founders personally, on two predicates. The first is wire fraud built on marketing:
Cohen's posts calling pump.fun an "unruggable fair launch platform" (2024-09-25) and "as much of an even playing field
as it gets IMO" (2024-10-04) "communicated something factual ... that there were no favored participants who might have
some undisclosed advance access" (pp. 39-40). The second is **unlicensed money transmission** under 18 U.S.C. §1960,
because the contracts "allegedly accepted one form of value and transmitted another as part of an exchange operated for
a fee" (pp. 50-53), whereas Solana Labs and the Foundation fell within FinCEN's exclusion for infrastructure, a software
developer being "not a money transmitter for the mere act of creating the application". Several outlets reported the
gambling predicates as upheld; the opinion says the opposite, and the primary source wins ([SECONDARY FACT, incorrect on
this point · Protos, 2026-09-01](https://protos.com/solana-labs-dropped-from-burwick-laws-pump-fun-lawsuit/)).

The reasoning on gambling is what matters for Brot (all FACT, same source). Under New York Penal Law §225.00(2),
gambling is staking value "upon the outcome of a contest of chance or a future contingent event not under his control
or influence". A pump.fun buyer escaped that definition because he "received the token immediately", and the amount
"was not a prize or a payout that became due because some specified contingent event occurred" (pp. 45-47). The court
quoted *Liss v. Manuel* (1968): "If a sum of money is put up merely to abide a contingent event, at which time the event
will determine to whom the money shall go, the transaction is clearly a wager" (p. 46). Footnote 6 then reserves Brot's
case in so many words: "The Court does not address a contract under which the parties' rights to payment are themselves
determined by the occurrence or nonoccurrence of an identified future event. Whether such a contract constitutes
gambling under § 225.00(2) presents an entirely different question, one that is not presently before the Court" (p. 47
n.6). Bookmaking, "unlawfully accepting bets from members of the public as a business . . . upon the outcomes of future
contingent events", failed only because buying a token is not one (p. 49).

### Five lessons transfer directly to Brot

All five are INFERENCE. First, the shelter does not cover a pot: participants put USDC into a pot "merely to abide a
contingent event", a house fee taken from the losing side resembles accepting stakes from the public as a business, and
the plaintiffs' bar has already tried the RICO gambling route against a Solana launchpad. Second, money transmission
carries over: a program that accepts USDC and pays winners for a fee resembles what the court found plausible, and the
infrastructure exclusion protects developers of networks, not operators who run and profit from the flow. Third,
marketing words become fraud predicates. "Unruggable", "fair launch" and "even playing field" were read as statements of
fact, so Brot's copy must say "resolved by reading account X at slot Y", never "trustless" or "can't be manipulated",
and every claim must stay literally true. Fourth, insider access is the core of the alleged fraud, so every market
should be published to everyone at the same moment, with no early private access for the team, partners or KOLs.
Fifth, terms of service did not prevent the suit. pump.fun's terms choose British Virgin Islands law, require binding
arbitration and state that "Class arbitrations, class actions, and representative actions are strictly prohibited"
([FACT · pump.fun Terms, updated 2026-09-25](https://pump.fun/docs/terms-and-conditions)), yet the founders are named
defendants in a 79-page ruling on the pleadings; whether Baton moved to compel arbitration was not found.

## The sector pays about $22B a month, and Solana-native markets are 0.3% of it

### Volume grew about ninefold in a year, and most of it is sports

Two volume measures circulate and must not be mixed: face value, which counts each contract at $1, and dollars actually
paid. For the 30 days from 7 September to 6 October 2026, DefiRate reports **$85.7B face value and $22.6B paid**, with
Kalshi at 78% of face value ([SECONDARY FACT · DefiRate, page updated
2026-10-07](https://defirate.com/prediction-markets/volume/)). On a dollars-paid basis, Kalshi plus both Polymarket
venues grew from $2.06B in September 2025 to $18.13B in September 2026, **about 8.8x** (INFERENCE on [FACT · DefiLlama,
Kalshi](https://api.llama.fi/summary/dexs/kalshi), [Polymarket
Intl](https://api.llama.fi/summary/dexs/polymarket-international) and [Polymarket
US](https://api.llama.fi/summary/dexs/polymarket-us)). Sports dominate: of Kalshi and Polymarket's $53.0B of notional
volume in July 2026, about 79.3% was sports and 13.7% crypto (INFERENCE on [SECONDARY FACT · Pew Research,
2026-09-23](https://www.pewresearch.org/short-reads/2026/09/23/prediction-markets-trading-volume-doubled-between-may-and-july-largely-driven-by-sports/)).
DefiRate's category split (27% crypto by dollars paid) does not reconcile internally, since 68% of $22.6B is $15.4B and
not the $12.4B it prints, so it should not be quoted until the table is checked by hand. The pitch's "$21.7B in 30 days"
is correct as dollars paid for 4 September to 3 October; the latest window reads $22.6B.

### Kalshi and Polymarket curate every market, and are valued at $21B to $40B

Kalshi did about $13.5B in dollars paid in September 2026 ([FACT · DefiLlama](https://api.llama.fi/summary/dexs/kalshi)),
reported "$4 billion in annualized revenue" as of July with "over 80% of its volume" in sports ([SECONDARY FACT · CoinDesk
citing The Information,
2026-08-13](https://www.coindesk.com/business/2026/08/13/kalshi-in-talks-with-sequoia-wellington-for-usd750-million-fund-raise-at-usd40-billion-valuation)),
closed a $1B Series F at $22B led by Coatue in May 2026 ([SECONDARY FACT · Sacra](https://sacra.com/c/kalshi/)) and has
been in talks at $40B since June ([SECONDARY FACT · The Block citing the FT,
2026-06-24](https://www.theblock.co/post/406061/kalshi-40-billion-valuation)); no close was found. Polymarket went from
$0 of revenue in 2025 ([SECONDARY FACT · Sacra](https://sacra.com/c/polymarket/)) to about $103.5M of fees in the latest
30 days, roughly $1.26B annualized (INFERENCE on [FACT · DefiLlama fees API](https://api.llama.fi/overview/fees)), and
raised about $1B led by 1789 Capital at **$21B post-money** on 2026-08-31 ([SECONDARY FACT ·
Bloomberg](https://www.bloomberg.com/news/articles/2026-08-31/polymarket-funding-round-led-by-1789-values-firm-at-21-billion)).
Their take rates, about 2.7% for Kalshi and 2.1% for Polymarket of dollars paid (INFERENCE), sit below the Business
Plan's 3.70% average for Brot, which a judge comparing fees will notice.

Both curate every market. Polymarket's "Markets are created by the markets team with input from users and the
community", and users "cannot directly create their own markets" ([SECONDARY FACT · Polymarket docs via search snippet;
direct fetch failed DNS](https://docs.polymarket.com/polymarket-learn/markets/how-are-markets-created)). Kalshi's team
checks every suggestion for CFTC compliance and to make sure "they are not easy to manipulate" ([SECONDARY FACT · Kalshi
Help Center via snippet](https://help.kalshi.com/markets/markets-101/suggesting-a-new-market)), because a designated
contract market answers for every contract it lists ([SECONDARY FACT · It's Not
Gambling](https://itsnotgambling.substack.com/p/the-right-to-ask-a-question)). Polymarket's UMA oracle produced two
documented disputed resolutions in 2025, the $7M Ukraine minerals market and the $58M market on whether Zelenskyy would
wear a suit, both opinion questions settled by token votes concentrated in a few wallets ([SECONDARY FACT · The
Defiant](https://thedefiant.io/news/nfts-and-web3/polymarket-controversy-heats-up-after-the-zelenskyy-suit-market-resolves)).
UMA then limited who may *propose* outcomes to 37 whitelisted addresses but kept the token-weighted dispute vote
([SECONDARY FACT · The Block](https://www.theblock.co/post/366507/polymarket-uma-oracle-update)). That supports Brot's
claim that typed account reads remove a known failure mode; it does not remove manipulation of the underlying metric
(INFERENCE).

### Revenue multiples compress as fees ramp

| Round | Valuation | Annualized volume (dollars paid) | Valuation / volume | Annualized revenue | Valuation / revenue |
|---|---|---|---|---|---|
| Kalshi, Oct 2025 | $5B | $23.9B | 0.21x | $0.6-0.7B | 7-8x |
| Kalshi, Dec 2025 | $11B | $32.2B | 0.34x | $0.735B | 15x |
| Kalshi, May 2026 | $22B | $73.8B | 0.30x | $1.5B (Apr) to $4B (Jul) | 14.7x to 5.5x |
| Kalshi, talks Aug 2026 | $40B | $162B | 0.25x | $4B | 10x |
| Polymarket, Apr 2026 | ~$15B | $55.2B | 0.27x | ~$0.34B | ~44x |
| Polymarket, Aug 2026 | $21B | $55.3B | 0.38x | $1.0B to $1.26B | 21x to 17x |

Every row is INFERENCE, using DefiLlama dollars-paid volume × 12 and the revenue run-rate cited nearest each round
(Sacra, PYMNTS, Bloomberg, CoinDesk, The Block). The leaders are priced at about **0.25-0.5x annualized dollars-paid
volume** and **5-20x annualized revenue**. On face value, Kalshi at $40B is only about 0.05x, so every multiple must say
which volume it uses.

### Solana-native markets are 0.3% of the sector, and the $28.6M figure is nine months old

Solana-tagged adapters total $53.5M over 30 days, **0.29%** of DefiLlama's $18.67B sector total (INFERENCE). World did
$15.44M in September 2026, on Solana only and inside Phantom; TurboFlow did $33.81M, but its total mixes Solana and BSC;
Jupiter Prediction did $5.28M; and DFlow has shown zero since August, whether because the adapter broke or because the
flow now routes elsewhere (FACT · DefiLlama: [World](https://api.llama.fi/summary/dexs/world),
[TurboFlow](https://api.llama.fi/summary/dexs/turboflow-prediction-markets), [Jupiter
Prediction](https://api.llama.fi/summary/dexs/jupiter-prediction), [DFlow](https://api.llama.fi/summary/dexs/dflow)).
The pitch's "$28.6M in three weeks" was Jupiter plus DFlow from mid-December 2025 to about 5 January 2026, with "98% of
DFlow volume" coming from Phantom ([SECONDARY FACT · Step
Data](https://stepdata.substack.com/p/prediction-markets-on-solana-286m)). It measures Kalshi contracts wrapped as Solana
tokens, whose price discovery and resolution stay at Kalshi (INFERENCE). CoinShares put Solana market protocols at
"roughly $1.4M per month in protocol revenue" in Q2 2026 ([SECONDARY FACT · Solana Compass on CoinShares, July
2026](https://solanacompass.com/news/prediction-market-monthly-volume-surged-to-437b-by-june-as-solana-earns-14mmonth)).
No Solana venue resolves from on-chain account reads, and none lets anyone create a market (INFERENCE).

### For an entrant at Brot's stage, the comparables are round sizes, not multiples

Crypto-native entrants raise rounds of $3-20M at undisclosed valuations. Melee raised $3.5M led by Variant on
2025-09-24, called a "seed" by one source and a "pre-seed" by another ([SECONDARY FACT ·
Phemex](https://phemex.com/news/article/melee-secures-35-million-to-launch-viral-prediction-market-platform-21008)); TBD
raised a $3M seed ([SECONDARY FACT · The Block,
2026-02-25](https://www.theblock.co/post/391253/solana-based-tbd-a-prediction-market-protocol-for-verified-human-opinion-raises-3-million));
XO Market a $6M seed ([SECONDARY FACT · CoinDesk,
2026-04-30](https://www.coindesk.com/business/2026/04/30/xo-market-bets-on-user-generated-prediction-markets-to-rival-polymarket-and-kalshi));
and Limitless a $10M seed on 2025-10-31, $17M in all ([SECONDARY FACT ·
Diia](https://dia.dp.gov.ua/en/ukrainian-created-platform-limitless-raises-10m/)). For Opinion, The Defiant reports a
"$20 million pre-Series A" in February 2026 ([SECONDARY FACT · The
Defiant](https://thedefiant.io/news/defi/top-bnb-chain-prediction-market-opinion-raises-usd20-million)) while Binance
Research records a $21.55M Series A in December 2025 ([SECONDARY FACT · Binance
Research](https://www.binance.com/research/projects/opinion)), a conflict that stays open. The only disclosed valuation
near Brot's stage is Pumpcade's reported $44M, from a weak source, and Colosseum's accelerator invests "$250,000 ...
through our standard deal—either a SAFE plus token warrant, or the Colosseum STAMP" ([FACT · Colosseum Accelerator
FAQ](https://colosseum.com/accelerator#a-faq-10)). Volume driven by incentives does not hold: Opinion did $12.5B over a
year but $289M in the latest 30 days, and Limitless fell from about $90M a month to $9M (INFERENCE on DefiLlama), so a
valuation built on launch-period volume would mislead.

## At least 35 open-creation attempts, and none at scale with real money on Solana

### Four projects already called themselves the pump.fun of the category

The label is taken. Blockworks Research titled its piece on XO Market "pump.fun of prediction markets" ([SECONDARY FACT ·
2025-07-01](https://blockworks-research.beehiiv.com/p/pump-fun-of-prediction-markets)); Xmarket's own press release says
"Xmarket is Pump.fun for Prediction Markets" ([SECONDARY FACT · Bitcoin.com press release,
2026-03-04](https://news.bitcoin.com/xmarket-launches-beta-on-bnb-chain-mainnet-the-first-prediction-market-that-pays-creators-and-early-believers/));
Melee pitched "PumpFun-style speculation with Polymarket-style prediction markets" at Breakout 2025 ([FACT · Colosseum
Copilot record](https://colosseum.com/projects/explore/melee-markets)); and PNP called itself "Pump.fun meets Polymarket"
(SECONDARY FACT, carried over from the repo's competitor notes). Two Frontier 2026 builds did the same, Dum.fun ("Pump
fun meets Polymarket") and Bubblegum ("we took the engine from Pump.fun and built an attention surfacing machine for
prediction markets") ([FACT · Copilot records](https://colosseum.com/projects/explore/dum.fun)). Colosseum Copilot counts
275 hackathon projects in the category, 130 of them at Frontier, and Melee is the only winner with open creation found
(FACT, Copilot data). "The pump.fun of X" is a crowded label, and no open-creation project has reached pump.fun-like
scale under it (INFERENCE).

### How the serious open-creation venues work

| Project (chain) | Who creates | Creator pay | Who resolves | Status (date, label) |
|---|---|---|---|---|
| Melee (Solana) | Anyone via templates (Phase 2, ~2026-10-02) | "Up to 20%" of fees, or a "1% market fee"; sources conflict | The creator, "in the discretion of the Creator or Company" | Devnet beta with free-play credit; its "$337.7M" Phase 1 volume is devnet play money (FACT bundle; INFERENCE) |
| PNP (Solana) | Anyone; "PNP doesn't review or reject markets" | 30% of a 1% trade fee, plus 60% of a 2% redemption fee | LLM oracle (Perplexity, Grok), APIs, or any settler the creator names | Pivoted to "A coin that trades Polymarket" (FACT, 2026-10-07) |
| PumpMarket (Solana) | Anyone, on any new pump.fun token | Not disclosed | Bitquery, Helius, Birdeye | Frontend offline (FACT, 2026-10-07) |
| Pumpcade (Solana, pump.fun) | Streamers and users | 0.10% of a 1% fee | "Official API calls or deterministic data", or "by the streamer"; sources conflict | No confirmed mainnet; domains parked |
| Tapebound (Solana, hackathon) | Anyone | Not found | The program reads a Pyth `PriceUpdateV2` | Frontier devnet build; did not place |
| XO Market (own rollup) | Anyone; the creator sets the fee | Set by the creator | AI first, then a jury of stakers | $150M volume, 30,000+ users, 600+ user markets (SECONDARY, 2026-04-30) |
| Limitless (Base) | Signed-in users, daily limits, price targets only | "2% of taker fees by default" | Pyth, Chainlink TWAP, or the team | Beta month: 162 creators, 1,611 markets, $2.2M (SECONDARY, 2026-08-26) |
| Xmarket (BNB) | Anyone | "Up to 50%" of fees | Not stated | Private beta (SECONDARY, 2026-03-04) |
| Hyperliquid HIP-4 | Deployers staking 500k HYPE (one article says 1M) | Capped at 50% | The deployer, slashable by validators | Permissionless mainnet status not found |
| Augur v1/v2 (Ethereum) | Anyone, with a validity bond | 0-50% | REP reporting, then forks | Legacy; $2.01M TVL (FACT, 2026-10-07) |
| Polymarket | The team; an employee signalled "permissionless market deployment and creator fees next" (2026-02-17) | n/a | UMA | Not shipped as far as found |

Sources: [Melee ToU](https://melee.markets/docs/melee-terms-of-use.pdf), [ChainCatcher](https://www.chaincatcher.com/en/article/2208752);
[PNP fees](https://docs.pnp.exchange/platform/fees-and-rewards.md), [PNP oracle](https://docs.pnp.exchange/platform/oracle-settlement.md),
[pnp.exchange](https://www.pnp.exchange); [GlobeNewswire](https://www.globenewswire.com/news-release/2026/02/26/3245639/0/en/pumpmarket-brings-prediction-markets-to-pump-fun-public-hackathon.html);
[Pumpcade docs](https://docs.cade.market/mechanics/parimutuel-markets), [XT blog](https://www.xt.com/en/blog/post/pumpcade-pumpcade-how-a-small-team-is-turning-meme-attention-into-live-prediction-markets);
[Tapebound](https://colosseum.com/projects/explore/tapebound); [CoinDesk on XO](https://www.coindesk.com/business/2026/04/30/xo-market-bets-on-user-generated-prediction-markets-to-rival-polymarket-and-kalshi);
[Limitless docs](https://docs.limitless.exchange/user-guide/user-generated-markets.md), [The Black Swans](https://theblackswans.substack.com/p/limitless-the-prediction-market-that);
[Xmarket PR](https://news.bitcoin.com/xmarket-launches-beta-on-bnb-chain-mainnet-the-first-prediction-market-that-pays-creators-and-early-believers/);
[The Block on HIP-4](https://theblock.co/post/408875/hyperliquid-hip-4-permissionless-deployment), [BlockEden](https://blockeden.xyz/blog/2026/05/13/hyperliquid-hip4-prediction-market-deep-dive/);
[Augur v1 glossary](https://raw.githubusercontent.com/AugurProject/v1-docs/master/source/includes/_glossary.md);
[DeFi Rate on Polymarket](https://defirate.com/news/polymarket-launches-public-api-unlocks-permissionless-liquidity/).

Creator pay runs from 2% of taker fees at Limitless to "up to 50%" at Xmarket and HIP-4's cap, and 0-50% in Augur v1,
and none of these offers is documented to have produced liquidity by itself (INFERENCE). Resolution is human or
semi-human almost everywhere: the creator decides at Melee, Manifold, HIP-4 deployers and PNP's custom settlers; the
team decides elsewhere; Opinion, XO and PNP use an AI with a short dispute window; and UMA, Trueo, Reality.eth with
Kleros, and Augur use a bond-and-vote ladder. It is fully automatic only for price markets on Pyth or Chainlink.

### Open creation fails in the same ways, and the controls recur

The failures repeat across a decade. Augur's July 2018 launch brought markets on whether Trump, Bezos, Buffett or Betty
White would die by a date ([SECONDARY FACT · MIT Technology Review,
2018-07-26](https://www.technologyreview.com/2018/07/26/2449/the-latest-blockchain-use-case-anonymously-betting-on-public-figure-death-pools/)).
In 2019 creators set end times that guaranteed an ambiguous outcome, bought the cheap side and collected 0.5 per share
on Invalid, because validity bonds were "often less than the money made off the invalid market" ([SECONDARY FACT · The
Block, 2019-06-05](https://www.theblock.co/post/26075/augur-is-making-a-big-push-to-take-down-bad-actors-on-its-platform)).
A Columbia working paper estimated that about 25% of Polymarket volume over three years was artificial, peaking near 60%
amid token rumours ([SECONDARY FACT · Fortune,
2025-11-07](https://fortune.com/2025/11/07/polymarket-wash-trading-inflated-prediction-markets-columbia-research/)), and
Opinion's average trade was $2,525 against $175 on Kalshi ([SECONDARY FACT · DeFi Rate,
2026-02-23](https://defirate.com/news/opinion-hits-8b-in-monthly-prediction-market-volume-but-the-data-raises-questions/)).
XO's founder is quoted saying unsuccessful markets "die naturally" (SECONDARY FACT, CoinDesk, 2026-04-30).

The controls recur just as consistently: refundable bonds forfeited on Invalid (Augur, and Zeitgeist's 200 or 1,000
ZTG), two-tier creation, curated "verified" lists (Seer, through Kleros), daily creation limits (Limitless), stake and
slashing for deployers (HIP-4), checks at creation that a question can be resolved (PNP's AI gate) and templates instead
of free text (Melee Phase 2, Limitless, HIP-4) ([Zeitgeist rules](https://docs.zeitgeist.pm/docs/learn/market-rules);
[Seer](https://seer-3.gitbook.io/seer-documentation/getting-started/navigate-our-site/verify-market.md); [Limitless
docs](https://docs.limitless.exchange/user-guide/user-generated-markets.md)). No documented case was found of an AI
oracle resolving a market wrongly or of a creator abusing self-resolution, which reflects how little these systems have
been tested rather than any proof that they are safe (INFERENCE). Base rates argue against creator rewards as a growth
engine: Trueo raised $4.03M and has about $780k of lifetime volume ([SECONDARY FACT · KuCoin,
2026-09-22](https://www.kucoin.com/news/flash/trueo-migrates-to-ethereum-mainnet-after-vitalik-buterin-s-endorsement-token-surges-10x)).

### Nobody settles non-price Solana state without a backend signer

Every memecoin market product checked settles through off-chain infrastructure plus a privileged signer. PumpMarket
settles through Bitquery, Helius and Birdeye; Survive.fun's backend "triggers on-chain `resolve_market` via the platform
authority wallet"; RugRoulette calls Helius, Birdeye and an LLM; and PNP's coin markets use Birdeye or CoinGecko plus an
LLM (FACT, Copilot records and [PNP docs](https://docs.pnp.exchange/platform/oracle-settlement.md)). Programs that read
oracle *price* accounts do exist. Tapebound, a Frontier devnet build, settles from a Pyth `PriceUpdateV2` with
`VerificationLevel::Full` and a boundary check ([FACT · Copilot record](https://colosseum.com/projects/explore/tapebound)),
the same account type Brot's reader parses, and Hxro Parimutuel lets anyone run the crank that settles from Pyth but has
had no successful transaction since 2026-05-01 (FACT, Solana RPC, 2026-10-07). "Results read only from on-chain
accounts" is therefore distinctive only for non-price market kinds (INFERENCE).

### Brot's defensible difference, narrowed

No live, funded product combines open creation steered to questions that can be checked, a pot, and resolution the
program performs itself with no creator, AI, vote or admin key (INFERENCE). Each piece exists elsewhere: open creation at
XO, Limitless and Melee; pots at Melee, Triad and PumpMarket; price resolution read by the program at Tapebound and Hxro.
The defensible message is "nobody, including the creator and Brot, decides the result", not "reads on-chain data", and it
holds only for market kinds whose account no single participant can cheaply move. Brot's own rules also qualify it: a
team key may confirm or void a result within a 6-hour review window, though it can never flip one (FACT, repo:
`docs/product/PRODUCT-BRIEF.md` R-23). A creation box that offers only what a typed reader can verify is a stronger
version of PNP's AI gate and of Melee's or Limitless's templates, because the check is the same code that resolves, so a
question that passes creation cannot become unresolvable later (INFERENCE).

Three threats stand out (INFERENCE): Polymarket shipping the creator features its employee signalled, Melee reaching
mainnet, and Limitless or HIP-4 extending templated creator markets. Demand, meanwhile, clusters around big, named token
events. Polymarket's "Pump.fun >$4B market cap (FDV) one day after launch?" drew $1.1M and Lighter's FDV market $25.1M
([SECONDARY FACT · aggregator search
text](https://polymarket.com/event/pumpfun-market-cap-fdv-above-one-day-after-launch)), while small-coin graduation
markets have shown none, with PumpMarket averaging about 1 SOL per market (INFERENCE). The pump.fun-flavoured markets
worth offering are therefore thresholds on large tokens that have Pyth feeds, not per-coin graduation (INFERENCE). PUMP,
BONK, WIF, FARTCOIN and TRUMP are among the 64 feeds Pyth keeps fresh on Solana mainnet ([FACT · Pyth push feeds,
Solana](https://docs.pyth.network/price-feeds/core/push-feeds/solana)).

## The chain can settle prices and ratchets, but not holders or volume

### Pyth lists 1,882 feeds, keeps 64 fresh on Solana, and only SOL and BTC are fresh on devnet

The public Hermes listing returned 1,882 feeds on 2026-10-07, among them 1,051 US equities and ETFs, 39 FX pairs, 11
metals, 36 commodities and 19 US rates ([FACT · Hermes price_feeds](https://hermes.pyth.network/v2/price_feeds)). Pyth's
own docs say "500+ price feeds" ([FACT · Pyth Core guide](https://docs.pyth.network/llms-price-feeds-core.txt)), and the
listing carries attributes that exist only in Pyth Pro, so which listed feeds can actually be posted through Core on
Solana is not verified. Only 64 feeds are sponsored on Solana, meaning Pyth keeps them fresh: almost all crypto plus one
US stock (GLXY), with no FX, metal, commodity, rate or index feed ([FACT · Pyth push feeds,
Solana](https://docs.pyth.network/price-feeds/core/push-feeds/solana)). A read-only RPC snapshot on 2026-10-07 found all
64 upgraded-generation accounts present on mainnet, 63 of them updated 7-51 s earlier, but **only 17 of 64 present on
devnet, and only SOL and BTC fresh (21 s)**, the others about 143 s old (FACT, one snapshot). Since 2026-08-26 Hermes
needs an API key (FACT, Pyth Core guide).

Three cautions apply. Equity feeds stop outside trading hours, when Pyth "may return a stale price for the product"
([FACT · Pyth best practices](https://docs.pyth.network/price-feeds/core/best-practices)). The same docs warn that pull
updates give users "some ability to select which price to use" and that "Adversaries are highly likely to win these
races". And thin feeds are where the Mango pattern applies: the SEC alleged "a series of large purchases of the thinly
traded MNGO token" that inflated collateral used to withdraw about $116M ([FACT · SEC press release
2023-13](https://www.sec.gov/news/press-release/2023-13)). For "close above X" questions a canonical rule exists: use the
first update with `prev_publish_time < T ≤ publish_time` (INFERENCE from the Pyth SDK and the repo's layout notes).

### Native metrics sort into ratchets, epoch snapshots and party-controlled flags

The repo's resolver notes already classify most native metrics worth a market (FACT, repo: `RESOLVERS.md`). Some are
ratchets that cost real money to move: classic SPL supply burned (supply at offset 36), DAMM v2 permanent locks (offset
552) and DAMM v2 cumulative fee counters. Some are epoch snapshots that need capital held across a boundary: the
stake-pool field `last_epoch_total_lamports` and validator stake read through `sol_get_epoch_stake`. And some are
party-controlled flags, such as a revoked mint, freeze or upgrade authority or frozen metadata, which are a free option
for the key holder and so stay out of the pot (FACT, repo: `docs/business/_review/wave-2-technical-security.md` E1). The
repo also measured two costs (FACT, repo): live stake-pool `total_lamports` was flash-inflated in a mainnet simulation at
a 0.10% round-trip cost on JitoSOL, so only the epoch snapshot is safe, and the pump.fun bonding-curve flag `complete` at
offset 48 costs 18.66 SOL to force on an untouched curve but only 0.07 SOL for the last 1%.

The new research adds four findings from source code (INFERENCE). A Realms vote can in principle be flash-borrowed when
vote tipping is on and no lock plugin applies, though this is a reading of archived source, not a tested exploit ([SPL
governance
source](https://github.com/solana-labs/solana-program-library/blob/master/governance/program/src/processor/process_cast_vote.rs)).
Squads proposals can be closed once final, which makes a market unreadable ([Squads
source](https://github.com/Squads-Protocol/v4/blob/main/programs/squads_multisig_program/src/instructions/transaction_accounts_close.rs)).
Vesting schedules are known at creation, so they are not a question. And the live values of lending, perps and LST
supply move inside one transaction, so they are refused.

### The judge's examples, checked against what a program can prove

| Judge's example | Verifiable on Solana? | Why (labels as in the notes) | Offer instead |
|---|---|---|---|
| "More than 10,000 holders" | No | Holders are spread over every token account, and a crank cannot prove it saw them all. SIMD-0215 says the lattice hash "does NOT support inclusion/exclusion proofs" (FACT). 10,000 fake holders cost about 20.4 SOL of refundable rent (INFERENCE on the rent constants) | "≥ N tokens burned by D", "≥ L liquidity locked forever in pool P" |
| "Active wallets this week" | No | Not stored anywhere; Sybils cost fees only | Brot can count its own participants, but that measures Brot, not the token |
| "TVL above X" | Only as an epoch snapshot | Live TVL can be flash-moved (repo) | "JitoSOL TVL ≥ X SOL at the start of epoch E" |
| "Today's burn above $2,000 in fees" | Partly | A supply ratchet from a creation baseline counts tokens, not dollars; USD needs a Pyth feed for that token. DAMM v2 fee counters work in token units | "≥ N tokens burned between creation and D"; "≥ F fees in DAMM v2 pool P by D" |
| Transaction counts, volume | No | Raydium's volume counters are dead (repo) | Refuse |

Sources: [SIMD-0215](https://github.com/solana-foundation/solana-improvement-documents/blob/main/proposals/0215-accounts-lattice-hash.md);
[solana-sdk rent](https://github.com/anza-xyz/solana-sdk/blob/master/rent/src/lib.rs). The judge's examples come from the
mock panel transcript, `knowledge-base/pitch/2026-10-06-banca-transcricao.md`.

Two oracle families stay outside the line. Switchboard's feed hash proves *which* recipe ran, not that the source tells
the truth ([FACT · Switchboard
tutorial](https://docs.switchboard.xyz/docs-by-chain/solana-svm/prediction-market/prediction-market-tutorial)), so jobs
that use `LlmTask`, `HttpTask` or `KalshiApiTask`, or fewer than three independent market sources, are opinion oracles
with a signature on them and should be refused (INFERENCE). Wormhole Queries can bring guardian-signed EVM reads to
Solana, but the Solana verifier is described as a proof of concept (SECONDARY FACT), which makes it research tier.

### The ranked catalogue

| Tier | Template, as the autocomplete would write it | What the program reads | Guard and cap | Product Brief kind (R-13) |
|---|---|---|---|---|
| A1 | "Will SOL touch $300 before Nov 30, 2026?" (SOL or BTC on devnet) | Pyth `PriceUpdateV2` owned by `rec2HH...`, feed pinned; positions use the canonical push PDA under `pyt2F4...`; YES on any Full update with `price − conf ≥ target` before the deadline | A fresh price on every position (30 s planned; devnet needs about 70 s, or a keeper posting updates); positions refused once `price + conf` reaches the target; demo cap | Big-asset price (touch, R-09) |
| A2 | "Will BTC be above $X at 00:00 UTC on Dec 1, 2026?" | Same feed, first update with `prev_publish_time < T ≤ publish_time` | Entries close well before T | Price at a fixed time: **outside R-09**, which defines price markets as touch |
| A3 | "Will SOL be between $X and $Y at T?" | Same as A2 | Same | Outside R-09 |
| A4 | "Will Solana reach slot 500,000,000 before Nov 1, 2026?" | Clock sysvar | Cannot be bought; low interest | None (novelty) |
| B1 | A1-A3 on all 64 feeds sponsored on mainnet | As A | Per-feed cap; thin feeds (MEW, ORE, CLOUD, MET, NAV/RR) low or refused | Price |
| B2-B5 | AAPL close, SPY touch, gold, EUR/USD, US 10-year yield, SOL against ETH | A Brot keeper shard with a Hermes key; uniqueness rule at an in-session T | Positions only while the market is open; holiday calendar; cadence of daily-published rates unverified | Price |
| B6 | "Will JitoSOL hold at least 15M SOL at the start of epoch 1080?" | `last_epoch_total_lamports` | Cap from the ~0.1% exit fee × gap (capital-gated) | Stake-pool size |
| B7 | "Will at least X of pool P's liquidity be locked forever by D?" | DAMM v2 `permanent_lock_liquidity` @552 | Cap from the value of the missing liquidity; creator-control badge | Meteora locked liquidity |
| B8 | "Will at least 1B BONK be burned between now and Dec 31?" | Classic mint supply @36 from a creation baseline, mint authority None | Needs a Pyth feed for the cap; creator-control badge | Supply burn |
| B9 | "Will pool P earn at least 5,000 USDC in fees by D?" | DAMM v2 cumulative fee counters from a baseline | Cap ≈ 0.2 × target ÷ k | Roadmap |
| B10 | "Will validator V have at least X SOL staked in epoch E?" | `sol_get_epoch_stake` | Only after a devnet YES; LiteSVM returns 0 | Validator stake |
| B11-B13 | Vote credits (the validator controls NO); Raydium LP burned; 1-hour SOL TWAP | `epoch_credits`; `lp_supply − lp_mint.supply`; `TwapUpdate` | Labels; two accounts; TWAP support on `rec2HH` unverified | n/a |
| C1 | "Will token T graduate from pump.fun by D?" | `BondingCurve.complete` @48 | 0.07 SOL forces the last 1%; closed-source upgradeable program; needs a progress guard and a tiny cap | Research |
| C2-C10 | Realms proposal passes; Squads transaction executed; vesting cancel or claim; Jito tips; Switchboard multi-source; Wormhole Queries; Token-2022 hook counters; cluster restart; epoch rewards | Various | Party-controlled, flash-pass, unverified layouts, or new trust roots | Research |
| Refused | Holders, active wallets, transaction counts, volume, live TVL, lending deposits, perps open interest, live LST supply, SOL supply or inflation, anything from an LLM, web API, sports or news source, and every party-controlled flag | n/a | The autocomplete explains why and offers the nearest template it can verify | n/a |

The tiers come from note 05, sections 1, 3 and 7, and A1-A4 depend on the Sprint 03 touch logic landing, which the notes
cannot confirm. One timing conflict sits inside the repo. Note 05 carries "entries close at 80% of duration, minimum 24
h, questions of at most 30 days", which comes from the wave-2 review (E4) and the founder's round-3 answer, but the
approved Product Brief lets markets run up to 90 days (R-06) and closes entries when 5% of the duration remains, at
least 24 h and at most 7 days before the end (R-07) (FACT, repo: `docs/product/PRODUCT-BRIEF.md`). Templates should
follow R-06 and R-07.

### A pot cap sized to the cost of forcing the outcome

An attacker who holds y of the winning side V, against a losing side P, with fee rate f and a sponsor prize, receives
y/V × (V + P − fee + prize), so the profit from forcing the outcome is at most (1 − f) × P + prize (INFERENCE). The
repo's review already proposed a `max_pot` recorded at creation and checked on every position (FACT, repo: wave-2 E2).
Note 05 turns it into one rule per side, computed at creation and re-checked by a keeper:

```
cap_NO  = max(0, (C_force_YES / k − prize) / (1 − f))   // limits the NO side, which a forced YES takes
cap_YES = max(0, (C_force_NO  / k − prize) / (1 − f))
k = 3   // margin for estimate error and for the cost falling during the market's life
refuse the template if min(cap_YES, cap_NO) < MIN_VIABLE_POT   // e.g. 50 USDC
```

The cost to force (C_force) differs by family (INFERENCE). For a burn it is (supply − goal) × the token's Pyth price,
so a token with no feed is refused or gets a small fixed cap. For a lock it is the value of the missing liquidity; for
DAMM v2 fees, 0.2 × the target plus round-trip price impact; for stake-pool or validator stake, the exit fee × the gap
plus one epoch of hedging, which is small, so the cap is small. Pyth templates use a per-feed allow-list with
`max_pot_per_feed`, high for majors and low for thin feeds; pump.fun graduation uses the measured loss to complete the
remaining curve; and party-controlled kinds have a cost of zero and are refused. At creation every account is pinned
(owner, length, discriminator), the goal must be unmet and a minimum distance away, and a Pyth feed must be on the
allow-list, use the canonical push PDA, show conf/price ≤ 0.5% and have its market open. While a market is open, a
keeper that finds the cap below the pot closes entries early.

As an illustration (INFERENCE), with C_force_YES = $30,000, k = 3 and no prize, cap_NO = $11,111 at f = 0.10. Two
decisions change the formula. It is a change to R-05's rule of no cap per question (FACT, repo:
`docs/product/PRODUCT-BRIEF.md` R-05; the program keeps only a global `CapState.global_cap`, TECHNICAL-PLAN). And under
the deck's "3.5% of each pot", f becomes 0.035 charged on both sides, so the bound becomes (1 − 0.035) × P − 0.035 × V +
prize and the conservative cap tightens by about 7%, to $10,363 in the same example (INFERENCE).

## Grammar first, AI later, and a preview that shows today's verdict

### Every reliable creation flow narrowed what can be written

Kalshi's self-certified Bitcoin contract is literally a template, "Will the spot price of Bitcoin be
<above/below/between> <price> on <date> at <time>?", with its terms under fixed headings (Underlying, Source Agency,
Payout Criterion, Position Limit, Expiration Value, Contingencies) and two clauses Brot should copy in plain words: "If no
data is available on the Expiration Date at the Expiration Time, then the market resolves to No", and "Revisions to the
Underlying made after Expiration will not be accounted for" ([FACT · CFTC filing, KalshiEX,
2024-03-15](https://www.cftc.gov/filings/ptc/ptc03152412807.pdf)). Augur v2 shipped **208 templates** with numbered
slots, typed inputs and regex validators, and its validator `isTemplateMarket` rejects a market whose "populated title
does not match title given" ([FACT · Augur
templates.ts](https://github.com/AugurProject/augur/blob/master/packages/augur-templates/src/templates.ts)). PNP splits
creation into six market types, each tied to one data source, and after creation runs an AI "settlement analysis" that
blocks a question it cannot answer and refunds the seed ([FACT · PNP creating
markets](https://docs.pnp.exchange/platform/creating-markets.md)). Manifold and Metaculus allow free text and handle it
with creator rules, moderators, review queues and unlisting ([FACT · Manifold
policies](https://github.com/manifoldmarkets/manifold/blob/main/web/pages/community-guidelines/market-policies.tsx);
[Metaculus question-writing
source](https://github.com/Metaculus/metaculus/blob/main/front_end/src/app/(main)/question-writing/page.tsx)). The closest
precedent to Brot is Augur's templates combined with Kalshi's headings (INFERENCE): the market *is* a template ID plus
typed slots, the title is generated from the slots and never typed, and Augur's title check maps directly onto Brot's
`text_hash`.

### A grammar for five days, a constrained model later

| Design | Speed | Cost | Determinism | Main risk | Fits the five days? |
|---|---|---|---|---|---|
| **Deterministic grammar**: typeahead over templates and the reviewed registry, typed slot widgets | Per keystroke, in the browser, under ~50 ms, no network | Zero per use | Total: the same text always gives the same struct | Text outside the grammar gets "we can't verify this on-chain" plus the nearest templates | **Yes, the recommendation** |
| **LLM mapping**: free text to template and slots through structured outputs | Hundreds of ms to seconds per call; only on submit | Metered; needs quotas per wallet and per IP | Low | A wrong choice that still fits the schema; refusals; no range checks inside the schema | No |
| **Hybrid**: grammar first, model only when the grammar fails, output limited to enums | Grammar speed in most cases | Low | Grammar's, plus confirmation | Same as LLM mapping, but contained | Later, if the founder opens AI under D2 |

The comparison is INFERENCE, and the vendors' own documentation sets the limits on the model. Anthropic's structured
outputs promise "Always valid" JSON through constrained decoding, but do not support JSON Schema `minimum`/`maximum`, can
still miss the schema after a refusal or truncation, and guarantee syntax rather than semantic correctness ([FACT ·
Claude structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs)); on complex schemas
the coverage of open-source constrained decoders fell as low as 3% ([FACT · JSONSchemaBench, arXiv
2501.10868](https://arxiv.org/abs/2501.10868)).

For the hackathon, one sentence template per first-day kind is enough (INFERENCE, matching R-13):

| Kind (R-13) | Sentence template |
|---|---|
| Big-asset price | "Will [SOL] touch $[200] before [date]?" |
| Supply burn | "Will [mint] supply fall to [N] or less by [date]?" |
| Meteora locked liquidity | "Will at least $[X] be permanently locked in [Meteora pool] by [date]?" |
| Stake-pool size | "Will [pool] hold at least [N] SOL at the start of epoch [E]?" |
| Validator stake | "Will [validator] have [N] SOL active stake in epoch [E]?" |

The typeahead matches the first words ("will sol...", "burn...", "lock...") against template prefixes and asset names
in `content/market-registry.json`, then shows the full sentence with the remaining slots as real, labelled inputs
(number, date picker, registry dropdown) rather than inline blanks. That avoids the problems Adrian Roselli documents for
sentence forms: screen-reader users hear "a muddied sentence", people with dyslexia "generally hated the overall
experience", and automated translation garbles the strings around fields ([FACT · Roselli,
2021-08-16](https://adrianroselli.com/2021/08/sentence-forms-not-mad-libs.html)). It matters because Brot ships in
Portuguese and English and should render each language from the struct. Baymard recommends at most 10 suggestions on
desktop and 4-8 on mobile ([FACT · Baymard, 2022-08-02](https://baymard.com/blog/autocomplete-design)). The one sourced
conversion figure, Vast.com's "25-40%" gain from Mad Libs forms, came with other changes made at the same time ([FACT ·
LukeW, 2010-02-25](https://www.lukew.com/ff/entry.asp?1007)), so it is weak evidence.

The registry is also what reconciles open creation with curation (INFERENCE). If two team members review every registry
entry (assets, pools, validators, stake pools) and the public composes markets only from those entries, curation moves
from "the team lists every market" to "the team lists every account a market may read". The hybrid can then respect
K-02, "No AI in ... the choice of the account a market reads" (FACT, repo:
`docs/technical/SYSTEM-ARCHITECTURE-PROPOSAL.md`), provided the account is looked up deterministically from the registry
entry the user confirms and the model never outputs an address.

### What the creator sees before signing

Kalshi shows the binding rule under fixed headings, and PNP shows live data as soon as a token address is pasted
([FACT · PNP coin markets](https://docs.pnp.exchange/market-types/coin.md)). Brot can go further, because its reader is
the program itself. The pre-signature card should hold, in order (INFERENCE):

1. The generated sentence.
2. The rule in plain words: what is read (short and full address, explorer link), how it is read, the deadline in UTC
   and local time, when entries close (R-07), what missing or stale data means ("not met by the deadline → NO"), early
   resolution on irreversible facts (R-08), and the one-sided and void refunds (R-10, R-11).
3. The live value, such as "SOL now $142.10 (Pyth, 3 s ago)", with the line "**If resolved right now: NO**".
4. The money: house fee, creator share, the creator's deposit and when it returns, and the pot cap.
5. A share-card preview.
6. A creator-control warning on burn and lock templates, reusing the R-19 wording.

No published example of a "would resolve X if checked now" preview at creation was found. It appears novel, though the
search was not exhaustive. The card should be the only path to the sign button and be regenerated from the exact struct
the transaction carries.

### Abuse controls: what the program enforces and what the website handles

On Solana nothing can be deleted, so the strong controls are program rules and front-end listing is the soft layer.
Brot's closed template set rules out death, private-person and free-text abuse by construction; what remains is spam,
duplicates, manipulable targets, outcomes the creator controls, and Sybil farming.

| Control | Layer | What it stops | Origin |
|---|---|---|---|
| Closed template enum with pinned accounts | Program | Death, private-person, sports, election and free-text markets; no title to moderate | House rule; Augur v2 |
| Generated sentence checked against `text_hash` | Program and site | A title that drifts from what is signed | Augur `isTemplateMarket` |
| Uniqueness PDA from kind + account + threshold bucket + deadline bucket | Program | Duplicates; the typeahead surfaces the existing market instead | Note 06 |
| Duration bounds (R-06's 90-day maximum; a per-template minimum of about 3 days) | Program | Instant or endless markets | Metaculus, PNP, R-06, R-07 |
| Per-template pot cap from the cost to force | Program, re-checked by a keeper | Paying to force the outcome | Wave-2 E2; changes R-05 |
| Refundable creation deposit, forfeitable on a void for abuse | Program | Spam; gives Sybils a real cost | Manifold's ante, PNP's seed, the founder's round-3 idea |
| Per-wallet rate limit (a `Creator` PDA with open count and last creation time) | Program | Bursts from one wallet; Sybils bypass it | Limitless daily limit |
| Party-controlled kinds refused; creator-control badge on burn and lock | Program and site | A free option for the key holder | Repo E1, R-19 |
| Registry symbol shown instead of raw Token Metadata | Site | Slurs or harmful words in titles, since issuers control metadata | Note 06 |
| Listed/unlisted and ranked flags, with unlisting as the default action | Site and indexer | Spam in the feed (the on-chain market stays) | [Manifold policies](https://github.com/manifoldmarkets/manifold/blob/main/web/pages/community-guidelines/market-policies.tsx) |
| In-app flag button | Site | Required for user-generated content on the Solana dApp Store | [Solana Mobile policy, 2026-07-21](https://legal.solanamobile.com/publisher-policy-web) |
| Void path (R-11: everything returned, no fee) | Program, team key | The on-chain remedy; never deletion | Product Brief |
| No points or ranking on raw volume or distinct wallets | Product | Wash trading and Sybil farming | Columbia study; Manifold rules |

### Distribution: a share card first, a blink second

Blinks still exist and are documented, but on X they unfurl only for URLs in Dialect's registry, which is reviewed by
hand: "As of launch, only Actions that have been registered in the Dialect registry will unfurl in the Twitter feed when
posted" ([FACT · Solana Actions docs](https://solana.com/docs/tools/actions)), and as of March 2026 "X hasn't natively
integrated Blink rendering" ([SECONDARY FACT · Madeonsol,
2026-03-11](https://madeonsol.com/blog/solana-blinks-actions-explained)). The dependable channel from a phone or a
Seeker is an ordinary link with an Open Graph card rendered from the struct, showing the sentence, the live value, the
deadline, the pot so far and the YES/NO split (INFERENCE). The same market can be served as a blink for desktop wallets,
with registry approval sought early, and a `?ref=` parameter carrying the creator's wallet would make creator promotion
and the planned referral attribution one mechanism.

## Creator pay should reward divided pots, and it will start small

### What other venues pay creators

| Venue | Creator share | As a share of the platform fee (INFERENCE where computed) | Source |
|---|---|---|---|
| Limitless | "2% of taker fees by default", paid daily in USDC | 2% | [FACT · docs](https://docs.limitless.exchange/user-guide/user-generated-markets.md) |
| Pumpcade | 0.10% of a 1% fee (0.45% protocol, 0.45% streamer) | 10% | [FACT · docs](https://docs.cade.market/mechanics/parimutuel-markets) |
| pump.fun bonding curve | 0.30% of a 1.25% fee | 24% | [FACT · fees](https://pump.fun/docs/fees) |
| PNP | 30% of the 1% trade fee, plus 60% of a 2% redemption fee | 30% of trade fees | [FACT · fees](https://docs.pnp.exchange/platform/fees-and-rewards.md) |
| Xmarket | "Up to 50%" of trading and redemption fees | Up to 50% | SECONDARY FACT, press release |
| Hyperliquid HIP-4 | Deployer fee capped at 50% | Up to 50% | SECONDARY FACT, The Block |
| Augur v1 | "Between 0% and 50%" | 0-50% | FACT, v1 glossary |
| Melee | "A cut of every trade"; its example implies about 2.0% of volume | n/a | SECONDARY FACT, [IQ.wiki](https://iq.wiki/wiki/melee.md); INFERENCE |

No source shows what share *causes* a creator to promote their own market; pump.fun, PNP and Melee have published no A/B
or cohort data.

### A share of the house fee resists wash trading

The arithmetic works in Brot's favour (INFERENCE). If the creator receives a share s of the house fee and the fee comes
out of the pot, a creator who fills both sides with their own wallets pays the full fee on the losing leg and gets back
only s of it, so self-dealing loses (1 − s) of the fee and pure wash trading is unprofitable whenever s < 1. It becomes
profitable only when *outside* rewards depend on volume or participant count, such as points, leaderboards, airdrops or
"trending" placement, which are exactly what the Columbia figures and Manifold's rules against harvesting bonuses point
at. Brot should therefore keep points and rankings off raw volume and off counts of distinct wallets, pay the creator
only at settlement and only on two-sided markets that are not voided, never pay for the act of creation, and consider a
per-market cap on the creator share. pump.fun's locked "creator fees or cashback" choice suggests one more option: a "no
creator cut" badge for creators who redirect their share to the pot, which also defuses the creator-control concern on
burn and lock markets.

### The two fee models give creators opposite incentives

The house fee is an open decision, D1. The Business Plan v0.0.2 and Product Brief R-01 say **10% of the losing side**,
which averages 3.70% of volume within a range of 2.70% to 4.18% depending on how balanced the questions are (FACT, repo:
`docs/business/BUSINESS-PLAN.md`; BP Part 2 §5.2). The founder's latest deck at `/pitch2` says **3.5% of each pot**
(FACT, repo: `CHANGELOG.md`, 2026-10-06). The Business Plan chose the first model because a fee on the whole pot makes
winners on a heavy favourite receive less than they put in, with each dollar returning 0.975 when 99% of the pot sits on
the winning side (FACT, repo: `CHANGELOG.md`, "Em aberto"). With public creation, the choice also decides what creators
are paid for (INFERENCE; a $10,000 pot and a 30% creator share):

| Pot split and outcome | Fee A: 10% of the losing side | Creator at 30% (A) | Winners per dollar (A) | Fee B: 3.5% of the pot | Creator at 30% (B) | Winners per dollar (B) |
|---|---|---|---|---|---|---|
| 50/50 | $500 | $150 | 1.90 | $350 | $105 | 1.93 |
| 80/20, favourite wins | $200 | $60 | 1.225 | $350 | $105 | 1.206 |
| 99/1, favourite wins | $10 | $3 | 1.009 | $350 | $105 | **0.975** |

Under A, creator pay rises with how divided the pot is, which rewards the questions the panel asked for: "a goal with a
number divides opinion" (FACT, repo: mock panel B-13). Under B, the creator earns the same from an obvious, lopsided
market as from a divided one, and the participants who were right on the favourite lose money. For an open creation box
this is the strongest argument in the fee decision, and it favours A (INFERENCE). Pumpcade promises that winners always
get at least their deposit back (FACT, Pumpcade docs); fee A keeps that property and fee B breaks it.

### Break-even with a creator share

The Business Plan computes break-even as `5,500 ÷ (fee × 75% to operation × 95% after the referral cost)`, which gives
**US$208,630 a month** at 3.70% (FACT, repo: BP Part 2 §5.2), and the deck's 3.5% gives about 221,000, as the CHANGELOG
records. Assuming the creator share comes off the top, before the 25/75 treasury and operation split, the break-even
moves as follows (INFERENCE):

| Creator share s | Fee A: 3.70% average | Fee B: 3.5% of the pot |
|---|---|---|
| 0% | $208,630 | $220,551 |
| 10% | $231,811 | $245,057 |
| 20% | $260,787 | $275,689 |
| 30% | $298,043 | $315,073 |

The creator's take as a share of volume is 0.74% (A) or 0.70% (B) at s = 20%, and 1.11% or 1.05% at s = 30%. A 30%
share raises the break-even volume by about 43% under either fee model.

### Revenue scenarios

These are illustrations, not forecasts. Each scenario takes another venue's observed monthly volume as an anchor and
assumes a 30% creator share (INFERENCE throughout).

| Scenario (monthly volume) | Anchor | Gross fee per month, A / B | To creators, A / B | To operation after creator, treasury and referral, A / B | Gross fee per year, A / B |
|---|---|---|---|---|---|
| $2.2M | Limitless creator markets, beta month: 162 creators, 1,611 markets ([SECONDARY · The Black Swans, 2026-08-26](https://theblackswans.substack.com/p/limitless-the-prediction-market-that)) | $81,400 / $77,000 | $24,420 / $23,100 | $40,598 / $38,404 | $0.98M / $0.92M |
| $15.44M | World, the largest Solana-only venue, Sep 2026 ([FACT · DefiLlama](https://api.llama.fi/summary/dexs/world)) | $571,280 / $540,400 | $171,384 / $162,120 | $284,926 / $269,525 | $6.86M / $6.48M |
| $53.5M | Every Solana-tagged venue combined, 30 days ([FACT · DefiLlama](https://api.llama.fi/overview/dexs)) | $1.98M / $1.87M | $593,850 / $561,750 | $987,276 / $933,909 | $23.75M / $22.47M |

Two readings follow (INFERENCE). Creator pay is small at realistic scale: at the Limitless anchor the average market
($1,366) pays its creator about $15 under A or $14 under B, roughly $150 a month per creator, whereas pump.fun paid
creators more than $4M in a single day after Ascend ([SECONDARY FACT · Decrypt,
2025-12-29](https://decrypt.co/352919/creator-capital-markets-pump-fun-streaming-twitch)). Early creators will be moved
by visibility, sponsorship and conviction rather than income, so creator pay is an alignment tool before it is a growth
engine. And even the whole category is small: owning every dollar of Solana-native market volume would earn per year
less than pump.fun earned in June 2026.

### A valuation framework, not a valuation

The comparables give three lenses, none of them a promise: the leaders' 5-20x annualized revenue or 0.25-0.5x
annualized dollars-paid volume, pump.fun's own range of 1.0x to 6.2x trailing revenue by market cap in fifteen months,
and entrant round sizes of $3-20M plus Colosseum's standard $250k deal. Applied to the scenarios above (INFERENCE):

| Scenario | Annualized gross fee | Implied at 5-20x revenue | Annualized volume | Implied at 0.25-0.5x volume |
|---|---|---|---|---|
| $2.2M a month | $0.92-0.98M | $4.6-19.5M | $26.4M | $6.6-13.2M |
| $15.44M a month | $6.48-6.86M | $32-137M | $185M | $46-93M |
| $53.5M a month | $22.5-23.8M | $112-475M | $642M | $160-321M |

The caveats outweigh the numbers. The leader multiples come from regulated venues with billions of sustained volume,
incentive-driven entrants such as Opinion and Limitless lost most of their volume within months, pump.fun's own multiple
moved from about 1x to 11x of FDV in fifteen months, and a pre-revenue devnet project has no revenue to multiply. For the
pitch, the honest comparables are round sizes: Melee $3.5M, TBD $3M, XO $6M, Limitless $10M, Pumpcade $1M then $5M, and
Colosseum's $250k standard deal.

## A pot is the contract the pump.fun court left open

This is not legal advice, and every point here is a question for counsel. One framing note first: describing Brot as
"markets" with "positions" is a product and communication choice, and it does not change how a regulator or a court
classifies the activity, which turns on the substance of the contract.

### United States, federal

Under 7 U.S.C. §1a(47)(A), a "swap" includes any agreement "that provides for any purchase, sale, payment, or delivery
... that is dependent on the occurrence, nonoccurrence, or the extent of the occurrence of an event or contingency
associated with a potential financial, economic, or commercial consequence" ([FACT · 7 U.S.C. §1a,
LII](https://www.law.cornell.edu/uscode/text/7/1a)), and under §2(e) anyone other than an eligible contract participant
may enter a swap only on a designated contract market ([FACT · 7 U.S.C. §2,
LII](https://www.law.cornell.edu/uscode/text/7/2)). In January 2022 the CFTC held Polymarket's "event-based binary
options contracts" to be swaps, imposed a $1.4M penalty, and said: "All derivatives markets must operate within the
bounds of the law regardless of the technology used, and particularly including those in the so-called decentralized
finance or 'DeFi' space" ([FACT · CFTC release 8478-22](https://www.cftc.gov/PressRoom/PressReleases/8478-22)). The 2026
activity has favoured registered venues. An NPRM on "Prediction Markets; Public Interest Determinations" was published
on 2026-06-12 ([SECONDARY FACT · Federal
Register](https://www.federalregister.gov/documents/2026/06/12/2026-11854/prediction-markets-public-interest-determinations)),
and on 2026-04-02 the CFTC sued Arizona, Connecticut and Illinois to defend its "exclusive jurisdiction" for DCMs, in a
release that says nothing about unregistered, offshore or decentralized platforms ([FACT · CFTC release
9206-26](https://www.cftc.gov/PressRoom/PressReleases/9206-26)). A pot payout is not an element of the swap definition,
and a crypto price is a commodity, so restricting markets to crypto and on-chain metrics does **not** lower federal
exposure, and US geofencing stays necessary (INFERENCE).

### United States, states and the plaintiffs' bar

The 2026 state rulings split. The Sixth Circuit held unanimously on 2026-09-25 that "Ohio and Tennessee can regulate
event contracts under their gambling laws" ([SECONDARY FACT · Al
Jazeera](https://www.aljazeera.com/news/2026/9/25/us-court-rules-against-kalshi-says-states-can-regulate-prediction-markets)),
and the Ninth Circuit subjected Kalshi to Nevada law, while the Third Circuit held for Kalshi in April 2026. New York sued
Polymarket US on 2026-09-24 as an "illegal, unlicensed gambling operation" ([SECONDARY FACT · Fox 5
NY](https://www.fox5ny.com/news/new-york-sues-polymarket-illegal-gambling-lawsuit)), and about 20 states still challenge
sports contracts (SECONDARY FACT, a Prediction News headline). Every 2026 state action found targets sports, election
or culture contracts, so crypto-only markets do lower *state* exposure materially (INFERENCE). The pump.fun opinion is
not reassuring here, for two reasons (INFERENCE): the plaintiffs' bar has shown it will plead RICO with gambling and
money-transmission predicates against a Solana launchpad and its founders personally, and the New York gambling
definition the court applied reserves the pot question.

### Brazil: MP 1.394 removed the timing element a pot design could lean on

MP 1.394/2026 bans the "exploração, a oferta, a intermediação e a publicidade de loterias de aposta de quota fixa",
including by an agent abroad who offers them to people in Brazil (art. 1º); §1º extends the ban to "apostas sobre
eventos reais de temática esportiva e sobre eventos virtuais de jogos on-line"; and art. 3º, I defines fixed odds as
placing value at risk "na expectativa de obtenção de prêmio cujo montante é definido por fator de multiplicação" ([FACT ·
Planalto, MPV 1.394](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2026/mpv/mpv1394.htm)). The 2018 law it revokes
required the payout to be fixed "no momento de efetivação da aposta" ([FACT · Lei 13.756/2018, art. 29
§1º](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13756.htm)). A pot payout is still a multiplication
factor, only one fixed at close, so the pot is weaker cover now than it was under the old text (INFERENCE; counsel must
confirm). Two other texts bear on Brot, though their primary texts were not read (repo `regulacao.md`): CMN Resolution
5.298/2026 permits derivatives only on a "referencial econômico-financeiro", which a crypto price may fit and a burn or a
liquidity lock fits less clearly, and SPA Nota Técnica 2958/2026 treats Polymarket and Kalshi as reproducing "aposta de
quota fixa". The MP has been in force since 2026-09-25 and as of 2026-10-07 had 48 amendments, a deliberation period
running to **2026-11-23**, and no rapporteur or vote ([FACT · Congresso
Nacional](https://www.congressonacional.leg.br/materias/medidas-provisorias/-/mpv/175871)), while an STF request for its
full suspension is pending ([SECONDARY FACT ·
Migalhas](https://www.migalhas.com.br/quentes/465423/entidades-pedem-ao-stf-suspensao-da-mp-que-proibe-bets)). Public
creation adds two Brazilian risks (INFERENCE): a creator who earns fees could be read as engaging in "intermediação"
(art. 1º), and promoting markets as "publicidade" (art. 16).

### United Kingdom, the EU and the app stores

In the United Kingdom, crypto price contracts fall under the FCA's retail ban on binary options, which the FCA is
weighing whether to ease, and non-financial contracts "would likely need a licence under the Gambling Act 2005, most
likely as a betting intermediary" ([SECONDARY FACT · CoinDesk,
2026-09-07](https://www.coindesk.com/policy/2026/09/07/uk-regulator-weighs-easing-financial-prediction-market-ban-times);
[CCN](https://www.ccn.com/news/crypto/polymarket-kalshi-uk-fca-prediction-markets-push-back-gambling/)). A single FCA
warning on 2024-12-03 was enough for pump.fun to block UK users, with Cohen saying "This is permanent" ([SECONDARY FACT ·
Decrypt, 2024-12-06](https://decrypt.co/295355/solana-pump-fun-bans-uk-users-regulator)). In the EU, France's ANJ
ordered ISP blocking of Polymarket on 2026-07-16/17 and lists nine other states that restricted such markets ([FACT,
repo citing ANJ](https://anj.fr/promotion-illegal-gambling-services-blocking-polymarket-website)). App stores act as
regulators too. Apple pulled pump.fun's iOS app from the US and India App Stores one day after Custom Pairs launched
([SECONDARY FACT · Protos,
2026-09-11](https://protos.com/one-day-after-launching-stock-pairs-apple-delists-pump-fun-app/)), with a low-quality
source reporting it restored on 2026-09-18, and the Solana dApp Store requires in-app reporting and moderation of
user-generated content plus "all documentation required by Applicable Law" for regulated financial services ([FACT ·
Solana Mobile publisher policy, 2026-07-21](https://legal.solanamobile.com/publisher-policy-web)).

### What public creation makes worse, and what template-only creation mitigates

Every licensed venue curates, and so does Polymarket's unlicensed international venue, because the operator answers for
each listed contract. Open creation invites sports and election questions despite any policy and turns the creator into
a possible intermediary (INFERENCE). A typed on-chain resolver narrows what can be created, since no sports result or
election can be read from a Solana account, and that is a real mitigation that should be written down as a legal control
(INFERENCE). It mitigates the state-law and Brazilian sports-ban exposure; it does not touch the federal swap question,
the money-transmission theory or the creator-as-intermediary reading. The sequencing follows (INFERENCE): show public
creation on devnet as a mechanism, and keep real-money public creation behind counsel's answer, geo-blocking (US, New
York, UK, Brazil) and a settled regulatory route.

## Five days: one template end to end, labelled honestly

> **Two submission risks, to settle before anything else.** First, the plan says the team presents as one person at the
> hackathon (`docs/business/PITCH.md`; BP Part 4 §6.1), but `git log` since the 2026-09-14 start shows commits from
> **four author identities** (rechecked 2026-10-07). The portal asks for every teammate "with context on their
> backgrounds", and judges look for whether the team "Were the ones to do this work, rather than a third party" ([FACT ·
> Colosseum FAQ h-faq-13](https://colosseum.com/hackathon#h-faq-13)). Second, the repo's first commit (2026-10-01)
> imports the frozen `pred-provable` program (`0xcf07/pred-provable@390d882`). Products "are judged only on the work
> completed between the competition's start and end dates", teams "must disclose all relevant past development work",
> and misrepresentation can mean disqualification, a ban or loss of the prize ([FACT ·
> h-faq-4](https://colosseum.com/hackathon#h-faq-4)). The safe reading is to list everyone who committed code and to
> state plainly what came from `pred-provable`.

### What the rules ask

The **Crypto World's Fair** runs from 6:00am PT on 2026-09-14 to **11:59pm PT on 2026-10-12**, which is 03:59 Brasília
time on the 13th. Prizes total about US$840k in Phantom's CASH stablecoin, including a Solana track of 10 × US$10k, and
accelerator teams receive a US$250k pre-seed investment ([FACT · Official
Rules](https://colosseum.com/legal/Crypto%20World's%20Fair%20Hackathon%20Rules.pdf);
[colosseum.com/worldsfair](https://colosseum.com/worldsfair)). **The rules say nothing about tokens**, so the panel's
"you can't have a token for the hackathon" (B-19) is not a rule (FACT, all eight pages read). Three clauses do matter:
entrants warrant that taking part "will not violate any law ... in Entrant's country" (§4(c)), prizes depend on "passing
of the due diligence requirements" (§13), and all content must be in English (§12(a)). The submission asks for a
two-to-three-minute presentation video, "one of the first resources judges review", a product demo of at most three
minutes, and go-to-market and demand-validation answers ([FACT · h-faq-11](https://colosseum.com/hackathon#h-faq-11)).
Of the two official lists of judging criteria, the rules add "Open-source" and "compose with other primitives" (§8), and
the Pyth reader answers both.

The precedents cut both ways. Melee placed 2nd Consumer at Breakout with "No live software demonstrated", while
Riverboat, a working devnet pari-mutuel demo, got only an honourable mention ([FACT · Copilot
records](https://colosseum.com/projects/explore/melee-markets)). The category can win, having taken 4 of the Frontier
awards with 4.5% of entries, though the counts conflict (the blog gives 2,857 submissions and 25 awards, Copilot 2,858
projects and 28 winners). And Trepa, a pool-based winner, shut down in August 2026 because "We were not able to find
product-market fit" ([FACT · founders' post,
mirror](https://youmind.com/ar/landing/x-viral-articles/trepa-shutting-down-post-mortem)), so judges who know the story
will ask for evidence of demand.

### Scope for 7 to 12 October

Sprint 02 (the pot core) has not started, and `programs/brot-markets` has no instruction yet (FACT, repo: `CLAUDE.md`;
SYSTEM-ARCHITECTURE-PROPOSAL K-13). The scope below is INFERENCE from note 07.

| Must be live on devnet | Can be mocked, labelled "prototype" (B-12) | Leave out |
|---|---|---|
| `create_market` accepting only resolver kind `PriceTouch` with a named Pyth feed, on SOL or BTC (the only fresh devnet feeds) | The autocomplete box over templates, with no LLM; the other four templates shown greyed as "next" | Any token, token card or talk of a future token (F-05, B-33) |
| `take_position` (YES/NO, devnet USDC) | The "if resolved now" card, if it reads devnet Pyth live | Any mainnet plan without an audit |
| A permissionless `resolve` reading `PriceUpdateV2` through `readers/price_touch.rs` | Points, sponsorship tiers, the indexer | "Anyone can open any market", unhedged (B-14) |
| `claim` with the house fee | The keeper: resolve by hand or by script | Markets the project itself controls ("will the burn happen", B-13) |
| One LiteSVM test of the full cycle, and one real devnet cycle with explorer signatures | The Seeker channel | AI in creation (K-02, D2) |

The notes suggest the program and the LiteSVM cycle on days 1 and 2, the devnet deploy and a scripted cycle on day 3,
the creation box over templates and the market page on day 4, and the one-minute weekly update, both videos and the
portal text on day 5. It fits only if `emit_cpi!` and everything outside the single resolver kind wait (T4). A Superteam
Brazil side track of about US$5,000 reportedly accepts the same project, with a deadline of 23:59 Brasília time on the
12th, four hours before Colosseum's ([SECONDARY FACT · solanabr/wiki PR #3](https://github.com/solanabr/wiki/pull/3)).
Solana Mobile's CLOCK IN closes on 2026-10-08 and requires an Android APK, so it is out of reach ([FACT · Solana Mobile
blog, 2026-09-28](https://solanamobile.com/blog/clock-in-the-solana-mobile-hackathon)).

### Pitch phrasing

| Say | Avoid | Why |
|---|---|---|
| "The pump.fun of on-chain markets", or "guided creation of verifiable markets" | "The pump.fun of prediction markets" | Repo vocabulary rule. At least four projects used that label and did not reach scale. Guided creation scores better on Novelty (INFERENCE) |
| "Anyone can open a market, but only on a question the chain can settle" | "Anyone can open any market" | Answers B-14 without hiding the filter |
| "A equipe confere. O dado decide." ("The team checks; the data decides"), "Anyone can re-check the read", "Auto payout" | "No human in the loop", "no oracle", "trustless", "unruggable", "can't be manipulated" | R-23 lets a team key confirm or void within 6 hours. Pyth is an oracle (Product Brief §12 table, row 12, drops "no oracle"). The court read "unruggable fair launch" as a statement of fact |
| "Why not Melee: guided creation limited to questions on-chain data can settle, a reproducible resolution, and payout without a human picking the winner" | Silence on Melee | Melee is funded, won at Colosseum, and makes the same pitch |
| "Kalshi markets wrapped as Solana tokens did $28.6M in their first three weeks (Dec 2025); in Sep 2026 the largest Solana-only venue, World, did $15.4M" | "$28.6M on Solana", stated as current | Stale, and not a native market |
| "$22.6B a month in dollars actually paid (DefiRate, 7 Sep to 6 Oct)" | A volume figure with no measure named | Face value is $85.7B for the same window |
| Crypto is "13.7% of notional" (Pew, July 2026) | "Crypto is about a fifth of the volume" | That figure is Polymarket's own, from May 2026 |

## Decisions only the founder can take

### Public creation reverses his later decisions, and matches his first answer

The founder's round-1 answer to the ideation questions was "qq pessoa poderá criar qualquer pergunta que funcione dentro
do nosso escopo" ("anyone may create any question that works within our scope"), and the ideation record marks it as
changed in round 3, where he decided "vamos deixar que a equipe abra as perguntas" ("let the team open the questions")
(FACT, repo: `docs/business/ideacao-perguntas-e-respostas.md`, Q9 and round 3). The Business Plan and the Product Brief
follow round 3: two team members open a question, one proposing and one approving (F7, R-32), and the public only
suggests via X (Product Brief §2). At the mock panel the crypto judge said "Não pode ser qualquer pessoa iniciando
qualquer mercado" ("it can't be just anyone opening any market"), just after saying "Quem inicia esse mercado é o seu
primeiro `[?]` ponto de valor" ("whoever starts the market is your first point of value"), where the transcript marks one
word as uncertain, and the panel review adopted "Curated: the team lists every market" (B-14) (FACT, repo:
`knowledge-base/pitch/2026-10-06-banca-transcricao.md`; `docs/business/_review/banca-do-pitch-2026-10-06.md`).

### Where template-only creation answers the judge, and where it does not

Template-only creation answers "any market" literally (INFERENCE). The program accepts only enum kinds with pinned
accounts, titles are generated, and no death, sports, election, private-person or free-text market can exist. If the
registry stays curated by two people, B-14's promise survives in a new form, "the team lists every account a market can
read", and the judge's second remark is honoured too, since the creator becomes a named, rewarded first point of value.
It does not answer five concerns (INFERENCE). Whoever controls the underlying metric can still manipulate it: burn and
lock templates are open to the token team, pump.fun graduation costs 0.07 SOL at 99%, and thin Pyth feeds can be
pushed. Empty and one-sided pots will be the norm, as pump.fun's 99%+ of coins that never graduate suggest. Sybil
creators bypass wallet rate limits. An open creator who earns fees invites a legal reading as an intermediary. And open
creation gives up the curation every licensed venue relies on.

### The decision table

| # | Decision | What it reverses or touches | Options | What the research supports (INFERENCE) |
|---|---|---|---|---|
| 1 | Open market creation to the public | F7, R-32, B-14; his round-3 answer | Keep it curated; template-only public creation over a curated registry; public creation on devnet only for now | Template-only over a curated registry, shown on devnet for the hackathon; real money after counsel |
| 2 | A pot cap per template, sized to the cost to force | R-05 (no cap per question) | No cap; a cap only on finite-cost templates; a cap on all | Cap any template with a finite cost to force; refuse the rest |
| 3 | AI in creation | K-02; D2 (AI off until mainnet) | Grammar only; the hybrid later with enum-only outputs | Grammar only now; K-02 needs no change |
| 4 | House fee (D1) | R-01 vs `/pitch2` | 10% of the losing side; 3.5% of each pot | 10% of the losing side, which keeps winners above their stake and pays creators for divided pots. Changes the break-even, creator pay, the cap's f and the deck |
| 5 | Creator share and its rules | New | s = 10-30%; paid only at settlement on two-sided markets that are not voided; optional redirect to the pot; per-market cap | 20-30% of the house fee, never for creation itself |
| 6 | Creation deposit, rate limit, uniqueness buckets | New; matches his round-3 "depósito mínimo" idea | Amount, forfeiture, K open markets per wallet, bucket sizes | A refundable deposit that is forfeited on a void for abuse |
| 7 | The one-sided pot fee under open creation | R-10 (1% on every participant after the first) | Keep it; refund with no fee | Revisit: with open creation most pots will be one-sided |
| 8 | Which templates are public | R-13, R-14, R-19 | The five kinds; with or without burn and lock; pump.fun graduation | Refuse party-controlled kinds; badge burn and lock; keep graduation in research |
| 9 | Jurisdictions and geo-blocking | Technical Plan; his "bloqueios ao final" | Before or after public creation | Before any real-money public creation (US, New York, UK, Brazil) |
| 10 | Who is listed on the submission | PITCH.md "presents as one person" | One presenter, all listed; one person only | List every committer |
| 11 | Disclosure of the `pred-provable` reuse | Hackathon rules h-faq-4 | Disclose in the description and the video | Disclose |
| 12 | Public phrasing and token | B-19, F-05, B-33 | "pump.fun of on-chain markets"; no token | As recommended |
| 13 | The Superteam Brazil side track | New | Enter or skip | Enter, before 23:59 BRT on the 12th |

## Repo numbers now outdated

The notes found the following. This report edits none of these files.

| Where in the repo | What it says | What the notes found | Label, date, source |
|---|---|---|---|
| `knowledge-base/market/publico-web3.md` | DefiLlama's API returned "dados congelados de 2025" | The API returned live data to 2026-10-06 for every pump slug | FACT, 2026-10-07, [DefiLlama API](https://api.llama.fi/summary/fees/pump?dataType=dailyRevenue) |
| `publico-web3.md` | "Receita diária US$ 800 mil (jun/2026) contra US$ 4,8 mi seis meses antes" | $4.83M a day is the January 2025 average, about 17 months earlier. December 2025 was $1.10M a day; DefiLlama has June 2026 at $0.88M | FACT (DefiLlama); SECONDARY ([The Block, 2026-06-16](https://www.theblock.co/post/404806/pump-fun-activity-craters-80-three-months-solana-fees-lower-traders-rotate-perps)) |
| `publico-web3.md` | "80 milhões; volume vitalício > US$ 214 bi; jun/2026; The Block [S3]" | The source is Crypto Briefing, 2026-08-30, and it counts wallets, not people. $214B conflicts with DefiLlama's $386B of curve plus PumpSwap volume | SECONDARY, [Crypto Briefing](https://cryptobriefing.com/pumpfun-app-50m-daily-volume/) |
| `knowledge-base/market/dois-tokens-e-ico-privado.md` §5.3 | 162.72B burned; $0.004684 (28 Aug 2026); +17% against the ICO | 170.32B burned and $477.28M bought back (6 Oct); $0.00621, +55% against the ICO (7 Oct) | FACT, [pump.fun](https://pump.fun/pump-token), [CoinGecko](https://www.coingecko.com/en/coins/pump-fun) |
| `modelos-de-token.md`, BP Part 3 §3.1 | The pump.fun fee schedule | Still correct. Add: Holder Rewards can now be switched on through a community takeover; cashback is deprecated | FACT, [pump-public-docs](https://github.com/pump-fun/pump-public-docs/blob/main/docs/HOLDER_REWARDS_README.md) |
| BP Part 3 §3.1 | Graduation 0.26% (Jun 2026) | Agrees. The company's own mid-2026 figure for ordinary coins is 0.82% | FACT, [pump.fun](https://pump.fun/pump-token) |
| Repo monthly active wallets | 5.2M (May 2025), 1.8M (Dec 2025) | Unverified | Gap |
| `knowledge-base/market/market-research.md` | Polymarket valued at US$15B | $21B post-money, 2026-08-31 | SECONDARY, [Bloomberg](https://www.bloomberg.com/news/articles/2026-08-31/polymarket-funding-round-led-by-1789-values-firm-at-21-billion) |
| `market-research.md` | Kalshi US$22B (May 2026) | Still the last closed round; talks at $40B not confirmed closed | SECONDARY, [The Block](https://www.theblock.co/post/406061/kalshi-40-billion-valuation) |
| `market-research.md` | Polymarket peak "US$ 10,5 bi (mar/2026); 8,9 bi (mai)" (Sacra) | On a dollars-paid basis: March $4.79B International + $0.30B US. The two use different measures | FACT, [DefiLlama](https://api.llama.fi/summary/dexs/polymarket-international) |
| `market-research.md` | Kalshi + Polymarket 2025 "> US$ 44 bi" | PYMNTS / The Information say $51B. Kalshi's 2025 figure appears as $23.8B, $22.9B and $17.1B | SECONDARY, [PYMNTS](https://www.pymnts.com/news/investment-tracker/2026/polymarket-targets-15-billion-valuation-in-new-funding-round/) |
| `market-research.md` and the pitch | Solana "US$ 28,6 mi" | Stale. Jupiter Prediction now $5.3M a month, World $15.4M, all Solana-tagged venues ~$53M over 30 days | FACT, DefiLlama |
| `knowledge-base/market/regulacao.md` | "ao menos 11 estados" | About 20 states (headline). Since then: the Sixth Circuit loss, New York's suits against Kalshi and Polymarket US, CFTC suits against five states | SECONDARY, [Prediction News](https://predictionnews.com/story/about-20-states-still-challenging-sports-event-contracts-from-kalshi-polymarket) |
| `regulacao.md` | NPRM "publicada em 10/06/2026" | Issued 10 June, published in the Federal Register on 12 June | SECONDARY, [Federal Register](https://www.federalregister.gov/documents/2026/06/12/2026-11854/prediction-markets-public-interest-determinations) |
| `regulacao.md` | MP 1.394 "tramitação não conferida" | Committee installed; 48 amendments; deadline 2026-11-23; no rapporteur; STF request pending | FACT, [Congresso Nacional](https://www.congressonacional.leg.br/materias/medidas-provisorias/-/mpv/175871) |
| `knowledge-base/market/receita-mercados-de-previsao.md` | Polymarket coefficients: sports 0.05; US taker 0.0695 | Sacra gives sports 0.03 from 30 March, and a uniform US 0.05 from 3 April. Re-check by hand | SECONDARY, [Sacra](https://sacra.com/c/polymarket/) |
| Pitch | "$21.7B in the last 30 days" | Correct as dollars paid, 4 Sep to 3 Oct. Latest: $22.6B paid, $85.7B face value. Name the measure | SECONDARY, [DefiRate](https://defirate.com/prediction-markets/volume/) |
| Pitch | "Polymarket went from 1.9 to 4.6 billion a month in ten months" | Consistent, but it compares the international venue alone with international + US | FACT, [DefiLlama](https://api.llama.fi/summary/dexs/polymarket-us) |
| Pitch; BP Part 2 §2.5 | "Crypto is about a fifth of the volume" | That is Polymarket only, May 2026. The sector figure is 13.7% of notional (Pew, July 2026) | SECONDARY, [Pew](https://www.pewresearch.org/short-reads/2026/09/23/prediction-markets-trading-volume-doubled-between-may-and-july-largely-driven-by-sports/) |
| `services/landing/pitch2-notes.md` | Crypto "cerca de um quinto disso [21,7 bi], quase 1 bilhão por mês" | Internally inconsistent: a fifth of $21.7B is about $4.3B. "~$1B" matches Polymarket's own crypto category | INFERENCE |
| Mock panel B-19 | "Você não pode ter token pro hackathon" | Not in the rules, which are silent on tokens | FACT, [Official Rules](https://colosseum.com/legal/Crypto%20World's%20Fair%20Hackathon%20Rules.pdf) |
| Competitor notes (`mercados-de-previsao-web3.md`, `top-5-competitor-analysis.md`) | Statuses as of 2026-10-03/04 | Melee is still devnet and its creator resolves (now primary evidence); its "$337.7M" is devnet play money. PNP pivoted. Drift BET appears discontinued. Limitless launched creator markets. Hxro is dormant. Myriad moved to BNB. New: XO, Xmarket, PumpMarket, Pumpcade, TBD, Worm, Opinion, Trueo, Seer | FACT and SECONDARY, note 04 §2 |
| Product Brief R-01 against `/pitch2` | 10% of the losing side against 3.5% of the pot | Conflict open (D1); the break-even moves from $208,630 to about $221k | FACT, repo `CHANGELOG.md` |
| Note 05 (from wave-2 E4) | Entries close at 80%; 30-day maximum | Superseded by R-06 (90 days) and R-07 (close when 5% remains) | FACT, repo `PRODUCT-BRIEF.md` |

## Gaps and open questions

The web-search budget ran out partway through every one of the seven research passes. The researchers then closed
threads by fetching URLs already found, querying public data APIs (DefiLlama, CoinGecko, CourtListener, Solana RPC) and
reading the Colosseum Copilot corpus, so several items rest on a single source, a press release or search-result text.
`docs.polymarket.com`, `help.kalshi.com` and `kalshi.com` failed DNS for the whole session, which is why their policies
come from snippets and CFTC filings, and `legislation.gov.uk` returned empty pages, so the UK Gambling Act's sections on
pool betting (s.12) and betting intermediaries (s.13) were not verified. The court opinion, by contrast, was read in full.

On pump.fun, the notes did not find revenue for January and February 2024, how the platform acquired its first users,
headcount or acquisition prices, or any reconciliation of the $1.32B raised with the roughly $0.6B of non-PUMP assets
visible on-chain. Nor did they find whether Baton moved to compel arbitration or what was filed after 2026-08-31, why the
app was pulled in India, whether DefiLlama counts Custom Pairs correctly, or whether any protocol-level defence against
sniping exists. On the sector, they could not confirm whether Kalshi's $40B round closed, the status of the POLY token
or a $78.2B September notional figure; DefiRate's category split still needs a check by hand; and they found no 2026
CFTC action against an unregistered, offshore or decentralized venue, no EU or MiCA treatment of on-chain event
contracts, no primary text of CMN 5.298 or SPA Nota Técnica 2958, and no US state law on pool contests outside licensed
racing.

Among competitors, Melee's mainnet date and creator percentage, Xmarket's status, HIP-4's permissionless mainnet,
PumpMarket's on-chain program, Pumpcade's mainnet and who creates World's markets all remain unverified. On templates,
publisher counts per Pyth feed, the key input for per-feed caps, were not found, and no cost-to-move figure exists for
any Pyth feed. Whether `rec2HH...` accepts every feed in the Hermes listing, or TWAP posts, is unverified; devnet
availability of the stake-pool, DAMM v2 and Raydium programs (needed to demo B6, B7, B9 and B12) was not checked; the
Kamino, marginfi, Drift, Marinade and Jito tip layouts were not read; and the readiness of the Sprint 03 touch logic by
the deadline cannot be confirmed. On UX, no latency was measured for small-model structured-output calls, no causal data
shows which creator share drives promotion, the novelty of the "would resolve now" preview was not exhaustively tested,
and X card policy, Telegram mini apps and blink rendering in mobile wallets were not verified. On the hackathon, the
judges' names were not found, whether reviewers check on-chain transactions is unknown, the Superteam Brazil listing
itself is unverified, the accelerator's length conflicts (8 against 12 weeks), and whether a devnet pot with real-money
mechanics, entered from Brazil, raises a §4(c) or §13 question depends on the pending legal review.

The largest open question is how a US court, a US state or Brazil's regulator would classify Brot's pots. Footnote 6
reserves it, no ruling on point was found, and it needs specialist counsel.

## Conclusion

The research changes the shape of the idea more than it confirms or rejects it. pump.fun's lasting contribution was a
set of zeros, zero cost, zero code, zero liquidity provider and zero wait, and Brot can add the one zero pump.fun never
had: zero judgement about what can be created. If the creation box, the resolver and the pot cap are one piece of code, a
question that passes creation cannot become unresolvable, and the most anyone can win by forcing it is bounded by
construction. That also offers a way to keep the panel's promise while opening creation, because curation moves from the
list of markets to the registry of accounts a market may read. "The team lists every account; anyone composes the
market" answers B-14, honours the founder's first answer and stays within K-02.

Two things the original framing missed now look decisive. The fee decision D1 has stopped being an accounting choice:
with public creation, "10% of the losing side" pays creators for divided questions and never leaves a winner below their
stake, while "3.5% of each pot" pays creators the same for obvious questions and can make the right side lose money. And
the legal analogy runs backwards, since the reasoning that saved pump.fun names the pot as the open case. The right
hackathon story is therefore not "we will be as big as pump.fun" but "we built the creation box pump.fun never had, for a
contract type that needs it more", demonstrated by one market the chain settles by itself, with the submission stating
plainly what was built before the hackathon and who built it.

## Sources

The seven research notes behind this report are in `knowledge-base/market/pumpfun-model-notes/` (01 to 07, all dated
2026-10-07). Below, grouped by topic, are the external sources cited; the notes hold the full set.

**pump.fun: company, docs and filings**
- pump.fun FAQ — https://pump.fun/docs/faq (FACT, accessed 2026-10-07)
- pump.fun fees, updated 2026-05-20 — https://pump.fun/docs/fees (FACT)
- pump.fun PUMP token page and CEO newsletters — https://pump.fun/pump-token (FACT, read 2026-10-07)
- pump.fun Terms, updated 2026-09-25 — https://pump.fun/docs/terms-and-conditions (FACT)
- pump.fun livestream moderation policy — https://pump.fun/docs/livestream-moderation-policy (FACT)
- pump-public-docs: fee program README — https://github.com/pump-fun/pump-public-docs/blob/main/docs/FEE_PROGRAM_README.md ; PumpSwap — https://github.com/pump-fun/pump-public-docs/blob/main/docs/PUMP_SWAP_README.md ; Holder Rewards — https://github.com/pump-fun/pump-public-docs/blob/main/docs/HOLDER_REWARDS_README.md ; Cashback — https://github.com/pump-fun/pump-public-docs/blob/main/docs/PUMP_CASHBACK_README.md ; commits — https://github.com/pump-fun/pump-public-docs/commits/main (FACT)
- Blockworks token-transparency filing, PUMP (filed 2026-09-21, updated 2026-10-06) — https://blockworks.com/token-transparency/filing/pump (FACT)

**pump.fun: data**
- DefiLlama API: revenue — https://api.llama.fi/summary/fees/pump?dataType=dailyRevenue ; holders revenue — https://api.llama.fi/summary/fees/pump?dataType=dailyHoldersRevenue ; curve volume — https://api.llama.fi/summary/dexs/pump.fun?dataType=dailyVolume ; PumpSwap volume — https://api.llama.fi/summary/dexs/pumpswap?dataType=dailyVolume ; Solana DEX overview — https://api.llama.fi/overview/dexs/solana ; Hyperliquid — https://api.llama.fi/summary/fees/hyperliquid?dataType=dailyRevenue ; protocol page — https://defillama.com/protocol/pump ; StonkFun — https://defillama.com/protocol/stonkfun (FACT, queried 2026-10-07)
- DefiLlama fee adapter — https://github.com/DefiLlama/dimension-adapters/blob/master/fees/pumpdotfun.ts (FACT)
- CoinGecko, PUMP — https://www.coingecko.com/en/coins/pump-fun ; markets API — https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=hyperliquid,jupiter-exchange-solana,raydium,pump-fun (FACT, 2026-10-07)
- Solidus Labs, 2025 Rug Pull Report — https://www.soliduslabs.com/reports/solana-rug-pulls-pump-dumps-crypto-compliance (FACT via fetch summary, May 2025)
- Marino et al., arXiv 2602.14860 (2026-02-16) — https://arxiv.org/html/2602.14860v1 (SECONDARY, preprint)

**pump.fun: press and analysts (SECONDARY)**
- The Block: 2024-08-09 — https://www.theblock.co/post/310376/pump-fun-cuts-fees-and-unveils-80-incentive ; post-mortem 2024-05-16 — https://www.theblock.co/post/295029/pump-fun-post-mortem ; 2025-04-04 — https://www.theblock.co/post/349647/memecoin-launchpad-pump-fun-reopens-livestreaming-to-5-of-users-with-stricter-moderation-rules ; 2026-06-16 — https://www.theblock.co/post/404806/pump-fun-activity-craters-80-three-months-solana-fees-lower-traders-rotate-perps ; Pumpcade 2026-04-02 — https://www.theblock.co/news/deals/2026-04-02-pump-fun-pre-seed-funding-round-livestream-prediction-markets-pumpcade-396213 ; via TradingView, Aug 2025 — https://ru.tradingview.com/news/the_block%3Ae1b5c5f60094b%3A0-solana-memecoin-launchpad-war-flips-again-as-pump-takes-top-spot-amid-letsbonk-collapse/
- CoinDesk, 2026-04-29 — https://www.coindesk.com/markets/2026/04/29/pump-fun-burns-36-of-pump-supply-in-usd370-million-wipe-locks-50-revenue-into-ongoing-buybacks
- Decrypt: 2025-09-03 — https://decrypt.co/337872/pump-funs-new-fee-model-hands-out-2m-to-creators-in-first-24-hours ; livestreams — https://decrypt.co/293495/pump-fun-drops-livestreaming-controversy ; UK — https://decrypt.co/295355/solana-pump-fun-bans-uk-users-regulator ; sentence — https://decrypt.co/352876/former-pump-fun-dev-sentenced-six-years-prison-2-million-solana-fraud ; streaming — https://decrypt.co/352919/creator-capital-markets-pump-fun-streaming-twitch
- Cointelegraph, 2026-03-25 — https://cointelegraph.com/news/pump-fun-creator-fee-cap-update-memecoin-model
- Yahoo Finance, 2026-01-10 — https://finance.yahoo.com/news/pump-fun-admits-creator-fees-160120983.html
- Crypto Briefing: 2026-08-30 — https://cryptobriefing.com/pumpfun-app-50m-daily-volume/ ; treasury 2026-10-06 — https://cryptobriefing.com/pump-fun-on-chain-treasury-pump-token/ ; LetsBonk — https://cryptobriefing.com/pump-token-incentives-trading-rewards/
- Tokenomist — https://tokenomist.ai/research/will-pump-fun-reclaim-the-throne
- Stepdata, 2025-08-08 — https://stepdata.substack.com/p/solana-trading-bot-axiom-becomes
- Lightspeed via Solana Compass, 2025-05-17 — https://solanacompass.com/learn/Lightspeed/what-weve-learned-from-pumpfuns-sniping-problem
- The Defiant, GO — https://thedefiant.io/news/nfts-and-web3/pump-fun-launches-go-bounty-platform-backlash-extreme-listings
- Protos: Apple, 2026-09-11 — https://protos.com/one-day-after-launching-stock-pairs-apple-delists-pump-fun-app/ ; ruling coverage, 2026-09-01 — https://protos.com/solana-labs-dropped-from-burwick-laws-pump-fun-lawsuit/
- KuCoin summary of a Blockworks analyst — https://www.kucoin.com/news/flash/blockworks-analyst-pump-may-be-undervalued-short-term-long-term-uncertainty-remains
- Phemex, Pumpcade seed — https://phemex.com/news/article/pumpcade-secures-5m-seed-funding-led-by-jump-crypto-73862 ; Bitget, Pumpcade (weak) — https://www.bitget.com/news/detail/12560605367582
- GlobeNewswire, PumpMarket press release — https://www.globenewswire.com/news-release/2026/02/26/3245639/0/en/pumpmarket-brings-prediction-markets-to-pump-fun-public-hackathon.html
- Pumpcade docs — https://docs.cade.market/mechanics/parimutuel-markets (FACT)

**Court, statutes and regulators**
- *Aguilar v. Baton Corp.*, Dkt. 184, Opinion and Order, 2026-08-31 — https://www.courtlistener.com/docket/69593359/184/aguilar-v-baton-corporation-ltd-dba-pumpfun/ (FACT, read in full)
- 7 U.S.C. §1a — https://www.law.cornell.edu/uscode/text/7/1a ; §2 — https://www.law.cornell.edu/uscode/text/7/2 ; §7a-2 — https://www.law.cornell.edu/uscode/text/7/7a-2 (FACT)
- CFTC release 8478-22 (Polymarket, 2022) — https://www.cftc.gov/PressRoom/PressReleases/8478-22 ; release 9206-26 — https://www.cftc.gov/PressRoom/PressReleases/9206-26 (FACT)
- Federal Register NPRM, 2026-06-12 — https://www.federalregister.gov/documents/2026/06/12/2026-11854/prediction-markets-public-interest-determinations
- SEC press release 2023-13 (Mango Markets) — https://www.sec.gov/news/press-release/2023-13 (FACT)
- Al Jazeera, Sixth Circuit — https://www.aljazeera.com/news/2026/9/25/us-court-rules-against-kalshi-says-states-can-regulate-prediction-markets ; Fox 5 NY — https://www.fox5ny.com/news/new-york-sues-polymarket-illegal-gambling-lawsuit ; Prediction News — https://predictionnews.com/story/about-20-states-still-challenging-sports-event-contracts-from-kalshi-polymarket (SECONDARY)
- Planalto: MP 1.394 — https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2026/mpv/mpv1394.htm ; Lei 13.756 — https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13756.htm ; Lei 14.790 — https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2023/lei/l14790.htm ; DL 3.688 — https://www.planalto.gov.br/ccivil_03/decreto-lei/del3688.htm (FACT)
- Congresso Nacional, MPV 1394/2026 — https://www.congressonacional.leg.br/materias/medidas-provisorias/-/mpv/175871 (FACT); Migalhas — https://www.migalhas.com.br/quentes/465423/entidades-pedem-ao-stf-suspensao-da-mp-que-proibe-bets (SECONDARY)
- CoinDesk on the FCA, 2026-09-07 — https://www.coindesk.com/policy/2026/09/07/uk-regulator-weighs-easing-financial-prediction-market-ban-times ; CCN — https://www.ccn.com/news/crypto/polymarket-kalshi-uk-fca-prediction-markets-push-back-gambling/ (SECONDARY)
- ANJ — https://anj.fr/promotion-illegal-gambling-services-blocking-polymarket-website (FACT via repo)
- Solana Mobile publisher policy, 2026-07-21 — https://legal.solanamobile.com/publisher-policy-web (FACT)

**Sector data and the leaders**
- DefiRate volume — https://defirate.com/prediction-markets/volume/ (SECONDARY)
- Pew Research, 2026-09-23 — https://www.pewresearch.org/short-reads/2026/09/23/prediction-markets-trading-volume-doubled-between-may-and-july-largely-driven-by-sports/ (SECONDARY)
- DefiLlama: Kalshi — https://api.llama.fi/summary/dexs/kalshi ; Polymarket Intl — https://api.llama.fi/summary/dexs/polymarket-international ; Polymarket US — https://api.llama.fi/summary/dexs/polymarket-us ; fees — https://api.llama.fi/overview/fees ; dexs — https://api.llama.fi/overview/dexs ; World — https://api.llama.fi/summary/dexs/world ; TurboFlow — https://api.llama.fi/summary/dexs/turboflow-prediction-markets ; Jupiter Prediction — https://api.llama.fi/summary/dexs/jupiter-prediction ; DFlow — https://api.llama.fi/summary/dexs/dflow (FACT)
- Sacra: Kalshi — https://sacra.com/c/kalshi/ ; Polymarket — https://sacra.com/c/polymarket/ (SECONDARY)
- Bloomberg, 2026-08-31 — https://www.bloomberg.com/news/articles/2026-08-31/polymarket-funding-round-led-by-1789-values-firm-at-21-billion ; CoinDesk, 2026-08-13 — https://www.coindesk.com/business/2026/08/13/kalshi-in-talks-with-sequoia-wellington-for-usd750-million-fund-raise-at-usd40-billion-valuation ; The Block, 2026-06-24 — https://www.theblock.co/post/406061/kalshi-40-billion-valuation ; PYMNTS — https://www.pymnts.com/news/investment-tracker/2026/polymarket-targets-15-billion-valuation-in-new-funding-round/ (SECONDARY)
- Polymarket docs (snippet) — https://docs.polymarket.com/polymarket-learn/markets/how-are-markets-created ; Kalshi Help Center (snippet) — https://help.kalshi.com/markets/markets-101/suggesting-a-new-market ; It's Not Gambling — https://itsnotgambling.substack.com/p/the-right-to-ask-a-question (SECONDARY)
- The Defiant, Zelenskyy market — https://thedefiant.io/news/nfts-and-web3/polymarket-controversy-heats-up-after-the-zelenskyy-suit-market-resolves ; The Block, UMA MOOV2 — https://www.theblock.co/post/366507/polymarket-uma-oracle-update (SECONDARY)
- Step Data, Solana $28.6M — https://stepdata.substack.com/p/prediction-markets-on-solana-286m ; Solana Compass on CoinShares — https://solanacompass.com/news/prediction-market-monthly-volume-surged-to-437b-by-june-as-solana-earns-14mmonth (SECONDARY)
- Entrant rounds: The Defiant (Opinion) — https://thedefiant.io/news/defi/top-bnb-chain-prediction-market-opinion-raises-usd20-million ; Binance Research (Opinion) — https://www.binance.com/research/projects/opinion ; Diia (Limitless) — https://dia.dp.gov.ua/en/ukrainian-created-platform-limitless-raises-10m/ ; Phemex (Melee) — https://phemex.com/news/article/melee-secures-35-million-to-launch-viral-prediction-market-platform-21008 ; The Block (TBD) — https://www.theblock.co/post/391253/solana-based-tbd-a-prediction-market-protocol-for-verified-human-opinion-raises-3-million ; CoinDesk (XO) — https://www.coindesk.com/business/2026/04/30/xo-market-bets-on-user-generated-prediction-markets-to-rival-polymarket-and-kalshi (SECONDARY)

**Open-creation competitors**
- Blockworks Research on XO — https://blockworks-research.beehiiv.com/p/pump-fun-of-prediction-markets ; Xmarket press release — https://news.bitcoin.com/xmarket-launches-beta-on-bnb-chain-mainnet-the-first-prediction-market-that-pays-creators-and-early-believers/ (SECONDARY)
- Colosseum project records: Melee — https://colosseum.com/projects/explore/melee-markets ; Dum.fun — https://colosseum.com/projects/explore/dum.fun ; Bubblegum — https://colosseum.com/projects/explore/bubblegum ; Tapebound — https://colosseum.com/projects/explore/tapebound ; Survive.fun — https://colosseum.com/projects/explore/survive.fun-the-first-on-chain-memecoin-survival-market. ; RugRoulette — https://colosseum.com/projects/explore/rugroulette (FACT, Copilot)
- Melee Terms of Use — https://melee.markets/docs/melee-terms-of-use.pdf (FACT); ChainCatcher — https://www.chaincatcher.com/en/article/2208752 ; IQ.wiki — https://iq.wiki/wiki/melee.md (SECONDARY)
- PNP docs: creating markets — https://docs.pnp.exchange/platform/creating-markets.md ; fees — https://docs.pnp.exchange/platform/fees-and-rewards.md ; oracle — https://docs.pnp.exchange/platform/oracle-settlement.md ; coin markets — https://docs.pnp.exchange/market-types/coin.md ; parimutuel — https://docs.pnp.exchange/models/parimutuel-p2p.md ; site — https://www.pnp.exchange (FACT)
- Limitless docs — https://docs.limitless.exchange/user-guide/user-generated-markets.md ; resolution — https://docs.limitless.exchange/user-guide/market-resolution.md (FACT); The Black Swans — https://theblackswans.substack.com/p/limitless-the-prediction-market-that (SECONDARY)
- The Block, HIP-4 — https://theblock.co/post/408875/hyperliquid-hip-4-permissionless-deployment ; BlockEden — https://blockeden.xyz/blog/2026/05/13/hyperliquid-hip4-prediction-market-deep-dive/ (SECONDARY)
- Augur v1 glossary — https://raw.githubusercontent.com/AugurProject/v1-docs/master/source/includes/_glossary.md (FACT); MIT Technology Review, 2018-07-26 — https://www.technologyreview.com/2018/07/26/2449/the-latest-blockchain-use-case-anonymously-betting-on-public-figure-death-pools/ ; The Block, 2019-06-05 — https://www.theblock.co/post/26075/augur-is-making-a-big-push-to-take-down-bad-actors-on-its-platform (SECONDARY)
- Zeitgeist rules — https://docs.zeitgeist.pm/docs/learn/market-rules ; Seer — https://seer-3.gitbook.io/seer-documentation/getting-started/navigate-our-site/verify-market.md (FACT)
- Fortune on the Columbia study — https://fortune.com/2025/11/07/polymarket-wash-trading-inflated-prediction-markets-columbia-research/ ; DeFi Rate on Opinion — https://defirate.com/news/opinion-hits-8b-in-monthly-prediction-market-volume-but-the-data-raises-questions/ ; KuCoin on Trueo — https://www.kucoin.com/news/flash/trueo-migrates-to-ethereum-mainnet-after-vitalik-buterin-s-endorsement-token-surges-10x ; DeFi Rate on Polymarket's API — https://defirate.com/news/polymarket-launches-public-api-unlocks-permissionless-liquidity/ (SECONDARY)
- Polymarket event pages via aggregators — https://polymarket.com/event/pumpfun-market-cap-fdv-above-one-day-after-launch (SECONDARY)

**Templates and oracles**
- Hermes price_feeds — https://hermes.pyth.network/v2/price_feeds ; Pyth push feeds, Solana — https://docs.pyth.network/price-feeds/core/push-feeds/solana ; Pyth Core guide — https://docs.pyth.network/llms-price-feeds-core.txt ; best practices — https://docs.pyth.network/price-feeds/core/best-practices ; market hours — https://docs.pyth.network/price-feeds/market-hours (FACT)
- Switchboard prediction-market tutorial — https://docs.switchboard.xyz/docs-by-chain/solana-svm/prediction-market/prediction-market-tutorial ; task types — https://docs.switchboard.xyz/custom-feeds/task-types (FACT)
- SIMD-0215 — https://github.com/solana-foundation/solana-improvement-documents/blob/main/proposals/0215-accounts-lattice-hash.md ; solana-sdk rent — https://github.com/anza-xyz/solana-sdk/blob/master/rent/src/lib.rs ; Anza sysvars — https://docs.anza.xyz/runtime/sysvars (FACT)
- SPL governance source — https://github.com/solana-labs/solana-program-library/blob/master/governance/program/src/processor/process_cast_vote.rs ; Squads close — https://github.com/Squads-Protocol/v4/blob/main/programs/squads_multisig_program/src/instructions/transaction_accounts_close.rs (FACT, source only)
- Wormhole Queries — https://wormhole.com/docs/products/queries/overview/ (FACT)

**Guided creation and UX**
- CFTC filing, KalshiEX, 2024-03-15 — https://www.cftc.gov/filings/ptc/ptc03152412807.pdf (FACT)
- Augur templates.ts — https://github.com/AugurProject/augur/blob/master/packages/augur-templates/src/templates.ts (FACT)
- Manifold policies — https://github.com/manifoldmarkets/manifold/blob/main/web/pages/community-guidelines/market-policies.tsx ; Metaculus question-writing — https://github.com/Metaculus/metaculus/blob/main/front_end/src/app/(main)/question-writing/page.tsx (FACT)
- Stripe Radar rules — https://docs.stripe.com/radar/rules/reference ; LukeW, 2010-02-25 — https://www.lukew.com/ff/entry.asp?1007 ; Adrian Roselli, 2021-08-16 — https://adrianroselli.com/2021/08/sentence-forms-not-mad-libs.html ; Baymard, 2022-08-02 — https://baymard.com/blog/autocomplete-design (FACT)
- Claude structured outputs — https://platform.claude.com/docs/en/build-with-claude/structured-outputs ; JSONSchemaBench — https://arxiv.org/abs/2501.10868 ; "Let Me Speak Freely?" — https://arxiv.org/abs/2408.02442 (FACT)
- Solana Actions — https://solana.com/docs/tools/actions ; Dialect registry — https://docs.dialect.to/blinks/blinks-provider/blink-registry.md (FACT); Madeonsol, 2026-03-11 — https://madeonsol.com/blog/solana-blinks-actions-explained (SECONDARY)

**Hackathon**
- Crypto World's Fair Official Rules — https://colosseum.com/legal/Crypto%20World's%20Fair%20Hackathon%20Rules.pdf ; event page — https://colosseum.com/worldsfair ; FAQ — https://colosseum.com/hackathon#h-faq-4 , https://colosseum.com/hackathon#h-faq-11 , https://colosseum.com/hackathon#h-faq-13 ; accelerator FAQ — https://colosseum.com/accelerator#a-faq-10 (FACT, 2026-10-07)
- Colosseum blog: Perfecting Your Hackathon Submission — https://blog.colosseum.com/perfecting-your-hackathon-submission/ ; Frontier winners — https://blog.colosseum.com/announcing-the-winners-of-the-solana-frontier-hackathon/ ; Breakout winners — https://blog.colosseum.com/announcing-the-winners-of-the-solana-breakout-hackathon/ (FACT)
- Trepa post-mortem (mirror) — https://youmind.com/ar/landing/x-viral-articles/trepa-shutting-down-post-mortem (FACT, mirror); Variant on Melee — https://variant.fund/articles/investing-melee-markets-permissionless-prediction-markets-uncapped-upside/ (FACT)
- Solana Mobile, CLOCK IN — https://solanamobile.com/blog/clock-in-the-solana-mobile-hackathon (FACT); solanabr/wiki PR #3 — https://github.com/solanabr/wiki/pull/3 (SECONDARY)

**Repo files cited** (FACT, repo, read 2026-10-07): `docs/business/BUSINESS-PLAN.md`;
`docs/business/BP-v0.0.2-parte-2-mercado-e-negocio.md` (§1.3, §5.2); `docs/product/PRODUCT-BRIEF.md` (F7, R-01, R-05 to
R-13, R-19, R-23, R-32, §12); `docs/business/ideacao-perguntas-e-respostas.md` (Q9, round 3);
`docs/business/_review/banca-do-pitch-2026-10-06.md` (B-10, B-13, B-14, B-19);
`knowledge-base/pitch/2026-10-06-banca-transcricao.md`; `docs/technical/SYSTEM-ARCHITECTURE-PROPOSAL.md` (K-02, K-13,
D2); `docs/technical/TECHNICAL-PLAN.md`; `docs/business/_review/wave-2-technical-security.md` (E1, E2, E4);
`docs/business/PITCH.md`; `RESOLVERS.md`; `CHANGELOG.md` (2026-10-06 and "Em aberto"); `CLAUDE.md`;
`programs/brot-markets/src/readers/price_touch.rs`; `git log` since 2026-09-14.
