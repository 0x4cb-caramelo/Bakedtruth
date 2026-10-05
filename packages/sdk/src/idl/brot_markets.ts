/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/brot_markets.json`.
 */
export type BrotMarkets = {
  "address": "6G2d7Cv66MR1NayPabh5aL6ZThTx15WPxL3NU4N24uVN",
  "metadata": {
    "name": "brotMarkets",
    "version": "0.0.1",
    "spec": "0.1.0",
    "description": "Brot Markets: pot-based prediction markets resolved by on-chain account reads"
  },
  "instructions": [],
  "errors": [
    {
      "code": 6000,
      "name": "mathOverflow",
      "msg": "Arithmetic overflow"
    },
    {
      "code": 6001,
      "name": "readerWrongOwner",
      "msg": "Account is not owned by the program this reader trusts"
    },
    {
      "code": 6002,
      "name": "readerBadLayout",
      "msg": "Account data does not match the layout this reader expects"
    },
    {
      "code": 6003,
      "name": "priceNotFullyVerified",
      "msg": "Price update was not fully verified by the Pyth receiver"
    },
    {
      "code": 6004,
      "name": "priceWrongFeed",
      "msg": "Price update is for another feed than the one expected"
    }
  ],
  "constants": [
    {
      "name": "bpsDenominator",
      "docs": [
        "Basis points in 100%."
      ],
      "type": "u64",
      "value": "10000"
    },
    {
      "name": "capSeed",
      "docs": [
        "Global cap on the total held in open questions: `[\"cap\"]`."
      ],
      "type": "bytes",
      "value": "[99, 97, 112]"
    },
    {
      "name": "configSeed",
      "docs": [
        "Global configuration, one per program: `[\"config\"]`."
      ],
      "type": "bytes",
      "value": "[99, 111, 110, 102, 105, 103]"
    },
    {
      "name": "feeVaultSeed",
      "docs": [
        "Where collected fees wait for the sweep: `[\"fee_vault\"]`."
      ],
      "type": "bytes",
      "value": "[102, 101, 101, 95, 118, 97, 117, 108, 116]"
    },
    {
      "name": "maxFeeBps",
      "docs": [
        "Ceiling for the fee on the losing side. The admin can lower the fee of future questions,",
        "never raise it above this (product rule R-32)."
      ],
      "type": "u16",
      "value": "1000"
    },
    {
      "name": "minBet",
      "docs": [
        "Smallest bet, in USDC base units (1 USDC). Working default for founder question 3 of the",
        "technical plan, section 14.2."
      ],
      "type": "u64",
      "value": "1000000"
    },
    {
      "name": "positionSeed",
      "docs": [
        "One account per wallet and question, holding both sides: `[\"position\", question, bettor]`."
      ],
      "type": "bytes",
      "value": "[112, 111, 115, 105, 116, 105, 111, 110]"
    },
    {
      "name": "questionSeed",
      "docs": [
        "One account per question: `[\"question\", id]`."
      ],
      "type": "bytes",
      "value": "[113, 117, 101, 115, 116, 105, 111, 110]"
    },
    {
      "name": "usdcDecimals",
      "type": "u8",
      "value": "6"
    },
    {
      "name": "usdcMint",
      "docs": [
        "Collateral for every question. Circle devnet USDC by default; build with",
        "`--features mainnet` for mainnet USDC."
      ],
      "type": "pubkey",
      "value": "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
    },
    {
      "name": "vaultSeed",
      "docs": [
        "The USDC vault of a question, a token account at a program-derived address so nobody can",
        "create it first: `[\"vault\", question]`."
      ],
      "type": "bytes",
      "value": "[118, 97, 117, 108, 116]"
    }
  ]
};
