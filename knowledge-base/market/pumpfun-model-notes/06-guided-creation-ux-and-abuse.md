# Guided market creation (autocomplete to verifiable questions) and abuse controls for public creation

Research notes for Brot Markets, written 2026-10-07. Every item is labelled **FACT** (primary source read in this
session), **SECONDARY FACT** (press, wiki, aggregator or search-result text, not checked against a primary) or
**INFERENCE** (my reasoning from the cited items, not a sourced claim). Dates are publication or last-update dates
where the source gives one, and "accessed 2026-10-07" otherwise. Brot vocabulary: markets, positions, participants.

Method note: the web-search budget for this session ran out partway through. After that, only direct fetches of
known URLs and public GitHub repositories were used. `docs.polymarket.com` and `kalshi.com` failed DNS resolution
from this machine for the whole session, so the Polymarket and Kalshi policy items below come from search-result text
or CFTC filings, not from their own help centres.

Repo context the report writer needs (all **FACT (repo)**, read 2026-10-07):
- Today only the team opens markets: two team members, one proposes and one approves (Product Brief F7, R-32). The
  public can only *suggest* a question through X ("Quem sugere", Product Brief §2). Public creation would change an
  approved product rule. — `docs/product/PRODUCT-BRIEF.md` lines 37, 144-148
- First-day market kinds are five: big-asset price (touch), supply burn, Meteora locked liquidity, stake pool size,
  validator stake (R-13). Duration is up to 90 days, with 3 days or more recommended (R-06). Entries close when 5% of
  the duration remains, at least 24 h and at most 7 days before the end (R-07). There is no cap per market (R-05), but
  the program keeps a global cap (`CapState.global_cap`). — `docs/product/PRODUCT-BRIEF.md` R-05..R-14;
  `docs/technical/TECHNICAL-PLAN.md` line 173
- The `Question` account stores `kind`, `target`, `metric_account`, `threshold`, `opens_at`, `bets_close_at`,
  `deadline_at`, `proposer`, `approver`, `text_hash`. This is the typed struct that any creation UX has to produce.
  — `docs/technical/TECHNICAL-PLAN.md` line 174
- Under the default decision (D2), the AI layer stays off until mainnet. Rule K-02 says "No AI in resolution, review,
  disputes, payouts, fees, keys, or the choice of the account a market reads". The only creation-side AI the proposal
  allows is "A2 team checker": a person drafts from `content/market-registry.json`, which two team members reviewed,
  and the model only checks the draft. — `docs/technical/SYSTEM-ARCHITECTURE-PROPOSAL.md` lines 55, 129, 579, 588
- The existing chat route calls OpenRouter with default model `anthropic/claude-sonnet-5.5` and has an in-memory
  per-IP limit of 20 requests per 10 minutes. — `app/app/api/chat/route.ts`

---

## 1. Precedents for guided or structured creation of a resolvable claim

### Takeaway
Every platform that turned public creation into reliable resolution did it by narrowing what can be written. Kalshi
files a template with a named data source, fixed slots, and rules for missing data and revisions. Augur v2 shipped 208
fill-in-the-slot templates and a validator that checks the title against the template. PNP (Solana) splits creation
into six market types, each tied to one data source. Polymarket and Limitless keep creation in-house or behind a form.
Manifold and Metaculus allow free text, and handle it with written guidelines, human moderators, and unlisting.

