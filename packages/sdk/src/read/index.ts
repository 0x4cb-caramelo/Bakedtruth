/**
 * Purpose: `@brot/sdk/read`, the read half of the SDK: addresses, constants, codecs, the money math,
 *          events and their decoder, public state, the creation checks, the opening quote, recheck
 *          and the error messages. It never builds or signs a transaction: the indexer and the relay
 *          import only this half, and a dependency-cruiser rule keeps it from importing `tx`.
 * Version: 0.1.0
 * Sprint:  05 (SDK)
 *
 * Framework-free: no React, Next.js, Node built-in or DOM API (proposal 3.2), so the same code runs
 * in the site, the services, the scripts, the tests and the Android app.
 */
export * from "./constants";
export * from "./pdas";
export * from "./feeds";
export * from "./bytes";
export * from "./errors";
export * from "./math";
