/**
 * Purpose: the Metro configuration of the React Native check: React Native 0.87.1's own defaults
 *          (`@react-native/metro-config`), so the SDK resolves and transforms as it would inside an
 *          Android app, plus what a folder outside the app needs to reach `packages/sdk`.
 * Version: 0.0.1
 * Sprint:  05 (SDK and the devnet cycle): the React Native check (proposal section 3.2)
 *
 * From React Native's defaults this keeps the `react-native` export condition and main fields,
 * the platforms, the Babel transformer and the two polyfills an app bundle starts with (console,
 * error guard). It drops one module: `react-native/setup-env`, the app runtime's own start-up,
 * which needs the `react-native` package and a device, and is not the SDK's code. The repository
 * root is watched and its `node_modules` searched, so `@brot/sdk/read` and `@brot/sdk/tx` resolve
 * through the root's workspace link (`node_modules/@brot/sdk`) and the package's `exports` map,
 * and `@solana/kit` resolves to the copy the SDK itself installs.
 */
const path = require("node:path");

const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");

const projectRoot = __dirname;
const repoRoot = path.resolve(projectRoot, "../..");

const defaults = getDefaultConfig(projectRoot);

/** Folders under the repository root Metro never needs: Git, the Rust build, the app's own build, this check's output. */
const SKIPPED = [".git", "target", "app/.next", "tests/react-native/build", "tests/react-native/.hermes"];
const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const blockList = SKIPPED.map((folder) => new RegExp(`^${escape(path.join(repoRoot, folder))}[/\\\\]`));

module.exports = mergeConfig(defaults, {
  projectRoot,
  watchFolders: [repoRoot],
  cacheStores: [],
  resolver: {
    nodeModulesPaths: [path.join(repoRoot, "node_modules"), path.join(projectRoot, "node_modules")],
    // Metro 0.87 already defaults to both; written out because the check depends on them. The source
    // extensions stay React Native's: an export target such as `@solana/kit`'s `dist/index.native.mjs`
    // resolves without `mjs` in `sourceExts` (checked on 2026-10-09).
    unstable_enablePackageExports: true,
    unstable_enableSymlinks: true,
    blockList,
  },
  serializer: {
    getModulesRunBeforeMainModule: () => [],
  },
  reporter: { update: () => {} },
});
