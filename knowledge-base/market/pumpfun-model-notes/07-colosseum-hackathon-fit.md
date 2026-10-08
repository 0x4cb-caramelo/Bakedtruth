# Colosseum hackathon fit for a "pump.fun of on-chain markets" submission

Research notes for Brot Markets, written 2026-10-07. Brot is a pot-based market on Solana, on devnet and unaudited.
Participants take a YES or NO position in USDC, the winning side splits the pot and the house keeps a fee. Results
are read only from on-chain accounts. Labels: **FACT** means a primary source opened on 2026-10-07. **SECONDARY
FACT** means a secondary source, or a primary page that was only partly readable. **INFERENCE** means my own reading.
"Copilot data" means Colosseum Copilot's project corpus (API v2, accessed 2026-10-07). Its counts cover the projects
Copilot has classified, not the market as a whole.

## 1. Which Colosseum hackathon closes on 2026-10-12, and what are its rules (tracks, prizes, accelerator, judging, submission, tokens)?

### Takeaway
The event is the **Crypto World's Fair**, Colosseum's first hackathon open to every chain. It runs from 6:00am PT on
2026-09-14 to **11:59pm PT on 2026-10-12** (06:59 UTC and 03:59 Brasília time on 2026-10-13). Prizes total about
US$840k, paid in Phantom's CASH stablecoin, with a Solana track of 10 x US$10k. Accelerator teams receive a
US$250k pre-seed investment. **The official rules say nothing about tokens.** Nothing in them supports the mock
judge's claim that "you can't have a token for the hackathon".

