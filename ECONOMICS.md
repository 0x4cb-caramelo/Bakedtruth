# Quantitative tokenomics brief (proposal)

Status: **proposal, not implemented.** Today the program has no protocol fee, no token, no staking and no fee vault, so
nothing here changes program behavior, the IDL or the invariants in `CLAUDE.md`. Every table below is printed by
[`scripts/tokenomics-model.ts`](scripts/tokenomics-model.ts) (`bun run scripts/tokenomics-model.ts`): change an
assumption there and re-run. The same script replays a market lifecycle with the proposed fees and asserts the
program's invariants, so the fee design is checked against the accounting and not only against a spreadsheet.

The ticker is `$TOKEN` until the rename in [NAMING.md](NAMING.md) is settled. Volumes, prices, costs and the launch
valuation are **assumptions for scale, not forecasts**: the repo has no usage data, and the program is devnet-only. This
is not financial or legal advice.

## Summary

| | |
| --- | --- |
| Fees, all in USDC | **F1** 1.00% of the sponsor-funded bounty as it is consumed (sponsor pays). **F2** 1.00% of the buyer's payment in `buy_yes` (buyer pays, on top). **F3** 0.50% of the face value of every winning token at settlement. Nothing at `create_market`. A swap share (F4) is off in v1. |
| Take | F1 + F2 = 1.00% of the face value of YES sold, at any price. F3 adds 0.50% of settled open interest. Base case: **1.75% of monthly volume** (0.75% to 4.00% over the mixes tested in §4.5). |
| Split of captured USDC | **40%** stakers, **20%** locked LP (POL), **30%** growth and marketing, **10%** ops and security reserve. |
| Supply | 1,000,000,000, fixed. Public sale 22%, airdrop 8%, **locked LP 12%** (with $600,000 USDC: 18-month cliff, then 12-month linear), growth and marketing 30%, team 15% (18-month cliff), treasury 13%. |
| Three tiers | $1M / $10M / $100M a month gives revenue **$17,500 / $175,000 / $1,750,000** and stakers **$7,000 / $70,000 / $700,000** a month. |

What the numbers say, plainly:

- **The Low tier does not pay its way.** $17,500 of revenue against an assumed $25,000 of opex. The treasury's share
  covers that cost base from **$3.6M a month**, which is 268 funded markets a month (§4.6).
- **Sponsor supply is the constraint, not fee design.** $10M of monthly volume needs about 750 funded markets a month,
  $100M needs 7,500 (§4.4). Nothing in the fee schedule creates sponsors.
- **At a $5M launch FDV the fees underwrite the valuation only from $4.8M of monthly volume.** Below that the price
  rests on narrative, not on the real yield (§3.4).
- **F3 is the only fee a sponsor cannot route around.** If every sponsor skips the official sale, revenue falls to
  0.75% of volume (§1.4).

## 0. Premises checked

The brief was written against a prompt whose premises were checked against the code and the README first.

| Premise | Finding |
| --- | --- |
| "Profit = Volume × Fee" | The program has three fee bases that move independently: sponsor budget consumed, `buy_yes` notional and settled open interest. The take rate R / V ranges from 0.75% to 4.00% across the mixes tested in §4.5, so one rate misleads. The model uses R = Σ fee × base. |
| "High-frequency volume like pump.fun" | The subsidized sale is capped by the sponsor's budget, pool trading halts at the cutoff, when the goal is visibly met or when the measured epoch starts, and every market resolves once. Volume therefore comes from many markets, not from churn on a few. Revenue follows sponsor budgets and settled open interest. pump.fun reportedly takes about 1% of traded notional on continuously churning tokens ([sources](#sources)); here the take per dollar is higher, but the volume has to be created market by market. |
| "Mercenaries manipulate metrics" | Matches the README ("moving the metric is the product"), but every resolver reads state flash capital cannot fake, so the fee base is real commitments, not manipulation volume. |
| "Creation, swap and resolution fees" | Creation: nothing to charge on budgets that never fill, and `withdraw_budget` lets a sponsor cancel an unsold sale. Swap: the pool's fee is paid in outcome tokens, not USDC, and anyone can list YES and NO on Raydium or Meteora, so it is the most elastic base. Resolution: `resolve` moves no money, so the fee sits on `redeem`. |
| "Captured SOL" | Collateral and every fee are USDC (`USDC_MINT`). Paying stakers in SOL would add a swap. |
| "Prove the platform survives" | Not provable: volume is exogenous. §4.6 gives the thresholds instead. |
| "An 18-month LP lock guarantees trust" | It stops a liquidity pull, not insider sales or a program upgrade. The program's upgrade authority has to be revoked (provable with the `Immutable` resolver) before any fee constant means anything (§2.5). |
| "We are launching a token" | No token, staking or fee vault exists in the repo. §1 to §3 describe new code. |

