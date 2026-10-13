// Purpose: the Meteora Dynamic Bonding Curve (DBC) accounts the graduation kind (`DbcGraduated`) is tested on, for
//          scripts/capture-fixtures.ts: a `VirtualPool` at each migration stage, the configs that decide which curves
//          open (85 SOL and 11 SOL in wSOL, one in USDC) and a transfer-hook pool with its config, which it refuses.
// Version: 0.0.1
// Sprint:  after 05 (the sixth kind; docs/technical/meteora-readers-plan.md)
//
// Found with getProgramAccounts on mainnet on 2026-10-12. No stage-1 or stage-2 pool there has a config of 85 SOL or
// more in wSOL (42 and about 900 pools), so those two stages come from smaller curves; stage 3 has an 85 SOL one.

/** name -> [address, what it is, cluster the bytes come from], as in capture-fixtures.ts. */
export const DBC_FIXTURES: Record<string, [string, string, "mainnet"]> = {
  "dbc-pool-stage0": [
    "mxGZ5hpgCENm94f19rp8NoBd14E4YLXVe4ZFJXQP8S6",
    "Meteora DBC VirtualPool on the curve (stage 0), SPL Token base, 0.019 SOL raised of its config's 85",
    "mainnet",
  ],
  "dbc-config-85sol": [
    "4hHU3Uu4THMoWUG8fpTfbT921PeYJ1yni6NZEGfTLYRm",
    "Meteora DBC PoolConfig of dbc-pool-stage0: quote wSOL, migration_quote_threshold 85 SOL",
    "mainnet",
  ],
  "dbc-pool-stage1": [
    "5sNKeCx162vt6rJmiz2gARcax74HFtwPjGkxDg3zurdf",
    "Meteora DBC VirtualPool past the curve (stage 1, PostBondingCurve), on a 0.5 SOL config",
    "mainnet",
  ],
  "dbc-pool-stage2": [
    "9A3dtuE7mtdAShFDoVtZEyBdG1kJHym8DUkeR4VqxwF",
    "Meteora DBC VirtualPool in locked vesting (stage 2), on a 1 SOL config",
    "mainnet",
  ],
  "dbc-pool-stage3": [
    "2GDDUim6HEM58k1vwFcAZ8KT79jXic6eJiLWkgbBaNo9",
    "Meteora DBC VirtualPool migrated (stage 3, CreatedPool), 85 SOL raised on an 85 SOL config",
    "mainnet",
  ],
  "dbc-config-stage3": [
    "GXn7ng2QbEoGqUcNpuc2v7iqnez71waBsxEH4obiHVAB",
    "Meteora DBC PoolConfig of dbc-pool-stage3: quote wSOL, migration_quote_threshold 85 SOL",
    "mainnet",
  ],
  "dbc-pool-11sol": [
    "5r3zMQNJBDyyVThjK2ba3mffxKkE97x9Jvx6QVo8h8i5",
    "Meteora DBC VirtualPool on an 11 SOL config, a curve below the 85 SOL floor",
    "mainnet",
  ],
  "dbc-config-11sol": [
    "EiN7QibVnPq8kYUmxB8KtFCt9WgXpz17QyQRmapPnCUW",
    "Meteora DBC PoolConfig of dbc-pool-11sol: quote wSOL, migration_quote_threshold 11 SOL",
    "mainnet",
  ],
  "dbc-pool-usdc": [
    "7CLJhnNdfzr91eibB4L8r5PKP1L4nNmkjpWJCiGF1Sca",
    "Meteora DBC VirtualPool on the curve (stage 0) of a curve priced in USDC",
    "mainnet",
  ],
  "dbc-config-usdc": [
    "4Tr44n6TUwQvihe4vuBpNWvwUkHip5fyMCkrubXhseqt",
    "Meteora DBC PoolConfig of dbc-pool-usdc: quote USDC, migration_quote_threshold 1 USDC",
    "mainnet",
  ],
  "dbc-hook-pool": [
    "19FgvYumZoSwc5hxxH18QPsowjYURDAPHrPydSJ79Nv",
    "Meteora DBC TransferHookPool on the curve (stage 0), Token-2022 base: the same layout, refused",
    "mainnet",
  ],
  "dbc-hook-config": [
    "HKf3CHysP3YbCudWnYuBBwHSwSGE2GpjxmRakefUhjyX",
    "Meteora DBC ConfigWithTransferHook of dbc-hook-pool, 1,128 bytes: quote wSOL, 10 SOL",
    "mainnet",
  ],
};
