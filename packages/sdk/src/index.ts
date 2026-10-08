/**
 * Purpose: public entry of the Brot Markets client library, shared by the site, the services,
 *          the scripts and the tests. Must stay free of React and Next imports.
 * Version: 0.0.2
 * Sprint:  02 (pot core on Pinocchio): the IDL is Shank's (T9)
 *
 * Exports the program id and the IDL only. Addresses, math and instruction builders move here
 * from app/lib in Sprint 05. `idl/generated/` holds the Codama client of the T9 spike, rendered
 * from the same IDL by `bun run idl`; Sprint 05 decides whether this package exports it.
 */

import idl from "./idl/brot_markets.json";

export const BROT_MARKETS_IDL = idl;

/**
 * The program address. Read from the IDL, which shank-cli writes from `declare_id!` in
 * programs/brot-markets/src/lib.rs, so it cannot drift from the program.
 */
export const BROT_MARKETS_PROGRAM_ID: string = idl.metadata.address;