## 1. Protocol revenue mechanics

### 1.1 What the program charges today

`buy_yes` charges the buyer `price = ceil(amount × yes_price_bps / 10_000)` into the vault and the sponsor's budget
covers `amount − price`. The pool's `SWAP_FEE_BPS = 100` stays in the pool for liquidity providers, in outcome tokens.
`create_market`, `resolve`, `redeem` and `withdraw_budget` cost only rent and transaction fees. Protocol revenue today
is $0.

### 1.2 Fee schedule

| ID | Fee | Event | Payer | Base | Rate | Taken from |
| --- | --- | --- | --- | --- | --- | --- |
| F1 | Bounty fee | `buy_yes` | Sponsor | `amount − price`, the bounty consumed | 1.00% (100 bps) | `budget`, and out of the vault to the fee vault in the same instruction |
| F2 | Entry fee | `buy_yes` | Buyer | `price`, the USDC the buyer pays | 1.00% (100 bps), on top | The buyer's USDC account, straight to the fee vault |
| F3 | Settlement fee | `redeem`, and the NO payout in `withdraw_budget` | Holder of the winning side | Face value redeemed | 0.50% (50 bps) | The payout. The unspent-budget refund is not charged |
| F4 | Swap share | `swap` | Trader | Swap input | 0 in v1 | See §1.4 |
| | | `create_market`, `resolve`, `mint_pair`, `burn_pair`, liquidity | | | 0 | |

The three questions in the prompt:

- **Per bounty creation:** nothing at creation. 1.00% of the bounty as it is consumed (F1).
- **Per YES bought:** 1.00% on top of the buyer's payment (F2). With F1 that is 1.00% of the face value of what was sold.
- **Per final payout:** 0.50% of the face value of the winning side (F3).

F1 and F2 add up to the same amount at every price, because the sponsor funds `1 − p` of each token and the buyer funds
`p`: `(1 − p) × 1% + p × 1% = 1%` of face. A sold-out $10,000 bounty at four prices, settled:

| YES price p | YES sold (face) | Buyers pay | F1 bounty 1% | F2 entry 1% | F1+F2 | F3 settle 0.5% | Total | Total / face |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 20% | $12,500 | $2,500 | $100 | $25 | $125 | $63 | $188 | 1.50% |
| 40% | $16,667 | $6,667 | $100 | $67 | $167 | $83 | $250 | 1.50% |
| 60% | $25,000 | $15,000 | $100 | $150 | $250 | $125 | $375 | 1.50% |
| 80% | $50,000 | $40,000 | $100 | $400 | $500 | $250 | $750 | 1.50% |

What the toll costs each side, per YES:

| YES price p | Doer pays (p + F2) | Doer receives on YES (1 - F3) | Doer break-even probability | Sponsor bounty cost (1-p)(1+F1) |
| --- | --- | --- | --- | --- |
| 20% | 0.2020 | 0.9950 | 20.30% | 0.8080 |
| 40% | 0.4040 | 0.9950 | 40.60% | 0.6060 |
| 60% | 0.6060 | 0.9950 | 60.90% | 0.4040 |
| 80% | 0.8080 | 0.9950 | 81.21% | 0.2020 |

A doer needs the goal to be about 0.6 percentage points likelier to break even. The quoted sale price `p` and the
sponsor's advertised bounty `1 − p` are unchanged; what moves is the doer's all-in cost, `p × (1 + F2)`, and payout,
`1 − F3`.

### 1.3 Formulas

With `V_buy` the monthly `buy_yes` notional, `p` the average YES price, `μ` the open interest minted through
`mint_pair` relative to the open interest sold, and `V_swap` the monthly pool-swap notional:

```
q  = V_buy / p                  face value of YES sold through buy_yes
C  = (1 − p) × q                sponsor budget consumed
O  = (1 + μ) × q                open interest that settles (sale + mint_pair)

R  = f_b × C  +  f_e × V_buy  +  f_s × O  +  f_w × V_swap
   = q × [ f_b (1 − p) + f_e p + f_s (1 + μ) ]  +  f_w × V_swap

base case (f_b = f_e = 1%, f_s = 0.5%, f_w = 0):   R = q × [ 1% + 0.5% (1 + μ) ]
R / V = (m_p / p) × [ 1% + 0.5% (1 + μ) ]           m_p = V_buy / V, the share of volume that is buy_yes
```

