/**
 * Purpose: the import rules of the SDK and its consumers (proposal 2.3 and 3.2; TP 3.2, 10): the read
 *          half never imports the transaction half; the SDK imports no Node built-in, no React, Next.js
 *          or React Native, nothing from the app, the tests, the scripts or the services, and never the
 *          Codama client's error module (it reads `process.env`); the indexer and the relay import only
 *          the read half. `bun run lint:sdk` runs it, with the SDK's own typecheck for DOM and Node globals.
 * Version: 0.1.0
 * Sprint:  05 (SDK)
 */
module.exports = {
  forbidden: [
    {
      name: "sdk-read-never-imports-tx",
      comment: "The read path (indexer, relay) must not be able to build a transaction (proposal 2.3).",
      severity: "error",
      from: { path: "^packages/sdk/src/read/" },
      to: { path: "^packages/sdk/src/tx/" },
    },
    {
      name: "sdk-no-node-builtins",
      comment: "The SDK runs in browsers and under React Native (proposal 3.2): no Node built-in.",
      severity: "error",
      from: { path: "^packages/sdk/src/" },
      to: { dependencyTypes: ["core"] },
    },
    {
      name: "sdk-no-frameworks",
      comment: "Framework-free (proposal 3.2): no React, React Native, Next.js, web3.js v1 or Anchor in the SDK.",
      severity: "error",
      from: { path: "^packages/sdk/src/" },
      to: { path: "node_modules/(react|react-dom|react-native|next|@solana/web3\\.js|@anchor-lang|@coral-xyz)/" },
    },
    {
      name: "sdk-self-contained",
      comment: "The SDK is the shared library; it imports nothing from the code that uses it.",
      severity: "error",
      from: { path: "^packages/sdk/src/" },
      to: { path: "^(app|tests|scripts|services)/" },
    },
    {
      name: "sdk-not-codama-errors",
      comment: "The generated errors module reads process.env (a Node global); messages come from the IDL.",
      severity: "error",
      from: { path: "^packages/sdk/src/(read|tx)/" },
      to: { path: "^packages/sdk/src/idl/generated/(errors/|index\\.ts$)" },
    },
    {
      name: "read-services-import-read-only",
      comment: "The indexer and the relay import only @brot/sdk/read (TP 3.5): they can never build a transaction.",
      severity: "error",
      from: { path: "^services/(indexer|rpc)/" },
      to: { path: "^packages/sdk/src/tx/" },
    },
    {
      name: "sdk-no-circular",
      severity: "error",
      from: { path: "^packages/sdk/src/(read|tx)/" },
      to: { circular: true },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    exclude: { path: "(^|/)node_modules/" },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: "tsconfig.json" },
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default", "types"],
      extensions: [".ts", ".tsx", ".js", ".mjs", ".cjs", ".json"],
    },
  },
};
