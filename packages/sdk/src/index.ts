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

/** The program address declared in programs/brot-markets/src/lib.rs. */
export const BROT_MARKETS_PROGRAM_ID = "6G2d7Cv66MR1NayPabh5aL6ZThTx15WPxL3NU4N24uVN";

export const BROT_MARKETS_IDL = idl;