### Cited Findings
**Kalshi: contracts are templates with named slots and a named source**
- FACT — Kalshi's self-certification of the Bitcoin contract is literally a template: "Will the spot price of Bitcoin
  be <above/below/between> <price> on <date> at <time>?", with four strike slots, Rulebook "BTC". The terms are set out
  under fixed headings: Underlying, Source Agency, Payout Criterion, Minimum Tick, Position Limit, Last Trading
  Date/Time, Settlement Date, Expiration Date/Time, Expiration Value, Contingencies. — [CFTC filing, KalshiEX, dated
  2024-03-15](https://www.cftc.gov/filings/ptc/ptc03152412807.pdf)
- FACT — In that filing the Underlying is defined precisely: "a simple average of the CF Bitcoin Real-Time Index
  ('BRTI') for the five minutes (300 seconds) prior to <time>, excluding the highest and lowest 20% of values". It also
  says "Revisions to the Underlying made after Expiration will not be accounted for", and "If no data is available on
  the Expiration Date at the Expiration Time, then the market resolves to No". The Source Agency is CF Benchmarks. —
  [same filing](https://www.cftc.gov/filings/ptc/ptc03152412807.pdf)
- FACT — The same filing states that instructions on how to access the Underlying "are non-binding and are provided
  for convenience only", which separates the binding rule from the help text. It sets a Position Limit of "$25,000 per
  strike, per Member", and lists times only "from 8AM-7PM ET on business days". — [same
  filing](https://www.cftc.gov/filings/ptc/ptc03152412807.pdf)
- SECONDARY FACT — A later filing of the same contract family is reported to have raised the position limit (maximum
  loss exposure) to $1,000,000 and to use 60 seconds of prices rather than 300. — search-result text for [CFTC filing
  rules1112248590](https://cftc.gov/filings/orgrules/rules1112248590.pdf) (not opened)

**Polymarket: the team creates markets; the public suggests**
- SECONDARY FACT — Polymarket's docs say users cannot create markets. They can suggest one on Discord
  (#market-suggestion) or by tagging @polymarket, and should include the market title, the resolution source, and
  evidence of demand. The Polymarket team decides which events are listed and writes the resolution rules. — search
  text of [docs.polymarket.com "Can I create my own
  market?"](https://docs.polymarket.com/polymarket-learn/markets/how-are-markets-created) (direct fetch failed: DNS)
- SECONDARY FACT — Polymarket's docs say every market's rules name a resolution source, an end date and edge cases,
  and that "the market title describes the question, but the rules define how it resolves". — search text of
  [docs.polymarket.com/concepts/resolution](https://docs.polymarket.com/concepts/resolution) (direct fetch failed)

**Augur v2: templates built to prevent invalid markets**
- SECONDARY FACT — The problem Augur v1 had: attackers created markets that were sure to resolve "invalid", for
  example by setting the event end before the event itself. They then bought the least likely outcome cheaply, because
  invalid paid 0.5 per share. Augur v2 answered with mechanisms against "invalid and deliberately confusing markets" and
  made "Invalid" a tradeable outcome. — [The Block, 2019-06-05](https://www.theblock.co/post/26075/augur-is-making-a-big-push-to-take-down-bad-actors-on-its-platform);
  [Decrypt, "Is Augur being gamed?"](https://decrypt.co/6010/is-augur-being-gamed)
- FACT — The Augur v2 repository contains `packages/augur-templates/src/templates.ts` (last commit 2020-08-01) with
  208 templates in a tree: Sports, Politics, Finance, Entertainment, Crypto, Medical. Each template has a `question`
  with numbered slots, an `example`, typed `inputs` and `resolutionRules.REQUIRED`. Example: "Will the price of [0]
  open at or above [1] on [2], according to TradingView.com "[3]"?" has the inputs Token Pair (dependent dropdown),
  Value # (number), Day of Year (date) and Market Source (dropdown). Its required rules include a fallback: "If the
  trading pair market isn't available on tradingview.com, refer to the actual exchange". — [AugurProject/augur
  templates.ts](https://github.com/AugurProject/augur/blob/master/packages/augur-templates/src/templates.ts)
- FACT — Augur input types include TEXT, DATEYEAR, DATETIME, ESTDATETIME, DATEYEAR_CLOSING, DROPDOWN,
  DENOMINATION_DROPDOWN, DROPDOWN_QUESTION_DEP (a dropdown whose values depend on another dropdown) and outcome-adding
  types. Each type has a regex validator: social handles `[a-zA-Z0-9_]{1,15}`, whole numbers, decimals, dates in
  "Month D, YYYY" format, date-times pinned to "(UTC 0)". — [same file](https://github.com/AugurProject/augur/blob/master/packages/augur-templates/src/templates.ts)
- FACT — The validator `isTemplateMarket` rejects a market claiming a template when: the template hash is unknown or
  "retired and set to auto-fail"; "populated title does not match title given" (it fills the slots and compares strings
  exactly); a numeric input is out of range; an estimated start time is after the event expiration; a date in the
  question is before creation time or after expiration; or the required day gap and no-weekend/holiday rules fail. The
  SDK lets clients filter markets by `templateOnly`, `customOnly` or `all`. — [templates.ts](https://github.com/AugurProject/augur/blob/master/packages/augur-templates/src/templates.ts);
  [TemplateFilters enum doc](https://github.com/AugurProject/augur/blob/master/docs/sdk/enums/_augur_sdk_src_state_getter_markets_.templatefilters.md)

**PNP Exchange (Solana): market types per data source, plus an AI resolvability gate**
- FACT — PNP: "Anyone can launch a prediction market on PNP Exchange in seconds — no approval process, no
  gatekeepers." The creator picks one of six market types, each with its own settlement source: General
  (Perplexity + Grok), Coin (Birdeye/CoinGecko), Twitter (Twitter API), DefiLlama, YouTube, Kalshi Derivative. The
  creator then picks a model (V2 AMM, V3 parimutuel, Bubblegum), writes a binary question, and seeds USDC. The V2
  minimum deadline is 2 days. — [docs.pnp.exchange/platform/creating-markets](https://docs.pnp.exchange/platform/creating-markets.md) (accessed 2026-10-07)
- FACT — After the creation transaction, PNP runs a "settlement analysis". It "checks whether your question is
  objectively answerable by the deadline, identifies authoritative resolution sources, and builds a scoring rubric".
  A market judged non-resolvable "is blocked from trading and you can claim a full refund of your initial liquidity".
  Rejected: "Open-ended questions or deadlines set before the event can resolve". — [same page](https://docs.pnp.exchange/platform/creating-markets.md)
- FACT — PNP's V3 parimutuel model works like Brot's pot: winners split the pot pro rata and there is no exit before
  settlement. Its creation parameters are Question, Expire Date & Time, Choose Side (creator backs YES or NO), Max Pot
  Ratio, Initial Liquidity, and optional `oddsBps` (100-9900). For "New-Rules Markets (ID ≥ 79)", only the creator can
  buy their own side and "the opposite side is whitelist-gated". — [docs.pnp.exchange/models/parimutuel-p2p](https://docs.pnp.exchange/models/parimutuel-p2p.md)
- FACT — PNP General markets resolve by "LLM oracle", and a DAO handles edge cases. — [docs.pnp.exchange/platform/fees-and-rewards](https://docs.pnp.exchange/platform/fees-and-rewards.md)

**Manifold: free-text creation, governed by creator rules and moderators**
- FACT — Manifold's "Running a market" guideline: "Creators are held to a higher standard than general users." They
  must write criteria "before anyone bets" and update them in public if events change. They may "permanently block
  yourself from trading on your own market"; that setting is visible to all participants and "can only be undone by a
  Moderator or admin". — [manifoldmarkets/manifold running-a-market.tsx, last commit 2026-05-30](https://github.com/manifoldmarkets/manifold/blob/main/web/pages/community-guidelines/running-a-market.tsx)
- FACT — Creating a binary market costs a liquidity "ante" equal to the chosen liquidity tier (100, 1,000, 10,000 or
  100,000 mana per the code comment). Polls cost 10, and `DEFAULT_CASH_ANTE` is 50. — [manifold common/src/economy.ts, last commit 2026-07-21](https://github.com/manifoldmarkets/manifold/blob/main/common/src/economy.ts)
- SECONDARY FACT — The community guidelines were last updated May 2026. They ban using alts to manipulate odds or
  harvest bonuses, and ban "intentionally resolving markets incorrectly … to benefit the market creator". —
  [manifold.markets/community-guidelines](https://manifold.markets/community-guidelines) (summary returned by fetch)

**Metaculus: written question-writing rules and human review**
- FACT — Metaculus guidance includes: "Aim for tight resolution criteria"; "Define your terms"; use authoritative
  sources and "be sure that the sources will be available at the time of resolution"; "Consider and account for
  edge-cases"; "Consider fall-back criteria"; "The title and wording of the question should match the resolution";
  specify units and "the timezone or a UTC offset"; pass "Phil Tetlock's Clairvoyance Test". It rejects questions that
  need "more than approximately 15 minutes of Admin effort to resolve". "Questions should not give resolution authority
  to question authors." — [Metaculus question-writing page source, last commit 2026-05-15](https://github.com/Metaculus/metaculus/blob/main/front_end/src/app/(main)/question-writing/page.tsx); live page [metaculus.com/question-writing](https://www.metaculus.com/question-writing)
- FACT — Metaculus timing rules: "The close date must be at least one hour prior to the resolution date". If the
  outcome is fixed at a known time, close "immediately before this time". Volunteer Community Moderators review
  submissions, "typically within a week or two". — [same source](https://github.com/Metaculus/metaculus/blob/main/front_end/src/app/(main)/question-writing/page.tsx)

**Limitless, Melee, Myriad, XO Market**
- SECONDARY FACT — Limitless (Base): creation "is permissioned" in its early stage. A user can fill out a form, and a
  suggestion that reaches the homepage and generates volume makes the user "eligible for creator rewards". Undated. —
  search-result text from [limitlesslabs.notion.site](https://limitlesslabs.notion.site) (not opened). Limitless's own
  post of 2024-07-25 describes the aim of "millions of user generated markets" and a "Creators 101" programme, with no
  mechanics. — [Limitless on Paragraph](https://paragraph.com/@limitlessexchange/prediction-market-summer)
- SECONDARY FACT — Melee (Solana, beta as of September 2026) offers permissionless user-created markets, "Ask
  Questions, Get Paid": creators "earn a cut of every trade", percentage not stated. Its example GTA VI market shows
  $317,375 in creator earnings on 15.87M volume. Users get a "Melee Score" with six tiers. — [IQ.wiki "Melee", updated
  2026-09-01](https://iq.wiki/wiki/melee.md)
- SECONDARY FACT — XO Market says it lets "every user create their own market". A category-specific AI agent checks
  whether the outcome complied with the resolution rules, and the platform runs on a Celestia-based sovereign rollup. —
  [CoinGape](https://coingape.com/block-of-fame/pulse/xo-market-receives-million-dollar-funding-to-transform-the-prediction-markets-forever/) (date not shown)
- SECONDARY FACT — Myriad: no source found that confirms user-created markets. Its revenue share pays referrers "1% of
  the user's buy volume in USDC" and passes the 1% to builders. — [Decrypt, 2025-09-24](https://decrypt.co/341115/myriad-launches-revenue-share-program-for-predictors-and-builders)

### Inferences
- INFERENCE — The precedent closest to Brot is Augur v2's templates combined with Kalshi's contract headings. In both,
  the market *is* a template ID plus typed slots, and the human-readable title is generated from the slots, never typed
  freely. Augur's check "populated title does not match title given" maps directly onto Brot's `text_hash`: the program
  (or the site) can rebuild the sentence from `kind`, `target`, `threshold` and `deadline_at`, and refuse a mismatch.
- INFERENCE — PNP's "Coin market" path (paste a mint address, see the live price, market cap and liquidity) is the
  nearest Solana UX to what the founder describes. PNP's AI "settlement analysis" gate is the opposite of Brot's design:
  Brot needs no gate, because a closed set of templates makes every market it accepts verifiable by construction. That
  is a pitch point: "the program refuses what it can't read" versus "an LLM decides whether your question is answerable".
- INFERENCE — Kalshi's "if no data is available … resolves to No" and "revisions … will not be accounted for" are
  clauses Brot's templates should state in plain words, because Brot's rule is that a goal not met by the deadline
  resolves NO. Same for stale or missing Pyth updates: say what happens.
- INFERENCE — Manifold and Metaculus show the cost of free text: moderators, review queues and unlisting. Brot can
  avoid most of that cost only if the closed template set stays closed.

### Gaps
- Polymarket's current UMA bond and challenge-window amounts were not verified (docs unreachable). The claim that
  Augur v2 had "validity bonds" for creators is from memory and was not verified this session.
- No primary Melee, XO Market or Limitless documentation on creation fields was reachable. The Melee creator
  percentage is not published in the sources found.
- Kalshi's own help-centre pages (rules summary, market page layout) were unreachable (DNS).

---

## 2. Autocomplete and slot-filling: deterministic grammar vs LLM mapping vs hybrid

### Takeaway
For a 5-day build, use a deterministic controlled grammar. A small set of sentence templates (one per Brot market
kind), typeahead over a reviewed registry of assets and accounts, and typed slot widgets produce the `Question` struct
directly, with zero model cost, zero injection surface and per-keystroke speed. Later, add an LLM only as a fallback
"did you mean" mapper for text the grammar cannot parse. Its output must be constrained to enums of template IDs and
registry IDs, and pass through the same validator. It never picks an account on its own (K-02).

### Cited Findings
**Sentence-builder and controlled-language precedents**
- FACT — Stripe Radar rules are a controlled language: `{action} if {condition}`, with conditions `[attribute]
  [operator] [value]`, for example `Block if :amount_in_usd: > 1000.00` and `Block if :card_country: != :ip_country:`.
  Operators are typed per attribute kind (string, country, numeric, boolean). Radar reports invalid conditions while
  the rule is being written, for example `:ip_country: = 'Canada'` (country codes required) or
  `:amount_in_usd: >= 'one thousand dollars'`. The docs mention searching historical payments "when previewing rules".
  — [Stripe Radar rules reference](https://docs.stripe.com/radar/rules/reference) (accessed 2026-10-07; served in Portuguese)
- FACT — The Augur v2 templates (section 1) are a controlled language for markets: fixed sentence, numbered slots,
  typed inputs with regex, dependent dropdowns, and a validator that rebuilds the sentence. — [templates.ts](https://github.com/AugurProject/augur/blob/master/packages/augur-templates/src/templates.ts)
- FACT — The standard academic reference on controlled natural languages is Tobias Kuhn, "A Survey and Classification
  of Controlled Natural Languages", *Computational Linguistics* 40(1):121-170, 2014. — [ACL Anthology J14-1005](https://aclanthology.org/J14-1005/) (abstract not retrieved)
- FACT — Luke Wroblewski reported (2010-02-25) that Vast.com's "Mad Libs style forms increased conversion across the
  board by 25-40%". Other field changes were made at the same time, so "it's possible these adjustments also
  contributed". — [LukeW](https://www.lukew.com/ff/entry.asp?1007)
- FACT — Adrian Roselli (2021-08-16) on sentence forms: in browse mode, screen-reader users hear "a muddied sentence";
  in forms mode, fields lose their context. Long lines defeat magnifiers. Radio buttons and checkboxes "confounded
  users". People with dyslexia "generally hated the overall experience". Automated translation renders "individual
  strings surrounding a field in unexpected (incomprehensible) ways". His advice: "Probably do not use this style of
  form. If you do, get a copywriter on board", and meet WCAG AA. — [Adrian Roselli, "Sentence Forms (not Mad
  Libs)"](https://adrianroselli.com/2021/08/sentence-forms-not-mad-libs.html)
- FACT — Baymard (2022-08-02): 80% of e-commerce sites offer autocomplete, but only 19% get all the design details
  right. It recommends no more than 10 suggestions on desktop and 4-8 on mobile, styling scope suggestions differently,
  highlighting "the predictive portion" rather than the typed text, keyboard up/down/Enter with list looping, no inner
  scrollbars, and large hit areas on mobile. — [Baymard Institute](https://baymard.com/blog/autocomplete-design)

**LLM structured outputs and constrained decoding**
- FACT — Anthropic structured outputs use constrained decoding and promise "Always valid … Type safe … Reliable: No
  retries needed for schema violations". They are enabled through `output_config.format` (`json_schema`) or
  `strict: true` on tools. JSON Schema `minimum`/`maximum`, `minLength`/`maxLength` and recursive schemas are *not*
  supported; `enum`, `const`, `anyOf` and `$ref` are. "The first time you use a specific schema, there is additional
  latency while the grammar compiles", and compiled grammars are cached for 24 hours. A refusal
  (`stop_reason: "refusal"`) or truncation (`max_tokens`) can produce output that does not match the schema. Limits
  are 20 strict tools, 24 optional parameters and 16 union-typed parameters per request. The guarantee covers syntax,
  not semantic correctness. — [Claude docs, Structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs) (accessed 2026-10-07)
- SECONDARY FACT — OpenAI introduced "custom tools" with GPT-5 on 2025-08-07. They can constrain plain-text tool
  output with a developer-supplied context-free grammar (Lark syntax) or regex, enforced by the open-source llguidance
  engine. — [aiwiki "Structured output"](https://aiwiki.ai/wiki/structured_outputs). A community thread asks whether
  "Custom Lark tool outputs are not guaranteed to conform to the CFG" (thread title only, not read). — [OpenAI
  community](https://community.openai.com/t/gpt-5-custom-lark-tool-outputs-are-not-guaranteed-to-conform-to-the-cfg/1337673?page=2)
- FACT — JSONSchemaBench (arXiv 2501.10868, ICML 2025) tested 10K real-world JSON schemas on six constrained-decoding
  frameworks (Guidance, Outlines, Llamacpp, XGrammar, OpenAI, Gemini). On complex schemas, coverage fell to 41%
  (Guidance), 39% (Llamacpp), 28% (XGrammar) and 3% (Outlines). — [arXiv 2501.10868](https://arxiv.org/abs/2501.10868)
  (figures from the abstract and summary returned by search)
- FACT — "Let Me Speak Freely?" (EMNLP 2024 Industry Track) found "a significant decline in LLMs' reasoning abilities
  under format restrictions", worse with stricter formats. Classification tasks could be "competitive or even improve",
  and a two-step "NL-to-Format" approach softens the effect. — [arXiv 2408.02442](https://arxiv.org/abs/2408.02442)

### Inferences
- INFERENCE — **Three designs compared for Brot:**
  - **Deterministic grammar (typeahead over templates and registry).**
    - Latency: per keystroke, in the browser, under ~50 ms. No network.
    - Cost: zero per use.
    - Determinism: total; the same text always gives the same struct.
    - Failure mode: text outside the grammar gets "we can't verify this on-chain", plus the closest valid templates.
    - Injection: no surface.
    - Mapping to the on-chain struct: 1:1. Each template is a `kind` and each slot a typed field.
  - **LLM mapping (free text to template and slots through structured outputs).**
    - Latency: hundreds of ms to seconds per call, plus a first-call grammar compile. Not usable per keystroke, only
      on submit or after a pause.
    - Cost: metered per call. It needs per-wallet and per-IP quotas.
    - Determinism: low. The same text can map differently.
    - Failure modes: refusals, truncation, a wrong but schema-valid choice (the guarantee is syntax only), enum case
      drift, and no numeric range checks inside the schema (Anthropic does not support `minimum`/`maximum`).
    - Injection: the user's text is the prompt, so it must be treated as data. The output can only *select* from enums.
  - **Hybrid.** The grammar runs first. The LLM is called only when the grammar fails, and only to propose a template
    and slots for the user to confirm in the same structured form. This keeps the grammar's guarantees and adds
    coverage for messy phrasing.
- INFERENCE — **Recommendation for the 5-day hackathon: deterministic grammar only.** Build one sentence template per
  first-day market kind (R-13), for example:
  - Price touch: "Will **[SOL]** touch **$[200]** before **[date]**?"
  - Burn: "Will **[mint]** supply fall to **[N]** or less by **[date]**?"
  - Locked liquidity: "Will at least **$[X]** be permanently locked in **[Meteora pool]** by **[date]**?"
  - Stake pool: "Will **[pool]** hold at least **[N] SOL** at the start of epoch **[E]**?"
  - Validator stake: "Will **[validator]** have **[N] SOL** active stake in epoch **[E]**?"

  The typeahead matches the first words ("will sol…", "burn…", "lock…") against template prefixes and asset names in
  `content/market-registry.json`. It then shows the full sentence with the remaining slots as chips. The slots are
  real labelled inputs (number, date picker, registry dropdown), not inline blanks in a paragraph, which avoids the
  accessibility and translation problems Roselli lists. Brot ships Portuguese and English, so the sentence is rendered
  per language from the struct, not translated from a string.
- INFERENCE — **Recommendation for later (after mainnet, if D2 opens AI): the hybrid.** Use a small model with strict
  structured output whose schema is `{template_id: enum, registry_id: enum, threshold: number, deadline: date}`. Check
  numeric ranges in code, since the schema cannot. Send the result to the same validator and the same preview, and
  have the user confirm every slot. To respect K-02, the account the market reads is looked up deterministically from
  the registry entry the user confirms. The model never outputs an address. Keep the "NL first, then format" split from
  the "Let Me Speak Freely?" findings only if the model also writes an explanation. For pure mapping, a single
  constrained classification call fits the task type the paper found unharmed.
- INFERENCE — Prompt injection matters less here than in chat, because the output is a closed choice and a person
  confirms it before signing. The residual risk is a wrong but valid market (wrong asset, wrong date). The preview
  (section 3) is the control for that.

### Gaps
- No primary source was found for IFTTT, Zapier or Linear filter-builder interaction patterns, or for measured
  conversion of command palettes. Those comparisons are left out rather than asserted.
- No measured latency figures for small-model structured-output calls were gathered. The latency comparison above is
  an inference.

---

## 3. What the creator must see before signing: resolution preview and live data

### Takeaway
Precedents converge on showing the binding rule in fixed headings: underlying, source, exact window, what happens if
data is missing, close times, limits. PNP also shows the live value of the data source as soon as the target is
entered. Brot can go further than any of them, because the program reads the account itself: the preview can say
"if this market resolved now, it would resolve NO, because the current value is X".

### Cited Findings
- FACT — Kalshi's binding contract terms list Underlying, Source Agency, Payout Criterion, Last Trading Date/Time,
  Expiration Date/Time, Settlement Date, Expiration Value, Position Limit and Contingencies. Help text on how to check
  the source is marked non-binding. — [CFTC filing 2024-03-15](https://www.cftc.gov/filings/ptc/ptc03152412807.pdf)
- FACT — PNP coin-market creation: paste the token address and "the system will automatically query the Birdeye API
  and display the token's current price, market cap, and liquidity data for confirmation". It also tells creators to
  use "exact figures (e.g., '$500,000' rather than 'half a million')". — [docs.pnp.exchange/market-types/coin](https://docs.pnp.exchange/market-types/coin.md)
- FACT — Augur templates come with an `example` sentence and required resolution rules that the creator sees and
  cannot edit. Date slots carry rules about the market's end time. — [templates.ts](https://github.com/AugurProject/augur/blob/master/packages/augur-templates/src/templates.ts)
- FACT — Metaculus: "The title and wording of the question should match the resolution", "Specify units and times",
  and give the timezone or UTC offset. — [Metaculus page source](https://github.com/Metaculus/metaculus/blob/main/front_end/src/app/(main)/question-writing/page.tsx)
- FACT — Stripe Radar previews a rule against historical payments before saving it. — [Stripe Radar rules reference](https://docs.stripe.com/radar/rules/reference)
- FACT (repo) — Brot timing rules to show: entries close when 5% of the duration remains, at least 24 h and at most
  7 days before the end (R-07); markets on irreversible facts lock positions the moment the fact happens and may
  resolve early (R-08); price markets are "touch" markets and every position needs a fresh price (R-09); a one-sided
  pot is returned (R-10); a voided market returns everything with no fee (R-11). — `docs/product/PRODUCT-BRIEF.md`

### Inferences
- INFERENCE — A **pre-signature card** for Brot should hold, in this order:
  1. The generated question sentence, which is the title, built from the slots.
  2. The rule in plain words, with Kalshi-style headings:
     - What is read: account kind, plus a short and a full address with an explorer link.
     - How it is read: for example "Pyth SOL/USD, price touches $200 at any time".
     - When: the deadline, in UTC and local time.
     - Entries close: R-07 computed, shown as a date.
     - Missing or stale data: "not met by the deadline → NO".
     - Early resolution (R-08).
     - One-sided pot and void refunds (R-10, R-11).
  3. The live value: "SOL now $142.10 (Pyth, 3 s ago)" or "Supply now 998,400,000". Under it, "If resolved right now:
     NO". This is the Radar-style preview, made possible because Brot's reader is the program itself.
  4. Money: the house fee, any creator fee, the creator's bond or deposit and when it is returned, and the pot cap if
     the template has one.
  5. A share-card preview (section 6).
  6. Warnings for templates where the creator may control the outcome (burn, lock): "the creator of this market may
     control the result", which reuses the R-19 wording.
- INFERENCE — Make the preview the only path to the sign button. No "advanced" bypass. Regenerate the sentence from
  the struct the transaction will actually carry, so the card cannot drift from what is signed (Augur's title check,
  applied on the client).

### Gaps
- No published example was found of a prediction market that shows "would resolve X if checked now" at creation. This
  appears novel, but absence of evidence was not exhaustively tested (search budget ran out).
- Kalshi's and Polymarket's on-page market layouts (their "rules summary" boxes) were not reachable for direct comparison.

---

## 4. Abuse controls for public creation

### Takeaway
Platforms that allow free-text creation police it after the fact: Manifold unlists, N/As and bans; Metaculus reviews
before publication; pump.fun moderates content and once switched off livestreaming. Regulated venues ban whole
categories (death, war, terrorism), and US lawmakers and the CFTC moved to codify that in 2026. On Solana, nothing can
be deleted, so the strong controls are program rules: a closed template set, uniqueness, minimum and maximum duration,
caps, bonds and rate limits. Front-end listing is the soft layer. Brot's closed set of on-chain-metric templates rules
out death, private-person and free-text abuse by construction. What remains is spam, duplicates, manipulable targets,
creator-controlled outcomes and Sybil farming.

### Cited Findings
**Banned categories and the 2026 policy context**
- SECONDARY FACT — Kalshi bans "violent markets — war, death, nuclear war, kidnapping, missile strikes". — search
  text for [Kalshi policy centre, "Banned markets"](https://kalshi.com/policy-center/banned-markets) (direct fetch
  failed: DNS)
- SECONDARY FACT — More than $54M was traded on Kalshi's "Ali Khamenei out as Supreme Leader?" market (before
  2026-03-01). Kalshi said it would not pay out if he was "out" through death, citing its anti-assassination policy, and
  was sued over this "death carveout". Sen. Adam Schiff and Rep. Mike Levin introduced the DEATH BETS Act. —
  [Forbes, 2026-03-12](https://www.forbes.com/sites/jasonbrett/2026/03/12/kalshi-death-bet-lawsuit-sparks-push-to-ban-assassination-markets/)
  (search text; fetch returned 403)
- SECONDARY FACT — On 2026-06-10 the CFTC published a proposed rule that would ban contracts on military conflicts,
  terrorist acts, assassinations and the violent overthrow of political leaders. — [Bitcoin Foundation news](https://bitcoinfoundation.org/news/regulation/us-prediction-markets-reg/) (search text)
- FACT — Metaculus content rules: questions "should not concern the personal lives of non-public figures", "should not
  concern the mortality of individuals", and should not be written to incentivize harmful acts. The test is that if
  stakes were high enough to make someone interfere in real events, "those actions should not be by their nature
  illegal or harmful". Questions should also avoid information hazards and "harmful self-fulfilling or self-negating
  effects". — [Metaculus page source](https://github.com/Metaculus/metaculus/blob/main/front_end/src/app/(main)/question-writing/page.tsx)

**Hide vs delete, and front-end moderation**
- FACT — Manifold markets have two independent toggles, ranked/unranked and listed/unlisted. "We default to
  unlisting", which leaves a market reachable only by direct URL. More severe cases are N/A'd or deleted. Triggers
  include: sexual content or significant violence, terrorism, hateful content, "purely random or gambling-like"
  markets, self-referential markets, "markets designed to harvest or redistribute Manifold bonuses", markets designed to
  defraud (N/A'd retroactively), doxxing, illegal content, and exploiting bugs. Markets whose criteria only the creator
  or friends can know are unranked unless the creator does not take positions. — [manifold market-policies.tsx, last commit 2026-05-30](https://github.com/manifoldmarkets/manifold/blob/main/web/pages/community-guidelines/market-policies.tsx)
- FACT — Dialect's blink registry labels each URL `trusted`, `none` or `blocked` ("flagged as malicious"). Wallets
  using Dialect's Blink Client SDK check URLs against it. Review is "a manual process", by email. — [Dialect docs,
  Register your Blink](https://docs.dialect.to/blinks/blinks-provider/blink-registry.md) (accessed 2026-10-07)
- FACT — The Solana dApp Store publisher policy (last updated 2026-07-21) requires dApps with user-generated content to
  "Enable users to report or flag offensive or inappropriate content from within the dApp" and to "Moderate UGC to
  ensure that there is no Restricted Content". Regulated financial services must provide "all documentation required by
  Applicable Law". It does not mention gambling or prediction markets explicitly. — [Solana Mobile Publisher Policy](https://legal.solanamobile.com/publisher-policy-web)
- SECONDARY FACT — pump.fun removed livestreaming in November 2024 after creators used "increasingly shocking tactics
  to promote their tokens". It brought it back on April 4 (2025) for 5% of users with "industry standard moderation
  systems". Its policy prohibits violence, animal abuse, pornography and youth endangerment, and violations can end the
  account. — [The Block](https://www.theblock.co/amp/post/349647/memecoin-launchpad-pump-fun-reopens-livestreaming-to-5-of-users-with-stricter-moderation-rules);
  [The Defiant](https://thedefiant.io/news/defi/pump-fun-halts-live-streams-as-users-go-to-dangerous-extremes-to-lauch-coins)
- SECONDARY FACT — An *unofficial* third-party write-up of pump.fun's moderation API describes text filtering, image
  moderation, user bans and bulk content-visibility controls. — [mintlify BankkRoll/pumpfun-apis](https://www.mintlify.com/BankkRoll/pumpfun-apis/api-reference/moderation/overview) (low reliability)

**Fees, bonds, durations and caps**
- FACT — Manifold makes the creator pay the liquidity ante (section 1). PNP makes the creator seed USDC for V2/V3
  markets, refunds it in full if the AI gate rejects the market, and enforces a 2-day minimum for V2. — [economy.ts](https://github.com/manifoldmarkets/manifold/blob/main/common/src/economy.ts);
  [PNP creating markets](https://docs.pnp.exchange/platform/creating-markets.md)
- FACT — pump.fun coin creation is free ("0 SOL / 0 USDC"). — [pump.fun docs, fees, updated 2026-05-20](https://pump.fun/docs/fees)
- FACT — Kalshi caps exposure per strike per member ($25,000 in the 2024 BTC filing). PNP V3 has a "Max Pot Ratio".
  Brot has a global cap and no per-market cap (R-05). — [CFTC filing](https://www.cftc.gov/filings/ptc/ptc03152412807.pdf);
  [PNP parimutuel](https://docs.pnp.exchange/models/parimutuel-p2p.md); `docs/product/PRODUCT-BRIEF.md`

**Wash trading and Sybils**
- SECONDARY FACT — A Columbia University working paper ("Network-Based Detection of Wash-Trading", not peer-reviewed)
  estimated that 25% of Polymarket volume over three years was artificial. It peaked near 60% in December 2024 and was
  back at about 20% in early October 2025. By category: Sports 45%, Election 17%, Politics 12%, Crypto 3%. —
  [Fortune, 2025-11-07](https://fortune.com/2025/11/07/polymarket-wash-trading-inflated-prediction-markets-columbia-research);
  [Cointelegraph](https://cointelegraph.com/news/columbia-study-polymarket-wash-trading-research)
- FACT — Manifold's code still has a unique-bettor bonus function (`getUniqueBettorBonusAmount`, amounts [3, 10, 15,
  20] × a promo multiplier of 2). Its "Disabled bonuses" block lists, among others, `UNIQUE_BETTOR_LIQUIDITY`,
  `NEXT_DAY_BONUS` and `MARKET_VISIT_BONUS`. — [economy.ts, 2026-07-21](https://github.com/manifoldmarkets/manifold/blob/main/common/src/economy.ts).
  This conflicts with user-market text claiming "Trader bonuses have been fully removed, as of the May 16th update"
  (year not stated) — [Manifold user market](https://manifold.markets/OnlySlides/will-manifold-ever-ban-trading-bonu) (low reliability).
- FACT — Manifold's rules name "markets designed to harvest or redistribute Manifold bonuses" as grounds for
  unlisting, N/A or deletion. — [market-policies.tsx](https://github.com/manifoldmarkets/manifold/blob/main/web/pages/community-guidelines/market-policies.tsx)

### Inferences
- INFERENCE — **Program rules (hard layer, cannot be undone after the fact):**
  1. **Closed template set.** Creation accepts only the `kind` enum, and each kind checks the owner and layout of its
     account (already the house rule). This removes death, private-person, harmful-act and free-text markets by
     construction. There is no title string to moderate, because the sentence is generated.
  2. **Uniqueness by PDA.** Derive the market address from a canonical key: `kind` + `metric_account` + a threshold
     bucket + a deadline bucket (for example, the UTC day). A second identical market then fails at `init`, so
     duplicates become impossible on-chain rather than merely filtered. The typeahead should surface the existing
     market ("this market already exists, take a position") before the user finishes typing. Choosing the bucket sizes
     is a product decision.
  3. **Duration bounds.** Keep R-06 (at most 90 days) and set a minimum per template. Metaculus asks for a close at
     least 1 h before resolution and PNP for 2 days; Brot's R-07 already forces entries to close at least 24 h before
     the end, so a minimum of about 3 days matches the R-06 recommendation.
  4. **Pot cap per template,** sized to the cost of pushing the metric. This is a change to R-05 (no per-market cap)
     and needs the founder's decision. It reuses P4 §4.4's "only targets that are expensive to push" logic.
  5. **Creation deposit.** Use a refundable bond (in USDC) returned when the market resolves without being voided, or
     once it has N distinct participants. Keep it forfeitable to the house if the team voids it for abuse. This mirrors
     Manifold's ante and PNP's seed-and-refund, without asking the creator to take a side.
  6. **Per-wallet rate limit on-chain.** A `Creator` PDA tracks `open_count` and `last_created_at`, and creation is
     refused above K open markets or more often than once per T. Sybil wallets bypass this, which is why the deposit
     carries the real cost.
- INFERENCE — **Front-end rules (soft layer):** add listed/unlisted and ranked/unranked flags in the indexer or site,
  Manifold-style, with unlisting as the default action. Add an in-app "flag" button, which the Seeker dApp Store
  requires for UGC. Use Dialect-style trusted/none/blocked labels for creator wallets. The on-chain remedy for a bad
  market is the existing void path (R-11: everything returned, no fee), never deletion.
- INFERENCE — **Attacker-controlled strings still exist:** token names and symbols come from Token Metadata, which the
  token's issuer controls. Render the registry's reviewed symbol, or the mint address, never raw metadata text. That
  closes the one door through which a slur or a "death" phrase could reach a generated title.
- INFERENCE — **Creator-controlled outcomes:** in burn and lock templates, the token team can make YES happen. If
  public creation is opened, the program can read the relevant authority at creation (mint or LP owner) and the site
  can flag "the creator of this market controls the account". A stricter alternative: refuse creation by the authority
  wallet itself, though Sybils make that a speed bump, not a lock. Manifold's opt-in "block yourself from trading" is a
  cheap extra signal.
- INFERENCE — **Wash trading in a pot model:** if the creator's reward is a share *s* of the house fee, and the fee is
  taken from the losing side, then a creator who fills both sides with their own wallets pays the full fee on the
  losing leg and gets back only *s* of it. Self-dealing therefore loses (1 − *s*) × fee, and pure wash trading is
  unprofitable whenever *s* < 1. It becomes profitable only when *extra* rewards depend on volume or participant count:
  points, leaderboards, airdrops, "trending" placement. The Columbia figures and Manifold's bonus-harvesting rules point
  at those external rewards as the driver, so Brot should keep any points or ranking off raw volume and off
  distinct-wallet counts.

### Gaps
- No primary Polymarket statement on its own banned categories was retrieved.
- No documented creation fee, bond or rate limit was found for Melee, Limitless or XO Market.
- Whether Kalshi's position-limit framing ("maximum loss exposure") would apply by analogy to a parimutuel pot was not
  researched (legal question, out of scope).

---

## 5. Creator incentives

### Takeaway
The market rate for creators on public-creation venues is roughly 30% of the platform fee (PNP) or a slice of each
trade (Melee, pump.fun). pump.fun's own 2026 post-mortem says paying creators per trade rewarded *launching* over
building real flow, and it moved to letting creators share or redirect fees. In a pot model with the fee taken from
the losing side, a capped share of the house fee is self-limiting: it cannot be wash-traded profitably, and it rewards
creators who bring *opposing* participants, which is exactly the shilling loop the founder wants.

### Cited Findings
- FACT — PNP charges a 1% fee on every buy and sell, split 30% to market creators, 20% to the PNP DAO (edge-case
  settlement) and 50% to the protocol. A separate 2% fee on gross redemptions goes 60% to the "Creator Fee Treasury"
  and 40% to the protocol. Bubblegum creators earn 0.5% of every trade. Creator fees can be claimed at any time, with
  "no vesting schedule, no minimum withdrawal threshold". — [PNP fees and rewards](https://docs.pnp.exchange/platform/fees-and-rewards.md)
- FACT — pump.fun's fee page, updated 2026-05-20: bonding-curve trades pay a 0.300% creator fee, 0.95% protocol fee
  and 0% LP fee (1.25% total). Creator fees on canonical PumpSwap pools fall from 0.300% at the smallest market caps to
  0.050% at the largest. Coin creation is free. — [pump.fun/docs/fees](https://pump.fun/docs/fees)
- SECONDARY FACT — On 2026-01-10, pump.fun co-founder Alon said the creator-fee design "failed to produce durable
  trading incentives". Dynamic Fees V1 attracted first-time creators but pushed incentives toward "low-risk issuance
  rather than risk-taking flow", and "issuance outpaced sustained secondary liquidity". The changes: creators can split
  fees across up to 10 wallets, and traders, through the market, decide which coins earn rewards. —
  [Yahoo Finance, 2026-01-10](https://finance.yahoo.com/news/pump-fun-admits-creator-fees-160120983.html)
- SECONDARY FACT — On 2026-02-18, pump.fun added "Cashback Coins". Before launch, the creator chooses between Creator
  Fees and Trader Cashback (100% of creator fees to traders), and the choice is locked once the coin is live. pump.fun
  said creator fees "can disproportionately reward deployers who may not contribute ongoing value". —
  [crypto.news, 2026-02-18](https://crypto.news/pump-fun-flips-creator-fees-launches-trader-cashback/)
- SECONDARY FACT — Melee: creators "earn a cut of every trade", with an example of $317,375 earned on 15.87M volume. —
  [IQ.wiki, 2026-09-01](https://iq.wiki/wiki/melee.md)
- SECONDARY FACT — Limitless pays creator rewards only once a suggested market reaches the homepage and generates
  volume. — search text, [limitlesslabs.notion.site](https://limitlesslabs.notion.site)
- FACT — Myriad's referral share is 1% of the referred user's buy volume in USDC, paid monthly once it reaches $500,
  plus 100 points per $1 of volume in Season 2. — [Decrypt, 2025-09-24](https://decrypt.co/341115/myriad-launches-revenue-share-program-for-predictors-and-builders)

### Inferences
- INFERENCE — Melee's example implies a creator take of about 2.0% of volume (317,375 / 15,870,000 ≈ 0.0200), if the
  wiki's figures are accurate. That is far above PNP's effective 0.3% of volume (30% of 1%).
- INFERENCE — **For Brot:**
  - Give the creator a fixed share of the house fee, for example 20-30% (PNP's 30% is the nearest public precedent),
    paid only at settlement and only on non-void markets.
  - Optionally cap the share per market, so a single huge pot does not turn the creator into the main beneficiary of
    a market whose outcome they might influence.
  - Because the fee comes from the losing side, the creator earns only when real money takes *both* sides, which
    rewards promoting the market to people who disagree. That is the healthy form of the pump.fun shilling loop.
  - Avoid per-market rewards for *creation itself* (pump.fun's "low-risk issuance" failure) and rewards on distinct
    participants or volume (the Manifold bonus-harvesting failure).
- INFERENCE — pump.fun's locked "creator fees vs cashback" choice suggests an option Brot could offer: the creator may
  redirect their share to the pot, raising winners' payouts, as a visible "no creator cut" badge. This also defuses the
  "the creator controls the outcome" concern on burn and lock markets.
- INFERENCE — The house-fee figures in Brot's own documents differ (10% of the losing side in the Product Brief, R-01;
  "3.5% of the pot" in the latest `/pitch2` commit). The creator share has to be set against whichever fee the founder
  confirms.

### Gaps
- No source was found on what creator share *causes* creators to promote their own market (no A/B or cohort data
  published by pump.fun, PNP or Melee).
- The exact Dynamic Fees V1 launch date and its tier table were not verified from a pump.fun primary page.

---

## 6. Social and viral distribution of a new market (2026)

### Takeaway
Blinks still exist and are documented, with no deprecation notice. But on X they unfurl only through browser
extensions (Phantom, Solflare, Backpack, Dialect) and only for registry-approved URLs; X has not integrated them
natively, and the Solana docs list no native mobile client. For a creator sharing from a phone or Seeker, the
dependable channel is an ordinary link with a strong preview card that opens the market in the dApp. Blinks are a
desktop bonus and can be embedded on Brot's own pages and in Dialect alerts. Farcaster Mini Apps support Solana
wallets. Telegram and X card specifics were not verified this session.

### Cited Findings
- FACT — Solana docs: an Action is a GET (metadata: title, icon, description, actions) and a POST (account in, signable
  base64 transaction out), with `links.next` for chaining. The docs state: "As of launch, only Actions that have been
  registered in the Dialect registry will unfurl in the Twitter feed when posted". Endpoints need CORS and an
  `actions.json` at the domain root. The docs list browser-extension wallets, bots (e.g. Discord), Action-aware dApps
  and the Blinks Inspector as clients, with no native mobile wallets, and carry no deprecation notice. —
  [solana.com/docs/tools/actions](https://solana.com/docs/tools/actions) (accessed 2026-10-07)
- FACT — Dialect docs: a Chrome-extension integration for Twitter (`setupTwitterObserver`); React and React Native
  SDKs for "native blink support" inside apps; MiniBlinks for single buttons; "Blinks in Alerts" for actionable
  notifications; forms with validation and multi-step chaining. Registry review is manual. — [Dialect docs index](https://docs.dialect.to/llms.txt);
  [Chrome extension](https://docs.dialect.to/blinks/blinks-client/integrate/chrome/index.md);
  [Registry](https://docs.dialect.to/blinks/blinks-provider/blink-registry.md)
- SECONDARY FACT — As of 2026-03-11: Phantom, Solflare and Backpack support blinks. "Blink unfurling on X depends on
  browser extensions. X hasn't natively integrated Blink rendering", and "adoption depends on client-side support —
  and that's where the bottleneck has been". — [Madeonsol, 2026-03-11](https://madeonsol.com/blog/solana-blinks-actions-explained)
- FACT — Farcaster Mini Apps are web apps distributed inside Farcaster, with guides for "Interacting with Solana
  wallets" and Ethereum wallets, and "no app store reviews". — [miniapps.farcaster.xyz](https://miniapps.farcaster.xyz/) (no date or status on page)
- FACT — Seeker or dApp Store distribution brings the UGC duties in section 4 (in-app flagging, moderation). —
  [Solana Mobile Publisher Policy, 2026-07-21](https://legal.solanamobile.com/publisher-policy-web)

### Inferences
- INFERENCE — **Share card first.** Every created market gets a stable URL with an Open Graph image rendered from the
  struct: the sentence, the live value, the deadline, the pot so far, and the YES/NO split. This works in X's mobile app,
  Telegram, WhatsApp and Discord, none of which run wallet extensions. It is also what a creator shilling from a Seeker
  will actually post.
- INFERENCE — **Blink second.** Serve the same market as a Solana Action, so desktop users with Phantom, Solflare or
  Backpack can take a position from the X feed. It needs Dialect registry approval (manual, by email), so apply early.
  The action's POST must build exactly the same `take_position` transaction as the site and set no extra authorities.
  The "safe Blink" rule is no different from the site's.
- INFERENCE — **Own-site embeds:** use Dialect's React SDK to render the blink card on Brot's own pages and in
  "Blinks in Alerts" notifications ("your market's entries close in 24 h"). That reuses one Action for three surfaces.
- INFERENCE — A creator's share link should carry their wallet as a `?ref=` parameter, which the Technical Plan
  already plans for referrals (line 382), so creator promotion and referral attribution are a single mechanism.

### Gaps
- Telegram bots and Mini Apps for Solana in 2026, X's current card and link-preview policy, and any 2026 usage figures
  for blinks were not verified (search budget exhausted). The Farcaster Mini Apps page gives no adoption figures or
  status date.
- Whether Phantom or Solflare *mobile* render blinks inside their in-app browsers in 2026 was not verified.
