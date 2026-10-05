// Quantitative model behind ECONOMICS.md: protocol fees, revenue split, staker yield, the token unlock curve and the
// three volume tiers. Every table in that document is printed here (`bun run scripts/tokenomics-model.ts`). The
// assumptions are the constants below: change one and re-run. The script also replays a market lifecycle with the
// proposed fees to check the program's invariants and USDC conservation, and asserts that the allocation and the
// revenue split add up. It reads no chain state and changes nothing.

import assert from "node:assert/strict";

// ---------------------------------------------------------------------------------------------------------------------
// Assumptions
// ---------------------------------------------------------------------------------------------------------------------

/** Proposed protocol fees in basis points. F1, F2: `buy_yes`. F3: winning redemptions. F4: pool swaps (off). */
const FEES = { bountyBps: 100, entryBps: 100, settleBps: 50, swapProtocolBps: 0 };

/**
 * The average market. `primaryShare` is the share of traded volume that is `buy_yes`, `pairRatio` the open interest
 * minted through `mint_pair` relative to the open interest sold through `buy_yes`, `fill` the share of the budget
 * the sale uses, `marketsPerSponsor` how many markets one sponsor opens per month, `bypass` the share of the sale
 * volume that skips `buy_yes` (a sponsor can `mint_pair` and sell YES in the pool or elsewhere): F1 and F2 are lost
 * on it, F3 is not, because the open interest still settles through `redeem`.
 */
const MARKET = {
  yesPrice: 0.4,
  primaryShare: 0.4,
  pairRatio: 0.5,
  fill: 0.8,
  avgBudget: 10_000,
  marketsPerSponsor: 2,
  bypass: 0,
};

/** Where each captured USDC goes. */
const SPLIT = { stakers: 0.4, pol: 0.2, growth: 0.3, reserve: 0.1 };

/** `stakedShare` is the share of total supply staked, `requiredYield` the APR stakers demand to hold the token. */
const TOKEN = { supply: 1_000_000_000, fdv: 5_000_000, stakedShare: 0.4, requiredYield: 0.2 };

/** Monthly fee-bearing volume (buy_yes notional + pool swap notional) and the cash opex assumed at that scale. */
const TIERS = [
  { name: "Low", volume: 1_000_000, opex: 25_000 },
  { name: "Medium", volume: 10_000_000, opex: 60_000 },
  { name: "High", volume: 100_000_000, opex: 200_000 },
];

/** Lock length to staking weight: weight = 1 + months / 18, so an 18-month lock earns twice a flexible stake. */
const LOCK_MONTHS = [0, 6, 12, 18];
const LOCK_MIX = [0.4, 0.2, 0.2, 0.2];

interface Bucket {
  name: string;
  pct: number;
  /** Share of the bucket released at TGE. */
  tge: number;
  /** Months before the first release; releases are linear over `vest` months from then, with no lump at the cliff. */
  cliff: number;
  vest: number;
  /** Tokens sit in the DEX pool from TGE and are tradable, but the position cannot be withdrawn until it unlocks. */
  inPool?: boolean;
}

const BUCKETS: Bucket[] = [
  { name: "Public sale", pct: 22, tge: 0.4, cliff: 0, vest: 6 },
  { name: "Community airdrop", pct: 8, tge: 0.25, cliff: 0, vest: 9 },
  { name: "Locked LP (token side)", pct: 12, tge: 0, cliff: 18, vest: 12, inPool: true },
  { name: "Growth & marketing", pct: 30, tge: 0, cliff: 3, vest: 36 },
  { name: "Team & contributors", pct: 15, tge: 0, cliff: 18, vest: 30 },
  { name: "Treasury & ops reserve", pct: 13, tge: 0, cliff: 6, vest: 36 },
];

// ---------------------------------------------------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------------------------------------------------

const usd = (n: number) => `${n < 0 ? "-" : ""}$${Math.round(Math.abs(n)).toLocaleString("en-US")}`;
const pct = (x: number, digits = 2) => `${(x * 100).toFixed(digits)}%`;
const tokens = (n: number) => `${(n / 1e6).toLocaleString("en-US", { maximumFractionDigits: 2 })}M`;
const row = (cells: (string | number)[]) => `| ${cells.join(" | ")} |`;
const table = (head: string[], rows: (string | number)[][]) =>
  [row(head), row(head.map(() => "---")), ...rows.map(row)].join("\n");
