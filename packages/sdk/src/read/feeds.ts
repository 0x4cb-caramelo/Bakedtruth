/**
 * Purpose: the compiled lists of Pyth feeds a price campaign may name, one per cluster, as
 *          programs/brot-markets/src/feeds.rs compiles them (founder answer 1, 2026-10-09; TP 3.4.10 row 4).
 * Version: 0.1.0
 * Sprint:  05 (SDK); the lists are Sprint 04's
 *
 * A build with the `mainnet` feature compiles `MAINNET_FEEDS`; every other build, devnet's included,
 * compiles `DEVNET_FEEDS`. Append-only, as in the program; tests/sdk/constants.test.ts parses feeds.rs
 * and fails when the two copies differ. Each entry is the feed id in hex and Pyth's symbol.
 */

/** A feed id (64 hex characters, no prefix) and its Pyth symbol. */
export type FeedEntry = readonly [hex: string, symbol: string];

export const MAINNET_FEEDS: readonly FeedEntry[] = [
  ["e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43", "Crypto.BTC/USD"],
  ["ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace", "Crypto.ETH/USD"],
  ["0bbf28e9a841a1cc788f6a361b17ca072d0ea3098a1e5df1c3922d06719579ff", "Crypto.PYTH/USD"],
  ["ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d", "Crypto.SOL/USD"],
  ["eaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a", "Crypto.USDC/USD"],
  ["2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b", "Crypto.USDT/USD"],
  ["72b021217ca3fe68922a19aaf990109cb9d84e9ad004b4d2025ad6f529314419", "Crypto.BONK/USD"],
  ["4ca4beeca86f0d164160323817a4e42b10010a724c2217c6ee41b54cd4cc61fc", "Crypto.WIF/USD"],
  ["2b9ab1e972a281585084148ba1389800799bd4be63b957507db1349314e47445", "Crypto.AAVE/USD"],
  ["3d4a2bd9535be6ce8059d75eadeba507b043257321aa544717c56fa19b49e35d", "Crypto.RENDER/USD"],
  ["be9b59d178f0d6a97ab4c343bff2aa69caa1eaae3e9048a65788c529b125bb24", "Crypto.ZEC/USD"],
  ["b43660a5f790c69354b0729a5ef9d50d68f1df92107540210b9cccba1f947cc2", "Crypto.JTO/USD"],
  ["0a0408d619e9380abad35060f9192039ed5042fa6f82301d0e48bb52be830996", "Crypto.JUP/USD"],
  ["05ecd4597cd48fe13d6cc3596c62af4f9675aee06e2e0b94c06d8bee2b659e05", "Crypto.TNSR/USD"],
  ["eff7446475e218517566ea99e72a4abec2e1bd8498b43b7d8331e29dcb059389", "Crypto.W/USD"],
  ["c9d8b075a5c69303365ae23633d4e085199bf5c520a3b90fed1322a0342ffc33", "Crypto.WBTC/USD"],
  ["4279e31cc369bbcc2faf022b382b080e32a8e689ff20fbc530d2a603eb6cd98b", "Crypto.HYPE/USD"],
  ["514aed52ca5294177f20187ae883cec4a018619772ddce41efcc36a6448f5d5d", "Crypto.MEW/USD"],
  ["58cd29ef0e714c5affc44f269b2c1899a52da4169d7acc147b9da692e6953608", "Crypto.FARTCOIN/USD"],
  ["879551021853eec7a7dc827578e8e69da7e4fa8148339aa0d3d5296405be4b1a", "Crypto.TRUMP/USD"],
  ["6ec879b1e9963de5ee97e9c8710b742d6228252a5e2ca12d4ae81d7fe5ee8c5d", "Crypto.USDE/USD"],
  ["76fa85158bf14ede77087fe3ae472f66213f6ea2f5b411cb2de472794990fa5c", "Crypto.EURC/USD"],
  ["55f8289be7450f1ae564dd9798e49e7d797d89adbc54fe4f8c906b1fcb94b0c3", "Crypto.BNSOL/USD"],
  ["89875379e70f8fbadc17aef315adf3a8d5d160b811435537e03c97e8aac97d9c", "Crypto.BSOL/USD"],
  ["7358313661dcd4f842a1423aa4f7a05f009001c9113201c719621d3f1aa80a73", "Crypto.CLOUD/USD"],
  ["41f858bae36e7ee3f4a3a6d4f176f0893d4a261460a52763350d00f8648195ee", "Crypto.DSOL/USD"],
  ["f51570985c642c49c2d6e50156390fdba80bb6d5f7fa389d2f012ced4f7d208f", "Crypto.INF/USD"],
  ["67be9f519b95cf24338801051f9a808eff0a578ccb388db73b7f6fe1de019ffb", "Crypto.JITOSOL/USD"],
  ["c811abc82b4bad1f9bd711a2773ccaa935b03ecef974236942cec5e0eb845a3a", "Crypto.JLP/USD"],
  ["8f257aab6e7698bb92b15511915e593d6f8eae914452f781874754b03d0c612b", "Crypto.LBTC/USD"],
  ["3607bf4d7b78666bd3736c7aacaf2fd2bc56caa8667d3224971ebe3c0623292a", "Crypto.MNDE/USD"],
  ["c2289a6a43d2ce91c6f55caec370f4acc38a2ed477f58813334c6d03749ff2a4", "Crypto.MSOL/USD"],
  ["0a2425d43486780990d8b63543029e20556be51fd756cca584212f4d539611d4", "Crypto.USD1/USD"],
  ["3d824c7f7c26ed1c85421ecec8c754e6b52d66a4e45de20a9c9ea91de8b396f9", "Crypto.ZBTC/USD"],
  ["fce16340ad552578e1a59b7013cfa1cedafac3df3a7d4640554a4614a973cabd", "Crypto.DSOL/SOL.RR"],
  ["3e9961b890c4e77e9009c1a6d81dc556e24a3c190b02d1682c8f545c53b1d4a2", "Crypto.INF/SOL.RR"],
  ["01d577b07031e12635d2fb86af6ae938bdc2b6dba9602d8e8af34d44587566fc", "Crypto.JITOSOL/SOL.RR"],
  ["f8d8d6b6c866c8b2624fb5b679ae846738725e5fc887fa8e927c8d8645018a2b", "Crypto.JUPSOL/SOL.RR"],
  ["046e7c1cf187195ba3174028ab3be75be88382956f7d4d4b6b507e727370f284", "Crypto.MSOL/SOL.RR"],
  ["add6499a420f809bbebc0b22fbf68acb8c119023897f6ea801688e0d6e391af4", "Crypto.SSOL/SOL.RR"],
  ["2ad31d1c4a85fbf2156ce57fab4104124c5ef76a6386375ecfc8da1ed5ce1486", "Crypto.SYRUPUSDC/USDC.RR"],
  ["40ac3329933a6b5b65cf31496018c5764ac0567316146f7d0de00095886b480d", "Crypto.NAV.ACRED/USD"],
  ["675e36f84a6be779ed793c71eb5c03151e1866c125767f46933626e0610af84d", "Crypto.PST/USDC.RR"],
  ["7a01fca212788bba7c5bf8c9efd576a8a722f070d2c17596ff7bb609b8d5c3b9", "Crypto.PUMP/USD"],
  ["5d73a5953dc86c4773adc778c30e8a6dfc94c5c3a74d7ebb56dd5e70350f044a", "Crypto.NAV.USCC/USD"],
  ["dea78edd10cd7ae4524cc1744216788746306623bc3553014eeab6062860795d", "Crypto.NAV.USTB/USD"],
  ["67e031d1723e5c89e4a826d80b2f3b41a91b05ef6122d523b8829a02e0f563aa", "Equity.US.GLXY/USD"],
  ["f2b3ab1c49e35e881003c3c0482d18b181a1560b697b844c24c8f85aba1cab95", "Crypto.2Z/USD"],
  ["64c74ffd61574170cfaee65c54c8810adcf83f6c31f3c256d9a290dcbf4ff1a9", "Crypto.CASH/RD.RR"],
  ["df3320ef0f4617337b8dbb924f2aaa4f9db08f522a5435b44f9066c1ac4c7f95", "Crypto.CASH/USD"],
  ["36d77e389795b35ee2cb71bddb68677bac6d5405da8745cb6442352fecc25c14", "Crypto.HYUSD/JITOSOL.RR"],
  ["9773ee09043d14e7f33f19db04a9c86fdac2d409a3885534029f6bd077bdcd37", "Crypto.EHYUSD/JITOSOL.RR"],
  ["332e31d3fc656ca11dc8522f55791aa8dcd9dbeee0508ab880effc12a12b5c59", "Crypto.XSOL/JITOSOL.RR"],
  ["0292e0f405bcd4a496d34e48307f6787349ad2bcd8505c3d3a9f77d81a67a682", "Crypto.MET/USD"],
  ["142b804c658e14ff60886783e46e5a51bdf398b4871d9d8f7c28aa1585cad504", "Crypto.ORE/USD"],
  ["e616297dab48626eaacf6d030717b25823b13ae6520b83f4735bf8deec8e2c9a", "Crypto.SYRUPUSDC/USD"],
  ["8ed858a2214e892c9371694fb6c8a9037b6ed4052c4edf209f8cb988484e81d9", "Crypto.JUPUSD/USD"],
  ["a0eccdd47cacbacde31b058fe3e6eb56bc4e159c1304487eb5cf0dffd0581de1", "Crypto.RKUSOL/SOL.RR"],
  ["323647322045edff1a0928dca6628169a57afdea43a5f0d948115e3dcae9c1fb", "Crypto.NFALCON/USD.RR"],
  ["57d1e11bea1316c2f7263a39c2780685691585aae34eff39300f5db564501b17", "Crypto.NALPHA/USD.RR"],
  ["fd9397e6dfc968ff8eaa652c6e4b7dfdeb6fdc940afe90c23ca5acfa45d408e1", "Crypto.NBASIS/USD.RR"],
  ["8858dfaa8998ff44681aa145a8aa5b7772979b1d044a1bbf3cf5d971168baa85", "Crypto.NOPAL/USD.RR"],
  ["384986c9655ec6887dbd7f7430d864992f872db2c77ba5781a26b78dad277adc", "Crypto.NWISDOM/USD.RR"],
];

