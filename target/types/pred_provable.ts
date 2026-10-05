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
    "description": "Provable KPI Markets: outcome-token markets resolved by on-chain account reads"
  },
  "instructions": [
    {
      "name": "addLiquidity",
      "docs": [
        "Deposit YES and NO into the guarded pool for LP shares. The first deposit sets the price."
      ],
      "discriminator": [
        181,
        157,
        89,
        67,
        143,
        182,
        52,
        72
      ],
      "accounts": [
        {
          "name": "provider",
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
          "name": "metricAccount"
        },
        {
          "name": "yesMint"
        },
        {
          "name": "noMint"
        },
        {
          "name": "lpMint",
          "docs": [
            "Pool shares. Created with the pool by its first provider."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  112,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "market"
              }
            ]
          }
        },
        {
          "name": "poolYesAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "market"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "yesMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "poolNoAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "market"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "noMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "providerYesAccount",
          "writable": true
        },
        {
          "name": "providerNoAccount",
          "writable": true
        },
        {
          "name": "providerLpAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "provider"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "lpMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "maxYes",
          "type": "u64"
        },
        {
          "name": "maxNo",
          "type": "u64"
        },
        {
          "name": "minShares",
          "type": "u64"
        }
      ]
    },
    {
      "name": "burnPair",
      "docs": [
        "Anyone: burn equal YES and NO for their USDC back, 1:1, until resolution."
      ],
      "discriminator": [
        145,
        2,
        176,
        194,
        32,
        205,
        57,
        214
      ],
      "accounts": [
        {
          "name": "owner",
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
          "name": "yesMint",
          "writable": true
        },
        {
          "name": "noMint",
          "writable": true
        },
        {
          "name": "ownerYesAccount",
          "writable": true
        },
        {
          "name": "ownerNoAccount",
          "writable": true
        },
        {
          "name": "usdcMint",
          "address": "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
        },
        {
          "name": "vault",
          "writable": true
        },
        {
          "name": "ownerUsdcAccount",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "buyYes",
      "docs": [
        "Buy YES at the sponsor's fixed price before the cutoff and before the metric is met.",
        "The matching NO is booked to the sponsor in `Market::sponsor_no`."
      ],
      "discriminator": [
        124,
        76,
        113,
        130,
        177,
        112,
        187,
        104
      ],
      "accounts": [
        {
          "name": "buyer",
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
          "name": "metricAccount"
        },
        {
          "name": "yesMint",
          "writable": true
        },
        {
          "name": "buyerYesAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "buyer"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "yesMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "usdcMint",
          "address": "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
        },
        {
          "name": "vault",
          "writable": true
        },
        {
          "name": "buyerUsdcAccount",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createMarket",
      "docs": [
        "Sponsor opens a market, creates its YES/NO mints and USDC vault, and deposits the bounty budget."
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
          "name": "yesMint",
          "docs": [
            "Only the market can mint, and there is no freeze authority, so nobody can stop",
            "holders from trading or redeeming."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  121,
                  101,
                  115,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "market"
              }
            ]
          }
        },
        {
          "name": "noMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  111,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "market"
              }
            ]
          }
        },
        {
          "name": "usdcMint",
          "address": "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
        },
        {
          "name": "vault",
          "docs": [
            "Holds the budget and all collateral. Only the market can move it."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "market"
              }
            ]
          }
        },
        {
          "name": "sponsorUsdcAccount",
          "writable": true
        },
        {
          "name": "target"
        },
        {
          "name": "metricAccount"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
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
      "name": "mintPair",
      "docs": [
        "Anyone: deposit USDC for the same number of YES and NO tokens, 1:1, until resolution."
      ],
      "discriminator": [
        19,
        149,
        94,
        110,
        181,
        186,
        33,
        107
      ],
      "accounts": [
        {
          "name": "owner",
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
          "name": "yesMint",
          "writable": true
        },
        {
          "name": "noMint",
          "writable": true
        },
        {
          "name": "ownerYesAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "yesMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "ownerNoAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "noMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "usdcMint",
          "address": "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
        },
        {
          "name": "vault",
          "writable": true
        },
        {
          "name": "ownerUsdcAccount",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "redeem",
      "docs": [
        "Burn winning outcome tokens for USDC, 1:1."
      ],
      "discriminator": [
        184,
        12,
        86,
        149,
        70,
        196,
        97,
        225
      ],
      "accounts": [
        {
          "name": "owner",
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
          "name": "winningMint",
          "docs": [
            "Checked against the outcome in the handler, so an open market reports `NotResolved`."
          ],
          "writable": true
        },
        {
          "name": "ownerTokens",
          "writable": true
        },
        {
          "name": "usdcMint",
          "address": "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
        },
        {
          "name": "vault",
          "writable": true
        },
        {
          "name": "ownerUsdcAccount",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": []
    },
    {
      "name": "removeLiquidity",
      "docs": [
        "Burn LP shares for a pro-rata cut of both reserves. Always open."
      ],
      "discriminator": [
        80,
        85,
        209,
        72,
        24,
        206,
        177,
        108
      ],
      "accounts": [
        {
          "name": "provider",
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
          "name": "yesMint"
        },
        {
          "name": "noMint"
        },
        {
          "name": "lpMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  112,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "market"
              }
            ]
          }
        },
        {
          "name": "poolYesAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "market"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "yesMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "poolNoAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "market"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "noMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "providerLpAccount",
          "writable": true
        },
        {
          "name": "providerYesAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "provider"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "yesMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "providerNoAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "provider"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "noMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "shares",
          "type": "u64"
        },
        {
          "name": "minYes",
          "type": "u64"
        },
        {
          "name": "minNo",
          "type": "u64"
        }
      ]
    },
    {
      "name": "resolve",
      "docs": [
        "Permissionless, instant resolution by reading the locked metric account."
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
    },
    {
      "name": "swap",
      "docs": [
        "Swap YES for NO or NO for YES on the pool; halts when the outcome becomes knowable."
      ],
      "discriminator": [
        248,
        198,
        158,
        145,
        225,
        117,
        135,
        200
      ],
      "accounts": [
        {
          "name": "trader",
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
          "name": "metricAccount"
        },
        {
          "name": "yesMint"
        },
        {
          "name": "noMint"
        },
        {
          "name": "poolYesAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "market"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "yesMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "poolNoAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "market"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "noMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "traderYesAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "trader"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "yesMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "traderNoAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "trader"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "noMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "tokenIn",
          "type": {
            "defined": {
              "name": "side"
            }
          }
        },
        {
          "name": "amountIn",
          "type": "u64"
        },
        {
          "name": "minOut",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdrawBudget",
      "docs": [
        "Sponsor takes back the budget no sale used once the sale is closed (or before any",
        "sale), and its NO collateral 1:1 once NO wins."
      ],
      "discriminator": [
        26,
        141,
        71,
        90,
        120,
        39,
        231,
        91
      ],
      "accounts": [
        {
          "name": "sponsor",
          "signer": true,
          "relations": [
            "market"
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
          }
        },
        {
          "name": "usdcMint",
          "address": "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
        },
        {
          "name": "vault",
          "writable": true
        },
        {
          "name": "sponsorUsdcAccount",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
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
    }
  ],
  "events": [
    {
      "name": "liquidityAdded",
      "discriminator": [
        154,
        26,
        221,
        108,
        238,
        64,
        217,
        161
      ]
    },
    {
      "name": "liquidityRemoved",
      "discriminator": [
        225,
        105,
        216,
        39,
        124,
        116,
        169,
        189
      ]
    },
    {
      "name": "marketCreated",
      "discriminator": [
        88,
        184,
        130,
        231,
        226,
        84,
        6,
        58
      ]
    },
    {
      "name": "pairBurned",
      "discriminator": [
        123,
        129,
        41,
        59,
        180,
        163,
        14,
        57
      ]
    },
    {
      "name": "pairMinted",
      "discriminator": [
        24,
        66,
        202,
        249,
        156,
        196,
        33,
        51
      ]
    },
    {
      "name": "redeemed",
      "discriminator": [
        14,
        29,
        183,
        71,
        31,
        165,
        107,
        38
      ]
    },
    {
      "name": "resolved",
      "discriminator": [
        148,
        46,
        187,
        66,
        35,
        1,
        255,
        147
      ]
    },
    {
      "name": "sponsorWithdrew",
      "discriminator": [
        153,
        69,
        92,
        7,
        30,
        147,
        232,
        242
      ]
    },
    {
      "name": "swapped",
      "discriminator": [
        217,
        52,
        52,
        83,
        147,
        135,
        96,
        109
      ]
    },
    {
      "name": "yesBought",
      "discriminator": [
        32,
        82,
        79,
        181,
        195,
        218,
        91,
        150
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
      "msg": "Amount is below the minimum"
    },
    {
      "code": 6002,
      "name": "invalidPrice",
      "msg": "yes_price_bps must be between 1 and 9999"
    },
    {
      "code": 6003,
      "name": "invalidMetricAccount",
      "msg": "Metric account does not match the resolver kind (owner, size or layout)"
    },
    {
      "code": 6004,
      "name": "mintAuthorityLive",
      "msg": "Mint authority must be revoked, otherwise supply can be faked by mint-then-burn"
    },
    {
      "code": 6005,
      "name": "alreadyImmutable",
      "msg": "Program is already immutable; the market would be decided at creation"
    },
    {
      "code": 6006,
      "name": "invalidEpoch",
      "msg": "Target epoch must be in the future"
    },
    {
      "code": 6007,
      "name": "programDataMismatch",
      "msg": "Program data account is not derived from the target program"
    },
    {
      "code": 6008,
      "name": "bettingClosed",
      "msg": "Betting is closed for this market"
    },
    {
      "code": 6009,
      "name": "budgetExhausted",
      "msg": "Sponsor budget cannot cover this purchase"
    },
    {
      "code": 6010,
      "name": "saleStillOpen",
      "msg": "The YES sale is still open"
    },
    {
      "code": 6011,
      "name": "metricAlreadyMet",
      "msg": "Metric is already met; betting is locked"
    },
    {
      "code": 6012,
      "name": "alreadyResolved",
      "msg": "Market is already resolved"
    },
    {
      "code": 6013,
      "name": "notResolved",
      "msg": "Market is not resolved yet"
    },
    {
      "code": 6014,
      "name": "notResolvableYet",
      "msg": "Market cannot be resolved yet"
    },
    {
      "code": 6015,
      "name": "cpiNotAllowed",
      "msg": "resolve must be a top-level instruction, not a CPI"
    },
    {
      "code": 6016,
      "name": "poolEmpty",
      "msg": "Pool has no liquidity"
    },
    {
      "code": 6017,
      "name": "slippageExceeded",
      "msg": "Result is worse than the caller's minimum"
    },
    {
      "code": 6018,
      "name": "notWinningMint",
      "msg": "Mint is not the winning outcome token"
    },
    {
      "code": 6019,
      "name": "nothingToRedeem",
      "msg": "No winning tokens to redeem"
    },
    {
      "code": 6020,
      "name": "mathOverflow",
      "msg": "Arithmetic overflow"
    },
    {
      "code": 6021,
      "name": "notUsdc",
      "msg": "Collateral mint must be USDC"
    },
    {
      "code": 6022,
      "name": "nothingToWithdraw",
      "msg": "Nothing to withdraw"
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
            "name": "yesPriceBps",
            "docs": [
              "What a buyer pays per YES, in basis points of its payout."
            ],
            "type": "u16"
          },
          {
            "name": "sponsorBudget",
            "docs": [
              "USDC the sponsor commits to cover the rest of each YES sold: the bounty."
            ],
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "liquidityAdded",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "market",
            "type": "pubkey"
          },
          {
            "name": "provider",
            "type": "pubkey"
          },
          {
            "name": "yesIn",
            "type": "u64"
          },
          {
            "name": "noIn",
            "type": "u64"
          },
          {
            "name": "shares",
            "type": "u64"
          },
          {
            "name": "poolYes",
            "type": "u64"
          },
          {
            "name": "poolNo",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "liquidityRemoved",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "market",
            "type": "pubkey"
          },
          {
            "name": "provider",
            "type": "pubkey"
          },
          {
            "name": "yesOut",
            "type": "u64"
          },
          {
            "name": "noOut",
            "type": "u64"
          },
          {
            "name": "shares",
            "type": "u64"
          },
          {
            "name": "poolYes",
            "type": "u64"
          },
          {
            "name": "poolNo",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "market",
      "docs": [
        "KPI market with outcome tokens. The sponsor funds a budget and sells YES at a fixed",
        "price. Each sale mints one YES to the buyer and books the matching NO to the sponsor",
        "in `sponsor_no`. The buyer pays the price and the budget covers the rest, so every",
        "YES is backed by exactly one USDC base unit held in the market's vault. The winning",
        "side redeems 1:1 for it.",
        "",
        "Invariants while the market is open:",
        "`yes_supply == no_supply + sponsor_no` and `vault == budget + yes_supply`."
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
              "`Immutable`, where it is the derived ProgramData address, and `LockedAtLeast`,",
              "where it is the incinerator's associated token account). Locked at creation."
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
              "Last slot (exclusive) in which YES can be bought."
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
            "name": "yesMint",
            "type": "pubkey"
          },
          {
            "name": "noMint",
            "type": "pubkey"
          },
          {
            "name": "vault",
            "docs": [
              "USDC token account owned by this market. Holds the unspent budget plus one base unit",
              "per YES/NO pair."
            ],
            "type": "pubkey"
          },
          {
            "name": "yesPriceBps",
            "docs": [
              "What a buyer pays per YES, in basis points of its payout. The sponsor's",
              "bounty per YES is the remaining `BPS_DENOMINATOR - yes_price_bps`."
            ],
            "type": "u16"
          },
          {
            "name": "budget",
            "docs": [
              "Sponsor USDC still available to cover future sales. Withdrawable after the sale closes."
            ],
            "type": "u64"
          },
          {
            "name": "sponsorNo",
            "docs": [
              "NO owed to the sponsor for every YES the sale minted. Kept as a balance instead of",
              "tokens so the sponsor cannot burn it against YES to unwind the sale while it is open,",
              "and the sale never depends on a token account the sponsor controls. Paid out by",
              "`withdraw_budget` if NO wins."
            ],
            "type": "u64"
          },
          {
            "name": "poolYes",
            "docs": [
              "Reserves of the guarded YES/NO pool. Tracked here instead of read from the pool's token",
              "accounts, so tokens sent to the pool by hand cannot move its price."
            ],
            "type": "u64"
          },
          {
            "name": "poolNo",
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
      "name": "marketCreated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "market",
            "type": "pubkey"
          },
          {
            "name": "sponsor",
            "type": "pubkey"
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
            "name": "target",
            "type": "pubkey"
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
            "name": "yesPriceBps",
            "type": "u16"
          },
          {
            "name": "budget",
            "type": "u64"
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
      "name": "pairBurned",
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
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "pairMinted",
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
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "redeemed",
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
            "name": "outcome",
            "type": {
              "defined": {
                "name": "outcome"
              }
            }
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "resolved",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "market",
            "type": "pubkey"
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
            "name": "slot",
            "type": "u64"
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
        "mint with no authority, a revoked authority, tokens locked under the",
        "incinerator, or stake frozen at the epoch boundary."
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
          },
          {
            "name": "mintAuthorityRevoked"
          },
          {
            "name": "freezeAuthorityRevoked"
          },
          {
            "name": "lockedAtLeast"
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
    },
    {
      "name": "sponsorWithdrew",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "market",
            "type": "pubkey"
          },
          {
            "name": "sponsor",
            "type": "pubkey"
          },
          {
            "name": "budget",
            "docs": [
              "Unspent budget paid out."
            ],
            "type": "u64"
          },
          {
            "name": "sponsorNo",
            "docs": [
              "The sponsor's NO paid out, 1:1, because NO won."
            ],
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "swapped",
      "docs": [
        "Reserves are after the swap, so the YES price is `pool_no / (pool_yes + pool_no)`."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "market",
            "type": "pubkey"
          },
          {
            "name": "trader",
            "type": "pubkey"
          },
          {
            "name": "tokenIn",
            "type": {
              "defined": {
                "name": "side"
              }
            }
          },
          {
            "name": "amountIn",
            "type": "u64"
          },
          {
            "name": "amountOut",
            "type": "u64"
          },
          {
            "name": "poolYes",
            "type": "u64"
          },
          {
            "name": "poolNo",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "yesBought",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "market",
            "type": "pubkey"
          },
          {
            "name": "buyer",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "price",
            "docs": [
              "USDC the buyer paid; the budget covered `amount - price`."
            ],
            "type": "u64"
          },
          {
            "name": "budgetLeft",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "constants": [
    {
      "name": "bpsDenominator",
      "docs": [
        "YES price is quoted in basis points of the token's payout."
      ],
      "type": "u64",
      "value": "10000"
    },
    {
      "name": "lpMintSeed",
      "type": "bytes",
      "value": "[108, 112, 95, 109, 105, 110, 116]"
    },
    {
      "name": "marketSeed",
      "type": "bytes",
      "value": "[109, 97, 114, 107, 101, 116]"
    },
    {
      "name": "minStake",
      "docs": [
        "Smallest sponsor budget, YES purchase, pair mint and first pool deposit: 1 USDC. Keeps dust out."
      ],
      "type": "u64",
      "value": "1000000"
    },
    {
      "name": "noMintSeed",
      "type": "bytes",
      "value": "[110, 111, 95, 109, 105, 110, 116]"
    },
    {
      "name": "outcomeDecimals",
      "docs": [
        "Outcome tokens use USDC's decimals, so one base unit redeems for exactly one USDC base unit."
      ],
      "type": "u8",
      "value": "6"
    },
    {
      "name": "swapFeeBps",
      "docs": [
        "Pool swap fee, kept in the pool for liquidity providers."
      ],
      "type": "u64",
      "value": "100"
    },
    {
      "name": "usdcDecimals",
      "type": "u8",
      "value": "6"
    },
    {
      "name": "usdcMint",
      "docs": [
        "Collateral for every market. Circle's devnet USDC by default; build with",
        "`--features mainnet` for mainnet USDC."
      ],
      "type": "pubkey",
      "value": "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
    },
    {
      "name": "vaultSeed",
      "docs": [
        "The market's USDC vault: a token account owned by the market PDA at a program-derived",
        "address, so nobody else can create it first and block `create_market`."
      ],
      "type": "bytes",
      "value": "[118, 97, 117, 108, 116]"
    },
    {
      "name": "yesMintSeed",
      "type": "bytes",
      "value": "[121, 101, 115, 95, 109, 105, 110, 116]"
    }
  ]
};