const show = (title: string, body: string) => console.log(`\n### ${title}\n\n${body}`);

assert.equal(
  BUCKETS.reduce((sum, b) => sum + b.pct, 0),
  100,
  "allocation must add up to 100%",
);
assert.ok(Math.abs(Object.values(SPLIT).reduce((sum, s) => sum + s, 0) - 1) < 1e-12, "split must add up to 100%");
assert.ok(Math.abs(LOCK_MIX.reduce((sum, s) => sum + s, 0) - 1) < 1e-12, "lock mix must add up to 100%");

type Fees = typeof FEES;
type Shape = typeof MARKET;

/** Monthly flows and fee revenue at a given traded volume. Settled open interest is what `redeem` pays out. */
function monthly(volume: number, fees: Fees = FEES, shape: Shape = MARKET) {
  const vBuy = volume * shape.primaryShare;
  const vSwap = volume - vBuy;
  const sale = vBuy / shape.yesPrice; // face value of YES sold through buy_yes
  const bounty = sale * (1 - shape.yesPrice); // sponsor budget consumed
  const settled = sale * (1 + shape.pairRatio); // open interest that settles: sale + mint_pair
  const bountyFee = (bounty * (1 - shape.bypass) * fees.bountyBps) / 1e4;
  const entryFee = (vBuy * (1 - shape.bypass) * fees.entryBps) / 1e4;
  const settleFee = (settled * fees.settleBps) / 1e4;
  const swapFee = (vSwap * fees.swapProtocolBps) / 1e4;
  const revenue = bountyFee + entryFee + settleFee + swapFee;
  return { vBuy, vSwap, sale, bounty, settled, bountyFee, entryFee, settleFee, swapFee, revenue };
}

const take = monthly(1).revenue; // effective take rate R / V of the base case
const tiers = TIERS.map((t) => ({ ...t, ...monthly(t.volume) }));
const price0 = TOKEN.fdv / TOKEN.supply;
const bucket = (name: string) => BUCKETS.find((b) => b.name === name)!;
const lpUsdc = (TOKEN.supply * bucket("Locked LP (token side)").pct * price0) / 100;
const salePct = bucket("Public sale").pct;
const unlocked = (b: Bucket, t: number) => b.tge + (1 - b.tge) * Math.min(1, Math.max(0, (t - b.cliff) / b.vest));

// ---------------------------------------------------------------------------------------------------------------------
// Ledger replay: the fees must not break `vault == budget + yes_supply` or lose a base unit of USDC
// ---------------------------------------------------------------------------------------------------------------------

function replay(winner: "yes" | "no") {
  const ceil = (x: bigint, bps: number) => (x * BigInt(bps) + 9_999n) / 10_000n; // fees round toward the protocol
  const priceBps = BigInt(Math.round(MARKET.yesPrice * 1e4));
  const start = 100_000_000_000n; // 100,000 USDC held by users
  let users = start;
  let vault = 0n;
  let protocol = 0n;
  let budget = 0n;
  let yes = 0n;
  let no = 0n;
  let sponsorNo = 0n;
  const open = () => {
    assert.equal(yes, no + sponsorNo, "YES supply = NO supply + sponsor_no");
    assert.equal(vault, budget + yes, "vault = budget + YES supply");
  };

  budget = 10_000_000_000n; // create_market: the sponsor deposits 10,000 USDC
  users -= budget;
  vault += budget;
  open();

  for (const amount of [5_000_000_000n, 1_234_567n * 1_000n + 1n, 3_000_000_001n]) {
    // buy_yes
    const paid = (amount * priceBps + 9_999n) / 10_000n; // the program rounds the price up
    const cover = amount - paid;
    const bountyFee = ceil(cover, FEES.bountyBps);
    const entryFee = ceil(paid, FEES.entryBps);
    assert.ok(budget >= cover + bountyFee, "budget covers the bounty and its fee");
    users -= paid + entryFee;
    vault += paid;
    protocol += entryFee;
    vault -= bountyFee; // the sponsor's fee leaves the vault with the same amount taken off `budget`
    protocol += bountyFee;
    budget -= cover + bountyFee;
    yes += amount;
    sponsorNo += amount;
    open();
    // F1 + F2 are 1% of face whatever the price (up to rounding)
    const bps = BigInt(FEES.bountyBps);
    assert.ok((bountyFee + entryFee) * 10_000n - amount * bps < 20_000n, "F1 + F2 = 1% of face");
  }

  const pair = 2_000_000_000n; // mint_pair: 2,000 USDC for 2,000 YES + 2,000 NO
  users -= pair;
  vault += pair;
  yes += pair;
  no += pair;
  open();

  // resolve; every winning token redeems less F3, in three uneven claims, then the sponsor takes the rest
  const claims = winner === "yes" ? yes : no + sponsorNo;
  for (const claim of [claims / 3n, claims / 7n, claims - claims / 3n - claims / 7n]) {
    const fee = ceil(claim, FEES.settleBps);
    users += claim - fee;
    protocol += fee;
    vault -= claim;
  }
  users += budget; // withdraw_budget: the unspent budget
  vault -= budget;
  assert.equal(vault, 0n, "the vault empties");
  assert.equal(users + protocol, start, "no USDC is created or lost");
  return protocol;
}
const replayed = { yes: replay("yes"), no: replay("no") };
const face = 5_000_000_000n + 1_234_567_001n + 3_000_000_001n; // YES sold through buy_yes in the replay
const faceTotal = Number(face) / 1e6;
const poolOi = (faceTotal + 2_000) * 1e6; // sale + mint_pair open interest, in base units