### Cited Findings
- FACT: The official rules define the Contest Period as "6:00am PT on September 14, 2026" to "11:59pm PT on October 12, 2026". Winners are to be announced "by December 5, 2026" (§5, §13). — [Crypto World's Fair Official Rules (PDF)](https://colosseum.com/legal/Crypto%20World's%20Fair%20Hackathon%20Rules.pdf), accessed 2026-10-07
- FACT: Copilot's FAQ registry gives the same event as `crypto-worlds-fair`, with start `2026-09-14T15:00Z`, submission deadline `2026-10-13T06:59Z` and winner announcement `null`. — [Colosseum hackathon FAQ](https://colosseum.com/hackathon#h-faq-3), via Copilot `/faqs`, 2026-10-07
- FACT: The rules list these prizes (§14): Grand Champion "$30,000 Phantom CASH stablecoin"; Public Goods Award $5,000; University Award $5,000; "$15,000 CASH ... to each of the next 20 standout teams"; Solana track "$100,000 ... across 10 of the best products that integrate with the Solana blockchain". Tempo, Hyperliquid and Zcash tracks are US$100k each across 10 products. Ethereum L1, Base, Arbitrum and Robinhood Chain tracks are US$25k each across 5 products. Total: US$840k. — [Official Rules](https://colosseum.com/legal/Crypto%20World's%20Fair%20Hackathon%20Rules.pdf)
- FACT: The event page shows the same overall prizes and "$2.5 million" in seed funding. It says accelerator teams get "$250,000 Pre-seed funding", a "12 weeks" programme "at our office in SF", and that winners are "interviewed and considered". — [colosseum.com/worldsfair](https://colosseum.com/worldsfair), accessed 2026-10-07
- SECONDARY FACT: Crypto Briefing (2026-09-14) reports US$840k in prizes and US$2.5M in funding, with a Solana project going "head-to-head with an Ethereum project on the merits of the product". — [Crypto Briefing](https://cryptobriefing.com/colosseum-crypto-worlds-fair-hackathon/)
- FACT: Colosseum's announcement says the accelerator and fund "continue focusing on investing in Solana founders". — [Expanding the Arena, Colosseum blog, 2026-09-03](https://blog.colosseum.com/expanding-the-arena/)
- FACT: The accelerator FAQ says "Some form of Solana integration is required". Colosseum invests "$250,000 ... through our standard deal—either a SAFE plus token warrant, or the Colosseum STAMP for projects tokenizing through MetaDAO". Winners are "guaranteed an interview ... but not admission", and roughly 0.7% of applicants were accepted (20 teams from more than 3,000 submissions in 2026). — [Colosseum Accelerator FAQ](https://colosseum.com/accelerator#a-faq-10), via Copilot `/faqs`, 2026-10-07
- FACT: Two official texts give two different sets of judging criteria. The rules (§8) list "Functionality ... quality of the code", "Potential Impact" (TAM and effect on the crypto ecosystem), "Novelty", "UX" ("How well does this Project Submission utilize blockchain to create great UX"), "Open-source" (also "How well does the Project Submission compose with other primitives") and "Business Plan". The hackathon FAQ lists Founder + Market Fit, Insight, Product + Execution (including "How quickly is the team shipping product updates"), Potential Market Size, Founder Communication, Viability and Traction. It adds that a Colosseum shortlist goes to the judges, followed by a 15-minute Zoom interview for a smaller group. — [Official Rules](https://colosseum.com/legal/Crypto%20World's%20Fair%20Hackathon%20Rules.pdf); [Hackathon FAQ "How will submissions be judged?"](https://colosseum.com/hackathon#h-faq-12)
- FACT: The submission portal asks for: name and description; chains and tools used; every teammate "with context on their backgrounds"; location; a logo; a GitHub repository (it may be private if access is granted to hackathon@colosseum.com); "A two-to-three-minute presentation video", which is "one of the first resources judges review"; "A product-demo video of no more than three minutes"; and go-to-market, demand validation and distribution plans. — [Hackathon FAQ h-faq-11](https://colosseum.com/hackathon#h-faq-11)
- FACT: Teams may start before the hackathon, "but products are judged only on the work completed between the competition's start and end dates", and they "must disclose all relevant past development work". Misrepresentation can lead to disqualification, a ban or loss of the prize. In the repo, judges look for whether the team "Did significant work during the hackathon" and "Were the ones to do this work, rather than a third party". — [Hackathon FAQ h-faq-4](https://colosseum.com/hackathon#h-faq-4), [h-faq-13](https://colosseum.com/hackathon#h-faq-13)
- FACT: Solo founders may submit (h-faq-7). Each builder can make only one submission and join only one team (h-faq-15; rules §7). Weekly one-minute update videos are "strongly recommend[ed]" but not required (h-faq-14). — [Hackathon FAQ](https://colosseum.com/hackathon#h-faq-7)
- FACT: The official rules have **no clause on tokens, token launches, mainnet or devnet**. I read all eight pages. Clauses that do matter: all content must be in English (§12(a)); entrants warrant that taking part and accepting a prize "will not violate any law ... in Entrant's country" (§4(c)); winning depends on "passing of the due diligence requirements" (§13); and "If Entrants are sponsored by any third parties ... such sponsors must be approved in advance and in writing" (§17). Brazil is not on the excluded-country list (§3(b)). — [Official Rules](https://colosseum.com/legal/Crypto%20World's%20Fair%20Hackathon%20Rules.pdf)
- FACT: The event page fetched on 2026-10-07 also states no token policy and no devnet or mainnet requirement. — [colosseum.com/hackathon](https://colosseum.com/hackathon)
- FACT: Colosseum's own guidance says the pitch video is a "brief startup pitch, not a product demo". The technical demo should be "technical, direct, and specific to implementation". Mistakes it lists: running over time, "Over-relying on buzzwords", "Failing to explain Solana integration clearly", and forgetting to give judges access to links. Solo builders should "explain their relevant experience and why they're uniquely suited". — [Perfecting Your Hackathon Submission, Colosseum blog, 2025-05-08](https://blog.colosseum.com/perfecting-your-hackathon-submission/)

### Inferences
- INFERENCE: B-19 ("you can't have a token for the hackathon") is not a rule. Colosseum's own deal (SAFE plus token warrant, or STAMP via MetaDAO) assumes tokens can exist. Frontier also had a three-token project among its winners and in Cohort 5 (Fraudsworth, section 2). The rules give a pump.fun brand token no criterion to score on, though. The rules' "law in your country" and due-diligence clauses (§4(c), §13) also raise its cost, given Brazil's MP 1.394 (see `PITCH.md` §9). Leaving the token out of the submission costs no points and removes a question.
- INFERENCE: The two official lists of criteria share a core: something that works, novelty, market size, a business plan, a founder who communicates, and evidence of shipping. The rules alone add "Open-source" and "compose with other primitives". The Pyth reader is a composability story that answers that criterion directly.
- INFERENCE: The repo's first commit is dated 2026-10-01, after the start date. It imports `0xcf07/pred-provable@390d882`, code from an earlier, frozen program. That counts as "relevant past development work", and the submission must disclose it under h-faq-4. Since 2026-09-14 the git log shows commits from four author identities. The plan says the team "presents as one person" (`PITCH.md` §10). If the person presenting is not the author of most of the code, h-faq-13 ("rather than a third party") and the portal's "All teammates" field are a real risk. Listing every partner who committed code is the safe reading.
- INFERENCE: The repo can stay private if access is granted to the review address, but the rules score "Open-source". The Pyth reader and the pot program are worth publishing.

### Gaps
- Not found: the names of the Crypto World's Fair judges and of the Solana track's partner. The event page does not list them in static HTML.
- Not found: a date for when the accelerator batch from this event starts. Cohort 5's announcement describes an "8-week" programme ([Colosseum blog, 2026-06-29](https://blog.colosseum.com/announcing-colosseums-accelerator-cohort-5/)), while the FAQ and the event page say twelve weeks. I could not resolve the conflict.
- Not verified: whether Colosseum checks devnet versus mainnet at all. No official text says so.

## 2. How did past Colosseum prediction-market, event-market and launchpad projects fare, and where are they now?

### Takeaway
Prediction markets have won in every Colosseum hackathon: 10 winners whose main category is prediction markets,
across Renaissance, Breakout, Cypherpunk and Frontier. More winners sit in the neighbouring sports and pool category.
The winners had a new **mechanism or format**: Trepa's accuracy-weighted pool, Melee's bonding-curve "viral markets",
Capitola's aggregator, Mentioned's word markets and Senthos's structured products. A generic market did not win.
Outcomes since then are mixed. Melee raised a US$3.5M seed and is in beta. Capitola and Senthos went into the
accelerator. Trepa won 1st in Consumer and joined Cohort 3, then **shut down in August 2026** after failing to
find product-market fit.

### Cited Findings
Winners whose main Copilot category is "prediction-markets" (10 in total, honourable mentions excluded; Copilot data, 2026-10-07):
- FACT: **Trepa** won 1st Place Consumer Apps (US$25k) at Breakout and joined Cohort 3. It is a mobile "sentiment prediction" app where participants stake SOL to predict the final distribution of crowd sentiment. — [Colosseum project page](https://colosseum.com/projects/explore/trepa); [Breakout winners, Colosseum blog, 2025-07-02](https://blog.colosseum.com/announcing-the-winners-of-the-solana-breakout-hackathon/)
- FACT: **Melee Markets** won 2nd Place Consumer Apps (US$20k) at Breakout. The blog calls it a "viral market platform blending speculation with prediction markets". Its pitch was "permissionless" creation with a bonding curve per outcome and a 1% creator fee. Copilot's demo summary says "No live software demonstrated ... no live user interface, smart contract transactions, or working demo was shown". The team had 8 members. — [Colosseum project page](https://colosseum.com/projects/explore/melee-markets); [Breakout winners blog](https://blog.colosseum.com/announcing-the-winners-of-the-solana-breakout-hackathon/)
- FACT: Variant co-led Melee's seed and wrote that permissionless creation solves "the cold start problem that has long constrained the category". — [Variant, 2025-09-24](https://variant.fund/articles/investing-melee-markets-permissionless-prediction-markets-uncapped-upside/)
- SECONDARY FACT: Solana Compass says the round was US$3.5M, led by Variant with DBA, with Anatoly Yakovenko among the angels. It describes a "Parimutuel Market Maker" with creator revenue of "up to 20%" and a beta in mid-2026. Its volume figures are unverified. — [Solana Compass](https://solanacompass.com/projects/melee-markets)
- FACT: Melee's homepage says "Melee Beta Is Live" and "Create a prediction market on anything in under a minute", with access by invite code. It mentions no token. — [melee.markets](https://melee.markets), accessed 2026-10-07
- FACT: **Capitola** won 1st Place Consumer Apps (US$25k) at Cypherpunk and joined Cohort 4 as Capitola Labs. It is a prediction-market meta-aggregator with an off-chain RFQ auction. Its first product is "Vistadex". — [Colosseum project page](https://colosseum.com/projects/explore/capitola); [company page](https://colosseum.com/companies/capitola-labs); [Cypherpunk winners, Colosseum blog, 2025-12-13](https://blog.colosseum.com/announcing-the-winners-of-the-solana-cypherpunk-hackathon/)
- FACT: **Fora** won 3rd Consumer Apps (US$15k) at Cypherpunk with group-chat pooled funds plus a prediction market. **Pythia** won the Cypherpunk University Award (US$10k) with sponsor-created "opportunity markets" using Arcium MPC. — [Fora](https://colosseum.com/projects/explore/fora); [Pythia](https://colosseum.com/projects/explore/pythia)
- FACT: Frontier ran from 2026-04-06 to 2026-05-11, had 2,857 submissions and 25 equal "Winner" awards of US$10k. These were top-25 awards, not track prizes, since Frontier had no tracks. Four of them are prediction markets. **Bench** builds opportunity markets with subjective resolution. **Mentioned** builds markets on words spoken in live media; the blog calls it a "Betting platform on word choices in media". **Senthos** builds structured products on prediction-market outcomes and joined Cohort 5. **Memetic Machines** has an agent-written editorial layer, binary USDC markets and three-day cycles. — [Frontier winners, Colosseum blog, 2026-06-26](https://blog.colosseum.com/announcing-the-winners-of-the-solana-frontier-hackathon/); [Senthos](https://colosseum.com/projects/explore/senthos); [Mentioned](https://colosseum.com/projects/explore/mentioned); [Bench](https://colosseum.com/projects/explore/bench); [Memetic Machines](https://colosseum.com/projects/explore/memetic-machines-war-machine)
- FACT: **Chomp** won 3rd Consumer (US$15k) at Renaissance with a social-consensus quiz. — [Chomp](https://colosseum.com/projects/explore/chomp)

Pools, peer-to-peer markets and neighbouring categories:
- FACT: **Pregame** won 1st Consumer (US$30k) at Radar and joined Cohort 2. It is "a peer-to-peer sports betting platform" (Copilot's words) using Blinks for user-created lines. — [Pregame](https://colosseum.com/projects/explore/pregame)
- FACT: **WeLikeSports** won a Frontier award and joined Cohort 5 with "parimutuel-style" fantasy pools. Cohort 5's list describes it as running pools "without house rake". — [WeLikeSports](https://colosseum.com/projects/explore/welikesports); [Cohort 5, Colosseum blog, 2026-06-29](https://blog.colosseum.com/announcing-colosseums-accelerator-cohort-5/)
- FACT: **Riverboat**, a pari-mutuel protocol on devnet, got only a Breakout Honorable Mention. Its demo was limited to 1-on-1 binary wagers settled by mutual report. The other honourable mentions in prediction markets were TBD (Cypherpunk), Trump.fun (Breakout; AI agents generate markets from posts), Degen Markets (Radar; Blinks) and Poe (Renaissance). — [Riverboat](https://colosseum.com/projects/explore/riverboat); [Trump.fun](https://colosseum.com/projects/explore/trump.fun); [Degen Markets](https://colosseum.com/projects/explore/degen-markets)

Launchpads ("pump.fun for X"):
- FACT: Only 3 winners have "token-launch" as their main category: **Ore** (Renaissance Grand Prize US$50k, Cohort 1), **Chosendotfun** (Breakout 2nd Gaming, US$20k, a gamified launchpad) and **Crafts** (a Frontier award, a "Stakeholder Token Offering" launchpad). — [Ore](https://colosseum.com/projects/explore/ore); [Chosendotfun](https://colosseum.com/projects/explore/chosendotfun); [Crafts](https://colosseum.com/projects/explore/crafts-1)
- FACT: Other winners with a "launch it on a curve" format: **Banger** (Renaissance 1st Consumer, US$30k, Cohort 1; markets on X posts on a bonding curve, created by replying with a trigger phrase), **Vertigo** (Breakout 2nd Infrastructure; an anti-sniping launch DEX) and **Glympse.fun** (Breakout 4th Consumer; creator tokens on a curve). — [Banger](https://colosseum.com/projects/explore/banger); [Vertigo](https://colosseum.com/projects/explore/vertigo); [Glympse.fun](https://colosseum.com/projects/explore/glympse.fun)
- FACT: **Fraudsworth** won a Frontier award and joined Cohort 5. It runs "a three-token ecosystem" on its own AMM. — [Fraudsworth](https://colosseum.com/projects/explore/dr.-fraudsworths'-fantastical-finance-factory)

Where they are now:
- FACT: Trepa's founders announced the closure on 2026-08-10: "We were not able to find product-market fit". The last round was 2026-08-12 and the app went offline on 2026-09-30. Lessons they gave: "Demand for one thing is not demand for another", "Every unit of expansion dilutes the concurrency the mechanism depends on", geographic and onboarding limits, and that reported crypto active-user numbers "are softer than they look". — [Trepa post-mortem (mirror of the founders' post)](https://youmind.com/ar/landing/x-viral-articles/trepa-shutting-down-post-mortem)
- SECONDARY FACT: The Defiant reports that Trepa and Fireplace shut down hours apart, with withdrawals open until September 30, under the headline "as kalshi and polymarket take 93% of volume". The article body I could read did not source the 93% figure. — [The Defiant](https://thedefiant.io/news/defi/two-prediction-markets-shut-down-hours-apart-as-kalshi-and-polymarket-take-93-of-volume)
- FACT: The Colosseum blog posts on winners give no reasons for individual picks. Cohort 5's only stated reason is "technical talent, speed, vision, and competitive drive". — [Frontier winners](https://blog.colosseum.com/announcing-the-winners-of-the-solana-frontier-hackathon/); [Cohort 5](https://blog.colosseum.com/announcing-colosseums-accelerator-cohort-5/)

### Inferences
- INFERENCE: Melee Markets won 2nd Consumer with no working software. That shows the judges paid for a sharp mechanism and a strong team, not for a deployed product. It is also the warning: the closest Colosseum precedent for "pump.fun of markets", with permissionless creation and creator revenue, is now a funded company in public beta with a pool-based market maker. Brot must say in one sentence why it is not Melee: guided creation limited to questions that on-chain data can settle, a reproducible resolution, and payout without a human.
- INFERENCE: Trepa is the precedent most like Brot: a pool mechanism, consumer audience, accelerator-backed and on mainnet. It closed for lack of demand, not because the technology failed. A judge who knows the Trepa story will ask for demand validation. Brot's sponsor-led pots and named partners (BP) are the answer to have ready.
- INFERENCE: WeLikeSports sells "without house rake". Brot's 10% of the losing side (or 3.5% of the pot in the `/pitch2` deck) should be explained next to what it pays for. Mock panel remark B-18 already flagged the 30% sponsorship cut.

### Gaps
- Not found: the status of Capitola's Vistadex (live or not), current traction for Senthos and WeLikeSports, and Pregame's current status. Not checked on their live sites.
- Not found: any judges' remarks on specific prediction-market winners. Colosseum does not publish them, and its FAQ says not every builder gets feedback.
- Not verified: Melee's volume figures on Solana Compass and Trepa's US$420k pre-seed (seen only in a search snippet).

## 3. Is "prediction markets on Solana" crowded in Colosseum submissions, and what would make Brot stand out?

### Takeaway
It is crowded. Copilot classifies **275 projects** as prediction markets (main category) across five hackathons,
**130 of them in Frontier**, which is 4.5% of 2,858 projects and the fifth-largest of 41 categories. Permissionless
creation, AI market creation or resolution, Pyth-resolved price markets and parimutuel pools have **each been tried
several times without placing**. In Frontier the category won 4 of 28 prizes, more than its share of entries,
so the judges reward it when the idea is distinct.

### Cited Findings
- FACT (Copilot data): 275 projects with main category "prediction-markets": Frontier 130, Cypherpunk 78, Breakout 32, Radar 29, Renaissance 6. Of these, 10 are winners (Frontier 4, Cypherpunk 3, Breakout 2, Renaissance 1) and 5 got honourable mentions. Main category only, so overlapping projects are not counted. — Colosseum Copilot `/search/projects`, 2026-10-07
- FACT (Copilot data): Frontier cohort of 2,858 projects and 28 winners. The largest categories were trader tools 197, stablecoin rails 174, agent control plane 144, on-chain security 143 and **prediction markets 130 (4.5%)**. Token launch had 63, sports and wagering 54, casino 22. — Colosseum Copilot `/analyze`, 2026-10-07
- FACT (Copilot data): No Crypto World's Fair submissions are in Copilot's corpus yet; the query returned zero projects. The current field cannot be measured. — Copilot, 2026-10-07
- FACT (Copilot data): Unplaced projects that are launchpads for prediction markets or offer permissionless creation: priddi.market and Caudal (Cypherpunk), Betlify.fun and Splash Markets (Radar), Momimarket (Cypherpunk), Predictory (Breakout), DegenCalls (Frontier). — [priddi.market](https://colosseum.com/projects/explore/priddi.market); [Caudal](https://colosseum.com/projects/explore/caudal); [Betlify.fun](https://colosseum.com/projects/explore/betlify.fun); [Momimarket](https://colosseum.com/projects/explore/momimarket-decentralized-prediction-market-platform)
- FACT (Copilot data): Unplaced projects that pair a memecoin launchpad with a market: Dum.fun, Bubblegum (Frontier), Pumply.Market (Cypherpunk), dehype.fun (Radar). Also Truth.Fun (Frontier), which puts a bonding curve over Kalshi positions via DFlow. — [Dum.fun](https://colosseum.com/projects/explore/dum.fun); [Bubblegum](https://colosseum.com/projects/explore/bubblegum); [Pumply.Market](https://colosseum.com/projects/explore/pumply.market); [Truth.Fun](https://colosseum.com/projects/explore/truth.fun)
- FACT (Copilot data): Unplaced parimutuel or pool designs: depredict and sentient (Cypherpunk), SPOTR Markets and Soleague (Frontier), PredMarkets (Breakout). — [depredict](https://colosseum.com/projects/explore/depredict); [sentient](https://colosseum.com/projects/explore/sentient); [SPOTR](https://colosseum.com/projects/explore/spotr-markets)
- FACT (Copilot data): Unplaced markets resolved by oracle or on-chain data: Sol Predict (Cypherpunk; Pyth for crypto prices, mixed with other resolution), SolCast, Tapebound ("permissionless outcome market protocol" using Pyth feeds) and Basinga (Frontier). — [Sol Predict](https://colosseum.com/projects/explore/sol-predict); [SolCast](https://colosseum.com/projects/explore/solcast); [Tapebound](https://colosseum.com/projects/explore/tapebound)
- FACT (Copilot data): Unplaced projects with AI-driven creation or resolution: CanIBetOn (Breakout), Foresight Protocol (Breakout), #PredictAI and Nameraka Market (Radar). Trump.fun took an honourable mention. Among winners, Memetic Machines uses agents for editorial briefings. — [CanIBetOn](https://colosseum.com/projects/explore/canibeton); [PredictAI](https://colosseum.com/projects/explore/predictai); [Nameraka](https://colosseum.com/projects/explore/nameraka-market)
- SECONDARY FACT: Outside Colosseum, PumpMarket opened a devnet in February 2026 with a "parimutuel pool model" on "whether newly launched tokens will graduate on Pump.fun". It resolves from "real-time on-chain data from Bitquery and Helius". — [Crypto Briefing, 2026-02-18](https://cryptobriefing.com/crypto-prediction-market-launch/)

### Inferences
- INFERENCE: On their own, "permissionless creation", "parimutuel pool", "Pyth-resolved" and "AI oracle" have each lost several times. "pump.fun of on-chain markets" sounds to these judges like Dum.fun, Bubblegum, Pumply and priddi, none of which placed, or like Melee, which is already funded. Brot's edge is the combination these did not show, and it has to show in the demo, not in a slide:
  1. **Guided creation**: an autocompleting box that only accepts questions mapped to a typed on-chain reader (for example "SOL/USD touches $X before date D", read from a named Pyth `PriceUpdateV2`). The box refuses or rewrites anything it cannot verify. This answers B-14 ("not anyone opening any market") without giving up open creation: anyone can open a market, but only on a question the chain can settle.
  2. **Re-checkable resolution**: anyone can run the same read and get the same result. There is no opinion oracle, no admin key and no LLM in settlement. Panel remark B-10 already identified "No human in the loop", "Anyone can re-check the read" and "Auto payout" as the three claims only Brot can make.
  3. **Cold start**: a sponsor puts money in the pot, so the first participant is not alone in an empty pot. This is the cold-start answer Variant credits to permissionless creation, achieved by funding instead.
- INFERENCE: Prediction markets won 4 of 28 Frontier awards with 4.5% of submissions, about three times their share. This category can win, but the bar is a distinct mechanism or audience.
- INFERENCE: A pump.fun-style framing invites comparison with memecoin launchpads, a bucket where token-launch winners were few (3 in Copilot data). "Guided creation of verifiable markets" scores better on the "Novelty" criterion than "pump.fun for X".

### Gaps
- Not counted: projects whose secondary category is prediction markets, a deduplicated list including runner-up guesses, and the number of low-confidence placements. I did not paginate them.
- Not found: any Colosseum project with exactly Brot's combination (guided creation limited to typed on-chain readers, plus a sponsor-funded pot). Semantic search found none, but missing results are not proof that none exist, especially outside Solana.

## 4. Which other programs have deadlines or rolling applications now (Solana Mobile, Superteam, Solana Foundation, Jupiter, Pyth)?

### Takeaway
Solana Mobile's **CLOCK IN closes 2026-10-08** and needs a working Android APK, so it is out of reach. Its Builder
Grants are rolling. A **Superteam Brazil side track** of about US$5k seems to run alongside the Crypto World's Fair
and accept the same project; the source is secondary, because the Superteam Earn pages could not be read. Pyth's
grants page is a legacy page. Solana Foundation and Jupiter programmes were not verified.

### Cited Findings
- FACT: CLOCK IN, the Solana Mobile hackathon with RadiantsDAO: "Submissions open: September 8, 2026", "Submissions close: October 8, 2026", winners in early November. Prizes: US$125k in USDC across ten teams (US$30k down to US$5k) plus a US$10k SKR prize. Required: "A functional Android APK", a GitHub repository, a demo video and a pitch deck. Criteria: stickiness and product-market fit, UX, innovation, presentation. The post does not say whether a project may also be entered elsewhere. — [Solana Mobile blog, 2026-09-28](https://solanamobile.com/blog/clock-in-the-solana-mobile-hackathon)
- FACT: Solana Mobile Builder Grants take applications on a rolling basis ("You can apply with any grant idea at any time"). They are milestone-based, for "mobile-focused dApps and infrastructure that integrate with the Solana Mobile Stack". — [solanamobile.com/grants](https://solanamobile.com/grants), accessed 2026-10-07
- SECONDARY FACT: A Superteam Brazil wiki pull request (merged 2026-09-20) says the Brazil track offers "US$5,000 (R$25k) + perks" on Superteam Earn, has a deadline of 2026-10-12 23:59 Brasília time, and that the "same project competes in both tracks". — [solanabr/wiki PR #3](https://github.com/solanabr/wiki/pull/3)
- SECONDARY FACT: A search snippet from Superteam Earn says Crypto World's Fair side tracks total "$319,000+" with a deadline of "13 Oct (6:59 AM UTC)". The page renders dynamically and I could not read the track list. — [Superteam Earn: Crypto World's Fair](https://superteam.fun/earn/hackathon/crypto-worlds-fair/)
- FACT (an example of how side tracks work): Superteam Vietnam's track requires projects to be "submitted to the Colosseum portal as well as on Superteam Earn" and to meet Colosseum's eligibility rules. — [Superteam Earn listing](https://superteam.fun/earn/listing/colosseum-crypto-worlds-fair-hackathon-superteam-vietnam-track/)
- SECONDARY FACT: Pyth's grants programme ("50M in PYTH grants") is described on a legacy page. Its research and developer bounties were moved to Superteam Earn (2024). Whether it is active today was not verified. — [legacy.pyth.network/grants](https://legacy.pyth.network/grants); [Pyth blog](https://www.pyth.network/blog/pyth-research-and-developer-bounties-on-superteam-earn)

### Inferences
- INFERENCE: Of these, only the Brazil side track is worth doing this week. It costs one extra Earn submission, and its deadline is 4 hours earlier than Colosseum's (23:59 BRT on the 12th against 03:59 BRT on the 13th). Submit both by the evening of 2026-10-12, Brasília time.
- INFERENCE: The Superteam Brazil idea of "two free markets per Superteam member" (mock panel) is a go-to-market experiment, not a programme. Run in the five days on devnet, a handful of named Superteam members opening a guided market would be the "demand validation" evidence the portal asks for.
- INFERENCE: Seeker and Builder Grants can wait until after the legal answer (D3 in the architecture proposal). Builder Grants are rolling, so waiting costs nothing.

### Gaps
- Not found: Solana Foundation grants and Jupiter programmes. Not researched for lack of time.
- Not verified: the Superteam Brazil listing itself (prize, residency rule, deadline). It needs a browser.

## 5. What does a credible five-day scope look like, and what would a judge penalise?

### Takeaway
On 2026-10-07 Sprint 02 (the pot program) has not started, and the deadline is 2026-10-12 23:59 PT. The credible
scope is **one market type working end to end on devnet**: a guided creation box that produces a Pyth price-touch
market, positions in devnet USDC, a permissionless resolve that reads the named Pyth account, and payout. Two videos
of at most 3 minutes each, an open repo with disclosed past work, and a go-to-market section with named partners
complete it. Judges penalise vague or overlong videos, unclear Solana integration, undisclosed past code and
buzzwords. A pump.fun token adds risk and scores on no criterion.

### Cited Findings
- FACT: The roadmap's shortest demo is "00 → 01 → 02 → 03 → 04 → 05": a full cycle on devnet driven by a script (open a question, take a position, resolve, pass the window, pay), with no screen. Sprints 08, -1 and 09–11 add a site that outsiders can use. — `docs/SPRINTS.md` §6 (repo)
- FACT: The architecture proposal (K-13) records that Sprint 02 had not started at the 2026-10-12 deadline. Before that date it allows only the "free" items (a neutral fee field, identifier names, `expected_position_total`). — `docs/technical/SYSTEM-ARCHITECTURE-PROPOSAL.md` lines 140 and 1032–1038 (repo)
- FACT: The demo video is limited to "no more than three minutes" and the presentation video to two to three minutes. Colosseum lists "Exceeding time limits" and "Failing to explain Solana integration clearly" among common mistakes. — [Hackathon FAQ h-faq-11](https://colosseum.com/hackathon#h-faq-11); [Colosseum blog, 2025-05-08](https://blog.colosseum.com/perfecting-your-hackathon-submission/)
- FACT: The mock panel's run-through lasted about 5 min 15 s (F-08). — `docs/business/_review/banca-do-pitch-2026-10-06.md` (repo)
- FACT: Product + Execution includes "How quickly is the team shipping product updates". Weekly one-minute updates are recommended. — [Hackathon FAQ h-faq-12](https://colosseum.com/hackathon#h-faq-12), [h-faq-14](https://colosseum.com/hackathon#h-faq-14)
- FACT: Melee Markets placed 2nd Consumer with no working demo (section 2). Riverboat showed a working devnet pari-mutuel demo and got only an honourable mention. — [Melee](https://colosseum.com/projects/explore/melee-markets); [Riverboat](https://colosseum.com/projects/explore/riverboat)
- FACT: Colosseum's own winners post calls Mentioned a "Betting platform", and Pregame won 1st Consumer described as "sports betting". The word is not banned. — [Frontier winners](https://blog.colosseum.com/announcing-the-winners-of-the-solana-frontier-hackathon/); [Pregame](https://colosseum.com/projects/explore/pregame)

### Inferences
- INFERENCE, what must be live on devnet:
  1. A minimal pot program with `create_market`, which accepts only resolver kind `PriceTouch` with a named Pyth feed, and `take_position` (YES/NO, devnet USDC).
  2. `resolve`: permissionless, reads the `PriceUpdateV2` through the existing `readers/price_touch.rs`.
  3. `claim`, with the house fee.
  4. One LiteSVM test of the full cycle and one real devnet cycle with signatures shown on an explorer.
  This is the roadmap's step 1, cut to a single resolver kind.
- INFERENCE, what can be mocked or labelled "prototype": the autocompleting creation box can run on templates, with no LLM. Most convincing is a box that turns free text into the closest verifiable template and shows the account it will read. Points, sponsorship tiers, the indexer, the keeper (resolve by hand or by script) and the Seeker channel can all be mocked. Anything on screen that is not on-chain should carry a "prototype" label (B-12).
- INFERENCE, what a judge would penalise: going over 3 minutes; a pump.fun token card, or talk of a future token (F-05, B-33); any hint of a mainnet plan without an audit; an unhedged "anyone can open any market" (B-14); a market the project itself controls, such as "will the burn happen" (B-13); undisclosed reuse of `pred-provable`; and a solo presenter whose repo shows other authors. The word "bet" is not penalised as such (Colosseum uses it), but "markets/positions" fits the regulatory framing and the BP.
- INFERENCE, a suggested order for 7–12 October: day 1–2, the program and LiteSVM cycle; day 3, devnet deploy and a scripted cycle; day 4, the creation box over templates and the market page; day 5, a one-minute weekly update, both videos and the portal text; then the Brazil Earn submission before 23:59 BRT on the 12th. It fits only if `emit_cpi!` and everything outside the single resolver kind wait (T4).
- INFERENCE: The portal answers (go-to-market, demand validation, founder background) count as much as the code under both sets of criteria. The founder should write them in his own words. A judge who knows the Trepa shutdown will ask for evidence of demand.

### Gaps
- Not verified: whether Colosseum reviewers check on-chain transactions themselves, or rely on the videos alone.
- Not verified: whether a devnet pot with real-money mechanics, entered from Brazil, raises a §4(c) or §13 diligence question. This depends on the pending legal review of MP 1.394.