"Profit = Volume × Fee" holds only with an effective rate that depends on the mix. The base case is `m_p = 40%`,
`p = 40%`, `μ = 0.5`, which gives `R / V = 1.75%` (§4). `R` is gross: it excludes opex, which is §4.3.

### 1.4 Why these rates

- **Incidence.** All three fees come out of one pie, the bounty `1 − p` per token. Doers are many and can leave; a
  sponsor who wants the goal has fewer substitutes. So F1 sits on the sponsor and does not touch what a doer pays or
  receives. F2 and F3 are small next to the doer's upside (a 40% token pays 150% if the goal is met).
- **Bypass.** F1 and F2 apply only inside `buy_yes`. The README describes a path open to anyone: `mint_pair`, keep one
  side, sell the other in the pool or on any SPL market. A sponsor can do the same with YES and keep the NO, which is a
  bounty without the official sale, so F1 and F2 last only while the sale is the best venue. F3 is on `redeem`,
  which every winning token must pass, so it is the revenue floor: 0.75% of volume in the base case, 43% of revenue.
  Table in §4.5.
- **F3 changes a README promise.** "Redeems 1:1" becomes "redeems 99.5%". The vault still holds one USDC for every
  token; 0.5% of it goes to the fee vault at redemption. It is the right place for the toll because the product being
  sold is oracle-free resolution, but it is a product decision. Keeping 1:1 means F3 = 0 and revenue falls 43% (§4.5).
- **F4 is off.** The pool takes its fee in outcome tokens, so a protocol share would arrive as YES or NO and carry
  outcome risk. Taking it as LP shares (the Uniswap V2 `feeTo` pattern) helps only partly: a withdrawal returns YES and
  NO in the pool's ratio, so the unbalanced remainder stays exposed after `burn_pair`. The guarded pool also competes
  with unguarded Raydium and Meteora pools, so its volume is the most elastic. At a 0.20% share it would add 7% to
  revenue.
- **Benchmarks.** Third-party summaries of Kalshi's fee schedule give a taker fee of 0.07 × p × (1 − p) per $1
  contract, peaking at 1.75¢ at 50¢. The proposed schedule is 1.5¢ per $1 of face at any price, for a token that is
  sold, held and settled, and 0.5¢ for pair-minted open interest. pump.fun is reported at 0.95% protocol plus 0.30%
  creator on its bonding curve and 0.25% on PumpSwap. Check both against the venues' own pages before quoting them.
- **Optimal fee.** If the number of trades that clear falls off exponentially with the fee, `V(f) = V₀ e^(−f/f*)`,
  revenue `f × V(f)` peaks at `f = f*`, the mean net edge of a marginal trade, and `R(f) / R(f*) = x e^(1−x)` with
  `x = f / f*`:

  | fee / f* | Revenue vs. maximum: x e^(1-x) | Volume vs. zero-fee volume: e^(-x) |
  | --- | --- | --- |
  | 0.25 | 52.9% | 77.9% |
  | 0.33 | 64.9% | 71.7% |
  | 0.50 | 82.4% | 60.7% |
  | 0.67 | 93.0% | 51.3% |
  | 1.00 | 100.0% | 36.8% |
  | 1.50 | 91.0% | 22.3% |
  | 2.00 | 73.6% | 13.5% |

  The curve is flat near the top, so setting the take near half of `f*` keeps 82% of the maximum revenue and 61% of the
  volume; overshooting costs more than undershooting. `f*` is unknown until launch. Measure it with fee rebates from the
  growth budget (§2.4) before raising any rate. If the typical net edge is around 3% of face, 1.5% of face sits at
  `x = 0.5`; that 3% is an assumption.
- **Wash trading.** Fees are paid on real transfers, so volume that exists only to farm rewards costs its farmer the
  fee. Weight airdrops and rebates by **fees paid**, never by volume, and keep rebates under 50% of the fee: a rebate
  above 100% would make wash trading profitable.

### 1.5 Accounting rules

The script replays a $10,000 market: three uneven purchases, a $2,000 `mint_pair`, resolution each way, redemption in
three uneven claims, then `withdraw_budget`. After every step before resolution it asserts `yes_supply = no_supply +
sponsor_no` and `vault = budget + yes_supply`, and at the end that the vault is empty and users plus the fee vault hold
exactly the starting USDC. It passes with the rules below:

