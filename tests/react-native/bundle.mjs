/**
 * Purpose: one entry bundled as a React Native 0.87.1 Android release build makes it: Metro with
 *          `platform android`, `dev false`, `minify false` and the `default` transform profile, then
 *          hermesc with the Gradle plugin's flags, into Hermes bytecode.
 * Version: 0.0.1
 * Sprint:  05 (SDK and the devnet cycle): the React Native check (proposal section 3.2)
 *
 * The flags are React Native's own, read at tag v0.87.1: `TaskConfiguration.kt` sets
 * `minifyEnabled = !hermesEnabled` and `devEnabled = false` for a release variant;
 * `BundleHermesCTask.kt` runs `hermesc -w -emit-binary -max-diagnostic-width=80 -out <hbc> <js>`
 * with `ReactExtension.hermesFlags` (default `-O -output-source-map`); the CLI's
 * `--unstable-transform-profile` defaults to `default`. The source map lists every file the bundle
 * took, so the check can show which build of each package Metro resolved.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { relative } from "node:path";

const require = createRequire(import.meta.url);
const Metro = require("metro");

/** The hermesc React Native 0.87.1 pins (`hermes-compiler` 250829098.0.17), Linux x64. */
export const HERMESC = require.resolve("hermes-compiler/hermesc/linux64-bin/hermesc");

/** Metro's config, loaded once: React Native's defaults plus the repository root (metro.config.cjs). */
export const loadConfig = (configPath) => Metro.loadConfig({ config: configPath });

/**
 * Bundles `entry` into `out` (and `out.map`) for Android. Returns the bundle's size and the files it
 * holds, relative to `repoRoot`, from the source map.
 */
export async function bundleAndroid(config, { entry, out, repoRoot }) {
  await Metro.runBuild(config, {
    entry,
    out,
    platform: "android",
    dev: false,
    minify: false,
    sourceMap: true,
    sourceMapOut: `${out}.map`,
    unstable_transformProfile: "default",
  });
  // Metro writes an indexed map: one section per module, each with its own `sources`.
  const map = JSON.parse(readFileSync(`${out}.map`, "utf8"));
  const sections = map.sections ?? [{ map }];
  const sources = sections.flatMap((section) => section.map?.sources ?? []).map((source) => relative(repoRoot, source));
  return { bytes: statSync(out).size, sources };
}

/** Compiles a bundle to Hermes bytecode with React Native's own hermesc and flags; throws on any error. */
export function compileHermes(js, hbc) {
  const flags = ["-w", "-emit-binary", "-max-diagnostic-width=80", "-out", hbc, js, "-O", "-output-source-map"];
  execFileSync(HERMESC, flags, { stdio: ["ignore", "pipe", "pipe"] });
  return { bytes: statSync(hbc).size };
}

/**
 * What a bundle took: how many `@solana/*` packages, counted by the build Metro resolved for each
 * (`native.mjs` is the `react-native` export condition; `browser` or `node` would mean it missed),
 * and how many files of the SDK itself.
 */
export function describeSources(sources) {
  const builds = {};
  const packages = new Set();
  let sdkFiles = 0;
  for (const source of sources) {
    const kit = /@solana\/([a-z0-9-]+)\/dist\/([^/]+)$/.exec(source);
    if (kit) {
      const build = kit[2].split(".").slice(-2).join(".");
      packages.add(kit[1]);
      builds[build] = (builds[build] ?? 0) + 1;
    }
    if (source.startsWith("packages/sdk/src/")) sdkFiles += 1;
  }
  return { sdkFiles, solanaPackages: packages.size, builds };
}
