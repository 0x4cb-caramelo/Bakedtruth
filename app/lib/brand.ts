// Product name and copy in one place. The name is provisional (see docs/product/DESIGN-DIRECTION.md):
// renaming the site is a change to `name` here. Framework-free, like the rest of app/lib.

export const BRAND = {
  name: "baked",
  tagline: "KPI markets on Solana",
  headline: ["Promises are cheap.", "Proof is on-chain."],
  sub: "Trade verifiable goals on Solana. A sponsor funds the target, doers move the number, and the chain says when it is done.",
  motto: "Resolution is a read, not a judgement.",
  principles: [
    {
      title: "Resolution is a read",
      body: "Each market reads one on-chain account. No oracle, no committee, no dispute window.",
    },
    {
      title: "Backed 1:1 in USDC",
      body: "Every YES sits on one USDC in the market's vault. Winners redeem 1:1, any time after.",
    },
    {
      title: "Guarded trading",
      body: "Trading halts the moment a goal is met, so nobody buys a known winner at a stale price.",
    },
  ],
  /** What the mascot says when poked. It is quietly grumpy: short, dry, never salesy. */
  quips: [
    "Resolution is a read.",
    "Not a judgement.",
    "Prove it.",
    "I only believe accounts.",
    "No oracle. Just me, reading.",
    "Half-baked goals resolve NO.",
    "Fine. It checks out.",
  ],
} as const;