- F2 never enters the market vault. F1 leaves the vault in the same instruction that takes the same amount off `budget`.
- Fees round up, toward the protocol. At `MIN_STAKE` (1 USDC) the smallest F1 + F2 is 10,000 base units.
- The replay collected $149 either way, 1.322% of the $11,235 of open interest.
- The fee vault is a program-owned token account PDA like `["vault", market]`, not an ATA.
- `maxSaleAmount` in `app/lib/market.ts` has to account for F1 coming out of `budget`, and quotes have to show `price + F2`.
- F3 arrives after resolution, up to `deadline_slot`, so during a ramp-up cash lags fee volume by the average market
  life.

## 2. Token distribution and lock schedule

### 2.1 Allocation

Supply is 1,000,000,000 with 6 decimals, fixed: the mint and freeze authorities are revoked at TGE. The launch FDV of
$5,000,000 ($0.005 a token) is a placeholder. The public sale clears at the pool's price. There is no private round; if
one is added, take it from Treasury and Growth, not from Public or LP.

| Bucket | % | Tokens | Value at launch | At TGE | Cliff | Release after the cliff |
| --- | --- | --- | --- | --- | --- | --- |
| Public sale | 22% | 220M | $1,100,000 | 40% | none | linear over 6 months |
| Community airdrop | 8% | 80M | $400,000 | 25% | none | linear over 9 months |
| Locked LP (token side) | 12% | 120M | $600,000 | in pool, position locked | 18 months | linear over 12 months |
| Growth & marketing | 30% | 300M | $1,500,000 | 0% | 3 months | linear over 36 months |
| Team & contributors | 15% | 150M | $750,000 | 0% | 18 months | linear over 30 months |
| Treasury & ops reserve | 13% | 130M | $650,000 | 0% | 6 months | linear over 36 months |

"Linear after the cliff" means releases start at zero on the cliff date, with no lump. The team's own tokens do not
release before the LP can first unlock (both start in month 19). Growth and treasury tokens do release earlier, from
months 4 and 7, which is why they sit in public escrows with monthly caps (§2.4).

**Controlled supply.** Team 15%, treasury 13% and growth 30% are 58% of supply under team-controlled vesting. That is
the trust cost of a heavy growth allocation. Hold those buckets in public on-chain vesting escrows so every release is
visible (§2.4).

### 2.2 The 18-month LP lock

| Item | Value |
| --- | --- |
| Pool | 120M tokens + $600,000 USDC = $1,200,000 (24% of FDV) |
| Public sale proceeds | $1,100,000 |
| Cash left after the USDC side of the pool | $500,000 |
| Price impact of a $10,000 buy (constant product, full range) | 3.36% |
| Price impact of a $50,000 buy | 17.36% |

- **Schedule.** The whole position is locked until month 18. From month 18 it unlocks 1/12 a month through month 30.
  Withdrawing is optional, and the default policy is to re-lock what is not needed.
