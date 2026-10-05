/**
 * Purpose: public entry of the Brot Markets client library, shared by the site, the services,
 *          the scripts and the tests. Must stay free of React and Next imports.
 * Version: 0.0.1
 * Sprint:  00 (setup)
 *
 * Sprint 00 exports the program id and the IDL only. Addresses, math and instruction builders
 * move here from app/lib in Sprint 05.
 */

import idl from "./idl/brot_markets.json";

export type { BrotMarkets } from "./idl/brot_markets";

export const BROT_MARKETS_IDL = idl;

/**
 * The program address. Read from the IDL, which the build writes from `declare_id!` in
 * programs/brot-markets/src/lib.rs, so it cannot drift from the program.
 */
export const BROT_MARKETS_PROGRAM_ID: string = idl.address;