// ---------------------------------------------------------------------------------------------------------------------
// 1. Revenue mechanics
// ---------------------------------------------------------------------------------------------------------------------

show(
  "1a. Fees on a $10,000 bounty that sells out (no pair mints), by YES price",
  table(
    [
      "YES price p",
      "YES sold (face)",
      "Buyers pay",
      "F1 bounty 1%",
      "F2 entry 1%",
      "F1+F2",
      "F3 settle 0.5%",
      "Total",
      "Total / face",
    ],
    [0.2, 0.4, 0.6, 0.8].map((p) => {
      const sale = 10_000 / (1 - p);
      const f1 = (10_000 * FEES.bountyBps) / 1e4;
      const f2 = (sale * p * FEES.entryBps) / 1e4;
      const f3 = (sale * FEES.settleBps) / 1e4;
      return [
        pct(p, 0),
        usd(sale),
        usd(sale * p),
        usd(f1),
        usd(f2),
        usd(f1 + f2),
        usd(f3),
        usd(f1 + f2 + f3),
        pct((f1 + f2 + f3) / sale),
      ];
    }),
  ),
);

show(
  "1b. What the toll costs each side, per YES",
  table(
    [
      "YES price p",
      "Doer pays (p + F2)",
      "Doer receives on YES (1 - F3)",
      "Doer break-even probability",
      "Sponsor bounty cost (1-p)(1+F1)",
    ],
    [0.2, 0.4, 0.6, 0.8].map((p) => {
      const pays = p * (1 + FEES.entryBps / 1e4);
      const gets = 1 - FEES.settleBps / 1e4;
      return [
        pct(p, 0),
        pays.toFixed(4),
        gets.toFixed(4),
        pct(pays / gets),
        ((1 - p) * (1 + FEES.bountyBps / 1e4)).toFixed(4),
      ];
    }),
  ),
);

show(
  "1c. Revenue vs. fee level when the number of trades falls exponentially with the fee (f* = mean edge)",
  table(
    ["fee / f*", "Revenue vs. maximum: x e^(1-x)", "Volume vs. zero-fee volume: e^(-x)"],
    [0.25, 1 / 3, 0.5, 2 / 3, 1, 1.5, 2].map((x) => [x.toFixed(2), pct(x * Math.exp(1 - x), 1), pct(Math.exp(-x), 1)]),
  ),
);

console.log(
  `\nLedger replay passed (YES wins, NO wins). Protocol fees on ${usd(faceTotal)} of YES sold plus a ${usd(2_000)} pair mint: ` +
    `${usd(Number(replayed.yes) / 1e6)} (YES wins), ${usd(Number(replayed.no) / 1e6)} (NO wins); ` +
    `${pct(Number(replayed.yes) / poolOi, 3)} of the ${usd(poolOi / 1e6)} of open interest.`,
);