- **Mechanism.** Meteora's documentation says a DAMM v2 position can hold unlocked, vesting and permanently locked
  liquidity and that locked liquidity keeps earning. The program lists `lock_position` ("lock position with a vesting
  schedule"), `refresh_vesting` and `permanent_lock_position`, and the pool has an `activation_type` that is slot or
  timestamp. **Not verified:** the vesting parameters (how the cliff is expressed), whether the owner can claim fees
  while the liquidity is locked, and whether time is slots or seconds for the lock. The docs I reached do not list the
  fields and `anchor idl fetch` found no IDL account for the program, so read them from the deployed program before
  TGE. The alternative is SPL LP tokens in a time locker such as Streamflow, which says it supports LP locks with cliff
  and linear schedules (vendor claim).
- **What this protocol can prove.** `DammV2LockedAtLeast` and `LockedAtLeast` read **permanent** locks only. A
  time-locked position is invisible to them. So the launch tranche is verified through the locker's own accounts, and
  the monthly POL additions (§3.3) go into **permanent** locks that anyone can open a market on. The README's caveats
  apply: `DammV2LockedAtLeast` counts liquidity units, not dollars, and counts any locked position.
- **What the lock does not do.** It does not stop holders from selling or set a floor, and DAMM v2 is an upgradeable
  third-party program (README, Known limits).

### 2.3 Unlock curve

| Month | Released, excluding LP | Tradable, including pool tokens | LP position withdrawable | Unlocked in that month | ...as % of tradable supply |
| --- | --- | --- | --- | --- | --- |
| 0 | 10.8% | 22.8% | 0% | - | - |
| 3 | 19.4% | 31.4% | 0% | 2.87% | 10.0% |
| 6 | 30.5% | 42.5% | 0% | 3.70% | 9.5% |
| 9 | 36.1% | 48.1% | 0% | 1.86% | 4.0% |
| 12 | 39.7% | 51.7% | 0% | 1.19% | 2.4% |
| 18 | 46.8% | 58.8% | 0% | 1.19% | 2.1% |
| 24 | 57.0% | 69.0% | 50% | 1.69% | 2.5% |
| 30 | 67.2% | 79.2% | 100% | 1.69% | 2.2% |
| 36 | 77.3% | 89.3% | 100% | 1.69% | 1.9% |
| 42 | 85.0% | 97.0% | 100% | 0.86% | 0.9% |
| 48 | 88.0% | 100.0% | 100% | 0.50% | 0.5% |

"Excluding LP" leaves out the 12% LP bucket, which sits in the pool and is tradable from TGE. The early months are the
heaviest: the public sale, the airdrop and the first growth tranche release 3.7% of supply in month 6, about a tenth of
what is tradable. From month 19 to month 36 about 1.7% of supply unlocks a month. §4.4 compares that with the buying
the protocol itself does.

### 2.4 Growth and marketing rules (30%)

- At most 1/36 of the bucket a month after the 3-month cliff, held in a public vesting escrow with a multisig recipient.
- Spent only through published programs: sponsor bounty matching, doer fee rebates (at most 50% of fees paid, §1.4),
  integrations and listings, and marketing. No transfers to team wallets and no OTC sales to insiders.
- Each program gets a **CAC ceiling** from the unit economics of a sponsor who opens 2 markets a month for 6 months: fees
  of $233 a market, $2,800 over the lifetime, so at most **$933** per acquired sponsor at LTV/CAC = 3 and $2,800 at
  break-even (script table 4h).

### 2.5 What the protocol can prove about itself

Each trust claim in this brief has an on-chain check except the time lock:

| Claim | Proof | Resolver exists |
| --- | --- | --- |
| Supply is fixed | Mint authority revoked on `$TOKEN` | `MintAuthorityRevoked` |
| No freezing | Freeze authority revoked | `FreezeAuthorityRevoked` |
| Name and symbol frozen | Metadata immutable (the update authority can still be handed over and the JSON behind the URI can change, per the README) | `MetadataImmutable` |
| The fee and split constants cannot change | Upgrade authority of this program revoked. **Required before fees go live** | `Immutable` |
| POL is permanently locked | Permanent lock in the DAMM v2 pool | `DammV2LockedAtLeast` |
| The launch LP is locked 18 months | The locker's accounts | none |

## 3. Real-yield distribution math

### 3.1 The split

Enforced on-chain by a permissionless `distribute_fees` with the shares as program constants (no governance). That only
means something once the program is immutable (§2.5).

| Bucket | Share | Use |
| --- | --- | --- |
| Stakers | **40%** (4,000 bps) | USDC, claimable, weighted by lock length (§3.2) |
| Locked LP (POL) | **20%** (2,000 bps) | Half buys `$TOKEN` in the pool, half stays USDC, both are added to a new DAMM v2 position that is then permanently locked (§3.3) |
| Growth & marketing | **30%** (3,000 bps) | The programs in §2.4 |
| Ops & security reserve | **10%** (1,000 bps) | Audits, bug bounty, legal, infrastructure |

Opex is paid out of Growth plus Reserve, which is 40% of revenue (§4.3). Moving the staker share is a straight trade
against the treasury (§4.5): each 10 points is $17,500 a month at the Medium tier.

### 3.2 Staker math

```
Epoch e, with s = 0.40 and W = Σ w_i × a_i the weighted stake (a_i = tokens staked by i):
  acc_e = acc_(e−1) + s × R_e / W            USDC per weighted token, kept at fixed-point precision
  pending_i = w_i × a_i × (acc_now − acc_i)  acc_i = the accumulator when i staked or last claimed
  if W = 0, the epoch's share rolls into the next epoch

Weight:   w_i = 1 + L_i / 18,  L_i = months locked, 0 to 18   →   1.00, 1.33, 1.67, 2.00 for 0, 6, 12, 18 months

APR_i = 12 × s × R_m × w_i / (W × P)         R_m monthly revenue, P token price in USDC
      = A / staked value at the pool average,  A = 12 × s × R_m
APY   = (1 + APR / 12)^12 − 1                only if each month's USDC is swapped back into the token and re-staked
```

There are no emissions: the yield is paid in USDC from fees and is zero when revenue is zero. Quote APR; APY is an upper
bound that assumes costless re-staking.

| Tier | Annual staker pool | $500,000 staked | $2,000,000 staked | $8,000,000 staked | $32,000,000 staked |
| --- | --- | --- | --- | --- | --- |
| Low | $84,000 | 16.8% | 4.2% | 1.1% | 0.3% |
| Medium | $840,000 | 168.0% | 42.0% | 10.5% | 2.6% |
| High | $8,400,000 | 1680.0% | 420.0% | 105.0% | 26.3% |

The loyalty boost, for the Medium tier at the $5,000,000 launch FDV with 40% of supply staked ($2,000,000) and a stake mix
of 40% flexible and 20% in each of the three locks (mean weight 1.40):

| Lock | Weight | Share of pool per token vs. mean | APR | APY if rewards are re-staked monthly |
| --- | --- | --- | --- | --- |
| flexible | 1.00 | 0.71x | 30.0% | 34.5% |
| 6 months | 1.33 | 0.95x | 40.0% | 48.2% |
| 12 months | 1.67 | 1.19x | 50.0% | 63.2% |
| 18 months | 2.00 | 1.43x | 60.0% | 79.6% |

A flexible staker's APR falls as others lock longer, because the pool is fixed and the weights share it. Staking 40% of
supply needs at least 40% released, which the unlock curve reaches around month 12 (§2.3).

### 3.3 Locked-LP (POL) accrual

Each month `l × R` of USDC goes to POL (`l = 20%`). Half buys `$TOKEN` from the pool, half is paired with it, and the
result goes into a new position that is permanently locked, so the pool only gets deeper. With `X` the USDC side of the
pool, a buy of size `T` moves the price by `(1 + T/X)² − 1` (constant product, full range).

| | Low | Medium | High |
| --- | --- | --- | --- |
| Monthly POL buy flow (half of the POL share) | $1,750 | $17,500 | $175,000 |
| Depth added in 12 months, vs. the $600,000 launch USDC side | 4% | 35% | 350% |

### 3.4 What the yield supports

If stakers demand an APR of `r` and a share `σ` of supply is staked, the market capitalization that the yield underwrites
is `FDV* = A / (σ r)`. With `s = 40%`, `σ = 40%` and `r = 20%` that is **5.0× annualized revenue**, or **1.05× monthly
fee-bearing volume** at the base take.

| Tier | Fair FDV = A / (staked share x required yield) | Fair FDV / annualized revenue | APR at $5,000,000 FDV |
| --- | --- | --- | --- |
| Low | $1,050,000 | 5.0x | 4.2% |
| Medium | $10,500,000 | 5.0x | 42.0% |
| High | $105,000,000 | 5.0x | 420.0% |

The $5,000,000 launch FDV is underwritten by fees once revenue reaches $83,333 a month, which is $4,761,905 of volume at
the base-case take of 1.75%. The High-tier 420% is not a forecast: at that yield the market reprices the token until the
APR falls toward `r`, which is what the fair-FDV column shows. At the Low tier a 4.2% APR does not compensate holders
for a $5M FDV, so the price rests on narrative.

## 4. Volume projections

### 4.1 Assumptions

| Input | Value |
| --- | --- |
| Fee-bearing volume V | `buy_yes` notional plus pool-swap notional, USDC a month |
| Average YES price p | 40% |
| Share of V that is `buy_yes` | 40% (the rest is pool swaps, which pay no protocol fee in v1) |
| Pair ratio μ | 0.5 (`mint_pair` open interest relative to open interest sold) |
| Budget used by the sale | 80% of the posted budget |
| Average bounty | $10,000; a sponsor opens 2 markets a month |
| Opex, cash a month | $25,000 / $60,000 / $200,000 for Low / Medium / High. **Placeholders**: replace with a real budget |
| Launch FDV, staked share, required yield | $5,000,000; 40% of supply; 20% |

### 4.2 Revenue ("Profit = Volume × Fee", before the split)

|  | Low | Medium | High |
| --- | --- | --- | --- |
| Fee-bearing volume V | $1,000,000 | $10,000,000 | $100,000,000 |
|   buy_yes notional (40%) | $400,000 | $4,000,000 | $40,000,000 |
|   pool swap notional (60%) | $600,000 | $6,000,000 | $60,000,000 |
| YES sold, face value | $1,000,000 | $10,000,000 | $100,000,000 |
| Sponsor budget consumed | $600,000 | $6,000,000 | $60,000,000 |
| Open interest settled | $1,500,000 | $15,000,000 | $150,000,000 |
| F1 bounty fee (1.00% of budget consumed) | $6,000 | $60,000 | $600,000 |
| F2 entry fee (1.00% of buy_yes notional) | $4,000 | $40,000 | $400,000 |
| F3 settlement fee (0.50% of settled face) | $7,500 | $75,000 | $750,000 |
| **Gross protocol revenue R** | **$17,500** | **$175,000** | **$1,750,000** |
| R / V | 1.75% | 1.75% | 1.75% |
| Revenue floor if every sponsor bypasses buy_yes (F3 only) | $7,500 | $75,000 | $750,000 |

### 4.3 Where it goes, and what is left for the treasury and stakers

|  | Low | Medium | High |
| --- | --- | --- | --- |
| Stakers (40%) | $7,000 | $70,000 | $700,000 |
| Locked LP / POL (20%) | $3,500 | $35,000 | $350,000 |
| Growth & marketing (30%) | $5,250 | $52,500 | $525,000 |
| Ops & security reserve (10%) | $1,750 | $17,500 | $175,000 |
| Opex (assumed) | $25,000 | $60,000 | $200,000 |
| Operating profit (R - opex) | -$7,500 | $115,000 | $1,550,000 |
| Treasury net (40% of R, minus opex) | -$18,000 | $10,000 | $500,000 |
| Cash runway at that net | 28 months | self-funding | self-funding |

"Treasury net" is what Growth plus Reserve have left after opex. It is the honest measure of whether the protocol funds
its own growth: at the Medium tier it is $10,000 a month, so almost all marketing there comes from the 30% token
allocation, not from fees. The runway uses the $500,000 left after the public sale funds the USDC side of the pool.

### 4.4 What each tier needs on the ground

| | Low | Medium | High |
| --- | --- | --- | --- |
| Sponsor budget posted per month | $750,000 | $7,500,000 | $75,000,000 |
| Markets opened per month | 75 | 750 | 7,500 |
| Active sponsors at 2 markets a month | 38 | 375 | 3,750 |
| Implied pool turnover (swap volume / settled open interest) | 0.40x | 0.40x | 0.40x |
| Monthly POL buy flow (half of the POL share buys the token) | $1,750 | $17,500 | $175,000 |
| POL depth added in 12 months, vs. the launch USDC side | 4% | 35% | 350% |

Unlock pressure against the protocol's own buying, at month 19 (the first month the team and the LP both unlock, price
held at launch):