export const DEVNET_FEEDS: readonly FeedEntry[] = [
  ["e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43", "Crypto.BTC/USD"],
  ["ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace", "Crypto.ETH/USD"],
  ["0bbf28e9a841a1cc788f6a361b17ca072d0ea3098a1e5df1c3922d06719579ff", "Crypto.PYTH/USD"],
  ["ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d", "Crypto.SOL/USD"],
  ["eaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a", "Crypto.USDC/USD"],
  ["2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b", "Crypto.USDT/USD"],
  ["72b021217ca3fe68922a19aaf990109cb9d84e9ad004b4d2025ad6f529314419", "Crypto.BONK/USD"],
  ["4ca4beeca86f0d164160323817a4e42b10010a724c2217c6ee41b54cd4cc61fc", "Crypto.WIF/USD"],
  ["0a0408d619e9380abad35060f9192039ed5042fa6f82301d0e48bb52be830996", "Crypto.JUP/USD"],
  ["c9d8b075a5c69303365ae23633d4e085199bf5c520a3b90fed1322a0342ffc33", "Crypto.WBTC/USD"],
  ["58cd29ef0e714c5affc44f269b2c1899a52da4169d7acc147b9da692e6953608", "Crypto.FARTCOIN/USD"],
  ["f51570985c642c49c2d6e50156390fdba80bb6d5f7fa389d2f012ced4f7d208f", "Crypto.INF/USD"],
  ["67be9f519b95cf24338801051f9a808eff0a578ccb388db73b7f6fe1de019ffb", "Crypto.JITOSOL/USD"],
  ["c811abc82b4bad1f9bd711a2773ccaa935b03ecef974236942cec5e0eb845a3a", "Crypto.JLP/USD"],
  ["c2289a6a43d2ce91c6f55caec370f4acc38a2ed477f58813334c6d03749ff2a4", "Crypto.MSOL/USD"],
  ["add6499a420f809bbebc0b22fbf68acb8c119023897f6ea801688e0d6e391af4", "Crypto.SSOL/SOL.RR"],
  ["7a01fca212788bba7c5bf8c9efd576a8a722f070d2c17596ff7bb609b8d5c3b9", "Crypto.PUMP/USD"],
];

/** Which list a build compiles: `mainnet` only with the `mainnet` feature. */
export type FeedCluster = "mainnet" | "devnet";

/** The list a build for `cluster` compiles. */
export const feedsOf = (cluster: FeedCluster): readonly FeedEntry[] =>
  cluster === "mainnet" ? MAINNET_FEEDS : DEVNET_FEEDS;