// ---------------------------------------------------------------------------------------------------------------------
// 2. Token distribution
// ---------------------------------------------------------------------------------------------------------------------

show(
  `2a. Allocation (supply ${tokens(TOKEN.supply)}, launch FDV ${usd(TOKEN.fdv)}, price ${usd(price0 * 1e3)}/1000 tokens)`,
  table(
    ["Bucket", "%", "Tokens", "Value at launch", "At TGE", "Cliff", "Release after the cliff"],
    BUCKETS.map((b) => [
      b.name,
      `${b.pct}%`,
      tokens((TOKEN.supply * b.pct) / 100),
      usd((TOKEN.supply * b.pct * price0) / 100),
      b.inPool ? "in pool, position locked" : pct(b.tge, 0),
      b.cliff ? `${b.cliff} months` : "none",
      `linear over ${b.vest} months`,
    ]),
  ),
);

const months = [0, 3, 6, 9, 12, 18, 24, 30, 36, 42, 48];
const flow = (t: number) =>
  BUCKETS.filter((b) => !b.inPool).reduce((sum, b) => sum + b.pct * (unlocked(b, t) - unlocked(b, t - 1)), 0);
const free = (t: number) => BUCKETS.filter((b) => !b.inPool).reduce((sum, b) => sum + b.pct * unlocked(b, t), 0);
const lp = bucket("Locked LP (token side)");
show(
  "2b. Unlock curve (% of total supply)",
  table(
    [
      "Month",
      "Released, excluding LP",
      "Tradable, including pool tokens",
      "LP position withdrawable",
      "Unlocked in that month",
      "...as % of tradable supply",
    ],
    months.map((t) => [
      t,
      `${free(t).toFixed(1)}%`,
      `${(free(t) + lp.pct).toFixed(1)}%`,
      pct(unlocked(lp, t), 0),
      t === 0 ? "-" : `${flow(t).toFixed(2)}%`,
      t === 0 ? "-" : pct(flow(t) / (free(t - 1) + lp.pct), 1),
    ]),
  ),
);

const impact = (trade: number) => (1 + trade / lpUsdc) ** 2 - 1;
const saleProceeds = (TOKEN.supply * salePct * price0) / 100;
show(
  "2c. Launch pool",
  table(
    ["Item", "Value"],
    [
      [
        "Pool",
        `${tokens((TOKEN.supply * lp.pct) / 100)} tokens + ${usd(lpUsdc)} USDC = ${usd(2 * lpUsdc)} (${pct((2 * lpUsdc) / TOKEN.fdv, 0)} of FDV)`,
      ],
      ["Public sale proceeds", usd(saleProceeds)],
      ["Cash left after the USDC side of the pool", usd(saleProceeds - lpUsdc)],
      ["Price impact of a $10,000 buy (constant product, full range)", pct(impact(10_000))],
      ["Price impact of a $50,000 buy", pct(impact(50_000))],
    ],
  ),
);

// ---------------------------------------------------------------------------------------------------------------------
// 3. Yield
// ---------------------------------------------------------------------------------------------------------------------

const staked = [500_000, 2_000_000, 8_000_000, 32_000_000];
const annual = (revenue: number) => 12 * SPLIT.stakers * revenue;
show(
  "3a. Staker APR by staked value (flexible stake, no lock boost)",
  table(
    ["Tier", "Annual staker pool", ...staked.map((s) => `${usd(s)} staked`)],
    tiers.map((t) => [t.name, usd(annual(t.revenue)), ...staked.map((s) => pct(annual(t.revenue) / s, 1))]),
  ),
);

const meanWeight = LOCK_MONTHS.reduce((sum, m, i) => sum + LOCK_MIX[i]! * (1 + m / 18), 0);
const medium = tiers[1]!;
const mediumApr = annual(medium.revenue) / TOKEN.fdv / TOKEN.stakedShare;
show(
  `3b. Lock boost (weight = 1 + months/18; stake mix ${LOCK_MIX.map((m) => pct(m, 0)).join(" / ")}; mean weight ${meanWeight.toFixed(2)}), ` +
    `Medium tier at ${usd(TOKEN.fdv)} FDV with ${pct(TOKEN.stakedShare, 0)} of supply staked`,
  table(
    ["Lock", "Weight", "Share of pool per token vs. mean", "APR", "APY if rewards are re-staked monthly"],
    LOCK_MONTHS.map((m) => {
      const w = 1 + m / 18;
      const apr = (mediumApr * w) / meanWeight;
      return [
        m ? `${m} months` : "flexible",
        w.toFixed(2),
        `${(w / meanWeight).toFixed(2)}x`,
        pct(apr, 1),
        pct((1 + apr / 12) ** 12 - 1, 1),
      ];
    }),
  ),
);