| Item | Value |
| --- | --- |
| Tokens unlocked in month 19 (excluding LP) | 16.94M = $84,722 at launch price |
| POL buy flow / unlock value, Low | 2% |
| POL buy flow / unlock value, Medium | 21% |
| POL buy flow / unlock value, High | 207% |

Only the High tier's POL buying absorbs the scheduled unlocks at the launch price. Everywhere else the unlocks have to
be met by outside demand.

### 4.5 Sensitivities

Take rate R / V by sale face per dollar of volume (`m_p / p`) and pair ratio:

| Sale face / volume | Example | pair ratio 0 | pair ratio 0.5 | pair ratio 1 |
| --- | --- | --- | --- | --- |
| 0.5 | 20% primary at p = 40% | 0.75% | 0.88% | 1.00% |
| 1.0 | 40% primary at p = 40% | 1.50% | 1.75% | 2.00% |
| 1.5 | 60% primary at p = 40% | 2.25% | 2.63% | 3.00% |
| 2.0 | 80% primary at p = 40% | 3.00% | 3.50% | 4.00% |

Fee levers:

| Case | R / V | vs. base |
| --- | --- | --- |
| Base: F1 1% + F2 1% + F3 0.5% | 1.75% | - |
| F3 off (README's 1:1 redemption kept) | 1.00% | -43% |
| F4 on: 0.20% protocol share of pool swaps | 1.87% | +7% |
| 25% of the sale volume bypasses buy_yes (F3 unaffected) | 1.50% | -14% |
| 50% of the sale volume bypasses buy_yes (F3 unaffected) | 1.25% | -29% |
| 100% of the sale volume bypasses buy_yes (F3 unaffected) | 0.75% | -57% |

Split, Medium tier (POL and reserve fixed, growth takes the difference):

| Staker share | Growth share | Staker APR at $2,000,000 staked | Treasury net after opex |
| --- | --- | --- | --- |
| 30% | 40% | 31.5% | $27,500 |
| 40% | 30% | 42.0% | $10,000 |
| 50% | 20% | 52.5% | -$7,500 |

### 4.6 Survival thresholds

The brief cannot show that volume reaches any tier; that depends on sponsors the repo has not found yet. What it can
give is the number to test, at the Low-tier cost base of $25,000 a month:

| Condition | Monthly volume | Markets opened per month |
| --- | --- | --- |
| Gross revenue R covers opex | $1,428,571 | 107 |
| The treasury share (growth + reserve) covers opex | $3,571,429 | 268 |
| Fees underwrite the $5,000,000 launch FDV (3c) | $4,761,905 | 357 |
| The treasury share covers opex if every sponsor bypasses buy_yes (F3 only) | $8,333,333 | 625 |

Read the second row as the survival line: about 268 funded markets a month, or 134 sponsors opening two each. Below it the
protocol runs on the public-sale cash (28 months at the Low tier). The program is devnet-only, so the mainnet count today is
zero, and even the Low tier is 75 funded markets a month.

The growth bucket is a bet on one inequality: the cost of acquiring a sponsor stays under the lifetime fees that sponsor
generates (§2.4). The model gives the ceiling; only launch data gives the actual cost.

## 5. Risks and gates before any of this ships

1. **Securities and licensing.** Paying a share of protocol revenue to token stakers is the profit-sharing feature that
   securities regulators examine, including under the US Howey test. Get counsel before TGE, and treat the APRs in this
   brief as model outputs, never as promises or marketing. Geofencing and the structure of the yield are legal questions,
   not modeling ones.
2. **Audit first.** A fee vault and a staking program concentrate value in a program that is unaudited and devnet-only.
   Audit, then revoke the upgrade authority, before enabling fees on mainnet (§2.5).
3. **Sponsor supply** is the real bottleneck (§4.4).
4. **Unlock overhang.** Outside the High tier, scheduled unlocks outweigh the protocol's own buying (§4.4).
5. **Unverified lock mechanics.** The DAMM v2 vesting parameters are not verified (§2.2).
6. **Bypass.** Sponsors can leave the official sale, and the guarded pool competes with external pools (§1.4).
7. **Footprint.** The change touches `buy_yes`, `redeem`, `withdraw_budget`, the account lists, the IDL, the client
   library and the tests, and adds a fee vault, `distribute_fees`, `stake`, `unstake` and `claim`. It is larger than a
   constant.
8. **Not modeled:** trading fees the locked `$TOKEN` position earns on its own pool. They depend on token speculation,
   so they should not be sold as real yield. Also not modeled: price effects, taxes, and the token-denominated
   buckets as cash.

## 6. Open decisions

1. Keep the README's 1:1 redemption (F3 = 0, revenue −43%) or accept 99.5%?
2. Launch FDV and raise. $5M and $1.1M are placeholders; §3.4 gives the volume each FDV needs.
3. Whether to ship a token before an audit. The hackathon demo needs none of this.
4. The split (§4.5 shows the trade) and whether the launch LP keeps a permanent part.

## Sources

- Meteora DAMM v2: [program repository](https://github.com/MeteoraAg/damm-v2) (`lock_position`, `refresh_vesting`,
  `permanent_lock_position`, `activation_type`), [documentation](https://docs.meteora.ag/core-products/damm-v2/what-is-damm-v2)
  (unlocked, vesting and permanently locked liquidity; locked liquidity continues earning),
  [changelog](https://docs.meteora.ag/developer-guides/damm-v2/changelog).
- Streamflow, a vendor, on LP locks: [Best platforms for locking liquidity on Solana](https://streamflow.finance/blog/best-platforms-for-locking-liquidity-on-solana).
- Kalshi fee formula, third-party summaries: [marketmath.io](https://marketmath.io/platforms/kalshi),
  [pm.wiki](https://pm.wiki/learn/kalshi-fees-explained).
- pump.fun fees, third-party summary: [soltokencreator.io](https://www.soltokencreator.io/blog/pump-fun-fees-explained).
