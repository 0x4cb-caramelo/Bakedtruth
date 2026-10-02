/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/pred_provable.json`.
 */
export type PredProvable = {
  "address": "F9KfegHTBzeHmkhUxgvpTzYD8xvwRmV3sue2BVXiKoE2",
  "metadata": {
    "name": "predProvable",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Provable KPI Markets: pari-mutuel markets resolved by on-chain account reads"
  },
  "instructions": [
    {
      "name": "claim",
      "docs": [
        "Pari-mutuel payout to a winning position; closes the position."
      ],
      "discriminator": [
        62,
        198,
        214,
        193,
        213,
        159,
        108,
        210
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true,
          "relations": [
            "position"
          ]
        },
        {
          "name": "market",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "market.sponsor",
                "account": "market"
              },
              {
                "kind": "account",
                "path": "market.marketId",
                "account": "market"
              }
            ]
          },
          "relations": [
            "position"
          ]
        },
        {
          "name": "position",
          "docs": [
            "Closing the position is what prevents a double claim."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  115,
                  105,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "market"
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "createMarket",
      "docs": [
        "Sponsor opens a market and seeds the NO pool (the bounty)."
      ],
      "discriminator": [
        103,
        226,
        97,
        235,
        200,
        188,
        251,
        254
      ],
      "accounts": [
        {
          "name": "sponsor",
          "writable": true,
          "signer": true
        },
        {
          "name": "market",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "sponsor"
              },
              {
                "kind": "arg",
                "path": "args.marketId"
              }
            ]
          }
        },
        {
          "name": "sponsorPosition",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  115,
                  105,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "market"
              },
              {
                "kind": "account",
                "path": "sponsor"
              }
            ]
          }
        },
        {
          "name": "target"
        },
        {
          "name": "metricAccount"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": {
              "name": "createMarketArgs"
            }
          }
        }
      ]
    },
    {
      "name": "placeBet",
      "docs": [
        "Stake on YES or NO before the cutoff and before the metric is met."
      ],
      "discriminator": [
        222,
        62,
        67,
        220,
        63,
        166,
        126,
        33
      ],
      "accounts": [
        {
          "name": "bettor",
          "writable": true,
          "signer": true
        },
        {
          "name": "market",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "market.sponsor",
                "account": "market"
              },
              {
                "kind": "account",
                "path": "market.marketId",
                "account": "market"
              }
            ]
          }
        },
        {
          "name": "position",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  115,
                  105,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "market"
              },
              {
                "kind": "account",
                "path": "bettor"
              }
            ]
          }
        },
        {
          "name": "metricAccount"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "side",
          "type": {
            "defined": {
              "name": "side"
            }
          }
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "resolve",
      "docs": [
        "Permissionless resolution by reading the locked metric account."
      ],
      "discriminator": [
        246,
        150,
        236,
        206,
        108,
        63,
        58,
        10
      ],
      "accounts": [
        {
          "name": "market",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "market.sponsor",
                "account": "market"
              },
              {
                "kind": "account",
                "path": "market.marketId",
                "account": "market"
              }
            ]
          }
        },
        {
          "name": "metricAccount"
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "market",
      "discriminator": [
        219,
        190,
        213,
        55,
        0,
        227,
        198,
        154
      ]
    },
    {
      "name": "position",
      "discriminator": [
        170,
        188,
        143,
        228,
        122,
        64,
        247,
        208
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidSchedule",
      "msg": "cutoff_slot must be in the future and no later than deadline_slot"
    },
    {
      "code": 6001,
      "name": "stakeTooSmall",
      "msg": "Stake is below the minimum"
    },
    {
      "code": 6002,
      "name": "invalidMetricAccount",
      "msg": "Metric account does not match the resolver kind (owner, size or layout)"
    },
    {
      "code": 6003,
      "name": "mintAuthorityLive",
      "msg": "Mint authority must be revoked, otherwise supply can be faked by mint-then-burn"
    },
    {
      "code": 6004,
      "name": "alreadyImmutable",
      "msg": "Program is already immutable; the market would be decided at creation"
    },
    {
      "code": 6005,
      "name": "invalidEpoch",
      "msg": "Target epoch must be in the future"
    },
    {
      "code": 6006,
      "name": "programDataMismatch",
      "msg": "Program data account is not derived from the target program"
    },
    {
      "code": 6007,
      "name": "bettingClosed",
      "msg": "Betting is closed for this market"
    },
    {
      "code": 6008,
      "name": "metricAlreadyMet",
      "msg": "Metric is already met; betting is locked"
    },
    {
      "code": 6009,
      "name": "alreadyResolved",
      "msg": "Market is already resolved"
    },
    {
      "code": 6010,
      "name": "notResolved",
      "msg": "Market is not resolved yet"
    },
    {
      "code": 6011,
      "name": "notResolvableYet",
      "msg": "Market cannot be resolved yet"
    },
    {
      "code": 6012,
      "name": "cpiNotAllowed",
      "msg": "resolve must be a top-level instruction, not a CPI"
    },
    {
      "code": 6013,
      "name": "alreadyClaimed",
      "msg": "Position already claimed"
    },
    {
      "code": 6014,
      "name": "mathOverflow",
      "msg": "Arithmetic overflow"
    }
  ],
  "types": [
    {
      "name": "createMarketArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "marketId",
            "type": "u64"
          },
          {
            "name": "kind",
            "type": {
              "defined": {
                "name": "resolverKind"
              }
            }
          },
          {
            "name": "metricThreshold",
            "type": "u64"
          },
          {
            "name": "cutoffSlot",
            "type": "u64"
          },
          {
            "name": "deadlineSlot",
            "type": "u64"
          },
          {
            "name": "sponsorStake",
            "docs": [
              "Sponsor's NO stake: the bounty paid to YES holders if the goal is hit."
            ],
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "market",
      "docs": [
        "Pari-mutuel KPI market. The sponsor seeds the NO pool (pays out if the goal is",
        "hit); doers buy YES and then move the metric. Lamports are held by this account."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "sponsor",
            "type": "pubkey"
          },
          {
            "name": "marketId",
            "type": "u64"
          },
          {
            "name": "kind",
            "type": {
              "defined": {
                "name": "resolverKind"
              }
            }
          },
          {
            "name": "targetPubkey",
            "docs": [
              "Human-facing subject: mint, program id, or vote account."
            ],
            "type": "pubkey"
          },
          {
            "name": "metricAccount",
            "docs": [
              "Account actually read at resolution (equals `target_pubkey`, except for",
              "`Immutable`, where it is the derived ProgramData address). Locked at creation."
            ],
            "type": "pubkey"
          },
          {
            "name": "metricThreshold",
            "type": "u64"
          },
          {
            "name": "cutoffSlot",
            "docs": [
              "Last slot (exclusive) in which bets are accepted."
            ],
            "type": "u64"
          },
          {
            "name": "deadlineSlot",
            "docs": [
              "Last slot (inclusive) in which a ratchet metric may resolve YES."
            ],
            "type": "u64"
          },
          {
            "name": "yesPool",
            "type": "u64"
          },
          {
            "name": "noPool",
            "type": "u64"
          },
          {
            "name": "outcome",
            "type": {
              "defined": {
                "name": "outcome"
              }
            }
          },
          {
            "name": "resolvedSlot",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "outcome",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "open"
          },
          {
            "name": "yes"
          },
          {
            "name": "no"
          }
        ]
      }
    },
    {
      "name": "position",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "market",
            "type": "pubkey"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "yes",
            "type": "u64"
          },
          {
            "name": "no",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "resolverKind",
      "docs": [
        "Closed set of resolvers. Each variant fixes the owner and layout of the account",
        "it reads; there is deliberately no generic \"offset + comparator\" reader.",
        "",
        "Every variant reads state that flash capital cannot move: burned supply of a",
        "mint with no authority, a revoked upgrade authority, or stake frozen at the",
        "epoch boundary."
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "supplyAtMost"
          },
          {
            "name": "immutable"
          },
          {
            "name": "stakeAtLeast",
            "fields": [
              {
                "name": "epoch",
                "type": "u64"
              }
            ]
          }
        ]
      }
    },
    {
      "name": "side",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "yes"
          },
          {
            "name": "no"
          }
        ]
      }
    }
  ],
  "constants": [
    {
      "name": "marketSeed",
      "type": "bytes",
      "value": "[109, 97, 114, 107, 101, 116]"
    },
    {
      "name": "minStakeLamports",
      "docs": [
        "Smallest stake accepted on either side, in lamports. Keeps dust positions out."
      ],
      "type": "u64",
      "value": "1000000"
    },
    {
      "name": "positionSeed",
      "type": "bytes",
      "value": "[112, 111, 115, 105, 116, 105, 111, 110]"
    }
  ]
};