const fairFdv = (revenue: number) => annual(revenue) / (TOKEN.stakedShare * TOKEN.requiredYield);
const revenueForFdv = (TOKEN.fdv * TOKEN.stakedShare * TOKEN.requiredYield) / (12 * SPLIT.stakers);
show(
  `3c. What the real yield supports (required yield ${pct(TOKEN.requiredYield, 0)}, ${pct(TOKEN.stakedShare, 0)} of supply staked)`,
  table(
    [
      "Tier",
      "Fair FDV = A / (staked share x required yield)",
      "Fair FDV / annualized revenue",
      `APR at ${usd(TOKEN.fdv)} FDV`,
    ],
    tiers.map((t) => [
      t.name,
      usd(fairFdv(t.revenue)),
      `${(fairFdv(t.revenue) / (12 * t.revenue)).toFixed(1)}x`,
      pct(annual(t.revenue) / (TOKEN.fdv * TOKEN.stakedShare), 1),
    ]),
  ) +
    `\n\nThe ${usd(TOKEN.fdv)} launch FDV is underwritten by fees once revenue reaches ${usd(revenueForFdv)} a month, ` +
    `which is ${usd(revenueForFdv / take)} of volume at the base-case take of ${pct(take)}. ` +
    `Rule of thumb at these parameters: fair FDV = ${fairFdv(take).toFixed(2)} x monthly fee-bearing volume.`,
);

// ---------------------------------------------------------------------------------------------------------------------
// 4. Volume tiers
// ---------------------------------------------------------------------------------------------------------------------

show(
  "4a. Monthly fee revenue (profit before the split)",
  table(
    ["", ...tiers.map((t) => t.name)],
    [
      ["Fee-bearing volume V", ...tiers.map((t) => usd(t.volume))],
      [`  buy_yes notional (${pct(MARKET.primaryShare, 0)})`, ...tiers.map((t) => usd(t.vBuy))],
      [`  pool swap notional (${pct(1 - MARKET.primaryShare, 0)})`, ...tiers.map((t) => usd(t.vSwap))],
      ["YES sold, face value", ...tiers.map((t) => usd(t.sale))],
      ["Sponsor budget consumed", ...tiers.map((t) => usd(t.bounty))],
      ["Open interest settled", ...tiers.map((t) => usd(t.settled))],
      [`F1 bounty fee (${pct(FEES.bountyBps / 1e4)} of budget consumed)`, ...tiers.map((t) => usd(t.bountyFee))],
      [`F2 entry fee (${pct(FEES.entryBps / 1e4)} of buy_yes notional)`, ...tiers.map((t) => usd(t.entryFee))],
      [`F3 settlement fee (${pct(FEES.settleBps / 1e4)} of settled face)`, ...tiers.map((t) => usd(t.settleFee))],
      ["**Gross protocol revenue R**", ...tiers.map((t) => `**${usd(t.revenue)}**`)],
      ["R / V", ...tiers.map((t) => pct(t.revenue / t.volume))],
      [
        "Revenue floor if every sponsor bypasses buy_yes (F3 only)",
        ...tiers.map((t) => usd(monthly(t.volume, FEES, { ...MARKET, bypass: 1 }).revenue)),
      ],
    ],
  ),
);

