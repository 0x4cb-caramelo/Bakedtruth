/**
 * Purpose: `@brot/sdk/schemas`, the zod 4 schemas the site, the app and the services share: the opening's
 *          input today, the read API's from Sprint 08. A separate entry point from `read` and `tx`, which
 *          stay free of zod so they bundle with React Native's default Babel preset.
 * Version: 0.1.0
 * Sprint:  05 (SDK)
 */
export * from "./open-campaign";