const retained = SPLIT.growth + SPLIT.reserve;
const vStar = TIERS[0]!.opex / take / retained; // volume at which the treasury share alone covers the Low-tier opex
show(
  "4b. Where R goes, and what is left after opex",
  table(
    ["", ...tiers.map((t) => t.name)],
    [
      [`Stakers (${pct(SPLIT.stakers, 0)})`, ...tiers.map((t) => usd(t.revenue * SPLIT.stakers))],
      [`Locked LP / POL (${pct(SPLIT.pol, 0)})`, ...tiers.map((t) => usd(t.revenue * SPLIT.pol))],
      [`Growth & marketing (${pct(SPLIT.growth, 0)})`, ...tiers.map((t) => usd(t.revenue * SPLIT.growth))],
      [`Ops & security reserve (${pct(SPLIT.reserve, 0)})`, ...tiers.map((t) => usd(t.revenue * SPLIT.reserve))],
      ["Opex (assumed)", ...tiers.map((t) => usd(t.opex))],
      ["Operating profit (R - opex)", ...tiers.map((t) => usd(t.revenue - t.opex))],
      [`Treasury net (${pct(retained, 0)} of R, minus opex)`, ...tiers.map((t) => usd(t.revenue * retained - t.opex))],
      [
        "Cash runway at that net",
        ...tiers.map((t) => {
          const net = t.revenue * retained - t.opex;
          return net >= 0 ? "self-funding" : `${((saleProceeds - lpUsdc) / -net).toFixed(0)} months`;
        }),
      ],
    ],
  ) +
    `\n\nBreak-even volume: R = opex at ${tiers.map((t) => `${usd(t.opex / take)} (${t.name})`).join(", ")}; ` +
    `treasury self-funding (${pct(retained, 0)} of R = opex) at ${tiers.map((t) => `${usd(t.opex / take / retained)} (${t.name})`).join(", ")}. ` +
    `At the Low-tier cost base that is ${Math.round((vStar * monthly(1).bounty) / MARKET.fill / MARKET.avgBudget)} markets opened a month, ` +
    `or ${Math.round((vStar * monthly(1).bounty) / MARKET.fill / MARKET.avgBudget / MARKET.marketsPerSponsor)} sponsors at ${MARKET.marketsPerSponsor} each.`,
);

const posted = (t: (typeof tiers)[number]) => t.bounty / MARKET.fill;
show(
  `4c. What each tier needs on the ground (average bounty ${usd(MARKET.avgBudget)}, YES at ${pct(MARKET.yesPrice, 0)}, ${pct(MARKET.fill, 0)} of the budget used)`,
  table(
    ["", ...tiers.map((t) => t.name)],
    [
      ["Sponsor budget posted per month", ...tiers.map((t) => usd(posted(t)))],
      [
        "Markets opened per month",
        ...tiers.map((t) => Math.round(posted(t) / MARKET.avgBudget).toLocaleString("en-US")),
      ],
      [
        `Active sponsors at ${MARKET.marketsPerSponsor} markets a month`,
        ...tiers.map((t) =>
          Math.round(posted(t) / MARKET.avgBudget / MARKET.marketsPerSponsor).toLocaleString("en-US"),
        ),
      ],
      [
        "Implied pool turnover (swap volume / settled open interest)",
        ...tiers.map((t) => `${(t.vSwap / t.settled).toFixed(2)}x`),
      ],
      [
        "Monthly POL buy flow (half of the POL share buys the token)",
        ...tiers.map((t) => usd((t.revenue * SPLIT.pol) / 2)),
      ],
      [
        "POL depth added in 12 months, vs. the launch USDC side",
        ...tiers.map((t) => pct((12 * t.revenue * SPLIT.pol) / 2 / lpUsdc, 0)),
      ],
    ],
  ),
);

const month19 = flow(19) * (TOKEN.supply / 100) * price0;
show(
  "4d. Unlock pressure vs. POL buying at month 19, the first month the team and the LP both unlock (price held at launch)",
  table(
    ["Item", "Value"],
    [
      [
        "Tokens unlocked in month 19 (excluding LP)",
        `${tokens((flow(19) * TOKEN.supply) / 100)} = ${usd(month19)} at launch price`,
      ],
      ...tiers.map((t) => [`POL buy flow / unlock value, ${t.name}`, pct((t.revenue * SPLIT.pol) / 2 / month19, 0)]),
    ],
  ),
);

const sensitivityShare = [0.5, 1, 1.5, 2];
const sensitivityPairs = [0, 0.5, 1];
show(
  "4e. Take rate R / V by sale face per dollar of volume (= primary share / YES price) and pair ratio",
  table(
    ["Sale face / volume", "Example", ...sensitivityPairs.map((mu) => `pair ratio ${mu}`)],
    sensitivityShare.map((rho) => {
      const example = `${pct(rho * MARKET.yesPrice, 0)} primary at p = ${pct(MARKET.yesPrice, 0)}`;
      return [
        rho.toFixed(1),
        example,
        ...sensitivityPairs.map((mu) =>
          pct(monthly(1, FEES, { ...MARKET, primaryShare: rho * MARKET.yesPrice, pairRatio: mu }).revenue),
        ),
      ];
    }),
  ),
);

const noSettle = monthly(1, { ...FEES, settleBps: 0 }).revenue;
const withSwap = monthly(1, { ...FEES, swapProtocolBps: 20 }).revenue;
show(
  "4f. Fee levers (take rate R / V in the base case)",
  table(
    ["Case", "R / V", "vs. base"],
    [
      ["Base: F1 1% + F2 1% + F3 0.5%", pct(take), "-"],
      ["F3 off (README's 1:1 redemption kept)", pct(noSettle), pct(noSettle / take - 1, 0)],
      ["F4 on: 0.20% protocol share of pool swaps", pct(withSwap), `+${pct(withSwap / take - 1, 0)}`],
      ...[0.25, 0.5, 1].map((bypass) => {
        const r = monthly(1, FEES, { ...MARKET, bypass }).revenue;
        return [`${pct(bypass, 0)} of the sale volume bypasses buy_yes (F3 unaffected)`, pct(r), pct(r / take - 1, 0)];
      }),
    ],
  ),
);

const stakedUsd = TOKEN.fdv * TOKEN.stakedShare;
show(
  `4g. Split sensitivity, ${medium.name} tier (POL and reserve fixed, growth takes the difference)`,
  table(
    ["Staker share", "Growth share", `Staker APR at ${usd(stakedUsd)} staked`, "Treasury net after opex"],
    [0.3, 0.4, 0.5].map((s) => {
      const growth = 1 - s - SPLIT.pol - SPLIT.reserve;
      return [
        pct(s, 0),
        pct(growth, 0),
        pct((12 * s * medium.revenue) / stakedUsd, 1),
        usd(medium.revenue * (growth + SPLIT.reserve) - medium.opex),
      ];
    }),
  ),
);

const marketSale = (MARKET.fill * MARKET.avgBudget) / (1 - MARKET.yesPrice);
const feePerMarket = monthly((marketSale * MARKET.yesPrice) / MARKET.primaryShare).revenue - monthly(0).revenue;
const lifetime = 6;
const ltv = feePerMarket * MARKET.marketsPerSponsor * lifetime;
show(
  `4h. Growth test: one sponsor opening ${MARKET.marketsPerSponsor} markets a month for ${lifetime} months`,
  table(
    ["Item", "Value"],
    [
      ["YES sold per market (face)", usd(marketSale)],
      ["Protocol fees per market (F1 + F2 + F3 and the pool swap share)", usd(feePerMarket)],
      ["Lifetime fees (LTV)", usd(ltv)],
      ["Acquisition cost ceiling at LTV/CAC = 3", usd(ltv / 3)],
      ["Acquisition cost ceiling at LTV/CAC = 1 (break-even)", usd(ltv)],
    ],
  ),
);

const floorTake = monthly(1, FEES, { ...MARKET, bypass: 1 }).revenue;
const marketsFor = (volume: number) => Math.round((volume * monthly(1).bounty) / MARKET.fill / MARKET.avgBudget);
const lowOpex = TIERS[0]!.opex;
show(
  `4i. Volume thresholds at the Low-tier cost base of ${usd(lowOpex)} a month`,
  table(
    ["Condition", "Monthly volume", "Markets opened per month"],
    (
      [
        ["Gross revenue R covers opex", lowOpex / take],
        ["The treasury share (growth + reserve) covers opex", vStar],
        [`Fees underwrite the ${usd(TOKEN.fdv)} launch FDV (3c)`, revenueForFdv / take],
        ["The treasury share covers opex if every sponsor bypasses buy_yes (F3 only)", lowOpex / floorTake / retained],
      ] as [string, number][]
    ).map(([label, volume]) => [label, usd(volume), marketsFor(volume).toLocaleString("en-US")]),
  ),
);
